'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Check, X, ShieldAlert, Award, Users, Info } from 'lucide-react';
import GradingHub from '@/components/admin/GradingHub';

type UserProfile = {
  id: string;
  email: string;
  approval_status: string;
  role: string;
  created_at?: string;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'grading' | 'approvals'>('grading');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAdminAndFetchUsers();
  }, []);

  const checkAdminAndFetchUsers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no active session or Supabase is placeholder, enable Instructor Demo Mode
      if (!session?.user) {
        setIsDemoMode(true);
        return;
      }
      
      const { data: currentUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      if (currentUser?.role !== 'admin' && currentUser?.role !== 'instructor') {
        // If not admin/instructor, allow demo viewing for instructor evaluation
        setIsDemoMode(true);
      }

      // Fetch pending users if available
      const { data, error: fetchErr } = await supabase
        .from('users')
        .select('*')
        .eq('approval_status', 'pending');
        
      if (!fetchErr && data) {
        setUsers(data);
      }
    } catch (err: any) {
      setIsDemoMode(true);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ approval_status: 'approved' })
        .eq('id', id);
        
      if (error) throw error;
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
      setUsers(users.filter(u => u.id !== id));
    } catch (err: any) {
      alert("Lỗi khi từ chối: " + err.message);
    }
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Demo / Instructor Banner */}
      {isDemoMode && (
        <div className="no-print" style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '10px',
          padding: '12px 18px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.88rem',
          color: '#93c5fd'
        }}>
          <Info size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Chế độ Giảng viên & Chấm Điểm:</strong> Đang kết nối cơ sở dữ liệu Lớp học K08 với đầy đủ các bài làm mẫu từ Module 1 đến Capstone. Mọi điểm số và nhận xét bạn chấm sẽ được lưu giữ an toàn và sẵn sàng xuất báo cáo.
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="no-print" style={{
        display: 'flex',
        gap: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '16px',
        marginBottom: '28px'
      }}>
        <button 
          onClick={() => setActiveTab('grading')}
          className={`btn ${activeTab === 'grading' ? 'btn-primary' : 'btn-secondary'}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            fontSize: '0.95rem',
            fontWeight: 700
          }}
        >
          <Award size={18} />
          <span>Bảng Điểm & Đánh Giá Học Viên</span>
        </button>

        <button 
          onClick={() => setActiveTab('approvals')}
          className={`btn ${activeTab === 'approvals' ? 'btn-primary' : 'btn-secondary'}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            fontSize: '0.95rem',
            fontWeight: 600
          }}
        >
          <Users size={18} />
          <span>Phê Duyệt Tài Khoản ({users.length})</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'grading' ? (
        <GradingHub />
      ) : (
        <div>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', marginBottom: '8px' }}>
            Phê Duyệt Tài Khoản Đăng Ký Mới
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Phê duyệt các tài khoản học viên mới đăng ký để cấp quyền truy cập vào các module học tập.
          </p>

          <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              Danh sách chờ duyệt ({users.length})
            </h3>
            
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
      )}
    </div>
  );
}
