'use client';

import React from 'react';

interface ModuleLayoutProps {
  moduleTitle: string;
  learningContent: React.ReactNode;
  formContent: React.ReactNode;
  aiTutorContent: React.ReactNode;
  previewUrl?: string | null;
  onClosePreview?: () => void;
}

export default function ModuleLayout({
  moduleTitle,
  learningContent,
  formContent,
  aiTutorContent,
  previewUrl,
  onClosePreview
}: ModuleLayoutProps) {
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
        style={{ border: '2px solid var(--accent-primary)', width: previewUrl ? '35%' : 'var(--col-2-width)', transition: 'width 0.3s' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: 'var(--accent-primary)' }}>Thực thi & Làm bài</h2>
          <div id="status-bar" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Trạng thái: Đang tải...
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {formContent}
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
