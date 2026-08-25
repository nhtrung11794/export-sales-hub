'use client';

import React from 'react';
import { Columns3, AlertOctagon, CheckCircle2, Calendar, MessageSquare, Send, XCircle } from 'lucide-react';
import { M03FormData } from './M03_CombinedForm';

interface Props {
  data: M03FormData;
  setData: React.Dispatch<React.SetStateAction<M03FormData>>;
  handleBlur: () => void;
  isDisabled?: boolean;
}

const PIPELINE_STAGES = [
  { id: 'prospecting', name: '1. Prospecting', desc: 'Mở đầu & Thăm dò', color: '#3b82f6' },
  { id: 'clarification', name: '2. Clarification', desc: 'Làm rõ Yêu cầu', color: '#8b5cf6' },
  { id: 'quotation', name: '3. Quotation', desc: 'Báo giá & Đàm phán', color: '#f59e0b' },
  { id: 'hold_nurture', name: '4. Hold / Nurture', desc: 'Tạm ngưng / Nuôi dưỡng', color: '#64748b' },
];

export default function B08_PipelineManagement({ data, setData, handleBlur, isDisabled }: Props) {
  const b08 = data.b08_pipeline || {
    current_stage: 'quotation',
    crisis_motive: 'Recover',
    next_touchpoint_date: '',
    next_touchpoint_type: 'Market Update',
    follow_up_message: ''
  };

  const isInvalidMotive = b08.crisis_motive === 'Advance';

  const handleFieldChange = (field: string, value: string) => {
    if (isDisabled) return;
    setData(prev => ({
      ...prev,
      b08_pipeline: {
        ...prev.b08_pipeline,
        [field]: value
      }
    }));
  };

  return (
    <section className="glass-panel" style={{ padding: '32px' }}>
      <style>{`
        .stage-card {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 16px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .stage-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255,255,255,0.15);
        }
        .stage-card.selected {
          background: rgba(15, 23, 42, 0.85);
          border-color: var(--accent-primary);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
        }
      `}</style>

      {/* HEADER BÀI HỌC */}
      <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '8px' }}>
        Bài 08: Quản trị Pipeline & Kỷ luật Follow-up (Pipeline Management)
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '28px' }}>
        Quản trị nhịp độ của Deal trên phễu bán hàng (Mini-CRM) và giải quyết tình huống khách hàng im lặng sau báo giá.
      </p>

      {/* KHU VỰC 1: PIPELINE STAGE MAP */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Columns3 size={18} color="var(--accent-primary)" /> 1. Giai đoạn Phễu Hiện tại của Deal (Pipeline Stage Map)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {PIPELINE_STAGES.map(stage => {
            const isSelected = b08.current_stage === stage.id;
            return (
              <div
                key={stage.id}
                className={`stage-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleFieldChange('current_stage', stage.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 'bold', color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)', fontSize: '0.9rem' }}>
                    {stage.name}
                  </span>
                  {isSelected && <CheckCircle2 size={16} color="var(--accent-primary)" />}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {stage.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KHU VỰC 2: CRISIS INJECTOR */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)',
        padding: '20px', borderRadius: '12px', marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <AlertOctagon size={20} color="#f59e0b" />
          <h4 style={{ color: '#f59e0b', margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>
            ⚡ TÌNH HUỐNG THỬ THÁCH (CRISIS SIMULATION)
          </h4>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: '1.5', marginBottom: '16px' }}>
          <strong>Bối cảnh:</strong> Bạn đã gửi Báo giá chi tiết kèm bảng Specs cho Buyer từ <strong>14 ngày trước</strong>. Khách đã xem nhưng hoàn toàn im lặng, không trả lời email nhắc nhở đơn thuần ("Did you check our price?").
        </p>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 'bold' }}>
            Chọn Động cơ Tiếp cận lại (Follow-up Motive):
          </label>
          <select
            className="form-input"
            value={b08.crisis_motive || 'Recover'}
            onChange={(e) => handleFieldChange('crisis_motive', e.target.value)}
            onBlur={handleBlur}
            disabled={isDisabled}
            style={{ fontSize: '0.9rem', fontWeight: 'bold', height: '42px', borderColor: isInvalidMotive ? 'var(--accent-danger)' : undefined }}
          >
            <option value="Recover">1. [Recover] Khôi phục nhịp độ: Gửi cập nhật biến động giá cước / xu hướng nguyên liệu</option>
            <option value="Maintain">2. [Maintain] Duy trì quan hệ: Gửi tài liệu phân tích kỹ thuật / Case study giá trị</option>
            <option value="Clarify">3. [Clarify] Làm rõ thông tin: Hỏi xem thông số kỹ thuật có cần điều chỉnh không</option>
            <option value="Develop">4. [Develop] Mở rộng: Giới thiệu thêm mẫu mã sản phẩm phụ</option>
            <option value="Advance">5. [Advance] Thúc ép chốt đơn: "Anh chị đã duyệt báo giá chưa để ký hợp đồng?"</option>
          </select>
        </div>

        {/* CẢNH BÁO NẾU CHỌN ADVANCE */}
        {isInvalidMotive && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-danger)',
            padding: '10px 14px', borderRadius: '8px', marginTop: '12px', color: '#fca5a5', fontSize: '0.85rem'
          }}>
            <XCircle size={18} color="var(--accent-danger)" style={{ flexShrink: 0 }} />
            <div>
              <strong>Sai lầm nghiệp vụ:</strong> Khi khách đã im lặng 14 ngày, việc thúc ép <em>"Khi nào chốt đơn"</em> (Advance) chỉ khiến họ cảm thấy bị làm phiền và tăng nguy cơ chặn liên lạc. Hãy chọn động cơ <strong>[Recover]</strong> hoặc <strong>[Maintain]</strong> để trao thêm giá trị!
            </div>
          </div>
        )}
      </div>

      {/* KHU VỰC 3: THIẾT LẬP KẾ HOẠCH CHẠM TIẾP THEO */}
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="var(--accent-primary)" /> 2. Kế hoạch Chạm tiếp theo (Next Touchpoint Plan)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 'bold' }}>
              Ngày lên lịch gửi Touchpoint:
            </label>
            <input
              type="date"
              className="form-input"
              value={b08.next_touchpoint_date || ''}
              onChange={(e) => handleFieldChange('next_touchpoint_date', e.target.value)}
              onBlur={handleBlur}
              disabled={isDisabled}
              style={{ fontSize: '0.85rem', height: '40px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 'bold' }}>
              Loại hình Giá trị Trao gửi (Touchpoint Content):
            </label>
            <select
              className="form-input"
              value={b08.next_touchpoint_type || 'Market Update'}
              onChange={(e) => handleFieldChange('next_touchpoint_type', e.target.value)}
              onBlur={handleBlur}
              disabled={isDisabled}
              style={{ fontSize: '0.85rem', height: '40px' }}
            >
              <option value="Market Update">📈 Market Intelligence Update (Bản tin biến động cước / nguồn cung)</option>
              <option value="Tech Proof">🔬 Technical Lab Report (Chứng chỉ / Kết quả test lab mẫu mới)</option>
              <option value="Case Study">🏢 Case Study (Câu chuyện xuất khẩu thành công vào thị trường tương tự)</option>
              <option value="Sample Feedback">📦 Sample Follow-up (Hỏi cảm nhận và đánh giá chất lượng mẫu thử)</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 'bold' }}>
            <MessageSquare size={14} /> Nội dung tin nhắn / Email Follow-up dự kiến:
          </label>
          <textarea
            className="form-input"
            rows={4}
            placeholder="VD: 'Hi [Tên Buyer], Chúng tôi vừa nhận được thông báo cước tàu tuyến Hải Phòng - Hamburg giảm 8% cho các chuyến tháng tới. Gửi anh/chị thông tin cập nhật để tiện tối ưu chi phí dự toán...'"
            value={b08.follow_up_message || ''}
            onChange={(e) => handleFieldChange('follow_up_message', e.target.value)}
            onBlur={handleBlur}
            disabled={isDisabled}
            style={{ fontSize: '0.85rem', resize: 'vertical' }}
          />
        </div>
      </div>
    </section>
  );
}
