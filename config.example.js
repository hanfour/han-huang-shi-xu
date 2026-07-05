/**
 * 網站配置檔案範例
 *
 * 使用方式：
 * 1. 複製此檔案並重新命名為 config.js
 * 2. 在 config.js 中填入你的實際配置資訊
 * 3. config.js 已被加入 .gitignore，不會被上傳到版本控制
 */

const CONFIG = {
  // 表單提交服務 (預設 hfms;若切回 google 則使用 GOOGLE_SCRIPT_URL)
  FORM_PROVIDER: 'hfms',

  // miilink HFMS 表單服務
  // Endpoint 範例：'https://miilink.net/api/hfms/submit/<projectId>'
  HFMS_ENDPOINT: 'YOUR_HFMS_ENDPOINT_HERE',
  // API Key (pk_live_...)
  HFMS_API_KEY: 'YOUR_HFMS_API_KEY_HERE',

  // Google Apps Script Web App URL (備援;FORM_PROVIDER = 'google' 時使用)
  GOOGLE_SCRIPT_URL: '',

  // Google Analytics ID (選用)
  GOOGLE_ANALYTICS_ID: '',

  // Facebook Pixel ID (選用)
  FACEBOOK_PIXEL_ID: '',
};
