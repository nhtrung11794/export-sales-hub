'use client';

import React, { useState, useEffect } from 'react';
import { useModuleStore } from '@/store/useModuleStore';
import { FileText, Plus, Trash2 } from 'lucide-react';

type TabKey = 'need' | 'pain' | 'criteria' | 'risk' | 'concern';

const TABS: { id: TabKey; label: string }[] = [
  { id: 'need', label: 'Nhu cầu (Need)' },
  { id: 'pain', label: 'Nỗi đau (Pain)' },
  { id: 'criteria', label: 'Tiêu chí (Criteria)' },
  { id: 'risk', label: 'Rủi ro (Risk)' },
  { id: 'concern', label: 'Mối bận tâm (Concern)' }
];

export default function M02_B05_DiscoveryNote() {
  const { updateSubmissionLocal, getModuleData } = useModuleStore();
  const formData = getModuleData('M02') || {};
  
  const [activeTab, setActiveTab] = useState<TabKey>('need');
  const [buyerPain, setBuyerPain] = useState<Record<TabKey, string[]>>({
    need: formData.buyer_pain?.need || [''],
    pain: formData.buyer_pain?.pain || [''],
    criteria: formData.buyer_pain?.criteria || [''],
    risk: formData.buyer_pain?.risk || [''],
    concern: formData.buyer_pain?.concern || ['']
  });

  // Debounced Auto-save
  useEffect(() => {
    const handler = setTimeout(() => {
      // Clean empty strings before saving
      const cleanedData = {
        need: buyerPain.need.filter(Boolean),
        pain: buyerPain.pain.filter(Boolean),
        criteria: buyerPain.criteria.filter(Boolean),
        risk: buyerPain.risk.filter(Boolean),
        concern: buyerPain.concern.filter(Boolean),
      };
      updateSubmissionLocal('M02', { 
        ...formData, 
        buyer_pain: cleanedData 
      });
    }, 1000);
    return () => clearTimeout(handler);
  }, [buyerPain, updateSubmissionLocal, formData]);

  const handleItemChange = (tabId: TabKey, index: number, value: string) => {
    setBuyerPain(prev => {
      const newArray = [...prev[tabId]];
      newArray[index] = value;
      return { ...prev, [tabId]: newArray };
    });
  };

  const addItem = (tabId: TabKey) => {
    setBuyerPain(prev => ({
      ...prev,
      [tabId]: [...prev[tabId], '']
    }));
  };

  const removeItem = (tabId: TabKey, index: number) => {
    setBuyerPain(prev => {
      const newArray = prev[tabId].filter((_, i) => i !== index);
      if (newArray.length === 0) newArray.push(''); // Always keep at least one input
      return { ...prev, [tabId]: newArray };
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
        <div className="bg-teal-100 p-2 rounded-lg text-teal-600">
          <FileText size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">B05: Discovery Insight Note</h2>
          <p className="text-sm text-slate-500">Bóc tách bề mặt thành insights (5 Tabs UI)</p>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-teal-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="space-y-3">
          {buyerPain[activeTab].map((item, index) => (
            <div key={index} className="flex gap-2 items-start">
              <span className="text-slate-400 mt-2 text-sm font-bold">{index + 1}.</span>
              <textarea
                value={item}
                onChange={(e) => handleItemChange(activeTab, index, e.target.value)}
                placeholder={`Nhập ${TABS.find(t => t.id === activeTab)?.label.toLowerCase()} của khách hàng...`}
                className="flex-1 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm resize-none h-16"
              />
              <button 
                onClick={() => removeItem(activeTab, index)}
                className="mt-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          
          <button
            onClick={() => addItem(activeTab)}
            className="flex items-center gap-2 text-sm text-teal-600 font-medium hover:text-teal-700 py-2 px-4 border border-dashed border-teal-300 rounded-lg hover:bg-teal-50 transition-colors w-full justify-center mt-4"
          >
            <Plus size={16} /> Thêm dòng mới
          </button>
        </div>
      </div>
    </div>
  );
}
