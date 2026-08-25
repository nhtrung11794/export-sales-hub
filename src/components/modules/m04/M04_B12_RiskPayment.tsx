'use client';

import React, { useState, useEffect } from 'react';
import { useModuleStore } from '@/store/useModuleStore';
import { CreditCard, ShieldAlert, CheckCircle2 } from 'lucide-react';

const PAYMENT_METHODS = [
  { id: 'tt_advance', label: 'T/T Advance (Chuyển tiền trước)', riskLevel: 'low' },
  { id: 'lc', label: 'L/C (Thư tín dụng)', riskLevel: 'low' },
  { id: 'dp', label: 'D/P (Nhờ thu kèm chứng từ)', riskLevel: 'high' },
  { id: 'cad', label: 'CAD (Giao chứng từ trả tiền)', riskLevel: 'high' },
  { id: 'oa', label: 'O/A (Ghi sổ / Trả chậm)', riskLevel: 'high' }
];

export default function M04_B12_RiskPayment() {
  const { updateSubmissionLocal, getModuleData } = useModuleStore();
  
  const m04Data = getModuleData('M04') || {};
  const m03Data = getModuleData('M03') || {};
  
  // Lấy điểm Fit Score từ M03 (giả lập 0 nếu chưa làm M03)
  const m03FitScore = typeof m03Data.fit_score === 'number' ? m03Data.fit_score : 0;
  
  // Logic Gate 2: Nếu điểm < 50, khóa các phương thức rủi ro cao (D/P, CAD, O/A)
  const isHighRiskBlocked = m03FitScore < 50;

  const [paymentMethod, setPaymentMethod] = useState<string>(m04Data.payment_method || '');
  const [justification, setJustification] = useState<string>(m04Data.payment_justification || '');

  useEffect(() => {
    // Nếu người dùng lỡ lưu D/P từ trước nhưng sau đó sửa M03 làm điểm rớt < 50
    // Ta phải reset lựa chọn thanh toán về rỗng để ép chọn lại.
    if (isHighRiskBlocked && ['dp', 'cad', 'oa'].includes(paymentMethod)) {
      setPaymentMethod('');
    }
  }, [isHighRiskBlocked, paymentMethod]);

  // Auto-save debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      updateSubmissionLocal('M04', { 
        ...m04Data, 
        payment_method: paymentMethod,
        payment_justification: justification
      });
    }, 500);
    return () => clearTimeout(handler);
  }, [paymentMethod, justification, updateSubmissionLocal, m04Data]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
            <CreditCard size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">B12: Risk Payment (Logic Gate 2)</h2>
            <p className="text-sm text-slate-500">Quyết định phương thức thanh toán an toàn</p>
          </div>
        </div>
        
        {/* Fit Score Indicator */}
        <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${isHighRiskBlocked ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'}`}>
          Fit Score M03: {m03FitScore}đ
        </div>
      </div>

      <div className="flex-1 space-y-6">
        
        {isHighRiskBlocked && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex items-start gap-3">
            <ShieldAlert className="text-red-500 mt-0.5 shrink-0" size={18} />
            <div>
              <h4 className="text-sm font-bold text-red-800">Khóa rủi ro thanh toán (Cognitive Friction)</h4>
              <p className="text-sm text-red-700 mt-1">
                Do điểm khách hàng tiềm năng (Fit Score ở M03) của bạn thấp hơn 50đ. Hệ thống nghiêm cấm sử dụng các phương thức trả sau như D/P, CAD, O/A để tránh rủi ro quỵt tiền. Hãy chọn L/C hoặc T/T Advance!
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">Chọn phương thức thanh toán xuất khẩu</label>
          <div className="grid grid-cols-1 gap-2">
            {PAYMENT_METHODS.map((method) => {
              const isDisabled = isHighRiskBlocked && method.riskLevel === 'high';
              const isSelected = paymentMethod === method.id;
              
              return (
                <label 
                  key={method.id}
                  className={`
                    relative flex items-center p-4 border rounded-lg cursor-pointer transition-all
                    ${isDisabled ? 'opacity-50 bg-slate-50 cursor-not-allowed border-slate-200' : ''}
                    ${isSelected && !isDisabled ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : ''}
                    ${!isSelected && !isDisabled ? 'hover:border-orange-300 hover:bg-orange-50/50' : ''}
                  `}
                >
                  <input 
                    type="radio" 
                    name="payment_method" 
                    value={method.id}
                    disabled={isDisabled}
                    checked={isSelected}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <span className={`block text-sm font-medium ${isDisabled ? 'text-slate-500' : 'text-slate-900'}`}>
                      {method.label}
                    </span>
                  </div>
                  
                  {isSelected && <CheckCircle2 className="text-orange-500" size={20} />}
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Giải trình bảo vệ rủi ro (Nội bộ)</label>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Tại sao bạn lại chọn phương thức thanh toán này? Nếu khách đòi D/P, làm sao bạn đàm phán ngược lại thành L/C?"
            className="w-full h-24 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm resize-none"
          />
        </div>
      </div>
    </div>
  );
}
