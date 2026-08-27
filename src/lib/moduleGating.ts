import { ModuleId } from '@/store/useModuleStore';

export const MODULE_PREREQUISITES: Record<ModuleId, { prevId: ModuleId | null; prevName: string }> = {
  M01: { prevId: null, prevName: '' },
  M02: { prevId: 'M01', prevName: 'Module 01: Mindset & Foundation' },
  M03: { prevId: 'M02', prevName: 'Module 02: Market & Customer Understanding' },
  M04: { prevId: 'M03', prevName: 'Module 03: Prospecting & Opportunity Management' },
  M05: { prevId: 'M04', prevName: 'Module 04: Proposal, Negotiation & Safe Closing' },
  CAPSTONE: { prevId: 'M05', prevName: 'Module 05: Execution, Recovery & Account Growth' },
};

export function isModuleUnlocked(
  targetModuleId: ModuleId,
  submissions: Record<string, any>,
  role?: string
): boolean {
  // Admin luôn có quyền truy cập toàn bộ
  if (role === 'admin') return true;

  switch (targetModuleId) {
    case 'M01':
      return true; // Luôn mở cho mọi học viên

    case 'M02': {
      const m01 = submissions?.M01;
      const m01Data = m01?.form_data || {};
      const hasGoal = Boolean(m01Data.goal_90_days || m01Data.goals_90_days || m01Data.mad_libs);
      return Boolean(m01?.is_locked || (m01 && hasGoal));
    }

    case 'M03': {
      const m02 = submissions?.M02;
      const m02Data = m02?.form_data || {};
      const hasMarket = Boolean(m02Data.target_market && m02Data.route_to_market);
      return Boolean(m02?.is_locked || (m02 && hasMarket));
    }

    case 'M04': {
      const m03 = submissions?.M03;
      const m03Data = m03?.form_data || {};
      const hasQual = Boolean(m03Data.b07_qualification || m03Data.qualification_score || m03Data.leads);
      return Boolean(m03?.is_locked || (m03 && hasQual));
    }

    case 'M05': {
      const m04 = submissions?.M04;
      const m04Data = m04?.form_data || {};
      const hasClosing = Boolean(m04Data.b12_closing?.selected_payment_method || m04Data.selected_payment_method || m04Data.b12_closing?.safe_order_checklist);
      return Boolean(m04?.is_locked || (m04 && hasClosing));
    }

    case 'CAPSTONE': {
      const m05 = submissions?.M05;
      const m05Data = m05?.form_data || {};
      const hasExecution = Boolean(m05Data.b15_growth?.growth_objective || m05Data.b13_execution?.milestones || m05Data.b14_recovery?.bad_news_email);
      return Boolean(m05?.is_locked || (m05 && hasExecution));
    }

    default:
      return true;
  }
}
