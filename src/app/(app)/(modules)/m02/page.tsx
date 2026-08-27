'use client';

import React, { useState, useEffect } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import M02_CombinedForm from '@/components/modules/m02/M02_CombinedForm';
import GeminiSparkCard from '@/components/ai-tutors/GeminiSparkCard';
import GPTResearchCard from '@/components/ai-tutors/GPTResearchCard';
import { createClient } from '@/lib/supabase/client';
import { useModuleStore } from '@/store/useModuleStore';
import { Play, BookOpen, X } from 'lucide-react';
import { Rnd } from 'react-rnd';

import { openCourseSlide, GOOGLE_DRIVE_SLIDES_ROOT, COURSE_MATERIALS } from '@/lib/courseMaterials';

export default function M02Page() {
  const supabase = createClient();
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Trạng thái cho Video PiP
  const [pipVideoUrl, setPipVideoUrl] = useState<string | null>(null);
  
  const { getModuleData, submitModule, unlockModule, submissions } = useModuleStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Hook to check auth user id
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, [supabase.auth]);

  useEffect(() => {
    const interval = setInterval(() => {
      const data = getModuleData('M02');
      const submission = submissions['M02'];
      if (submission) {
        setIsLocked(submission.is_locked);
      }
      
      // Simple validation for M02: Form Quyết định (B03) is required + at least 1 insight in B05
      if (data) {
        const isDraftValid = data.target_market?.trim().length > 0 && 
                             data.route_to_market?.trim().length > 0 && 
                             data.strategic_reason?.trim().length > 0 && 
                             (data.discovery_matrix?.need?.hypothesis?.trim().length > 0 || data.discovery_matrix?.need?.insight?.trim().length > 0);
        setIsValid(!!isDraftValid);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [getModuleData, submissions]);

  const handleSubmit = async () => {
    if (!userId || !isValid || isLocked) return;
    setIsSubmitting(true);
    const result = await submitModule('M02', userId);
    if (result.success) {
      alert('Nộp bài thành công! Module 03 đã được mở khóa.');
    } else {
      alert('Có lỗi xảy ra khi nộp bài. Chi tiết lỗi: ' + result.error);
    }
    setIsSubmitting(false);
  };

  const handleUnlock = async () => {
    if (!userId) return;
    setIsSubmitting(true);
    const result = await unlockModule('M02', userId);
    if (result.success) {
      alert('Đã mở khóa bài làm để sửa. Lưu ý: Module tiếp theo có thể tạm thời bị khóa lại cho đến khi bạn nộp bài.');
    } else {
      alert('Có lỗi xảy ra khi mở khóa: ' + result.error);
    }
    setIsSubmitting(false);
  };

  const handleOpenDocument = (lessonId: string) => {
    openCourseSlide(lessonId);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner Thư mục Slide */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.25)' }}>
        <span style={{ fontSize: '0.8rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '6px' }}>
          📁 <strong>Kho Slide Bài Giảng:</strong> Chuẩn hóa M01_B01 đến M05_B15
        </span>
        <a href={GOOGLE_DRIVE_SLIDES_ROOT} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
          Mở Thư Mục Google Drive ➔
        </a>
      </div>

      {/* BÀI 03 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '12px', fontSize: '1.1rem' }}>
          {COURSE_MATERIALS.B03.title}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
          {COURSE_MATERIALS.B03.description}
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => handleOpenDocument('B03')}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <BookOpen size={16}/> 📖 Slide Bài Giảng
          </button>
          <button 
            onClick={() => handleOpenVideo(COURSE_MATERIALS.B03.videoFileName || 'M02_Video03.mp4')}
            disabled={loadingVideo === COURSE_MATERIALS.B03.videoFileName}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <Play size={16}/> {loadingVideo === COURSE_MATERIALS.B03.videoFileName ? 'Đang tải...' : 'Video Tổng kết'}
          </button>
        </div>
      </div>
      
      {/* BÀI 04 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '12px', fontSize: '1.1rem' }}>
          {COURSE_MATERIALS.B04.title}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
          {COURSE_MATERIALS.B04.description}
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => handleOpenDocument('B04')}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <BookOpen size={16}/> 📖 Slide Bài Giảng
          </button>
          <button 
            onClick={() => handleOpenVideo(COURSE_MATERIALS.B04.videoFileName || 'M02_Video04.mp4')}
            disabled={loadingVideo === COURSE_MATERIALS.B04.videoFileName}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <Play size={16}/> {loadingVideo === COURSE_MATERIALS.B04.videoFileName ? 'Đang tải...' : 'Video Tổng kết'}
          </button>
        </div>
      </div>

      {/* BÀI 05 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '12px', fontSize: '1.1rem' }}>
          {COURSE_MATERIALS.B05.title}
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem', lineHeight: '1.5' }}>
          {COURSE_MATERIALS.B05.description}
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => handleOpenDocument('B05')}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <BookOpen size={16}/> 📖 Slide Bài Giảng
          </button>
          <button 
            onClick={() => handleOpenVideo(COURSE_MATERIALS.B05.videoFileName || 'M02_Video05.mp4')}
            disabled={loadingVideo === COURSE_MATERIALS.B05.videoFileName}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <Play size={16}/> {loadingVideo === COURSE_MATERIALS.B05.videoFileName ? 'Đang tải...' : 'Video Tổng kết'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Module 02: Market & Customer Understanding</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Phân tích định vị thị trường, thiết lập sơ đồ mua hàng và xác định ICP cốt lõi</p>
      </header>

      <ModuleLayout 
        moduleTitle="Module 02: Thị trường & Khách hàng (ICP)"
        learningContent={learningContent}
        formContent={<M02_CombinedForm />}
        aiTutorContent={
          <>
            <GeminiSparkCard />
            <GPTResearchCard />
          </>
        }
        previewUrl={previewUrl}
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
            x: window.innerWidth - 424 - 24,
            y: window.innerHeight - 225 - 24,
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
            <div className="drag-handle" style={{
              background: 'var(--bg-secondary)',
              height: '32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 12px',
              cursor: 'move'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>▶️ Video Bài Giảng M02</span>
              <button 
                onClick={() => setPipVideoUrl(null)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={16} />
              </button>
            </div>
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
