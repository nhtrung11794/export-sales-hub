'use client';

import React from 'react';
import { CalendarDays, CheckCircle2, Crosshair, Lock, Network, TrendingUp, UsersRound } from 'lucide-react';
import { isB14Complete, M05FormData } from './M05_CombinedForm';

interface Props {
  data: M05FormData;
  setData: React.Dispatch<React.SetStateAction<M05FormData>>;
  handleBlur: () => void;
  isDisabled: boolean;
  isPrerequisiteComplete: boolean;
}

const QUADRANTS = [
  { id: 'protect', label: 'PROTECT', hint: 'Thị phần cao · Tiềm năng thấp', x: 0, y: 0, color: '#3b82f6' },
  { id: 'expand', label: 'EXPAND', hint: 'Thị phần cao · Tiềm năng cao', x: 1, y: 0, color: '#10b981' },
  { id: 'qualify', label: 'QUALIFY', hint: 'Thị phần thấp · Tiềm năng thấp', x: 0, y: 1, color: '#64748b' },
  { id: 'invest', label: 'INVEST', hint: 'Thị phần thấp · Tiềm năng cao', x: 1, y: 1, color: '#f59e0b' },
];

export default function B15_AccountGrowth({ data, setData, handleBlur, isDisabled, isPrerequisiteComplete }: Props) {
  const growth = data.b15_growth;
  const locked = isDisabled || !isPrerequisiteComplete;
  const currentShare = Number(growth?.current_wallet_share) || 0;
  const potential = Number(growth?.growth_potential) || 0;
  const activeQuadrant = currentShare >= 50
    ? (potential >= 50 ? 'expand' : 'protect')
    : (potential >= 50 ? 'invest' : 'qualify');

  const deliveredCount = (data.b13_execution?.milestones || []).filter(item => item.status === 'delivered').length;
  const trustScore = Math.min(100, deliveredCount * 15 + (isB14Complete(data) ? 40 : 0));

  const updateField = <K extends keyof M05FormData['b15_growth']>(field: K, value: M05FormData['b15_growth'][K]) => {
    if (locked) return;
    setData(prev => ({ ...prev, b15_growth: { ...prev.b15_growth, [field]: value } }));
  };

  const updateGoal = (field: keyof M05FormData['b15_growth']['goals'], checked: boolean) => {
    if (locked) return;
    setData(prev => ({ ...prev, b15_growth: { ...prev.b15_growth, goals: { ...prev.b15_growth.goals, [field]: checked } } }));
  };

  if (!isPrerequisiteComplete) {
    return (
      <section className="glass-panel" style={{ padding: 32, opacity: .35, filter: 'grayscale(100%)', pointerEvents: 'none' }}>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--text-muted)', marginBottom: 12 }}>Bài 15: Account Growth & JBP</h2>
        <div style={{ display: 'flex', gap: 8, color: 'var(--accent-warning)' }}><Lock size={18} /> Hoàn thành case CAPA và Email Bad News hợp lệ ở B14 để mở kế hoạch tăng trưởng.</div>
      </section>
    );
  }

  return (
    <section className="glass-panel" style={{ padding: 32, opacity: isDisabled ? .6 : 1 }}>
      <style>{`
        .jbp-card { transition: all .25s ease; border: 1px solid rgba(255,255,255,.08); }
        .jbp-card:focus-within { border-color: var(--accent-primary); box-shadow: 0 4px 20px rgba(59,130,246,.15); transform: translateY(-2px); }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 26 }}>
        <div>
          <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.4rem', marginBottom: 8 }}>Bài 15: Account Growth & JBP Mini</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>Chuyển một đơn hàng thành nền tảng repeat order và quan hệ tài khoản chiến lược.</p>
        </div>
        <div title="Trust được tính từ milestone Delivered và CAPA hoàn chỉnh" style={{ minWidth: 128, padding: '9px 13px', borderRadius: 12, background: trustScore >= 60 ? 'rgba(16,185,129,.1)' : 'rgba(245,158,11,.1)', color: trustScore >= 60 ? '#10b981' : '#f59e0b', textAlign: 'center', fontSize: '.78rem' }}>
          <strong style={{ display: 'block', fontSize: '1.05rem' }}>{trustScore}/100</strong> Execution Trust
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, .9fr) minmax(360px, 1.1fr)', gap: 22, marginBottom: 24 }}>
        <div className="jbp-card" style={{ padding: 18, borderRadius: 13, background: 'rgba(0,0,0,.17)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.02rem', marginBottom: 16 }}><Crosshair size={18} color="var(--accent-primary)" /> Share of Wallet Matrix</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 18 }}>
            {QUADRANTS.map(item => {
              const active = activeQuadrant === item.id;
              return (
                <div key={item.id} style={{ minHeight: 94, padding: 12, borderRadius: 10, border: `1px solid ${active ? item.color : 'rgba(255,255,255,.08)'}`, background: active ? `${item.color}18` : 'rgba(15,23,42,.42)', boxShadow: active ? `0 6px 20px ${item.color}18` : 'none' }}>
                  <div style={{ color: active ? item.color : 'var(--text-secondary)', fontWeight: 900, fontSize: '.82rem' }}>{item.label}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '.7rem', marginTop: 5 }}>{item.hint}</div>
                  {active && <CheckCircle2 size={16} color={item.color} style={{ marginTop: 8 }} />}
                </div>
              );
            })}
          </div>

          <label style={{ display: 'block', fontSize: '.8rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
            Share of Wallet hiện tại: <strong style={{ color: 'var(--text-primary)' }}>{currentShare}%</strong>
            <input type="range" min="0" max="100" value={currentShare} disabled={locked} onChange={event => updateField('current_wallet_share', Number(event.target.value))} onBlur={handleBlur} style={{ width: '100%', marginTop: 7, accentColor: 'var(--accent-primary)' }} />
          </label>
          <label style={{ display: 'block', fontSize: '.8rem', color: 'var(--text-secondary)' }}>
            Tiềm năng tăng trưởng: <strong style={{ color: 'var(--text-primary)' }}>{potential}%</strong>
            <input type="range" min="0" max="100" value={potential} disabled={locked} onChange={event => updateField('growth_potential', Number(event.target.value))} onBlur={handleBlur} style={{ width: '100%', marginTop: 7, accentColor: '#10b981' }} />
          </label>
        </div>

        <div className="jbp-card" style={{ padding: 18, borderRadius: 13, background: 'rgba(0,0,0,.17)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.02rem', marginBottom: 14 }}><TrendingUp size={18} color="#10b981" /> Hướng tăng trưởng ưu tiên</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { key: 'repeat_order' as const, label: 'Repeat Order', hint: 'Tăng tần suất' },
              { key: 'upsell' as const, label: 'Up-sell', hint: 'Tăng giá trị' },
              { key: 'cross_sell' as const, label: 'Cross-sell', hint: 'Mở danh mục' },
            ].map(goal => {
              const checked = Boolean(growth?.goals?.[goal.key]);
              return (
                <label key={goal.key} style={{ padding: 12, borderRadius: 10, textAlign: 'center', cursor: locked ? 'not-allowed' : 'pointer', background: checked ? 'rgba(16,185,129,.1)' : 'rgba(15,23,42,.45)', border: `1px solid ${checked ? '#10b981' : 'rgba(255,255,255,.08)'}` }}>
                  <input type="checkbox" checked={checked} disabled={locked} onChange={event => updateGoal(goal.key, event.target.checked)} onBlur={handleBlur} />
                  <strong style={{ display: 'block', color: checked ? '#10b981' : 'var(--text-primary)', fontSize: '.84rem', marginTop: 7 }}>{goal.label}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '.7rem' }}>{goal.hint}</span>
                </label>
              );
            })}
          </div>
          <label style={{ display: 'block', fontSize: '.8rem', color: 'var(--text-secondary)' }}>
            Mục tiêu kinh doanh chung trong 6–12 tháng
            <textarea className="form-input" rows={5} disabled={locked} value={growth?.growth_objective || ''} onChange={event => updateField('growth_objective', event.target.value)} onBlur={handleBlur} placeholder="VD: Tăng doanh số tài khoản 30% nhưng giữ OTIF ≥ 95% và giảm claim xuống dưới 1%..." style={{ marginTop: 7, fontSize: '.84rem' }} />
          </label>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <label className="jbp-card" style={{ padding: 15, borderRadius: 11, background: 'rgba(15,23,42,.4)', color: 'var(--text-secondary)', fontSize: '.8rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-primary)', fontWeight: 700 }}><UsersRound size={16} color="var(--accent-primary)" /> Joint Initiatives</span>
          <textarea className="form-input" rows={4} disabled={locked} value={growth?.joint_initiatives || ''} onChange={event => updateField('joint_initiatives', event.target.value)} onBlur={handleBlur} placeholder="Dự án chung, forecast, thử SKU, chương trình thị trường..." style={{ marginTop: 8, fontSize: '.82rem' }} />
        </label>
        <label className="jbp-card" style={{ padding: 15, borderRadius: 11, background: 'rgba(15,23,42,.4)', color: 'var(--text-secondary)', fontSize: '.8rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-primary)', fontWeight: 700 }}><TrendingUp size={16} color="#10b981" /> Value Exchange</span>
          <textarea className="form-input" rows={4} disabled={locked} value={growth?.value_exchange || ''} onChange={event => updateField('value_exchange', event.target.value)} onBlur={handleBlur} placeholder="Buyer cam kết gì và doanh nghiệp bạn đầu tư gì để cùng tăng trưởng?" style={{ marginTop: 8, fontSize: '.82rem' }} />
        </label>
        <label className="jbp-card" style={{ padding: 15, borderRadius: 11, background: 'rgba(15,23,42,.4)', color: 'var(--text-secondary)', fontSize: '.8rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-primary)', fontWeight: 700 }}><Network size={16} color="#8b5cf6" /> Multi-level Relationship</span>
          <textarea className="form-input" rows={4} disabled={locked} value={growth?.relationship_plan || ''} onChange={event => updateField('relationship_plan', event.target.value)} onBlur={handleBlur} placeholder="Mở quan hệ với Procurement, QA, Logistics, Finance và Sponsor cấp cao..." style={{ marginTop: 8, fontSize: '.82rem' }} />
        </label>
        <label className="jbp-card" style={{ padding: 15, borderRadius: 11, background: 'rgba(15,23,42,.4)', color: 'var(--text-secondary)', fontSize: '.8rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-primary)', fontWeight: 700 }}><CalendarDays size={16} color="#f59e0b" /> Ngày Business Review tiếp theo</span>
          <input type="date" className="form-input" disabled={locked} value={growth?.next_review_date || ''} onChange={event => updateField('next_review_date', event.target.value)} onBlur={handleBlur} style={{ marginTop: 8 }} />
        </label>
      </div>
    </section>
  );
}
