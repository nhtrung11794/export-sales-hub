'use client';

import React, { useState, useEffect } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import M3_FitScoreForm from '@/components/modules/m03/M3_FitScoreForm';
import { createClient } from '@/lib/supabase/client';
import { useModuleStore } from '@/store/useModuleStore';
import { Copy, Check, Play, BookOpen, X } from 'lucide-react';
import { Rnd } from 'react-rnd';

export default function Module03Page() {
  const supabase = createClient();
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Trạng thái cho Video PiP
  const [pipVideoUrl, setPipVideoUrl] = useState<string | null>(null);
  
  const [isCopied, setIsCopied] = useState(false);
  const { getModuleData, submitModule, unlockModule, submissions } = useModuleStore();
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, []);

  const [formData, setFormData] = useState({
    score: 0,
    justification: ''
  });

  const isLocked = submissions['M03']?.status === 'submitted';
  const isValid = formData.score > 0;

  // Quét dữ liệu từ Store mỗi 1 giây
  useEffect(() => {
    const interval = setInterval(() => {
      const data: any = getModuleData('M03');
      if (data) {
        const fitScore = data.fit_score || { fit: 0, need: 0, access: 0, criteria: 0, momentum: 0 };
        const totalScore = fitScore.fit + fitScore.need + fitScore.access + fitScore.criteria + fitScore.momentum;
        setFormData({
          score: totalScore,
          justification: data.warning_justification || ''
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [getModuleData]);

  const dynamicPrompt = `"Tôi đang đánh giá cơ hội B2B này. Fit Score hiện tại của tôi là ${formData.score}/100. ${formData.justification ? 'Lý do giải trình của tôi là: ' + formData.justification : 'Điểm còn khá thấp.'} Đóng vai Giám đốc Mua hàng (Buyer), hãy phân biện giúp tôi xem tôi đang gặp rủi ro gì và tôi nên làm rõ (clarify) những câu hỏi gì ở buổi gặp tiếp theo?"`;

  const handleSubmit = async () => {
    if (!userId || !isValid || isLocked) return;
    setIsSubmitting(true);
    const result = await submitModule('M03', userId);
    if (result.success) {
      alert('Nộp bài thành công!');
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
      alert('Đã xảy ra lỗi kết nối. Vui lòng kiểm tra lại file đã được tải lên Supabase chưa.');
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
      
      {/* BÀI 06 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '12px', fontSize: '1.1rem' }}>
          Bài 06 - Lọc cơ hội (Prospecting & Qualification)
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
          Biết cách tìm kiếm Leads chất lượng qua LinkedIn, Email Cold Outreach, và các nền tảng B2B. Lọc bỏ các tín hiệu nhiễu để tập trung vào cơ hội thực sự.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => handleOpenDocument('M03_Bai06.pdf')}
            disabled={loadingFile === 'M03_Bai06.pdf'}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <BookOpen size={16}/> {loadingFile === 'M03_Bai06.pdf' ? 'Đang tải...' : 'Giáo án PDF'}
          </button>
          <button 
            onClick={() => handleOpenVideo('M03_Video06.mp4')}
            disabled={loadingVideo === 'M03_Video06.mp4'}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <Play size={16}/> {loadingVideo === 'M03_Video06.mp4' ? 'Đang tải...' : 'Video Tổng kết'}
          </button>
        </div>
      </div>
      
      {/* BÀI 07 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '12px', fontSize: '1.1rem' }}>
          Bài 07 - Chấm điểm BANT/F-N-A-C-M
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
          Số hóa cảm tính thành điểm số. Đánh giá độ phù hợp (Fit), Nhu cầu (Need), Quyền quyết định (Access), Tiêu chuẩn (Criteria) và Động lực (Momentum).
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => handleOpenDocument('M03_Bai07.pdf')}
            disabled={loadingFile === 'M03_Bai07.pdf'}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <BookOpen size={16}/> {loadingFile === 'M03_Bai07.pdf' ? 'Đang tải...' : 'Giáo án PDF'}
          </button>
          <button 
            onClick={() => handleOpenVideo('M03_Video07.mp4')}
            disabled={loadingVideo === 'M03_Video07.mp4'}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <Play size={16}/> {loadingVideo === 'M03_Video07.mp4' ? 'Đang tải...' : 'Video Tổng kết'}
          </button>
        </div>
      </div>

      {/* BÀI 08 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '12px', fontSize: '1.1rem' }}>
          Bài 08 - Làm rõ nhu cầu (Clarification)
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
          Đặt câu hỏi đào sâu (Deep Probing) để xác minh các điểm nghi ngờ. Khai thác nỗi đau ẩn sâu bên trong thay vì chỉ nhìn vào "Bề nổi" mà Buyer chia sẻ.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => handleOpenDocument('M03_Bai08.pdf')}
            disabled={loadingFile === 'M03_Bai08.pdf'}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <BookOpen size={16}/> {loadingFile === 'M03_Bai08.pdf' ? 'Đang tải...' : 'Giáo án PDF'}
          </button>
          <button 
            onClick={() => handleOpenVideo('M03_Video08.mp4')}
            disabled={loadingVideo === 'M03_Video08.mp4'}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <Play size={16}/> {loadingVideo === 'M03_Video08.mp4' ? 'Đang tải...' : 'Video Tổng kết'}
          </button>
        </div>
      </div>

    </div>
  );

  const aiTutorContent = (
    <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--accent-warning)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        Dựa vào mức Fit Score hiện tại, hệ thống đã chuẩn bị Prompt để bạn nhập vai phản biện cùng Giám đốc Mua hàng!
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
        href="https://notebook.google.com/notebook/88777706-546d-411d-86e9-19f0577dae14" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="btn" 
        style={{ 
          display: 'block', textAlign: 'center', background: 'var(--accent-warning)', 
          color: 'var(--bg-primary)', fontWeight: 'bold', padding: '12px'
        }}
      >
        Mở NotebookLM M03 ➔
      </a>
    </div>
  );

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Module 03</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Phát triển Cơ hội & Quản trị Pipeline</p>
      </header>

      <ModuleLayout 
        moduleTitle="Module 03: Cơ hội & Quản trị Pipeline"
        learningContent={learningContent}
        formContent={<M3_FitScoreForm />}
        aiTutorContent={aiTutorContent}
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
        previewUrl={previewUrl}
        onClosePreview={() => setPreviewUrl(null)}
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
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>▶️ Video Bài Giảng</span>
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
