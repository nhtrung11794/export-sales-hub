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

import { openCourseSlide, GOOGLE_DRIVE_SLIDES_ROOT, COURSE_MATERIALS, getLessonSlideEmbedUrl, getLessonStandardFileName, getLessonVideoEmbedUrl } from '@/lib/courseMaterials';

export default function M02Page() {
  const supabase = createClient();
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  
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
    const submission = submissions['M02'];
    if (submission) {
      setIsLocked(Boolean(submission.is_locked || submission.status === 'submitted'));
    }
    const data = getModuleData('M02');
    if (data) {
      const isDraftValid = Boolean(
        (data.target_market?.trim() || data.strategic_reason?.trim() || data.route_to_market?.trim()) &&
        (data.discovery_matrix?.need?.core_hypothesis?.trim() || 
         data.discovery_matrix?.need?.surface_signal?.trim() || 
         data.discovery_matrix?.context?.core_hypothesis?.trim() ||
         data.discovery_matrix?.pain?.core_hypothesis?.trim() ||
         data.icp_industry?.trim() ||
         data.icp_size?.trim())
      );
      setIsValid(isDraftValid);
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
    let currentData = getModuleData('M02');
    if (!currentData || Object.keys(currentData).length === 0) {
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem('module_draft_M02');
          if (cached) currentData = JSON.parse(cached);
        } catch (e) {
          console.warn('Lỗi đọc cache M02:', e);
        }
      }
    }

    // 4. Validate with explicit feedback
    const isDraftValid = Boolean(
      (currentData?.target_market?.trim() || currentData?.strategic_reason?.trim() || currentData?.route_to_market?.trim() || currentData?.selected_market) &&
      (currentData?.discovery_matrix?.need?.core_hypothesis?.trim() || 
       currentData?.discovery_matrix?.need?.surface_signal?.trim() || 
       currentData?.discovery_matrix?.context?.core_hypothesis?.trim() ||
       currentData?.discovery_matrix?.pain?.core_hypothesis?.trim() ||
       currentData?.icp_industry?.trim() ||
       currentData?.icp_size?.trim() ||
       currentData?.buyer_persona)
    );

    if (!isDraftValid) {
      alert('Vui lòng hoàn thành ít nhất thông tin Thị trường mục tiêu hoặc Ma trận Khám phá nhu cầu (B03 / B04 / B05) trước khi nộp bài.');
      return;
    }

    const confirmSubmit = window.confirm('Bạn có chắc chắn muốn nộp bài Module 02? Sau khi nộp, bài tập sẽ được chuyển sang trạng thái "Đã nộp" để Giảng viên chấm điểm.');
    if (!confirmSubmit) return;

    setIsSubmitting(true);
    try {
      const result = await submitModule('M02', currentUserId, currentData);
      if (result.success) {
        setIsLocked(true);
        const statusBar = document.getElementById('status-bar');
        if (statusBar) {
          statusBar.textContent = 'Trạng thái: 📝 Đã nộp bài (Chờ chấm)';
          statusBar.style.color = 'var(--accent-primary, #38bdf8)';
        }
        alert('🎉 Chúc mừng! Nộp bài Module 02 thành công!\nModule 03 (Phát triển Cơ hội & Quản trị Pipeline) đã được mở khóa.');
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

    const confirmUnlock = window.confirm('Bạn có chắc chắn muốn mở khóa để chỉnh sửa bài Module 02?');
    if (!confirmUnlock) return;

    setIsSubmitting(true);
    try {
      const result = await unlockModule('M02', currentUserId);
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

      {/* BÀI 03 */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '6px', fontSize: '0.92rem', fontWeight: 700, lineHeight: '1.35' }}>
          {COURSE_MATERIALS.B03.title}
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
          {COURSE_MATERIALS.B03.description}
        </p>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            onClick={() => handleOpenDocument('B03')}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.74rem', padding: '6px 4px' }}
          >
            <BookOpen size={13}/> Slide
          </button>
          <button 
            onClick={() => handleOpenVideo(COURSE_MATERIALS.B03.videoFileName || 'M02_Video03.mp4', 'B03')}
            disabled={loadingVideo === COURSE_MATERIALS.B03.videoFileName}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.74rem', padding: '6px 4px' }}
          >
            <Play size={13}/> {loadingVideo === COURSE_MATERIALS.B03.videoFileName ? 'Đang tải...' : 'Video'}
          </button>
        </div>
      </div>
      
      {/* BÀI 04 */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '6px', fontSize: '0.92rem', fontWeight: 700, lineHeight: '1.35' }}>
          {COURSE_MATERIALS.B04.title}
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
          {COURSE_MATERIALS.B04.description}
        </p>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            onClick={() => handleOpenDocument('B04')}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.74rem', padding: '6px 4px' }}
          >
            <BookOpen size={13}/> Slide
          </button>
          <button 
            onClick={() => handleOpenVideo(COURSE_MATERIALS.B04.videoFileName || 'M02_Video04.mp4', 'B04')}
            disabled={loadingVideo === COURSE_MATERIALS.B04.videoFileName}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.74rem', padding: '6px 4px' }}
          >
            <Play size={13}/> {loadingVideo === COURSE_MATERIALS.B04.videoFileName ? 'Đang tải...' : 'Video'}
          </button>
        </div>
      </div>

      {/* BÀI 05 */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '6px', fontSize: '0.92rem', fontWeight: 700, lineHeight: '1.35' }}>
          {COURSE_MATERIALS.B05.title}
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '0.78rem', lineHeight: '1.4' }}>
          {COURSE_MATERIALS.B05.description}
        </p>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            onClick={() => handleOpenDocument('B05')}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.74rem', padding: '6px 4px' }}
          >
            <BookOpen size={13}/> Slide
          </button>
          <button 
            onClick={() => handleOpenVideo(COURSE_MATERIALS.B05.videoFileName || 'M02_Video05.mp4', 'B05')}
            disabled={loadingVideo === COURSE_MATERIALS.B05.videoFileName}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.74rem', padding: '6px 4px' }}
          >
            <Play size={13}/> {loadingVideo === COURSE_MATERIALS.B05.videoFileName ? 'Đang tải...' : 'Video'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '10px 14px', height: '100vh', maxHeight: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <header style={{ marginBottom: '8px', flexShrink: 0 }}>
        <h1 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: '0 0 2px 0', fontWeight: 800 }}>Module 02: Market & Customer Understanding</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', margin: 0 }}>Phân tích định vị thị trường, thiết lập sơ đồ mua hàng và xác định ICP cốt lõi</p>
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
            {/* PiP Body (Hybrid: Google Drive/YouTube Iframe or HTML5 Video) */}
            <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
              {pipVideoUrl.includes('drive.google.com') || pipVideoUrl.includes('youtube.com') || pipVideoUrl.includes('/preview') ? (
                <iframe
                  src={pipVideoUrl}
                  title="Video Bài Giảng M02"
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
