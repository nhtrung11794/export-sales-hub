import React from 'react';
import { M02FormData } from './M02_CombinedForm';
import { FileText, Lock, Unlock } from 'lucide-react';

interface B05Props {
  data: M02FormData;
  setData: React.Dispatch<React.SetStateAction<M02FormData>>;
  handleBlur: () => void;
  isDisabled: boolean;
}

type MatrixRowKey = 'context' | 'need' | 'pain' | 'criteria' | 'risk_concern';
type MatrixColKey = 'surface_signal' | 'core_hypothesis' | 'approach_strategy';

const ROW_CONFIG: { 
  key: MatrixRowKey; 
  label: string; 
  placeholders: { surface_signal: string; core_hypothesis: string; approach_strategy: string } 
}[] = [
  { 
    key: 'context', 
    label: '1. Context (Bối cảnh)', 
    placeholders: { 
      surface_signal: 'Đổi nhân sự, đứt gãy cung ứng, ra mắt sản phẩm mới.', 
      core_hypothesis: 'Áp lực tìm NCC dự phòng, đa dạng hóa rủi ro.', 
      approach_strategy: 'Cung cấp Insight ngành, báo cáo mùa vụ/nguồn cung.' 
    } 
  },
  { 
    key: 'need', 
    label: '2. Need (Nhu cầu thực)', 
    placeholders: { 
      surface_signal: 'Đăng RFQ, chiến dịch quảng cáo, xu hướng tiêu dùng.', 
      core_hypothesis: 'Tối ưu biên lợi nhuận, tìm nguyên liệu phân khúc ngách.', 
      approach_strategy: 'Case Study tối ưu chi phí, gợi ý giải pháp nguyên liệu.' 
    } 
  },
  { 
    key: 'pain', 
    label: '3. Pain (Nỗi đau)', 
    placeholders: { 
      surface_signal: 'Review tiêu cực, tin tức thu hồi, lợi nhuận sụt giảm.', 
      core_hypothesis: 'NCC cũ giao trễ, chất lượng kém, rủi ro phạt hợp đồng.', 
      approach_strategy: 'Pitching quy trình kiểm soát QA/QC, gửi Test Report mẫu.' 
    } 
  },
  { 
    key: 'criteria', 
    label: '4. Criteria (Tiêu chí)', 
    placeholders: { 
      surface_signal: 'Logo chứng nhận (BRC, Halal...), luật nhập khẩu nội địa.', 
      core_hypothesis: 'Bảo vệ uy tín thương hiệu, đáp ứng tiêu chuẩn Audit.', 
      approach_strategy: 'Gửi hồ sơ năng lực nhà máy, bản sao chứng chỉ quốc tế.' 
    } 
  },
  { 
    key: 'risk_concern', 
    label: '5. Risk (Rủi ro)', 
    placeholders: { 
      surface_signal: 'Im lặng, chần chừ, yêu cầu thanh toán khắt khe.', 
      core_hypothesis: 'Sợ lừa đảo chứng từ, kẹt dòng tiền, rủi ro hải quan.', 
      approach_strategy: 'Đề xuất thanh toán L/C, cung cấp Vận đơn (B/L) tham chiếu.' 
    } 
  },
];

export default function B05_DiscoveryMatrix({ data, setData, handleBlur, isDisabled }: B05Props) {
  const isB03Completed = data.target_market && data.route_to_market && data.strategic_reason;

  const handleFieldChange = (rowKey: MatrixRowKey, colKey: MatrixColKey, value: string) => {
    setData(prev => ({
      ...prev,
      discovery_matrix: {
        ...prev.discovery_matrix,
        [rowKey]: {
          ...prev.discovery_matrix[rowKey],
          [colKey]: value
        }
      }
    }));
  };

  const isRowUnlocked = (index: number) => {
    if (isDisabled || !isB03Completed) return false;
    if (index === 0) return true; // Hàng đầu tiên luôn mở nếu B03 hoàn thành
    
    // Kiểm tra hàng trước đó đã có ít nhất 1 ô Insight (hoặc Giả thuyết) được điền chưa
    const prevRowKey = ROW_CONFIG[index - 1].key;
    const prevRowData = data.discovery_matrix[prevRowKey] || {};
    return ((prevRowData.surface_signal || '').trim().length > 0 || (prevRowData.approach_strategy || '').trim().length > 0);
  };

  if (!isB03Completed) {
    return (
      <section className="glass-panel" style={{ padding: '32px', opacity: 0.5, pointerEvents: 'none' }}>
        <h2 style={{ marginBottom: '8px', color: 'var(--text-muted)', fontSize: '1.4rem', fontWeight: 'bold' }}>
          Bài 05: Discovery nền tảng trước khi phát triển cơ hội
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-warning)', marginTop: '16px' }}>
          <Lock size={18} /> <span>Vui lòng hoàn thành Quyết định Chiến lược ở Bài 03 để mở khóa nội dung này.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="glass-panel" style={{ padding: '32px' }}>
      <style>{`
        .discovery-row {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 16px;
          border-radius: 12px;
          position: relative;
        }
        .discovery-row.locked {
          opacity: 0.35;
          background: rgba(0, 0, 0, 0.2);
          border: 1px dashed rgba(255,255,255,0.05);
          filter: grayscale(100%);
          pointer-events: none;
        }
        .discovery-row.active-empty:not(:focus-within) {
          border-color: rgba(59, 130, 246, 0.4);
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.1);
        }
        .discovery-row:focus-within {
          background: rgba(15, 23, 42, 0.8);
          border-color: var(--accent-primary);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
          transform: translateY(-2px);
          z-index: 10;
        }
        .discovery-textarea {
          background: rgba(0,0,0,0.2) !important;
          border: 1px solid rgba(255,255,255,0.05) !important;
          color: var(--text-primary) !important;
          transition: all 0.2s ease;
        }
        .discovery-textarea::placeholder {
          color: rgba(255,255,255,0.4) !important;
        }
        .discovery-textarea:hover {
          border-color: rgba(255,255,255,0.15) !important;
          background: rgba(0,0,0,0.3) !important;
        }
        .discovery-textarea:focus {
          border-color: var(--accent-primary) !important;
          background: rgba(15, 23, 42, 0.6) !important;
          box-shadow: 0 0 0 1px var(--accent-primary);
        }
      `}</style>
      <h2 style={{ marginBottom: '8px', color: 'var(--accent-primary)', fontSize: '1.4rem', fontWeight: 'bold' }}>
        Bài 05: Discovery Insight Note (Góc tiếp cận)
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Bóc tách từ nhu cầu bề mặt thành vấn đề cốt lõi. Hãy hoàn thành các hàng theo thứ tự từ trên xuống dưới. Dữ liệu này sẽ làm Ngân hàng Góc tiếp cận cho các module sau.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Tiêu đề Cột */}
        {/* Tiêu đề Cột */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 3fr 3fr', gap: '16px', padding: '0 16px', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', textAlign: 'center' }}>
          <div style={{ textAlign: 'left' }}>Lớp thông tin</div>
          <div>Tín hiệu<br/><span style={{fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-secondary)'}}>(Market Signal)</span></div>
          <div>Giả thuyết<br/><span style={{fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-secondary)'}}>(Core Hypothesis)</span></div>
          <div>Chiến lược tiếp cận<br/><span style={{fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-secondary)'}}>(Outreach Hook)</span></div>
        </div>

        {/* Ma trận */}
        {ROW_CONFIG.map((row, index) => {
          const unlocked = isRowUnlocked(index);
          const rowData = data.discovery_matrix[row.key];
          
          const hasContent = (rowData.surface_signal || '').trim().length > 0 || 
                             (rowData.core_hypothesis || '').trim().length > 0 || 
                             (rowData.approach_strategy || '').trim().length > 0;
          
          const prevRowKey = index > 0 ? ROW_CONFIG[index-1].key : null;
          const isPrevRowFilled = prevRowKey ? ((data.discovery_matrix[prevRowKey].surface_signal || '').trim().length > 0 || (data.discovery_matrix[prevRowKey].approach_strategy || '').trim().length > 0) : true;
          const isActiveEmpty = unlocked && !hasContent && isPrevRowFilled;
          
          const [mainLabel, subLabel] = row.label.split(' (');

          return (
            <div 
              key={row.key}
              className={`discovery-row ${!unlocked ? 'locked' : ''} ${isActiveEmpty ? 'active-empty' : ''}`}
              style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 3fr 3fr', gap: '16px', alignItems: 'start' }}
            >
              {/* Tiêu đề Hàng */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '8px' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {!unlocked ? <Lock size={14} color="var(--text-muted)" /> : <Unlock className="row-icon" size={14} color={hasContent ? "var(--text-primary)" : "var(--accent-primary)"} style={{ transition: 'color 0.3s' }} />}
                  <span>{mainLabel}</span>
                </div>
                {subLabel && (
                  <div style={{ paddingLeft: '20px', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                    ({subLabel}
                  </div>
                )}
              </div>

              {/* Ô Surface Signal */}
              <textarea
                className="form-input discovery-textarea"
                placeholder={row.placeholders.surface_signal}
                value={rowData.surface_signal || ''}
                onChange={(e) => handleFieldChange(row.key, 'surface_signal', e.target.value)}
                onBlur={handleBlur}
                disabled={!unlocked || isDisabled}
                rows={4}
                style={{ resize: 'none', fontSize: '0.85rem' }}
              />

              {/* Ô Core Hypothesis */}
              <textarea
                className="form-input discovery-textarea"
                placeholder={row.placeholders.core_hypothesis}
                value={rowData.core_hypothesis || ''}
                onChange={(e) => handleFieldChange(row.key, 'core_hypothesis', e.target.value)}
                onBlur={handleBlur}
                disabled={!unlocked || isDisabled}
                rows={4}
                style={{ resize: 'none', fontSize: '0.85rem' }}
              />

              {/* Ô Approach Strategy */}
              <textarea
                className="form-input discovery-textarea"
                placeholder={row.placeholders.approach_strategy}
                value={rowData.approach_strategy || ''}
                onChange={(e) => handleFieldChange(row.key, 'approach_strategy', e.target.value)}
                onBlur={handleBlur}
                disabled={!unlocked || isDisabled}
                rows={4}
                style={{ resize: 'none', fontSize: '0.85rem' }}
              />
            </div>
          );
        })}

      </div>
    </section>
  );
}
