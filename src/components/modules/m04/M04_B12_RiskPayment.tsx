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
  
  const m03FitScore = typeof m03Data.fit_score === 'number' ? m03Data.fit_score : 0;
  const isHighRiskBlocked = m03FitScore < 50;

  const [paymentMethod, setPaymentMethod] = useState<string>(m04Data.payment_method || '');
  const [justification, setJustification] = useState<string>(m04Data.payment_justification || '');

  useEffect(() => {
    if (isHighRiskBlocked && ['dp', 'cad', 'oa'].includes(paymentMethod)) {
      setPaymentMethod('');
    }
  }, [isHighRiskBlocked, paymentMethod]);

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
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(249, 115, 22, 0.1)', padding: '8px', borderRadius: '8px', color: '#f97316' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>B12: Risk Payment (Logic Gate 2)</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Quyết định phương thức thanh toán an toàn</p>
          </div>
        </div>
        
        {/* Fit Score Indicator */}
        <div style={{
          padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
          background: isHighRiskBlocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          border: isHighRiskBlocked ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
          color: isHighRiskBlocked ? 'var(--accent-danger)' : 'var(--accent-success)'
        }}>
          Fit Score M03: {m03FitScore}đ
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {isHighRiskBlocked && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '12px', 
            border: '1px dashed var(--accent-danger)', display: 'flex', alignItems: 'flex-start', gap: '12px'
          }}>
            <ShieldAlert color="var(--accent-danger)" size={20} style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--accent-danger)' }}>Khóa rủi ro thanh toán (Cognitive Friction)</h4>
              <p style={{ fontSize: '0.875rem', color: '#fca5a5', marginTop: '4px', lineHeight: '1.5' }}>
                Do điểm khách hàng tiềm năng (Fit Score ở M03) của bạn thấp hơn 50đ. Hệ thống nghiêm cấm sử dụng các phương thức trả sau như D/P, CAD, O/A để tránh rủi ro quỵt tiền. Hãy chọn L/C hoặc T/T Advance!
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Chọn phương thức thanh toán xuất khẩu</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {PAYMENT_METHODS.map((method) => {
              const isDisabled = isHighRiskBlocked && method.riskLevel === 'high';
              const isSelected = paymentMethod === method.id;
              
              return (
                <label 
                  key={method.id}
                  style={{
                    position: 'relative', display: 'flex', alignItems: 'center', padding: '16px',
                    borderRadius: '12px', cursor: isDisabled ? 'not-allowed' : 'pointer',
                    background: isSelected && !isDisabled ? 'rgba(249, 115, 22, 0.1)' : 'rgba(255,255,255,0.02)',
                    border: isSelected && !isDisabled ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.1)',
                    opacity: isDisabled ? 0.4 : 1, transition: 'all 0.2s ease',
                    boxShadow: isSelected && !isDisabled ? '0 0 10px rgba(249, 115, 22, 0.2)' : 'none'
                  }}
                  onMouseOver={(e) => {
                    if (!isSelected && !isDisabled) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.border = '1px solid rgba(255,255,255,0.2)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected && !isDisabled) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)';
                    }
                  }}
                >
                  <input 
                    type="radio" 
                    name="payment_method" 
                    value={method.id}
                    disabled={isDisabled}
                    checked={isSelected}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: isDisabled ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                      {method.label}
                    </span>
                  </div>
                  {isSelected && <CheckCircle2 color="var(--accent-primary)" size={20} />}
                </label>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Giải trình bảo vệ rủi ro (Nội bộ)</label>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Tại sao bạn lại chọn phương thức thanh toán này? Nếu khách đòi D/P, làm sao bạn đàm phán ngược lại thành L/C?"
            className="form-input"
            style={{ 
              width: '100%', height: '100px', resize: 'none', 
              background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)' 
            }}
          />
        </div>
      </div>
    </div>
  );
}
