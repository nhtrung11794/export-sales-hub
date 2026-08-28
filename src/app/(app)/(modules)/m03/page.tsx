'use client';

import React, { useState, useEffect } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import M03_CombinedForm from '@/components/modules/m03/M03_CombinedForm';
import { createClient } from '@/lib/supabase/client';
import { useModuleStore } from '@/store/useModuleStore';
import { Play, BookOpen, X, Sparkles, Copy, Check } from 'lucide-react';
import { Rnd } from 'react-rnd';

import { openCourseSlide, GOOGLE_DRIVE_SLIDES_ROOT, COURSE_MATERIALS, getLessonSlideEmbedUrl, getLessonStandardFileName, getLessonVideoEmbedUrl } from '@/lib/courseMaterials';

export default function M03Page() {
  const supabase = createClient();
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [pipVideoUrl, setPipVideoUrl] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const { getModuleData, submitModule, unlockModule, submissions } = useModuleStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, [supabase.auth]);

  useEffect(() => {
    const interval = setInterval(() => {
      const data = getModuleData('M03');
      const submission = submissions['M03'];
      if (submission) {
        setIsLocked(submission.is_locked);
      }
      
      if (data) {
        const isDraftValid = (data.leads && data.leads.length > 0) || Boolean(data.b07_qualification);
        setIsValid(!!isDraftValid);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [getModuleData, submissions]);

  const handleSubmit = async () => {
    if (!userId || !isValid || isLocked) return;
    setIsSubmitting(true);
    const result = await submitModule('M03', userId);
    if (result.success) {
      alert('Nộp bài thành công! Module 04 đã được mở khóa.');
    } else {
      alert('Có lỗi xảy ra khi nộp bài. Chi tiết lỗi: ' + result.error);
    }
    setIsSubmitting(false);
  };

  const handleUnlock = async () => {
    if (!userId) return;
    setIsSubmitting(true);
    const result = await unlockModule('M03', userId);
    if (result.success) {
      alert('Đã mở khóa bài làm để sửa. Lưu ý: Module tiếp theo có thể tạm thời bị khóa lại cho đến khi bạn nộp bài.');
    } else {
      alert('Có lỗi xảy ra khi mở khóa: ' + result.error);
    }
    setIsSubmitting(false);
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

  const handleCopyPrompt = async (text: string, id: string, externalUrl?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPrompt(id);
      setTimeout(() => setCopiedPrompt(null), 3000);
      if (externalUrl) {
        window.open(externalUrl, '_blank');
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const promptSpark = `"Hãy đóng vai chuyên gia Market Intelligence. Tôi đang xuất khẩu mặt hàng Nông sản/Thực phẩm chế biến sang thị trường Mỹ/EU. Hãy tìm giúp tôi 5 Nhà nhập khẩu / B2B Wholesaler tiềm năng kèm: Tên công ty, Website, Quy mô ước tính, và Lý do họ cần mua từ Việt Nam."`;
  
  const promptFollowUp = `"Đóng vai Giám đốc Kinh doanh B2B Export kỳ cựu, một khách hàng tiềm năng đã nhận Báo giá từ 14 ngày trước nhưng đang im lặng. Hãy gợi ý cho tôi 3 kịch bản Email Follow-up mang lại giá trị gia tăng (Value-add / Market Intelligence) để hâm nóng cuộc hội thoại mà tuyệt đối KHÔNG dùng câu giục ép 'Anh chị đã xem giá chưa'."`;
  
  const promptColdEmail = `"Dựa trên chân dung khách hàng ICP và Nỗi đau Buyer vừa phân tích, hãy viết giúp tôi 1 Cold Email tiếp cận B2B ngắn gọn (dưới 150 từ), không mang giọng điệu chào hàng dạo mà tập trung vào giải pháp giải quyết vấn đề đứt gãy chuỗi cung ứng cho họ."`;

  const learningContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.25)' }}>
        <span style={{ fontSize: '0.8rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '6px' }}>
          📁 <strong>Kho Slide Bài Giảng:</strong> Chuẩn hóa M01_B01 đến M05_B15
        </span>
        <a href={GOOGLE_DRIVE_SLIDES_ROOT} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
          Mở Thư Mục Google Drive ➔
        </a>
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '8px', fontSize: '1.05rem', fontWeight: 'bold' }}>
          {COURSE_MATERIALS.B06.title}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
          {COURSE_MATERIALS.B06.description}
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => handleOpenDocument('B06')}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <BookOpen size={14}/> 📖 Slide Bài Giảng
          </button>
          <button 
            onClick={() => handleOpenVideo(COURSE_MATERIALS.B06.videoFileName || 'M03_Video06.mp4', 'B06')}
            disabled={loadingVideo === COURSE_MATERIALS.B06.videoFileName}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <Play size={14}/> {loadingVideo === COURSE_MATERIALS.B06.videoFileName ? 'Đang tải...' : 'Video Tổng kết'}
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '8px', fontSize: '1.05rem', fontWeight: 'bold' }}>
          {COURSE_MATERIALS.B07.title}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
          {COURSE_MATERIALS.B07.description}
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => handleOpenDocument('B07')}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <BookOpen size={14}/> 📖 Slide Bài Giảng
          </button>
          <button 
            onClick={() => handleOpenVideo(COURSE_MATERIALS.B07.videoFileName || 'M03_Video07.mp4', 'B07')}
            disabled={loadingVideo === COURSE_MATERIALS.B07.videoFileName}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <Play size={14}/> {loadingVideo === COURSE_MATERIALS.B07.videoFileName ? 'Đang tải...' : 'Video Tổng kết'}
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '8px', fontSize: '1.05rem', fontWeight: 'bold' }}>
          {COURSE_MATERIALS.B08.title}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
          {COURSE_MATERIALS.B08.description}
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => handleOpenDocument('B08')}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <BookOpen size={14}/> 📖 Slide Bài Giảng
          </button>
          <button 
            onClick={() => handleOpenVideo(COURSE_MATERIALS.B08.videoFileName || 'M03_Video08.mp4', 'B08')}
            disabled={loadingVideo === COURSE_MATERIALS.B08.videoFileName}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <Play size={14}/> {loadingVideo === COURSE_MATERIALS.B08.videoFileName ? 'Đang tải...' : 'Video Tổng kết'}
          </button>
        </div>
      </div>
    </div>
  );

  const aiTutorContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* PROMPT 1: GEMINI SPARK */}
      <div className="glass-panel" style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={18} color="#10b981" />
          <h4 style={{ color: '#10b981', fontSize: '0.95rem', fontWeight: 'bold', margin: 0 }}>
            Gemini Spark: Cào Danh Sách Lead B2B
          </h4>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.4' }}>
          Tự động tìm kiếm và định dạng danh sách 5 nhà nhập khẩu mục tiêu theo ngành hàng.
        </p>
        <button
          onClick={() => handleCopyPrompt(promptSpark, 'spark', 'https://gemini.google.com/app')}
          className="btn btn-primary"
          style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px', background: '#059669', borderColor: '#059669' }}
        >
          {copiedPrompt === 'spark' ? <><Check size={14} /> Đã Copy Prompt & Mở Gemini</> : <><Copy size={14} /> Copy Prompt Tìm Lead</>}
        </button>
      </div>

      {/* PROMPT 2: NOTEBOOKLM FOLLOW-UP TUTOR */}
      <div className="glass-panel" style={{ padding: '20px', background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={18} color="var(--accent-primary)" />
          <h4 style={{ color: 'var(--accent-primary)', fontSize: '0.95rem', fontWeight: 'bold', margin: 0 }}>
            Trợ lý Follow-up: Xử lý Deal Treo
          </h4>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.4' }}>
          Gợi ý kịch bản mở lời hâm nóng khi khách hàng im lặng sau báo giá.
        </p>
        <button
          onClick={() => handleCopyPrompt(promptFollowUp, 'followup', 'https://notebook.google.com/notebook/3fdec64c-7c4e-4ca7-839e-41e69429efd8')}
          className="btn btn-primary"
          style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px' }}
        >
          {copiedPrompt === 'followup' ? <><Check size={14} /> Đã Copy & Mở NotebookLM</> : <><Copy size={14} /> Copy Prompt Follow-up</>}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Module 03: Prospecting & Opportunity Management
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Kỹ năng Prospecting, Sàng lọc Lead, Chấm điểm F-N-A-C-M và Quản trị Vòng đời Sales Pipeline
        </p>
      </header>

      <ModuleLayout 
        moduleTitle="Module 03: Phát triển Cơ hội & Quản trị Pipeline"
        learningContent={learningContent}
        formContent={<M03_CombinedForm />}
        aiTutorContent={aiTutorContent}
        previewUrl={previewUrl}
        previewTitle={previewTitle}
        onClosePreview={() => setPreviewUrl(null)}
        headerActionNode={
          isLocked ? (
            <button
              onClick={handleUnlock}
              disabled={isSubmitting}
              className="btn btn-warning"
              style={{ fontWeight: 'bold' }}
            >
              {isSubmitting ? 'Đang mở khóa...' : 'Mở Khóa để Sửa'}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ fontWeight: 'bold' }}
            >
              {isSubmitting ? 'Đang nộp...' : 'Xác nhận Nộp bài'}
            </button>
          )
        }
      />

      {pipVideoUrl && (
        <Rnd
          default={{ x: window.innerWidth - 448, y: window.innerHeight - 249, width: 400, height: 225 }}
          minWidth={320} minHeight={180} bounds="window" dragHandleClassName="drag-handle"
          style={{ zIndex: 9999 }}
        >
          <div style={{
            width: '100%', height: '100%', background: 'black', borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', overflow: 'hidden',
            border: '2px solid var(--accent-primary)', display: 'flex', flexDirection: 'column'
          }}>
            <div className="drag-handle" style={{
              background: 'var(--bg-secondary)', height: '32px', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center', padding: '0 12px', cursor: 'move'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>▶️ Video Bài Giảng M03</span>
              <button 
                onClick={() => setPipVideoUrl(null)} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
            {/* PiP Body (Hybrid: Google Drive/YouTube Iframe or HTML5 Video) */}
            <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
              {pipVideoUrl.includes('drive.google.com') || pipVideoUrl.includes('youtube.com') || pipVideoUrl.includes('/preview') ? (
                <iframe
                  src={pipVideoUrl}
                  title="Video Bài Giảng M03"
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
                />
              )}
            </div>
          </div>
        </Rnd>
      )}
    </div>
  );
}
