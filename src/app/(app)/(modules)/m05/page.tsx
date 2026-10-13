'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Check, Copy, Play, Sparkles, X } from 'lucide-react';
import { Rnd } from 'react-rnd';
import ModuleLayout from '@/components/layout/ModuleLayout';
import M05_CombinedForm, { isB13Complete, isB14Complete, isB15Complete, M05FormData } from '@/components/modules/m05/M05_CombinedForm';
import { createClient } from '@/lib/supabase/client';
import { useModuleStore } from '@/store/useModuleStore';

import { openCourseSlide, GOOGLE_DRIVE_SLIDES_ROOT, COURSE_MATERIALS, getLessonSlideEmbedUrl, getLessonStandardFileName, getLessonVideoEmbedUrl } from '@/lib/courseMaterials';

const LESSONS = [
  { lessonKey: 'B13', id: 13, title: COURSE_MATERIALS.B13.title, description: COURSE_MATERIALS.B13.description, pdf: COURSE_MATERIALS.B13.standardFileName, video: COURSE_MATERIALS.B13.videoFileName || 'M05_Video13.mp4' },
  { lessonKey: 'B14', id: 14, title: COURSE_MATERIALS.B14.title, description: COURSE_MATERIALS.B14.description, pdf: COURSE_MATERIALS.B14.standardFileName, video: COURSE_MATERIALS.B14.videoFileName || 'M05_Video14.mp4' },
  { lessonKey: 'B15', id: 15, title: COURSE_MATERIALS.B15.title, description: COURSE_MATERIALS.B15.description, pdf: COURSE_MATERIALS.B15.standardFileName, video: COURSE_MATERIALS.B15.videoFileName || 'M05_Video15.mp4' },
];

export default function M05Page() {
  const supabase = useMemo(() => createClient(), []);
  const { submitModule, unlockModule, submissions, getModuleData } = useModuleStore();
  const [loadingVideo, setLoadingVideo] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [pipVideoUrl, setPipVideoUrl] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const isLocked = Boolean(submissions.M05?.is_locked || submissions.M05?.status === 'submitted');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, [supabase]);

  const handleOpenDocument = (lessonKey: string) => {
    const embedUrl = getLessonSlideEmbedUrl(lessonKey);
    const fileName = getLessonStandardFileName(lessonKey);
    const material = COURSE_MATERIALS[lessonKey];
    setPreviewTitle(`${fileName} — ${material?.title || 'Slide Bài Giảng'}`);
    setPreviewUrl(embedUrl);
  };

  const handleOpenVideo = async (fileName: string, lessonKey?: string) => {
    if (lessonKey) {
      const embedUrl = getLessonVideoEmbedUrl(lessonKey);
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
      const { data, error } = await supabase.storage.from('course_materials').createSignedUrl(fileName, 3600);
      if (error) throw error;
      setPipVideoUrl(data.signedUrl);
    } catch {
      window.alert('Video chưa được tải lên kho lưu trữ.');
    } finally {
      setLoadingVideo(null);
    }
  };

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
    let currentData = getModuleData('M05');
    if (!currentData || Object.keys(currentData).length === 0) {
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem('module_draft_M05');
          if (cached) currentData = JSON.parse(cached);
        } catch (e) {
          console.warn('Lỗi đọc cache M05:', e);
        }
      }
    }

    // 4. Validate with explicit feedback
    const isDraftValid = Boolean(
      currentData?.b13_execution ||
      currentData?.b14_recovery?.bad_news_email?.trim() ||
      currentData?.b15_growth?.growth_objective?.trim() ||
      currentData?.execution ||
      currentData?.recovery
    );

    if (!isDraftValid) {
      alert('Vui lòng hoàn thành ít nhất Kế hoạch Bàn giao (B13), Phương án Khủng hoảng (B14) hoặc Kế hoạch Tăng trưởng (B15) trước khi nộp bài.');
      return;
    }

    const confirmSubmit = window.confirm('Bạn có chắc chắn muốn nộp bài Module 05? Sau khi nộp, bài tập sẽ được chuyển sang trạng thái "Đã nộp" để Giảng viên chấm điểm.');
    if (!confirmSubmit) return;

    setIsSubmitting(true);
    try {
      const result = await submitModule('M05', currentUserId, currentData);
      if (result.success) {
        const statusBar = document.getElementById('status-bar');
        if (statusBar) {
          statusBar.textContent = 'Trạng thái: 📝 Đã nộp bài (Chờ chấm)';
          statusBar.style.color = 'var(--accent-primary, #38bdf8)';
        }
        alert('🎉 Chúc mừng! Nộp bài Module 05 thành công!\nKhoang Final Capstone đã được mở khóa.');
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

    const confirmUnlock = window.confirm('Bạn có chắc chắn muốn mở khóa để chỉnh sửa bài Module 05?');
    if (!confirmUnlock) return;

    setIsSubmitting(true);
    try {
      const result = await unlockModule('M05', currentUserId);
      if (result.success) {
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

  const m05 = submissions.M05?.form_data as Partial<M05FormData> | undefined;

  const prompts = [
    {
      id: 'sla-risk',
      title: 'Handover & SLA Coach',
      text: 'Đóng vai Trưởng phòng Quản lý Đơn hàng (Order Fulfillment Manager). Rà soát checklist bàn giao và milestone của tôi. Chỉ ra 2 điểm mù có thể gây chậm tiến độ hoặc vỡ cam kết với buyer và đề xuất phương án phòng ngừa.',
    },
    {
      id: 'capa-crisis',
      title: 'Crisis Recovery Expert',
      text: `Đóng vai Giám đốc Điều hành XNK. Tôi vừa gặp sự cố: ${m05?.b14_recovery?.scenario_title || 'Giao trễ và phát hiện độ ẩm vượt chuẩn'}. Hãy phản biện kế hoạch CAPA (Containment 24h, 5-Why root cause, Preventive action) và rà soát Bad News Email để không bị buyer phạt hợp đồng.`,
    },
    {
      id: 'growth-jbp',
      title: 'Strategic Account Coach',
      text: `Đóng vai Strategic Account Director. Share of Wallet hiện tại là ${m05?.b15_growth?.current_wallet_share ?? 0}% và tiềm năng tăng trưởng ${m05?.b15_growth?.growth_potential ?? 0}%. Hãy đề xuất JBP 90 ngày gồm 3 joint initiatives, KPI hai bên và bản đồ quan hệ đa tầng.`,
    },
  ];

  const handleCopyPrompt = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPrompt(id);
      window.setTimeout(() => setCopiedPrompt(null), 2500);
      window.open('https://notebook.google.com/notebook/3fdec64c-7c4e-4ca7-839e-41e69429efd8', '_blank', 'noopener,noreferrer');
    } catch {
      window.alert('Không thể sao chép prompt. Vui lòng kiểm tra quyền Clipboard của trình duyệt.');
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

      {LESSONS.map(lesson => (
        <div key={lesson.id} className="glass-panel" style={{ padding: '14px' }}>
          <div style={{ color: 'var(--accent-primary)', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '.08em', marginBottom: 4 }}>BÀI {lesson.id.toString().padStart(2, '0')}</div>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, lineHeight: '1.35', marginBottom: 6 }}>{lesson.title}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.4, marginBottom: 12 }}>{lesson.description}</p>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn-secondary" onClick={() => handleOpenDocument(lesson.lessonKey)} style={{ flex: 1, gap: 4, fontSize: '0.74rem', padding: '6px 4px' }}>
              <BookOpen size={13} /> Slide
            </button>
            <button className="btn btn-primary" disabled={loadingVideo === lesson.video} onClick={() => handleOpenVideo(lesson.video, lesson.lessonKey)} style={{ flex: 1, gap: 4, fontSize: '0.74rem', padding: '6px 4px' }}>
              <Play size={13} /> {loadingVideo === lesson.video ? 'Đang tải...' : 'Video'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const aiTutorContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
      {prompts.map(prompt => (
        <div key={prompt.id} className="glass-panel" style={{ padding: 18, background: 'rgba(59,130,246,.05)', borderColor: 'rgba(59,130,246,.2)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--accent-primary)', fontSize: '.9rem', marginBottom: 8 }}><Sparkles size={17} /> {prompt.title}</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.77rem', lineHeight: 1.45, marginBottom: 12 }}>{prompt.text.slice(0, 120)}...</p>
          <button className="btn btn-primary" onClick={() => handleCopyPrompt(prompt.text, prompt.id)} style={{ width: '100%', gap: 6, fontSize: '.78rem' }}>
            {copiedPrompt === prompt.id ? <><Check size={14} /> Đã copy & mở AI</> : <><Copy size={14} /> Copy Prompt</>}
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ padding: '10px 14px', height: '100vh', maxHeight: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <header style={{ marginBottom: '8px', flexShrink: 0 }}>
        <div style={{ color: '#10b981', fontSize: '.68rem', fontWeight: 900, letterSpacing: '.1em', marginBottom: 2 }}>FINAL OPERATING SYSTEM</div>
        <h1 style={{ fontSize: '1.25rem', margin: '0 0 2px 0', fontWeight: 800 }}>Module 05: Execution, Recovery & Account Growth</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', margin: 0 }}>Chốt đơn là điểm bắt đầu của trải nghiệm thực thi — nơi trust được bảo vệ và tăng trưởng tài khoản được thiết kế.</p>
      </header>

      <ModuleLayout
        moduleTitle="Module 05: Execution, Recovery & Account Growth"
        learningContent={learningContent}
        formContent={<M05_CombinedForm />}
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
        <Rnd default={{ x: window.innerWidth - 448, y: window.innerHeight - 249, width: 400, height: 225 }} minWidth={320} minHeight={180} bounds="window" dragHandleClassName="m05-video-handle" style={{ zIndex: 9999 }}>
          <div style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: 12, background: '#000', border: '2px solid #10b981', boxShadow: '0 25px 50px rgba(0,0,0,.65)' }}>
            <div className="m05-video-handle" style={{ height: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 11px', cursor: 'move', background: 'var(--bg-secondary)' }}>
              <span style={{ fontSize: '.76rem', color: 'var(--text-secondary)' }}>▶ Video Bài giảng M05</span>
              <button onClick={() => setPipVideoUrl(null)} onMouseDown={event => event.stopPropagation()} aria-label="Đóng video" style={{ border: 0, background: 'transparent', color: 'white', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            {/* PiP Body (Hybrid: Google Drive/YouTube Iframe or HTML5 Video) */}
            <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
              {pipVideoUrl.includes('drive.google.com') || pipVideoUrl.includes('youtube.com') || pipVideoUrl.includes('/preview') ? (
                <iframe
                  src={pipVideoUrl}
                  title="Video Bài Giảng M05"
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                  allowFullScreen
                  style={{ width: '100%', height: '100%', border: 0, background: '#000' }}
                />
              ) : (
                <video src={pipVideoUrl} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'black', outline: 'none' }} />
              )}
            </div>
          </div>
        </Rnd>
      )}
    </div>
  );
}
