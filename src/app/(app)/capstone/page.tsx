'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Award, BookOpen, Check, Copy, Layers, Play, Sparkles, X } from 'lucide-react';
import { Rnd } from 'react-rnd';
import ModuleLayout from '@/components/layout/ModuleLayout';
import CapstoneHub from '@/components/capstone/CapstoneHub';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { createClient } from '@/lib/supabase/client';
import { useModuleStore } from '@/store/useModuleStore';

const CAPSTONE_LESSONS = [
  { id: 16, title: 'Final Capstone & Defense', description: 'Rà soát 15 buổi, tự phản biện và đóng gói 3 bộ Playbook xuất khẩu chuyên nghiệp.', pdf: 'M05_Capstone_Guide.pdf', video: 'M05_VideoCapstone.mp4' },
];

export default function CapstonePage() {
  const supabase = useMemo(() => createClient(), []);
  const { submitModule, unlockModule, submissions } = useModuleStore();
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pipVideoUrl, setPipVideoUrl] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const isLocked = submissions?.CAPSTONE?.is_locked || false;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data?.user?.id || null));
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
    setIsSubmitting(true);
    const result = await submitModule('CAPSTONE', userId);
    window.alert(result.success ? 'Chúc mừng! Bạn đã hoàn thành và nộp bài Final Capstone thành công!' : `Có lỗi xảy ra: ${result.error}`);
    setIsSubmitting(false);
  };

  const handleUnlock = async () => {
    if (!userId) return;
    setIsSubmitting(true);
    const result = await unlockModule('CAPSTONE', userId);
    window.alert(result.success ? 'Đã mở khóa Capstone để chỉnh sửa.' : `Có lỗi xảy ra: ${result.error}`);
    setIsSubmitting(false);
  };

  const m02 = submissions?.M02?.form_data || {};
  const m04 = submissions?.M04?.form_data || {};
  const m05 = submissions?.M05?.form_data || {};

  const prompts = [
    {
      id: 'capstone-defense',
      title: 'Hội đồng Giám khảo phản biện Deal (Capstone Defense)',
      text: `Đóng vai Ban Giám khảo Hội đồng Chuyên gia Xuất khẩu B2B. Tôi đã hoàn thành toàn bộ chuỗi 15 buổi học:
- Thị trường: ${m02?.target_market || '[chưa chọn]'}
- Chân dung Buyer & Nỗi đau: ${m02?.icp_industry || ''} / ${m02?.icp_size || ''}
- Phương thức Thanh toán: ${m04?.b12_closing?.selected_payment_method || '[chưa chọn]'}
- Tăng trưởng JBP: Share of Wallet ${m05?.b15_growth?.current_wallet_share ?? 0}%

Hãy đặt 3 câu hỏi sắc bén thách thức tính nhất quán trong toàn bộ chuỗi giá trị và đề xuất cách gia cố rủi ro trước khi đưa vào vận hành thực tế.`,
    },
    {
      id: 'playbook-audit',
      title: 'Auditor rà soát Bộ 03 Playbook',
      text: `Đóng vai Chuyên gia Tối ưu Quy trình Xuất khẩu. Hãy rà soát 3 Playbook của tôi (Market, Commercial Deal Desk, Execution & Recovery), chỉ ra các điểm nghẽn có thể phát sinh khi bàn giao cho đội ngũ Sales & Vận hành mới.`,
    },
  ];

  const handleCopyPrompt = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPrompt(id);
      window.setTimeout(() => setCopiedPrompt(null), 2500);
      window.open('https://notebook.google.com/', '_blank', 'noopener,noreferrer');
    } catch {
      window.alert('Không thể sao chép prompt. Vui lòng kiểm tra quyền Clipboard.');
    }
  };

  const learningContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {CAPSTONE_LESSONS.map(lesson => (
        <div key={lesson.id} className="glass-panel" style={{ padding: 18 }}>
          <div style={{ color: 'var(--accent-primary)', fontSize: '.73rem', fontWeight: 900, letterSpacing: '.08em', marginBottom: 5 }}>KHOANG CAPSTONE</div>
          <h3 style={{ fontSize: '1rem', marginBottom: 7 }}>{lesson.title}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.8rem', lineHeight: 1.5, marginBottom: 14 }}>{lesson.description}</p>
          <div style={{ display: 'flex', gap: 9 }}>
            <button className="btn btn-secondary" disabled={loadingFile === lesson.pdf} onClick={() => handleOpenDocument(lesson.pdf)} style={{ flex: 1, gap: 6, fontSize: '.76rem', padding: '8px 9px' }}>
              <BookOpen size={14} /> {loadingFile === lesson.pdf ? 'Đang tải...' : 'Slide PDF'}
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
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--accent-primary)', fontSize: '.9rem', marginBottom: 8 }}>
            <Sparkles size={17} /> {prompt.title}
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.77rem', lineHeight: 1.45, marginBottom: 12 }}>
            {prompt.text.slice(0, 130)}...
          </p>
          <button className="btn btn-primary" onClick={() => handleCopyPrompt(prompt.text, prompt.id)} style={{ width: '100%', gap: 6, fontSize: '.78rem' }}>
            {copiedPrompt === prompt.id ? <><Check size={14} /> Đã copy & mở AI</> : <><Copy size={14} /> Copy Prompt Hội Đồng</>}
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <ErrorBoundary fallbackTitle="Không thể tải Khoang Final Capstone">
      <div style={{ padding: 24, minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <header style={{ marginBottom: 28 }}>
          <div style={{ color: 'var(--accent-primary)', fontSize: '.76rem', fontWeight: 900, letterSpacing: '.1em', marginBottom: 7 }}>ENTERPRISE ASSET ENGINE</div>
          <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Final Capstone: Đóng Gói Bộ 03 Playbook Xuất Khẩu</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Rà soát toàn diện 15 buổi học M01 đến M05, tự phản biện rủi ro và xuất bản 3 bộ tài sản vận hành chuẩn hóa cho doanh nghiệp.</p>
        </header>

        <ModuleLayout
          moduleTitle="Final Capstone: Đóng Gói Bộ 03 Playbook Xuất Khẩu"
          learningContent={learningContent}
          formContent={
            <ErrorBoundary fallbackTitle="Không thể tải Bảng Thực thi Capstone Hub">
              <CapstoneHub />
            </ErrorBoundary>
          }
          aiTutorContent={aiTutorContent}
          previewUrl={previewUrl}
          onClosePreview={() => setPreviewUrl(null)}
          headerActionNode={isLocked ? (
            <button className="btn" onClick={handleUnlock} disabled={isSubmitting} style={{ background: '#f59e0b', color: '#0f172a', fontWeight: 800 }}>{isSubmitting ? 'Đang mở...' : 'Mở khóa để sửa'}</button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting} style={{ fontWeight: 800 }}>{isSubmitting ? 'Đang nộp...' : 'Nộp Bài Capstone'}</button>
          )}
        />

        {pipVideoUrl && typeof window !== 'undefined' && (
          <Rnd default={{ x: Math.max(20, window.innerWidth - 448), y: Math.max(20, window.innerHeight - 249), width: 400, height: 225 }} minWidth={320} minHeight={180} bounds="window" style={{ zIndex: 9999 }}>
            <div className="glass-panel" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--accent-primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'move' }}>
                <span style={{ fontSize: '.76rem', color: 'var(--text-secondary)' }}>Video Hướng dẫn Capstone</span>
                <button onClick={() => setPipVideoUrl(null)} aria-label="Đóng video" style={{ border: 0, background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}><X size={16} /></button>
              </div>
              <video src={pipVideoUrl} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
            </div>
          </Rnd>
        )}
      </div>
    </ErrorBoundary>
  );
}
