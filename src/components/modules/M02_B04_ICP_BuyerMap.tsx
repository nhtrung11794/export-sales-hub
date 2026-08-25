'use client';

import React, { useState, useEffect } from 'react';
import { useModuleStore } from '@/store/useModuleStore';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { Users, GripVertical, Building2 } from 'lucide-react';

const BUYER_ROLES = [
  { id: 'qa', label: 'QA / Quality Control' },
  { id: 'boss', label: 'CEO / Founder' },
  { id: 'logistics', label: 'Logistics Manager' },
  { id: 'procurement', label: 'Procurement' }
];

const DEPARTMENTS = [
  { id: 'dept-sourcing', label: 'Phòng Mua hàng' },
  { id: 'dept-exec', label: 'Ban Giám đốc' },
  { id: 'dept-ops', label: 'Phòng Vận hành' }
];

interface ICPData {
  company_size: string;
  industry: string;
  buyer_map: Record<string, string[]>;
}

function DraggableRole({ role, isDisabled }: { role: { id: string, label: string }, isDisabled: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: role.id,
    disabled: isDisabled,
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        display: 'flex', alignItems: 'center', gap: '8px', padding: '8px',
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
        cursor: isDisabled ? 'not-allowed' : 'grab',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        opacity: isDisabled ? 0.6 : 1,
        color: 'var(--text-primary)'
      }}
      {...listeners}
      {...attributes}
    >
      <GripVertical size={16} color="var(--text-muted)" />
      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{role.label}</span>
    </div>
  );
}

function DroppableDepartment({ dept, items, isDisabled }: { dept: { id: string, label: string }, items: string[], isDisabled: boolean }) {
  const { isOver, setNodeRef } = useDroppable({
    id: dept.id,
    disabled: isDisabled,
  });
  
  return (
    <div 
      ref={setNodeRef} 
      style={{
        padding: '16px', borderRadius: '12px', minHeight: '120px',
        border: isOver ? '2px dashed var(--accent-primary)' : '2px dashed rgba(255,255,255,0.15)',
        background: isOver ? 'rgba(59, 130, 246, 0.05)' : 'rgba(15, 23, 42, 0.3)',
        transition: 'all 0.2s ease',
        display: 'flex', flexDirection: 'column', gap: '12px'
      }}
    >
      <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Building2 size={16} />
        {dept.label}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map(itemId => {
          const role = BUYER_ROLES.find(r => r.id === itemId);
          if (!role) return null;
          return (
            <div key={itemId} style={{
              padding: '8px', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)',
              borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              {role.label}
            </div>
          );
        })}
        {items.length === 0 && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', margin: '16px 0' }}>
            Kéo thả nhân sự vào đây
          </p>
        )}
      </div>
    </div>
  );
}

export default function M02_B04_ICP_BuyerMap() {
  const { updateSubmissionLocal, getModuleData, submissions } = useModuleStore();
  const formData = getModuleData('M02') || {};
  const isLocked = submissions['M02']?.is_locked || false;
  
  const [icpData, setIcpData] = useState<ICPData>({
    company_size: formData.icp_profile?.company_size || '',
    industry: formData.icp_profile?.industry || '',
    buyer_map: formData.icp_profile?.buyer_map || {
      'dept-sourcing': [],
      'dept-exec': [],
      'dept-ops': []
    }
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      updateSubmissionLocal('M02', { 
        ...formData, 
        icp_profile: icpData 
      });
    }, 500);
    return () => clearTimeout(handler);
  }, [icpData, updateSubmissionLocal, formData]);

  const handleDragEnd = (event: DragEndEvent) => {
    if (isLocked) return;
    const { over, active } = event;
    if (!over) return;
    
    const roleId = active.id as string;
    const destDeptId = over.id as string;

    setIcpData(prev => {
      const newMap = { ...prev.buyer_map };
      Object.keys(newMap).forEach(deptId => {
        newMap[deptId] = newMap[deptId].filter(id => id !== roleId);
      });
      if (!newMap[destDeptId]) newMap[destDeptId] = [];
      newMap[destDeptId].push(roleId);
      return { ...prev, buyer_map: newMap };
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setIcpData(prev => ({ ...prev, [name]: value }));
  };

  const unassignedRoles = BUYER_ROLES.filter(role => {
    const allAssigned = Object.values(icpData.buyer_map).flat();
    return !allAssigned.includes(role.id);
  });

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '8px', borderRadius: '8px', color: '#a78bfa' }}>
          <Users size={24} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>B04: ICP & Buyer Map</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Định hình chân dung khách hàng & người ra quyết định</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Quy mô công ty</label>
            <select 
              name="company_size" 
              value={icpData.company_size}
              onChange={handleSelectChange}
              disabled={isLocked}
              className="form-input"
              style={{ width: '100%', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', opacity: isLocked ? 0.6 : 1, cursor: isLocked ? 'not-allowed' : 'pointer' }}
            >
              <option value="">-- Chọn --</option>
              <option value="SME">SME (Dưới 50 người)</option>
              <option value="Mid-market">Mid-market (50 - 500 người)</option>
              <option value="Enterprise">Enterprise (Trên 500 người)</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Ngành hàng</label>
            <select 
              name="industry" 
              value={icpData.industry}
              onChange={handleSelectChange}
              disabled={isLocked}
              className="form-input"
              style={{ width: '100%', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', opacity: isLocked ? 0.6 : 1, cursor: isLocked ? 'not-allowed' : 'pointer' }}
            >
              <option value="">-- Chọn --</option>
              <option value="Retail">Bán lẻ (Retail / Supermarket)</option>
              <option value="Distributor">Nhà phân phối (Distributor)</option>
              <option value="Manufacturer">Sản xuất (Manufacturer)</option>
            </select>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)' }} />

        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px' }}>Sơ đồ ảnh hưởng (Buyer Map)</h4>
          
          <DndContext onDragEnd={handleDragEnd}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ width: '30%', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h5 style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Nhân sự cần map</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '200px' }}>
                  {unassignedRoles.map(role => (
                    <DraggableRole key={role.id} role={role} isDisabled={isLocked} />
                  ))}
                  {unassignedRoles.length === 0 && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--accent-success)', fontWeight: 'bold', textAlign: 'center', padding: '16px 0' }}>Đã map toàn bộ!</p>
                  )}
                </div>
              </div>

              <div style={{ width: '70%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {DEPARTMENTS.map(dept => (
                  <DroppableDepartment 
                    key={dept.id} 
                    dept={dept} 
                    items={icpData.buyer_map[dept.id] || []}
                    isDisabled={isLocked}
                  />
                ))}
              </div>
            </div>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
