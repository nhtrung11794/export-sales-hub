import React from 'react';
import { M02FormData } from './M02_CombinedForm';
import { FileText, Lock, Unlock } from 'lucide-react';

interface B05Props {
  data: M02FormData;
  setData: React.Dispatch<React.SetStateAction<M02FormData>>;
  handleBlur: () => void;
  isDisabled: boolean;
}

type MatrixRowKey = 'need' | 'pain' | 'criteria' | 'risk' | 'concern';
type MatrixColKey = 'hypothesis' | 'question' | 'insight';

const ROW_CONFIG: { key: MatrixRowKey; label: string; desc: string }[] = [
  { key: 'need', label: '1. Yêu cầu bề mặt (Need)', desc: 'Khách hàng đang hỏi mua cái gì (Sản phẩm/Dịch vụ)?' },
  { key: 'pain', label: '2. Nỗi đau cốt lõi (Pain)', desc: 'Tại sao họ cần nó NGAY LÚC NÀY? Vấn đề đằng sau là gì?' },
  { key: 'criteria', label: '3. Tiêu chí chọn (Criteria)', desc: 'Họ sẽ đánh giá các nhà cung cấp dựa trên các tiêu chuẩn nào?' },
  { key: 'risk', label: '4. Rủi ro e ngại (Risk)', desc: 'Điều gì khiến họ sợ hãi, không dám chốt (Tiền bạc, uy tín, vận hành)?' },
  { key: 'concern', label: '5. Rào cản nội bộ (Concern)', desc: 'Sếp của họ hoặc phòng ban khác có thể cản trở quyết định không?' },
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
    const prevRowData = data.discovery_matrix[prevRowKey];
    return (prevRowData.hypothesis.trim().length > 0 || prevRowData.insight.trim().length > 0);
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
      <h2 style={{ marginBottom: '8px', color: 'var(--accent-primary)', fontSize: '1.4rem', fontWeight: 'bold' }}>
        Bài 05: Discovery Insight Note (Góc tiếp cận)
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Bóc tách từ nhu cầu bề mặt thành vấn đề cốt lõi. Hãy hoàn thành các hàng theo thứ tự từ trên xuống dưới. Dữ liệu này sẽ làm Ngân hàng Góc tiếp cận cho các module sau.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Tiêu đề Cột */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 3fr 3fr', gap: '16px', padding: '0 16px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
          <div>Tầng lớp thông tin</div>
          <div>Giả thuyết (Hypothesis)</div>
          <div>Câu hỏi kiểm chứng</div>
          <div>Insight thu được (Actual)</div>
        </div>

        {/* Ma trận */}
        {ROW_CONFIG.map((row, index) => {
          const unlocked = isRowUnlocked(index);
          const rowData = data.discovery_matrix[row.key];

          return (
            <div 
              key={row.key}
              style={{ 
                display: 'grid', gridTemplateColumns: '2fr 3fr 3fr 3fr', gap: '16px', 
                background: unlocked ? 'rgba(15, 23, 42, 0.4)' : 'rgba(0, 0, 0, 0.2)',
                border: unlocked ? '1px solid rgba(255,255,255,0.05)' : '1px dashed rgba(255,255,255,0.05)',
                padding: '16px', 
                borderRadius: '12px',
                opacity: unlocked ? 1 : 0.4,
                transition: 'all 0.3s ease'
              }}
            >
              {/* Tiêu đề Hàng */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: unlocked ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.95rem' }}>
                  {unlocked ? <Unlock size={14} color="var(--accent-success)"/> : <Lock size={14} />} {row.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
                  {row.desc}
                </div>
              </div>

              {/* Ô Giả thuyết */}
              <div>
                <textarea 
                  className="form-input" 
                  placeholder={unlocked ? "Ghi giả thuyết của bạn..." : ""}
                  value={rowData.hypothesis || ''}
                  onChange={(e) => handleFieldChange(row.key, 'hypothesis', e.target.value)}
                  onBlur={handleBlur}
                  disabled={!unlocked}
                  rows={4}
                  style={{ width: '100%', resize: 'none', background: unlocked ? 'rgba(255,255,255,0.02)' : 'transparent', border: 'none' }}
                />
              </div>

              {/* Ô Câu hỏi */}
              <div>
                <textarea 
                  className="form-input" 
                  placeholder={unlocked ? "Câu hỏi để kiểm chứng giả thuyết..." : ""}
                  value={rowData.question || ''}
                  onChange={(e) => handleFieldChange(row.key, 'question', e.target.value)}
                  onBlur={handleBlur}
                  disabled={!unlocked}
                  rows={4}
                  style={{ width: '100%', resize: 'none', background: unlocked ? 'rgba(255,255,255,0.02)' : 'transparent', border: 'none' }}
                />
              </div>

              {/* Ô Insight */}
              <div>
                <textarea 
                  className="form-input" 
                  placeholder={unlocked ? "Câu trả lời thực tế thu thập được..." : ""}
                  value={rowData.insight || ''}
                  onChange={(e) => handleFieldChange(row.key, 'insight', e.target.value)}
                  onBlur={handleBlur}
                  disabled={!unlocked}
                  rows={4}
                  style={{ width: '100%', resize: 'none', background: unlocked ? 'rgba(59, 130, 246, 0.05)' : 'transparent', border: unlocked ? '1px solid rgba(59, 130, 246, 0.2)' : 'none' }}
                />
              </div>
            </div>
          );
        })}

      </div>
    </section>
  );
}
