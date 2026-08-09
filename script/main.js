import './i18n.js';
import './router.js';
import './animation.js';
import './floating-images.js';
import './hero-video.js';

class App {
  constructor() {
    this.initialized = false;
    this._navBound = false;
    this._menuController = null;
    this._routeHookAdded = false;
  }

  async init() {
    if (this.initialized) return;
    
    await window.i18n.init();
    this.initRouter();
    this.initLanguageSwitcher();
    this.initFloatingImages();
    this.initHeroVideo();
    window.heroAnimations.init();
    window.lazyImageLoader.init();
    window.dissolveAnimationManager.init();
    
    this.initialized = true;
  }

  initRouter() {
    window.router
      .addRoute('/', () => this.renderHome())
      .addRoute('/products', () => this.renderProducts())
      .addRoute('/product', () => this.renderProducts())
      .addRoute('/tools', () => this.renderTools())
      .addRoute('/tool', () => this.renderTools())
      .addRoute('/team', () => this.renderTeam())
      .addRoute('/team/intro', () => this.renderTeam())
      .addRoute('/team/social', () => this.renderTeamSocial())
      .addRoute('/social', () => this.renderTeamSocial())
      .beforeEach((path) => this.beforeRouteChange(path))
      .afterEach((path) => this.afterRouteChange(path))
      .init();
  }

  initNavigation() {
    if (this._navBound) return;

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-nav]');
      if (!btn) return;

      const target = btn.dataset.nav;

      if (target === 'team' && btn.classList.contains('nav-dropdown-toggle')) {
        e.preventDefault();
        e.stopPropagation();
        this.toggleDropdown(btn);
        return;
      }

      if (target === 'team' && btn.classList.contains('mobile-nav-dropdown-toggle')) {
        e.preventDefault();
        e.stopPropagation();
        const dropdown = btn.closest('.mobile-nav-dropdown');
        if (dropdown) {
          this.toggleMobileDropdown(dropdown);
        }
        return;
      }

      if (target === 'team-intro') {
        e.preventDefault();
        this.navigateTo('team');
        this.closeMobileMenu();
        this.closeAllDropdowns();
        return;
      }

      if (target === 'team-social') {
        e.preventDefault();
        this.navigateTo('team-social');
        this.closeMobileMenu();
        this.closeAllDropdowns();
        return;
      }

      if (target === 'social') {
        e.preventDefault();
        this.navigateTo('social');
        this.closeMobileMenu();
        this.closeAllDropdowns();
        return;
      }

      e.preventDefault();
      this.navigateTo(target);
      this.closeMobileMenu();
      this.closeAllDropdowns();
    });

    document.addEventListener('click', (e) => {
      const dropdown = document.querySelector('.nav-dropdown');
      if (!dropdown) return;
      const toggle = dropdown.querySelector('.nav-dropdown-toggle');
      if (!toggle) return;
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (isOpen && !dropdown.contains(e.target)) {
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      document.querySelectorAll('.nav-dropdown-toggle[aria-expanded="true"]').forEach(t => {
        t.setAttribute('aria-expanded', 'false');
      });
    });

    this.initMobileMenu();
    this.initDesktopDropdown();
    this._navBound = true;
  }

  closeAllDropdowns() {
    document.querySelectorAll('.nav-dropdown-toggle[aria-expanded="true"]').forEach(t => {
      t.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.mobile-nav-dropdown.open').forEach(d => {
      d.classList.remove('open');
      const t = d.querySelector('.mobile-nav-dropdown-toggle');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }

  toggleDropdown(btn) {
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', !isExpanded);
  }

  initDesktopDropdown() {
    const wrappers = document.querySelectorAll('.nav-dropdown');
    if (!wrappers.length) return;

    wrappers.forEach((wrapper) => {
      const dropdownToggle = wrapper.querySelector('.nav-dropdown-toggle');
      const dropdownMenu = wrapper.querySelector('.nav-dropdown-menu');
      if (!dropdownToggle || !dropdownMenu) return;

      let closeTimer = null;
      const cancelClose = () => {
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
      };
      const scheduleClose = () => {
        cancelClose();
        closeTimer = setTimeout(() => {
          dropdownToggle.setAttribute('aria-expanded', 'false');
        }, 150);
      };

      dropdownToggle.addEventListener('mouseenter', () => {
        cancelClose();
        dropdownToggle.setAttribute('aria-expanded', 'true');
      });

      dropdownToggle.addEventListener('mouseleave', () => {
        scheduleClose();
      });

      dropdownMenu.addEventListener('mouseenter', () => {
        cancelClose();
        dropdownToggle.setAttribute('aria-expanded', 'true');
      });

      dropdownMenu.addEventListener('mouseleave', () => {
        scheduleClose();
      });
    });
  }

  switchToSocialTab() {
    const mobileDropdown = document.querySelector('.mobile-nav-dropdown');
    if (mobileDropdown) {
      mobileDropdown.classList.add('open');
    }
  }

  initMobileMenu() {
    const menuToggles = document.querySelectorAll('.mobile-menu-toggle');
    const closeButtons = document.querySelectorAll('.mobile-menu-close');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!mobileMenu) return;

    if (this._menuController) {
      this._menuController.abort();
    }
    this._menuController = new AbortController();
    const { signal } = this._menuController;

    menuToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMobileMenuState();
      }, { signal });
    });

    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeMobileMenu();
      }, { signal });
    });

    const closeMenuOnOutsideClick = (e) => {
      if (mobileMenu.classList.contains('active') &&
          !mobileMenu.contains(e.target) && 
          !e.target.closest('.mobile-menu-toggle')) {
        this.closeMobileMenu();
      }
    };

    document.addEventListener('click', closeMenuOnOutsideClick, { signal });
    document.addEventListener('touchstart', closeMenuOnOutsideClick, { signal, passive: true });

    if (!this._routeHookAdded) {
      window.router.beforeEach(() => {
        const menu = document.getElementById('mobile-menu');
        if (menu && menu.classList.contains('active')) {
          this.closeMobileMenu();
        }
      });
      this._routeHookAdded = true;
    }
  }

  toggleMobileMenuState() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenu) return;
    if (mobileMenu.classList.contains('active')) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!menuToggle || !mobileMenu) return;

    mobileMenu.classList.add('active');
    mobileMenu.setAttribute('aria-hidden', 'false');
    menuToggle.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('mobile-menu-open');
  }

  closeMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (!menuToggle || !mobileMenu) return;

    mobileMenu.classList.remove('active');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.body.classList.remove('mobile-menu-open');

    const mobileDropdowns = mobileMenu.querySelectorAll('.mobile-nav-dropdown');
    mobileDropdowns.forEach(dropdown => {
      dropdown.classList.remove('open');
      const toggle = dropdown.querySelector('.mobile-nav-dropdown-toggle');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  toggleMobileDropdown(dropdown) {
    dropdown.classList.toggle('open');
    const toggle = dropdown.querySelector('.mobile-nav-dropdown-toggle');
    if (toggle) {
      const isExpanded = dropdown.classList.contains('open');
      toggle.setAttribute('aria-expanded', isExpanded);
    }
  }

  updateActiveNav(path) {
    const navMap = {
      '/': 'home',
      '/products': 'products',
      '/product': 'products',
      '/tools': 'tools',
      '/tool': 'tools',
      '/team': 'team',
      '/team/intro': 'team',
      '/social': 'team',
      '/team/social': 'team'
    };
    const activeNav = navMap[path] || '';

    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
      const navData = link.dataset.nav;
      if (activeNav && navData === activeNav) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  initLanguageSwitcher() {
    const handleLanguageClick = async (e) => {
      const btn = e.target.closest('[data-lang]');
      if (!btn) return;
      
      if (window.i18n.isLoading) {
        return;
      }
      
      const lang = btn.dataset.lang;
      if (!lang) return;
      
      if (lang === window.i18n.getCurrentLang()) {
        return;
      }
      
      this.setLanguageButtonsLoading(true);
      
      try {
        await window.i18n.switchLanguage(lang);
        this.updateLanguageButtons();
      } catch (error) {
        this.showToast('语言切换失败，请重试', 'error');
      } finally {
        this.setLanguageButtonsLoading(false);
      }
    };
    
    document.addEventListener('click', handleLanguageClick, true);
    
    window.i18n.on(window.I18nEventType.LANGUAGE_SWITCHED, () => {
      this.updateLanguageButtons();
      this.refreshCurrentPageContent();
      setTimeout(() => {
        window.dissolveAnimationManager.reinitialize();
      }, 100);
    });
    
    window.i18n.on(window.I18nEventType.INITIALIZED, () => {
      this.updateLanguageButtons();
    });

    this.updateLanguageButtons();
  }

  setLanguageButtonsLoading(loading) {
    const langButtons = document.querySelectorAll('[data-lang]');
    langButtons.forEach(btn => {
      btn.disabled = loading;
      btn.style.pointerEvents = loading ? 'none' : 'auto';
      if (loading) {
        btn.classList.add('loading');
      } else {
        btn.classList.remove('loading');
      }
    });
  }

  showToast(message, type = 'success') {
    const existing = document.querySelector('.language-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `language-toast toast-${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    
    Object.assign(toast.style, {
      position: 'fixed',
      top: '80px',
      right: '20px',
      padding: '12px 24px',
      borderRadius: '8px',
      background: type === 'success' ? '#10b981' : '#ef4444',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: '9999',
      opacity: '0',
      transform: 'translateY(-10px)',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    });
    
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  updateLanguageButtons() {
    const langButtons = document.querySelectorAll('[data-lang]');
    const currentLang = window.i18n.getCurrentLang();
    
    langButtons.forEach(btn => {
      const isActive = btn.dataset.lang === currentLang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  refreshCurrentPageContent() {
    const currentPath = window.router.getCurrentPath();
    
    if (currentPath === '/products' || currentPath === '/product') {
      const productsGrid = document.querySelector('.products-grid');
      if (productsGrid) {
        const container = productsGrid.parentElement;
        const pageHeader = container.querySelector('.page-header');
        if (pageHeader) {
          pageHeader.querySelector('.page-title').textContent = window.i18n.get('products.title');
          pageHeader.querySelector('.page-subtitle').textContent = window.i18n.get('products.subtitle');
        }
        productsGrid.innerHTML = this.generateProductCards();
        window.heroAnimations.init();
        window.lazyImageLoader.init();
      }
    } else if (currentPath === '/team') {
      const teamGrid = document.querySelector('.team-grid');
      if (teamGrid) {
        const container = teamGrid.parentElement;
        const sectionHeader = container.querySelector('.team-section-header');
        if (sectionHeader) {
          const sectionTitle = sectionHeader.querySelector('.team-section-title');
          if (sectionTitle) {
            sectionTitle.textContent = window.i18n.get('team.sectionTitle');
          }
        }
        const teamIntroSection = container.querySelector('.team-intro-section');
        if (teamIntroSection) {
          const teamIntro = teamIntroSection.querySelector('.team-intro');
          const teamVision = teamIntroSection.querySelector('.team-vision');
          if (teamIntro) {
            teamIntro.textContent = window.i18n.get('team.intro');
          }
          if (teamVision) {
            teamVision.textContent = window.i18n.get('team.vision');
          }
        }
        const membersTitle = container.querySelector('.team-members-title');
        if (membersTitle) {
          membersTitle.textContent = window.i18n.get('team.membersTitle');
        }
        teamGrid.innerHTML = this.generateTeamCards();
        window.heroAnimations.init();
        window.lazyImageLoader.init();
      }
    } else if (currentPath === '/social') {
      const socialGrid = document.querySelector('.social-grid');
      if (socialGrid) {
        const container = socialGrid.parentElement;
        const pageHeader = container.querySelector('.page-header');
        if (pageHeader) {
          const socialData = window.i18n.get('social');
          pageHeader.querySelector('.page-title').textContent = socialData.title;
          pageHeader.querySelector('.page-subtitle').textContent = socialData.subtitle;
        }
        socialGrid.innerHTML = this.generateSocialCards();
        window.heroAnimations.init();
        window.lazyImageLoader.init();
      }
    } else if (currentPath === '/') {
      const brandCn = document.querySelector('.brand-cn');
      const brandEn = document.querySelector('.brand-en');
      const brandTagline = document.querySelector('.brand-tagline');
      if (brandCn) brandCn.textContent = window.i18n.get('brand.cn');
      if (brandEn) brandEn.textContent = window.i18n.get('brand.en');
      if (brandTagline) brandTagline.textContent = window.i18n.get('brand.tagline');
    }
  }

  generateProductCards() {
    const products = window.i18n.get('products.games');
    const sortedProducts = [...products].sort((a, b) => parseInt(b.id) - parseInt(a.id));
    return sortedProducts.map(product => {
      const hasHoverImage = product.hasHoverImage !== false;
      const imageContent = hasHoverImage ? `
        <picture>
          <source srcset="img/hero/product-${product.id}@3x.webp 3x, img/hero/product-${product.id}@2x.webp 2x, img/hero/product-${product.id}.webp" type="image/webp">
          <source srcset="img/hero/product-${product.id}@3x.jpg 3x, img/hero/product-${product.id}@2x.jpg 2x, img/hero/product-${product.id}.jpg" type="image/jpeg">
          <img class="product-img-default" src="img/hero/product-${product.id}.jpg" alt="${product.title}" loading="lazy">
          <img class="product-img-hover" src="img/hero/product-${product.id}-hover.webp" alt="${product.title}" loading="lazy" onerror="this.style.display='none'">
        </picture>
      ` : `
        <picture>
          <source srcset="img/hero/product-${product.id}@3x.webp 3x, img/hero/product-${product.id}@2x.webp 2x, img/hero/product-${product.id}.webp" type="image/webp">
          <img src="img/hero/product-${product.id}.jpg" alt="${product.title}" loading="lazy">
        </picture>
      `;
      const imageLink = product.link ? `
        <a href="${product.link}" data-image-link="${product.link}" target="_blank" rel="noopener noreferrer" aria-label="查看${product.title}详情">
          ${imageContent}
        </a>
      ` : imageContent;
      return `
        <article class="product-card" data-animate>
          <div class="product-image" data-product-id="${product.id}" data-has-hover="${hasHoverImage}">
            ${imageLink}
          </div>
          <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-tags">
              ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  generateTeamCards() {
    const team = window.i18n.get('team.members');
    return team.map(member => `
      <article class="team-card" data-animate>
        <div class="member-avatar">
          <picture>
            <source srcset="img/team/member-${member.id}@3x.webp 3x, img/team/member-${member.id}@2x.webp 2x, img/team/member-${member.id}.webp" type="image/webp">
            <img src="img/team/member-${member.id}.jpg" alt="${member.name}" loading="lazy">
          </picture>
        </div>
        <div class="member-info">
          <h3 class="member-name">${member.name}</h3>
          <p class="member-role">${member.role}</p>
          <p class="member-description">${member.description}</p>
        </div>
      </article>
    `).join('');
  }

  generateSocialCards() {
    const socialData = window.i18n.get('social');
    const platforms = this.getSocialPlatforms(socialData);
    
    return platforms.map(platform => {
      const platformData = socialData[platform];
      const placeholder = this.getPlatformPlaceholder(platform);
      return `
        <article class="social-card" data-animate data-platform="${platform}">
          <a href="${platformData.link}" class="social-card-link" target="_blank" rel="noopener noreferrer" aria-label="${platformData.ariaLabel}">
            <div class="social-card-icon">
              <img src="/img/social/${platform}.svg" alt="${platformData.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
              <span class="social-icon-placeholder" style="display: none;">${placeholder}</span>
            </div>
            <div class="social-card-content">
              <h2 class="social-platform-name">${platformData.name}</h2>
              <p class="social-platform-id">${platformData.id}</p>
              <p class="social-platform-desc">${platformData.desc}</p>
            </div>
            <div class="social-card-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </a>
        </article>
      `;
    }).join('');
  }

  getSocialPlatforms(socialData) {
    const excludeKeys = ['title', 'subtitle'];
    return Object.keys(socialData).filter(key => !excludeKeys.includes(key));
  }

  getPlatformPlaceholder(platform) {
    const placeholders = {
      'bilibili': 'B',
      'xiaohongshu': '红',
      'weibo': '微',
      'douyin': '抖',
      'aifadian': '爱',
      'steam': 'S'
    };
    return placeholders[platform] || platform.charAt(0).toUpperCase();
  }

  initFloatingImages() {
    const container = document.getElementById('floating-images-container');
    if (!container) return;

    const enableRotation = this.getFloatingImageRotationConfig();
    
    if (!enableRotation) {
      if (window.floatingImagesInstance) {
        window.floatingImagesInstance.destroy();
        window.floatingImagesInstance = null;
      }
      container.innerHTML = '';
      return;
    }

    if (window.floatingImagesInstance) {
      window.floatingImagesInstance.destroy();
      window.floatingImagesInstance = null;
    }

    const defaultImages = [
      '/img/floating/image1.png',
      '/img/floating/image2.png',
      '/img/floating/image3.png',
      '/img/floating/image4.png',
      '/img/floating/image5.png',
      '/img/floating/image6.png',
      '/img/floating/image7.png',
      '/img/floating/image8.png',
      '/img/floating/image9.png',
    ];

    const config = {
      images: defaultImages,
      containerSelector: '#floating-images-container',
      rotationSpeed: 45,
      minSpeed: 30,
      maxSpeed: 60,
      safeMargin: 10,
      imageSize: 100,
      textSafeMargin: 30,
      maxOverlapRatio: 0.15,
      debugMode: false,
      storageKey: 'tunan-floating-images',
      enableRotation: enableRotation
    };

    window.floatingImagesInstance = new window.FloatingImages(config);
  }

  initHeroVideo() {
    if (window.heroVideoBackground) {
      window.heroVideoBackground.init();
    }
  }

  getFloatingImageRotationConfig() {
    try {
      const stored = localStorage.getItem('floatingImageRotationEnabled');
      if (stored !== null) {
        return stored === 'true';
      }
    } catch (e) {
    }
    return false;
  }

  setFloatingImageRotationConfig(enabled) {
    try {
      localStorage.setItem('floatingImageRotationEnabled', enabled ? 'true' : 'false');
    } catch (e) {
    }
  }

  toggleFloatingImageRotation() {
    const current = this.getFloatingImageRotationConfig();
    this.setFloatingImageRotationConfig(!current);
    this.initFloatingImages();
    return !current;
  }

  navigateTo(target) {
    const routes = {
      'home': '/',
      'products': '/products',
      'product': '/products',
      'tools': '/tools',
      'tool': '/tools',
      'team': '/team',
      'team-intro': '/team',
      'team-social': '/team/social',
      'social': '/social'
    };

    const path = routes[target] || '/';
    window.router.navigate(path);
  }

  beforeRouteChange(path) {
    const content = document.getElementById('main-content');
    if (content) {
      content.classList.add('page-transition-out');
    }
  }

  afterRouteChange(path) {
    const content = document.getElementById('main-content');
    if (content) {
      setTimeout(() => {
        content.classList.remove('page-transition-out');
        content.classList.add('page-transition-in');
        
        setTimeout(() => {
          content.classList.remove('page-transition-in');
        }, 300);
      }, 50);
    }

    this.initNavigation();
    this.updateActiveNav(path);
    this.initFloatingImages();
    this.initHeroVideo();
    window.heroAnimations.init();
    window.lazyImageLoader.init();
    window.dissolveAnimationManager.init();
    this.updateLanguageButtons();
    
    setTimeout(() => {
      this.initScrollIndicator();
    }, 100);
  }

  renderHome() {
    const content = document.getElementById('main-content');
    if (content) {
      content.innerHTML = this.getHomeTemplate();
      this.attachHomeEvents();
    }
    if (window.heroVideoBackground) {
      window.heroVideoBackground.destroy();
      window.heroVideoBackground = new HeroVideoBackground();
      window.heroVideoBackground.init();
    }
  }

  renderProducts() {
    const content = document.getElementById('main-content');
    if (content) {
      content.innerHTML = this.getProductsTemplate();
      this.attachProductsEvents();
    }
  }

  renderTeam() {
    const content = document.getElementById('main-content');
    if (content) {
      content.innerHTML = this.getTeamTemplate();
      this.attachTeamEvents();
    }
  }

  renderSocial() {
    const content = document.getElementById('main-content');
    if (content) {
      content.innerHTML = this.getSocialTemplate();
      this.attachSocialEvents();
    }
  }

  renderTeamSocial() {
    const content = document.getElementById('main-content');
    if (content) {
      content.innerHTML = this.getTeamSocialTemplate();
      this.attachTeamSocialEvents();
    }
  }

  attachSocialEvents() {
  }

  attachTeamSocialEvents() {
  }

  getHomeTemplate() {
    return `
      <section class="hero" id="hero">
        <div class="hero-bg" id="hero-bg">
          <div class="hero-video-container" id="hero-video-container">
            <video 
              id="hero-video"
              class="hero-video"
              autoplay
              muted
              loop
              playsinline
              preload="auto"
              poster="img/hero/hero-bg.jpg"
              data-video-config='{
                "src": "video/hero.mp4",
                "webmSrc": "video/hero.webm",
                "poster": "img/hero/hero-bg.jpg",
                "muted": true,
                "loop": true,
                "preload": "auto",
                "objectFit": "cover",
                "zIndex": 0,
                "overlayOpacity": 0.5
              }'
            >
              <source src="video/hero.webm" type="video/webm">
              <source src="video/hero.mp4" type="video/mp4">
            </video>
            <div class="hero-video-fallback" id="hero-video-fallback"></div>
          </div>
          <div class="hero-overlay"></div>
          <div class="floating-images-container" id="floating-images-container"></div>
        </div>
        <div class="hero-content">
          <h1 class="brand-title">
            <span class="brand-cn" data-i18n="brand.cn">${window.i18n.get('brand.cn')}</span>
            <span class="brand-divider">|</span>
            <span class="brand-en" data-i18n="brand.en">${window.i18n.get('brand.en')}</span>
          </h1>
          <p class="brand-tagline" data-i18n="brand.tagline">${window.i18n.get('brand.tagline')}</p>
          <div class="hero-actions">
          </div>
        </div>
      </section>
    `;
  }

  /**
   * 产品卡片模板生成器
   * 
   * Hover 图片命名约定：
   * - 基础版本: photo.jpg
   * - 2x 版本: photo@2x.jpg
   * - 3x 版本: photo@3x.jpg
   * - Hover 版本: photo-hover.jpg (基础), photo@2x-hover.jpg (@2x后), photo@3x-hover.jpg (@3x后)
   * 
   * @2x hover 命名规则: 原文件名 + @2x + -hover + 扩展名
   * 例如: product-2.jpg -> product-2@2x-hover.jpg
   */
  getProductsTemplate() {
    const products = window.i18n.get('products.games');
    const novels = window.i18n.get('products.novels');
    const sortedProducts = [...products].sort((a, b) => parseInt(b.id) - parseInt(a.id));
    const productCards = sortedProducts.map((product, index) => {
      const hasHoverImage = product.hasHoverImage !== false;
      const productIndex = `NO. 0${index + 1} · ${new Date().getFullYear() - (sortedProducts.length - 1 - index)}`;
      const imageContent = hasHoverImage ? `
        <picture>
          <source srcset="img/hero/product-${product.id}@3x.webp 3x, img/hero/product-${product.id}@2x.webp 2x, img/hero/product-${product.id}.webp" type="image/webp">
          <source srcset="img/hero/product-${product.id}@3x.jpg 3x, img/hero/product-${product.id}@2x.jpg 2x, img/hero/product-${product.id}.jpg" type="image/jpeg">
          <img class="product-img-default" src="img/hero/product-${product.id}.jpg" alt="${product.title}" loading="lazy">
          <img class="product-img-hover" src="img/hero/product-${product.id}-hover.webp" alt="${product.title}" loading="lazy" onerror="this.style.display='none'">
        </picture>
      ` : `
        <picture>
          <source srcset="img/hero/product-${product.id}@3x.webp 3x, img/hero/product-${product.id}@2x.webp 2x, img/hero/product-${product.id}.webp" type="image/webp">
          <img src="img/hero/product-${product.id}.jpg" alt="${product.title}" loading="lazy">
        </picture>
      `;
      const imageLink = product.link ? `
        <a href="${product.link}" data-image-link="${product.link}" target="_blank" rel="noopener noreferrer" aria-label="查看${product.title}详情">
          ${imageContent}
        </a>
      ` : imageContent;
      return `
        <article class="product-card" data-animate data-has-hover="${hasHoverImage}">
          <div class="product-image">
            <span class="product-image-overlay">已上线</span>
            ${imageLink}
          </div>
          <div class="product-info">
            <span class="product-index">${productIndex}</span>
            <h3 class="product-title">${product.title}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-tags">
              ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          </div>
        </article>
      `;
    }).join('');

    const novelCards = novels.items.map((novel, index) => {
      const descriptionLines = (novel.description || '').split('\n');
      const descriptionHtml = descriptionLines.map(line => `<p class="book-card-desc-line">${line}</p>`).join('');
      const coverImage = novel.cover || `img/novels/novel-${novel.id}.jpg`;
      const coverVariant = index % 2 === 1 ? ' book-cover-2' : '';
      const bookTitleClass = 'book-title';
      const bookAuthorClass = 'book-author';
      const mobileDescription = (novel.description || '').replace(/\n/g, ' ');
      const link = novel.link || '#';
      return `
        <article class="book-card" data-animate>
          <div class="book-wrapper">
            <div class="book-spine"></div>
            <div class="book-front">
              <div class="book-cover${coverVariant}">
                <img class="book-cover-image" src="${coverImage}" alt="${novel.title} 封面" loading="lazy" onerror="this.style.display='none'">
                <div class="book-cover-content">
                  <div class="book-genre" data-i18n="products.novels.items.${index}.genre">${novel.genre || ''}</div>
                  <h3 class="${bookTitleClass}" data-i18n="products.novels.items.${index}.title">${novel.title}</h3>
                  <div class="${bookAuthorClass}" data-i18n="products.novels.items.${index}.author">${novel.author || '图南工作室'}</div>
                </div>
                <div class="book-decoration">
                  <div class="book-decoration-line"></div>
                  <div class="book-decoration-circle"></div>
                </div>
              </div>
              <div class="book-pages">
                <div class="book-page book-page-1"></div>
                <div class="book-page book-page-2"></div>
                <div class="book-page book-page-3"></div>
              </div>
            </div>
            <div class="book-back">
              <div class="book-back-content">
                <div class="book-back-title" data-i18n="products.novels.items.${index}.title">${novel.title}</div>
                <p class="book-back-description" data-i18n="products.novels.items.${index}.description">${mobileDescription}</p>
                <div class="book-back-meta">
                  <span class="book-word-count" data-i18n="products.novels.items.${index}.wordCount">${novel.wordCount || ''}</span>
                  <span class="book-status" data-i18n="products.novels.items.${index}.status">${novel.status || ''}</span>
                </div>
                <a href="${link}" target="_blank" rel="noopener noreferrer" class="book-back-link" aria-label="阅读${novel.title}">
                  <span>前往阅读</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </a>
              </div>
            </div>
          </div>
          <div class="book-info-mobile">
            <h3 class="book-title-mobile" data-i18n="products.novels.items.${index}.title">${novel.title}</h3>
            <div class="book-author-mobile" data-i18n="products.novels.items.${index}.author">${novel.author || '图南工作室'}</div>
            <p class="book-description-mobile" data-i18n="products.novels.items.${index}.description">${mobileDescription}</p>
            <div class="book-tags-mobile">
              ${novel.genre ? `<span class="book-tag" data-i18n="products.novels.items.${index}.genre">${novel.genre}</span>` : ''}
              ${novel.wordCount ? `<span class="book-tag" data-i18n="products.novels.items.${index}.wordCount">${novel.wordCount}</span>` : ''}
              ${novel.status ? `<span class="book-tag" data-i18n="products.novels.items.${index}.status">${novel.status}</span>` : ''}
            </div>
            ${novel.link ? `<a href="${novel.link}" target="_blank" rel="noopener noreferrer" class="book-link-mobile">前往阅读 →</a>` : ''}
          </div>
        </article>
      `;
    }).join('');

    return `
      <section class="page products-page">
        <div class="container">
          <header class="page-header" data-animate>
            <h1 class="page-title" data-i18n="products.title">${window.i18n.get('products.title')}</h1>
            <p class="page-subtitle" data-i18n="products.subtitle">${window.i18n.get('products.subtitle')}</p>
          </header>
          <p class="products-intro" data-i18n="products.intro">${window.i18n.get('products.intro') || ''}</p>
          <div class="products-grid">
            ${productCards}
          </div>
        </div>
      </section>

      <div class="scroll-indicator" onclick="document.querySelector('.novels-page').scrollIntoView({behavior: 'smooth'})">
        <div class="scroll-indicator-circle">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
        <span class="scroll-indicator-text" data-i18n="common.scrollDown">向下滚动</span>
      </div>

      <section class="page novels-page">
        <div class="container">
          <header class="page-header" data-animate>
            <h2 class="page-title" data-i18n="products.novels.title">${novels.title}</h2>
            <p class="page-subtitle" data-i18n="products.novels.subtitle">${novels.subtitle}</p>
          </header>

          <div class="novels-grid">
            ${novelCards}
          </div>
        </div>
      </section>
    `;
  }

  getTeamTemplate() {
    const team = window.i18n.get('team.members');
    const memberCards = team.map(member => `
      <article class="team-card" data-animate>
        <div class="member-avatar">
          <picture>
            <source srcset="img/team/member-${member.id}@3x.webp 3x, img/team/member-${member.id}@2x.webp 2x, img/team/member-${member.id}.webp" type="image/webp">
            <img src="img/team/member-${member.id}.jpg" alt="${member.name}" loading="lazy">
          </picture>
        </div>
        <div class="member-info">
          <h3 class="member-name">${member.name}</h3>
          <p class="member-role">${member.role}</p>
          <p class="member-description">${member.description}</p>
        </div>
      </article>
    `).join('');

    const teamSectionTitle = window.i18n.get('team.sectionTitle');
    const teamIntro = window.i18n.get('team.intro');
    const teamVision = window.i18n.get('team.vision');
    const membersTitle = window.i18n.get('team.membersTitle');

    return `
      <section class="page team-page">
        <div class="container">
          <div class="team-section-header" data-animate>
            <h1 class="team-section-title" data-i18n="team.sectionTitle">${teamSectionTitle}</h1>
          </div>
          
          <section class="team-intro-section" data-animate>
            <p class="team-intro" data-i18n="team.intro">${teamIntro}</p>
            <p class="team-vision" data-i18n="team.vision">${teamVision}</p>
          </section>
          
          <h1 class="team-members-title" data-i18n="team.membersTitle">${membersTitle}</h1>
          
          <div class="team-grid">
            ${memberCards}
          </div>
        </div>
      </section>
    `;
  }

  getSocialTemplate() {
    const socialData = window.i18n.get('social');
    const platforms = this.getSocialPlatforms(socialData);
    
    const socialCards = platforms.map(platform => {
      const platformData = socialData[platform];
      const placeholder = this.getPlatformPlaceholder(platform);
      return `
        <article class="social-card" data-animate data-platform="${platform}">
          <a href="${platformData.link}" class="social-card-link" target="_blank" rel="noopener noreferrer" aria-label="${platformData.ariaLabel}">
            <div class="social-card-icon">
              <img src="/img/social/${platform}.svg" alt="${platformData.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
              <span class="social-icon-placeholder" style="display: none;">${placeholder}</span>
            </div>
            <div class="social-card-content">
              <h2 class="social-platform-name">${platformData.name}</h2>
              <p class="social-platform-id">${platformData.id}</p>
              <p class="social-platform-desc">${platformData.desc}</p>
            </div>
            <div class="social-card-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </a>
        </article>
      `;
    }).join('');

    return `
      <section class="page social-page">
        <div class="container">
          <header class="page-header">
            <h1 class="page-title" data-i18n="social.title">${socialData.title}</h1>
            <p class="page-subtitle" data-i18n="social.subtitle">${socialData.subtitle}</p>
          </header>
          
          <div class="social-grid">
            ${socialCards}
          </div>
        </div>
      </section>
    `;
  }

  getTeamSocialTemplate() {
    const socialData = window.i18n.get('social');
    const platforms = this.getSocialPlatforms(socialData);
    
    const socialCards = platforms.map(platform => {
      const platformData = socialData[platform];
      const placeholder = this.getPlatformPlaceholder(platform);
      return `
        <article class="social-card" data-animate data-platform="${platform}">
          <a href="${platformData.link}" class="social-card-link" target="_blank" rel="noopener noreferrer" aria-label="${platformData.ariaLabel}">
            <div class="social-card-icon">
              <img src="/img/social/${platform}.svg" alt="${platformData.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
              <span class="social-icon-placeholder" style="display: none;">${placeholder}</span>
            </div>
            <div class="social-card-content">
              <h2 class="social-platform-name">${platformData.name}</h2>
              <p class="social-platform-id">${platformData.id}</p>
              <p class="social-platform-desc">${platformData.desc}</p>
            </div>
            <div class="social-card-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </a>
        </article>
      `;
    }).join('');

    return `
      <section class="page team-social-page">
        <div class="container">
          <header class="page-header">
            <h1 class="page-title" data-i18n="social.title">${socialData.title}</h1>
            <p class="page-subtitle" data-i18n="social.subtitle">${socialData.subtitle}</p>
          </header>
          
          <div class="social-grid">
            ${socialCards}
          </div>
        </div>
      </section>
    `;
  }

  attachHomeEvents() {
    this.initHeroVideo();
    window.heroAnimations.init();
    window.dissolveAnimationManager.init();
  }

  attachProductsEvents() {
    this.initScrollIndicator();
  }

  renderTools() {
    const content = document.getElementById('main-content');
    if (content) {
      content.innerHTML = this.getToolsTemplate();
      this.attachToolsEvents();
    }
  }

  getToolsTemplate() {
    const t = window.i18n.get('tools') || {};
    const items = t.items || [];
    const mzItems = items.filter(it => it.section === 'mz');
    const godotItems = items.filter(it => it.section === 'godot');
    const actions = t.actions || {};

    const escapeHtml = (s) => String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const renderTag = (tag) => `<span class="tool-tag">${escapeHtml(tag)}</span>`;

    const renderDownloadCard = (item) => {
      const tags = (item.tags || []).map(renderTag).join('');
      const name = escapeHtml(item.name);
      const nameEn = escapeHtml(item.nameEn || '');
      const desc = escapeHtml(item.description);
      const file = escapeHtml(item.file);
      const size = escapeHtml(item.fileSize);
      const downloadLabel = escapeHtml(actions.download || '下载 .js');
      return `
        <article class="tool-card" data-animate data-kind="download">
          <div class="tool-card-top">
            <span class="tool-index">NO. ${escapeHtml(item.id)}</span>
            <span class="tool-filetype">${escapeHtml(item.fileType || '.js')}</span>
          </div>
          <h3 class="tool-name">
            <span class="tool-name-cn">${name}</span>
            <span class="tool-name-en">${nameEn}</span>
          </h3>
          <p class="tool-description">${desc}</p>
          <div class="tool-tags">${tags}</div>
          <div class="tool-card-bottom">
            <div class="tool-meta">
              <span class="tool-meta-item"><span class="tool-meta-label">${escapeHtml(actions.size || '大小')}</span><span class="tool-meta-value">${size}</span></span>
            </div>
            <a class="tool-action tool-action-download" href="${file}" download aria-label="${downloadLabel}">
              <span>${downloadLabel}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 4V16M12 16L7 11M12 16L17 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 20H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </article>
      `;
    };

    const renderOnlineCard = (item) => {
      const tags = (item.tags || []).map(renderTag).join('');
      const name = escapeHtml(item.name);
      const nameEn = escapeHtml(item.nameEn || '');
      const desc = escapeHtml(item.description);
      const file = escapeHtml(item.file);
      const size = escapeHtml(item.fileSize);
      const openLabel = escapeHtml(actions.openOnline || '立即打开');
      const liveLabel = escapeHtml(actions.live || '在线');
      const newTabLabel = escapeHtml(actions.openNewTab || '新标签页打开');
      // Snapshot of the Godot Tween tool — a stylised browser window so the user
      // gets a sense of what the live tool looks like before clicking through.
      return `
        <article class="tool-card tool-card-featured" data-animate data-kind="online">
          <div class="tool-featured-grid">
            <div class="tool-featured-left">
              <div class="tool-card-top">
                <span class="tool-index">NO. ${escapeHtml(item.id)}</span>
                <span class="tool-filetype">${escapeHtml(item.fileType || '.html')}</span>
                <span class="tool-live" aria-label="${liveLabel}"><span class="tool-live-dot" aria-hidden="true"></span>${liveLabel}</span>
              </div>
              <h3 class="tool-name">
                <span class="tool-name-cn">${name}</span>
                <span class="tool-name-en">${nameEn}</span>
              </h3>
              <p class="tool-description">${desc}</p>
              <div class="tool-tags">${tags}</div>
              <div class="tool-card-bottom">
                <div class="tool-meta">
                  <span class="tool-meta-item"><span class="tool-meta-label">${escapeHtml(actions.size || '大小')}</span><span class="tool-meta-value">${size}</span></span>
                </div>
                <a class="tool-action tool-action-open" href="${file}" target="_blank" rel="noopener noreferrer" aria-label="${openLabel}（${newTabLabel}）">
                  <span>${openLabel}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </a>
              </div>
            </div>
            <div class="tool-featured-right" aria-hidden="true">
              <div class="tool-snapshot">
                <div class="tool-snapshot-bar">
                  <span class="tool-snapshot-dot tool-snapshot-dot-r"></span>
                  <span class="tool-snapshot-dot tool-snapshot-dot-y"></span>
                  <span class="tool-snapshot-dot tool-snapshot-dot-g"></span>
                  <span class="tool-snapshot-url">godot-tween-curves</span>
                </div>
                <div class="tool-snapshot-body">
                  <div class="tool-snapshot-title">Tween 动画手册</div>
                  <div class="tool-snapshot-sub">12 × 4 曲线</div>
                  <div class="tool-snapshot-row">
                    <span class="tool-snapshot-chip">TRANS_LINEAR</span>
                    <span class="tool-snapshot-chip tool-snapshot-chip-accent">EASE_IN_OUT</span>
                  </div>
                  <div class="tool-snapshot-canvas">
                    <svg viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true">
                      <defs>
                        <linearGradient id="snapStroke" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stop-color="#C9A86A" stop-opacity="0.3"/>
                          <stop offset="100%" stop-color="#C9A86A" stop-opacity="1"/>
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="78" x2="200" y2="78" stroke="rgba(232,227,214,0.1)" stroke-width="0.5"/>
                      <line x1="0" y1="2"  x2="200" y2="2"  stroke="rgba(232,227,214,0.05)" stroke-width="0.5"/>
                      <path d="M0,78 C50,78 80,40 110,30 C140,22 170,18 200,15" fill="none" stroke="url(#snapStroke)" stroke-width="1.4" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <div class="tool-snapshot-mini">
                    <span class="tool-snapshot-mini-bar" style="--h:18%"></span>
                    <span class="tool-snapshot-mini-bar" style="--h:42%"></span>
                    <span class="tool-snapshot-mini-bar" style="--h:72%"></span>
                    <span class="tool-snapshot-mini-bar" style="--h:90%"></span>
                    <span class="tool-snapshot-mini-bar" style="--h:78%"></span>
                    <span class="tool-snapshot-mini-bar" style="--h:96%"></span>
                    <span class="tool-snapshot-mini-bar" style="--h:64%"></span>
                    <span class="tool-snapshot-mini-bar" style="--h:36%"></span>
                    <span class="tool-snapshot-mini-bar" style="--h:30%"></span>
                    <span class="tool-snapshot-mini-bar" style="--h:52%"></span>
                    <span class="tool-snapshot-mini-bar" style="--h:80%"></span>
                    <span class="tool-snapshot-mini-bar" style="--h:88%"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      `;
    };

    const mzSection = t.sections && t.sections.mz ? t.sections.mz : { label: 'RPG MAKER MZ', title: '', subtitle: '' };
    const godotSection = t.sections && t.sections.godot ? t.sections.godot : { label: 'GODOT', title: '', subtitle: '' };

    return `
      <section class="page tools-page">
        <div class="container">
          <header class="page-header tools-page-header" data-animate>
            <h1 class="page-title" data-i18n="tools.title">${escapeHtml(t.title || '开源工具')}</h1>
            <div class="tools-notice" role="note" aria-label="License notice">
              <span class="tools-notice-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L4 6V11C4 16 7.5 20.5 12 22C16.5 20.5 20 16 20 11V6L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              <span class="tools-notice-text" data-i18n="tools.notice">${escapeHtml(t.notice || '免费用于商业 / 非商业用途；保留原作者信息即可～')}</span>
            </div>
          </header>

          <section class="tools-section" data-animate>
            <div class="tools-section-header">
              <span class="tools-section-label">${escapeHtml(mzSection.label)}</span>
              <h2 class="tools-section-title">${escapeHtml(mzSection.title)}</h2>
              <p class="tools-section-subtitle">${escapeHtml(mzSection.subtitle)}</p>
            </div>
            <div class="tools-grid">
              ${mzItems.map(renderDownloadCard).join('')}
            </div>
          </section>

          <section class="tools-section" data-animate>
            <div class="tools-section-header">
              <span class="tools-section-label">${escapeHtml(godotSection.label)}</span>
              <h2 class="tools-section-title">${escapeHtml(godotSection.title)}</h2>
              <p class="tools-section-subtitle">${escapeHtml(godotSection.subtitle)}</p>
            </div>
            <div class="tools-grid tools-grid-single">
              ${godotItems.map(renderOnlineCard).join('')}
            </div>
          </section>
        </div>
      </section>
    `;
  }

  attachToolsEvents() {
  }

  initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const footer = document.querySelector('.footer');
    
    if (!scrollIndicator || !footer) return;

    let ticking = false;

    const checkFooterVisibility = () => {
      const footerRect = footer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollIndicatorHeight = scrollIndicator.offsetHeight;
      
      const isFooterVisible = footerRect.top < viewportHeight && footerRect.bottom > 0;
      
      if (isFooterVisible) {
        scrollIndicator.classList.add('hidden');
      } else {
        scrollIndicator.classList.remove('hidden');
      }
      
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(checkFooterVisibility);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkFooterVisibility, { passive: true });
    
    checkFooterVisibility();
  }

  attachTeamEvents() {
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  window.appInstance = app;
  window.setFloatingImageRotation = (enabled) => app.setFloatingImageRotationConfig(enabled);
  window.toggleFloatingImageRotation = () => app.toggleFloatingImageRotation();
  window.getFloatingImageRotation = () => app.getFloatingImageRotationConfig();
  
  window.toggleMobileMenu = function() {
    if (window.appInstance) {
      window.appInstance.toggleMobileMenuState();
    }
  };
  
  app.init();
});
