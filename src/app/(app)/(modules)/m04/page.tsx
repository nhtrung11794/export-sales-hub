'use client';

import React, { useState, useEffect } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import M04_B12_RiskPayment from '@/components/modules/m04/M04_B12_RiskPayment';
import { createClient } from '@/lib/supabase/client';
import { useModuleStore } from '@/store/useModuleStore';
import { Play, BookOpen, X, Sparkles, Check, Copy } from 'lucide-react';
import { Rnd } from 'react-rnd';

export default function M04Page() {
  const supabase = createClient();
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pipVideoUrl, setPipVideoUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  const { getModuleData, submitModule, unlockModule, submissions, updateSubmissionLocal } = useModuleStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [m03MockScore, setM03MockScore] = useState(0);

  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, [supabase.auth]);

  useEffect(() => {
    const interval = setInterval(() => {
      const data = getModuleData('M04');
      const m03Data = getModuleData('M03');
      const submission = submissions['M04'];
      
      if (submission) setIsLocked(submission.is_locked);
      if (m03Data && typeof m03Data.fit_score === 'number') {
        setM03MockScore(m03Data.fit_score);
      }
      
      // Simple validation for M04: Must have a payment method
      if (data && data.payment_method) {
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [getModuleData, submissions]);

  const handleSubmit = async () => {
    if (!userId || !isValid || isLocked) return;
    setIsSubmitting(true);
    const result = await submitModule('M04', userId);
    if (result.success) alert('Nộp bài thành công! Module 05 đã được mở khóa.');
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
      alert('Đã xảy ra lỗi kết nối.');
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
      alert('Không thể mở video.');
    } finally {
      setLoadingVideo(null);
    }
  };

  // Mock function to test Logic Gate 2 locally
  const simulateM03Score = (score: number) => {
    const m03Data = getModuleData('M03') || {};
    updateSubmissionLocal('M03', { ...m03Data, fit_score: score });
  };

  const dynamicPrompt = `"Đóng vai một luật sư thương mại quốc tế, hãy rà soát các điều khoản thanh toán L/C sau đây để chỉ ra rủi ro ẩn giấu cho người bán."`;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(dynamicPrompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      window.open('https://spark.gemini.google.com', '_blank');
    } catch (err) {}
  };

  const learningContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '12px', fontSize: '1.1rem' }}>
          Bài 11: Negotiation & Objection Diagnosis
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
          Nguyên tắc Có đi - Có lại. Không bao giờ nhượng bộ mà không đòi lại một điều khoản khác.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => handleOpenDocument('M04_Bai11.pdf')}
            disabled={loadingFile === 'M04_Bai11.pdf'}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <BookOpen size={16}/> {loadingFile === 'M04_Bai11.pdf' ? 'Đang tải...' : 'Giáo án PDF'}
          </button>
          <button 
            onClick={() => handleOpenVideo('M04_Video11.mp4')}
            disabled={loadingVideo === 'M04_Video11.mp4'}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <Play size={16}/> {loadingVideo === 'M04_Video11.mp4' ? 'Đang tải...' : 'Video Tổng kết'}
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '12px', fontSize: '1.1rem' }}>
          Bài 12: Payment Risk & Safe Order Confirmation
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
          Phân tích các phương thức T/T, L/C, D/P, D/A, CAD, O/A.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => handleOpenDocument('M04_Bai12.pdf')}
            disabled={loadingFile === 'M04_Bai12.pdf'}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <BookOpen size={16}/> {loadingFile === 'M04_Bai12.pdf' ? 'Đang tải...' : 'Giáo án PDF'}
          </button>
          <button 
            onClick={() => handleOpenVideo('M04_Video12.mp4')}
            disabled={loadingVideo === 'M04_Video12.mp4'}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <Play size={16}/> {loadingVideo === 'M04_Video12.mp4' ? 'Đang tải...' : 'Video Tổng kết'}
          </button>
        </div>
      </div>
    </div>
  );

  const aiTutorContent = (
    <div className="flex flex-col gap-4">
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-xl border border-orange-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={20} className="text-orange-600" />
          <h3 className="text-base font-bold text-orange-900">AI Payment Legal Tutor</h3>
        </div>
        <p className="text-sm text-orange-800/80 mb-5 leading-relaxed">
          Phân tích các rủi ro pháp lý và "bẫy" trong thư tín dụng L/C.
        </p>
        <button
          onClick={handleCopyPrompt}
          className="w-full relative group overflow-hidden bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow"
        >
          {isCopied ? <><Check size={16} /> Đã copy</> : <><Copy size={16} /> Copy Prompt & Mở AI</>}
        </button>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <p className="text-xs text-slate-500 font-medium mb-3">DEV TOOL: Giả lập Fit Score từ Module 03 (Test Logic Gate 2)</p>
        <div className="flex gap-2">
          <button onClick={() => simulateM03Score(20)} className="flex-1 py-1.5 px-2 bg-red-100 text-red-700 rounded text-xs font-bold border border-red-200 hover:bg-red-200 transition-colors">
            Set M03 = 20đ (Fail)
          </button>
          <button onClick={() => simulateM03Score(80)} className="flex-1 py-1.5 px-2 bg-green-100 text-green-700 rounded text-xs font-bold border border-green-200 hover:bg-green-200 transition-colors">
            Set M03 = 80đ (Pass)
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center">Score hiện tại: <span className="font-bold">{m03MockScore}đ</span></p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Module 04: Đàm phán & Chốt Deal</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Kỹ thuật đàm phán, chốt hợp đồng và quản trị rủi ro thanh toán</p>
      </header>

      <ModuleLayout 
        moduleTitle="Module 04: Đàm phán & Chốt Deal"
        learningContent={learningContent}
        formContent={<M04_B12_RiskPayment />}
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
              disabled={!isValid || isSubmitting}
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
