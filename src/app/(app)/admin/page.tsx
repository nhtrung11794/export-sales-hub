'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Check, X, ShieldAlert } from 'lucide-react';

type UserProfile = {
  id: string;
  email: string;
  approval_status: string;
  role: string;
  created_at?: string;
};

export default function AdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    
    // Kiểm tra quyền Admin trước
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push('/login');
      return;
    }
    
    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
      
    if (currentUser?.role !== 'admin') {
      setError("Bạn không có quyền truy cập trang này.");
      setLoading(false);
      return;
    }

    // Lấy danh sách chờ duyệt
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('approval_status', 'pending');
      
    if (error) {
      setError("Lỗi khi tải danh sách: " + error.message);
    } else {
      setUsers(data || []);
    }
    
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ approval_status: 'approved' })
        .eq('id', id);
        
      if (error) throw error;
      
      // Xóa khỏi danh sách hiện tại
      setUsers(users.filter(u => u.id !== id));
      alert("Đã duyệt tài khoản thành công!");
    } catch (err: any) {
      alert("Lỗi khi duyệt: " + err.message);
    }
  };

  const handleReject = async (id: string) => {
    const confirmReject = window.confirm("Bạn có chắc chắn muốn từ chối tài khoản này?");
    if (!confirmReject) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ approval_status: 'rejected' })
        .eq('id', id);
        
      if (error) throw error;
      
      // Xóa khỏi danh sách hiện tại
      setUsers(users.filter(u => u.id !== id));
    } catch (err: any) {
      alert("Lỗi khi từ chối: " + err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px', color: 'var(--text-secondary)' }}>
        Đang tải dữ liệu...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <ShieldAlert size={48} color="var(--accent-danger)" style={{ marginBottom: '16px' }} />
        <h2 style={{ color: 'var(--accent-danger)', marginBottom: '8px' }}>Lỗi truy cập</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        <button onClick={() => router.push('/')} className="btn btn-primary" style={{ marginTop: '24px' }}>
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', marginBottom: '8px' }}>
        Quản trị viên
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Phê duyệt các tài khoản đăng ký mới để cấp quyền truy cập vào hệ thống.
      </p>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
          Danh sách chờ duyệt ({users.length})
        </h2>
        
        {users.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Hiện không có tài khoản nào đang chờ duyệt.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {users.map(user => (
              <div key={user.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '16px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '4px' }}>
                    {user.email || 'Không có email'}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    ID: <span style={{ fontFamily: 'monospace' }}>{user.id}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleApprove(user.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                  >
                    <Check size={16} /> Duyệt
                  </button>
                  
                  <button 
                    onClick={() => handleReject(user.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: 'var(--accent-danger)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                  >
                    <X size={16} /> Từ chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
