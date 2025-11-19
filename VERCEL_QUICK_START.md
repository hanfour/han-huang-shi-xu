# Vercel 快速部署指南

5 分鐘完成部署！

---

## 🚀 方法 1：使用 Vercel Dashboard（最簡單）

### 步驟 1：推送到 Git

```bash
# 確認 .gitignore 包含 config.js
cat .gitignore | grep config.js

# 初始化 Git（如果還沒有）
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub
git remote add origin https://github.com/你的帳號/你的repo.git
git push -u origin main
```

### 步驟 2：連接 Vercel

1. 前往 https://vercel.com/new
2. 選擇你的 Git repository
3. 點擊 "Import"

### 步驟 3：設定環境變數

在 "Configure Project" 頁面：

1. 展開 "Environment Variables"
2. 新增變數：
   ```
   Name:  GOOGLE_SCRIPT_URL
   Value: https://script.google.com/macros/s/你的ID/exec
   ```
3. 確保選擇所有環境：Production ✓ Preview ✓ Development ✓

### 步驟 4：部署

點擊 "Deploy" - 完成！

---

## ⚡ 方法 2：使用 Vercel CLI（進階）

### 步驟 1：安裝 Vercel CLI

```bash
npm install -g vercel
```

### 步驟 2：登入

```bash
vercel login
```

### 步驟 3：設定環境變數

```bash
# 設定環境變數
vercel env add GOOGLE_SCRIPT_URL

# 輸入 URL 後選擇環境：
# ● Production
# ● Preview
# ● Development
```

### 步驟 4：部署

```bash
# 部署到正式環境
vercel --prod
```

---

## ✅ 驗證部署

### 1. 檢查建置日誌

在 Vercel Dashboard 的 "Deployments" 頁面，應該會看到：

```
✓ config.js 已生成
✓ 驗證通過
✓ config.js 已正確設定 Google Apps Script URL
🎉 建置成功！
```

### 2. 測試表單

1. 開啟部署的網站
2. 填寫預約表單
3. 送出後檢查：
   - [ ] 顯示「感謝您的預約！」訊息
   - [ ] Google Sheets 有新資料
   - [ ] 收到郵件通知

---

## 🔧 常見問題速解

### Q: 部署失敗，顯示「GOOGLE_SCRIPT_URL 未設定」

**解決方法：**
1. 前往 Vercel Dashboard → Settings → Environment Variables
2. 新增 `GOOGLE_SCRIPT_URL` 變數
3. 觸發重新部署：
   ```bash
   git commit --allow-empty -m "Redeploy"
   git push
   ```

### Q: 環境變數設定了但還是沒生效

**原因：** 設定環境變數後需要重新部署

**解決方法：**
```bash
# 方法 1：空提交觸發重新部署
git commit --allow-empty -m "Trigger redeploy"
git push

# 方法 2：在 Vercel Dashboard 點擊 "Redeploy"
```

### Q: 本地測試時沒有 config.js

**解決方法：**

建立本地的 `config.js`（不會被上傳到 Git）：

```bash
cp config.example.js config.js
# 然後編輯 config.js 填入你的 URL
```

或使用建置腳本生成：

```bash
GOOGLE_SCRIPT_URL="你的URL" node generate-config.js
```

---

## 📊 部署後檢查清單

部署完成後，請確認：

- [ ] 網站可以正常訪問
- [ ] 表單可以送出
- [ ] Google Sheets 有記錄資料
- [ ] 收到郵件通知
- [ ] Console 沒有錯誤訊息
- [ ] config.js 沒有被上傳到 Git

---

## 🔄 更新 Google Apps Script URL

如果需要更換 URL：

### 在 Vercel Dashboard：

1. Settings → Environment Variables
2. 編輯 `GOOGLE_SCRIPT_URL`
3. 儲存後重新部署

### 使用 CLI：

```bash
# 移除舊的變數
vercel env rm GOOGLE_SCRIPT_URL

# 新增新的變數
vercel env add GOOGLE_SCRIPT_URL

# 重新部署
vercel --prod
```

---

## 📁 專案結構

```
你的專案/
├── index.html                ✅ Git
├── config.js                 ❌ 不上傳（Vercel 自動生成）
├── config.example.js         ✅ Git
├── generate-config.js        ✅ Git（Vercel 建置腳本）
├── vercel.json              ✅ Git（Vercel 設定）
├── google-apps-script.js    ✅ Git
└── .gitignore               ✅ Git
```

---

## 🎯 完整工作流程圖

```
本地開發
    ↓
提交到 Git（不包含 config.js）
    ↓
推送到 GitHub/GitLab
    ↓
Vercel 偵測到新提交
    ↓
執行 generate-config.js
從環境變數生成 config.js
    ↓
建置網站
    ↓
部署完成！
```

---

## 💡 提示

- **環境變數名稱**：使用 `GOOGLE_SCRIPT_URL` 而不是 `VITE_GOOGLE_SCRIPT_URL`
- **多環境管理**：開發、預覽、正式環境可以使用不同的 URL
- **安全性**：config.js 在 Vercel 建置時生成，不會出現在 Git 歷史中

---

## 📞 需要更多協助？

- [完整 Vercel 部署指南](VERCEL_DEPLOYMENT_GUIDE.md)
- [Google Apps Script 設定](BOOKING_SETUP_GUIDE.md)
- [安全性檢查清單](SECURITY_CHECKLIST.md)

---

**準備好了嗎？開始部署吧！** 🚀

最後更新：2025-01-19
