'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useModuleStore } from '@/store/useModuleStore';
import { Search, ShieldAlert, CheckCircle } from 'lucide-react';

interface FactCheckData {
  market_intel: string;
  url_source: string;
}

export default function M02_B03_FactCheck() {
  const { updateSubmissionLocal, getModuleData } = useModuleStore();
  const formData = getModuleData('M02') || {};
  
  const [localData, setLocalData] = useState<FactCheckData>({
    market_intel: formData.market_intel || '',
    url_source: formData.url_source || ''
  });

  const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null);

  // Debounced auto-save to Zustand store
  useEffect(() => {
    const handler = setTimeout(() => {
      // Logic Gate 4: Basic UI-side validation for URL
      if (localData.url_source) {
        const isValid = /^https?:\/\/.+/.test(localData.url_source);
        setIsValidUrl(isValid);
      } else {
        setIsValidUrl(null);
      }

      updateSubmissionLocal('M02', { ...formData, ...localData });
    }, 500);

    return () => clearTimeout(handler);
  }, [localData, updateSubmissionLocal, formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocalData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
          <Search size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">B03: Market Fact-Check</h2>
          <p className="text-sm text-slate-500">Xác thực thông tin thị trường mục tiêu</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 pr-2">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            1. Bằng chứng thị trường (Market Intel)
          </label>
          <textarea
            name="market_intel"
            value={localData.market_intel}
            onChange={handleChange}
            placeholder="Dán các đoạn thông tin, số liệu bạn thu thập được về thị trường vào đây..."
            className="w-full h-32 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            2. Nguồn kiểm chứng (URL Source) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="url_source"
              value={localData.url_source}
              onChange={handleChange}
              placeholder="https://..."
              className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 text-sm ${
                isValidUrl === false 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : isValidUrl === true
                    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                    : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
            <div className="absolute right-3 top-3">
              {isValidUrl === false && <ShieldAlert size={18} className="text-red-500" />}
              {isValidUrl === true && <CheckCircle size={18} className="text-green-500" />}
            </div>
          </div>
          {isValidUrl === false && (
            <p className="text-xs text-red-500 font-medium">
              Lỗi Logic Gate 4: Bắt buộc phải là liên kết hợp lệ (chứa https://)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
