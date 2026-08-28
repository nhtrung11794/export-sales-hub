'use client';

import React, { useState } from 'react';
import { M02FormData } from './M02_CombinedForm';
import { DndContext, useDraggable, useDroppable, DragEndEvent, DragOverlay, closestCenter, DragStartEvent } from '@dnd-kit/core';
import { Users, Building, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface B04Props {
  data: M02FormData;
  setData: React.Dispatch<React.SetStateAction<M02FormData>>;
  handleBlur: () => void;
  isDisabled: boolean;
}

const ROLES = [
  { id: 'role-ceo', label: 'CEO / Managing Director' },
  { id: 'role-procurement', label: 'Procurement / Sourcing Manager' },
  { id: 'role-qa', label: 'QA / QC Director' },
  { id: 'role-production', label: 'Production / Factory Manager' },
  { id: 'role-logistics', label: 'Supply Chain / Logistics Manager' },
  { id: 'role-finance', label: 'CFO / Finance Controller' },
  { id: 'role-other', label: 'Consultant / R&D Specialist' }
];

const BUYING_ROLES = [
  { id: 'role-decision-maker', label: 'Decision Maker (Người chốt)', color: '#fb7185' },
  { id: 'role-influencer', label: 'Influencer (Người gây ảnh hưởng)', color: '#22d3ee' },
  { id: 'role-user', label: 'User (Người trực tiếp dùng)', color: '#fde047' },
  { id: 'role-approver', label: 'Approver (Người ký duyệt)', color: '#2dd4bf' },
  { id: 'role-gate-keeper', label: 'Gate Keeper (Người chặn cổng)', color: '#a78bfa' }
];

const INDUSTRY_OPTIONS = [
  'Importer (Nhà nhập khẩu trực tiếp)',
  'Distributor / Wholesaler (Nhà phân phối bán buôn)',
  'Retail Chain / Supermarket (Chuỗi bán lẻ / Đại siêu thị)',
  'Food Service / HORECA (Khách sạn, Nhà hàng, Chuỗi F&B)',
  'Brand Owner / OEM-ODM Buyer (Chủ thương hiệu / Đặt gia công)',
  'Manufacturer / Processor (Nhà máy sản xuất / Chế biến)',
  'Trading House / Broker (Công ty thương mại / Môi giới quốc tế)',
  'OTHER'
];

const SIZE_OPTIONS = [
  'Dưới $10M USD / năm (Nhà nhập khẩu nhỏ / vừa)',
  '$10M - $50M USD / năm (Nhà phân phối cấp vùng)',
  '$50M - $200M USD / năm (Tập đoàn phân phối quốc gia)',
  'Trên $200M USD / năm (Chuỗi bán lẻ / Đại siêu thị toàn cầu)',
  'OTHER'
];

function DraggableRole({ role, disabled, isOverlay = false }: { role: { id: string; label: string }, disabled: boolean, isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: role.id,
    data: role,
    disabled
  });

  const opacity = (isDragging && !isOverlay) ? 0.3 : 1;

  return (
    <div 
      ref={!isOverlay ? setNodeRef : undefined} 
      {...(!isOverlay ? listeners : {})} 
      {...(!isOverlay ? attributes : {})}
      className={`role-card ${disabled ? 'disabled' : ''}`}
      style={{
        padding: '10px 14px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        fontSize: '0.82rem',
        cursor: disabled ? 'not-allowed' : (isDragging ? 'grabbing' : 'grab'),
        boxShadow: isOverlay ? '0 10px 20px rgba(0,0,0,0.4)' : '0 2px 5px rgba(0,0,0,0.2)',
        color: 'var(--text-primary)',
        opacity,
        transform: isOverlay ? 'scale(1.05)' : 'none',
        pointerEvents: isOverlay ? 'none' : 'auto'
      }}
    >
      {role.label}
    </div>
  );
}

function DroppableZone({ zone, assignedRoles, onRemove, disabled }: { 
  zone: { id: string; label: string; color: string }; 
  assignedRoles: Array<{ id: string; role: string; department: string }>;
  onRemove: (id: string) => void;
  disabled: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: zone.id,
  });

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const isDecisionMakerZone = zone.id === 'role-decision-maker';
  const hasTooManyDecisionMakers = isDecisionMakerZone && assignedRoles.length > 2;

  return (
    <div 
      ref={setNodeRef}
      style={{
        background: isOver ? hexToRgba(zone.color, 0.2) : hexToRgba(zone.color, 0.05),
        border: `1px solid ${hasTooManyDecisionMakers ? 'var(--accent-danger)' : isOver ? zone.color : hexToRgba(zone.color, 0.3)}`,
        borderRadius: '12px',
        padding: '14px',
        minHeight: '120px',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: `1px solid ${hexToRgba(zone.color, 0.2)}`, paddingBottom: '6px' }}>
        <h4 style={{ fontSize: '0.85rem', color: zone.color, fontWeight: 'bold', margin: 0 }}>
          {zone.label}
        </h4>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({assignedRoles.length})</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {assignedRoles.map(r => (
          <div key={r.id} style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: zone.color, color: '#0f172a', fontWeight: '600',
            padding: '5px 10px', borderRadius: '6px', fontSize: '0.78rem' 
          }}>
            <span>{r.role}</span>
            {!disabled && (
              <button 
                onClick={() => onRemove(r.id)} 
                style={{ background: 'none', border: 'none', color: '#0f172a', cursor: 'pointer', fontSize: '1.1rem', lineHeight: '1', padding: 0 }}
              >
                &times;
              </button>
            )}
          </div>
        ))}
        {assignedRoles.length === 0 && (
          <div style={{ color: hexToRgba(zone.color, 0.7), fontSize: '0.76rem', fontStyle: 'italic', textAlign: 'center', marginTop: '12px' }}>
            Kéo thả vai trò vào đây
          </div>
        )}
      </div>

      {hasTooManyDecisionMakers && (
        <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#fca5a5', lineHeight: '1.3' }}>
          ⚠️ B2B thường chỉ có 1-2 Decision Makers cốt lõi.
        </div>
      )}
    </div>
  );
}

export default function B04_BuyerMap({ data, setData, handleBlur, isDisabled }: B04Props) {
  const isB03Completed = data.target_market && data.route_to_market && data.strategic_reason;
  const [activeId, setActiveId] = useState<string | null>(null);

  const [isOtherIndustry, setIsOtherIndustry] = useState(() => {
    return data.icp_industry ? !INDUSTRY_OPTIONS.includes(data.icp_industry) : false;
  });

  const [isOtherSize, setIsOtherSize] = useState(() => {
    return data.icp_size ? !SIZE_OPTIONS.includes(data.icp_size) : false;
  });

  const handleFieldChange = (field: keyof M02FormData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (over && active.data.current) {
      const roleId = active.id as string;
      const roleLabel = active.data.current.label;
      const deptId = over.id as string;

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

  const decisionMakerCount = (data.buyer_map_roles || []).filter(r => r.department === 'role-decision-maker').length;

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
        Bài 04: Phân khúc khách hàng và Buyer Logic (ICP & Buyer Map)
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '28px' }}>
        Route-to-market chọn ở B03: <strong style={{ color: 'var(--accent-warning)' }}>{data.route_to_market}</strong>. Dựa vào đó, hãy chuẩn hóa chân dung ICP và sơ đồ các bên tham gia mua hàng.
      </p>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* CỘT TRÁI: ICP CANVAS (40%) */}
        <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontWeight: 'bold' }}>
            <Building size={18} color="var(--accent-primary)" /> Chân dung ICP Chuẩn Hóa
          </h3>
          
          {/* DROPDOWN NGÀNH NGHỀ */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
              1. Loại hình doanh nghiệp của Buyer (Buyer Business Model / Segment) <span style={{ color: 'var(--accent-danger)' }}>*</span>
            </label>
            <select
              className="form-input"
              value={isOtherIndustry ? 'OTHER' : (data.icp_industry || '')}
              onChange={(e) => {
                if (e.target.value === 'OTHER') {
                  setIsOtherIndustry(true);
                  handleFieldChange('icp_industry', '');
                } else {
                  setIsOtherIndustry(false);
                  handleFieldChange('icp_industry', e.target.value);
                }
              }}
              onBlur={handleBlur}
              disabled={isDisabled}
              style={{ width: '100%', padding: '9px', fontSize: '0.85rem', marginBottom: isOtherIndustry ? '6px' : '0' }}
            >
              <option value="" disabled>-- Chọn loại hình doanh nghiệp của Buyer --</option>
              {INDUSTRY_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt === 'OTHER' ? 'Khác (Tự định nghĩa)' : opt}</option>
              ))}
            </select>

            {isOtherIndustry && (
              <input 
                type="text" className="form-input" placeholder="Nhập loại hình doanh nghiệp cụ thể (VD: Online D2C Brand, Wholesaler miền Nam...)..."
                value={data.icp_industry || ''} onChange={(e) => handleFieldChange('icp_industry', e.target.value)}
                onBlur={handleBlur} disabled={isDisabled} style={{ width: '100%', padding: '9px', fontSize: '0.85rem' }}
              />
            )}
          </div>

          {/* DROPDOWN QUY MÔ */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
              2. Quy mô doanh thu của Buyer (Size / Tier) <span style={{ color: 'var(--accent-danger)' }}>*</span>
            </label>
            <select
              className="form-input"
              value={isOtherSize ? 'OTHER' : (data.icp_size || '')}
              onChange={(e) => {
                if (e.target.value === 'OTHER') {
                  setIsOtherSize(true);
                  handleFieldChange('icp_size', '');
                } else {
                  setIsOtherSize(false);
                  handleFieldChange('icp_size', e.target.value);
                }
              }}
              onBlur={handleBlur}
              disabled={isDisabled}
              style={{ width: '100%', padding: '9px', fontSize: '0.85rem', marginBottom: isOtherSize ? '6px' : '0' }}
            >
              <option value="" disabled>-- Chọn quy mô doanh thu --</option>
              {SIZE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt === 'OTHER' ? 'Khác (Tự định nghĩa)' : opt}</option>
              ))}
            </select>

            {isOtherSize && (
              <input 
                type="text" className="form-input" placeholder="Nhập quy mô cụ thể..."
                value={data.icp_size || ''} onChange={(e) => handleFieldChange('icp_size', e.target.value)}
                onBlur={handleBlur} disabled={isDisabled} style={{ width: '100%', padding: '9px', fontSize: '0.85rem' }}
              />
            )}
          </div>

          {/* TEXTAREA VẤN ĐỀ CỐT LÕI */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
              3. Vấn đề / Nỗi đau cốt lõi (Core Pain Point) <span style={{ color: 'var(--accent-danger)' }}>*</span>
            </label>
            <textarea 
              className="form-input" 
              placeholder="Khách hàng ICP đang vướng mắc điều gì lớn nhất (Ví dụ: Nhà cung cấp cũ thường trễ hạn 2 tuần, tỷ lệ lỗi 3%, không đáp ứng chứng chỉ mới...)"
              value={data.icp_problem || ''} 
              onChange={(e) => handleFieldChange('icp_problem', e.target.value)}
              onBlur={handleBlur} 
              disabled={isDisabled} 
              rows={4} 
              style={{ width: '100%', padding: '9px', fontSize: '0.85rem', resize: 'vertical' }}
            />
          </div>
        </div>

        {/* CỘT PHẢI: BUYER MAP DRAG & DROP (60%) */}
        <div style={{ flex: '2 1 500px', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontWeight: 'bold' }}>
              <Users size={18} color="var(--accent-warning)" /> Sơ đồ mua hàng (Buyer Map Matrix)
            </h3>
            {decisionMakerCount > 2 && (
              <span style={{ fontSize: '0.78rem', color: '#fca5a5', background: 'rgba(239,68,68,0.15)', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={13} /> Quá 2 Decision Makers
              </span>
            )}
          </div>
          
          <DndContext 
            onDragStart={handleDragStart} 
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
          >
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              
              {/* Cột Role Cards */}
              <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Kéo vai trò doanh nghiệp:</div>
                {ROLES.map(role => (
                  <DraggableRole key={role.id} role={role} disabled={isDisabled} />
                ))}
              </div>

              {/* Lưới Buying Roles */}
              <div style={{ flex: '2 1 300px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {BUYING_ROLES.map(zone => (
                  <DroppableZone 
                    key={zone.id} 
                    zone={zone} 
                    assignedRoles={data.buyer_map_roles.filter(r => r.department === zone.id)} 
                    onRemove={handleRemoveRole}
                    disabled={isDisabled}
                  />
                ))}
              </div>
              
            </div>

            <DragOverlay dropAnimation={{
              duration: 200,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}>
              {activeId ? (
                <DraggableRole 
                  role={ROLES.find(r => r.id === activeId) || { id: activeId, label: 'Role' }} 
                  disabled={isDisabled} 
                  isOverlay 
                />
              ) : null}
            </DragOverlay>
          </DndContext>

          <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            💡 <em>Ghi nhớ Sales B2B: Sơ đồ này xác định rõ Ai là người có quyền phủ quyết (Gate Keeper) và Ai là người bảo vệ đề xuất của bạn (Champion/Influencer) trước hội đồng duyệt mua.</em>
          </div>
        </div>

      </div>
    </section>
  );
}

