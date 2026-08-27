'use client';

import React, { useState, useEffect } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import M04_CombinedForm from '@/components/modules/m04/M04_CombinedForm';
import { createClient } from '@/lib/supabase/client';
import { useModuleStore } from '@/store/useModuleStore';
import { Play, BookOpen, X, Sparkles, Copy, Check } from 'lucide-react';
import { Rnd } from 'react-rnd';

export default function M04Page() {
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
    const submission = submissions['M04'];
    if (submission) setIsLocked(submission.is_locked);
  }, [submissions]);

  const handleSubmit = async () => {
    if (!userId || isLocked) return;
    const m04Data = submissions['M04']?.form_data as any;
    const checklist = m04Data?.b12_closing?.checklist;
    const isChecklistComplete = Boolean(
      checklist?.check_bec && 
      checklist?.check_local_charge && 
      checklist?.check_vessel
    );
    if (!isChecklistComplete) {
      alert('⚠️ Bạn chưa hoàn thành Safe Order Checklist tại Bài 12 (Bắt buộc tick xác nhận cả 3 tiêu chuẩn: BEC, Local Charge, Booking Tàu) để bảo đảm an toàn trước khi nộp bài!');
      return;
    }
    setIsSubmitting(true);
    const result = await submitModule('M04', userId);
    if (result.success) alert('Nộp bài thành công! Module 05 đã được cập nhật.');
    else alert('Có lỗi xảy ra: ' + result.error);
    setIsSubmitting(false);
  };

  const handleUnlock = async () => {
    if (!userId) return;
    setIsSubmitting(true);
    const result = await unlockModule('M04', userId);
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

  const prompts = [
    {
      id: 'prompt_1',
      title: 'Khám bệnh Lỗ hổng Yêu cầu',
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
      {/* BÀI 09 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '8px', fontSize: '1.05rem', fontWeight: 'bold' }}>
          Bài 09: Requirement Clarification
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
          Làm rõ yêu cầu với ma trận P-B-T-P-C.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => handleOpenDocument('M04_Bai09.pdf')}
            disabled={loadingFile === 'M04_Bai09.pdf'}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <BookOpen size={14}/> {loadingFile === 'M04_Bai09.pdf' ? 'Đang tải...' : 'Giáo án PDF'}
          </button>
          <button 
            onClick={() => handleOpenVideo('M04_Video09.mp4')}
            disabled={loadingVideo === 'M04_Video09.mp4'}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <Play size={14}/> {loadingVideo === 'M04_Video09.mp4' ? 'Đang tải...' : 'Video Bài giảng'}
          </button>
        </div>
      </div>

      {/* BÀI 10 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '8px', fontSize: '1.05rem', fontWeight: 'bold' }}>
          Bài 10: Proposal & Quotation
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
          Thiết kế cấu trúc báo giá 3 tùy chọn & Tính Landed Cost (TCO).
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => handleOpenDocument('M04_Bai10.pdf')}
            disabled={loadingFile === 'M04_Bai10.pdf'}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <BookOpen size={14}/> {loadingFile === 'M04_Bai10.pdf' ? 'Đang tải...' : 'Giáo án PDF'}
          </button>
          <button 
            onClick={() => handleOpenVideo('M04_Video10.mp4')}
            disabled={loadingVideo === 'M04_Video10.mp4'}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <Play size={14}/> {loadingVideo === 'M04_Video10.mp4' ? 'Đang tải...' : 'Video Bài giảng'}
          </button>
        </div>
      </div>

      {/* BÀI 11 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '8px', fontSize: '1.05rem', fontWeight: 'bold' }}>
          Bài 11: Negotiation & Blocker
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
          Bàn cân đàm phán Give - Take, chặn nhượng bộ miễn phí.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => handleOpenDocument('M04_Bai11.pdf')}
            disabled={loadingFile === 'M04_Bai11.pdf'}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <BookOpen size={14}/> {loadingFile === 'M04_Bai11.pdf' ? 'Đang tải...' : 'Giáo án PDF'}
          </button>
          <button 
            onClick={() => handleOpenVideo('M04_Video11.mp4')}
            disabled={loadingVideo === 'M04_Video11.mp4'}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <Play size={14}/> {loadingVideo === 'M04_Video11.mp4' ? 'Đang tải...' : 'Video Bài giảng'}
          </button>
        </div>
      </div>

      {/* BÀI 12 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '8px', fontSize: '1.05rem', fontWeight: 'bold' }}>
          Bài 12: Payment Risk & Safe Closing
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
          Quản trị rủi ro thanh toán và xác nhận đơn hàng an toàn.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => handleOpenDocument('M04_Bai12.pdf')}
            disabled={loadingFile === 'M04_Bai12.pdf'}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <BookOpen size={14}/> {loadingFile === 'M04_Bai12.pdf' ? 'Đang tải...' : 'Giáo án PDF'}
          </button>
          <button 
            onClick={() => handleOpenVideo('M04_Video12.mp4')}
            disabled={loadingVideo === 'M04_Video12.mp4'}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <Play size={14}/> {loadingVideo === 'M04_Video12.mp4' ? 'Đang tải...' : 'Video Bài giảng'}
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
            onClick={() => handleCopyPrompt(prompt.text, prompt.id, 'https://notebook.google.com/notebook/88777706-546d-411d-86e9-19f0577dae14')}
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
            <div style={{ flex: 1, position: 'relative' }}>
              <video src={pipVideoUrl} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'black', outline: 'none' }} />
            </div>
          </div>
        </Rnd>
      )}
    </div>
  );
}
