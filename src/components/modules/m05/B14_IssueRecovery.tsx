'use client';

import React, { useState } from 'react';
import {
  AlertOctagon,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  FileText,
  FileWarning,
  HelpCircle,
  Lock,
  MailWarning,
  RefreshCw,
  Scale,
  ShieldAlert,
  Sparkles,
  X,
  AlertTriangle,
  Send,
  Mail,
} from 'lucide-react';
import { hasBlockedRecoveryEmail, M05FormData } from './M05_CombinedForm';

interface Props {
  data: M05FormData;
  setData: React.Dispatch<React.SetStateAction<M05FormData>>;
  handleBlur: () => void;
  isDisabled: boolean;
  isPrerequisiteComplete: boolean;
  targetMarket: string;
  legalContext: string;
}

const CRISIS_SCENARIOS = [
  {
    id: 'late-vessel',
    title: 'Tàu delay 12 ngày do quá tải Cảng trung chuyển (Roll Cont)',
    buyerEmail: 'From: procurement@globalbuyer.com\nTo: export-sales@vietnam-supplier.com\nSubject: [URGENT CLAIM] Vessel Rolled & Critical Production Stoppage Notice\n\nDear Team,\n\nOur forwarder informed us that Container #TGHU928371 was rolled and will arrive 12 DAYS LATE. This is unacceptable! Our production line will shut down next Monday because of this raw material shortage.\n\nWe demand an immediate 20% discount on this shipment and full compensation for our factory downtime ($15,000 USD). Confirm your agreement within 4 HOURS or we will cancel all pending purchase orders!',
    detail: 'Hãng tàu báo rớt tàu do cảng trung chuyển quá tải. Buyer cần hàng gấp cho chiến dịch sản xuất và dọa phạt $15,000 USD nếu không đồng ý đền bù ngay.'
  },
  {
    id: 'quality-claim',
    title: 'Khiếu nại sai lệch chất lượng & Nấm mốc khi mở cont (Quality Dispute)',
    buyerEmail: 'From: qa-inspection@eurobuyer.de\nTo: export-sales@vietnam-supplier.com\nSubject: [REJECTION NOTICE] Severe Mold & Moisture Discrepancy Cont #MSCU481920\n\nDear Sirs,\n\nWe just opened container #MSCU481920 at our Hamburg warehouse. 6 out of 10 pallets show visible white mold spots and the packaging cartons are completely damp. Moisture level measured at 18.5% (Contract max 13%).\n\nWe reject this entire lot. We require a 100% refund immediately or replacement by Air Freight at your expense. Send your official compensation confirmation by today.',
    detail: 'Buyer gửi video 6 pallet có đốm ẩm mốc và bao bì rách, đòi hoàn 100% tiền ngay lập tức nhưng chưa có biên bản giám định độc lập từ SGS/Bureau Veritas.'
  },
  {
    id: 'document-mismatch',
    title: 'Bất hợp lệ bộ chứng từ L/C tại Ngân hàng Phát hành (L/C Discrepancy)',
    buyerEmail: 'From: trade-finance@usbuyer.com\nTo: export-sales@vietnam-supplier.com\nSubject: [L/C DISCREPANCY NOTICE] Document Rejection by Issuing Bank\n\nDear Supplier,\n\nOur bank (Citibank NY) has officially rejected your presentation under L/C #LC883921 due to major discrepancies: Description on B/L and Phytosanitary Certificate does not match Field 45A.\n\nPayment will be blocked indefinitely unless you accept a $1,500 discrepancy fee and extend payment term to 60 days Net.',
    detail: 'Ngân hàng phát hành L/C thông báo Discrepancy do tên hàng trên Bill of Lading và Chứng thư kiểm dịch Phytosanitary không khớp tuyệt đối với điều khoản LC47A.'
  },
  {
    id: 'customs-hold',
    title: 'Lô hàng bị giữ kiểm tra dư lượng thuốc BVTV tại Cảng đích (Customs Hold)',
    buyerEmail: 'From: logistics@japantrade.jp\nTo: export-sales@vietnam-supplier.com\nSubject: [CUSTOMS ALERT] Lot Held at Yokohama Port for Pesticide Testing\n\nDear Partners,\n\nJapan Customs and MHLW have put a temporary hold on your shipment for random chemical residue sampling under new food safety regulations.\n\nDemurrage is accumulating at $200/day. You must accept full liability for all storage and testing fees incurred.',
    detail: 'Hải quan nước nhập khẩu giữ cont kiểm tra hàm lượng dư lượng thuốc BVTV do quy định kiểm dịch mới cập nhật tuần trước.'
  },
];

const FORBIDDEN_TERMS = [
  'đền bù', 'bồi thường', 'trả lại tiền', 'hoàn tiền', 'lỗi của chúng tôi', 'nhận trách nhiệm hoàn toàn',
  'compensate', 'refund', 'our fault', 'full compensation', 'we admit liability', 'we will pay'
];

const EMAIL_TEMPLATE = `Dear [Buyer Procurement Team],

1. SITUATION & FACT ACKNOWLEDGEMENT:
- We have received your notification regarding [Issue Summary, e.g., Mold inspection at Hamburg].
- Incident #[INC-2026] has been created and our Emergency Resolution Committee is actively investigating.

2. IMMEDIATE CONTAINMENT ACTIONS (Within 24 Hours):
- We have contacted the carrier / warehouse to freeze affected batch logs.
- Independent survey request has been dispatched in accordance with Sales Contract Clause [Art 12 - Quality Claim].

3. VERIFICATION & INDEPENDENT EVIDENCE (Prerequisite):
- To protect both parties' commercial insurance rights, we kindly request the Official Joint Survey Report conducted by SGS / Bureau Veritas at the destination port.

4. NEXT ACTION PLAN & TIMELINE:
- We will provide our comprehensive CAPA (Corrective Action) report within 48 business hours after receiving the independent lab verification.

Sincerely,
Export Incident Resolution Committee`;

export default function B14_IssueRecovery({ data, setData, handleBlur, isDisabled, isPrerequisiteComplete, targetMarket, legalContext }: Props) {
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isFiveWhyOpen, setIsFiveWhyOpen] = useState(false);

  const recovery = data.b14_recovery;
  const fiveWhyList = recovery?.five_why || ['', '', '', '', ''];
  const locked = isDisabled || !isPrerequisiteComplete;

  // Compliance scan
  const emailContent = (recovery?.bad_news_email || '').toLowerCase();
  const matchedTerm = FORBIDDEN_TERMS.find(term => emailContent.includes(term.toLowerCase()));
  const isComplianceViolated = Boolean(matchedTerm && !recovery?.evidence_received);

  const updateField = <K extends keyof M05FormData['b14_recovery']>(field: K, value: M05FormData['b14_recovery'][K]) => {
    if (locked) return;
    setData(prev => ({ ...prev, b14_recovery: { ...prev.b14_recovery, [field]: value } }));
  };

  const updateFiveWhy = (index: number, value: string) => {
    if (locked) return;
    const nextFiveWhy = [...fiveWhyList];
    nextFiveWhy[index] = value;
    setData(prev => ({
      ...prev,
      b14_recovery: {
        ...prev.b14_recovery,
        five_why: nextFiveWhy,
      },
    }));
  };

  const applyFiveWhyToRootCause = () => {
    const validWhys = fiveWhyList.filter(w => w.trim());
    if (!validWhys.length) return;
    const synthesized = validWhys.map((w, idx) => `Why ${idx + 1}: ${w}`).join('\n') +
      `\n=> NGUYÊN NHÂN GỐC RỄ (Root Cause): ${validWhys[validWhys.length - 1]}`;
    updateField('root_cause', synthesized);
    setIsFiveWhyOpen(false);
    setTimeout(handleBlur, 100);
  };

  const applyEmailTemplate = () => {
    if (locked) return;
    updateField('bad_news_email', EMAIL_TEMPLATE);
    setTimeout(handleBlur, 100);
  };

  const injectScenario = () => {
    if (locked) return;
    const scenario = CRISIS_SCENARIOS[Math.floor(Math.random() * CRISIS_SCENARIOS.length)];
    setData(prev => ({
      ...prev,
      b14_recovery: {
        ...prev.b14_recovery,
        scenario_id: scenario.id,
        scenario_title: scenario.title,
        evidence_received: false,
      },
    }));
    setIsScenarioModalOpen(true);
    setTimeout(handleBlur, 100);
  };

  const selectedScenario = CRISIS_SCENARIOS.find(item => item.id === recovery?.scenario_id);

  return (
    <section className="glass-panel" style={{ padding: '28px', opacity: isDisabled ? .6 : 1 }}>
      <style>{`
        .crisis-pulse {
          animation: redPulse 2s infinite;
        }
        @keyframes redPulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--accent-primary)', marginBottom: 4 }}>
            Bài 14: Xử Lý Khủng Hoảng, CAPA 3 Lớp & Rào Cản Pháp Lý Ngoại Thương
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.88rem' }}>
            Phản ứng khủng hoảng chuyên nghiệp bằng dữ kiện xác thực, cách ly rủi ro (Containment), tìm nguyên nhân gốc rễ (5-Why) và tuyệt đối không nhận lỗi vi phạm rào cản pháp lý.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsLegalModalOpen(true)}
            style={{ gap: 6, fontSize: '.78rem' }}
          >
            <Scale size={15} color="var(--accent-primary)" /> Rào cản Pháp lý B03
          </button>
          
          <button
            type="button"
            className="btn btn-primary crisis-pulse"
            disabled={locked}
            onClick={injectScenario}
            style={{ gap: 8, whiteSpace: 'nowrap', fontSize: '.84rem', background: '#ef4444', borderColor: '#ef4444' }}
          >
            <AlertOctagon size={16} /> 🚨 Kích hoạt Sự cố Khủng hoảng
          </button>
        </div>
      </div>

      {/* THÔNG BÁO SỰ CỐ HIỆN TẠI */}
      <div style={{ padding: '16px 20px', borderRadius: 12, marginBottom: 24, background: selectedScenario ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255,255,255,.03)', border: `1px solid ${selectedScenario ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255,255,255,0.08)'}` }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <ShieldAlert size={24} color={selectedScenario ? '#ef4444' : 'var(--text-muted)'} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: selectedScenario ? '#fca5a5' : 'var(--text-secondary)', fontSize: '.95rem' }}>
                {selectedScenario ? `🚨 SỰ CỐ ĐANG KÍCH HOẠT: ${selectedScenario.title}` : 'Chưa có tình huống sự cố nào được kích hoạt'}
              </strong>
              {selectedScenario && (
                <button
                  type="button"
                  onClick={() => setIsScenarioModalOpen(true)}
                  style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', padding: '4px 10px', borderRadius: 6, fontSize: '.75rem', cursor: 'pointer' }}
                >
                  📨 Xem lại Email Khách hàng
                </button>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '.84rem', marginTop: 6, lineHeight: 1.5 }}>
              {selectedScenario?.detail || 'Nhấn nút "Kích hoạt Sự cố Khủng hoảng" ở góc trên để nhận một tình huống thực tế và thực hành quy trình phản ứng CAPA.'}
            </p>
          </div>
        </div>
      </div>

      {/* CAPA 3 LỚP */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: '1.02rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
            <FileText size={18} color="var(--accent-primary)" /> Quy trình Phản ứng CAPA 3 Lớp
          </h3>
          <button
            type="button"
            onClick={() => setIsFiveWhyOpen(true)}
            className="btn btn-secondary"
            style={{ fontSize: '.78rem', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Sparkles size={14} color="#f59e0b" /> Trợ lý 5-Why Phân tích
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {/* Lớp 1: Containment */}
          <div style={{ padding: 16, borderRadius: 10, background: 'rgba(15, 23, 42, 0.45)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <label style={{ display: 'block', fontSize: '.84rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 6 }}>
              1. Cách ly Rủi ro Tức thời (Containment within 24H)
            </label>
            <textarea
              className="form-input"
              rows={4}
              value={recovery?.containment_action || ''}
              onChange={e => updateField('containment_action', e.target.value)}
              onBlur={handleBlur}
              disabled={locked}
              placeholder="Hành động chặn đứng thiệt hại: Hold lô hàng đang vận chuyển, thông báo hãng tàu, niêm phong kho, kiểm tra chéo mẫu lưu..."
              style={{ fontSize: '.82rem', resize: 'vertical' }}
            />
          </div>

          {/* Lớp 2: Root Cause */}
          <div style={{ padding: 16, borderRadius: 10, background: 'rgba(15, 23, 42, 0.45)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <label style={{ display: 'block', fontSize: '.84rem', fontWeight: 700, color: '#f59e0b', marginBottom: 6 }}>
              2. Nguyên nhân Gốc rễ (Root Cause Analysis)
            </label>
            <textarea
              className="form-input"
              rows={4}
              value={recovery?.root_cause || ''}
              onChange={e => updateField('root_cause', e.target.value)}
              onBlur={handleBlur}
              disabled={locked}
              placeholder="Nguyên nhân sâu xa: Do bao bì không có lớp chống ẩm PE, hoặc nhân viên chứng từ không check LC47A..."
              style={{ fontSize: '.82rem', resize: 'vertical' }}
            />
          </div>

          {/* Lớp 3: Preventive */}
          <div style={{ padding: 16, borderRadius: 10, background: 'rgba(15, 23, 42, 0.45)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <label style={{ display: 'block', fontSize: '.84rem', fontWeight: 700, color: '#10b981', marginBottom: 6 }}>
              3. Hành động Phòng ngừa Tái diễn (Preventive Action)
            </label>
            <textarea
              className="form-input"
              rows={4}
              value={recovery?.preventive_action || ''}
              onChange={e => updateField('preventive_action', e.target.value)}
              onBlur={handleBlur}
              disabled={locked}
              placeholder="Quy trình sửa đổi: Đưa vào SOP đóng cont, bắt buộc 2 cấp duyệt L/C, trang bị túi hút ẩm chuyên dụng..."
              style={{ fontSize: '.82rem', resize: 'vertical' }}
            />
          </div>
        </div>
      </div>

      {/* BAD NEWS EMAIL VỚI BỘ LỌC TỪ KHÓA PHÁP LÝ */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: '1.02rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
              <MailWarning size={18} color="var(--accent-danger)" /> Soạn Thảo Email Thông Báo Tin Xấu (Bad News Email)
            </h3>
            <span style={{ fontSize: '.76rem', color: 'var(--text-muted)' }}>Nguyên tắc: Thừa nhận thực tế khách quan, không nhận lỗi pháp lý khi chưa có biên bản giám định độc lập.</span>
          </div>

          <button
            type="button"
            onClick={applyEmailTemplate}
            disabled={locked}
            className="btn btn-secondary"
            style={{ fontSize: '.78rem', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Copy size={13} /> Chèn Template Chuẩn
          </button>
        </div>

        {/* CHECKBOX BẰNG CHỨNG GIÁM ĐỊNH */}
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '.84rem', color: 'var(--text-primary)', cursor: locked ? 'not-allowed' : 'pointer' }}>
            <input
              type="checkbox"
              checked={Boolean(recovery?.evidence_received)}
              onChange={e => updateField('evidence_received', e.target.checked)}
              disabled={locked}
              style={{ width: 16, height: 16, accentColor: 'var(--accent-primary)' }}
            />
            <span><strong>Đã thu thập bằng chứng độc lập (Joint Survey SGS/Intertek/Bureau Veritas)</strong></span>
          </label>
          <span style={{ fontSize: '.76rem', color: recovery?.evidence_received ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
            {recovery?.evidence_received ? '✓ Đã có chứng thư giám định' : '⚠️ Chưa có chứng thư độc lập'}
          </span>
        </div>

        {/* CẢNH BÁO VI PHẠM TỪ KHÓA PHÁP LÝ */}
        {isComplianceViolated && (
          <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-danger)', color: '#fca5a5', fontSize: '.84rem', marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <AlertTriangle size={18} color="var(--accent-danger)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>⚠️ VI PHẠM RÀO CẢN PHÁP LÝ NGOẠI THƯƠNG:</strong><br/>
              Bạn đang sử dụng cụm từ <em>"{matchedTerm}"</em> (cam kết đền bù / thừa nhận lỗi) trong email MÀ <strong>chưa có Bằng chứng Giám định Độc lập</strong>. Hành động này sẽ làm doanh nghiệp mất toàn bộ quyền đòi bảo hiểm và chịu trách nhiệm vô căn cứ. Yêu cầu sửa lại email!
            </div>
          </div>
        )}

        <textarea
          className="form-input"
          rows={10}
          value={recovery?.bad_news_email || ''}
          onChange={e => updateField('bad_news_email', e.target.value)}
          onBlur={handleBlur}
          disabled={locked}
          placeholder="Soạn email phản hồi khách hàng theo cấu trúc 4 bước..."
          style={{
            fontSize: '.84rem',
            lineHeight: 1.5,
            fontFamily: 'monospace',
            borderColor: isComplianceViolated ? 'var(--accent-danger)' : 'rgba(255,255,255,0.08)',
            background: isComplianceViolated ? 'rgba(239,68,68,0.04)' : 'rgba(0,0,0,0.25)',
          }}
        />
      </div>

      {/* POPUP MODAL MÔ PHỎNG EMAIL KHỦNG HOẢNG TỪ BUYER */}
      {isScenarioModalOpen && selectedScenario && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ maxWidth: 640, width: '100%', background: '#0f172a', border: '2px solid #ef4444', borderRadius: 14, boxShadow: '0 20px 50px rgba(0,0,0,0.8)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', background: '#ef4444', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '.95rem' }}>
                <Mail size={18} /> 🚨 INCOMING URGENT CLAIM EMAIL FROM BUYER
              </div>
              <button
                type="button"
                onClick={() => setIsScenarioModalOpen(false)}
                style={{ background: 'transparent', border: 0, color: '#fff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ background: '#1e293b', padding: 16, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace', fontSize: '.84rem', whiteSpace: 'pre-wrap', color: '#e2e8f0', lineHeight: 1.6, maxHeight: 320, overflowY: 'auto' }}>
                {selectedScenario.buyerEmail}
              </div>

              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsScenarioModalOpen(false)}
                  className="btn btn-primary"
                  style={{ background: '#ef4444', borderColor: '#ef4444', fontSize: '.85rem', padding: '8px 20px' }}
                >
                  ✓ Tiếp Nhận Claim & Tiến Hành Xử Lý CAPA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 5-WHY */}
      {isFiveWhyOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ maxWidth: 580, width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} color="#f59e0b" /> Phân tích 5-Why Tìm Nguyên nhân Gốc rễ
              </h3>
              <button type="button" onClick={() => setIsFiveWhyOpen(false)} style={{ background: 'transparent', border: 0, color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {fiveWhyList.map((why, idx) => (
                <div key={idx}>
                  <label style={{ fontSize: '.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 3, fontWeight: 600 }}>
                    Why {idx + 1}: {idx === 0 ? 'Tại sao sự cố xảy ra?' : `Tại sao lại có [Why ${idx}]?`}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={why}
                    onChange={e => updateFiveWhy(idx, e.target.value)}
                    placeholder={`Nhập lý do tầng ${idx + 1}...`}
                    style={{ fontSize: '.82rem' }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setIsFiveWhyOpen(false)} className="btn btn-secondary" style={{ fontSize: '.82rem' }}>
                Đóng
              </button>
              <button type="button" onClick={applyFiveWhyToRootCause} className="btn btn-primary" style={{ fontSize: '.82rem' }}>
                ✓ Đưa vào Nguyên Nhân Gốc Rễ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL RÀO CẢN PHÁP LÝ B03 */}
      {isLegalModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ maxWidth: 520, width: '100%', background: '#0f172a', border: '1px solid var(--accent-primary)', borderRadius: 14, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--accent-primary)' }}>Rào cản Pháp lý Thị trường (Kế thừa từ B03)</h3>
              <button type="button" onClick={() => setIsLegalModalOpen(false)} style={{ background: 'transparent', border: 0, color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
              {legalContext || 'Đã áp dụng các quy chuẩn kiểm dịch thực vật (Phytosanitary), hun trùng (Fumigation), và tiêu chuẩn giám định độc lập SGS theo hợp đồng xuất khẩu.'}
            </div>
            <button type="button" onClick={() => setIsLegalModalOpen(false)} className="btn btn-primary" style={{ width: '100%', fontSize: '.85rem' }}>
              Đã hiểu & Đóng
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
