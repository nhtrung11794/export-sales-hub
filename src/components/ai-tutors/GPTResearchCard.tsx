'use client';

import React from 'react';
import { ExternalLink, Bot } from 'lucide-react';

export default function GPTResearchCard() {
  const chatGptLink = 'https://chatgpt.com/g/g-6FS44yVyI-market-research-competitor-analysis-expert';

  const handleOpenGpt = () => {
    window.open(chatGptLink, '_blank');
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden', marginTop: '16px' }}>
      {/* Ambient background glow for GPT tutor */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(30px)', zIndex: 0, pointerEvents: 'none' }}></div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Bot size={20} color="#10b981" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Chuyên gia Nghiên cứu Thị trường (GPT)</h3>
        </div>
        
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
          Bạn cần tìm hiểu sâu về đối thủ cạnh tranh và bối cảnh thị trường? Hãy sử dụng trợ lý GPT chuyên biệt này để có kết quả phân tích chính xác nhất.
        </p>
        
        <button
          onClick={handleOpenGpt}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.8), rgba(5,150,105,0.8))',
            color: '#fff', padding: '12px 16px', borderRadius: '8px', border: 'none',
            fontSize: '0.875rem', fontWeight: 'bold', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <ExternalLink size={16} /> Mở Chatbot Nghiên cứu (GPT)
        </button>
      </div>
    </div>
  );
}
