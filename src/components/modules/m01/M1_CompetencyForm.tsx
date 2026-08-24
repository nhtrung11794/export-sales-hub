'use client';

import React, { useEffect, useState } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { createClient } from '@/lib/supabase/client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface M1FormData {
  competency_radar: {
    market_research: number;
    negotiation: number;
    b2b_sales_process: number;
    cultural_understanding: number;
    english_communication: number;
  };
  goals_90d: string;
  mindset_shift: string;
}

const initialData: M1FormData = {
  competency_radar: {
    market_research: 3,
    negotiation: 3,
    b2b_sales_process: 3,
    cultural_understanding: 3,
    english_communication: 3,
  },
  goals_90d: '',
  mindset_shift: '',
};

export default function M1_CompetencyForm() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [debugError, setDebugError] = useState<string | null>(null);

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
          setData(data.form_data as M1FormData);
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
    { subject: 'Nghiên cứu Thị trường', A: data.competency_radar.market_research, fullMark: 5 },
    { subject: 'Sales Process B2B', A: data.competency_radar.b2b_sales_process, fullMark: 5 },
    { subject: 'Đàm phán & Xử lý từ chối', A: data.competency_radar.negotiation, fullMark: 5 },
    { subject: 'Văn hóa KD Quốc tế', A: data.competency_radar.cultural_understanding, fullMark: 5 },
    { subject: 'Tiếng Anh TM', A: data.competency_radar.english_communication, fullMark: 5 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {errorBanner}
      
      {!isOnline && (
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
          <strong>⚠️ MẤT KẾT NỐI MẠNG:</strong> Toàn bộ dữ liệu đã được tự động khóa (Read-only) để bảo vệ an toàn thông tin. Vui lòng kiểm tra lại đường truyền internet.
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
              { id: 'market_research', label: 'Nghiên cứu thị trường & Tìm kiếm Lead' },
              { id: 'b2b_sales_process', label: 'Quy trình Sales B2B & Chốt deal' },
              { id: 'negotiation', label: 'Đàm phán & Xử lý từ chối' },
              { id: 'cultural_understanding', label: 'Am hiểu văn hóa kinh doanh quốc tế' },
              { id: 'english_communication', label: 'Tiếng Anh thương mại' },
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
                    {data.competency_radar[skill.id as keyof M1FormData['competency_radar']]} / 5
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={data.competency_radar[skill.id as keyof M1FormData['competency_radar']]}
                  onChange={(e) => handleRadarChange(skill.id as keyof M1FormData['competency_radar'], parseInt(e.target.value))}
                  onBlur={handleBlur}
                  disabled={!isOnline}
                  style={{ width: '100%', cursor: !isOnline ? 'not-allowed' : 'pointer', accentColor: !isOnline ? '#6b7280' : 'var(--accent-primary)', opacity: !isOnline ? 0.5 : 1 }}
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
          disabled={!isOnline}
          style={{ width: '100%', resize: 'none', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', opacity: !isOnline ? 0.6 : 1, cursor: !isOnline ? 'not-allowed' : 'text' }}
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
          disabled={!isOnline}
          style={{ width: '100%', resize: 'none', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', opacity: !isOnline ? 0.6 : 1, cursor: !isOnline ? 'not-allowed' : 'text' }}
        />
      </section>

    </div>
  );
}
