'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useModuleStore } from '@/store/useModuleStore';
import { createClient } from '@/lib/supabase/client';
import { Clock } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const { getModuleData } = useModuleStore();

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [userName, setUserName] = useState('Nhà xuất khẩu');

  useEffect(() => {
    async function fetchUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.email?.split('@')[0] || 'Nhà xuất khẩu');
        
        // Fetch dữ liệu batch_end_date từ bảng profiles
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('batch_end_date')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error("Lỗi khi lấy dữ liệu Supabase:", error.message);
        } else {
          console.log("Dữ liệu Supabase lấy được:", profileData);
        }

        if (profileData && profileData.batch_end_date) {
          const endDate = new Date(profileData.batch_end_date).getTime();
          
          // Set interval for real-time countdown
          const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = endDate - now;
            
            if (distance > 0) {
              setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                secs: Math.floor((distance % (1000 * 60)) / 1000)
              });
            } else {
              clearInterval(timer);
              setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
            }
          }, 1000);
          
          return () => clearInterval(timer);
        } else {
          // Mockup data if no batch_end_date
          const timer = setInterval(() => {
            setTimeLeft(prev => {
              if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
              if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
              if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
              if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
              return { days: 15, hours: 4, mins: 30, secs: 0 }; // Default reset
            });
          }, 1000);
          return () => clearInterval(timer);
        }
      }
    }
    fetchUserData();
  }, [supabase]);

  const hasData = (moduleId: import('@/store/useModuleStore').ModuleId) => {
    const data = getModuleData(moduleId);
    return data && Object.keys(data).length > 0;
  };

  const modules = [
    { 
      id: 'm01',
      storeId: 'M01' as const,
      name: 'Module 01: Hồ sơ năng lực', 
      desc: 'Đánh giá năng lực cốt lõi và tư duy B2B Sales', 
      totalLessons: 2,
      status: hasData('M01') ? 'completed' : 'active' 
    },
    { 
      id: 'm02',
      storeId: 'M02' as const,
      name: 'Module 02: Phân tích Thị trường', 
      desc: 'Chọn thị trường và chân dung khách hàng (ICP)', 
      totalLessons: 3,
      status: hasData('M02') ? 'completed' : (hasData('M01') ? 'active' : 'locked')
    },
    { 
      id: 'm03',
      storeId: 'M03' as const,
      name: 'Module 03: Hiểu người Mua', 
      desc: 'Phân tích hành vi mua hàng và nhu cầu', 
      totalLessons: 3,
      status: hasData('M03') ? 'completed' : (hasData('M02') ? 'active' : 'locked')
    },
    { 
      id: 'm04',
      storeId: 'M04' as const,
      name: 'Module 04: Quy trình Bán hàng', 
      desc: 'Xây dựng phễu và kỹ năng chốt sale', 
      totalLessons: 4,
      status: 'locked' 
    },
    { 
      id: 'm05',
      storeId: 'M05' as const,
      name: 'Module 05: Kế hoạch Hành động', 
      desc: 'Lên kế hoạch 90 ngày thực chiến', 
      totalLessons: 3,
      status: 'locked' 
    },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* TẦNG 1: GIỚI THIỆU GIẢNG VIÊN & KHÓA HỌC */}
      <div className="glass-panel" style={{ padding: '32px', display: 'flex', gap: '32px', marginBottom: '32px', alignItems: 'flex-start' }}>
        {/* Hình ảnh giảng viên */}
        <div style={{ width: '250px', height: '320px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, position: 'relative', border: '2px solid var(--accent-primary)' }}>
          <Image 
            src="/images/instructor.png" 
            alt="GV. Trung" 
            fill 
            style={{ objectFit: 'cover' }}
          />
        </div>
        
        {/* Nội dung giới thiệu */}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '16px' }}>
            Chào mừng trở lại, {userName}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '16px', fontSize: '1.05rem' }}>
            Website này là không gian học tập tổng hợp dành cho học viên khóa Sales xuất khẩu chuyên sâu. Tại đây, học viên có thể xem lại nội dung từng buổi, ôn tập theo module, tải tài liệu, hoàn thiện workbook, làm bài tập và nộp bài để phục vụ quá trình đánh giá cuối khóa.
          </p>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--accent-primary)', marginBottom: '24px' }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>Mục tiêu cốt lõi:</strong>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Giúp học viên không chỉ "học xong buổi học", mà có thể quay lại ôn tập, thực hành bằng toolset và từng bước áp dụng vào công việc sales xuất khẩu thực tế.
            </span>
          </div>
          
          {/* COUNTDOWN TIMER */}
          <div style={{ 
            background: 'rgba(0,0,0,0.4)', 
            padding: '16px 24px', 
            borderRadius: '12px', 
            border: '1px solid rgba(220, 38, 38, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(220, 38, 38, 0.1)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-danger)', marginBottom: '4px', fontWeight: 'bold' }}>
                <Clock size={18} />
                THỜI GIAN KHÓA SỔ CÒN LẠI (GRACE PERIOD)
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hãy hoàn thành tiến độ trước khi khóa truy cập bài tập.</div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { label: 'Ngày', value: timeLeft.days },
                { label: 'Giờ', value: timeLeft.hours },
                { label: 'Phút', value: timeLeft.mins },
                { label: 'Giây', value: timeLeft.secs }
              ].map((item, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)',
                    background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px',
                    minWidth: '50px'
                  }}>
                    {item.value.toString().padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase' }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>

      {/* TẦNG 2: 5 MODULE HỌC TẬP (GRID LAYOUT WITH PROGRESS BAR) */}
      <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '24px' }}>Hành trình Học tập</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        {modules.map((mod) => {
          const isCompleted = mod.status === 'completed';
          const isActive = mod.status === 'active';
          const isLocked = mod.status === 'locked';
          const completedLessons = isCompleted ? mod.totalLessons : (isActive ? 1 : 0);
          const progressPercent = (completedLessons / mod.totalLessons) * 100;

          return (
            <div 
              key={mod.id}
              className="glass-panel"
              style={{ 
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                border: isActive ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                opacity: isLocked ? 0.6 : 1,
                transition: 'transform 0.2s ease, border-color 0.2s',
                cursor: !isLocked ? 'pointer' : 'default',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => {
                if (!isLocked) router.push(`/${mod.id}`);
              }}
              onMouseOver={(e) => {
                if (!isLocked) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                }
              }}
              onMouseOut={(e) => {
                if (!isLocked) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = isActive ? 'var(--accent-primary)' : 'var(--border-color)';
                }
              }}
            >
              {/* Progress Background Indicator */}
              <div style={{ 
                position: 'absolute', top: 0, left: 0, height: '4px', 
                width: `${progressPercent}%`, 
                background: isCompleted ? 'var(--accent-success)' : 'var(--accent-primary)',
                transition: 'width 0.5s ease'
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', margin: 0 }}>{mod.name}</h3>
                {isCompleted && <span style={{ color: 'var(--accent-success)', fontSize: '1.2rem' }}>✓</span>}
                {isLocked && <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>🔒</span>}
              </div>
              
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Tiến độ: <strong style={{ color: 'var(--text-primary)' }}>{completedLessons}/{mod.totalLessons} Bài</strong>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', flex: 1 }}>
                {mod.desc}
              </p>

              {!isLocked && (
                <button 
                  className={isActive ? "btn btn-primary" : "btn btn-secondary"}
                  style={{ width: '100%', fontSize: '0.9rem', padding: '8px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/${mod.id}`);
                  }}
                >
                  {isActive ? 'Tiếp tục học' : 'Ôn tập lại'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* TẦNG 3: NGHIỆP VỤ THƯƠNG MẠI QUỐC TẾ */}
      <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '24px' }}>Bổ trợ nghiệp vụ XNK</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Cột 1: TMQT */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ color: 'var(--accent-primary)', marginBottom: '16px' }}>Thương mại Quốc tế</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Hệ thống kiến thức về Incoterm và các phương thức Thanh toán Quốc tế, tích hợp sẵn Trợ lý AI để giải đáp mọi thắc mắc của bạn.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Incoterms Guide</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hướng dẫn chi tiết các điều kiện giao hàng</span>
              </div>
              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => window.open('https://notebook.google.com/notebook/6a235b2f-f02c-4793-98a7-0dff36af6833', '_blank')}>
                Hỏi AI ➔
              </button>
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Thanh toán Quốc tế</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>LC, T/T, D/P, D/A...</span>
              </div>
              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => window.open('https://notebook.google.com/notebook/6f30bc59-29e3-4211-a44b-32cc74896f0d', '_blank')}>
                Hỏi AI ➔
              </button>
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Tài liệu Tham khảo</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Giáo trình & Văn bản luật TMQT</span>
              </div>
              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => window.open('https://drive.google.com/drive/folders/1m0x1Tg0dmiNI9z-dw5tqYp0dQMHrNH6D?usp=sharing', '_blank')}>
                Mở tài liệu ➔
              </button>
            </div>
          </div>
        </div>

        {/* Cột 2: Tiếng Anh Thương mại */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ color: 'var(--accent-primary)', marginBottom: '16px' }}>Tiếng Anh Thương mại</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Mẫu câu giao tiếp, email template và thuật ngữ chuyên ngành phục vụ đàm phán B2B quốc tế.
          </p>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Business English Docs</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mẫu Email & Kịch bản gọi điện</span>
            </div>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => window.open('https://drive.google.com/drive/folders/1rh7KDLWghS6Hwd5_PKveviJQXzm1FGcv?usp=drive_link', '_blank')}>
              Mở tài liệu ➔
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
