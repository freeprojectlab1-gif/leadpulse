import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- ICONS (SVG) ---
const DashIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const SendIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const TemplateIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const HistoryIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const ArchiveIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>;

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
      setCustomFields(res.data);
    } catch (e) { console.error("API Error (Fields):", e.message); }
  };

  const fetchCustomTemplates = async () => {
    try {
      const res = await axios.get('/api/email-templates');
      setCustomTemplates(res.data);
    } catch (e) { }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/stats');
      setStats(res.data);
    } catch (e) { }
  };

  const fetchRecipients = async () => {
    try {
      const res = await axios.get('/api/recipients');
      setRecipients(res.data);
    } catch (e) { }
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

  const getStatCount = (id) => stats.find(s => s._id === id)?.count || 0;

  if (!isLoggedIn) {
    return (
      <div className="login-vibe">
        <form className="login-form" onSubmit={handleLogin}>
          <div className="brand">PRO EMAILER</div>
          <h1>Admin Portal</h1>
          <input type="password" placeholder="Passcode" value={passcode} onChange={e => setPasscode(e.target.value)} />
          <button type="submit">Access System</button>
        </form>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="brand">PRO EMAILER</div>
        <nav>
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => switchTab('dashboard')}><DashIcon /> Dashboard</div>
          <div className={`nav-item ${activeTab === 'campaign' ? 'active' : ''}`} onClick={() => switchTab('campaign')}><SendIcon /> New Campaign</div>
          <div className={`nav-item ${activeTab === 'template' ? 'active' : ''}`} onClick={() => switchTab('template')}><TemplateIcon /> Settings</div>
          <div className={`nav-item ${activeTab === 'custom_templates' ? 'active' : ''}`} onClick={() => switchTab('custom_templates')}><TemplateIcon /> Custom Templates</div>
          <div className={`nav-item ${activeTab === 'variables' ? 'active' : ''}`} onClick={() => switchTab('variables')}><DashIcon /> Variable Manager</div>
          <div className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => switchTab('logs')}><HistoryIcon /> Delivery Logs</div>
          <div className={`nav-item ${activeTab === 'archive' ? 'active' : ''}`} onClick={() => switchTab('archive')}><ArchiveIcon /> Archive</div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(true)}>☰</button>
            <h2>{activeTab.toUpperCase()}</h2>
          </div>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="btn-icon btn-stop">Logout</button>
        </header>

        <section className="content-area">
          {activeTab === 'dashboard' && (
            <>
              <div className="stats-grid">
                <div className="stat-card"><span className="stat-label">Total Leads</span><span className="stat-value">{recipients.length}</span></div>
                <div className="stat-card"><span className="stat-label">Active</span><span className="stat-value" style={{ color: 'var(--primary)' }}>{getStatCount('pending') + getStatCount('Step 1 Sent') + getStatCount('Step 2 Sent')}</span></div>
                <div className="stat-card"><span className="stat-label">Replied</span><span className="stat-value" style={{ color: 'var(--success)' }}>{getStatCount('replied')}</span></div>
                <div className="stat-card"><span className="stat-label">Finished</span><span className="stat-value" style={{ color: 'var(--text-muted)' }}>{getStatCount('finished')}</span></div>
              </div>
            </>
          )}

          {activeTab === 'variables' && (
            <div className="config-card" style={{ maxWidth: '600px' }}>
              <h3>Variable Manager 📊</h3>
              <p>Add/Remove fields for manual entry.</p>
              <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
                <input type="text" id="newVar" placeholder="New variable (e.g. City)" style={{ flex: 1 }} />
                <button className="launch-btn" style={{ width: 'auto' }} onClick={async () => {
                  const val = document.getElementById('newVar').value;
                  if (!val) return;
                  await axios.post('/api/custom-fields', { name: val });
                  document.getElementById('newVar').value = '';
                  fetchCustomFields();
                }}>Add</button>
              </div>
              {customFields.map(f => (
                <div key={f._id} className="stat-card" style={{ flexDirection: 'row', justifyContent: 'space-between', padding: '10px', marginBottom: '10px' }}>
                  <span>{f.name}</span>
                  <button onClick={async () => { await axios.delete(`/api/custom-fields/${f._id}`); fetchCustomFields(); }} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'campaign' && (
            <div className="campaign-grid">
              <div className="config-card">
                <h3>Bulk Upload 🚀</h3>
                <input type="file" onChange={handleFileChange} />
                <button className="launch-btn" onClick={handleStartCampaign} disabled={sending}>{sending ? 'Starting...' : 'Start Bulk Sequence'}</button>
              </div>
              <div className="config-card">
                <h3>Quick Add Lead 📝</h3>
                <div className="field"><label>Email</label><input type="email" id="man_em" placeholder="client@example.com" /></div>
                {customFields.map(f => (
                  <div className="field" key={f._id}><label>{f.name}</label><input type="text" className="dyn-field" data-name={f.name} placeholder={`Enter ${f.name}`} /></div>
                ))}
                <button className="launch-btn" onClick={async () => {
                  const email = document.getElementById('man_em').value;
                  if (!email) return alert("Email required");
                  const data = {};
                  document.querySelectorAll('.dyn-field').forEach(el => data[el.getAttribute('data-name')] = el.value);
                  try {
                    await axios.post('/api/add-recipient', { email, subject, body1, body2, body3, emailUser, emailPass, data });
                    alert("Added! 🚀");
                    document.getElementById('man_em').value = '';
                    document.querySelectorAll('.dyn-field').forEach(el => el.value = '');
                    fetchRecipients(); fetchStats();
                  } catch (e) { alert("Error"); }
                }}>Add to Sequence</button>
              </div>
            </div>
          )}

          {activeTab === 'custom_templates' && (
            <div className="campaign-grid">
              <div className="config-card">
                <h3>{editingTemplateId ? 'Edit ✏️' : 'New Template 📝'}</h3>
                <input id="tplName" placeholder="Name" />
                <input id="tplSub" placeholder="Subject" />
                <textarea id="tplBody" placeholder="Body..."></textarea>
                <button className="launch-btn" onClick={handleSaveCustomTemplate}>{editingTemplateId ? 'Update' : 'Save'}</button>
              </div>
              <div className="log-card full-width">
                {customTemplates.map(t => (
                  <div key={t._id} className="stat-card" style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div><b>{t.name}</b><br />{t.subject}</div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn-icon" onClick={() => { setEditingTemplateId(t._id); document.getElementById('tplName').value = t.name; document.getElementById('tplSub').value = t.subject; document.getElementById('tplBody').value = t.body; }}>Edit</button>
                      <button className="btn-icon" style={{ borderColor: 'red' }} onClick={async () => { await axios.delete(`/api/email-templates/${t._id}`); fetchCustomTemplates(); }}>Del</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="log-card">
              <table className="pro-table">
                <thead><tr><th>EMAIL</th><th>STEP</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {recipients.filter(r => r.status !== 'archived').map(r => (
                    <tr key={r._id}>
                      <td onClick={() => setIntelLead(r)} style={{ cursor: 'pointer', color: 'blue' }}>{r.email}</td>
                      <td>{r.step}</td>
                      <td>{r.status}</td>
                      <td>
                        <button className="btn-icon" onClick={() => setSelectedLeadForTpl(r._id)}>Send Custom</button>
                        {selectedLeadForTpl === r._id && (
                          <select onChange={(e) => handleSendCustomTemplate(r._id, e.target.value)}>
                            <option value="">Select Template</option>
                            {customTemplates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                          </select>
                        )}
                        <button className="btn-icon" style={{ borderColor: 'red' }} onClick={async () => { await axios.delete(`/api/delete-recipient/${r._id}`); fetchRecipients(); }}>Del</button>
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
                <thead><tr><th>EMAIL</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {recipients.filter(r => r.status === 'archived').map(r => (
                    <tr key={r._id}>
                      <td>{r.email}</td>
                      <td>
                        <button className="btn-icon" onClick={async () => { await axios.post(`/api/restart/${r._id}`); fetchRecipients(); }}>Restore</button>
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
          <div className="modal-content">
            <div className="modal-header"><h3>Intel: {intelLead.email}</h3><button onClick={() => setIntelLead(null)}>×</button></div>
            <div className="modal-body">
              {intelLead.data && Object.keys(intelLead.data).map(k => <div key={k}><b>{k}:</b> {intelLead.data[k]}</div>)}
              <hr />
              <h4>History</h4>
              {intelLead.history?.map((h, idx) => <div key={idx}>{new Date(h.sentAt).toLocaleString()} - {h.event}</div>)}
            </div>
          </div>
        </div>
      )}

      {/* VAR MODAL */}
      {isVarModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3>Variables</h3><button onClick={() => setIsVarModalOpen(false)}>×</button></div>
            <div className="modal-body">
              {Object.keys(modalData).map(k => (
                <div className="field" key={k}><label>{k}</label><input value={modalData[k]} onChange={e => setModalData({ ...modalData, [k]: e.target.value })} /></div>
              ))}
            </div>
            <button className="launch-btn" onClick={confirmAndSendCustom}>Send 🚀</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
