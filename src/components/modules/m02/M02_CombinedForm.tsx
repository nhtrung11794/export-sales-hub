'use client';

import React, { useEffect, useState } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { createClient } from '@/lib/supabase/client';
import { useModuleStore } from '@/store/useModuleStore';
import { Wifi, WifiOff, CloudUpload, CheckCircle2 } from 'lucide-react';

import B03_MarketIntelligence from './B03_MarketIntelligence';
import B04_BuyerMap from './B04_BuyerMap';
import B05_DiscoveryMatrix from './B05_DiscoveryMatrix';

export interface M02FormData {
  // B03
  target_market: string;
  route_to_market: string;
  strategic_reason: string;
  b03_fact_check_url?: string;
  b03_scan_notes?: Record<string, { ai_output: string; fact_check_url: string }>;
  b03_lens_notes?: Record<string, { ai_output: string; action_usp: string }>;
  b03_pestel_notes?: Record<string, { ai_output: string; impact_action: string }>;
  
  // B04
  icp_size: string;
  icp_industry: string;
  icp_problem: string;
  buyer_map_roles: Array<{ id: string; role: string; department: string }>;

  // B05
  discovery_matrix: {
    context: { surface_signal: string; core_hypothesis: string; approach_strategy: string };
    need: { surface_signal: string; core_hypothesis: string; approach_strategy: string };
    pain: { surface_signal: string; core_hypothesis: string; approach_strategy: string };
    criteria: { surface_signal: string; core_hypothesis: string; approach_strategy: string };
    risk_concern: { surface_signal: string; core_hypothesis: string; approach_strategy: string };
  };
}

const initialData: M02FormData = {
  target_market: '',
  route_to_market: '',
  strategic_reason: '',
  b03_fact_check_url: '',
  b03_scan_notes: {
    layer1: { ai_output: '', fact_check_url: '' },
    layer2: { ai_output: '', fact_check_url: '' },
    layer3: { ai_output: '', fact_check_url: '' },
    layer4: { ai_output: '', fact_check_url: '' },
    layer5: { ai_output: '', fact_check_url: '' },
  },
  b03_lens_notes: {
    lens1: { ai_output: '', action_usp: '' },
    lens2: { ai_output: '', action_usp: '' },
    lens3: { ai_output: '', action_usp: '' },
    lens4: { ai_output: '', action_usp: '' },
    lens5: { ai_output: '', action_usp: '' },
  },
  b03_pestel_notes: {
    P: { ai_output: '', impact_action: '' },
    E: { ai_output: '', impact_action: '' },
    S: { ai_output: '', impact_action: '' },
    T: { ai_output: '', impact_action: '' },
    ENV: { ai_output: '', impact_action: '' },
    L: { ai_output: '', impact_action: '' },
  },
  
  icp_size: '',
  icp_industry: '',
  icp_problem: '',
  buyer_map_roles: [],

  discovery_matrix: {
    context: { surface_signal: '', core_hypothesis: '', approach_strategy: '' },
    need: { surface_signal: '', core_hypothesis: '', approach_strategy: '' },
    pain: { surface_signal: '', core_hypothesis: '', approach_strategy: '' },
    criteria: { surface_signal: '', core_hypothesis: '', approach_strategy: '' },
    risk_concern: { surface_signal: '', core_hypothesis: '', approach_strategy: '' },
  }
};

export default function M02_CombinedForm() {
  const supabase = createClient();
  const { submissions, updateSubmissionLocal } = useModuleStore();
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [debugError, setDebugError] = useState<string | null>(null);

  const isLocked = submissions['M02']?.is_locked || false;
  const isDisabled = !isOnline || isLocked;

  // Network listener
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSave = async (formData: M02FormData) => {
    let currentUserId = userId;
    if (!currentUserId) {
      const { data: authData } = await supabase.auth.getUser();
      currentUserId = authData?.user?.id || null;
    }
    if (!currentUserId) return;
    const finalUserId: string = currentUserId;
    
    // Sync to store for real-time validation in page.tsx
    updateSubmissionLocal('M02', formData);

    const { error } = await supabase
      .from('module_submissions')
      .upsert({
        user_id: finalUserId,
        module_id: 'M02',
        form_data: formData,
        status: (submissions['M02']?.status === 'submitted' || submissions['M02']?.is_locked) ? 'submitted' : 'draft',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,module_id' });
      
    if (error) {
      console.error('Error saving to Supabase:', error);
      throw error;
    }
  };

  const { data, setData, status, lastSaved, handleBlur, syncSavedData, manualSave } = useAutoSave<M02FormData>(
    'M02',
    initialData,
    handleSave,
    3000
  );

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          setIsInitializing(false);
          return;
        }
        
        setUserId(user.id);
        
        const { data, error } = await supabase
          .from('module_submissions')
          .select('form_data')
          .eq('user_id', user.id)
          .eq('module_id', 'M02')
          .maybeSingle();
          
        if (error) {
          throw error;
        }

        if (data && data.form_data) {
          const fetchedData: M02FormData = {
            ...initialData,
            ...data.form_data,
            discovery_matrix: {
              ...initialData.discovery_matrix,
              ...(data.form_data.discovery_matrix || {})
            }
          };
          setData(fetchedData);
          syncSavedData(fetchedData);
          // Also sync to global store so validation can run
          updateSubmissionLocal('M02', fetchedData);
        }
      } catch (err: any) {
        console.error('Initial fetch error:', err);
        setDebugError(err.message || 'Không thể tải dữ liệu từ máy chủ.');
      } finally {
        setIsInitializing(false);
      }
    }
    loadData();
  }, [supabase.auth, updateSubmissionLocal, syncSavedData]);



  if (isInitializing) {
    return <div style={{ color: 'var(--text-muted)' }}>Đang tải dữ liệu bài làm...</div>;
  }

  const errorBanner = debugError && (
    <div className="glass-panel" style={{ border: '1px dashed var(--accent-danger)', borderLeft: '4px solid var(--accent-danger)', padding: '16px', marginBottom: '24px' }}>
      <h4 style={{ color: 'var(--accent-danger)', marginBottom: '8px' }}>⚠️ LỖI KẾT NỐI DATABASE</h4>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Hệ thống đang hiển thị Dữ liệu Giả lập (Mock Data) để bạn xem giao diện. Lỗi:</p>
      <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '4px', marginTop: '8px', fontSize: '0.75rem', color: '#fca5a5', overflowX: 'auto' }}>
        {debugError}
      </pre>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* STATUS HEADER BAR */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 20px', background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px', border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          {isOnline ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
              <Wifi size={16} /> Online
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-danger)' }}>
              <WifiOff size={16} /> Mất kết nối (Offline)
            </span>
          )}

          {isLocked && (
            <span style={{ marginLeft: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
              🔒 Đã Nộp & Khóa Sửa
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {status === 'saving' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)' }}>
              <CloudUpload size={16} /> Đang lưu...
            </span>
          )}
          {status === 'saved' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
              <CheckCircle2 size={16} /> Đã lưu tự động {lastSaved ? `lúc ${lastSaved.toLocaleTimeString('vi-VN')}` : ''}
            </span>
          )}
          {status === 'error' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--accent-danger)' }}>
                ⚠️ Lưu thất bại (sẽ tự thử lại)
              </span>
              <button
                type="button"
                onClick={() => manualSave(true)}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Thử lại ngay
              </button>
            </div>
          )}
        </div>
      </div>

      {errorBanner}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', opacity: isLocked ? 0.7 : 1, pointerEvents: isLocked ? 'none' : 'auto', transition: 'opacity 0.2s ease' }}>
        {/* Block B03 */}
        <B03_MarketIntelligence data={data} setData={setData} handleBlur={handleBlur} isDisabled={isDisabled} />
        
        {/* Block B04 */}
        <B04_BuyerMap data={data} setData={setData} handleBlur={handleBlur} isDisabled={isDisabled} />
        
        {/* Block B05 */}
        <B05_DiscoveryMatrix data={data} setData={setData} handleBlur={handleBlur} isDisabled={isDisabled} />
      </div>
    </div>
  );
}
