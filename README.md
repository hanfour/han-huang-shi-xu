# 漢皇蒔序 預約表單系統

一個整合 Google Sheets 和自動郵件通知的預約表單系統，支援 Vercel 一鍵部署。

---

## ✨ 功能特色

- 📝 **線上預約表單**：姓名、電話、地址等資訊收集
- 📊 **Google Sheets 整合**：自動記錄所有預約資料
- 📧 **自動郵件通知**：預約成功後立即發送通知到指定信箱
- 🔒 **安全性**：敏感資訊不會出現在程式碼中
- 🚀 **Vercel 部署**：支援一鍵部署，自動從環境變數讀取設定
- 📱 **響應式設計**：支援手機、平板、桌面裝置

---

## 📚 文件導覽

### 快速開始
- **[Vercel 快速部署](VERCEL_QUICK_START.md)** - 5 分鐘完成部署（推薦）
- **[Google Apps Script 設定](BOOKING_SETUP_GUIDE.md)** - 完整的表單設定指南

### 進階文件
- **[Vercel 完整部署指南](VERCEL_DEPLOYMENT_GUIDE.md)** - 深入了解 Vercel 部署選項
- **[安全性檢查清單](SECURITY_CHECKLIST.md)** - 確保設定安全無虞
- **[預約系統說明](README_BOOKING.md)** - 日常維護和問題排查

---

## 🚀 快速開始（3 步驟）

### 1️⃣ 設定 Google Apps Script

```bash
# 1. 建立 Google Sheets
# 2. 開啟 Apps Script 編輯器
# 3. 複製 google-apps-script.js 的內容
# 4. 修改收件者信箱
# 5. 部署為 Web App
# 6. 複製 Web App URL
```

詳細步驟：[BOOKING_SETUP_GUIDE.md](BOOKING_SETUP_GUIDE.md)

### 2️⃣ 部署到 Vercel

```bash
# 推送到 GitHub
git init
git add .
git commit -m "Initial commit"
git push

# 在 Vercel 導入專案
# 設定環境變數：GOOGLE_SCRIPT_URL
# 點擊 Deploy
```

詳細步驟：[VERCEL_QUICK_START.md](VERCEL_QUICK_START.md)

### 3️⃣ 測試表單

開啟部署的網站，填寫表單，確認：
- ✅ 資料寫入 Google Sheets
- ✅ 收到郵件通知

---

## 📁 專案結構

```
web_v0.0.08/
├── 📄 核心檔案
│   ├── index.html                 # 主要網頁（包含表單和 JS）
│   ├── config.js                  # 配置檔案（本地使用，不上傳 Git）
│   ├── config.example.js          # 配置範例
│   └── google-apps-script.js      # Google Apps Script 腳本
│
├── 🔧 Vercel 部署
│   ├── vercel.json               # Vercel 設定檔
│   ├── generate-config.js        # 建置時生成 config.js
│   └── .gitignore                # Git 忽略清單
│
└── 📚 文件
    ├── README.md                  # 本檔案
    ├── VERCEL_QUICK_START.md     # 快速部署指南
    ├── VERCEL_DEPLOYMENT_GUIDE.md # 完整 Vercel 指南
    ├── BOOKING_SETUP_GUIDE.md    # Google Apps Script 設定
    ├── SECURITY_CHECKLIST.md     # 安全檢查清單
    └── README_BOOKING.md         # 預約系統說明
```

---

## 🔒 安全性設計

### 本地開發
- 使用 `config.js` 存放 Google Apps Script URL
- `config.js` 已加入 `.gitignore`，不會上傳到 Git

### Vercel 部署
- URL 存放在 Vercel 環境變數中
- 建置時自動生成 `config.js`
- 不會出現在 Git 歷史記錄中

### 多層防護
```
優先級 1: window.__ENV__ (Vercel 注入)
    ↓ 若無
優先級 2: CONFIG (config.js)
    ↓ 若無
優先級 3: window.GOOGLE_SCRIPT_URL (備用)
```

---

## 🛠 技術棧

- **前端**：HTML, JavaScript (Vanilla)
- **樣式**：Tailwind CSS
- **後端**：Google Apps Script
- **資料庫**：Google Sheets
- **郵件**：Gmail (透過 Apps Script)
- **部署**：Vercel
- **版本控制**：Git

---

## 📊 工作流程

```
使用者填寫表單
    ↓
JavaScript 驗證
    ↓
送出到 Google Apps Script
    ↓
┌──────────────────────┐
│  Apps Script 處理     │
│  1. 寫入 Sheets      │
│  2. 發送郵件         │
└──────────────────────┘
    ↓
顯示成功訊息
```

---

## 🌐 部署選項

### 選項 1：Vercel（推薦）
- ✅ 免費方案
- ✅ 自動 HTTPS
- ✅ 全球 CDN
- ✅ 環境變數管理
- ✅ 自動部署

**開始：** [VERCEL_QUICK_START.md](VERCEL_QUICK_START.md)

### 選項 2：傳統主機
- 上傳所有檔案（包含 config.js）
- 手動設定 HTTPS

**開始：** [BOOKING_SETUP_GUIDE.md](BOOKING_SETUP_GUIDE.md)

---

## 🔧 環境變數

### 必要變數
- `GOOGLE_SCRIPT_URL` - Google Apps Script Web App URL

### 選用變數
- `GOOGLE_ANALYTICS_ID` - Google Analytics 追蹤 ID
- `FACEBOOK_PIXEL_ID` - Facebook Pixel ID

---

## 📝 維護

### 查看預約記錄
直接開啟 Google Sheets

### 匯出資料
Google Sheets → 檔案 → 下載 → Excel/CSV

### 修改郵件內容
編輯 `google-apps-script.js` 中的 `sendNotificationEmail` 函數

### 更新 URL
1. Vercel：Dashboard → Environment Variables
2. 本地：修改 `config.js`

---

## 🐛 問題排查

### 表單無法送出
1. F12 開啟 Console 查看錯誤
2. 確認 `config.js` 或環境變數已設定
3. 檢查 Google Apps Script URL 是否正確

### 沒有收到郵件
1. 檢查垃圾郵件
2. 確認 Apps Script 中的信箱設定
3. 查看 Apps Script 執行記錄

### Google Sheets 沒有資料
1. 檢查 Apps Script 執行記錄
2. 確認有試算表編輯權限
3. 執行測試函數 `testSubmission`

詳細排查：[README_BOOKING.md](README_BOOKING.md)

---

## ✅ 上線前檢查清單

- [ ] Google Apps Script 已部署並測試
- [ ] config.js 在 .gitignore 中
- [ ] Vercel 環境變數已設定
- [ ] 測試表單送出功能
- [ ] 確認 Sheets 有記錄資料
- [ ] 確認收到郵件通知
- [ ] 檢查 Console 無錯誤

---

## 📞 聯絡資訊

### 技術支援
如遇到問題，請提供：
1. 錯誤訊息截圖
2. Console 錯誤內容
3. Apps Script 執行記錄

### 參考資源
- [Google Apps Script 文件](https://developers.google.com/apps-script)
- [Vercel 文件](https://vercel.com/docs)

---

## 📄 授權

此專案為漢皇蒔序專案專用。

---

## 🎉 開始使用

1. **新手**：直接閱讀 [VERCEL_QUICK_START.md](VERCEL_QUICK_START.md)
2. **有經驗**：參考 [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)
3. **需要設定 Google**：查看 [BOOKING_SETUP_GUIDE.md](BOOKING_SETUP_GUIDE.md)

**祝部署順利！** 🚀

---

最後更新：2025-01-19
版本：v1.0
