export interface StudentModuleDetail {
  moduleId: 'M01' | 'M02' | 'M03' | 'M04' | 'M05' | 'CAPSTONE';
  title: string;
  weight: number; // % trọng số
  maxScore: number;
  status: 'submitted' | 'draft' | 'not_started' | 'reviewed';
  submittedAt?: string;
  score?: number;
  formData: Record<string, any>;
}

export interface RubricCriteriaScore {
  id: string;
  name: string;
  description: string;
  relatedSheet: string;
  maxScore: number;
  score: number;
  note?: string;
}

export interface StudentSubmissionSummary {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  cohort: string;
  industry: string;
  avatarColor: string;
  registeredAt: string;
  totalScore: number;
  gradeStatus: 'distinction' | 'passed' | 'needs_revision' | 'pending';
  isEvaluated: boolean;
  instructorNote: string;
  evaluatedAt?: string;
  modules: {
    M01: StudentModuleDetail;
    M02: StudentModuleDetail;
    M03: StudentModuleDetail;
    M04: StudentModuleDetail;
    M05: StudentModuleDetail;
    CAPSTONE: StudentModuleDetail;
    PDP: {
      maxScore: number;
      score: number;
      status: 'submitted' | 'pending';
      reflectionText: string;
      plan30Days: string;
      plan60Days: string;
      plan90Days: string;
    };
  };
  rubricScores: RubricCriteriaScore[];
}

export const DEFAULT_RUBRIC_CRITERIA: RubricCriteriaScore[] = [
  {
    id: 'crit_1',
    name: 'Mindset & Customer-centric',
    description: 'Hiểu rõ giá trị mang lại cho Buyer (Value Creation), giảm thiểu rủi ro (Risk Reduction) và trải nghiệm mua hàng B2B.',
    relatedSheet: 'M01 (Sheet 02)',
    maxScore: 10,
    score: 0,
    note: ''
  },
  {
    id: 'crit_2',
    name: 'Market & Customer Understanding',
    description: 'Biết scan thị trường mục tiêu, chọn phân khúc ngách, xác định ICP và hồ sơ Buyer đa tầng quyền lực (Buyer Map).',
    relatedSheet: 'M02 (Sheet 03)',
    maxScore: 10,
    score: 0,
    note: ''
  },
  {
    id: 'crit_3',
    name: 'Prospecting & Qualification',
    description: 'Biết phân loại lead/cơ hội theo ma trận F-N-A-C-M, tính Access Score và phân bổ nguồn lực tiếp cận đúng đối tượng.',
    relatedSheet: 'M03 (Sheet 04)',
    maxScore: 10,
    score: 0,
    note: ''
  },
  {
    id: 'crit_4',
    name: 'Discovery & Clarification',
    description: 'Hỏi đúng và làm rõ 5 yêu cầu cốt lõi P-B-T-P-C, điều kiện Incoterms 2020, thanh toán và chứng từ kiểm định.',
    relatedSheet: 'M04 (Sheet 05)',
    maxScore: 10,
    score: 0,
    note: ''
  },
  {
    id: 'crit_5',
    name: 'Proposal / Quotation Strategy',
    description: 'Báo giá đa tầng có hiệu ứng chim mồi (Decoy Effect) & neo giá (Anchoring), phân tích Landed Cost & TCO Benchmark rõ ràng.',
    relatedSheet: 'M04 (Sheet 06)',
    maxScore: 10,
    score: 0,
    note: ''
  },
  {
    id: 'crit_6',
    name: 'Negotiation & Safe Closing',
    description: 'Đàm phán Give–Take bảo vệ biên lợi nhuận, quy tắc đánh đổi (Trade-off) và rà soát đủ 3 bước Safe Order Checklist.',
    relatedSheet: 'M04 (Sheet 07-08)',
    maxScore: 10,
    score: 0,
    note: ''
  },
  {
    id: 'crit_7',
    name: 'Execution Control & Milestones',
    description: 'Thiết lập cam kết SLA nội bộ, quản trị tiến độ giao hàng, kiểm soát mốc Point of No Return và thủ tục Logistics.',
    relatedSheet: 'M05 (Sheet 09)',
    maxScore: 10,
    score: 0,
    note: ''
  },
  {
    id: 'crit_8',
    name: 'Issue Recovery & Crisis Management',
    description: 'Phân loại sự cố, xử lý phản ánh email khách hàng chuyên nghiệp, giữ vững nguyên tắc pháp lý có kiểm định SGS độc lập.',
    relatedSheet: 'M05 (Sheet 09/13)',
    maxScore: 10,
    score: 0,
    note: ''
  },
  {
    id: 'crit_9',
    name: 'Account Growth & JBP Strategy',
    description: 'Khai thác cơ hội sau bán, lập kế hoạch JBP theo quý, đo lường Share of Wallet và duy trì Trust Score trên 50/100.',
    relatedSheet: 'M05 (Sheet 09/10)',
    maxScore: 10,
    score: 0,
    note: ''
  },
  {
    id: 'crit_10',
    name: 'Communication Quality & Synthesis',
    description: 'Đóng gói trọn vẹn 3 Playbook tại Capstone, câu từ mạch lạc, tính toán số liệu chính xác và phản tư sâu sắc.',
    relatedSheet: 'Capstone (Sheet 10-11)',
    maxScore: 10,
    score: 0,
    note: ''
  }
];

export const INITIAL_MOCK_STUDENTS: StudentSubmissionSummary[] = [
  {
    id: 'sub_001',
    studentId: 'usr_nam_01',
    fullName: 'Nguyễn Hoàng Nam',
    email: 'nam.nguyen@vietagro-export.com',
    cohort: 'K08 - Sales XK B2B Thực Chiến',
    industry: 'Gạo ST25 & Nông sản chế biến',
    avatarColor: '#3b82f6',
    registeredAt: '2026-08-10',
    totalScore: 94.5,
    gradeStatus: 'distinction',
    isEvaluated: true,
    evaluatedAt: '2026-09-28',
    instructorNote: 'Bài làm xuất sắc, am hiểu sâu sắc về rào cản kỹ thuật EVFTA và ma trận TCO. Bản báo giá 3 tầng Decoy rất thuyết phục. Đề xuất phát huy kế hoạch mở rộng thị trường Đức.',
    modules: {
      M01: {
        moduleId: 'M01',
        title: 'Mindset & Foundation',
        weight: 5,
        maxScore: 5,
        score: 5,
        status: 'reviewed',
        submittedAt: '2026-08-15',
        formData: {
          competency_radar: {
            market_research: 4.5,
            icp_definition: 4.0,
            cold_outreach: 4.2,
            qualification: 4.8,
            technical_clarification: 4.5,
            tco_costing: 5.0,
            tiered_proposal: 4.8,
            win_win_negotiation: 4.5,
            risk_clearance: 5.0,
            sla_execution: 4.6,
            jbp_growth: 4.4
          },
          mad_libs: {
            input1: 'Tôi là B2B Sales Leader chuyên trách xuất khẩu Gạo đặc sản ST25 và Nông sản hữu cơ sang châu Âu.',
            input2: 'Mục tiêu trong 90 ngày tới là chốt thành công 2 đơn hàng thử nghiệm và 1 hợp đồng dài hạn 5 container 20ft sang thị trường Đức và Hà Lan.',
            input3: 'Tôi sẽ hiện thực hóa bằng quy trình sàng lọc kỹ thuật MRLs dư lượng thuốc BVTV và thanh toán 100% bằng Irrevocable L/C at sight.'
          }
        }
      },
      M02: {
        moduleId: 'M02',
        title: 'Market & ICP Understanding',
        weight: 15,
        maxScore: 15,
        score: 14.5,
        status: 'reviewed',
        submittedAt: '2026-08-22',
        formData: {
          targetMarkets: [
            {
              country: 'Đức (Germany)',
              segment: 'Chuỗi siêu thị thực phẩm Á - Âu & Nhà phân phối Horeca hữu cơ',
              route: 'Nhập khẩu trực tiếp qua nhà phân phối sỉ tại Hamburg',
              tariffs: 'EVFTA Form EUR.1 thuế 0% theo hạn ngạch 80.000 tấn gạo thơm',
              barriers: 'Kiểm soát nghiêm ngặt dư lượng Aflatoxin, Glyphosate và kim loại nặng chì/cadimi'
            },
            {
              country: 'UAE (Dubai)',
              segment: 'Hệ thống siêu thị cao cấp Lulu & Food Service',
              route: 'Bán buôn qua Trading Hub tại Cảng Jebel Ali',
              tariffs: 'Thuế MFN 5%, yêu cầu bắt buộc Chứng nhận Halal quốc tế',
              barriers: 'Cạnh tranh gắt gao về giá từ gạo Basmati Ấn Độ và Jasmine Thái Lan'
            }
          ],
          buyerMap: [
            { role: 'Head of Procurement', name: 'Markus Weber', authority: 'Người quyết định ngân sách & đàm phán hợp đồng', pain: 'Sợ trễ tiến độ vụ mùa Giáng sinh và rủi ro tàu chậm chuyển tải' },
            { role: 'QA / Compliance Manager', name: 'Dr. Sarah Keller', authority: 'Người phủ quyết kỹ thuật', pain: 'Sợ mẫu test tại cảng đến có dư lượng thuốc BVTV vượt ngưỡng EU 0.01mg/kg' }
          ]
        }
      },
      M03: {
        moduleId: 'M03',
        title: 'Lead Sourcing & Qualification',
        weight: 15,
        maxScore: 15,
        score: 14.0,
        status: 'reviewed',
        submittedAt: '2026-08-30',
        formData: {
          targetAccounts: ['EuroFood Global GmbH (Germany)', 'Nordic Organic Direct (Sweden)', 'Al-Safwah Trading (UAE)'],
          fnacmScore: {
            fit: 9,
            need: 9,
            authority: 8,
            commercials: 8.5,
            marketTiming: 9
          },
          accessScore: 87,
          outreachPlan: 'Kênh LinkedIn InMail nhắm vào Procurement Manager kết hợp email gửi kèm báo cáo kiểm nghiệm SGS mẫu vụ hè thu 2026.'
        }
      },
      M04: {
        moduleId: 'M04',
        title: 'Proposal, Negotiation & Closing',
        weight: 20,
        maxScore: 20,
        score: 19.0,
        status: 'reviewed',
        submittedAt: '2026-09-12',
        formData: {
          clarification: {
            product: 'Gạo thơm ST25 vụ mới, độ ẩm <= 14%, tấm <= 5%, đóng gói túi chân không 1kg',
            budget: 'Mục tiêu của Buyer: <= 1,020 USD/MT CIF Hamburg',
            timeline: 'ETD cảng Cát Lái: 25/11/2026, ETA Hamburg: 28/12/2026',
            payment: '30% T/T đặt cọc khi ký HĐ, 70% Irrevocable L/C at sight qua ngân hàng top 1 Đức',
            compliance: 'Chứng thư kiểm định SGS tại cảng đi và chứng nhận C/O Form EUR.1 hợp lệ'
          },
          tcoCalculation: {
            fobPrice: 950,
            freight: 85,
            insurance: 6,
            tariffRate: '0% (EVFTA)',
            defectBuffer: 12,
            totalLandedCost: 1053,
            competitorLandedCost: 1140,
            netSavingsPercent: '7.6%'
          },
          proposals: {
            tierA: { name: 'Gói Tiết Kiệm (Chim mồi)', price: '980 USD/MT', moq: '25 MT (1 cont 20ft)', delivery: '45 ngày', desc: 'Bao PP dệt 25kg, không hút chân không' },
            tierB: { name: 'Gói Tiêu Chuẩn (Khuyên dùng ⭐)', price: '1,050 USD/MT', moq: '50 MT (2 cont 20ft)', delivery: '30 ngày', desc: 'Túi PA chân không 1kg, nhãn song ngữ Đức - Anh, tài trợ 50% chi phí kiểm nghiệm SGS' },
            tierC: { name: 'Gói Cao Cấp (VIP)', price: '1,180 USD/MT', moq: '100 MT', delivery: '25 ngày', desc: 'Độc quyền phân phối khu vực Nam Đức, hỗ trợ hồ sơ IFS Food' }
          },
          giveTake: 'Buyer yêu cầu giảm 3% đơn giá -> Đồng ý chiết khấu 2% kèm điều kiện tăng sản lượng lên 4 container và đặt cọc 40% thay vì 30%.',
          safeChecklist: { becVerified: true, localChargesConfirmed: true, carrierBookingClear: true }
        }
      },
      M05: {
        moduleId: 'M05',
        title: 'Execution, Recovery & Growth',
        weight: 15,
        maxScore: 15,
        score: 14.0,
        status: 'reviewed',
        submittedAt: '2026-09-20',
        formData: {
          internalSLA: 'Cam kết 5 mốc tiến độ nội bộ: Thu mua lúa (D+3), Xay xát & đóng gói (D+10), SGS giám định (D+14), Hun trùng tàu (D+17 - No Return), Bàn giao B/L (D+21).',
          crisisPlan: 'Sự cố giả định: 15 bao gạo bị ẩm do nước ngấm qua container. Quy trình: Yêu cầu chứng thư Lloyd/SGS tại Hamburg trong 24h, phát hành lô hàng bù từ kho đối tác tại Rotterdam trong 48h.',
          jbpStrategy: 'Kế hoạch JBP năm 2027: Mở rộng thêm 2 dòng sản phẩm Bún khô gạo lứt và Hạt sen sấy, đặt mục tiêu tăng trưởng doanh số 35%.'
        }
      },
      CAPSTONE: {
        moduleId: 'CAPSTONE',
        title: 'Final Capstone Playbooks',
        weight: 20,
        maxScore: 20,
        score: 19.0,
        status: 'reviewed',
        submittedAt: '2026-09-26',
        formData: {
          playbook1Summary: 'Chiến lược thâm nhập thị trường EU: Tập trung vào chứng nhận hữu cơ và lợi thế EVFTA.',
          playbook2Summary: 'Bản chào giá TCO đa tầng loại bỏ hoàn toàn đối thủ Thái Lan nhờ chiết khấu theo khối lượng.',
          playbook3Summary: 'Hệ thống giám sát SLA không trễ hẹn và bảo mật thanh toán L/C 100%.'
        }
      },
      PDP: {
        maxScore: 10,
        score: 9.0,
        status: 'submitted',
        reflectionText: 'Khóa học đã giúp tôi chuyển từ tư duy báo giá FOB đơn thuần sang tư duy làm rõ tổng chi phí sở hữu Landed Cost và đàm phán bảo vệ biên lợi nhuận.',
        plan30Days: 'Chuẩn hóa bộ hồ sơ kỹ thuật tiếng Anh và bảng tính TCO cho 3 mặt hàng chủ lực của công ty.',
        plan60Days: 'Triển khai cold outreach đến 50 nhà nhập khẩu nông sản mục tiêu tại Đức và Bỉ.',
        plan90Days: 'Chốt thành công tối thiểu 1 hợp đồng thương mại chính thức trị giá trên 100,000 USD.'
      }
    },
    rubricScores: [
      { id: 'crit_1', name: 'Mindset & Customer-centric', description: 'Hiểu rõ giá trị mang lại cho Buyer', relatedSheet: 'M01', maxScore: 10, score: 9.5, note: 'Tư duy lấy khách hàng làm trọng tâm rất rõ nét' },
      { id: 'crit_2', name: 'Market & Customer Understanding', description: 'Biết scan thị trường, chọn phân khúc', relatedSheet: 'M02', maxScore: 10, score: 9.5, note: 'Phân tích EVFTA và rào cản kỹ thuật rất chuẩn' },
      { id: 'crit_3', name: 'Prospecting & Qualification', description: 'Phân loại lead theo FNACM', relatedSheet: 'M03', maxScore: 10, score: 9.0, note: 'Tính toán Access Score hợp lý' },
      { id: 'crit_4', name: 'Discovery & Clarification', description: 'Làm rõ 5 yêu cầu cốt lõi P-B-T-P-C', relatedSheet: 'M04', maxScore: 10, score: 9.5, note: 'Bộ câu hỏi làm rõ rất thực chiến' },
      { id: 'crit_5', name: 'Proposal / Quotation Strategy', description: 'Báo giá đa tầng có Decoy Effect', relatedSheet: 'M04', maxScore: 10, score: 10.0, note: 'Báo giá 3 tầng xuất sắc, TCO rõ ràng' },
      { id: 'crit_6', name: 'Negotiation & Safe Closing', description: 'Đàm phán Give-Take và Safe Order', relatedSheet: 'M04', maxScore: 10, score: 9.5, note: 'Quy tắc Give-Take bảo vệ tốt biên lợi nhuận' },
      { id: 'crit_7', name: 'Execution Control & Milestones', description: 'Cam kết SLA nội bộ và No-Return', relatedSheet: 'M05', maxScore: 10, score: 9.0, note: 'Mốc No Return xác định chính xác' },
      { id: 'crit_8', name: 'Issue Recovery & Crisis Management', description: 'Xử lý khủng hoảng có kiểm định SGS', relatedSheet: 'M05', maxScore: 10, score: 9.5, note: 'Phản ứng nhanh, bảo vệ quyền lợi pháp lý' },
      { id: 'crit_9', name: 'Account Growth & JBP Strategy', description: 'Kế hoạch JBP và Share of Wallet', relatedSheet: 'M05', maxScore: 10, score: 9.5, note: 'Chiến lược gia tăng giá trị dài hạn tốt' },
      { id: 'crit_10', name: 'Communication Quality & Synthesis', description: 'Đóng gói trọn vẹn 3 Playbook', relatedSheet: 'Capstone', maxScore: 10, score: 9.5, note: 'Ngôn từ chuyên nghiệp, cấu trúc báo cáo chặt chẽ' }
    ]
  },
  {
    id: 'sub_002',
    studentId: 'usr_thao_02',
    fullName: 'Trần Thị Thu Thảo',
    email: 'thao.tran@seafood-vina.vn',
    cohort: 'K08 - Sales XK B2B Thực Chiến',
    industry: 'Thủy sản đông lạnh (Tôm thẻ & Cá tra)',
    avatarColor: '#10b981',
    registeredAt: '2026-08-11',
    totalScore: 86.0,
    gradeStatus: 'distinction',
    isEvaluated: true,
    evaluatedAt: '2026-09-29',
    instructorNote: 'Nắm rất vững các điều khoản Incoterms CIF cảng Tokyo và tiêu chuẩn an toàn thực phẩm Nhật Bản. Cần đào sâu hơn ma trận Give-Take khi khách hàng đòi kéo dài hạn mức công nợ.',
    modules: {
      M01: { moduleId: 'M01', title: 'Mindset & Foundation', weight: 5, maxScore: 5, score: 4.5, status: 'reviewed', submittedAt: '2026-08-16', formData: { mad_libs: { input1: 'Chuyên viên Sales xuất khẩu Thủy hải sản cấp đông sang Nhật Bản và Hàn Quốc.', input2: 'Ký được 2 hợp đồng định kỳ mỗi tháng 1 container 40ft tôm Nobashi.', input3: 'Thông qua việc chứng minh quy trình kiểm soát vi sinh và kháng sinh nghiêm ngặt.' } } },
      M02: { moduleId: 'M02', title: 'Market & ICP Understanding', weight: 15, maxScore: 15, score: 13.0, status: 'reviewed', submittedAt: '2026-08-24', formData: { targetMarkets: [{ country: 'Nhật Bản (Japan)', segment: 'Chuỗi nhà hàng Bento & Khách sạn', route: 'Bán buôn qua Trading House Marubeni' }] } },
      M03: { moduleId: 'M03', title: 'Lead Sourcing & Qualification', weight: 15, maxScore: 15, score: 13.0, status: 'reviewed', submittedAt: '2026-09-01', formData: { accessScore: 82 } },
      M04: { moduleId: 'M04', title: 'Proposal, Negotiation & Closing', weight: 20, maxScore: 20, score: 17.0, status: 'reviewed', submittedAt: '2026-09-14', formData: { tcoCalculation: { netSavingsPercent: '6.2%' } } },
      M05: { moduleId: 'M05', title: 'Execution, Recovery & Growth', weight: 15, maxScore: 15, score: 13.0, status: 'reviewed', submittedAt: '2026-09-22', formData: {} },
      CAPSTONE: { moduleId: 'CAPSTONE', title: 'Final Capstone Playbooks', weight: 20, maxScore: 20, score: 17.5, status: 'reviewed', submittedAt: '2026-09-27', formData: {} },
      PDP: { maxScore: 10, score: 8.0, status: 'submitted', reflectionText: 'Đã hoàn thiện tư duy bán giải pháp chuỗi cung ứng thay vì chỉ cạnh tranh giá tôm nguyên liệu.', plan30Days: 'Rà soát chứng chỉ ASC/BAP', plan60Days: 'Tham gia hội chợ triển lãm Seafood Expo Tokyo', plan90Days: 'Chốt hợp đồng đầu tiên với Trading House' }
    },
    rubricScores: [
      { id: 'crit_1', name: 'Mindset & Customer-centric', description: 'Hiểu rõ giá trị mang lại cho Buyer', relatedSheet: 'M01', maxScore: 10, score: 8.5, note: 'Khá tốt' },
      { id: 'crit_2', name: 'Market & Customer Understanding', description: 'Biết scan thị trường, chọn phân khúc', relatedSheet: 'M02', maxScore: 10, score: 8.5, note: 'Am hiểu thị trường Nhật' },
      { id: 'crit_3', name: 'Prospecting & Qualification', description: 'Phân loại lead theo FNACM', relatedSheet: 'M03', maxScore: 10, score: 8.5, note: 'Tốt' },
      { id: 'crit_4', name: 'Discovery & Clarification', description: 'Làm rõ 5 yêu cầu cốt lõi P-B-T-P-C', relatedSheet: 'M04', maxScore: 10, score: 9.0, note: 'Rất rõ ràng về tiêu chuẩn kỹ thuật' },
      { id: 'crit_5', name: 'Proposal / Quotation Strategy', description: 'Báo giá đa tầng có Decoy Effect', relatedSheet: 'M04', maxScore: 10, score: 8.5, note: 'Cần làm rõ thêm option Decoy' },
      { id: 'crit_6', name: 'Negotiation & Safe Closing', description: 'Đàm phán Give-Take và Safe Order', relatedSheet: 'M04', maxScore: 10, score: 8.0, note: 'Cần chú ý điều khoản công nợ' },
      { id: 'crit_7', name: 'Execution Control & Milestones', description: 'Cam kết SLA nội bộ và No-Return', relatedSheet: 'M05', maxScore: 10, score: 9.0, note: 'Quy trình lạnh D-18 tốt' },
      { id: 'crit_8', name: 'Issue Recovery & Crisis Management', description: 'Xử lý khủng hoảng có kiểm định SGS', relatedSheet: 'M05', maxScore: 10, score: 8.5, note: 'Đạt yêu cầu' },
      { id: 'crit_9', name: 'Account Growth & JBP Strategy', description: 'Kế hoạch JBP và Share of Wallet', relatedSheet: 'M05', maxScore: 10, score: 8.5, note: 'Khả thi' },
      { id: 'crit_10', name: 'Communication Quality & Synthesis', description: 'Đóng gói trọn vẹn 3 Playbook', relatedSheet: 'Capstone', maxScore: 10, score: 9.0, note: 'Bản nộp đầy đủ, thẩm mỹ' }
    ]
  },
  {
    id: 'sub_003',
    studentId: 'usr_khang_03',
    fullName: 'Lê Minh Khang',
    email: 'khang.le@vinagarment-b2b.com',
    cohort: 'K08 - Sales XK B2B Thực Chiến',
    industry: 'Dệt may & May mặc kỹ thuật',
    avatarColor: '#f59e0b',
    registeredAt: '2026-08-12',
    totalScore: 78.0,
    gradeStatus: 'passed',
    isEvaluated: true,
    evaluatedAt: '2026-10-01',
    instructorNote: 'Đã hoàn thành tốt phần phân tích chi phí FOB và quy cách vải. Tuy nhiên phần cam kết SLA nội bộ ở Module 5 cần bổ sung mốc thời gian sản xuất mẫu vải lab-dip cụ thể hơn.',
    modules: {
      M01: { moduleId: 'M01', title: 'Mindset & Foundation', weight: 5, maxScore: 5, score: 4.0, status: 'reviewed', submittedAt: '2026-08-17', formData: {} },
      M02: { moduleId: 'M02', title: 'Market & ICP Understanding', weight: 15, maxScore: 15, score: 12.0, status: 'reviewed', submittedAt: '2026-08-25', formData: {} },
      M03: { moduleId: 'M03', title: 'Lead Sourcing & Qualification', weight: 15, maxScore: 15, score: 11.5, status: 'reviewed', submittedAt: '2026-09-03', formData: {} },
      M04: { moduleId: 'M04', title: 'Proposal, Negotiation & Closing', weight: 20, maxScore: 20, score: 15.5, status: 'reviewed', submittedAt: '2026-09-17', formData: {} },
      M05: { moduleId: 'M05', title: 'Execution, Recovery & Growth', weight: 15, maxScore: 15, score: 11.5, status: 'reviewed', submittedAt: '2026-09-24', formData: {} },
      CAPSTONE: { moduleId: 'CAPSTONE', title: 'Final Capstone Playbooks', weight: 20, maxScore: 20, score: 16.0, status: 'reviewed', submittedAt: '2026-09-30', formData: {} },
      PDP: { maxScore: 10, score: 7.5, status: 'submitted', reflectionText: 'Học được cách xây dựng đề xuất giá trị vượt ra ngoài việc gia công cắt may thuần túy (CMT sang FOB/ODM).', plan30Days: 'Chuẩn hóa quy trình gửi mẫu', plan60Days: 'Tiếp cận 30 thương hiệu thời trang Mỹ', plan90Days: 'Đạt đơn hàng mẫu đầu tiên' }
    },
    rubricScores: [
      { id: 'crit_1', name: 'Mindset & Customer-centric', description: 'Hiểu rõ giá trị mang lại cho Buyer', relatedSheet: 'M01', maxScore: 10, score: 8.0, note: 'Tốt' },
      { id: 'crit_2', name: 'Market & Customer Understanding', description: 'Biết scan thị trường, chọn phân khúc', relatedSheet: 'M02', maxScore: 10, score: 8.0, note: 'Đạt' },
      { id: 'crit_3', name: 'Prospecting & Qualification', description: 'Phân loại lead theo FNACM', relatedSheet: 'M03', maxScore: 10, score: 7.5, note: 'Cần làm rõ Authority' },
      { id: 'crit_4', name: 'Discovery & Clarification', description: 'Làm rõ 5 yêu cầu cốt lõi P-B-T-P-C', relatedSheet: 'M04', maxScore: 10, score: 8.0, note: 'Tốt' },
      { id: 'crit_5', name: 'Proposal / Quotation Strategy', description: 'Báo giá đa tầng có Decoy Effect', relatedSheet: 'M04', maxScore: 10, score: 7.5, note: 'Khá' },
      { id: 'crit_6', name: 'Negotiation & Safe Closing', description: 'Đàm phán Give-Take và Safe Order', relatedSheet: 'M04', maxScore: 10, score: 8.0, note: 'Đạt yêu cầu' },
      { id: 'crit_7', name: 'Execution Control & Milestones', description: 'Cam kết SLA nội bộ và No-Return', relatedSheet: 'M05', maxScore: 10, score: 7.5, note: 'Cần bổ sung mốc lab-dip' },
      { id: 'crit_8', name: 'Issue Recovery & Crisis Management', description: 'Xử lý khủng hoảng có kiểm định SGS', relatedSheet: 'M05', maxScore: 10, score: 8.0, note: 'Đạt' },
      { id: 'crit_9', name: 'Account Growth & JBP Strategy', description: 'Kế hoạch JBP và Share of Wallet', relatedSheet: 'M05', maxScore: 10, score: 7.5, note: 'Khá' },
      { id: 'crit_10', name: 'Communication Quality & Synthesis', description: 'Đóng gói trọn vẹn 3 Playbook', relatedSheet: 'Capstone', maxScore: 10, score: 8.0, note: 'Hoàn thành' }
    ]
  },
  {
    id: 'sub_004',
    studentId: 'usr_quynhanh_04',
    fullName: 'Phạm Quỳnh Anh',
    email: 'quynhanh.pham@handicraft-green.vn',
    cohort: 'K08 - Sales XK B2B Thực Chiến',
    industry: 'Thủ công mỹ nghệ & Mây tre đan',
    avatarColor: '#ec4899',
    registeredAt: '2026-08-14',
    totalScore: 0,
    gradeStatus: 'pending',
    isEvaluated: false,
    instructorNote: '',
    modules: {
      M01: { moduleId: 'M01', title: 'Mindset & Foundation', weight: 5, maxScore: 5, status: 'submitted', submittedAt: '2026-08-18', formData: { mad_libs: { input1: 'Chuyên viên xuất khẩu sản phẩm thủ công mây tre đan xuất khẩu sang Bắc Âu.', input2: 'Ký được 3 hợp đồng cung ứng đồ trang trí nội thất cho các chuỗi bán lẻ.', input3: 'Thông qua việc đạt chứng nhận BSCI và kiểm định chống mối mọt hữu cơ.' } } },
      M02: { moduleId: 'M02', title: 'Market & ICP Understanding', weight: 15, maxScore: 15, status: 'submitted', submittedAt: '2026-08-28', formData: {} },
      M03: { moduleId: 'M03', title: 'Lead Sourcing & Qualification', weight: 15, maxScore: 15, status: 'submitted', submittedAt: '2026-09-05', formData: {} },
      M04: { moduleId: 'M04', title: 'Proposal, Negotiation & Closing', weight: 20, maxScore: 20, status: 'submitted', submittedAt: '2026-09-21', formData: {} },
      M05: { moduleId: 'M05', title: 'Execution, Recovery & Growth', weight: 15, maxScore: 15, status: 'draft', formData: {} },
      CAPSTONE: { moduleId: 'CAPSTONE', title: 'Final Capstone Playbooks', weight: 20, maxScore: 20, status: 'draft', formData: {} },
      PDP: { maxScore: 10, score: 0, status: 'pending', reflectionText: 'Đang trong quá trình hoàn thiện bài tập Capstone và phản tư PDP.', plan30Days: '', plan60Days: '', plan90Days: '' }
    },
    rubricScores: DEFAULT_RUBRIC_CRITERIA.map(c => ({ ...c }))
  },
  {
    id: 'sub_005',
    studentId: 'usr_bao_05',
    fullName: 'Đặng Quốc Bảo',
    email: 'bao.dang@wood-furniture.com.vn',
    cohort: 'K08 - Sales XK B2B Thực Chiến',
    industry: 'Đồ gỗ ngoài trời (Outdoor Furniture)',
    avatarColor: '#8b5cf6',
    registeredAt: '2026-08-15',
    totalScore: 72.0,
    gradeStatus: 'passed',
    isEvaluated: true,
    evaluatedAt: '2026-10-02',
    instructorNote: 'Ý tưởng sản phẩm gỗ Teak FSC tốt. Cần rèn luyện thêm kỹ năng xây dựng ma trận đối thủ TCO và quy tắc phòng vệ thanh toán khi làm việc với Buyer Châu Âu.',
    modules: {
      M01: { moduleId: 'M01', title: 'Mindset & Foundation', weight: 5, maxScore: 5, score: 3.5, status: 'reviewed', submittedAt: '2026-08-19', formData: {} },
      M02: { moduleId: 'M02', title: 'Market & ICP Understanding', weight: 15, maxScore: 15, score: 11.0, status: 'reviewed', submittedAt: '2026-08-29', formData: {} },
      M03: { moduleId: 'M03', title: 'Lead Sourcing & Qualification', weight: 15, maxScore: 15, score: 11.0, status: 'reviewed', submittedAt: '2026-09-08', formData: {} },
      M04: { moduleId: 'M04', title: 'Proposal, Negotiation & Closing', weight: 20, maxScore: 20, score: 14.5, status: 'reviewed', submittedAt: '2026-09-23', formData: {} },
      M05: { moduleId: 'M05', title: 'Execution, Recovery & Growth', weight: 15, maxScore: 15, score: 11.0, status: 'reviewed', submittedAt: '2026-09-28', formData: {} },
      CAPSTONE: { moduleId: 'CAPSTONE', title: 'Final Capstone Playbooks', weight: 20, maxScore: 20, score: 14.0, status: 'reviewed', submittedAt: '2026-10-02', formData: {} },
      PDP: { maxScore: 10, score: 7.0, status: 'submitted', reflectionText: 'Học được cách tính toán rủi ro container bị cong vênh do độ ẩm khi đi qua xích đạo.', plan30Days: 'Kiểm tra độ ẩm gỗ', plan60Days: 'Gửi catalog mới cho khách Anh', plan90Days: 'Tham gia hội chợ CIFF' }
    },
    rubricScores: [
      { id: 'crit_1', name: 'Mindset & Customer-centric', description: 'Hiểu rõ giá trị mang lại cho Buyer', relatedSheet: 'M01', maxScore: 10, score: 7.0, note: 'Đạt yêu cầu' },
      { id: 'crit_2', name: 'Market & Customer Understanding', description: 'Biết scan thị trường, chọn phân khúc', relatedSheet: 'M02', maxScore: 10, score: 7.5, note: 'Khá' },
      { id: 'crit_3', name: 'Prospecting & Qualification', description: 'Phân loại lead theo FNACM', relatedSheet: 'M03', maxScore: 10, score: 7.5, note: 'Đạt' },
      { id: 'crit_4', name: 'Discovery & Clarification', description: 'Làm rõ 5 yêu cầu cốt lõi P-B-T-P-C', relatedSheet: 'M04', maxScore: 10, score: 7.0, note: 'Cần chi tiết hơn' },
      { id: 'crit_5', name: 'Proposal / Quotation Strategy', description: 'Báo giá đa tầng có Decoy Effect', relatedSheet: 'M04', maxScore: 10, score: 7.5, note: 'Khá' },
      { id: 'crit_6', name: 'Negotiation & Safe Closing', description: 'Đàm phán Give-Take và Safe Order', relatedSheet: 'M04', maxScore: 10, score: 7.0, note: 'Cần chú ý điều khoản thanh toán' },
      { id: 'crit_7', name: 'Execution Control & Milestones', description: 'Cam kết SLA nội bộ và No-Return', relatedSheet: 'M05', maxScore: 10, score: 7.0, note: 'Đạt' },
      { id: 'crit_8', name: 'Issue Recovery & Crisis Management', description: 'Xử lý khủng hoảng có kiểm định SGS', relatedSheet: 'M05', maxScore: 10, score: 7.5, note: 'Khá' },
      { id: 'crit_9', name: 'Account Growth & JBP Strategy', description: 'Kế hoạch JBP và Share of Wallet', relatedSheet: 'M05', maxScore: 10, score: 7.0, note: 'Đạt' },
      { id: 'crit_10', name: 'Communication Quality & Synthesis', description: 'Đóng gói trọn vẹn 3 Playbook', relatedSheet: 'Capstone', maxScore: 10, score: 7.0, note: 'Cần hoàn thiện thêm' }
    ]
  }
];
