const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');

async function scanDeepVideos() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });

  // 1. Quét tất cả folders
  const foldersRes = await drive.files.list({
    q: `trashed = false and mimeType = 'application/vnd.google-apps.folder'`,
    fields: 'files(id, name, parents)',
    pageSize: 200,
  });

  const folderMap = {};
  for (const f of foldersRes.data.files) {
    folderMap[f.id] = { id: f.id, name: f.name, parents: f.parents };
  }

  function getFolderPath(folderId) {
    let current = folderMap[folderId];
    let pathParts = [];
    while (current) {
      pathParts.unshift(current.name);
      current = current.parents && current.parents[0] ? folderMap[current.parents[0]] : null;
    }
    return pathParts.join(' / ');
  }

  // 2. Quét tất cả các file video
  const videoRes = await drive.files.list({
    q: `trashed = false and (mimeType contains 'video' or name contains '.mp4' or name contains '.mov')`,
    fields: 'files(id, name, parents, size, modifiedTime)',
    pageSize: 100,
  });

  console.log(`\n================ TỔNG HỢP TOÀN BỘ FILE VIDEO TRÊN DRIVE (${videoRes.data.files.length} videos) ================`);
  const detailedVideos = [];
  for (const v of videoRes.data.files) {
    const parentFolder = v.parents && v.parents[0] ? getFolderPath(v.parents[0]) : 'Root';
    console.log(`\n📹 Tên file: "${v.name}"`);
    console.log(`   - ID: ${v.id}`);
    console.log(`   - Thư mục chứa: [${parentFolder}]`);
    console.log(`   - Kích thước: ${(v.size / 1024 / 1024).toFixed(1)} MB | Ngày sửa: ${v.modifiedTime}`);
    detailedVideos.push({
      name: v.name,
      id: v.id,
      folderPath: parentFolder,
      modifiedTime: v.modifiedTime
    });
  }

  fs.writeFileSync(path.join(__dirname, 'detailed-videos.json'), JSON.stringify(detailedVideos, null, 2));
}

scanDeepVideos().catch(console.error);
