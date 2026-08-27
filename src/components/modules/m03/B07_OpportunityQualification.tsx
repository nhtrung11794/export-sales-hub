'use client';

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Sliders, Activity, Info, ChevronDown, ChevronUp, Globe2, Target, Eye } from 'lucide-react';
import { M03FormData } from './M03_CombinedForm';
import { useModuleStore } from '@/store/useModuleStore';

interface Props {
  data: M03FormData;
  setData: React.Dispatch<React.SetStateAction<M03FormData>>;
  handleBlur: () => void;
  isDisabled?: boolean;
}

function RadarChart({ scores }: { scores: { fit: number; need: number; access: number; criteria: number; momentum: number } }) {
  const size = 280;
  const center = size / 2;
  const radius = 95;
  const maxScore = 20;

  const axes = [
    { key: 'fit', label: 'F - Fit', angle: -Math.PI / 2, value: scores.fit || 0 },
    { key: 'need', label: 'N - Need', angle: -Math.PI / 2 + (2 * Math.PI / 5) * 1, value: scores.need || 0 },
    { key: 'criteria', label: 'C - Commercial', angle: -Math.PI / 2 + (2 * Math.PI / 5) * 2, value: scores.criteria || 0 },
    { key: 'momentum', label: 'M - Momentum', angle: -Math.PI / 2 + (2 * Math.PI / 5) * 3, value: scores.momentum || 0 },
    { key: 'access', label: 'A - Access', angle: -Math.PI / 2 + (2 * Math.PI / 5) * 4, value: scores.access || 0 },
  ];

  const levels = [0.25, 0.5, 0.75, 1];

  const getCoordinates = (angle: number, r: number) => {
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const polygonPoints = axes.map(axis => {
    const r = (Math.max(1, axis.value) / maxScore) * radius;
    const { x, y } = getCoordinates(axis.angle, r);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 18, height: '100%', justifyContent: 'center' }}>
      <div style={{ fontSize: '.86rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        🕸️ Radar Chart F-N-A-C-M (Realtime)
      </div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {levels.map((lvl, idx) => {
          const points = axes.map(a => {
            const { x, y } = getCoordinates(a.angle, radius * lvl);
            return `${x},${y}`;
          }).join(' ');
          return (
            <polygon
              key={idx}
              points={points}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
              strokeDasharray={idx === 3 ? 'none' : '3 3'}
            />
          );
        })}

        {axes.map((axis, idx) => {
          const outer = getCoordinates(axis.angle, radius);
          return (
            <line
              key={idx}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
            />
          );
        })}

        <polygon
          points={polygonPoints}
          fill="rgba(59, 130, 246, 0.3)"
          stroke="#3b82f6"
          strokeWidth="2.5"
          style={{ transition: 'all 0.3s ease' }}
        />

        {axes.map((axis, idx) => {
          const r = (Math.max(1, axis.value) / maxScore) * radius;
          const pt = getCoordinates(axis.angle, r);
          const isWeak = axis.value < 10;
          return (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r="4.5"
              fill={isWeak ? '#ef4444' : '#10b981'}
              stroke="#fff"
              strokeWidth="1.5"
            />
          );
        })}

        {axes.map((axis, idx) => {
          const labelPt = getCoordinates(axis.angle, radius + 22);
          return (
            <text
              key={idx}
              x={labelPt.x}
              y={labelPt.y + 4}
              textAnchor="middle"
              fill={axis.value < 10 ? '#fca5a5' : '#e2e8f0'}
              fontSize="10"
              fontWeight="bold"
            >
              {axis.label} ({axis.value})
            </text>
          );
        })}
      </svg>
      <div style={{ fontSize: '.76rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 10, lineHeight: 1.4 }}>
        {scores.access < 10 ? (
          <span style={{ color: '#fca5a5' }}>⚠️ <strong>Điểm Access thấp (&lt;10):</strong> Nguy cơ nghẽn deal do chưa chạm đến người quyết định thực tế!</span>
        ) : scores.fit < 10 ? (
          <span style={{ color: '#fca5a5' }}>⚠️ <strong>Điểm Fit thấp (&lt;10):</strong> Sản phẩm hoặc chứng chỉ chưa khớp với tiêu chuẩn Buyer!</span>
        ) : (
          <span style={{ color: '#10b981' }}>✓ <strong>Cân đối tốt:</strong> 5 trục phân bổ đồng đều, độ méo thấp.</span>
        )}
      </div>
    </div>
  );
}

export default function B07_OpportunityQualification({ data, setData, handleBlur, isDisabled }: Props) {
  const { submissions } = useModuleStore();
  const [isIcpOpen, setIsIcpOpen] = useState(false);

  const m02 = submissions.M02?.form_data || {};
  const m02Pain = Object.values(m02.discovery_matrix?.pain || {}).filter(Boolean).join('; ');

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
          padding: 14px 16px;
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
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        Nội soi phản hồi của Buyer qua khung 5 trục F-N-A-C-M để quyết định mức độ đầu tư công sức (Effort Decision).
      </p>

      {/* COLLAPSIBLE CONTEXT HEADER: ICP & PAIN M02 */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: 10,
        marginBottom: 24,
        overflow: 'hidden',
      }}>
        <button
          type="button"
          onClick={() => setIsIcpOpen(!isIcpOpen)}
          style={{
            width: '100%',
            padding: '12px 18px',
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'var(--accent-primary)',
            fontWeight: 700,
            fontSize: '.88rem',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={18} /> 📌 Trạm Bối Cảnh: Hồ sơ ICP & Nỗi Đau Buyer (Kế thừa từ Module 02)
          </span>
          {isIcpOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {isIcpOpen && (
          <div style={{ padding: '0 18px 16px', borderTop: '1px solid rgba(59, 130, 246, 0.15)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 10 }}>
            <div style={{ padding: 10, borderRadius: 8, background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: '.74rem', color: 'var(--text-muted)', marginBottom: 2 }}>Thị trường Mục tiêu:</div>
              <div style={{ fontSize: '.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>{m02.target_market || 'Chưa chọn ở M02'} (RTM: {m02.route_to_market || 'N/A'})</div>
            </div>
            <div style={{ padding: 10, borderRadius: 8, background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: '.74rem', color: 'var(--text-muted)', marginBottom: 2 }}>Chân dung ICP:</div>
              <div style={{ fontSize: '.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>{m02.icp_industry || 'N/A'} · {m02.icp_size || 'N/A'}</div>
            </div>
            <div style={{ padding: 10, borderRadius: 8, background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: '.74rem', color: 'var(--text-muted)', marginBottom: 2 }}>Nỗi đau Người mua (Pain Points):</div>
              <div style={{ fontSize: '.82rem', color: '#f59e0b' }}>{m02Pain || 'Chưa điền nỗi đau ở B05'}</div>
            </div>
          </div>
        )}
      </div>

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
              💡 <em>Lưu ý: Hỏi giá chưa chắc là Opportunity. Cần đối chiếu khung F-N-A-C-M bên dưới.</em>
            </p>
          </div>
        </div>
      </div>

      {/* KHU VỰC 2: F-N-A-C-M SIMULATOR & RADAR CHART (2 CỘT) */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="var(--accent-primary)" /> 2. Khung Chấm điểm F-N-A-C-M & Biểu đồ Radar
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

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 0.9fr)', gap: 20 }}>
          {/* CỘT TRÁI: 5 THANH TRƯỢT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* F: FIT */}
            <div className="fnacm-slider-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.86rem' }}>
                  F - Fit (Độ khớp Năng lực & Sản phẩm)
                </span>
                <strong style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }}>{scores.fit || 0} / 20 đ</strong>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.86rem' }}>
                  N - Need / Pain (Nhu cầu thực & Nỗi đau cấp bách)
                </span>
                <strong style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }}>{scores.need || 0} / 20 đ</strong>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.86rem' }}>
                  A - Access (Tiếp cận Người có Quyền ra Quyết định)
                </span>
                <strong style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }}>{scores.access || 0} / 20 đ</strong>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.86rem' }}>
                  C - Commercial Criteria (Tiêu chí lựa chọn & Thương mại)
                </span>
                <strong style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }}>{scores.criteria || 0} / 20 đ</strong>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.86rem' }}>
                  M - Momentum (Nhịp độ trao đổi & Tốc độ phản hồi)
                </span>
                <strong style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }}>{scores.momentum || 0} / 20 đ</strong>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
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

          {/* CỘT PHẢI: RADAR CHART */}
          <div>
            <RadarChart scores={scores} />
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

