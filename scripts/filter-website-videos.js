const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'detailed-videos.json'), 'utf8'));

// Filter only files in the "Website" folder structure
const websiteVideos = data.filter(v => v.folderPath && v.folderPath.includes('Website') && (v.name.endsWith('.mp4') || v.name.endsWith('.mov') || v.name.toLowerCase().includes('video')));

console.log(`Tìm thấy ${websiteVideos.length} video trong thư mục Website:`);
for (const v of websiteVideos) {
  console.log(`- "${v.name}" (ID: ${v.id}) in [${v.folderPath}] (Modified: ${v.modifiedTime})`);
}
