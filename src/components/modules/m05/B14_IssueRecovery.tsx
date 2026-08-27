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
  { id: 'late-vessel', title: 'Tàu delay 12 ngày (Roll Cont)', detail: 'Hãng tàu báo rớt tàu do cảng trung chuyển quá tải. Buyer cần hàng gấp cho chiến dịch quảng bá mùa cao điểm và yêu cầu xác nhận giải pháp đền bù trong 4 giờ.' },
  { id: 'quality-claim', title: 'Khiếu nại sai lệch chất lượng khi mở cont', detail: 'Buyer gửi video 4 pallet có đốm ẩm mốc và bao bì rách, yêu cầu hoàn 50% giá trị lô hàng ngay lập tức nhưng chưa có biên bản giám định độc lập (SGS/Bureau Veritas).' },
  { id: 'document-mismatch', title: 'Bất hợp lệ bộ chứng từ xuất khẩu', detail: 'Ngân hàng phát hành L/C thông báo Discrepancy do tên hàng trên Bill of Lading và Chứng thư kiểm dịch Phytosanitary không khớp tuyệt đối với điều khoản LC47A.' },
  { id: 'customs-hold', title: 'Lô hàng bị giữ kiểm tra thực tế tại Cảng đến', detail: 'Hải quan nước nhập khẩu giữ cont kiểm tra hàm lượng dư lượng thuốc BVTV do quy định kiểm dịch mới cập nhật tuần trước.' },
];

const FORBIDDEN_TERMS = ['đền bù toàn bộ', 'compensate all', 'trả lại tiền'];

const EMAIL_TEMPLATE = `Dear [Buyer Team],

1. SITUATION / FACT CONFIRMED:
- We have received your notification regarding [Issue Summary].
- Our team has logged Incident #[INC-Date] and verified initial operational logs.

2. IMMEDIATE CONTAINMENT ACTIONS (Within 24H):
- [Action 1: Holding batch / Contacting shipping line / Requesting official surveyor]
- [Action 2: Safety buffer & risk isolation]

3. INVESTIGATION & EVIDENCE REQUIRED:
- In accordance with our sales contract & Incoterms [FOB/CIF], an independent joint survey report (SGS/Intertek) is being requested to establish formal findings.

4. NEXT STATUS UPDATE:
- We will provide the next comprehensive investigation report by [Time/Date: DD/MM/YYYY, HH:MM GMT].

Sincerely,
Export Incident Resolution Desk`;

export default function B14_IssueRecovery({ data, setData, handleBlur, isDisabled, isPrerequisiteComplete, targetMarket, legalContext }: Props) {
  const [isScenarioOpen, setIsScenarioOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isFiveWhyOpen, setIsFiveWhyOpen] = useState(false);
  const recovery = data.b14_recovery;
  const fiveWhyList = recovery?.five_why || ['', '', '', '', ''];
  const locked = isDisabled || !isPrerequisiteComplete;
  const emailBlocked = hasBlockedRecoveryEmail(data);
  const matchedTerm = FORBIDDEN_TERMS.find(term => (recovery?.bad_news_email || '').toLocaleLowerCase('vi-VN').includes(term));

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
      `\n=> NGUYÊN NHÂN GỐC RỄ: ${validWhys[validWhys.length - 1]}`;
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
    setIsScenarioOpen(true);
    setTimeout(handleBlur, 100);
  };

  const selectedScenario = CRISIS_SCENARIOS.find(item => item.id === recovery?.scenario_id);

  if (!isPrerequisiteComplete) {
    return (
      <section className="glass-panel" style={{ padding: 32, opacity: .35, filter: 'grayscale(100%)', pointerEvents: 'none' }}>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--text-muted)', marginBottom: 12 }}>Bài 14: Issue Recovery & CAPA</h2>
        <div style={{ display: 'flex', gap: 8, color: 'var(--accent-warning)' }}><Lock size={18} /> Ký duyệt đủ 5 mục Internal SLA và Timeline ở Bài 13 để mở trạm khủng hoảng.</div>
      </section>
    );
  }

  return (
    <section className="glass-panel" style={{ padding: 32, opacity: isDisabled ? .6 : 1 }}>
      <style>{`
        .capa-layer { transition: all .25s ease; border: 1px solid rgba(255,255,255,.08); }
        .capa-layer:focus-within { border-color: var(--accent-primary); box-shadow: 0 4px 20px rgba(59,130,246,.15); transform: translateY(-2px); }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.4rem', marginBottom: 8 }}>Bài 14: Xử lý Khủng hoảng, CAPA & Giao tiếp Tin Xấu</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>Phản ứng bằng dữ kiện xác thực, cách ly rủi ro (Containment), tìm nguyên nhân gốc rễ (5-Why) và tuân thủ rào cản pháp lý ngoại thương.</p>
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
            className="btn btn-primary"
            disabled={locked}
            onClick={injectScenario}
            style={{ gap: 8, whiteSpace: 'nowrap', fontSize: '.84rem' }}
          >
            <RefreshCw size={16} /> Kích hoạt sự cố ngẫu nhiên
          </button>
        </div>
      </div>

      <div style={{ padding: 16, borderRadius: 12, marginBottom: 22, background: selectedScenario ? 'rgba(245,158,11,.1)' : 'rgba(255,255,255,.03)', border: `1px ${selectedScenario ? 'solid' : 'dashed'} ${selectedScenario ? 'rgba(245,158,11,.35)' : 'var(--border-color)'}` }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <AlertOctagon size={22} color={selectedScenario ? '#f59e0b' : 'var(--text-muted)'} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: selectedScenario ? '#f59e0b' : 'var(--text-secondary)', fontSize: '.95rem' }}>{selectedScenario?.title || 'Chưa có tình huống sự cố nào được kích hoạt'}</strong>
              {selectedScenario && <span style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>Mã case: #{selectedScenario.id}</span>}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '.84rem', marginTop: 6, lineHeight: 1.5 }}>{selectedScenario?.detail || 'Nhấn “Kích hoạt sự cố ngẫu nhiên” để nhận một tình huống thực tế (Delay tàu, Claim chất lượng, Sai lệch L/C, Hold hải quan).'}</p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={18} color="var(--accent-primary)" /> Khung CAPA 3 Lớp (Corrective & Preventive Action)
        </h3>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setIsFiveWhyOpen(!isFiveWhyOpen)}
          style={{ fontSize: '.76rem', padding: '5px 10px', gap: 5 }}
        >
          <Sparkles size={14} color="#f59e0b" /> {isFiveWhyOpen ? 'Ẩn 5-Why Helper' : 'Mở 5-Why Helper'} {isFiveWhyOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {isFiveWhyOpen && (
        <div style={{ padding: 16, borderRadius: 12, background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.25)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <strong style={{ fontSize: '.88rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <HelpCircle size={16} /> 5-Why Root Cause Wizard (Truy tìm nguyên nhân gốc)
            </strong>
            <span style={{ fontSize: '.74rem', color: 'var(--text-muted)' }}>Đào sâu từng tầng nguyên nhân để không đổ lỗi cảm tính</span>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {[
              'Why 1: Vì sao sự cố xảy ra trực tiếp?',
              'Why 2: Vì sao bước đó không được phát hiện sớm?',
              'Why 3: Vì sao quy trình kiểm tra bị bỏ qua hoặc thiếu sót?',
              'Why 4: Vì sao tiêu chuẩn/hướng dẫn vận hành chưa quy định rõ?',
              'Why 5: Nguyên nhân gốc rễ cốt lõi của toàn hệ thống là gì?',
            ].map((label, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: '.76rem', color: 'var(--text-secondary)' }}>{label}</span>
                <input
                  className="form-input"
                  value={fiveWhyList[idx] || ''}
                  disabled={locked || !selectedScenario}
                  onChange={e => updateFiveWhy(idx, e.target.value)}
                  placeholder={`Câu trả lời tầng ${idx + 1}...`}
                  style={{ fontSize: '.82rem', padding: '6px 10px' }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={locked || !selectedScenario}
              onClick={applyFiveWhyToRootCause}
              style={{ fontSize: '.78rem', padding: '6px 14px', gap: 6 }}
            >
              <Sparkles size={14} /> Tổng hợp vào ô Root Cause bên dưới
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { field: 'containment_action' as const, number: '01', title: '1. Containment Action', hint: 'Hành động khoanh vùng cách ly tổn thất trong 24h đầu?', placeholder: 'VD: Khóa xuất kho lô cùng batch, yêu cầu chụp ảnh container seal còn nguyên, phát hành Notice of Claim tạm thời...' },
          { field: 'root_cause' as const, number: '02', title: '2. Root Cause Analysis', hint: 'Nguyên nhân cốt lõi dựa trên dữ kiện/5-Why, không cảm tính?', placeholder: 'Phân tích 5 Why, bằng chứng giám định kỹ thuật, điểm gãy quy trình nội bộ...' },
          { field: 'preventive_action' as const, number: '03', title: '3. Preventive Action', hint: 'Thay đổi hệ thống/SOP nào để triệt tiêu nguy cơ tái diễn?', placeholder: 'Bổ sung checkpoint kiểm tra nhiệt độ cont, chuẩn hóa checklist chứng từ, huấn luyện nhà máy...' },
        ].map(layer => (
          <div key={layer.field} className="capa-layer" style={{ padding: 16, borderRadius: 12, background: 'rgba(15,23,42,.45)' }}>
            <div style={{ color: 'var(--accent-primary)', fontWeight: 900, fontSize: '.75rem', marginBottom: 5 }}>{layer.number}</div>
            <h3 style={{ fontSize: '.98rem', marginBottom: 6 }}>{layer.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '.77rem', minHeight: 38, marginBottom: 10 }}>{layer.hint}</p>
            <textarea className="form-input" rows={6} disabled={locked || !selectedScenario} value={recovery?.[layer.field] || ''} onChange={event => updateField(layer.field, event.target.value)} onBlur={handleBlur} placeholder={layer.placeholder} style={{ fontSize: '.82rem' }} />
          </div>
        ))}
      </div>

      <div className="capa-layer" style={{ padding: 20, borderRadius: 12, background: emailBlocked ? 'rgba(239,68,68,.08)' : 'rgba(0,0,0,.18)', borderColor: emailBlocked ? 'var(--accent-danger)' : undefined }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.05rem' }}>
              <MailWarning size={19} color={emailBlocked ? 'var(--accent-danger)' : 'var(--accent-primary)'} /> Soạn Bad News Email (Giao tiếp xử lý khiếu nại)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '.8rem', marginTop: 4 }}>Nguyên tắc vàng: Fact → Containment Action → Bằng chứng độc lập → Next Status Update. Tuyệt đối không nhận lỗi tài chính khi chưa đủ chứng cứ.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={locked || !selectedScenario}
              onClick={applyEmailTemplate}
              style={{ fontSize: '.76rem', padding: '6px 10px', gap: 5 }}
            >
              <Copy size={13} /> Chèn khung Email chuẩn
            </button>
            <span title={legalContext || 'Chưa có ghi chú chiến lược từ B03'} style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(59,130,246,.1)', color: 'var(--accent-primary)', fontSize: '.74rem', whiteSpace: 'nowrap' }}>
              Thị trường: {targetMarket || 'Toàn cầu'}
            </span>
          </div>
        </div>

        <textarea className="form-input" rows={8} disabled={locked || !selectedScenario} value={recovery?.bad_news_email || ''} onChange={event => updateField('bad_news_email', event.target.value)} onBlur={handleBlur} placeholder="Dear [Buyer Team], We have verified the following facts..." style={{ borderColor: emailBlocked ? 'var(--accent-danger)' : undefined, fontSize: '.84rem', fontFamily: 'monospace' }} />

        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 14, cursor: locked ? 'not-allowed' : 'pointer', background: 'rgba(255,255,255,.02)', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,.06)' }}>
          <input type="checkbox" checked={Boolean(recovery?.evidence_received)} disabled={locked || !selectedScenario} onChange={event => updateField('evidence_received', event.target.checked)} onBlur={handleBlur} style={{ marginTop: 4 }} />
          <span style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Đã thu thập & xác nhận đủ Bằng chứng độc lập (Independent Survey Report)</strong><br />Biên bản giám định SGS/Intertek, ảnh hiện trường có timestamp, log cảm biến nhiệt độ hoặc xác nhận chính thức từ hãng tàu đã đầy đủ để thảo luận bồi thường.</span>
        </label>

        {emailBlocked ? (
          <div style={{ display: 'flex', gap: 9, marginTop: 14, padding: 12, borderRadius: 9, color: '#fca5a5', background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.35)', fontSize: '.82rem' }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span><strong>Logic Gate 5 đang chặn lưu:</strong> Email chứa cụm từ nhạy cảm “{matchedTerm}” trong khi chưa đánh dấu có bằng chứng độc lập. Hãy sửa đổi nội dung cam kết sang “phối hợp điều tra” hoặc xác nhận bằng chứng sau khi có biên bản giám định.</span>
          </div>
        ) : recovery?.bad_news_email ? (
          <div style={{ display: 'flex', gap: 8, marginTop: 12, color: '#10b981', fontSize: '.8rem' }}><CheckCircle2 size={17} /> Email tuân thủ Crisis Compliance Gate (Không cam kết vượt quá thẩm quyền).</div>
        ) : null}
      </div>

      {isScenarioOpen && selectedScenario && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'grid', placeItems: 'center', padding: 24, background: 'rgba(2,6,23,.82)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ width: 'min(560px, 100%)', padding: 28, border: '1px solid rgba(245,158,11,.55)', boxShadow: '0 30px 80px rgba(0,0,0,.55)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <FileWarning size={34} color="#f59e0b" />
              <button onClick={() => setIsScenarioOpen(false)} aria-label="Đóng tình huống" style={{ border: 0, background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            <div style={{ color: '#f59e0b', fontSize: '.74rem', fontWeight: 900, letterSpacing: '.12em', marginTop: 20 }}>CRISIS INJECTOR · TRẠM KHỦNG HOẢNG</div>
            <h3 style={{ fontSize: '1.45rem', marginTop: 8 }}>{selectedScenario.title}</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.7, fontSize: '.9rem' }}>{selectedScenario.detail}</p>
            <div style={{ padding: 14, borderRadius: 10, background: 'rgba(59,130,246,.08)', borderLeft: '3px solid var(--accent-primary)', color: 'var(--text-secondary)', fontSize: '.84rem', marginTop: 18 }}>
              💡 <strong>Yêu cầu nghiệp vụ:</strong> Đóng vai Incident Commander. Khoanh vùng tổn thất ngay trong 24h, phân tích nguyên nhân gốc bằng 5-Why, và soạn Bad News Email đúng chuẩn không vi phạm trách nhiệm tài chính.
            </div>
            <button className="btn btn-primary" onClick={() => setIsScenarioOpen(false)} style={{ width: '100%', marginTop: 22 }}>Nhận nhiệm vụ & Xử lý tình huống</button>
          </div>
        </div>
      )}

      {isLegalModalOpen && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'grid', placeItems: 'center', padding: 24, background: 'rgba(2,6,23,.82)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ width: 'min(620px, 100%)', padding: 28, border: '1px solid rgba(59,130,246,.5)', boxShadow: '0 30px 80px rgba(0,0,0,.55)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Scale size={28} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Rào cản Pháp lý & Trách nhiệm B03</h3>
              </div>
              <button onClick={() => setIsLegalModalOpen(false)} aria-label="Đóng tra cứu" style={{ border: 0, background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            <div style={{ marginTop: 20, display: 'grid', gap: 14, fontSize: '.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)' }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>1. Điểm chuyển giao rủi ro theo Incoterms (Risk Transfer Point):</strong>
                Theo quy tắc FOB/CIF, rủi ro về hàng hóa chuyển từ Người bán sang Người mua ngay khi hàng đã được xếp an toàn lên tàu tại Cảng bốc hàng. Các hư hỏng phát sinh trong quá trình vận tải biển thuộc phạm vi bảo hiểm hàng hải (Marine Cargo Insurance), không phải trách nhiệm trực tiếp của Sales.
              </div>
              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)' }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>2. Quy tắc thụ lý Khiếu nại Chất lượng (Notice of Claim):</strong>
                Người mua có nghĩa vụ thông báo khiếu nại kèm Biên bản giám định của tổ chức độc lập được hai bên công nhận (VD: SGS, Intertek, Vinacontrol) trong thời hạn quy định trong Hợp đồng (thường 7-14 ngày từ ngày dỡ hàng). Mọi yêu cầu bồi thường không có biên bản giám định đều vô hiệu về mặt pháp lý.
              </div>
              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)' }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>3. Ghi chú chiến lược từ thương vụ của bạn:</strong>
                {legalContext ? legalContext : 'Chưa có ghi chú cụ thể. Luôn tuân thủ nguyên tắc giới hạn trách nhiệm bồi thường tối đa không vượt quá giá trị lô hàng.'}
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setIsLegalModalOpen(false)} style={{ width: '100%', marginTop: 22 }}>Đã hiểu & Quay lại xử lý</button>
          </div>
        </div>
      )}
    </section>
  );
}

