import React, { useState } from 'react';
import { M02FormData } from './M02_CombinedForm';
import { Target, Search, BarChart3, Globe, Copy, Check } from 'lucide-react';

const PROMPT_SCAN = `BỐI CẢNH:
Sản phẩm: [ĐIỀN DỮ LIỆU TẠI ĐÂY]
Thị trường mục tiêu: [ĐIỀN DỮ LIỆU TẠI ĐÂY]
Năng lực lõi của doanh nghiệp: [ĐIỀN DỮ LIỆU TẠI ĐÂY]

CHỈ THỊ HỆ THỐNG:
Đóng vai chuyên gia Market Intelligence B2B. Thực hiện quét 5 lớp thị trường xuất khẩu để hỗ trợ ra quyết định thương mại. Tuân thủ tuyệt đối cấu trúc suy luận: [Sự kiện/Dữ liệu thực tế] -> [Phân tích Tác động] -> [Hành động cụ thể].

RÀNG BUỘC KIỂM SOÁT:
Lược bỏ hoàn toàn định nghĩa học thuật. Trình bày trực tiếp vào vấn đề.
Giới hạn cấu trúc: Tối đa 3 gạch đầu dòng cho mỗi ô dữ liệu.
Bắt buộc tự động gắn cờ [Cần kiểm chứng] đối với bất kỳ số liệu/dữ kiện nào mô hình tự nội suy mà không có độ xác thực 100%.
Cột "Đề xuất hành động" phải là chỉ dẫn thực thi (Actionable) dành cho đội Sales.

ĐỊNH DẠNG ĐẦU RA:
Tạo bảng gồm 4 cột: Lớp thị trường | Sự kiện/Dữ liệu thực tế | Phân tích Tác động | Đề xuất hành động.
Triển khai phân tích bắt buộc qua 5 lớp:
- Cầu (Demand): Tiêu chí ưu tiên mua và sự dịch chuyển nhu cầu.
- Cung & Đối thủ: Điểm mạnh của đối thủ và khoảng trống thị trường chưa được phục vụ tốt.
- Rào cản (Barriers): Tiêu chuẩn/compliance bắt buộc và rủi ro giao dịch.
- Route-to-market: Kênh phân phối/loại buyer phù hợp nhất.
- Độ Fit (Company Fit): Đánh giá mức độ khớp.`;

const PROMPT_LENS = `BỐI CẢNH:
Sản phẩm: [ĐIỀN DỮ LIỆU TẠI ĐÂY]
Thị trường mục tiêu: [ĐIỀN DỮ LIỆU TẠI ĐÂY]
Buyer Channel (Loại khách hàng): [ĐIỀN DỮ LIỆU TẠI ĐÂY]
Đặc tính Sản phẩm/Nhà máy (Features): [ĐIỀN DỮ LIỆU TẠI ĐÂY]

CHỈ THỊ HỆ THỐNG:
Đóng vai chuyên gia Market Intelligence B2B. Đặt lăng kính nhà nhập khẩu (Buyer Lens) xuyên suốt 5 lớp thị trường. Chuyển hóa Đặc tính (Features) thành Giá trị thương mại (Buyer-value) tập trung vào việc: giảm rủi ro, hỗ trợ ra quyết định và giải quyết nỗi đau từ nhà cung cấp cũ.

RÀNG BUỘC KIỂM SOÁT:
Phân tích hoàn toàn từ góc nhìn người mua, không viết theo logic "công ty tôi có gì".
Không liệt kê tính năng độc lập; bắt buộc chuyển hóa thành Lợi ích giúp buyer giảm rủi ro.
Tối đa 2 gạch đầu dòng trọng tâm cho mỗi ô dữ liệu.
Cột "Đề xuất thông điệp/USP" bắt buộc là kịch bản tiếp cận cụ thể.

ĐỊNH DẠNG ĐẦU RA:
Tạo bảng 4 cột: Lớp thị trường | Góc nhìn Buyer (Dữ liệu/Nỗi đau) | Tác động quyết định mua | Đề xuất thông điệp/USP.
Triển khai qua 5 lớp: Nhu cầu, Cung & Đối thủ, Rào cản, Route-to-market, Độ Fit (Chuyển đổi USP).`;

const PROMPT_PESTEL = `BỐI CẢNH:
Sản phẩm: [ĐIỀN DỮ LIỆU TẠI ĐÂY]
Thị trường: [ĐIỀN DỮ LIỆU TẠI ĐÂY]

CHỈ THỊ HỆ THỐNG:
Đóng vai chuyên gia Market Intelligence B2B. Thực hiện phân tích PESTEL theo lăng kính Sales xuất khẩu. Chỉ trích xuất các dữ kiện tác động TRỰC TIẾP đến 5 khía cạnh của khách hàng: Nhu cầu, Tiêu chí mua, Rủi ro, Compliance, và Nhận thức giá trị.

RÀNG BUỘC KIỂM SOÁT:
Bỏ qua phân tích vĩ mô không liên quan tới chuỗi cung ứng.
Chọn lọc tối đa 2 sự kiện trọng yếu nhất cho mỗi yếu tố.
Cột "Hành động ứng phó" phải chỉ định rõ Sales cần thay đổi gì.

ĐỊNH DẠNG ĐẦU RA:
Bảng PESTEL Sales-centric:
Cột 1: Yếu tố (P/E/S/T/E/L).
Cột 2: Sự kiện/Dữ liệu thực tế.
Cột 3: Phân tích Tác động (Chỉ rõ: Thị trường mở ra hay siết lại).
Cột 4: Đề xuất hành động ứng phó.
Kết luận: 1 câu định hướng kèm 1 hành động trọng tâm.`;

function PromptPanel({ title, promptText }: { title: string; promptText: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ marginTop: '20px', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '100%', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>✨ {title}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--border-color)', position: 'relative' }}>
          <button 
            onClick={handleCopy}
            style={{ position: 'absolute', top: '12px', right: '12px', padding: '6px 12px', background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
          >
            {copied ? <><Check size={14} /> Đã Copy</> : <><Copy size={14} /> Copy</>}
          </button>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'inherit', lineHeight: '1.6', margin: 0, paddingRight: '90px' }}>
            {promptText}
          </pre>
        </div>
      )}
    </div>
  );
}

interface B03Props {
  data: M02FormData;
  setData: React.Dispatch<React.SetStateAction<M02FormData>>;
  handleBlur: () => void;
  isDisabled: boolean;
}

export default function B03_MarketIntelligence({ data, setData, handleBlur, isDisabled }: B03Props) {
  const [activeTab, setActiveTab] = useState<'scan' | 'lens' | 'pestel'>('scan');
  
  const [isOtherMarket, setIsOtherMarket] = useState(() => {
    const standardMarkets = ['US', 'EU', 'JP', 'KR', 'CN', 'ASEAN', ''];
    return data.target_market ? !standardMarkets.includes(data.target_market) : false;
  });

  const handleFieldChange = (field: keyof M02FormData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const isFormComplete = data.target_market && data.route_to_market && data.strategic_reason;

  return (
    <section className="glass-panel" style={{ padding: '32px' }}>
      <h2 style={{ marginBottom: '8px', color: 'var(--accent-primary)', fontSize: '1.4rem', fontWeight: 'bold' }}>
        Bài 03: Market Intelligence cho Sales xuất khẩu
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Xác định bối cảnh thị trường và chốt phương án tiếp cận. Bạn bắt buộc phải hoàn thành <strong>Quyết định chiến lược</strong> để mở khóa bài tiếp theo.
      </p>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* CỘT TRÁI: TABBED DASHBOARD (65%) */}
        <div style={{ flex: '0 0 62%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Tabs Navigation */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
            <button 
              onClick={() => setActiveTab('scan')}
              className={activeTab === 'scan' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.875rem', padding: '6px 12px', display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              <Search size={16} /> Scan 5 Lớp
            </button>
            <button 
              onClick={() => setActiveTab('lens')}
              className={activeTab === 'lens' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.875rem', padding: '6px 12px', display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              <Target size={16} /> Buyer Lens
            </button>
            <button 
              onClick={() => setActiveTab('pestel')}
              className={activeTab === 'pestel' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.875rem', padding: '6px 12px', display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              <BarChart3 size={16} /> Phân tích PESTEL
            </button>
          </div>

          {/* Tabs Content */}
          <div style={{ 
            background: 'rgba(15, 23, 42, 0.4)', 
            border: '1px solid rgba(255,255,255,0.05)', 
            padding: '24px', 
            borderRadius: '12px',
            minHeight: '300px'
          }}>
            {activeTab === 'scan' && (
              <div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Search size={18} color="var(--accent-primary)" /> Hướng dẫn: Quét 5 lớp thị trường
                </h4>
                <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.8', paddingLeft: '20px' }}>
                  <li><strong>Lớp 1 (Cung):</strong> Tổng quan nguồn cung, các quốc gia/khu vực xuất khẩu chính.</li>
                  <li><strong>Lớp 2 (Cầu):</strong> Nhu cầu tiêu thụ, quy mô và xu hướng tăng/giảm của thị trường.</li>
                  <li><strong>Lớp 3 (Giá):</strong> Mức giá tham chiếu, biến động giá nguyên vật liệu và thành phẩm.</li>
                  <li><strong>Lớp 4 (Đối thủ):</strong> Đối thủ cạnh tranh trực tiếp, năng lực và lợi thế của họ.</li>
                  <li><strong>Lớp 5 (Pháp lý):</strong> Thuế, luật lệ, rào cản kỹ thuật, chính sách xuất nhập khẩu.</li>
                </ul>
                <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  * Lưu ý: Bạn có thể sử dụng Trợ lý AI (Gemini Spark) ở góc dưới màn hình để cào dữ liệu nhanh cho thị trường bạn quan tâm.
                </p>
                <PromptPanel title="Prompt Mẫu: Quét 5 lớp thị trường" promptText={PROMPT_SCAN} />
              </div>
            )}

            {activeTab === 'lens' && (
              <div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={18} color="var(--accent-warning)" /> Phân tích qua lăng kính Buyer (Buyer Lens)
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '12px' }}>
                  Không chỉ nhìn từ góc độ người bán, hãy đặt mình vào vị trí của Buyer:
                </p>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid var(--accent-warning)' }}>
                  <p style={{ fontSize: '0.9rem', color: '#e2e8f0', marginBottom: '8px' }}>- <strong>Tâm lý cốt lõi:</strong> Họ đang gặp áp lực gì lớn nhất tại thị trường nội địa (Doanh thu, cạnh tranh, chi phí)?</p>
                  <p style={{ fontSize: '0.9rem', color: '#e2e8f0', marginBottom: '8px' }}>- <strong>Ưu tiên lựa chọn:</strong> Tiêu chí hàng đầu khi chọn nhà cung cấp mới là gì (Chất lượng, giá, tốc độ, tính ổn định)?</p>
                  <p style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>- <strong>Rủi ro đứt gãy:</strong> Nguồn cung hiện tại của họ đang vướng mắc điểm yếu chí mạng nào mà bạn có thể lấp đầy?</p>
                </div>
                <PromptPanel title="Prompt Mẫu: Phân tích Buyer Lens" promptText={PROMPT_LENS} />
              </div>
            )}

            {activeTab === 'pestel' && (
              <div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={18} color="var(--accent-success)" /> Mô hình PESTEL
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.875rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '6px' }}><strong>P (Politics):</strong> Ổn định chính trị, chiến tranh thương mại.</div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '6px' }}><strong>E (Economics):</strong> Lạm phát, tỷ giá hối đoái.</div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '6px' }}><strong>S (Social):</strong> Văn hóa, xu hướng tiêu dùng.</div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '6px' }}><strong>T (Technology):</strong> Chuyển đổi số, logistics mới.</div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '6px' }}><strong>E (Environment):</strong> Quy định xanh, tiêu chuẩn carbon.</div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '6px' }}><strong>L (Legal):</strong> Rào cản kỹ thuật, chống bán phá giá.</div>
                </div>
                <PromptPanel title="Prompt Mẫu: Phân tích PESTEL" promptText={PROMPT_PESTEL} />
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: FORM QUYẾT ĐỊNH CHIẾN LƯỢC (STICKY) (35%) */}
        <div style={{ 
          flex: '1', 
          position: 'sticky', 
          top: '24px',
          background: 'rgba(30, 41, 59, 0.7)',
          border: isFormComplete ? '1px solid var(--accent-success)' : '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={20} color={isFormComplete ? "var(--accent-success)" : "var(--accent-primary)"} /> 
            Quyết định Chiến lược
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                1. Chọn thị trường mục tiêu <span style={{color: 'var(--accent-danger)'}}>*</span>
              </label>
              <select 
                className="form-input"
                value={isOtherMarket ? 'OTHER' : (data.target_market || '')}
                onChange={(e) => {
                  if (e.target.value === 'OTHER') {
                    setIsOtherMarket(true);
                    handleFieldChange('target_market', '');
                  } else {
                    setIsOtherMarket(false);
                    handleFieldChange('target_market', e.target.value);
                  }
                }}
                onBlur={handleBlur}
                disabled={isDisabled}
                style={{ width: '100%', padding: '10px', marginBottom: isOtherMarket ? '8px' : '0' }}
              >
                <option value="" disabled>-- Lựa chọn --</option>
                <option value="US">Mỹ (US)</option>
                <option value="EU">Châu Âu (EU)</option>
                <option value="JP">Nhật Bản (JP)</option>
                <option value="KR">Hàn Quốc (KR)</option>
                <option value="CN">Trung Quốc (CN)</option>
                <option value="ASEAN">Đông Nam Á (ASEAN)</option>
                <option value="OTHER">Khác (Tự định nghĩa)</option>
              </select>

              {isOtherMarket && (
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Nhập tên thị trường mục tiêu..."
                  value={data.target_market || ''}
                  onChange={(e) => handleFieldChange('target_market', e.target.value)}
                  onBlur={handleBlur}
                  disabled={isDisabled}
                  style={{ width: '100%', padding: '10px' }}
                />
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                2. Kênh Route-to-market <span style={{color: 'var(--accent-danger)'}}>*</span>
              </label>
              <input 
                type="text"
                className="form-input"
                placeholder="VD: Bán qua Distributor, Bán trực tiếp B2B..."
                value={data.route_to_market || ''}
                onChange={(e) => handleFieldChange('route_to_market', e.target.value)}
                onBlur={handleBlur}
                disabled={isDisabled}
                style={{ width: '100%', padding: '10px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                3. Lý do lựa chọn cốt lõi <span style={{color: 'var(--accent-danger)'}}>*</span>
              </label>
              <textarea 
                className="form-input"
                placeholder="Phân tích lợi thế, độ khó, và cơ hội..."
                value={data.strategic_reason || ''}
                onChange={(e) => handleFieldChange('strategic_reason', e.target.value)}
                onBlur={handleBlur}
                disabled={isDisabled}
                rows={5}
                style={{ width: '100%', padding: '10px', resize: 'vertical' }}
              />
            </div>

            {isFormComplete ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center', fontWeight: 'bold' }}>
                ✓ Đã hoàn thành (Bài 04 được mở khóa)
              </div>
            ) : (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center' }}>
                ⚠️ Vui lòng điền đủ 3 trường để mở khóa
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
