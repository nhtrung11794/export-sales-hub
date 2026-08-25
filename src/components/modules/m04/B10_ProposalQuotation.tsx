import React from 'react';
import { M04FormData, PricingOption } from './M04_CombinedForm';
import { Calculator, LayoutList, AlertTriangle } from 'lucide-react';

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
  const landedCost = (Number(tco.fob_price) || 0) + (Number(tco.freight) || 0) + (Number(tco.import_tax) || 0) + (Number(tco.local_charges) || 0);
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
          [field]: value
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

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);

  return (
    <section className="glass-panel" style={{ opacity: isDisabled ? 0.6 : 1, pointerEvents: isDisabled ? 'none' : 'auto' }}>
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xl font-bold">Bài 10: TCO & Kiến trúc Báo giá</h2>
      </div>
      <p className="text-secondary text-sm mb-6">
        Xây dựng Tổng chi phí sở hữu (TCO) để chứng minh lợi thế, và thiết kế báo giá 3 lựa chọn để làm chủ hiệu ứng chim mồi.
      </p>

      {/* TCO Calculator */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator size={18} color="var(--accent-primary)" /> Khu vực 1: Bảng tính Chi phí đích (Landed Cost)
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          {['fob_price', 'freight', 'import_tax', 'local_charges'].map(field => (
            <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {field === 'fob_price' ? 'Giá FOB (USD)' : field === 'freight' ? 'Cước Tàu (USD)' : field === 'import_tax' ? 'Thuế NK (USD)' : 'Phí Nội địa (USD)'}
              </label>
              <input
                type="number"
                value={tco[field as keyof typeof tco] || ''}
                onChange={(e) => handleTcoChange(field as keyof typeof tco, e.target.value)}
                onBlur={handleBlur}
                disabled={isDisabled}
                placeholder="0"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          ))}
        </div>
        
        <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>Tổng chi phí đích (Buyer's Landed Cost):</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{formatNumber(landedCost)}</span>
        </div>
      </div>

      {/* Pricing Anchoring */}
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LayoutList size={18} color="var(--accent-primary)" /> Khu vực 2: Khung Báo giá 3 Lựa chọn (Pricing Anchoring)
        </h3>
        {!isDecoyValid && (
          <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} /> Bắt buộc phải kích hoạt ít nhất 2 lựa chọn để tạo hiệu ứng chim mồi.
          </div>
        )}
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {b10.pricing_options.map(opt => (
            <div key={opt.id} style={{
              padding: '16px',
              border: `1px solid ${opt.is_active ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              borderRadius: '12px',
              background: opt.is_active ? 'rgba(59, 130, 246, 0.02)' : 'rgba(255,255,255,0.02)',
              opacity: opt.is_active ? 1 : 0.6,
              transition: 'all 0.3s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{opt.name}</span>
                <input
                  type="checkbox"
                  checked={opt.is_active}
                  onChange={(e) => handleOptionChange(opt.id, 'is_active', e.target.checked)}
                  disabled={isDisabled}
                  style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Mức Giá (USD)</label>
                  <input
                    type="number"
                    value={opt.price || ''}
                    onChange={(e) => handleOptionChange(opt.id, 'price', e.target.value)}
                    onBlur={handleBlur}
                    disabled={!opt.is_active || isDisabled}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Giá trị đi kèm (Features)</label>
                  <textarea
                    value={opt.features}
                    onChange={(e) => handleOptionChange(opt.id, 'features', e.target.value)}
                    onBlur={handleBlur}
                    disabled={!opt.is_active || isDisabled}
                    placeholder="Liệt kê lợi ích..."
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      padding: '8px 12px',
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      resize: 'vertical',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            disabled={!isDecoyValid || isDisabled}
            style={{
              padding: '10px 24px',
              background: isDecoyValid ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              color: isDecoyValid ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: (!isDecoyValid || isDisabled) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            📄 Xuất Draft Proposal (PDF)
          </button>
        </div>
      </div>
    </section>
  );
}
