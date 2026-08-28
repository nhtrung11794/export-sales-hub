'use client';

import React, { useState, useEffect } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import M04_CombinedForm from '@/components/modules/m04/M04_CombinedForm';
import { createClient } from '@/lib/supabase/client';
import { useModuleStore } from '@/store/useModuleStore';
import { Play, BookOpen, X, Sparkles, Copy, Check } from 'lucide-react';
import { Rnd } from 'react-rnd';

import { openCourseSlide, GOOGLE_DRIVE_SLIDES_ROOT, COURSE_MATERIALS, getLessonSlideEmbedUrl, getLessonStandardFileName, getLessonVideoEmbedUrl } from '@/lib/courseMaterials';

export default function M04Page() {
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
      const data = getModuleData('M04');
      const submission = submissions['M04'];
      if (submission) {
        setIsLocked(submission.is_locked);
      }
      
      if (data) {
        const isDraftValid = Boolean(data.b12_closing?.selected_payment_method || data.b10_quotation);
        setIsValid(!!isDraftValid);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [getModuleData, submissions]);

  const handleSubmit = async () => {
    if (!userId || !isValid || isLocked) return;
    setIsSubmitting(true);
    const result = await submitModule('M04', userId);
    if (result.success) {
      alert('Nộp bài thành công! Module 05 đã được mở khóa.');
    } else {
      alert('Có lỗi xảy ra khi nộp bài. Chi tiết lỗi: ' + result.error);
    }
    setIsSubmitting(false);
  };

  const handleUnlock = async () => {
    if (!userId) return;
    setIsSubmitting(true);
    const result = await unlockModule('M04', userId);
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
      alert('Không thể mở video bài giảng.');
    } finally {
      setLoadingVideo(null);
    }
  };

  const prompts = [
    {
      id: 'prompt_1',
      title: 'Scan Rủi ro 5 Lớp',
      text: 'Đóng vai Chuyên gia Thương mại Quốc tế. Rà soát đoạn email dưới đây của khách hàng dựa trên khung 5 lớp (Sản phẩm - Thương mại - Giao nhận - Thanh toán - Tuân thủ). Hãy chỉ ra những điểm chưa rõ ràng hoặc mâu thuẫn có thể gây rủi ro nếu tôi vội vàng báo giá lúc này. [Dán email của khách vào đây]'
    },
    {
      id: 'prompt_2',
      title: 'Phản biện Báo giá TCO',
      text: 'Đóng vai Giám đốc Mua hàng (Procurement Manager) khó tính. Hãy phân tích xem trong 3 Option báo giá của tôi, Option 2 (Premium) có ưu điểm TCO (Tổng chi phí sở hữu) gì đủ thuyết phục để tôi trả giá cao hơn thay vì chọn Option rẻ nhất?'
    },
    {
      id: 'prompt_3',
      title: 'Gỡ vướng Đàm phán',
      text: 'Khách hàng phản hồi: "Giá cao quá, tôi không mua được". Dựa vào nỗi đau của khách hàng (Buyer Pain) mà tôi đã thu thập được: [Điền nỗi đau vào đây]. Hãy gợi ý 3 luận điểm (GIVE-TAKE) để tôi bảo vệ giá trị và yêu cầu họ đánh đổi một điều kiện khác nếu muốn giảm giá.'
    },
    {
      id: 'prompt_4',
      title: 'Check Lừa đảo Chứng từ',
      text: 'Tôi đang định chốt hợp đồng với phương thức thanh toán là D/P At Sight cho một khách hàng mới từ thị trường Châu Phi. Hãy liệt kê 3 kịch bản lừa đảo chứng từ phổ biến nhất với phương thức này và cách tôi có thể phòng ngừa trước khi phát hành Proforma Invoice.'
    }
  ];

  const handleCopyPrompt = async (text: string, id: string, targetUrl: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPrompt(id);
      setTimeout(() => setCopiedPrompt(null), 2500);
      window.open(targetUrl, '_blank');
    } catch (err) {}
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

      {/* BÀI 09 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '8px', fontSize: '1.05rem', fontWeight: 'bold' }}>
          {COURSE_MATERIALS.B09.title}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
          {COURSE_MATERIALS.B09.description}
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => handleOpenDocument('B09')}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <BookOpen size={14}/> 📖 Slide Bài Giảng
          </button>
          <button 
            onClick={() => handleOpenVideo(COURSE_MATERIALS.B09.videoFileName || 'M04_Video09.mp4', 'B09')}
            disabled={loadingVideo === COURSE_MATERIALS.B09.videoFileName}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <Play size={14}/> {loadingVideo === COURSE_MATERIALS.B09.videoFileName ? 'Đang tải...' : 'Video Bài giảng'}
          </button>
        </div>
      </div>

      {/* BÀI 10 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '8px', fontSize: '1.05rem', fontWeight: 'bold' }}>
          {COURSE_MATERIALS.B10.title}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
          {COURSE_MATERIALS.B10.description}
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => handleOpenDocument('B10')}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <BookOpen size={14}/> 📖 Slide Bài Giảng
          </button>
          <button 
            onClick={() => handleOpenVideo(COURSE_MATERIALS.B10.videoFileName || 'M04_Video10.mp4', 'B10')}
            disabled={loadingVideo === COURSE_MATERIALS.B10.videoFileName}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <Play size={14}/> {loadingVideo === COURSE_MATERIALS.B10.videoFileName ? 'Đang tải...' : 'Video Bài giảng'}
          </button>
        </div>
      </div>

      {/* BÀI 11 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '8px', fontSize: '1.05rem', fontWeight: 'bold' }}>
          {COURSE_MATERIALS.B11.title}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
          {COURSE_MATERIALS.B11.description}
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => handleOpenDocument('B11')}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <BookOpen size={14}/> 📖 Slide Bài Giảng
          </button>
          <button 
            onClick={() => handleOpenVideo(COURSE_MATERIALS.B11.videoFileName || 'M04_Video11.mp4', 'B11')}
            disabled={loadingVideo === COURSE_MATERIALS.B11.videoFileName}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <Play size={14}/> {loadingVideo === COURSE_MATERIALS.B11.videoFileName ? 'Đang tải...' : 'Video Bài giảng'}
          </button>
        </div>
      </div>

      {/* BÀI 12 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '8px', fontSize: '1.05rem', fontWeight: 'bold' }}>
          {COURSE_MATERIALS.B12.title}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
          {COURSE_MATERIALS.B12.description}
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => handleOpenDocument('B12')}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <BookOpen size={14}/> 📖 Slide Bài Giảng
          </button>
          <button 
            onClick={() => handleOpenVideo(COURSE_MATERIALS.B12.videoFileName || 'M04_Video12.mp4', 'B12')}
            disabled={loadingVideo === COURSE_MATERIALS.B12.videoFileName}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <Play size={14}/> {loadingVideo === COURSE_MATERIALS.B12.videoFileName ? 'Đang tải...' : 'Video Bài giảng'}
          </button>
        </div>
      </div>
    </div>
  );

  const aiTutorContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {prompts.map((prompt, idx) => (
        <div key={prompt.id} className="glass-panel" style={{ padding: '20px', background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={18} color="var(--accent-primary)" />
            <h4 style={{ color: 'var(--accent-primary)', fontSize: '0.95rem', fontWeight: 'bold', margin: 0 }}>
              {prompt.title}
            </h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.4' }}>
            {prompt.text.substring(0, 80)}...
          </p>
          <button
            onClick={() => handleCopyPrompt(prompt.text, prompt.id, 'https://notebook.google.com/notebook/3fdec64c-7c4e-4ca7-839e-41e69429efd8')}
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px' }}
          >
            {copiedPrompt === prompt.id ? <><Check size={14} /> Đã Copy & Mở NotebookLM</> : <><Copy size={14} /> Copy Prompt</>}
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Module 04: Proposal, Negotiation & Safe Closing
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Chuyển đổi cơ hội thành hợp đồng an toàn thông qua kiểm soát TCO, đàm phán Give-Take và phê duyệt rủi ro thanh toán.
        </p>
      </header>

      <ModuleLayout 
        moduleTitle="Module 04: Proposal, Negotiation & Closing"
        learningContent={learningContent}
        formContent={<M04_CombinedForm />}
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
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>▶️ Video Bài Giảng M04</span>
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
                  title="Video Bài Giảng M04"
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
