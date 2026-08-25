'use client';

import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Sliders, Activity, Info } from 'lucide-react';
import { M03FormData } from './M03_CombinedForm';

interface Props {
  data: M03FormData;
  setData: React.Dispatch<React.SetStateAction<M03FormData>>;
  handleBlur: () => void;
  isDisabled?: boolean;
}

export default function B07_OpportunityQualification({ data, setData, handleBlur, isDisabled }: Props) {
  const b07 = data.b07_qualification || {
    buyer_response_text: '',
    response_classification: 'Inquiry',
    fnacm_scores: { fit: 15, need: 15, access: 10, criteria: 15, momentum: 15 },
    low_score_justification: ''
  };

  const scores = b07.fnacm_scores || { fit: 0, need: 0, access: 0, criteria: 0, momentum: 0 };
  const totalScore = (scores.fit || 0) + (scores.need || 0) + (scores.access || 0) + (scores.criteria || 0) + (scores.momentum || 0);

  const isLowScore = totalScore < 50;
  const isJustificationValid = (b07.low_score_justification || '').trim().split(/\s+/).filter(Boolean).length >= 20;

  const handleScoreChange = (dimension: keyof typeof scores, value: number) => {
    if (isDisabled) return;
    setData(prev => ({
      ...prev,
      b07_qualification: {
        ...prev.b07_qualification,
        fnacm_scores: {
          ...prev.b07_qualification?.fnacm_scores,
          [dimension]: Number(value)
        }
      }
    }));
  };

  const handleFieldChange = (field: string, value: string) => {
    if (isDisabled) return;
    setData(prev => ({
      ...prev,
      b07_qualification: {
        ...prev.b07_qualification,
        [field]: value
      }
    }));
  };

  const getScoreBadge = () => {
    if (totalScore >= 75) {
      return { label: '🟢 Cơ hội Nét (High Opportunity)', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
    }
    if (totalScore >= 50) {
      return { label: '🟡 Cần Nuôi Dưỡng (Need Nurturing)', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
    }
    return { label: '🔴 Rủi ro Cao / Rác (High Risk / Junk)', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
  };

  const badge = getScoreBadge();

  return (
    <section className="glass-panel" style={{ padding: '32px' }}>
      <style>{`
        .fnacm-slider-container {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 16px;
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        .fnacm-slider-container:hover {
          border-color: rgba(59, 130, 246, 0.3);
          background: rgba(15, 23, 42, 0.6);
        }
        .custom-range {
          accent-color: var(--accent-primary);
          height: 6px;
          cursor: pointer;
          width: 100%;
        }
      `}</style>

      {/* HEADER BÀI HỌC */}
      <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '8px' }}>
        Bài 07: Chấm điểm Cơ hội & Phân loại Phản hồi (Opportunity Qualification)
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '28px' }}>
        Nội soi phản hồi của Buyer qua khung 5 trục F-N-A-C-M để quyết định mức độ đầu tư công sức (Effort Decision).
      </p>

      {/* KHU VỰC 1: PHÂN LOẠI PHẢN HỒI */}
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="var(--accent-primary)" /> 1. Phân loại Tín hiệu Buyer (Buyer Response Classifier)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 'bold' }}>
              Nội dung phản hồi thực tế của Buyer (Email / Tin nhắn):
            </label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="VD: 'We received your intro. Can you quote FOB Haiphong for 1x40ft HC of 100% Organic Cashews? Payment LC at sight.'"
              value={b07.buyer_response_text || ''}
              onChange={(e) => handleFieldChange('buyer_response_text', e.target.value)}
              onBlur={handleBlur}
              disabled={isDisabled}
              style={{ fontSize: '0.85rem', resize: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 'bold' }}>
              Phân loại Tầng Tín hiệu:
            </label>
            <select
              className="form-input"
              value={b07.response_classification || 'Inquiry'}
              onChange={(e) => handleFieldChange('response_classification', e.target.value)}
              onBlur={handleBlur}
              disabled={isDisabled}
              style={{ fontSize: '0.9rem', fontWeight: 'bold', height: '42px' }}
            >
              <option value="Lead">1. Raw Lead (Chỉ có contact, chưa tương tác)</option>
              <option value="Inquiry">2. Inquiry (Hỏi giá / xin catalog chung chung)</option>
              <option value="Interest">3. Interest (Quan tâm thực tế, có trao đổi nghiệp vụ)</option>
              <option value="Opportunity">4. Opportunity (Có Volume, Specs, Budget và Timeline rõ)</option>
            </select>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
              💡 <em>Lưu ý: Hỏi giá chưa chắc là Opportunity. Cần kiểm tra khung F-N-A-C-M bên dưới.</em>
            </p>
          </div>
        </div>
      </div>

      {/* KHU VỰC 2: F-N-A-C-M SIMULATOR */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="var(--accent-primary)" /> 2. Khung Chấm điểm F-N-A-C-M (Thang điểm 100)
          </h3>

          {/* TỔNG ĐIỂM CARD */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: badge.bg, border: `1px solid ${badge.color}`,
            padding: '6px 16px', borderRadius: '20px'
          }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: badge.color }}>
              {totalScore} / 100 Điểm
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: badge.color }}>
              {badge.label}
            </span>
          </div>
        </div>

        {/* 5 THANH TRƯỢT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* F: FIT */}
          <div className="fnacm-slider-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                F - Fit (Độ khớp Năng lực & Sản phẩm)
              </span>
              <strong style={{ color: 'var(--accent-primary)', fontSize: '0.95rem' }}>{scores.fit || 0} / 20 đ</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Khớp quy cách kỹ thuật, chứng chỉ xuất khẩu, MOQ và năng lực sản xuất của nhà máy.
            </p>
            <input
              type="range" min="0" max="20" step="1"
              value={scores.fit || 0}
              onChange={(e) => handleScoreChange('fit', Number(e.target.value))}
              onBlur={handleBlur}
              disabled={isDisabled}
              className="custom-range"
            />
          </div>

          {/* N: NEED / PAIN */}
          <div className="fnacm-slider-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                N - Need / Pain (Nhu cầu thực & Nỗi đau cấp bách)
              </span>
              <strong style={{ color: 'var(--accent-primary)', fontSize: '0.95rem' }}>{scores.need || 0} / 20 đ</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Họ đang cần gấp hàng thay thế nhà cung cấp cũ, hay chỉ khảo sát giá thị trường?
            </p>
            <input
              type="range" min="0" max="20" step="1"
              value={scores.need || 0}
              onChange={(e) => handleScoreChange('need', Number(e.target.value))}
              onBlur={handleBlur}
              disabled={isDisabled}
              className="custom-range"
            />
          </div>

          {/* A: ACCESS */}
          <div className="fnacm-slider-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                A - Access (Tiếp cận Người có Quyền ra Quyết định)
              </span>
              <strong style={{ color: 'var(--accent-primary)', fontSize: '0.95rem' }}>{scores.access || 0} / 20 đ</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Đang làm việc trực tiếp với Sourcing Manager / CEO hay chỉ là nhân viên thực tập / trung gian?
            </p>
            <input
              type="range" min="0" max="20" step="1"
              value={scores.access || 0}
              onChange={(e) => handleScoreChange('access', Number(e.target.value))}
              onBlur={handleBlur}
              disabled={isDisabled}
              className="custom-range"
            />
          </div>

          {/* C: CRITERIA / CONCERN */}
          <div className="fnacm-slider-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                C - Criteria / Concern (Tiêu chí lựa chọn & Rào cản)
              </span>
              <strong style={{ color: 'var(--accent-primary)', fontSize: '0.95rem' }}>{scores.criteria || 0} / 20 đ</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Họ đưa ra tiêu chí chọn hàng rõ ràng, hay mập mờ về điều khoản thanh toán & nghiệm thu?
            </p>
            <input
              type="range" min="0" max="20" step="1"
              value={scores.criteria || 0}
              onChange={(e) => handleScoreChange('criteria', Number(e.target.value))}
              onBlur={handleBlur}
              disabled={isDisabled}
              className="custom-range"
            />
          </div>

          {/* M: MOMENTUM */}
          <div className="fnacm-slider-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                M - Momentum (Nhịp độ trao đổi & Tốc độ phản hồi)
              </span>
              <strong style={{ color: 'var(--accent-primary)', fontSize: '0.95rem' }}>{scores.momentum || 0} / 20 đ</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Phản hồi trong 24-48h, cung cấp thông tin hai chiều đầy đủ hay mất hút sau khi nhận thông tin?
            </p>
            <input
              type="range" min="0" max="20" step="1"
              value={scores.momentum || 0}
              onChange={(e) => handleScoreChange('momentum', Number(e.target.value))}
              onBlur={handleBlur}
              disabled={isDisabled}
              className="custom-range"
            />
          </div>
        </div>
      </div>

      {/* KHU VỰC 3: FIT SCORE GATE (CẢNH BÁO RÁC) */}
      {isLowScore && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--accent-danger)',
          padding: '20px', borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <ShieldAlert size={22} color="var(--accent-danger)" />
            <h4 style={{ color: 'var(--accent-danger)', margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>
              ⚠️ CẢNH BÁO: ĐIỂM CƠ HỘI DƯỚI 50 ĐIỂM (RỦI RO CAO)
            </h4>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#fca5a5', lineHeight: '1.5', marginBottom: '12px' }}>
            Theo kỷ luật B2B Sales, cơ hội này có rủi ro rất cao (khách tham khảo giá bừa bãi hoặc không đúng đối tượng). Nếu bạn vẫn muốn đầu tư công sức làm Báo giá chi tiết, bắt buộc phải giải trình rõ lý do:
          </p>

          <textarea
            className="form-input"
            rows={3}
            placeholder="Nhập giải trình lý do thương mại (Bắt buộc tối thiểu 20 từ. VD: Khách hàng thuộc tập đoàn đa quốc gia có tiềm năng chiến lược dài hạn, dù đợt này hỏi ít nhưng mở ra cánh cửa thị trường mới...)"
            value={b07.low_score_justification || ''}
            onChange={(e) => handleFieldChange('low_score_justification', e.target.value)}
            onBlur={handleBlur}
            disabled={isDisabled}
            style={{ fontSize: '0.85rem', borderColor: isJustificationValid ? '#10b981' : 'var(--accent-danger)' }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: isJustificationValid ? '#10b981' : 'var(--accent-danger)', fontWeight: 'bold' }}>
              {isJustificationValid ? '✓ Giải trình hợp lệ' : `Chưa đủ 20 từ (${(b07.low_score_justification || '').trim().split(/\s+/).filter(Boolean).length}/20 từ)`}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
