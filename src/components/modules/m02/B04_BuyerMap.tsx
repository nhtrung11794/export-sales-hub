import React, { useState } from 'react';
import { M02FormData } from './M02_CombinedForm';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { Users, Building, ShieldAlert } from 'lucide-react';

interface B04Props {
  data: M02FormData;
  setData: React.Dispatch<React.SetStateAction<M02FormData>>;
  handleBlur: () => void;
  isDisabled: boolean;
}

const ROLES = [
  { id: 'role-ceo', label: 'CEO / Director' },
  { id: 'role-procurement', label: 'Procurement / Sourcing' },
  { id: 'role-qa', label: 'QA / QC Manager' },
  { id: 'role-production', label: 'Production Manager' },
  { id: 'role-logistics', label: 'Logistics Manager' },
  { id: 'role-finance', label: 'Finance / Accountant' }
];

const DEPARTMENTS = [
  { id: 'dept-management', label: 'Management (Ban GĐ)' },
  { id: 'dept-sourcing', label: 'Sourcing (Mua hàng)' },
  { id: 'dept-technical', label: 'Technical (Kỹ thuật/SX)' },
  { id: 'dept-finance', label: 'Finance (Tài chính)' }
];

function DraggableRole({ role, disabled }: { role: { id: string; label: string }, disabled: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: role.id,
    data: role,
    disabled
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1000,
    opacity: 0.9,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes}
      className={`role-card ${disabled ? 'disabled' : ''}`}
      style={{
        padding: '10px 16px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        fontSize: '0.875rem',
        cursor: disabled ? 'not-allowed' : 'grab',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        color: 'var(--text-primary)',
        ...style
      }}
    >
      {role.label}
    </div>
  );
}

function DroppableZone({ dept, assignedRoles, onRemove, disabled }: { 
  dept: { id: string; label: string }; 
  assignedRoles: Array<{ id: string; role: string; department: string }>;
  onRemove: (id: string) => void;
  disabled: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: dept.id,
  });

  return (
    <div 
      ref={setNodeRef}
      style={{
        background: isOver ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.2)',
        border: isOver ? '1px dashed var(--accent-primary)' : '1px solid rgba(255,255,255,0.05)',
        borderRadius: '12px',
        padding: '16px',
        minHeight: '120px',
        transition: 'all 0.2s'
      }}
    >
      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
        {dept.label}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {assignedRoles.map(r => (
          <div key={r.id} style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'var(--accent-primary)', color: '#fff', 
            padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem' 
          }}>
            <span>{r.role}</span>
            {!disabled && (
              <button 
                onClick={() => onRemove(r.id)} 
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem', lineHeight: '1' }}
              >
                &times;
              </button>
            )}
          </div>
        ))}
        {assignedRoles.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', marginTop: '16px' }}>
            Kéo thả vai trò vào đây
          </div>
        )}
      </div>
    </div>
  );
}

export default function B04_BuyerMap({ data, setData, handleBlur, isDisabled }: B04Props) {
  const isB03Completed = data.target_market && data.route_to_market && data.strategic_reason;

  const handleFieldChange = (field: keyof M02FormData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.data.current) {
      const roleId = active.id as string;
      const roleLabel = active.data.current.label;
      const deptId = over.id as string;

      // Prevent duplicate exact roles in the same dept (optional, but good practice)
      const existing = data.buyer_map_roles.find(r => r.role === roleLabel && r.department === deptId);
      if (existing) return;

      const newRoleObj = {
        id: `${roleId}-${Date.now()}`,
        role: roleLabel,
        department: deptId
      };

      setData(prev => {
        const newRoles = [...prev.buyer_map_roles, newRoleObj];
        return { ...prev, buyer_map_roles: newRoles };
      });
      
      // Auto-save trigger
      setTimeout(() => handleBlur(), 100);
    }
  };

  const handleRemoveRole = (idToRemove: string) => {
    setData(prev => {
      const newRoles = prev.buyer_map_roles.filter(r => r.id !== idToRemove);
      return { ...prev, buyer_map_roles: newRoles };
    });
    setTimeout(() => handleBlur(), 100);
  };

  if (!isB03Completed) {
    return (
      <section className="glass-panel" style={{ padding: '32px', opacity: 0.5, pointerEvents: 'none' }}>
        <h2 style={{ marginBottom: '8px', color: 'var(--text-muted)', fontSize: '1.4rem', fontWeight: 'bold' }}>
          Bài 04: Phân khúc khách hàng và Buyer Logic
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-warning)', marginTop: '16px' }}>
          <ShieldAlert size={18} /> <span>Vui lòng hoàn thành Quyết định Chiến lược ở Bài 03 để mở khóa nội dung này.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="glass-panel" style={{ padding: '32px' }}>
      <h2 style={{ marginBottom: '8px', color: 'var(--accent-primary)', fontSize: '1.4rem', fontWeight: 'bold' }}>
        Bài 04: Phân khúc khách hàng và Buyer Logic
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Route-to-market chọn ở B03: <strong style={{ color: 'var(--accent-warning)' }}>{data.route_to_market}</strong>. Dựa vào đó, hãy xác định ICP và vẽ Sơ đồ mua hàng (Buyer Map).
      </p>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        
        {/* CỘT TRÁI: ICP CANVAS (40%) */}
        <div style={{ flex: '0 0 35%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={20} color="var(--accent-primary)" /> Chân dung ICP
          </h3>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Quy mô doanh nghiệp (Size)</label>
            <input 
              type="text" className="form-input" placeholder="VD: Doanh thu > 10M USD..."
              value={data.icp_size || ''} onChange={(e) => handleFieldChange('icp_size', e.target.value)}
              onBlur={handleBlur} disabled={isDisabled} style={{ width: '100%', padding: '10px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Ngành nghề (Industry/Segment)</label>
            <input 
              type="text" className="form-input" placeholder="VD: Bán lẻ thực phẩm..."
              value={data.icp_industry || ''} onChange={(e) => handleFieldChange('icp_industry', e.target.value)}
              onBlur={handleBlur} disabled={isDisabled} style={{ width: '100%', padding: '10px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Vấn đề cốt lõi (Core Problem)</label>
            <textarea 
              className="form-input" placeholder="Khách hàng ICP đang vướng mắc điều gì lớn nhất?"
              value={data.icp_problem || ''} onChange={(e) => handleFieldChange('icp_problem', e.target.value)}
              onBlur={handleBlur} disabled={isDisabled} rows={4} style={{ width: '100%', padding: '10px' }}
            />
          </div>
        </div>

        {/* CỘT PHẢI: BUYER MAP DRAG & DROP (60%) */}
        <div style={{ flex: '1' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Users size={20} color="var(--accent-warning)" /> Sơ đồ mua hàng (Buyer Map)
          </h3>
          
          <DndContext onDragEnd={handleDragEnd}>
            <div style={{ display: 'flex', gap: '24px' }}>
              
              {/* Cột Role Cards */}
              <div style={{ flex: '0 0 220px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Kéo thẻ vai trò:</div>
                {ROLES.map(role => (
                  <DraggableRole key={role.id} role={role} disabled={isDisabled} />
                ))}
              </div>

              {/* Lưới Departments */}
              <div style={{ flex: '1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {DEPARTMENTS.map(dept => (
                  <DroppableZone 
                    key={dept.id} 
                    dept={dept} 
                    assignedRoles={data.buyer_map_roles.filter(r => r.department === dept.id)} 
                    onRemove={handleRemoveRole}
                    disabled={isDisabled}
                  />
                ))}
              </div>
              
            </div>
          </DndContext>
          <p style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            * Sơ đồ này sẽ giúp bạn hiểu rõ Ai là người ra quyết định, Ai là người chặn (Blocker) trong quá trình chốt Deal.
          </p>
        </div>

      </div>
    </section>
  );
}
