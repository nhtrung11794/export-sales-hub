'use client';

import React, { useState } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import M1_CompetencyForm from '@/components/modules/m01/M1_CompetencyForm';
import { supabase } from '@/lib/supabase';

export default function M01Page() {
  const [loadingFile, setLoadingFile] = useState<string | null>(null);

  const handleOpenDocument = async (fileName: string) => {
    try {
      setLoadingFile(fileName);
      
      // Xin link ký tự động (Signed URL) có hiệu lực trong 60 giây
      const { data, error } = await supabase
        .storage
        .from('course_materials')
        .createSignedUrl(fileName, 60);

      if (error) {
        console.error('Lỗi khi lấy tài liệu:', error);
        alert('Không thể mở tài liệu. Vui lòng kiểm tra lại file đã được tải lên Supabase chưa.');
        return;
      }

      if (data?.signedUrl) {
        // Mở link trong tab mới
        window.open(data.signedUrl, '_blank');
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi kết nối.');
    } finally {
      setLoadingFile(null);
    }
  };

  const learningContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '16px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '8px' }}>Bài 01 - Tư duy bán hàng trong bối cảnh thế giới mới</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Thế giới thay đổi chóng mặt với AI và Data. Bài này giúp bạn reset tư duy, nhìn nhận lại vai trò của người Sales B2B trong kỷ nguyên mới.
        </p>
        <div style={{ marginTop: '12px' }}>
          <button 
            onClick={() => handleOpenDocument('M01_Bai01.pdf')}
            disabled={loadingFile === 'M01_Bai01.pdf'}
            className="btn btn-secondary" 
            style={{ display: 'block', width: '100%', textAlign: 'center', fontSize: '0.875rem' }}
          >
            {loadingFile === 'M01_Bai01.pdf' ? '⏳ Đang tải...' : '📄 Mở tài liệu đọc thêm'}
          </button>
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: '16px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '8px' }}>Bài 02 - Bản chất nghề sales xuất khẩu</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Bạn không chỉ là người bán hàng, bạn là "Cố vấn giải pháp" (Solution Consultant). Làm sao để xây dựng niềm tin vượt biên giới?
        </p>
        <div style={{ marginTop: '12px' }}>
          <button 
            onClick={() => handleOpenDocument('M01_Bai02.pdf')}
            disabled={loadingFile === 'M01_Bai02.pdf'}
            className="btn btn-secondary" 
            style={{ display: 'block', width: '100%', textAlign: 'center', fontSize: '0.875rem' }}
          >
            {loadingFile === 'M01_Bai02.pdf' ? '⏳ Đang tải...' : '📄 Mở tài liệu đọc thêm'}
          </button>
        </div>
      </div>
    </div>
  );

  const aiTutorContent = (
    <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--accent-warning)' }}>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
        Gặp khó khăn khi viết Mục tiêu 90 ngày? Hãy dùng Prompt dưới đây và gửi cho NotebookLM của khóa học để được gợi ý nhé!
      </p>
      
      <div style={{ 
        background: 'rgba(0,0,0,0.3)', 
        padding: '16px', 
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '0.875rem',
        fontFamily: 'monospace',
        color: 'var(--text-muted)'
      }}>
        "Dựa vào hồ sơ năng lực tôi vừa tự đánh giá (Research: 3, Negotiation: 2...), hãy đề xuất cho tôi 3 mục tiêu 90 ngày thiết thực nhất để cải thiện kỹ năng đàm phán B2B."
      </div>
      
      <a 
        href="https://notebook.google.com/notebook/88777706-546d-411d-86e9-19f0577dae14" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="btn" 
        style={{ 
          display: 'block', 
          textAlign: 'center', 
          background: 'var(--accent-warning)', 
          color: 'var(--bg-primary)',
          fontWeight: 'bold'
        }}
      >
        Mở NotebookLM M01
      </a>
    </div>
  );

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Module 01</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Mindset nền tảng Sales Xuất khẩu & Hồ sơ năng lực</p>
        </div>
        <div>
          <button className="btn btn-primary">Nộp bài hoàn chỉnh</button>
        </div>
      </header>

      <ModuleLayout 
        moduleTitle="Module 01"
        learningContent={learningContent}
        formContent={<M1_CompetencyForm />}
        aiTutorContent={aiTutorContent}
      />
    </div>
  );
}
