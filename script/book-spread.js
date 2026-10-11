const SHEET_QUERY = '(max-width: 760px)';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

// 与 css/styles.css 里书本浮层的过渡时长保持一致，避免 JS 与 CSS 各自计时产生错位
const DURATION = {
  settle: 480,  // 书页完全摊开（含 CSS 里的 transition-delay）
  endLeaf: 140, // 合上后停多久开始飞回；与合书动作重叠，避免分段等待的顿挫
  endFly: 300   // 浮层飞回卡面书本
};

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const SPREAD_SKELETON = `
  <button class="book-spread__scrim" type="button" data-book-close></button>
  <div class="book-spread__frame">
    <div class="book-spread__book">
      <div class="book-page book-page--left" aria-hidden="true"></div>
      <div class="book-page book-page--right">
        <div class="book-page__inner">
          <span class="book-page__index" data-slot="index"></span>
          <h3 class="book-page__title" id="bookSpreadTitle" data-slot="title"></h3>
          <p class="book-page__byline" data-slot="byline"></p>
          <div class="book-page__rule" aria-hidden="true"></div>
          <div class="book-page__body">
            <p class="book-page__desc" data-slot="description"></p>
            <ul class="book-page__tags" data-slot="tags"></ul>
          </div>
          <div class="book-page__actions">
            <a class="book-page__cta" data-slot="cta" target="_blank" rel="noopener noreferrer">
              <span data-slot="ctaLabel"></span>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
            <span class="book-page__note" data-slot="note"></span>
          </div>
        </div>
      </div>
      <div class="book-leaf">
        <div class="book-leaf__face book-leaf__face--front">
          <img class="book-leaf__image" data-slot="cover" alt="" loading="lazy">
        </div>
      </div>
      <div class="book-spread__gutter" aria-hidden="true"></div>
      <button class="book-spread__close" type="button" data-book-close>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </div>
  </div>
`;

class BookSpread {
  constructor() {
    this.el = null;
    this.isOpen = false;
    this.openIndex = null;
    this._source = null;
    this._timer = null;
    this._settleTimer = null;
    this._animTimer = null;
    this._releaseTimer = null;
    this._release = null;
    this._openRaf = 0;
    this._shiftX = 0;
    this._hidden = [];
    this._onKeydown = (event) => this._handleKeydown(event);
  }

  _ensure() {
    if (this.el) return this.el;

    const host = document.createElement('div');
    host.className = 'book-spread';
    host.id = 'bookSpread';
    host.setAttribute('role', 'dialog');
    host.setAttribute('aria-modal', 'true');
    host.setAttribute('aria-hidden', 'true');
    host.setAttribute('aria-labelledby', 'bookSpreadTitle');
    host.setAttribute('data-mounted', 'false');
    host.setAttribute('data-open', 'false');
    host.setAttribute('data-mode', this._mode());
    host.innerHTML = SPREAD_SKELETON;
    document.body.appendChild(host);

    this.el = host;
    this.frame = host.querySelector('.book-spread__frame');
    this.closeButton = host.querySelector('.book-spread__close');

    host.addEventListener('click', (event) => {
      if (event.target.closest('[data-book-close]')) this.close();
    });

    return host;
  }

  _mode() {
    return window.matchMedia(SHEET_QUERY).matches ? 'sheet' : 'spread';
  }

  _reduced() {
    return window.matchMedia(REDUCED_QUERY).matches;
  }

  _novels() {
    const data = window.i18n.get('products.novels', {});
    return (data && data.items) || [];
  }

  _ui() {
    const data = window.i18n.get('products.novels', {});
    return (data && data.ui) || {};
  }

  _slot(name) {
    return this.el.querySelector(`[data-slot="${name}"]`);
  }

  _fill(index) {
    const novel = this._novels()[index];
    if (!novel) return false;

    const ui = this._ui();
    const title = novel.title || '';
    const author = novel.author || '';
    const number = String(index + 1).padStart(2, '0');

    this._slot('index').textContent = `${ui.series || '已出版小说'} · NO. ${number}`;
    this._slot('title').textContent = title;
    this._slot('byline').textContent = author;
    this._slot('description').textContent = novel.description || '';

    // 封面只在正面出现一次：书页不再做 180° 翻转，背面无从得见
    const cover = this._slot('cover');
    cover.src = novel.cover || '';
    cover.alt = `${title} 封面`;
    cover.style.display = novel.cover ? '' : 'none';

    const tags = Array.isArray(novel.tags) ? novel.tags.filter(Boolean) : [];
    const tagList = this._slot('tags');
    tagList.innerHTML = tags.map((tag) => `<li class="book-page__tag">${escapeHtml(tag)}</li>`).join('');
    tagList.hidden = tags.length === 0;

    const cta = this._slot('cta');
    const link = novel.link && novel.link !== '#' ? novel.link : '';
    if (link) {
      cta.href = link;
      cta.hidden = false;
    } else {
      cta.removeAttribute('href');
      cta.hidden = true;
    }
    this._slot('ctaLabel').textContent = ui.read || '前往阅读';
    this._slot('note').textContent = novel.status || '';

    this.closeButton.setAttribute('aria-label', ui.close || '合上书本');
    return true;
  }

  toggle(index, source) {
    if (this.isOpen && this.openIndex === index) {
      this.close();
      return;
    }
    this.open(index, source);
  }

  open(index, source) {
    this._ensure();
    window.cancelAnimationFrame(this._openRaf);
    this._openRaf = 0;
    window.clearTimeout(this._timer);
    window.clearTimeout(this._settleTimer);
    window.clearTimeout(this._animTimer);
    window.clearTimeout(this._releaseTimer);
    this._releaseTimer = null;
    this._release = null;

    const mode = this._mode();
    const reduced = this._reduced();
    const animated = mode === 'spread' && !reduced;

    // 锁滚动会给 body 补一段滚动条宽度，居中内容随之左移半个滚动条。
    // 先量出这个偏移，FLIP 起点做补偿，避免开合瞬间出现横向错位。
    this._shiftX = this._scrollbarGap() / 2;

    // 读：把几何测量集中在这里，且全部早于任何写操作。
    // 读写交错会逼浏览器做同步强制回流，那几毫秒正是「点击后卡一下」的来源。
    const rect = animated ? this._sourceRect(source) : null;
    const box = animated ? this._frameBox() : null;

    if (!this._fill(index)) return;

    // 写：状态一次性提交，浏览器只需做一次布局
    this._resetFrame();
    this.el.removeAttribute('data-ending');
    this.el.setAttribute('data-mode', mode);
    this.el.setAttribute('data-mounted', 'true');
    this.el.setAttribute('aria-hidden', 'false');
    // 先提层再启动过渡，避开首帧「先绘制、再提层」造成的一掉两帧
    this.el.setAttribute('data-animating', 'true');

    this.isOpen = true;
    this.openIndex = index;
    this._source = source || null;
    this._blockBackground(true);
    this._lockScroll(true);
    this._markCard(true);

    // FLIP 起点：先无过渡地落到卡面书本的位置与尺寸
    if (box) {
      this.frame.style.transition = 'none';
      this.frame.style.transform = this._flipTransform(rect, box);
    }

    // 起点已被浏览器提交，下一帧再释放到终态即可，
    // 不需要再手动 void offsetWidth 强制回流一次
    this._release = () => {
      this._release = null;
      window.clearTimeout(this._releaseTimer);
      this._releaseTimer = null;
      if (!this.isOpen) return;
      this.frame.style.transition = '';
      this.frame.style.transform = '';
      this.el.setAttribute('data-open', 'true');
      this.closeButton.focus({ preventScroll: true });
      this._armAnimating();
    };

    this._openRaf = window.requestAnimationFrame(this._release);
    // 后台标签页里 rAF 会被节流，用定时器兜底保证开合状态一定落地
    this._releaseTimer = window.setTimeout(() => {
      if (this._release) this._release();
    }, 120);

    window.addEventListener('keydown', this._onKeydown, true);
  }

  close() {
    if (!this.isOpen || !this.el) return;

    // 动画还没开始就被打断：直接落终态，避免在半路留下一帧残影
    if (this._release) {
      window.clearTimeout(this._releaseTimer);
      this._releaseTimer = null;
      window.cancelAnimationFrame(this._openRaf);
      this._openRaf = 0;
      this._release = null;
      this.isOpen = false;
      this._settle();
      return;
    }

    // 读：几何测量早于所有状态写入，避免合上动画第一帧被同步回流打断
    const mode = this.el.getAttribute('data-mode');
    const useFly = mode === 'spread' && !this._reduced();
    const rect = useFly ? this._sourceRect(this._source) : null;

    // 写：状态一次性提交
    this.isOpen = false;
    this.el.setAttribute('data-open', 'false');
    this.el.setAttribute('data-ending', 'true');
    this.el.setAttribute('data-animating', 'true');
    window.removeEventListener('keydown', this._onKeydown, true);
    this._markCard(false);

    window.clearTimeout(this._timer);
    this._timer = window.setTimeout(() => {
      if (rect) {
        this._flyTo(rect, DURATION.endFly);
        window.clearTimeout(this._settleTimer);
        this._settleTimer = window.setTimeout(() => this._settle(), DURATION.endFly);
      } else {
        this._settle();
      }
    }, this._reduced() ? 0 : DURATION.endLeaf);
  }

  _armAnimating() {
    window.clearTimeout(this._animTimer);
    this._animTimer = window.setTimeout(() => {
      if (!this.isOpen) return;
      this.el.removeAttribute('data-animating');
    }, DURATION.settle);
  }

  _settle() {
    if (this.isOpen) return;
    window.clearTimeout(this._animTimer);
    this.el.removeAttribute('data-animating');
    this.el.setAttribute('data-mounted', 'false');
    this.el.setAttribute('aria-hidden', 'true');
    this._resetFrame();
    this.openIndex = null;
    this._lockScroll(false);
    this._blockBackground(false);

    const target = this._source && this._source.isConnected ? this._source : null;
    if (target) target.focus({ preventScroll: true });
    this._source = null;
  }

  refresh() {
    if (this.isOpen && this.openIndex !== null) this._fill(this.openIndex);
  }

  _sourceRect(source) {
    const trigger = source && source.closest ? source.closest('.book-card') : null;
    const book = trigger ? trigger.querySelector('.book') : null;
    if (!book) return null;
    const rect = book.getBoundingClientRect();
    return rect.height > 0 && rect.width > 0 ? rect : null;
  }

  // 清掉内联样式，回到 CSS 描述的终态。
  // 这里刻意不做强制回流：起点由「hidden -> mounted」的那一次布局自然提交。
  _resetFrame() {
    if (!this.frame) return;
    this.frame.style.transition = '';
    this.frame.style.transform = '';
  }

  _frameBox() {
    if (!this.frame) return null;
    const box = this.frame.getBoundingClientRect();
    return box.height > 0 && box.width > 0 ? box : null;
  }

  _scrollbarGap() {
    return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
  }

  // FLIP：以「闭合状态 = 右半页」对齐卡面书本的位置与尺寸
  _flipTransform(rect, box) {
    const scale = rect.height / box.height;
    const dx = (rect.left - this._shiftX) - box.left - scale * (box.width / 2);
    const dy = rect.top - box.top;
    return `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`;
  }

  // 合上时直接写终态：起点已是当前已提交的值，浏览器会自己补一段过渡
  _flyTo(rect, duration) {
    if (!this.frame) return;
    const box = this._frameBox();
    if (!box) {
      this._resetFrame();
      return;
    }
    this.frame.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    this.frame.style.transform = this._flipTransform(rect, box);
  }

  _markCard(open) {
    const card = this._source && this._source.closest ? this._source.closest('.book-card') : null;
    if (!card) return;
    if (open) {
      card.setAttribute('data-book-open', 'true');
    } else {
      card.removeAttribute('data-book-open');
    }
    card.querySelectorAll('[data-book-open]').forEach((node) => {
      node.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  _lockScroll(locked) {
    if (locked) {
      const gap = this._scrollbarGap();
      if (gap > 0) document.body.style.paddingRight = `${gap}px`;
      document.body.classList.add('has-book-spread');
      return;
    }
    document.body.classList.remove('has-book-spread');
    document.body.style.paddingRight = '';
  }

  _blockBackground(hidden) {
    if (hidden) {
      this._hidden = [];
      Array.from(document.body.children).forEach((node) => {
        if (node === this.el || node.tagName === 'SCRIPT') return;
        if (node.hasAttribute('aria-hidden')) return;
        node.setAttribute('aria-hidden', 'true');
        this._hidden.push(node);
      });
      return;
    }
    this._hidden.forEach((node) => node.removeAttribute('aria-hidden'));
    this._hidden = [];
  }

  _handleKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key !== 'Tab' || !this.el) return;

    const focusable = Array.from(
      this.el.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
    ).filter((node) => !node.disabled && node.getClientRects().length > 0);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === this.el)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

window.BookSpread = BookSpread;
window.bookSpread = new BookSpread();
