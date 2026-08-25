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
  { id: 'dept-sourcing', label: 'Phòng Mua hàng (Sourcing)' },
  { id: 'dept-exec', label: 'Ban Giám đốc (Executive)' },
  { id: 'dept-ops', label: 'Phòng Vận hành (Operations)' }
];

interface ICPData {
  company_size: string;
  industry: string;
  buyer_map: Record<string, string[]>; // dept_id -> array of role_ids
}

// Draggable Component
function DraggableRole({ role }: { role: { id: string, label: string } }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: role.id,
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-md shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-300"
    >
      <GripVertical size={16} className="text-slate-400" />
      <span className="text-sm font-medium text-slate-700">{role.label}</span>
    </div>
  );
}

// Droppable Component
function DroppableDepartment({ dept, items }: { dept: { id: string, label: string }, items: string[] }) {
  const { isOver, setNodeRef } = useDroppable({
    id: dept.id,
  });
  
  return (
    <div 
      ref={setNodeRef} 
      className={`p-4 border-2 border-dashed rounded-xl min-h-[120px] transition-colors ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <Building2 size={16} className="text-slate-400" />
        {dept.label}
      </h4>
      <div className="space-y-2">
        {items.map(itemId => {
          const role = BUYER_ROLES.find(r => r.id === itemId);
          if (!role) return null;
          return (
            <div key={itemId} className="p-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium border border-blue-200">
              {role.label}
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="text-xs text-slate-400 italic text-center py-4">Kéo thả vị trí vào đây</p>
        )}
      </div>
    </div>
  );
}

export default function M02_B04_ICP_BuyerMap() {
  const { updateSubmissionLocal, getModuleData } = useModuleStore();
  const formData = getModuleData('M02') || {};
  
  const [icpData, setIcpData] = useState<ICPData>({
    company_size: formData.icp_profile?.company_size || '',
    industry: formData.icp_profile?.industry || '',
    buyer_map: formData.icp_profile?.buyer_map || {
      'dept-sourcing': [],
      'dept-exec': [],
      'dept-ops': []
    }
  });

  // Debounced Auto-save
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
    const { over, active } = event;
    if (!over) return;
    
    const roleId = active.id as string;
    const destDeptId = over.id as string;

    setIcpData(prev => {
      const newMap = { ...prev.buyer_map };
      // Remove from all depts first
      Object.keys(newMap).forEach(deptId => {
        newMap[deptId] = newMap[deptId].filter(id => id !== roleId);
      });
      // Add to new dept
      if (!newMap[destDeptId]) newMap[destDeptId] = [];
      newMap[destDeptId].push(roleId);
      
      return { ...prev, buyer_map: newMap };
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setIcpData(prev => ({ ...prev, [name]: value }));
  };

  // Find roles not yet assigned to any department
  const unassignedRoles = BUYER_ROLES.filter(role => {
    const allAssigned = Object.values(icpData.buyer_map).flat();
    return !allAssigned.includes(role.id);
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
          <Users size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">B04: ICP & Buyer Map</h2>
          <p className="text-sm text-slate-500">Định hình chân dung khách hàng & người ra quyết định</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {/* ICP Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Quy mô công ty</label>
            <select 
              name="company_size" 
              value={icpData.company_size}
              onChange={handleSelectChange}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Chọn --</option>
              <option value="SME">SME (Dưới 50 người)</option>
              <option value="Mid-market">Mid-market (50 - 500 người)</option>
              <option value="Enterprise">Enterprise (Trên 500 người)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Ngành hàng</label>
            <select 
              name="industry" 
              value={icpData.industry}
              onChange={handleSelectChange}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Chọn --</option>
              <option value="Retail">Bán lẻ (Retail / Supermarket)</option>
              <option value="Distributor">Nhà phân phối (Distributor)</option>
              <option value="Manufacturer">Sản xuất (Manufacturer)</option>
            </select>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Drag & Drop Map */}
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Sơ đồ ảnh hưởng (Buyer Map)</h3>
          
          <DndContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4">
              {/* Sidebar: Unassigned Roles */}
              <div className="w-1/3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Nhân sự cần map</h4>
                <div className="space-y-2 min-h-[200px]">
                  {unassignedRoles.map(role => (
                    <DraggableRole key={role.id} role={role} />
                  ))}
                  {unassignedRoles.length === 0 && (
                    <p className="text-xs text-green-600 font-medium text-center py-4">Đã map toàn bộ!</p>
                  )}
                </div>
              </div>

              {/* Departments Droppable Area */}
              <div className="w-2/3 grid grid-cols-2 gap-4">
                {DEPARTMENTS.map(dept => (
                  <DroppableDepartment 
                    key={dept.id} 
                    dept={dept} 
                    items={icpData.buyer_map[dept.id] || []} 
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
