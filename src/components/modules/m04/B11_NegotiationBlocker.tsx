import React from 'react';
import { M04FormData, ConcessionItem } from './M04_CombinedForm';
import { Scale, MessageSquare, AlertOctagon, Plus, Trash2 } from 'lucide-react';

interface Props {
  data: M04FormData;
  setData: React.Dispatch<React.SetStateAction<M04FormData>>;
  handleBlur: () => void;
  isDisabled?: boolean;
}

export default function B11_NegotiationBlocker({ data, setData, handleBlur, isDisabled }: Props) {
  const b11 = data.b11_negotiation;

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
    'Thử thách giá',
    'Cạn ngân sách',
    'Ép điều khoản',
    'Quyền lực giả'
  ];

  const giveTypes = [
    '',
    'Giảm giá %',
    'Tăng công nợ',
    'Miễn phí vận chuyển',
    'Hỗ trợ Marketing'
  ];

  const takeTypes = [
    '',
    'Tăng Volume (Số lượng)',
    'Tạm ứng cao hơn',
    'Cắt giảm bao bì/quy cách',
    'Rút ngắn Lead time'
  ];

  return (
    <section className="glass-panel" style={{ opacity: isDisabled ? 0.6 : 1, pointerEvents: isDisabled ? 'none' : 'auto' }}>
      <style>{`
        .scale-container {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 24px;
          align-items: stretch;
          margin-bottom: 16px;
        }
        .give-column {
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          padding: 16px;
        }
        .give-column:focus-within {
          border-color: rgba(239, 68, 68, 0.5);
          box-shadow: 0 4px 20px rgba(239, 68, 68, 0.1);
        }
        .take-column {
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.2);
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
          background: var(--border-color);
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
      `}</style>

      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xl font-bold">Bài 11: Bàn cân Đàm phán (Trade-off Matrix)</h2>
      </div>
      <p className="text-secondary text-sm mb-6">
        Tuyệt đối không nhượng bộ miễn phí. Hãy chuẩn bị các điều kiện đánh đổi (Take) trước khi đồng ý cho khách hàng (Give).
      </p>

      {/* Area 1: Simulated Objection */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} color="var(--accent-primary)" /> Khu vực 1: Khám bệnh từ chối
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Dán lời từ chối của khách hàng vào đây</label>
            <textarea
              value={b11.buyer_objection}
              onChange={(e) => handleFieldChange('buyer_objection', e.target.value)}
              onBlur={handleBlur}
              disabled={isDisabled}
              placeholder='VD: "Giá bên bạn cao quá, tôi có offer rẻ hơn 10% từ supplier khác..."'
              className="form-input"
              style={{ minHeight: '80px', resize: 'vertical' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Chẩn đoán bản chất</label>
            <select
              value={b11.objection_type}
              onChange={(e) => handleFieldChange('objection_type', e.target.value)}
              onBlur={handleBlur}
              disabled={isDisabled}
              className="form-input"
            >
              {objectionTypes.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Area 2: Concession Scale */}
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Scale size={18} color="var(--accent-primary)" /> Khu vực 2: Bàn cân Nhượng bộ (Give - Take)
        </h3>
        
        {isInvalidTrade && (
          <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-danger)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <AlertOctagon size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Nghiêm cấm nhượng bộ miễn phí!</strong><br/>
              Bạn đang chọn Nhượng bộ (GIVE) nhưng chưa yêu cầu Đánh đổi (TAKE). Yêu cầu nhập Điều kiện đánh đổi ở cột bên phải.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {b11.concessions.map((c, index) => (
            <div key={c.id} style={{ position: 'relative' }}>
              <div className="scale-container">
                {/* Cột GIVE */}
                <div className="give-column">
                  <div style={{ fontWeight: 'bold', color: 'var(--accent-danger)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ▼ GIVE (Khách đòi)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <select
                      value={c.give_type}
                      onChange={(e) => handleConcessionChange(c.id, 'give_type', e.target.value)}
                      onBlur={handleBlur}
                      disabled={isDisabled}
                      className="form-input"
                    >
                      {giveTypes.map(type => <option key={type} value={type}>{type || '-- Chọn loại nhượng bộ --'}</option>)}
                    </select>
                    <textarea
                      value={c.give_note}
                      onChange={(e) => handleConcessionChange(c.id, 'give_note', e.target.value)}
                      onBlur={handleBlur}
                      disabled={isDisabled}
                      placeholder="Mô tả chi tiết nhượng bộ..."
                      className="form-input"
                      style={{ minHeight: '60px', resize: 'vertical' }}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="scale-divider">
                  <div className="line-vertical"></div>
                  <Scale size={24} color={isInvalidTrade ? 'var(--accent-danger)' : 'var(--text-secondary)'} />
                  <div className="line-vertical"></div>
                </div>

                {/* Cột TAKE */}
                <div className="take-column">
                  <div style={{ fontWeight: 'bold', color: '#10b981', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ▲ TAKE (Đòi lại) 
                    <span style={{ fontSize: '0.75rem', fontWeight: 'normal', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', cursor: 'help' }} title="Tham khảo Nỗi đau/Nhu cầu ở Bài 05">💡 Hint</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <select
                      value={c.take_type}
                      onChange={(e) => handleConcessionChange(c.id, 'take_type', e.target.value)}
                      onBlur={handleBlur}
                      disabled={isDisabled}
                      className="form-input"
                    >
                      {takeTypes.map(type => <option key={type} value={type}>{type || '-- Chọn loại đánh đổi --'}</option>)}
                    </select>
                    <textarea
                      value={c.take_note}
                      onChange={(e) => handleConcessionChange(c.id, 'take_note', e.target.value)}
                      onBlur={handleBlur}
                      disabled={isDisabled}
                      placeholder="Mô tả chi tiết đánh đổi..."
                      className="form-input"
                      style={{ minHeight: '60px', resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>
              
              {b11.concessions.length > 1 && (
                <button
                  onClick={() => removeConcession(c.id)}
                  disabled={isDisabled}
                  style={{
                    position: 'absolute', top: '16px', right: '-40px',
                    background: 'none', border: 'none', color: 'var(--text-secondary)',
                    cursor: isDisabled ? 'not-allowed' : 'pointer'
                  }}
                  title="Xóa bàn cân này"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: '16px' }}>
          <button
            onClick={addConcession}
            disabled={isDisabled}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'transparent', color: 'var(--accent-primary)',
              border: '1px dashed var(--accent-primary)', borderRadius: '6px',
              padding: '8px 16px', fontSize: '0.85rem', cursor: isDisabled ? 'not-allowed' : 'pointer'
            }}
          >
            <Plus size={16} /> Thêm vòng đàm phán
          </button>
        </div>
      </div>
    </section>
  );
}
