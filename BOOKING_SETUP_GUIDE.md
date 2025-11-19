# 漢皇蒔序 - 預約表單串接 Google Sheets 設定指南

本指南將協助你完成預約表單與 Google Sheets 的串接，並設定自動發送郵件功能。

---

## 📋 目錄

1. [建立 Google Sheets](#1-建立-google-sheets)
2. [設定 Google Apps Script](#2-設定-google-apps-script)
3. [部署 Web App](#3-部署-web-app)
4. [更新網站設定](#4-更新網站設定)
5. [測試功能](#5-測試功能)
6. [常見問題](#6-常見問題)

---

## 1. 建立 Google Sheets

### 步驟 1.1：建立新的 Google Sheets
1. 前往 [Google Sheets](https://sheets.google.com)
2. 點擊「空白」建立新的試算表
3. 將試算表命名為「漢皇蒔序預約記錄」（或你喜歡的名稱）

### 步驟 1.2：記錄試算表 ID
- 從網址列複製試算表 ID（在 `/d/` 和 `/edit` 之間的部分）
- 範例：`https://docs.google.com/spreadsheets/d/【這裡是試算表ID】/edit`

---

## 2. 設定 Google Apps Script

### 步驟 2.1：開啟 Apps Script 編輯器
1. 在 Google Sheets 中，點擊「擴充功能」→「Apps Script」
2. 會開啟一個新的 Apps Script 編輯器分頁

### 步驟 2.2：貼上腳本代碼
1. 刪除預設的 `function myFunction() {}` 代碼
2. 開啟專案中的 `google-apps-script.js` 檔案
3. 複製所有內容並貼到 Apps Script 編輯器中

### 步驟 2.3：設定收件者信箱
在 Apps Script 編輯器中，找到 `CONFIG` 物件（約在第 13 行）：

```javascript
const CONFIG = {
  // 修改這裡：填入你的收件者信箱
  EMAIL_RECIPIENTS: 'your-email@example.com',

  // 如果要發送到多個信箱，用逗號分隔：
  // EMAIL_RECIPIENTS: 'email1@example.com, email2@example.com',

  // 你也可以修改郵件主旨
  EMAIL_SUBJECT: '【漢皇蒔序】新的預約賞屋通知',

  SHEET_NAME: '預約記錄',
  TIMEZONE: 'Asia/Taipei'
};
```

### 步驟 2.4：儲存專案
1. 點擊「檔案」→「儲存」（或按 Ctrl+S / Cmd+S）
2. 將專案命名為「漢皇蒔序預約系統」

---

## 3. 部署 Web App

### 步驟 3.1：建立部署
1. 在 Apps Script 編輯器中，點擊右上角的「部署」→「新增部署作業」
2. 點擊「選取類型」旁的齒輪圖示，選擇「網頁應用程式」

### 步驟 3.2：設定部署選項
填入以下設定：
- **說明**：`v1.0 - 初始版本`
- **執行身分**：`我`
- **具有存取權的使用者**：`所有人`（重要！）

### 步驟 3.3：授權應用程式
1. 點擊「部署」
2. 系統會要求你授權，點擊「授權存取權」
3. 選擇你的 Google 帳號
4. 會出現警告訊息「Google 尚未驗證這個應用程式」
   - 點擊「進階」
   - 點擊「前往 [專案名稱] (不安全)」
   - 點擊「允許」

### 步驟 3.4：複製 Web App URL
1. 授權完成後，會顯示「網頁應用程式 URL」
2. **複製這個 URL**（非常重要！看起來像這樣）：
   ```
   https://script.google.com/macros/s/AKfycbz.../exec
   ```
3. 點擊「完成」

---

## 4. 更新網站設定

### 步驟 4.1：設定 config.js
1. 開啟專案中的 `config.js` 檔案
2. 找到 `GOOGLE_SCRIPT_URL` 這一行
3. 將 `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` 替換為剛才複製的 Web App URL：

```javascript
const CONFIG = {
  // 修改這裡：
  GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbz.../exec',

  GOOGLE_ANALYTICS_ID: '',
  FACEBOOK_PIXEL_ID: '',
};
```

### 步驟 4.2：確認 .gitignore 設定
**重要安全提醒：** `config.js` 包含敏感的 API URL，不應上傳到 Git 或公開。

1. 確認專案中有 `.gitignore` 檔案
2. 確認 `.gitignore` 中包含 `config.js` 這一行
3. 如果使用 Git 版本控制：
   ```bash
   # 確認 config.js 不會被追蹤
   git status
   # 應該看不到 config.js 在待提交列表中
   ```

### 步驟 4.3：config.example.js 的用途
- `config.example.js` 是範例檔案，可以安全地上傳到 Git
- 其他開發者可以複製此檔案為 `config.js` 並填入自己的設定
- 保持 `config.example.js` 不包含真實的敏感資訊

### 步驟 4.4：儲存變更
儲存 `config.js` 檔案

---

## 5. 測試功能

### 測試方式 A：直接在 Apps Script 中測試

1. 在 Apps Script 編輯器中，從上方函數選單選擇 `testSubmission`
2. 點擊「執行」按鈕
3. 檢查：
   - Google Sheets 是否新增了一筆測試資料
   - 你的信箱是否收到測試郵件

### 測試方式 B：從網站測試

1. 上傳 `index.html` 到你的網站伺服器
2. 開啟網站，填寫預約表單並送出
3. 檢查：
   - 是否顯示「感謝您的預約！我們會儘快與您聯繫。」
   - Google Sheets 是否記錄了這筆資料
   - 你的信箱是否收到通知郵件

### 除錯技巧

如果測試失敗，請檢查：

1. **檢查 Apps Script 執行記錄**
   - 在 Apps Script 編輯器中，點擊左側的「執行作業」圖示
   - 查看是否有錯誤訊息

2. **檢查瀏覽器 Console**
   - 在網站上按 F12 開啟開發者工具
   - 查看 Console 分頁是否有錯誤訊息

3. **確認 URL 正確**
   - 確認 `index.html` 中的 `GOOGLE_SCRIPT_URL` 是完整的 URL
   - URL 必須以 `/exec` 結尾，不是 `/dev`

---

## 6. 常見問題

### Q1: 為什麼我沒有收到郵件？

**檢查項目：**
- 確認 `CONFIG.EMAIL_RECIPIENTS` 的信箱正確
- 檢查垃圾郵件資料夾
- 在 Gmail 中搜尋寄件者：`noreply@google.com`
- 檢查 Apps Script 的執行記錄是否有錯誤

### Q2: 表單送出後沒有反應？

**檢查項目：**
- 開啟瀏覽器的 Console (F12) 查看錯誤訊息
- 確認 `GOOGLE_SCRIPT_URL` 已正確設定
- 確認 Web App 部署時選擇了「所有人」可存取

### Q3: Google Sheets 沒有記錄資料？

**檢查項目：**
- 在 Apps Script 執行記錄中查看錯誤
- 確認你有試算表的編輯權限
- 嘗試手動執行 `testSubmission` 函數

### Q4: 如何修改郵件內容？

編輯 `google-apps-script.js` 中的 `sendNotificationEmail` 函數：
- `emailBody`：純文字郵件內容
- `htmlBody`：HTML 格式郵件內容

修改後需要重新部署：
1. 點擊「部署」→「管理部署作業」
2. 點擊鉛筆圖示編輯部署
3. 將版本改為「新版本」
4. 點擊「部署」

### Q5: 如何新增更多表單欄位？

1. **修改 HTML 表單**：在 `index.html` 中新增表單欄位
2. **修改 SendBooking 函數**：收集新欄位的值
3. **修改 Google Apps Script**：
   - 在 `writeToSheet` 函數中新增欄位到標題列
   - 在 `rowData` 陣列中新增資料
   - 在 `sendNotificationEmail` 函數中顯示新欄位

### Q6: 如何查看所有預約記錄？

直接開啟你的 Google Sheets 試算表，所有記錄都會顯示在「預約記錄」工作表中。

### Q7: 可以匯出資料嗎？

可以！在 Google Sheets 中：
- 點擊「檔案」→「下載」
- 選擇格式：Excel (.xlsx)、CSV、PDF 等

---

## 🎯 完整流程圖

```
使用者填寫表單
    ↓
點擊「送出表單」
    ↓
JavaScript 驗證表單
    ↓
送出資料到 Google Apps Script
    ↓
┌─────────────────────┐
│ Google Apps Script  │
│ 1. 寫入 Sheets      │
│ 2. 發送郵件         │
└─────────────────────┘
    ↓
網站顯示成功訊息
```

---

## 🔒 安全性注意事項

### 為什麼要使用 config.js？

將 Google Apps Script URL 直接寫在 `index.html` 中會有以下風險：

1. **URL 曝光風險**
   - 如果將程式碼上傳到 GitHub 等公開平台，任何人都能看到你的 URL
   - 惡意使用者可能濫用你的 API，發送大量假資料

2. **版本控制問題**
   - 每次修改 URL 都會產生 Git 提交記錄
   - 即使後續刪除，歷史記錄中仍可找到舊的 URL

### 使用獨立配置檔案的好處

✅ **隔離敏感資訊**
- `config.js` 被加入 `.gitignore`，不會被上傳到版本控制
- 可以安全地在本地和伺服器上使用不同的配置

✅ **團隊協作友善**
- 每個開發者可以有自己的 `config.js`
- `config.example.js` 提供配置範本

✅ **環境隔離**
- 開發環境和正式環境可以使用不同的 URL
- 測試時不會影響正式的資料

### 額外的安全措施建議

1. **限制 Google Apps Script 的存取來源**
   - 雖然 Apps Script 預設允許所有人存取，但你可以在腳本中加入來源驗證
   - 例如：檢查 `e.parameter` 中的特定 token

2. **加入簡單的驗證機制**
   在 `google-apps-script.js` 中可以加入：
   ```javascript
   function doPost(e) {
     // 驗證來源（可選）
     const referer = e.parameter.referer;
     if (referer && !referer.includes('yourdomain.com')) {
       return ContentService.createTextOutput('Unauthorized');
     }
     // ... 其他程式碼
   }
   ```

3. **監控 Google Sheets**
   - 定期檢查 Sheets 中的記錄
   - 如發現異常大量的提交，可能需要更新 URL

4. **定期更新部署**
   - 如果懷疑 URL 被洩露，可以建立新的部署版本
   - 舊的部署可以停用或刪除

---

## 📞 需要協助？

如果遇到問題無法解決，請檢查：
1. Google Apps Script 執行記錄
2. 瀏覽器 Console 訊息
3. Google Sheets 權限設定
4. `.gitignore` 是否正確設定

---

## 📝 版本記錄

- **v1.0** (2025-01-19)
  - 初始版本
  - 支援基本預約表單
  - 自動發送郵件通知

---

**祝你設定順利！** 🎉
