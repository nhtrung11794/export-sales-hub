'use client';

import React, { useEffect, useState } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { createClient } from '@/lib/supabase/client';
import { useModuleStore } from '@/store/useModuleStore';

import B03_MarketIntelligence from './B03_MarketIntelligence';
import B04_BuyerMap from './B04_BuyerMap';
import B05_DiscoveryMatrix from './B05_DiscoveryMatrix';

export interface M02FormData {
  // B03
  target_market: string;
  route_to_market: string;
  strategic_reason: string;
  
  // B04
  icp_size: string;
  icp_industry: string;
  icp_problem: string;
  buyer_map_roles: Array<{ id: string; role: string; department: string }>;

  // B05
  discovery_matrix: {
    need: { surface_signal: string; core_hypothesis: string; approach_strategy: string };
    pain: { surface_signal: string; core_hypothesis: string; approach_strategy: string };
    criteria: { surface_signal: string; core_hypothesis: string; approach_strategy: string };
    risk: { surface_signal: string; core_hypothesis: string; approach_strategy: string };
    concern: { surface_signal: string; core_hypothesis: string; approach_strategy: string };
  };
}

const initialData: M02FormData = {
  target_market: '',
  route_to_market: '',
  strategic_reason: '',
  
  icp_size: '',
  icp_industry: '',
  icp_problem: '',
  buyer_map_roles: [],

  discovery_matrix: {
    need: { surface_signal: '', core_hypothesis: '', approach_strategy: '' },
    pain: { surface_signal: '', core_hypothesis: '', approach_strategy: '' },
    criteria: { surface_signal: '', core_hypothesis: '', approach_strategy: '' },
    risk: { surface_signal: '', core_hypothesis: '', approach_strategy: '' },
    concern: { surface_signal: '', core_hypothesis: '', approach_strategy: '' },
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
          .single();
          
        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data && data.form_data) {
          const fetchedData = data.form_data as any;
          setData({
            ...initialData,
            ...fetchedData,
            discovery_matrix: {
              ...initialData.discovery_matrix,
              ...(fetchedData.discovery_matrix || {})
            }
          });
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
  }, [supabase.auth, updateSubmissionLocal]); // Add missing deps

  const handleSave = async (formData: M02FormData) => {
    if (!userId) return;
    
    // Sync to store for real-time validation in page.tsx
    updateSubmissionLocal('M02', formData);

    const { error } = await supabase
      .from('module_submissions')
      .upsert({
        user_id: userId,
        module_id: 'M02',
        form_data: formData,
        status: 'draft',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,module_id' });
      
    if (error) {
      console.error('Error saving to Supabase:', error);
      throw error;
    }
  };

  const { data, setData, status, lastSaved, handleBlur } = useAutoSave<M02FormData>(
    'M02',
    initialData,
    handleSave,
    3000
  );

  // Status Bar UI Update
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {errorBanner}
      
      {(!isOnline || isLocked) && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.15)', 
          border: '1px dashed var(--accent-danger)', 
          padding: '16px', 
          borderRadius: '12px', 
          color: '#fca5a5', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.1)'
        }}>
          <strong>⚠️ {isLocked ? 'BÀI LÀM ĐÃ KHÓA' : 'MẤT KẾT NỐI MẠNG'}:</strong> {isLocked ? 'Bài làm của bạn đã được nộp. Chế độ xem chỉ đọc.' : 'Toàn bộ dữ liệu đã được tự động khóa (Read-only) để bảo vệ an toàn thông tin.'}
        </div>
      )}

      {/* Block B03 */}
      <B03_MarketIntelligence data={data} setData={setData} handleBlur={handleBlur} isDisabled={isDisabled} />
      
      {/* Block B04 */}
      <B04_BuyerMap data={data} setData={setData} handleBlur={handleBlur} isDisabled={isDisabled} />
      
      {/* Block B05 */}
      <B05_DiscoveryMatrix data={data} setData={setData} handleBlur={handleBlur} isDisabled={isDisabled} />
    </div>
  );
}
