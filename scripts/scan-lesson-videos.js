const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');

async function scanLessonVideos() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });

  // 1. Tìm tất cả các folder có tên "Bài 01", "Bài 02"...
  const foldersRes = await drive.files.list({
    q: `trashed = false and mimeType = 'application/vnd.google-apps.folder'`,
    fields: 'files(id, name)',
    pageSize: 100,
  });

  const lessonFolders = {};
  for (const f of foldersRes.data.files) {
    const match = f.name.match(/(bài|bai|b)[\s_-]*0?([1-9]|1[0-5])\b/i);
    if (match) {
      const num = parseInt(match[2], 10);
      const lessonId = `B${num.toString().padStart(2, '0')}`;
      lessonFolders[lessonId] = { id: f.id, name: f.name };
    }
  }

  console.log('Tìm thấy các folder bài học:', lessonFolders);

  const videoMap = {};

  // 2. Tìm tất cả file trong từng folder bài học
  for (const [lessonId, folder] of Object.entries(lessonFolders)) {
    const filesRes = await drive.files.list({
      q: `'${folder.id}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)',
      pageSize: 50,
    });

    console.log(`\n📁 [${lessonId}] ${folder.name}:`);
    for (const file of filesRes.data.files) {
      console.log(`  - [${file.mimeType}] ${file.name} (ID: ${file.id})`);
      if (file.mimeType.includes('video') || file.name.endsWith('.mp4') || file.name.endsWith('.mov')) {
        // Ưu tiên video có chữ Recap hoặc tổng hợp, nếu không lấy video đầu tiên
        if (!videoMap[lessonId] || file.name.toLowerCase().includes('recap') || file.name.toLowerCase().includes('tổng')) {
          videoMap[lessonId] = { id: file.id, name: file.name };
        }
      }
    }
  }

  console.log('\n=============================================');
  console.log('🎥 MAP VIDEO TỔNG KẾT THEO BÀI HỌC:');
  console.log(JSON.stringify(videoMap, null, 2));
  console.log('=============================================\n');

  fs.writeFileSync(path.join(__dirname, 'video-map.json'), JSON.stringify(videoMap, null, 2));
}

scanLessonVideos().catch(console.error);
