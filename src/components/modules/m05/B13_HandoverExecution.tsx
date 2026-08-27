'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CalendarClock, CheckCircle2, ClipboardCheck, GripVertical, Lock, Truck } from 'lucide-react';
import { ExecutionMilestone, ExecutionStatus, M05FormData } from './M05_CombinedForm';

interface Props {
  data: M05FormData;
  setData: React.Dispatch<React.SetStateAction<M05FormData>>;
  handleBlur: () => void;
  isDisabled: boolean;
  isPrerequisiteComplete: boolean;
}

const SLA_ITEMS: Array<{ key: keyof M05FormData['b13_execution']['sla_checklist']; label: string; hint: string }> = [
  { key: 'order_scope_confirmed', label: 'Phạm vi đơn hàng đã chốt', hint: 'SKU, specs, số lượng, tolerance và Incoterm khớp PO/SC.' },
  { key: 'payment_verified', label: 'Điều kiện thanh toán đã xác minh', hint: 'Tài khoản nhận tiền, mốc thanh toán và điều kiện phát hành chứng từ.' },
  { key: 'production_capacity_confirmed', label: 'Năng lực sản xuất đã giữ chỗ', hint: 'Nhà máy xác nhận lead time, nguyên liệu và kế hoạch QA/QC.' },
  { key: 'logistics_booking_confirmed', label: 'Phương án logistics khả thi', hint: 'Có tuyến, cut-off, ETD/ETA dự kiến và phương án dự phòng.' },
  { key: 'document_owner_assigned', label: 'Chủ sở hữu bộ chứng từ đã rõ', hint: 'Mỗi chứng từ có người chịu trách nhiệm và hạn bàn giao.' },
];

const STAGES: Array<{ id: ExecutionStatus; label: string; subtitle: string; color: string }> = [
  { id: 'todo', label: 'To-do', subtitle: 'Chờ triển khai', color: '#64748b' },
  { id: 'production', label: 'Production', subtitle: 'Sản xuất & QA', color: '#8b5cf6' },
  { id: 'logistics', label: 'Logistics', subtitle: 'Booking & chứng từ', color: '#f59e0b' },
  { id: 'delivered', label: 'Delivered', subtitle: 'Đã giao & xác nhận', color: '#10b981' },
];

function MilestoneCard({ item, disabled, isOverlay = false }: { item: ExecutionMilestone; disabled: boolean; isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id, data: item, disabled });
  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      {...(isOverlay ? {} : listeners)}
      {...(isOverlay ? {} : attributes)}
      style={{
        padding: 12,
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,.1)',
        background: isOverlay ? '#1e293b' : 'rgba(15,23,42,.78)',
        cursor: disabled ? 'not-allowed' : 'grab',
        opacity: isDragging && !isOverlay ? 0.3 : 1,
        boxShadow: isOverlay ? '0 16px 35px rgba(0,0,0,.45)' : '0 4px 12px rgba(0,0,0,.12)',
      }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <GripVertical size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ color: 'var(--text-primary)', fontSize: '.84rem', fontWeight: 700 }}>{item.title || 'Milestone chưa đặt tên'}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '.74rem', marginTop: 5 }}>{item.owner || 'Chưa gán owner'}</div>
          {item.due_date && <div style={{ color: 'var(--accent-warning)', fontSize: '.72rem', marginTop: 4 }}>Hạn: {item.due_date}</div>}
        </div>
      </div>
    </div>
  );
}

function StageColumn({ stage, items, disabled }: { stage: typeof STAGES[number]; items: ExecutionMilestone[]; disabled: boolean }) {
  const { isOver, setNodeRef } = useDroppable({ id: stage.id, disabled });
  return (
    <div ref={setNodeRef} style={{
      minHeight: 220,
      padding: 12,
      borderRadius: 12,
      background: isOver ? `${stage.color}20` : 'rgba(0,0,0,.18)',
      border: `1px ${items.length ? 'solid' : 'dashed'} ${isOver ? stage.color : 'rgba(255,255,255,.1)'}`,
      transition: 'all .2s ease',
    }}>
      <div style={{ borderTop: `3px solid ${stage.color}`, paddingTop: 9, marginBottom: 12 }}>
        <div style={{ color: stage.color, fontWeight: 800, fontSize: '.87rem' }}>{stage.label} · {items.length}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '.72rem' }}>{stage.subtitle}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {items.map(item => <MilestoneCard key={item.id} item={item} disabled={disabled} />)}
        {!items.length && <div style={{ padding: '18px 6px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.75rem' }}>Kéo milestone vào đây</div>}
      </div>
    </div>
  );
}

export default function B13_HandoverExecution({ data, setData, handleBlur, isDisabled, isPrerequisiteComplete }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const execution = data.b13_execution;
  const milestones = execution?.milestones || [];
  const checklist = execution?.sla_checklist || {};
  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const timelineReady = milestones.length > 0 && milestones.every(item =>
    (item.title || '').trim() && (item.owner || '').trim() && (item.due_date || '').trim()
  );
  const locked = isDisabled || !isPrerequisiteComplete;

  const updateChecklist = (key: keyof M05FormData['b13_execution']['sla_checklist'], checked: boolean) => {
    if (locked) return;
    setData(prev => ({
      ...prev,
      b13_execution: {
        ...prev.b13_execution,
        sla_checklist: { ...prev.b13_execution.sla_checklist, [key]: checked },
      },
    }));
  };

  const updateMilestone = (id: string, field: keyof ExecutionMilestone, value: string) => {
    if (locked) return;
    setData(prev => ({
      ...prev,
      b13_execution: {
        ...prev.b13_execution,
        milestones: (prev.b13_execution.milestones || []).map(item => item.id === id ? { ...item, [field]: value } : item),
      },
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    if (locked || !event.over) return;
    const nextStatus = event.over.id as ExecutionStatus;
    if (!STAGES.some(stage => stage.id === nextStatus)) return;
    setData(prev => ({
      ...prev,
      b13_execution: {
        ...prev.b13_execution,
        milestones: prev.b13_execution.milestones.map(item => item.id === event.active.id ? { ...item, status: nextStatus } : item),
      },
    }));
    setTimeout(handleBlur, 100);
  };

  if (!isPrerequisiteComplete) {
    return (
      <section className="glass-panel" style={{ padding: 32, opacity: .4, filter: 'grayscale(100%)', pointerEvents: 'none' }}>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--text-muted)', marginBottom: 12 }}>Bài 13: Handover & Execution</h2>
        <div style={{ display: 'flex', gap: 8, color: 'var(--accent-warning)' }}><Lock size={18} /> Hoàn tất Payment & Safe Order Checklist ở Bài 12 để mở khóa bàn giao.</div>
      </section>
    );
  }

  return (
    <section className="glass-panel" style={{ padding: 32, opacity: isDisabled ? .6 : 1 }}>
      <style>{`
        .m05-focus-card { transition: all .25s ease; border: 1px solid rgba(255,255,255,.08); }
        .m05-focus-card:focus-within { border-color: var(--accent-primary) !important; box-shadow: 0 4px 20px rgba(59,130,246,.15); transform: translateY(-2px); }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.4rem', marginBottom: 8 }}>Bài 13: Bàn giao & Vận hành Đơn hàng</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>Biến cam kết bán hàng thành SLA nội bộ rõ người, rõ việc và rõ thời hạn.</p>
        </div>
        <div style={{ minWidth: 112, textAlign: 'center', padding: '10px 14px', borderRadius: 12, background: checkedCount === SLA_ITEMS.length ? 'rgba(16,185,129,.12)' : 'rgba(59,130,246,.1)', color: checkedCount === SLA_ITEMS.length ? '#10b981' : 'var(--accent-primary)', fontWeight: 800 }}>
          {checkedCount}/{SLA_ITEMS.length} SLA
        </div>
      </div>

      <div style={{ marginBottom: 30 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.05rem', marginBottom: 14 }}><ClipboardCheck size={19} color="#10b981" /> Internal SLA Checklist</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          {SLA_ITEMS.map(item => {
            const checked = Boolean(checklist[item.key]);
            return (
              <label key={item.key} className="m05-focus-card" style={{ display: 'flex', gap: 12, padding: 14, borderRadius: 10, background: checked ? 'rgba(16,185,129,.08)' : 'rgba(15,23,42,.4)', cursor: locked ? 'not-allowed' : 'pointer' }}>
                <input type="checkbox" checked={checked} disabled={locked} onChange={event => updateChecklist(item.key, event.target.checked)} onBlur={handleBlur} style={{ marginTop: 4 }} />
                <span>
                  <strong style={{ display: 'block', fontSize: '.88rem', color: checked ? '#10b981' : 'var(--text-primary)' }}>{item.label}</strong>
                  <span style={{ display: 'block', fontSize: '.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>{item.hint}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.05rem', marginBottom: 14 }}><CalendarClock size={19} color="var(--accent-primary)" /> Execution Timeline</h3>
        <div style={{ display: 'grid', gap: 10 }}>
          {milestones.map(item => (
            <div key={item.id} className="m05-focus-card" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 150px 1.5fr', gap: 10, padding: 12, borderRadius: 10, background: 'rgba(0,0,0,.16)' }}>
              <input className="form-input" value={item.title || ''} disabled={locked} onChange={event => updateMilestone(item.id, 'title', event.target.value)} onBlur={handleBlur} aria-label="Tên milestone" />
              <input className="form-input" value={item.owner || ''} disabled={locked} onChange={event => updateMilestone(item.id, 'owner', event.target.value)} onBlur={handleBlur} aria-label="Người phụ trách" />
              <input type="date" className="form-input" value={item.due_date || ''} disabled={locked} onChange={event => updateMilestone(item.id, 'due_date', event.target.value)} onBlur={handleBlur} aria-label="Hạn milestone" />
              <input className="form-input" value={item.note || ''} disabled={locked} onChange={event => updateMilestone(item.id, 'note', event.target.value)} onBlur={handleBlur} placeholder="Rủi ro / phụ thuộc..." aria-label="Ghi chú milestone" />
            </div>
          ))}
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={(event: DragStartEvent) => setActiveId(String(event.active.id))} onDragEnd={handleDragEnd} onDragCancel={() => setActiveId(null)}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(170px, 1fr))', gap: 12, overflowX: 'auto' }}>
          {STAGES.map(stage => <StageColumn key={stage.id} stage={stage} items={milestones.filter(item => item.status === stage.id)} disabled={locked} />)}
        </div>
        <DragOverlay>{activeId ? <MilestoneCard item={milestones.find(item => item.id === activeId) || milestones[0]} disabled={locked} isOverlay /> : null}</DragOverlay>
      </DndContext>

      {checkedCount === SLA_ITEMS.length && timelineReady && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, color: '#10b981', fontSize: '.85rem' }}><CheckCircle2 size={18} /> SLA đã đủ điều kiện mở Trạm xử lý sự cố B14.</div>
      )}
      {checkedCount === SLA_ITEMS.length && !timelineReady && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, color: '#f59e0b', fontSize: '.85rem' }}><CalendarClock size={18} /> Hãy chốt ngày hoàn thành cho toàn bộ milestone để mở B14.</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, color: 'var(--text-muted)', fontSize: '.78rem' }}><Truck size={16} /> Kéo thẻ milestone giữa bốn trạng thái để mô phỏng tiến độ thực thi.</div>
    </section>
  );
}
