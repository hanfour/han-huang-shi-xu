/**
 * CustomSlider - 自定義輪播組件
 *
 * 特點：
 * - 顯示完整當前圖片 + 右側部分預覽下一張圖片
 * - 支援無限循環
 * - 自動播放（可選）
 * - 響應式設計
 * - 滑鼠懸停暫停
 * - 前後箭頭導航
 *
 * @example
 * // 基本使用
 * new CustomSlider('.my-slider', {
 *   autoplay: true,
 *   autoplaySpeed: 5000,
 *   speed: 800,
 *   slideWidth: 75,
 *   gap: 16
 * });
 *
 * @author Han Huang
 * @version 1.0.0
 */

class CustomSlider {
  /**
   * 創建 CustomSlider 實例
   * @param {string} containerSelector - 容器選擇器（CSS selector）
   * @param {Object} options - 配置選項
   * @param {boolean} [options.autoplay=true] - 是否自動播放
   * @param {number} [options.autoplaySpeed=5000] - 自動播放間隔（毫秒）
   * @param {number} [options.speed=800] - 切換動畫速度（毫秒）
   * @param {number} [options.slideWidth=75] - 每張 slide 佔據的寬度百分比
   * @param {number} [options.gap=16] - slide 之間的間距（像素）
   * @param {boolean} [options.arrows=true] - 是否顯示箭頭
   * @param {string} [options.prevArrowClass='slick-prev carousel-arrow carousel-arrow-prev'] - 上一張箭頭的 CSS 類別
   * @param {string} [options.nextArrowClass='slick-next carousel-arrow carousel-arrow-next'] - 下一張箭頭的 CSS 類別
   * @param {Function} [options.onSlideChange] - slide 切換時的回調函數
   */
  constructor(containerSelector, options = {}) {
    // 獲取容器元素
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      console.warn(`CustomSlider: 找不到容器元素 "${containerSelector}"`);
      return;
    }

    // 保存原始 slides
    this.originalSlides = Array.from(this.container.children);
    if (this.originalSlides.length === 0) {
      console.warn(`CustomSlider: 容器 "${containerSelector}" 內沒有 slide 元素`);
      return;
    }

    // 當前索引和狀態
    this.currentIndex = 0;
    this.isTransitioning = false;
    this.autoplayInterval = null;

    // 合併預設配置和用戶配置
    this.options = {
      autoplay: options.autoplay !== false,
      autoplaySpeed: options.autoplaySpeed || 5000,
      speed: options.speed || 800,
      slideWidth: options.slideWidth || 75,
      gap: options.gap !== undefined ? options.gap : 16,
      arrows: options.arrows !== false,
      prevArrowClass: options.prevArrowClass || 'slick-prev carousel-arrow carousel-arrow-prev',
      nextArrowClass: options.nextArrowClass || 'slick-next carousel-arrow carousel-arrow-next',
      onSlideChange: options.onSlideChange || null
    };

    // 初始化
    this.init();
  }

  /**
   * 初始化 slider
   * @private
   */
  init() {
    // 創建 track
    this.createTrack();

    // 設置 slides 樣式
    this.setupSlides();

    // 設置初始位置
    this.setInitialPosition();

    // 添加箭頭按鈕
    if (this.options.arrows) {
      this.createArrows();
    }

    // 自動播放
    if (this.options.autoplay) {
      this.startAutoplay();
      this.container.addEventListener('mouseenter', () => this.stopAutoplay());
      this.container.addEventListener('mouseleave', () => this.startAutoplay());
    }
  }

  /**
   * 創建 track 容器
   * @private
   */
  createTrack() {
    const track = document.createElement('div');
    track.className = 'slider-track';
    track.style.cssText = `
      display: flex;
      transition: transform ${this.options.speed}ms ease-in-out;
    `;

    // 克隆第一張和最後一張（用於無限循環）
    const firstClone = this.originalSlides[0].cloneNode(true);
    const lastClone = this.originalSlides[this.originalSlides.length - 1].cloneNode(true);

    // 組裝：lastClone + 原始slides + firstClone
    track.appendChild(lastClone);
    this.originalSlides.forEach(slide => track.appendChild(slide));
    track.appendChild(firstClone);

    // 清空容器並添加 track
    this.container.innerHTML = '';
    this.container.appendChild(track);

    this.track = track;
    this.slides = Array.from(track.children);
  }

  /**
   * 設置 slides 的樣式
   * @private
   */
  setupSlides() {
    this.slides.forEach(slide => {
      slide.style.flexShrink = '0';
      slide.style.width = `calc(${this.options.slideWidth}% - ${this.options.gap}px)`;
      slide.style.marginRight = `${this.options.gap}px`;
    });
  }

  /**
   * 設置初始位置
   * @private
   */
  setInitialPosition() {
    // 從第1張開始（因為前面有克隆）
    this.currentIndex = 1;
    this.track.style.transition = 'none';
    this.track.style.transform = `translateX(calc(-${this.options.slideWidth}% * ${this.currentIndex}))`;

    setTimeout(() => {
      this.track.style.transition = `transform ${this.options.speed}ms ease-in-out`;
    }, 50);
  }

  /**
   * 創建箭頭按鈕
   * @private
   */
  createArrows() {
    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = this.options.prevArrowClass;
    prevBtn.setAttribute('aria-label', '上一張');
    prevBtn.addEventListener('click', () => this.prev());

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = this.options.nextArrowClass;
    nextBtn.setAttribute('aria-label', '下一張');
    nextBtn.addEventListener('click', () => this.next());

    this.container.appendChild(prevBtn);
    this.container.appendChild(nextBtn);

    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
  }

  /**
   * 切換到指定的 slide
   * @param {number} index - slide 索引
   * @param {boolean} [instant=false] - 是否立即切換（無動畫）
   * @private
   */
  goToSlide(index, instant = false) {
    if (this.isTransitioning && !instant) return;

    this.isTransitioning = true;
    this.currentIndex = index;

    if (instant) {
      this.track.style.transition = 'none';
    }

    this.track.style.transform = `translateX(calc(-${this.options.slideWidth}% * ${this.currentIndex}))`;

    setTimeout(() => {
      this.isTransitioning = false;

      if (instant) {
        this.track.style.transition = `transform ${this.options.speed}ms ease-in-out`;
      }

      // 無限循環邏輯
      const totalSlides = this.slides.length;
      if (this.currentIndex === 0) {
        // 到達最前面的克隆，跳到真實的最後一張
        setTimeout(() => {
          this.goToSlide(totalSlides - 2, true);
        }, 50);
      } else if (this.currentIndex === totalSlides - 1) {
        // 到達最後面的克隆，跳到真實的第一張
        setTimeout(() => {
          this.goToSlide(1, true);
        }, 50);
      }

      // 執行回調
      if (!instant && this.options.onSlideChange) {
        // 計算真實的 slide 索引（排除克隆）
        const realIndex = this.currentIndex === 0
          ? this.originalSlides.length - 1
          : this.currentIndex === totalSlides - 1
            ? 0
            : this.currentIndex - 1;
        this.options.onSlideChange(realIndex, this.originalSlides[realIndex]);
      }
    }, instant ? 50 : this.options.speed);
  }

  /**
   * 切換到下一張
   * @public
   */
  next() {
    if (!this.isTransitioning) {
      this.goToSlide(this.currentIndex + 1);
    }
  }

  /**
   * 切換到上一張
   * @public
   */
  prev() {
    if (!this.isTransitioning) {
      this.goToSlide(this.currentIndex - 1);
    }
  }

  /**
   * 開始自動播放
   * @public
   */
  startAutoplay() {
    this.stopAutoplay();
    if (this.options.autoplay) {
      this.autoplayInterval = setInterval(() => this.next(), this.options.autoplaySpeed);
    }
  }

  /**
   * 停止自動播放
   * @public
   */
  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  /**
   * 銷毀 slider 並清理資源
   * @public
   */
  destroy() {
    // 停止自動播放
    this.stopAutoplay();

    // 移除事件監聽器
    if (this.options.autoplay) {
      this.container.removeEventListener('mouseenter', () => this.stopAutoplay());
      this.container.removeEventListener('mouseleave', () => this.startAutoplay());
    }

    // 恢復原始 HTML
    this.container.innerHTML = '';
    this.originalSlides.forEach(slide => this.container.appendChild(slide));

    // 清空引用
    this.container = null;
    this.track = null;
    this.slides = null;
    this.originalSlides = null;
  }

  /**
   * 獲取當前 slide 的索引
   * @returns {number} 當前 slide 索引（不包含克隆的索引）
   * @public
   */
  getCurrentIndex() {
    const totalSlides = this.slides.length;
    if (this.currentIndex === 0) {
      return this.originalSlides.length - 1;
    } else if (this.currentIndex === totalSlides - 1) {
      return 0;
    }
    return this.currentIndex - 1;
  }
}

// 支援 CommonJS, AMD 和全局變量
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CustomSlider;
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    return CustomSlider;
  });
} else {
  window.CustomSlider = CustomSlider;
}
