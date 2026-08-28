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
  { id: 'lens1', label: '1. Áp lực & Tâm lý', desc: 'Nỗi đau biên lợi nhuận, áp lực doanh số và cạnh tranh nội địa của Buyer.' },
  { id: 'lens2', label: '2. Tiêu chí ưu tiên', desc: 'Tiêu chí chọn NCC mới: Giá TCO, Lead time, Chứng chỉ, MOQ và Tính ổn định.' },
  { id: 'lens3', label: '3. Rủi ro & Nỗi đau', desc: 'Điểm yếu, rủi ro đứt gãy hoặc sự bất mãn của Buyer từ nhà cung cấp cũ.' },
  { id: 'lens4', label: '4. Thông điệp USP', desc: 'Đề xuất giá trị độc nhất, cam kết giảm thiểu rủi ro và kịch bản thuyết phục Buyer.' },
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

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        
        {/* CỘT TRÁI: TABBED DASHBOARD (62%) */}
        <div style={{ flex: '0 0 62%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Tabs Navigation */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
            <button 
              type="button"
              onClick={() => setActiveTab('scan')}
              className={activeTab === 'scan' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.82rem', padding: '6px 12px', display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              <Search size={15} /> Scan 5 Lớp & Fact-Check
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('lens')}
              className={activeTab === 'lens' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.82rem', padding: '6px 12px', display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              <Target size={15} /> Buyer Lens
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('pestel')}
              className={activeTab === 'pestel' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.82rem', padding: '6px 12px', display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              <BarChart3 size={15} /> Phân tích PESTEL
            </button>
          </div>

          {/* Tabs Content */}
          <div style={{ 
            background: 'rgba(15, 23, 42, 0.4)', 
            border: '1px solid rgba(255,255,255,0.05)', 
            padding: '16px', 
            borderRadius: '12px',
            minHeight: '300px'
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

                {/* 5 SUB-TABS CHO 5 LỚP SCAN */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
                  {SCAN_LAYERS.map(layer => {
                    const isSelected = activeScanLayer === layer.id;
                    const layerData = scanNotes[layer.id];
                    const hasData = Boolean(layerData?.ai_output || layerData?.fact_check_url);

                    return (
                      <button
                        key={layer.id}
                        type="button"
                        onClick={() => setActiveScanLayer(layer.id)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          border: isSelected ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.08)',
                          background: isSelected ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.02)',
                          color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          fontSize: '0.76rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        {layer.label}
                        {hasData && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />}
                      </button>
                    );
                  })}
                </div>

                {/* KHÔNG GIAN NHẬP LIỆU CHO LỚP SCAN HIỆN TẠI */}
                {(() => {
                  const currentConfig = SCAN_LAYERS.find(l => l.id === activeScanLayer) || SCAN_LAYERS[0];
                  const currentNote = scanNotes[activeScanLayer] || { ai_output: '', fact_check_url: '' };

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <strong>Mục tiêu lớp này:</strong> {currentConfig.desc}
                      </div>

                      {/* TEXTAREA DÁN KẾT QUẢ AI */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
                          📥 Dán kết quả phân tích AI (Gemini Spark / GPT):
                        </label>
                        <textarea
                          className="form-input"
                          rows={5}
                          placeholder={`Dán tóm tắt dữ liệu cho ${currentConfig.label} tại đây (Ví dụ: Số liệu kim ngạch nhập khẩu, tên các đối thủ lớn, mức thuế MFN/FTA...)...`}
                          value={currentNote.ai_output || ''}
                          onChange={(e) => handleScanNoteChange(activeScanLayer, 'ai_output', e.target.value)}
                          onBlur={handleBlur}
                          disabled={isDisabled}
                          style={{ fontSize: '0.82rem', lineHeight: '1.45' }}
                        />
                      </div>

                      {/* INPUT URL FACT-CHECK */}
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: '4px', fontWeight: 'bold' }}>
                          <Link2 size={13} /> 🔗 URL Nguồn kiểm chứng (Fact-Check URL) <span style={{ color: 'var(--accent-danger)' }}>*</span>
                        </label>
                        <input
                          type="url"
                          className="form-input"
                          placeholder="VD: https://www.trademap.org/ hoặc https://fas.usda.gov/ hoặc https://customs.gov.vn..."
                          value={currentNote.fact_check_url || ''}
                          onChange={(e) => handleScanNoteChange(activeScanLayer, 'fact_check_url', e.target.value)}
                          onBlur={handleBlur}
                          disabled={isDisabled}
                          style={{ fontSize: '0.82rem' }}
                        />
                      </div>
                    </div>
                  );
                })()}
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
                        <li><strong>Tâm lý cốt lõi:</strong> Họ đang gặp áp lực gì lớn nhất tại thị trường nội địa (Doanh thu, cạnh tranh, chi phí)?</li>
                        <li><strong>Ưu tiên lựa chọn:</strong> Tiêu chí hàng đầu khi chọn nhà cung cấp mới là gì (Chất lượng, giá, tốc độ, tính ổn định)?</li>
                        <li><strong>Rủi ro đứt gãy:</strong> Nguồn cung hiện tại của họ đang vướng mắc điểm yếu chí mạng nào mà bạn có thể lấp đầy?</li>
                        <li><strong>Chuyển đổi USP:</strong> Chuyển hóa đặc tính thành giá trị thương mại giúp Buyer giảm rủi ro.</li>
                      </ul>
                      <PromptPanel title="Prompt Mẫu: Phân tích Buyer Lens" promptText={PROMPT_LENS} />
                    </div>
                  )}
                </div>

                {/* 4 SUB-TABS CHO BUYER LENS */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
                  {LENS_LAYERS.map(layer => {
                    const isSelected = activeLensLayer === layer.id;
                    const layerData = lensNotes[layer.id];
                    const hasData = Boolean(layerData?.ai_output || layerData?.action_usp);

                    return (
                      <button
                        key={layer.id}
                        type="button"
                        onClick={() => setActiveLensLayer(layer.id)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          border: isSelected ? '1px solid var(--accent-warning)' : '1px solid rgba(255,255,255,0.08)',
                          background: isSelected ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.02)',
                          color: isSelected ? 'var(--accent-warning)' : 'var(--text-secondary)',
                          fontSize: '0.76rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        {layer.label}
                        {hasData && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />}
                      </button>
                    );
                  })}
                </div>

                {/* KHÔNG GIAN NHẬP LIỆU CHO BUYER LENS */}
                {(() => {
                  const currentConfig = LENS_LAYERS.find(l => l.id === activeLensLayer) || LENS_LAYERS[0];
                  const currentNote = lensNotes[activeLensLayer] || { ai_output: '', action_usp: '' };

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <strong>Góc nhìn Buyer:</strong> {currentConfig.desc}
                      </div>

                      {/* TEXTAREA DÁN KẾT QUẢ AI */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
                          📥 Dán kết quả phân tích Buyer Lens (Gemini / GPT / Tự đúc kết):
                        </label>
                        <textarea
                          className="form-input"
                          rows={5}
                          placeholder={`Dán phân tích tâm lý, nỗi đau hoặc tiêu chí của Buyer cho phần ${currentConfig.label}...`}
                          value={currentNote.ai_output || ''}
                          onChange={(e) => handleLensNoteChange(activeLensLayer, 'ai_output', e.target.value)}
                          onBlur={handleBlur}
                          disabled={isDisabled}
                          style={{ fontSize: '0.82rem', lineHeight: '1.45' }}
                        />
                      </div>

                      {/* ĐỀ XUẤT THÔNG ĐIỆP TIẾP CẬN / USP */}
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--accent-warning)', marginBottom: '4px', fontWeight: 'bold' }}>
                          💡 Đề xuất thông điệp tiếp cận & Giá trị chào hàng (Actionable Buyer Pitch):
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="VD: Cam kết bù hàng 100% nếu trễ hạn giao hàng, tối ưu MOQ đợt đầu để thử nghiệm..."
                          value={currentNote.action_usp || ''}
                          onChange={(e) => handleLensNoteChange(activeLensLayer, 'action_usp', e.target.value)}
                          onBlur={handleBlur}
                          disabled={isDisabled}
                          style={{ fontSize: '0.82rem' }}
                        />
                      </div>
                    </div>
                  );
                })()}
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

                {/* 6 SUB-TABS CHO PESTEL */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
                  {PESTEL_LAYERS.map(layer => {
                    const isSelected = activePestelLayer === layer.id;
                    const layerData = pestelNotes[layer.id];
                    const hasData = Boolean(layerData?.ai_output || layerData?.impact_action);

                    return (
                      <button
                        key={layer.id}
                        type="button"
                        onClick={() => setActivePestelLayer(layer.id)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          border: isSelected ? '1px solid var(--accent-success)' : '1px solid rgba(255,255,255,0.08)',
                          background: isSelected ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.02)',
                          color: isSelected ? 'var(--accent-success)' : 'var(--text-secondary)',
                          fontSize: '0.76rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        {layer.label}
                        {hasData && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />}
                      </button>
                    );
                  })}
                </div>

                {/* KHÔNG GIAN NHẬP LIỆU CHO PESTEL */}
                {(() => {
                  const currentConfig = PESTEL_LAYERS.find(l => l.id === activePestelLayer) || PESTEL_LAYERS[0];
                  const currentNote = pestelNotes[activePestelLayer] || { ai_output: '', impact_action: '' };

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <strong>Yếu tố vĩ mô:</strong> {currentConfig.desc}
                      </div>

                      {/* TEXTAREA DÁN KẾT QUẢ AI */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
                          📥 Dán kết quả phân tích PESTEL (Gemini Spark / GPT / Dữ liệu vĩ mô):
                        </label>
                        <textarea
                          className="form-input"
                          rows={5}
                          placeholder={`Dán số liệu, sự kiện chính sách hoặc xu hướng tác động cho ${currentConfig.label}...`}
                          value={currentNote.ai_output || ''}
                          onChange={(e) => handlePestelNoteChange(activePestelLayer, 'ai_output', e.target.value)}
                          onBlur={handleBlur}
                          disabled={isDisabled}
                          style={{ fontSize: '0.82rem', lineHeight: '1.45' }}
                        />
                      </div>

                      {/* TÁC ĐỘNG & HÀNH ĐỘNG ỨNG PHÓ */}
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--accent-success)', marginBottom: '4px', fontWeight: 'bold' }}>
                          🎯 Tác động thị trường & Hành động ứng phó của Sales (Strategic Action):
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="VD: Chủ động chuyển sang bao bì phân hủy sinh học để đón đầu tiêu chuẩn xanh EU..."
                          value={currentNote.impact_action || ''}
                          onChange={(e) => handlePestelNoteChange(activePestelLayer, 'impact_action', e.target.value)}
                          onBlur={handleBlur}
                          disabled={isDisabled}
                          style={{ fontSize: '0.82rem' }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: FORM QUYẾT ĐỊNH CHIẾN LƯỢC (STICKY) (38%) */}
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
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={20} color={isFormComplete ? "var(--accent-success)" : "var(--accent-primary)"} /> 
            Quyết định Chiến lược
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
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
                style={{ width: '100%', padding: '9px', marginBottom: isOtherMarket ? '6px' : '0' }}
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
                  style={{ width: '100%', padding: '9px' }}
                />
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
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
                style={{ width: '100%', padding: '9px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
                3. Lý do lựa chọn cốt lõi <span style={{color: 'var(--accent-danger)'}}>*</span>
              </label>
              <textarea 
                className="form-input"
                placeholder="Phân tích lợi thế, độ khó, khoảng trống thị trường..."
                value={data.strategic_reason || ''}
                onChange={(e) => handleFieldChange('strategic_reason', e.target.value)}
                onBlur={handleBlur}
                disabled={isDisabled}
                rows={4}
                style={{ width: '100%', padding: '9px', resize: 'vertical', fontSize: '0.85rem' }}
              />
            </div>

            {/* FACT-CHECK VERIFICATION STATUS */}
            <div style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: hasFactCheck ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${hasFactCheck ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {hasFactCheck ? (
                <>
                  <ShieldCheck size={16} color="#10b981" />
                  <span style={{ color: '#10b981', fontWeight: 600 }}>Đã có Link kiểm chứng (Fact-Check OK)</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} color="var(--accent-danger)" />
                  <span style={{ color: '#fca5a5' }}>Thiếu Fact-Check URL ở tab Scan 5 Lớp</span>
                </>
              )}
            </div>

            {isFormComplete ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-success)', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center', fontWeight: 'bold', border: '1px solid var(--accent-success)' }}>
                ✓ Đã hoàn thành (Bài 04 được mở khóa)
              </div>
            ) : (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', padding: '10px', borderRadius: '8px', fontSize: '0.82rem', textAlign: 'center', lineHeight: '1.4' }}>
                ⚠️ Vui lòng điền đủ 3 trường chiến lược và ít nhất 1 Fact-Check URL để mở khóa Bài 04.
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}

