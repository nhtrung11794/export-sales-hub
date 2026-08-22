'use client';

import React from 'react';

interface ModuleLayoutProps {
  moduleTitle: string;
  learningContent: React.ReactNode;
  formContent: React.ReactNode;
  aiTutorContent: React.ReactNode;
}

export default function ModuleLayout({
  moduleTitle,
  learningContent,
  formContent,
  aiTutorContent,
}: ModuleLayoutProps) {
  return (
    <div className="module-container">
      {/* CỘT 1: HỌC TẬP (30%) */}
      <div className="module-col col-1">
        <h2 style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '1rem' }}>
          {moduleTitle} - Học tập
        </h2>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {learningContent}
        </div>
      </div>

      {/* CỘT 2: THỰC THI & LÀM BÀI (45%) */}
      <div className="module-col col-2 glass-panel" style={{ border: '2px solid var(--accent-primary)' }}>
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

      {/* CỘT 3: AI TUTOR (25%) */}
      <div className="module-col col-3">
        <h2 style={{ marginBottom: '16px', color: 'var(--accent-warning)', fontSize: '1rem' }}>
          ✨ Trợ lý AI (NotebookLM)
        </h2>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {aiTutorContent}
        </div>
      </div>
    </div>
  );
}
