import React from 'react';
import { M04FormData } from './M04_CombinedForm';
import { CheckCircle2, AlertCircle, XCircle, ChevronDown, Sparkles } from 'lucide-react';

interface Props {
  data: M04FormData;
  setData: React.Dispatch<React.SetStateAction<M04FormData>>;
  handleBlur: () => void;
  isDisabled?: boolean;
  totalScore: number;
}

export default function B09_RequirementClarification({ data, setData, handleBlur, isDisabled, totalScore }: Props) {
  const b09 = data.b09_clarification;

  const handleToggle = (field: keyof M04FormData['b09_clarification']) => {
    if (isDisabled) return;
    setData(prev => ({
      ...prev,
      b09_clarification: {
        ...prev.b09_clarification,
        [field]: {
          ...prev.b09_clarification[field],
          is_clear: !prev.b09_clarification[field].is_clear
        }
      }
    }));
  };

  const handleNoteChange = (field: keyof M04FormData['b09_clarification'], value: string) => {
    if (isDisabled) return;
    setData(prev => ({
      ...prev,
      b09_clarification: {
        ...prev.b09_clarification,
        [field]: {
          ...prev.b09_clarification[field],
          note: value
        }
      }
    }));
  };

  // Logic Gate
  const isP = b09.p_product.is_clear;
  const isB = b09.b_business.is_clear;
  const isT = b09.t_trade.is_clear;
  const isPay = b09.p_payment.is_clear;
  const isC = b09.c_compliance.is_clear;

  let decisionState: 'NO-GO' | 'CONDITIONAL GO' | 'GO' = 'NO-GO';
  if (!isP || !isB) {
    decisionState = 'NO-GO';
  } else if (!isT || !isPay || !isC) {
    decisionState = 'CONDITIONAL GO';
  } else {
    decisionState = 'GO';
  }

  const sections: { key: keyof M04FormData['b09_clarification']; label: string; desc: string }[] = [
    { key: 'p_product', label: 'P - Product (Sản phẩm)', desc: 'Tiêu chuẩn kỹ thuật, quy cách đóng gói, nhãn mác.' },
    { key: 'b_business', label: 'B - Business (Thương mại)', desc: 'Số lượng đặt (MOQ), Giá mục tiêu (Target Price).' },
    { key: 't_trade', label: 'T - Trade (Giao nhận)', desc: 'Điều kiện Incoterms, Cảng đích, Lead time.' },
    { key: 'p_payment', label: 'P - Payment (Thanh toán)', desc: 'Phương thức thanh toán đề xuất (LC, TT, DP).' },
    { key: 'c_compliance', label: 'C - Compliance (Tuân thủ)', desc: 'Chứng nhận bắt buộc, kiểm dịch, hải quan.' }
  ];

  return (
    <section className="glass-panel" style={{ opacity: isDisabled ? 0.6 : 1, pointerEvents: isDisabled ? 'none' : 'auto' }}>
      <style>{`
        .pbtpc-row {
          border: 1px solid var(--border-color);
          border-radius: 8px;
          margin-bottom: 12px;
          background: rgba(255, 255, 255, 0.02);
          transition: all 0.2s ease;
        }
        .pbtpc-row:focus-within {
          border-color: var(--accent-primary);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
          transform: translateY(-2px);
          background: rgba(59, 130, 246, 0.05);
        }
        .pbtpc-row.is-clear {
          border-color: rgba(16, 185, 129, 0.4);
          background: rgba(16, 185, 129, 0.03);
        }
        .matrix-box {
          padding: 16px;
          border-radius: 12px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-top: 24px;
          transition: all 0.3s ease;
        }
        .matrix-nogo {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: var(--accent-danger);
        }
        .matrix-cond {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #f59e0b;
        }
        .matrix-go {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }
      `}</style>

      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xl font-bold">Bài 09: Trạm làm rõ Yêu cầu & Quyết định</h2>
      </div>
      <p className="text-secondary text-sm mb-6">
        Xóa bỏ thói quen báo giá mù. Dùng khung P-B-T-P-C để kiểm tra xem đã đủ dữ kiện báo giá hay chưa.
      </p>

      {/* Context Header */}
      <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>📌</span>
          <span style={{ fontWeight: '600' }}>Hồ sơ Cơ hội (Từ Bài 07)</span>
        </div>
        <div style={{ fontSize: '0.9rem' }}>
          Điểm F-N-A-C-M: <strong style={{ color: totalScore >= 75 ? '#10b981' : totalScore >= 50 ? '#f59e0b' : 'var(--accent-danger)' }}>{totalScore}/100</strong>
        </div>
      </div>

      <div className="pbtpc-container">
        {sections.map((sec) => {
          const val = b09[sec.key];
          return (
            <div key={sec.key} className={`pbtpc-row ${val.is_clear ? 'is-clear' : ''}`}>
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem', color: val.is_clear ? '#10b981' : 'inherit' }}>
                      {sec.label}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {sec.desc}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleToggle(sec.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '6px',
                      background: val.is_clear ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: val.is_clear ? '#10b981' : 'var(--text-secondary)',
                      border: `1px solid ${val.is_clear ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'}`,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                  >
                    {val.is_clear ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {val.is_clear ? '✅ Đã rõ' : '❓ Chưa rõ'}
                  </button>
                </div>
                
                <textarea
                  value={val.note}
                  onChange={(e) => handleNoteChange(sec.key, e.target.value)}
                  onBlur={handleBlur}
                  placeholder="Ghi chú chi tiết yêu cầu của khách (Nếu chưa rõ, ghi chú cần hỏi lại điều gì)..."
                  disabled={isDisabled}
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Decision Matrix */}
      <div className={`matrix-box ${decisionState === 'NO-GO' ? 'matrix-nogo' : decisionState === 'CONDITIONAL GO' ? 'matrix-cond' : 'matrix-go'}`}>
        <div style={{ paddingTop: '4px' }}>
          {decisionState === 'NO-GO' && <XCircle size={28} />}
          {decisionState === 'CONDITIONAL GO' && <AlertCircle size={28} />}
          {decisionState === 'GO' && <CheckCircle2 size={28} />}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '8px' }}>
            Trạng thái Quyết định: {decisionState}
          </h3>
          
          {decisionState === 'NO-GO' && (
            <div>
              <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
                <strong>Báo giá mù!</strong> Bạn đang thiếu dữ kiện trọng yếu về Sản phẩm [P] hoặc Sản lượng/Thương mại [B]. Không được phép báo giá lúc này để tránh hớ.
              </p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '6px', border: '1px dashed rgba(255,255,255,0.2)' }}>
                <Sparkles size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem' }}>Hãy dùng NotebookLM soạn Email hỏi rõ Sản phẩm/Quy cách và Số lượng mục tiêu trước khi chuyển sang bước báo giá.</span>
              </div>
            </div>
          )}

          {decisionState === 'CONDITIONAL GO' && (
            <p style={{ fontSize: '0.9rem' }}>
              <strong>Báo giá giả định.</strong> Sản phẩm và số lượng đã rõ, nhưng vẫn thiếu dữ kiện Giao hàng [T], Thanh toán [P], hoặc Chứng từ [C]. Bạn <strong>được phép báo giá</strong>, nhưng yêu cầu ghi rõ các <em>"Điều kiện loại trừ" (Subject to...)</em> trong bảng tính TCO tại Buổi 10 để bảo vệ lợi nhuận.
            </p>
          )}

          {decisionState === 'GO' && (
            <p style={{ fontSize: '0.9rem' }}>
              <strong>Hồ sơ hoàn hảo.</strong> Toàn bộ 5 lớp thông tin P-B-T-P-C đều đã được làm rõ. Đầy đủ cơ sở để lên Phương án Báo giá (Proposal) tại Bài 10 một cách tự tin.
            </p>
          )}
        </div>
      </div>

    </section>
  );
}
