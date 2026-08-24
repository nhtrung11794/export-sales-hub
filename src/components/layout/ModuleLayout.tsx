'use client';

import React, { useState, useEffect } from 'react';

interface ModuleLayoutProps {
  moduleTitle: string;
  learningContent: React.ReactNode;
  formContent: React.ReactNode;
  aiTutorContent: React.ReactNode;
  previewUrl?: string | null;
  onClosePreview?: () => void;
  headerActionNode?: React.ReactNode; // Thêm prop này
}

export default function ModuleLayout({
  moduleTitle,
  learningContent,
  formContent,
  aiTutorContent,
  previewUrl,
  onClosePreview,
  headerActionNode
}: ModuleLayoutProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Only access navigator on client-side
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="module-container">
      {/* CỘT 1: HỌC TẬP HOẶC ĐỌC TÀI LIỆU */}
      <div 
        className="module-col col-1" 
        style={previewUrl ? { width: '65%', padding: 0, overflow: 'hidden', transition: 'width 0.3s' } : { transition: 'width 0.3s' }}
      >
        {previewUrl ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ color: 'var(--accent-primary)', fontSize: '1rem', margin: 0 }}>📖 Đọc Tài Liệu</h2>
              <button 
                onClick={onClosePreview}
                className="btn"
                style={{ background: 'var(--accent-danger)', color: 'white', padding: '6px 16px', fontSize: '0.875rem' }}
              >
                Đóng lại (X)
              </button>
            </div>
            <div style={{ flex: 1, padding: '0' }}>
              <iframe 
                src={previewUrl} 
                style={{ width: '100%', height: '100%', border: 'none', backgroundColor: 'white' }}
                title="PDF Preview"
              />
            </div>
          </div>
        ) : (
          <>
            <h2 style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '1rem' }}>
              {moduleTitle} - Học tập
            </h2>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {learningContent}
            </div>
          </>
        )}
      </div>

      {/* CỘT 2: THỰC THI & LÀM BÀI */}
      <div 
        className="module-col col-2 glass-panel" 
        style={{ border: !isOnline ? '2px solid var(--accent-danger)' : '2px solid var(--accent-primary)', width: previewUrl ? '35%' : 'var(--col-2-width)', transition: 'width 0.3s' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: !isOnline ? 'var(--accent-danger)' : 'var(--accent-primary)' }}>Thực thi & Làm bài</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div id="status-bar" style={{ fontSize: '0.875rem', color: !isOnline ? 'var(--accent-danger)' : 'var(--text-muted)' }}>
              {!isOnline ? 'MẤT KẾT NỐI' : 'Trạng thái: Đang tải...'}
            </div>
            {headerActionNode}
          </div>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          {!isOnline && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(2px)',
              borderRadius: '8px'
            }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--accent-danger)', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                <span style={{ color: 'var(--accent-danger)', fontWeight: 'bold', display: 'block', fontSize: '1.25rem', marginBottom: '8px' }}>⚠️ Rớt Mạng (Offline)</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Đã tự động khóa Form để bảo toàn dữ liệu. Vui lòng kiểm tra lại Internet.</span>
              </div>
            </div>
          )}
          <div style={{ pointerEvents: !isOnline ? 'none' : 'auto', opacity: !isOnline ? 0.5 : 1, transition: 'opacity 0.3s' }}>
            {formContent}
          </div>
        </div>
      </div>

      {/* CỘT 3: AI TUTOR - ẨN KHI ĐANG ĐỌC TÀI LIỆU */}
      {!previewUrl && (
        <div className="module-col col-3" style={{ transition: 'all 0.3s' }}>
          <h2 style={{ marginBottom: '16px', color: 'var(--accent-warning)', fontSize: '1rem' }}>
            ✨ Trợ lý AI (NotebookLM)
          </h2>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {aiTutorContent}
          </div>
        </div>
      )}
    </div>
  );
}
