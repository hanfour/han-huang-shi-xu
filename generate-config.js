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

// 從環境變數讀取設定（並清除可能的換行符號）
const GOOGLE_SCRIPT_URL = (process.env.GOOGLE_SCRIPT_URL || process.env.VITE_GOOGLE_SCRIPT_URL || '').replace(/\n/g, '').trim();
const GOOGLE_ANALYTICS_ID = (process.env.GOOGLE_ANALYTICS_ID || '').replace(/\n/g, '').trim();
const FACEBOOK_PIXEL_ID = (process.env.FACEBOOK_PIXEL_ID || '').replace(/\n/g, '').trim();

console.log('環境變數狀態:');
console.log('  GOOGLE_SCRIPT_URL:', GOOGLE_SCRIPT_URL ? '✓ 已設定' : '✗ 未設定');
console.log('  GOOGLE_ANALYTICS_ID:', GOOGLE_ANALYTICS_ID ? '✓ 已設定' : '- 未設定（選用）');
console.log('  FACEBOOK_PIXEL_ID:', FACEBOOK_PIXEL_ID ? '✓ 已設定' : '- 未設定（選用）');

// 生成 config.js 內容
const configContent = `/**
 * 網站配置檔案
 * 此檔案由 generate-config.js 在 Vercel 建置時自動產生
 * 請勿手動修改此檔案
 */

const CONFIG = {
  // Google Apps Script Web App URL
  GOOGLE_SCRIPT_URL: '${GOOGLE_SCRIPT_URL}',

  // Google Analytics ID (選用)
  GOOGLE_ANALYTICS_ID: '${GOOGLE_ANALYTICS_ID}',

  // Facebook Pixel ID (選用)
  FACEBOOK_PIXEL_ID: '${FACEBOOK_PIXEL_ID}',
};

// 防止外部修改
if (typeof Object.freeze === 'function') {
  Object.freeze(CONFIG);
}
`;

// 寫入 config.js
const CONFIG_FILE = path.join(__dirname, 'config.js');
fs.writeFileSync(CONFIG_FILE, configContent, 'utf8');

console.log('✓ config.js 已生成');
console.log('');

// 驗證
if (!GOOGLE_SCRIPT_URL) {
  console.error('❌ 錯誤：GOOGLE_SCRIPT_URL 環境變數未設定');
  console.error('');
  console.error('請在 Vercel Dashboard 設定環境變數：');
  console.error('  1. 前往專案設定 → Environment Variables');
  console.error('  2. 新增變數：');
  console.error('     Name: GOOGLE_SCRIPT_URL');
  console.error('     Value: https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec');
  console.error('  3. 選擇所有環境（Production, Preview, Development）');
  console.error('  4. 重新部署');
  console.error('');
  process.exit(1);
} else {
  console.log('✓ 驗證通過');
  console.log('✓ config.js 已正確設定 Google Apps Script URL');
  console.log('');
  console.log('🎉 建置成功！');
}
