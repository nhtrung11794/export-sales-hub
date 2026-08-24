'use client';

import React, { useState, useEffect } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import M1_CompetencyForm from '@/components/modules/m01/M1_CompetencyForm';
import { supabase } from '@/lib/supabase';
import { useModuleStore } from '@/store/useModuleStore';
import { Copy, Check } from 'lucide-react';

export default function M01Page() {
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { getModuleData } = useModuleStore();

  // Gọi getModuleData để lấy số điểm hiện tại mà học viên đã kéo ở Cột 2
  // Cần theo dõi thay đổi nên ta có thể dùng Store selector nếu muốn re-render, 
  // nhưng ở đây ta dùng hàm lấy snapshot
  const [radarScores, setRadarScores] = useState({
    research: 3,
    negotiation: 3,
    b2b: 3,
    culture: 3,
    english: 3
  });

  // Tự động đồng bộ với Store mỗi 1 giây để Cột 3 luôn hiển thị Prompt khớp với Cột 2
  useEffect(() => {
    const interval = setInterval(() => {
      const data = getModuleData('M01');
      if (data?.competency_radar) {
        setRadarScores({
          research: data.competency_radar.market_research || 3,
          negotiation: data.competency_radar.negotiation || 3,
          b2b: data.competency_radar.b2b_sales_process || 3,
          culture: data.competency_radar.cultural_understanding || 3,
          english: data.competency_radar.english_communication || 3
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [getModuleData]);

  // Tạo Prompt động (Dynamic Prompt) dựa trên số điểm thực tế
  const dynamicPrompt = `"Dựa vào hồ sơ năng lực tôi vừa tự đánh giá (Research: ${radarScores.research}/5, Negotiation: ${radarScores.negotiation}/5, B2B Process: ${radarScores.b2b}/5, Culture: ${radarScores.culture}/5, English: ${radarScores.english}/5), hãy đề xuất cho tôi 3 mục tiêu 90 ngày thiết thực nhất để cải thiện các điểm yếu dưới 3 điểm của tôi trong đàm phán B2B."`;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(dynamicPrompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  const handleOpenDocument = async (fileName: string) => {
    try {
      setLoadingFile(fileName);
      
      const { data, error } = await supabase
        .storage
        .from('course_materials')
        .createSignedUrl(fileName, 3600); // Tăng thời gian sống của URL lên 1 tiếng

      if (error) {
        console.error('Lỗi khi lấy tài liệu:', error);
        alert('Không thể mở tài liệu. Vui lòng kiểm tra lại file đã được tải lên Supabase chưa.');
        return;
      }

      if (data?.signedUrl) {
        setPreviewUrl(data.signedUrl);
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
      {/* Tính năng mới: Khung Video PiP Placeholder */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', position: 'relative', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
        <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             ▶
          </div>
          <span>[Video Bài giảng: Module 01]</span>
          <span style={{ fontSize: '0.8rem' }}>Hỗ trợ Picture-in-Picture (PiP)</span>
        </div>
      </div>

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
            {loadingFile === 'M01_Bai01.pdf' ? '⏳ Đang tải...' : '📖 Mở Giáo án PDF'}
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
            {loadingFile === 'M01_Bai02.pdf' ? '⏳ Đang tải...' : '📖 Mở Giáo án PDF'}
          </button>
        </div>
      </div>
    </div>
  );

  const aiTutorContent = (
    <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--accent-warning)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        Gặp khó khăn khi viết Mục tiêu 90 ngày? Hãy dùng Prompt dưới đây (đã tự động lấy điểm số bạn vừa chấm) và gửi cho NotebookLM của khóa học nhé!
      </p>
      
      {/* Khối chứa Prompt Động */}
      <div style={{ position: 'relative' }}>
        <div style={{ 
          background: 'rgba(0,0,0,0.3)', 
          padding: '16px', 
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontFamily: 'monospace',
          color: 'var(--text-muted)',
          border: '1px solid rgba(255,255,255,0.05)',
          minHeight: '120px'
        }}>
          {dynamicPrompt}
        </div>
        
        {/* Nút Click-to-copy */}
        <button 
          onClick={handleCopyPrompt}
          className="btn"
          style={{ 
            position: 'absolute', 
            top: '8px', 
            right: '8px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          {isCopied ? <><Check size={14} color="var(--accent-success)"/> Đã Copy</> : <><Copy size={14}/> Copy Prompt</>}
        </button>
      </div>
      
      <a 
        href="https://notebooklm.google.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="btn" 
        style={{ 
          display: 'block', 
          textAlign: 'center', 
          background: 'var(--accent-warning)', 
          color: 'var(--bg-primary)',
          fontWeight: 'bold',
          padding: '12px'
        }}
      >
        Mở NotebookLM M01 ➔
      </a>
    </div>
  );

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Module 01</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Mindset nền tảng Sales Xuất khẩu & Hồ sơ năng lực</p>
      </header>

      <ModuleLayout 
        moduleTitle="Module 01"
        learningContent={learningContent}
        formContent={<M1_CompetencyForm />}
        aiTutorContent={aiTutorContent}
        previewUrl={previewUrl}
        onClosePreview={() => setPreviewUrl(null)}
      />
    </div>
  );
}
