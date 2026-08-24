'use client';

import React, { useState, useEffect } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import M1_CompetencyForm from '@/components/modules/m01/M1_CompetencyForm';
import { supabase } from '@/lib/supabase';
import { useModuleStore } from '@/store/useModuleStore';
import { Copy, Check, Play, BookOpen, X } from 'lucide-react';
import { Rnd } from 'react-rnd';

export default function M01Page() {
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Trạng thái cho Video PiP
  const [pipVideoUrl, setPipVideoUrl] = useState<string | null>(null);
  
  const [isCopied, setIsCopied] = useState(false);
  const { getModuleData, submitModule, submissions } = useModuleStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Hook to check auth user id (needed for submit)
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, []);

  const [radarScores, setRadarScores] = useState({
    market: 3,
    prospecting: 3,
    pricing: 3,
    risk: 3,
    internal: 3,
    crm: 3
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const data = getModuleData('M01');
      const submission = submissions['M01'];
      if (submission) {
        setIsLocked(submission.is_locked);
      }
      
      if (data) {
        if (data.competency_radar) {
          setRadarScores({
            market: data.competency_radar.market_and_icp || 3,
            prospecting: data.competency_radar.prospecting_discovery || 3,
            pricing: data.competency_radar.pricing_negotiation || 3,
            risk: data.competency_radar.risk_management || 3,
            internal: data.competency_radar.internal_claim || 3,
            crm: data.competency_radar.crm_growth || 3
          });
        }
        
        // Validation: goals_90d and mindset_shift must not be empty
        const isDraftValid = data.goals_90d && data.goals_90d.trim().length > 0 &&
                             data.mindset_shift && data.mindset_shift.trim().length > 0;
        setIsValid(!!isDraftValid);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [getModuleData, submissions]);

  const handleSubmit = async () => {
    if (!userId || !isValid || isLocked) return;
    setIsSubmitting(true);
    const success = await submitModule('M01', userId);
    if (success) {
      alert('Nộp bài thành công! Module 02 đã được mở khóa.');
    } else {
      alert('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
    }
    setIsSubmitting(false);
  };

  const dynamicPrompt = `"Dựa vào hồ sơ năng lực tôi vừa tự đánh giá (Market & ICP: ${radarScores.market}/5, Prospecting: ${radarScores.prospecting}/5, Pricing: ${radarScores.pricing}/5, Risk: ${radarScores.risk}/5, Internal: ${radarScores.internal}/5, CRM: ${radarScores.crm}/5), hãy đề xuất cho tôi 3 mục tiêu 90 ngày thiết thực nhất để cải thiện các điểm yếu dưới 3 điểm của tôi trong đàm phán B2B."`;

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
        .createSignedUrl(fileName, 3600);

      if (error) throw error;
      if (data?.signedUrl) setPreviewUrl(data.signedUrl);
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi kết nối.');
    } finally {
      setLoadingFile(null);
    }
  };

  const handleOpenVideo = async (fileName: string) => {
    try {
      setLoadingVideo(fileName);
      const { data, error } = await supabase
        .storage
        .from('course_materials')
        .createSignedUrl(fileName, 3600);

      if (error) throw error;
      if (data?.signedUrl) setPipVideoUrl(data.signedUrl);
    } catch (err) {
      console.error(err);
      alert('Không thể mở video. Vui lòng kiểm tra lại file đã được tải lên Supabase chưa.');
    } finally {
      setLoadingVideo(null);
    }
  };

  const learningContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* BÀI 01 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '12px', fontSize: '1.1rem' }}>
          Bài 01 - BANI/VUCA, Tư duy Customer-centric
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
          Dịch chuyển tư duy (Mindset Shift) từ bán hàng truyền thống sang tư vấn. Hiểu rõ bối cảnh thị trường BANI/VUCA để xây dựng sự thấu cảm (Customer-centric) với khách hàng B2B.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => handleOpenDocument('M01_Bai01.pdf')}
            disabled={loadingFile === 'M01_Bai01.pdf'}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <BookOpen size={16}/> {loadingFile === 'M01_Bai01.pdf' ? 'Đang tải...' : 'Giáo án PDF'}
          </button>
          <button 
            onClick={() => handleOpenVideo('M01_Video01.mp4')}
            disabled={loadingVideo === 'M01_Video01.mp4'}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <Play size={16}/> {loadingVideo === 'M01_Video01.mp4' ? 'Đang tải...' : 'Video Tổng kết'}
          </button>
        </div>
      </div>
      
      {/* BÀI 02 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '12px', fontSize: '1.1rem' }}>
          Bài 02 - 5 Phase sales, 4 Trụ cột năng lực
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
          Nắm vững 5 giai đoạn của một chu trình Sales B2B tiêu chuẩn và tự đánh giá bản thân qua 4 trụ cột năng lực cốt lõi để vẽ nên Radar Chart của riêng bạn.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => handleOpenDocument('M01_Bai02.pdf')}
            disabled={loadingFile === 'M01_Bai02.pdf'}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <BookOpen size={16}/> {loadingFile === 'M01_Bai02.pdf' ? 'Đang tải...' : 'Giáo án PDF'}
          </button>
          <button 
            onClick={() => handleOpenVideo('M01_Video02.mp4')}
            disabled={loadingVideo === 'M01_Video02.mp4'}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <Play size={16}/> {loadingVideo === 'M01_Video02.mp4' ? 'Đang tải...' : 'Video Tổng kết'}
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
        
        <button 
          onClick={handleCopyPrompt}
          className="btn"
          style={{ 
            position: 'absolute', top: '8px', right: '8px',
            background: 'rgba(255,255,255,0.1)', border: 'none',
            padding: '6px 12px', borderRadius: '4px',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '0.75rem', color: 'var(--text-primary)', cursor: 'pointer'
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
          display: 'block', textAlign: 'center', background: 'var(--accent-warning)', 
          color: 'var(--bg-primary)', fontWeight: 'bold', padding: '12px'
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
        moduleTitle="M01: Lộ trình & Năng lực lõi"
        learningContent={learningContent}
        formContent={<M1_CompetencyForm />}
        aiTutorContent={aiTutorContent}
        previewUrl={previewUrl}
        onClosePreview={() => setPreviewUrl(null)}
        headerActionNode={
          <button
            onClick={handleSubmit}
            disabled={!isValid || isLocked || isSubmitting}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              background: isLocked ? 'var(--accent-success)' : (isValid ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)'),
              color: isValid || isLocked ? '#fff' : 'rgba(255,255,255,0.3)',
              cursor: (!isValid || isLocked) ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            {isSubmitting ? 'Đang nộp...' : (isLocked ? <><Check size={16} /> Đã nộp bài</> : 'Xác nhận Nộp bài')}
          </button>
        }
      />

      {/* FLOATING PIP VIDEO PLAYER */}
      {pipVideoUrl && (
        <Rnd
          default={{
            x: window.innerWidth - 424 - 24, // 400px width + 24px padding + 24px scrollbar approx
            y: window.innerHeight - 225 - 24, // 225px height + 24px padding
            width: 400,
            height: 225,
          }}
          minWidth={320}
          minHeight={180}
          bounds="window"
          dragHandleClassName="drag-handle"
          style={{ zIndex: 9999 }}
        >
          <div style={{
            width: '100%',
            height: '100%',
            background: 'black',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            overflow: 'hidden',
            border: '2px solid var(--accent-primary)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* PiP Header (Nắm kéo / Nút Đóng) */}
            <div className="drag-handle" style={{
              background: 'var(--bg-secondary)',
              height: '32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 12px',
              cursor: 'move' // Nắm vào đây để kéo
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>▶️ Video Bài Giảng</span>
              <button 
                onClick={() => setPipVideoUrl(null)}
                onMouseDown={(e) => e.stopPropagation()} // Ngăn sự kiện drag khi bấm nút X
                onTouchStart={(e) => e.stopPropagation()}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={16} />
              </button>
            </div>
            {/* PiP Body (HTML5 Video) */}
            <div style={{ flex: 1, position: 'relative' }}>
              <video 
                src={pipVideoUrl} 
                controls
                autoPlay
                style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'black', outline: 'none' }}
              >
                Trình duyệt của bạn không hỗ trợ thẻ video.
              </video>
            </div>
          </div>
        </Rnd>
      )}

    </div>
  );
}
