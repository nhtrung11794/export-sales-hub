export interface CourseMaterial {
  lessonId: string;
  moduleId: 'M01' | 'M02' | 'M03' | 'M04' | 'M05';
  title: string;
  standardFileName: string;
  description: string;
  driveFolderUrl: string;
  embedUrl: string;
  videoFileName?: string;
  videoEmbedUrl?: string;
}

export const GOOGLE_DRIVE_SLIDES_ROOT = 'https://drive.google.com/drive/folders/1L2KWrNRg9UvNe9RR6sfAgAlRQc37K4Ye?usp=drive_link';
export const GOOGLE_DRIVE_EMBED_FOLDER = 'https://drive.google.com/embeddedfolderview?id=1L2KWrNRg9UvNe9RR6sfAgAlRQc37K4Ye#list';

export const COURSE_MATERIALS: Record<string, CourseMaterial> = {
  // MODULE 01: Mindset & Foundation
  B01: {
    lessonId: 'B01',
    moduleId: 'M01',
    title: 'Bài 01: Tư duy Sales xuất khẩu trong bối cảnh thị trường thay đổi',
    standardFileName: 'M01_B01_TuDuySalesXNK.pdf',
    description: 'Dịch chuyển tư duy (Mindset Shift) từ bán hàng truyền thống sang tư vấn B2B.',
    driveFolderUrl: GOOGLE_DRIVE_SLIDES_ROOT,
    embedUrl: 'https://drive.google.com/file/d/1rkccIBjNzJvfoC_w-n7xZOCYg9Z8EV8q/preview',
    videoFileName: 'M01_Video01.mp4',
    videoEmbedUrl: 'https://drive.google.com/file/d/15vHkKrcd9gLhppJvJyD_xwpQ_Unh8JJe/preview',
  },
  B02: {
    lessonId: 'B02',
    moduleId: 'M01',
    title: 'Bài 02: Bản chất nghề Sales xuất khẩu & 4 Trụ cột Năng lực',
    standardFileName: 'M01_B02_BanChatNgheSales.pdf',
    description: '5 giai đoạn Sales B2B tiêu chuẩn và tự đánh giá Radar Chart 11 năng lực.',
    driveFolderUrl: GOOGLE_DRIVE_SLIDES_ROOT,
    embedUrl: 'https://drive.google.com/file/d/1gyFkgOlLtUsUe5wsfHu2Fglpfa2UZjIt/preview',
    videoFileName: 'M01_Video02.mp4',
    videoEmbedUrl: 'https://drive.google.com/file/d/1FGMsI0wP369HlPu9sSvofL6JiudV-8i_/preview',
  },

  // MODULE 02: Market & Customer Understanding
  B03: {
    lessonId: 'B03',
    moduleId: 'M02',
    title: 'Bài 03: Chiến lược thâm nhập thị trường & Lựa chọn kênh Route-to-Market',
    standardFileName: 'M02_B03_ChienLuocThiTruong.pdf',
    description: 'Ma trận 6 cột Target Market, kênh RTM và tính toán thuế quan FTA.',
    driveFolderUrl: GOOGLE_DRIVE_SLIDES_ROOT,
    embedUrl: 'https://drive.google.com/file/d/189KSET8dZjGgH2ne5giryVjEMORXXrLe/preview',
    videoFileName: 'M02_Video01.mp4',
    videoEmbedUrl: 'https://drive.google.com/file/d/1e5CwUgAm7hN2TOA8bZoDwz1EyjEfCigI/preview',
  },
  B04: {
    lessonId: 'B04',
    moduleId: 'M02',
    title: 'Bài 04: Xây dựng chân dung ICP & Bản đồ quyền lực Buyer Map',
    standardFileName: 'M02_B04_ChanDuongICP_BuyerMap.pdf',
    description: 'Thiết kế cấu trúc Buyer Persona và định vị các nhân vật chủ chốt đa tầng.',
    driveFolderUrl: GOOGLE_DRIVE_SLIDES_ROOT,
    embedUrl: 'https://drive.google.com/file/d/1_AsD5kxYPI1qxgFFeMMBpv3uPgihdCSY/preview',
    videoFileName: 'M02_Video02.mp4',
    videoEmbedUrl: 'https://drive.google.com/file/d/1IASAE9vs2Coa4dpLm0oGXrygt1UjDyAT/preview',
  },
  B05: {
    lessonId: 'B05',
    moduleId: 'M02',
    title: 'Bài 05: Giải mã nhu cầu & Khai thác nỗi đau người mua (Discovery Matrix)',
    standardFileName: 'M02_B05_GiaiMaNhuCau_Discovery.pdf',
    description: 'Ma trận 5 lớp Discovery Insight (Context, Need, Pain, Criteria, Risk).',
    driveFolderUrl: GOOGLE_DRIVE_SLIDES_ROOT,
    embedUrl: 'https://drive.google.com/file/d/1hoJyK6jTCqluY-Y4uy14amqMMrLhdHkV/preview',
    videoFileName: 'M02_Video03.mp4',
    videoEmbedUrl: 'https://drive.google.com/file/d/1Vi3omaJDSPru97r1bTg0HF9WoVDjCqvW/preview',
  },
  B06: {
    lessonId: 'B06',
    moduleId: 'M02',
    title: 'Bài 06: Kỹ thuật săn tìm và sàng lọc Lead B2B chất lượng cao',
    standardFileName: 'M02_B06_SangLocLead_KenhTiepCan.pdf',
    description: 'Chiến lược tìm kiếm Lead đa kênh và tối ưu hóa chuyển đổi tài khoản mục tiêu.',
    driveFolderUrl: GOOGLE_DRIVE_SLIDES_ROOT,
    embedUrl: 'https://drive.google.com/file/d/1CfZ9k5dZUm176DQ0Zax2lqOEYyET3cEq/preview',
    videoFileName: 'M02_Video04.mp4',
    videoEmbedUrl: 'https://drive.google.com/file/d/1vT8R_bzIP4Q83Imj5o6Zf4sfM06q5Fvh/preview',
  },

  // MODULE 03: Prospecting & Opportunity Management
  B07: {
    lessonId: 'B07',
    moduleId: 'M03',
    title: 'Bài 07: Thẩm định và xếp hạng cơ hội theo khung F-N-A-C-M',
    standardFileName: 'M03_B07_ThamDinhCoHoi_FNACM.pdf',
    description: 'Ma trận chấm điểm cơ hội Fit, Need, Authority, Commercials, Market Timing.',
    driveFolderUrl: GOOGLE_DRIVE_SLIDES_ROOT,
    embedUrl: 'https://drive.google.com/file/d/1TI4J9-7UqcLH25shNtqNodLKQSMsdCOg/preview',
    videoFileName: 'M03_Video01.mp4',
    videoEmbedUrl: 'https://drive.google.com/file/d/168rJ2zrWAoccpTvnLgBHROJcQ0vqfXnY/preview',
  },
  B08: {
    lessonId: 'B08',
    moduleId: 'M03',
    title: 'Bài 08: Chiến lược nuôi dưỡng phễu và Follow-up đa kênh',
    standardFileName: 'M03_B08_QuanTriPipeline_FollowUp.pdf',
    description: 'Xây dựng kịch bản chăm sóc Lead và quản trị tốc độ dòng phễu Pipeline.',
    driveFolderUrl: GOOGLE_DRIVE_SLIDES_ROOT,
    embedUrl: 'https://drive.google.com/file/d/1G5dMtEzx9Tf60xW-Kg-g_Dxsa0WsPhGP/preview',
    videoFileName: 'M03_Video02.mp4',
    videoEmbedUrl: 'https://drive.google.com/file/d/1SRLAB_tBtagBRQHOnIhWjuxxGfLSvtkI/preview',
  },

  // MODULE 04: Proposal, Negotiation & Safe Closing
  B09: {
    lessonId: 'B09',
    moduleId: 'M04',
    title: 'Bài 09: Kỹ thuật làm rõ yêu cầu khách hàng theo chuẩn P-B-T-P-C',
    standardFileName: 'M04_B09_LamRoYeuCau_PBTPC.pdf',
    description: '5 khía cạnh thẩm định yêu cầu: Product, Budget, Timeline, Payment, Compliance.',
    driveFolderUrl: GOOGLE_DRIVE_SLIDES_ROOT,
    embedUrl: 'https://drive.google.com/file/d/1raoWlwz3ECU6EBFvHtYdslFJi4_Kvxvp/preview',
    videoFileName: 'M04_Video01.mp4',
    videoEmbedUrl: 'https://drive.google.com/file/d/10pE54fNd_Ewp7yHJE7mmeVt-ZcHGU3WR/preview',
  },
  B10: {
    lessonId: 'B10',
    moduleId: 'M04',
    title: 'Bài 10: Xây dựng báo giá TCO và nghệ thuật định giá chim mồi (Decoy Pricing)',
    standardFileName: 'M04_B10_BaoGiaTCO_ChimMoi.pdf',
    description: 'Bóc tách chi phí Landed Cost, phí kiểm định SGS và cấu trúc 3 gói chào giá.',
    driveFolderUrl: GOOGLE_DRIVE_SLIDES_ROOT,
    embedUrl: 'https://drive.google.com/file/d/1-ZYDoECdZyYXUdo6OQWWDg7uXwrWPyWC/preview',
    videoFileName: 'M04_Video02.mp4',
    videoEmbedUrl: 'https://drive.google.com/file/d/10pE54fNd_Ewp7yHJE7mmeVt-ZcHGU3WR/preview',
  },
  B11: {
    lessonId: 'B11',
    moduleId: 'M04',
    title: 'Bài 11: Nghệ thuật đàm phán thương mại và nguyên tắc Give–Take',
    standardFileName: 'M04_B11_DamPhanGiveTake.pdf',
    description: 'Ngân hàng Concession Give–Take Bank và kỹ thuật Deal Desk bảo vệ biên lợi nhuận.',
    driveFolderUrl: GOOGLE_DRIVE_SLIDES_ROOT,
    embedUrl: 'https://drive.google.com/file/d/1DctwSitUI4Ox2yxsT4VrrGvvxjw7svUf/preview',
    videoFileName: 'M04_Video03.mp4',
    videoEmbedUrl: 'https://drive.google.com/file/d/1Mv7YjJilyZYP7kkrS5TJcj2bnM6io4Lk/preview',
  },
  B12: {
    lessonId: 'B12',
    moduleId: 'M04',
    title: 'Bài 12: Kiểm soát rủi ro hợp đồng, thanh toán quốc tế và chốt deal an toàn',
    standardFileName: 'M04_B12_KiemSoatRuiRo_Closing.pdf',
    description: 'Bộ rà soát Safe Order Checklist và phòng ngừa rủi ro BEC / L/C giả mạo.',
    driveFolderUrl: GOOGLE_DRIVE_SLIDES_ROOT,
    embedUrl: 'https://drive.google.com/file/d/1FUi5mgeKuw4P4581ERcKF_iIGC3yolTM/preview',
    videoFileName: 'M04_Video04.mp4',
    videoEmbedUrl: 'https://drive.google.com/file/d/1FcnnEBMi7jw57qNdLDeqoF_1l4SrKr3u/preview',
  },

  // MODULE 05: Execution, Recovery & Account Growth
  B13: {
    lessonId: 'B13',
    moduleId: 'M05',
    title: 'Bài 13: Bàn giao nội bộ, thiết lập SLA và quản trị rủi ro vận hành',
    standardFileName: 'M05_B13_BanGiaoVanHanh_SLA.pdf',
    description: 'Internal SLA 5 điểm chạm và kiểm soát các mốc Point of No Return 🔒.',
    driveFolderUrl: GOOGLE_DRIVE_SLIDES_ROOT,
    embedUrl: 'https://drive.google.com/file/d/1JqN-p3ALh82n2l_ti6hkC8UWTXyvKyGt/preview',
    videoFileName: 'M05_Video01.mp4',
    videoEmbedUrl: 'https://drive.google.com/file/d/1gezq6XHlD74ASGV6x8kNfb-q0w8VF1Uh/preview',
  },
  B14: {
    lessonId: 'B14',
    moduleId: 'M05',
    title: 'Bài 14: Xử lý sự cố, khiếu nại (Claim) và khôi phục niềm tin theo khung CAPA',
    standardFileName: 'M05_B14_XuLyKhungHoang_CAPA.pdf',
    description: 'Khung phản ứng CAPA 3 bước (Containment, 5-Why Root Cause, Preventive Action).',
    driveFolderUrl: GOOGLE_DRIVE_SLIDES_ROOT,
    embedUrl: 'https://drive.google.com/file/d/1CP9I8BbH0nJ8N3Q-vwnu0JNt6_xQDtha/preview',
    videoFileName: 'M05_Video02.mp4',
    videoEmbedUrl: 'https://drive.google.com/file/d/1gezq6XHlD74ASGV6x8kNfb-q0w8VF1Uh/preview',
  },
  B15: {
    lessonId: 'B15',
    moduleId: 'M05',
    title: 'Bài 15: Chiến lược gia tăng Share of Wallet và xây dựng kế hoạch JBP',
    standardFileName: 'M05_B15_TangTruongTaiKhoan_JBP.pdf',
    description: 'Mở rộng thị phần ví khách hàng, Trust Score Gate và cam kết đối tác chiến lược JBP.',
    driveFolderUrl: GOOGLE_DRIVE_SLIDES_ROOT,
    embedUrl: 'https://drive.google.com/file/d/1jtv6Wq93wtpZsVYa8W0dB1_zgTxlUSXm/preview',
    videoFileName: 'M05_Video03.mp4',
    videoEmbedUrl: 'https://drive.google.com/file/d/138U_vUNsdXOPuloBwMnI6ad4stZ1ib24/preview',
  },
};

export function getLessonSlideEmbedUrl(lessonId: string): string {
  const material = COURSE_MATERIALS[lessonId];
  return material?.embedUrl || GOOGLE_DRIVE_EMBED_FOLDER;
}

export function getLessonVideoEmbedUrl(lessonId: string): string | undefined {
  const material = COURSE_MATERIALS[lessonId];
  return material?.videoEmbedUrl;
}

export function getLessonStandardFileName(lessonId: string): string {
  const material = COURSE_MATERIALS[lessonId];
  return material?.standardFileName || `${lessonId}_Slide.pdf`;
}

export function openCourseSlide(lessonId: string): void {
  const embedUrl = getLessonSlideEmbedUrl(lessonId);
  window.open(embedUrl, '_blank');
}


