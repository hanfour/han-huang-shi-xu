# Vercel 部署指南

本指南說明如何將漢皇蒔序預約表單部署到 Vercel，並安全地管理 Google Apps Script URL。

---

## 📋 目錄

1. [Vercel 部署方案選擇](#1-vercel-部署方案選擇)
2. [方案 A：使用 Vercel 環境變數（推薦）](#2-方案-a使用-vercel-環境變數推薦)
3. [方案 B：使用 config.js（簡單）](#3-方案-b使用-configjs簡單)
4. [部署步驟](#4-部署步驟)
5. [常見問題](#5-常見問題)

---

## 1. Vercel 部署方案選擇

### 方案比較

| 方案 | 安全性 | 複雜度 | 推薦度 |
|------|--------|--------|--------|
| **方案 A：環境變數** | ⭐⭐⭐⭐⭐ 最安全 | ⭐⭐⭐ 中等 | ✅ 推薦 |
| **方案 B：config.js** | ⭐⭐⭐ 中等 | ⭐ 簡單 | ⚠️ 可用但較不安全 |

---

## 2. 方案 A：使用 Vercel 環境變數（推薦）

### 為什麼推薦這個方案？

✅ **最安全**
- URL 儲存在 Vercel 後台，不會出現在程式碼中
- 即使別人 fork 你的專案，也無法取得你的 URL

✅ **支援多環境**
- Development（開發）
- Preview（預覽）
- Production（正式環境）
- 每個環境可以使用不同的 URL

✅ **符合業界標準**
- 這是目前最佳實踐的做法
- 容易整合 CI/CD 流程

### 步驟 2.1：建立 Vercel 專案

1. 前往 [Vercel](https://vercel.com)
2. 點擊「Add New Project」
3. 選擇「Import Git Repository」或「Deploy from template」

### 步驟 2.2：設定環境變數

#### 在 Vercel Dashboard 設定

1. 進入你的專案
2. 點擊「Settings」
3. 點擊左側選單的「Environment Variables」
4. 新增以下變數：

```
Name: VITE_GOOGLE_SCRIPT_URL
Value: https://script.google.com/macros/s/AKfycbz.../exec
Environments: ✓ Production ✓ Preview ✓ Development
```

**重要命名規則：**
- 使用 `VITE_` 前綴（如果使用 Vite）
- 或使用 `NEXT_PUBLIC_` 前綴（如果使用 Next.js）
- 一般靜態網站建議使用 `VITE_` 或直接使用變數名

#### 為什麼要用 VITE_ 前綴？
- Vite 只會將 `VITE_` 開頭的環境變數暴露給客戶端
- 這是一層額外的安全保護

### 步驟 2.3：修改程式碼讀取環境變數

程式碼已經更新為自動偵測環境變數，不需要額外修改！

檢查 `index.html` 中的程式碼（約 3248-3260 行）：

```javascript
function SendBooking(utmSource, utmMedium) {
  // 優先使用環境變數（Vercel），否則使用 config.js
  const scriptUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_SCRIPT_URL
    ? import.meta.env.VITE_GOOGLE_SCRIPT_URL
    : (typeof CONFIG !== 'undefined' ? CONFIG.GOOGLE_SCRIPT_URL : null);

  if (!scriptUrl) {
    console.error('未設定 Google Apps Script URL');
    alert('系統配置錯誤，請聯繫網站管理員。');
    return false;
  }
  // ... 其他程式碼
}
```

### 步驟 2.4：建立 .env 檔案（本地開發用）

```bash
# .env.local
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbz.../exec
```

**重要：** 將 `.env.local` 加入 `.gitignore`

### 步驟 2.5：更新 .gitignore

```
# 環境變數檔案
.env
.env.local
.env.*.local
config.js
```

---

## 3. 方案 B：使用 config.js（簡單）

### 適用情境
- 只是簡單的靜態網站
- 不需要多環境管理
- 想要最簡單的設定方式

### 步驟 3.1：保持現有設定
你目前的 `config.js` 設定就可以直接使用！

### 步驟 3.2：部署到 Vercel

#### 選項 A：透過 Git 部署（推薦）

```bash
# 確認 .gitignore 包含 config.js
git status

# config.js 不應該在列表中
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

在 Vercel 部署時：
1. 連結你的 Git repository
2. Vercel 會自動偵測並部署
3. **問題：** config.js 不在 Git 中，所以不會被部署

#### 解決方法：使用 Vercel CLI 上傳 config.js

```bash
# 安裝 Vercel CLI
npm install -g vercel

# 登入 Vercel
vercel login

# 部署（第一次會詢問設定）
vercel

# 這會包含本地的 config.js 檔案
```

#### 選項 B：手動上傳（不推薦）

在 Vercel Dashboard：
1. 設定環境變數 `CONFIG_CONTENT` = `整個 config.js 的內容`
2. 使用建置腳本在部署時生成 config.js

---

## 4. 部署步驟（方案 A - 推薦）

### 完整部署流程

#### Step 1: 準備 Git Repository

```bash
# 初始化 Git（如果還沒有）
git init

# 確認 .gitignore 正確
cat .gitignore | grep -E "config.js|.env"

# 提交程式碼（不包含 config.js 和 .env）
git add .
git commit -m "Initial commit for Vercel deployment"

# 推送到 GitHub（或 GitLab、Bitbucket）
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

#### Step 2: 連接 Vercel

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊「Add New Project」
3. 選擇你的 Git repository
4. 點擊「Import」

#### Step 3: 設定環境變數

在部署設定頁面：
1. 展開「Environment Variables」
2. 新增：
   ```
   Name: VITE_GOOGLE_SCRIPT_URL
   Value: https://script.google.com/macros/s/AKfycbz.../exec
   ```
3. 選擇所有環境（Production, Preview, Development）

#### Step 4: 部署

1. 點擊「Deploy」
2. 等待建置完成
3. 訪問提供的 URL 測試

#### Step 5: 測試

1. 開啟部署的網站
2. 填寫預約表單
3. 確認：
   - Google Sheets 有記錄
   - 收到郵件通知
   - 沒有 Console 錯誤

---

## 5. 常見問題

### Q1: Vercel 部署後找不到 config.js？

**原因：** config.js 在 .gitignore 中，不會被上傳到 Git

**解決方法：**
- 使用方案 A（環境變數）✅ 推薦
- 或使用 Vercel CLI 部署（會包含本地檔案）

### Q2: 環境變數設定後還是讀不到？

**檢查清單：**
- [ ] 變數名稱正確（`VITE_GOOGLE_SCRIPT_URL`）
- [ ] 在 Vercel Dashboard 中正確設定
- [ ] 重新部署（設定環境變數後需要重新部署）

```bash
# 觸發重新部署
git commit --allow-empty -m "Trigger redeploy"
git push
```

### Q3: 本地開發時如何測試？

**使用 .env.local：**

```bash
# 建立 .env.local
echo 'VITE_GOOGLE_SCRIPT_URL=你的URL' > .env.local

# 使用開發伺服器
npm run dev
# 或
python -m http.server 8000
```

**或使用 config.js：**
- 本地保留 config.js
- 確保在 .gitignore 中

### Q4: 如何在 Vercel 和本地使用不同的 URL？

**方案：**
1. 本地使用 `.env.local` 或 `config.js`（測試用 URL）
2. Vercel 使用環境變數（正式用 URL）
3. 程式碼會自動優先使用環境變數

### Q5: 如何更新 Google Apps Script URL？

**在 Vercel：**
1. Dashboard → Settings → Environment Variables
2. 編輯 `VITE_GOOGLE_SCRIPT_URL`
3. 儲存後重新部署

**在本地：**
1. 修改 `.env.local` 或 `config.js`
2. 重新載入頁面

---

## 🎯 推薦配置總結

### 檔案結構

```
專案目錄/
├── index.html                    ✅ 上傳 Git
├── config.js                     ❌ 不上傳（本地開發用）
├── config.example.js             ✅ 上傳 Git
├── .env.local                    ❌ 不上傳（本地開發用）
├── .gitignore                    ✅ 上傳 Git
│   ├── config.js
│   └── .env.local
└── vercel.json                   ✅ 上傳 Git
```

### .gitignore 完整內容

```
# 配置檔案
config.js
.env
.env.local
.env.*.local

# Vercel
.vercel

# macOS
.DS_Store

# IDE
.vscode/
.idea/
```

### 環境變數設定

| 環境 | 配置方式 | 檔案 |
|------|----------|------|
| **本地開發** | .env.local 或 config.js | 不上傳 Git |
| **Vercel** | Environment Variables | 在 Dashboard 設定 |

---

## 📞 需要協助？

### Vercel 相關問題
- [Vercel 文件](https://vercel.com/docs)
- [環境變數設定](https://vercel.com/docs/concepts/projects/environment-variables)

### 表單相關問題
- 參考 [BOOKING_SETUP_GUIDE.md](BOOKING_SETUP_GUIDE.md)
- 參考 [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)

---

## 🚀 快速開始指令

```bash
# 1. 安裝 Vercel CLI
npm install -g vercel

# 2. 登入
vercel login

# 3. 設定環境變數
vercel env add VITE_GOOGLE_SCRIPT_URL

# 4. 部署
vercel --prod

# 5. 查看部署狀態
vercel ls
```

---

**最後更新：** 2025-01-19
**版本：** v1.0
