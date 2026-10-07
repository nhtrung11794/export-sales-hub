'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Check, X, Award, Users, Info, GraduationCap, Briefcase, Phone, Mail, UserCheck } from 'lucide-react';
import GradingHub from '@/components/admin/GradingHub';

type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  cohort_batch?: string;
  industry?: string;
  phone?: string;
  approval_status: string;
  role: string;
  created_at?: string;
};

const COHORT_OPTIONS = [
  'K08 - Sales XK B2B Thực Chiến (2026)',
  'K09 - Bứt Phá Doanh Số Xuất Khẩu Toàn Cầu',
  'K10 - Đàm Phán & Deal Desk Quốc Tế Chuyên Sâu',
  'Lớp Doanh Nghiệp In-House (Custom Cohort)'
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'grading' | 'approvals'>('grading');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedCohorts, setSelectedCohorts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAdminAndFetchUsers();
  }, []);

  const checkAdminAndFetchUsers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setIsDemoMode(true);
      }
      
      // 1. Fetch pending from Supabase
      let pendingList: UserProfile[] = [];
      try {
        const { data, error: fetchErr } = await supabase
          .from('users')
          .select('*')
          .eq('approval_status', 'pending');
          
        if (!fetchErr && data) {
          pendingList = data;
        }
      } catch (e) {}

      // 2. Fetch pending from localStorage
      try {
        const localPending = JSON.parse(localStorage.getItem('pending_registrations_v1') || '[]');
        if (Array.isArray(localPending) && localPending.length > 0) {
          // Merge unique by email
          const existingEmails = new Set(pendingList.map(u => u.email));
          localPending.forEach(u => {
            if (!existingEmails.has(u.email)) {
              pendingList.push(u);
            }
          });
        }
      } catch (e) {}

      // Initialize selected cohorts map
      const cohortMap: Record<string, string> = {};
      pendingList.forEach(u => {
        cohortMap[u.id] = u.cohort_batch || COHORT_OPTIONS[0];
      });

      setUsers(pendingList);
      setSelectedCohorts(cohortMap);
    } catch (err: any) {
      setIsDemoMode(true);
    }
  };

  const handleCohortChange = (userId: string, newCohort: string) => {
    setSelectedCohorts(prev => ({ ...prev, [userId]: newCohort }));
  };

  const handleApprove = async (user: UserProfile) => {
    const finalCohort = selectedCohorts[user.id] || user.cohort_batch || COHORT_OPTIONS[0];

    try {
      // 1. Update on Supabase
      try {
        await supabase
          .from('users')
          .update({ 
            approval_status: 'approved', 
            cohort_batch: finalCohort,
            role: 'student' 
          })
          .eq('id', user.id);
      } catch (supaErr) {}

      // 2. Remove from local pending
      try {
        const localPending = JSON.parse(localStorage.getItem('pending_registrations_v1') || '[]');
        const filteredPending = localPending.filter((u: any) => u.id !== user.id && u.email !== user.email);
        localStorage.setItem('pending_registrations_v1', JSON.stringify(filteredPending));
      } catch (e) {}

      // 3. Add to GradingHub student evaluations list if not present
      try {
        const currentEvaluations = JSON.parse(localStorage.getItem('sales_hub_evaluations_v1') || '[]');
        const exists = currentEvaluations.some((s: any) => s.email === user.email);
        if (!exists) {
          const newStudentEntry = {
            id: `sub_${Date.now()}`,
            studentId: user.id,
            fullName: user.full_name || user.email.split('@')[0],
            email: user.email,
            cohort: finalCohort,
            industry: user.industry || 'Xuất khẩu chung',
            avatarColor: '#3b82f6',
            registeredAt: new Date().toISOString().split('T')[0],
            totalScore: 0,
            gradeStatus: 'pending',
            isEvaluated: false,
            instructorNote: '',
            modules: {
              M01: { moduleId: 'M01', title: 'Mindset & Foundation', weight: 5, maxScore: 5, status: 'submitted', formData: {} },
              M02: { moduleId: 'M02', title: 'Market & ICP Understanding', weight: 15, maxScore: 15, status: 'draft', formData: {} },
              M03: { moduleId: 'M03', title: 'Lead Sourcing & Qualification', weight: 15, maxScore: 15, status: 'not_started', formData: {} },
              M04: { moduleId: 'M04', title: 'Proposal, Negotiation & Closing', weight: 20, maxScore: 20, status: 'not_started', formData: {} },
              M05: { moduleId: 'M05', title: 'Execution, Recovery & Growth', weight: 15, maxScore: 15, status: 'not_started', formData: {} },
              CAPSTONE: { moduleId: 'CAPSTONE', title: 'Final Capstone Playbooks', weight: 20, maxScore: 20, status: 'not_started', formData: {} },
              PDP: { maxScore: 10, score: 0, status: 'pending', reflectionText: '', plan30Days: '', plan60Days: '', plan90Days: '' }
            },
            rubricScores: []
          };
          currentEvaluations.push(newStudentEntry);
          localStorage.setItem('sales_hub_evaluations_v1', JSON.stringify(currentEvaluations));
        }
      } catch (e) {}

      // Update state
      setUsers(users.filter(u => u.id !== user.id));
      alert(`Đã duyệt thành công học viên ${user.full_name || user.email} vào lớp ${finalCohort}!`);
    } catch (err: any) {
      alert("Lỗi khi duyệt: " + err.message);
    }
  };

  const handleReject = async (user: UserProfile) => {
    const confirmReject = window.confirm(`Bạn có chắc chắn muốn từ chối tài khoản ${user.full_name || user.email}?`);
    if (!confirmReject) return;
    
    try {
      try {
        await supabase
          .from('users')
          .update({ approval_status: 'rejected' })
          .eq('id', user.id);
      } catch (e) {}

      try {
        const localPending = JSON.parse(localStorage.getItem('pending_registrations_v1') || '[]');
        const filteredPending = localPending.filter((u: any) => u.id !== user.id && u.email !== user.email);
        localStorage.setItem('pending_registrations_v1', JSON.stringify(filteredPending));
      } catch (e) {}

      setUsers(users.filter(u => u.id !== user.id));
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
            <strong>Cổng Giảng Viên & Quản Trị Khóa Học:</strong> Hệ thống tự động phân loại học viên theo lớp (Cohort Batch), hỗ trợ duyệt tài khoản, phân lớp và đồng bộ dữ liệu bài làm lên bảng chấm điểm.
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
          <span>Phê Duyệt & Phân Lớp Học Viên ({users.length})</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'grading' ? (
        <GradingHub />
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '1.45rem', fontWeight: 800, margin: '0 0 6px' }}>
                Phê Duyệt & Phân Loại Lớp Khóa Học
              </h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                Kiểm tra thông tin đăng ký của học viên, phân đúng lớp đào tạo (Cohort Batch) và cấp quyền mở khóa các Module.
              </p>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Đang chờ duyệt: <strong style={{ color: '#f59e0b' }}>{users.length}</strong> học viên
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
            {users.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <UserCheck size={48} style={{ margin: '0 auto 12px', opacity: 0.5, color: '#10b981' }} />
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Hiện không có tài khoản học viên nào đang chờ phê duyệt.
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  Khi học viên đăng ký mới qua cổng Đăng ký, thông tin và lớp học sẽ tự động xuất hiện tại đây.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {users.map(user => {
                  const currentCohort = selectedCohorts[user.id] || user.cohort_batch || COHORT_OPTIONS[0];

                  return (
                    <div key={user.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '18px 20px',
                      background: 'rgba(0,0,0,0.25)',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      gap: '16px',
                      flexWrap: 'wrap'
                    }}>
                      {/* Left: Info */}
                      <div style={{ minWidth: '260px', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.05rem' }}>
                            {user.full_name || 'Học viên'}
                          </span>
                          <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                            Chờ duyệt
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={14} color="var(--text-muted)" /> {user.email}
                          </span>
                          {user.phone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={14} color="var(--text-muted)" /> {user.phone}
                            </span>
                          )}
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Briefcase size={14} color="var(--text-muted)" /> {user.industry || 'Chưa ghi rõ'}
                          </span>
                        </div>
                      </div>

                      {/* Middle: Cohort Selector */}
                      <div style={{ minWidth: '240px' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          Phân vào Lớp học (Cohort):
                        </label>
                        <select 
                          className="form-input"
                          value={currentCohort}
                          onChange={(e) => handleCohortChange(user.id, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: 'rgba(0,0,0,0.4)',
                            border: '1px solid var(--accent-primary)',
                            fontSize: '0.85rem',
                            color: 'var(--text-primary)'
                          }}
                        >
                          {COHORT_OPTIONS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Right: Actions */}
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button 
                          onClick={() => handleApprove(user)}
                          className="btn btn-primary"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            fontSize: '0.85rem',
                            fontWeight: 700
                          }}
                        >
                          <Check size={16} /> Duyệt Vào Lớp
                        </button>
                        
                        <button 
                          onClick={() => handleReject(user)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--accent-danger)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                        >
                          <X size={16} /> Từ Chối
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
