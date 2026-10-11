const SHEET_QUERY = '(max-width: 760px)';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

const DURATION = {
  fly: 380,
  endLeaf: 260,
  endFly: 280
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
        <div class="book-leaf__face book-leaf__face--back">
          <div class="book-leaf__colophon">
            <div class="book-leaf__colophon-title" data-slot="coverTitle2"></div>
            <div class="book-leaf__colophon-line" aria-hidden="true"></div>
            <dl class="book-leaf__facts">
              <div class="book-leaf__fact" data-slot="rowAuthor"><dt data-slot="authorLabel"></dt><dd data-slot="authorValue"></dd></div>
              <div class="book-leaf__fact" data-slot="rowWords"><dt data-slot="wordsLabel"></dt><dd data-slot="wordsValue"></dd></div>
              <div class="book-leaf__fact" data-slot="rowPlatform"><dt data-slot="platformLabel"></dt><dd data-slot="platformValue"></dd></div>
            </dl>
            <span class="book-leaf__stamp" data-slot="stamp"></span>
          </div>
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

  _setFact(rowSlot, labelSlot, valueSlot, label, value) {
    const row = this._slot(rowSlot);
    if (!row) return;
    row.hidden = !value;
    this._slot(labelSlot).textContent = value ? label : '';
    this._slot(valueSlot).textContent = value || '';
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

    const cover = this._slot('cover');
    cover.src = novel.cover || '';
    cover.alt = `${title} 封面`;
    cover.style.display = novel.cover ? '' : 'none';
    this._slot('coverTitle2').textContent = title;

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

    this._setFact('rowAuthor', 'authorLabel', 'authorValue', ui.author || '作者', author);
    this._setFact('rowWords', 'wordsLabel', 'wordsValue', ui.words || '字数', novel.wordCount || '');
    this._setFact('rowPlatform', 'platformLabel', 'platformValue', ui.platform || '上架平台', novel.platform || '');
    this._slot('stamp').textContent = ui.studio || '图南工作室';

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
    window.clearTimeout(this._timer);
    window.clearTimeout(this._settleTimer);

    if (!this._fill(index)) return;

    const mode = this._mode();
    const reduced = this._reduced();
    const rect = mode === 'spread' && !reduced ? this._sourceRect(source) : null;

    this._setFrameIdentity();
    this.el.removeAttribute('data-ending');
    this.el.setAttribute('data-mode', mode);
    this.el.setAttribute('data-mounted', 'true');
    this.el.setAttribute('aria-hidden', 'false');

    this.isOpen = true;
    this.openIndex = index;
    this._source = source || null;
    this._blockBackground(true);
    this._lockScroll(true);
    this._markCard(true);

    if (rect) this._flyTo(rect);

    // 后台标签页里 rAF 会被节流，用定时器兜底保证开合状态一定落地
    window.setTimeout(() => {
      if (!this.isOpen) return;
      this.el.setAttribute('data-open', 'true');
      this.closeButton.focus({ preventScroll: true });
    }, 20);

    window.addEventListener('keydown', this._onKeydown, true);
  }

  close() {
    if (!this.isOpen || !this.el) return;

    this.isOpen = false;
    this.el.setAttribute('data-open', 'false');
    this.el.setAttribute('data-ending', 'true');
    window.removeEventListener('keydown', this._onKeydown, true);
    this._markCard(false);

    const mode = this.el.getAttribute('data-mode');
    const useFly = mode === 'spread' && !this._reduced();
    const rect = useFly ? this._sourceRect(this._source) : null;

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

  _settle() {
    if (this.isOpen) return;
    this.el.setAttribute('data-mounted', 'false');
    this.el.setAttribute('aria-hidden', 'true');
    this._setFrameIdentity();
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

  _setFrameIdentity() {
    if (!this.frame) return;
    this.frame.style.transition = 'none';
    this.frame.style.transform = 'none';
    void this.frame.offsetWidth;
    this.frame.style.transition = '';
    this.frame.style.transform = '';
  }

  // FLIP：以「闭合状态 = 右半页」对齐卡面书本的位置与尺寸
  _flyTo(rect, duration) {
    this.frame.style.transition = 'none';
    this.frame.style.transform = 'none';
    const box = this.frame.getBoundingClientRect();
    if (box.height <= 0 || box.width <= 0) {
      this.frame.style.transition = '';
      this.frame.style.transform = '';
      return;
    }

    const scale = rect.height / box.height;
    const dx = rect.left - box.left - scale * (box.width / 2);
    const dy = rect.top - box.top;
    const target = `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`;

    if (duration) {
      this.frame.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      this.frame.style.transform = target;
      return;
    }

    this.frame.style.transform = target;
    void this.frame.offsetWidth;
    this.frame.style.transition = '';
    this.frame.style.transform = '';
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
      const gap = window.innerWidth - document.documentElement.clientWidth;
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
