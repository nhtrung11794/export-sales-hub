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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
          <Target size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Module 03 Draft</h2>
          <p className="text-sm text-slate-500">Khu vực nháp cho các Bài học M03</p>
        </div>
      </div>

      <div className="flex-1">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Nhập nháp thông tin Pipeline..."
          className="w-full h-40 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
        />
      </div>
    </div>
  );
}
