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

  const { fetchAllSubmissions, isLoading: isStoreLoading, submissions } = useModuleStore();

  const isUnlocked = (moduleId: string) => {
    if (moduleId === 'DASHBOARD' || moduleId === 'M01') return true;
    
    // Yêu cầu: Tạm khóa toàn bộ các Module còn lại (để hoàn thiện nội dung sau)
    if (moduleId === 'M02') return true;
    if (moduleId === 'M03') return true;
    if (moduleId === 'M04') return true;
    if (moduleId === 'M05') return true;
    
    return true;
  };

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
    { id: 'DASHBOARD', name: 'Tổng quan (Dashboard)', path: '/', icon: <LayoutDashboard size={20} /> },
    { id: 'M01', name: 'Module 01: Mindset & Foundation', path: '/m01', icon: <UserCircle size={20} /> },
    { id: 'M02', name: 'Module 02: Market & Customer Understanding', path: '/m02', icon: <Globe2 size={20} /> },
    { id: 'M03', name: 'Module 03: Prospecting & Opportunity Management', path: '/m03', icon: <Users size={20} /> },
    { id: 'M04', name: 'Module 04: Proposal, Negotiation & Safe Closing', path: '/m04', icon: <GitMerge size={20} /> },
    { id: 'M05', name: 'Module 05: Execution, Recovery & Account Growth', path: '/m05', icon: <Rocket size={20} /> },
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
            const unlocked = isUnlocked(item.id);
            
            const sharedStyle: React.CSSProperties = {
              display: 'flex',
              alignItems: 'center',
              padding: '12px 14px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: !unlocked ? 'rgba(255,255,255,0.2)' : (isActive ? 'var(--accent-primary)' : 'var(--text-secondary)'),
              background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              fontWeight: isActive ? 'bold' : 'normal',
              transition: 'all 0.2s ease',
              borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
              whiteSpace: 'nowrap',
              cursor: !unlocked ? 'not-allowed' : 'pointer',
              position: 'relative'
            };

            const innerContent = (
              <>
                <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
                  {item.icon}
                </span>
                <span style={{ 
                  marginLeft: '16px', 
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.2s',
                  display: isHovered ? 'inline-block' : 'none',
                  flex: 1
                }}>
                  {item.name}
                </span>
                
                {!unlocked && isHovered && (
                  <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', opacity: 0.5 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                )}
              </>
            );

            if (unlocked) {
              return (
                <Link key={item.path} href={item.path} style={sharedStyle} title={!isHovered ? item.name : undefined}>
                  {innerContent}
                </Link>
              );
            } else {
              // Module bị khóa
              const alertMsg = (item.id !== 'M02') 
                ? 'Module này đang được xây dựng và sẽ sớm ra mắt!' 
                : 'Module này đang được xây dựng và sẽ sớm ra mắt!';

              return (
                <div key={item.path} onClick={() => alert(alertMsg)} style={sharedStyle} title={!isHovered ? item.name : undefined}>
                  {innerContent}
                </div>
              );
            }
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
            <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
              <BookOpen size={20} />
            </span>
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
            href="https://notebook.google.com/notebook/88777706-546d-411d-86e9-19f0577dae14"
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
            <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
              <Sparkles size={20} style={{ color: 'var(--accent-warning)' }} />
            </span>
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
