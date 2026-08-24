'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useModuleStore } from '@/store/useModuleStore';
import { Clock, Lock, CheckCircle2, PlayCircle, BarChart3, Globe2, Users, GitMerge, Rocket, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { getModuleData } = useModuleStore();

  // Mockup dữ liệu Countdown cho GRACE_PERIOD
  const [timeLeft, setTimeLeft] = useState({ days: 15, hours: 4, mins: 30, secs: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tính toán trạng thái các Module dựa trên Global Store (Zustand)
  const hasData = (moduleId: string) => {
    // Module ID trong DB được lưu in hoa (VD: 'M01', 'M02') 
    // trong khi đó route path là chữ thường ('m01')
    return !!getModuleData(moduleId.toUpperCase() as any);
  };

  const modules = [
    { 
      id: 'm01', 
      name: 'Module 01: Mindset nền tảng Sales XK', 
      desc: 'B1: Tư duy mới | B2: Bản chất nghề',
      totalLessons: 2,
      icon: <BarChart3 size={24} className="text-accent" />,
      status: hasData('m01') ? 'completed' : 'active'
    },
    { 
      id: 'm02', 
      name: 'Module 02: Thị trường & Khách hàng', 
      desc: 'B3: Thị trường | B4: ICP | B5: Đối thủ',
      totalLessons: 3,
      icon: <Globe2 size={24} className="text-accent" />,
      status: hasData('m02') ? 'completed' : (hasData('m01') ? 'active' : 'locked')
    },
    { 
      id: 'm03', 
      name: 'Module 03: Cơ hội & Quản trị Pipeline', 
      desc: 'B6: Prospecting | B7: Scoring | B8: Clarification',
      totalLessons: 3,
      icon: <Users size={24} className="text-accent" />,
      status: hasData('m03') ? 'completed' : (hasData('m02') ? 'active' : 'locked')
    },
    { 
      id: 'm04', 
      name: 'Module 04: Giao tiếp & Chốt giao dịch', 
      desc: 'B9: Proposal | B10: Đàm phán | B11: Trade-off | B12: Closing',
      totalLessons: 4,
      icon: <GitMerge size={24} className="text-accent" />,
      status: 'locked'
    },
    { 
      id: 'm05', 
      name: 'Module 05: Thực thi & Sau bán', 
      desc: 'B13: Execution | B14: Khủng hoảng | B15: Mở rộng',
      totalLessons: 3,
      icon: <Rocket size={24} className="text-accent" />,
      status: 'locked'
    },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh' }}>
      
      {/* 1. HERO SECTION & COUNTDOWN TIMER */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '40px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '40px',
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%)',
          borderLeft: '4px solid var(--accent-primary)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(14, 165, 233, 0.05)'
        }}
      >
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 800, textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
            Chào mừng trở lại, <span style={{ color: 'var(--accent-primary)', textShadow: '0 0 15px var(--accent-glow)' }}>Nhà xuất khẩu!</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '600px' }}>
            Bạn đang trong <strong style={{ color: 'var(--accent-secondary)', textShadow: '0 0 10px var(--accent-secondary-glow)' }}>Giai đoạn Nộp bài (Grace Period)</strong>. 
            Hãy hoàn thành 15 buổi học và kết xuất 3 Cẩm nang Vận hành (Playbooks) để được Giảng viên chấm điểm.
          </p>
        </div>
        
        {/* COUNTDOWN */}
        <div className="animate-glow" style={{ 
          background: 'rgba(2, 6, 23, 0.6)', 
          padding: '24px', 
          borderRadius: '16px', 
          border: '1px solid rgba(249, 115, 22, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: 'var(--shadow-glow-orange)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-secondary)', marginBottom: '16px', fontWeight: 'bold', textShadow: '0 0 8px var(--accent-secondary-glow)' }}>
            <Clock size={20} className="animate-pulse-slow" />
            THỜI GIAN KHÓA SỔ CÒN LẠI
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            {[
              { label: 'Ngày', value: timeLeft.days },
              { label: 'Giờ', value: timeLeft.hours },
              { label: 'Phút', value: timeLeft.mins },
              { label: 'Giây', value: timeLeft.secs }
            ].map((item, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)',
                  background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px',
                  minWidth: '64px', borderBottom: '2px solid var(--accent-secondary)'
                }}>
                  {item.value.toString().padStart(2, '0')}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. PROGRESS TRACKER (15 BUỔI) */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          Tiến độ 15 Buổi học
          <span style={{ fontSize: '0.9rem', padding: '4px 12px', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', borderRadius: '20px' }}>
            Lộ trình B2B Sales
          </span>
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {modules.map((mod, index) => {
            const isCompleted = mod.status === 'completed';
            const isActive = mod.status === 'active';
            const isLocked = mod.status === 'locked';
            
            // Tính số bài hoàn thành mockup (nếu complete thì full, nếu active thì 1 nửa, locked thì 0)
            const completedLessons = isCompleted ? mod.totalLessons : (isActive ? 1 : 0);
            const progressPercent = (completedLessons / mod.totalLessons) * 100;

            return (
              <div 
                key={mod.id}
                className="glass-panel"
                style={{ 
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  borderLeft: isActive ? '4px solid var(--accent-primary)' : '4px solid transparent',
                  opacity: isLocked ? 0.5 : 1,
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s'
                }}
                onClick={() => {
                  if (!isLocked) router.push(`/${mod.id}`);
                }}
                onMouseOver={(e) => {
                  if (!isLocked) e.currentTarget.style.transform = 'translateX(8px)';
                }}
                onMouseOut={(e) => {
                  if (!isLocked) e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {/* Icon */}
                <div style={{ 
                  width: '64px', height: '64px', borderRadius: '50%', 
                  background: isCompleted ? 'rgba(16, 185, 129, 0.1)' : (isActive ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.05)'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isCompleted ? 'var(--accent-success)' : (isActive ? 'var(--accent-primary)' : 'var(--text-muted)')
                }}>
                  {isLocked ? <Lock size={28} /> : (isCompleted ? <CheckCircle2 size={28} /> : mod.icon)}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>{mod.name}</h3>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {completedLessons} / {mod.totalLessons} Bài
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '16px' }}>
                    {mod.desc}
                  </p>
                  
                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${progressPercent}%`, 
                      height: '100%', 
                      background: isCompleted ? 'var(--accent-success)' : 'var(--accent-primary)',
                      transition: 'width 0.5s ease-in-out'
                    }}></div>
                  </div>
                </div>

                {/* Action Button */}
                {!isLocked && (
                  <div style={{ paddingLeft: '24px', borderLeft: '1px solid var(--border-color)' }}>
                    <button 
                      className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
                    >
                      {isCompleted ? 'Ôn tập lại' : 'Tiếp tục học'}
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
