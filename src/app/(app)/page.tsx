'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  const modules = [
    { id: 'm01', name: 'Module 01: Hồ sơ năng lực', desc: 'Đánh giá năng lực cốt lõi và tư duy B2B Sales', status: 'completed' },
    { id: 'm02', name: 'Module 02: Phân tích Thị trường', desc: 'Chọn thị trường và chân dung khách hàng (ICP)', status: 'active' },
    { id: 'm03', name: 'Module 03: Hiểu người Mua', desc: 'Phân tích hành vi mua hàng và nhu cầu', status: 'locked' },
    { id: 'm04', name: 'Module 04: Quy trình Bán hàng', desc: 'Xây dựng phễu và kỹ năng chốt sale', status: 'locked' },
    { id: 'm05', name: 'Module 05: Kế hoạch Hành động', desc: 'Lên kế hoạch 90 ngày thực chiến', status: 'locked' },
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
            Sales Xuất Khẩu Chuyên Sâu
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '16px', fontSize: '1.05rem' }}>
            Website này là không gian học tập tổng hợp dành cho học viên khóa Sales xuất khẩu chuyên sâu. Tại đây, học viên có thể xem lại nội dung từng buổi, ôn tập theo module, tải tài liệu, hoàn thiện workbook, làm bài tập và nộp bài để phục vụ quá trình đánh giá cuối khóa.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '16px', fontSize: '1.05rem' }}>
            Khóa học đi theo toàn bộ hành trình sales xuất khẩu thực tế: từ tư duy nghề, nghiên cứu thị trường, hiểu buyer, prospecting, qualification, pipeline, clarification, proposal, negotiation, safe closing, execution, issue recovery đến account growth.
          </p>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--accent-primary)', marginBottom: '16px' }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>Mục tiêu cốt lõi:</strong>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Giúp học viên không chỉ "học xong buổi học", mà có thể quay lại ôn tập, thực hành bằng toolset và từng bước áp dụng vào công việc sales xuất khẩu thực tế.
            </span>
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            - Nội dung được hệ thống hóa bởi GV. Trung -
          </div>
        </div>
      </div>

      {/* TẦNG 2: 5 MODULE HỌC TẬP */}
      <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '24px' }}>Hành trình Học tập</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        {modules.map((mod) => (
          <div 
            key={mod.id}
            className="glass-panel"
            style={{ 
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              border: mod.status === 'active' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
              opacity: mod.status === 'locked' ? 0.6 : 1,
              transition: 'transform 0.2s ease, border-color 0.2s',
              cursor: mod.status !== 'locked' ? 'pointer' : 'default'
            }}
            onClick={() => {
              if (mod.status !== 'locked') router.push(`/${mod.id}`);
            }}
            onMouseOver={(e) => {
              if (mod.status !== 'locked') {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }
            }}
            onMouseOut={(e) => {
              if (mod.status !== 'locked') {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = mod.status === 'active' ? 'var(--accent-primary)' : 'var(--border-color)';
              }
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', margin: 0 }}>{mod.name}</h3>
              {mod.status === 'completed' && <span style={{ color: 'var(--accent-success)', fontSize: '1.2rem' }}>✓</span>}
              {mod.status === 'locked' && <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>🔒</span>}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', flex: 1 }}>
              {mod.desc}
            </p>
            {mod.status !== 'locked' && (
              <button 
                className={mod.status === 'active' ? "btn btn-primary" : "btn btn-secondary"}
                style={{ width: '100%', fontSize: '0.9rem', padding: '8px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/${mod.id}`);
                }}
              >
                {mod.status === 'active' ? 'Tiếp tục học' : 'Ôn tập lại'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* TẦNG 3: NGHIỆP VỤ THƯƠNG MẠI QUỐC TẾ */}
      <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '24px' }}>Nghiệp vụ Thương mại Quốc tế</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
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
              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => window.open('https://notebooklm.google.com/', '_blank')}>
                Hỏi AI ➔
              </button>
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Thanh toán Quốc tế</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>LC, T/T, D/P, D/A...</span>
              </div>
              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => window.open('https://notebooklm.google.com/', '_blank')}>
                Hỏi AI ➔
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
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              Mở tài liệu ➔
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
