'use client';

import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, FileWarning, Lock, MailWarning, RefreshCw, ShieldAlert, X } from 'lucide-react';
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
  { id: 'late-vessel', title: 'Tàu delay 12 ngày', detail: 'Hãng tàu roll container sang chuyến sau. Buyer cần hàng cho chiến dịch ra mắt và yêu cầu cam kết mới trong 2 giờ.' },
  { id: 'quality-claim', title: 'Khiếu nại sai lệch chất lượng', detail: 'Buyer gửi ảnh 4 pallet có màu sắc không đồng nhất nhưng chưa có biên bản giám định độc lập.' },
  { id: 'document-mismatch', title: 'Sai lệch bộ chứng từ', detail: 'Tên hàng trên Commercial Invoice không khớp hoàn toàn với L/C và ngân hàng báo discrepancy.' },
  { id: 'customs-hold', title: 'Lô hàng bị giữ tại hải quan', detail: 'Cơ quan nhập khẩu yêu cầu thêm chứng thư mà checklist ban đầu chưa đề cập.' },
];

const FORBIDDEN_TERMS = ['đền bù toàn bộ', 'compensate all', 'trả lại tiền'];

export default function B14_IssueRecovery({ data, setData, handleBlur, isDisabled, isPrerequisiteComplete, targetMarket, legalContext }: Props) {
  const [isScenarioOpen, setIsScenarioOpen] = useState(false);
  const recovery = data.b14_recovery;
  const locked = isDisabled || !isPrerequisiteComplete;
  const emailBlocked = hasBlockedRecoveryEmail(data);
  const matchedTerm = FORBIDDEN_TERMS.find(term => (recovery?.bad_news_email || '').toLocaleLowerCase('vi-VN').includes(term));

  const updateField = <K extends keyof M05FormData['b14_recovery']>(field: K, value: M05FormData['b14_recovery'][K]) => {
    if (locked) return;
    setData(prev => ({ ...prev, b14_recovery: { ...prev.b14_recovery, [field]: value } }));
  };

  const injectScenario = () => {
    if (locked) return;
    const scenario = CRISIS_SCENARIOS[Math.floor(Math.random() * CRISIS_SCENARIOS.length)];
    setData(prev => ({
      ...prev,
      b14_recovery: { ...prev.b14_recovery, scenario_id: scenario.id, scenario_title: scenario.title, evidence_received: false },
    }));
    setIsScenarioOpen(true);
    setTimeout(handleBlur, 100);
  };

  const selectedScenario = CRISIS_SCENARIOS.find(item => item.id === recovery?.scenario_id);

  if (!isPrerequisiteComplete) {
    return (
      <section className="glass-panel" style={{ padding: 32, opacity: .35, filter: 'grayscale(100%)', pointerEvents: 'none' }}>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--text-muted)', marginBottom: 12 }}>Bài 14: Issue Recovery & CAPA</h2>
        <div style={{ display: 'flex', gap: 8, color: 'var(--accent-warning)' }}><Lock size={18} /> Ký duyệt đủ 5 mục Internal SLA ở Bài 13 để mở trạm khủng hoảng.</div>
      </section>
    );
  }

  return (
    <section className="glass-panel" style={{ padding: 32, opacity: isDisabled ? .6 : 1 }}>
      <style>{`
        .capa-layer { transition: all .25s ease; border: 1px solid rgba(255,255,255,.08); }
        .capa-layer:focus-within { border-color: var(--accent-primary); box-shadow: 0 4px 20px rgba(59,130,246,.15); transform: translateY(-2px); }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
        <div>
          <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.4rem', marginBottom: 8 }}>Bài 14: Xử lý Khủng hoảng & CAPA</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>Phản ứng bằng bằng chứng, kiểm soát tổn thất và ngăn sự cố lặp lại.</p>
        </div>
        <button className="btn btn-primary" disabled={locked} onClick={injectScenario} style={{ gap: 8, whiteSpace: 'nowrap' }}><RefreshCw size={16} /> Kích hoạt sự cố</button>
      </div>

      <div style={{ padding: 16, borderRadius: 12, marginBottom: 22, background: selectedScenario ? 'rgba(245,158,11,.1)' : 'rgba(255,255,255,.03)', border: `1px ${selectedScenario ? 'solid' : 'dashed'} ${selectedScenario ? 'rgba(245,158,11,.35)' : 'var(--border-color)'}` }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <AlertOctagon size={20} color={selectedScenario ? '#f59e0b' : 'var(--text-muted)'} />
          <div>
            <strong style={{ color: selectedScenario ? '#f59e0b' : 'var(--text-secondary)', fontSize: '.92rem' }}>{selectedScenario?.title || 'Chưa có tình huống được kích hoạt'}</strong>
            <p style={{ color: 'var(--text-secondary)', fontSize: '.82rem', marginTop: 5 }}>{selectedScenario?.detail || 'Nhấn “Kích hoạt sự cố” để nhận một case ngẫu nhiên.'}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { field: 'containment_action' as const, number: '01', title: 'Containment', hint: 'Bạn làm gì trong 24 giờ đầu để chặn tổn thất lan rộng?', placeholder: 'VD: Tạm giữ lô cùng batch, yêu cầu ảnh/video có timestamp, xác nhận lại ETA...' },
          { field: 'root_cause' as const, number: '02', title: 'Root Cause', hint: 'Nguyên nhân gốc dựa trên dữ kiện nào, không dựa vào cảm xúc?', placeholder: 'Phân tích 5 Why, điểm gãy quy trình, bằng chứng đang có và còn thiếu...' },
          { field: 'preventive_action' as const, number: '03', title: 'Preventive Action', hint: 'Thay đổi hệ thống nào để lỗi không lặp lại?', placeholder: 'Bổ sung checkpoint, owner, tiêu chuẩn kiểm tra và cơ chế escalation...' },
        ].map(layer => (
          <div key={layer.field} className="capa-layer" style={{ padding: 15, borderRadius: 12, background: 'rgba(15,23,42,.45)' }}>
            <div style={{ color: 'var(--accent-primary)', fontWeight: 900, fontSize: '.75rem', marginBottom: 5 }}>{layer.number}</div>
            <h3 style={{ fontSize: '.98rem', marginBottom: 6 }}>{layer.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '.77rem', minHeight: 42, marginBottom: 10 }}>{layer.hint}</p>
            <textarea className="form-input" rows={6} disabled={locked || !selectedScenario} value={recovery?.[layer.field] || ''} onChange={event => updateField(layer.field, event.target.value)} onBlur={handleBlur} placeholder={layer.placeholder} style={{ fontSize: '.82rem' }} />
          </div>
        ))}
      </div>

      <div className="capa-layer" style={{ padding: 20, borderRadius: 12, background: emailBlocked ? 'rgba(239,68,68,.08)' : 'rgba(0,0,0,.18)', borderColor: emailBlocked ? 'var(--accent-danger)' : undefined }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.02rem' }}><MailWarning size={18} color={emailBlocked ? 'var(--accent-danger)' : 'var(--accent-primary)'} /> Bad News Email</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '.8rem', marginTop: 5 }}>Cấu trúc đề xuất: Fact → Impact → Action → Next update. Không nhận trách nhiệm tài chính khi chưa đủ bằng chứng.</p>
          </div>
          <span title={legalContext || 'Chưa có ghi chú chiến lược từ B03'} style={{ padding: '5px 9px', borderRadius: 999, background: 'rgba(59,130,246,.1)', color: 'var(--accent-primary)', fontSize: '.72rem', whiteSpace: 'nowrap' }}>
            Thị trường: {targetMarket || 'chưa chọn'}
          </span>
        </div>
        <textarea className="form-input" rows={7} disabled={locked || !selectedScenario} value={recovery?.bad_news_email || ''} onChange={event => updateField('bad_news_email', event.target.value)} onBlur={handleBlur} placeholder="Dear [Buyer], We have verified the following facts..." style={{ borderColor: emailBlocked ? 'var(--accent-danger)' : undefined, fontSize: '.85rem' }} />

        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 12, cursor: locked ? 'not-allowed' : 'pointer' }}>
          <input type="checkbox" checked={Boolean(recovery?.evidence_received)} disabled={locked || !selectedScenario} onChange={event => updateField('evidence_received', event.target.checked)} onBlur={handleBlur} style={{ marginTop: 4 }} />
          <span style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Đã nhận đủ bằng chứng độc lập</strong><br />Ảnh/video, biên bản giám định, dữ liệu vận tải hoặc xác nhận chính thức đã đủ để xem xét trách nhiệm.</span>
        </label>

        {emailBlocked ? (
          <div style={{ display: 'flex', gap: 9, marginTop: 14, padding: 12, borderRadius: 9, color: '#fca5a5', background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.35)', fontSize: '.82rem' }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span><strong>Logic Gate 5 đang chặn lưu:</strong> Email chứa “{matchedTerm}” nhưng chưa xác nhận bằng chứng. Hãy sửa cam kết hoặc đánh dấu bằng chứng sau khi thực sự xác minh.</span>
          </div>
        ) : recovery?.bad_news_email ? (
          <div style={{ display: 'flex', gap: 8, marginTop: 12, color: '#10b981', fontSize: '.8rem' }}><CheckCircle2 size={17} /> Email vượt qua Crisis Compliance Gate.</div>
        ) : null}
      </div>

      {isScenarioOpen && selectedScenario && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'grid', placeItems: 'center', padding: 24, background: 'rgba(2,6,23,.82)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ width: 'min(560px, 100%)', padding: 28, border: '1px solid rgba(245,158,11,.55)', boxShadow: '0 30px 80px rgba(0,0,0,.55)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <FileWarning size={34} color="#f59e0b" />
              <button onClick={() => setIsScenarioOpen(false)} aria-label="Đóng tình huống" style={{ border: 0, background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            <div style={{ color: '#f59e0b', fontSize: '.74rem', fontWeight: 900, letterSpacing: '.12em', marginTop: 20 }}>CRISIS INJECTOR</div>
            <h3 style={{ fontSize: '1.55rem', marginTop: 8 }}>{selectedScenario.title}</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.7 }}>{selectedScenario.detail}</p>
            <div style={{ padding: 14, borderRadius: 10, background: 'rgba(59,130,246,.08)', borderLeft: '3px solid var(--accent-primary)', color: 'var(--text-secondary)', fontSize: '.84rem', marginTop: 18 }}>
              Hãy đóng vai Incident Owner: khóa sự kiện bằng dữ kiện, lập CAPA ba lớp và gửi cập nhật xấu mà không cam kết quá mức.
            </div>
            <button className="btn btn-primary" onClick={() => setIsScenarioOpen(false)} style={{ width: '100%', marginTop: 22 }}>Nhận tình huống & xử lý</button>
          </div>
        </div>
      )}
    </section>
  );
}
