'use client';

import React from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Clock, LogOut } from 'lucide-react';

export default function PendingApprovalPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg-primary)'
    }}>
      <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '48px 32px', textAlign: 'center' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: 'rgba(59, 130, 246, 0.1)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 24px auto'
        }}>
          <Clock size={32} color="var(--accent-primary)" />
        </div>
        
        <h1 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: '16px' }}>
          Tài khoản đang chờ duyệt
        </h1>
        
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '32px' }}>
          Yêu cầu đăng ký của bạn đã được ghi nhận thành công. Tuy nhiên, vì lý do bảo mật, tài khoản cần được phê duyệt bởi Quản trị viên trước khi bạn có thể truy cập vào các khóa học.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Tải lại trang
          </button>
          
          <button 
            onClick={handleLogout}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 'bold',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
