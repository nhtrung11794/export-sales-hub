'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CloudUpload, Wifi, WifiOff } from 'lucide-react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { createClient } from '@/lib/supabase/client';
import { useModuleStore } from '@/store/useModuleStore';
import B13_HandoverExecution from './B13_HandoverExecution';
import B14_IssueRecovery from './B14_IssueRecovery';
import B15_AccountGrowth from './B15_AccountGrowth';
import B16_CapstoneHub from './B16_CapstoneHub';

export type ExecutionStatus = 'todo' | 'production' | 'logistics' | 'delivered';

export interface ExecutionMilestone {
  id: string;
  title: string;
  owner: string;
  due_date: string;
  lead_time_days?: number;
  is_no_return?: boolean;
  status: ExecutionStatus;
  note: string;
}

export interface JBPInitiative {
  id: string;
  title: string;
  type: 'upsell' | 'cross_sell' | 'repeat' | 'service';
  kpi: string;
  dual_commit: string;
  deadline: string;
}

export interface M05FormData {
  b13_execution: {
    sla_checklist: {
      order_scope_confirmed: boolean;
      payment_verified: boolean;
      production_capacity_confirmed: boolean;
      logistics_booking_confirmed: boolean;
      document_owner_assigned: boolean;
    };
    milestones: ExecutionMilestone[];
  };
  b14_recovery: {
    scenario_id: string;
    scenario_title: string;
    evidence_received: boolean;
    containment_action: string;
    root_cause: string;
    five_why?: string[];
    preventive_action: string;
    bad_news_email: string;
  };
  b15_growth: {
    annual_demand_volume?: number;
    our_supply_volume?: number;
    volume_unit?: string;
    current_wallet_share: number;
    growth_potential: number;
    goals: {
      upsell: boolean;
      cross_sell: boolean;
      repeat_order: boolean;
    };
    growth_objective: string;
    joint_initiatives: string;
    initiatives?: JBPInitiative[];
    value_exchange: string;
    relationship_plan: string;
    next_review_date: string;
  };
  b16_capstone: {
    final_reflection: string;
    action_plan_90_days: string;
  };
}

export const initialM05Data: M05FormData = {
  b13_execution: {
    sla_checklist: {
      order_scope_confirmed: false,
      payment_verified: false,
      production_capacity_confirmed: false,
      logistics_booking_confirmed: false,
      document_owner_assigned: false,
    },
    milestones: [
      { id: 'ms-production', title: 'Chốt lịch sản xuất & QA/QC', owner: 'Production / QA', due_date: '', lead_time_days: 14, is_no_return: false, status: 'todo', note: 'Kiểm nghiệm mẫu test SGS trước khi đóng cont' },
      { id: 'ms-booking', title: 'Booking tàu & Chốt Cut-off CY', owner: 'Logistics Team', due_date: '', lead_time_days: 5, is_no_return: true, status: 'todo', note: 'Điểm không thể quay đầu - hạ bãi và thanh lý hải quan' },
      { id: 'ms-documents', title: 'Hoàn thiện bộ chứng từ xuất', owner: 'Export Docs', due_date: '', lead_time_days: 3, is_no_return: false, status: 'todo', note: 'Phát hành BL, C/O Form E/EUR.1, Phytosanitary' },
      { id: 'ms-delivery', title: 'Theo dõi ETA cảng đến & POD', owner: 'Sales / CS', due_date: '', lead_time_days: 20, is_no_return: false, status: 'todo', note: 'Cập nhật định kỳ cho Buyer và nhận xác nhận nhận hàng' },
    ],
  },
  b14_recovery: {
    scenario_id: '',
    scenario_title: '',
    evidence_received: false,
    containment_action: '',
    root_cause: '',
    five_why: ['', '', '', '', ''],
    preventive_action: '',
    bad_news_email: '',
  },
  b15_growth: {
    annual_demand_volume: 100,
    our_supply_volume: 25,
    volume_unit: 'Cont 40HC',
    current_wallet_share: 25,
    growth_potential: 50,
    goals: { upsell: true, cross_sell: false, repeat_order: true },
    growth_objective: '',
    joint_initiatives: '',
    initiatives: [
      { id: 'init-1', title: 'Cam kết giữ slot tàu mùa cao điểm', type: 'repeat', kpi: 'OTIF >= 98%', dual_commit: 'Buyer cam kết forecast trước 60 ngày - Nhà máy giữ giá cố định', deadline: '2026-Q3' },
      { id: 'init-2', title: 'Thử nghiệm mã hàng giá trị gia tăng', type: 'cross_sell', kpi: '1 Container thử nghiệm', dual_commit: 'Hỗ trợ 50% chi phí kiểm định mẫu thị trường nội địa', deadline: '2026-Q4' },
      { id: 'init-3', title: 'Tối ưu bao bì giảm 5% TCO', type: 'upsell', kpi: 'Tiết kiệm $350/cont', dual_commit: 'Hai bên cùng điều chỉnh pallet size để tăng tải trọng đóng cont', deadline: '2026-Q4' },
    ],
    value_exchange: '',
    relationship_plan: '',
    next_review_date: '',
  },
  b16_capstone: {
    final_reflection: '',
    action_plan_90_days: '',
  },
};

const FORBIDDEN_EMAIL_TERMS = ['đền bù toàn bộ', 'compensate all', 'trả lại tiền'];

export function hasBlockedRecoveryEmail(data: M05FormData) {
  const email = (data.b14_recovery?.bad_news_email || '').toLocaleLowerCase('vi-VN');
  return !data.b14_recovery?.evidence_received && FORBIDDEN_EMAIL_TERMS.some(term => email.includes(term));
}

export function isB13Complete(data: M05FormData) {
  const checklistValues = Object.values(data.b13_execution?.sla_checklist || {});
  const milestones = data.b13_execution?.milestones || [];
  return checklistValues.length === 5 && checklistValues.every(Boolean) && milestones.length > 0 && milestones.every(item =>
    (item.title || '').trim() && (item.owner || '').trim() && (item.due_date || '').trim()
  );
}

export function isB14Complete(data: M05FormData) {
  const recovery = data.b14_recovery;
  return Boolean(
    (recovery?.scenario_id || '').trim() &&
    (recovery?.containment_action || '').trim().length >= 10 &&
    (recovery?.root_cause || '').trim().length >= 10 &&
    (recovery?.preventive_action || '').trim().length >= 10 &&
    (recovery?.bad_news_email || '').trim().length >= 30 &&
    !hasBlockedRecoveryEmail(data)
  );
}

export function isB15Complete(data: M05FormData) {
  const growth = data.b15_growth;
  return Boolean(
    Object.values(growth?.goals || {}).some(Boolean) &&
    (growth?.growth_objective || '').trim().length >= 10 &&
    (growth?.joint_initiatives || '').trim().length >= 10 &&
    (growth?.next_review_date || '').trim()
  );
}

export default function M05_CombinedForm() {
  const supabase = useMemo(() => createClient(), []);
  const { submissions, updateSubmissionLocal } = useModuleStore();
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isOnline, setIsOnline] = useState(() => typeof navigator === 'undefined' ? true : navigator.onLine);
  const [debugError, setDebugError] = useState<string | null>(null);
  const [devBypass, setDevBypass] = useState(false);

  const isLocked = submissions.M05?.is_locked || false;
  const isDisabled = !isOnline || isLocked;

  const m04Closing = submissions.M04?.form_data?.b12_closing;
  const m04ChecklistValues = Object.values(m04Closing?.checklist || {});
  const isM04Ready = Boolean(
    (m04Closing?.selected_payment_method || '').trim() &&
    m04ChecklistValues.length === 3 &&
    m04ChecklistValues.every(Boolean)
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSave = useCallback(async (savedData: M05FormData) => {
    if (!userId) return;
    if (hasBlockedRecoveryEmail(savedData)) {
      throw new Error('Email CAPA đang cam kết bồi hoàn khi chưa có bằng chứng xác minh.');
    }

    updateSubmissionLocal('M05', savedData);
    const { error } = await supabase
      .from('module_submissions')
      .upsert({
        user_id: userId,
        module_id: 'M05',
        form_data: savedData,
        status: 'draft',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,module_id' });

    if (error) throw error;
  }, [supabase, updateSubmissionLocal, userId]);

  const { data, setData, status, lastSaved, handleBlur } = useAutoSave<M05FormData>(
    'M05',
    initialM05Data,
    handleSave,
    3000,
  );

  useEffect(() => {
    async function loadData() {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) return;
        setUserId(authData.user.id);

        const { data: submission, error } = await supabase
          .from('module_submissions')
          .select('form_data')
          .eq('user_id', authData.user.id)
          .eq('module_id', 'M05')
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (!submission?.form_data) return;

        const fetched = submission.form_data as Partial<M05FormData>;
        const merged: M05FormData = {
          ...initialM05Data,
          ...fetched,
          b13_execution: {
            ...initialM05Data.b13_execution,
            ...(fetched.b13_execution || {}),
            sla_checklist: {
              ...initialM05Data.b13_execution.sla_checklist,
              ...(fetched.b13_execution?.sla_checklist || {}),
            },
            milestones: fetched.b13_execution?.milestones?.length
              ? fetched.b13_execution.milestones.map((m, idx) => ({
                  lead_time_days: 7,
                  is_no_return: idx === 1,
                  ...m,
                }))
              : initialM05Data.b13_execution.milestones,
          },
          b14_recovery: {
            ...initialM05Data.b14_recovery,
            ...(fetched.b14_recovery || {}),
            five_why: fetched.b14_recovery?.five_why || initialM05Data.b14_recovery.five_why,
          },
          b15_growth: {
            ...initialM05Data.b15_growth,
            ...(fetched.b15_growth || {}),
            goals: { ...initialM05Data.b15_growth.goals, ...(fetched.b15_growth?.goals || {}) },
            initiatives: fetched.b15_growth?.initiatives || initialM05Data.b15_growth.initiatives,
          },
          b16_capstone: { ...initialM05Data.b16_capstone, ...(fetched.b16_capstone || {}) },
        };
        setData(merged);
        updateSubmissionLocal('M05', merged);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể nạp dữ liệu M05.';
        console.error('Lỗi nạp dữ liệu M05:', error);
        setDebugError(message);
      } finally {
        setIsInitializing(false);
      }
    }

    loadData();
  }, [setData, supabase, updateSubmissionLocal]);

  useEffect(() => {
    const statusBar = document.getElementById('status-bar');
    if (!statusBar) return;
    if (status === 'saving') {
      statusBar.textContent = 'Trạng thái: Đang lưu...';
      statusBar.style.color = 'var(--accent-warning)';
    } else if (status === 'saved') {
      statusBar.textContent = `Trạng thái: Đã lưu (${lastSaved?.toLocaleTimeString('vi-VN')})`;
      statusBar.style.color = 'var(--accent-success)';
    } else if (status === 'error') {
      statusBar.textContent = 'Trạng thái: Bị chặn bởi kiểm soát nghiệp vụ';
      statusBar.style.color = 'var(--accent-danger)';
    } else {
      statusBar.textContent = 'Trạng thái: Bản nháp';
      statusBar.style.color = 'var(--text-muted)';
    }
  }, [lastSaved, status]);

  if (isInitializing) {
    return <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>Đang nạp dữ liệu Module 05...</div>;
  }

  const b13Complete = isB13Complete(data);
  const b14Complete = isB14Complete(data);
  const b15Complete = isB15Complete(data);
  const marketContext = submissions.M02?.form_data || {};

  const effectiveIsM04Ready = devBypass || isM04Ready;
  const effectiveB13Complete = devBypass || b13Complete;
  const effectiveB14Complete = devBypass || b14Complete;
  const effectiveB15Complete = devBypass || b15Complete;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        padding: '12px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 12,
        border: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.85rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: isOnline ? '#10b981' : 'var(--accent-danger)' }}>
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            {isOnline ? 'Online' : 'Mất kết nối'}
          </span>
          {isLocked && <span style={{ color: '#f59e0b', fontWeight: 700 }}>🔒 Đã nộp & khóa sửa</span>}
          <button
            type="button"
            onClick={() => setDevBypass(!devBypass)}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: '.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: devBypass ? '1px solid #10b981' : '1px solid rgba(255,255,255,.15)',
              background: devBypass ? 'rgba(16,185,129,.15)' : 'rgba(255,255,255,.05)',
              color: devBypass ? '#10b981' : 'var(--text-muted)',
              transition: 'all .2s ease',
            }}
            title="Bật để mở khóa toàn bộ các bài học phục vụ kiểm thử và xem giao diện"
          >
            {devBypass ? '🔓 Dev Bypass: Đang Mở Khóa Tất Cả' : '🔒 Khóa Tuần Tự (Click để Test)'}
          </button>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {status === 'saving' && <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-primary)' }}><CloudUpload size={16} /> Đang lưu...</span>}
          {status === 'saved' && <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981' }}><CheckCircle2 size={16} /> Đã lưu {lastSaved ? lastSaved.toLocaleTimeString('vi-VN') : ''}</span>}
          {status === 'error' && <span style={{ color: 'var(--accent-danger)' }}>⚠️ Dữ liệu chưa được lưu do vi phạm Gate</span>}
        </div>
      </div>

      {debugError && <div style={{ padding: 12, color: '#fca5a5', background: 'rgba(239,68,68,.1)', borderRadius: 8 }}>{debugError}</div>}

      <B13_HandoverExecution
        data={data}
        setData={setData}
        handleBlur={handleBlur}
        isDisabled={isDisabled}
        isPrerequisiteComplete={effectiveIsM04Ready}
      />
      <B14_IssueRecovery
        data={data}
        setData={setData}
        handleBlur={handleBlur}
        isDisabled={isDisabled}
        isPrerequisiteComplete={effectiveB13Complete}
        targetMarket={marketContext.target_market || ''}
        legalContext={marketContext.strategic_reason || ''}
      />
      <B15_AccountGrowth
        data={data}
        setData={setData}
        handleBlur={handleBlur}
        isDisabled={isDisabled}
        isPrerequisiteComplete={effectiveB14Complete}
      />
      <B16_CapstoneHub
        data={data}
        setData={setData}
        handleBlur={handleBlur}
        isDisabled={isDisabled}
        isPrerequisiteComplete={effectiveB15Complete}
        submissions={submissions}
      />
    </div>
  );
}
