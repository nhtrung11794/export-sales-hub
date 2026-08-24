'use client';

import React, { useState, useEffect } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import M2_MarketForm from '@/components/modules/m02/M2_MarketForm';
import { supabase } from '@/lib/supabase';
import { useModuleStore } from '@/store/useModuleStore';
import { Copy, Check, Play, BookOpen, X } from 'lucide-react';
import { Rnd } from 'react-rnd';

export default function Module02Page() {
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Trạng thái cho Video PiP
  const [pipVideoUrl, setPipVideoUrl] = useState<string | null>(null);
  
  const [isCopied, setIsCopied] = useState(false);
  const { getModuleData } = useModuleStore();

  const [formData, setFormData] = useState({
    targetMarket: '[Quốc gia]',
    icpCompanySize: '[Quy mô/Phân khúc]',
    competitor1: '[Tên đối thủ]'
  });

  // Quét dữ liệu từ Store mỗi 1 giây
  useEffect(() => {
    const interval = setInterval(() => {
      const data = getModuleData('M02');
      if (data) {
        setFormData({
          targetMarket: data.target_market || '[Quốc gia]',
          icpCompanySize: data.icp?.company_size || '[Quy mô/Phân khúc]',
          competitor1: data.competitors?.[0]?.name || '[Tên đối thủ]'
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [getModuleData]);

  const dynamicPrompt = `"Tôi đang muốn xuất khẩu sản phẩm sang thị trường ${formData.targetMarket}. Khách hàng mục tiêu của tôi là ${formData.icpCompanySize}. Hãy phân tích điểm mạnh và điểm yếu của đối thủ ${formData.competitor1} tại thị trường này để tôi có chiến lược cạnh tranh tốt hơn."`;

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
      
      {/* BÀI 03 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '12px', fontSize: '1.1rem' }}>
          Bài 03 - Lựa chọn Thị trường Mục tiêu
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
          "Đừng bán thứ bạn có, hãy bán thứ thị trường cần". Bài học này hướng dẫn bạn cách thu hẹp phạm vi, đánh giá rào cản thương mại và lựa chọn quốc gia phù hợp nhất.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => handleOpenDocument('M02_Bai03.pdf')}
            disabled={loadingFile === 'M02_Bai03.pdf'}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <BookOpen size={16}/> {loadingFile === 'M02_Bai03.pdf' ? 'Đang tải...' : 'Giáo án PDF'}
          </button>
          <button 
            onClick={() => handleOpenVideo('M02_Video03.mp4')}
            disabled={loadingVideo === 'M02_Video03.mp4'}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <Play size={16}/> {loadingVideo === 'M02_Video03.mp4' ? 'Đang tải...' : 'Video Tổng kết'}
          </button>
        </div>
      </div>
      
      {/* BÀI 04 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '12px', fontSize: '1.1rem' }}>
          Bài 04 - Vẽ chân dung Khách hàng (ICP)
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
          Khách hàng B2B của bạn là ai? Nhà nhập khẩu sỉ, nhà phân phối hay chuỗi siêu thị? Phân tích chính xác Nỗi đau (Pain points) và Nhu cầu (Needs).
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => handleOpenDocument('M02_Bai04.pdf')}
            disabled={loadingFile === 'M02_Bai04.pdf'}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <BookOpen size={16}/> {loadingFile === 'M02_Bai04.pdf' ? 'Đang tải...' : 'Giáo án PDF'}
          </button>
          <button 
            onClick={() => handleOpenVideo('M02_Video04.mp4')}
            disabled={loadingVideo === 'M02_Video04.mp4'}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <Play size={16}/> {loadingVideo === 'M02_Video04.mp4' ? 'Đang tải...' : 'Video Tổng kết'}
          </button>
        </div>
      </div>

      {/* BÀI 05 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '12px', fontSize: '1.1rem' }}>
          Bài 05 - Phân tích Đối thủ Cạnh tranh
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
          Nhận diện đối thủ cạnh tranh trực tiếp và gián tiếp trên thị trường mục tiêu. Tìm ra khoảng trống thị trường (Market Gap) để chen chân vào.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => handleOpenDocument('M02_Bai05.pdf')}
            disabled={loadingFile === 'M02_Bai05.pdf'}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <BookOpen size={16}/> {loadingFile === 'M02_Bai05.pdf' ? 'Đang tải...' : 'Giáo án PDF'}
          </button>
          <button 
            onClick={() => handleOpenVideo('M02_Video05.mp4')}
            disabled={loadingVideo === 'M02_Video05.mp4'}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <Play size={16}/> {loadingVideo === 'M02_Video05.mp4' ? 'Đang tải...' : 'Video Tổng kết'}
          </button>
        </div>
      </div>

    </div>
  );

  const aiTutorContent = (
    <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--accent-warning)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        Bạn không biết đối thủ cạnh tranh của mình là ai? Hãy dùng Prompt dưới đây (tự động lấy keywords bạn vừa nhập) và gửi cho NotebookLM nhé!
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
        href="https://notebooklm.google.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="btn" 
        style={{ 
          display: 'block', textAlign: 'center', background: 'var(--accent-warning)', 
          color: 'var(--bg-primary)', fontWeight: 'bold', padding: '12px'
        }}
      >
        Mở NotebookLM M02 ➔
      </a>
    </div>
  );

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Module 02</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Phân tích Thị trường & Chân dung Khách hàng B2B (ICP)</p>
      </header>

      <ModuleLayout 
        moduleTitle="Module 02: Thị trường & Khách hàng"
        learningContent={learningContent}
        formContent={<M2_MarketForm />}
        aiTutorContent={aiTutorContent}
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
            {/* PiP Header (Nắm kéo / Nút Đóng) */}
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
            {/* PiP Body (HTML5 Video) */}
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
