'use client';

import React, { useEffect, useState } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { createClient } from '@/lib/supabase/client';
import { useModuleStore } from '@/store/useModuleStore';
import { CheckCircle2, Wifi, WifiOff, CloudUpload } from 'lucide-react';

import B09_RequirementClarification from './B09_RequirementClarification';
import B10_ProposalQuotation from './B10_ProposalQuotation';
import B11_NegotiationBlocker from './B11_NegotiationBlocker';
import B12_PaymentRisk from './B12_PaymentRisk';

export interface PricingOption {
  id: string;
  name: string;
  price: number;
  features: string;
  is_active: boolean;
}

export interface ConcessionItem {
  id: string;
  give_type: string;
  give_note: string;
  take_type: string;
  take_note: string;
}

export interface M04FormData {
  // B09
  b09_clarification: {
    p_product: { is_clear: boolean; note: string };
    b_business: { is_clear: boolean; note: string };
    t_trade: { is_clear: boolean; note: string };
    p_payment: { is_clear: boolean; note: string };
    c_compliance: { is_clear: boolean; note: string };
  };
  // B10
  b10_quotation: {
    tco_calculator: {
      fob_price: number;
      freight: number;
      import_tax: number;
      local_charges: number;
      doc_inspection_fee?: number;
    };
    pricing_options: PricingOption[];
  };
  // B11
  b11_negotiation: {
    buyer_objection: string;
    objection_type: string;
    concessions: ConcessionItem[];
  };
  // B12
  b12_closing: {
    selected_payment_method: string;
    risk_justification: string;
    checklist: {
      check_bec: boolean;
      check_local_charge: boolean;
      check_vessel: boolean;
    };
  };
}

const initialData: M04FormData = {
  b09_clarification: {
    p_product: { is_clear: false, note: '' },
    b_business: { is_clear: false, note: '' },
    t_trade: { is_clear: false, note: '' },
    p_payment: { is_clear: false, note: '' },
    c_compliance: { is_clear: false, note: '' },
  },
  b10_quotation: {
    tco_calculator: {
      fob_price: 0,
      freight: 0,
      import_tax: 0,
      local_charges: 0,
      doc_inspection_fee: 0,
    },
    pricing_options: [
      { id: 'opt_1', name: 'Tiêu chuẩn (Standard)', price: 0, features: '', is_active: true },
      { id: 'opt_2', name: 'Nâng cao (Premium)', price: 0, features: '', is_active: true },
      { id: 'opt_3', name: 'Tối ưu giá (Economy)', price: 0, features: '', is_active: false },
    ],
  },
  b11_negotiation: {
    buyer_objection: '',
    objection_type: 'Thử thách giá',
    concessions: [
      { id: 'con_1', give_type: '', give_note: '', take_type: '', take_note: '' }
    ],
  },
  b12_closing: {
    selected_payment_method: '',
    risk_justification: '',
    checklist: {
      check_bec: false,
      check_local_charge: false,
      check_vessel: false,
    },
  },
};

export default function M04_CombinedForm() {
  const supabase = createClient();
  const { submissions, updateSubmissionLocal } = useModuleStore();
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [debugError, setDebugError] = useState<string | null>(null);

  // Kế thừa điểm số từ M03 B07
  const m03Data = submissions['M03'];
  const fnacmScores = (m03Data?.form_data as any)?.b07_qualification?.fnacm_scores || {
    fit: 0, need: 0, access: 0, criteria: 0, momentum: 0
  };
  const totalScore = Object.values(fnacmScores).reduce((a: any, b: any) => a + (Number(b) || 0), 0);
  const accessScore = Number(fnacmScores.access) || 0;

  const isLocked = submissions['M04']?.is_locked || false;
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
          .eq('module_id', 'M04')
          .single();
          
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data?.form_data) {
          setData(prev => ({
            ...initialData,
            ...data.form_data,
            b09_clarification: {
              ...initialData.b09_clarification,
              ...(data.form_data.b09_clarification || {})
            },
            b10_quotation: {
              ...initialData.b10_quotation,
              ...(data.form_data.b10_quotation || {})
            },
            b11_negotiation: {
              ...initialData.b11_negotiation,
              ...(data.form_data.b11_negotiation || {}),
              concessions: data.form_data.b11_negotiation?.concessions?.length 
                ? data.form_data.b11_negotiation.concessions 
                : initialData.b11_negotiation.concessions
            },
            b12_closing: {
              ...initialData.b12_closing,
              ...(data.form_data.b12_closing || {})
            }
          }));
          updateSubmissionLocal('M04', data.form_data);
        }
      } catch (err: any) {
        console.error('Lỗi nạp dữ liệu M04:', err);
        setDebugError(err.message || 'Lỗi nạp dữ liệu');
      } finally {
        setIsInitializing(false);
      }
    }

    loadData();
  }, [supabase, updateSubmissionLocal]);

  // Save handler for useAutoSave
  const handleSave = async (savedData: M04FormData) => {
    if (!userId) return;
    
    // Đồng bộ Zustand local trước
    updateSubmissionLocal('M04', savedData);

    const { error } = await supabase
      .from('module_submissions')
      .upsert({
        user_id: userId,
        module_id: 'M04',
        form_data: savedData,
        status: 'draft',
        last_saved_at: new Date().toISOString()
      }, { onConflict: 'user_id,module_id' });

    if (error) {
      console.error('Lỗi Auto-save Supabase M04:', error);
      throw error;
    }
  };

  const { data, setData, status, lastSaved, handleBlur } = useAutoSave<M04FormData>(
    'M04',
    initialData,
    handleSave,
    3000
  );

  if (isInitializing) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Đang nạp dữ liệu Module 04...
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

      {/* BÀI 09: REQUIREMENT CLARIFICATION */}
      <B09_RequirementClarification 
        data={data} 
        setData={setData} 
        handleBlur={handleBlur} 
        isDisabled={isDisabled}
        totalScore={totalScore as number}
      />

      {/* BÀI 10: PROPOSAL & QUOTATION */}
      <B10_ProposalQuotation 
        data={data} 
        setData={setData} 
        handleBlur={handleBlur} 
        isDisabled={isDisabled} 
      />

      {/* BÀI 11: NEGOTIATION & BLOCKER */}
      <B11_NegotiationBlocker 
        data={data} 
        setData={setData} 
        handleBlur={handleBlur} 
        isDisabled={isDisabled} 
      />
      
      {/* BÀI 12: PAYMENT RISK & SAFE CLOSING */}
      <B12_PaymentRisk 
        data={data} 
        setData={setData} 
        handleBlur={handleBlur} 
        isDisabled={isDisabled}
        opportunityScore={totalScore as number}
        accessScore={accessScore}
      />

    </div>
  );
}
