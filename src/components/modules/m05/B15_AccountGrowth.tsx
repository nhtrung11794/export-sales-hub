'use client';

import React from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Crosshair,
  Lock,
  Network,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  UsersRound,
} from 'lucide-react';
import { isB14Complete, JBPInitiative, M05FormData } from './M05_CombinedForm';

interface Props {
  data: M05FormData;
  setData: React.Dispatch<React.SetStateAction<M05FormData>>;
  handleBlur: () => void;
  isDisabled: boolean;
  isPrerequisiteComplete: boolean;
}

const QUADRANTS = [
  { id: 'protect', label: 'PROTECT (Giữ chân)', hint: 'Thị phần cao · Tiềm năng mở rộng thấp', color: '#3b82f6' },
  { id: 'expand', label: 'EXPAND (Mở rộng)', hint: 'Thị phần cao · Tiềm năng mở rộng cao', color: '#10b981' },
  { id: 'qualify', label: 'QUALIFY (Đánh giá)', hint: 'Thị phần thấp · Tiềm năng mở rộng thấp', color: '#64748b' },
  { id: 'invest', label: 'INVEST (Đầu tư)', hint: 'Thị phần thấp · Tiềm năng mở rộng cao', color: '#f59e0b' },
];

const INITIATIVE_TYPES = [
  { id: 'repeat', label: 'Repeat Order' },
  { id: 'upsell', label: 'Up-sell' },
  { id: 'cross_sell', label: 'Cross-sell' },
  { id: 'service', label: 'Value-Added Service' },
];

export default function B15_AccountGrowth({ data, setData, handleBlur, isDisabled, isPrerequisiteComplete }: Props) {
  const growth = data.b15_growth;
  const locked = isDisabled || !isPrerequisiteComplete;
  const annualDemand = Number(growth?.annual_demand_volume) || 100;
  const ourSupply = Number(growth?.our_supply_volume) || 0;
  const calculatedShare = annualDemand > 0 ? Math.min(100, Math.round((ourSupply / annualDemand) * 100)) : 0;
  const potential = Number(growth?.growth_potential) || 50;

  const activeQuadrant = calculatedShare >= 50
    ? (potential >= 50 ? 'expand' : 'protect')
    : (potential >= 50 ? 'invest' : 'qualify');

  const deliveredCount = (data.b13_execution?.milestones || []).filter(item => item.status === 'delivered').length;
  const trustScore = Math.min(100, deliveredCount * 15 + (isB14Complete(data) ? 40 : 0));
  const initiatives = growth?.initiatives || [];

  const updateField = <K extends keyof M05FormData['b15_growth']>(field: K, value: M05FormData['b15_growth'][K]) => {
    if (locked) return;
    setData(prev => ({ ...prev, b15_growth: { ...prev.b15_growth, [field]: value } }));
  };

  const updateSupplyVolume = (newSupply: number) => {
    if (locked) return;
    const computed = annualDemand > 0 ? Math.min(100, Math.round((newSupply / annualDemand) * 100)) : 0;
    setData(prev => ({
      ...prev,
      b15_growth: {
        ...prev.b15_growth,
        our_supply_volume: newSupply,
        current_wallet_share: computed,
      },
    }));
  };

  const updateAnnualDemand = (newDemand: number) => {
    if (locked) return;
    const computed = newDemand > 0 ? Math.min(100, Math.round((ourSupply / newDemand) * 100)) : 0;
    setData(prev => ({
      ...prev,
      b15_growth: {
        ...prev.b15_growth,
        annual_demand_volume: newDemand,
        current_wallet_share: computed,
      },
    }));
  };

  const updateGoal = (field: keyof M05FormData['b15_growth']['goals'], checked: boolean) => {
    if (locked) return;
    setData(prev => ({ ...prev, b15_growth: { ...prev.b15_growth, goals: { ...prev.b15_growth.goals, [field]: checked } } }));
  };

  const updateInitiative = (id: string, field: keyof JBPInitiative, value: string) => {
    if (locked) return;
    setData(prev => ({
      ...prev,
      b15_growth: {
        ...prev.b15_growth,
        initiatives: (prev.b15_growth.initiatives || []).map(item => item.id === id ? { ...item, [field]: value } : item),
      },
    }));
  };

  const addInitiative = () => {
    if (locked) return;
    const newInit: JBPInitiative = {
      id: `init-${Date.now()}`,
      title: 'Sáng kiến hợp tác mới',
      type: 'repeat',
      kpi: 'Tăng 15% Volume',
      dual_commit: 'Buyer chốt lịch sớm - Seller giữ mức chiết khấu',
      deadline: '2026-Q4',
    };
    setData(prev => ({
      ...prev,
      b15_growth: {
        ...prev.b15_growth,
        initiatives: [...(prev.b15_growth.initiatives || []), newInit],
      },
    }));
    setTimeout(handleBlur, 100);
  };

  const deleteInitiative = (id: string) => {
    if (locked) return;
    setData(prev => ({
      ...prev,
      b15_growth: {
        ...prev.b15_growth,
        initiatives: (prev.b15_growth.initiatives || []).filter(item => item.id !== id),
      },
    }));
    setTimeout(handleBlur, 100);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 26, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.4rem', marginBottom: 8 }}>Bài 15: Tăng Trưởng Tài Khoản Chiến Lược (Account Growth & JBP)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>Chuyển đổi từ giao dịch đơn lẻ (Transactional) sang đối tác chiến lược (Strategic Partner) thông qua Ma trận Share of Wallet và Kế hoạch kinh doanh chung (Joint Business Plan).</p>
        </div>
        <div title="Trust được tính từ milestone Delivered và CAPA hoàn chỉnh" style={{ minWidth: 130, padding: '9px 13px', borderRadius: 12, background: trustScore >= 60 ? 'rgba(16,185,129,.1)' : 'rgba(245,158,11,.1)', color: trustScore >= 60 ? '#10b981' : '#f59e0b', textAlign: 'center', fontSize: '.78rem', border: `1px solid ${trustScore >= 60 ? 'rgba(16,185,129,.3)' : 'rgba(245,158,11,.3)'}` }}>
          <strong style={{ display: 'block', fontSize: '1.15rem' }}>{trustScore}/100</strong> Execution Trust Score
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.1fr)', gap: 22, marginBottom: 24 }}>
        <div className="jbp-card" style={{ padding: 20, borderRadius: 13, background: 'rgba(0,0,0,.17)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.02rem', marginBottom: 14 }}><Crosshair size={18} color="var(--accent-primary)" /> 1. B2B Share of Wallet Matrix</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 16 }}>
            {QUADRANTS.map(item => {
              const active = activeQuadrant === item.id;
              return (
                <div key={item.id} style={{ minHeight: 90, padding: 10, borderRadius: 10, border: `1px solid ${active ? item.color : 'rgba(255,255,255,.08)'}`, background: active ? `${item.color}18` : 'rgba(15,23,42,.42)', boxShadow: active ? `0 6px 20px ${item.color}18` : 'none' }}>
                  <div style={{ color: active ? item.color : 'var(--text-secondary)', fontWeight: 800, fontSize: '.8rem' }}>{item.label}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '.68rem', marginTop: 4 }}>{item.hint}</div>
                  {active && <div style={{ color: item.color, fontSize: '.72rem', fontWeight: 700, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={13} /> Vị thế hiện tại</div>}
                </div>
              );
            })}
          </div>

          <div style={{ padding: 12, borderRadius: 10, background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.18)', marginBottom: 14 }}>
            <div style={{ fontSize: '.78rem', color: 'var(--accent-primary)', fontWeight: 700, marginBottom: 8 }}>📐 Công thức tính Tỷ trọng Nắm giữ (Share of Wallet):</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: 8 }}>
              <div>
                <span style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>Tổng nhu cầu Buyer/năm:</span>
                <input type="number" min="1" className="form-input" value={annualDemand} disabled={locked} onChange={e => updateAnnualDemand(Number(e.target.value))} onBlur={handleBlur} style={{ fontSize: '.82rem', marginTop: 3 }} />
              </div>
              <div>
                <span style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>Sản lượng mình cung cấp:</span>
                <input type="number" min="0" className="form-input" value={ourSupply} disabled={locked} onChange={e => updateSupplyVolume(Number(e.target.value))} onBlur={handleBlur} style={{ fontSize: '.82rem', marginTop: 3 }} />
              </div>
              <div>
                <span style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>Đơn vị:</span>
                <input className="form-input" value={growth?.volume_unit || 'Cont 40HC'} disabled={locked} onChange={e => updateField('volume_unit', e.target.value)} onBlur={handleBlur} placeholder="Cont/Tấn/$" style={{ fontSize: '.82rem', marginTop: 3 }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: '.82rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Share of Wallet tính toán:</span>
              <strong style={{ color: '#10b981', fontSize: '1.05rem' }}>{calculatedShare}% ({ourSupply}/{annualDemand} {growth?.volume_unit || 'Cont 40HC'})</strong>
            </div>
          </div>

          <label style={{ display: 'block', fontSize: '.8rem', color: 'var(--text-secondary)' }}>
            Đánh giá Tiềm năng Tăng trưởng Tài khoản (Account Potential): <strong style={{ color: '#10b981' }}>{potential}%</strong>
            <input type="range" min="0" max="100" value={potential} disabled={locked} onChange={event => updateField('growth_potential', Number(event.target.value))} onBlur={handleBlur} style={{ width: '100%', marginTop: 7, accentColor: '#10b981' }} />
          </label>
        </div>

        <div className="jbp-card" style={{ padding: 20, borderRadius: 13, background: 'rgba(0,0,0,.17)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.02rem', marginBottom: 14 }}><TrendingUp size={18} color="#10b981" /> 2. Chiến Lược Tăng Trưởng Trọng Tâm</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { key: 'repeat_order' as const, label: 'Repeat Order', hint: 'Tăng tần suất đặt hàng' },
              { key: 'upsell' as const, label: 'Up-sell', hint: 'Tăng volume / Quy cách cao hơn' },
              { key: 'cross_sell' as const, label: 'Cross-sell', hint: 'Bán chéo mã hàng/SKU mới' },
            ].map(goal => {
              const checked = Boolean(growth?.goals?.[goal.key]);
              return (
                <label key={goal.key} style={{ padding: 12, borderRadius: 10, textAlign: 'center', cursor: locked ? 'not-allowed' : 'pointer', background: checked ? 'rgba(16,185,129,.1)' : 'rgba(15,23,42,.45)', border: `1px solid ${checked ? '#10b981' : 'rgba(255,255,255,.08)'}` }}>
                  <input type="checkbox" checked={checked} disabled={locked} onChange={event => updateGoal(goal.key, event.target.checked)} onBlur={handleBlur} />
                  <strong style={{ display: 'block', color: checked ? '#10b981' : 'var(--text-primary)', fontSize: '.84rem', marginTop: 7 }}>{goal.label}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '.68rem' }}>{goal.hint}</span>
                </label>
              );
            })}
          </div>
          <label style={{ display: 'block', fontSize: '.8rem', color: 'var(--text-secondary)' }}>
            Mục tiêu kinh doanh chung trong 6–12 tháng (Strategic Account Objective)
            <textarea className="form-input" rows={6} disabled={locked} value={growth?.growth_objective || ''} onChange={event => updateField('growth_objective', event.target.value)} onBlur={handleBlur} placeholder="VD: Nâng Share of Wallet từ 25% lên 45% trong năm 2026, duy trì tỷ lệ đúng hạn OTIF ≥ 98% và mở thêm 02 SKU hạt điều rang muối đóng gói 500g..." style={{ marginTop: 7, fontSize: '.84rem' }} />
          </label>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.05rem', margin: 0 }}>
            <Target size={19} color="var(--accent-primary)" /> 3. Bảng Sáng Kiến Joint Business Plan (JBP Initiatives Table)
          </h3>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={locked}
            onClick={addInitiative}
            style={{ fontSize: '.78rem', padding: '6px 12px', gap: 6 }}
          >
            <Plus size={15} /> Thêm Sáng kiến JBP
          </button>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {initiatives.map(item => (
            <div key={item.id} className="jbp-card" style={{ display: 'grid', gridTemplateColumns: '1.2fr 130px 1fr 1.3fr 100px auto', gap: 10, padding: 12, borderRadius: 10, background: 'rgba(0,0,0,.16)', alignItems: 'center' }}>
              <div>
                <input className="form-input" value={item.title || ''} placeholder="Tên sáng kiến chung..." disabled={locked} onChange={e => updateInitiative(item.id, 'title', e.target.value)} onBlur={handleBlur} style={{ fontSize: '.84rem' }} />
              </div>
              <div>
                <select className="form-input" value={item.type || 'repeat'} disabled={locked} onChange={e => updateInitiative(item.id, 'type', e.target.value as any)} onBlur={handleBlur} style={{ fontSize: '.8rem', padding: '6px 8px' }}>
                  {INITIATIVE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <input className="form-input" value={item.kpi || ''} placeholder="KPI đo lường (VD: OTIF, Volume...)" disabled={locked} onChange={e => updateInitiative(item.id, 'kpi', e.target.value)} onBlur={handleBlur} style={{ fontSize: '.82rem' }} />
              </div>
              <div>
                <input className="form-input" value={item.dual_commit || ''} placeholder="Cam kết Buyer & Seller..." disabled={locked} onChange={e => updateInitiative(item.id, 'dual_commit', e.target.value)} onBlur={handleBlur} style={{ fontSize: '.82rem' }} />
              </div>
              <div>
                <input className="form-input" value={item.deadline || ''} placeholder="Quý/Năm" disabled={locked} onChange={e => updateInitiative(item.id, 'deadline', e.target.value)} onBlur={handleBlur} style={{ fontSize: '.82rem', textAlign: 'center' }} />
              </div>
              <button
                type="button"
                disabled={locked || initiatives.length <= 1}
                onClick={() => deleteInitiative(item.id)}
                style={{ border: 0, background: 'transparent', color: 'var(--text-muted)', cursor: locked || initiatives.length <= 1 ? 'not-allowed' : 'pointer', padding: 4 }}
                title="Xóa sáng kiến"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <label className="jbp-card" style={{ padding: 15, borderRadius: 11, background: 'rgba(15,23,42,.4)', color: 'var(--text-secondary)', fontSize: '.8rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-primary)', fontWeight: 700 }}><UsersRound size={16} color="var(--accent-primary)" /> Đề xuất hỗ trợ mở rộng thị trường nội địa của Buyer</span>
          <textarea className="form-input" rows={4} disabled={locked} value={growth?.joint_initiatives || ''} onChange={event => updateField('joint_initiatives', event.target.value)} onBlur={handleBlur} placeholder="Hỗ trợ catalogue tiếng bản địa, mẫu thử nghiệm miễn phí, chia sẻ chi phí marketing tại hội chợ..." style={{ marginTop: 8, fontSize: '.82rem' }} />
        </label>
        <label className="jbp-card" style={{ padding: 15, borderRadius: 11, background: 'rgba(15,23,42,.4)', color: 'var(--text-secondary)', fontSize: '.8rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-primary)', fontWeight: 700 }}><TrendingUp size={16} color="#10b981" /> Trao đổi Giá trị (Value Exchange)</span>
          <textarea className="form-input" rows={4} disabled={locked} value={growth?.value_exchange || ''} onChange={event => updateField('value_exchange', event.target.value)} onBlur={handleBlur} placeholder="Buyer cam kết volume tối thiểu hàng tháng đổi lấy chính sách giá ưu đãi hoặc thời hạn thanh toán nới lỏng..." style={{ marginTop: 8, fontSize: '.82rem' }} />
        </label>
        <label className="jbp-card" style={{ padding: 15, borderRadius: 11, background: 'rgba(15,23,42,.4)', color: 'var(--text-secondary)', fontSize: '.8rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-primary)', fontWeight: 700 }}><Network size={16} color="#8b5cf6" /> Bản đồ Quan hệ Đa tầng (Multi-level Relationship Plan)</span>
          <textarea className="form-input" rows={4} disabled={locked} value={growth?.relationship_plan || ''} onChange={event => updateField('relationship_plan', event.target.value)} onBlur={handleBlur} placeholder="Kết nối CEO-CEO, Sales-Procurement Manager, QA-QC Lab, Logistics Specialist..." style={{ marginTop: 8, fontSize: '.82rem' }} />
        </label>
        <label className="jbp-card" style={{ padding: 15, borderRadius: 11, background: 'rgba(15,23,42,.4)', color: 'var(--text-secondary)', fontSize: '.8rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-primary)', fontWeight: 700 }}><CalendarDays size={16} color="#f59e0b" /> Ngày Họp Đánh Giá Kinh Doanh Định Kỳ (Quarterly Business Review)</span>
          <input type="date" className="form-input" disabled={locked} value={growth?.next_review_date || ''} onChange={event => updateField('next_review_date', event.target.value)} onBlur={handleBlur} style={{ marginTop: 8 }} />
        </label>
      </div>
    </section>
  );
}
