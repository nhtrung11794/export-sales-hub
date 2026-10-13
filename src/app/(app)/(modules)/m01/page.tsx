'use client';

import React, { useState, useEffect } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import M1_CompetencyForm from '@/components/modules/m01/M1_CompetencyForm';
import { createClient } from '@/lib/supabase/client';
import { useModuleStore } from '@/store/useModuleStore';
import { Copy, Check, Play, BookOpen, X } from 'lucide-react';
import { Rnd } from 'react-rnd';

import { openCourseSlide, GOOGLE_DRIVE_SLIDES_ROOT, COURSE_MATERIALS, getLessonSlideEmbedUrl, getLessonStandardFileName, getLessonVideoEmbedUrl } from '@/lib/courseMaterials';

export default function M01Page() {
  const supabase = createClient();
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  
  // Trạng thái cho Video PiP
  const [pipVideoUrl, setPipVideoUrl] = useState<string | null>(null);
  
  const [isCopied, setIsCopied] = useState(false);
  const { getModuleData, submitModule, unlockModule, submissions } = useModuleStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Hook to check auth user id (needed for submit)
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, [supabase.auth]);

  // Extract real dynamic radar scores from zustand store
  const currentM01Data = getModuleData('M01');
  const radarScores = {
    market: currentM01Data?.competency_radar?.market_research || 3,
    prospecting: currentM01Data?.competency_radar?.prospecting_discovery || 3,
    pricing: currentM01Data?.competency_radar?.pricing_negotiation || 3,
    risk: currentM01Data?.competency_radar?.risk_management || 3,
    internal: currentM01Data?.competency_radar?.internal_claim || 3,
    crm: currentM01Data?.competency_radar?.crm_growth || 3,
  };

  useEffect(() => {
    const submission = submissions['M01'];
    if (submission) {
      setIsLocked(Boolean(submission.is_locked || submission.status === 'submitted'));
    }
    const data = getModuleData('M01');
    if (data) {
      const isDraftValid = (data.goal_90_days?.trim().length > 0 || data.goals_90_days?.trim().length > 0 || (data.mad_libs && Object.values(data.mad_libs).some(Boolean)));
      setIsValid(!!isDraftValid);
    }
  }, [submissions, getModuleData]);

  const handleSubmit = async () => {
    // 1. Resolve userId
    let currentUserId = userId;
    if (!currentUserId) {
      const { data: authData } = await supabase.auth.getUser();
      currentUserId = authData?.user?.id || null;
      if (currentUserId) setUserId(currentUserId);
    }
    if (!currentUserId) {
      alert('Không tìm thấy phiên đăng nhập. Vui lòng tải lại trang hoặc đăng nhập lại để nộp bài.');
      return;
    }

    // 2. Check if already locked
    if (isLocked) {
      alert('Bài làm đã được nộp và khóa trước đó. Nếu bạn muốn chỉnh sửa, vui lòng bấm nút "Mở Khóa để Sửa".');
      return;
    }

    // 3. Get current data
    let currentData = getModuleData('M01');
    if (!currentData || Object.keys(currentData).length === 0) {
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem('module_draft_M01');
          if (cached) currentData = JSON.parse(cached);
        } catch (e) {
          console.warn('Lỗi đọc cache M01:', e);
        }
      }
    }

    // 4. Validate with explicit feedback
    const isDraftValid = Boolean(
      currentData?.goal_90_days?.trim() ||
      currentData?.goals_90_days?.trim() ||
      (currentData?.mad_libs && Object.values(currentData.mad_libs).some(Boolean)) ||
      currentData?.competency_radar
    );

    if (!isDraftValid) {
      alert('Vui lòng điền Mục tiêu 90 ngày hoặc hoàn thành Bảng Đánh giá Năng lực trước khi nộp bài.');
      return;
    }

    const confirmSubmit = window.confirm('Bạn có chắc chắn muốn nộp bài Module 01? Sau khi nộp, bài tập sẽ được chuyển sang trạng thái "Đã nộp" để Giảng viên chấm điểm.');
    if (!confirmSubmit) return;

    setIsSubmitting(true);
    try {
      const result = await submitModule('M01', currentUserId, currentData);
      if (result.success) {
        setIsLocked(true);
        const statusBar = document.getElementById('status-bar');
        if (statusBar) {
          statusBar.textContent = 'Trạng thái: 📝 Đã nộp bài (Chờ chấm)';
          statusBar.style.color = 'var(--accent-primary, #38bdf8)';
        }
        alert('🎉 Chúc mừng! Nộp bài Module 01 thành công!\nModule 02 (Thấu hiểu Thị trường & Khách hàng) đã được mở khóa.');
      } else {
        alert('❌ Có lỗi xảy ra khi nộp bài: ' + (result.error || 'Vui lòng thử lại.'));
      }
    } catch (err: any) {
      alert('❌ Lỗi hệ thống: ' + (err.message || 'Không thể nộp bài.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlock = async () => {
    let currentUserId = userId;
    if (!currentUserId) {
      const { data: authData } = await supabase.auth.getUser();
      currentUserId = authData?.user?.id || null;
      if (currentUserId) setUserId(currentUserId);
    }
    if (!currentUserId) {
      alert('Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại.');
      return;
    }

    const confirmUnlock = window.confirm('Bạn có chắc chắn muốn mở khóa để chỉnh sửa bài Module 01?');
    if (!confirmUnlock) return;

    setIsSubmitting(true);
    try {
      const result = await unlockModule('M01', currentUserId);
      if (result.success) {
        setIsLocked(false);
        const statusBar = document.getElementById('status-bar');
        if (statusBar) {
          statusBar.textContent = 'Trạng thái: Bản nháp';
          statusBar.style.color = 'var(--text-muted, #94a3b8)';
        }
        alert('Đã mở khóa bài làm để sửa. Lưu ý: Sau khi chỉnh sửa, hãy bấm "Xác nhận Nộp bài" để cập nhật lại cho Giảng viên.');
      } else {
        alert('❌ Có lỗi xảy ra khi mở khóa: ' + (result.error || 'Vui lòng thử lại.'));
      }
    } catch (err: any) {
      alert('❌ Lỗi hệ thống: ' + (err.message || 'Không thể mở khóa.'));
    } finally {
      setIsSubmitting(false);
    }
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

  const handleOpenDocument = (lessonId: string) => {
    const embedUrl = getLessonSlideEmbedUrl(lessonId);
    const fileName = getLessonStandardFileName(lessonId);
    const material = COURSE_MATERIALS[lessonId];
    setPreviewTitle(`${fileName} — ${material?.title || 'Slide Bài Giảng'}`);
    setPreviewUrl(embedUrl);
  };

  const handleOpenVideo = async (fileName: string, lessonId?: string) => {
    if (lessonId) {
      const embedUrl = getLessonVideoEmbedUrl(lessonId);
      if (embedUrl) {
        setPipVideoUrl(embedUrl);
        return;
      }
    }

    if (fileName && (fileName.startsWith('http://') || fileName.startsWith('https://'))) {
      setPipVideoUrl(fileName);
      return;
    }

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
      alert('Không thể mở video. Vui lòng kiểm tra lại file video.');
    } finally {
      setLoadingVideo(null);
    }
  };

  const learningContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Banner Thư mục Slide */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.25)' }}>
        <span style={{ fontSize: '0.74rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '4px' }}>
          📁 <strong>Kho Slide:</strong> M01–M05
        </span>
        <a href={GOOGLE_DRIVE_SLIDES_ROOT} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
          Drive ➔
        </a>
      </div>
      
      {/* BÀI 01 */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '6px', fontSize: '0.92rem', fontWeight: 700, lineHeight: '1.35' }}>
          {COURSE_MATERIALS.B01.title}
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
          {COURSE_MATERIALS.B01.description}
        </p>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            onClick={() => handleOpenDocument('B01')}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.74rem', padding: '6px 4px' }}
          >
            <BookOpen size={13}/> Slide
          </button>
          <button 
            onClick={() => handleOpenVideo(COURSE_MATERIALS.B01.videoFileName || 'M01_Video01.mp4', 'B01')}
            disabled={loadingVideo === COURSE_MATERIALS.B01.videoFileName}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.74rem', padding: '6px 4px' }}
          >
            <Play size={13}/> {loadingVideo === COURSE_MATERIALS.B01.videoFileName ? 'Đang tải...' : 'Video'}
          </button>
        </div>
      </div>
      
      {/* BÀI 02 */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '6px', fontSize: '0.92rem', fontWeight: 700, lineHeight: '1.35' }}>
          {COURSE_MATERIALS.B02.title}
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
          {COURSE_MATERIALS.B02.description}
        </p>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            onClick={() => handleOpenDocument('B02')}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.74rem', padding: '6px 4px' }}
          >
            <BookOpen size={13}/> Slide
          </button>
          <button 
            onClick={() => handleOpenVideo(COURSE_MATERIALS.B02.videoFileName || 'M01_Video02.mp4', 'B02')}
            disabled={loadingVideo === COURSE_MATERIALS.B02.videoFileName}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.74rem', padding: '6px 4px' }}
          >
            <Play size={13}/> {loadingVideo === COURSE_MATERIALS.B02.videoFileName ? 'Đang tải...' : 'Video'}
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
        href="https://notebook.google.com/notebook/3fdec64c-7c4e-4ca7-839e-41e69429efd8" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="btn" 
        style={{ 
          display: 'block', textAlign: 'center', background: 'var(--accent-warning)', 
          color: 'var(--bg-primary)', fontWeight: 'bold', padding: '12px'
        }}
      >
        Mở NotebookLM Trợ Lý Toàn Khóa ➔
      </a>
    </div>
  );

  return (
    <div style={{ padding: '10px 14px', height: '100vh', maxHeight: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <header style={{ marginBottom: '8px', flexShrink: 0 }}>
        <h1 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: '0 0 2px 0', fontWeight: 800 }}>Module 01: Mindset & Foundation</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', margin: 0 }}>Mindset nền tảng Sales Xuất khẩu & Hồ sơ năng lực</p>
      </header>

      <ModuleLayout 
        moduleTitle="Module 01: BANI & Năng lực cốt lõi"
        learningContent={learningContent}
        formContent={<M1_CompetencyForm />}
        aiTutorContent={aiTutorContent}
        previewUrl={previewUrl}
        previewTitle={previewTitle}
        onClosePreview={() => setPreviewUrl(null)}
        headerActionNode={
          isLocked ? (
            <button
              onClick={handleUnlock}
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                backgroundColor: 'var(--accent-warning)',
                color: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                fontSize: '1rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              {isSubmitting ? 'Đang mở khóa...' : 'Mở Khóa để Sửa'}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              style={{
                padding: '10px 20px',
                backgroundColor: isValid ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: isValid ? '#fff' : 'var(--text-muted)',
                border: isValid ? 'none' : '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: isValid ? 'pointer' : 'not-allowed',
                opacity: isSubmitting ? 0.7 : 1,
                fontSize: '1rem',
                fontWeight: 'bold',
                boxShadow: isValid ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {isSubmitting ? 'Đang nộp...' : 'Xác nhận Nộp bài'}
            </button>
          )
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
            {/* PiP Body (Hybrid: Google Drive/YouTube Iframe or HTML5 Video) */}
            <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
              {pipVideoUrl.includes('drive.google.com') || pipVideoUrl.includes('youtube.com') || pipVideoUrl.includes('/preview') ? (
                <iframe
                  src={pipVideoUrl}
                  title="Video Bài Giảng"
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                  allowFullScreen
                  style={{ width: '100%', height: '100%', border: 0, background: '#000' }}
                />
              ) : (
                <video 
                  src={pipVideoUrl} 
                  controls
                  autoPlay
                  style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'black', outline: 'none' }}
                >
                  Trình duyệt của bạn không hỗ trợ thẻ video.
                </video>
              )}
            </div>
          </div>
        </Rnd>
      )}

    </div>
  );
}
