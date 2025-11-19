/**
 * Image Layout Manager
 * 支援響應式圖片佈局和滾動功能
 */
console.log('Image Layout Manager loaded');
class ImageLayoutManager {
  constructor(customConfig = {}) {
    // 默認配置
    this.config = {
      lazyLoad: true,
      resizeDebounceTime: 150,
      defaultTargetPosition: 0.5,
      mobileBreakpoint: 768,
      defaultMobileMinHeight: '300px',
      defaultDesktopMinHeight: null,
      selectors: {
        section: '.image-layout-section',
        container: '.overflow-x-auto',
        imageContainer: '.image-container',
        image: '.centered-image',
        picture: 'picture'
      },
      attributes: {
        width: 'data-width',
        height: 'data-height',
        targetPosition: 'data-target-position',
        mobileMinHeight: 'data-mobile-min-height',
        desktopMinHeight: 'data-desktop-min-height'
      },
      ...customConfig
    };

    // 特性檢測
    this.features = {
      hasIntersectionObserver: 'IntersectionObserver' in window,
      hasResizeObserver: 'ResizeObserver' in window,
      hasImageDecode: 'decode' in Image.prototype,
      hasPictureSupport: 'HTMLPictureElement' in window,
      iOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    };

    this.dimensionsCache = new Map();
    this.observers = new Map();

    // 創建用於計算 CSS 值的臨時元素
    this.tempElement = document.createElement('div');
    document.body.appendChild(this.tempElement);
    this.tempElement.style.position = 'absolute';
    this.tempElement.style.visibility = 'hidden';

    this.setupFeatures();
  }

  /**
   * 設置基本特性
   */
  setupFeatures() {
    if (!this.features.hasIntersectionObserver) {
      this.config.lazyLoad = false;
    }

    if (!this.features.hasResizeObserver) {
      this.setupLegacyResizeListener();
    }
  }

  /**
   * 判斷是否為移動設備視圖
   */
  isMobileView() {
    return window.innerWidth < this.config.mobileBreakpoint;
  }

  /**
   * 解析 CSS 值為像素
   */
  parseCssValue(value, context = 'height') {
    if (!value) return null;
    if (typeof value === 'number') return value;

    if (context === 'height') {
      this.tempElement.style.height = value;
      this.tempElement.style.width = '1px';
    } else {
      this.tempElement.style.width = value;
      this.tempElement.style.height = '1px';
    }

    const computedValue = context === 'height' 
      ? this.tempElement.getBoundingClientRect().height
      : this.tempElement.getBoundingClientRect().width;

    this.tempElement.style[context] = '';
    return Number(computedValue.toFixed(6));
  }

  /**
   * 獲取當前視口尺寸
   */
  getViewportDimensions() {
    return {
      width: this.features.iOS ? screen.width : window.innerWidth,
      height: window.innerHeight
    };
  }

  /**
   * 計算圖片尺寸和中心點位置
   */
  async calculateImageDimensions($container) {
    const viewport = this.getViewportDimensions();
    const isMobile = this.isMobileView();

    let sourceWidth, sourceHeight, targetPosition;
    const $picture = $container.find(this.config.selectors.picture);

    // 檢查是否有 picture 元素
    if ($picture.length) {
      if (!isMobile) {
        // 桌機版：優先使用 source 的尺寸
        const $desktopSource = $picture.find('source[media*="min-width"]');
        if ($desktopSource.length) {
          sourceWidth = parseFloat($desktopSource.attr(this.config.attributes.width));
          sourceHeight = parseFloat($desktopSource.attr(this.config.attributes.height));
          targetPosition = parseFloat($desktopSource.attr(this.config.attributes.targetPosition));
        }
      }
      // 如果沒有找到合適的 source 或是移動版，使用 img 的尺寸
      if (!sourceWidth || !sourceHeight) {
        const $img = $picture.find('img');
        sourceWidth = parseFloat($img.attr(this.config.attributes.width));
        sourceHeight = parseFloat($img.attr(this.config.attributes.height));
        targetPosition = parseFloat($img.attr(this.config.attributes.targetPosition));
      }
    } else {
      // 沒有 picture 元素，直接使用 img
      const $img = $container.find('img');
      sourceWidth = parseFloat($img.attr(this.config.attributes.width));
      sourceHeight = parseFloat($img.attr(this.config.attributes.height));
      targetPosition = parseFloat($img.attr(this.config.attributes.targetPosition));
    }

    if (!sourceWidth || !sourceHeight) {
      console.warn('Invalid image dimensions');
      return null;
    }

    // 如果沒有指定目標位置，使用圖片中心點
    if (targetPosition === null || targetPosition === undefined || isNaN(targetPosition)) {
      targetPosition = sourceWidth / 2;
    }

    // 計算精確的寬高比
    const aspectRatio = Number((sourceWidth / sourceHeight).toFixed(6));

    let finalWidth, finalHeight;

    if (!isMobile) {
      // 桌機版：檢查是否有設定最小高度
      const desktopMinHeight = this.parseCssValue(
        $container.attr(this.config.attributes.desktopMinHeight) || 
        this.config.defaultDesktopMinHeight
      );

      if (desktopMinHeight) {
        // 如果有設定最小高度，以最小高度為基準
        finalHeight = desktopMinHeight;
        finalWidth = Math.round(finalHeight * aspectRatio);
        
        // 確保寬度至少等於視窗寬度
        if (finalWidth < viewport.width) {
          finalWidth = viewport.width;
          finalHeight = Math.round(finalWidth / aspectRatio);
        }
      } else {
        // 無設定最小高度時，維持原有邏輯
        finalWidth = viewport.width;
        finalHeight = Math.round(finalWidth / aspectRatio);
      }
    } else {
      // 移動版：以最小高度為基準
      const mobileMinHeight = this.parseCssValue(
        $container.attr(this.config.attributes.mobileMinHeight) || 
        this.config.defaultMobileMinHeight
      );
      finalHeight = mobileMinHeight;
      finalWidth = Math.round(finalHeight * aspectRatio);
    }

    // 計算縮放後的目標位置
    const scaledTargetPosition = (targetPosition / sourceWidth) * finalWidth;

    return {
      width: finalWidth,
      height: finalHeight,
      scaledTargetPosition,
      containerWidth: viewport.width,
      needsScroll: isMobile || finalWidth > viewport.width,
      aspectRatio
    };
  }

  /**
   * 應用佈局並設置滾動位置
   */
  async applyLayout(sectionId) {
    const $section = $(`#${sectionId}`);
    const $container = $section.find(this.config.selectors.container);
    const $imageContainer = $container.find(this.config.selectors.imageContainer);
    
    try {
      const dimensions = await this.calculateImageDimensions($container);
      if (!dimensions) return;

      // 套用計算後的尺寸到所有元素
      const elementStyles = {
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`
      };

      // 設置容器尺寸
      $container.css({
        height: elementStyles.height
      });

      // 設置圖片容器尺寸
      $imageContainer.css(elementStyles);

      // 設置 picture 元素尺寸
      const $picture = $container.find('picture');
      if ($picture.length) {
        $picture.css({
          ...elementStyles,
          display: 'block'
        });
      }

      // 設置圖片尺寸
      const $img = $container.find('img');
      $img.css({
        ...elementStyles,
        objectFit: 'cover',
        display: 'block',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        willChange: 'transform'
      });

      // 處理滾動
      if (dimensions.needsScroll) {
        requestAnimationFrame(() => {
          const scrollPosition = Math.max(
            0,
            Math.min(
              dimensions.scaledTargetPosition - (dimensions.containerWidth / 2),
              dimensions.width - dimensions.containerWidth
            )
          );
          
          $container.animate({
            scrollLeft: scrollPosition
          }, {
            duration: 300,
            easing: 'swing'
          });
        });
      }
    } catch (error) {
      console.error('Error applying layout:', error, sectionId);
    }
  }

  /**
   * 設置 IntersectionObserver
   */
  setupIntersectionObserver() {
    if (!this.features.hasIntersectionObserver || !this.config.lazyLoad) return;

    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    this.intersectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.applyLayout(entry.target.id);
          this.intersectionObserver.unobserve(entry.target);
        }
      });
    }, options);

    $(this.config.selectors.section).each((_, section) => {
      this.intersectionObserver.observe(section);
    });
  }

  /**
   * 設置 ResizeObserver
   */
  setupResizeObserver() {
    if (!this.features.hasResizeObserver) return;

    let resizeTimeout;
    this.resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.dimensionsCache.clear();
        $(this.config.selectors.section).each((_, section) => {
          this.applyLayout(section.id);
        });
      }, this.config.resizeDebounceTime);
    });

    this.resizeObserver.observe(document.documentElement);
  }

  /**
   * 設置傳統 resize 監聽器
   */
  setupLegacyResizeListener() {
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.dimensionsCache.clear();
        this.initializeAll();
      }, this.config.resizeDebounceTime);
    };

    $(window).on('resize.imageLayout', handleResize);
  }

  /**
   * 初始化所有部分
   */
  initializeAll() {
    if (this.config.lazyLoad && this.features.hasIntersectionObserver) {
      this.setupIntersectionObserver();
    } else {
      $(this.config.selectors.section).each((_, section) => {
        this.applyLayout(section.id);
      });
    }

    if (this.features.hasResizeObserver) {
      this.setupResizeObserver();
    }
  }

  /**
   * 清理資源
   */
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    if (this.tempElement && this.tempElement.parentNode) {
      this.tempElement.parentNode.removeChild(this.tempElement);
    }

    $(window).off('resize.imageLayout');
    this.dimensionsCache.clear();
  }
}

// 導出為全局變量
window.ImageLayoutManager = ImageLayoutManager;