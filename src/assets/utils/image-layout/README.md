# Image Layout Manager 圖片佈局管理器

一個支援響應式設計的圖片佈局管理器，可處理單一圖片和帶有藝術指導的 picture 元素。支援延遲載入、響應式圖片和平滑滾動到焦點位置。

## 特點

- 同時支援單一 `<img>` 和多源 `<picture>` 元素
- 桌機版支援:
  - 自動依據畫面寬度計算正確比例高度
  - 可選擇性設定最小高度（支援所有 CSS 單位）
- 移動版支援自定義最小高度（支援所有 CSS 單位）
- 圖片延遲載入
- 響應式圖片處理與藝術指導
- 自動焦點位置滾動
- 平滑的視窗大小調整處理
- 效能優化（包含去抖動和快取）
- 舊版瀏覽器的降級支援

## 安裝

1. 引入 jQuery：
```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
```

2. 引入必要的 CSS：
```css
.w-full {
  width: 100%;
}

.absolute {
  position: absolute;
}

.relative {
  position: relative;
}

.overflow-x-auto {
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  height: 100%;
  -webkit-overflow-scrolling: touch;
  width: 100%;
}

.image-container {
  position: relative;
  height: 100%;
  min-width: 100%;
  display: flex;
}

.centered-image,
picture img {
  max-width: none !important;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform;
  flex-shrink: 0;
}

picture {
  height: 100%;
  display: block;
  flex-shrink: 0;
}
```

3. 引入 ImageLayoutManager 腳本：
```html
<script src="path/to/image-layout.js"></script>
```

## 使用方式

### 單一圖片模式（指定最小高度）

```html
<section id="section1" class="image-layout-section">
  <div class="position-relative">
    <div class="overflow-x-auto" 
         data-mobile-min-height="100vh"
         data-desktop-min-height="800px">
      <div class="image-container">
        <img src="image.jpg"
             class="centered-image"
             data-width="1920"
             data-height="1080"
             data-target-position="960"
             loading="lazy"
             decoding="async">
      </div>
    </div>
  </div>
</section>
```

### 響應式圖片模式（使用 picture 元素）

```html
<section id="section2" class="image-layout-section">
  <div class="position-relative">
    <div class="overflow-x-auto" 
         data-mobile-min-height="100vh"
         data-desktop-min-height="800px">
      <div class="image-container">
        <picture>
          <!-- 桌面版圖片 -->
          <source srcset="desktop.jpg"
                  media="(min-width: 768px)"
                  data-width="1920"
                  data-height="1080"
                  data-target-position="960">
          <!-- 手機版圖片 -->
          <img src="mobile.jpg"
               data-width="750"
               data-height="1334"
               data-target-position="375"
               loading="lazy"
               decoding="async">
        </picture>
      </div>
    </div>
  </div>
</section>
```

### 初始化

```javascript
const imageLayout = new ImageLayoutManager({
  // 可選配置
  mobileBreakpoint: 768,
  defaultMobileMinHeight: '300px',
  defaultDesktopMinHeight: '600px' // 選擇性設定
});

imageLayout.initializeAll();
```

## 配置選項

```javascript
{
  // 是否啟用延遲載入
  lazyLoad: true,
  
  // 視窗調整去抖動時間（毫秒）
  resizeDebounceTime: 150,
  
  // 移動版斷點（像素）
  mobileBreakpoint: 768,
  
  // 移動版預設最小高度
  defaultMobileMinHeight: '300px',
  
  // 桌機版預設最小高度（可選）
  defaultDesktopMinHeight: null,
  
  // DOM 選擇器
  selectors: {
    section: '.image-layout-section',
    container: '.overflow-x-auto',
    imageContainer: '.image-container',
    image: '.centered-image',
    picture: 'picture'
  },
  
  // 資料屬性名稱
  attributes: {
    width: 'data-width',
    height: 'data-height',
    targetPosition: 'data-target-position',
    mobileMinHeight: 'data-mobile-min-height',
    desktopMinHeight: 'data-desktop-min-height'
  }
}
```

## 運作原理

### 桌機版（>= 768px）：
1. 檢查是否有設定 `data-desktop-min-height`
2. 如果有設定最小高度：
   - 以最小高度為基準計算寬度
   - 如果計算出的寬度小於視窗寬度，則以視窗寬度重新計算
3. 如果沒有設定最小高度：
   - 使用視窗寬度作為基準
   - 根據圖片原始比例計算高度
4. Picture 元素時優先使用 source 的尺寸

### 移動版（< 768px）：
1. 使用 `data-mobile-min-height` 作為基準高度
2. 根據圖片比例計算對應寬度
3. 啟用水平滾動
4. Picture 元素時使用 img 的尺寸

## 高度單位支援

支援所有 CSS 高度單位，包括但不限於：
- 像素（px）
- 視窗高度（vh）
- 視窗寬度（vw）
- 根元素字體大小（rem）
- 當前元素字體大小（em）
- 百分比（%）

## 瀏覽器支援

- 現代瀏覽器（Chrome、Firefox、Safari、Edge）
- IE11（基本功能）

## 版本記錄

### v1.4.0
- 新增桌機版最小高度設定功能
- 優化桌機版圖片尺寸計算邏輯
- 修正多項效能問題

### v1.3.0
- 修正桌機版圖片比例計算
- 優化 picture 元素處理
- 精確化比例計算（6位小數）
- 統一桌機版寬度計算邏輯

### v1.2.0
- 支援所有 CSS 高度單位
- 改進移動版處理
- 優化效能

### v1.1.0
- 新增 picture 元素支援
- 改進效能
- 修復已知問題

### v1.0.0
- 初始版本發布

## 授權

MIT License

## 支援與回饋

如有問題或建議，請提交 Issue 或 Pull Request。