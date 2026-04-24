import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './index.css';

// Professional Dashboard Icons
const DashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
);
const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
);
const HistoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
);
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const TemplateIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [activeTab, setActiveTab] = useState('campaign'); 

  const [file, setFile] = useState(null);
  const [totalContacts, setTotalContacts] = useState(0);
  
  // 3-Step Templates (Human Style)
  const [subject, setSubject] = useState(localStorage.getItem('saved_subject') || 'about your website');
  const [body1, setBody1] = useState(localStorage.getItem('saved_body1') || 'Hi {{First Name}},\n\nI checked {{Website}}’s website.\n\nHonestly, it feels a bit outdated compared to what people expect now — especially on mobile.\n\nThe layout and overall experience could be much cleaner and more modern.\n\nIf you want, I can redesign it into something that actually looks current and feels smooth to use.\n\nWant me to show you a quick example?\n\n— Muntazir');
  const [body2, setBody2] = useState(localStorage.getItem('saved_body2') || 'Hi {{First Name}},\n\nJust wanted to make sure my previous email didn’t get buried in your inbox.\n\nI took another look at {{Website}} and I really think a quick refresh would make a huge difference in how clients see you.\n\nAre you around for a quick 2-minute chat this week?\n\n— Muntazir');
  const [body3, setBody3] = useState(localStorage.getItem('saved_body3') || 'Hi {{First Name}},\n\nI won’t keep bugging you after this, but I truly believe that updating {{Website}} is one of the best moves you could make for your business right now.\n\nIf you change your mind later, just shoot me a message. I’ll be around.\n\n— Muntazir');

  const [emailUser, setEmailUser] = useState('muntazirgabharani126@gmail.com');
  const [emailPass, setEmailPass] = useState('avyq vxyd wdto nvgx');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');
  const [stats, setStats] = useState([]);
  const [recipients, setRecipients] = useState([]);

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

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === 'muntazir_pro') setIsLoggedIn(true);
    else alert("Invalid Passcode!");
  };

  const handleSaveTemplates = () => {
    localStorage.setItem('saved_subject', subject);
    localStorage.setItem('saved_body1', body1);
    localStorage.setItem('saved_body2', body2);
    localStorage.setItem('saved_body3', body3);
    alert("Templates Saved! New campaigns will use these humanized messages.");
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
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      setTotalContacts(json.length);
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleStartCampaign = async () => {
    if (!file || !subject || !emailUser || !emailPass) return alert("Missing details");
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
      setActiveTab('logs');
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
          <h1>Admin Portal</h1>
          <input type="password" placeholder="Passcode" value={passcode} onChange={e => setPasscode(e.target.value)} />
          <button type="submit">Access System</button>
        </form>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">PRO EMAILER</div>
        <nav>
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <DashIcon /> Dashboard
          </div>
          <div className={`nav-item ${activeTab === 'campaign' ? 'active' : ''}`} onClick={() => setActiveTab('campaign')}>
            <SendIcon /> New Campaign
          </div>
          <div className={`nav-item ${activeTab === 'template' ? 'active' : ''}`} onClick={() => setActiveTab('template')}>
            <TemplateIcon /> Email Templates
          </div>
          <div className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
            <HistoryIcon /> Delivery Logs
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="top-bar">
          <h2>{activeTab.toUpperCase()}</h2>
        </header>

        <section className="content-area">
          {activeTab === 'template' && (
            <div className="campaign-grid">
               <div className="config-card full-width">
                  <h3>Outreach Email Templates</h3>
                  <div className="field">
                    <label>Subject Line</label>
                    <input type="text" value={subject} onChange={e => setSubject(e.target.value)} />
                  </div>
               </div>
               
               <div className="config-card">
                  <h3>Email 1 (Initial Outreach)</h3>
                  <textarea rows="8" value={body1} onChange={e => setBody1(e.target.value)}></textarea>
               </div>

               <div className="config-card">
                  <h3>Email 2 (Direct Follow-up)</h3>
                  <textarea rows="8" value={body2} onChange={e => setBody2(e.target.value)}></textarea>
               </div>

               <div className="config-card full-width">
                  <h3>Email 3 (Last Pitch)</h3>
                  <textarea rows="8" value={body3} onChange={e => setBody3(e.target.value)}></textarea>
                  <button className="launch-btn" style={{marginTop: '1.5rem'}} onClick={handleSaveTemplates}>Save All Sequence Steps</button>
               </div>
            </div>
          )}

          {activeTab === 'campaign' && (
            <div className="campaign-grid">
               <div className="config-card">
                  <h3>1. Bulk Outreach (Excel)</h3>
                  <p style={{marginBottom: '1rem', color: '#64748b'}}>Upload Excel/CSV to start many sequences at once.</p>
                  <div className="upload-box" onClick={() => document.getElementById('f').click()}>
                    <p>{file ? `Ready: ${file.name} (${totalContacts})` : 'Click to Upload Excel/CSV'}</p>
                    <input id="f" type="file" hidden onChange={handleFileChange} />
                  </div>
                  <button className="launch-btn" onClick={handleStartCampaign} disabled={sending}>
                    {sending ? 'Deploying...' : 'Start Bulk Sequence'}
                  </button>
               </div>

               <div className="config-card">
                  <h3>2. Quick Add Single Lead</h3>
                  <p style={{marginBottom: '1rem', color: '#64748b'}}>Add one direct lead manually to your active sequence.</p>
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
                    <input type="text" id="manual_website" placeholder="www.google.com" />
                  </div>
                  <button className="launch-btn" style={{background: '#64748b'}} onClick={async () => {
                    const e = document.getElementById('manual_email').value;
                    const n = document.getElementById('manual_name').value;
                    const w = document.getElementById('manual_website').value;
                    if(!e) return alert("Email is required");
                    try {
                      await axios.post('/api/add-recipient', {
                        email: e, subject, body1, body2, body3, emailUser, emailPass,
                        data: { 'First Name': n, 'Website': w }
                      });
                      alert("Lead added to sequence!");
                      document.getElementById('manual_email').value = '';
                      document.getElementById('manual_name').value = '';
                      document.getElementById('manual_website').value = '';
                      fetchStats();
                    } catch(err) { alert("Failed to add lead"); }
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
                  <tr><th>Recipient</th><th>Sequence</th><th>Status</th><th>Last Activity</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {recipients.map((r, i) => (
                    <tr key={i}>
                      <td>{r.email}</td>
                      <td>{r.step > 3 ? 'Completed' : `Step ${r.step}`}</td>
                      <td><span className={`status-${r.status.replace(/ /g, '-').toLowerCase()}`}>{r.status}</span></td>
                      <td>{r.lastSentAt ? new Date(r.lastSentAt).toLocaleString() : 'Queued'}</td>
                      <td>
                        {r.status !== 'finished' && r.status !== 'replied' && r.status !== 'stopped' && (
                          <div style={{display: 'flex', gap: '8px'}}>
                            <button 
                              className="send-now-btn" 
                              onClick={async () => {
                                try {
                                  await axios.post(`/api/send-now/${r._id}`);
                                  fetchRecipients();
                                  fetchStats();
                                  alert("Sent!");
                                } catch(e) { alert("Failed"); }
                              }}
                            >
                              Send Next
                            </button>
                            <button 
                              className="stop-btn" 
                              onClick={async () => {
                                try {
                                  await axios.post(`/api/stop/${r._id}`);
                                  fetchRecipients();
                                  fetchStats();
                                  alert("Stopped!");
                                } catch(e) { alert("Failed"); }
                              }}
                            >
                              Stop
                            </button>
                          </div>
                        )}

                        {r.status === 'stopped' && (
                          <div style={{display: 'flex', gap: '8px'}}>
                            <button 
                              className="send-now-btn" 
                              style={{borderColor: '#10b981', color: '#10b981'}}
                              onClick={async () => {
                                try {
                                  await axios.post(`/api/continue/${r._id}`);
                                  fetchRecipients();
                                  fetchStats();
                                  alert("Resumed!");
                                } catch(e) { alert("Failed"); }
                              }}
                            >
                              Continue
                            </button>
                            <button 
                              className="send-now-btn" 
                              onClick={async () => {
                                try {
                                  await axios.post(`/api/restart/${r._id}`);
                                  fetchRecipients();
                                  fetchStats();
                                  alert("Restarted from Step 1!");
                                } catch(e) { alert("Failed"); }
                              }}
                            >
                              Restart
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="stats-grid">
              {stats.map(s => (
                <div key={s._id} className="big-stat-card">
                  <span className="label text-muted">{s._id.toUpperCase()}</span>
                  <span className="value">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
