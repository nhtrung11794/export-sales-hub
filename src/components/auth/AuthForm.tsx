'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AuthForm() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: 'Học viên Mới',
            cohort_batch: 'BATCH_01'
          }
        }
      });
      
      if (error) throw error;
      setMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác thực.');
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Đăng nhập thành công, chuyển hướng vào Module 01
      router.push('/m01');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Sai email hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-primary)' }}>
        Đăng nhập Hệ thống
      </h2>
      
      <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Email
          </label>
          <input 
            type="email" 
            className="form-input" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="nguyenvana@gmail.com"
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Mật khẩu
          </label>
          <input 
            type="password" 
            className="form-input" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', borderRadius: '8px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', borderRadius: '8px', fontSize: '0.875rem' }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button 
            type="button" 
            onClick={handleSignIn}
            disabled={loading}
            className="btn btn-primary" 
            style={{ flex: 1 }}
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
          
          <button 
            type="button" 
            onClick={handleSignUp}
            disabled={loading}
            className="btn btn-secondary" 
            style={{ flex: 1 }}
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký mới'}
          </button>
        </div>
      </form>
    </div>
  );
}
