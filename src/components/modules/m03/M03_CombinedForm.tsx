'use client';

import React, { useEffect, useState } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { createClient } from '@/lib/supabase/client';
import { useModuleStore } from '@/store/useModuleStore';
import { CheckCircle2, Wifi, WifiOff, CloudUpload } from 'lucide-react';

import B06_LeadTriage from './B06_LeadTriage';
import B07_OpportunityQualification from './B07_OpportunityQualification';
import B08_PipelineManagement from './B08_PipelineManagement';

export interface LeadItem {
  id: string;
  company_name: string;
  website: string;
  estimated_size: string;
  icp_match: 'High' | 'Medium' | 'Low' | 'Junk';
  is_target: boolean;
}

export interface OutreachItem {
  relevance: string;
  value_angle: string;
  cta: string;
  email_draft: string;
}

export interface M03FormData {
  // B06
  b06_leads: LeadItem[];
  b06_outreach: Record<string, OutreachItem>;

  // B07
  b07_qualification: {
    buyer_response_text: string;
    response_classification: 'Lead' | 'Inquiry' | 'Interest' | 'Opportunity';
    fnacm_scores: {
      fit: number;
      need: number;
      access: number;
      criteria: number;
      momentum: number;
    };
    low_score_justification: string;
  };

  // B08
  b08_pipeline: {
    current_stage: string;
    crisis_motive: string;
    next_touchpoint_date: string;
    next_touchpoint_type: string;
    follow_up_message: string;
  };
}

const initialData: M03FormData = {
  b06_leads: [
    { id: 'lead_1', company_name: 'Global Food Importers Ltd', website: 'globalfoodimporters.com', estimated_size: '50-100 NV', icp_match: 'High', is_target: true },
    { id: 'lead_2', company_name: 'Nordic Organic Snacks ApS', website: 'nordicorganics.dk', estimated_size: '20-50 NV', icp_match: 'High', is_target: true },
    { id: 'lead_3', company_name: 'Apex Commodity Brokers', website: 'apexbrokers.de', estimated_size: '10-20 NV', icp_match: 'Low', is_target: false }
  ],
  b06_outreach: {},
  b07_qualification: {
    buyer_response_text: '',
    response_classification: 'Inquiry',
    fnacm_scores: {
      fit: 15,
      need: 15,
      access: 12,
      criteria: 14,
      momentum: 16
    },
    low_score_justification: ''
  },
  b08_pipeline: {
    current_stage: 'quotation',
    crisis_motive: 'Recover',
    next_touchpoint_date: '',
    next_touchpoint_type: 'Market Update',
    follow_up_message: ''
  }
};

export default function M03_CombinedForm() {
  const supabase = createClient();
  const { submissions, updateSubmissionLocal } = useModuleStore();
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [debugError, setDebugError] = useState<string | null>(null);

  const isLocked = submissions['M03']?.is_locked || false;
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
          .eq('module_id', 'M03')
          .single();
          
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data?.form_data) {
          setData(prev => ({
            ...initialData,
            ...data.form_data,
            b06_leads: data.form_data.b06_leads?.length ? data.form_data.b06_leads : initialData.b06_leads,
            b07_qualification: {
              ...initialData.b07_qualification,
              ...(data.form_data.b07_qualification || {}),
              fnacm_scores: {
                ...initialData.b07_qualification.fnacm_scores,
                ...(data.form_data.b07_qualification?.fnacm_scores || {})
              }
            },
            b08_pipeline: {
              ...initialData.b08_pipeline,
              ...(data.form_data.b08_pipeline || {})
            }
          }));
          updateSubmissionLocal('M03', data.form_data);
        }
      } catch (err: any) {
        console.error('Lỗi nạp dữ liệu M03:', err);
        setDebugError(err.message || 'Lỗi nạp dữ liệu');
      } finally {
        setIsInitializing(false);
      }
    }

    loadData();
  }, [supabase, updateSubmissionLocal]);

  // Save handler for useAutoSave
  const handleSave = async (savedData: M03FormData) => {
    if (!userId) return;
    
    // Đồng bộ Zustand local trước
    updateSubmissionLocal('M03', savedData);

    const { error } = await supabase
      .from('module_submissions')
      .upsert({
        user_id: userId,
        module_id: 'M03',
        form_data: savedData,
        status: 'draft',
        last_saved_at: new Date().toISOString()
      }, { onConflict: 'user_id,module_id' });

    if (error) {
      console.error('Lỗi Auto-save Supabase M03:', error);
      throw error;
    }
  };

  const { data, setData, status, lastSaved, handleBlur } = useAutoSave<M03FormData>(
    'M03',
    initialData,
    handleSave,
    3000
  );

  if (isInitializing) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Đang nạp dữ liệu Module 03...
      </div>
    );
  }

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
            <span style={{ color: 'var(--accent-danger)' }}>
              ⚠️ Lưu thất bại (sẽ tự thử lại)
            </span>
          )}
        </div>
      </div>

      {debugError && (
        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', borderRadius: '8px', fontSize: '0.85rem' }}>
          {debugError}
        </div>
      )}

      {/* BÀI 06: SÀNG LỌC LEAD & TIẾP CẬN */}
      <B06_LeadTriage 
        data={data} 
        setData={setData} 
        handleBlur={handleBlur} 
        isDisabled={isDisabled} 
      />

      {/* BÀI 07: CHẤM ĐIỂM CƠ HỘI SÂU */}
      <B07_OpportunityQualification 
        data={data} 
        setData={setData} 
        handleBlur={handleBlur} 
        isDisabled={isDisabled} 
      />

      {/* BÀI 08: QUẢN TRỊ PIPELINE & KỶ LUẬT FOLLOW-UP */}
      <B08_PipelineManagement 
        data={data} 
        setData={setData} 
        handleBlur={handleBlur} 
        isDisabled={isDisabled} 
      />

    </div>
  );
}
