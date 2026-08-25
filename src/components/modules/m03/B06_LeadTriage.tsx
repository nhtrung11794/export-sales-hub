'use client';

import React, { useState } from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, Mail, Plus, Trash2, ArrowRight } from 'lucide-react';
import { M03FormData, LeadItem } from './M03_CombinedForm';

interface Props {
  data: M03FormData;
  setData: React.Dispatch<React.SetStateAction<M03FormData>>;
  handleBlur: () => void;
  isDisabled?: boolean;
}

export default function B06_LeadTriage({ data, setData, handleBlur, isDisabled }: Props) {
  const [activeTab, setActiveTab] = useState<'triage' | 'outreach'>('triage');

  // Đảm bảo dữ liệu luôn có fallback
  const leads = data.b06_leads || [];
  const selectedTargets = leads.filter(l => l.is_target);
  const isOverLimit = selectedTargets.length > 2;
  const outreachData = data.b06_outreach || {};

  const handleFieldChange = (leadId: string, field: keyof LeadItem, value: any) => {
    if (isDisabled) return;
    const updatedLeads: LeadItem[] = leads.map(l => l.id === leadId ? { ...l, [field]: value } : l);
    setData(prev => ({ ...prev, b06_leads: updatedLeads }));
  };

  const handleAddLead = () => {
    if (isDisabled) return;
    const newLead: LeadItem = {
      id: `lead_${Date.now()}`,
      company_name: '',
      website: '',
      estimated_size: '',
      icp_match: 'High',
      is_target: leads.length === 0 // Tự chọn nếu là dòng đầu
    };
    setData(prev => ({ ...prev, b06_leads: [...leads, newLead] }));
  };

  const handleRemoveLead = (id: string) => {
    if (isDisabled) return;
    setData(prev => ({ ...prev, b06_leads: leads.filter(l => l.id !== id) }));
  };

  const handleOutreachChange = (leadId: string, field: string, value: string) => {
    if (isDisabled) return;
    setData(prev => ({
      ...prev,
      b06_outreach: {
        ...prev.b06_outreach,
        [leadId]: {
          ...(prev.b06_outreach?.[leadId] || { relevance: '', value_angle: '', cta: '', email_draft: '' }),
          [field]: value
        }
      }
    }));
  };

  const handleGenerateDraft = (lead: typeof leads[0]) => {
    const current = outreachData[lead.id] || { relevance: '', value_angle: '', cta: '', email_draft: '' };
    const draft = `Subject: Hợp tác xuất khẩu B2B cùng ${lead.company_name || '[Tên Công Ty]'}

Kính gửi Quý công ty ${lead.company_name || ''},

Chúng tôi theo dõi hoạt động kinh doanh của Quý công ty và nhận thấy ${current.relevance || '[Sự thật ngầm hiểu về hoạt động của Buyer]'}.

Với tư cách là nhà sản xuất chuyên sâu, chúng tôi có thể hỗ trợ Quý công ty giải quyết vấn đề: ${current.value_angle || '[Góc giá trị / giải pháp cốt lõi]'}.

${current.cta || 'Quý công ty có thể phản hồi để chúng tôi gửi bảng tiêu chuẩn kỹ thuật (Specs) và mẫu thử nghiệm trong tuần này.'}

Trân trọng,
[Đội ngũ Sales B2B Export]`;

    handleOutreachChange(lead.id, 'email_draft', draft);
  };

  return (
    <section className="glass-panel" style={{ padding: '32px' }}>
      <style>{`
        .lead-row {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 12px 16px;
          border-radius: 10px;
        }
        .lead-row:focus-within {
          background: rgba(15, 23, 42, 0.8);
          border-color: var(--accent-primary);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
          transform: translateY(-2px);
          z-index: 10;
        }
        .outreach-box {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        .outreach-box:focus-within {
          background: rgba(15, 23, 42, 0.8);
          border-color: var(--accent-primary);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
        }
        .tab-btn {
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: bold;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .tab-btn.active {
          background: var(--accent-primary);
          color: white;
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.3);
        }
        .tab-btn.inactive {
          background: rgba(255,255,255,0.05);
          color: var(--text-secondary);
        }
      `}</style>

      {/* HEADER BÀI HỌC */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '8px' }}>
            Bài 06: Sàng lọc Lead & Tiếp cận Mục tiêu (Lead Triage & Outreach)
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Lọc bỏ lead rác và tập trung nguồn lực tiếp cận 1-2 Target Accounts chất lượng cao nhất.
          </p>
        </div>

        {/* TAB TOGGLE */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px' }}>
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'triage' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('triage')}
          >
            1. Sàng lọc Danh sách ({leads.length})
          </button>
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'outreach' ? 'active' : 'inactive'}`}
            onClick={() => {
              if (selectedTargets.length === 0) {
                alert('Vui lòng chọn ít nhất 1 Target Account ở Tab 1 trước khi viết kịch bản!');
                return;
              }
              if (isOverLimit) {
                alert('Bạn đang chọn quá 2 Target Accounts. Hãy bỏ bớt để tiếp tục!');
                return;
              }
              setActiveTab('outreach');
            }}
          >
            2. Kịch bản Tiếp cận ({selectedTargets.length})
          </button>
        </div>
      </div>

      {/* TAB 1: LEAD TRIAGE */}
      {activeTab === 'triage' && (
        <div>
          {/* CẢNH BÁO FOCUS CONSTRAINT */}
          {isOverLimit && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-danger)',
              padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', color: '#fca5a5', fontSize: '0.875rem'
            }}>
              <AlertTriangle size={20} color="var(--accent-danger)" style={{ flexShrink: 0 }} />
              <div>
                <strong>Quy tắc Tập trung (Focus Constraint):</strong> Tư duy B2B không phải là Spam. Bạn đang chọn {selectedTargets.length} leads. Hãy chọn tối đa <strong>2 Target Accounts</strong> nét nhất để cá nhân hóa kịch bản tiếp cận!
              </div>
            </div>
          )}

          {/* TABLE HEADER */}
          <div style={{
            display: 'grid', gridTemplateColumns: '3fr 3fr 2fr 2fr 1.5fr 40px', gap: '12px',
            padding: '0 16px', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 'bold',
            borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px',
            textAlign: 'center'
          }}>
            <div style={{ textAlign: 'left' }}>Tên Công ty</div>
            <div style={{ textAlign: 'left' }}>Website / Domain</div>
            <div>Quy mô ước tính</div>
            <div>Độ khớp ICP</div>
            <div>Target Account</div>
            <div></div>
          </div>

          {/* LEADS LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {leads.map((lead, index) => (
              <div key={lead.id} className="lead-row" style={{ display: 'grid', gridTemplateColumns: '3fr 3fr 2fr 2fr 1.5fr 40px', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder={`VD: Global Foods LLC #${index + 1}`}
                  value={lead.company_name || ''}
                  onChange={(e) => handleFieldChange(lead.id, 'company_name', e.target.value)}
                  onBlur={handleBlur}
                  disabled={isDisabled}
                  style={{ fontSize: '0.85rem' }}
                />
                
                <input
                  type="text"
                  className="form-input"
                  placeholder="globalfoods.com"
                  value={lead.website || ''}
                  onChange={(e) => handleFieldChange(lead.id, 'website', e.target.value)}
                  onBlur={handleBlur}
                  disabled={isDisabled}
                  style={{ fontSize: '0.85rem' }}
                />

                <input
                  type="text"
                  className="form-input"
                  placeholder="50-200 NV"
                  value={lead.estimated_size || ''}
                  onChange={(e) => handleFieldChange(lead.id, 'estimated_size', e.target.value)}
                  onBlur={handleBlur}
                  disabled={isDisabled}
                  style={{ fontSize: '0.85rem', textAlign: 'center' }}
                />

                <select
                  className="form-input"
                  value={lead.icp_match || 'High'}
                  onChange={(e) => handleFieldChange(lead.id, 'icp_match', e.target.value)}
                  onBlur={handleBlur}
                  disabled={isDisabled}
                  style={{ 
                    fontSize: '0.85rem',
                    color: lead.icp_match === 'High' ? '#10b981' : lead.icp_match === 'Medium' ? '#f59e0b' : '#ef4444',
                    fontWeight: 'bold'
                  }}
                >
                  <option value="High">Cao (High)</option>
                  <option value="Medium">Trung bình (Medium)</option>
                  <option value="Low">Thấp (Low)</option>
                  <option value="Junk">Rác (Junk)</option>
                </select>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <input
                    type="checkbox"
                    checked={!!lead.is_target}
                    onChange={(e) => handleFieldChange(lead.id, 'is_target', e.target.checked)}
                    disabled={isDisabled}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveLead(lead.id)}
                  disabled={isDisabled || leads.length <= 1}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--text-muted)',
                    cursor: leads.length <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  title="Xóa dòng"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* ACTION BUTTONS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={handleAddLead}
              disabled={isDisabled}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
            >
              <Plus size={16} /> Thêm Lead mới
            </button>

            <button
              type="button"
              onClick={() => {
                if (selectedTargets.length === 0) {
                  alert('Vui lòng chọn ít nhất 1 Target Account!');
                  return;
                }
                if (isOverLimit) {
                  alert('Vui lòng bỏ chọn bớt (tối đa 2 accounts) để tiếp tục!');
                  return;
                }
                setActiveTab('outreach');
              }}
              disabled={selectedTargets.length === 0 || isOverLimit}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}
            >
              Tiếp tục: Viết Kịch bản Tiếp cận ({selectedTargets.length}/2) <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: OUTREACH GENERATOR */}
      {activeTab === 'outreach' && (
        <div>
          {selectedTargets.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Chưa có Target Account nào được chọn. Vui lòng quay lại Tab 1 để chọn tối đa 2 Leads.
            </div>
          ) : (
            selectedTargets.map((lead, idx) => {
              const current = outreachData[lead.id] || { relevance: '', value_angle: '', cta: '', email_draft: '' };

              return (
                <div key={lead.id} className="outreach-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: 'var(--accent-primary)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        Mục tiêu #{idx + 1}
                      </span>
                      <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', margin: 0, fontWeight: 'bold' }}>
                        {lead.company_name || 'Chưa đặt tên công ty'}
                      </h3>
                      {lead.website && <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>({lead.website})</span>}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGenerateDraft(lead)}
                      disabled={isDisabled}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)',
                        border: '1px solid rgba(59, 130, 246, 0.2)', padding: '6px 12px',
                        borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 'bold'
                      }}
                    >
                      <Sparkles size={14} /> 🪄 Tạo Email Mẫu
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    {/* Cột trái: 3 trường Mad-libs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
                          1. Sự thật ngầm hiểu (Relevance / Trigger Event)
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="VD: Họ vừa ra mắt dòng sản phẩm Organic mới tháng trước..."
                          value={current.relevance || ''}
                          onChange={(e) => handleOutreachChange(lead.id, 'relevance', e.target.value)}
                          onBlur={handleBlur}
                          disabled={isDisabled}
                          style={{ fontSize: '0.85rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
                          2. Góc tiếp cận giá trị (Value Angle)
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="VD: Tối ưu chi phí bao bì 15% mà vẫn đạt chứng chỉ USDA..."
                          value={current.value_angle || ''}
                          onChange={(e) => handleOutreachChange(lead.id, 'value_angle', e.target.value)}
                          onBlur={handleBlur}
                          disabled={isDisabled}
                          style={{ fontSize: '0.85rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
                          3. Kêu gọi hành động (Low-friction CTA)
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="VD: Đề xuất gửi bảng Test Report và 3 mẫu dùng thử miễn phí..."
                          value={current.cta || ''}
                          onChange={(e) => handleOutreachChange(lead.id, 'cta', e.target.value)}
                          onBlur={handleBlur}
                          disabled={isDisabled}
                          style={{ fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>

                    {/* Cột phải: Bản nháp Email hoàn chỉnh */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
                        <Mail size={14} /> Bản nháp Email tiếp cận (Cold Outreach Draft)
                      </label>
                      <textarea
                        className="form-input"
                        rows={7}
                        placeholder="Nội dung email sau khi ghép hoặc tự viết lại..."
                        value={current.email_draft || ''}
                        onChange={(e) => handleOutreachChange(lead.id, 'email_draft', e.target.value)}
                        onBlur={handleBlur}
                        disabled={isDisabled}
                        style={{ fontSize: '0.85rem', resize: 'vertical', flex: 1, fontFamily: 'sans-serif' }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('triage')}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              ← Quay lại Sàng lọc Danh sách
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
