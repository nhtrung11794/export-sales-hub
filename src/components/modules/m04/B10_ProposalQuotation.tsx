'use client';

import React, { useState } from 'react';
import { M04FormData, PricingOption, CustomCostItem } from './M04_CombinedForm';
import { Calculator, LayoutList, AlertTriangle, FileText, CheckCircle2, TrendingDown, ArrowRight, ShieldCheck, DollarSign, Sparkles, Plus, Trash2, Printer, Copy, Check, X, Download } from 'lucide-react';

interface Props {
  data: M04FormData;
  setData: React.Dispatch<React.SetStateAction<M04FormData>>;
  handleBlur: () => void;
  isDisabled?: boolean;
}

const COST_ITEMS = [
  { id: 'fob_price', label: '1. Đơn giá FOB / EXW (USD)', desc: 'Giá hàng xuất xưởng / giao mạn tàu', color: '#3b82f6' },
  { id: 'freight', label: '2. Cước Biển & Bảo hiểm Quốc tế (USD)', desc: 'Cước tàu Ocean Freight + Marine Insurance', color: '#8b5cf6' },
  { id: 'import_tax', label: '3. Thuế NK & Thuế Quan (USD)', desc: 'Thuế nhập khẩu nước đến (tận dụng C/O FTA)', color: '#f59e0b' },
  { id: 'local_charges', label: '4. Phí Nội địa & Cảng Đến (USD)', desc: 'THC, D/O, nâng hạ, lưu bãi cont (Demurrage)', color: '#06b6d4' },
  { id: 'doc_inspection_fee', label: '5. Phí Ẩn, Kiểm định & Phế phẩm (USD)', desc: 'Chứng từ SGS/Phyto, tỷ lệ hư hại bù hàng', color: '#ec4899' },
];

export default function B10_ProposalQuotation({ data, setData, handleBlur, isDisabled }: Props) {
  const b10 = data.b10_quotation;
  const [newCostName, setNewCostName] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
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

  const activeOptionsCount = b10.pricing_options.filter(opt => opt.is_active).length;
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

  const handleCopyTcoReport = () => {
    const reportText = `
=== BẢNG PHÂN TÍCH TỔNG CHI PHÍ SỞ HỮU (TCO BENCHMARK REPORT) ===
Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}

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

    navigator.clipboard.writeText(reportText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportProposal = () => {
    if (!isDecoyValid) return;
    alert('✓ Đã khởi tạo Bản Đề xuất Báo giá (Draft Proposal) với cấu trúc giá đa tầng thành công!');
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
        <div style={{
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
        }}>
          <div style={{
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
          }}>
            {/* Header Modal (Actions bar) */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(0, 0, 0, 0.25)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="var(--accent-primary)" />
                <span style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-primary)' }}>
                  Bản Xem Trước Báo Cáo TCO Xuất Khách (Client-Ready Report)
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleCopyTcoReport}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  {isCopied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  {isCopied ? 'Đã sao chép!' : 'Sao chép văn bản'}
                </button>
                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 14px' }}
                >
                  <Printer size={14} /> In / Xuất PDF
                </button>
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  style={{ background: 'transparent', border: 0, color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

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
              {/* Report Header */}
              <div style={{ borderBottom: '2px solid rgba(59, 130, 246, 0.4)', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#38bdf8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    BẢNG SO SÁNH TỔNG CHI PHÍ SỞ HỮU (TCO BENCHMARK)
                  </h1>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                    Phân tích chi phí đích (Buyer Landed Cost) & Tối ưu hóa ngân sách nhập khẩu
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#94a3b8' }}>
                  <div><strong>Ngày lập:</strong> {new Date().toLocaleDateString('vi-VN')}</div>
                  <div><strong>Hiệu lực:</strong> 30 ngày</div>
                </div>
              </div>

              {/* 3 Metrics Box */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '22px' }}>
                <div style={{ padding: '12px 14px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#fca5a5', textTransform: 'uppercase', fontWeight: 700 }}>Đối thủ / NCC Cũ</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f87171', marginTop: '2px' }}>{formatNumber(competitorLandedCost)}</div>
                </div>
                <div style={{ padding: '12px 14px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 700 }}>Đề Xuất Doanh Nghiệp Bạn</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>{formatNumber(yourLandedCost)}</div>
                </div>
                <div style={{ padding: '12px 14px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 700 }}>Tiết Kiệm Cho Khách Hàng</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: isSaving ? '#38bdf8' : '#f59e0b', marginTop: '2px' }}>
                    {isSaving ? `+${formatNumber(netSavings)}` : formatNumber(netSavings)}
                    {competitorLandedCost > 0 && <span style={{ fontSize: '0.75rem', marginLeft: '6px' }}>({savingsPercent}%)</span>}
                  </div>
                </div>
              </div>

              {/* Bảng Chi Tiết Chuẩn Hóa Hoàn Toàn (Không Input, Không Thùng Rác) */}
              <div style={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', overflow: 'hidden', marginBottom: '22px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 'bold', color: '#cbd5e1' }}>CẤU PHẦN CHI PHÍ</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'bold', color: '#fca5a5', width: '22%' }}>ĐỐI THỦ / NCC CŨ</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'bold', color: '#6ee7b7', width: '22%' }}>DOANH NGHIỆP BẠN</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'bold', color: '#93c5fd', width: '18%' }}>CHÊNH LỆCH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COST_ITEMS.map((item, idx) => {
                      const compVal = Number(competitorTco[item.id as keyof typeof competitorTco]) || 0;
                      const yourVal = Number(yourTco[item.id as keyof typeof yourTco]) || 0;
                      const diff = compVal - yourVal;
                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.015)' : 'transparent' }}>
                          <td style={{ padding: '9px 14px', color: '#f1f5f9', fontWeight: 600 }}>
                            {item.label}
                          </td>
                          <td style={{ padding: '9px 14px', textAlign: 'right', color: '#fca5a5', fontWeight: 600 }}>
                            {formatNumber(compVal)}
                          </td>
                          <td style={{ padding: '9px 14px', textAlign: 'right', color: '#6ee7b7', fontWeight: 600 }}>
                            {formatNumber(yourVal)}
                          </td>
                          <td style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 'bold', color: diff > 0 ? '#10b981' : diff < 0 ? '#f87171' : '#94a3b8' }}>
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
                          <td style={{ padding: '9px 14px', color: '#f1f5f9', fontWeight: 600 }}>
                            {item.label}
                          </td>
                          <td style={{ padding: '9px 14px', textAlign: 'right', color: '#fca5a5', fontWeight: 600 }}>
                            {formatNumber(compVal)}
                          </td>
                          <td style={{ padding: '9px 14px', textAlign: 'right', color: '#6ee7b7', fontWeight: 600 }}>
                            {formatNumber(yourVal)}
                          </td>
                          <td style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 'bold', color: diff > 0 ? '#10b981' : diff < 0 ? '#f87171' : '#94a3b8' }}>
                            {diff > 0 ? `-${formatNumber(diff)}` : diff < 0 ? `+${formatNumber(Math.abs(diff))}` : '$0'}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Total Row */}
                    <tr style={{ background: 'rgba(15, 23, 42, 0.9)', borderTop: '2px solid rgba(255, 255, 255, 0.15)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 900, color: '#38bdf8' }}>
                        TỔNG CHI PHÍ ĐÍCH SỞ HỮU (TCO)
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 900, color: '#f87171', fontSize: '0.95rem' }}>
                        {formatNumber(competitorLandedCost)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 900, color: '#10b981', fontSize: '0.95rem' }}>
                        {formatNumber(yourLandedCost)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 900, color: isSaving ? '#38bdf8' : '#94a3b8', fontSize: '0.95rem' }}>
                        {isSaving ? `-${formatNumber(netSavings)}` : formatNumber(netSavings)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Value Pitch */}
              <div style={{ padding: '14px 18px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '8px', marginBottom: '20px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                <strong style={{ color: '#38bdf8' }}>✓ Cam Kết Giá Trị Gia Tăng (Value-Added SLA): </strong>
                Chúng tôi áp dụng quy trình kiểm soát chất lượng nghiêm ngặt, hỗ trợ trọn gói chứng từ C/O ưu đãi thuế, tối ưu cước vận chuyển và cam kết bù hàng 100% nếu phát sinh lỗi kỹ thuật.
              </div>

              {/* Footer Sign-off */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.78rem', color: '#94a3b8' }}>
                <div>
                  <div><strong>Đại diện Bán hàng:</strong> Bộ phận Xuất Khẩu B2B</div>
                  <div><strong>Email:</strong> sales@b2bexports.com</div>
                </div>
                <div style={{ textAlign: 'right', fontStyle: 'italic' }}>
                  Xác nhận đề xuất báo giá có giá trị thương mại
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}

