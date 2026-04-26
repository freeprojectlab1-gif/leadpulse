import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- PREMIUM SVG ICONS ---
const DashIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const SendIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const TemplateIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const HistoryIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const ArchiveIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>;
const VarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [passcode, setPasscode] = useState('');
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'dashboard');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [customFields, setCustomFields] = useState([]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('activeTab', tab);
  };

  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState(localStorage.getItem('saved_subject') || 'Question about {{Website}} - Software Engineer');
  const [body1, setBody1] = useState(localStorage.getItem('saved_body1') || 'Hi {{First Name}},\n\nI was recently checking out {{Website}}.');
  const [body2, setBody2] = useState(localStorage.getItem('saved_body2') || 'Hey {{First Name}}, following up...');
  const [body3, setBody3] = useState(localStorage.getItem('saved_body3') || 'Hi {{First Name}}, final touch...');
  const [emailUser, setEmailUser] = useState('muntazir.site@gmail.com');
  const [emailPass, setEmailPass] = useState('bbad zuak ztni mnbr');
  const [stats, setStats] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [sending, setSending] = useState(false);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [selectedLeadForTpl, setSelectedLeadForTpl] = useState(null);
  const [intelLead, setIntelLead] = useState(null);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVarModalOpen, setIsVarModalOpen] = useState(false);
  const [modalLead, setModalLead] = useState(null);
  const [modalTpl, setModalTpl] = useState(null);
  const [modalData, setModalData] = useState({});

  useEffect(() => {
    if (isLoggedIn) {
      fetchStats();
      fetchRecipients();
      fetchCustomTemplates();
      fetchCustomFields();
      const interval = setInterval(() => {
        fetchStats();
        fetchRecipients();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const fetchCustomFields = async () => {
    try {
      const res = await axios.get('/api/custom-fields');
      setCustomFields(Array.isArray(res.data) ? res.data : []);
    } catch (e) { 
      console.error("API Error (Fields):", e.message); 
      setCustomFields([]);
    }
  };

  const fetchCustomTemplates = async () => {
    try {
      const res = await axios.get('/api/email-templates');
      setCustomTemplates(Array.isArray(res.data) ? res.data : []);
    } catch (e) { setCustomTemplates([]); }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/stats');
      if (Array.isArray(res.data)) {
        setStats(res.data);
      } else {
        setStats([]);
      }
    } catch (e) { 
      console.error("Stats Fetch Error:", e);
      setStats([]); 
    }
  };

  const fetchRecipients = async () => {
    try {
      const res = await axios.get('/api/recipients');
      setRecipients(Array.isArray(res.data) ? res.data : []);
    } catch (e) { setRecipients([]); }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === 'muntazir_pro') {
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
    } else alert("Invalid Passcode!");
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleStartCampaign = async () => {
    if (!file) return alert("Upload Excel!");
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', subject);
    formData.append('body1', body1);
    formData.append('body2', body2);
    formData.append('body3', body3);
    formData.append('emailUser', emailUser);
    formData.append('emailPass', emailPass);
    setSending(true);
    try {
      await axios.post('/api/start-campaign', formData);
      fetchStats();
      switchTab('logs');
    } catch (err) { alert(err.message); }
    finally { setSending(false); }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('saved_subject', subject);
    localStorage.setItem('saved_body1', body1);
    localStorage.setItem('saved_body2', body2);
    localStorage.setItem('saved_body3', body3);
    alert("Sequence Settings Saved! ✅");
  };

  const handleSaveCustomTemplate = async () => {
    const name = document.getElementById('tplName').value;
    const sub = document.getElementById('tplSub').value;
    const bdy = document.getElementById('tplBody').value;
    if (!name || !sub || !bdy) return alert("Fill all!");
    try {
      if (editingTemplateId) await axios.put(`/api/email-templates/${editingTemplateId}`, { name, subject: sub, body: bdy });
      else await axios.post('/api/email-templates', { name, subject: sub, body: bdy });
      setEditingTemplateId(null);
      document.getElementById('tplName').value = '';
      document.getElementById('tplSub').value = '';
      document.getElementById('tplBody').value = '';
      fetchCustomTemplates();
    } catch (e) { alert("Save failed"); }
  };

  const handleSendCustomTemplate = async (leadId, templateId) => {
    const lead = recipients.find(r => r._id === leadId);
    const template = customTemplates.find(t => t._id === templateId);
    if (!lead || !template) return;
    const combined = template.subject + " " + template.body;
    const matches = combined.matchAll(/\{\{([^}]*)\}\}/g);
    const vars = [...new Set([...matches].map(m => m[1]))];
    if (vars.length > 0) {
      const initialData = {};
      vars.forEach(v => { initialData[v] = (lead.data && lead.data[v]) || ""; });
      setModalData(initialData);
      setModalLead(lead);
      setModalTpl(template);
      setIsVarModalOpen(true);
      setSelectedLeadForTpl(null);
    } else {
      try {
        await axios.post(`/api/send-custom/${leadId}/${templateId}`);
        alert("Sent! ✅");
        setSelectedLeadForTpl(null);
        fetchRecipients();
      } catch (e) { alert(e.response?.data?.error || "Error"); }
    }
  };

  const confirmAndSendCustom = async () => {
    try {
      await axios.post(`/api/send-custom/${modalLead._id}/${modalTpl._id}`, { customData: modalData });
      alert("Sent! 🚀");
      setIsVarModalOpen(false);
      fetchRecipients();
    } catch (e) { alert(e.response?.data?.error || "Error"); }
  };

  const getStatCount = (id) => {
    if (!Array.isArray(stats)) return 0;
    return stats.find(s => s._id === id)?.count || 0;
  };

  if (!isLoggedIn) {
    return (
      <div className="login-vibe">
        <form className="login-form" onSubmit={handleLogin}>
          <div className="brand" style={{justifyContent:'center', fontSize:'1.5rem'}}>PRO EMAILER</div>
          <h1 style={{marginTop:'10px'}}>Admin Access</h1>
          <input type="password" placeholder="Enter Secure Passcode" value={passcode} onChange={e => setPasscode(e.target.value)} />
          <button type="submit">Authenticate</button>
        </form>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{background:'#f1f5f9'}}>
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`} style={{background:'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)'}}>
        <div className="brand">PRO EMAILER</div>
        <nav>
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => switchTab('dashboard')}><DashIcon /> Dashboard</div>
          <div className={`nav-item ${activeTab === 'campaign' ? 'active' : ''}`} onClick={() => switchTab('campaign')}><SendIcon /> New Campaign</div>
          <div className={`nav-item ${activeTab === 'template' ? 'active' : ''}`} onClick={() => switchTab('template')}><TemplateIcon /> Settings</div>
          <div className={`nav-item ${activeTab === 'custom_templates' ? 'active' : ''}`} onClick={() => switchTab('custom_templates')}><TemplateIcon /> Custom Templates</div>
          <div className={`nav-item ${activeTab === 'variables' ? 'active' : ''}`} onClick={() => switchTab('variables')}><VarIcon /> Variable Manager</div>
          <div className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => switchTab('logs')}><HistoryIcon /> Delivery Logs</div>
          <div className={`nav-item ${activeTab === 'archive' ? 'active' : ''}`} onClick={() => switchTab('archive')}><ArchiveIcon /> Archive</div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(true)}>☰</button>
            <h2 style={{textTransform:'uppercase', letterSpacing:'1px', color:'#0f172a'}}>{activeTab.replace('_', ' ')}</h2>
          </div>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="btn-icon btn-stop" style={{borderRadius:'50px', padding:'8px 20px'}}>Logout</button>
        </header>

        <section className="content-area">
          {activeTab === 'dashboard' && (
            <>
              <div className="stats-grid">
                <div className="stat-card" style={{borderLeft:'4px solid #4f46e5'}}><span className="stat-label">Total Leads</span><span className="stat-value">{recipients.length}</span></div>
                <div className="stat-card" style={{borderLeft:'4px solid #4f46e5'}}><span className="stat-label">Active Sequence</span><span className="stat-value" style={{ color: 'var(--primary)' }}>{getStatCount('pending') + getStatCount('Step 1 Sent') + getStatCount('Step 2 Sent')}</span></div>
                <div className="stat-card" style={{borderLeft:'4px solid #10b981'}}><span className="stat-label">Replied</span><span className="stat-value" style={{ color: 'var(--success)' }}>{getStatCount('replied')}</span></div>
                <div className="stat-card" style={{borderLeft:'4px solid #64748b'}}><span className="stat-label">Finished</span><span className="stat-value" style={{ color: 'var(--text-muted)' }}>{getStatCount('finished')}</span></div>
              </div>
              <div className="log-card">
                 <div style={{padding:'20px', borderBottom:'1px solid #f1f5f9', fontWeight:'600'}}>Recent Activity</div>
                 <table className="pro-table">
                   <thead><tr><th>EMAIL</th><th>STATUS</th><th>TIME</th></tr></thead>
                   <tbody>
                     {(Array.isArray(recipients) ? recipients : []).slice(0, 5).map(r => (
                       <tr key={r._id}><td>{r.email}</td><td><span className={`status-badge status-${r.status.toLowerCase().replace(/ /g, '-')}`}>{r.status}</span></td><td>{r.lastSentAt ? new Date(r.lastSentAt).toLocaleTimeString() : 'Pending'}</td></tr>
                     ))}
                   </tbody>
                 </table>
              </div>
            </>
          )}

          {activeTab === 'variables' && (
            <div className="config-card" style={{ maxWidth: '700px', margin:'auto' }}>
              <h3>Variable Manager 📊</h3>
              <p style={{color:'var(--text-muted)', marginBottom:'20px'}}>Add or remove custom fields for your outreach forms.</p>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                <input type="text" id="newVar" placeholder="New variable (e.g. Industry, City)" style={{ flex: 1, padding:'12px' }} />
                <button className="launch-btn" style={{ width: 'auto', padding:'0 25px' }} onClick={async () => {
                  const val = document.getElementById('newVar').value;
                  if (!val) return;
                  await axios.post('/api/custom-fields', { name: val });
                  document.getElementById('newVar').value = '';
                  fetchCustomFields();
                }}>Add Field</button>
              </div>
              <div className="field-list" style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                {(Array.isArray(customFields) ? customFields : []).map(f => (
                  <div key={f._id} className="stat-card" style={{ flexDirection: 'row', justifyContent: 'space-between', padding: '15px', background:'#f8fafc' }}>
                    <span style={{fontWeight:'600'}}>{f.name}</span>
                    <button onClick={async () => { if(window.confirm('Delete field?')) { await axios.delete(`/api/custom-fields/${f._id}`); fetchCustomFields(); } }} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight:'600' }}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'campaign' && (
            <div className="campaign-grid">
              <div className="config-card">
                <h3>Bulk Outreach 🚀</h3>
                <p style={{color:'var(--text-muted)', marginBottom:'15px'}}>Upload Excel/CSV to start automation.</p>
                <div className="upload-box" onClick={() => document.getElementById('f-bulk').click()}>
                  <p>{file ? `Attached: ${file.name}` : 'Click to Upload Excel/CSV'}</p>
                  <input id="f-bulk" type="file" hidden onChange={handleFileChange} />
                </div>
                <button className="launch-btn" onClick={handleStartCampaign} disabled={sending}>{sending ? 'Processing...' : 'Launch Bulk Sequence'}</button>
              </div>
              <div className="config-card">
                <h3>Direct Lead Entry 📝</h3>
                <p style={{color:'var(--text-muted)', marginBottom:'15px'}}>Manually add one lead to the active sequence.</p>
                <div className="field"><label>Email Address</label><input type="email" id="man_em" placeholder="client@example.com" /></div>
                {(Array.isArray(customFields) ? customFields : []).map(f => (
                  <div className="field" key={f._id}><label>{f.name}</label><input type="text" className="dyn-field" data-name={f.name} placeholder={`Enter ${f.name}...`} /></div>
                ))}
                <button className="launch-btn" style={{background:'#0f172a'}} onClick={async () => {
                  const email = document.getElementById('man_em').value;
                  if (!email) return alert("Email required");
                  const data = {};
                  document.querySelectorAll('.dyn-field').forEach(el => data[el.getAttribute('data-name')] = el.value);
                  try {
                    await axios.post('/api/add-recipient', { email, subject, body1, body2, body3, emailUser, emailPass, data });
                    alert("Lead Added & Dispatching! 🚀");
                    document.getElementById('man_em').value = '';
                    document.querySelectorAll('.dyn-field').forEach(el => el.value = '');
                    fetchRecipients(); fetchStats();
                  } catch (e) { alert("Duplicate lead or Error"); }
                }}>Dispatch Now</button>
              </div>
            </div>
          )}

          {activeTab === 'template' && (
            <div className="campaign-grid">
              <div className="config-card full-width">
                <h3>1. SMTP Configuration</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop:'15px' }}>
                  <div className="field">
                    <label>Gmail User</label>
                    <input type="text" value={emailUser} onChange={e => setEmailUser(e.target.value)} placeholder="name@gmail.com" />
                  </div>
                  <div className="field">
                    <label>App Password</label>
                    <input type="password" value={emailPass} onChange={e => setEmailPass(e.target.value)} placeholder="xxxx xxxx xxxx xxxx" />
                  </div>
                </div>
              </div>

              <div className="config-card full-width">
                <h3>2. Sequence Design</h3>
                <div className="field" style={{marginTop:'15px'}}>
                  <label>Global Subject Line</label>
                  <input type="text" value={subject} onChange={e => setSubject(e.target.value)} style={{fontWeight:'600'}} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <div className="field">
                    <label>Step 1 (Day 0)</label>
                    <textarea value={body1} onChange={e => setBody1(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Step 2 (Day 3)</label>
                    <textarea value={body2} onChange={e => setBody2(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Step 3 (Day 6)</label>
                    <textarea value={body3} onChange={e => setBody3(e.target.value)} />
                  </div>
                </div>
                <button className="launch-btn" onClick={handleSaveSettings}>Save Settings & Templates</button>
              </div>
            </div>
          )}

          {activeTab === 'custom_templates' && (
            <div className="campaign-grid">
              <div className="config-card">
                <h3>{editingTemplateId ? 'Edit Template ✏️' : 'Create Custom Template 📝'}</h3>
                <div className="field"><label>Template Name</label><input id="tplName" placeholder="e.g. Website Offer" /></div>
                <div className="field"><label>Subject</label><input id="tplSub" placeholder="Question about {{Business}}" /></div>
                <div className="field"><label>Body</label><textarea id="tplBody" placeholder="Hi {{First Name}}, I saw your site..."></textarea></div>
                <button className="launch-btn" onClick={handleSaveCustomTemplate}>{editingTemplateId ? 'Update Template' : 'Save Template'}</button>
              </div>
              <div className="log-card full-width">
                 <div style={{padding:'20px', borderBottom:'1px solid #f1f5f9', fontWeight:'600'}}>Saved Templates</div>
                 <div style={{padding:'20px'}}>
                  {(Array.isArray(customTemplates) ? customTemplates : []).map(t => (
                    <div key={t._id} className="stat-card" style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: '15px', background:'#f8fafc' }}>
                      <div><div style={{fontWeight:'700'}}>{t.name}</div><div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{t.subject}</div></div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-icon" onClick={() => { setEditingTemplateId(t._id); document.getElementById('tplName').value = t.name; document.getElementById('tplSub').value = t.subject; document.getElementById('tplBody').value = t.body; window.scrollTo(0,0); }}>Edit</button>
                        <button className="btn-icon btn-stop" onClick={async () => { if(window.confirm('Delete?')) { await axios.delete(`/api/email-templates/${t._id}`); fetchCustomTemplates(); } }}>Del</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="log-card">
              <table className="pro-table">
                <thead><tr><th>RECIPIENT</th><th>STEP</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {(Array.isArray(recipients) ? recipients : []).filter(r => r.status !== 'archived').map(r => (
                    <tr key={r._id}>
                      <td onClick={() => setIntelLead(r)} style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight:'600' }}>{r.email}</td>
                      <td>{r.step > 3 ? 'Done' : `Step ${r.step}`}</td>
                      <td><span className={`status-badge status-${r.status.toLowerCase().replace(/ /g, '-')}`}>{r.status}</span></td>
                      <td>
                        <div className="action-btn-group">
                          <button className="btn-icon" onClick={() => setSelectedLeadForTpl(r._id)}>Send Custom</button>
                          {selectedLeadForTpl === r._id && (
                            <select style={{padding:'5px', borderRadius:'5px'}} onChange={(e) => handleSendCustomTemplate(r._id, e.target.value)}>
                              <option value="">Select...</option>
                              {(Array.isArray(customTemplates) ? customTemplates : []).map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>
                          )}
                          <button className="btn-icon btn-stop" onClick={async () => { if(window.confirm('Delete?')) { await axios.delete(`/api/delete-recipient/${r._id}`); fetchRecipients(); fetchStats(); } }}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'archive' && (
            <div className="log-card">
              <table className="pro-table">
                <thead><tr><th>RECIPIENT</th><th>LAST ACTIVITY</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {(Array.isArray(recipients) ? recipients : []).filter(r => r.status === 'archived').map(r => (
                    <tr key={r._id}>
                      <td onClick={() => setIntelLead(r)} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>{r.email}</td>
                      <td>{r.lastSentAt ? new Date(r.lastSentAt).toLocaleDateString() : 'Never'}</td>
                      <td>
                        <button className="btn-icon btn-continue" onClick={async () => { await axios.post(`/api/restart/${r._id}`); fetchRecipients(); fetchStats(); }}>Restore</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* INTELLIGENCE MODAL */}
      {intelLead && (
        <div className="modal-overlay">
          <div className="modal-content" style={{width:'600px'}}>
            <div className="modal-header"><h3>Lead Intelligence 🕵️‍♂️</h3><button className="btn-close" onClick={() => setIntelLead(null)}>×</button></div>
            <div className="modal-body">
              <p style={{fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'10px'}}>Email: <b>{intelLead.email}</b></p>
              <div style={{background:'#f8fafc', padding:'15px', borderRadius:'10px', marginBottom:'20px'}}>
                {intelLead.data && Object.keys(intelLead.data).map(k => <div key={k} style={{marginBottom:'5px'}}><b>{k}:</b> {intelLead.data[k]}</div>)}
              </div>
              <h4 style={{marginBottom:'10px'}}>Communication History</h4>
              <div className="timeline">
                {intelLead.history?.slice().reverse().map((h, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-date">{new Date(h.sentAt).toLocaleString()}</div>
                    <div className="timeline-event">{h.event}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VARIABLE INPUT MODAL */}
      {isVarModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3>Input Missing Variables</h3><button className="btn-close" onClick={() => setIsVarModalOpen(false)}>×</button></div>
            <div className="modal-body">
              {Object.keys(modalData).map(k => (
                <div className="field" key={k}><label>{k}</label><input value={modalData[k]} onChange={e => setModalData({ ...modalData, [k]: e.target.value })} placeholder={`Enter ${k}...`} /></div>
              ))}
            </div>
            <button className="launch-btn" style={{marginTop:'20px'}} onClick={confirmAndSendCustom}>Send Outreach Email 🚀</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
