'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Share2, Printer } from 'lucide-react';
import LinkedInPluginGuide from '@/components/modules/m03/LinkedInPluginGuide';

export default function LinkedInPluginGuidePage() {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Hướng Dẫn ChatGPT + LinkedIn Plugin Sourcing B2B',
        text: 'Quy trình 4 bước cào data khách hàng & Decision Makers chuẩn RCTO',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép liên kết vào bộ nhớ tạm!');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary, #090d16)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Navbar */}
      <header style={{
        padding: '12px 24px',
        background: 'rgba(15, 23, 42, 0.9)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link
            href="/m03"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              color: '#94a3b8',
              textDecoration: 'none',
              padding: '6px 10px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <ArrowLeft size={14} /> Quay lại Module 03
          </Link>
          <div style={{ height: '16px', width: '1px', background: 'rgba(255,255,255,0.2)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#cbd5e1' }}>
            <BookOpen size={15} color="#38bdf8" />
            <span>Cẩm Nang Hướng Dẫn Kỹ Thuật Số (Digital Handbook)</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleShare}
            className="btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.78rem',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#e2e8f0',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer'
            }}
          >
            <Share2 size={13} /> Chia sẻ liên kết
          </button>
        </div>
      </header>

      {/* Main Guide View */}
      <main style={{ flex: 1, padding: '20px', maxWidth: '1440px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        <div style={{
          height: 'calc(100vh - 110px)',
          minHeight: '750px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <LinkedInPluginGuide isStandalone={true} />
        </div>
      </main>
    </div>
  );
}
