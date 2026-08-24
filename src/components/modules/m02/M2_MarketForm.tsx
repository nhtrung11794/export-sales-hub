'use client';

import React, { useEffect, useState } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { createClient } from '@/lib/supabase/client';
import { useModuleStore } from '@/store/useModuleStore';
import { CheckCircle, AlertCircle, Search, Lightbulb, Users, Map } from 'lucide-react';

// --- DATA STRUCTURE ---
interface DiscoveryZone {
  pain_points: string;
  needs: string;
  current_solution: string;
  gap: string;
}

interface M2FormData {
  market_scan: {
    target_market: string;
    market_signal: string;
    source_url: string;
    intelligence_result: string;
  };
  icp: {
    segment: string;
    company_size: string;
    selection_criteria: string;
  };
  buyer_map: Record<string, string | null>;
  discovery_line: Record<string, DiscoveryZone>;
}

const initialData: M2FormData = {
  market_scan: {
    target_market: '',
    market_signal: '',
    source_url: '',
    intelligence_result: ''
  },
  icp: {
    segment: '',
    company_size: '',
    selection_criteria: ''
  },
  buyer_map: {
    'ceo': null,
    'cfo': null,
    'procurement': null,
    'technical': null,
    'users': null,
    'admin': null
  },
  discovery_line: {
    'zone1_ice_breaking': { pain_points: '', needs: '', current_solution: '', gap: '' },
    'zone2_qualification': { pain_points: '', needs: '', current_solution: '', gap: '' },
    'zone3_pitching': { pain_points: '', needs: '', current_solution: '', gap: '' },
    'zone4_objection': { pain_points: '', needs: '', current_solution: '', gap: '' },
    'zone5_closing': { pain_points: '', needs: '', current_solution: '', gap: '' }
  }
};

const BUYER_TYPES = [
  { id: 'decision_maker', label: 'Decision Maker', color: '#ef4444' }, // Red
  { id: 'economic_buyer', label: 'Economic Buyer', color: '#f59e0b' }, // Orange
  { id: 'influencer', label: 'Influencer', color: '#3b82f6' }, // Blue
  { id: 'end_user', label: 'End User', color: '#10b981' }, // Green
  { id: 'champion', label: 'Champion', color: '#8b5cf6' }, // Purple
  { id: 'gatekeeper', label: 'Gatekeeper', color: '#6b7280' } // Gray
];

const ORG_SLOTS = [
  { id: 'ceo', label: 'Board / CEO' },
  { id: 'cfo', label: 'Finance / CFO' },
  { id: 'procurement', label: 'Procurement' },
  { id: 'technical', label: 'Technical Dept' },
  { id: 'users', label: 'Operations / Users' },
  { id: 'admin', label: 'Admin / Assistant' }
];

const ZONES = [
  { id: 'zone1_ice_breaking', label: 'Ice Breaking' },
  { id: 'zone2_qualification', label: 'Qualification' },
  { id: 'zone3_pitching', label: 'Solution Pitch' },
  { id: 'zone4_objection', label: 'Objection' },
  { id: 'zone5_closing', label: 'Closing' }
];

export default function M2_MarketForm() {
  const supabase = createClient();
  const { isInitialized, submissions } = useModuleStore();
  const [userId, setUserId] = useState<string | null>(null);
  const [activeZone, setActiveZone] = useState('zone1_ice_breaking');
  
  const [isOnline, setIsOnline] = useState(true);
  const isLocked = submissions['M02']?.is_locked || false;
  const isDisabled = !isOnline || isLocked;

  useEffect(() => {
    // Add network listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    // Check initial state if window is defined
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    }
    loadData();
  }, [supabase.auth]);

  const handleSave = async (formData: M2FormData) => {
    if (!userId) return;
    
    // Fact-check URL Validation (Server-side defense concept)
    if (formData.market_scan.source_url) {
       const urlPattern = /^https?:\/\/.+/i;
       if (!urlPattern.test(formData.market_scan.source_url)) {
         throw new Error('URL must start with http:// or https://');
       }
    }

    const { error } = await supabase
      .from('module_submissions')
      .upsert({
        user_id: userId,
        module_id: 'M02',
        form_data: formData,
        status: 'draft',
        last_saved_at: new Date().toISOString()
      }, { onConflict: 'user_id,module_id' });
      
    if (error) throw error;
  };

  const { data, setData, status, lastSaved, handleBlur } = useAutoSave<M2FormData>(
    'M02',
    initialData,
    handleSave,
    3000
  );

  // Cập nhật trạng thái lên UI
  useEffect(() => {
    const statusBar = document.getElementById('status-bar');
    if (statusBar) {
      if (status === 'saving') {
        statusBar.textContent = 'Trạng thái: Đang lưu...';
        statusBar.style.color = 'var(--accent-warning)';
      } else if (status === 'saved') {
        statusBar.textContent = `Trạng thái: Đã lưu (${lastSaved?.toLocaleTimeString()})`;
        statusBar.style.color = 'var(--accent-success)';
      } else if (status === 'error') {
        statusBar.textContent = 'Trạng thái: Lỗi khi lưu!';
        statusBar.style.color = 'var(--accent-danger)';
      } else {
        statusBar.textContent = 'Trạng thái: Chưa có thay đổi (Draft)';
        statusBar.style.color = 'var(--text-muted)';
      }
    }
  }, [status, lastSaved]);

  // Fallback for partial data
  const safeData = {
    market_scan: data?.market_scan || initialData.market_scan,
    icp: data?.icp || initialData.icp,
    buyer_map: data?.buyer_map || initialData.buyer_map,
    discovery_line: data?.discovery_line || initialData.discovery_line
  };

  // URL validation check for UI
  const urlPattern = /^https?:\/\/.+/i;
  const isValidUrl = !safeData.market_scan.source_url || urlPattern.test(safeData.market_scan.source_url);

  // Handle events based on isDisabled instead of just isOnline
  const onDragStart = (e: React.DragEvent, buyerId: string) => {
    if (isDisabled) return e.preventDefault();
    e.dataTransfer.setData('buyer_id', buyerId);
  };

  const onDragOver = (e: React.DragEvent) => {
    if (isDisabled) return;
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, slotId: string) => {
    if (isDisabled) return;
    e.preventDefault();
    const buyerId = e.dataTransfer.getData('buyer_id');
    if (buyerId) {
      // Find if this buyer is already in another slot, and clear it
      const newBuyerMap = { ...safeData.buyer_map };
      for (const key in newBuyerMap) {
        if (newBuyerMap[key] === buyerId) newBuyerMap[key] = null;
      }
      newBuyerMap[slotId] = buyerId;
      setData(prev => ({ ...prev, buyer_map: newBuyerMap }));
      // Trigger save immediately for D&D to feel responsive
      handleBlur(); 
    }
  };

  if (!isInitialized) return <div style={{ color: 'var(--text-muted)' }}>Đang tải dữ liệu...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {!isOnline && (
        <div style={{ padding: '8px', background: 'var(--accent-danger)', color: 'white', textAlign: 'center', fontSize: '0.875rem' }}>
          Đã mất kết nối mạng. Dữ liệu sẽ được lưu tạm và đồng bộ khi có mạng.
        </div>
      )}
      {isLocked && (
        <div style={{ padding: '8px', background: 'var(--accent-success)', color: 'white', textAlign: 'center', fontSize: '0.875rem' }}>
          Bài làm đã được nộp và khóa cứng. Chế độ Read-only.
        </div>
      )}

      {/* TOOL 1: MARKET SCAN BOX */}
      <section className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--accent-primary)' }}>
          <Search size={20} /> Tool 1: Market Scan Box
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          👉 Hãy tham khảo <a href="https://gemini.google.com" target="_blank" rel="noreferrer" style={{color: 'var(--accent-warning)', textDecoration: 'underline'}}>AI Agent Gemini</a> với Prompt sau: <i>"Đóng vai Giám đốc phát triển thị trường, phân tích nhanh quy mô và rào cản của thị trường [Quốc gia]."</i>
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Thị trường Mục tiêu</label>
            <input 
              type="text" className="form-input" disabled={isDisabled}
              value={safeData.market_scan.target_market}
              onChange={(e) => setData(p => ({ ...p, market_scan: { ...p.market_scan, target_market: e.target.value } }))}
              onBlur={handleBlur}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Lý do lựa chọn / Market Signal</label>
            <textarea 
              className="form-input" rows={2} disabled={isDisabled}
              value={safeData.market_scan.market_signal}
              onChange={(e) => setData(p => ({ ...p, market_scan: { ...p.market_scan, market_signal: e.target.value } }))}
              onBlur={handleBlur}
              placeholder="VD: Cửa ngõ trung chuyển vào EU, thuế quan ưu đãi..."
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>URL Nguồn tham khảo (Fact-check Validation)</span>
              {!isValidUrl && <span style={{ color: 'var(--accent-danger)' }}>Invalid URL (must start with http)</span>}
              {isValidUrl && safeData.market_scan.source_url && <span style={{ color: 'var(--accent-success)' }}>Valid URL</span>}
            </label>
            <input 
              type="text" 
              className="form-input" 
              disabled={isDisabled}
              style={{ borderColor: !isValidUrl ? 'var(--accent-danger)' : undefined }}
              value={safeData.market_scan.source_url}
              onChange={(e) => setData(p => ({ ...p, market_scan: { ...p.market_scan, source_url: e.target.value } }))}
              onBlur={handleBlur}
              placeholder="https://..."
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Kết quả Market Intelligence (Từ AI Agent)</label>
            <textarea 
              className="form-input" rows={4} disabled={isDisabled}
              value={safeData.market_scan.intelligence_result}
              onChange={(e) => setData(p => ({ ...p, market_scan: { ...p.market_scan, intelligence_result: e.target.value } }))}
              onBlur={handleBlur}
              placeholder="Dán kết quả phân tích thị trường từ Gemini vào đây..."
            />
          </div>
        </div>
      </section>

      {/* TOOL 2: ICP & BUYER MAP */}
      <section className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--accent-primary)' }}>
          <Users size={20} /> Tool 2: Segment, ICP & Drag-n-Drop Buyer Map
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Segment (Phân khúc)</label>
            <input 
              type="text" className="form-input" disabled={isDisabled}
              value={safeData.icp.segment}
              onChange={(e) => setData(p => ({ ...p, icp: { ...p.icp, segment: e.target.value } }))}
              onBlur={handleBlur}
              placeholder="VD: Nhà sản xuất thực phẩm"
            />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Company Size (Quy mô)</label>
            <input 
              type="text" className="form-input" disabled={isDisabled}
              value={safeData.icp.company_size}
              onChange={(e) => setData(p => ({ ...p, icp: { ...p.icp, company_size: e.target.value } }))}
              onBlur={handleBlur}
              placeholder="VD: Doanh thu > 10M USD"
            />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tiêu chí chọn lọc (Criteria)</label>
            <input 
              type="text" className="form-input" disabled={isDisabled}
              value={safeData.icp.selection_criteria}
              onChange={(e) => setData(p => ({ ...p, icp: { ...p.icp, selection_criteria: e.target.value } }))}
              onBlur={handleBlur}
              placeholder="VD: Đang tìm nhà cung cấp giá rẻ"
            />
          </div>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
          Kéo thẻ Buyer Type (bên trái) và Thả vào Phòng ban tương ứng trong sơ đồ tổ chức (bên phải).
        </p>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          
          {/* DRAG POOL */}
          <div style={{ flex: '1', minWidth: '200px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Buyer Types (Kéo thẻ)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {BUYER_TYPES.map(buyer => {
                // If this buyer is already mapped to a slot, we fade it out
                const isMapped = Object.values(safeData.buyer_map).includes(buyer.id);
                return (
                  <div
                    key={buyer.id}
                    draggable={isDisabled ? false : true}
                    onDragStart={(e) => onDragStart(e, buyer.id)}
                    style={{
                      padding: '10px 16px',
                      background: isMapped ? 'rgba(255,255,255,0.05)' : buyer.color,
                      color: isMapped ? 'var(--text-muted)' : '#fff',
                      borderRadius: '6px',
                      cursor: isDisabled ? 'not-allowed' : (isMapped ? 'default' : 'grab'),
                      opacity: isMapped ? 0.4 : 1,
                      fontWeight: 'bold',
                      fontSize: '0.85rem'
                    }}
                  >
                    {buyer.label}
                  </div>
                )
              })}
            </div>
          </div>

          {/* DROP TARGETS */}
          <div style={{ flex: '2', minWidth: '300px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {ORG_SLOTS.map(slot => {
              const assignedBuyerId = safeData.buyer_map[slot.id];
              const assignedBuyer = BUYER_TYPES.find(b => b.id === assignedBuyerId);

              return (
                <div
                  key={slot.id}
                  onDrop={(e) => onDrop(e, slot.id)}
                  onDragOver={onDragOver}
                  style={{
                    border: '1px dashed rgba(255,255,255,0.2)',
                    background: assignedBuyer ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.02)',
                    padding: '16px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '80px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{slot.label}</span>
                  {assignedBuyer ? (
                    <div 
                      draggable={isDisabled ? false : true}
                      onDragStart={(e) => onDragStart(e, assignedBuyer.id)}
                      style={{ background: assignedBuyer.color, color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', cursor: isDisabled ? 'not-allowed' : 'grab' }}
                    >
                      {assignedBuyer.label}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Thả thẻ vào đây</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* TOOL 3: DISCOVERY MAPPING LINE */}
      <section className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--accent-primary)' }}>
          <Map size={20} /> Tool 3: Discovery Mapping Line
        </h3>
        
        {/* Horizontal Stepper */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
          {ZONES.map((zone, index) => (
            <button
              key={zone.id}
              onClick={() => setActiveZone(zone.id)}
              style={{
                flex: 1,
                minWidth: '100px',
                padding: '12px 8px',
                background: activeZone === zone.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                color: activeZone === zone.id ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: activeZone === zone.id ? 'bold' : 'normal',
                whiteSpace: 'nowrap',
                position: 'relative'
              }}
            >
              {index + 1}. {zone.label}
            </button>
          ))}
        </div>

        {/* 4 Layers for the Active Zone */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {['pain_points', 'needs', 'current_solution', 'gap'].map(layer => (
            <div key={layer}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                {layer.replace('_', ' ')}
              </label>
              <textarea
                className="form-input"
                rows={3}
                disabled={isDisabled}
                value={(safeData.discovery_line[activeZone] as any)?.[layer] || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setData(p => ({
                    ...p,
                    discovery_line: {
                      ...p.discovery_line,
                      [activeZone]: {
                        ...p.discovery_line[activeZone],
                        [layer]: val
                      }
                    }
                  }))
                }}
                onBlur={handleBlur}
              />
            </div>
          ))}
        </div>

      </section>
    </div>
  );
}
