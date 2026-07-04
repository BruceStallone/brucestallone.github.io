class HeroVideoBackground {
  constructor() {
    this.video = null;
    this.container = null;
    this.fallback = null;
    this.config = null;
    this.isInitialized = false;
    this.hasError = false;
    this.isLoading = true;
    this.reducedMotion = false;
    this.enableVideo = false;
    
    this.defaultConfig = {
      enableVideo: false,
      src: 'video/hero.mp4',
      webmSrc: 'video/hero.webm',
      poster: 'img/hero/hero-bg.jpg',
      muted: true,
      loop: true,
      preload: 'auto',
      objectFit: 'cover',
      zIndex: 0,
      overlayOpacity: 0.5,
      fallbackBgColor: '#1A1A1A',
      fallbackBgImage: 'img/hero/hero-bg.jpg',
      loadTimeout: 10000,
      retryAttempts: 2
    };
    
    this.retryCount = 0;
    this.loadTimeoutId = null;
  }
  
  init() {
    if (this.isInitialized) return;
    
    this.video = document.getElementById('hero-video');
    this.container = document.getElementById('hero-video-container');
    this.fallback = document.getElementById('hero-video-fallback');
    
    if (!this.video || !this.container) {
      return;
    }
    
    this.parseConfig();
    this.enableVideo = this.config.enableVideo;
    
    if (!this.enableVideo) {
      this.applyPosterOnly();
      this.isInitialized = true;
      return;
    }
    
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (this.reducedMotion) {
      this.showFallback();
      return;
    }
    
    this.applyConfig();
    this.bindEvents();
    this.startLoading();
    
    this.isInitialized = true;
  }
  
  applyPosterOnly() {
    this.video.style.display = 'none';
    const sources = this.video.querySelectorAll('source');
    sources.forEach(source => {
      source.src = '';
    });
    this.video.src = '';
    this.video.load = function() {};
    
    if (this.fallback && this.config.fallbackBgImage) {
      this.fallback.style.backgroundImage = `url('${this.config.fallbackBgImage}')`;
    }
    if (this.fallback && this.config.fallbackBgColor) {
      this.fallback.style.backgroundColor = this.config.fallbackBgColor;
    }
    
    const overlay = document.querySelector('.hero-overlay');
    if (overlay && this.config.overlayOpacity !== undefined) {
      overlay.style.setProperty('--overlay-opacity', this.config.overlayOpacity);
    }
    
    this.showFallback();
  }
  
  parseConfig() {
    try {
      const configAttr = this.video.dataset.videoConfig;
      if (configAttr) {
        this.config = { ...this.defaultConfig, ...JSON.parse(configAttr) };
      } else {
        this.config = { ...this.defaultConfig };
      }
    } catch (error) {
      this.config = { ...this.defaultConfig };
    }
  }
  
  applyConfig() {
    const { muted, loop, preload, poster, objectFit, zIndex } = this.config;
    
    this.video.muted = muted;
    this.video.loop = loop;
    this.video.preload = preload;
    this.video.poster = poster;
    this.video.style.objectFit = objectFit;
    this.video.style.zIndex = zIndex;
    
    if (this.fallback && this.config.fallbackBgImage) {
      this.fallback.style.backgroundImage = `url('${this.config.fallbackBgImage}')`;
    }
    if (this.fallback && this.config.fallbackBgColor) {
      this.fallback.style.backgroundColor = this.config.fallbackBgColor;
    }
    
    const overlay = document.querySelector('.hero-overlay');
    if (overlay && this.config.overlayOpacity !== undefined) {
      overlay.style.setProperty('--overlay-opacity', this.config.overlayOpacity);
    }
  }
  
  bindEvents() {
    this.video.addEventListener('loadeddata', this.handleLoadedData.bind(this));
    this.video.addEventListener('canplay', this.handleCanPlay.bind(this));
    this.video.addEventListener('playing', this.handlePlaying.bind(this));
    this.video.addEventListener('error', this.handleError.bind(this));
    this.video.addEventListener('stalled', this.handleStalled.bind(this));
    this.video.addEventListener('suspend', this.handleSuspend.bind(this));
    
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      if (e.matches) {
        this.handleReducedMotion();
      } else {
        this.handleNormalMotion();
      }
    });
    
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  startLoading() {
    this.container.classList.add('video-loading');
    
    this.loadTimeoutId = setTimeout(() => {
      if (this.isLoading) {
        this.handleLoadTimeout();
      }
    }, this.config.loadTimeout);
  }
  
  handleLoadedData() {
  }
  
  handleCanPlay() {
    this.clearLoadTimeout();
    this.container.classList.remove('video-loading');
    this.isLoading = false;
  }
  
  handlePlaying() {
    this.clearLoadTimeout();
    this.container.classList.remove('video-loading');
    this.isLoading = false;
    this.hasError = false;
  }
  
  handleError(e) {
    const error = this.video.error;
    
    if (this.retryCount < this.config.retryAttempts) {
      this.retryCount++;
      setTimeout(() => {
        this.video.load();
      }, 1000);
      return;
    }
    
    this.showFallback();
    this.hasError = true;
  }
  
  handleStalled() {
  }
  
  handleSuspend() {
  }
  
  handleLoadTimeout() {
    this.showFallback();
    this.container.classList.add('video-error');
    this.container.classList.remove('video-loading');
    this.isLoading = false;
    this.hasError = true;
  }
  
  handleReducedMotion() {
    this.video.pause();
    this.showFallback();
  }
  
  handleNormalMotion() {
    this.hideFallback();
    this.video.play().catch(() => {});
  }
  
  handleVisibilityChange() {
    if (document.hidden) {
      this.video.pause();
    } else if (!this.reducedMotion && !this.hasError) {
      this.video.play().catch(() => {});
    }
  }
  
  handleResize() {
    this.adjustVideoPosition();
  }
  
  adjustVideoPosition() {
    if (!this.video || !this.container) return;
    
    const containerRatio = this.container.offsetWidth / this.container.offsetHeight;
    const videoRatio = this.video.videoWidth / this.video.videoHeight;
    
    if (containerRatio > videoRatio) {
      this.video.style.width = '100%';
      this.video.style.height = 'auto';
    } else {
      this.video.style.width = 'auto';
      this.video.style.height = '100%';
    }
  }
  
  showFallback() {
    if (this.fallback) {
      this.fallback.classList.add('active');
    }
    this.container.classList.add('video-error');
    this.container.classList.remove('video-loading');
  }
  
  hideFallback() {
    if (this.fallback) {
      this.fallback.classList.remove('active');
    }
    this.container.classList.remove('video-error');
  }
  
  clearLoadTimeout() {
    if (this.loadTimeoutId) {
      clearTimeout(this.loadTimeoutId);
      this.loadTimeoutId = null;
    }
  }
  
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.applyConfig();
    
    if (newConfig.src || newConfig.webmSrc) {
      this.retryCount = 0;
      this.hasError = false;
      this.isLoading = true;
      this.hideFallback();
      this.container.classList.remove('video-error');
      this.startLoading();
      this.video.load();
    }
  }
  
  play() {
    if (this.video && !this.hasError && !this.reducedMotion) {
      return this.video.play();
    }
    return Promise.reject(new Error('无法播放视频'));
  }
  
  pause() {
    if (this.video) {
      this.video.pause();
    }
  }
  
  destroy() {
    this.clearLoadTimeout();
    
    if (this.video) {
      this.video.removeEventListener('loadeddata', this.handleLoadedData);
      this.video.removeEventListener('canplay', this.handleCanPlay);
      this.video.removeEventListener('playing', this.handlePlaying);
      this.video.removeEventListener('error', this.handleError);
      this.video.removeEventListener('stalled', this.handleStalled);
      this.video.removeEventListener('suspend', this.handleSuspend);
      this.video.pause();
      this.video.src = '';
    }
    
    this.isInitialized = false;
  }
}

window.heroVideoBackground = new HeroVideoBackground();
window.HeroVideoBackground = HeroVideoBackground;

window.updateHeroVideoConfig = (config) => {
  window.heroVideoBackground.updateConfig(config);
};

window.playHeroVideo = () => {
  return window.heroVideoBackground.play();
};

window.pauseHeroVideo = () => {
  window.heroVideoBackground.pause();
};

export default HeroVideoBackground;
