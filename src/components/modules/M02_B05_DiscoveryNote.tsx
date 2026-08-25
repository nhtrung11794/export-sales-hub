'use client';

import React, { useState, useEffect } from 'react';
import { useModuleStore } from '@/store/useModuleStore';
import { FileText, Plus, Trash2 } from 'lucide-react';

const TABS = [
  { id: 'need', label: 'Nhu cầu (Need)' },
  { id: 'pain', label: 'Nỗi đau (Pain)' },
  { id: 'criteria', label: 'Tiêu chí (Criteria)' },
  { id: 'risk', label: 'Rủi ro (Risk)' },
  { id: 'concern', label: 'Mối bận tâm (Concern)' }
];

export default function M02_B05_DiscoveryNote() {
  const { updateSubmissionLocal, getModuleData, submissions } = useModuleStore();
  const formData = getModuleData('M02') || {};
  const isLocked = submissions['M02']?.is_locked || false;

  const [activeTab, setActiveTab] = useState('need');
  
  const [insights, setInsights] = useState<Record<string, string[]>>({
    need: formData.discovery_insights?.need || [''],
    pain: formData.discovery_insights?.pain || [''],
    criteria: formData.discovery_insights?.criteria || [''],
    risk: formData.discovery_insights?.risk || [''],
    concern: formData.discovery_insights?.concern || ['']
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      updateSubmissionLocal('M02', { 
        ...formData, 
        discovery_insights: insights 
      });
    }, 500);
    return () => clearTimeout(handler);
  }, [insights, updateSubmissionLocal, formData]);

  const handleInsightChange = (tabId: string, index: number, value: string) => {
    const newInsights = { ...insights };
    newInsights[tabId][index] = value;
    setInsights(newInsights);
  };

  const addInsight = (tabId: string) => {
    if (isLocked) return;
    const newInsights = { ...insights };
    newInsights[tabId] = [...newInsights[tabId], ''];
    setInsights(newInsights);
  };

  const removeInsight = (tabId: string, index: number) => {
    if (isLocked) return;
    const newInsights = { ...insights };
    if (newInsights[tabId].length > 1) {
      newInsights[tabId].splice(index, 1);
      setInsights(newInsights);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '8px', borderRadius: '8px', color: '#facc15' }}>
          <FileText size={24} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>B05: Discovery Insight Note</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Bóc tách bề mặt thành insights (5 Tabs UI)</p>
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px', overflowX: 'auto', gap: '8px' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              background: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              borderBottom: activeTab === tab.id ? '2px solid #fff' : '2px solid transparent'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {insights[activeTab].map((text, index) => (
          <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <span style={{ marginTop: '8px', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 'bold' }}>{index + 1}.</span>
            <textarea
              value={text}
              onChange={(e) => handleInsightChange(activeTab, index, e.target.value)}
              disabled={isLocked}
              placeholder={`Nhập ${TABS.find(t => t.id === activeTab)?.label.toLowerCase()} của khách hàng...`}
              className="form-input"
              style={{ flex: 1, resize: 'none', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', opacity: isLocked ? 0.6 : 1, cursor: isLocked ? 'not-allowed' : 'text', minHeight: '60px' }}
            />
            {insights[activeTab].length > 1 && (
              <button
                onClick={() => removeInsight(activeTab, index)}
                disabled={isLocked}
                style={{
                  background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: isLocked ? 'not-allowed' : 'pointer',
                  padding: '8px', opacity: isLocked ? 0.5 : 1
                }}
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}

        {!isLocked && (
          <button
            onClick={() => addInsight(activeTab)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start',
              background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)',
              padding: '8px 16px', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer', marginTop: '8px', transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <Plus size={16} /> Thêm dòng mới
          </button>
        )}
      </div>
    </div>
  );
}
