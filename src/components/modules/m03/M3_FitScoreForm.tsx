'use client';

import React, { useState, useEffect } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useModuleStore } from '@/store/useModuleStore';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

interface M3FormData {
  fit_score: {
    fit: number;
    need: number;
    access: number;
    criteria: number;
    momentum: number;
  };
  warning_justification: string;
}

const initialData: M3FormData = {
  fit_score: {
    fit: 0,
    need: 0,
    access: 0,
    criteria: 0,
    momentum: 0
  },
  warning_justification: ''
};

export default function M3_FitScoreForm() {
  const supabase = createClient();
  const { isInitialized, getModuleData } = useModuleStore();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    }
    loadUser();
  }, [supabase.auth]);

  const handleSave = async (formData: M3FormData) => {
    if (!userId) return;
    const { error } = await supabase
      .from('module_submissions')
      .upsert({
        user_id: userId,
        module_id: 'M03',
        form_data: formData,
        status: 'draft',
        last_saved_at: new Date().toISOString()
      }, { onConflict: 'user_id,module_id' });
      
    if (error) throw error;
  };

  const { data, setData, status, lastSaved, handleBlur } = useAutoSave<M3FormData>(
    'M03',
    initialData,
    handleSave,
    3000
  );

  if (!isInitialized) {
    return <div className="text-gray-400">Đang tải dữ liệu từ Global Store...</div>;
  }

  // Lấy dữ liệu kế thừa từ M02
  const m2Data: any = getModuleData('M02');
  const targetMarket = m2Data?.target_market || 'Chưa xác định';
  const icp = m2Data?.icp || {};

  // Tính tổng điểm Fit Score
  const totalScore = 
    data.fit_score.fit + 
    data.fit_score.need + 
    data.fit_score.access + 
    data.fit_score.criteria + 
    data.fit_score.momentum;

  let scoreStatus: 'REJECTED' | 'WARNING' | 'PASSED' = 'REJECTED';
  if (totalScore >= 70) scoreStatus = 'PASSED';
  else if (totalScore >= 40) scoreStatus = 'WARNING';

  const updateScore = (key: keyof M3FormData['fit_score'], value: number) => {
    setData({
      ...data,
      fit_score: { ...data.fit_score, [key]: value }
    });
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-[var(--border-color)]">
        <h2 className="text-xl font-bold text-white">Chấm điểm Fit Score</h2>
        <div className="flex items-center space-x-2 text-sm">
          {status === 'saving' && <span className="text-yellow-500">Đang lưu...</span>}
          {status === 'saved' && <span className="text-green-500">Đã lưu {lastSaved?.toLocaleTimeString()}</span>}
          {status === 'error' && <span className="text-red-500">Lỗi lưu!</span>}
        </div>
      </div>

      {/* DỮ LIỆU KẾ THỪA M02 */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-xl">
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3 tracking-wider">
          Khách hàng đang phân tích (Kế thừa từ M02)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Thị trường mục tiêu</label>
            <div className="bg-[var(--bg-primary)] px-3 py-2 rounded-lg text-sm text-gray-300">
              {targetMarket}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Quy mô công ty</label>
            <div className="bg-[var(--bg-primary)] px-3 py-2 rounded-lg text-sm text-gray-300">
              {icp.company_size || 'Chưa xác định'}
            </div>
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Nhu cầu (Needs)</label>
            <div className="bg-[var(--bg-primary)] px-3 py-2 rounded-lg text-sm text-gray-300 line-clamp-2">
              {icp.needs || 'Chưa xác định'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        
        {/* THANH ĐIỂM TỔNG */}
        <div className={`p-4 rounded-xl border flex items-center space-x-4
          ${scoreStatus === 'PASSED' ? 'bg-green-900/20 border-green-500/30' : ''}
          ${scoreStatus === 'WARNING' ? 'bg-yellow-900/20 border-yellow-500/30' : ''}
          ${scoreStatus === 'REJECTED' ? 'bg-red-900/20 border-red-500/30' : ''}
        `}>
          <div className={`text-4xl font-bold w-20 text-center
            ${scoreStatus === 'PASSED' ? 'text-green-500' : ''}
            ${scoreStatus === 'WARNING' ? 'text-yellow-500' : ''}
            ${scoreStatus === 'REJECTED' ? 'text-red-500' : ''}
          `}>
            {totalScore}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white mb-1">
              {scoreStatus === 'PASSED' && 'PASSED (Cơ hội chất lượng)'}
              {scoreStatus === 'WARNING' && 'WARNING (Cơ hội rủi ro)'}
              {scoreStatus === 'REJECTED' && 'REJECTED (Cơ hội rác)'}
            </h3>
            <p className="text-sm text-gray-400">
              {scoreStatus === 'PASSED' && 'Lead đáp ứng tốt ICP. Bạn có thể tiến tới Đề xuất giải pháp (M04).'}
              {scoreStatus === 'WARNING' && 'Lead có rủi ro hoặc thiếu thông tin. Yêu cầu giải trình bên dưới.'}
              {scoreStatus === 'REJECTED' && 'Cơ hội này quá kém. Hệ thống sẽ khóa tiến trình sang M04.'}
            </p>
          </div>
          <div>
            {scoreStatus === 'PASSED' && <CheckCircle className="text-green-500" size={32} />}
            {scoreStatus === 'WARNING' && <AlertTriangle className="text-yellow-500" size={32} />}
            {scoreStatus === 'REJECTED' && <AlertCircle className="text-red-500" size={32} />}
          </div>
        </div>

        {/* CÁC SLIDER CHẤM ĐIỂM */}
        <div className="space-y-5">
          <ScoreSlider 
            label="Fit (Độ phù hợp văn hóa/kinh doanh)" 
            max={25} value={data.fit_score.fit} 
            onChange={(val) => updateScore('fit', val)} onBlur={handleBlur}
          />
          <ScoreSlider 
            label="Need (Nhu cầu thực tế, Nỗi đau)" 
            max={25} value={data.fit_score.need} 
            onChange={(val) => updateScore('need', val)} onBlur={handleBlur}
          />
          <ScoreSlider 
            label="Access (Tiếp cận người ra quyết định)" 
            max={20} value={data.fit_score.access} 
            onChange={(val) => updateScore('access', val)} onBlur={handleBlur}
          />
          <ScoreSlider 
            label="Criteria (Đáp ứng tiêu chuẩn kỹ thuật)" 
            max={15} value={data.fit_score.criteria} 
            onChange={(val) => updateScore('criteria', val)} onBlur={handleBlur}
          />
          <ScoreSlider 
            label="Momentum (Động lực mua hàng hiện tại)" 
            max={15} value={data.fit_score.momentum} 
            onChange={(val) => updateScore('momentum', val)} onBlur={handleBlur}
          />
        </div>

        {/* GIẢI TRÌNH (Chỉ hiện khi WARNING hoặc REJECTED, nhưng REJECTED khóa lưu) */}
        {scoreStatus !== 'PASSED' && (
          <div className={`p-4 rounded-xl border ${scoreStatus === 'WARNING' ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
            <label className="block text-sm font-medium mb-2 text-white">
              Giải trình rủi ro (Bắt buộc)
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Tại sao bạn vẫn muốn dành thời gian theo đuổi cơ hội này dù điểm số không đạt mức an toàn?
            </p>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Ví dụ: Dù họ chưa có nhu cầu mua ngay, nhưng đây là tập đoàn lớn và tôi muốn duy trì quan hệ lâu dài..."
              value={data.warning_justification}
              onChange={(e) => setData({ ...data, warning_justification: e.target.value })}
              onBlur={handleBlur}
            />
          </div>
        )}

      </div>
    </div>
  );
}

// Sub-component cho Slider
function ScoreSlider({ label, max, value, onChange, onBlur }: { 
  label: string; max: number; value: number; onChange: (v: number) => void; onBlur: () => void; 
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <label className="text-gray-300 font-medium">{label}</label>
        <span className="text-[var(--accent-primary)] font-bold">{value} / {max}</span>
      </div>
      <input 
        type="range" 
        min="0" 
        max={max} 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        onBlur={onBlur}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--accent-primary)]"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Kém</span>
        <span>Tuyệt đối</span>
      </div>
    </div>
  );
}
