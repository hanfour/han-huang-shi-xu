#!/usr/bin/env node

/**
 * Config.js 生成腳本（用於 Vercel 建置）
 *
 * 此腳本會在 Vercel 建置時執行，從環境變數生成 config.js
 * 這樣就不需要將 config.js 提交到 Git
 */

const fs = require('fs');
const path = require('path');

console.log('📝 開始生成 config.js...');

const clean = (v) => (v || '').replace(/\r?\n/g, '').trim();

// 讀取環境變數
const FORM_PROVIDER = clean(process.env.FORM_PROVIDER) || 'hfms';
const HFMS_ENDPOINT = clean(process.env.HFMS_ENDPOINT);
const HFMS_API_KEY = clean(process.env.HFMS_API_KEY);
const GOOGLE_SCRIPT_URL = clean(process.env.GOOGLE_SCRIPT_URL || process.env.VITE_GOOGLE_SCRIPT_URL);
const GOOGLE_ANALYTICS_ID = clean(process.env.GOOGLE_ANALYTICS_ID);
const FACEBOOK_PIXEL_ID = clean(process.env.FACEBOOK_PIXEL_ID);

console.log('環境變數狀態:');
console.log('  FORM_PROVIDER:', FORM_PROVIDER);
console.log('  HFMS_ENDPOINT:', HFMS_ENDPOINT ? '✓ 已設定' : '✗ 未設定');
console.log('  HFMS_API_KEY:', HFMS_API_KEY ? '✓ 已設定' : '✗ 未設定');
console.log('  GOOGLE_SCRIPT_URL:', GOOGLE_SCRIPT_URL ? '✓ 已設定' : '- 未設定');
console.log('  GOOGLE_ANALYTICS_ID:', GOOGLE_ANALYTICS_ID ? '✓ 已設定' : '- 未設定（選用）');
console.log('  FACEBOOK_PIXEL_ID:', FACEBOOK_PIXEL_ID ? '✓ 已設定' : '- 未設定（選用）');

const configContent = `/**
 * 網站配置檔案
 * 此檔案由 generate-config.js 在 Vercel 建置時自動產生
 * 請勿手動修改此檔案
 */

const CONFIG = {
  // 表單服務 provider: 'hfms' | 'google'
  FORM_PROVIDER: '${FORM_PROVIDER}',

  // miilink HFMS
  HFMS_ENDPOINT: '${HFMS_ENDPOINT}',
  HFMS_API_KEY: '${HFMS_API_KEY}',

  // Google Apps Script Web App URL (備援)
  GOOGLE_SCRIPT_URL: '${GOOGLE_SCRIPT_URL}',

  // Google Analytics ID (選用)
  GOOGLE_ANALYTICS_ID: '${GOOGLE_ANALYTICS_ID}',

  // Facebook Pixel ID (選用)
  FACEBOOK_PIXEL_ID: '${FACEBOOK_PIXEL_ID}',
};

if (typeof Object.freeze === 'function') {
  Object.freeze(CONFIG);
}
`;

const CONFIG_FILE = path.join(__dirname, 'config.js');
fs.writeFileSync(CONFIG_FILE, configContent, 'utf8');

console.log('✓ config.js 已生成');
console.log('');

// 驗證
const errors = [];
if (FORM_PROVIDER === 'hfms') {
  if (!HFMS_ENDPOINT) errors.push('HFMS_ENDPOINT 未設定');
  if (!HFMS_API_KEY) errors.push('HFMS_API_KEY 未設定');
} else if (FORM_PROVIDER === 'google') {
  if (!GOOGLE_SCRIPT_URL) errors.push('GOOGLE_SCRIPT_URL 未設定');
} else {
  errors.push(`未知的 FORM_PROVIDER: ${FORM_PROVIDER} (需為 'hfms' 或 'google')`);
}

if (errors.length > 0) {
  console.error('❌ 環境變數缺少:');
  errors.forEach((e) => console.error('  - ' + e));
  console.error('');
  console.error('請在 Vercel Dashboard 設定環境變數：');
  console.error('  Production 至少需要:');
  console.error('    FORM_PROVIDER=hfms');
  console.error('    HFMS_ENDPOINT=https://miilink.net/api/hfms/submit/<projectId>');
  console.error('    HFMS_API_KEY=pk_live_xxxxxxxx');
  console.error('');
  process.exit(1);
}

console.log('✓ 驗證通過');
console.log('🎉 建置成功！');
