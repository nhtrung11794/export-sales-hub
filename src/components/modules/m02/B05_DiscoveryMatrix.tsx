'use client';

import React from 'react';
import { M02FormData } from './M02_CombinedForm';
import { FileText, Lock, Unlock, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

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
      surface_signal: 'VD: Doanh nghiệp đổi Giám đốc Thu mua, chuỗi cung ứng châu Á đứt gãy, mở rộng chuỗi cửa hàng...', 
      core_hypothesis: 'VD: Áp lực tìm nhà cung cấp dự phòng đạt chuẩn, phân tán rủi ro địa chính trị và tối ưu thuế...', 
      approach_strategy: 'VD: Gửi bản tin thị trường mùa vụ, báo cáo năng lực vùng trồng và chứng chỉ chất lượng quốc tế...' 
    } 
  },
  { 
    key: 'need', 
    label: '2. Need (Nhu cầu thực)', 
    placeholders: { 
      surface_signal: 'VD: Đăng RFQ tìm kiếm nguồn hàng organic, bao bì bền vững, xuất hiện tại các hội chợ quốc tế...', 
      core_hypothesis: 'VD: Cần sản phẩm phân khúc cao cấp để cải thiện biên lợi nhuận, đáp ứng thị hiếu người tiêu dùng trẻ...', 
      approach_strategy: 'VD: Gửi Case study tối ưu chi phí bao bì, gửi mẫu thử dòng sản phẩm cao cấp có chứng nhận xanh...' 
    } 
  },
  { 
    key: 'pain', 
    label: '3. Pain (Nỗi đau)', 
    placeholders: { 
      surface_signal: 'VD: Nhận review xấu về chất lượng sản phẩm, tỷ lệ giao trễ tăng, nhà cung cấp cũ tăng giá bất ngờ...', 
      core_hypothesis: 'VD: Nhà cung cấp cũ kiểm soát QA kém, giao trễ làm gián đoạn kế hoạch marketing và mất kệ siêu thị...', 
      approach_strategy: 'VD: Cam kết quy trình kiểm soát QA 3 lớp, bảo hiểm rủi ro giao hàng và phạt chậm trễ trong hợp đồng...' 
    } 
  },
  { 
    key: 'criteria', 
    label: '4. Criteria (Tiêu chí)', 
    placeholders: { 
      surface_signal: 'VD: Yêu cầu chứng nhận BRC/IFS/Halal/FDA, tiêu chuẩn bao bì tái chế và trách nhiệm xã hội SMETA...', 
      core_hypothesis: 'VD: Tuân thủ nghiêm ngặt luật nhập khẩu nước sở tại, vượt qua các đợt audit định kỳ của bên thứ ba...', 
      approach_strategy: 'VD: Gửi trọn bộ hồ sơ chứng chỉ quốc tế đã kiểm định, mời audit trực tuyến nhà xưởng 360 độ...' 
    } 
  },
  { 
    key: 'risk_concern', 
    label: '5. Risk (Rủi ro)', 
    placeholders: { 
      surface_signal: 'VD: Buyer ngập ngừng khi thảo luận thanh toán, yêu cầu điều khoản trả chậm D/A 60 ngày hoặc mẫu thử lớn...', 
      core_hypothesis: 'VD: Sợ nhà cung cấp mới không đảm bảo độ đồng đều chất lượng, rủi ro tồn kho và tranh chấp hải quan...', 
      approach_strategy: 'VD: Đề xuất thanh toán linh hoạt qua L/C at sight, gửi B/L và tham chiếu từ các khách hàng quốc tế tương đương...' 
    } 
  },
];

function countMeaningfulWords(text: string): number {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).filter(w => w.length >= 2);
  return words.length;
}

function MatrixCell({
  value,
  placeholder,
  onChange,
  onBlur,
  disabled
}: {
  value: string;
  placeholder: string;
  onChange: (val: string) => void;
  onBlur: () => void;
  disabled: boolean;
}) {
  const wordCount = countMeaningfulWords(value);
  const hasText = value.trim().length > 0;
  const isValid = wordCount >= 10;
  const isSpamWarning = hasText && !isValid;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <textarea
        className="form-input discovery-textarea"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        rows={4}
        style={{
          resize: 'vertical',
          fontSize: '0.82rem',
          lineHeight: '1.45',
          minHeight: '88px',
          borderColor: isSpamWarning ? 'var(--accent-danger)' : isValid ? '#10b981' : undefined,
          background: isSpamWarning ? 'rgba(239, 68, 68, 0.05)' : undefined
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', padding: '2px 2px 0 2px' }}>
        {isSpamWarning ? (
          <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={13} color="var(--accent-danger)" />
          </span>
        ) : isValid ? (
          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} color="#10b981" />
          </span>
        ) : (
          <span />
        )}

        <span style={{
          color: isValid ? '#10b981' : isSpamWarning ? 'var(--accent-danger)' : 'var(--text-muted)',
          fontWeight: 'bold',
          marginLeft: 'auto'
        }}>
          {wordCount}/10 từ
        </span>
      </div>
    </div>
  );
}

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
    
    // Kiểm tra hàng trước đó: Cần có ít nhất 2 ô đạt chuẩn >= 10 từ hoặc tổng số từ >= 20
    const prevRowKey = ROW_CONFIG[index - 1].key;
    const prevRowData = data.discovery_matrix[prevRowKey] || {};
    
    const countSignal = countMeaningfulWords(prevRowData.surface_signal || '');
    const countHypo = countMeaningfulWords(prevRowData.core_hypothesis || '');
    const countStrategy = countMeaningfulWords(prevRowData.approach_strategy || '');

    const validBoxes = [countSignal, countHypo, countStrategy].filter(c => c >= 10).length;
    const totalWords = countSignal + countHypo + countStrategy;

    return validBoxes >= 2 || totalWords >= 22;
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
        .discovery-row:focus-within {
          background: rgba(15, 23, 42, 0.8);
          border-color: var(--accent-primary);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
          transform: translateY(-2px);
          z-index: 10;
        }
        .discovery-textarea {
          background: rgba(0,0,0,0.2) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          color: var(--text-primary) !important;
          transition: all 0.2s ease;
        }
        .discovery-textarea::placeholder {
          color: rgba(255,255,255,0.35) !important;
        }
        .discovery-textarea:hover {
          border-color: rgba(255,255,255,0.2) !important;
          background: rgba(0,0,0,0.3) !important;
        }
        .discovery-textarea:focus {
          border-color: var(--accent-primary) !important;
          background: rgba(15, 23, 42, 0.6) !important;
          box-shadow: 0 0 0 1px var(--accent-primary);
        }
      `}</style>

      <h2 style={{ marginBottom: '8px', color: 'var(--accent-primary)', fontSize: '1.4rem', fontWeight: 'bold' }}>
        Bài 05: Discovery Insight Note (Ma Trận Khám Phá Nỗi Đau & Góc Tiếp Cận)
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Bóc tách từ tín hiệu bề mặt thành giả thuyết nỗi đau và chiến lược tiếp cận. Cơ chế <strong>Bộ lọc rác (Garbage Filter)</strong> yêu cầu tối thiểu 10 từ thực chất cho mỗi ô để mở khóa tầng tiếp theo.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Tiêu đề Cột */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 3fr 3fr 3fr', gap: '16px', padding: '0 16px', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', textAlign: 'center' }}>
          <div style={{ textAlign: 'left' }}>Lớp thông tin</div>
          <div>Tín hiệu Bề mặt<br/><span style={{fontSize: '0.78rem', fontWeight: 'normal', color: 'var(--text-secondary)'}}>(Market / Buyer Signal)</span></div>
          <div>Giả thuyết Cốt lõi<br/><span style={{fontSize: '0.78rem', fontWeight: 'normal', color: 'var(--text-secondary)'}}>(Core Hypothesis / Pain)</span></div>
          <div>Chiến lược Tiếp cận<br/><span style={{fontSize: '0.78rem', fontWeight: 'normal', color: 'var(--text-secondary)'}}>(Outreach & Value Hook)</span></div>
        </div>

        {/* Ma trận 5 hàng */}
        {ROW_CONFIG.map((row, index) => {
          const unlocked = isRowUnlocked(index);
          const rowData = data.discovery_matrix[row.key] || { surface_signal: '', core_hypothesis: '', approach_strategy: '' };
          
          const [mainLabel, subLabel] = row.label.split(' (');

          return (
            <div 
              key={row.key}
              className={`discovery-row ${!unlocked ? 'locked' : ''}`}
              style={{ display: 'grid', gridTemplateColumns: '1.8fr 3fr 3fr 3fr', gap: '16px', alignItems: 'start' }}
            >
              {/* Tiêu đề Hàng */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '8px' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {!unlocked ? (
                    <Lock size={15} color="var(--accent-danger)" />
                  ) : (
                    <Unlock size={15} color="var(--accent-primary)" />
                  )}
                  <span>{mainLabel}</span>
                </div>
                {subLabel && (
                  <div style={{ paddingLeft: '21px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    ({subLabel}
                  </div>
                )}
                {!unlocked && (
                  <div style={{ paddingLeft: '21px', fontSize: '0.72rem', color: '#fca5a5' }}>
                    🔒 Hoàn thành tầng trên để mở
                  </div>
                )}
              </div>

              {/* Ô 1: Surface Signal */}
              <MatrixCell
                value={rowData.surface_signal || ''}
                placeholder={row.placeholders.surface_signal}
                onChange={(val) => handleFieldChange(row.key, 'surface_signal', val)}
                onBlur={handleBlur}
                disabled={!unlocked || isDisabled}
              />

              {/* Ô 2: Core Hypothesis */}
              <MatrixCell
                value={rowData.core_hypothesis || ''}
                placeholder={row.placeholders.core_hypothesis}
                onChange={(val) => handleFieldChange(row.key, 'core_hypothesis', val)}
                onBlur={handleBlur}
                disabled={!unlocked || isDisabled}
              />

              {/* Ô 3: Approach Strategy */}
              <MatrixCell
                value={rowData.approach_strategy || ''}
                placeholder={row.placeholders.approach_strategy}
                onChange={(val) => handleFieldChange(row.key, 'approach_strategy', val)}
                onBlur={handleBlur}
                disabled={!unlocked || isDisabled}
              />
            </div>
          );
        })}

      </div>
    </section>
  );
}

