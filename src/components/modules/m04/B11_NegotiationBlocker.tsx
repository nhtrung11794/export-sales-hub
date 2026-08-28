'use client';

import React, { useState } from 'react';
import { M04FormData, ConcessionItem } from './M04_CombinedForm';
import { Scale, MessageSquare, AlertOctagon, Plus, Trash2, Sparkles } from 'lucide-react';
import { useModuleStore } from '@/store/useModuleStore';

interface Props {
  data: M04FormData;
  setData: React.Dispatch<React.SetStateAction<M04FormData>>;
  handleBlur: () => void;
  isDisabled?: boolean;
}

export default function B11_NegotiationBlocker({ data, setData, handleBlur, isDisabled }: Props) {
  const { submissions } = useModuleStore();
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  const b11 = data.b11_negotiation;

  // Lấy dữ liệu Nỗi đau B05 từ Module 02
  const m02Data = (submissions.M02?.form_data as any) || {};
  const painObj = m02Data.discovery_matrix?.pain || {};
  const b05PainText = Object.values(painObj).filter(Boolean).join('; ') || 'Khách hàng lo ngại rủi ro giao hàng trễ, không đồng đều chất lượng và đứt gãy tồn kho.';

  const handleFieldChange = (field: keyof typeof b11, value: any) => {
    if (isDisabled) return;
    setData(prev => ({
      ...prev,
      b11_negotiation: {
        ...prev.b11_negotiation,
        [field]: value
      }
    }));
  };

  const handleConcessionChange = (id: string, field: keyof ConcessionItem, value: any) => {
    if (isDisabled) return;
    const updated = b11.concessions.map(c => c.id === id ? { ...c, [field]: value } : c);
    handleFieldChange('concessions', updated);
  };

  const addConcession = () => {
    if (isDisabled) return;
    const newConcession: ConcessionItem = {
      id: `con_${Date.now()}`,
      give_type: '',
      give_note: '',
      take_type: '',
      take_note: ''
    };
    handleFieldChange('concessions', [...b11.concessions, newConcession]);
  };

  const removeConcession = (id: string) => {
    if (isDisabled) return;
    if (b11.concessions.length <= 1) return;
    const updated = b11.concessions.filter(c => c.id !== id);
    handleFieldChange('concessions', updated);
  };

  // Trade-off Validation Logic
  let isInvalidTrade = false;
  b11.concessions.forEach(c => {
    if ((c.give_type.trim() !== '' || c.give_note.trim() !== '') && (c.take_type.trim() === '' && c.take_note.trim() === '')) {
      isInvalidTrade = true;
    }
  });

  const objectionTypes = [
    'Thử thách giá (Price Resistance)',
    'Cạn ngân sách (Budget Constraint)',
    'Ép điều khoản công nợ (Payment Terms Pressure)',
    'Quyền lực giả (No Authority Blocker)',
    'Khác (Tự định nghĩa)'
  ];

  const giveTypes = [
    '',
    'Giảm giá 2-5% theo mốc số lượng',
    'Tăng hạn mức công nợ 15-30 ngày',
    'Hỗ trợ cước tàu / Bảo hiểm vận tải',
    'Tặng thêm sản phẩm mẫu & Marketing Kit',
    'Rút ngắn thời gian sản xuất (Priority Lead time)',
    'Khác (Tự định nghĩa)'
  ];

  const takeTypes = [
    '',
    'Tăng Volume đặt hàng (Thêm ít nhất 1 Container)',
    'Tăng tỷ lệ đặt cọc (T/T Advance 40-50%)',
    'Chốt hợp đồng khung dài hạn 6-12 tháng',
    'Cắt giảm chi phí bao bì / Tiêu chuẩn đóng gói',
    'Linh hoạt ngày bốc hàng (± 5 ngày ETA)',
    'Khác (Tự định nghĩa)'
  ];

  return (
    <section className="glass-panel" style={{ opacity: isDisabled ? 0.6 : 1, pointerEvents: isDisabled ? 'none' : 'auto', padding: '28px' }}>
      <style>{`
        .scale-container {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 20px;
          align-items: stretch;
          margin-bottom: 16px;
        }
        .give-column {
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 12px;
          padding: 16px;
        }
        .give-column:focus-within {
          border-color: rgba(239, 68, 68, 0.5);
          box-shadow: 0 4px 20px rgba(239, 68, 68, 0.1);
        }
        .take-column {
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 12px;
          padding: 16px;
        }
        .take-column:focus-within {
          border-color: rgba(16, 185, 129, 0.5);
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.1);
        }
        .scale-divider {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }
        .line-vertical {
          width: 1px;
          flex: 1;
          background: rgba(255,255,255,0.08);
          margin: 8px 0;
        }
        .form-input {
          width: 100%;
          padding: 8px 12px;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 0.9rem;
        }
        .hint-popover {
          position: absolute;
          top: -10px;
          right: 0;
          transform: translateY(-100%);
          width: 320px;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid #10b981;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          padding: 12px 14px;
          border-radius: 8px;
          z-index: 100;
          font-size: 0.8rem;
          line-height: 1.45;
          color: var(--text-primary);
          backdrop-filter: blur(8px);
        }
      `}</style>

      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
          Bài 11: Bàn cân Đàm phán & Trade-off Matrix (Give – Take Rule)
        </h2>
      </div>
      <p className="text-secondary text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Kỷ luật B2B: Tuyệt đối không nhượng bộ miễn phí. Mỗi khi cho khách một điều kiện (Give), bắt buộc phải đòi lại một giá trị tương ứng (Take).
      </p>

      {/* Area 1: Simulated Objection */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <MessageSquare size={18} color="var(--accent-primary)" /> Khu vực 1: Khám bệnh & Chẩn đoán Lời từ chối (Objection Triage)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Dán lời từ chối của khách hàng vào đây:</label>
            <textarea
              value={b11.buyer_objection}
              onChange={(e) => handleFieldChange('buyer_objection', e.target.value)}
              onBlur={handleBlur}
              disabled={isDisabled}
              placeholder='VD: "Giá bên bạn cao hơn 8% so với báo giá của nhà cung cấp Ấn Độ. Nếu không giảm được về mức $4,100 thì chúng tôi không thể ký hợp đồng đợt này..."'
              className="form-input"
              rows={3}
              style={{ minHeight: '80px', resize: 'vertical', fontSize: '0.85rem' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Chẩn đoán Bản chất Kháng cự:</label>
            <select
              value={b11.objection_type}
              onChange={(e) => handleFieldChange('objection_type', e.target.value)}
              onBlur={handleBlur}
              disabled={isDisabled}
              className="form-input"
              style={{ height: '42px', fontSize: '0.85rem', fontWeight: 600 }}
            >
              {objectionTypes.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
              💡 <em>Chẩn đoán đúng động cơ giúp bạn chọn đòn bẩy bù trừ mà không cần cắt máu giảm giá.</em>
            </p>
          </div>
        </div>
      </div>

      {/* Area 2: Concession Scale */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <Scale size={18} color="var(--accent-primary)" /> Khu vực 2: Bàn cân Nhượng bộ (Give – Take Concession Balance)
          </h3>

          <button
            type="button"
            onClick={addConcession}
            disabled={isDisabled}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
          >
            <Plus size={14} /> Thêm Cặp Đánh Đổi
          </button>
        </div>
        
        {isInvalidTrade && (
          <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid var(--accent-danger)', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <AlertOctagon size={18} color="var(--accent-danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>⚠️ NGHIÊM CẤM NHƯỢNG BỘ MIỄN PHÍ:</strong><br/>
              Bạn đang chọn Nhượng bộ (GIVE) nhưng chưa yêu cầu Đánh đổi (TAKE). Hành động này tạo tiền lệ xấu khiến Buyer tiếp tục ép giá. Yêu cầu nhập Điều kiện đánh đổi ở cột bên phải!
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {b11.concessions.map((c, index) => (
            <div key={c.id} style={{ position: 'relative' }}>
              <div className="scale-container">
                {/* Cột GIVE */}
                <div className="give-column">
                  <div style={{ fontWeight: 'bold', color: 'var(--accent-danger)', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>▼ GIVE (Khách đòi nhượng bộ)</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cặp #{index + 1}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <select
                      value={c.give_type}
                      onChange={(e) => handleConcessionChange(c.id, 'give_type', e.target.value)}
                      onBlur={handleBlur}
                      disabled={isDisabled}
                      className="form-input"
                      style={{ fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      {giveTypes.map(type => <option key={type} value={type}>{type || '-- Chọn loại nhượng bộ --'}</option>)}
                    </select>
                    <textarea
                      value={c.give_note}
                      onChange={(e) => handleConcessionChange(c.id, 'give_note', e.target.value)}
                      onBlur={handleBlur}
                      disabled={isDisabled}
                      placeholder="Mô tả chi tiết nhượng bộ (VD: Đồng ý giảm 2% trên tổng giá trị lô hàng)..."
                      className="form-input"
                      rows={3}
                      style={{ minHeight: '64px', resize: 'vertical', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="scale-divider">
                  <div className="line-vertical"></div>
                  <Scale size={24} color={isInvalidTrade ? 'var(--accent-danger)' : '#10b981'} />
                  <div className="line-vertical"></div>
                </div>

                {/* Cột TAKE với Tooltip Nỗi đau B05 */}
                <div className="take-column" style={{ position: 'relative' }}>
                  <div style={{ fontWeight: 'bold', color: '#10b981', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>▲ TAKE (Điều kiện đòi lại)</span>
                    
                    {/* HINT BADGE & HOVER POPOVER */}
                    <div 
                      style={{ position: 'relative' }}
                      onMouseEnter={() => setActiveTooltipId(c.id)}
                      onMouseLeave={() => setActiveTooltipId(null)}
                    >
                      <span style={{
                        fontSize: '0.75rem',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        color: '#10b981',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        cursor: 'help',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 700
                      }}>
                        <Sparkles size={12} /> Gợi ý TAKE (Từ B05)
                      </span>

                      {activeTooltipId === c.id && (
                        <div className="hint-popover">
                          <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            📌 Nỗi Đau Buyer (Đã xác định ở Bài 05):
                          </div>
                          <div style={{ color: '#e2e8f0', fontSize: '0.78rem', marginBottom: '6px', fontStyle: 'italic' }}>
                            "{b05PainText}"
                          </div>
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px', color: '#93c5fd', fontSize: '0.74rem' }}>
                            👉 <strong>Chiến lược:</strong> Đòi lại điều kiện giải quyết đúng nỗi đau này (VD: Nếu họ sợ giao trễ $\rightarrow$ Đòi quyền chốt lịch tàu trước 15 ngày).
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <select
                      value={c.take_type}
                      onChange={(e) => handleConcessionChange(c.id, 'take_type', e.target.value)}
                      onBlur={handleBlur}
                      disabled={isDisabled}
                      className="form-input"
                      style={{ fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      {takeTypes.map(type => <option key={type} value={type}>{type || '-- Chọn loại điều kiện đánh đổi --'}</option>)}
                    </select>
                    <textarea
                      value={c.take_note}
                      onChange={(e) => handleConcessionChange(c.id, 'take_note', e.target.value)}
                      onBlur={handleBlur}
                      disabled={isDisabled}
                      placeholder="Mô tả điều kiện đòi lại (VD: Khách phải cam kết tăng sản lượng thêm 1 container 40ft cho đơn tiếp theo trong 45 ngày)..."
                      className="form-input"
                      rows={3}
                      style={{ minHeight: '64px', resize: 'vertical', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              </div>

              {b11.concessions.length > 1 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-6px', marginBottom: '12px' }}>
                  <button
                    type="button"
                    onClick={() => removeConcession(c.id)}
                    disabled={isDisabled}
                    style={{ background: 'transparent', border: 0, color: 'var(--accent-danger)', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={13} /> Xóa cặp nhượng bộ này
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
