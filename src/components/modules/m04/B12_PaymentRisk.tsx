'use client';

import React from 'react';
import { M04FormData } from './M04_CombinedForm';
import { ShieldAlert, CheckSquare, Lock, ShieldCheck, CheckCircle2, AlertTriangle, FileCheck2 } from 'lucide-react';

interface Props {
  data: M04FormData;
  setData: React.Dispatch<React.SetStateAction<M04FormData>>;
  handleBlur: () => void;
  isDisabled?: boolean;
  opportunityScore: number;
  accessScore: number;
}

export default function B12_PaymentRisk({ data, setData, handleBlur, isDisabled, opportunityScore, accessScore }: Props) {
  const b12 = data.b12_closing;

  // Gate Logic
  const isHighRisk = opportunityScore < 60 || accessScore === 0;

  const handlePaymentSelect = (method: string) => {
    if (isDisabled) return;
    setData(prev => ({
      ...prev,
      b12_closing: {
        ...prev.b12_closing,
        selected_payment_method: method
      }
    }));
  };

  const handleChecklistChange = (field: keyof M04FormData['b12_closing']['checklist'], checked: boolean) => {
    if (isDisabled) return;
    setData(prev => ({
      ...prev,
      b12_closing: {
        ...prev.b12_closing,
        checklist: {
          ...prev.b12_closing.checklist,
          [field]: checked
        }
      }
    }));
  };

  const handleJustificationChange = (value: string) => {
    if (isDisabled) return;
    setData(prev => ({
      ...prev,
      b12_closing: {
        ...prev.b12_closing,
        risk_justification: value
      }
    }));
  };

  const paymentMethods = [
    { id: '100_tt_adv', label: '100% T/T In Advance (An toàn tuyệt đối)', isRisky: false },
    { id: 'tt_deposit', label: 'T/T 30% Cọc + 70% vs Copy B/L (Chuẩn xuất khẩu)', isRisky: false },
    { id: 'lc_sight', label: 'L/C At Sight không hủy ngang (An toàn cao)', isRisky: false },
    { id: 'dp_sight', label: 'D/P At Sight (Nhờ thu trả tiền đổi chứng từ)', isRisky: true },
    { id: 'tt_net', label: 'T/T Net 30/60 ngày (Trả chậm - Rủi ro cao)', isRisky: true },
    { id: 'oa', label: 'O/A Ghi sổ mở (Rủi ro cực đại)', isRisky: true }
  ];

  const selectedMethod = paymentMethods.find(m => m.id === b12.selected_payment_method);
  const isRiskLockedActive = isHighRisk && selectedMethod?.isRisky;
  const isBypassValid = (b12.risk_justification || '').trim().split(/\s+/).filter(Boolean).length >= 10;

  const isChecklistComplete = Boolean(
    b12.checklist?.check_bec && 
    b12.checklist?.check_local_charge && 
    b12.checklist?.check_vessel
  );

  return (
    <section className="glass-panel" style={{ opacity: isDisabled ? 0.6 : 1, pointerEvents: isDisabled ? 'none' : 'auto', padding: '28px' }}>
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
          Bài 12: Kiểm soát Rủi ro Thanh toán & Chốt đơn An toàn (Safe Closing Protocol)
        </h2>
      </div>
      <p className="text-secondary text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Chốt đơn không phải là lúc khách nói "Đồng ý", mà là lúc bạn đảm bảo đơn hàng đủ an toàn về dòng tiền và pháp lý để thực thi.
      </p>

      {isHighRisk && (
        <div style={{ padding: '14px 18px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', fontSize: '0.86rem', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '10px', lineHeight: '1.5' }}>
          <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>CẢNH BÁO PROFILE KHÁCH HÀNG RỦI RO CAO:</strong><br/>
            Cơ hội này có Điểm Opportunity ({opportunityScore}/100) thấp hoặc Điểm Access = 0 (Chưa tiếp cận được người ra quyết định).<br/>
            Hệ thống <strong>khóa các phương thức thanh toán rủi ro (O/A, D/P, T/T Trả chậm)</strong>. Vui lòng ưu tiên T/T Cọc + B/L hoặc L/C At Sight.
          </div>
        </div>
      )}

      {/* Payment Selection */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '14px', color: 'var(--text-primary)' }}>
          Khu vực 1: Lựa chọn Phương thức Thanh toán Quốc tế
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '12px' }}>
          {paymentMethods.map(method => {
            const isLockedMethod = isHighRisk && method.isRisky;
            const isSelected = b12.selected_payment_method === method.id;
            
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => handlePaymentSelect(method.id)}
                disabled={isDisabled}
                style={{
                  padding: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'rgba(15, 23, 42, 0.45)',
                  border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '10px',
                  color: isLockedMethod ? 'var(--text-secondary)' : 'var(--text-primary)',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isLockedMethod ? 0.6 : 1,
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                <span style={{ fontSize: '0.84rem', fontWeight: isSelected ? 700 : 500 }}>{method.label}</span>
                {isLockedMethod && <Lock size={14} color="var(--accent-danger)" />}
                {isSelected && !isLockedMethod && <CheckCircle2 size={16} color="var(--accent-primary)" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Bypass Justification */}
      {isRiskLockedActive && (
        <div style={{ marginBottom: '32px', padding: '16px', background: 'rgba(239, 68, 68, 0.08)', border: '1px dashed var(--accent-danger)', borderRadius: '10px' }}>
          <h4 style={{ color: 'var(--accent-danger)', fontSize: '0.92rem', fontWeight: 'bold', marginBottom: '6px' }}>Yêu cầu Giải trình Ngoại lệ (Bypass Justification)</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.45' }}>
            Bạn đang chọn phương thức rủi ro ({selectedMethod?.label}) cho đối tượng khách hàng có rủi ro cao. Bắt buộc phải giải trình phương án phòng vệ (VD: Mua bảo hiểm tín dụng xuất khẩu Sinocure/Euler Hermes, có bảo lãnh ngân hàng Top 50 toàn cầu...):
          </p>
          <textarea
            value={b12.risk_justification}
            onChange={(e) => handleJustificationChange(e.target.value)}
            onBlur={handleBlur}
            disabled={isDisabled}
            placeholder="Nhập giải trình phương án bảo vệ dòng tiền (Tối thiểu 10 từ)..."
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'rgba(0,0,0,0.25)',
              border: `1px solid ${!isBypassValid && b12.risk_justification.length > 0 ? 'var(--accent-danger)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '8px',
              color: 'var(--text-primary)',
              resize: 'vertical',
              fontSize: '0.85rem'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <span style={{ fontSize: '0.78rem', color: isBypassValid ? '#10b981' : 'var(--accent-danger)', fontWeight: 600 }}>
              {isBypassValid ? '✓ Giải trình hợp lệ' : `Chưa đủ 10 từ (${(b12.risk_justification || '').trim().split(/\s+/).filter(Boolean).length}/10 từ)`}
            </span>
          </div>
        </div>
      )}

      {/* Safe Order Checklist */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <ShieldCheck size={18} color="#10b981" /> Khu vực 2: Safe Order Checklist (Chốt chặn trước khi xuất PI/SC)
          </h3>
          <span style={{ fontSize: '0.8rem', color: isChecklistComplete ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
            {Object.values(b12.checklist || {}).filter(Boolean).length}/3 bước hoàn tất
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
          {[
            {
              id: 'check_bec',
              title: '1. Kiểm tra chống lừa đảo giả mạo email (BEC Protection)',
              desc: 'Đã check kỹ địa chỉ email của khách (không bị lệch ký tự), đuôi tên miền doanh nghiệp, và gọi điện thoại/Whatsapp xác nhận lại thông tin tài khoản ngân hàng thụ hưởng.'
            },
            {
              id: 'check_local_charge',
              title: '2. Chốt rõ Local Charge tại cảng xuất & cảng đích',
              desc: 'Đã xác nhận rõ ai chịu phí THC, Seal, Bill, và hạn mức lưu cont/lưu bãi (Free DEM/DET) để tránh tranh chấp phát sinh khi hàng đến cảng.'
            },
            {
              id: 'check_vessel',
              title: '3. Khả năng Booking & Cam kết Lịch Tàu (Vessel Feasibility)',
              desc: 'Đã check sơ bộ lịch tàu khả thi với Forwarder, đảm bảo ngày Closing Time khớp với Lead time sản xuất và không bị rớt tàu (Rolled).'
            },
          ].map(item => {
            const isChecked = Boolean(b12.checklist?.[item.id as keyof typeof b12.checklist]);

            return (
              <div
                key={item.id}
                onClick={() => handleChecklistChange(item.id as keyof typeof b12.checklist, !isChecked)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(15, 23, 42, 0.4)',
                  border: `1px solid ${isChecked ? '#10b981' : 'rgba(255, 255, 255, 0.08)'}`,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleChecklistChange(item.id as keyof typeof b12.checklist, e.target.checked)}
                  disabled={isDisabled}
                  style={{
                    marginTop: '2px',
                    width: '18px',
                    height: '18px',
                    accentColor: '#10b981',
                    cursor: isDisabled ? 'not-allowed' : 'pointer'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isChecked ? '#10b981' : 'var(--text-primary)', marginBottom: '2px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CHỐT CHẶN AN TOÀN CLEARANCE */}
        <div style={{
          padding: '14px 18px',
          borderRadius: '10px',
          background: isChecklistComplete ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${isChecklistComplete ? '#10b981' : 'rgba(239, 68, 68, 0.3)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {isChecklistComplete ? (
            <>
              <FileCheck2 size={22} color="#10b981" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#10b981', fontSize: '0.9rem', display: 'block' }}>✓ SAFE CLEARANCE APPROVED:</strong>
                <span style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>Đơn hàng đã vượt qua 3 lớp kiểm soát an toàn dòng tiền và pháp lý. Đủ điều kiện xuất Proforma Invoice (PI) và chuyển sang Module 05!</span>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle size={22} color="var(--accent-danger)" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--accent-danger)', fontSize: '0.9rem', display: 'block' }}>⚠️ CHỐT CHẶN AN TOÀN CHƯA MỞ:</strong>
                <span style={{ fontSize: '0.8rem', color: '#fca5a5' }}>Bắt buộc phải tick xác nhận đủ cả 3 tiêu chuẩn kiểm soát rủi ro trước khi hoàn tất Module 04.</span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

