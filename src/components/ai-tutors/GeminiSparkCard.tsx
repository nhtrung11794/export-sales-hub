'use client';

import React, { useState } from 'react';
import { Sparkles, Copy, ExternalLink, Check } from 'lucide-react';
import { useModuleStore } from '@/store/useModuleStore';

export default function GeminiSparkCard() {
  const { getModuleData } = useModuleStore();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyAndOpen = async () => {
    const m02Data = getModuleData('M02') || {};
    const marketIntel = m02Data.market_intel || '[Chưa điền thông tin thị trường]';

    const prompt = `Tôi là một quản lý Sales B2B xuất khẩu. Dưới đây là thông tin thị trường tôi vừa thu thập được:\n\n"""\n${marketIntel}\n"""\n\nHãy đóng vai một chuyên gia phân tích thị trường quốc tế khó tính. Hãy Fact-check tính chính xác của các thông tin trên và chỉ ra 3 rủi ro ẩn giấu mà tôi có thể đã bỏ qua khi đánh giá thị trường này. Trình bày ngắn gọn dạng Bullet points.`;

    try {
      await navigator.clipboard.writeText(prompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      
      // Open Gemini Spark in a new tab
      window.open('https://spark.gemini.google.com', '_blank');
    } catch (err) {
      console.error('Failed to copy prompt: ', err);
      alert('Không thể tự động copy Prompt. Trình duyệt của bạn có thể đang chặn quyền Clipboard.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-100 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={20} className="text-indigo-600" />
        <h3 className="text-base font-bold text-indigo-900">Fact-Check với AI</h3>
      </div>
      
      <p className="text-sm text-indigo-800/80 mb-5 leading-relaxed">
        Sử dụng Gemini Spark để phân tích chéo và phản biện các ngộ nhận thị trường (Market Intel) mà bạn vừa nhập ở B03.
      </p>

      <button
        onClick={handleCopyAndOpen}
        className="w-full relative group overflow-hidden bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow"
      >
        {isCopied ? (
          <>
            <Check size={16} /> Đã sao chép Prompt
          </>
        ) : (
          <>
            <Copy size={16} /> Copy Prompt & Mở Gemini Spark
          </>
        )}
      </button>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-indigo-500 font-medium">
        <span>Tự động tạo câu lệnh từ bài làm B03</span>
        <ExternalLink size={12} />
      </div>
    </div>
  );
}
