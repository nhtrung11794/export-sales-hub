const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');

async function checkMissingLessons() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });

  const foldersRes = await drive.files.list({
    q: `trashed = false and mimeType = 'application/vnd.google-apps.folder'`,
    fields: 'files(id, name, parents)',
    pageSize: 200,
  });

  for (const f of foldersRes.data.files) {
    if (f.name.includes('Bài 01') || f.name.includes('Bài 02') || f.name.includes('Bài 06') || f.name.includes('Bài 1 -') || f.name.includes('Bài 2 -') || f.name.includes('Bài 6 -')) {
      console.log(`\nFolder: ${f.name} (ID: ${f.id})`);
      const filesRes = await drive.files.list({
        q: `'${f.id}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType)',
      });
      for (const item of filesRes.data.files) {
        console.log(`  - [${item.mimeType}] ${item.name} (${item.id})`);
      }
    }
  }
}

checkMissingLessons().catch(console.error);
