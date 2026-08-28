'use client';

import React, { useState, useEffect } from 'react';

interface ModuleLayoutProps {
  moduleTitle: string;
  learningContent: React.ReactNode;
  formContent: React.ReactNode;
  aiTutorContent: React.ReactNode;
  previewUrl?: string | null;
  previewTitle?: string;
  onClosePreview?: () => void;
  headerActionNode?: React.ReactNode;
}

export default function ModuleLayout({
  moduleTitle,
  learningContent,
  formContent,
  aiTutorContent,
  previewUrl,
  previewTitle,
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
        style={previewUrl ? { flex: '0 0 60%', maxWidth: '60%', padding: 0, overflow: 'hidden', transition: 'all 0.3s' } : { transition: 'all 0.3s' }}
      >
        {previewUrl ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.9rem' }}>📖</span>
                <div>
                  <h2 style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', margin: 0, fontWeight: 700 }}>
                    {previewTitle || 'Đọc Slide Bài Giảng'}
                  </h2>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Xem trực tiếp từ Google Drive Embed</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                  title="Mở tài liệu trên tab mới"
                >
                  Mở tab mới ↗
                </a>
                <button 
                  onClick={onClosePreview}
                  className="btn"
                  style={{ background: 'var(--accent-danger)', color: 'white', padding: '4px 10px', fontSize: '0.72rem' }}
                >
                  Đóng lại (X)
                </button>
              </div>
            </div>
            <div style={{ flex: 1, padding: '0', position: 'relative' }}>
              <iframe 
                src={previewUrl} 
                style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#1e293b' }}
                title={previewTitle || 'PDF Preview'}
                allow="autoplay"
              />
            </div>
          </div>
        ) : (
          <>
            <h2 style={{ marginBottom: '10px', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 700 }}>
              {moduleTitle} - Học tập
            </h2>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {learningContent}
            </div>
          </>
        )}
      </div>

      {/* CỘT 2: THỰC THI & LÀM BÀI */}
      <div 
        className="module-col col-2 glass-panel" 
        style={{ border: !isOnline ? '2px solid var(--accent-danger)' : '2px solid var(--accent-primary)', transition: 'all 0.3s' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexShrink: 0 }}>
          <h2 style={{ color: !isOnline ? 'var(--accent-danger)' : 'var(--accent-primary)', fontSize: '1.05rem', margin: 0, fontWeight: 800 }}>Thực thi & Làm bài</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div id="status-bar" style={{ fontSize: '0.8rem', color: !isOnline ? 'var(--accent-danger)' : 'var(--text-muted)' }}>
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
              <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--accent-danger)', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                <span style={{ color: 'var(--accent-danger)', fontWeight: 'bold', display: 'block', fontSize: '1.1rem', marginBottom: '6px' }}>⚠️ Rớt Mạng (Offline)</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Đã tự động khóa Form để bảo toàn dữ liệu. Vui lòng kiểm tra lại Internet.</span>
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
          <h2 style={{ marginBottom: '10px', color: 'var(--accent-warning)', fontSize: '0.88rem', fontWeight: 700 }}>
            ✨ Trợ lý AI (NotebookLM)
          </h2>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {aiTutorContent}
          </div>
        </div>
      )}
    </div>
  );
}
