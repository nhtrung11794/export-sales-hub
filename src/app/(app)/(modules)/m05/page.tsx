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
  const { submitModule, unlockModule, submissions } = useModuleStore();
  const [loadingVideo, setLoadingVideo] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [pipVideoUrl, setPipVideoUrl] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const isLocked = submissions.M05?.is_locked || false;

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
    if (!userId || isLocked) return;
    setIsSubmitting(true);
    const result = await submitModule('M05', userId);
    if (result.success) {
      window.alert('✅ Nộp bài Module 05 thành công! Khoang Final Capstone đã được mở khóa.');
    } else {
      window.alert(`Không thể nộp bài: ${result.error}`);
    }
    setIsSubmitting(false);
  };

  const handleUnlock = async () => {
    if (!userId) return;
    setIsSubmitting(true);
    const result = await unlockModule('M05', userId);
    if (result.success) {
      window.alert('Đã mở khóa bài tập M05.');
    } else {
      window.alert(`Không thể mở khóa: ${result.error}`);
    }
    setIsSubmitting(false);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Banner Thư mục Slide */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.25)' }}>
        <span style={{ fontSize: '0.8rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '6px' }}>
          📁 <strong>Kho Slide Bài Giảng:</strong> Chuẩn hóa M01_B01 đến M05_B15
        </span>
        <a href={GOOGLE_DRIVE_SLIDES_ROOT} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
          Mở Thư Mục Google Drive ➔
        </a>
      </div>

      {LESSONS.map(lesson => (
        <div key={lesson.id} className="glass-panel" style={{ padding: 18 }}>
          <div style={{ color: 'var(--accent-primary)', fontSize: '.73rem', fontWeight: 900, letterSpacing: '.08em', marginBottom: 5 }}>BÀI {lesson.id.toString().padStart(2, '0')}</div>
          <h3 style={{ fontSize: '1rem', marginBottom: 7 }}>{lesson.title}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.8rem', lineHeight: 1.5, marginBottom: 14 }}>{lesson.description}</p>
          <div style={{ display: 'flex', gap: 9 }}>
            <button className="btn btn-secondary" onClick={() => handleOpenDocument(lesson.lessonKey)} style={{ flex: 1, gap: 6, fontSize: '.76rem', padding: '8px 9px' }}>
              <BookOpen size={14} /> 📖 Slide Bài Giảng
            </button>
            <button className="btn btn-primary" disabled={loadingVideo === lesson.video} onClick={() => handleOpenVideo(lesson.video, lesson.lessonKey)} style={{ flex: 1, gap: 6, fontSize: '.76rem', padding: '8px 9px' }}>
              <Play size={14} /> {loadingVideo === lesson.video ? 'Đang tải...' : 'Video'}
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
    <div style={{ padding: 24, minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <header style={{ marginBottom: 28 }}>
        <div style={{ color: '#10b981', fontSize: '.76rem', fontWeight: 900, letterSpacing: '.12em', marginBottom: 7 }}>FINAL OPERATING SYSTEM</div>
        <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Module 05: Execution, Recovery & Account Growth</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Chốt đơn là điểm bắt đầu của trải nghiệm thực thi — nơi trust được bảo vệ và tăng trưởng tài khoản được thiết kế.</p>
      </header>

      <ModuleLayout
        moduleTitle="Module 05: Execution, Recovery & Account Growth"
        learningContent={learningContent}
        formContent={<M05_CombinedForm />}
        aiTutorContent={aiTutorContent}
        previewUrl={previewUrl}
        previewTitle={previewTitle}
        onClosePreview={() => setPreviewUrl(null)}
        headerActionNode={isLocked ? (
          <button className="btn" onClick={handleUnlock} disabled={isSubmitting} style={{ background: '#f59e0b', color: '#0f172a', fontWeight: 800 }}>{isSubmitting ? 'Đang mở...' : 'Mở khóa để sửa'}</button>
        ) : (
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting} style={{ fontWeight: 800 }}>{isSubmitting ? 'Đang nộp...' : 'Xác nhận Nộp bài'}</button>
        )}
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
