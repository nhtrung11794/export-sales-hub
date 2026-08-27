'use client';

import React from 'react';
import { BookOpenCheck, Download, FileCheck2, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import type { ModuleSubmission } from '@/store/useModuleStore';
import { M05FormData } from './M05_CombinedForm';

interface Props {
  data: M05FormData;
  setData: React.Dispatch<React.SetStateAction<M05FormData>>;
  handleBlur: () => void;
  isDisabled: boolean;
  isPrerequisiteComplete: boolean;
  submissions: Record<string, ModuleSubmission>;
}

type PlaybookType = 'market' | 'commercial' | 'execution';

function countWords(value: string) {
  return value.trim() ? value.trim().split(/\s+/).filter(Boolean).length : 0;
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function readable(value: unknown) {
  if (Array.isArray(value)) return value.map(item => typeof item === 'object' ? JSON.stringify(item) : String(item)).join('\n');
  if (value && typeof value === 'object') return JSON.stringify(value, null, 2);
  if (typeof value === 'boolean') return value ? 'Đã xác nhận' : 'Chưa xác nhận';
  return String(value ?? 'Chưa có dữ liệu');
}

function reportSection(title: string, rows: Array<[string, unknown]>) {
  return `
    <section>
      <h2>${escapeHtml(title)}</h2>
      ${rows.map(([label, value]) => `
        <div class="row">
          <div class="label">${escapeHtml(label)}</div>
          <div class="value">${escapeHtml(readable(value))}</div>
        </div>
      `).join('')}
    </section>
  `;
}

export default function B16_CapstoneHub({ data, setData, handleBlur, isDisabled, isPrerequisiteComplete, submissions }: Props) {
  const m01 = submissions.M01?.form_data || {};
  const m02 = submissions.M02?.form_data || {};
  const m03 = submissions.M03?.form_data || {};
  const m04 = submissions.M04?.form_data || {};
  const recovery = data.b14_recovery;
  const growth = data.b15_growth;

  const painText = Object.values(m02.discovery_matrix?.pain || {}).join(' ');
  const tradeoffText = (m04.b11_negotiation?.concessions || [])
    .map((item: { give_note?: string; take_note?: string }) => `${item.give_note || ''} ${item.take_note || ''}`)
    .join(' ');
  const capaText = `${recovery?.containment_action || ''} ${recovery?.root_cause || ''} ${recovery?.preventive_action || ''}`;
  const wordCounts = {
    pain: countWords(painText),
    tradeoff: countWords(tradeoffText),
    capa: countWords(capaText),
  };
  const totalCoreWords = wordCounts.pain + wordCounts.tradeoff + wordCounts.capa;
  const garbageFilterPassed = totalCoreWords >= 50;
  const locked = isDisabled || !isPrerequisiteComplete;

  const updateField = (field: keyof M05FormData['b16_capstone'], value: string) => {
    if (locked) return;
    setData(prev => ({ ...prev, b16_capstone: { ...prev.b16_capstone, [field]: value } }));
  };

  const openPlaybook = (type: PlaybookType) => {
    if (!garbageFilterPassed || locked) return;
    const titles: Record<PlaybookType, string> = {
      market: 'Playbook 01 — Market & Opportunity Development',
      commercial: 'Playbook 02 — Commercial Deal & Safe Closing',
      execution: 'Playbook 03 — Execution, Recovery & Account Growth',
    };

    let body = '';
    if (type === 'market') {
      body = [
        reportSection('Nền tảng năng lực', [
          ['Mục tiêu 90 ngày', m01.goal_90_days || m01.goals_90_days || m01.mad_libs],
          ['Năng lực lõi', m01.competency_radar],
        ]),
        reportSection('Thị trường & ICP', [
          ['Thị trường mục tiêu', m02.target_market],
          ['Route-to-market', m02.route_to_market],
          ['Lý do chiến lược', m02.strategic_reason],
          ['ICP', `${m02.icp_industry || ''} · ${m02.icp_size || ''}`],
          ['Buyer Pain', painText],
        ]),
        reportSection('Cơ hội & Pipeline', [
          ['F-N-A-C-M', m03.b07_qualification?.fnacm_scores],
          ['Phân loại phản hồi', m03.b07_qualification?.response_classification],
          ['Follow-up', m03.b08_pipeline?.follow_up_message],
        ]),
      ].join('');
    } else if (type === 'commercial') {
      body = [
        reportSection('Requirement & Quotation', [
          ['P-B-T-P-C', m04.b09_clarification],
          ['TCO Calculator', m04.b10_quotation?.tco_calculator],
          ['Pricing Options', m04.b10_quotation?.pricing_options],
        ]),
        reportSection('Negotiation & Safe Closing', [
          ['Buyer Objection', m04.b11_negotiation?.buyer_objection],
          ['Give–Take Bank', m04.b11_negotiation?.concessions],
          ['Phương thức thanh toán', m04.b12_closing?.selected_payment_method],
          ['Risk Justification', m04.b12_closing?.risk_justification],
        ]),
      ].join('');
    } else {
      body = [
        reportSection('Execution Control', [
          ['Internal SLA', data.b13_execution?.sla_checklist],
          ['Milestone Timeline', data.b13_execution?.milestones],
        ]),
        reportSection('Issue Recovery & CAPA', [
          ['Sự cố', recovery?.scenario_title],
          ['Containment', recovery?.containment_action],
          ['Root Cause', recovery?.root_cause],
          ['Preventive Action', recovery?.preventive_action],
          ['Bad News Email', recovery?.bad_news_email],
        ]),
        reportSection('Account Growth & 90-Day Plan', [
          ['Share of Wallet', `${growth?.current_wallet_share || 0}%`],
          ['Growth Potential', `${growth?.growth_potential || 0}%`],
          ['Growth Goals', growth?.goals],
          ['JBP Objective', growth?.growth_objective],
          ['Joint Initiatives', growth?.joint_initiatives],
          ['Relationship Plan', growth?.relationship_plan],
          ['Final Reflection', data.b16_capstone?.final_reflection],
          ['90-Day Action Plan', data.b16_capstone?.action_plan_90_days],
        ]),
      ].join('');
    }

    const reportWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!reportWindow) {
      window.alert('Trình duyệt đang chặn cửa sổ xuất PDF. Vui lòng cho phép pop-up và thử lại.');
      return;
    }

    reportWindow.document.write(`<!doctype html><html lang="vi"><head><meta charset="utf-8"/><title>${escapeHtml(titles[type])}</title><style>
      @page { size: A4; margin: 16mm; }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: Arial, sans-serif; color: #172033; font-size: 11pt; line-height: 1.5; }
      header { padding: 22px 24px; color: white; background: linear-gradient(135deg,#0f172a,#1d4ed8); border-radius: 14px; margin-bottom: 20px; }
      h1 { margin: 0 0 6px; font-size: 22pt; } header p { margin: 0; opacity: .8; }
      section { break-inside: avoid; margin: 0 0 18px; border: 1px solid #dbe3ef; border-radius: 10px; overflow: hidden; }
      h2 { margin: 0; padding: 10px 14px; font-size: 13pt; color: #1d4ed8; background: #eff6ff; }
      .row { display: grid; grid-template-columns: 30% 70%; border-top: 1px solid #edf1f7; }
      .label { padding: 9px 12px; font-weight: 700; background: #f8fafc; }
      .value { padding: 9px 12px; white-space: pre-wrap; overflow-wrap: anywhere; }
      footer { margin-top: 24px; color: #64748b; font-size: 9pt; text-align: center; }
      @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
    </style></head><body>
      <header><h1>${escapeHtml(titles[type])}</h1><p>Export Sales Interactive Hub · Xuất ngày ${new Date().toLocaleDateString('vi-VN')}</p></header>
      ${body}
      <footer>Capstone asset được kết xuất từ dữ liệu học tập M01–M05.</footer>
    </body></html>`);
    reportWindow.document.close();
    reportWindow.focus();
    window.setTimeout(() => reportWindow.print(), 350);
  };

  if (!isPrerequisiteComplete) {
    return (
      <section className="glass-panel" style={{ padding: 32, opacity: .35, filter: 'grayscale(100%)', pointerEvents: 'none' }}>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--text-muted)', marginBottom: 12 }}>Bài 16: Final Capstone & Playbook PDF</h2>
        <div style={{ display: 'flex', gap: 8, color: 'var(--accent-warning)' }}><Lock size={18} /> Hoàn thành mục tiêu JBP, sáng kiến chung và ngày review ở B15 để mở Capstone.</div>
      </section>
    );
  }

  return (
    <section className="glass-panel" style={{ padding: 32, opacity: isDisabled ? .6 : 1 }}>
      <style>{`
        .capstone-card { transition: all .25s ease; border: 1px solid rgba(255,255,255,.08); }
        .capstone-card:focus-within { border-color: var(--accent-primary); box-shadow: 0 4px 20px rgba(59,130,246,.15); transform: translateY(-2px); }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 26 }}>
        <div>
          <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.4rem', marginBottom: 8 }}>Bài 16: Final Capstone & Playbook Hub</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>Rà soát hành trình M01–M05 và kết xuất ba tài sản vận hành có thể dùng ngay.</p>
        </div>
        <span style={{ padding: '7px 11px', borderRadius: 999, background: garbageFilterPassed ? 'rgba(16,185,129,.1)' : 'rgba(245,158,11,.1)', color: garbageFilterPassed ? '#10b981' : '#f59e0b', fontSize: '.76rem', fontWeight: 800 }}>
          {totalCoreWords}/50 từ lõi
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, .8fr)', gap: 22 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="capstone-card" style={{ padding: 17, borderRadius: 12, background: 'rgba(0,0,0,.16)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', marginBottom: 12 }}><BookOpenCheck size={18} color="var(--accent-primary)" /> Hội đồng tự phản biện</h3>
            <textarea className="form-input" rows={6} disabled={locked} value={data.b16_capstone?.final_reflection || ''} onChange={event => updateField('final_reflection', event.target.value)} onBlur={handleBlur} placeholder="Ba quyết định tốt nhất, ba điểm còn yếu và bằng chứng cho thấy bạn đã thay đổi cách quản trị deal..." style={{ fontSize: '.84rem' }} />
          </div>
          <div className="capstone-card" style={{ padding: 17, borderRadius: 12, background: 'rgba(0,0,0,.16)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', marginBottom: 12 }}><Sparkles size={18} color="#f59e0b" /> Kế hoạch hành động 90 ngày</h3>
            <textarea className="form-input" rows={7} disabled={locked} value={data.b16_capstone?.action_plan_90_days || ''} onChange={event => updateField('action_plan_90_days', event.target.value)} onBlur={handleBlur} placeholder="30 ngày đầu: chuẩn hóa... · 60 ngày: thử nghiệm... · 90 ngày: đo lường và mở rộng..." style={{ fontSize: '.84rem' }} />
          </div>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div style={{ padding: 16, borderRadius: 12, background: garbageFilterPassed ? 'rgba(16,185,129,.08)' : 'rgba(245,158,11,.08)', border: `1px solid ${garbageFilterPassed ? 'rgba(16,185,129,.3)' : 'rgba(245,158,11,.3)'}` }}>
            <h3 style={{ display: 'flex', gap: 8, alignItems: 'center', color: garbageFilterPassed ? '#10b981' : '#f59e0b', fontSize: '.92rem' }}>
              {garbageFilterPassed ? <ShieldCheck size={18} /> : <Lock size={18} />} Garbage Filter
            </h3>
            <div style={{ display: 'grid', gap: 7, marginTop: 12, fontSize: '.78rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Buyer Pain (B05)</span><strong>{wordCounts.pain} từ</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Give–Take (B11)</span><strong>{wordCounts.tradeoff} từ</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>CAPA (B14)</span><strong>{wordCounts.capa} từ</strong></div>
            </div>
            {!garbageFilterPassed && <p style={{ color: '#fbbf24', fontSize: '.75rem', marginTop: 11 }}>Cần tối thiểu 50 từ có ý nghĩa trong ba vùng dữ liệu lõi trước khi xuất PDF.</p>}
          </div>

          {[
            { type: 'market' as const, label: 'Market & Opportunity', subtitle: 'M01–M03' },
            { type: 'commercial' as const, label: 'Commercial Deal', subtitle: 'M03–M04' },
            { type: 'execution' as const, label: 'Execution & Growth', subtitle: 'M05' },
          ].map(playbook => (
            <button key={playbook.type} className="btn btn-secondary" disabled={!garbageFilterPassed || locked} onClick={() => openPlaybook(playbook.type)} style={{ justifyContent: 'space-between', padding: '12px 14px', opacity: !garbageFilterPassed || locked ? .45 : 1 }}>
              <span style={{ textAlign: 'left' }}><strong style={{ display: 'block', fontSize: '.82rem' }}>{playbook.label}</strong><span style={{ color: 'var(--text-muted)', fontSize: '.7rem' }}>{playbook.subtitle}</span></span>
              {garbageFilterPassed ? <Download size={17} /> : <Lock size={16} />}
            </button>
          ))}

          {garbageFilterPassed && <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#10b981', fontSize: '.76rem', marginTop: 2 }}><FileCheck2 size={17} /> Sẵn sàng mở hộp thoại lưu PDF.</div>}
        </aside>
      </div>
    </section>
  );
}
