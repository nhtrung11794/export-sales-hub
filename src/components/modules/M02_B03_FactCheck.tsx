'use client';

import React, { useEffect, useState } from 'react';
import { useModuleStore } from '@/store/useModuleStore';
import { Search, ShieldAlert, CheckCircle } from 'lucide-react';

interface FactCheckData {
  market_intel: string;
  url_source: string;
}

export default function M02_B03_FactCheck() {
  const { updateSubmissionLocal, getModuleData, submissions } = useModuleStore();
  const formData = getModuleData('M02') || {};
  const isLocked = submissions['M02']?.is_locked || false;
  
  const [localData, setLocalData] = useState<FactCheckData>({
    market_intel: formData.market_intel || '',
    url_source: formData.url_source || ''
  });

  const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
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
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '8px', color: 'var(--accent-primary)' }}>
          <Search size={24} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>B03: Market Fact-Check</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Xác thực thông tin thị trường mục tiêu</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            1. Bằng chứng thị trường (Market Intel)
          </label>
          <textarea
            name="market_intel"
            value={localData.market_intel}
            onChange={handleChange}
            disabled={isLocked}
            placeholder="Dán các đoạn thông tin, số liệu bạn thu thập được về thị trường vào đây..."
            className="form-input"
            style={{ 
              width: '100%', height: '120px', resize: 'none', 
              background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)',
              opacity: isLocked ? 0.6 : 1, cursor: isLocked ? 'not-allowed' : 'text' 
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            2. Nguồn kiểm chứng (URL Source) <span style={{ color: 'var(--accent-danger)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              name="url_source"
              value={localData.url_source}
              onChange={handleChange}
              disabled={isLocked}
              placeholder="https://..."
              className="form-input"
              style={{ 
                width: '100%', paddingRight: '40px',
                background: 'rgba(15, 23, 42, 0.5)', 
                border: isValidUrl === false ? '1px solid var(--accent-danger)' : isValidUrl === true ? '1px solid var(--accent-success)' : '1px solid rgba(255,255,255,0.1)',
                opacity: isLocked ? 0.6 : 1, cursor: isLocked ? 'not-allowed' : 'text',
                boxShadow: isValidUrl === false ? '0 0 10px rgba(239, 68, 68, 0.2)' : 'none'
              }}
            />
            <div style={{ position: 'absolute', right: '12px', top: '12px' }}>
              {isValidUrl === false && <ShieldAlert size={18} color="var(--accent-danger)" />}
              {isValidUrl === true && <CheckCircle size={18} color="var(--accent-success)" />}
            </div>
          </div>
          {isValidUrl === false && (
            <p style={{ fontSize: '0.75rem', color: 'var(--accent-danger)', fontWeight: 'bold', marginTop: '4px' }}>
              Lỗi Logic Gate 4: Bắt buộc phải là liên kết hợp lệ (chứa https://)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
