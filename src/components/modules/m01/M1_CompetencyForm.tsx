'use client';

import React, { useEffect, useState } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { createClient } from '@/lib/supabase/client';
import { useModuleStore } from '@/store/useModuleStore';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface M1FormData {
  competency_radar: {
    market_and_icp: number;
    prospecting_discovery: number;
    pricing_negotiation: number;
    risk_management: number;
    internal_claim: number;
    crm_growth: number;
  };
  goals_90d: string;
  mindset_shift: string;
}

const initialData: M1FormData = {
  competency_radar: {
    market_and_icp: 3,
    prospecting_discovery: 3,
    pricing_negotiation: 3,
    risk_management: 3,
    internal_claim: 3,
    crm_growth: 3,
  },
  goals_90d: '',
  mindset_shift: '',
};

export default function M1_CompetencyForm() {
  const supabase = createClient();
  const { isInitialized, submissions } = useModuleStore();
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [debugError, setDebugError] = useState<string | null>(null);

  const isLocked = submissions['M01']?.is_locked || false;
  const isDisabled = !isOnline || isLocked;

  // Lắng nghe trạng thái mạng
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Khởi tạo và Load dữ liệu cũ nếu có
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          setIsInitializing(false);
          return;
        }
        
        setUserId(user.id);
        
        const { data, error } = await supabase
          .from('module_submissions')
          .select('form_data')
          .eq('user_id', user.id)
          .eq('module_id', 'M01')
          .single();
          
        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data && data.form_data) {
          const fetchedData = data.form_data as any;
          setData({
            ...initialData,
            ...fetchedData,
            competency_radar: {
              ...initialData.competency_radar,
              ...fetchedData.competency_radar,
            }
          });
        }
      } catch (err: any) {
        console.error('Initial fetch error:', err);
        setDebugError(err.message || 'Không thể tải dữ liệu từ máy chủ.');
      } finally {
        setIsInitializing(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async (formData: M1FormData) => {
    if (!userId) return;
    
    const { error } = await supabase
      .from('module_submissions')
      .upsert({
        user_id: userId,
        module_id: 'M01',
        form_data: formData,
        status: 'draft',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,module_id' });
      
    if (error) {
      console.error('Error saving to Supabase:', error);
      throw error;
    }
  };

  const { data, setData, status, lastSaved, handleBlur } = useAutoSave<M1FormData>(
    'M01',
    initialData,
    handleSave,
    3000 // Tự động lưu sau 3s
  );

  // Cập nhật trạng thái lên UI thông qua ID được định nghĩa ở ModuleLayout
  useEffect(() => {
    const statusBar = document.getElementById('status-bar');
    if (statusBar) {
      if (status === 'saving') {
        statusBar.textContent = 'Trạng thái: Đang lưu...';
        statusBar.style.color = 'var(--accent-warning)';
      } else if (status === 'saved') {
        statusBar.textContent = `Trạng thái: Đã lưu (${lastSaved?.toLocaleTimeString()})`;
        statusBar.style.color = 'var(--accent-success)';
      } else if (status === 'error') {
        statusBar.textContent = 'Trạng thái: Lỗi khi lưu!';
        statusBar.style.color = 'var(--accent-danger)';
      } else {
        statusBar.textContent = 'Trạng thái: Chưa có thay đổi (Draft)';
        statusBar.style.color = 'var(--text-muted)';
      }
    }
  }, [status, lastSaved]);

  const handleRadarChange = (field: keyof M1FormData['competency_radar'], value: number) => {
    setData((prev) => ({
      ...prev,
      competency_radar: {
        ...prev.competency_radar,
        [field]: value,
      },
    }));
  };

  if (isInitializing) {
    return <div style={{ color: 'var(--text-muted)' }}>Đang tải dữ liệu bài làm...</div>;
  }

  const errorBanner = debugError && (
    <div className="glass-panel" style={{ border: '1px dashed var(--accent-danger)', borderLeft: '4px solid var(--accent-danger)' }}>
      <h4 style={{ color: 'var(--accent-danger)', marginBottom: '8px' }}>⚠️ LỖI KẾT NỐI DATABASE</h4>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Hệ thống đang hiển thị Dữ liệu Giả lập (Mock Data) để bạn xem giao diện. Lỗi:</p>
      <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '4px', marginTop: '8px', fontSize: '0.75rem', color: '#fca5a5', overflowX: 'auto' }}>
        {debugError}
      </pre>
    </div>
  );

  // Định dạng dữ liệu cho Radar Chart của Recharts
  const radarData = [
    { subject: 'Đọc Thị trường & ICP', A: data.competency_radar?.market_and_icp ?? 3, fullMark: 5 },
    { subject: 'Prospecting & Discovery', A: data.competency_radar?.prospecting_discovery ?? 3, fullMark: 5 },
    { subject: 'Báo giá & Đàm phán', A: data.competency_radar?.pricing_negotiation ?? 3, fullMark: 5 },
    { subject: 'Kiểm soát rủi ro thanh toán', A: data.competency_radar?.risk_management ?? 3, fullMark: 5 },
    { subject: 'Phối hợp nội bộ & Xử lý Claim', A: data.competency_radar?.internal_claim ?? 3, fullMark: 5 },
    { subject: 'Kỷ luật CRM & Growth', A: data.competency_radar?.crm_growth ?? 3, fullMark: 5 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {errorBanner}
      
      {(!isOnline || isLocked) && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.15)', 
          border: '1px dashed var(--accent-danger)', 
          padding: '16px', 
          borderRadius: '12px', 
          color: '#fca5a5', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.1)'
        }}>
          <strong>⚠️ {isLocked ? 'BÀI LÀM ĐÃ KHÓA' : 'MẤT KẾT NỐI MẠNG'}:</strong> {isLocked ? 'Bài làm của bạn đã được nộp. Chế độ xem chỉ đọc.' : 'Toàn bộ dữ liệu đã được tự động khóa (Read-only) để bảo vệ an toàn thông tin.'}
        </div>
      )}

      {/* PHẦN 1: ĐÁNH GIÁ NĂNG LỰC CỐT LÕI */}
      <section>
        <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 'bold' }}>
          1. Đánh giá năng lực cốt lõi (1 - 5)
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Tự đánh giá chân thực mức độ thành thạo của bạn. Biểu đồ Radar bên cạnh sẽ cho bạn thấy "lỗ hổng" kỹ năng của chính mình.
        </p>

        {/* Chức năng: Chia làm 2 cột cho Desktop, 1 cột cho Mobile */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'center' }}>
          
          {/* Cột Trái: Thanh Kéo Điểm (Sliders) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { id: 'market_and_icp', label: 'Đọc Thị trường & ICP' },
              { id: 'prospecting_discovery', label: 'Prospecting & Discovery' },
              { id: 'pricing_negotiation', label: 'Báo giá & Đàm phán' },
              { id: 'risk_management', label: 'Kiểm soát rủi ro thanh toán' },
              { id: 'internal_claim', label: 'Phối hợp nội bộ & Xử lý Claim' },
              { id: 'crm_growth', label: 'Kỷ luật CRM & Account Growth' },
            ].map((skill) => (
              <div key={skill.id} style={{ 
                  display: 'flex', flexDirection: 'column', gap: '8px', 
                  background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px',
                  border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '500' }}>{skill.label}</span>
                  <span style={{ 
                      fontSize: '1rem', fontWeight: 'bold', 
                      color: 'var(--accent-primary)',
                      background: 'rgba(59, 130, 246, 0.1)', padding: '4px 12px', borderRadius: '20px'
                  }}>
                    {(data.competency_radar as any)?.[skill.id] ?? 3} / 5
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={(data.competency_radar as any)?.[skill.id] ?? 3}
                  onChange={(e) => handleRadarChange(skill.id as keyof M1FormData['competency_radar'], parseInt(e.target.value))}
                  onBlur={handleBlur}
                  disabled={isDisabled}
                  style={{ width: '100%', cursor: isDisabled ? 'not-allowed' : 'pointer', accentColor: isDisabled ? '#6b7280' : 'var(--accent-primary)', opacity: isDisabled ? 0.5 : 1 }}
                />
              </div>
            ))}
          </div>

          {/* Cột Phải: Biểu đồ Radar Chart */}
          <div style={{ 
              height: '400px', width: '100%', 
              background: 'rgba(15, 23, 42, 0.6)', 
              backdropFilter: 'blur(12px)',
              borderRadius: '24px', 
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 8px 32px 0 rgba(59, 130, 246, 0.15), inset 0 0 32px rgba(59, 130, 246, 0.05)',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              position: 'relative', overflow: 'hidden'
          }}>
            {/* Ambient Glow */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '70%', height: '70%', background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }}></div>
            
            <div style={{ width: '100%', height: '100%', zIndex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                  <defs>
                    <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <PolarGrid stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#e2e8f0', fontSize: 13, fontWeight: 500 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#64748b' }} axisLine={false} />
                  <Radar
                    name="Năng lực B2B"
                    dataKey="A"
                    stroke="var(--accent-primary)"
                    strokeWidth={2}
                    fill="url(#radarFill)"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </section>

      {/* PHẦN 2: THAY ĐỔI TƯ DUY */}
      <section className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 'bold' }}>
          2. Mindset Shift (Chuyển đổi Tư duy)
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Bạn nhận ra mình đã tư duy sai lầm ở đâu trong quá khứ sau khi học xong Module 1?
        </p>
        <textarea 
          className="form-input"
          rows={4}
          placeholder="Ví dụ: Trước đây tôi nghĩ Sales XK chỉ là gửi email hàng loạt để chào hàng (spam), giờ tôi hiểu nó là nghệ thuật tư vấn và xây dựng quan hệ chiến lược (Consultative Selling)..."
          value={data.mindset_shift}
          onChange={(e) => setData({ ...data, mindset_shift: e.target.value })}
          onBlur={handleBlur}
          disabled={isDisabled}
          style={{ width: '100%', resize: 'none', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', opacity: isDisabled ? 0.6 : 1, cursor: isDisabled ? 'not-allowed' : 'text' }}
        />
      </section>

      {/* PHẦN 3: MỤC TIÊU 90 NGÀY */}
      <section className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 'bold' }}>
          3. Mục tiêu 90 ngày (90-Day Goals)
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Để lấp đầy các "điểm lõm" trên biểu đồ năng lực, bạn cam kết đạt được điều gì trong 3 tháng tới?
        </p>
        <textarea 
          className="form-input"
          rows={4}
          placeholder="Ví dụ: Tìm được 30 Leads chất lượng tại thị trường Mỹ, và setup thành công 5 cuộc họp Online..."
          value={data.goals_90d}
          onChange={(e) => setData({ ...data, goals_90d: e.target.value })}
          onBlur={handleBlur}
          disabled={isDisabled}
          style={{ width: '100%', resize: 'none', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', opacity: isDisabled ? 0.6 : 1, cursor: isDisabled ? 'not-allowed' : 'text' }}
        />
      </section>

    </div>
  );
}
