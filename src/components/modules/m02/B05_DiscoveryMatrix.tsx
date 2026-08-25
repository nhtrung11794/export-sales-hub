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

const ROW_CONFIG: { key: MatrixRowKey; label: string; desc: string, placeholders: [string, string, string] }[] = [
  { key: 'need', label: '1. Need (Nhu cầu thực)', desc: 'Khách nói gì/Hỏi gì? (VD: Yêu cầu hàng giá rẻ)', placeholders: ['VD: Yêu cầu hàng giá rẻ...', 'VD: Cần hàng cấp thấp để phủ thị trường ngách...', 'VD: Hỏi về kênh phân phối của họ...'] },
  { key: 'pain', label: '2. Pain (Nỗi đau)', desc: 'Họ phàn nàn điều gì? (VD: Hàng giao hay bị trễ)', placeholders: ['VD: Hàng giao hay bị trễ...', 'VD: Bị phạt hợp đồng với siêu thị...', 'VD: Pitching quy trình quản trị ETA...'] },
  { key: 'criteria', label: '3. Criteria (Tiêu chí)', desc: 'Đòi hỏi trên giấy tờ? (VD: Đòi chứng chỉ Organic)', placeholders: ['VD: Đòi chứng chỉ Organic...', 'VD: Sợ rủi ro bị thu hồi sản phẩm...', 'VD: Gửi test report lô gần nhất...'] },
  { key: 'risk', label: '4. Risk (Rủi ro)', desc: 'Sự e ngại thể hiện ra? (VD: Ngại mua từ VN)', placeholders: ['VD: Ngại mua từ VN...', 'VD: Sợ NCC lừa đảo thanh toán...', 'VD: Đề xuất thanh toán L/C...'] },
  { key: 'concern', label: '5. Concern (Mối bận tâm)', desc: 'Thái độ khi đàm phán? (VD: Đọc email nhưng im lặng)', placeholders: ['VD: Đọc email nhưng im lặng...', 'VD: Sếp chưa duyệt ngân sách...', 'VD: Cung cấp Market Insight để nuôi dưỡng...'] },
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
          <div>Dấu hiệu Bề mặt (Surface Signal)</div>
          <div>Giả thuyết Bản chất (Core Hypothesis)</div>
          <div>Chiến lược Đào sâu (Approach Strategy)</div>
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

              {/* Cột 1 */}
              <div>
                <textarea 
                  className="form-input" 
                  placeholder={unlocked ? row.placeholders[0] : ""}
                  value={rowData.hypothesis || ''}
                  onChange={(e) => handleFieldChange(row.key, 'hypothesis', e.target.value)}
                  onBlur={handleBlur}
                  disabled={!unlocked}
                  rows={4}
                  style={{ width: '100%', resize: 'none', background: unlocked ? 'rgba(255,255,255,0.02)' : 'transparent', border: 'none' }}
                />
              </div>

              {/* Cột 2 */}
              <div>
                <textarea 
                  className="form-input" 
                  placeholder={unlocked ? row.placeholders[1] : ""}
                  value={rowData.question || ''}
                  onChange={(e) => handleFieldChange(row.key, 'question', e.target.value)}
                  onBlur={handleBlur}
                  disabled={!unlocked}
                  rows={4}
                  style={{ width: '100%', resize: 'none', background: unlocked ? 'rgba(255,255,255,0.02)' : 'transparent', border: 'none' }}
                />
              </div>

              {/* Cột 3 */}
              <div>
                <textarea 
                  className="form-input" 
                  placeholder={unlocked ? row.placeholders[2] : ""}
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
