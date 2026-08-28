const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');

async function checkSpecificFolders() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });

  // List all folders
  const res = await drive.files.list({
    q: `trashed = false and mimeType = 'application/vnd.google-apps.folder'`,
    fields: 'files(id, name)',
    pageSize: 100,
  });

  for (const f of res.data.files) {
    if (f.name.includes('09') || f.name.includes('13') || f.name.includes('9') || f.name.includes('13')) {
      console.log(`Folder: ${f.name} (${f.id})`);
      const files = await drive.files.list({
        q: `'${f.id}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType)',
      });
      for (const item of files.data.files) {
        console.log(`  - [${item.mimeType}] ${item.name} (${item.id})`);
      }
    }
  }
}

checkSpecificFolders().catch(console.error);
