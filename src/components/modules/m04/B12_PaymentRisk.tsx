import React from 'react';
import { M04FormData } from './M04_CombinedForm';
import { ShieldAlert, CheckSquare, Lock, ShieldCheck } from 'lucide-react';

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
    { id: '100_tt_adv', label: '100% T/T In Advance', isRisky: false },
    { id: 'tt_deposit', label: 'T/T Deposit + Balance vs Copy Doc', isRisky: false },
    { id: 'lc_sight', label: 'L/C At Sight (Irrevocable)', isRisky: false },
    { id: 'dp_sight', label: 'D/P At Sight', isRisky: true },
    { id: 'tt_net', label: 'T/T Net (Trả chậm)', isRisky: true },
    { id: 'oa', label: 'O/A (Ghi sổ)', isRisky: true }
  ];

  const selectedMethod = paymentMethods.find(m => m.id === b12.selected_payment_method);
  const isRiskLockedActive = isHighRisk && selectedMethod?.isRisky;
  const isBypassValid = b12.risk_justification.trim().split(' ').length > 10; // Cần giải trình ít nhất 10 từ

  return (
    <section className="glass-panel" style={{ opacity: isDisabled ? 0.6 : 1, pointerEvents: isDisabled ? 'none' : 'auto' }}>
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xl font-bold">Bài 12: Kiểm soát Rủi ro Thanh toán & Chốt đơn An toàn</h2>
      </div>
      <p className="text-secondary text-sm mb-6">
        Chốt đơn không phải là lúc khách nói "Đồng ý", mà là lúc bạn đảm bảo đơn hàng đủ an toàn để thực thi.
      </p>

      {isHighRisk && (
        <div style={{ padding: '12px 16px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Cảnh báo Profile Rủi ro cao!</strong><br/>
            Cơ hội này có Điểm Opportunity ({opportunityScore}/100) thấp hoặc Điểm Access = 0 (Chưa tiếp cận được người ra quyết định).<br/>
            Hệ thống <strong>khóa các phương thức thanh toán rủi ro (O/A, D/P, T/T Trả chậm)</strong>. Vui lòng chọn T/T Advance hoặc L/C At Sight.
          </div>
        </div>
      )}

      {/* Payment Selection */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '16px' }}>Khu vực 1: Chọn Phương thức Thanh toán</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {paymentMethods.map(method => {
            const isLockedMethod = isHighRisk && method.isRisky;
            const isSelected = b12.selected_payment_method === method.id;
            
            return (
              <button
                key={method.id}
                onClick={() => handlePaymentSelect(method.id)}
                disabled={isDisabled}
                style={{
                  padding: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  borderRadius: '8px',
                  color: isLockedMethod ? 'var(--text-secondary)' : 'var(--text-primary)',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isLockedMethod ? 0.6 : 1,
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? 'bold' : 'normal' }}>{method.label}</span>
                {isLockedMethod && <Lock size={14} color="var(--accent-danger)" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Bypass Justification */}
      {isRiskLockedActive && (
        <div style={{ marginBottom: '32px', padding: '16px', background: 'rgba(239, 68, 68, 0.05)', border: '1px dashed rgba(239, 68, 68, 0.4)', borderRadius: '8px' }}>
          <h4 style={{ color: 'var(--accent-danger)', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px' }}>Yêu cầu Giải trình Ngoại lệ (Bypass Justification)</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Bạn đang cố tình chọn phương thức rủi ro ({selectedMethod?.label}) cho một tài khoản có tín nhiệm thấp. Hãy giải trình phương án phòng ngừa rủi ro tín dụng (VD: Mua bảo hiểm tín dụng xuất khẩu, nhờ bên thứ 3 xác lãnh, v.v.).</p>
          <textarea
            value={b12.risk_justification}
            onChange={(e) => handleJustificationChange(e.target.value)}
            onBlur={handleBlur}
            disabled={isDisabled}
            placeholder="Giải trình > 10 từ..."
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '12px',
              background: 'rgba(0,0,0,0.2)',
              border: `1px solid ${!isBypassValid && b12.risk_justification.length > 0 ? 'var(--accent-danger)' : 'var(--border-color)'}`,
              borderRadius: '6px',
              color: 'var(--text-primary)',
              resize: 'vertical',
              fontSize: '0.9rem'
            }}
          />
          {!isBypassValid && b12.risk_justification.length > 0 && (
            <span style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>Cần giải trình chi tiết hơn (ít nhất 10 từ).</span>
          )}
        </div>
      )}

      {/* Safe Order Checklist */}
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="#10b981" /> Khu vực 2: Safe Order Checklist (Trước khi xuất PI/SC)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.6 : 1 }}>
            <input
              type="checkbox"
              checked={b12.checklist.check_bec}
              onChange={(e) => handleChecklistChange('check_bec', e.target.checked)}
              disabled={isDisabled}
              style={{ marginTop: '4px' }}
            />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Kiểm tra chống lừa đảo BEC (Business Email Compromise)</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Đã check kỹ địa chỉ email của khách, đuôi tên miền, và gọi điện thoại/Whatsapp xác nhận lại thông tin tài khoản ngân hàng thụ hưởng.</div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.6 : 1 }}>
            <input
              type="checkbox"
              checked={b12.checklist.check_local_charge}
              onChange={(e) => handleChecklistChange('check_local_charge', e.target.checked)}
              disabled={isDisabled}
              style={{ marginTop: '4px' }}
            />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Chốt rõ Local Charge tại cảng xuất / cảng đích</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tránh tranh cãi phí bến bãi, THC, phí DEM/DET.</div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.6 : 1 }}>
            <input
              type="checkbox"
              checked={b12.checklist.check_vessel}
              onChange={(e) => handleChecklistChange('check_vessel', e.target.checked)}
              disabled={isDisabled}
              style={{ marginTop: '4px' }}
            />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Khả năng Booking Lịch Tàu</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Đã check sơ bộ lịch tàu/chuyến bay khả thi phù hợp với Lead time cam kết.</div>
            </div>
          </label>
        </div>
      </div>
    </section>
  );
}
