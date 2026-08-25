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
type MatrixColKey = 'surface_signal' | 'core_hypothesis' | 'approach_strategy';

const ROW_CONFIG: { 
  key: MatrixRowKey; 
  label: string; 
  placeholders: { surface_signal: string; core_hypothesis: string; approach_strategy: string } 
}[] = [
  { 
    key: 'need', 
    label: '1. Need (Nhu cầu thực)', 
    placeholders: { 
      surface_signal: 'Khách nói gì/Hỏi gì?\n(VD: Yêu cầu hàng giá rẻ)', 
      core_hypothesis: 'Thực chất họ cần gì?\n(VD: Cần hàng cấp thấp để phủ thị trường ngách)', 
      approach_strategy: 'Cách đặt câu hỏi/Góc tiếp cận?\n(VD: Hỏi về kênh phân phối của họ)' 
    } 
  },
  { 
    key: 'pain', 
    label: '2. Pain (Nỗi đau)', 
    placeholders: { 
      surface_signal: 'Họ phàn nàn điều gì?\n(VD: Hàng giao hay bị trễ)', 
      core_hypothesis: 'Hậu quả thực sự là gì?\n(VD: Bị phạt hợp đồng với siêu thị)', 
      approach_strategy: 'Giải pháp mồi (Hook)?\n(VD: Pitching quy trình quản trị ETA)' 
    } 
  },
  { 
    key: 'criteria', 
    label: '3. Criteria (Tiêu chí)', 
    placeholders: { 
      surface_signal: 'Đòi hỏi trên giấy tờ?\n(VD: Đòi chứng chỉ Organic)', 
      core_hypothesis: 'Ưu tiên ẩn đằng sau?\n(VD: Sợ rủi ro bị thu hồi sản phẩm)', 
      approach_strategy: 'Tài liệu chứng minh (Proof)?\n(VD: Gửi test report lô gần nhất)' 
    } 
  },
  { 
    key: 'risk', 
    label: '4. Risk (Rủi ro)', 
    placeholders: { 
      surface_signal: 'Sự e ngại thể hiện ra?\n(VD: Ngại mua từ VN)', 
      core_hypothesis: 'Rủi ro họ gánh chịu?\n(VD: Sợ NCC lừa đảo thanh toán)', 
      approach_strategy: 'Chiến lược giảm rủi ro?\n(VD: Đề xuất thanh toán L/C)' 
    } 
  },
  { 
    key: 'concern', 
    label: '5. Concern (Mối bận tâm)', 
    placeholders: { 
      surface_signal: 'Thái độ khi đàm phán?\n(VD: Đọc email nhưng im lặng)', 
      core_hypothesis: 'Rào cản nội bộ của họ?\n(VD: Sếp chưa duyệt ngân sách)', 
      approach_strategy: 'Kịch bản Follow-up?\n(VD: Cung cấp Market Insight để nuôi dưỡng)' 
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
          <div>Dấu hiệu Bề mặt<br/><span style={{fontSize: '0.75rem', fontWeight: 'normal'}}>(Surface Signal)</span></div>
          <div>Giả thuyết Bản chất<br/><span style={{fontSize: '0.75rem', fontWeight: 'normal'}}>(Core Hypothesis)</span></div>
          <div>Chiến lược Tiếp cận<br/><span style={{fontSize: '0.75rem', fontWeight: 'normal'}}>(Approach Strategy)</span></div>
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
                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {!unlocked && <Lock size={14} color="var(--text-muted)" />}
                  {unlocked && <Unlock size={14} color="var(--accent-primary)" />}
                  {row.label}
                </div>
              </div>

              {/* Ô Surface Signal */}
              <textarea
                className="form-input"
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
                className="form-input"
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
                className="form-input"
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
