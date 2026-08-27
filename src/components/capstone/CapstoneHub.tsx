'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  CloudUpload,
  Download,
  Eye,
  FileCheck2,
  FileSearch,
  Globe2,
  Layers,
  Lock,
  Printer,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCircle,
  Users,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { createClient } from '@/lib/supabase/client';
import { useModuleStore } from '@/store/useModuleStore';

export interface CapstoneFormData {
  final_reflection: string;
  action_plan_90_days: string;
  review_notes?: string;
}

export const initialCapstoneData: CapstoneFormData = {
  final_reflection: '',
  action_plan_90_days: '',
  review_notes: '',
};

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

export default function CapstoneHub() {
  const supabase = useMemo(() => createClient(), []);
  const { submissions, updateSubmissionLocal } = useModuleStore();
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isOnline, setIsOnline] = useState(() => typeof navigator === 'undefined' ? true : navigator.onLine);
  const [isSplitViewOpen, setIsSplitViewOpen] = useState(false);
  const [activeSplitTab, setActiveSplitTab] = useState<'m01' | 'm02' | 'm03' | 'm04' | 'm05'>('m02');
  const [previewPlaybookType, setPreviewPlaybookType] = useState<PlaybookType | null>(null);

  const m01 = submissions.M01?.form_data || {};
  const m02 = submissions.M02?.form_data || {};
  const m03 = submissions.M03?.form_data || {};
  const m04 = submissions.M04?.form_data || {};
  const m05 = submissions.M05?.form_data || {};

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSave = useCallback(async (savedData: CapstoneFormData) => {
    if (!userId) return;
    updateSubmissionLocal('CAPSTONE', savedData);
    const { error } = await supabase
      .from('module_submissions')
      .upsert({
        user_id: userId,
        module_id: 'CAPSTONE',
        form_data: savedData,
        status: 'draft',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,module_id' });

    if (error) throw error;
  }, [supabase, updateSubmissionLocal, userId]);

  const { data, setData, status, lastSaved, handleBlur } = useAutoSave<CapstoneFormData>(
    'CAPSTONE',
    initialCapstoneData,
    handleSave,
    3000,
  );

  useEffect(() => {
    async function loadData() {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) return;
        setUserId(authData.user.id);

        const { data: submission, error } = await supabase
          .from('module_submissions')
          .select('form_data')
          .eq('user_id', authData.user.id)
          .eq('module_id', 'CAPSTONE')
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (submission?.form_data) {
          const fetched = submission.form_data as Partial<CapstoneFormData>;
          setData({ ...initialCapstoneData, ...fetched });
          updateSubmissionLocal('CAPSTONE', { ...initialCapstoneData, ...fetched });
        } else if (submissions.M05?.form_data?.b16_capstone) {
          // Backward compatibility check
          const legacy = submissions.M05.form_data.b16_capstone;
          setData({
            final_reflection: legacy.final_reflection || '',
            action_plan_90_days: legacy.action_plan_90_days || '',
            review_notes: '',
          });
        }
      } catch (error) {
        console.error('Lỗi nạp dữ liệu Capstone:', error);
      } finally {
        setIsInitializing(false);
      }
    }

    loadData();
  }, [setData, submissions.M05, supabase, updateSubmissionLocal]);

  const updateField = (field: keyof CapstoneFormData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const painText = Object.values(m02.discovery_matrix?.pain || {}).join(' ');
  const tradeoffText = (m04.b11_negotiation?.concessions || [])
    .map((item: { give_note?: string; take_note?: string }) => `${item.give_note || ''} ${item.take_note || ''}`)
    .join(' ');
  const capaText = `${m05.b14_recovery?.containment_action || ''} ${m05.b14_recovery?.root_cause || ''} ${m05.b14_recovery?.preventive_action || ''}`;
  const reflectionText = data.final_reflection || '';
  const actionPlanText = data.action_plan_90_days || '';

  const wordCounts = {
    pain: countWords(painText),
    tradeoff: countWords(tradeoffText),
    capa: countWords(capaText),
    reflection: countWords(reflectionText),
    actionPlan: countWords(actionPlanText),
  };

  const coreChecks = [
    { label: 'Buyer Pain (M02 / B05)', count: wordCounts.pain, min: 15, pass: wordCounts.pain >= 15 },
    { label: 'Give–Take Bank (M04 / B11)', count: wordCounts.tradeoff, min: 15, pass: wordCounts.tradeoff >= 15 },
    { label: 'CAPA Analysis (M05 / B14)', count: wordCounts.capa, min: 20, pass: wordCounts.capa >= 20 },
    { label: 'Hội đồng Tự phản biện (Capstone)', count: wordCounts.reflection, min: 15, pass: wordCounts.reflection >= 15 },
    { label: 'Kế hoạch 90 ngày (Capstone)', count: wordCounts.actionPlan, min: 15, pass: wordCounts.actionPlan >= 15 },
  ];

  const garbageFilterPassed = coreChecks.every(item => item.pass);

  const getPlaybookSections = (type: PlaybookType) => {
    if (type === 'market') {
      return [
        {
          title: '1. Nền tảng Năng lực & Mục tiêu Xuất khẩu',
          items: [
            { label: 'Mục tiêu 90 ngày', value: m01.goal_90_days || m01.goals_90_days || m01.mad_libs || 'Chưa hoàn thành M01' },
            { label: 'Radar Năng lực', value: m01.competency_radar },
          ],
        },
        {
          title: '2. Thị trường Mục tiêu & Chân dung Khách hàng (ICP)',
          items: [
            { label: 'Thị trường mục tiêu', value: m02.target_market || 'Chưa chọn' },
            { label: 'Kênh Route-to-market', value: m02.route_to_market || 'Chưa chọn' },
            { label: 'Lý do chiến lược & Pháp lý', value: m02.strategic_reason || 'Chưa có' },
            { label: 'ICP Phân khúc & Quy mô', value: `${m02.icp_industry || ''} · ${m02.icp_size || ''}` },
            { label: 'Nỗi đau Người mua (Buyer Pain)', value: painText || 'Chưa điền' },
          ],
        },
        {
          title: '3. Cơ hội & Phễu Tiếp cận (Opportunity Pipeline)',
          items: [
            { label: 'Điểm thẩm định F-N-A-C-M', value: m03.b07_qualification?.fnacm_scores },
            { label: 'Phân loại phản hồi Lead', value: m03.b07_qualification?.response_classification },
            { label: 'Kịch bản Follow-up', value: m03.b08_pipeline?.follow_up_message },
          ],
        },
      ];
    }
    if (type === 'commercial') {
      return [
        {
          title: '1. Làm rõ Yêu cầu (P-B-T-P-C) & Chào giá TCO',
          items: [
            { label: 'P-B-T-P-C Requirements', value: m04.b09_clarification },
            { label: 'TCO Calculator & Bóc tách chi phí', value: m04.b10_quotation?.tco_calculator },
            { label: 'Các phương án Chào giá (Pricing Options)', value: m04.b10_quotation?.pricing_options },
          ],
        },
        {
          title: '2. Đàm phán Thương vụ & Đóng gói Hợp đồng An toàn',
          items: [
            { label: 'Phản biện từ Buyer', value: m04.b11_negotiation?.buyer_objection },
            { label: 'Ngân hàng Concession (Give–Take Bank)', value: m04.b11_negotiation?.concessions },
            { label: 'Phương thức thanh toán đã chốt', value: m04.b12_closing?.selected_payment_method },
            { label: 'Giải trình rủi ro & Safe Checklist', value: m04.b12_closing?.risk_justification },
          ],
        },
      ];
    }
    return [
      {
        title: '1. Bàn giao Vận hành & SLA Kiểm soát (Execution Control)',
        items: [
          { label: 'Internal SLA Checklist', value: m05.b13_execution?.sla_checklist },
          { label: 'Milestone Kanban Timeline', value: m05.b13_execution?.milestones },
        ],
      },
      {
        title: '2. Xử lý Khủng hoảng & Khung CAPA 3 Lớp',
        items: [
          { label: 'Tình huống sự cố', value: m05.b14_recovery?.scenario_title },
          { label: '1. Containment Action (24h)', value: m05.b14_recovery?.containment_action },
          { label: '2. Root Cause (5-Why Analysis)', value: m05.b14_recovery?.root_cause },
          { label: '3. Preventive Action', value: m05.b14_recovery?.preventive_action },
          { label: 'Bad News Email', value: m05.b14_recovery?.bad_news_email },
        ],
      },
      {
        title: '3. Kế hoạch Tăng trưởng Tài khoản Chiến lược (JBP) & Capstone',
        items: [
          { label: 'Share of Wallet Matrix', value: `${m05.b15_growth?.current_wallet_share || 0}% (Nhu cầu: ${m05.b15_growth?.annual_demand_volume || 0} ${m05.b15_growth?.volume_unit || 'Cont'})` },
          { label: 'Mục tiêu JBP', value: m05.b15_growth?.growth_objective },
          { label: 'Sáng kiến JBP Initiatives', value: m05.b15_growth?.initiatives },
          { label: 'Value Exchange & Quan hệ đa tầng', value: `${m05.b15_growth?.value_exchange || ''} · ${m05.b15_growth?.relationship_plan || ''}` },
          { label: 'Hội đồng Tự phản biện', value: data.final_reflection },
          { label: 'Kế hoạch hành động 90 ngày', value: data.action_plan_90_days },
        ],
      },
    ];
  };

  const printPlaybook = (type: PlaybookType) => {
    const titles: Record<PlaybookType, string> = {
      market: 'Playbook 01 — Market & Opportunity Development',
      commercial: 'Playbook 02 — Commercial Deal & Safe Closing',
      execution: 'Playbook 03 — Execution, Recovery & Account Growth',
    };

    const sections = getPlaybookSections(type);
    const body = sections.map(sec => `
      <section>
        <h2>${escapeHtml(sec.title)}</h2>
        ${sec.items.map(item => `
          <div class="row">
            <div class="label">${escapeHtml(item.label)}</div>
            <div class="value">${escapeHtml(readable(item.value))}</div>
          </div>
        `).join('')}
      </section>
    `).join('');

    const reportWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!reportWindow) {
      window.alert('Trình duyệt đang chặn cửa sổ pop-up. Vui lòng cho phép pop-up để tải file PDF.');
      return;
    }

    reportWindow.document.write(`<!doctype html><html lang="vi"><head><meta charset="utf-8"/><title>${escapeHtml(titles[type])}</title><style>
      @page { size: A4; margin: 16mm; }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; font-size: 10.5pt; line-height: 1.55; position: relative; }
      .watermark { position: fixed; top: 45%; left: 10%; transform: rotate(-30deg); font-size: 44pt; color: rgba(203,213,225,0.25); font-weight: 900; z-index: -1; pointer-events: none; }
      header { padding: 22px 24px; color: white; background: linear-gradient(135deg,#0f172a 0%,#1e3a8a 100%); border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      h1 { margin: 0 0 6px; font-size: 20pt; } header p { margin: 0; opacity: .85; font-size: 9.5pt; }
      section { break-inside: avoid; margin: 0 0 18px; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; background: white; }
      h2 { margin: 0; padding: 10px 14px; font-size: 12pt; color: #1e40af; background: #f1f5f9; border-bottom: 1px solid #cbd5e1; font-weight: 700; }
      .row { display: grid; grid-template-columns: 32% 68%; border-top: 1px solid #f1f5f9; }
      .label { padding: 8px 12px; font-weight: 600; background: #f8fafc; color: #475569; border-right: 1px solid #f1f5f9; }
      .value { padding: 8px 12px; white-space: pre-wrap; overflow-wrap: anywhere; color: #0f172a; }
      footer { margin-top: 24px; color: #94a3b8; font-size: 8.5pt; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
      @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
    </style></head><body>
      <div class="watermark">FINAL CAPSTONE PLAYBOOK</div>
      <header>
        <h1>${escapeHtml(titles[type])}</h1>
        <p>Hệ thống Học tập Xuất khẩu B2B Thực Chiến · Xuất ngày ${new Date().toLocaleDateString('vi-VN')} · Xác thực tiêu chuẩn Capstone</p>
      </header>
      ${body}
      <footer>Tài sản vận hành doanh nghiệp được kết xuất từ toàn bộ dữ liệu thực hành 15 buổi học M01 đến M05.</footer>
    </body></html>`);
    reportWindow.document.close();
    reportWindow.focus();
    window.setTimeout(() => reportWindow.print(), 400);
  };

  if (isInitializing) {
    return <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>Đang nạp dữ liệu Final Capstone Hub...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <style>{`
        .capstone-card { transition: all .25s ease; border: 1px solid rgba(255,255,255,.08); }
        .capstone-card:focus-within { border-color: var(--accent-primary); box-shadow: 0 4px 20px rgba(59,130,246,.15); transform: translateY(-2px); }
      `}</style>

      {/* Top Status Bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        padding: '12px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 12,
        border: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.85rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: isOnline ? '#10b981' : 'var(--accent-danger)' }}>
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            {isOnline ? 'Online' : 'Mất kết nối'}
          </span>
          <span style={{
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: '.75rem',
            fontWeight: 700,
            border: '1px solid var(--accent-primary)',
            background: 'rgba(59,130,246,.15)',
            color: 'var(--accent-primary)',
          }}>
            🏆 Khoang Final Capstone Độc Lập
          </span>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {status === 'saving' && <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-primary)' }}><CloudUpload size={16} /> Đang lưu...</span>}
          {status === 'saved' && <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981' }}><CheckCircle2 size={16} /> Đã lưu {lastSaved ? lastSaved.toLocaleTimeString('vi-VN') : ''}</span>}
        </div>
      </div>

      {/* ZONE 1: Trạm Rà Soát Toàn Khóa (M01-M05) */}
      <section className="glass-panel" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: 'var(--accent-primary)', fontSize: '.76rem', fontWeight: 900, letterSpacing: '.1em', marginBottom: 4 }}>ZONE 01 · TỔNG HỢP HÀNH TRÌNH</div>
            <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Trạm Rà Soát Toàn Bộ 15 Buổi Học (M01–M05)</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '.84rem', marginTop: 4 }}>Kiểm tra tính nhất quán giữa Mục tiêu, Chân dung ICP, Báo giá TCO, Đàm phán và Kế hoạch Vận hành.</p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsSplitViewOpen(true)}
            style={{ gap: 8, fontSize: '.82rem', padding: '9px 16px' }}
          >
            <FileSearch size={16} /> Mở Split-View Đối Chiếu Deal (B01–B15)
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
          {[
            { id: 'M01', label: 'Module 01: Mindset & Goal', subtitle: 'B01 - B02 (Năng lực & 90 Ngày)', icon: <UserCircle size={18} />, pass: Boolean(m01.goal_90_days || m01.goals_90_days || m01.mad_libs) },
            { id: 'M02', label: 'Module 02: Market & ICP', subtitle: 'B03 - B06 (Thị trường & Pain)', icon: <Globe2 size={18} />, pass: Boolean(m02.target_market && painText.length >= 10) },
            { id: 'M03', label: 'Module 03: Opportunity', subtitle: 'B07 - B08 (F-N-A-C-M & Follow-up)', icon: <Users size={18} />, pass: Boolean(m03.b07_qualification) },
            { id: 'M04', label: 'Module 04: Commercial Deal', subtitle: 'B09 - B12 (TCO & Safe Closing)', icon: <Layers size={18} />, pass: Boolean(m04.b12_closing?.selected_payment_method) },
            { id: 'M05', label: 'Module 05: Execution & JBP', subtitle: 'B13 - B15 (Kanban, CAPA, JBP)', icon: <Rocket size={18} />, pass: Boolean(m05.b15_growth?.growth_objective) },
          ].map(mod => (
            <div key={mod.id} style={{ padding: 14, borderRadius: 10, background: mod.pass ? 'rgba(16,185,129,.06)' : 'rgba(15,23,42,.45)', border: `1px solid ${mod.pass ? 'rgba(16,185,129,.25)' : 'rgba(255,255,255,.08)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: mod.pass ? '#10b981' : 'var(--accent-primary)' }}>{mod.icon}</span>
                <span style={{ fontSize: '.72rem', fontWeight: 700, color: mod.pass ? '#10b981' : 'var(--text-muted)' }}>
                  {mod.pass ? 'Đã hoàn thành ✓' : 'Đang thực hiện'}
                </span>
              </div>
              <strong style={{ display: 'block', fontSize: '.84rem', color: 'var(--text-primary)' }}>{mod.label}</strong>
              <span style={{ fontSize: '.72rem', color: 'var(--text-secondary)' }}>{mod.subtitle}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ZONE 2 & ZONE 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(320px, .75fr)', gap: 24 }}>
        
        {/* ZONE 2: Tự phản biện & Kế hoạch 90 ngày */}
        <section className="glass-panel" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div style={{ color: '#f59e0b', fontSize: '.76rem', fontWeight: 900, letterSpacing: '.1em', marginBottom: 4 }}>ZONE 02 · TỰ PHẢN BIỆN & HÀNH ĐỘNG</div>
            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Hội Đồng Tự Phản Biện & Kế Hoạch 90 Ngày</h2>
          </div>

          <div className="capstone-card" style={{ padding: 18, borderRadius: 12, background: 'rgba(0,0,0,.16)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', marginBottom: 6 }}>
              <BookOpenCheck size={18} color="var(--accent-primary)" /> 1. Hội đồng Tự phản biện (Self-Reflection & Deal Defense)
            </h3>
            <p style={{ fontSize: '.78rem', color: 'var(--text-secondary)', marginBottom: 12 }}>Tổng kết 3 quyết định chiến lược tốt nhất, 3 điểm thỏa hiệp còn rủi ro và bài học lớn nhất sau 15 buổi thực hành.</p>
            <textarea className="form-input" rows={6} value={data.final_reflection || ''} onChange={e => updateField('final_reflection', e.target.value)} onBlur={handleBlur} placeholder="1. Quyết định chiến lược: Chọn thị trường và cấu trúc TCO...&#10;2. Điểm thỏa hiệp rủi ro: Điều khoản thanh toán D/P cần bảo hiểm...&#10;3. Sự thay đổi tư duy: Từ người chào giá thụ động sang kiến trúc sư thương vụ..." style={{ fontSize: '.84rem', lineHeight: 1.6 }} />
          </div>

          <div className="capstone-card" style={{ padding: 18, borderRadius: 12, background: 'rgba(0,0,0,.16)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', marginBottom: 6 }}>
              <Sparkles size={18} color="#f59e0b" /> 2. Kế hoạch Hành động 90 Ngày Đưa Vào Doanh Nghiệp (90-Day Execution Plan)
            </h3>
            <p style={{ fontSize: '.78rem', color: 'var(--text-secondary)', marginBottom: 12 }}>Phân kỳ 30 - 60 - 90 ngày để ứng dụng các Playbook vào doanh nghiệp xuất khẩu thực tế của bạn.</p>
            <textarea className="form-input" rows={6} value={data.action_plan_90_days || ''} onChange={e => updateField('action_plan_90_days', e.target.value)} onBlur={handleBlur} placeholder="• 30 ngày đầu: Chuẩn hóa bộ chứng từ và Internal SLA Bàn giao B13 với nhà máy.&#10;• 60 ngày tiếp theo: Áp dụng Give-Take Bank và công thức TCO khi gửi Báo giá B10.&#10;• 90 ngày: Thiết lập JBP định kỳ với top 20% Buyer chiến lược để tăng 25% Share of Wallet." style={{ fontSize: '.84rem', lineHeight: 1.6 }} />
          </div>
        </section>

        {/* ZONE 3: Trung Tâm Xuất Bản 3 Playbook PDF */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: 20, borderRadius: 12, background: garbageFilterPassed ? 'rgba(16,185,129,.08)' : 'rgba(245,158,11,.08)', border: `1px solid ${garbageFilterPassed ? 'rgba(16,185,129,.3)' : 'rgba(245,158,11,.3)'}` }}>
            <h3 style={{ display: 'flex', gap: 8, alignItems: 'center', color: garbageFilterPassed ? '#10b981' : '#f59e0b', fontSize: '.95rem', margin: 0 }}>
              {garbageFilterPassed ? <ShieldCheck size={19} /> : <AlertTriangle size={19} />} Garbage Filter (Kiểm tra Độ sâu Dữ liệu)
            </h3>
            <p style={{ fontSize: '.74rem', color: 'var(--text-muted)', marginTop: 6, marginBottom: 12 }}>Kiểm duyệt tự động độ sâu dữ liệu trên toàn bộ 15 buổi trước khi mở khóa xuất bản Playbook PDF.</p>
            
            <div style={{ display: 'grid', gap: 8, fontSize: '.78rem' }}>
              {coreChecks.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: 6, background: item.pass ? 'rgba(16,185,129,.06)' : 'rgba(239,68,68,.08)', border: `1px solid ${item.pass ? 'rgba(16,185,129,.2)' : 'rgba(239,68,68,.2)'}` }}>
                  <span style={{ color: item.pass ? 'var(--text-primary)' : '#fca5a5' }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: item.pass ? '#10b981' : '#ef4444' }}>
                    {item.count}/{item.min} từ {item.pass ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>

            {!garbageFilterPassed && (
              <p style={{ color: '#fbbf24', fontSize: '.75rem', marginTop: 12, lineHeight: 1.4 }}>
                ⚠️ Cần hoàn thiện độ sâu các ô dữ liệu trước khi kết xuất file PDF.
              </p>
            )}
          </div>

          <div className="glass-panel" style={{ padding: 20 }}>
            <div style={{ color: 'var(--accent-primary)', fontSize: '.76rem', fontWeight: 900, letterSpacing: '.1em', marginBottom: 4 }}>ZONE 03 · CỖ MÁY KẾT XUẤT TÀI SẢN</div>
            <h3 style={{ fontSize: '1.05rem', margin: '0 0 14px' }}>Bộ 03 Playbook Xuất Khẩu B2B</h3>

            <div style={{ display: 'grid', gap: 10 }}>
              {[
                { type: 'market' as const, label: 'Playbook 01: Market & Outreach', subtitle: 'ICP, Nỗi đau Buyer & Phễu Qualification (M01–M03)' },
                { type: 'commercial' as const, label: 'Playbook 02: Commercial Deal Desk', subtitle: 'TCO Quotation, Give–Take Bank & Safe Closing (M04)' },
                { type: 'execution' as const, label: 'Playbook 03: Execution & JBP Growth', subtitle: 'Kanban SLA, CAPA Khủng hoảng & JBP 90 Ngày (M05)' },
              ].map(playbook => (
                <div key={playbook.type} style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={!garbageFilterPassed}
                    onClick={() => setPreviewPlaybookType(playbook.type)}
                    style={{ flex: 1, justifyContent: 'space-between', padding: '12px 14px', opacity: !garbageFilterPassed ? .45 : 1 }}
                    title="Xem trước tài sản"
                  >
                    <span style={{ textAlign: 'left' }}>
                      <strong style={{ display: 'block', fontSize: '.82rem' }}>{playbook.label}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '.7rem' }}>{playbook.subtitle}</span>
                    </span>
                    <Eye size={17} color="var(--accent-primary)" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!garbageFilterPassed}
                    onClick={() => printPlaybook(playbook.type)}
                    style={{ padding: '0 14px', opacity: !garbageFilterPassed ? .45 : 1 }}
                    title="In / Tải PDF ngay"
                  >
                    {garbageFilterPassed ? <Download size={16} /> : <Lock size={16} />}
                  </button>
                </div>
              ))}
            </div>

            {garbageFilterPassed && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#10b981', fontSize: '.76rem', marginTop: 12 }}>
                <FileCheck2 size={17} /> Sẵn sàng kết xuất Playbook chính thức có dấu Watermark!
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Split-View Drawer */}
      {isSplitViewOpen && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', justifyContent: 'flex-end', background: 'rgba(2,6,23,.75)', backdropFilter: 'blur(6px)' }}>
          <div className="glass-panel" style={{ width: 'min(780px, 92vw)', height: '100vh', borderRadius: 0, borderLeft: '1px solid rgba(59,130,246,.4)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileSearch size={20} color="var(--accent-primary)" /> Ngăn Kéo Đối Chiếu Dữ Liệu Toàn Khóa (B01–B15)
                </h3>
                <p style={{ fontSize: '.76rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Rà soát tính nhất quán giữa Mục tiêu, Nỗi đau Buyer, Chào giá và Kế hoạch vận hành.</p>
              </div>
              <button onClick={() => setIsSplitViewOpen(false)} aria-label="Đóng ngăn kéo" style={{ border: 0, background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ display: 'flex', gap: 8, padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,.08)', background: 'rgba(0,0,0,.2)', overflowX: 'auto' }}>
              {[
                { id: 'm01' as const, label: 'M01: Năng lực & Mục tiêu' },
                { id: 'm02' as const, label: 'M02: Thị trường & ICP' },
                { id: 'm03' as const, label: 'M03: Phễu Cơ hội' },
                { id: 'm04' as const, label: 'M04: TCO & Đàm phán' },
                { id: 'm05' as const, label: 'M05: SLA & CAPA' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSplitTab(tab.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: '.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: activeSplitTab === tab.id ? '1px solid var(--accent-primary)' : '1px solid transparent',
                    background: activeSplitTab === tab.id ? 'rgba(59,130,246,.15)' : 'transparent',
                    color: activeSplitTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeSplitTab === 'm01' && (
                <div style={{ display: 'grid', gap: 14 }}>
                  <div className="capstone-card" style={{ padding: 16, borderRadius: 10, background: 'rgba(0,0,0,.18)' }}>
                    <strong style={{ color: 'var(--accent-primary)', fontSize: '.86rem', display: 'block', marginBottom: 6 }}>Mục tiêu 90 ngày (Mad Libs):</strong>
                    <div style={{ fontSize: '.84rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{m01.goal_90_days || m01.goals_90_days || m01.mad_libs || 'Chưa điền dữ liệu M01'}</div>
                  </div>
                  <div className="capstone-card" style={{ padding: 16, borderRadius: 10, background: 'rgba(0,0,0,.18)' }}>
                    <strong style={{ color: 'var(--accent-primary)', fontSize: '.86rem', display: 'block', marginBottom: 6 }}>Đánh giá Năng lực lõi:</strong>
                    <pre style={{ fontSize: '.78rem', color: 'var(--text-secondary)' }}>{readable(m01.competency_radar)}</pre>
                  </div>
                </div>
              )}

              {activeSplitTab === 'm02' && (
                <div style={{ display: 'grid', gap: 14 }}>
                  <div className="capstone-card" style={{ padding: 16, borderRadius: 10, background: 'rgba(0,0,0,.18)' }}>
                    <strong style={{ color: 'var(--accent-primary)', fontSize: '.86rem', display: 'block', marginBottom: 6 }}>Thị trường & Lý do Chiến lược (B03):</strong>
                    <div style={{ fontSize: '.84rem', color: 'var(--text-primary)' }}>Thị trường: {m02.target_market || 'Chưa chọn'} · RTM: {m02.route_to_market || 'Chưa chọn'}</div>
                    <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)', marginTop: 6 }}>{m02.strategic_reason || 'Chưa có ghi chú'}</div>
                  </div>
                  <div className="capstone-card" style={{ padding: 16, borderRadius: 10, background: 'rgba(0,0,0,.18)' }}>
                    <strong style={{ color: 'var(--accent-primary)', fontSize: '.86rem', display: 'block', marginBottom: 6 }}>Chân dung ICP & Nỗi đau Người mua (B04 - B05):</strong>
                    <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>Quy mô / Ngành: {m02.icp_industry || 'N/A'} · {m02.icp_size || 'N/A'}</div>
                    <div style={{ fontSize: '.84rem', color: 'var(--text-primary)', marginTop: 8, whiteSpace: 'pre-wrap' }}>Nỗi đau trọng yếu: {painText || 'Chưa có dữ liệu nỗi đau'}</div>
                  </div>
                </div>
              )}

              {activeSplitTab === 'm03' && (
                <div style={{ display: 'grid', gap: 14 }}>
                  <div className="capstone-card" style={{ padding: 16, borderRadius: 10, background: 'rgba(0,0,0,.18)' }}>
                    <strong style={{ color: 'var(--accent-primary)', fontSize: '.86rem', display: 'block', marginBottom: 6 }}>Thẩm định Cơ hội F-N-A-C-M (B07):</strong>
                    <pre style={{ fontSize: '.78rem', color: 'var(--text-secondary)' }}>{readable(m03.b07_qualification)}</pre>
                  </div>
                  <div className="capstone-card" style={{ padding: 16, borderRadius: 10, background: 'rgba(0,0,0,.18)' }}>
                    <strong style={{ color: 'var(--accent-primary)', fontSize: '.86rem', display: 'block', marginBottom: 6 }}>Follow-up Kịch bản Tiếp cận (B08):</strong>
                    <div style={{ fontSize: '.84rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{m03.b08_pipeline?.follow_up_message || 'Chưa có kịch bản follow-up'}</div>
                  </div>
                </div>
              )}

              {activeSplitTab === 'm04' && (
                <div style={{ display: 'grid', gap: 14 }}>
                  <div className="capstone-card" style={{ padding: 16, borderRadius: 10, background: 'rgba(0,0,0,.18)' }}>
                    <strong style={{ color: 'var(--accent-primary)', fontSize: '.86rem', display: 'block', marginBottom: 6 }}>Yêu cầu P-B-T-P-C & Báo giá TCO (B09 - B10):</strong>
                    <pre style={{ fontSize: '.78rem', color: 'var(--text-secondary)' }}>{readable(m04.b09_clarification)}</pre>
                  </div>
                  <div className="capstone-card" style={{ padding: 16, borderRadius: 10, background: 'rgba(0,0,0,.18)' }}>
                    <strong style={{ color: 'var(--accent-primary)', fontSize: '.86rem', display: 'block', marginBottom: 6 }}>Give–Take Bank & Phương thức Thanh toán (B11 - B12):</strong>
                    <div style={{ fontSize: '.84rem', color: '#10b981', fontWeight: 700 }}>Thanh toán: {m04.b12_closing?.selected_payment_method || 'Chưa chọn'}</div>
                    <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)', marginTop: 6 }}>{tradeoffText || 'Chưa điền Give-Take'}</div>
                  </div>
                </div>
              )}

              {activeSplitTab === 'm05' && (
                <div style={{ display: 'grid', gap: 14 }}>
                  <div className="capstone-card" style={{ padding: 16, borderRadius: 10, background: 'rgba(0,0,0,.18)' }}>
                    <strong style={{ color: 'var(--accent-primary)', fontSize: '.86rem', display: 'block', marginBottom: 6 }}>Internal SLA & Milestone (B13):</strong>
                    <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>{m05.b13_execution?.milestones?.map((m: any) => `${m.title} (${m.lead_time_days || 0} ngày) - ${m.status}`).join('; ')}</div>
                  </div>
                  <div className="capstone-card" style={{ padding: 16, borderRadius: 10, background: 'rgba(0,0,0,.18)' }}>
                    <strong style={{ color: 'var(--accent-primary)', fontSize: '.86rem', display: 'block', marginBottom: 6 }}>Sự cố & CAPA 3 Lớp (B14):</strong>
                    <div style={{ fontSize: '.84rem', color: '#f59e0b' }}>Sự cố: {m05.b14_recovery?.scenario_title || 'Chưa kích hoạt'}</div>
                    <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>Root Cause: {m05.b14_recovery?.root_cause || 'Chưa phân tích'}</div>
                  </div>
                  <div className="capstone-card" style={{ padding: 16, borderRadius: 10, background: 'rgba(0,0,0,.18)' }}>
                    <strong style={{ color: 'var(--accent-primary)', fontSize: '.86rem', display: 'block', marginBottom: 6 }}>Tăng trưởng Tài khoản JBP (B15):</strong>
                    <div style={{ fontSize: '.84rem', color: '#10b981' }}>Share of Wallet: {m05.b15_growth?.current_wallet_share}% (Nhu cầu: {m05.b15_growth?.annual_demand_volume} {m05.b15_growth?.volume_unit})</div>
                    <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>Mục tiêu: {m05.b15_growth?.growth_objective || 'Chưa lập'}</div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,.08)', textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={() => setIsSplitViewOpen(false)}>Đóng Ngăn Kéo</button>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewPlaybookType && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'grid', placeItems: 'center', padding: 24, background: 'rgba(2,6,23,.85)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ width: 'min(860px, 95vw)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', border: '1px solid rgba(59,130,246,.5)', boxShadow: '0 30px 80px rgba(0,0,0,.6)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Layers size={22} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                  Xem trước: {previewPlaybookType === 'market' ? 'Playbook 01 (Market)' : previewPlaybookType === 'commercial' ? 'Playbook 02 (Commercial)' : 'Playbook 03 (Execution & JBP)'}
                </h3>
              </div>
              <button onClick={() => setPreviewPlaybookType(null)} aria-label="Đóng xem trước" style={{ border: 0, background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}><X size={22} /></button>
            </div>

            <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {getPlaybookSections(previewPlaybookType).map((sec, sIdx) => (
                <div key={sIdx} style={{ borderRadius: 10, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(15,23,42,.6)', overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', background: 'rgba(59,130,246,.12)', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '.9rem', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                    {sec.title}
                  </div>
                  <div style={{ display: 'grid' }}>
                    {sec.items.map((row, rIdx) => (
                      <div key={rIdx} style={{ display: 'grid', gridTemplateColumns: '32% 68%', borderTop: rIdx ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                        <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,.2)', color: 'var(--text-secondary)', fontSize: '.82rem', fontWeight: 600 }}>{row.label}</div>
                        <div style={{ padding: '10px 14px', fontSize: '.84rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{readable(row.value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>Watermark bản quyền sẽ tự động đính kèm khi in ra PDF.</span>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => setPreviewPlaybookType(null)}>Đóng</button>
                <button className="btn btn-primary" onClick={() => { const t = previewPlaybookType; setPreviewPlaybookType(null); printPlaybook(t); }} style={{ gap: 6 }}>
                  <Printer size={16} /> Xuất / In File PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
