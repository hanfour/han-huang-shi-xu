#!/bin/bash

# 本地測試腳本
# 用於在部署前測試網站是否正常運作

echo "🧪 開始本地測試..."
echo ""

# 檢查 config.js 是否存在
if [ -f "config.js" ]; then
    echo "✓ config.js 存在"

    # 檢查是否包含真實 URL
    if grep -q "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE" config.js; then
        echo "⚠️  警告：config.js 尚未設定真實的 Google Apps Script URL"
        echo "   請編輯 config.js 並填入正確的 URL"
        exit 1
    else
        echo "✓ config.js 已設定 URL"
    fi
else
    echo "❌ config.js 不存在"
    echo "   請複製 config.example.js 為 config.js 並填入設定"
    echo "   指令: cp config.example.js config.js"
    exit 1
fi

# 檢查 .gitignore
if grep -q "config.js" .gitignore; then
    echo "✓ .gitignore 包含 config.js"
else
    echo "⚠️  警告：.gitignore 沒有包含 config.js"
fi

# 檢查 Git 狀態
if [ -d ".git" ]; then
    if git check-ignore config.js > /dev/null 2>&1; then
        echo "✓ config.js 已被 Git 忽略"
    else
        echo "❌ 警告：config.js 沒有被 Git 忽略！"
        echo "   這可能會導致敏感資訊被上傳"
    fi
fi

echo ""
echo "🌐 啟動本地伺服器..."
echo ""
echo "請在瀏覽器開啟："
echo "  http://localhost:8000"
echo ""
echo "測試項目："
echo "  1. 填寫預約表單"
echo "  2. 檢查 Console 無錯誤"
echo "  3. 確認送出後顯示成功訊息"
echo "  4. 檢查 Google Sheets 是否有新資料"
echo "  5. 檢查是否收到郵件"
echo ""
echo "按 Ctrl+C 停止伺服器"
echo ""

# 啟動 Python 簡易伺服器
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer 8000
else
    echo "❌ 找不到 Python"
    echo "請手動開啟 index.html 或使用其他本地伺服器"
fi
