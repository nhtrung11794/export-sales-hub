'use client';

import React from 'react';
import { M04FormData } from './M04_CombinedForm';
import { CheckCircle2, AlertCircle, XCircle, Sparkles, HelpCircle } from 'lucide-react';

interface Props {
  data: M04FormData;
  setData: React.Dispatch<React.SetStateAction<M04FormData>>;
  handleBlur: () => void;
  isDisabled?: boolean;
  totalScore: number;
}

export default function B09_RequirementClarification({ data, setData, handleBlur, isDisabled, totalScore }: Props) {
  const b09 = data.b09_clarification;

  const setStatus = (field: keyof M04FormData['b09_clarification'], isClear: boolean) => {
    if (isDisabled) return;
    setData(prev => ({
      ...prev,
      b09_clarification: {
        ...prev.b09_clarification,
        [field]: {
          ...prev.b09_clarification[field],
          is_clear: isClear
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

  const sections: {
    key: keyof M04FormData['b09_clarification'];
    label: string;
    desc: string;
    placeholder: string;
  }[] = [
    {
      key: 'p_product',
      label: 'P - Product (Sản phẩm & Thông số)',
      desc: 'Tiêu chuẩn kỹ thuật, độ ẩm, tạp chất, quy cách đóng gói và nhãn mác.',
      placeholder: 'VD: Yêu cầu độ ẩm < 5%, tỷ lệ vỡ vụn < 3%, dung trọng 550g/l, quy cách đóng bao chân không 25kg trong thùng carton 5 lớp...'
    },
    {
      key: 'b_business',
      label: 'B - Business (Sản lượng & Giá mục tiêu)',
      desc: 'Số lượng đặt hàng tối thiểu (MOQ), giá mục tiêu (Target Price) và chu kỳ đặt.',
      placeholder: 'VD: Số lượng 2x40ft HC (khoảng 32 tấn), chu kỳ đặt hàng mỗi tháng 1 cont, giá mục tiêu khoảng $4,200 - $4,500/MT FOB...'
    },
    {
      key: 't_trade',
      label: 'T - Trade (Điều kiện Giao nhận & Incoterms)',
      desc: 'Điều kiện Incoterms (FOB/CIF/DDP), Cảng đi - Cảng đích, Lead time sản xuất.',
      placeholder: 'VD: Điều kiện FOB Hải Phòng / CIF Hamburg, thời gian xuất xưởng 21 ngày sau khi nhận cọc, giao hàng tháng tới...'
    },
    {
      key: 'p_payment',
      label: 'P - Payment (Phương thức Thanh toán)',
      desc: 'Phương thức thanh toán đề xuất (T/T, L/C at sight, D/P), tỷ lệ đặt cọc.',
      placeholder: 'VD: T/T 30% cọc trước sản xuất, 70% sau khi gửi bản sao B/L, hoặc mở thư tín dụng L/C at sight không hủy ngang...'
    },
    {
      key: 'c_compliance',
      label: 'C - Compliance (Chứng chỉ & Kiểm dịch)',
      desc: 'Chứng nhận bắt buộc, kiểm dịch thực vật, hun trùng, tiêu chuẩn trách nhiệm xã hội.',
      placeholder: 'VD: Yêu cầu hun trùng (Fumigation certificate), chứng thư kiểm dịch thực vật (Phyto), chứng nhận BRC, Rainforest Alliance...'
    }
  ];

  return (
    <section className="glass-panel" style={{ opacity: isDisabled ? 0.6 : 1, pointerEvents: isDisabled ? 'none' : 'auto', padding: '28px' }}>
      <style>{`
        .pbtpc-row {
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          margin-bottom: 14px;
          background: rgba(15, 23, 42, 0.45);
          transition: all 0.2s ease;
        }
        .pbtpc-row:focus-within {
          border-color: var(--accent-primary);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
          background: rgba(15, 23, 42, 0.7);
        }
        .pbtpc-row.is-clear {
          border-color: rgba(16, 185, 129, 0.35);
          background: rgba(16, 185, 129, 0.03);
        }
        .toggle-btn-group {
          display: flex;
          background: rgba(0, 0, 0, 0.35);
          padding: 3px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          gap: 2px;
        }
        .toggle-btn {
          padding: 5px 12px;
          border-radius: 6px;
          border: none;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--text-muted);
          background: transparent;
        }
        .toggle-btn.active-clear {
          background: #10b981;
          color: #0f172a;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }
        .toggle-btn.active-unclear {
          background: #f59e0b;
          color: #0f172a;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
        }
        .matrix-box {
          padding: 16px 20px;
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

      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
          Bài 09: Trạm làm rõ Yêu cầu & Quyết định (Specs Clarification Station)
        </h2>
      </div>
      <p className="text-secondary text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Xóa bỏ thói quen báo giá mù. Dùng khung P-B-T-P-C để xác thực mức độ đầy đủ dữ kiện trước khi lập bảng tính TCO.
      </p>

      {/* Context Header */}
      <div style={{ padding: '12px 18px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '10px', marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.1rem' }}>📌</span>
          <span style={{ fontWeight: '600', fontSize: '0.88rem' }}>Hồ sơ Cơ hội (Kế thừa từ Bài 07)</span>
        </div>
        <div style={{ fontSize: '0.85rem' }}>
          Điểm F-N-A-C-M: <strong style={{ color: totalScore >= 75 ? '#10b981' : totalScore >= 50 ? '#f59e0b' : 'var(--accent-danger)' }}>{totalScore}/100</strong>
        </div>
      </div>

      <div className="pbtpc-container">
        {sections.map((sec) => {
          const val = b09[sec.key];
          return (
            <div key={sec.key} className={`pbtpc-row ${val.is_clear ? 'is-clear' : ''}`}>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: val.is_clear ? '#10b981' : 'var(--text-primary)', marginBottom: '2px' }}>
                      {sec.label}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.35' }}>
                      {sec.desc}
                    </div>
                  </div>
                  
                  {/* TOGGLE SEGMENT (2 NÚT) */}
                  <div className="toggle-btn-group" style={{ flexShrink: 0, marginLeft: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => setStatus(sec.key, true)}
                      className={`toggle-btn ${val.is_clear ? 'active-clear' : ''}`}
                      disabled={isDisabled}
                    >
                      <CheckCircle2 size={13} /> Đã chốt
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(sec.key, false)}
                      className={`toggle-btn ${!val.is_clear ? 'active-unclear' : ''}`}
                      disabled={isDisabled}
                    >
                      <HelpCircle size={13} /> Cần hỏi thêm
                    </button>
                  </div>
                </div>
                
                <textarea
                  value={val.note}
                  onChange={(e) => handleNoteChange(sec.key, e.target.value)}
                  onBlur={handleBlur}
                  placeholder={sec.placeholder}
                  disabled={isDisabled}
                  style={{
                    width: '100%',
                    minHeight: '64px',
                    background: 'rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem',
                    lineHeight: '1.45',
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
        <div style={{ paddingTop: '2px' }}>
          {decisionState === 'NO-GO' && <XCircle size={26} />}
          {decisionState === 'CONDITIONAL GO' && <AlertCircle size={26} />}
          {decisionState === 'GO' && <CheckCircle2 size={26} />}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '6px' }}>
            Trạng thái Quyết định Báo Giá: {decisionState}
          </h3>
          
          {decisionState === 'NO-GO' && (
            <div>
              <p style={{ fontSize: '0.85rem', marginBottom: '8px', lineHeight: '1.5' }}>
                <strong>Báo giá mù!</strong> Bạn đang thiếu dữ kiện trọng yếu về Sản phẩm [P] hoặc Sản lượng/Thương mại [B]. Không được phép gửi báo giá chính thức lúc này để tránh rủi ro hớ giá.
              </p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '6px', border: '1px dashed rgba(255,255,255,0.2)' }}>
                <Sparkles size={15} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.8rem' }}>Hãy soạn Email hỏi rõ Quy cách kỹ thuật và Sản lượng mục tiêu trước khi chuyển sang bước báo giá.</span>
              </div>
            </div>
          )}

          {decisionState === 'CONDITIONAL GO' && (
            <p style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
              <strong>Báo giá giả định.</strong> Sản phẩm và số lượng đã rõ, nhưng vẫn thiếu dữ kiện Giao hàng [T], Thanh toán [P], hoặc Chứng từ [C]. Bạn <strong>được phép báo giá</strong>, nhưng yêu cầu ghi rõ các <em>"Điều kiện loại trừ" (Subject to...)</em> trong bảng tính TCO tại Buổi 10 để bảo vệ lợi nhuận.
            </p>
          )}

          {decisionState === 'GO' && (
            <p style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
              <strong>Đủ điều kiện báo giá hoàn chỉnh!</strong> Bạn đã làm rõ toàn bộ 5 trục thông số P-B-T-P-C. Tiến hành chuyển sang Buổi 10 để cấu trúc bảng giá 3 lựa chọn (Decoy Pricing).
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
