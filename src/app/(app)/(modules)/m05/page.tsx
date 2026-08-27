'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Check, Copy, Play, Sparkles, X } from 'lucide-react';
import { Rnd } from 'react-rnd';
import ModuleLayout from '@/components/layout/ModuleLayout';
import M05_CombinedForm, { isB13Complete, isB14Complete, isB15Complete, M05FormData } from '@/components/modules/m05/M05_CombinedForm';
import { createClient } from '@/lib/supabase/client';
import { useModuleStore } from '@/store/useModuleStore';

const LESSONS = [
  { id: 13, title: 'Handover & Execution', description: 'Ký duyệt Internal SLA và điều phối milestone theo Kanban.', pdf: 'M05_Bai13.pdf', video: 'M05_Video13.mp4' },
  { id: 14, title: 'Issue Recovery & CAPA', description: 'Xử lý sự cố bằng bằng chứng, CAPA và Bad News Email.', pdf: 'M05_Bai14.pdf', video: 'M05_Video14.mp4' },
  { id: 15, title: 'Account Growth & JBP', description: 'Đánh giá Share of Wallet và xây kế hoạch tăng trưởng chung.', pdf: 'M05_Bai15.pdf', video: 'M05_Video15.mp4' },
];

export default function M05Page() {
  const supabase = useMemo(() => createClient(), []);
  const { submitModule, unlockModule, submissions } = useModuleStore();
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pipVideoUrl, setPipVideoUrl] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const isLocked = submissions.M05?.is_locked || false;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, [supabase]);

  const handleOpenDocument = async (fileName: string) => {
    try {
      setLoadingFile(fileName);
      const { data, error } = await supabase.storage.from('course_materials').createSignedUrl(fileName, 3600);
      if (error) throw error;
      setPreviewUrl(data.signedUrl);
    } catch {
      window.alert('Tài liệu chưa được tải lên kho học liệu hoặc kết nối đang gián đoạn.');
    } finally {
      setLoadingFile(null);
    }
  };

  const handleOpenVideo = async (fileName: string) => {
    try {
      setLoadingVideo(fileName);
      const { data, error } = await supabase.storage.from('course_materials').createSignedUrl(fileName, 3600);
      if (error) throw error;
      setPipVideoUrl(data.signedUrl);
    } catch {
      window.alert('Video chưa được tải lên kho học liệu hoặc kết nối đang gián đoạn.');
    } finally {
      setLoadingVideo(null);
    }
  };

  const handleSubmit = async () => {
    if (!userId || isLocked) return;
    const currentData = submissions.M05?.form_data as M05FormData | undefined;
    if (!currentData || !isB13Complete(currentData) || !isB14Complete(currentData) || !isB15Complete(currentData)) {
      window.alert('Chưa thể nộp: hãy hoàn thành SLA B13, CAPA B14 và JBP B15 trước.');
      return;
    }
    setIsSubmitting(true);
    const result = await submitModule('M05', userId);
    window.alert(result.success ? 'Đã nộp Module 05 thành công! Bạn có thể chuyển sang khoang Final Capstone trên Menu để đóng gói Playbook xuất khẩu.' : `Có lỗi xảy ra: ${result.error}`);
    setIsSubmitting(false);
  };

  const handleUnlock = async () => {
    if (!userId) return;
    setIsSubmitting(true);
    const result = await unlockModule('M05', userId);
    window.alert(result.success ? 'Đã mở khóa Module 05 để chỉnh sửa.' : `Có lỗi xảy ra: ${result.error}`);
    setIsSubmitting(false);
  };

  const m05 = submissions.M05?.form_data as M05FormData | undefined;
  const m02 = submissions.M02?.form_data || {};
  const milestoneSummary = (m05?.b13_execution?.milestones || []).map(item => `${item.title}: ${item.status}, hạn ${item.due_date || 'chưa chốt'}`).join('; ');
  const prompts = [
    {
      id: 'qa-timeline',
      title: 'QA Manager phản biện Timeline',
      text: `Đóng vai QA Manager của doanh nghiệp xuất khẩu. Hãy phản biện tính khả thi của timeline sau, chỉ ra dependency, checkpoint chất lượng và phương án dự phòng còn thiếu: ${milestoneSummary || '[Chưa có timeline B13]'}`,
    },
    {
      id: 'capa-review',
      title: 'Incident Commander rà CAPA',
      text: `Đóng vai Incident Commander. Với thị trường ${m02.target_market || '[chưa chọn]'} và bối cảnh pháp lý/chiến lược: ${m02.strategic_reason || '[chưa có]'}, hãy rà CAPA của tôi theo tiêu chí Evidence - Containment - Root Cause - Prevention và chỉ ra mọi cam kết vượt quá bằng chứng.`,
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
      window.open('https://notebook.google.com/', '_blank', 'noopener,noreferrer');
    } catch {
      window.alert('Không thể sao chép prompt. Vui lòng kiểm tra quyền Clipboard của trình duyệt.');
    }
  };

  const learningContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {LESSONS.map(lesson => (
        <div key={lesson.id} className="glass-panel" style={{ padding: 18 }}>
          <div style={{ color: 'var(--accent-primary)', fontSize: '.73rem', fontWeight: 900, letterSpacing: '.08em', marginBottom: 5 }}>BÀI {lesson.id.toString().padStart(2, '0')}</div>
          <h3 style={{ fontSize: '1rem', marginBottom: 7 }}>{lesson.title}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.8rem', lineHeight: 1.5, marginBottom: 14 }}>{lesson.description}</p>
          <div style={{ display: 'flex', gap: 9 }}>
            <button className="btn btn-secondary" disabled={loadingFile === lesson.pdf} onClick={() => handleOpenDocument(lesson.pdf)} style={{ flex: 1, gap: 6, fontSize: '.76rem', padding: '8px 9px' }}>
              <BookOpen size={14} /> {loadingFile === lesson.pdf ? 'Đang tải...' : 'Giáo án PDF'}
            </button>
            <button className="btn btn-primary" disabled={loadingVideo === lesson.video} onClick={() => handleOpenVideo(lesson.video)} style={{ flex: 1, gap: 6, fontSize: '.76rem', padding: '8px 9px' }}>
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
            <video src={pipVideoUrl} controls autoPlay style={{ width: '100%', flex: 1, minHeight: 0, objectFit: 'contain' }} />
          </div>
        </Rnd>
      )}
    </div>
  );
}
