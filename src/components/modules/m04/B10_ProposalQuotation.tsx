'use client';

import React from 'react';
import { M04FormData, PricingOption } from './M04_CombinedForm';
import { Calculator, LayoutList, AlertTriangle, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

interface Props {
  data: M04FormData;
  setData: React.Dispatch<React.SetStateAction<M04FormData>>;
  handleBlur: () => void;
  isDisabled?: boolean;
}

export default function B10_ProposalQuotation({ data, setData, handleBlur, isDisabled }: Props) {
  const b10 = data.b10_quotation;
  const tco = b10.tco_calculator;

  // Helpers
  const landedCost = (Number(tco.fob_price) || 0) + 
                     (Number(tco.freight) || 0) + 
                     (Number(tco.import_tax) || 0) + 
                     (Number(tco.local_charges) || 0) +
                     (Number(tco.doc_inspection_fee) || 0);

  const activeOptionsCount = b10.pricing_options.filter(opt => opt.is_active).length;
  const isDecoyValid = activeOptionsCount >= 2;

  // Handlers
  const handleTcoChange = (field: keyof typeof tco, value: string) => {
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

  const handleExportProposal = () => {
    if (!isDecoyValid) return;
    alert('✓ Đã khởi tạo Bản Đề xuất Báo giá (Draft Proposal) với cấu trúc giá đa tầng thành công!');
  };

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);

  return (
    <section className="glass-panel" style={{ opacity: isDisabled ? 0.6 : 1, pointerEvents: isDisabled ? 'none' : 'auto', padding: '28px' }}>
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
          Bài 10: TCO & Kiến trúc Báo giá Đa Tầng (Landed Cost & Decoy Pricing)
        </h2>
      </div>
      <p className="text-secondary text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Xây dựng Tổng chi phí sở hữu (TCO) tính cả chi phí chứng từ kiểm định chìm, và thiết lập bảng giá 3 gói lựa chọn để định vị giá trị vượt trội.
      </p>

      {/* TCO Calculator */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <Calculator size={18} color="var(--accent-primary)" /> Khu vực 1: Bảng tính Chi phí đích (Buyer's Landed Cost Calculator)
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          {[
            { id: 'fob_price', label: '1. Giá FOB (USD)', placeholder: 'VD: 3500' },
            { id: 'freight', label: '2. Cước Tàu / Vận tải (USD)', placeholder: 'VD: 1200' },
            { id: 'import_tax', label: '3. Thuế NK / Thuế quan (USD)', placeholder: 'VD: 300' },
            { id: 'local_charges', label: '4. Phí Nội địa / Cảng (USD)', placeholder: 'VD: 250' },
            { id: 'doc_inspection_fee', label: '5. Phí Kiểm định & C/O (USD)', placeholder: 'VD: 180 (SGS, Phyto...)' },
          ].map(item => (
            <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {item.label}
              </label>
              <input
                type="number"
                value={tco[item.id as keyof typeof tco] ?? ''}
                onChange={(e) => handleTcoChange(item.id as keyof typeof tco, e.target.value)}
                onBlur={handleBlur}
                disabled={isDisabled}
                placeholder={item.placeholder}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.86rem'
                }}
              />
            </div>
          ))}
        </div>
        
        <div style={{ padding: '16px 20px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontWeight: '700', color: 'var(--accent-primary)', fontSize: '0.95rem' }}>Tổng chi phí đích dự toán (Buyer Landed Cost):</span>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Đã bao gồm FOB + Cước biển + Thuế quan + Phí Cảng + Chứng từ kiểm định SGS/Phyto</div>
          </div>
          <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#10b981' }}>{formatNumber(landedCost)}</span>
        </div>
      </div>

      {/* Pricing Anchoring */}
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
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {b10.pricing_options.map(opt => (
            <div key={opt.id} style={{
              padding: '18px',
              border: `1px solid ${opt.is_active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '12px',
              background: opt.is_active ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(15, 23, 42, 0.6))' : 'rgba(15, 23, 42, 0.3)',
              opacity: opt.is_active ? 1 : 0.6,
              transition: 'all 0.3s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.92rem', color: opt.is_active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {opt.name}
                </span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: opt.is_active ? 'var(--accent-primary)' : 'var(--text-muted)', cursor: isDisabled ? 'not-allowed' : 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={opt.is_active}
                    onChange={(e) => handleOptionChange(opt.id, 'is_active', e.target.checked)}
                    disabled={isDisabled}
                    style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
                  />
                  <span>Kích hoạt</span>
                </label>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Mức Giá Đề Xuất (USD)</label>
                  <input
                    type="number"
                    value={opt.price || ''}
                    onChange={(e) => handleOptionChange(opt.id, 'price', e.target.value)}
                    onBlur={handleBlur}
                    disabled={!opt.is_active || isDisabled}
                    placeholder="VD: 4200"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(0,0,0,0.25)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Giá trị & Điều khoản đi kèm (Features / SLA)</label>
                  <textarea
                    value={opt.features}
                    onChange={(e) => handleOptionChange(opt.id, 'features', e.target.value)}
                    onBlur={handleBlur}
                    disabled={!opt.is_active || isDisabled}
                    placeholder="VD: Đóng gói bao hút chân không, bảo hiểm hàng hóa trọn gói, thời gian giao hàng ưu tiên 14 ngày..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(0,0,0,0.25)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      resize: 'vertical',
                      fontSize: '0.82rem',
                      lineHeight: '1.4'
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
    </section>
  );
}

