'use client';

import React, { useState } from 'react';
import { Sparkles, Check, Copy } from 'lucide-react';

export default function GeminiSparkCard() {
  const [isCopied, setIsCopied] = useState(false);

  const dynamicPrompt = `"Đóng vai một chuyên gia tư vấn chiến lược B2B, hãy đánh giá mức độ hấp dẫn của thị trường mục tiêu mà tôi vừa nhập, đồng thời chỉ ra 3 rủi ro ẩn giấu nếu tôi muốn đánh vào ngách này."`;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(dynamicPrompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      window.open('https://spark.gemini.google.com', '_blank');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient background glow for AI tutor */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(30px)', zIndex: 0, pointerEvents: 'none' }}></div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Sparkles size={20} color="#a855f7" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>AI Discovery Tutor</h3>
        </div>
        
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
          Bí ý tưởng khi đánh giá rủi ro thị trường? Hãy sao chép câu lệnh dưới đây và nhờ Gemini phân tích giúp bạn!
        </p>
        
        <button
          onClick={handleCopyPrompt}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: 'linear-gradient(135deg, rgba(168,85,247,0.8), rgba(59,130,246,0.8))',
            color: '#fff', padding: '12px 16px', borderRadius: '8px', border: 'none',
            fontSize: '0.875rem', fontWeight: 'bold', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.2)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {isCopied ? <><Check size={16} /> Đã copy thành công</> : <><Copy size={16} /> Copy Prompt & Mở AI</>}
        </button>
      </div>
    </div>
  );
}
