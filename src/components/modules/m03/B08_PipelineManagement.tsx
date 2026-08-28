'use client';

import React, { useState } from 'react';
import { Columns3, AlertOctagon, CheckCircle2, Calendar, MessageSquare, Send, XCircle, GripVertical, Building2, DollarSign } from 'lucide-react';
import { M03FormData } from './M03_CombinedForm';

interface Props {
  data: M03FormData;
  setData: React.Dispatch<React.SetStateAction<M03FormData>>;
  handleBlur: () => void;
  isDisabled?: boolean;
}

const PIPELINE_STAGES = [
  { id: 'prospecting', name: '1. Prospecting', desc: 'Mở đầu & Thăm dò', color: '#3b82f6' },
  { id: 'qualification', name: '2. Qualification', desc: 'Sàng lọc F-N-A-C-M', color: '#8b5cf6' },
  { id: 'quotation', name: '3. Quotation', desc: 'Báo giá & Specs TCO', color: '#f59e0b' },
  { id: 'negotiation', name: '4. Negotiation', desc: 'Đàm phán Give–Take', color: '#ec4899' },
  { id: 'closing', name: '5. Safe Closing', desc: 'Chốt cọc & Hợp đồng', color: '#10b981' },
];

export default function B08_PipelineManagement({ data, setData, handleBlur, isDisabled }: Props) {
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const b08 = data.b08_pipeline || {
    current_stage: 'quotation',
    crisis_motive: 'Recover',
    next_touchpoint_date: '',
    next_touchpoint_type: 'Market Update',
    follow_up_message: ''
  };

  const targetLead = (data.b06_leads || []).find(l => l.is_target);
  const dealCompanyName = targetLead?.company_name || 'Golden Harvest Foods LLC';
  const dealWebsite = targetLead?.website || 'goldenharvest.us';

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

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', 'target_deal');
  };

  const handleDrop = (stageId: string) => {
    if (isDisabled) return;
    setDragOverStage(null);
    handleFieldChange('current_stage', stageId);
  };

  return (
    <section className="glass-panel" style={{ padding: '32px' }}>
      <style>{`
        .kanban-col {
          background: rgba(15, 23, 42, 0.45);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 12px;
          min-height: 170px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: all 0.25s ease;
        }
        .kanban-col.active {
          border-color: rgba(59, 130, 246, 0.4);
          background: rgba(59, 130, 246, 0.04);
        }
        .kanban-col.drag-over {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          transform: scale(1.02);
        }
        .deal-card {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
          border: 1px solid var(--accent-primary);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.25);
          padding: 12px;
          border-radius: 8px;
          cursor: grab;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .deal-card:active {
          cursor: grabbing;
          transform: scale(0.98);
        }
      `}</style>

      {/* HEADER BÀI HỌC */}
      <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '8px' }}>
        Bài 08: Quản trị Pipeline & Kỷ luật Follow-up (Pipeline Management)
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Quản trị nhịp độ của Deal trên phễu bán hàng (Mini-CRM) và giải quyết tình huống khách hàng im lặng sau báo giá.
      </p>

      {/* KHU VỰC 1: MINI-KANBAN CRM BOARD */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Columns3 size={18} color="var(--accent-primary)" /> 1. Bảng Điều Phối Giai Đoạn Deal (CRM Pipeline Kanban)
          </h3>
          <span style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
            💡 <em>Kéo thả thẻ Deal hoặc bấm chọn cột để cập nhật vị trí phễu.</em>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
          {PIPELINE_STAGES.map(stage => {
            const isCurrentStage = b08.current_stage === stage.id;
            const isOver = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                className={`kanban-col ${isCurrentStage ? 'active' : ''} ${isOver ? 'drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOverStage(stage.id); }}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={() => handleDrop(stage.id)}
                onClick={() => handleFieldChange('current_stage', stage.id)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 6 }}>
                  <span style={{ fontWeight: 'bold', color: isCurrentStage ? stage.color : 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {stage.name}
                  </span>
                  {isCurrentStage && <CheckCircle2 size={14} color={stage.color} />}
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', minHeight: 28 }}>
                  {stage.desc}
                </div>

                {/* THẺ DEAL NẾU Ở GIAI ĐOẠN HIỆN TẠI */}
                {isCurrentStage && (
                  <div
                    className="deal-card"
                    draggable={!isDisabled}
                    onDragStart={handleDragStart}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Building2 size={13} color="var(--accent-primary)" />
                      <strong style={{ fontSize: '.8rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {dealCompanyName}
                      </strong>
                    </div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                      {dealWebsite}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.72rem' }}>
                      <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(59,130,246,.15)', color: 'var(--accent-primary)', fontWeight: 700 }}>
                        Target Deal
                      </span>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>$45k / 1x40HC</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* KHU VỰC 2: CRISIS INJECTOR VỚI BẮT LỖI DROPDOWN */}
      <div style={{
        background: isInvalidMotive ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
        border: `1px solid ${isInvalidMotive ? 'var(--accent-danger)' : 'rgba(245, 158, 11, 0.25)'}`,
        padding: '20px', borderRadius: '12px', marginBottom: '24px', transition: 'all .3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <AlertOctagon size={20} color={isInvalidMotive ? 'var(--accent-danger)' : '#f59e0b'} />
          <h4 style={{ color: isInvalidMotive ? 'var(--accent-danger)' : '#f59e0b', margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>
            ⚡ TÌNH HUỐNG THỬ THÁCH: BUYER IM LẶNG 14 NGÀY SAU BÁO GIÁ
          </h4>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: '1.5', marginBottom: '16px' }}>
          <strong>Bối cảnh:</strong> Bạn đã gửi Báo giá chi tiết kèm bảng Specs cho <strong>{dealCompanyName}</strong> từ 14 ngày trước. Khách đã xem nhưng hoàn toàn im lặng, không trả lời email nhắc nhở đơn thuần ("Did you check our price?").
        </p>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 'bold' }}>
            Chọn Động cơ Tiếp cận lại (Follow-up Motive):
          </label>
          <select
            className="form-input"
            value={['Recover', 'Maintain', 'Clarify', 'Develop', 'Advance'].includes(b08.crisis_motive) ? b08.crisis_motive : 'OTHER'}
            onChange={(e) => {
              if (e.target.value === 'OTHER') {
                handleFieldChange('crisis_motive', 'Khác: ');
              } else {
                handleFieldChange('crisis_motive', e.target.value);
              }
            }}
            onBlur={handleBlur}
            disabled={isDisabled}
            style={{
              fontSize: '0.88rem', fontWeight: 'bold', height: '42px',
              borderColor: isInvalidMotive ? 'var(--accent-danger)' : undefined,
              background: isInvalidMotive ? 'rgba(239, 68, 68, 0.1)' : undefined,
              boxShadow: isInvalidMotive ? '0 0 12px rgba(239, 68, 68, 0.3)' : undefined,
              marginBottom: !['Recover', 'Maintain', 'Clarify', 'Develop', 'Advance'].includes(b08.crisis_motive) ? '8px' : '0'
            }}
          >
            <option value="Recover">1. [Recover] Khôi phục nhịp độ: Gửi cập nhật biến động giá cước / xu hướng nguyên liệu</option>
            <option value="Maintain">2. [Maintain] Duy trì quan hệ: Gửi tài liệu phân tích kỹ thuật / Case study giá trị</option>
            <option value="Clarify">3. [Clarify] Làm rõ thông tin: Hỏi xem thông số kỹ thuật có cần điều chỉnh không</option>
            <option value="Develop">4. [Develop] Mở rộng: Giới thiệu thêm mẫu mã sản phẩm phụ</option>
            <option value="Advance">5. [Advance] Thúc ép chốt đơn: "Anh chị đã duyệt báo giá chưa để ký hợp đồng?" ⚠️</option>
            <option value="OTHER">6. Khác (Tự định nghĩa)</option>
          </select>

          {!['Recover', 'Maintain', 'Clarify', 'Develop', 'Advance'].includes(b08.crisis_motive) && (
            <input
              type="text"
              className="form-input"
              placeholder="Nhập động cơ tiếp cận cụ thể..."
              value={b08.crisis_motive || ''}
              onChange={(e) => handleFieldChange('crisis_motive', e.target.value)}
              onBlur={handleBlur}
              disabled={isDisabled}
              style={{ fontSize: '0.85rem', marginBottom: '8px' }}
            />
          )}
        </div>

        {/* CẢNH BÁO VIỀN ĐỎ NẾU CHỌN ADVANCE */}
        {isInvalidMotive && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-danger)',
            padding: '12px 16px', borderRadius: '8px', marginTop: '12px', color: '#fca5a5', fontSize: '0.85rem'
          }}>
            <XCircle size={20} color="var(--accent-danger)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ display: 'block', marginBottom: 2 }}>⚠️ SAI LẦM NGHIỆP VỤ (LÀM CHÁY LEAD):</strong>
              Khi Buyer đã im lặng 14 ngày, việc gửi email thúc ép <em>"Khi nào chốt đơn / ký hợp đồng"</em> (Advance) chứng tỏ người bán không có giá trị mới để trao đổi, chỉ tạo cảm giác bị làm phiền và đẩy Buyer sang phía đối thủ. Hãy chuyển ngay sang động cơ <strong>[Recover]</strong> hoặc <strong>[Maintain]</strong>!
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
              value={['Market Update', 'Tech Proof', 'Case Study', 'Sample Feedback'].includes(b08.next_touchpoint_type) ? b08.next_touchpoint_type : 'OTHER'}
              onChange={(e) => {
                if (e.target.value === 'OTHER') {
                  handleFieldChange('next_touchpoint_type', 'Khác: ');
                } else {
                  handleFieldChange('next_touchpoint_type', e.target.value);
                }
              }}
              onBlur={handleBlur}
              disabled={isDisabled}
              style={{ fontSize: '0.85rem', height: '40px', marginBottom: !['Market Update', 'Tech Proof', 'Case Study', 'Sample Feedback'].includes(b08.next_touchpoint_type) ? '8px' : '0' }}
            >
              <option value="Market Update">📈 Market Intelligence Update (Bản tin biến động cước / nguồn cung)</option>
              <option value="Tech Proof">🔬 Technical Lab Report (Chứng chỉ / Kết quả test lab mẫu mới)</option>
              <option value="Case Study">🏢 Case Study (Câu chuyện xuất khẩu thành công vào thị trường tương tự)</option>
              <option value="Sample Feedback">📦 Sample Follow-up (Hỏi cảm nhận và đánh giá chất lượng mẫu thử)</option>
              <option value="OTHER">✨ Khác (Tự định nghĩa)</option>
            </select>

            {!['Market Update', 'Tech Proof', 'Case Study', 'Sample Feedback'].includes(b08.next_touchpoint_type) && (
              <input
                type="text"
                className="form-input"
                placeholder="Nhập loại hình giá trị trao gửi cụ thể..."
                value={b08.next_touchpoint_type || ''}
                onChange={(e) => handleFieldChange('next_touchpoint_type', e.target.value)}
                onBlur={handleBlur}
                disabled={isDisabled}
                style={{ fontSize: '0.85rem', marginBottom: '8px' }}
              />
            )}
          </div>
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 'bold' }}>
            <MessageSquare size={14} /> Nội dung tin nhắn / Email Follow-up dự kiến:
          </label>
          <textarea
            className="form-input"
            rows={4}
            placeholder={`VD: 'Hi ${dealCompanyName}, Chúng tôi vừa nhận được thông báo cước tàu tuyến Hải Phòng - Hamburg giảm 8% cho các chuyến tháng tới. Gửi anh/chị thông tin cập nhật để tiện tối ưu chi phí dự toán...'`}
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

