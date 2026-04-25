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

  const switchTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('activeTab', tab);
  };

  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState(localStorage.getItem('saved_subject') || 'Question about {{Website}} - Software Engineer');
  const [body1, setBody1] = useState(localStorage.getItem('saved_body1') || 'Hi {{First Name}},\n\nI was recently checking out {{Website}}.\n\nHonestly, it feels a bit outdated compared to modern standards \u2014 especially on mobile devices. The user experience could be much smoother.\n\nSince I specialize in full-stack redesigns, I\'d love to show you how I can make it look premium and improve its performance. \n\nWant to see a quick mock-up?\n\n\u2014 Muntazir\nSoftware Engineer | Website Developer');
  const [body2, setBody2] = useState(localStorage.getItem('saved_body2') || 'Hey {{First Name}}, following up on my previous note. \n\nI see a lot of potential in {{Website}} to convert more visitors if we modernize the layout. \n\nDid you have a chance to think about that quick example I mentioned?\n\n— Muntazir\nSoftware Engineer | Website Developer');
  const [body3, setBody3] = useState(localStorage.getItem('saved_body3') || 'Hi {{First Name}},\n\nI know you\'re busy, so I\'ll keep this short — last message from my side.\n\n{{Website}} has real potential, and I genuinely believe a modern redesign could bring you more leads and better conversions.\n\nIf the timing isn\'t right now, no worries at all. But if you ever decide to upgrade, I\'d love to be the one to build it for you.\n\nWishing you and {{Website}} the best!\n\n— Muntazir\nSoftware Engineer | Website Developer');
  const [emailUser, setEmailUser] = useState(localStorage.getItem('saved_user') || 'muntazir.site@gmail.com');
  const [emailPass, setEmailPass] = useState(localStorage.getItem('saved_pass') || 'bbad zuak ztni mnbr');
  const [stats, setStats] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  // FORCE SYNC ALL TEMPLATES (Override old localStorage)
  useEffect(() => {
    // Clear old cached templates to force new signature
    localStorage.removeItem('saved_body1');
    localStorage.removeItem('saved_body2');
    localStorage.removeItem('saved_body3');
    localStorage.setItem('saved_user', 'muntazir.site@gmail.com');
    localStorage.setItem('saved_pass', 'bbad zuak ztni mnbr');
    setEmailUser('muntazir.site@gmail.com');
    setEmailPass('bbad zuak ztni mnbr');
    setBody1('Hi {{First Name}},\n\nI was recently checking out {{Website}}.\n\nHonestly, it feels a bit outdated compared to modern standards — especially on mobile devices. The user experience could be much smoother.\n\nSince I specialize in full-stack redesigns, I\'d love to show you how I can make it look premium and improve its performance. \n\nWant to see a quick mock-up?\n\n— Muntazir\nSoftware Engineer | Website Developer');
    setBody2('Hey {{First Name}}, following up on my previous note. \n\nI see a lot of potential in {{Website}} to convert more visitors if we modernize the layout. \n\nDid you have a chance to think about that quick example I mentioned?\n\n— Muntazir\nSoftware Engineer | Website Developer');
    setBody3('Hi {{First Name}},\n\nI know you\'re busy, so I\'ll keep this short — last message from my side.\n\n{{Website}} has real potential, and I genuinely believe a modern redesign could bring you more leads and better conversions.\n\nIf the timing isn\'t right now, no worries at all. But if you ever decide to upgrade, I\'d love to be the one to build it for you.\n\nWishing you and {{Website}} the best!\n\n— Muntazir\nSoftware Engineer | Website Developer');
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchStats();
      fetchRecipients();
      const interval = setInterval(() => {
        fetchStats();
        fetchRecipients();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // SMART RECOVERY
  useEffect(() => {
    if (isLoggedIn && !subject && (recipients?.length || 0) > 0) {
       const first = recipients[0];
       setSubject(first.subject || "");
       setBody1(first.body1 || "");
       setBody2(first.body2 || "");
       setBody3(first.body3 || "");
       setEmailUser(first.emailUser || "");
       setEmailPass(first.emailPass || "");
    }
  }, [recipients, isLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === 'muntazir_pro') {
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
    } else alert("Invalid Passcode!");
  };

  const handleSaveTemplates = () => {
    localStorage.setItem('saved_subject', subject);
    localStorage.setItem('saved_body1', body1);
    localStorage.setItem('saved_body2', body2);
    localStorage.setItem('saved_body3', body3);
    localStorage.setItem('saved_user', emailUser);
    localStorage.setItem('saved_pass', emailPass);
    alert("Templates Saved!");
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/stats');
      setStats(res.data);
    } catch (e) {}
  };

  const fetchRecipients = async () => {
    try {
      const res = await axios.get('/api/recipients');
      setRecipients(res.data);
    } catch (e) {}
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleStartCampaign = async () => {
    if (!file || !emailUser || !emailPass) return alert("Please fill all details!");
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
      setStatus('Campaign launched!');
      fetchStats();
      switchTab('logs');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-vibe">
        <form className="login-form" onSubmit={handleLogin}>
          <div className="brand">
            <img src="/logo.png" alt="logo" style={{height: '35px', borderRadius: '8px'}} />
            PRO EMAILER
          </div>
          <h1>Admin Portal</h1>
          <input type="password" placeholder="Passcode" value={passcode} onChange={e => setPasscode(e.target.value)} />
          <button type="submit">Access System</button>
        </form>
      </div>
    );
  }

  const getStatCount = (id) => stats.find(s => s._id === id)?.count || 0;

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="brand">
          <img src="/logo.png" alt="logo" style={{height: '35px', borderRadius: '8px'}} />
          PRO EMAILER
        </div>
        <nav>
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => switchTab('dashboard')}>
            <DashIcon /> Dashboard
          </div>
          <div className={`nav-item ${activeTab === 'campaign' ? 'active' : ''}`} onClick={() => switchTab('campaign')}>
            <SendIcon /> New Campaign
          </div>
          <div className={`nav-item ${activeTab === 'template' ? 'active' : ''}`} onClick={() => switchTab('template')}>
            <TemplateIcon /> Email Templates
          </div>
          <div className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => switchTab('logs')}>
            <HistoryIcon /> Delivery Logs
          </div>
          <div className={`nav-item ${activeTab === 'archive' ? 'active' : ''}`} onClick={() => switchTab('archive')}>
            <ArchiveIcon /> Archive
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <h2>{activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'campaign' ? 'New Campaign' : activeTab === 'template' ? 'Email Templates' : activeTab === 'logs' ? 'Delivery Logs' : 'Archive'}</h2>
          <div style={{display:'flex', gap: '1rem', alignItems:'center'}}>
             <span style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>Live Connection Active ✅</span>
             <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="btn-icon btn-stop" style={{padding:'4px 10px'}}>Logout</button>
          </div>
        </header>

        <section className="content-area">
          {activeTab === 'dashboard' && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                   <span className="stat-label">Total Leads</span>
                   <span className="stat-value">{recipients.length}</span>
                </div>
                <div className="stat-card">
                   <span className="stat-label">Active</span>
                   <span className="stat-value" style={{color: 'var(--primary)'}}>{getStatCount('pending') + getStatCount('Step 1 Sent') + getStatCount('Step 2 Sent')}</span>
                </div>
                <div className="stat-card">
                   <span className="stat-label">Replied</span>
                   <span className="stat-value" style={{color: 'var(--success)'}}>{getStatCount('replied')}</span>
                </div>
                <div className="stat-card">
                   <span className="stat-label">Finished</span>
                   <span className="stat-value" style={{color: 'var(--text-muted)'}}>{getStatCount('finished')}</span>
                </div>
              </div>
              <div className="log-card">
                <div style={{padding: '1.5rem', borderBottom: '1px solid var(--border)', fontWeight: '600'}}>Recent Logs</div>
                <table className="pro-table">
                  <thead>
                    <tr>
                      <th>RECIPIENT</th>
                      <th>STATUS</th>
                      <th>LAST ACTIVITY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipients.slice(0, 5).map((r, i) => (
                      <tr key={i}>
                        <td>{r.email}</td>
                        <td><span className={`status-badge status-${r.status.replace(/ /g, '-').toLowerCase()}`}>{r.status}</span></td>
                        <td>{r.lastSentAt ? new Date(r.lastSentAt).toLocaleString() : 'Queued'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'template' && (
            <div className="campaign-grid">
               <div className="config-card full-width">
                  <h3>1. SMTP Configuration</h3>
                  <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap:'1rem'}}>
                    <div className="field">
                        <label>Gmail User</label>
                        <input type="text" value={emailUser} onChange={e => setEmailUser(e.target.value)} placeholder="yourname@gmail.com" />
                    </div>
                    <div className="field">
                        <label>App Password</label>
                        <input type="password" value={emailPass} onChange={e => setEmailPass(e.target.value)} placeholder="xxxx xxxx xxxx xxxx" />
                    </div>
                  </div>
               </div>

               <div className="config-card full-width">
                  <h3>2. Automated 3-Step Sequence</h3>
                  <div className="field">
                    <label>Main Subject Line</label>
                    <input type="text" value={subject} onChange={e => setSubject(e.target.value)} />
                  </div>
                  <div style={{display:'grid', gridTemplateColumns: '1fr 1fr 1fr', gap:'1rem'}}>
                    <div className="field">
                        <label>Step 1 (3-day follow-up)</label>
                        <textarea value={body1} onChange={e => setBody1(e.target.value)} />
                    </div>
                    <div className="field">
                        <label>Step 2 (6-day follow-up)</label>
                        <textarea value={body2} onChange={e => setBody2(e.target.value)} />
                    </div>
                    <div className="field">
                        <label>Step 3 (Final touch)</label>
                        <textarea value={body3} onChange={e => setBody3(e.target.value)} />
                    </div>
                  </div>
                  <button className="launch-btn" onClick={handleSaveTemplates}>Save Templates</button>
               </div>
            </div>
          )}

          {activeTab === 'campaign' && (
            <div className="campaign-grid">
               <div className="config-card">
                  <h3>1. Bulk Outreach (Excel)</h3>
                  <p style={{marginBottom: '1rem', color: 'var(--text-muted)'}}>Upload your Excel list to start many sequences at once.</p>
                  <div className="upload-box" onClick={() => document.getElementById('f').click()}>
                    <p>{file ? `File Attached: ${file.name}` : 'Click to Upload Excel/CSV'}</p>
                    <input id="f" type="file" hidden onChange={handleFileChange} />
                  </div>
                  <button className="launch-btn" onClick={handleStartCampaign} disabled={sending}>
                    {sending ? 'Starting...' : 'Start Bulk Sequence'}
                  </button>
               </div>

               <div className="config-card">
                  <h3>2. Quick Add Single Lead</h3>
                  <p style={{marginBottom: '1rem', color: 'var(--text-muted)'}}>Add one direct lead manually to your active sequence.</p>
                  <div className="field">
                    <label>Lead's Email</label>
                    <input type="email" id="manual_email" placeholder="client@example.com" />
                  </div>
                  <div className="field">
                    <label>First Name (Optional)</label>
                    <input type="text" id="manual_name" placeholder="John" />
                  </div>
                  <div className="field">
                    <label>Website (Optional)</label>
                    <input type="text" id="manual_website" placeholder="www.example.com" />
                  </div>
                  <p style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem'}}>
                    <b>Expert Tip:</b> Use Spintax like <code>{'{Hi|Hello|Hey}'}</code> in your templates to avoid spam.
                  </p>
                  <button 
                    className="launch-btn" 
                    style={{background: 'var(--bg-dark)'}} 
                    onClick={async (e) => {
                      const btn = e.currentTarget;
                      const em = document.getElementById('manual_email')?.value;
                      const n = document.getElementById('manual_name')?.value;
                      const w = document.getElementById('manual_website')?.value;
                      
                      if(!em) return alert("Email is required");
                      if(btn.disabled) return;

                      btn.disabled = true; 
                      btn.innerText = "Processing...";
                      
                      try {
                        await axios.post('/api/add-recipient', { email: em, subject, body1, body2, body3, emailUser, emailPass, data: { 'First Name': n, 'Website': w } });
                        alert("Lead Secured! Duplicate check passed.");
                        document.getElementById('manual_email').value = ''; 
                        document.getElementById('manual_name').value = ''; 
                        document.getElementById('manual_website').value = '';
                        fetchStats();
                        // 1.5 SECOND COOLDOWN (Super Fast)
                        setTimeout(() => { btn.disabled = false; btn.innerText = "Add to Sequence"; }, 1500);
                      } catch(err) { 
                        alert(err.response?.data?.error || "Error"); 
                        btn.disabled = false; 
                        btn.innerText = "Add to Sequence";
                      }
                  }}>
                    Add to Sequence
                  </button>
               </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="log-card">
              <table className="pro-table">
                <thead>
                  <tr>
                    <th>RECIPIENT</th>
                    <th>SEQUENCE</th>
                    <th>STATUS</th>
                    <th>LAST ACTIVITY</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.filter(r => r.status !== 'archived').map((r, i) => (
                    <tr key={i}>
                      <td style={{fontWeight:'500'}}>{r.email}</td>
                      <td>{r.step > 3 ? 'Completed' : `Step ${r.step}`}</td>
                      <td><span className={`status-badge status-${r.status.replace(/ /g, '-').toLowerCase()}`}>{r.status}</span></td>
                      <td>{r.lastSentAt ? new Date(r.lastSentAt).toLocaleString() : 'Queued'}</td>
                      <td>
                        {r.status !== 'finished' && r.status !== 'replied' && r.status !== 'stopped' && r.status !== 'sending' && (
                          <div className="action-btn-group">
                            <button className="btn-icon btn-restart" onClick={async () => { await axios.post(`/api/send-now/${r._id}`); fetchRecipients(); fetchStats(); }}>Send Next</button>
                            <button className="btn-icon btn-stop" onClick={async () => { await axios.post(`/api/stop/${r._id}`); fetchRecipients(); fetchStats(); }}>Stop</button>
                          </div>
                        )}

                        {r.status === 'stopped' && (
                          <div className="action-btn-group">
                            <button className="btn-icon btn-continue" onClick={async () => { await axios.post(`/api/continue/${r._id}`); fetchRecipients(); fetchStats(); }}>Continue</button>
                            <button className="btn-icon btn-restart" onClick={async () => { await axios.post(`/api/restart/${r._id}`); fetchRecipients(); fetchStats(); }}>Restart</button>
                            <button className="btn-icon btn-continue" style={{borderColor: 'var(--text-muted)', color: 'var(--text-muted)'}} onClick={async () => { await axios.post(`/api/archive/${r._id}`); fetchRecipients(); fetchStats(); }}>Archive Lead</button>
                          </div>
                        )}

                        <div style={{marginTop: '4px'}}>
                          {confirmDeleteId === r._id ? (
                            <button className="btn-delete" style={{background:'#ef4444', color:'white', border:'none'}} onClick={async () => { try { await axios.delete(`/api/delete-recipient/${r._id}`); fetchRecipients(); fetchStats(); setConfirmDeleteId(null); } catch(e) { alert("Failed"); } }}>CONFIRM DELETE?</button>
                          ) : (
                            <button className="btn-delete" onClick={() => setConfirmDeleteId(r._id)}>Delete Record</button>
                          )}
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
              <div style={{padding: '1.5rem', background: '#f8fafc', fontSize: '0.8rem', color: 'var(--text-muted)'}}>Records moved here are hidden from Delivery Logs but kept in database.</div>
              <table className="pro-table">
                <thead>
                  <tr>
                    <th>RECIPIENT</th>
                    <th>LAST STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.filter(r => r.status === 'archived').map((r, i) => (
                    <tr key={i}>
                      <td style={{fontWeight:'500'}}>{r.email}</td>
                      <td><span className="status-badge status-finished">Archived</span></td>
                      <td>
                        <div className="action-btn-group">
                           <button className="btn-icon btn-restart" onClick={async () => { await axios.post(`/api/restart/${r._id}`); fetchRecipients(); fetchStats(); }}>Restore & Restart</button>
                           <button className="btn-icon btn-stop" style={{borderColor: 'var(--danger)', color: 'var(--danger)'}} onClick={async () => { await axios.delete(`/api/delete-recipient/${r._id}`); fetchRecipients(); fetchStats(); }}>Delete Forever</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
