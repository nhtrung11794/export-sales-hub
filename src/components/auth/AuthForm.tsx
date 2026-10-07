'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { GraduationCap, User, Mail, Lock, Phone, Briefcase, CheckCircle2 } from 'lucide-react';

const COHORT_OPTIONS = [
  'K08 - Sales XK B2B Thực Chiến (2026)',
  'K09 - Bứt Phá Doanh Số Xuất Khẩu Toàn Cầu',
  'K10 - Đàm Phán & Deal Desk Quốc Tế Chuyên Sâu',
  'Lớp Doanh Nghiệp In-House (Custom Cohort)'
];

const INDUSTRY_OPTIONS = [
  'Gạo & Nông sản chế biến',
  'Thủy hải sản đông lạnh & Chế biến',
  'Dệt may, May mặc kỹ thuật & Da giày',
  'Thủ công mỹ nghệ & Mây tre đan',
  'Gỗ & Nội thất xuất khẩu',
  'Cơ khí chế tạo, Linh kiện & Phụ trợ',
  'Thực phẩm & Đồ uống (F&B Halal/Organic)',
  'Ngành hàng xuất khẩu khác'
];

export default function AuthForm() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [cohort, setCohort] = useState(COHORT_OPTIONS[0]);
  const [industry, setIndustry] = useState(INDUSTRY_OPTIONS[0]);
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Sai email hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setError('Vui lòng nhập họ và tên của bạn.');
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            cohort_batch: cohort,
            industry: industry,
            phone: phone
          }
        }
      });
      
      if (error) throw error;

      const newUserRecord = {
        id: data.user?.id || `usr_${Date.now()}`,
        email,
        full_name: fullName,
        cohort_batch: cohort,
        industry: industry,
        phone: phone,
        approval_status: 'pending',
        role: 'student',
        created_at: new Date().toISOString()
      };

      // Attempt inserting into Supabase
      try {
        await supabase.from('users').insert([newUserRecord]).select();
      } catch (insertErr) {
        console.warn('Supabase users insert fallback');
      }

      // Also cache in local pending registrations for instructor review
      try {
        const localPending = JSON.parse(localStorage.getItem('pending_registrations_v1') || '[]');
        localPending.push(newUserRecord);
        localStorage.setItem('pending_registrations_v1', JSON.stringify(localPending));
      } catch (e) {}
      
      // Auto-redirect or notify
      if (data.session) {
        router.push('/');
        router.refresh();
      } else {
        setSuccessMsg('Đăng ký thành công! Tài khoản của bạn đã được chuyển vào hàng đợi để Giảng viên/Admin phê duyệt vào đúng lớp.');
      }
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ 
      padding: '36px 32px', 
      width: '100%', 
      maxWidth: mode === 'register' ? '480px' : '400px', 
      margin: '0 auto',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.12)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--accent-primary), #2563eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)'
        }}>
          <GraduationCap size={26} color="#ffffff" />
        </div>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
          {mode === 'login' ? 'Đăng Nhập Cổng Học Tập' : 'Đăng Ký Thành Viên Khóa Học'}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
          {mode === 'login' 
            ? 'Nhập email và mật khẩu được cấp để vào không gian học tập' 
            : 'Điền thông tin và chọn đúng lớp học để Giảng viên phê duyệt'}
        </p>
      </div>

      {successMsg ? (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '10px',
          padding: '16px',
          color: '#10b981',
          fontSize: '0.9rem',
          lineHeight: 1.5,
          textAlign: 'center'
        }}>
          <CheckCircle2 size={32} style={{ margin: '0 auto 10px', display: 'block' }} />
          <strong>{successMsg}</strong>
          <button 
            onClick={() => setMode('login')}
            className="btn btn-primary"
            style={{ marginTop: '16px', width: '100%', fontSize: '0.9rem' }}
          >
            Quay lại Đăng nhập
          </button>
        </div>
      ) : (
        <form style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} onSubmit={mode === 'login' ? handleSignIn : handleSignUp}>
          {/* Register-only fields */}
          {mode === 'register' && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Họ và tên học viên *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Nguyễn Văn A"
                    style={{ paddingLeft: '36px', width: '100%', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Lớp học / Khóa đào tạo *
                </label>
                <select 
                  className="form-input"
                  value={cohort}
                  onChange={(e) => setCohort(e.target.value)}
                  style={{ width: '100%', borderRadius: '8px', background: 'rgba(0,0,0,0.3)' }}
                >
                  {COHORT_OPTIONS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Ngành hàng xuất khẩu doanh nghiệp *
                </label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <select 
                    className="form-input"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    style={{ width: '100%', paddingLeft: '36px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)' }}
                  >
                    {INDUSTRY_OPTIONS.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Số điện thoại / Zalo (Tùy chọn)
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="tel" 
                    className="form-input" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    style={{ paddingLeft: '36px', width: '100%', borderRadius: '8px' }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Email công việc / học tập *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="form-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="sales.export@company.com"
                style={{ paddingLeft: '36px', width: '100%', borderRadius: '8px' }}
              />
            </div>
          </div>
          
          {/* Password */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Mật khẩu {mode === 'register' ? '(tối thiểu 6 ký tự) *' : '*'}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="form-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                style={{ paddingLeft: '36px', width: '100%', borderRadius: '8px' }}
              />
            </div>
          </div>

          {error && (
            <div style={{ 
              padding: '10px 14px', 
              background: 'rgba(239, 68, 68, 0.12)', 
              color: 'var(--accent-danger)', 
              borderRadius: '8px', 
              fontSize: '0.85rem',
              border: '1px solid rgba(239, 68, 68, 0.25)'
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexDirection: 'column' }}>
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '10px', fontSize: '0.95rem', fontWeight: 700 }}
            >
              {loading ? 'Đang xử lý...' : (mode === 'login' ? 'Đăng Nhập Ngay' : 'Gửi Đăng Ký Chờ Phê Duyệt')}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {mode === 'login' ? 'Chưa có tài khoản lớp học? ' : 'Đã có tài khoản? '}
              </span>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  padding: 0,
                  fontSize: '0.85rem'
                }}
              >
                {mode === 'login' ? 'Đăng ký thành viên' : 'Đăng nhập ngay'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
