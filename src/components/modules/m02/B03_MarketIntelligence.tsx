import React, { useState } from 'react';
import { M02FormData } from './M02_CombinedForm';
import { Target, Search, BarChart3, Globe, Copy, Check, ChevronDown, ChevronUp, Link2, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

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

const SCAN_LAYERS = [
  { id: 'layer1', label: '1. Cung (Supply)', desc: 'Nguồn cung, các nước xuất khẩu chính và đối thủ cạnh tranh lớn.' },
  { id: 'layer2', label: '2. Cầu (Demand)', desc: 'Quy mô thị trường, xu hướng tăng trưởng và thói quen tiêu dùng.' },
  { id: 'layer3', label: '3. Giá & Chi phí', desc: 'Mức giá tham chiếu CIF/FOB, biến động nguyên vật liệu và cước vận tải.' },
  { id: 'layer4', label: '4. Đối thủ (Competitors)', desc: 'Thế mạnh của đối thủ bản địa & khoảng trống phân khúc chưa đáp ứng.' },
  { id: 'layer5', label: '5. Pháp lý & Rào cản', desc: 'Thuế quan, chứng chỉ BRC/IFS/FDA, rào cản kỹ thuật và kiểm dịch.' },
];

const LENS_LAYERS = [
  { id: 'lens1', label: '1. Cung (Góc nhìn Buyer)', desc: 'Nỗi đau nguồn cung từ NCC cũ: Trễ lead time, chất lượng không đều, rủi ro phụ thuộc đơn nguồn.' },
  { id: 'lens2', label: '2. Cầu (Góc nhìn Buyer)', desc: 'Áp lực thị hiếu & nhu cầu người tiêu dùng nội địa mà Buyer phải phục vụ để giữ thị phần.' },
  { id: 'lens3', label: '3. Giá & Chi phí (Góc nhìn Buyer)', desc: 'Áp lực tối ưu TCO (Tổng chi phí sở hữu), bảo vệ biên lợi nhuận và hạn mức ngân sách.' },
  { id: 'lens4', label: '4. Đối thủ (Góc nhìn Buyer)', desc: 'Áp lực cạnh tranh của Buyer với các đối thủ bản địa cùng phân khúc trên kệ hàng.' },
  { id: 'lens5', label: '5. Pháp lý & Rào cản (Góc nhìn Buyer)', desc: 'Rủi ro pháp lý, trách nhiệm kiểm định hải quan, chứng chỉ an toàn và chuẩn xanh ESG.' },
];

const PESTEL_LAYERS = [
  { id: 'P', label: 'P (Chính trị)', desc: 'Ổn định thể chế, quan hệ ngoại giao song phương, chính sách bảo hộ và trợ cấp.' },
  { id: 'E', label: 'E (Kinh tế)', desc: 'Lạm phát, biến động tỷ giá hối đoái USD/EUR, chi phí cước biển và sức mua.' },
  { id: 'S', label: 'S (Xã hội)', desc: 'Thị hiếu người tiêu dùng, tiêu chuẩn văn hóa và thói quen mua sắm B2B.' },
  { id: 'T', label: 'T (Công nghệ)', desc: 'Tự động hóa sản xuất, công nghệ đóng gói bảo quản, truy xuất nguồn gốc.' },
  { id: 'ENV', label: 'E (Môi trường)', desc: 'Quy định xanh, tiêu chuẩn carbon (CBAM), bao bì tự hủy và chứng nhận ESG.' },
  { id: 'L', label: 'L (Pháp lý)', desc: 'Luật an toàn thực phẩm, thuế chống bán phá giá, chứng chỉ FDA/BRC/ISO.' },
];

function PromptPanel({ title, promptText }: { title: string; promptText: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ marginTop: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '100%', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.82rem' }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={14} /> {title}</span>
        <span>{isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
      </button>
      {isOpen && (
        <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--border-color)', position: 'relative' }}>
          <button 
            type="button"
            onClick={handleCopy}
            style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 8px', background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem' }}
          >
            {copied ? <><Check size={12} /> Đã Copy</> : <><Copy size={12} /> Copy Prompt</>}
          </button>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'inherit', lineHeight: '1.45', margin: 0, paddingRight: '80px' }}>
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
  const [activeScanLayer, setActiveScanLayer] = useState<string>('layer1');
  const [activeLensLayer, setActiveLensLayer] = useState<string>('lens1');
  const [activePestelLayer, setActivePestelLayer] = useState<string>('P');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isLensGuideOpen, setIsLensGuideOpen] = useState(false);
  const [isPestelGuideOpen, setIsPestelGuideOpen] = useState(false);
  
  const [isOtherMarket, setIsOtherMarket] = useState(() => {
    const standardMarkets = ['US', 'EU', 'JP', 'KR', 'CN', 'ASEAN', ''];
    return data.target_market ? !standardMarkets.includes(data.target_market) : false;
  });

  const scanNotes = data.b03_scan_notes || {
    layer1: { ai_output: '', fact_check_url: '' },
    layer2: { ai_output: '', fact_check_url: '' },
    layer3: { ai_output: '', fact_check_url: '' },
    layer4: { ai_output: '', fact_check_url: '' },
    layer5: { ai_output: '', fact_check_url: '' },
  };

  const lensNotes = data.b03_lens_notes || {
    lens1: { ai_output: '', action_usp: '' },
    lens2: { ai_output: '', action_usp: '' },
    lens3: { ai_output: '', action_usp: '' },
    lens4: { ai_output: '', action_usp: '' },
    lens5: { ai_output: '', action_usp: '' },
  };

  const pestelNotes = data.b03_pestel_notes || {
    P: { ai_output: '', impact_action: '' },
    E: { ai_output: '', impact_action: '' },
    S: { ai_output: '', impact_action: '' },
    T: { ai_output: '', impact_action: '' },
    ENV: { ai_output: '', impact_action: '' },
    L: { ai_output: '', impact_action: '' },
  };

  const handleFieldChange = (field: keyof M02FormData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleScanNoteChange = (layerId: string, field: 'ai_output' | 'fact_check_url', value: string) => {
    if (isDisabled) return;
    setData(prev => ({
      ...prev,
      b03_scan_notes: {
        ...(prev.b03_scan_notes || {}),
        [layerId]: {
          ...(prev.b03_scan_notes?.[layerId] || { ai_output: '', fact_check_url: '' }),
          [field]: value
        }
      }
    }));
  };

  const handleLensNoteChange = (layerId: string, field: 'ai_output' | 'action_usp', value: string) => {
    if (isDisabled) return;
    setData(prev => ({
      ...prev,
      b03_lens_notes: {
        ...(prev.b03_lens_notes || {}),
        [layerId]: {
          ...(prev.b03_lens_notes?.[layerId] || { ai_output: '', action_usp: '' }),
          [field]: value
        }
      }
    }));
  };

  const handlePestelNoteChange = (layerId: string, field: 'ai_output' | 'impact_action', value: string) => {
    if (isDisabled) return;
    setData(prev => ({
      ...prev,
      b03_pestel_notes: {
        ...(prev.b03_pestel_notes || {}),
        [layerId]: {
          ...(prev.b03_pestel_notes?.[layerId] || { ai_output: '', impact_action: '' }),
          [field]: value
        }
      }
    }));
  };

  // Check if at least one fact-check URL is entered
  const hasFactCheck = Object.values(scanNotes).some(item => (item?.fact_check_url || '').trim().length > 0) || (data.b03_fact_check_url || '').trim().length > 0;
  const isFormComplete = Boolean(data.target_market && data.route_to_market && data.strategic_reason && hasFactCheck);

  return (
    <section className="glass-panel" style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '6px', color: 'var(--accent-primary)', fontSize: '1.25rem', fontWeight: 'bold' }}>
        Bài 03: Market Intelligence cho Sales xuất khẩu
      </h2>
      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        Nghiên cứu thị trường 5 lớp với AI, lăng kính Buyer và PESTEL. Bắt buộc hoàn thành <strong>Quyết định chiến lược</strong> và có <strong>Link kiểm chứng</strong> để mở khóa bài tiếp theo.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* BƯỚC 1: TABBED DASHBOARD NGHIÊN CỨU (100% CHIỀU RỘNG) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
              BƯỚC 1: THU THẬP DỮ LIỆU & LẬP LẬN ĐA TẦNG
            </span>
          </div>

          {/* Tabs Navigation */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
            <button 
              type="button"
              onClick={() => setActiveTab('scan')}
              className={activeTab === 'scan' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.82rem', padding: '6px 14px', display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              <Search size={15} /> Scan 5 Lớp & Fact-Check
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('lens')}
              className={activeTab === 'lens' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.82rem', padding: '6px 14px', display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              <Target size={15} /> Buyer Lens
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('pestel')}
              className={activeTab === 'pestel' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.82rem', padding: '6px 14px', display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              <BarChart3 size={15} /> Phân tích PESTEL
            </button>
          </div>

          {/* Tabs Content */}
          <div style={{ 
            background: 'rgba(15, 23, 42, 0.4)', 
            border: '1px solid rgba(255,255,255,0.05)', 
            padding: '18px', 
            borderRadius: '12px',
            minHeight: '260px'
          }}>
            {/* TAB 1: SCAN 5 LỚP */}
            {activeTab === 'scan' && (
              <div>
                {/* ACCORDION HƯỚNG DẪN THU GỌN */}
                <div style={{ border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.05)', borderRadius: '8px', marginBottom: '14px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setIsGuideOpen(!isGuideOpen)}
                    style={{ width: '100%', padding: '9px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 0, color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Search size={14} /> ℹ️ Xem Hướng dẫn Phương pháp luận Quét 5 Lớp & Prompt AI
                    </span>
                    {isGuideOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>

                  {isGuideOpen && (
                    <div style={{ padding: '12px', borderTop: '1px solid rgba(59,130,246,0.15)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      <ul style={{ paddingLeft: '16px', margin: 0 }}>
                        <li><strong>Lớp 1 (Cung):</strong> Tổng quan nguồn cung, đối thủ cạnh tranh từ các nước lớn.</li>
                        <li><strong>Lớp 2 (Cầu):</strong> Nhu cầu tiêu thụ, dung lượng thị trường và tốc độ tăng trưởng.</li>
                        <li><strong>Lớp 3 (Giá):</strong> Mức giá tham chiếu, biến động giá nguyên vật liệu và cước biển.</li>
                        <li><strong>Lớp 4 (Đối thủ):</strong> Đối thủ cạnh tranh trực tiếp, khoảng trống thị trường.</li>
                        <li><strong>Lớp 5 (Pháp lý):</strong> Thuế quan FTA, chứng chỉ (FDA/BRC/ISO), rào cản kỹ thuật.</li>
                      </ul>
                      <PromptPanel title="Prompt Mẫu: Quét 5 Lớp Thị Trường" promptText={PROMPT_SCAN} />
                    </div>
                  )}
                </div>

                {/* MA TRẬN 5 HÀNG TOÀN CẢNH (ALL-LAYERS MATRIX) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Header Cột */}
                  <div style={{ display: 'grid', gridTemplateColumns: '170px 1.6fr 1.3fr', gap: '12px', padding: '0 8px', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 'bold' }}>
                    <div>Lớp Phân Tích (5 Layers)</div>
                    <div>Dữ Liệu & Insight AI (Gemini / GPT)</div>
                    <div>URL Nguồn Kiểm Chứng (Fact-Check) <span style={{ color: 'var(--accent-danger)' }}>*</span></div>
                  </div>

                  {/* 5 Hàng */}
                  {SCAN_LAYERS.map(layer => {
                    const currentNote = scanNotes[layer.id] || { ai_output: '', fact_check_url: '' };
                    const hasData = Boolean(currentNote.ai_output || currentNote.fact_check_url);

                    return (
                      <div 
                        key={layer.id}
                        style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '170px 1.6fr 1.3fr', 
                          gap: '12px', 
                          padding: '12px', 
                          borderRadius: '8px', 
                          background: hasData ? 'rgba(59,130,246,0.03)' : 'rgba(255,255,255,0.015)', 
                          border: hasData ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(255,255,255,0.05)',
                          alignItems: 'start' 
                        }}
                      >
                        {/* Cột 1: Tên & Mục tiêu */}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: hasData ? '#10b981' : 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                            {layer.label}
                          </div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.35' }}>
                            {layer.desc}
                          </div>
                        </div>

                        {/* Cột 2: Textarea AI Output */}
                        <div>
                          <textarea
                            className="form-input"
                            rows={3}
                            placeholder={`Dán tóm tắt dữ liệu cho ${layer.label}...`}
                            value={currentNote.ai_output || ''}
                            onChange={(e) => handleScanNoteChange(layer.id, 'ai_output', e.target.value)}
                            onBlur={handleBlur}
                            disabled={isDisabled}
                            style={{ fontSize: '0.8rem', lineHeight: '1.4', resize: 'vertical' }}
                          />
                        </div>

                        {/* Cột 3: Fact-Check URL */}
                        <div>
                          <input
                            type="url"
                            className="form-input"
                            placeholder="VD: https://www.trademap.org/..."
                            value={currentNote.fact_check_url || ''}
                            onChange={(e) => handleScanNoteChange(layer.id, 'fact_check_url', e.target.value)}
                            onBlur={handleBlur}
                            disabled={isDisabled}
                            style={{ fontSize: '0.8rem' }}
                          />
                          {currentNote.fact_check_url && (
                            <a 
                              href={currentNote.fact_check_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--accent-primary)', marginTop: '4px' }}
                            >
                              <Link2 size={11} /> Mở nguồn kiểm chứng ↗
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: BUYER LENS */}
            {activeTab === 'lens' && (
              <div>
                {/* ACCORDION HƯỚNG DẪN BUYER LENS */}
                <div style={{ border: '1px solid rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.05)', borderRadius: '8px', marginBottom: '14px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setIsLensGuideOpen(!isLensGuideOpen)}
                    style={{ width: '100%', padding: '9px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 0, color: 'var(--accent-warning)', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Target size={14} /> 🎯 Xem Hướng dẫn Phương pháp luận Lăng Kính Buyer & Prompt AI
                    </span>
                    {isLensGuideOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>

                  {isLensGuideOpen && (
                    <div style={{ padding: '12px', borderTop: '1px solid rgba(245,158,11,0.15)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      <ul style={{ paddingLeft: '16px', margin: 0 }}>
                        <li><strong>1. Cung (Supply):</strong> NCC hiện tại có hay trễ hạn, chất lượng không đều, hoặc khiến Buyer bị phụ thuộc không?</li>
                        <li><strong>2. Cầu (Demand):</strong> Khách hàng cuối của Buyer đang thay đổi thị hiếu gì mà nguồn hàng cũ chưa đáp ứng kịp?</li>
                        <li><strong>3. Giá & Chi phí (Price & Margin):</strong> Buyer đang chịu áp lực cắt giảm TCO và bảo vệ biên lợi nhuận ra sao?</li>
                        <li><strong>4. Đối thủ (Competitors):</strong> Đối thủ của Buyer đang tung ra sản phẩm gì vượt trội khiến họ phải tìm kiếm NCC mới?</li>
                        <li><strong>5. Pháp lý & Rào cản (Compliance):</strong> Quy định an toàn, chứng chỉ xanh/ESG nào khiến Buyer lo sợ rủi ro hải quan/phạt?</li>
                      </ul>
                      <PromptPanel title="Prompt Mẫu: Phân tích Buyer Lens" promptText={PROMPT_LENS} />
                    </div>
                  )}
                </div>

                {/* MA TRẬN 5 HÀNG TOÀN CẢNH (ALL-LAYERS MATRIX) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Header Cột */}
                  <div style={{ display: 'grid', gridTemplateColumns: '170px 1.6fr 1.3fr', gap: '12px', padding: '0 8px', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 'bold' }}>
                    <div>Góc Nhìn Buyer (5 Lớp Tương Ứng)</div>
                    <div>Đúc Kết Tâm Lý & Nỗi Đau (AI / Thực Tế)</div>
                    <div>Đề Xuất Giá Trị Tiếp Cận (Actionable Pitch)</div>
                  </div>

                  {/* 4 Hàng */}
                  {LENS_LAYERS.map(layer => {
                    const currentNote = lensNotes[layer.id] || { ai_output: '', action_usp: '' };
                    const hasData = Boolean(currentNote.ai_output || currentNote.action_usp);

                    return (
                      <div 
                        key={layer.id}
                        style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '170px 1.6fr 1.3fr', 
                          gap: '12px', 
                          padding: '12px', 
                          borderRadius: '8px', 
                          background: hasData ? 'rgba(245,158,11,0.03)' : 'rgba(255,255,255,0.015)', 
                          border: hasData ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(255,255,255,0.05)',
                          alignItems: 'start' 
                        }}
                      >
                        {/* Cột 1: Tên & Trọng tâm */}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--accent-warning)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: hasData ? '#f59e0b' : 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                            {layer.label}
                          </div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.35' }}>
                            {layer.desc}
                          </div>
                        </div>

                        {/* Cột 2: Textarea AI Output */}
                        <div>
                          <textarea
                            className="form-input"
                            rows={3}
                            placeholder={`Dán phân tích tâm lý / tiêu chí cho ${layer.label}...`}
                            value={currentNote.ai_output || ''}
                            onChange={(e) => handleLensNoteChange(layer.id, 'ai_output', e.target.value)}
                            onBlur={handleBlur}
                            disabled={isDisabled}
                            style={{ fontSize: '0.8rem', lineHeight: '1.4', resize: 'vertical' }}
                          />
                        </div>

                        {/* Cột 3: Actionable Pitch */}
                        <div>
                          <textarea
                            className="form-input"
                            rows={3}
                            placeholder="VD: Cam kết bù hàng 100% nếu trễ hạn giao hàng..."
                            value={currentNote.action_usp || ''}
                            onChange={(e) => handleLensNoteChange(layer.id, 'action_usp', e.target.value)}
                            onBlur={handleBlur}
                            disabled={isDisabled}
                            style={{ fontSize: '0.8rem', lineHeight: '1.4', resize: 'vertical' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: PESTEL */}
            {activeTab === 'pestel' && (
              <div>
                {/* ACCORDION HƯỚNG DẪN PESTEL */}
                <div style={{ border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.05)', borderRadius: '8px', marginBottom: '14px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setIsPestelGuideOpen(!isPestelGuideOpen)}
                    style={{ width: '100%', padding: '9px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 0, color: 'var(--accent-success)', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BarChart3 size={14} /> 📊 Xem Hướng dẫn Phương pháp luận PESTEL & Prompt AI
                    </span>
                    {isPestelGuideOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>

                  {isPestelGuideOpen && (
                    <div style={{ padding: '12px', borderTop: '1px solid rgba(16,185,129,0.15)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                        <div><strong>P (Politics):</strong> Ổn định chính trị, chính sách thương mại.</div>
                        <div><strong>E (Economics):</strong> Lạm phát, tỷ giá, chi phí cước biển.</div>
                        <div><strong>S (Social):</strong> Văn hóa, xu hướng người tiêu dùng.</div>
                        <div><strong>T (Technology):</strong> Chuyển đổi số, logistics, bảo quản.</div>
                        <div><strong>E (Environment):</strong> Chuẩn xanh, chứng chỉ Carbon CBAM.</div>
                        <div><strong>L (Legal):</strong> Quy định an toàn thực phẩm, chống bán phá giá.</div>
                      </div>
                      <PromptPanel title="Prompt Mẫu: Phân tích PESTEL" promptText={PROMPT_PESTEL} />
                    </div>
                  )}
                </div>

                {/* MA TRẬN 6 HÀNG TOÀN CẢNH (ALL-LAYERS MATRIX) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Header Cột */}
                  <div style={{ display: 'grid', gridTemplateColumns: '170px 1.6fr 1.3fr', gap: '12px', padding: '0 8px', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 'bold' }}>
                    <div>Yếu Tố Vĩ Mô (PESTEL)</div>
                    <div>Dữ Liệu Tác Động & Xu Hướng (AI / Thống Kê)</div>
                    <div>Hành Động Ứng Phó Của Doanh Nghiệp (Action)</div>
                  </div>

                  {/* 6 Hàng */}
                  {PESTEL_LAYERS.map(layer => {
                    const currentNote = pestelNotes[layer.id] || { ai_output: '', impact_action: '' };
                    const hasData = Boolean(currentNote.ai_output || currentNote.impact_action);

                    return (
                      <div 
                        key={layer.id}
                        style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '170px 1.6fr 1.3fr', 
                          gap: '12px', 
                          padding: '12px', 
                          borderRadius: '8px', 
                          background: hasData ? 'rgba(16,185,129,0.03)' : 'rgba(255,255,255,0.015)', 
                          border: hasData ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.05)',
                          alignItems: 'start' 
                        }}
                      >
                        {/* Cột 1: Tên & Trọng tâm */}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: hasData ? '#10b981' : 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                            {layer.label}
                          </div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.35' }}>
                            {layer.desc}
                          </div>
                        </div>

                        {/* Cột 2: Textarea AI Output */}
                        <div>
                          <textarea
                            className="form-input"
                            rows={3}
                            placeholder={`Dán số liệu, sự kiện chính sách cho ${layer.label}...`}
                            value={currentNote.ai_output || ''}
                            onChange={(e) => handlePestelNoteChange(layer.id, 'ai_output', e.target.value)}
                            onBlur={handleBlur}
                            disabled={isDisabled}
                            style={{ fontSize: '0.8rem', lineHeight: '1.4', resize: 'vertical' }}
                          />
                        </div>

                        {/* Cột 3: Strategic Action */}
                        <div>
                          <textarea
                            className="form-input"
                            rows={3}
                            placeholder="VD: Chủ động chuyển sang bao bì phân hủy sinh học..."
                            value={currentNote.impact_action || ''}
                            onChange={(e) => handlePestelNoteChange(layer.id, 'impact_action', e.target.value)}
                            onBlur={handleBlur}
                            disabled={isDisabled}
                            style={{ fontSize: '0.8rem', lineHeight: '1.4', resize: 'vertical' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BƯỚC 2: KHUNG QUYẾT ĐỊNH CHIẾN LƯỢC DƯỚI DẠNG GRID 2 CỘT NỔI BẬT */}
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.75)',
          border: isFormComplete ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)',
          borderRadius: '14px',
          padding: '20px 22px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <Globe size={18} color={isFormComplete ? "var(--accent-success)" : "var(--accent-primary)"} /> 
              BƯỚC 2: QUYẾT ĐỊNH CHIẾN LƯỢC XUẤT KHẨU (BẮT BUỘC ĐỂ MỞ KHÓA BÀI 04)
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Được tự động đồng bộ vào bài tập tiếp theo
            </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '20px' }}>
            
            {/* CỘT TRÁI (THỊ TRƯỜNG & KÊNH) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
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
                  style={{ width: '100%', padding: '8px 10px', marginBottom: isOtherMarket ? '6px' : '0' }}
                >
                  <option value="" disabled>-- Lựa chọn thị trường --</option>
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
                    style={{ width: '100%', padding: '8px 10px' }}
                  />
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
                  2. Kênh Route-to-market <span style={{color: 'var(--accent-danger)'}}>*</span>
                </label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="VD: Importer / B2B Distributor / Food Service..."
                  value={data.route_to_market || ''}
                  onChange={(e) => handleFieldChange('route_to_market', e.target.value)}
                  onBlur={handleBlur}
                  disabled={isDisabled}
                  style={{ width: '100%', padding: '8px 10px' }}
                />
              </div>
            </div>

            {/* CỘT PHẢI (LÝ DO CỐT LÕI) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
                3. Lý do lựa chọn cốt lõi <span style={{color: 'var(--accent-danger)'}}>*</span>
              </label>
              <textarea 
                className="form-input"
                placeholder="Phân tích lợi thế, độ khó, khoảng trống thị trường và lý do chọn kênh..."
                value={data.strategic_reason || ''}
                onChange={(e) => handleFieldChange('strategic_reason', e.target.value)}
                onBlur={handleBlur}
                disabled={isDisabled}
                rows={4}
                style={{ width: '100%', padding: '8px 10px', resize: 'vertical', fontSize: '0.82rem', lineHeight: '1.45' }}
              />
            </div>
          </div>

          {/* DÒNG TRẠNG THÁI CUỐI (VERIFICATION STATUS) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', paddingTop: '6px' }}>
            <div style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: hasFactCheck ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${hasFactCheck ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flex: '1'
            }}>
              {hasFactCheck ? (
                <>
                  <ShieldCheck size={15} color="#10b981" />
                  <span style={{ color: '#10b981', fontWeight: 600 }}>Đã có Link kiểm chứng (Fact-Check URL OK)</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={15} color="var(--accent-danger)" />
                  <span style={{ color: '#fca5a5' }}>Thiếu Fact-Check URL ở tab Scan 5 Lớp</span>
                </>
              )}
            </div>

            <div style={{ flex: '1' }}>
              {isFormComplete ? (
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-success)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold', border: '1px solid var(--accent-success)' }}>
                  ✓ Đã hoàn thành (Bài 04 được mở khóa)
                </div>
              ) : (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem', textAlign: 'center', lineHeight: '1.35', border: '1px solid rgba(239,68,68,0.25)' }}>
                  ⚠️ Điền đủ 3 trường và ít nhất 1 Fact-Check URL để mở Bài 04.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

