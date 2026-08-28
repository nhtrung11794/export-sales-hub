'use client';

import React, { useState } from 'react';
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
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  X,
} from 'lucide-react';
import { isB14Complete, JBPInitiative, M05FormData } from './M05_CombinedForm';
import { useModuleStore } from '@/store/useModuleStore';

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
  { id: 'other', label: 'Khác (Tự định nghĩa)' },
];

export default function B15_AccountGrowth({ data, setData, handleBlur, isDisabled, isPrerequisiteComplete }: Props) {
  const { submissions } = useModuleStore();
  const [isBuyerMapModalOpen, setIsBuyerMapModalOpen] = useState(false);

  const growth = data.b15_growth;
  const locked = isDisabled || !isPrerequisiteComplete;
  const annualDemand = Number(growth?.annual_demand_volume) || 100;
  const ourSupply = Number(growth?.our_supply_volume) || 0;
  const calculatedShare = annualDemand > 0 ? Math.min(100, Math.round((ourSupply / annualDemand) * 100)) : 0;
  const potential = Number(growth?.growth_potential) || 50;

  const activeQuadrant = calculatedShare >= 50
    ? (potential >= 50 ? 'expand' : 'protect')
    : (potential >= 50 ? 'invest' : 'qualify');

  // Trust Score calculation based on B13 & B14
  const deliveredCount = (data.b13_execution?.milestones || []).filter(item => item.status === 'delivered').length;
  const hasValidB14 = isB14Complete(data);
  const evidenceReceived = Boolean(data.b14_recovery?.evidence_received);
  
  // Base trust score
  const trustScore = Math.min(100, deliveredCount * 15 + (hasValidB14 ? 30 : 0) + (evidenceReceived ? 25 : 0));
  const isGrowthLocked = trustScore < 50; // Khóa Up-sell/Cross-sell nếu trust score < 50

  const initiatives = growth?.initiatives || [];

  // Lấy dữ liệu Buyer Map từ B04
  const m02Data = (submissions.M02?.form_data as any) || {};
  const b04BuyerMap = m02Data.buyer_map || {};

  const samplePersonas = [
    { role: 'Giám đốc Mua hàng (Procurement Director)', tag: 'Decision Maker', pain: 'Lo sợ đứt gãy nguồn cung và giá biến động' },
    { role: 'Trưởng phòng QA/QC (Quality Assurance Head)', tag: 'Gatekeeper / Influencer', pain: 'Độ ẩm không đồng đều, rủi ro nấm mốc' },
    { role: 'Chuyên viên Supply Chain / Logistics', tag: 'User / Operational', pain: 'Chậm trễ chứng từ, phát sinh phí Demurrage tại cảng' },
    { role: 'Tổng Giám đốc / Board Member', tag: 'Economic Buyer', pain: 'Biên lợi nhuận gộp và cam kết bền vững ESG' },
  ];

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
    if (isGrowthLocked && (field === 'upsell' || field === 'cross_sell')) return;
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
      type: isGrowthLocked ? 'repeat' : 'upsell',
      kpi: 'Tăng 15% Volume đơn hàng',
      dual_commit: 'Buyer cam kết forecast sớm 45 ngày - Nhà máy giữ giá cố định',
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

  const handleSelectBuyerPersona = (persona: { role: string; tag: string }) => {
    const current = growth?.relationship_plan || '';
    const addition = `- [${persona.tag}] ${persona.role}: Tham gia kỳ QBR để giải quyết bài toán chiến lược.`;
    if (!current.includes(persona.role)) {
      updateField('relationship_plan', current ? `${current}\n${addition}` : addition);
    }
  };

  return (
    <section className="glass-panel" style={{ padding: '28px', opacity: isDisabled ? .6 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--accent-primary)', marginBottom: 4 }}>
            Bài 15: Tăng Trưởng Tài Khoản Chiến Lược (Account Growth & Joint Business Plan)
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.88rem' }}>
            Chuyển dịch từ nhà cung cấp thông thường sang đối tác chiến lược (Strategic Partner) thông qua Ma trận Share of Wallet và Kế hoạch Kinh doanh Chung (JBP).
          </p>
        </div>

        {/* TRUST SCORE BADGE */}
        <div style={{
          padding: '10px 16px',
          borderRadius: 12,
          background: trustScore >= 50 ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)',
          border: `1px solid ${trustScore >= 50 ? '#10b981' : 'var(--accent-danger)'}`,
          textAlign: 'center',
          minWidth: 140
        }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: trustScore >= 50 ? '#10b981' : 'var(--accent-danger)' }}>
            {trustScore}/100
          </div>
          <div style={{ fontSize: '.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Execution Trust Score
          </div>
        </div>
      </div>

      {/* CẢNH BÁO NẾU TRUST SCORE < 50 */}
      {isGrowthLocked && (
        <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(245, 158, 11, 0.12)', border: '1px solid #f59e0b', color: '#fcd34d', fontSize: '.84rem', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>⚠️ GIỚI HẠN CHIẾN LƯỢC (Trust Score &lt; 50/100):</strong><br/>
            Sau sự cố tại Bài 14, niềm tin của đối tác đang bị thử thách. Hệ thống <strong>tạm khóa mục tiêu Up-sell & Cross-sell</strong>. Bạn cần tập trung vào <em>"Repeat Order"</em> và khắc phục chất lượng để tái lập sự tín nhiệm trước khi đàm phán bán thêm sản phẩm mới!
          </div>
        </div>
      )}

      {/* 1. SHARE OF WALLET MATRIX */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.1fr)', gap: 20, marginBottom: 24 }}>
        <div style={{ padding: 20, borderRadius: 12, background: 'rgba(15, 23, 42, 0.45)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.02rem', fontWeight: 'bold', marginBottom: 14, color: 'var(--text-primary)' }}>
            <Crosshair size={18} color="var(--accent-primary)" /> 1. B2B Share of Wallet Matrix
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {QUADRANTS.map(item => {
              const active = activeQuadrant === item.id;
              return (
                <div key={item.id} style={{ minHeight: 85, padding: 10, borderRadius: 8, border: `1px solid ${active ? item.color : 'rgba(255,255,255,.08)'}`, background: active ? `${item.color}18` : 'rgba(15,23,42,.42)' }}>
                  <div style={{ color: active ? item.color : 'var(--text-secondary)', fontWeight: 800, fontSize: '.8rem' }}>{item.label}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '.68rem', marginTop: 2 }}>{item.hint}</div>
                  {active && <div style={{ color: item.color, fontSize: '.72rem', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={12} /> Vị thế hiện tại</div>}
                </div>
              );
            })}
          </div>

          <div style={{ padding: 12, borderRadius: 8, background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.2)', marginBottom: 14 }}>
            <div style={{ fontSize: '.78rem', color: 'var(--accent-primary)', fontWeight: 700, marginBottom: 8 }}>📐 Công thức tính Tỷ trọng Cung ứng (Wallet Share):</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: '.72rem', color: 'var(--text-secondary)' }}>Tổng nhu cầu Buyer/năm</label>
                <input type="number" className="form-input" value={annualDemand} disabled={locked} onChange={e => updateAnnualDemand(Number(e.target.value) || 0)} onBlur={handleBlur} style={{ fontSize: '.82rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '.72rem', color: 'var(--text-secondary)' }}>Sản lượng cung ứng hiện tại</label>
                <input type="number" className="form-input" value={ourSupply} disabled={locked} onChange={e => updateSupplyVolume(Number(e.target.value) || 0)} onBlur={handleBlur} style={{ fontSize: '.82rem' }} />
              </div>
              <div style={{ textAlign: 'center', padding: '6px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontSize: '.68rem', color: 'var(--text-muted)' }}>Wallet Share</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent-primary)' }}>{calculatedShare}%</span>
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Tiềm năng tăng trưởng dự kiến (%)</label>
            <input type="range" min={0} max={100} value={potential} disabled={locked} onChange={e => updateField('growth_potential', Number(e.target.value))} onBlur={handleBlur} style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: 'var(--text-muted)' }}>
              <span>Thấp (0%)</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{potential}%</span>
              <span>Cao (100%)</span>
            </div>
          </div>
        </div>

        {/* 2. JBP OBJECTIVES */}
        <div style={{ padding: 20, borderRadius: 12, background: 'rgba(15, 23, 42, 0.45)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.02rem', fontWeight: 'bold', marginBottom: 14, color: 'var(--text-primary)' }}>
            <Target size={18} color="#10b981" /> 2. Định Hình Mục Tiêu Tăng Trưởng (JBP Goals)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
            <label style={{ padding: '10px 12px', borderRadius: 8, background: growth?.goals?.repeat_order ? 'rgba(16,185,129,.12)' : 'rgba(255,255,255,0.02)', border: `1px solid ${growth?.goals?.repeat_order ? '#10b981' : 'rgba(255,255,255,0.08)'}`, cursor: locked ? 'not-allowed' : 'pointer', fontSize: '.8rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={Boolean(growth?.goals?.repeat_order)} onChange={e => updateGoal('repeat_order', e.target.checked)} disabled={locked} style={{ accentColor: '#10b981' }} />
              <div>
                <strong style={{ display: 'block', color: '#10b981' }}>Repeat Order</strong>
                <span style={{ fontSize: '.68rem', color: 'var(--text-muted)' }}>Giữ nhịp đơn hàng</span>
              </div>
            </label>

            <label style={{ padding: '10px 12px', borderRadius: 8, background: growth?.goals?.upsell ? 'rgba(59,130,246,.12)' : 'rgba(255,255,255,0.02)', border: `1px solid ${growth?.goals?.upsell ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)'}`, opacity: isGrowthLocked ? 0.4 : 1, cursor: (locked || isGrowthLocked) ? 'not-allowed' : 'pointer', fontSize: '.8rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={Boolean(growth?.goals?.upsell)} onChange={e => updateGoal('upsell', e.target.checked)} disabled={locked || isGrowthLocked} style={{ accentColor: 'var(--accent-primary)' }} />
              <div>
                <strong style={{ display: 'block', color: 'var(--accent-primary)' }}>Up-sell {isGrowthLocked && '🔒'}</strong>
                <span style={{ fontSize: '.68rem', color: 'var(--text-muted)' }}>Tăng sản lượng</span>
              </div>
            </label>

            <label style={{ padding: '10px 12px', borderRadius: 8, background: growth?.goals?.cross_sell ? 'rgba(139,92,246,.12)' : 'rgba(255,255,255,0.02)', border: `1px solid ${growth?.goals?.cross_sell ? '#8b5cf6' : 'rgba(255,255,255,0.08)'}`, opacity: isGrowthLocked ? 0.4 : 1, cursor: (locked || isGrowthLocked) ? 'not-allowed' : 'pointer', fontSize: '.8rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={Boolean(growth?.goals?.cross_sell)} onChange={e => updateGoal('cross_sell', e.target.checked)} disabled={locked || isGrowthLocked} style={{ accentColor: '#8b5cf6' }} />
              <div>
                <strong style={{ display: 'block', color: '#8b5cf6' }}>Cross-sell {isGrowthLocked && '🔒'}</strong>
                <span style={{ fontSize: '.68rem', color: 'var(--text-muted)' }}>Mở rộng SKU</span>
              </div>
            </label>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.8rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>
              Tuyên ngôn Mục tiêu Chiến lược (Strategic Objective Statement)
            </label>
            <textarea
              className="form-input"
              rows={4}
              value={growth?.growth_objective || ''}
              onChange={e => updateField('growth_objective', e.target.value)}
              onBlur={handleBlur}
              disabled={locked}
              placeholder="VD: Trở thành Nhà cung cấp Top 1 ngành gia vị đóng chai cho chuỗi siêu thị Metro, nâng tỷ trọng cung ứng từ 25% lên 45% trong vòng 12 tháng tới..."
              style={{ fontSize: '.82rem' }}
            />
          </div>
        </div>
      </div>

      {/* 3. JBP INITIATIVES */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: '1.02rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
            <TrendingUp size={18} color="#10b981" /> 3. Danh Mục Sáng Kiến Hợp Tác Chung (JBP Initiatives Matrix)
          </h3>
          <button
            type="button"
            onClick={addInitiative}
            disabled={locked}
            className="btn btn-secondary"
            style={{ fontSize: '.78rem', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={14} /> Thêm Sáng Kiến JBP
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {initiatives.map(item => (
            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 140px 1fr 1.4fr 110px auto', gap: 8, padding: '10px 12px', borderRadius: 8, background: 'rgba(15, 23, 42, 0.45)', border: '1px solid rgba(255,255,255,0.08)', alignItems: 'center' }}>
              <div>
                <input className="form-input" value={item.title || ''} placeholder="Tên sáng kiến chung..." disabled={locked} onChange={e => updateInitiative(item.id, 'title', e.target.value)} onBlur={handleBlur} style={{ fontSize: '.82rem', fontWeight: 600 }} />
              </div>
              <div>
                <select className="form-input" value={item.type || 'repeat'} disabled={locked} onChange={e => updateInitiative(item.id, 'type', e.target.value as any)} onBlur={handleBlur} style={{ fontSize: '.8rem' }}>
                  {INITIATIVE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <input className="form-input" value={item.kpi || ''} placeholder="KPI đo lường..." disabled={locked} onChange={e => updateInitiative(item.id, 'kpi', e.target.value)} onBlur={handleBlur} style={{ fontSize: '.82rem' }} />
              </div>
              <div>
                <input className="form-input" value={item.dual_commit || ''} placeholder="Cam kết 2 chiều..." disabled={locked} onChange={e => updateInitiative(item.id, 'dual_commit', e.target.value)} onBlur={handleBlur} style={{ fontSize: '.82rem' }} />
              </div>
              <div>
                <input className="form-input" value={item.deadline || ''} placeholder="Deadline" disabled={locked} onChange={e => updateInitiative(item.id, 'deadline', e.target.value)} onBlur={handleBlur} style={{ fontSize: '.82rem', textAlign: 'center' }} />
              </div>
              <button
                type="button"
                disabled={locked || initiatives.length <= 1}
                onClick={() => deleteInitiative(item.id)}
                style={{ border: 0, background: 'transparent', color: 'var(--text-muted)', cursor: locked || initiatives.length <= 1 ? 'not-allowed' : 'pointer', padding: 2 }}
                title="Xóa sáng kiến"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. RELATIONSHIP PLAN & QBR SCHEDULE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ padding: 16, borderRadius: 10, background: 'rgba(15, 23, 42, 0.45)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-primary)', fontWeight: 700, fontSize: '.84rem' }}>
              <Network size={16} color="#8b5cf6" /> Bản đồ Quan hệ Đa tầng (Multi-level Plan)
            </span>
            <button
              type="button"
              onClick={() => setIsBuyerMapModalOpen(true)}
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', padding: '3px 8px', borderRadius: 6, fontSize: '.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <ExternalLink size={12} /> 🔗 Mở lại Buyer Map B04
            </button>
          </div>
          <textarea
            className="form-input"
            rows={4}
            disabled={locked}
            value={growth?.relationship_plan || ''}
            onChange={e => updateField('relationship_plan', e.target.value)}
            onBlur={handleBlur}
            placeholder="Kế hoạch kết nối các tầng quyền lực: CEO-CEO, Sales-Procurement Director, QA-QC Lab, Logistics Specialist..."
            style={{ fontSize: '.82rem', resize: 'vertical' }}
          />
        </div>

        <div style={{ padding: 16, borderRadius: 10, background: 'rgba(15, 23, 42, 0.45)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-primary)', fontWeight: 700, fontSize: '.84rem', marginBottom: 8 }}>
            <CalendarDays size={16} color="#f59e0b" /> Ngày Họp Đánh Giá Kinh Doanh Định Kỳ (QBR Schedule)
          </span>
          <input
            type="date"
            className="form-input"
            disabled={locked}
            value={growth?.next_review_date || ''}
            onChange={e => updateField('next_review_date', e.target.value)}
            onBlur={handleBlur}
            style={{ fontSize: '.84rem', marginBottom: 8 }}
          />
          <p style={{ fontSize: '.76rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            💡 <em>Lên lịch họp QBR với Buyer ít nhất 90 ngày một lần để rà soát KPI giao hàng, giải quyết tồn đọng và ký duyệt forecast cho quý tiếp theo.</em>
          </p>
        </div>
      </div>

      {/* POPUP MODAL BUYER MAP B04 */}
      {isBuyerMapModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ maxWidth: 620, width: '100%', background: '#0f172a', border: '1px solid #8b5cf6', borderRadius: 14, padding: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: 8 }}>
                <UsersRound size={18} color="#8b5cf6" /> Sơ Đồ Buyer Map & Danh Sách Nhân Vật (Từ Buổi 04)
              </h3>
              <button type="button" onClick={() => setIsBuyerMapModalOpen(false)} style={{ background: 'transparent', border: 0, color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '.82rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
              Chọn các nhân vật chủ chốt để đưa vào lịch làm việc đa tầng và kế hoạch gặp mặt tại kỳ họp QBR sắp tới:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20, maxHeight: 300, overflowY: 'auto' }}>
              {samplePersonas.map((p, idx) => (
                <div key={idx} style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.86rem', color: 'var(--text-primary)' }}>{p.role}</div>
                    <div style={{ fontSize: '.74rem', color: '#c4b5fd', marginTop: 2 }}>Vai trò: <strong>{p.tag}</strong> · <em>{p.pain}</em></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectBuyerPersona(p)}
                    className="btn btn-secondary"
                    style={{ fontSize: '.75rem', padding: '4px 10px', whiteSpace: 'nowrap' }}
                  >
                    + Đưa vào QBR
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsBuyerMapModalOpen(false)} className="btn btn-primary" style={{ fontSize: '.82rem', padding: '8px 20px' }}>
                ✓ Hoàn Tất & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
