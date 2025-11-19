# 🔒 安全性檢查清單

在上傳檔案到伺服器或 Git 之前，請確認以下事項：

## ✅ 上傳前檢查

### 1. 檢查 .gitignore 設定
```bash
cat .gitignore | grep config.js
```
✅ 應該要看到 `config.js` 這一行

### 2. 驗證 Git 狀態
```bash
git status
```
✅ 確認輸出中**沒有** `config.js`
❌ 如果看到 `config.js`，請立即停止並檢查 .gitignore

### 3. 檢查 config.js 內容
```bash
grep "GOOGLE_SCRIPT_URL" config.js
```
✅ 確認包含真實的 Google Apps Script URL
❌ 如果是 `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE`，表示尚未設定

### 4. 檢查 config.example.js 內容
```bash
grep "GOOGLE_SCRIPT_URL" config.example.js
```
✅ 應該是 `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE`（範例值）
❌ 如果包含真實 URL，請立即修改

---

## 📁 檔案上傳分類

### ✅ 可安全上傳到 Git/公開平台
- ✅ index.html
- ✅ config.example.js
- ✅ google-apps-script.js
- ✅ BOOKING_SETUP_GUIDE.md
- ✅ README_BOOKING.md
- ✅ SECURITY_CHECKLIST.md
- ✅ .gitignore

### ❌ 絕對不可上傳到 Git/公開平台
- ❌ **config.js** （包含敏感的 Google Apps Script URL）

### ⚠️ 僅上傳到生產伺服器（不上傳到 Git）
- ⚠️ config.js（透過 FTP 或其他方式直接上傳到伺服器）

---

## 🚨 如果不小心上傳了 config.js 到 Git

### 立即處理步驟

1. **從 Git 移除檔案**
   ```bash
   git rm --cached config.js
   git commit -m "Remove sensitive config file"
   git push
   ```

2. **從 Git 歷史中完全移除（進階）**
   ```bash
   # 警告：這會改寫 Git 歷史
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch config.js" \
     --prune-empty --tag-name-filter cat -- --all

   git push origin --force --all
   ```

3. **更新 Google Apps Script URL**
   - 因為舊的 URL 已經曝光，建議建立新的部署
   - 在 Apps Script 中停用或刪除舊的部署
   - 將新的 URL 更新到 config.js

---

## 🎯 部署到生產伺服器的步驟

### 方法 1：手動上傳（推薦）

1. **準備檔案**
   - 確認 config.js 已正確設定
   - 確認所有其他檔案都是最新的

2. **上傳檔案**
   - 透過 FTP/SFTP 上傳所有檔案
   - **包含** config.js（因為生產環境需要）

3. **驗證**
   - 開啟網站測試表單功能
   - 確認資料有寫入 Google Sheets
   - 確認有收到郵件

### 方法 2：使用 Git + 手動配置

1. **Git 部署**
   ```bash
   git push origin main
   ```

2. **在伺服器上手動建立 config.js**
   ```bash
   # SSH 連線到伺服器
   ssh user@yourserver.com

   # 複製範例檔案
   cd /path/to/website
   cp config.example.js config.js

   # 編輯 config.js 填入真實 URL
   nano config.js
   ```

---

## 📊 檔案結構圖

```
web_v0.0.08/
├── index.html                    ✅ 上傳 Git
├── config.js                     ❌ 不上傳 Git（僅伺服器）
├── config.example.js             ✅ 上傳 Git
├── google-apps-script.js         ✅ 上傳 Git
├── BOOKING_SETUP_GUIDE.md        ✅ 上傳 Git
├── README_BOOKING.md             ✅ 上傳 Git
├── SECURITY_CHECKLIST.md         ✅ 上傳 Git
└── .gitignore                    ✅ 上傳 Git
    └── 包含：config.js
```

---

## 🔍 定期檢查

### 每月檢查清單

- [ ] 檢查 Google Sheets 是否有異常大量的資料
- [ ] 檢查郵件是否正常寄送
- [ ] 確認 config.js 沒有在 Git 追蹤中
- [ ] 備份 Google Sheets 資料

### 每季檢查清單

- [ ] 考慮更新 Google Apps Script 部署版本
- [ ] 檢視並清理舊的 Sheets 資料
- [ ] 確認所有團隊成員都有正確的 config.js 設定

---

## 💡 最佳實踐

1. **環境分離**
   - 開發環境使用測試用的 Google Sheets
   - 正式環境使用正式的 Google Sheets
   - 兩者使用不同的 Apps Script URL

2. **團隊協作**
   - 新成員加入時，提供 config.example.js
   - 讓他們自行建立 config.js
   - 不要透過郵件或聊天軟體分享 config.js

3. **備份策略**
   - 定期備份 Google Sheets
   - 保存 Apps Script 的程式碼副本
   - 記錄重要的配置資訊（不含 URL）

---

## ✅ 最終檢查清單

上傳前請確認：

- [ ] config.js 包含真實的 Google Apps Script URL
- [ ] config.example.js 只包含範例值
- [ ] .gitignore 包含 config.js
- [ ] git status 沒有顯示 config.js
- [ ] 測試表單功能正常運作
- [ ] 已收到測試郵件

全部打勾後，即可安全上傳！🎉

---

最後更新：2025-01-19
