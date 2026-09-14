'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Copy, Check, ExternalLink, ArrowRight, CheckCircle2, 
  HelpCircle, Search, Layers, ShieldCheck, Database, Sliders, 
  Maximize2, X, ChevronRight, ChevronLeft, RefreshCw, Zap,
  Info, AlertTriangle, Briefcase, MousePointerClick
} from 'lucide-react';
import { useModuleStore } from '@/store/useModuleStore';

interface LinkedInPluginGuideProps {
  onClose?: () => void;
  isStandalone?: boolean;
}

export default function LinkedInPluginGuide({ onClose, isStandalone = false }: LinkedInPluginGuideProps) {
  const { getModuleData } = useModuleStore();

  // Step navigation (1, 2, 3, 4)
  const [activeStep, setActiveStep] = useState<number>(1);
  const [zoomedImg, setZoomedImg] = useState<{ src: string; alt: string; step: number } | null>(null);

  // Dynamic Prompt Builder fields for Step 4
  const [targetMarket, setTargetMarket] = useState('Mỹ, Châu Âu (EU), UAE, Nhật Bản');
  const [targetTitle, setTargetTitle] = useState('Import Director, Sourcing Manager, Procurement Head');
  const [productIndustry, setProductIndustry] = useState('Nông sản và gia vị: Quế, hồi, tiêu, điều');

  // Copy status
  const [copyStatus, setCopyStatus] = useState<'custom' | 'raw' | 'rcto' | null>(null);

  // Tự động kế thừa dữ liệu nếu học viên đã điền ở Module 02
  useEffect(() => {
    try {
      const m02Data: any = getModuleData('M02');
      if (m02Data) {
        if (m02Data.b03_target_market) {
          setTargetMarket(m02Data.b03_target_market);
        }
        if (m02Data.b04_buyer_map && Array.isArray(m02Data.b04_buyer_map) && m02Data.b04_buyer_map.length > 0) {
          const titles = m02Data.b04_buyer_map.map((b: any) => b.title || b.role).filter(Boolean).slice(0, 3).join(', ');
          if (titles) setTargetTitle(titles);
        }
      }
    } catch (err) {
      console.warn('Could not load M02 prefill data', err);
    }
  }, [getModuleData]);

  // Prompt đã điền biến số thực tế
  const generatedPrompt = `Bạn là Senior B2B Data Research Specialist và chuyên gia Growth Hacking, chuyên xây dựng chiến lược thu thập dữ liệu và trích xuất thông tin khách hàng từ LinkedIn phục vụ hoạt động xuất khẩu nông sản B2B. Hãy xây dựng một quy trình và prompt hoàn chỉnh để sử dụng ChatGPT (kết hợp các plugin hỗ trợ trích xuất web/dữ liệu) nhằm cào và chuẩn hóa danh sách khách hàng, người liên hệ tiềm năng trên LinkedIn.

Thông tin dự án cụ thể như sau:
- Thị trường mục tiêu: ${targetMarket || '[THỊ TRƯỜNG MỤC TIÊU]'}
- Chân dung khách hàng / Chức danh cần tìm: ${targetTitle || '[CHỨC DANH CẦN TÌM]'}
- Ngành hàng / Sản phẩm: ${productIndustry || '[NGÀNH HÀNG]'}`;

  // Prompt khung sườn gốc
  const rawPromptTemplate = `Bạn là Senior B2B Data Research Specialist và chuyên gia Growth Hacking, chuyên xây dựng chiến lược thu thập dữ liệu và trích xuất thông tin khách hàng từ LinkedIn phục vụ hoạt động xuất khẩu nông sản B2B. Hãy xây dựng một quy trình và prompt hoàn chỉnh để sử dụng ChatGPT (kết hợp các plugin hỗ trợ trích xuất web/dữ liệu) nhằm cào và chuẩn hóa danh sách khách hàng, người liên hệ tiềm năng trên LinkedIn.

Thông tin dự án cụ thể như sau:
Thị trường mục tiêu: [THỊ TRƯỜNG MỤC TIÊU]
Chân dung khách hàng / Chức danh cần tìm: [CHỨC DANH CẦN TÌM, ví dụ: Import Director, Sourcing Manager, Procurement Head]
Ngành hàng: [NGÀNH HÀNG, ví dụ: Quế, hồi, tiêu, điều]`;

  // Toàn văn tài liệu Prompt RCTO Framework
  const fullRCTODoc = `PROMPT RCTO

R — ROLE
Bạn là Senior B2B Data Research Specialist và chuyên gia Growth Hacking, có kinh nghiệm sâu rộng trong việc thiết kế cấu trúc thu thập dữ liệu (data scraping frameworks), chiến lược định hình chân dung khách hàng mục tiêu (ICP) và kỹ thuật trích xuất thông tin người liên hệ (contacts) từ các nền tảng mạng xã hội chuyên nghiệp như LinkedIn kết hợp với ChatGPT/AI plugins.

C — CONTEXT
Mục tiêu: Xây dựng một quy trình, cấu trúc prompt hoặc hướng dẫn chi tiết để sử dụng ChatGPT tích hợp plugin/công cụ nhằm cào dữ liệu khách hàng mục tiêu và danh sách người liên hệ (Decision Makers, Key Executives) trên LinkedIn.
Ngành hàng/Lĩnh vực áp dụng: Xuất khẩu nông sản và gia vị (quế, hồi, tiêu, điều, v.v.), phục vụ cho hoạt động phát triển thị trường B2B quốc tế (Export Sales & Market Development).
Dữ liệu đầu vào cần có từ người dùng: [THỊ TRƯỜNG MỤC TIÊU], [CHÂN DUNG KHÁCH HÀNG (ICP) HOẶC CHỨC DANH CẦN TÌM], [NGÀNH HÀNG/SẢN PHẨM CỤ THỂ].

T — TEMPLATE
1. Xác định Tiêu chí Lọc Khách hàng (Targeting Criteria): Xây dựng bộ lọc boolean/keywords chuẩn để tìm đúng công ty nhập khẩu, phân phối hoặc chế biến trên LinkedIn Sales Navigator.
2. Phương pháp Trích xuất (Extraction Method): Hướng dẫn cách kết hợp ChatGPT với các plugin/tiện ích mở rộng (như LinkMatch, PhantomBuster, Apollo, hoặc Web Scraper plugins) để thu thập dữ liệu doanh nghiệp và người liên hệ.
3. Cấu trúc Dữ liệu Đầu ra (Data Schema): Định dạng bảng chuẩn để lưu trữ thông tin (Company Name, Website, Contact Name, Title, LinkedIn URL, Email/Phone giả định hoặc verified, Notes).
4. Quy trình Từng bước (Step-by-Step Workflow): Từ khâu tìm kiếm, quét dữ liệu, làm sạch (data cleaning) đến phân loại nhóm ưu tiên tiếp cận.

O — OUTPUT & CONSTRAINTS
- Định dạng: Trình bày rõ ràng bằng các khối cấu trúc, bảng biểu (Markdown tables) và danh sách từng bước (bullet points).
- Ngôn ngữ: Tiếng Việt (các thuật ngữ kỹ thuật và tiêu chí LinkedIn giữ nguyên tiếng Anh để dễ thực thi).
- Tone of voice: Chuyên nghiệp, thực tế, logic, hướng dẫn cụ thể có thể áp dụng ngay vào vận hành sales xuất khẩu.
- Giới hạn: Không sử dụng các thủ thuật vi phạm nghiêm trọng chính sách bảo mật dữ liệu cá nhân (GDPR/CCPA); tập trung vào dữ liệu công khai trên mạng chuyên nghiệp.`;

  const handleCopy = (text: string, type: 'custom' | 'raw' | 'rcto') => {
    navigator.clipboard.writeText(text);
    setCopyStatus(type);
    setTimeout(() => setCopyStatus(null), 3000);
  };

  const stepsData = [
    {
      step: 1,
      title: 'Bước 01: Chọn Plugin trên Menu Trái',
      badge: 'Đăng nhập & Mở Store',
      description: 'Mở trình duyệt, đăng nhập vào tài khoản ChatGPT của bạn. Tìm và nhấp chọn mục "@ Plugin" ở thanh menu điều hướng bên trái giao diện.',
      imgSrc: '/images/tutorials/linkedin-plugin/step1-chatgpt-menu-plugin.png',
      alt: 'Bước 1: Chọn Plugin từ menu trái ChatGPT',
      mainAction: 'Đăng nhập vào ChatGPT trên trình duyệt. Tìm mục "@ Plugin" ở thanh sidebar bên trái và nhấp vào để mở kho tiện ích mở rộng.',
      businessNote: 'Mục Plugin cho phép ChatGPT kết nối với các công cụ bên ngoài theo thời gian thực, mở khóa khả năng quét và trích xuất hồ sơ doanh nghiệp trên mạng xã hội chuyên nghiệp LinkedIn.',
      proTip: 'Nếu không thấy thanh điều hướng bên trái, nhấp vào biểu tượng Sidebar Toggle ở góc trên cùng bên trái màn hình để mở rộng menu.',
      overlays: [
        {
          id: 'b1-item',
          top: '34%',
          left: '1.2%',
          width: '18%',
          height: '8%',
          label: '1️⃣ Nhấp vào "Plugin"',
          pulse: true,
        }
      ]
    },
    {
      step: 2,
      title: 'Bước 02: Tìm kiếm & Kích hoạt Plugin LinkedIn',
      badge: 'Cài đặt Plugin',
      description: 'Gõ từ khóa "linkedin" vào ô tìm kiếm ở góc trên bên phải. Tìm tiện ích chính thức "LinkedIn (Find the right professional)" và bấm dấu cộng (+) để cài đặt.',
      imgSrc: '/images/tutorials/linkedin-plugin/step2-search-install-linkedin.png',
      alt: 'Bước 2: Tìm kiếm và cài đặt LinkedIn plugin',
      mainAction: 'Nhập "linkedin" vào thanh tìm kiếm ở góc trên bên phải. Trong danh sách kết quả, tìm tiện ích "LinkedIn" (mô tả "Find the right professional") và nhấp dấu (+) để kích hoạt.',
      businessNote: 'Chọn đúng plugin chính thức chuyên về tìm kiếm và trích xuất hồ sơ nhân sự/doanh nghiệp. Tránh cài nhầm các plugin chỉ chuyên viết content (như Headline Rewriter hay Text Styler).',
      proTip: 'Sau khi bấm dấu (+), hệ thống sẽ cấp quyền truy cập. Bạn có thể cài đặt thêm các plugin bổ trợ (như DataForB2B) nếu cần cào dữ liệu email sâu hơn.',
      overlays: [
        {
          id: 'b2-search',
          top: '33%',
          left: '70%',
          width: '21%',
          height: '9%',
          label: '2A: Gõ từ khóa "linkedin"',
          pulse: false,
        },
        {
          id: 'b2-plus',
          top: '70.5%',
          left: '55.5%',
          width: '3.8%',
          height: '8%',
          label: '2B: Bấm dấu (+)',
          pulse: true,
        }
      ]
    },
    {
      step: 3,
      title: 'Bước 03: Kích hoạt Huy hiệu [in LinkedIn] trong Chat',
      badge: 'Gọi Tiện Ích',
      description: 'Mở cuộc trò chuyện mới, kích hoạt plugin LinkedIn để huy hiệu màu xanh [in LinkedIn] xuất hiện ngay trong khung soạn thảo câu lệnh.',
      imgSrc: '/images/tutorials/linkedin-plugin/step3-invoke-linkedin-plugin.png',
      alt: 'Bước 3: Kích hoạt huy hiệu LinkedIn trong khung chat',
      mainAction: 'Bấm "Đoạn chat mới" (New chat). Chọn gọi plugin LinkedIn sao cho huy hiệu màu xanh "[in LinkedIn]" xuất hiện ngay phía trước vùng nhập tin nhắn.',
      businessNote: 'Huy hiệu [in LinkedIn] là tín hiệu bắt buộc xác nhận ChatGPT đang truy vấn trực tiếp qua API mạng xã hội LinkedIn. Nếu không có huy hiệu này, AI sẽ chỉ tìm kiếm thông tin web chung chung thay vì trích xuất đúng hồ sơ Buyer thực tế.',
      proTip: 'Bạn có thể gọi nhanh bằng cách gõ ký tự "@" hoặc nhấp vào biểu tượng dấu cộng (+) trong thanh nhập liệu của ChatGPT để chọn tiện ích từ menu nổi.',
      overlays: [
        {
          id: 'b3-badge',
          top: '79%',
          left: '38%',
          width: '8.5%',
          height: '8.5%',
          label: '3️⃣ Huy hiệu [in LinkedIn]',
          pulse: true,
        }
      ]
    },
    {
      step: 4,
      title: 'Bước 04: Dán Prompt RCTO & Bắt đầu Sourcing',
      badge: 'Thực thi Lệnh',
      description: 'Sử dụng Trình Tạo Prompt Động bên dưới để tùy biến thông số ngành hàng nông sản, sao chép prompt và dán vào khung chat ChatGPT để bắt đầu quét dữ liệu.',
      imgSrc: '/images/tutorials/linkedin-plugin/step4-input-rcto-prompt.png',
      alt: 'Bước 4: Dán prompt RCTO và thực thi',
      mainAction: 'Dán đoạn Prompt chuẩn RCTO (đã tùy biến các thông số thị trường, chức danh và ngành hàng nông sản) vào khung chat đã có huy hiệu [in LinkedIn], sau đó nhấn nút Gửi (↑).',
      businessNote: 'Prompt chuẩn RCTO giúp AI cấu trúc hóa đầu ra dưới dạng bảng dữ liệu Markdown chuyên nghiệp (Tên công ty, Website, Chức danh, Link LinkedIn, Email/Phone), sẵn sàng để dán vào hệ thống LOS Buổi 06.',
      proTip: 'Sau khi AI trả về kết quả dạng bảng, hãy sao chép toàn bộ bảng và dán vào nút "Dán danh sách từ AI / CSV" tại Buổi 06 để tự động phân loại và tính điểm Access Score.',
      overlays: [
        {
          id: 'b4-prompt',
          top: '40%',
          left: '34.5%',
          width: '53%',
          height: '38%',
          label: '4A: Dán Prompt RCTO',
          pulse: false,
        },
        {
          id: 'b4-send',
          top: '71.5%',
          left: '81%',
          width: '4%',
          height: '8%',
          label: '4B: Bấm Gửi (↑)',
          pulse: true,
        }
      ]
    }
  ];

  const current = stepsData[activeStep - 1];

  return (
    <div style={{
      color: 'var(--text-primary, #f8fafc)',
      background: 'var(--bg-primary, #090d16)',
      borderRadius: isStandalone ? '0' : '16px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* HEADER BAR */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
        backdropFilter: 'blur(10px)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0a66c2 0%, #004182 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(10, 102, 194, 0.4)',
            color: '#fff',
            fontWeight: 900,
            fontSize: '1.2rem'
          }}>
            in
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                Hướng Dẫn ChatGPT + LinkedIn Plugin Sourcing
              </h2>
              <span style={{
                background: 'rgba(14, 165, 233, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 700
              }}>
                Module 03 Prospecting
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
              Quy trình 4 bước cào khách hàng & trích xuất người ra quyết định (Decision Makers) chuẩn khung RCTO
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href="https://chatgpt.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              borderColor: 'rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            <ExternalLink size={14} /> Mở ChatGPT.com ↗
          </a>
          {onClose && (
            <button
              onClick={onClose}
              className="btn"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem'
              }}
            >
              <X size={16} /> Đóng
            </button>
          )}
        </div>
      </div>

      {/* BODY CONTENT (SCROLLABLE) */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* STEP PROGRESS NAVIGATION */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px'
        }}>
          {stepsData.map((s) => {
            const isActive = activeStep === s.step;
            return (
              <button
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: isActive ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isActive ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(30, 41, 59, 0.8) 100%)' : 'rgba(30, 41, 59, 0.4)',
                  boxShadow: isActive ? '0 0 16px rgba(56, 189, 248, 0.3)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: isActive ? '#38bdf8' : '#64748b'
                  }}>
                    Bước 0{s.step}
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: isActive ? '#0284c7' : 'rgba(255,255,255,0.06)',
                    color: '#fff'
                  }}>
                    {s.badge}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: isActive ? '#f8fafc' : '#94a3b8',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {s.title.replace(/^Bước \d+: /, '')}
                </div>
              </button>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* PHẦN 1: BƯỚC 1, 2, 3 - TẬP TRUNG 100% VÀO HÌNH ẢNH & CHÚ THÍCH */}
        {/* ============================================================ */}
        {activeStep < 4 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Thanh tiêu đề bước & nút điều hướng */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    background: '#0284c7',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}>
                    Bước 0{current.step} / 04
                  </span>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                    {current.title}
                  </h3>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#cbd5e1' }}>
                  {current.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  disabled={activeStep === 1}
                  onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                  className="btn"
                  style={{
                    padding: '7px 14px',
                    fontSize: '0.8rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: activeStep === 1 ? '#475569' : '#e2e8f0',
                    cursor: activeStep === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronLeft size={15} /> Trước
                </button>
                <button
                  onClick={() => setActiveStep(prev => Math.min(4, prev + 1))}
                  className="btn"
                  style={{
                    padding: '7px 16px',
                    fontSize: '0.8rem',
                    background: '#0284c7',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Tiếp theo (Bước 0{activeStep + 1}) <ChevronRight size={15} />
                </button>
              </div>
            </div>

            {/* Khung Hình Ảnh Minh Họa To Rõ Có Mũi Tên & Khung Viền Neon */}
            <div style={{
              background: '#020617',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '14px',
              padding: '16px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                position: 'relative',
                display: 'inline-block',
                maxWidth: '100%',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                {/* Base Image */}
                <img
                  src={current.imgSrc}
                  alt={current.alt}
                  style={{
                    display: 'block',
                    width: '100%',
                    maxHeight: '520px',
                    objectFit: 'contain'
                  }}
                />

                {/* SVG & HTML Neon Overlays */}
                {current.overlays.map((ov) => (
                  <React.Fragment key={ov.id}>
                    {/* Neon Pulsing Box */}
                    <div
                      style={{
                        position: 'absolute',
                        top: ov.top,
                        left: ov.left,
                        width: ov.width,
                        height: ov.height,
                        border: '2.5px solid #00f2fe',
                        borderRadius: '6px',
                        boxShadow: '0 0 15px rgba(0, 242, 254, 0.85), inset 0 0 10px rgba(0, 242, 254, 0.35)',
                        pointerEvents: 'none'
                      }}
                    />

                    {/* Tooltip Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: `calc(${ov.top} - 32px)`,
                        left: ov.left,
                        background: 'linear-gradient(90deg, #0284c7 0%, #0369a1 100%)',
                        color: '#fff',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        letterSpacing: '0.02em',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5), 0 0 10px rgba(14, 165, 233, 0.6)',
                        border: '1px solid #38bdf8',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        zIndex: 5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Zap size={11} color="#fef08a" /> {ov.label}
                    </div>

                    {/* SVG Arrow */}
                    <svg
                      style={{
                        position: 'absolute',
                        top: `calc(${ov.top} - 14px)`,
                        left: `calc(${ov.left} + 12px)`,
                        width: '24px',
                        height: '24px',
                        pointerEvents: 'none',
                        zIndex: 6,
                        filter: 'drop-shadow(0 0 6px #00f2fe)'
                      }}
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 2 L12 18 M6 12 L12 18 L18 12"
                        stroke="#00f2fe"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  </React.Fragment>
                ))}

                {/* Phóng to ảnh */}
                <button
                  onClick={() => setZoomedImg({ src: current.imgSrc, alt: current.alt, step: current.step })}
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(4px)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                  }}
                >
                  <Maximize2 size={13} /> Phóng to ảnh
                </button>
              </div>
            </div>

            {/* HỘP CHÚ THÍCH HƯỚNG DẪN 3 PHẦN (ACTIONABLE NOTES) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr 1fr',
              gap: '14px'
            }}>
              {/* Cột 1: Thao Tác Chính */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MousePointerClick size={18} color="#38bdf8" />
                  <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#38bdf8' }}>
                    1. Thao Tác Cần Thực Hiện
                  </h4>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#f1f5f9', lineHeight: '1.5' }}>
                  {current.mainAction}
                </p>
              </div>

              {/* Cột 2: Nghiệp Vụ B2B */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={18} color="#34d399" />
                  <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#34d399' }}>
                    2. Ý Nghĩa Nghiệp Vụ B2B
                  </h4>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                  {current.businessNote}
                </p>
              </div>

              {/* Cột 3: Mẹo Thực Chiến */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#f59e0b" />
                  <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#fef08a' }}>
                    3. Mẹo Tránh Lỗi & Lưu Ý
                  </h4>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                  {current.proTip}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PHẦN 2: BƯỚC 4 - GIỮ NGUYÊN PROMPT & BỘ TẠO PROMPT ĐỘNG RCTO   */}
        {/* ============================================================ */}
        {activeStep === 4 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Header Bước 4 */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    background: '#10b981',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}>
                    Bước 04 / 04: Thực Thi
                  </span>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                    {current.title}
                  </h3>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#cbd5e1' }}>
                  {current.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setActiveStep(3)}
                  className="btn"
                  style={{
                    padding: '7px 14px',
                    fontSize: '0.8rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#e2e8f0',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft size={15} /> Quay lại Bước 03
                </button>
                <a
                  href="https://chatgpt.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    padding: '7px 16px',
                    fontSize: '0.8rem',
                    background: '#10b981',
                    borderColor: '#10b981',
                    color: '#fff',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Mở ChatGPT Ngay ↗
                </a>
              </div>
            </div>

            {/* NỬA TRÊN BƯỚC 4: ẢNH MINH HỌA DÁN PROMPT VÀO CHATGPT */}
            <div style={{
              background: '#020617',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '14px',
              padding: '16px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                position: 'relative',
                display: 'inline-block',
                maxWidth: '100%',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <img
                  src={current.imgSrc}
                  alt={current.alt}
                  style={{
                    display: 'block',
                    width: '100%',
                    maxHeight: '380px',
                    objectFit: 'contain'
                  }}
                />

                {current.overlays.map((ov) => (
                  <React.Fragment key={ov.id}>
                    <div
                      style={{
                        position: 'absolute',
                        top: ov.top,
                        left: ov.left,
                        width: ov.width,
                        height: ov.height,
                        border: '2.5px solid #00f2fe',
                        borderRadius: '6px',
                        boxShadow: '0 0 15px rgba(0, 242, 254, 0.85)',
                        pointerEvents: 'none'
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: `calc(${ov.top} - 30px)`,
                        left: ov.left,
                        background: 'linear-gradient(90deg, #0284c7 0%, #0369a1 100%)',
                        color: '#fff',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        border: '1px solid #38bdf8',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        zIndex: 5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Zap size={11} color="#fef08a" /> {ov.label}
                    </div>
                  </React.Fragment>
                ))}

                <button
                  onClick={() => setZoomedImg({ src: current.imgSrc, alt: current.alt, step: current.step })}
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Maximize2 size={13} /> Phóng to ảnh minh họa
                </button>
              </div>
            </div>

            {/* NỬA DƯỚI BƯỚC 4: DYNAMIC PROMPT BUILDER & RCTO FRAMEWORK */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '20px'
            }}>
              {/* CỘT TRÁI: DYNAMIC PROMPT BUILDER */}
              <div style={{
                background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} color="#38bdf8" />
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#f8fafc' }}>
                      Bộ Tạo Prompt Động (Dynamic Prompt Builder)
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      setTargetMarket('Mỹ, Châu Âu (EU), UAE, Nhật Bản');
                      setTargetTitle('Import Director, Sourcing Manager, Procurement Head');
                      setProductIndustry('Nông sản và gia vị: Quế, hồi, tiêu, điều');
                    }}
                    className="btn"
                    style={{
                      background: 'transparent',
                      color: '#94a3b8',
                      padding: '2px 6px',
                      fontSize: '0.72rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Khôi phục thông số mặc định"
                  >
                    <RefreshCw size={12} /> Đặt lại
                  </button>
                </div>

                {/* 3 Input Parameters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                      1. Thị Trường Mục Tiêu [THỊ TRƯỜNG MỤC TIÊU]:
                    </label>
                    <input
                      type="text"
                      value={targetMarket}
                      onChange={(e) => setTargetMarket(e.target.value)}
                      placeholder="Ví dụ: Mỹ, Châu Âu (EU), UAE, Nhật Bản..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(15, 23, 42, 0.8)',
                        color: '#fff',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                      2. Chân Dung Khách Hàng / Chức Danh [CHỨC DANH CẦN TÌM]:
                    </label>
                    <input
                      type="text"
                      value={targetTitle}
                      onChange={(e) => setTargetTitle(e.target.value)}
                      placeholder="Ví dụ: Import Director, Sourcing Manager, Procurement Head..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(15, 23, 42, 0.8)',
                        color: '#fff',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                      3. Ngành Hàng / Sản Phẩm Xuất Khẩu [NGÀNH HÀNG]:
                    </label>
                    <input
                      type="text"
                      value={productIndustry}
                      onChange={(e) => setProductIndustry(e.target.value)}
                      placeholder="Ví dụ: Nông sản và gia vị: Quế, hồi, tiêu, điều..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(15, 23, 42, 0.8)',
                        color: '#fff',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>

                {/* Generated Prompt Box */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>
                    Prompt Thành Phẩm (Sẵn sàng dán vào ChatGPT [in LinkedIn]):
                  </span>
                  <div style={{
                    background: 'rgba(2, 6, 23, 0.8)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '0.8rem',
                    color: '#cbd5e1',
                    lineHeight: '1.5',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace'
                  }}>
                    {generatedPrompt}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <button
                    onClick={() => handleCopy(generatedPrompt, 'custom')}
                    className="btn btn-primary"
                    style={{
                      flex: '1 1 200px',
                      background: copyStatus === 'custom' ? '#059669' : '#0284c7',
                      borderColor: copyStatus === 'custom' ? '#059669' : '#0284c7',
                      color: '#fff',
                      padding: '9px 14px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    {copyStatus === 'custom' ? (
                      <><Check size={16} /> Đã Sao Chép Prompt Cá Nhân Hóa!</>
                    ) : (
                      <><Copy size={16} /> Sao Chép Prompt (Đã Điền Thông Số)</>
                    )}
                  </button>

                  <button
                    onClick={() => handleCopy(rawPromptTemplate, 'raw')}
                    className="btn btn-secondary"
                    style={{
                      flex: '1 1 180px',
                      padding: '9px 14px',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: '#e2e8f0'
                    }}
                  >
                    {copyStatus === 'raw' ? (
                      <><Check size={16} /> Đã Chép Khung Mẫu!</>
                    ) : (
                      <><Copy size={16} /> Chép Prompt Mẫu Khung []</>
                    )}
                  </button>

                  <a
                    href="https://chatgpt.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{
                      width: '100%',
                      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <ExternalLink size={16} /> Bước Tiếp Theo: Mở ChatGPT & Dán Lệnh ↗
                  </a>
                </div>
              </div>

              {/* CỘT PHẢI: KHUNG LÝ THUYẾT RCTO & CẦU NỐI B06 */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {/* Cấu trúc RCTO */}
                <div style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} color="#f59e0b" />
                      <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#fef08a' }}>
                        Nguyên Lý Thiết Kế Prompt RCTO
                      </h4>
                    </div>
                    <button
                      onClick={() => handleCopy(fullRCTODoc, 'rcto')}
                      className="btn"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        color: copyStatus === 'rcto' ? '#34d399' : '#cbd5e1',
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {copyStatus === 'rcto' ? <Check size={12} /> : <Copy size={12} />}
                      {copyStatus === 'rcto' ? 'Đã sao chép' : 'Copy Full RCTO'}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8' }}>R — ROLE</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                        Senior B2B Data Research & Growth Hacking Specialist
                      </div>
                    </div>

                    <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}>C — CONTEXT</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                        Xuất khẩu nông sản & gia vị, trích xuất Buyer & Key Executives
                      </div>
                    </div>

                    <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b' }}>T — TEMPLATE</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                        Boolean Search, Plugin Web Scraper, Data Schema & Pipeline
                      </div>
                    </div>

                    <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #ec4899' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ec4899' }}>O — OUTPUT</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                        Bảng Markdown chuẩn, Tiếng Việt chuyên môn, GDPR compliant
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cầu nối với Buổi 06 */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(30, 41, 59, 0.5) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Database size={17} color="#34d399" />
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#34d399' }}>
                      Vòng Lặp Kế Thừa Vào Buổi 06 (Lead Sourcing & Triage)
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.45' }}>
                    Sau khi ChatGPT trả về bảng danh sách khách hàng, bạn chỉ cần sao chép toàn bộ bảng đó và dán vào nút 
                    <strong style={{ color: '#38bdf8' }}> "📥 Dán danh sách từ AI / CSV"</strong> tại Buổi 06. Hệ thống sẽ tự động tách Tên công ty, Website, Quy mô và chấm điểm ICP Match ngay lập tức!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {zoomedImg && (
        <div
          onClick={() => setZoomedImg(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '85vh',
              background: '#020617',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <div style={{
              padding: '10px 16px',
              background: '#0f172a',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>
                Hình ảnh chi tiết Bước 0{zoomedImg.step}
              </span>
              <button
                onClick={() => setZoomedImg(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>
            <img
              src={zoomedImg.src}
              alt={zoomedImg.alt}
              style={{
                display: 'block',
                maxWidth: '100%',
                maxHeight: 'calc(85vh - 50px)',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
