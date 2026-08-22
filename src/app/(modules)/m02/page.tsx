'use client';

import React, { useState } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import M2_MarketForm from '@/components/modules/m02/M2_MarketForm';
import { useRouter } from 'next/navigation';

export default function Module02Page() {
  const router = useRouter();
  const [previewPdf, setPreviewPdf] = useState<string | null>(null);

  // Nội dung học tập của Module 2
  const learningContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Bài 1 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '12px' }}>
          Bài 01 - Lựa chọn Thị trường Mục tiêu
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.6' }}>
          "Đừng bán thứ bạn có, hãy bán thứ thị trường cần". Bài học này hướng dẫn bạn cách thu hẹp phạm vi, đánh giá rào cản thương mại và lựa chọn quốc gia phù hợp nhất với năng lực sản xuất của nhà máy.
        </p>
        <button 
          className="btn btn-secondary" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          onClick={() => setPreviewPdf('https://nbviewer.org/github/nhtrung11794/export-sales-hub/blob/main/docs/M2_Bai01_ThiTruong.pdf')}
        >
          📄 Mở tài liệu đọc thêm
        </button>
      </div>

      {/* Bài 2 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '12px' }}>
          Bài 02 - Vẽ chân dung Khách hàng (ICP)
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.6' }}>
          Khách hàng B2B của bạn là ai? Nhà nhập khẩu sỉ, nhà phân phối hay chuỗi siêu thị? Phân tích chính xác Nỗi đau (Pain points) và Nhu cầu (Needs) để có chiến lược tiếp cận hiệu quả.
        </p>
        <button 
          className="btn btn-secondary" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          onClick={() => setPreviewPdf('https://nbviewer.org/github/nhtrung11794/export-sales-hub/blob/main/docs/M2_Bai02_ICP.pdf')}
        >
          📄 Mở tài liệu đọc thêm
        </button>
      </div>
      
    </div>
  );

  // Nội dung AI Tutor cho M2
  const aiTutorContent = (
    <div className="glass-panel" style={{ padding: '20px', border: '1px solid var(--accent-warning)', background: 'linear-gradient(180deg, rgba(245,158,11,0.05) 0%, rgba(0,0,0,0) 100%)' }}>
      <p style={{ fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.5' }}>
        Bạn không biết đối thủ cạnh tranh của mình là ai tại Mỹ? Hãy copy Prompt dưới đây và gửi cho NotebookLM để tìm kiếm nhanh nhé!
      </p>
      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginBottom: '16px' }}>
        "Tôi đang muốn xuất khẩu sản phẩm [tên sản phẩm] sang thị trường [quốc gia]. Hãy liệt kê giúp tôi 3 đối thủ cạnh tranh lớn nhất đang cung cấp sản phẩm này tại đó, kèm theo điểm mạnh và điểm yếu của họ dựa trên tài liệu khóa học."
      </div>
      <button 
        className="btn" 
        style={{ width: '100%', background: 'var(--accent-warning)', color: 'var(--bg-primary)', fontWeight: 'bold' }}
        onClick={() => window.open('https://notebooklm.google.com/', '_blank')}
      >
        Mở NotebookLM M02
      </button>
    </div>
  );

  return (
    <div style={{ padding: '24px', height: 'calc(100vh - 64px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header riêng của Module */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => router.push('/dashboard')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem', padding: '0 8px' }}
              title="Quay lại Dashboard"
            >
              ←
            </button>
            Module 02
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Phân tích Thị trường & Chân dung Khách hàng B2B (ICP)</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={() => router.push('/m03')}>
            Tiếp tục: Module 03 ➔
          </button>
        </div>
      </div>

      <ModuleLayout 
        moduleTitle="Module 02"
        learningContent={learningContent}
        formContent={<M2_MarketForm />}
        aiTutorContent={aiTutorContent}
        previewUrl={previewPdf}
        onClosePreview={() => setPreviewPdf(null)}
      />
    </div>
  );
}
