'use client';

import React, { useState } from 'react';
import { M04FormData, PricingOption, CustomCostItem } from './M04_CombinedForm';
import { Calculator, LayoutList, AlertTriangle, FileText, CheckCircle2, TrendingDown, ArrowRight, ShieldCheck, DollarSign, Sparkles, Plus, Trash2, Printer, Copy, Check, X, Download, Palette, ExternalLink, Languages, Globe } from 'lucide-react';

interface Props {
  data: M04FormData;
  setData: React.Dispatch<React.SetStateAction<M04FormData>>;
  handleBlur: () => void;
  isDisabled?: boolean;
}

const COST_ITEMS = [
  { 
    id: 'fob_price', 
    label: '1. Đơn giá FOB / EXW (USD)',
    labelEn: '1. FOB / EXW Base Unit Price (USD)', 
    desc: 'Giá hàng xuất xưởng / giao mạn tàu', 
    descEn: 'Ex-Works / Free on Board cargo base quote',
    color: '#3b82f6' 
  },
  { 
    id: 'freight', 
    label: '2. Cước Biển & Bảo hiểm Quốc tế (USD)', 
    labelEn: '2. Ocean Freight & Marine Insurance (USD)', 
    desc: 'Cước tàu Ocean Freight + Marine Insurance', 
    descEn: 'Port-to-port ocean transit and cargo coverage',
    color: '#8b5cf6' 
  },
  { 
    id: 'import_tax', 
    label: '3. Thuế NK & Thuế Quan (USD)', 
    labelEn: '3. Customs Duty & Tariff Preferential Rate (USD)', 
    desc: 'Thuế nhập khẩu nước đến (tận dụng C/O FTA)', 
    descEn: 'Destination tariffs optimized via Free Trade C/O',
    color: '#f59e0b' 
  },
  { 
    id: 'local_charges', 
    label: '4. Phí Nội địa & Cảng Đến (USD)', 
    labelEn: '4. Destination Port & Handling Charges (USD)', 
    desc: 'THC, D/O, nâng hạ, lưu bãi cont (Demurrage)', 
    descEn: 'THC, D/O, terminal handling & free demurrage buffer',
    color: '#06b6d4' 
  },
  { 
    id: 'doc_inspection_fee', 
    label: '5. Phí Ẩn, Kiểm định & Phế phẩm (USD)', 
    labelEn: '5. Inspection, SGS/Phyto & Defect Buffer (USD)', 
    desc: 'Chứng từ SGS/Phyto, tỷ lệ hư hại bù hàng', 
    descEn: 'Pre-shipment audit & zero-defect replacement SLA',
    color: '#ec4899' 
  },
];

const CANVA_TEMPLATE_URL = 'https://www.canva.com/templates/?query=b2b+quotation+proposal+presentation';

export default function B10_ProposalQuotation({ data, setData, handleBlur, isDisabled }: Props) {
  const b10 = data.b10_quotation;
  const [newCostName, setNewCostName] = useState('');
  
  // TCO Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [tcoLanguage, setTcoLanguage] = useState<'en' | 'vi'>('en');
  const [isCopied, setIsCopied] = useState(false);
  const [canvaToast, setCanvaToast] = useState(false);

  // Proposal Quotation Modal State
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposalLanguage, setProposalLanguage] = useState<'en' | 'vi'>('en');
  const [isProposalCopied, setIsProposalCopied] = useState(false);
  const [proposalCanvaToast, setProposalCanvaToast] = useState(false);
  
  // TCO data của doanh nghiệp bạn
  const yourTco = b10.tco_calculator || {
    fob_price: 0,
    freight: 0,
    import_tax: 0,
    local_charges: 0,
    doc_inspection_fee: 0
  };

  // TCO data của đối thủ / NCC cũ
  const competitorTco = b10.tco_competitor || {
    fob_price: 0,
    freight: 0,
    import_tax: 0,
    local_charges: 0,
    doc_inspection_fee: 0
  };

  const customCosts = b10.custom_costs || [];

  // Tính tổng Landed Cost bao gồm cả custom_costs
  const customYourSum = customCosts.reduce((acc, c) => acc + (Number(c.your_val) || 0), 0);
  const customCompSum = customCosts.reduce((acc, c) => acc + (Number(c.competitor_val) || 0), 0);

  const yourLandedCost = (Number(yourTco.fob_price) || 0) + 
                         (Number(yourTco.freight) || 0) + 
                         (Number(yourTco.import_tax) || 0) + 
                         (Number(yourTco.local_charges) || 0) + 
                         (Number(yourTco.doc_inspection_fee) || 0) +
                         customYourSum;

  const competitorLandedCost = (Number(competitorTco.fob_price) || 0) + 
                               (Number(competitorTco.freight) || 0) + 
                               (Number(competitorTco.import_tax) || 0) + 
                               (Number(competitorTco.local_charges) || 0) + 
                               (Number(competitorTco.doc_inspection_fee) || 0) +
                               customCompSum;

  const netSavings = competitorLandedCost > 0 ? competitorLandedCost - yourLandedCost : 0;
  const savingsPercent = competitorLandedCost > 0 ? ((netSavings / competitorLandedCost) * 100).toFixed(1) : '0.0';
  const isSaving = netSavings > 0;

  const activeOptions = b10.pricing_options.filter(opt => opt.is_active);
  const activeOptionsCount = activeOptions.length;
  const isDecoyValid = activeOptionsCount >= 2;

  // Handlers
  const handleYourTcoChange = (field: string, value: string) => {
    if (isDisabled) return;
    setData(prev => ({
      ...prev,
      b10_quotation: {
        ...prev.b10_quotation,
        tco_calculator: {
          ...prev.b10_quotation.tco_calculator,
          [field]: Number(value) || 0
        }
      }
    }));
  };

  const handleCompetitorTcoChange = (field: string, value: string) => {
    if (isDisabled) return;
    setData(prev => ({
      ...prev,
      b10_quotation: {
        ...prev.b10_quotation,
        tco_competitor: {
          ...(prev.b10_quotation.tco_competitor || {
            fob_price: 0,
            freight: 0,
            import_tax: 0,
            local_charges: 0,
            doc_inspection_fee: 0
          }),
          [field]: Number(value) || 0
        }
      }
    }));
  };

  const handleAddCustomCost = () => {
    if (!newCostName.trim() || isDisabled) return;
    const colors = ['#a855f7', '#14b8a6', '#f43f5e', '#eab308', '#6366f1', '#10b981'];
    const randomColor = colors[customCosts.length % colors.length];
    const newItem: CustomCostItem = {
      id: `custom_cost_${Date.now()}`,
      label: newCostName.trim(),
      competitor_val: 0,
      your_val: 0,
      color: randomColor
    };
    setData(prev => ({
      ...prev,
      b10_quotation: {
        ...prev.b10_quotation,
        custom_costs: [...(prev.b10_quotation.custom_costs || []), newItem]
      }
    }));
    setNewCostName('');
    setTimeout(() => handleBlur(), 100);
  };

  const handleUpdateCustomCost = (id: string, field: 'label' | 'competitor_val' | 'your_val', val: any) => {
    if (isDisabled) return;
    setData(prev => ({
      ...prev,
      b10_quotation: {
        ...prev.b10_quotation,
        custom_costs: (prev.b10_quotation.custom_costs || []).map(c => 
          c.id === id ? { ...c, [field]: field === 'label' ? val : Number(val) || 0 } : c
        )
      }
    }));
  };

  const handleRemoveCustomCost = (id: string) => {
    if (isDisabled) return;
    setData(prev => ({
      ...prev,
      b10_quotation: {
        ...prev.b10_quotation,
        custom_costs: (prev.b10_quotation.custom_costs || []).filter(c => c.id !== id)
      }
    }));
    setTimeout(() => handleBlur(), 100);
  };

  const handleOptionChange = (id: string, field: keyof PricingOption, value: any) => {
    if (isDisabled) return;
    const updatedOptions = b10.pricing_options.map(opt => opt.id === id ? { ...opt, [field]: value } : opt);
    setData(prev => ({
      ...prev,
      b10_quotation: {
        ...prev.b10_quotation,
        pricing_options: updatedOptions
      }
    }));
  };

  const generateTcoReportText = (lang: 'en' | 'vi') => {
    if (lang === 'en') {
      return `
=== TOTAL COST OF OWNERSHIP (TCO) BENCHMARK REPORT ===
Date Issued: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
Validity: 30 Days

1. EXECUTIVE FINANCIAL SUMMARY:
- Incumbent / Competitor Quote: ${formatNumber(competitorLandedCost)}
- Our Proposed Landed Cost: ${formatNumber(yourLandedCost)}
- Net Cost Savings for Buyer: ${isSaving ? formatNumber(netSavings) + ' (Save ' + savingsPercent + '%)' : '$0'}

2. COST BREAKDOWN ANALYSIS:
${COST_ITEMS.map(c => `- ${c.labelEn}: Competitor: ${formatNumber(Number(competitorTco[c.id as keyof typeof competitorTco]) || 0)} | Our Solution: ${formatNumber(Number(yourTco[c.id as keyof typeof yourTco]) || 0)}`).join('\n')}
${customCosts.map(c => `- ${c.label}: Competitor: ${formatNumber(Number(c.competitor_val) || 0)} | Our Solution: ${formatNumber(Number(c.your_val) || 0)}`).join('\n')}

=> TOTAL BUYER LANDED TCO:
- Incumbent / Competitor: ${formatNumber(competitorLandedCost)}
- Our Proposed Solution: ${formatNumber(yourLandedCost)}
- Net Advantage: ${isSaving ? '-' + formatNumber(netSavings) : formatNumber(netSavings)}

3. VALUE-ADDED COMMITMENT & SLA:
While initial FOB unit prices may appear comparable, our optimized container load logistics, preferential FTA customs facilitation, and zero-defect SLA reduce your overall Total Landed Cost significantly.
======================================================
      `.trim();
    }

    return `
=== BẢNG PHÂN TÍCH TỔNG CHI PHÍ SỞ HỮU (TCO BENCHMARK REPORT) ===
Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}
Hiệu lực: 30 ngày

1. TỔNG QUAN TÀI CHÍNH:
- Báo giá Đối thủ / NCC Hiện tại: ${formatNumber(competitorLandedCost)}
- Đề xuất Doanh nghiệp Chúng tôi: ${formatNumber(yourLandedCost)}
- Tiết kiệm Ròng cho Quý Khách: ${isSaving ? formatNumber(netSavings) + ' (Tiết kiệm ' + savingsPercent + '%)' : '$0'}

2. CHI TIẾT CẤU PHẦN CHI PHÍ:
${COST_ITEMS.map(c => `- ${c.label}: Đối thủ: ${formatNumber(Number(competitorTco[c.id as keyof typeof competitorTco]) || 0)} | Chúng tôi: ${formatNumber(Number(yourTco[c.id as keyof typeof yourTco]) || 0)}`).join('\n')}
${customCosts.map(c => `- ${c.label}: Đối thủ: ${formatNumber(Number(c.competitor_val) || 0)} | Chúng tôi: ${formatNumber(Number(c.your_val) || 0)}`).join('\n')}

=> TỔNG TCO LANDED COST:
- Đối thủ: ${formatNumber(competitorLandedCost)}
- Chúng tôi: ${formatNumber(yourLandedCost)}
- Chênh lệch tiết kiệm: ${isSaving ? '-' + formatNumber(netSavings) : formatNumber(netSavings)}

3. CAM KẾT GIÁ TRỊ:
Mặc dù giá FOB ban đầu có thể có sự khác biệt nhỏ, nhưng nhờ giải pháp tối ưu logistics đóng gói, hỗ trợ thuế quan trọn gói và cam kết chất lượng 0% rủi ro, tổng chi phí sở hữu (Landed TCO) của Quý vị được tối ưu vượt trội.
================================================================
    `.trim();
  };

  const generateProposalText = (lang: 'en' | 'vi') => {
    if (lang === 'en') {
      return `
=== COMMERCIAL SALES PROPOSAL & TIERED PRICING ARCHITECTURE ===
Quotation Ref: EXP-QT-${Date.now().toString().slice(-6)} | Date Issued: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
Validity: 30 Calendar Days | ATTN: Global Procurement Directorate

1. TIERED PRICING & VALUE COMPARISON MATRIX:
${activeOptions.map((opt, i) => `
[${i === 0 ? 'OPTION A (ECONOMY DECOY)' : i === 1 ? 'OPTION B (RECOMMENDED STANDARD ⭐)' : 'OPTION C (PREMIUM VALUE-ADD)'}] - ${opt.name}
• Proposed Unit Price: ${formatNumber(Number(opt.price) || 0)} / unit
• MOQ: ${i === 0 ? '1x40ft FCL (~20,000 units)' : i === 1 ? '1x20ft FCL (~10,000 units)' : 'Flexible (~5,000 units)'}
• Packing Standard: ${i === 0 ? 'Standard 5-ply export carton' : i === 1 ? 'Fumigated Pallets + Shrink Wrap' : 'Custom OEM Branding + Heavy Duty Pallet'}
• Production Lead Time: ${i === 0 ? '25-30 business days' : i === 1 ? '14-18 business days (Priority Line)' : '10-14 business days (Fast-Track)'}
• QA & Inspection: ${i === 0 ? 'In-house Factory QA Inspection' : i === 1 ? 'Pre-shipment Inspection + Full COA' : 'Third-Party SGS / Intertek Inspection'}
• Defect Replacement SLA: ${i === 0 ? 'Deduction on subsequent order' : i === 1 ? '100% Free Replacement in 7 Days' : 'Immediate 100% Compensation + Insurance'}
• FTA C/O Support: ${i === 0 ? 'Standard non-preferential C/O' : i === 1 ? 'Preferential Form FTA C/O (0% Duty)' : 'Full FTA C/O + Customs Broker Support'}
• Specific Scope: ${opt.features || 'Standard export packaging, QA pre-shipment audit, prompt technical customer support.'}
`).join('\n')}

2. INTERNATIONAL COMMERCIAL TERMS & EXPORT CONDITIONS:
• Trade Terms: FOB Cat Lai / Hai Phong Port (or CIF Destination Port - Incoterms 2020)
• Port of Loading & Discharge: POL: Hochiminh City Port | POD: As nominated by Buyer
• Payment & Deposit Terms: 30% T/T Advance Deposit, 70% against B/L copy (or Irrevocable L/C)
• Production Lead Time: 14 - 21 business days upon receipt of advance deposit & sample approval
• Export Shipping Documents: Commercial Invoice, Packing List, Ocean B/L, Form FTA C/O, Phytosanitary, COA
• Samples & Validity: Free pre-production counter-samples available. Quotation valid for 30 calendar days.

3. AUTHORIZED SIGNATORY & LEGAL DISCLAIMER:
Issued by: International B2B Export Sales Directorate | Email: export@vietnamglobal.com
Official Commercial Proposal — Acceptance confirmed via Purchase Order (P.O)
===============================================================
      `.trim();
    }

    return `
=== BẢN ĐỀ XUẤT BÁO GIÁ THƯƠNG MẠI & ĐA TẦNG GIÁ TRỊ ===
Số hiệu: EXP-QT-${Date.now().toString().slice(-6)} | Ngày lập: ${new Date().toLocaleDateString('vi-VN')}
Hiệu lực: 30 ngày | Kính gửi: Hội Đồng Thu Mua & Quản Lý Ngành Hàng

1. MA TRẬN ĐỐI CHIẾU 3 PHƯƠNG ÁN BÁO GIÁ:
${activeOptions.map((opt, i) => `
[${i === 0 ? 'GÓI A (TỐI ƯU / DECOY)' : i === 1 ? 'GÓI B (TIÊU CHUẨN ĐỀ XUẤT ⭐)' : 'GÓI C (NÂNG CAO SLA)'}] - ${opt.name}
• Đơn giá đề xuất: ${formatNumber(Number(opt.price) || 0)} / đơn vị
• MOQ: ${i === 0 ? '1x40ft FCL (~20,000 đơn vị)' : i === 1 ? '1x20ft FCL (~10,000 đơn vị)' : 'Linh hoạt (~5,000 đơn vị)'}
• Quy cách đóng gói: ${i === 0 ? 'Thùng carton 5 lớp tiêu chuẩn' : i === 1 ? 'Pallet gỗ hun trùng + Màng co' : 'Thương hiệu OEM + Pallet chịu lực'}
• Tiến độ sản xuất: ${i === 0 ? '25-30 ngày làm việc' : i === 1 ? '14-18 ngày làm việc (Ưu tiên)' : '10-14 ngày làm việc (Thần tốc)'}
• Kiểm định chất lượng: ${i === 0 ? 'Kiểm tra QA nội bộ xuất xưởng' : i === 1 ? 'Pre-shipment Audit + Phiếu COA' : 'Kiểm định độc lập SGS / Intertek'}
• Chính sách bù lỗi: ${i === 0 ? 'Giảm trừ vào đơn hàng sau' : i === 1 ? 'Bù hàng 100% miễn phí trong 7 ngày' : 'Bù 100% ngay + Đền bù phát sinh'}
• Hỗ trợ C/O ưu đãi thuế: ${i === 0 ? 'C/O tiêu chuẩn thông thường' : i === 1 ? 'Hỗ trợ C/O Form ưu đãi thuế 0%' : 'C/O ưu đãi + Đại lý hải quan trọn gói'}
• Tính năng chi tiết: ${opt.features || 'Đóng gói chuẩn xuất khẩu, kiểm định chất lượng xuất xưởng và hỗ trợ kỹ thuật tận tâm.'}
`).join('\n')}

2. ĐIỀU KHOẢN THƯƠNG MẠI & QUY CHUẨN XUẤT KHẨU:
• Điều kiện giao hàng: FOB Cảng Cát Lái / Hải Phòng (hoặc CIF Cảng Đến - Incoterms 2020)
• Cảng bốc & Cảng dỡ: Cảng đi (POL): TP. Hồ Chí Minh | Cảng đến: Chỉ định bởi Buyer
• Phương thức thanh toán: 30% T/T Tạm ứng, 70% khi có Bill of Lading (hoặc L/C không hủy ngang)
• Tiến độ sản xuất: 14 - 21 ngày làm việc sau khi nhận đặt cọc & duyệt mẫu sản xuất
• Bộ chứng từ xuất khẩu: Invoice, Packing List, Vận đơn B/L, C/O ưu đãi thuế, Kiểm dịch Phyto, COA
• Quy định mẫu & Hiệu lực: Cung cấp mẫu đối chứng miễn phí. Báo giá có hiệu lực trong 30 ngày.

3. ĐẠI DIỆN KÝ DUYỆT & PHÁP LÝ BÁO GIÁ:
Đại diện Ký Duyệt: Ban Giám Đốc Kinh Doanh Xuất Khẩu | Email: export@vietnamglobal.com
Bản Báo Giá Thương Mại Chính Thức — Xác nhận chấp thuận qua Đơn đặt hàng (P.O)
======================================================
    `.trim();
  };

  const handleCopyTcoReport = () => {
    const reportText = generateTcoReportText(tcoLanguage);
    navigator.clipboard.writeText(reportText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleOpenCanvaTemplate = () => {
    const reportText = generateTcoReportText(tcoLanguage);
    navigator.clipboard.writeText(reportText);
    setCanvaToast(true);
    setTimeout(() => setCanvaToast(false), 4000);
    window.open(CANVA_TEMPLATE_URL, '_blank', 'noopener,noreferrer');
  };

  const handleCopyProposal = () => {
    const text = generateProposalText(proposalLanguage);
    navigator.clipboard.writeText(text);
    setIsProposalCopied(true);
    setTimeout(() => setIsProposalCopied(false), 2500);
  };

  const handleOpenProposalCanva = () => {
    const text = generateProposalText(proposalLanguage);
    navigator.clipboard.writeText(text);
    setProposalCanvaToast(true);
    setTimeout(() => setProposalCanvaToast(false), 4000);
    window.open(CANVA_TEMPLATE_URL, '_blank', 'noopener,noreferrer');
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportProposal = () => {
    if (!isDecoyValid) return;
    setIsProposalModalOpen(true);
  };

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);

  return (
    <section className="glass-panel" style={{ opacity: isDisabled ? 0.6 : 1, pointerEvents: isDisabled ? 'none' : 'auto', padding: '28px' }}>
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
          Bài 10: TCO & Kiến trúc Báo giá Đa Tầng (Landed Cost & Decoy Pricing)
        </h2>
      </div>
      <p className="text-secondary text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Xây dựng Tổng chi phí sở hữu (TCO) đối đầu với báo giá đối thủ/NCC cũ, và thiết lập bảng giá 3 gói lựa chọn để định vị giá trị vượt trội.
      </p>

      {/* KHU VỰC 1: DASHBOARD TCO BENCHMARK */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <Calculator size={18} color="var(--accent-primary)" /> Khu vực 1: Dashboard So Sánh Đối Đầu TCO (Side-by-Side Landed Cost Benchmark)
          </h3>
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid var(--accent-primary)',
              color: 'var(--accent-primary)',
              background: 'rgba(59, 130, 246, 0.08)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Printer size={15} /> 📄 Xuất Báo Cáo TCO (Gửi Khách)
          </button>
        </div>

        {/* 1. SCORECARDS TỔNG QUAN TCO */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '18px' }}>
          
          {/* Card Đối Thủ */}
          <div style={{ padding: '14px 16px', background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.78rem', color: '#fca5a5', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              1. Báo Giá Đối Thủ / NCC Cũ
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#f87171', marginTop: '4px' }}>
              {formatNumber(competitorLandedCost)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Giá FOB danh nghĩa có thể rẻ nhưng nhiều phí ẩn & rủi ro phát sinh.
            </div>
          </div>

          {/* Card Doanh Nghiệp Bạn */}
          <div style={{ padding: '14px 16px', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.78rem', color: '#6ee7b7', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              2. Đề Xuất Doanh Nghiệp Bạn
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
              {formatNumber(yourLandedCost)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Tối ưu cước tàu, hỗ trợ C/O giảm thuế và cam kết chất lượng trọn gói.
            </div>
          </div>

          {/* Card Chênh Lệch Tiết Kiệm (Savings) */}
          <div style={{ 
            padding: '14px 16px', 
            background: isSaving ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))' : 'rgba(255, 255, 255, 0.03)', 
            border: `1px solid ${isSaving ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`, 
            borderRadius: '10px' 
          }}>
            <div style={{ fontSize: '0.78rem', color: isSaving ? '#6ee7b7' : 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              3. Chênh Lệch Tiết Kiệm Cho Buyer
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: isSaving ? '#10b981' : '#f59e0b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isSaving ? `+${formatNumber(netSavings)}` : formatNumber(netSavings)}
              {competitorLandedCost > 0 && (
                <span style={{ fontSize: '0.82rem', background: isSaving ? '#10b981' : '#f59e0b', color: '#0f172a', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                  {isSaving ? `↓ Tiết kiệm ${savingsPercent}%` : 'Chưa tối ưu'}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.72rem', color: isSaving ? '#6ee7b7' : 'var(--text-muted)', marginTop: '4px' }}>
              {isSaving ? '✓ Luận điểm thuyết phục: Tiết kiệm tổng chi phí sở hữu cho Buyer!' : 'Nhập chi phí đối thủ để so sánh hiệu quả.'}
            </div>
          </div>

        </div>

        {/* 2. BẢNG NHẬP LIỆU ĐỐI ĐẦU 2 CỘT */}
        <div style={{ 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: '12px', 
          overflow: 'hidden', 
          background: 'rgba(15, 23, 42, 0.4)',
          marginBottom: '18px'
        }}>
          {/* Header Bảng */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'minmax(200px, 1.8fr) 1.2fr 1.2fr 1fr', 
            gap: '12px', 
            padding: '12px 16px', 
            background: 'rgba(0, 0, 0, 0.3)', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            color: 'var(--text-secondary)'
          }}>
            <div>Cấu Phần Chi Phí TCO</div>
            <div style={{ color: '#f87171' }}>Báo Giá Đối Thủ / NCC Cũ</div>
            <div style={{ color: '#10b981' }}>Báo Giá Doanh Nghiệp Bạn</div>
            <div style={{ textAlign: 'right' }}>Chênh Lệch ($)</div>
          </div>

          {/* 5 Hàng Cấu Phần Chuẩn */}
          {COST_ITEMS.map((item, idx) => {
            const compVal = Number(competitorTco[item.id as keyof typeof competitorTco]) || 0;
            const yourVal = Number(yourTco[item.id as keyof typeof yourTco]) || 0;
            const diff = compVal - yourVal;

            return (
              <div 
                key={item.id}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'minmax(200px, 1.8fr) 1.2fr 1.2fr 1fr', 
                  gap: '12px', 
                  padding: '10px 16px', 
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>

                {/* Input Đối Thủ */}
                <div>
                  <input
                    type="number"
                    value={competitorTco[item.id as keyof typeof competitorTco] || ''}
                    onChange={(e) => handleCompetitorTcoChange(item.id, e.target.value)}
                    onBlur={handleBlur}
                    disabled={isDisabled}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      background: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '6px',
                      color: '#fca5a5',
                      fontSize: '0.84rem',
                      fontWeight: 600
                    }}
                  />
                </div>

                {/* Input Doanh Nghiệp Bạn */}
                <div>
                  <input
                    type="number"
                    value={yourTco[item.id as keyof typeof yourTco] || ''}
                    onChange={(e) => handleYourTcoChange(item.id, e.target.value)}
                    onBlur={handleBlur}
                    disabled={isDisabled}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      background: 'rgba(16, 185, 129, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: '6px',
                      color: '#6ee7b7',
                      fontSize: '0.84rem',
                      fontWeight: 600
                    }}
                  />
                </div>

                {/* Chênh Lệch */}
                <div style={{ textAlign: 'right', fontSize: '0.82rem', fontWeight: 'bold' }}>
                  {compVal > 0 || yourVal > 0 ? (
                    <span style={{ color: diff > 0 ? '#10b981' : diff < 0 ? '#f87171' : 'var(--text-muted)' }}>
                      {diff > 0 ? `-${formatNumber(diff)}` : diff < 0 ? `+${formatNumber(Math.abs(diff))}` : '$0'}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Các Hàng Biến Chi Phí Tùy Biến (Custom Cost Items) */}
          {customCosts.map((item) => {
            const compVal = Number(item.competitor_val) || 0;
            const yourVal = Number(item.your_val) || 0;
            const diff = compVal - yourVal;

            return (
              <div 
                key={item.id}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'minmax(200px, 1.8fr) 1.2fr 1.2fr 1fr', 
                  gap: '12px', 
                  padding: '9px 16px', 
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  background: 'rgba(168, 85, 247, 0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color || '#a855f7', flexShrink: 0 }} />
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleUpdateCustomCost(item.id, 'label', e.target.value)}
                    onBlur={handleBlur}
                    disabled={isDisabled}
                    placeholder="Tên chi phí tùy biến..."
                    style={{
                      flex: 1,
                      padding: '4px 6px',
                      background: 'transparent',
                      border: '1px dashed rgba(255,255,255,0.15)',
                      borderRadius: '4px',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      fontWeight: 600
                    }}
                  />
                  {!isDisabled && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomCost(item.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#fca5a5',
                        cursor: 'pointer',
                        padding: '3px 5px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0
                      }}
                      title="Xóa biến chi phí này"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                {/* Input Đối Thủ */}
                <div>
                  <input
                    type="number"
                    value={item.competitor_val || ''}
                    onChange={(e) => handleUpdateCustomCost(item.id, 'competitor_val', e.target.value)}
                    onBlur={handleBlur}
                    disabled={isDisabled}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      background: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '6px',
                      color: '#fca5a5',
                      fontSize: '0.84rem',
                      fontWeight: 600
                    }}
                  />
                </div>

                {/* Input Doanh Nghiệp Bạn */}
                <div>
                  <input
                    type="number"
                    value={item.your_val || ''}
                    onChange={(e) => handleUpdateCustomCost(item.id, 'your_val', e.target.value)}
                    onBlur={handleBlur}
                    disabled={isDisabled}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      background: 'rgba(16, 185, 129, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: '6px',
                      color: '#6ee7b7',
                      fontSize: '0.84rem',
                      fontWeight: 600
                    }}
                  />
                </div>

                {/* Chênh Lệch */}
                <div style={{ textAlign: 'right', fontSize: '0.82rem', fontWeight: 'bold' }}>
                  {compVal > 0 || yourVal > 0 ? (
                    <span style={{ color: diff > 0 ? '#10b981' : diff < 0 ? '#f87171' : 'var(--text-muted)' }}>
                      {diff > 0 ? `-${formatNumber(diff)}` : diff < 0 ? `+${formatNumber(Math.abs(diff))}` : '$0'}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                  )}
                </div>
              </div>
            );
          })}



          {/* Form thêm biến chi phí tùy biến */}
          {!isDisabled && (
            <div style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px dashed rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="+ Thêm biến chi phí tùy biến (VD: Phí lưu kho đích, Phí chuyển đổi NCC, Bảo hành...)..."
                  value={newCostName}
                  onChange={(e) => setNewCostName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomCost();
                    }
                  }}
                  style={{
                    flex: 1,
                    maxWidth: '480px',
                    padding: '6px 10px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    fontSize: '0.78rem'
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomCost}
                  disabled={!newCostName.trim()}
                  className="btn btn-primary"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    height: '32px'
                  }}
                >
                  <Plus size={13} /> Thêm Biến Chi Phí
                </button>
              </div>
            </div>
          )}

          {/* Hàng Tổng TCO */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'minmax(200px, 1.8fr) 1.2fr 1.2fr 1fr', 
            gap: '12px', 
            padding: '14px 16px', 
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.45)', 
            borderTop: '2px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}>
            <div style={{ color: 'var(--accent-primary)' }}>TỔNG CHI PHÍ ĐÍCH SỞ HỮU (TCO)</div>
            <div style={{ color: '#f87171', fontSize: '1rem', fontWeight: 900 }}>{formatNumber(competitorLandedCost)}</div>
            <div style={{ color: '#10b981', fontSize: '1.05rem', fontWeight: 900 }}>{formatNumber(yourLandedCost)}</div>
            <div style={{ textAlign: 'right', color: isSaving ? '#10b981' : 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 900 }}>
              {isSaving ? `-${formatNumber(netSavings)}` : formatNumber(netSavings)}
            </div>
          </div>
        </div>

        {/* 3. BIỂU ĐỒ THANH TRỰC QUAN PHÂN TÁCH CHI PHÍ (STACKED COST BAR) */}
        {(competitorLandedCost > 0 || yourLandedCost > 0) && (
          <div style={{ padding: '16px 20px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', marginBottom: '14px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📊 Biểu Đồ Trực Quan Tỷ Trọng Chi Phí (Cost Composition Breakdown)</span>
              <div style={{ display: 'flex', gap: '10px', fontSize: '0.72rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                {COST_ITEMS.map(c => (
                  <span key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.color }} />
                    {c.label.split('.')[1]?.trim().split('(')[0]?.trim()}
                  </span>
                ))}
                {customCosts.map(c => (
                  <span key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.color || '#a855f7' }} />
                    {c.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Thanh Đối Thủ */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                <span style={{ color: '#fca5a5', fontWeight: 600 }}>Đối thủ / NCC Cũ: {formatNumber(competitorLandedCost)}</span>
              </div>
              <div style={{ display: 'flex', height: '14px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                {competitorLandedCost > 0 && COST_ITEMS.map(c => {
                  const val = Number(competitorTco[c.id as keyof typeof competitorTco]) || 0;
                  const pct = (val / competitorLandedCost) * 100;
                  if (pct <= 0) return null;
                  return (
                    <div 
                      key={c.id} 
                      style={{ width: `${pct}%`, background: c.color, height: '100%' }} 
                      title={`${c.label}: ${formatNumber(val)} (${pct.toFixed(0)}%)`}
                    />
                  );
                })}
                {competitorLandedCost > 0 && customCosts.map(c => {
                  const val = Number(c.competitor_val) || 0;
                  const pct = (val / competitorLandedCost) * 100;
                  if (pct <= 0) return null;
                  return (
                    <div 
                      key={c.id} 
                      style={{ width: `${pct}%`, background: c.color || '#a855f7', height: '100%' }} 
                      title={`${c.label}: ${formatNumber(val)} (${pct.toFixed(0)}%)`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Thanh Doanh Nghiệp Bạn */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                <span style={{ color: '#6ee7b7', fontWeight: 600 }}>Đề xuất của Bạn: {formatNumber(yourLandedCost)}</span>
              </div>
              <div style={{ display: 'flex', height: '14px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                {yourLandedCost > 0 && COST_ITEMS.map(c => {
                  const val = Number(yourTco[c.id as keyof typeof yourTco]) || 0;
                  const pct = (val / yourLandedCost) * 100;
                  if (pct <= 0) return null;
                  return (
                    <div 
                      key={c.id} 
                      style={{ width: `${pct}%`, background: c.color, height: '100%' }} 
                      title={`${c.label}: ${formatNumber(val)} (${pct.toFixed(0)}%)`}
                    />
                  );
                })}
                {yourLandedCost > 0 && customCosts.map(c => {
                  const val = Number(c.your_val) || 0;
                  const pct = (val / yourLandedCost) * 100;
                  if (pct <= 0) return null;
                  return (
                    <div 
                      key={c.id} 
                      style={{ width: `${pct}%`, background: c.color || '#a855f7', height: '100%' }} 
                      title={`${c.label}: ${formatNumber(val)} (${pct.toFixed(0)}%)`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 4. STRATEGIC PITCH STATEMENT */}
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(59, 130, 246, 0.08)', 
          border: '1px solid rgba(59, 130, 246, 0.25)', 
          borderRadius: '8px', 
          fontSize: '0.8rem', 
          color: 'var(--text-secondary)',
          lineHeight: '1.45',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start'
        }}>
          <Sparkles size={16} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: 'var(--accent-primary)' }}>💡 Tuyệt chiêu đàm phán TCO: </strong>
            <em>"Thưa Buyer, giá FOB ban đầu của chúng tôi có thể cao hơn một chút, nhưng nhờ tối ưu thể tích cont đóng gói giúp giảm cước tàu, cùng chính sách miễn phí chứng từ kiểm định SGS và cam kết 0% hàng lỗi, tổng chi phí sở hữu Landed Cost của quý vị tiết kiệm được <strong>{isSaving ? formatNumber(netSavings) : 'đáng kể'}</strong> trên mỗi lô hàng!"</em>
          </div>
        </div>

      </div>

      {/* KHU VỰC 2: KHUNG BÁO GIÁ 3 LỰA CHỌN (DECOY PRICING ANCHORING) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <LayoutList size={18} color="var(--accent-primary)" /> Khu vực 2: Khung Báo giá 3 Lựa chọn (Decoy Pricing Anchoring)
          </h3>
          <span style={{ fontSize: '0.8rem', color: isDecoyValid ? '#10b981' : 'var(--accent-danger)', fontWeight: 600 }}>
            {activeOptionsCount}/3 gói kích hoạt
          </span>
        </div>

        {!isDecoyValid && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.12)', color: '#fca5a5', border: '1px solid var(--accent-danger)', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={17} color="var(--accent-danger)" style={{ flexShrink: 0 }} /> 
            <span><strong>Bắt buộc kích hoạt tối thiểu 2 gói giá:</strong> Cần ít nhất một gói cơ sở và một gói nâng cao để tạo thế so sánh và kích hoạt hiệu ứng chim mồi.</span>
          </div>
        )}
        
        {/* Lưới 3 Gói Giá Cùng 1 Hàng: Economy -> Tiêu chuẩn -> Nâng cao */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {[...b10.pricing_options]
            .sort((a, b) => {
              const getRank = (name: string) => {
                const n = name.toLowerCase();
                if (n.includes('economy') || n.includes('tối ưu')) return 1;
                if (n.includes('standard') || n.includes('tiêu chuẩn')) return 2;
                if (n.includes('premium') || n.includes('nâng cao')) return 3;
                return 4;
              };
              return getRank(a.name) - getRank(b.name);
            })
            .map(opt => (
              <div key={opt.id} style={{
                padding: '16px',
                border: `1px solid ${opt.is_active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '12px',
                background: opt.is_active ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(15, 23, 42, 0.6))' : 'rgba(15, 23, 42, 0.3)',
                opacity: opt.is_active ? 1 : 0.6,
                transition: 'all 0.3s',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.88rem', color: opt.is_active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {opt.name}
                  </span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', color: opt.is_active ? 'var(--accent-primary)' : 'var(--text-muted)', cursor: isDisabled ? 'not-allowed' : 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={opt.is_active}
                      onChange={(e) => handleOptionChange(opt.id, 'is_active', e.target.checked)}
                      disabled={isDisabled}
                      style={{ accentColor: 'var(--accent-primary)', width: '15px', height: '15px' }}
                    />
                    <span>Kích hoạt</span>
                  </label>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Mức Giá Đề Xuất (USD)</label>
                    <input
                      type="number"
                      value={opt.price || ''}
                      onChange={(e) => handleOptionChange(opt.id, 'price', e.target.value)}
                      onBlur={handleBlur}
                      disabled={!opt.is_active || isDisabled}
                      placeholder="VD: 4200"
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        background: 'rgba(0,0,0,0.25)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        fontSize: '0.84rem'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Giá trị & Điều khoản đi kèm (Features / SLA)</label>
                    <textarea
                      value={opt.features}
                      onChange={(e) => handleOptionChange(opt.id, 'features', e.target.value)}
                      onBlur={handleBlur}
                      disabled={!opt.is_active || isDisabled}
                      placeholder="VD: Đóng gói bao hút chân không, bảo hiểm hàng hóa trọn gói, thời gian giao hàng ưu tiên 14 ngày..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        background: 'rgba(0,0,0,0.25)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        resize: 'vertical',
                        fontSize: '0.8rem',
                        lineHeight: '1.35',
                        flex: 1
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '14px' }}>
          {!isDecoyValid && (
            <span style={{ fontSize: '0.82rem', color: 'var(--accent-danger)' }}>
              ⚠️ Cần tick tối thiểu 2 gói giá để xuất file
            </span>
          )}
          <button
            type="button"
            onClick={handleExportProposal}
            disabled={!isDecoyValid || isDisabled}
            className="btn btn-primary"
            style={{
              padding: '10px 24px',
              fontSize: '0.88rem',
              fontWeight: 'bold',
              opacity: (!isDecoyValid || isDisabled) ? 0.4 : 1,
              cursor: (!isDecoyValid || isDisabled) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <FileText size={16} /> 📄 Xuất Bản Đề Xuất Giá (Draft Proposal)
          </button>
        </div>
      </div>

      {/* MODAL XUẤT BÁO CÁO TCO CHUYÊN NGHIỆP GỬI KHÁCH */}
      {isExportModalOpen && (
        <div 
          className="tco-modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
          }}
        >
          <div 
            className="tco-modal-content"
            style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}
          >
            {/* Header Modal (Actions bar) - ẨN KHI IN */}
            <div 
              className="no-print"
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.25)',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--accent-primary)" />
                <span style={{ fontWeight: 'bold', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                  {tcoLanguage === 'en' ? 'TCO Benchmark Report (Client-Ready A4 Document)' : 'Báo Cáo TCO Benchmark (Bản Xem Trước Chuẩn A4)'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Language Switcher */}
                <button
                  type="button"
                  onClick={() => setTcoLanguage(prev => prev === 'en' ? 'vi' : 'en')}
                  className="btn btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.78rem',
                    padding: '6px 12px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid var(--accent-primary)',
                    color: '#93c5fd',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                  title="Chuyển đổi ngôn ngữ Tiếng Anh / Tiếng Việt"
                >
                  <Globe size={14} /> {tcoLanguage === 'en' ? '🇬🇧 English' : '🇻🇳 Tiếng Việt'}
                </button>
                <button
                  type="button"
                  onClick={handleOpenCanvaTemplate}
                  className="btn btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(99, 102, 241, 0.2))',
                    border: '1px solid #a855f7',
                    color: '#e9d5ff',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                  title="Mở Mẫu Thiết Kế trên Canva & Tự Động Sao Chép Số Liệu"
                >
                  <Palette size={14} color="#c084fc" /> 🎨 {tcoLanguage === 'en' ? 'Open Canva' : 'Mở Canva'}
                </button>
                <button
                  type="button"
                  onClick={handleCopyTcoReport}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', padding: '6px 10px' }}
                >
                  {isCopied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  {isCopied ? (tcoLanguage === 'en' ? 'Copied!' : 'Đã copy!') : (tcoLanguage === 'en' ? 'Copy Text' : 'Sao chép')}
                </button>
                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', padding: '6px 14px', fontWeight: 'bold' }}
                >
                  <Printer size={14} /> 🖨 {tcoLanguage === 'en' ? 'Print / Save PDF' : 'In / Lưu PDF'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  style={{ background: 'transparent', border: 0, color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Thông Báo Toast khi bấm Mở Canva - ẨN KHI IN */}
            {canvaToast && (
              <div 
                className="no-print"
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                }}
              >
                <CheckCircle2 size={15} /> {tcoLanguage === 'en' ? '✓ TCO dataset copied! Opening Canva template...' : '✓ Đã tự động sao chép bảng số liệu TCO! Đang chuyển sang Canva...'}
              </div>
            )}

            {/* Nội Dung Báo Cáo In / Xuất (Printable Container) */}
            <div id="tco-printable-report" style={{
              padding: '28px',
              overflowY: 'auto',
              flex: 1,
              background: '#0b1120',
              color: '#f8fafc',
              fontSize: '0.86rem',
              lineHeight: '1.5'
            }}>
              {/* Banner Tùy Biến Thương Hiệu Trên Canva - ẨN KHI IN */}
              <div 
                className="no-print"
                style={{ 
                  padding: '12px 16px', 
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.12), rgba(59, 130, 246, 0.12))', 
                  border: '1px solid rgba(168, 85, 247, 0.35)', 
                  borderRadius: '10px', 
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#c084fc', fontSize: '0.84rem' }}>
                    <Palette size={15} /> {tcoLanguage === 'en' ? 'Brand Customization on Canva (1-Click Canva Pro)' : 'Tùy Biến Nhận Diện Thương Hiệu Doanh Nghiệp (Canva Pro Link)'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px', lineHeight: '1.4' }}>
                    {tcoLanguage === 'en' 
                      ? '💡 3 Quick Steps: [1] Click "Open Canva" ➔ [2] Insert your corporate Logo & colors ➔ [3] Paste (Ctrl+V) pre-formatted TCO dataset!'
                      : '💡 3 Bước Tùy Biến: [1] Bấm Mở Canva ➔ [2] Đổi Logo, màu sắc & ảnh nhà máy ➔ [3] Dán (Ctrl+V) bảng số liệu và tải PDF!'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCanvaTemplate}
                  style={{
                    background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.35)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <ExternalLink size={13} /> {tcoLanguage === 'en' ? 'Open Canva Template' : 'Mở Mẫu Canva'}
                </button>
              </div>

              {/* Thông báo hướng dẫn chỉnh sửa trực tiếp - ẨN KHI IN */}
              <div 
                className="no-print"
                style={{
                  padding: '8px 12px',
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px dashed rgba(59, 130, 246, 0.3)',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  fontSize: '0.76rem',
                  color: '#93c5fd',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={14} /> {tcoLanguage === 'en' ? 'Click on any text below (Company name, title, SLA, signature) to edit before printing/saving to PDF.' : 'Bạn có thể nhấp trực tiếp vào bất kỳ dòng văn bản nào bên dưới để chỉnh sửa trước khi bấm In / Lưu PDF!'}
              </div>

              {/* Report Header - Editable */}
              <div style={{ borderBottom: '2px solid #38bdf8', paddingBottom: '14px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  {/* Tên Doanh Nghiệp Bạn */}
                  <input
                    type="text"
                    key={`company_${tcoLanguage}`}
                    defaultValue={tcoLanguage === 'en' ? 'VIETNAM GLOBAL EXPORT CORPORATION' : 'CÔNG TY CỔ PHẦN XUẤT NHẬP KHẨU B2B'}
                    className="report-editable-input"
                    placeholder="Enter company name..."
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      background: 'transparent',
                      border: '1px dashed transparent',
                      borderRadius: '4px',
                      padding: '2px 4px',
                      width: '100%',
                      marginBottom: '4px'
                    }}
                  />
                  {/* Tiêu đề Báo Cáo */}
                  <input
                    type="text"
                    key={`title_${tcoLanguage}`}
                    defaultValue={tcoLanguage === 'en' ? 'TOTAL COST OF OWNERSHIP (TCO) BENCHMARK REPORT' : 'BẢNG SO SÁNH TỔNG CHI PHÍ SỞ HỮU (TCO BENCHMARK)'}
                    className="report-editable-input"
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 900,
                      color: '#38bdf8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      background: 'transparent',
                      border: '1px dashed transparent',
                      borderRadius: '4px',
                      padding: '2px 4px',
                      width: '100%'
                    }}
                  />
                  {/* Kính gửi Buyer */}
                  <input
                    type="text"
                    key={`buyer_${tcoLanguage}`}
                    defaultValue={tcoLanguage === 'en' ? 'ATTN: Global Procurement & Sourcing Department' : 'Kính gửi: Bộ Phận Thu Mua / Global Sourcing Dept'}
                    className="report-editable-input"
                    style={{
                      fontSize: '0.8rem',
                      color: '#cbd5e1',
                      background: 'transparent',
                      border: '1px dashed transparent',
                      borderRadius: '4px',
                      padding: '2px 4px',
                      width: '100%',
                      marginTop: '2px'
                    }}
                  />
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#94a3b8' }}>
                  <div><strong>{tcoLanguage === 'en' ? 'Date Issued:' : 'Ngày lập:'}</strong> {tcoLanguage === 'en' ? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : new Date().toLocaleDateString('vi-VN')}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '2px' }}>
                    <strong>{tcoLanguage === 'en' ? 'Validity:' : 'Hiệu lực:'}</strong>
                    <input
                      type="text"
                      key={`validity_${tcoLanguage}`}
                      defaultValue={tcoLanguage === 'en' ? '30 Days' : '30 ngày'}
                      className="report-editable-input"
                      style={{
                        fontSize: '0.78rem',
                        color: 'inherit',
                        fontWeight: 'bold',
                        background: 'transparent',
                        border: '1px dashed transparent',
                        width: '80px',
                        textAlign: 'right'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 3 Metrics Box */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#fca5a5', textTransform: 'uppercase', fontWeight: 700 }}>
                    {tcoLanguage === 'en' ? 'Incumbent / Competitor' : 'Đối thủ / NCC Cũ'}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f87171', marginTop: '2px' }}>{formatNumber(competitorLandedCost)}</div>
                </div>
                <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 700 }}>
                    {tcoLanguage === 'en' ? 'Our Proposed Solution' : 'Đề Xuất Doanh Nghiệp Bạn'}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>{formatNumber(yourLandedCost)}</div>
                </div>
                <div style={{ padding: '10px 14px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 700 }}>
                    {tcoLanguage === 'en' ? 'Net Savings for Buyer' : 'Tiết Kiệm Cho Khách Hàng'}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: isSaving ? '#38bdf8' : '#f59e0b', marginTop: '2px' }}>
                    {isSaving ? `+${formatNumber(netSavings)}` : formatNumber(netSavings)}
                    {competitorLandedCost > 0 && <span style={{ fontSize: '0.75rem', marginLeft: '6px' }}>({savingsPercent}%)</span>}
                  </div>
                </div>
              </div>

              {/* Bảng Chi Tiết Chuẩn Hóa Hoàn Toàn (Không Input, Không Thùng Rác) */}
              <div style={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <th style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 'bold', color: '#cbd5e1' }}>
                        {tcoLanguage === 'en' ? 'COST COMPONENTS' : 'CẤU PHẦN CHI PHÍ'}
                      </th>
                      <th style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 'bold', color: '#fca5a5', width: '22%' }}>
                        {tcoLanguage === 'en' ? 'INCUMBENT / COMPETITOR' : 'ĐỐI THỦ / NCC CŨ'}
                      </th>
                      <th style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 'bold', color: '#6ee7b7', width: '22%' }}>
                        {tcoLanguage === 'en' ? 'OUR PROPOSAL' : 'DOANH NGHIỆP BẠN'}
                      </th>
                      <th style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 'bold', color: '#93c5fd', width: '18%' }}>
                        {tcoLanguage === 'en' ? 'VARIANCE' : 'CHÊNH LỆCH'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {COST_ITEMS.map((item, idx) => {
                      const compVal = Number(competitorTco[item.id as keyof typeof competitorTco]) || 0;
                      const yourVal = Number(yourTco[item.id as keyof typeof yourTco]) || 0;
                      const diff = compVal - yourVal;
                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.015)' : 'transparent' }}>
                          <td style={{ padding: '8px 12px', color: '#f1f5f9', fontWeight: 600 }}>
                            {tcoLanguage === 'en' ? item.labelEn : item.label}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: '#fca5a5', fontWeight: 600 }}>
                            {formatNumber(compVal)}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: '#6ee7b7', fontWeight: 600 }}>
                            {formatNumber(yourVal)}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'bold', color: diff > 0 ? '#10b981' : diff < 0 ? '#f87171' : '#94a3b8' }}>
                            {diff > 0 ? `-${formatNumber(diff)}` : diff < 0 ? `+${formatNumber(Math.abs(diff))}` : '$0'}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Custom items */}
                    {customCosts.map((item) => {
                      const compVal = Number(item.competitor_val) || 0;
                      const yourVal = Number(item.your_val) || 0;
                      const diff = compVal - yourVal;
                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(168, 85, 247, 0.03)' }}>
                          <td style={{ padding: '8px 12px', color: '#f1f5f9', fontWeight: 600 }}>
                            {item.label}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: '#fca5a5', fontWeight: 600 }}>
                            {formatNumber(compVal)}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: '#6ee7b7', fontWeight: 600 }}>
                            {formatNumber(yourVal)}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'bold', color: diff > 0 ? '#10b981' : diff < 0 ? '#f87171' : '#94a3b8' }}>
                            {diff > 0 ? `-${formatNumber(diff)}` : diff < 0 ? `+${formatNumber(Math.abs(diff))}` : '$0'}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Total Row */}
                    <tr style={{ background: 'rgba(15, 23, 42, 0.9)', borderTop: '2px solid rgba(255, 255, 255, 0.15)' }}>
                      <td style={{ padding: '11px 12px', fontWeight: 900, color: '#38bdf8' }}>
                        {tcoLanguage === 'en' ? 'TOTAL LANDED COST OF OWNERSHIP (TCO)' : 'TỔNG CHI PHÍ ĐÍCH SỞ HỮU (TCO)'}
                      </td>
                      <td style={{ padding: '11px 12px', textAlign: 'right', fontWeight: 900, color: '#f87171', fontSize: '0.92rem' }}>
                        {formatNumber(competitorLandedCost)}
                      </td>
                      <td style={{ padding: '11px 12px', textAlign: 'right', fontWeight: 900, color: '#10b981', fontSize: '0.92rem' }}>
                        {formatNumber(yourLandedCost)}
                      </td>
                      <td style={{ padding: '11px 12px', textAlign: 'right', fontWeight: 900, color: isSaving ? '#38bdf8' : '#94a3b8', fontSize: '0.92rem' }}>
                        {isSaving ? `-${formatNumber(netSavings)}` : formatNumber(netSavings)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Value Pitch - Editable */}
              <div style={{ padding: '12px 16px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '8px', marginBottom: '18px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '4px' }}>
                  {tcoLanguage === 'en' ? '✓ Value-Added Service Level Agreement (SLA):' : '✓ Cam Kết Giá Trị Gia Tăng (Value-Added SLA):'}
                </strong>
                <textarea
                  key={`sla_${tcoLanguage}`}
                  defaultValue={tcoLanguage === 'en' 
                    ? "We enforce strict factory quality control, full C/O documentation for preferential tariff reductions, optimized container loading, and a guaranteed 100% defect replacement policy."
                    : "Chúng tôi áp dụng quy trình kiểm soát chất lượng nghiêm ngặt, hỗ trợ trọn gói chứng từ C/O ưu đãi thuế, tối ưu cước vận chuyển và cam kết bù hàng 100% nếu phát sinh lỗi kỹ thuật."}
                  rows={2}
                  className="report-editable-input"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: '1px dashed transparent',
                    color: 'inherit',
                    fontSize: '0.8rem',
                    lineHeight: '1.4',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Footer Sign-off - Editable */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.78rem', color: '#94a3b8', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <input
                    type="text"
                    key={`sign_${tcoLanguage}`}
                    defaultValue={tcoLanguage === 'en' ? 'Authorized Sales Rep: International B2B Export Division' : 'Đại diện Bán hàng: Bộ phận Xuất Khẩu B2B'}
                    className="report-editable-input"
                    style={{ fontWeight: 600, color: '#f1f5f9', background: 'transparent', border: '1px dashed transparent', width: '320px' }}
                  />
                  <input
                    type="text"
                    defaultValue="Email: sales@b2bexports.com | Tel: +84 (0) 90 123 4567"
                    className="report-editable-input"
                    style={{ color: '#94a3b8', background: 'transparent', border: '1px dashed transparent', width: '320px', display: 'block', marginTop: '2px' }}
                  />
                </div>
                <div style={{ textAlign: 'right', fontStyle: 'italic', color: '#64748b' }}>
                  {tcoLanguage === 'en' ? 'Commercial quotation subject to formal confirmation' : 'Xác nhận đề xuất báo giá có giá trị thương mại'}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL XUẤT BẢN ĐỀ XUẤT GIÁ ĐA TẦNG (DRAFT PROPOSAL QUOTATION) */}
      {isProposalModalOpen && (
        <div 
          className="tco-modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
          }}
        >
          <div 
            className="tco-modal-content"
            style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}
          >
            {/* Header Modal (Actions bar) - ẨN KHI IN */}
            <div 
              className="no-print"
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.25)',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--accent-primary)" />
                <span style={{ fontWeight: 'bold', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                  {proposalLanguage === 'en' ? 'Commercial Sales Proposal (Tiered Quotation)' : 'Bản Đề Xuất Báo Giá Đa Tầng (Draft Proposal)'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Language Switcher */}
                <button
                  type="button"
                  onClick={() => setProposalLanguage(prev => prev === 'en' ? 'vi' : 'en')}
                  className="btn btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.78rem',
                    padding: '6px 12px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid var(--accent-primary)',
                    color: '#93c5fd',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                  title="Chuyển đổi ngôn ngữ Tiếng Anh / Tiếng Việt"
                >
                  <Globe size={14} /> {proposalLanguage === 'en' ? '🇬🇧 English' : '🇻🇳 Tiếng Việt'}
                </button>
                <button
                  type="button"
                  onClick={handleOpenProposalCanva}
                  className="btn btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(99, 102, 241, 0.2))',
                    border: '1px solid #a855f7',
                    color: '#e9d5ff',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  <Palette size={14} color="#c084fc" /> 🎨 {proposalLanguage === 'en' ? 'Open Canva' : 'Mở Canva'}
                </button>
                <button
                  type="button"
                  onClick={handleCopyProposal}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', padding: '6px 10px' }}
                >
                  {isProposalCopied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  {isProposalCopied ? (proposalLanguage === 'en' ? 'Copied!' : 'Đã copy!') : (proposalLanguage === 'en' ? 'Copy Text' : 'Sao chép')}
                </button>
                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', padding: '6px 14px', fontWeight: 'bold' }}
                >
                  <Printer size={14} /> 🖨 {proposalLanguage === 'en' ? 'Print / Save PDF' : 'In / Lưu PDF'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsProposalModalOpen(false)}
                  style={{ background: 'transparent', border: 0, color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Thông Báo Toast Canva Proposal */}
            {proposalCanvaToast && (
              <div 
                className="no-print"
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                }}
              >
                <CheckCircle2 size={15} /> {proposalLanguage === 'en' ? '✓ Proposal text copied! Opening Canva proposal template...' : '✓ Đã sao chép nội dung đề xuất giá! Đang mở Canva...'}
              </div>
            )}

            {/* Nội Dung Bản Đề Xuất Giá In / Xuất (Printable Container) */}
            <div id="proposal-printable-report" style={{
              padding: '28px',
              overflowY: 'auto',
              flex: 1,
              background: '#0b1120',
              color: '#f8fafc',
              fontSize: '0.84rem',
              lineHeight: '1.5'
            }}>
              {/* Banner Tùy Biến Thương Hiệu Trên Canva - ẨN KHI IN */}
              <div 
                className="no-print"
                style={{ 
                  padding: '12px 16px', 
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.12), rgba(59, 130, 246, 0.12))', 
                  border: '1px solid rgba(168, 85, 247, 0.35)', 
                  borderRadius: '10px', 
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#c084fc', fontSize: '0.84rem' }}>
                    <Palette size={15} /> {proposalLanguage === 'en' ? 'Brand Customization on Canva (1-Click Canva Pro)' : 'Tùy Biến Nhận Diện Thương Hiệu Doanh Nghiệp (Canva Pro Link)'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px', lineHeight: '1.4' }}>
                    {proposalLanguage === 'en' 
                      ? '💡 3 Quick Steps: [1] Click "Open Canva" ➔ [2] Insert your corporate Logo & colors ➔ [3] Paste (Ctrl+V) pre-formatted quotation proposal!'
                      : '💡 3 Bước Tùy Biến: [1] Bấm Mở Canva ➔ [2] Đổi Logo, màu sắc & ảnh nhà máy ➔ [3] Dán (Ctrl+V) bản báo giá và tải PDF!'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenProposalCanva}
                  style={{
                    background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.35)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <ExternalLink size={13} /> {proposalLanguage === 'en' ? 'Open Canva Template' : 'Mở Mẫu Canva'}
                </button>
              </div>

              {/* Thông báo hướng dẫn chỉnh sửa trực tiếp - ẨN KHI IN */}
              <div 
                className="no-print"
                style={{
                  padding: '8px 12px',
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px dashed rgba(59, 130, 246, 0.3)',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  fontSize: '0.76rem',
                  color: '#93c5fd',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={14} /> {proposalLanguage === 'en' ? 'Live Inline-Editing Enabled: Click on any cell, price, MOQ, SLA feature or commercial term to edit before printing.' : 'Chế độ chỉnh sửa trực tiếp: Bạn có thể nhấp vào bất kỳ ô nào trên bảng ma trận, giá, MOQ, điều khoản thanh toán để sửa trước khi In / Lưu PDF!'}
              </div>

              {/* KHU VỰC 1: HEADER BÁO GIÁ NGOẠI THƯƠNG TRANG TRỌNG */}
              <div style={{ borderBottom: '2px solid #38bdf8', paddingBottom: '14px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ flex: 1.2, minWidth: '280px' }}>
                  <input
                    type="text"
                    key={`prop_comp_${proposalLanguage}`}
                    defaultValue={proposalLanguage === 'en' ? 'VIETNAM GLOBAL EXPORT MANUFACTURING CORP' : 'CÔNG TY CỔ PHẦN TẬP ĐOÀN XUẤT NHẬP KHẨU B2B'}
                    className="report-editable-input"
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      background: 'transparent',
                      border: '1px dashed transparent',
                      borderRadius: '4px',
                      padding: '2px 4px',
                      width: '100%',
                      marginBottom: '2px'
                    }}
                  />
                  <input
                    type="text"
                    key={`prop_title_${proposalLanguage}`}
                    defaultValue={proposalLanguage === 'en' ? 'COMMERCIAL SALES PROPOSAL & TIERED PRICING' : 'BẢN ĐỀ XUẤT BÁO GIÁ THƯƠNG MẠI & ĐA TẦNG GIÁ TRỊ'}
                    className="report-editable-input"
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 900,
                      color: '#38bdf8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      background: 'transparent',
                      border: '1px dashed transparent',
                      borderRadius: '4px',
                      padding: '2px 4px',
                      width: '100%'
                    }}
                  />
                  <input
                    type="text"
                    key={`prop_addr_${proposalLanguage}`}
                    defaultValue={proposalLanguage === 'en' ? 'Factory & Office: Lot CN-08, Tan Tao Industrial Zone, Hochiminh City, Vietnam' : 'Nhà máy & VP: Lô CN-08, KCN Tân Tạo, TP. Hồ Chí Minh, Việt Nam'}
                    className="report-editable-input"
                    style={{
                      fontSize: '0.76rem',
                      color: '#94a3b8',
                      background: 'transparent',
                      border: '1px dashed transparent',
                      borderRadius: '4px',
                      padding: '2px 4px',
                      width: '100%',
                      marginTop: '2px'
                    }}
                  />
                </div>

                <div style={{ flex: 0.8, textAlign: 'right', fontSize: '0.78rem', color: '#94a3b8', minWidth: '220px' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px' }}>
                    <strong>{proposalLanguage === 'en' ? 'Ref No:' : 'Số hiệu:'}</strong>
                    <input
                      type="text"
                      defaultValue={`EXP-QT-${Date.now().toString().slice(-6)}`}
                      className="report-editable-input"
                      style={{ color: '#38bdf8', fontWeight: 'bold', background: 'transparent', border: '1px dashed transparent', width: '130px', textAlign: 'right' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <strong>{proposalLanguage === 'en' ? 'Date Issued:' : 'Ngày lập:'}</strong>
                    <span>{proposalLanguage === 'en' ? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : new Date().toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <strong>{proposalLanguage === 'en' ? 'Validity:' : 'Hiệu lực:'}</strong>
                    <input
                      type="text"
                      key={`prop_validity_${proposalLanguage}`}
                      defaultValue={proposalLanguage === 'en' ? '30 Calendar Days' : '30 ngày kể từ ngày báo'}
                      className="report-editable-input"
                      style={{ color: '#f59e0b', fontWeight: 'bold', background: 'transparent', border: '1px dashed transparent', width: '140px', textAlign: 'right' }}
                    />
                  </div>
                  <div style={{ marginTop: '4px', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '4px' }}>
                    <input
                      type="text"
                      key={`prop_buyer_${proposalLanguage}`}
                      defaultValue={proposalLanguage === 'en' ? 'ATTN: Global Procurement Directorate' : 'Kính gửi: Hội Đồng Thu Mua & Quản Lý Ngành Hàng'}
                      className="report-editable-input"
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: '#cbd5e1',
                        background: 'transparent',
                        border: '1px dashed transparent',
                        width: '100%',
                        textAlign: 'right'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* KHU VỰC 2: BẢNG MA TRẬN ĐỐI CHIẾU TÍNH NĂNG 3 GÓI GIÁ (FEATURE-BY-FEATURE DECOY MATRIX) */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <input
                    type="text"
                    key={`prop_sec1_${proposalLanguage}`}
                    defaultValue={proposalLanguage === 'en' ? '1. TIERED COMMERCIAL PRICING & VALUE COMPARISON MATRIX' : '1. BẢNG MA TRẬN ĐỐI CHIẾU 3 PHƯƠNG ÁN BÁO GIÁ ĐA TẦNG'}
                    className="report-editable-input"
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 'bold',
                      color: '#e2e8f0',
                      background: 'transparent',
                      border: '1px dashed transparent',
                      borderRadius: '4px',
                      padding: '2px 4px',
                      width: '80%'
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>
                    {proposalLanguage === 'en' ? 'Anchoring & Decoy Architecture' : 'Kiến trúc Định giá Chim mồi'}
                  </span>
                </div>

                <div style={{ border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(30, 41, 59, 0.95)', borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 'bold', color: '#cbd5e1', width: '28%' }}>
                          {proposalLanguage === 'en' ? 'CRITERIA & SLA COMMITMENTS' : 'TIÊU CHÍ & CAM KẾT SLA'}
                        </th>
                        {activeOptions.map((opt, idx) => (
                          <th 
                            key={opt.id} 
                            style={{ 
                              padding: '10px 12px', 
                              textAlign: 'center', 
                              fontWeight: 'bold',
                              width: `${72 / (activeOptions.length || 1)}%`,
                              background: idx === 1 ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                              borderLeft: '1px solid rgba(255, 255, 255, 0.08)'
                            }}
                          >
                            <div style={{ fontSize: '0.72rem', color: idx === 1 ? '#38bdf8' : '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>
                              {idx === 0 
                                ? (proposalLanguage === 'en' ? 'OPTION A (ECONOMY)' : 'GÓI A (TỐI ƯU)') 
                                : idx === 1 
                                  ? (proposalLanguage === 'en' ? 'OPTION B (STANDARD ⭐)' : 'GÓI B (TIÊU CHUẨN ⭐)') 
                                  : (proposalLanguage === 'en' ? 'OPTION C (PREMIUM)' : 'GÓI C (NÂNG CAO)')}
                            </div>
                            <input
                              type="text"
                              key={`th_name_${opt.id}`}
                              defaultValue={opt.name}
                              className="report-editable-input"
                              style={{
                                fontSize: '0.86rem',
                                fontWeight: 900,
                                color: idx === 1 ? '#60a5fa' : '#f8fafc',
                                textAlign: 'center',
                                background: 'transparent',
                                border: '1px dashed transparent',
                                width: '100%',
                                marginTop: '2px'
                              }}
                            />
                            {idx === 1 && (
                              <span style={{ display: 'inline-block', fontSize: '0.66rem', background: '#3b82f6', color: '#fff', padding: '1px 8px', borderRadius: '10px', marginTop: '2px', fontWeight: 'bold' }}>
                                {proposalLanguage === 'en' ? 'MOST POPULAR CHOICE' : 'LỰA CHỌN KHUYÊN DÙNG'}
                              </span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Row 1: Proposed Unit Price */}
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.02)' }}>
                        <td style={{ padding: '9px 12px', fontWeight: 'bold', color: '#38bdf8' }}>
                          {proposalLanguage === 'en' ? '1. Proposed FOB Unit Price' : '1. Đơn Giá Báo Xuất Xưởng / FOB'}
                        </td>
                        {activeOptions.map((opt, idx) => (
                          <td 
                            key={opt.id} 
                            style={{ 
                              padding: '9px 12px', 
                              textAlign: 'center',
                              background: idx === 1 ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                              borderLeft: '1px solid rgba(255, 255, 255, 0.08)'
                            }}
                          >
                            <input
                              type="text"
                              key={`r_price_${opt.id}`}
                              defaultValue={`${formatNumber(Number(opt.price) || 0)} / unit`}
                              className="report-editable-input"
                              style={{
                                fontSize: '1.15rem',
                                fontWeight: 900,
                                color: '#10b981',
                                textAlign: 'center',
                                background: 'transparent',
                                border: '1px dashed transparent',
                                width: '100%'
                              }}
                            />
                          </td>
                        ))}
                      </tr>

                      {/* Row 2: Minimum Order Quantity (MOQ) */}
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: '#f1f5f9' }}>
                          {proposalLanguage === 'en' ? '2. Minimum Order Quantity (MOQ)' : '2. Sản Lượng Tối Thiểu (MOQ)'}
                        </td>
                        {activeOptions.map((opt, idx) => (
                          <td 
                            key={opt.id} 
                            style={{ 
                              padding: '8px 12px', 
                              textAlign: 'center',
                              background: idx === 1 ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                              borderLeft: '1px solid rgba(255, 255, 255, 0.08)'
                            }}
                          >
                            <input
                              type="text"
                              key={`r_moq_${opt.id}_${proposalLanguage}`}
                              defaultValue={idx === 0 
                                ? (proposalLanguage === 'en' ? '1x40ft FCL (~20,000 units)' : '1x40ft FCL (~20,000 đơn vị)') 
                                : idx === 1 
                                  ? (proposalLanguage === 'en' ? '1x20ft FCL (~10,000 units)' : '1x20ft FCL (~10,000 đơn vị)') 
                                  : (proposalLanguage === 'en' ? 'Flexible MOQ (~5,000 units)' : 'Linh hoạt (~5,000 đơn vị)')}
                              className="report-editable-input"
                              style={{ color: '#cbd5e1', textAlign: 'center', background: 'transparent', border: '1px dashed transparent', width: '100%' }}
                            />
                          </td>
                        ))}
                      </tr>

                      {/* Row 3: Export Packaging Standard */}
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255, 255, 255, 0.015)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: '#f1f5f9' }}>
                          {proposalLanguage === 'en' ? '3. Export Packaging Standard' : '3. Quy Cách Đóng Gói Xuất Khẩu'}
                        </td>
                        {activeOptions.map((opt, idx) => (
                          <td 
                            key={opt.id} 
                            style={{ 
                              padding: '8px 12px', 
                              textAlign: 'center',
                              background: idx === 1 ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                              borderLeft: '1px solid rgba(255, 255, 255, 0.08)'
                            }}
                          >
                            <input
                              type="text"
                              key={`r_pack_${opt.id}_${proposalLanguage}`}
                              defaultValue={idx === 0 
                                ? (proposalLanguage === 'en' ? 'Standard 5-ply export carton' : 'Thùng carton 5 lớp tiêu chuẩn') 
                                : idx === 1 
                                  ? (proposalLanguage === 'en' ? 'Fumigated Pallets + Shrink Wrap' : 'Pallet gỗ hun trùng + Màng co') 
                                  : (proposalLanguage === 'en' ? 'Custom OEM Branding + Heavy Duty Pallet' : 'Thương hiệu OEM + Pallet chịu lực')}
                              className="report-editable-input"
                              style={{ color: '#cbd5e1', textAlign: 'center', background: 'transparent', border: '1px dashed transparent', width: '100%' }}
                            />
                          </td>
                        ))}
                      </tr>

                      {/* Row 4: Production Lead Time */}
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: '#f1f5f9' }}>
                          {proposalLanguage === 'en' ? '4. Production Lead Time' : '4. Thời Gian Sản Xuất & Giao Hàng'}
                        </td>
                        {activeOptions.map((opt, idx) => (
                          <td 
                            key={opt.id} 
                            style={{ 
                              padding: '8px 12px', 
                              textAlign: 'center',
                              background: idx === 1 ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                              borderLeft: '1px solid rgba(255, 255, 255, 0.08)'
                            }}
                          >
                            <input
                              type="text"
                              key={`r_lead_${opt.id}_${proposalLanguage}`}
                              defaultValue={idx === 0 
                                ? (proposalLanguage === 'en' ? '25 - 30 business days' : '25 - 30 ngày làm việc') 
                                : idx === 1 
                                  ? (proposalLanguage === 'en' ? '14 - 18 business days (Priority Line)' : '14 - 18 ngày làm việc (Ưu tiên)') 
                                  : (proposalLanguage === 'en' ? '10 - 14 business days (Fast-Track)' : '10 - 14 ngày làm việc (Thần tốc)')}
                              className="report-editable-input"
                              style={{ color: idx === 1 ? '#60a5fa' : '#cbd5e1', fontWeight: idx === 1 ? 'bold' : 'normal', textAlign: 'center', background: 'transparent', border: '1px dashed transparent', width: '100%' }}
                            />
                          </td>
                        ))}
                      </tr>

                      {/* Row 5: Quality Inspection & QA SLA */}
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255, 255, 255, 0.015)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: '#f1f5f9' }}>
                          {proposalLanguage === 'en' ? '5. Quality Audit & Inspection SLA' : '5. Kiểm Định Chất Lượng & Chứng Nhận'}
                        </td>
                        {activeOptions.map((opt, idx) => (
                          <td 
                            key={opt.id} 
                            style={{ 
                              padding: '8px 12px', 
                              textAlign: 'center',
                              background: idx === 1 ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                              borderLeft: '1px solid rgba(255, 255, 255, 0.08)'
                            }}
                          >
                            <input
                              type="text"
                              key={`r_qa_${opt.id}_${proposalLanguage}`}
                              defaultValue={idx === 0 
                                ? (proposalLanguage === 'en' ? 'In-house Factory QA Inspection' : 'Kiểm tra QA nội bộ xuất xưởng') 
                                : idx === 1 
                                  ? (proposalLanguage === 'en' ? 'Pre-shipment Inspection + Full COA' : 'Pre-shipment Audit + Phiếu COA') 
                                  : (proposalLanguage === 'en' ? 'Third-Party SGS / Intertek Inspection' : 'Kiểm định độc lập SGS / Intertek')}
                              className="report-editable-input"
                              style={{ color: '#cbd5e1', textAlign: 'center', background: 'transparent', border: '1px dashed transparent', width: '100%' }}
                            />
                          </td>
                        ))}
                      </tr>

                      {/* Row 6: Defect Replacement Guarantee */}
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: '#f1f5f9' }}>
                          {proposalLanguage === 'en' ? '6. Defect Replacement Guarantee' : '6. Chính Sách Cam Kết Bù Lỗi Hàng'}
                        </td>
                        {activeOptions.map((opt, idx) => (
                          <td 
                            key={opt.id} 
                            style={{ 
                              padding: '8px 12px', 
                              textAlign: 'center',
                              background: idx === 1 ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                              borderLeft: '1px solid rgba(255, 255, 255, 0.08)'
                            }}
                          >
                            <input
                              type="text"
                              key={`r_rep_${opt.id}_${proposalLanguage}`}
                              defaultValue={idx === 0 
                                ? (proposalLanguage === 'en' ? 'Deduction on subsequent order' : 'Giảm trừ vào đơn hàng tiếp theo') 
                                : idx === 1 
                                  ? (proposalLanguage === 'en' ? '100% Free Replacement in 7 Days' : 'Bù hàng 100% miễn phí trong 7 ngày') 
                                  : (proposalLanguage === 'en' ? 'Immediate 100% Compensation + Insurance' : 'Bù 100% ngay + Đền bù phát sinh')}
                              className="report-editable-input"
                              style={{ color: idx === 1 ? '#10b981' : '#cbd5e1', fontWeight: idx === 1 ? 'bold' : 'normal', textAlign: 'center', background: 'transparent', border: '1px dashed transparent', width: '100%' }}
                            />
                          </td>
                        ))}
                      </tr>

                      {/* Row 7: FTA Tariff Optimization */}
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255, 255, 255, 0.015)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: '#f1f5f9' }}>
                          {proposalLanguage === 'en' ? '7. FTA C/O Tariff Facilitation' : '7. Hỗ Trợ Chứng Từ Thuế Quan C/O FTA'}
                        </td>
                        {activeOptions.map((opt, idx) => (
                          <td 
                            key={opt.id} 
                            style={{ 
                              padding: '8px 12px', 
                              textAlign: 'center',
                              background: idx === 1 ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                              borderLeft: '1px solid rgba(255, 255, 255, 0.08)'
                            }}
                          >
                            <input
                              type="text"
                              key={`r_fta_${opt.id}_${proposalLanguage}`}
                              defaultValue={idx === 0 
                                ? (proposalLanguage === 'en' ? 'Standard non-preferential C/O' : 'C/O tiêu chuẩn thông thường') 
                                : idx === 1 
                                  ? (proposalLanguage === 'en' ? 'Preferential Form FTA C/O (0% Duty)' : 'Hỗ trợ C/O Form ưu đãi thuế 0%') 
                                  : (proposalLanguage === 'en' ? 'Full FTA C/O + Customs Broker Support' : 'C/O ưu đãi + Đại lý hải quan trọn gói')}
                              className="report-editable-input"
                              style={{ color: '#cbd5e1', textAlign: 'center', background: 'transparent', border: '1px dashed transparent', width: '100%' }}
                            />
                          </td>
                        ))}
                      </tr>

                      {/* Row 8: Custom Scope & Value Add */}
                      <tr style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                        <td style={{ padding: '9px 12px', fontWeight: 'bold', color: '#cbd5e1' }}>
                          {proposalLanguage === 'en' ? '8. Scope & Specialized Features' : '8. Chi Tiết Tính Năng & Giá Trị Kèm Theo'}
                        </td>
                        {activeOptions.map((opt, idx) => (
                          <td 
                            key={opt.id} 
                            style={{ 
                              padding: '8px 12px',
                              background: idx === 1 ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                              borderLeft: '1px solid rgba(255, 255, 255, 0.08)'
                            }}
                          >
                            <textarea
                              key={`r_feat_${opt.id}_${proposalLanguage}`}
                              defaultValue={opt.features || (proposalLanguage === 'en' ? 'Standard export packaging, QA pre-shipment audit, prompt technical customer support.' : 'Đóng gói chuẩn xuất khẩu, kiểm định chất lượng xuất xưởng và hỗ trợ kỹ thuật tận tâm.')}
                              rows={3}
                              className="report-editable-input"
                              style={{
                                width: '100%',
                                fontSize: '0.76rem',
                                color: '#cbd5e1',
                                lineHeight: '1.4',
                                background: 'transparent',
                                border: '1px dashed transparent',
                                borderRadius: '4px',
                                padding: '2px 4px',
                                resize: 'vertical'
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* KHU VỰC 3: KHUNG 6 TRỤ CỘT ĐIỀU KHOẢN THƯƠNG MẠI NGOẠI THƯƠNG (COMMERCIAL TERMS & CONDITIONS) */}
              <div style={{ border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '16px 20px', background: 'rgba(255, 255, 255, 0.02)', marginBottom: '20px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <input
                    type="text"
                    key={`prop_sec2_${proposalLanguage}`}
                    defaultValue={proposalLanguage === 'en' ? '2. INTERNATIONAL COMMERCIAL TERMS & EXPORT CONDITIONS' : '2. ĐIỀU KHOẢN THƯƠNG MẠI & QUY CHUẨN XUẤT KHẨU QUỐC TẾ'}
                    className="report-editable-input"
                    style={{
                      fontWeight: 'bold',
                      color: '#38bdf8',
                      fontSize: '0.88rem',
                      background: 'transparent',
                      border: '1px dashed transparent',
                      borderRadius: '4px',
                      padding: '2px 4px',
                      width: '80%'
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Incoterms 2020 Standard</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', color: '#cbd5e1' }}>
                  {/* Pillar 1: Incoterms */}
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: '6px' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>1. {proposalLanguage === 'en' ? 'Trade Terms (Incoterms):' : 'Điều kiện giao hàng:'} </span>
                    <input
                      type="text"
                      key={`term_inco_${proposalLanguage}`}
                      defaultValue={proposalLanguage === 'en' ? 'FOB Cat Lai / Hai Phong Port (or CIF Destination Port)' : 'FOB Cảng Cát Lái / Hải Phòng (hoặc CIF Cảng Đến)'}
                      className="report-editable-input"
                      style={{ width: '100%', background: 'transparent', border: '1px dashed transparent', color: '#f1f5f9', fontSize: '0.79rem', marginTop: '2px' }}
                    />
                  </div>

                  {/* Pillar 2: Ports */}
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: '6px' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>2. {proposalLanguage === 'en' ? 'Port of Loading & Discharge:' : 'Cảng bốc & Cảng dỡ hàng:'} </span>
                    <input
                      type="text"
                      key={`term_port_${proposalLanguage}`}
                      defaultValue={proposalLanguage === 'en' ? 'POL: Hochiminh City Port | POD: As nominated by Buyer' : 'Cảng đi (POL): TP. Hồ Chí Minh | Cảng đến: Chỉ định bởi Buyer'}
                      className="report-editable-input"
                      style={{ width: '100%', background: 'transparent', border: '1px dashed transparent', color: '#f1f5f9', fontSize: '0.79rem', marginTop: '2px' }}
                    />
                  </div>

                  {/* Pillar 3: Payment Terms */}
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: '6px' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>3. {proposalLanguage === 'en' ? 'Payment & Deposit Terms:' : 'Phương thức thanh toán:'} </span>
                    <input
                      type="text"
                      key={`term_pay_${proposalLanguage}`}
                      defaultValue={proposalLanguage === 'en' ? '30% T/T Advance Deposit, 70% against B/L copy (or Irrevocable L/C)' : '30% T/T Tạm ứng, 70% khi có Bill of Lading (hoặc L/C không hủy ngang)'}
                      className="report-editable-input"
                      style={{ width: '100%', background: 'transparent', border: '1px dashed transparent', color: '#f1f5f9', fontSize: '0.79rem', marginTop: '2px' }}
                    />
                  </div>

                  {/* Pillar 4: Lead Time */}
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: '6px' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>4. {proposalLanguage === 'en' ? 'Production Lead Time:' : 'Tiến độ sản xuất:'} </span>
                    <input
                      type="text"
                      key={`term_lead_${proposalLanguage}`}
                      defaultValue={proposalLanguage === 'en' ? '14 - 21 business days upon receipt of advance deposit & sample approval' : '14 - 21 ngày làm việc sau khi nhận đặt cọc & duyệt mẫu sản xuất'}
                      className="report-editable-input"
                      style={{ width: '100%', background: 'transparent', border: '1px dashed transparent', color: '#f1f5f9', fontSize: '0.79rem', marginTop: '2px' }}
                    />
                  </div>

                  {/* Pillar 5: Shipping Documents */}
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: '6px' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>5. {proposalLanguage === 'en' ? 'Export Shipping Documents:' : 'Bộ chứng từ xuất khẩu:'} </span>
                    <input
                      type="text"
                      key={`term_docs_${proposalLanguage}`}
                      defaultValue={proposalLanguage === 'en' ? 'Commercial Invoice, Packing List, Ocean B/L, Form FTA C/O, Phytosanitary, COA' : 'Invoice, Packing List, Vận đơn B/L, C/O ưu đãi thuế, Kiểm dịch Phyto, COA'}
                      className="report-editable-input"
                      style={{ width: '100%', background: 'transparent', border: '1px dashed transparent', color: '#f1f5f9', fontSize: '0.79rem', marginTop: '2px' }}
                    />
                  </div>

                  {/* Pillar 6: Samples & Validity */}
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: '6px' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>6. {proposalLanguage === 'en' ? 'Samples & Validity Guarantee:' : 'Quy định mẫu & Hiệu lực:'} </span>
                    <input
                      type="text"
                      key={`term_samp_${proposalLanguage}`}
                      defaultValue={proposalLanguage === 'en' ? 'Free pre-production counter-samples available. Quotation valid for 30 calendar days.' : 'Cung cấp mẫu đối chứng miễn phí. Báo giá có hiệu lực trong 30 ngày.'}
                      className="report-editable-input"
                      style={{ width: '100%', background: 'transparent', border: '1px dashed transparent', color: '#f1f5f9', fontSize: '0.79rem', marginTop: '2px' }}
                    />
                  </div>
                </div>
              </div>

              {/* KHU VỰC 4: CHỮ KÝ THẨM QUYỀN & PHÁP LÝ BÁO GIÁ */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.12)', fontSize: '0.78rem', color: '#94a3b8', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <input
                    type="text"
                    key={`prop_sign_${proposalLanguage}`}
                    defaultValue={proposalLanguage === 'en' ? 'Authorized Directorate: International B2B Export Sales' : 'Đại diện Ký Duyệt: Ban Giám Đốc Kinh Doanh Xuất Khẩu'}
                    className="report-editable-input"
                    style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.84rem', background: 'transparent', border: '1px dashed transparent', width: '360px' }}
                  />
                  <input
                    type="text"
                    defaultValue="Email: export@vietnamglobal.com | Direct Phone: +84 (0) 90 123 4567"
                    className="report-editable-input"
                    style={{ color: '#94a3b8', background: 'transparent', border: '1px dashed transparent', width: '360px', display: 'block', marginTop: '2px' }}
                  />
                </div>
                <div style={{ textAlign: 'right', flex: 1, minWidth: '260px' }}>
                  <input
                    type="text"
                    key={`prop_legal_${proposalLanguage}`}
                    defaultValue={proposalLanguage === 'en' ? 'Official Commercial Proposal — Acceptance confirmed via Purchase Order (P.O)' : 'Bản Báo Giá Thương Mại Chính Thức — Xác nhận chấp thuận qua Đơn đặt hàng (P.O)'}
                    className="report-editable-input"
                    style={{ fontStyle: 'italic', color: '#64748b', background: 'transparent', border: '1px dashed transparent', textAlign: 'right', width: '100%' }}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Global CSS Style Cho In & Xuất PDF */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Ẩn toàn bộ thành phần bên ngoài */
          body {
            background: #ffffff !important;
            color: #0f172a !important;
          }
          body * {
            visibility: hidden !important;
          }
          .no-print, .no-print * {
            display: none !important;
            visibility: hidden !important;
          }
          /* Chỉ hiển thị duy nhất container báo cáo đang mở */
          #tco-printable-report, #tco-printable-report *,
          #proposal-printable-report, #proposal-printable-report * {
            visibility: visible !important;
          }
          .tco-modal-overlay {
            position: static !important;
            background: transparent !important;
            padding: 0 !important;
            display: block !important;
            backdrop-filter: none !important;
          }
          .tco-modal-content {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            max-height: none !important;
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
          }
          #tco-printable-report,
          #proposal-printable-report {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: auto !important;
            margin: 0 !important;
            padding: 24px 32px !important;
            background: #ffffff !important;
            color: #0f172a !important;
            z-index: 999999 !important;
            overflow: visible !important;
          }
          #tco-printable-report input,
          #tco-printable-report textarea,
          #proposal-printable-report input,
          #proposal-printable-report textarea {
            border: none !important;
            background: transparent !important;
            color: #0f172a !important;
            padding: 0 !important;
          }
          #tco-printable-report table,
          #proposal-printable-report table {
            border: 1px solid #cbd5e1 !important;
            color: #0f172a !important;
          }
          #tco-printable-report th,
          #proposal-printable-report th {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
          }
          #tco-printable-report td,
          #proposal-printable-report td {
            color: #0f172a !important;
            border-bottom: 1px solid #e2e8f0 !important;
          }
        }

        .report-editable-input:hover,
        .report-editable-input:focus {
          border-color: rgba(59, 130, 246, 0.4) !important;
          background: rgba(255, 255, 255, 0.04) !important;
          outline: none;
        }
      ` }} />
    </section>
  );
}

