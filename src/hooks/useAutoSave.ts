import { useState, useEffect, useCallback, useRef } from 'react';
import { useModuleStore, ModuleId } from '@/store/useModuleStore';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutoSave<T>(
  moduleId: ModuleId,
  initialData: T,
  onSave: (data: T) => Promise<void>,
  delayMs: number = 3000
) {
  // Try to use store data if it exists, otherwise fallback to initialData
  const storeData = useModuleStore(state => state.submissions[moduleId]?.form_data);
  const updateStore = useModuleStore(state => state.updateSubmissionLocal);
  
  const [data, setData] = useState<T>(
    (storeData && Object.keys(storeData).length > 0) ? (storeData as T) : initialData
  );
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const savedDataRef = useRef<T>(initialData);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const save = useCallback(async (dataToSave: T) => {
    // If data hasn't changed since last save, skip
    if (JSON.stringify(dataToSave) === JSON.stringify(savedDataRef.current)) {
      return;
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
    manualSave: () => save(data)
  };
}
