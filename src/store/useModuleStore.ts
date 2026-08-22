import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

export type ModuleId = 'M01' | 'M02' | 'M03' | 'M04' | 'M05' | 'CAPSTONE';

export interface ModuleSubmission {
  id?: string;
  module_id: ModuleId;
  form_data: any;
  is_locked: boolean;
  last_saved_at: string;
}

interface ModuleStore {
  submissions: Record<string, ModuleSubmission>;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  fetchAllSubmissions: (userId: string) => Promise<void>;
  updateSubmissionLocal: (moduleId: ModuleId, data: any) => void;
  getModuleData: (moduleId: ModuleId) => any;
}

export const useModuleStore = create<ModuleStore>((set, get) => ({
  submissions: {},
  isLoading: false,
  isInitialized: false,

  fetchAllSubmissions: async (userId: string) => {
    if (get().isInitialized || get().isLoading) return; // Prevent duplicate fetches
    
    set({ isLoading: true });
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('module_submissions')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      // Convert array to Record keyed by module_id
      const submissionsMap: Record<string, ModuleSubmission> = {};
      
      if (data) {
        data.forEach((sub: ModuleSubmission) => {
          submissionsMap[sub.module_id] = sub;
        });
      }

      set({ 
        submissions: submissionsMap, 
        isLoading: false, 
        isInitialized: true 
      });
      
    } catch (error) {
      console.error('Error fetching all module submissions:', error);
      set({ isLoading: false });
    }
  },

  updateSubmissionLocal: (moduleId: ModuleId, data: any) => {
    set((state) => {
      const existing = state.submissions[moduleId] || {
        module_id: moduleId,
        form_data: {},
        is_locked: false,
        last_saved_at: new Date().toISOString()
      };
      
      return {
        submissions: {
          ...state.submissions,
          [moduleId]: {
            ...existing,
            form_data: data
          }
        }
      };
    });
  },

  getModuleData: (moduleId: ModuleId) => {
    const sub = get().submissions[moduleId];
    return sub ? sub.form_data : {};
  }
}));
