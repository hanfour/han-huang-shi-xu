/**
 * Google Apps Script for 漢皇蒔序預約表單
 * 此腳本應該部署在 Google Sheets 的 Apps Script 編輯器中
 *
 * 功能：
 * 1. 接收來自網站的預約表單資料
 * 2. 將資料寫入 Google Sheets
 * 3. 發送通知郵件到指定信箱
 */

// ========== 設定區域 ==========
const CONFIG = {
  // 收件者信箱（可以設定多個，用逗號分隔）
  EMAIL_RECIPIENTS: 'your-email@example.com',

  // 郵件主旨
  EMAIL_SUBJECT: '【漢皇蒔序】新的預約賞屋通知',

  // Sheet 名稱
  SHEET_NAME: '預約記錄',

  // 時區
  TIMEZONE: 'Asia/Taipei'
};

/**
 * doPost - 處理來自網站的 POST 請求
 */
function doPost(e) {
  try {
    // 解析接收到的資料
    const data = JSON.parse(e.postData.contents);

    // 寫入 Google Sheets
    const rowNumber = writeToSheet(data);

    // 發送通知郵件
    sendNotificationEmail(data, rowNumber);

    // 返回成功訊息
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'success',
        'message': '預約資料已成功送出',
        'rowNumber': rowNumber
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // 錯誤處理
    Logger.log('Error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'error',
        'message': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 將資料寫入 Google Sheets
 */
function writeToSheet(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  // 如果 Sheet 不存在，創建一個新的
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    // 設定標題列
    sheet.getRange(1, 1, 1, 6).setValues([[
      '提交時間', '姓名', '聯絡電話', '縣市', '鄉鎮市區', '同意隱私權政策'
    ]]);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  // 取得當前時間
  const timestamp = Utilities.formatDate(
    new Date(),
    CONFIG.TIMEZONE,
    'yyyy-MM-dd HH:mm:ss'
  );

  // 準備要寫入的資料
  const rowData = [
    timestamp,
    data.username || '',
    data.phone || '',
    data.county || '',
    data.district || '',
    data.agree ? '是' : '否'
  ];

  // 寫入新的一行
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, 1, rowData.length).setValues([rowData]);

  return lastRow + 1;
}

/**
 * 發送通知郵件
 */
function sendNotificationEmail(data, rowNumber) {
  // 建立郵件內容
  const emailBody = `
親愛的業務同仁您好，

網站收到新的預約賞屋申請，詳細資訊如下：

━━━━━━━━━━━━━━━━━━━━━━
📋 預約資訊
━━━━━━━━━━━━━━━━━━━━━━

👤 姓名：${data.username || '未提供'}
📞 聯絡電話：${data.phone || '未提供'}
📍 地址：${data.county || ''} ${data.district || ''}
✅ 同意隱私權政策：${data.agree ? '是' : '否'}

━━━━━━━━━━━━━━━━━━━━━━
⏰ 提交時間：${Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss')}
📊 記錄編號：第 ${rowNumber} 筆

━━━━━━━━━━━━━━━━━━━━━━

請儘速與客戶聯繫，提供專業的賞屋服務。

此郵件為系統自動發送，請勿直接回覆。

漢皇蒔序 預約系統
  `.trim();

  // 建立 HTML 格式郵件
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Microsoft JhengHei', 'PingFang TC', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
    .header { background-color: #3D3127; color: white; padding: 20px; text-align: center; }
    .content { background-color: white; padding: 30px; margin-top: 20px; border-radius: 5px; }
    .info-row { padding: 10px 0; border-bottom: 1px solid #eee; }
    .label { font-weight: bold; color: #3D3127; display: inline-block; width: 120px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🏡 漢皇蒔序 - 新預約通知</h2>
    </div>
    <div class="content">
      <p>親愛的業務同仁您好，</p>
      <p>網站收到新的預約賞屋申請：</p>

      <div class="info-row">
        <span class="label">👤 姓名：</span>
        <span>${data.username || '未提供'}</span>
      </div>

      <div class="info-row">
        <span class="label">📞 聯絡電話：</span>
        <span>${data.phone || '未提供'}</span>
      </div>

      <div class="info-row">
        <span class="label">📍 地址：</span>
        <span>${data.county || ''} ${data.district || ''}</span>
      </div>

      <div class="info-row">
        <span class="label">✅ 隱私權政策：</span>
        <span>${data.agree ? '已同意' : '未同意'}</span>
      </div>

      <div class="info-row">
        <span class="label">⏰ 提交時間：</span>
        <span>${Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss')}</span>
      </div>

      <div class="info-row">
        <span class="label">📊 記錄編號：</span>
        <span>第 ${rowNumber} 筆</span>
      </div>

      <p style="margin-top: 20px; color: #D32F2F; font-weight: bold;">
        ⚠️ 請儘速與客戶聯繫，提供專業的賞屋服務。
      </p>
    </div>
    <div class="footer">
      <p>此郵件為系統自動發送，請勿直接回覆。</p>
      <p>漢皇蒔序 預約系統</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  // 發送郵件
  MailApp.sendEmail({
    to: CONFIG.EMAIL_RECIPIENTS,
    subject: CONFIG.EMAIL_SUBJECT,
    body: emailBody,
    htmlBody: htmlBody
  });
}

/**
 * doGet - 處理 GET 請求（測試用）
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      'status': 'ok',
      'message': 'Google Apps Script 運作正常'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 測試函數 - 可在 Apps Script 編輯器中執行此函數來測試
 */
function testSubmission() {
  const testData = {
    username: '測試用戶',
    phone: '0912-345-678',
    county: '新北市',
    district: '新店區',
    agree: true
  };

  const rowNumber = writeToSheet(testData);
  sendNotificationEmail(testData, rowNumber);

  Logger.log('測試完成！記錄編號：' + rowNumber);
}
