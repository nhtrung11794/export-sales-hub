const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');

async function scanAll() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });

  // List all non-folder files
  const res = await drive.files.list({
    q: `trashed = false and mimeType != 'application/vnd.google-apps.folder'`,
    fields: 'files(id, name, mimeType, webViewLink, size)',
    pageSize: 100,
  });

  console.log(`Tìm thấy tổng cộng ${res.data.files.length} file:`);
  for (const f of res.data.files) {
    console.log(`- [${f.mimeType}] ${f.name} (ID: ${f.id})`);
  }
}

scanAll().catch(console.error);
