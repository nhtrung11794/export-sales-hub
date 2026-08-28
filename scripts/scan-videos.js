const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');

async function scanVideos() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('Không tìm thấy credentials.json');
    return;
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.list({
    q: `trashed = false and (mimeType contains 'video/' or name contains '.mp4' or name contains '.mov')`,
    fields: 'files(id, name, mimeType)',
    pageSize: 50,
  });

  console.log('Tìm thấy video:', res.data.files);
}

scanVideos().catch(console.error);
