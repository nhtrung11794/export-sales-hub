'use client';

import React, { useEffect, useState } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { createClient } from '@/lib/supabase/client';

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

  // Khởi tạo và Load dữ liệu cũ nếu có
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
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
        
      if (data && data.form_data) {
        setData(data.form_data as M1FormData);
      }
      setIsInitializing(false);
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
      throw error; // Để useAutoSave bắt lỗi
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* PHẦN 1: ĐÁNH GIÁ NĂNG LỰC */}
      <section>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>1. Đánh giá năng lực cốt lõi (1 - 5)</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Tự đánh giá mức độ thành thạo của bạn ở các kỹ năng dưới đây.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { id: 'market_research', label: 'Nghiên cứu thị trường & Tìm kiếm Lead' },
            { id: 'b2b_sales_process', label: 'Quy trình Sales B2B & Chốt deal' },
            { id: 'negotiation', label: 'Đàm phán & Xử lý từ chối' },
            { id: 'english_communication', label: 'Tiếng Anh thương mại' },
            { id: 'cultural_understanding', label: 'Am hiểu văn hóa kinh doanh quốc tế' },
          ].map((skill) => (
            <div key={skill.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.9rem' }}>{skill.label}</span>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={data.competency_radar[skill.id as keyof M1FormData['competency_radar']]}
                onChange={(e) => handleRadarChange(skill.id as keyof M1FormData['competency_radar'], parseInt(e.target.value))}
                onBlur={handleBlur}
                style={{ width: '120px' }}
              />
              <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center', color: 'var(--accent-primary)' }}>
                {data.competency_radar[skill.id as keyof M1FormData['competency_radar']]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* PHẦN 2: THAY ĐỔI TƯ DUY */}
      <section>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>2. Mindset Shift (Chuyển đổi Tư duy)</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Ghi lại những thay đổi lớn nhất trong tư duy của bạn sau khi học Module 1.
        </p>
        <textarea 
          className="form-input"
          rows={5}
          placeholder="Ví dụ: Trước đây tôi nghĩ Sales XK chỉ là gửi email hàng loạt, giờ tôi hiểu nó là xây dựng quan hệ chiến lược..."
          value={data.mindset_shift}
          onChange={(e) => setData({ ...data, mindset_shift: e.target.value })}
          onBlur={handleBlur}
        />
      </section>

      {/* PHẦN 3: MỤC TIÊU 90 NGÀY */}
      <section>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>3. Mục tiêu 90 ngày (90-Day Goals)</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Định vị mục tiêu cụ thể bạn muốn đạt được trong 3 tháng tới.
        </p>
        <textarea 
          className="form-input"
          rows={5}
          placeholder="Ví dụ: Chốt được 1 deal xuất khẩu đầu tiên với thị trường Mỹ trị giá $10,000..."
          value={data.goals_90d}
          onChange={(e) => setData({ ...data, goals_90d: e.target.value })}
          onBlur={handleBlur}
        />
      </section>

    </div>
  );
}
