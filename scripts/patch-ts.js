const fs = require('fs');
const path = require('path');

const FILE_IDS = {
  "B01": "1rkccIBjNzJvfoC_w-n7xZOCYg9Z8EV8q",
  "B02": "1gyFkgOlLtUsUe5wsfHu2Fglpfa2UZjIt",
  "B03": "189KSET8dZjGgH2ne5giryVjEMORXXrLe",
  "B04": "1_AsD5kxYPI1qxgFFeMMBpv3uPgihdCSY",
  "B05": "1hoJyK6jTCqluY-Y4uy14amqMMrLhdHkV",
  "B06": "1CfZ9k5dZUm176DQ0Zax2lqOEYyET3cEq",
  "B07": "1TI4J9-7UqcLH25shNtqNodLKQSMsdCOg",
  "B08": "1G5dMtEzx9Tf60xW-Kg-g_Dxsa0WsPhGP",
  "B09": "1raoWlwz3ECU6EBFvHtYdslFJi4_Kvxvp",
  "B10": "1-ZYDoECdZyYXUdo6OQWWDg7uXwrWPyWC",
  "B11": "1DctwSitUI4Ox2yxsT4VrrGvvxjw7svUf",
  "B12": "1FUi5mgeKuw4P4581ERcKF_iIGC3yolTM",
  "B13": "1JqN-p3ALh82n2l_ti6hkC8UWTXyvKyGt",
  "B14": "1CP9I8BbH0nJ8N3Q-vwnu0JNt6_xQDtha",
  "B15": "1jtv6Wq93wtpZsVYa8W0dB1_zgTxlUSXm"
};

const TS_FILE = path.join(__dirname, '../src/lib/courseMaterials.ts');
let content = fs.readFileSync(TS_FILE, 'utf8');

for (const [lessonId, fileId] of Object.entries(FILE_IDS)) {
  const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  
  // Tìm block của lessonId
  const blockRegex = new RegExp(`(${lessonId}:\\s*{[^}]*?embedUrl:\\s*)GOOGLE_DRIVE_EMBED_FOLDER`, 's');
  
  if (blockRegex.test(content)) {
    content = content.replace(blockRegex, `$1'${previewUrl}'`);
    console.log(`Đã cập nhật embedUrl cho ${lessonId}`);
  } else {
    console.log(`Không tìm thấy block để update cho ${lessonId}`);
  }
}

fs.writeFileSync(TS_FILE, content);
console.log("Cập nhật thành công courseMaterials.ts");
