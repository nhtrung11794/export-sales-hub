'use client';

import React, { useEffect, useState } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { createClient } from '@/lib/supabase/client';

import { useModuleStore } from '@/store/useModuleStore';

interface M2FormData {
  target_market: string;
  market_reason: string;
  icp: {
    company_size: string;
    needs: string;
    pain_points: string;
  };
  competitors: {
    name: string;
    strength: string;
    weakness: string;
  }[];
}

const initialData: M2FormData = {
  target_market: '',
  market_reason: '',
  icp: {
    company_size: '',
    needs: '',
    pain_points: ''
  },
  competitors: [
    { name: '', strength: '', weakness: '' },
    { name: '', strength: '', weakness: '' }
  ]
};

export default function M2_MarketForm() {
  const supabase = createClient();
  const { isInitialized } = useModuleStore();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    }
    loadData();
  }, [supabase.auth]);

  const handleSave = async (formData: M2FormData) => {
    if (!userId) return;
    
    const { error } = await supabase
      .from('module_submissions')
      .upsert({
        user_id: userId,
        module_id: 'M02',
        form_data: formData,
        status: 'draft',
        last_saved_at: new Date().toISOString()
      }, { onConflict: 'user_id,module_id' });
      
    if (error) {
      console.error('Error saving to Supabase:', error);
      throw error;
    }
  };

  const { data, setData, status, lastSaved, handleBlur } = useAutoSave<M2FormData>(
    'M02',
    initialData,
    handleSave,
    3000
  );

  // Cập nhật trạng thái lên UI
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

  const updateIcp = (field: keyof M2FormData['icp'], value: string) => {
    setData((prev) => ({
      ...prev,
      icp: {
        ...prev.icp,
        [field]: value,
      }
    }));
  };

  const updateCompetitor = (index: number, field: keyof M2FormData['competitors'][0], value: string) => {
    setData((prev) => {
      const newCompetitors = [...prev.competitors];
      newCompetitors[index] = {
        ...newCompetitors[index],
        [field]: value
      };
      return { ...prev, competitors: newCompetitors };
    });
  };

  if (!isInitialized) {
    return <div style={{ color: 'var(--text-muted)' }}>Đang tải dữ liệu bài làm từ Global Store...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* PHẦN 1: THỊ TRƯỜNG MỤC TIÊU */}
      <section>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>1. Lựa chọn Thị trường Mục tiêu</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Quốc gia / Khu vực
            </label>
            <input 
              type="text"
              className="form-input"
              placeholder="Ví dụ: Mỹ, EU, Nhật Bản..."
              value={data.target_market}
              onChange={(e) => setData({ ...data, target_market: e.target.value })}
              onBlur={handleBlur}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Lý do lựa chọn (Lợi thế cạnh tranh của sản phẩm)
            </label>
            <textarea 
              className="form-input"
              rows={3}
              placeholder="Ví dụ: Thuế quan ưu đãi, Tiêu chuẩn kỹ thuật phù hợp với nhà máy..."
              value={data.market_reason}
              onChange={(e) => setData({ ...data, market_reason: e.target.value })}
              onBlur={handleBlur}
            />
          </div>
        </div>
      </section>

      {/* PHẦN 2: CHÂN DUNG KHÁCH HÀNG (ICP) */}
      <section>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>2. Chân dung Khách hàng B2B (ICP)</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Quy mô & Phân khúc
            </label>
            <input 
              type="text"
              className="form-input"
              placeholder="Ví dụ: Nhà nhập khẩu sỉ, Doanh thu > 5 triệu USD..."
              value={data.icp.company_size}
              onChange={(e) => updateIcp('company_size', e.target.value)}
              onBlur={handleBlur}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Nhu cầu / Mong muốn cốt lõi
            </label>
            <textarea 
              className="form-input"
              rows={2}
              placeholder="Ví dụ: Nguồn cung ổn định, Chứng chỉ xanh..."
              value={data.icp.needs}
              onChange={(e) => updateIcp('needs', e.target.value)}
              onBlur={handleBlur}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Nỗi đau (Pain points) lớn nhất
            </label>
            <textarea 
              className="form-input"
              rows={2}
              placeholder="Ví dụ: Chi phí logistics tăng cao, Nhà cung cấp cũ giao hàng chậm..."
              value={data.icp.pain_points}
              onChange={(e) => updateIcp('pain_points', e.target.value)}
              onBlur={handleBlur}
            />
          </div>
        </div>
      </section>

      {/* PHẦN 3: ĐỐI THỦ CẠNH TRANH */}
      <section>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>3. Phân tích Đối thủ Cạnh tranh</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {data.competitors.map((comp, index) => (
            <div key={index} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--accent-primary)', marginBottom: '8px', fontWeight: 'bold' }}>
                  Đối thủ {index + 1}
                </label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Tên công ty đối thủ..."
                  value={comp.name}
                  onChange={(e) => updateCompetitor(index, 'name', e.target.value)}
                  onBlur={handleBlur}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Điểm mạnh
                  </label>
                  <textarea 
                    className="form-input"
                    rows={2}
                    value={comp.strength}
                    onChange={(e) => updateCompetitor(index, 'strength', e.target.value)}
                    onBlur={handleBlur}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Điểm yếu (Cơ hội của bạn)
                  </label>
                  <textarea 
                    className="form-input"
                    rows={2}
                    value={comp.weakness}
                    onChange={(e) => updateCompetitor(index, 'weakness', e.target.value)}
                    onBlur={handleBlur}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
