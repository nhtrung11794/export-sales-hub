'use client';

import React, { useState } from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, Mail, Plus, Trash2, ArrowRight, FileSpreadsheet, X, Upload } from 'lucide-react';
import { M03FormData, LeadItem } from './M03_CombinedForm';

interface Props {
  data: M03FormData;
  setData: React.Dispatch<React.SetStateAction<M03FormData>>;
  handleBlur: () => void;
  isDisabled?: boolean;
}

export default function B06_LeadTriage({ data, setData, handleBlur, isDisabled }: Props) {
  const [activeTab, setActiveTab] = useState<'triage' | 'outreach'>('triage');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');

  // Đảm bảo dữ liệu luôn có fallback
  const leads = data.b06_leads || [];
  const selectedTargets = leads.filter(l => l.is_target);
  const isLimitReached = selectedTargets.length >= 2;
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
      is_target: false
    };
    setData(prev => ({ ...prev, b06_leads: [...leads, newLead] }));
  };

  const handleRemoveLead = (id: string) => {
    if (isDisabled) return;
    setData(prev => ({ ...prev, b06_leads: leads.filter(l => l.id !== id) }));
  };

  const handleParseImport = () => {
    if (!importText.trim()) return;

    const lines = importText.split('\n').map(l => l.trim()).filter(Boolean);
    const parsedLeads: LeadItem[] = lines.map((line, idx) => {
      // Hỗ trợ tab, comma, hoặc pipe separator
      const parts = line.includes('\t') 
        ? line.split('\t') 
        : line.includes(',') 
          ? line.split(',') 
          : line.includes('|') 
            ? line.split('|') 
            : [line];

      const name = (parts[0] || '').trim();
      const web = (parts[1] || '').trim();
      const size = (parts[2] || '').trim() || '50-200 NV';
      const rawMatch = (parts[3] || '').trim().toLowerCase();
      let match: 'High' | 'Medium' | 'Low' | 'Junk' = 'High';
      if (rawMatch.includes('med') || rawMatch.includes('trung')) match = 'Medium';
      else if (rawMatch.includes('low') || rawMatch.includes('thấp')) match = 'Low';
      else if (rawMatch.includes('junk') || rawMatch.includes('rác')) match = 'Junk';

      return {
        id: `lead_ai_${Date.now()}_${idx}`,
        company_name: name,
        website: web,
        estimated_size: size,
        icp_match: match,
        is_target: idx < 2 // Chọn sẵn 2 dòng đầu tiên
      };
    });

    if (parsedLeads.length > 0) {
      setData(prev => ({ ...prev, b06_leads: parsedLeads }));
      setIsImportModalOpen(false);
      setImportText('');
    }
  };

  const handleInsertSampleAI = () => {
    setImportText(`Golden Harvest Foods\tgoldenharvest.us\t100-500 NV\tHigh
Apex Global Trade\tapex-global.eu\t50-100 NV\tHigh
Sunrise Bulk Agro\tsunrise-agro.com\t20-50 NV\tMedium
Metro Spices Corp\tmetrospices.de\t500+ NV\tLow
Random Broker LLC\trandombroker.net\t1-5 NV\tJunk`);
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '8px' }}>
            Bài 06: Sàng lọc Lead & Tiếp cận Mục tiêu (Lead Triage & Outreach)
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Lọc bỏ lead rác và tập trung nguồn lực tiếp cận 1-2 Target Accounts chất lượng cao nhất.
          </p>
        </div>

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
              setActiveTab('outreach');
            }}
          >
            2. Kịch bản Tiếp cận ({selectedTargets.length})
          </button>
        </div>
      </div>

      {activeTab === 'triage' && (
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
            background: isLimitReached ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.08)',
            border: `1px solid ${isLimitReached ? '#10b981' : 'rgba(59, 130, 246, 0.25)'}`,
            padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.875rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isLimitReached ? <CheckCircle2 size={20} color="#10b981" /> : <AlertTriangle size={20} color="var(--accent-primary)" />}
              <div>
                <strong>Quy tắc Tập trung (Focus Constraint):</strong> Đã chọn <strong>{selectedTargets.length}/2 Target Accounts</strong>. 
                {isLimitReached ? ' Các ô còn lại đã tự động khóa để bảo vệ tính kỷ luật B2B.' : ' Hãy chọn tối đa 2 accounts nét nhất.'}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsImportModalOpen(true)}
              style={{ gap: 6, fontSize: '.8rem', padding: '6px 14px', background: 'rgba(59,130,246,.15)', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
            >
              <FileSpreadsheet size={15} /> 📥 Dán danh sách từ AI / CSV
            </button>
          </div>

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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {leads.map((lead, index) => {
              const isCheckboxDisabled = isDisabled || (!lead.is_target && isLimitReached);

              return (
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

                  <div 
                    style={{ display: 'flex', justifyContent: 'center' }}
                    title={!lead.is_target && isLimitReached ? 'Chỉ được tập trung tối đa 2 Leads' : undefined}
                  >
                    <input
                      type="checkbox"
                      checked={!!lead.is_target}
                      onChange={(e) => handleFieldChange(lead.id, 'is_target', e.target.checked)}
                      disabled={isCheckboxDisabled}
                      style={{ 
                        width: '18px', 
                        height: '18px', 
                        cursor: isCheckboxDisabled ? 'not-allowed' : 'pointer',
                        opacity: isCheckboxDisabled && !lead.is_target ? 0.35 : 1,
                        accentColor: 'var(--accent-primary)' 
                      }}
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
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsImportModalOpen(true)}
                style={{ fontSize: '0.85rem', gap: '6px' }}
              >
                <FileSpreadsheet size={16} /> 📥 Dán danh sách từ AI / CSV
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddLead}
                disabled={isDisabled}
                style={{ fontSize: '0.85rem', gap: '6px' }}
              >
                <Plus size={16} /> + Thêm dòng thủ công
              </button>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                if (selectedTargets.length === 0) {
                  alert('Vui lòng chọn ít nhất 1 Target Account trước khi tiếp tục!');
                  return;
                }
                setActiveTab('outreach');
              }}
              style={{ fontSize: '0.875rem', gap: '8px' }}
            >
              Chuyển sang Viết Kịch bản Tiếp cận ({selectedTargets.length}) <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'outreach' && (
        <div>
          <div style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              🎯 Đang soạn kịch bản cá nhân hóa cho <strong>{selectedTargets.length} Target Accounts</strong> đã chọn ở Bước 1.
            </span>
          </div>

          {selectedTargets.map((lead) => {
            const current = outreachData[lead.id] || { relevance: '', value_angle: '', cta: '', email_draft: '' };

            return (
              <div key={lead.id} className="outreach-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                  <h3 style={{ color: 'var(--accent-primary)', fontSize: '1.15rem', fontWeight: 'bold', margin: 0 }}>
                    🏢 {lead.company_name || 'Target Account'} ({lead.website || 'Chưa có website'})
                  </h3>
                  <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 'bold' }}>
                    Độ khớp ICP: {lead.icp_match || 'High'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
                        1. Sự thật ngầm hiểu / Liên hệ (Relevance Hook):
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="VD: Doanh nghiệp đang mở rộng chuỗi bán lẻ tại Đức..."
                        value={current.relevance || ''}
                        onChange={(e) => handleOutreachChange(lead.id, 'relevance', e.target.value)}
                        onBlur={handleBlur}
                        disabled={isDisabled}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
                        2. Góc Giá trị / Giải pháp (Value Angle):
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="VD: Cung cấp hạt điều Organic đạt chứng nhận BRC/IFS, giảm 12% TCO..."
                        value={current.value_angle || ''}
                        onChange={(e) => handleOutreachChange(lead.id, 'value_angle', e.target.value)}
                        onBlur={handleBlur}
                        disabled={isDisabled}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
                        3. Lời kêu gọi hành động áp lực thấp (Low-friction CTA):
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="VD: Phản hồi email này để nhận bảng Specs và mẫu test miễn phí tuần này."
                        value={current.cta || ''}
                        onChange={(e) => handleOutreachChange(lead.id, 'cta', e.target.value)}
                        onBlur={handleBlur}
                        disabled={isDisabled}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleGenerateDraft(lead)}
                      disabled={isDisabled}
                      style={{ marginTop: '6px', fontSize: '0.85rem', gap: '6px' }}
                    >
                      <Sparkles size={16} color="var(--accent-primary)" /> Tự động ghép thành Bản nháp Email
                    </button>
                  </div>

                  {/* CỘT PHẢI: BẢN NHÁP EMAIL HOÀN CHỈNH */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
                      Bản nháp Email Tiếp cận (Outreach Cold Email):
                    </label>
                    <textarea
                      className="form-input"
                      rows={9}
                      placeholder="Bản nháp email sẽ được tạo ở đây hoặc bạn có thể tự soạn thảo..."
                      value={current.email_draft || ''}
                      onChange={(e) => handleOutreachChange(lead.id, 'email_draft', e.target.value)}
                      onBlur={handleBlur}
                      disabled={isDisabled}
                      style={{ fontSize: '0.85rem', lineHeight: '1.5' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActiveTab('triage')}
              style={{ fontSize: '0.85rem' }}
            >
              ← Quay lại Sàng lọc Danh sách
            </button>
          </div>
        </div>
      )}

      {/* MODAL IMPORT DỮ LIỆU TỪ AI / CSV */}
      {isImportModalOpen && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'grid', placeItems: 'center', padding: 24, background: 'rgba(2,6,23,.85)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ width: 'min(640px, 95vw)', display: 'flex', flexDirection: 'column', border: '1px solid var(--accent-primary)', boxShadow: '0 24px 60px rgba(0,0,0,.6)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileSpreadsheet size={18} color="var(--accent-primary)" /> Dán Danh Sách Leads từ AI / CSV
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} aria-label="Đóng" style={{ border: 0, background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: '.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Dán kết quả tìm kiếm Lead từ <strong>Gemini Spark / ChatGPT</strong> hoặc file CSV/Excel vào đây. Cấu trúc mỗi dòng: <code>Tên Công Ty [Tab / Phẩy] Website [Tab / Phẩy] Quy Mô [Tab / Phẩy] Điểm Fit (High/Medium/Low)</code>
              </p>

              <textarea
                className="form-input"
                rows={7}
                placeholder={`Golden Harvest Foods\tgoldenharvest.us\t100-500 NV\tHigh\nApex Global Trade\tapex-global.eu\t50-100 NV\tHigh`}
                value={importText}
                onChange={e => setImportText(e.target.value)}
                style={{ fontSize: '.82rem', fontFamily: 'monospace', lineHeight: 1.4 }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleInsertSampleAI}
                  style={{ background: 'transparent', border: 0, color: 'var(--accent-primary)', fontSize: '.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  ⚡ Chèn nhanh 5 Leads mẫu từ Gemini AI
                </button>
                <span style={{ fontSize: '.76rem', color: 'var(--text-muted)' }}>
                  {importText.trim().split('\n').filter(Boolean).length} dòng phát hiện
                </span>
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setIsImportModalOpen(false)} style={{ fontSize: '.84rem' }}>Hủy</button>
              <button className="btn btn-primary" onClick={handleParseImport} disabled={!importText.trim()} style={{ fontSize: '.84rem', gap: 6 }}>
                <Upload size={15} /> Nhập vào Bảng Sàng Lọc
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
