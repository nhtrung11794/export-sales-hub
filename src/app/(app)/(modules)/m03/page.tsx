'use client';

import React, { useState, useEffect } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import M03_CombinedForm from '@/components/modules/m03/M03_CombinedForm';
import { createClient } from '@/lib/supabase/client';
import { useModuleStore } from '@/store/useModuleStore';
import { Play, BookOpen, X, Sparkles, Copy, Check } from 'lucide-react';
import { Rnd } from 'react-rnd';

export default function M03Page() {
  const supabase = createClient();
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pipVideoUrl, setPipVideoUrl] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  
  const { submitModule, unlockModule, submissions } = useModuleStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, [supabase.auth]);

  useEffect(() => {
    const submission = submissions['M03'];
    if (submission) setIsLocked(submission.is_locked);
  }, [submissions]);

  const handleSubmit = async () => {
    if (!userId || isLocked) return;
    setIsSubmitting(true);
    const result = await submitModule('M03', userId);
    if (result.success) alert('Nộp bài thành công! Module 04 đã được cập nhật.');
    else alert('Có lỗi xảy ra: ' + result.error);
    setIsSubmitting(false);
  };

  const handleUnlock = async () => {
    if (!userId) return;
    setIsSubmitting(true);
    const result = await unlockModule('M03', userId);
    if (result.success) alert('Đã mở khóa.');
    else alert('Có lỗi xảy ra: ' + result.error);
    setIsSubmitting(false);
  };

  const handleOpenDocument = async (fileName: string) => {
    try {
      setLoadingFile(fileName);
      const { data, error } = await supabase.storage.from('course_materials').createSignedUrl(fileName, 3600);
      if (error) throw error;
      if (data?.signedUrl) setPreviewUrl(data.signedUrl);
    } catch (err) {
      alert('Đã xảy ra lỗi kết nối với tài liệu.');
    } finally {
      setLoadingFile(null);
    }
  };

  const handleOpenVideo = async (fileName: string) => {
    try {
      setLoadingVideo(fileName);
      const { data, error } = await supabase.storage.from('course_materials').createSignedUrl(fileName, 3600);
      if (error) throw error;
      if (data?.signedUrl) setPipVideoUrl(data.signedUrl);
    } catch (err) {
      alert('Không thể mở video bài giảng.');
    } finally {
      setLoadingVideo(null);
    }
  };

  const promptSpark = `"Đóng vai chuyên gia nghiên cứu thị trường B2B Export, hãy liệt kê danh sách 5 nhà nhập khẩu/phân phối lớn nhất cho ngành hàng [Sản phẩm xuất khẩu] tại thị trường [Thị trường mục tiêu] dưới dạng bảng gồm các cột: Tên Công Ty | Website | Quy mô ước tính | Điểm mạnh nổi bật."`;

  const promptFollowUp = `"Đóng vai Giám đốc Kinh doanh B2B Export kỳ cựu, một khách hàng tiềm năng đã nhận Báo giá từ 14 ngày trước nhưng đang im lặng. Hãy gợi ý cho tôi 3 kịch bản Email Follow-up mang lại giá trị gia tăng (Value-add / Market Intelligence) để hâm nóng cuộc hội thoại mà tuyệt đối KHÔNG dùng câu giục ép 'Anh chị đã xem giá chưa'."`;

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
      {/* BÀI 06 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '8px', fontSize: '1.05rem', fontWeight: 'bold' }}>
          Bài 06: Tìm kiếm khách hàng & Mở đầu Prospecting
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
          Cách xây dựng Lead List, chọn Target Account và viết Cold Outreach cá nhân hóa.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => handleOpenDocument('M03_Bai05.pdf')}
            disabled={loadingFile === 'M03_Bai05.pdf'}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <BookOpen size={14}/> {loadingFile === 'M03_Bai05.pdf' ? 'Đang tải...' : 'Giáo án PDF'}
          </button>
          <button 
            onClick={() => handleOpenVideo('M03_Video05.mp4')}
            disabled={loadingVideo === 'M03_Video05.mp4'}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <Play size={14}/> {loadingVideo === 'M03_Video05.mp4' ? 'Đang tải...' : 'Video Tổng kết'}
          </button>
        </div>
      </div>

      {/* BÀI 07 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '8px', fontSize: '1.05rem', fontWeight: 'bold' }}>
          Bài 07: Qualify Lead & Phát triển Cơ hội
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
          Khung chấm điểm F-N-A-C-M để phân biệt Inquiry dạo với Cơ hội thực tế.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => handleOpenDocument('M03_Bai06.pdf')}
            disabled={loadingFile === 'M03_Bai06.pdf'}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <BookOpen size={14}/> {loadingFile === 'M03_Bai06.pdf' ? 'Đang tải...' : 'Giáo án PDF'}
          </button>
          <button 
            onClick={() => handleOpenVideo('M03_Video06.mp4')}
            disabled={loadingVideo === 'M03_Video06.mp4'}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <Play size={14}/> {loadingVideo === 'M03_Video06.mp4' ? 'Đang tải...' : 'Video Tổng kết'}
          </button>
        </div>
      </div>

      {/* BÀI 08 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '8px', fontSize: '1.05rem', fontWeight: 'bold' }}>
          Bài 08: Quản trị Pipeline & Kỷ luật Follow-up
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
          Mô hình CRM 3 lớp và xử lý sự cố khách im lặng sau báo giá bằng Touchpoint giá trị.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => handleOpenDocument('M03_Bai07.pdf')}
            disabled={loadingFile === 'M03_Bai07.pdf'}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <BookOpen size={14}/> {loadingFile === 'M03_Bai07.pdf' ? 'Đang tải...' : 'Giáo án PDF'}
          </button>
          <button 
            onClick={() => handleOpenVideo('M03_Video07.mp4')}
            disabled={loadingVideo === 'M03_Video07.mp4'}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <Play size={14}/> {loadingVideo === 'M03_Video07.mp4' ? 'Đang tải...' : 'Video Tổng kết'}
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
          onClick={() => handleCopyPrompt(promptFollowUp, 'followup', 'https://notebook.google.com/notebook/88777706-546d-411d-86e9-19f0577dae14')}
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
            <div style={{ flex: 1, position: 'relative' }}>
              <video src={pipVideoUrl} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'black', outline: 'none' }} />
            </div>
          </div>
        </Rnd>
      )}
    </div>
  );
}
