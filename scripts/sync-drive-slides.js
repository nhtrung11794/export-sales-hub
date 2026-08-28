const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// MAP CHUẨN HÓA: KEY là Lesson ID, VALUE là tên file chuẩn hóa
const STANDARD_NAMES = {
  B01: 'M01_B01_TuDuySalesXNK.pdf',
  B02: 'M01_B02_BanChatNgheSales.pdf',
  B03: 'M02_B03_ChienLuocThiTruong.pdf',
  B04: 'M02_B04_ChanDuongICP_BuyerMap.pdf',
  B05: 'M02_B05_GiaiMaNhuCau_Discovery.pdf',
  B06: 'M02_B06_SangLocLead_KenhTiepCan.pdf',
  B07: 'M03_B07_ThamDinhCoHoi_FNACM.pdf',
  B08: 'M03_B08_QuanTriPipeline_FollowUp.pdf',
  B09: 'M04_B09_LamRoYeuCau_PBTPC.pdf',
  B10: 'M04_B10_BaoGiaTCO_ChimMoi.pdf',
  B11: 'M04_B11_DamPhanGiveTake.pdf',
  B12: 'M04_B12_KiemSoatRuiRo_Closing.pdf',
  B13: 'M05_B13_BanGiaoVanHanh_SLA.pdf',
  B14: 'M05_B14_XuLyKhungHoang_CAPA.pdf',
  B15: 'M05_B15_TangTruongTaiKhoan_JBP.pdf'
};

const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');
const SOURCE_FOLDER_ID = '1L2KWrNRg9UvNe9RR6sfAgAlRQc37K4Ye'; // Folder gốc chứa 15 file slide

async function run() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('❌ LỖI: Không tìm thấy file credentials.json!');
    console.error('Vui lòng tải file credentials.json từ Google Cloud Console và đặt vào thư mục gốc của dự án (cùng cấp với thư mục scripts).');
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });

  console.log('✅ Đã xác thực Google Drive API thành công!');
  console.log('🔍 Đang quét thư mục gốc để tìm các file Slide...');

  // 1. Quét tất cả các file PDF mà Service Account được chia sẻ
  const res = await drive.files.list({
    q: `trashed = false and mimeType = 'application/pdf'`,
    fields: 'files(id, name, parents)',
    pageSize: 100,
  });

  const files = res.data.files;
  if (!files || files.length === 0) {
    console.log('❌ Không tìm thấy file PDF nào trong thư mục nguồn.');
    return;
  }

  console.log(`Tìm thấy ${files.length} file PDF trong thư mục nguồn.`);

  const results = {};

  // 3. Quét và trích xuất File ID (Không Copy để tránh lỗi Quota)
  for (const file of files) {
    let matchLesson = null;
    const lowerName = file.name.toLowerCase();
    
    // Tìm con số từ 1 đến 15 trong tên file
    const match = lowerName.match(/(bài|bai|b)[\s_-]*0?([1-9]|1[0-5])\b/);
    if (match) {
      const num = parseInt(match[2], 10);
      matchLesson = `B${num.toString().padStart(2, '0')}`;
    } else {
      for (let i = 1; i <= 15; i++) {
        const numStr = i.toString().padStart(2, '0');
        if (lowerName.includes(` ${i} `) || lowerName.includes(`0${i}`) || lowerName.includes(`_${numStr}`)) {
          matchLesson = `B${numStr}`;
          break;
        }
      }
    }

    if (!matchLesson || !STANDARD_NAMES[matchLesson]) {
      continue;
    }

    // Nếu đã tìm thấy ID cho bài này rồi thì bỏ qua (tránh ghi đè nếu có nhiều file trùng tên)
    if (!results[matchLesson]) {
      console.log(`✅ Đã tìm thấy: [${matchLesson}] "${file.name}" (ID: ${file.id})`);
      results[matchLesson] = file.id;
    }
  }

  console.log('\n=============================================');
  console.log('🎉 HOÀN TẤT TRÍCH XUẤT FILE ID!');
  console.log('Dưới đây là mã cập nhật File ID, AI sẽ tự động gán vào mã nguồn:');
  console.log(JSON.stringify(results, null, 2));
  console.log('=============================================\n');
  
  fs.writeFileSync(path.join(__dirname, 'sync-results.json'), JSON.stringify({ files: results }, null, 2));
}

run().catch(console.error);
