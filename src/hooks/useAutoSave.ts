import { useState, useEffect, useCallback, useRef } from 'react';
import { useModuleStore, ModuleId } from '@/store/useModuleStore';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutoSave<T>(
  moduleId: ModuleId,
  initialData: T,
  onSave: (data: T) => Promise<void>,
  delayMs: number = 3000
) {
  // Try to use store data if it exists, otherwise fallback to localStorage or initialData
  const storeData = useModuleStore(state => state.submissions[moduleId]?.form_data);
  const updateStore = useModuleStore(state => state.updateSubmissionLocal);

  const getInitialValue = (): T => {
    if (storeData && Object.keys(storeData).length > 0) {
      return storeData as T;
    }
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`module_draft_${moduleId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            return { ...initialData, ...parsed };
          }
        }
      } catch (e) {
        console.warn('Lỗi đọc draft từ localStorage:', e);
      }
    }
    return initialData;
  };

  const [data, setData] = useState<T>(getInitialValue);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const savedDataRef = useRef<T>(data);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync saved data reference when data is freshly loaded from database
  const syncSavedData = useCallback((newData: T) => {
    savedDataRef.current = newData;
  }, []);

  const save = useCallback(async (dataToSave: T, force: boolean = false) => {
    // If data hasn't changed since last save and not forced, skip
    if (!force && JSON.stringify(dataToSave) === JSON.stringify(savedDataRef.current)) {
      return;
    }

    // Always backup to localStorage immediately so user never loses their work
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`module_draft_${moduleId}`, JSON.stringify(dataToSave));
      } catch (e) {
        console.warn('Lỗi ghi draft vào localStorage:', e);
      }
    }

    try {
      setStatus('saving');
      await onSave(dataToSave);

      // Update global store on successful save
      updateStore(moduleId, dataToSave);

      savedDataRef.current = dataToSave;
      setLastSaved(new Date());
      setStatus('saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
      setStatus('error');
    }
  }, [onSave, moduleId, updateStore]);

  // Handle auto-save on delay (debounce)
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Only set timer if data has changed
    if (JSON.stringify(data) !== JSON.stringify(savedDataRef.current)) {
      timerRef.current = setTimeout(() => {
        save(data);
      }, delayMs);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, save, delayMs]);

  // Auto-retry when status is error and user is online
  useEffect(() => {
    if (status === 'error') {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      retryTimerRef.current = setTimeout(() => {
        if (typeof navigator !== 'undefined' && navigator.onLine) {
          save(data, true);
        }
      }, 5000);
    }
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [status, data, save]);

  // Immediately sync to Zustand store and localStorage so submissions and Gating checks always have live data
  useEffect(() => {
    if (data && typeof data === 'object') {
      updateStore(moduleId, data);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`module_draft_${moduleId}`, JSON.stringify(data));
        } catch (e) {
          console.warn('Lỗi ghi cache draft vào localStorage:', e);
        }
      }
    }
  }, [data, moduleId, updateStore]);

  // Synchronize with DOM status-bar in ModuleLayout for consistent UX across all modules
  useEffect(() => {
    const statusBar = document.getElementById('status-bar');
    if (!statusBar) return;

    const sub = useModuleStore.getState().submissions[moduleId];
    if (sub?.status === 'submitted' || sub?.is_locked) {
      statusBar.textContent = 'Trạng thái: 📝 Đã nộp bài (Chờ chấm)';
      statusBar.style.color = 'var(--accent-primary, #38bdf8)';
      return;
    }

    if (status === 'saving') {
      statusBar.textContent = 'Trạng thái: Đang lưu...';
      statusBar.style.color = 'var(--accent-warning, #f59e0b)';
    } else if (status === 'saved') {
      statusBar.textContent = `Trạng thái: Đã lưu (${lastSaved ? lastSaved.toLocaleTimeString('vi-VN') : ''})`;
      statusBar.style.color = 'var(--accent-success, #10b981)';
    } else if (status === 'error') {
      statusBar.textContent = 'Trạng thái: Lưu thất bại (đã lưu cache offline)';
      statusBar.style.color = 'var(--accent-danger, #ef4444)';
    } else {
      statusBar.textContent = 'Trạng thái: Bản nháp';
      statusBar.style.color = 'var(--text-muted, #94a3b8)';
    }
  }, [status, lastSaved, moduleId]);

  // Handle manual trigger (e.g., onBlur)
  const handleBlur = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    save(data);
  }, [data, save]);

  return {
    data,
    setData,
    status,
    lastSaved,
    handleBlur,
    syncSavedData,
    manualSave: (force: boolean = true) => save(data, force)
  };
}
