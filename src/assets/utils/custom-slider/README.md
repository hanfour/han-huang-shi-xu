# CustomSlider - 自定義輪播組件

一個輕量級的 JavaScript 輪播組件，專為顯示完整當前圖片 + 右側部分預覽下一張圖片的場景設計。

## 特點

- ✅ 完整顯示當前圖片，右側顯示下一張預覽
- ✅ 無限循環播放
- ✅ 自動播放（可選）
- ✅ 響應式設計
- ✅ 滑鼠懸停暫停
- ✅ 前後箭頭導航
- ✅ 零依賴（純 JavaScript）
- ✅ 易於自定義

## 安裝

### 方式 1: 直接引入

```html
<!-- 引入 CSS -->
<link rel="stylesheet" href="path/to/CustomSlider.css">

<!-- 引入 JavaScript -->
<script src="path/to/CustomSlider.js"></script>
```

### 方式 2: ES6 模块

```javascript
import CustomSlider from './CustomSlider.js';
```

### 方式 3: CommonJS

```javascript
const CustomSlider = require('./CustomSlider.js');
```

## 基本使用

### HTML 結構

```html
<div class="my-slider custom-slider">
  <div class="slide">
    <img src="image1.jpg" alt="圖片 1">
  </div>
  <div class="slide">
    <img src="image2.jpg" alt="圖片 2">
  </div>
  <div class="slide">
    <img src="image3.jpg" alt="圖片 3">
  </div>
</div>
```

### JavaScript 初始化

```javascript
// 基本使用
const slider = new CustomSlider('.my-slider');

// 帶配置選項
const slider = new CustomSlider('.my-slider', {
  autoplay: true,
  autoplaySpeed: 5000,
  speed: 800,
  slideWidth: 75,
  gap: 16
});
```

## 配置選項

| 選項 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `autoplay` | Boolean | `true` | 是否自動播放 |
| `autoplaySpeed` | Number | `5000` | 自動播放間隔（毫秒） |
| `speed` | Number | `800` | 切換動畫速度（毫秒） |
| `slideWidth` | Number | `75` | 每張 slide 佔據的寬度百分比 |
| `gap` | Number | `16` | slide 之間的間距（像素） |
| `arrows` | Boolean | `true` | 是否顯示箭頭 |
| `prevArrowClass` | String | `'slick-prev carousel-arrow carousel-arrow-prev'` | 上一張箭頭的 CSS 類別 |
| `nextArrowClass` | String | `'slick-next carousel-arrow carousel-arrow-next'` | 下一張箭頭的 CSS 類別 |
| `onSlideChange` | Function | `null` | slide 切換時的回調函數 |

## API 方法

### `next()`
切換到下一張 slide。

```javascript
slider.next();
```

### `prev()`
切換到上一張 slide。

```javascript
slider.prev();
```

### `startAutoplay()`
開始自動播放。

```javascript
slider.startAutoplay();
```

### `stopAutoplay()`
停止自動播放。

```javascript
slider.stopAutoplay();
```

### `getCurrentIndex()`
獲取當前 slide 的索引（不包含克隆的索引）。

```javascript
const currentIndex = slider.getCurrentIndex();
console.log('當前 slide 索引:', currentIndex);
```

### `destroy()`
銷毀 slider 並清理資源。

```javascript
slider.destroy();
```

## 回調函數

### onSlideChange

當 slide 切換時觸發。

```javascript
const slider = new CustomSlider('.my-slider', {
  onSlideChange: function(index, slideElement) {
    console.log('切換到第', index + 1, '張 slide');
    console.log('slide 元素:', slideElement);
  }
});
```

## 進階使用

### 自定義箭頭樣式

```javascript
const slider = new CustomSlider('.my-slider', {
  prevArrowClass: 'my-custom-prev-arrow',
  nextArrowClass: 'my-custom-next-arrow'
});
```

然後在 CSS 中定義你的箭頭樣式：

```css
.my-custom-prev-arrow,
.my-custom-next-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  /* 你的自定義樣式 */
}
```

### 控制 slide 寬度和間距

```javascript
// 顯示更多的下一張預覽
const slider = new CustomSlider('.my-slider', {
  slideWidth: 70,  // 當前圖片佔 70%
  gap: 20          // 間距 20px
});

// 只顯示少量預覽
const slider = new CustomSlider('.my-slider', {
  slideWidth: 85,  // 當前圖片佔 85%
  gap: 10          // 間距 10px
});
```

### 手動控制

```javascript
const slider = new CustomSlider('.my-slider', {
  autoplay: false  // 關閉自動播放
});

// 使用按鈕控制
document.querySelector('.my-next-btn').addEventListener('click', () => {
  slider.next();
});

document.querySelector('.my-prev-btn').addEventListener('click', () => {
  slider.prev();
});
```

## 樣式自定義

你可以通過 CSS 自定義組件的外觀：

```css
/* 自定義容器 */
.my-slider {
  border-radius: 8px;
  overflow: hidden;
}

/* 自定義箭頭顏色 */
.my-slider .carousel-arrow:hover::before {
  background-color: #ff6b6b;
}

/* 自定義 slide */
.my-slider .slide {
  /* 你的樣式 */
}
```

## 注意事項

1. **容器必須有確定的寬度**：確保 slider 容器有明確的寬度（使用 `width: 100%` 或固定寬度）。

2. **slide 內容**：每個 slide 的內容應該是完整的，不要依賴外部的絕對定位。

3. **圖說定位**：如果 slide 內有絕對定位的元素（如圖說文字），建議使用 `margin` 而非 `padding` 來避免定位問題。

4. **銷毀實例**：如果需要動態移除 slider，記得調用 `destroy()` 方法清理資源。

## 瀏覽器支持

- Chrome（最新版本）
- Firefox（最新版本）
- Safari（最新版本）
- Edge（最新版本）
- IE11+（需要 polyfill）

對於舊版瀏覽器，可能需要以下 polyfills：
- `Array.from()`
- `Element.classList`

## 完整範例

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CustomSlider Demo</title>
  <link rel="stylesheet" href="CustomSlider.css">
  <style>
    .my-slider {
      max-width: 1200px;
      margin: 50px auto;
    }
    .slide img {
      width: 100%;
      height: auto;
      display: block;
    }
  </style>
</head>
<body>
  <div class="my-slider custom-slider">
    <div class="slide">
      <img src="image1.jpg" alt="圖片 1">
    </div>
    <div class="slide">
      <img src="image2.jpg" alt="圖片 2">
    </div>
    <div class="slide">
      <img src="image3.jpg" alt="圖片 3">
    </div>
  </div>

  <script src="CustomSlider.js"></script>
  <script>
    const slider = new CustomSlider('.my-slider', {
      autoplay: true,
      autoplaySpeed: 5000,
      speed: 800,
      onSlideChange: function(index, slide) {
        console.log('切換到:', index);
      }
    });
  </script>
</body>
</html>
```

## License

MIT License

## 作者

Han Huang

## 版本歷史

- **1.0.0** (2025-01-07) - 初始版本
  - 基本輪播功能
  - 無限循環
  - 自動播放
  - 箭頭導航
