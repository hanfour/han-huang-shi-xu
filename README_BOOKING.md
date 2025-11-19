# 漢皇蒔序 - 預約表單系統

## 📁 檔案說明

### 核心檔案
- **index.html** - 主要網頁，包含預約表單和 SendBooking 函數
- **config.js** - 🔒 配置檔案（包含敏感資訊，已加入 .gitignore）
- **config.example.js** - 配置範例檔案（可安全上傳到 Git）
- **google-apps-script.js** - Google Apps Script 腳本（需部署到 Google Sheets）

### 文件
- **BOOKING_SETUP_GUIDE.md** - 完整的設定指南
- **README_BOOKING.md** - 本檔案，快速參考

### 版本控制
- **.gitignore** - Git 忽略清單（確保 config.js 不會被上傳）

---

## 🚀 快速開始

### 首次設定（約 10 分鐘）

1. **設定 Google Apps Script**
   - 建立 Google Sheets
   - 複製 `google-apps-script.js` 到 Apps Script 編輯器
   - 修改收件者信箱
   - 部署為 Web App

2. **設定本地配置**
   - 開啟 `config.js`
   - 填入 Google Apps Script URL

3. **上傳到伺服器**
   - 確認 `.gitignore` 已設定
   - 上傳檔案（config.js 不會被包含在 Git 中）

詳細步驟請參考：[BOOKING_SETUP_GUIDE.md](BOOKING_SETUP_GUIDE.md)

---

## 🔒 安全性重點

### ⚠️ 重要提醒

```
絕對不要將 config.js 上傳到 Git 或公開平台！
```

### 檔案上傳檢查清單

✅ **可以上傳的檔案**
- index.html
- config.example.js
- google-apps-script.js
- BOOKING_SETUP_GUIDE.md
- README_BOOKING.md
- .gitignore

❌ **不可上傳的檔案**
- config.js（包含真實的 Google Apps Script URL）

### 驗證 .gitignore 是否生效

```bash
# 在終端機執行
git status

# 確認輸出中沒有 config.js
# 如果看到 config.js，表示 .gitignore 沒有正確設定
```

---

## 📝 日常維護

### 查看預約記錄
直接開啟你的 Google Sheets 試算表

### 匯出資料
在 Google Sheets 中：檔案 → 下載 → Excel / CSV

### 修改郵件內容
編輯 `google-apps-script.js` 中的 `sendNotificationEmail` 函數

### 更新 URL（如需要）
1. 在 Google Apps Script 建立新部署
2. 更新 `config.js` 中的 URL
3. 停用舊的部署

---

## 🐛 問題排查

### 表單無法送出
1. 開啟瀏覽器開發者工具 (F12)
2. 查看 Console 分頁的錯誤訊息
3. 確認 `config.js` 已正確載入

### 沒有收到郵件
1. 檢查垃圾郵件資料夾
2. 確認 Google Apps Script 中的信箱設定
3. 查看 Apps Script 執行記錄

### Google Sheets 沒有記錄
1. 檢查 Apps Script 執行記錄
2. 確認有試算表編輯權限
3. 嘗試執行測試函數 `testSubmission`

---

## 📞 聯絡資訊

如需技術支援，請提供：
1. 錯誤訊息截圖
2. 瀏覽器 Console 的錯誤內容
3. Google Apps Script 執行記錄

---

## 📄 授權

此預約表單系統為漢皇蒔序專案專用。

最後更新：2025-01-19
