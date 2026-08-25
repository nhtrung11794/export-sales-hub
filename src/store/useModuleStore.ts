import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

export type ModuleId = 'M01' | 'M02' | 'M03' | 'M04' | 'M05' | 'CAPSTONE';

export interface ModuleSubmission {
  id?: string;
  module_id: ModuleId;
  form_data: any;
  status?: string;
  is_locked: boolean;
  updated_at?: string;
}

interface ModuleStore {
  submissions: Record<string, ModuleSubmission>;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  fetchAllSubmissions: (userId: string) => Promise<void>;
  updateSubmissionLocal: (moduleId: ModuleId, data: any) => void;
  submitModule: (moduleId: ModuleId, userId: string) => Promise<{ success: boolean; error?: string }>;
  unlockModule: (moduleId: ModuleId, userId: string) => Promise<{ success: boolean; error?: string }>;
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
        data.forEach((sub: any) => {
          submissionsMap[sub.module_id] = {
            ...sub,
            is_locked: sub.status === 'submitted'
          };
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
        updated_at: new Date().toISOString()
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

  submitModule: async (moduleId: ModuleId, userId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('module_submissions')
        .update({ status: 'submitted', updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('module_id', moduleId);

      if (error) throw error;

      // Cập nhật local state
      set((state) => {
        const existing = state.submissions[moduleId];
        if (!existing) return state;
        return {
          submissions: {
            ...state.submissions,
            [moduleId]: {
              ...existing,
              is_locked: true
            }
          }
        };
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error submitting module:', error);
      return { success: false, error: error.message || JSON.stringify(error) };
    }
  },

  unlockModule: async (moduleId: ModuleId, userId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('module_submissions')
        .update({ status: 'draft', updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('module_id', moduleId);

      if (error) throw error;

      set((state) => {
        const existing = state.submissions[moduleId];
        if (!existing) return state;
        return {
          submissions: {
            ...state.submissions,
            [moduleId]: {
              ...existing,
              is_locked: false
            }
          }
        };
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error unlocking module:', error);
      return { success: false, error: error.message || JSON.stringify(error) };
    }
  },

  getModuleData: (moduleId: ModuleId) => {
    const sub = get().submissions[moduleId];
    return sub ? sub.form_data : {};
  }
}));
