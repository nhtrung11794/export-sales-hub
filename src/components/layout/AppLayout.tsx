'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useModuleStore } from '@/store/useModuleStore';
import { 
  LayoutDashboard, 
  UserCircle, 
  Globe2, 
  Users, 
  GitMerge, 
  Rocket,
  BookOpen,
  Sparkles,
  LogOut,
  ChevronRight
} from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isHovered, setIsHovered] = useState(false);

  const { fetchAllSubmissions, isLoading: isStoreLoading } = useModuleStore();

  useEffect(() => {
    const initStore = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await fetchAllSubmissions(session.user.id);
      }
    };
    initStore();
  }, [supabase, fetchAllSubmissions]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Tổng quan (Dashboard)', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Module 01: Mindset nền tảng Sales XK', path: '/m01', icon: <UserCircle size={20} /> },
    { name: 'Module 02: Thị trường & Khách hàng', path: '/m02', icon: <Globe2 size={20} /> },
    { name: 'Module 03: Cơ hội & Quản trị Pipeline', path: '/m03', icon: <Users size={20} /> },
    { name: 'Module 04: Giao tiếp & Chốt giao dịch', path: '/m04', icon: <GitMerge size={20} /> },
    { name: 'Module 05: Thực thi & Sau bán', path: '/m05', icon: <Rocket size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      
      {/* THAY THẾ CHO SIDEBAR ĐỂ DỮ CHỖ (DUMMY SIDEBAR) */}
      <div style={{ width: '70px', flexShrink: 0 }}></div>

      {/* AUTO-COLLAPSE SIDEBAR (OVERLAY) */}
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: isHovered ? '280px' : '70px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 0',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 50,
          overflowX: 'hidden',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isHovered ? '4px 0 24px rgba(0,0,0,0.5)' : 'none'
        }}
      >
        {/* LOGO AREA */}
        <div style={{ padding: '0 24px', marginBottom: '32px', display: 'flex', alignItems: 'center', height: '48px' }}>
          <div style={{ 
            width: '22px', 
            height: '22px', 
            background: 'var(--accent-primary)', 
            borderRadius: '4px',
            flexShrink: 0,
            marginRight: '16px'
          }}></div>
          
          <div style={{ 
            opacity: isHovered ? 1 : 0, 
            transition: 'opacity 0.2s',
            whiteSpace: 'nowrap'
          }}>
            <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.1rem', margin: 0, lineHeight: '1.2' }}>
              Export Sales<br/>Hub
            </h2>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px' }}>
          <div style={{ 
            fontSize: '0.65rem', 
            fontWeight: 'bold', 
            color: 'var(--text-muted)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            padding: '8px 12px', 
            marginBottom: '4px',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s',
            whiteSpace: 'nowrap',
            height: '24px' // Prevent layout shift when invisible
          }}>
            {isHovered ? 'Hành trình Học tập' : ''}
          </div>
          
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderLeft: isActive ? '4px solid var(--accent-primary)' : '4px solid transparent',
                  boxShadow: isActive ? 'inset 0 0 10px rgba(14, 165, 233, 0.05), 0 0 15px rgba(14, 165, 233, 0.1)' : 'none',
                  whiteSpace: 'nowrap'
                }}
                title={!isHovered ? item.name : undefined}
                onMouseOver={(e) => {
                  if(!isActive) {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }
                }}
                onMouseOut={(e) => {
                  if(!isActive) {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', textShadow: isActive ? '0 0 10px var(--accent-glow)' : 'none' }}>
                  {item.icon}
                </div>
                <span style={{ 
                  marginLeft: '16px', 
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.2s',
                  display: isHovered ? 'inline-block' : 'none'
                }}>
                  {item.name}
                </span>
              </Link>
            );
          })}

          <div style={{ 
            fontSize: '0.65rem', 
            fontWeight: 'bold', 
            color: 'var(--text-muted)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            padding: '8px 12px', 
            marginTop: '24px', 
            marginBottom: '4px',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s',
            whiteSpace: 'nowrap',
            height: '24px'
          }}>
            {isHovered ? 'Hỗ trợ & Công cụ' : ''}
          </div>
          <a 
            href="#"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 14px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s ease',
              borderLeft: '3px solid transparent',
              whiteSpace: 'nowrap'
            }}
            title="Tài liệu Tham khảo"
          >
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
              <BookOpen size={20} />
            </div>
            <span style={{ 
              marginLeft: '16px',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.2s',
              display: isHovered ? 'inline-block' : 'none'
            }}>
              Tài liệu Tham khảo
            </span>
          </a>
          <a 
            href="https://notebooklm.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 14px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s ease',
              borderLeft: '3px solid transparent',
              whiteSpace: 'nowrap'
            }}
            title="Trợ lý AI (NotebookLM)"
          >
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
              <Sparkles size={20} style={{ color: 'var(--accent-warning)' }} />
            </div>
            <span style={{ 
              marginLeft: '16px',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.2s',
              display: isHovered ? 'inline-block' : 'none'
            }}>
              Trợ lý AI (NotebookLM)
            </span>
          </a>
        </nav>

        {/* LOGOUT BUTTON */}
        <div style={{ padding: '24px 12px', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', 
              padding: '12px 14px', 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-secondary)', 
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              borderLeft: '3px solid transparent'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = 'var(--accent-danger)';
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.background = 'transparent';
            }}
            title="Đăng xuất"
          >
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
              <LogOut size={20} />
            </div>
            <span style={{ 
              marginLeft: '16px',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.2s',
              display: isHovered ? 'inline-block' : 'none',
              whiteSpace: 'nowrap'
            }}>
              Đăng xuất
            </span>
          </button>
        </div>

        {/* Cửa sổ gợi ý mở rộng (Chevron) */}
        {!isHovered && (
          <div style={{
            position: 'absolute',
            top: '50%',
            right: '-12px',
            transform: 'translateY(-50%)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            padding: '4px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ChevronRight size={14} />
          </div>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, width: 'calc(100% - 70px)' }}>
        {children}
      </div>
    </div>
  );
}
