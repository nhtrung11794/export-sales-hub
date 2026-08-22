import { useState, useEffect, useCallback, useRef } from 'react';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutoSave<T>(
  initialData: T,
  onSave: (data: T) => Promise<void>,
  delayMs: number = 30000
) {
  const [data, setData] = useState<T>(initialData);
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
      savedDataRef.current = dataToSave;
      setLastSaved(new Date());
      setStatus('saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
      setStatus('error');
    }
  }, [onSave]);

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
