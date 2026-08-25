'use client';

import React, { useEffect, useState } from 'react';
import { useModuleStore } from '@/store/useModuleStore';
import { Target } from 'lucide-react';

export default function M03_CombinedForm() {
  const { updateSubmissionLocal, getModuleData } = useModuleStore();
  const formData = getModuleData('M03') || {};

  const [notes, setNotes] = useState(formData.temp_notes || '');

  useEffect(() => {
    const handler = setTimeout(() => {
      updateSubmissionLocal('M03', { ...formData, temp_notes: notes });
    }, 500);
    return () => clearTimeout(handler);
  }, [notes, updateSubmissionLocal, formData]);

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '8px', color: '#10b981' }}>
          <Target size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Module 03 Draft</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Khu vực nháp cho các Bài học M03</p>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Nhập nháp thông tin Pipeline..."
          className="form-input"
          style={{ 
            width: '100%', height: '200px', resize: 'none', 
            background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)' 
          }}
        />
      </div>
    </div>
  );
}
