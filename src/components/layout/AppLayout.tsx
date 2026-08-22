'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Tổng quan (Dashboard)', path: '/' },
    { name: 'Module 01: Hồ sơ năng lực', path: '/m01' },
    { name: 'Module 02: Phân tích Thị trường', path: '/m02' },
    { name: 'Module 03: Hiểu người Mua', path: '/m03' },
    { name: 'Module 04: Quy trình Bán hàng', path: '/m04' },
    { name: 'Module 05: Kế hoạch Hành động', path: '/m05' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* SIDEBAR */}
      <div style={{
        width: '280px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <div style={{ padding: '0 24px', marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.25rem', margin: 0, lineHeight: '1.4' }}>
            Export Sales<br/>Interactive Hub
          </h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Workstation B2B
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '8px 12px', marginBottom: '4px' }}>
            Hành trình Học tập
          </div>
          
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  fontWeight: isActive ? 'bold' : 'normal',
                  transition: 'all 0.2s ease',
                  borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent'
                }}
              >
                {item.name}
              </Link>
            );
          })}

          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '8px 12px', marginTop: '24px', marginBottom: '4px' }}>
            Hỗ trợ & Công cụ
          </div>
          <a 
            href="#"
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📚 Tài liệu Tham khảo
          </a>
          <a 
            href="https://notebooklm.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ✨ Trợ lý AI (NotebookLM)
          </a>
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', 
              padding: '10px', 
              background: 'transparent', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-secondary)', 
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-danger)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, marginLeft: '280px', width: 'calc(100% - 280px)' }}>
        {children}
      </div>
    </div>
  );
}
