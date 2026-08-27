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
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  GripVertical,
  Lock,
  Plus,
  ShieldAlert,
  Trash2,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { ExecutionMilestone, ExecutionStatus, M05FormData } from './M05_CombinedForm';

interface Props {
  data: M05FormData;
  setData: React.Dispatch<React.SetStateAction<M05FormData>>;
  handleBlur: () => void;
  isDisabled: boolean;
  isPrerequisiteComplete: boolean;
}

const SLA_ITEMS: Array<{ key: keyof M05FormData['b13_execution']['sla_checklist']; label: string; hint: string }> = [
  { key: 'order_scope_confirmed', label: '1. Phạm vi đơn hàng đã chốt (Scope Confirmation)', hint: 'SKU, specs, số lượng, dung sai (tolerance) và Incoterms khớp 100% với PO/SC.' },
  { key: 'payment_verified', label: '2. Điều kiện thanh toán đã xác minh (Payment Verification)', hint: 'Đã nhận tiền cọc T/T hoặc nhận được bản gốc/Swift L/C at sight hợp lệ từ ngân hàng.' },
  { key: 'production_capacity_confirmed', label: '3. Năng lực sản xuất đã giữ chỗ (Production Slot)', hint: 'Nhà máy xác nhận lead time sản xuất, nguyên liệu đầu vào và kế hoạch QA/QC theo lịch.' },
  { key: 'logistics_booking_confirmed', label: '4. Phương án logistics & Lịch tàu khả thi (Booking)', hint: 'Forwarder/Hãng tàu xác nhận có chỗ, ngày cut-off CY và ETA dự kiến không bị trễ mùa.' },
  { key: 'document_owner_assigned', label: '5. Chủ sở hữu bộ chứng từ đã phân công (Doc Owner)', hint: 'Mỗi chứng từ (B/L, C/O, Phyto, SGS) có người chịu trách nhiệm và hạn bàn giao rõ ràng.' },
];

const STAGES: Array<{ id: ExecutionStatus; label: string; subtitle: string; color: string }> = [
  { id: 'todo', label: 'To-do', subtitle: 'Chờ triển khai', color: '#64748b' },
  { id: 'production', label: 'Production', subtitle: 'Sản xuất & QA/QC', color: '#8b5cf6' },
  { id: 'logistics', label: 'Logistics', subtitle: 'Booking & Chứng từ', color: '#f59e0b' },
  { id: 'delivered', label: 'Delivered', subtitle: 'Giao hàng & POD', color: '#10b981' },
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
        border: item.is_no_return ? '1px solid rgba(239,68,68,.5)' : '1px solid rgba(255,255,255,.1)',
        background: isOverlay ? '#1e293b' : (item.is_no_return ? 'rgba(51, 65, 85, 0.6)' : 'rgba(15,23,42,.78)'),
        cursor: disabled ? 'not-allowed' : 'grab',
        opacity: isDragging && !isOverlay ? 0.3 : 1,
        boxShadow: isOverlay ? '0 16px 35px rgba(0,0,0,.45)' : '0 4px 12px rgba(0,0,0,.12)',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <GripVertical size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-primary)', fontSize: '.84rem', fontWeight: 700 }}>{item.title || 'Milestone chưa đặt tên'}</span>
            {item.is_no_return && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 4, background: 'rgba(239,68,68,.25)', color: '#fca5a5', fontSize: '.68rem', fontWeight: 700 }}>
                <Lock size={10} /> Khóa No-Return
              </span>
            )}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '.74rem', marginTop: 5 }}>{item.owner || 'Chưa gán owner'}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: '.72rem' }}>
            {item.due_date ? <span style={{ color: 'var(--accent-warning)' }}>Hạn: {item.due_date}</span> : <span style={{ color: 'var(--text-muted)' }}>Chưa có hạn</span>}
            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>⏱️ {item.lead_time_days ?? 0} ngày</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StageColumn({ stage, items, disabled }: { stage: typeof STAGES[number]; items: ExecutionMilestone[]; disabled: boolean }) {
  const { isOver, setNodeRef } = useDroppable({ id: stage.id, disabled });
  return (
    <div ref={setNodeRef} style={{
      minHeight: 230,
      padding: 12,
      borderRadius: 12,
      background: isOver ? `${stage.color}20` : 'rgba(0,0,0,.18)',
      border: `1px ${items.length ? 'solid' : 'dashed'} ${isOver ? stage.color : 'rgba(255,255,255,.1)'}`,
      transition: 'all .2s ease',
    }}>
      <div style={{ borderTop: `3px solid ${stage.color}`, paddingTop: 9, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: stage.color, fontWeight: 800, fontSize: '.87rem' }}>{stage.label} · {items.length}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '.72rem' }}>{stage.subtitle}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {items.map(item => <MilestoneCard key={item.id} item={item} disabled={disabled} />)}
        {!items.length && <div style={{ padding: '24px 6px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.75rem' }}>Kéo milestone vào đây</div>}
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
  const isSlaApproved = checkedCount >= 4; // Tối thiểu 4/5 tiêu chí SLA
  const locked = isDisabled || !isPrerequisiteComplete;

  const totalLeadTime = milestones.reduce((sum, item) => sum + (Number(item.lead_time_days) || 0), 0);
  const noReturnCount = milestones.filter(m => m.is_no_return).length;

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

  const updateMilestone = (id: string, field: keyof ExecutionMilestone, value: any) => {
    if (locked) return;
    setData(prev => ({
      ...prev,
      b13_execution: {
        ...prev.b13_execution,
        milestones: (prev.b13_execution.milestones || []).map(item => item.id === id ? { ...item, [field]: value } : item),
      },
    }));
  };

  const addMilestone = () => {
    if (locked || !isSlaApproved) return;
    const newId = `ms-${Date.now()}`;
    const newMilestone: ExecutionMilestone = {
      id: newId,
      title: 'Milestone mới',
      owner: 'Export Team',
      due_date: '',
      lead_time_days: 7,
      is_no_return: false,
      status: 'todo',
      note: '',
    };
    setData(prev => ({
      ...prev,
      b13_execution: {
        ...prev.b13_execution,
        milestones: [...(prev.b13_execution.milestones || []), newMilestone],
      },
    }));
    setTimeout(handleBlur, 100);
  };

  const deleteMilestone = (id: string) => {
    if (locked || !isSlaApproved) return;
    setData(prev => ({
      ...prev,
      b13_execution: {
        ...prev.b13_execution,
        milestones: (prev.b13_execution.milestones || []).filter(item => item.id !== id),
      },
    }));
    setTimeout(handleBlur, 100);
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (locked || !isSlaApproved) return;
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || locked || !isSlaApproved) return;
    const targetStatus = over.id as ExecutionStatus;
    updateMilestone(String(active.id), 'status', targetStatus);
    setTimeout(handleBlur, 100);
  };

  const activeItem = milestones.find(item => item.id === activeId);

  return (
    <section className="glass-panel" style={{ padding: '28px', opacity: isDisabled ? .6 : 1 }}>
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
          Bài 13: Bàn Giao Nội Bộ & Quản Trị Vận Hành (Internal Handover & Execution SLA)
        </h2>
      </div>
      <p className="text-secondary text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Thiết lập ranh giới trách nhiệm giữa Sales - Sản xuất - Logistics bằng bản cam kết SLA nội bộ và kiểm soát các điểm không thể đảo ngược (Point of No Return).
      </p>

      {/* 1. INTERNAL SLA CHECKLIST */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: '1.02rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
            <ClipboardCheck size={18} color="var(--accent-primary)" /> 1. Cam kết Dịch vụ Nội bộ (Internal SLA Approval)
          </h3>
          <span style={{ fontSize: '.8rem', color: isSlaApproved ? '#10b981' : 'var(--accent-danger)', fontWeight: 700 }}>
            {checkedCount}/5 tiêu chuẩn phê duyệt
          </span>
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          {SLA_ITEMS.map(item => {
            const isChecked = Boolean(checklist[item.key]);
            return (
              <label
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(15, 23, 42, 0.45)',
                  border: `1px solid ${isChecked ? '#10b981' : 'rgba(255, 255, 255, 0.08)'}`,
                  cursor: locked ? 'not-allowed' : 'pointer',
                  transition: 'all .2s ease'
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={e => updateChecklist(item.key, e.target.checked)}
                  disabled={locked}
                  style={{ marginTop: 2, width: 16, height: 16, accentColor: '#10b981' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '.86rem', fontWeight: 700, color: isChecked ? '#10b981' : 'var(--text-primary)' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '.76rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {item.hint}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {!isSlaApproved && (
          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--accent-danger)', color: '#fca5a5', fontSize: '.82rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} color="var(--accent-danger)" style={{ flexShrink: 0 }} />
            <span><strong>Chốt chặn SLA kích hoạt:</strong> Bắt buộc tick tối thiểu 4/5 tiêu chí SLA nội bộ để mở khóa kế hoạch Milestones và bảng Kanban Board bên dưới.</span>
          </div>
        )}
      </div>

      {/* KHU VỰC 2 & 3: BỊ KHÓA NẾU CHƯA ĐỦ SLA */}
      <div style={{ opacity: isSlaApproved ? 1 : 0.45, filter: isSlaApproved ? 'none' : 'grayscale(60%)', pointerEvents: isSlaApproved ? 'auto' : 'none', transition: 'all .3s ease' }}>
        
        {/* 2. EXECUTION MILESTONES */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
                <CalendarClock size={18} color="var(--accent-primary)" /> 2. Kế hoạch Mốc Thời gian & Điểm Không Thể Đảo Ngược (Milestones)
              </h3>
              <span style={{ fontSize: '.76rem', color: 'var(--text-muted)' }}>Tổng Lead Time: {totalLeadTime} ngày · {noReturnCount} mốc No-Return</span>
            </div>

            <button
              type="button"
              onClick={addMilestone}
              disabled={locked || !isSlaApproved}
              className="btn btn-secondary"
              style={{ fontSize: '.78rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={14} /> Thêm Mốc
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {milestones.map(item => {
              const isNoReturn = Boolean(item.is_no_return);

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.8fr 1.2fr 130px 100px 140px auto',
                    gap: 10,
                    alignItems: 'center',
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: isNoReturn ? 'rgba(51, 65, 85, 0.45)' : 'rgba(15, 23, 42, 0.5)',
                    border: `1px solid ${isNoReturn ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                    transition: 'all .2s ease'
                  }}
                >
                  <div>
                    <input
                      type="text"
                      className="form-input"
                      value={item.title}
                      onChange={e => updateMilestone(item.id, 'title', e.target.value)}
                      onBlur={handleBlur}
                      disabled={locked || isNoReturn}
                      placeholder="Tên mốc..."
                      style={{ fontSize: '.84rem', fontWeight: 600 }}
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      className="form-input"
                      value={item.owner}
                      onChange={e => updateMilestone(item.id, 'owner', e.target.value)}
                      onBlur={handleBlur}
                      disabled={locked || isNoReturn}
                      placeholder="Bộ phận phụ trách..."
                      style={{ fontSize: '.82rem' }}
                    />
                  </div>

                  <div>
                    <input
                      type="date"
                      className="form-input"
                      value={item.due_date}
                      onChange={e => updateMilestone(item.id, 'due_date', e.target.value)}
                      onBlur={handleBlur}
                      disabled={locked || isNoReturn}
                      style={{ fontSize: '.8rem', opacity: isNoReturn ? 0.7 : 1 }}
                    />
                  </div>

                  <div>
                    <input
                      type="number"
                      className="form-input"
                      value={item.lead_time_days ?? ''}
                      onChange={e => updateMilestone(item.id, 'lead_time_days', Number(e.target.value) || 0)}
                      onBlur={handleBlur}
                      disabled={locked || isNoReturn}
                      placeholder="Ngày"
                      style={{ fontSize: '.82rem', textAlign: 'center', opacity: isNoReturn ? 0.7 : 1 }}
                    />
                  </div>

                  {/* CHECKBOX NO-RETURN */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.76rem', color: isNoReturn ? '#f87171' : 'var(--text-muted)', cursor: locked ? 'not-allowed' : 'pointer', fontWeight: isNoReturn ? 700 : 500 }}>
                    <input
                      type="checkbox"
                      checked={isNoReturn}
                      onChange={e => updateMilestone(item.id, 'is_no_return', e.target.checked)}
                      disabled={locked}
                      style={{ accentColor: '#ef4444' }}
                    />
                    <span>{isNoReturn ? '🔒 Đã khóa No-Return' : 'No-Return Point'}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => deleteMilestone(item.id)}
                    disabled={locked || milestones.length <= 1 || isNoReturn}
                    style={{ border: 0, background: 'transparent', color: isNoReturn ? 'var(--text-muted)' : 'var(--accent-danger)', cursor: (locked || isNoReturn) ? 'not-allowed' : 'pointer' }}
                    title={isNoReturn ? 'Không thể xóa mốc No-Return' : 'Xóa mốc'}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. KANBAN BOARD */}
        <div>
          <h3 style={{ fontSize: '1.02rem', fontWeight: 'bold', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
            <Truck size={18} color="var(--accent-primary)" /> 3. Bảng Kanban Điều Phối Tiến Độ Vận Hành
          </h3>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {STAGES.map(stage => (
                <StageColumn
                  key={stage.id}
                  stage={stage}
                  items={milestones.filter(m => m.status === stage.id)}
                  disabled={locked || !isSlaApproved}
                />
              ))}
            </div>
            <DragOverlay>
              {activeItem ? <MilestoneCard item={activeItem} disabled={false} isOverlay /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </section>
  );
}
