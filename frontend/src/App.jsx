import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- ICONS (SVG) ---
const DashIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const SendIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const TemplateIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const FolderIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
const HistoryIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const ArchiveIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>;
const SettingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const EditIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const SaveIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const RocketIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3"></path><path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5"></path></svg>;
const SuccessIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const ErrorIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
const InfoIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const CloseIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const MailIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const MenuIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
const LockIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const DesignIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.5 1.5"></path></svg>;
const AlertIcon = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const CheckIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;

const StatusBadge = ({ status }) => {
  const s = status.toLowerCase();
  const Icon = s.includes('step') || s === 'sent' || s === 'finished' ? SuccessIcon : s === 'replied' ? MailIcon : s === 'stopped' ? ErrorIcon : InfoIcon;
  return (
    <span className={`status-badge status-${s.replace(/ /g, '-')}`}>
      <Icon /> {status}
    </span>
  );
};

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
  const [subject, setSubject] = useState(localStorage.getItem('saved_subject') || 'Growth Opportunity for {{Business}}');
  const [body1, setBody1] = useState(localStorage.getItem('saved_body1') || 'Hi {{First Name}},\n\nI was checking out {{Business}} and noticed you don’t have a website yet.\n\nMany of your competitors already have one, which makes them look more professional and helps build trust with customers.\n\nI can create a clean, modern website for {{Business}} that helps you stand out and build that trust.\n\nWant me to show you a quick demo?\n\n— Muntazir\nSoftware Engineer | Website Developer');
  const [body2, setBody2] = useState(localStorage.getItem('saved_body2') || 'Hi {{First Name}}, following up...\n\nWhile you sleep, people are searching for your services online. Without a website, {{Business}} is invisible to them.\n\nLet\'s get you online so you stop missing out on these opportunities.\n\nReady to grow?\n\n— Muntazir\nWebsite & Software Developer');
  const [body3, setBody3] = useState(localStorage.getItem('saved_body3') || 'Hi {{First Name}},\n\nLast note from my side. I truly believe {{Business}} has massive potential, but it needs a digital home to thrive.\n\nIf you ever decide to take your business to the next level, I’m here to help.\n\nWishing you the very best!\n\n— Muntazir\nWebsite & Software Developer');
  const [emailUser, setEmailUser] = useState(localStorage.getItem('saved_user') || 'muntazir.site@gmail.com');
  const [emailPass, setEmailPass] = useState(localStorage.getItem('saved_pass') || 'bbad zuak ztni mnbr');
  const [stats, setStats] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [newTpl, setNewTpl] = useState({ name: '', subject: '', body: '' });
  const [selectedLeadForTpl, setSelectedLeadForTpl] = useState(null);
  const [isVarModalOpen, setIsVarModalOpen] = useState(false);
  const [modalLead, setModalLead] = useState(null);
  const [modalTpl, setModalTpl] = useState(null);
  const [modalData, setModalData] = useState({});
  const [intelLead, setIntelLead] = useState(null);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [notification, setNotification] = useState(null);
  const [dynamicValues, setDynamicValues] = useState({});
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', onConfirm: null });

  // HEART-TOUCHING TEMPLATES FOR NO-WEBSITE CLIENTS
  useEffect(() => {
    localStorage.removeItem('saved_body1');
    localStorage.removeItem('saved_body2');
    localStorage.removeItem('saved_body3');
    setBody1('Hi {{First Name}},\n\nI was checking out {{Business}} and noticed you don’t have a website yet.\n\nMany of your competitors already have one, which makes them look more professional and helps build trust with customers.\n\nI can create a clean, modern website for {{Business}} that helps you stand out and build that trust.\n\nWant me to show you a quick demo?\n\n— Muntazir\nSoftware Engineer | Website Developer');
    setBody2('Hi {{First Name}}, following up...\n\nWhile you sleep, people are searching for your services online. Without a website, {{Business}} is invisible to them.\n\nLet\'s get you online so you stop missing out on these opportunities.\n\nReady to grow?\n\n— Muntazir\nWebsite & Software Developer');
    setBody3('Hi {{First Name}},\n\nLast note from my side. I truly believe {{Business}} has massive potential, but it needs a digital home to thrive.\n\nIf you ever decide to take your business to the next level, I’m here to help.\n\nWishing you the very best!\n\n— Muntazir\nWebsite & Software Developer');
  }, []);

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

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchCustomFields = async () => {
    try {
      const res = await axios.get('/api/custom-fields');
      setCustomFields(res.data);
    } catch (e) { }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = (items) => {
    if (selectedIds.length === items.length) setSelectedIds([]);
    else setSelectedIds(items.map(r => r._id));
  };

  const handleBulkArchive = async () => {
    if (selectedIds.length === 0) return;
    setConfirmModal({
      open: true,
      title: `Archive ${selectedIds.length} leads?`,
      onConfirm: async () => {
        try {
          await axios.post('/api/bulk-archive', { ids: selectedIds });
          showToast(`${selectedIds.length} leads archived!`, "success");
          setSelectedIds([]);
          fetchRecipients();
        } catch (e) { showToast("Bulk archive failed", "error"); }
      }
    });
  };

  const fetchCustomTemplates = async () => {
    try {
      const res = await axios.get('/api/email-templates');
      setCustomTemplates(res.data);
    } catch (e) { }
  };

  const handleSaveCustomTemplate = async () => {
    try {
      const name = document.getElementById('tplName').value;
      const subject = document.getElementById('tplSub').value;
      const body = document.getElementById('tplBody').value;
      if (!name || !subject || !body) return showToast("Fill all fields!", "error");

      if (editingTemplateId) {
        await axios.put(`/api/email-templates/${editingTemplateId}`, { name, subject, body });
        setEditingTemplateId(null);
        showToast("Template Updated!", "success");
      } else {
        await axios.post('/api/email-templates', { name, subject, body });
        showToast("Template Created!", "success");
      }

      document.getElementById('tplName').value = '';
      document.getElementById('tplSub').value = '';
      document.getElementById('tplBody').value = '';
      fetchCustomTemplates();
    } catch (e) { showToast("Save failed", "error"); }
  };

  const handleDeleteTemplate = async (id) => {
    setConfirmModal({
      open: true,
      title: "Delete this template?",
      onConfirm: async () => {
        await axios.delete(`/api/email-templates/${id}`);
        showToast("Template Deleted!", "success");
        fetchCustomTemplates();
      }
    });
  };

  const handleSendCustomTemplate = async (leadId, templateId) => {
    const lead = recipients.find(r => r._id === leadId);
    let template = customTemplates.find(t => t._id === templateId);

    // Support for Step 1/2/3 pseudo-templates
    if (templateId === 'step1') template = { _id: 'step1', name: 'Auto Sequence: Step 1', subject: lead.subject, body: lead.body1 };
    if (templateId === 'step2') template = { _id: 'step2', name: 'Auto Sequence: Step 2', subject: lead.subject, body: lead.body2 };
    if (templateId === 'step3') template = { _id: 'step3', name: 'Auto Sequence: Step 3', subject: lead.subject, body: lead.body3 };

    if (!lead || !template) return;

    // Extract all {{vars}} or {vars} from subject and body (Clean extraction to avoid duplicates)
    const combined = (template.subject || "") + " " + (template.body || "");
    const matches = [...combined.matchAll(/\{+([^{}]+)\}+/g)];
    const vars = [...new Set(matches.map(m => m[1].trim()))];

    if (vars.length > 0) {
      const initialData = {};
      vars.forEach(v => {
        // SMART ALIASING
        let val = (lead.data && lead.data[v]) || "";
        if (!val && v === 'Business') val = lead.data?.['Business Name'] || lead.data?.['business'] || "";
        if (!val && v === 'First Name') val = lead.data?.['Name'] || lead.data?.['first_name'] || "";
        initialData[v] = val;
      });
      setModalData(initialData);
      setModalLead(lead);
      setModalTpl(template);
      setIsVarModalOpen(true);
      setSelectedLeadForTpl(null);
    } else {
      setConfirmModal({
        open: true,
        title: `Send "${template.name}" to ${lead.email}?`,
        onConfirm: async () => {
          try {
            const res = await axios.post(`/api/send-custom/${leadId}/${templateId}`);
            showToast(res.data.message, "success");
            setSelectedLeadForTpl(null);
            fetchRecipients();
          } catch (e) { showToast(e.response?.data?.error || "Error", "error"); }
        }
      });
    }
  };

  const confirmAndSendCustom = async () => {
    try {
      // If it's a step pseudo-template, we might need a special route or just handle it as custom
      // For simplicity, handle it via send-custom if templateId is an actual ID, else we need logic.
      // But we can just use the existing send-custom for everything if we pass the body/subject.

      // Let's assume server.js send-custom can take custom subject/body if needed, 
      // but for now we'll use the existing template-based one.
      // For steps, we'll create a temporary template or a specialized route.

      const res = await axios.post(`/api/send-custom/${modalLead._id}/${modalTpl._id}`, { customData: modalData });
      showToast(res.data.message, "success");
      setIsVarModalOpen(false);
      fetchRecipients();
    } catch (e) { showToast(e.response?.data?.error || "Error", "error"); }
  };

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
      showToast("Welcome Back, Admin!", "success");
    } else showToast("Invalid Passcode!", "error");
  };

  const handleSaveTemplates = () => {
    localStorage.setItem('saved_subject', subject);
    localStorage.setItem('saved_body1', body1);
    localStorage.setItem('saved_body2', body2);
    localStorage.setItem('saved_body3', body3);
    localStorage.setItem('saved_user', emailUser);
    localStorage.setItem('saved_pass', emailPass);
    showToast("Templates Saved!", "success");
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleStartCampaign = async () => {
    if (!file || !emailUser || !emailPass) return showToast("Please fill all details!", "error");
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
      showToast("Campaign Started!", "success");
      fetchStats();
      switchTab('logs');
    } catch (err) {
      showToast('Error: ' + err.message, "error");
    } finally {
      setSending(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-vibe">
        <form className="login-form" onSubmit={handleLogin}>
          <div className="brand">
            <img src="/logo.png" alt="logo" style={{ height: '35px', borderRadius: '8px' }} />
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
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="brand">
          <img src="/logo.png" alt="logo" style={{ height: '35px', borderRadius: '8px' }} />
          PRO EMAILER
        </div>
        <nav>
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { switchTab('dashboard'); setIsMobileMenuOpen(false); }}>
            <DashIcon /> Dashboard
          </div>
          <div className={`nav-item ${activeTab === 'campaign' ? 'active' : ''}`} onClick={() => { switchTab('campaign'); setIsMobileMenuOpen(false); }}>
            <SendIcon /> New Campaign
          </div>
          <div className={`nav-item ${activeTab === 'template' ? 'active' : ''}`} onClick={() => { switchTab('template'); setIsMobileMenuOpen(false); }}>
            <TemplateIcon /> Email Templates
          </div>
          <div className={`nav-item ${activeTab === 'custom_templates' ? 'active' : ''}`} onClick={() => { switchTab('custom_templates'); setIsMobileMenuOpen(false); }}>
            <FolderIcon /> Custom Templates
          </div>
          <div className={`nav-item ${activeTab === 'variables' ? 'active' : ''}`} onClick={() => { switchTab('variables'); setIsMobileMenuOpen(false); }}>
            <SettingsIcon /> Variable Manager
          </div>
          <div className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => { switchTab('logs'); setIsMobileMenuOpen(false); }}>
            <HistoryIcon /> Delivery Logs
          </div>
          <div className={`nav-item ${activeTab === 'archive' ? 'active' : ''}`} onClick={() => { switchTab('archive'); setIsMobileMenuOpen(false); }}>
            <ArchiveIcon /> Archive
          </div>
        </nav>
      </aside>

      {isMobileMenuOpen && <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}

      <main className="main-content">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(true)}><MenuIcon /></button>
            <h2>{activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'campaign' ? 'New Campaign' : activeTab === 'template' ? 'Email Templates' : activeTab === 'custom_templates' ? 'Custom Templates' : activeTab === 'variables' ? 'Variable Manager' : activeTab === 'logs' ? 'Delivery Logs' : 'Archive'}</h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><SuccessIcon /> System Live</span>
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="btn-icon btn-stop" style={{ padding: '4px 10px' }}>Logout</button>
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
                  <span className="stat-value" style={{ color: 'var(--primary)' }}>{getStatCount('pending') + getStatCount('Step 1 Sent') + getStatCount('Step 2 Sent')}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Replied</span>
                  <span className="stat-value" style={{ color: 'var(--success)' }}>{getStatCount('replied')}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Finished</span>
                  <span className="stat-value" style={{ color: 'var(--text-muted)' }}>{getStatCount('finished')}</span>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
                  <span className="stat-label" style={{ color: '#ef4444' }}>Stopped</span>
                  <span className="stat-value" style={{ color: '#ef4444' }}>{getStatCount('stopped')}</span>
                </div>
              </div>

              <div className="log-card" style={{ marginTop: '2rem' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <HistoryIcon /> Recent Activity
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="pro-table">
                    <thead>
                      <tr>
                        <th>RECIPIENT</th>
                        <th>CURRENT STEP</th>
                        <th>STATUS</th>
                        <th>LAST ACTIVITY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipients.slice(0, 10).map((r, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: '500' }}>{r.email}</td>
                          <td>{r.step > 3 ? 'Completed' : `Step ${r.step}`}</td>
                          <td><span className={`status-badge status-${r.status.replace(/ /g, '-').toLowerCase()}`}>{r.status}</span></td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.lastSentAt ? new Date(r.lastSentAt).toLocaleString() : 'Queued'}</td>
                        </tr>
                      ))}
                      {recipients.length === 0 && (
                        <tr>
                          <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No recent activity found. Launch a campaign to see results!</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'template' && (
            <div className="campaign-grid">
              <div className="config-card full-width">
                <h3>1. SMTP Configuration</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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

          {activeTab === 'custom_templates' && (
            <div className="campaign-grid">
              <div className="config-card">
                <h3>{editingTemplateId ? <><EditIcon /> Edit Your Template</> : <><DesignIcon /> 1. Design New Template</>}</h3>
                <div className="field">
                  <label>Template Name (Internal Reference)</label>
                  <input id="tplName" placeholder="e.g. AC Repair Cold Pitch" />
                </div>
                <div className="field">
                  <label>Email Subject</label>
                  <input id="tplSub" placeholder="e.g. Improving {{Business}} Online" />
                </div>
                <div className="field">
                  <label>Professional Body Content</label>
                  <textarea id="tplBody" placeholder="Hi {{First Name}}, I saw {{Business}}..."></textarea>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="launch-btn" onClick={handleSaveCustomTemplate} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    {editingTemplateId ? <><SaveIcon /> Update Changes</> : <><RocketIcon /> Save New Template</>}
                  </button>
                  {editingTemplateId && (
                    <button className="launch-btn" style={{ background: 'var(--text-muted)' }} onClick={() => {
                      setEditingTemplateId(null);
                      document.getElementById('tplName').value = '';
                      document.getElementById('tplSub').value = '';
                      document.getElementById('tplBody').value = '';
                    }}>Cancel Edit</button>
                  )}
                </div>
              </div>

              <div className="log-card full-width" style={{ marginTop: '2rem' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: '600' }}>Saved Custom Templates</div>
                <div className="template-list" style={{ padding: '1rem' }}>
                  {customTemplates.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No custom templates yet.</p> : (
                    customTemplates.map(t => (
                      <div key={t._id} className="stat-card" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                        <div>
                          <div style={{ fontWeight: '600' }}>{t.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.subject}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button className="btn-icon btn-restart" onClick={() => {
                            setEditingTemplateId(t._id);
                            document.getElementById('tplName').value = t.name;
                            document.getElementById('tplSub').value = t.subject;
                            document.getElementById('tplBody').value = t.body;
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}>Edit</button>
                          <button className="btn-icon btn-stop" onClick={() => {
                            setConfirmModal({
                              open: true,
                              title: `Delete template "${t.name}"?`,
                              onConfirm: async () => {
                                await axios.delete(`/api/email-templates/${t._id}`);
                                showToast("Template Deleted!", "success");
                                fetchCustomTemplates();
                              }
                            });
                          }}>Delete</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'campaign' && (
            <div className="campaign-grid">
              <div className="config-card">
                <h3>1. Bulk Outreach (Excel)</h3>
                <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Upload your Excel list to start many sequences at once.</p>
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
                <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Add one direct lead manually to your active sequence.</p>

                <div className="field">
                  <label>Lead's Email</label>
                  <input type="email" id="manual_email" placeholder="client@example.com" />
                </div>

                {customFields.filter(f => f.active).map(f => (
                  <div className="field" key={f._id}>
                    <label>{f.name}</label>
                    <input
                      type="text"
                      placeholder={`Enter ${f.name}...`}
                      onChange={(e) => setDynamicValues(prev => ({ ...prev, [f.name]: e.target.value }))}
                    />
                  </div>
                ))}

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  <b>Expert Tip:</b> Use Spintax like <code>{'{Hi|Hello|Hey}'}</code> in your templates to avoid spam.
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="launch-btn"
                    style={{ background: 'var(--bg-dark)' }}
                    onClick={async (e) => {
                      const btn = e.currentTarget;
                      const em = document.getElementById('manual_email')?.value;
                      if (!em) return showToast("Email is required", "error");
                      if (btn.disabled) return;
                      btn.disabled = true; btn.innerText = "...";
                      try {
                        await axios.post('/api/add-recipient', {
                          email: em, subject, body1, body2, body3, emailUser, emailPass,
                          data: dynamicValues
                        });
                        showToast("Lead Added & Dispatched!", "success");
                        if (document.getElementById('manual_email')) document.getElementById('manual_email').value = '';
                        setDynamicValues({});
                        fetchStats(); fetchRecipients();
                        switchTab('logs');
                        setTimeout(() => { btn.disabled = false; btn.innerText = "Add to Sequence"; }, 1500);
                      } catch (err) { showToast(err.response?.data?.error || "Error", "error"); btn.disabled = false; btn.innerText = "Add to Sequence"; }
                    }}>
                    Add to Sequence
                  </button>
                  <button
                    className="launch-btn"
                    style={{ background: 'var(--text-muted)' }}
                    onClick={async (e) => {
                      const btn = e.currentTarget;
                      const em = document.getElementById('manual_email')?.value;
                      if (!em) return showToast("Email is required", "error");
                      if (btn.disabled) return;
                      btn.disabled = true; btn.innerText = "...";
                      try {
                        await axios.post('/api/add-recipient', {
                          email: em, subject, body1, body2, body3, emailUser, emailPass,
                          data: dynamicValues,
                          status: 'archived'
                        });
                        showToast("Lead Archived!", "success");
                        if (document.getElementById('manual_email')) document.getElementById('manual_email').value = '';
                        setDynamicValues({});
                        fetchStats(); fetchRecipients();
                        switchTab('archive');
                        setTimeout(() => { btn.disabled = false; btn.innerText = "Add to Archive"; }, 1500);
                      } catch (err) { showToast(err.response?.data?.error || "Error", "error"); btn.disabled = false; btn.innerText = "Add to Archive"; }
                    }}>
                    Add to Archive
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="log-card">
              {selectedIds.length > 0 && (
                <div className="bulk-bar">
                  <div className="bulk-info"><InfoIcon /> {selectedIds.length} leads selected</div>
                  <div className="bulk-actions">
                    <select
                      className="pro-select"
                      style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                      onChange={async (e) => {
                        if (!e.target.value) return;
                        const tplId = e.target.value;
                        setConfirmModal({
                          open: true,
                          title: `Send this template to ${selectedIds.length} leads?`,
                          onConfirm: async () => {
                            try {
                              await axios.post('/api/bulk-send', { ids: selectedIds, templateId: tplId });
                              showToast("Bulk send finished!", "success");
                              setSelectedIds([]);
                              fetchRecipients();
                            } catch (e) { showToast("Bulk send failed", "error"); }
                          }
                        });
                        e.target.value = "";
                      }}
                    >
                      <option value="" style={{ color: 'var(--bg-dark)' }}>Bulk Send Template...</option>
                      <optgroup label="Auto Sequence" style={{ color: 'var(--bg-dark)' }}>
                        <option value="step1">Step 1 (Intro)</option>
                        <option value="step2">Step 2 (Follow-up)</option>
                        <option value="step3">Step 3 (Final)</option>
                      </optgroup>
                      <optgroup label="Custom Templates" style={{ color: 'var(--bg-dark)' }}>
                        {customTemplates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                      </optgroup>
                    </select>
                    <button className="bulk-btn" onClick={handleBulkArchive}><ArchiveIcon /> Bulk Archive</button>
                    <button className="bulk-btn" style={{ backgroundColor: 'var(--danger)' }} onClick={() => setSelectedIds([])}>Cancel</button>
                  </div>
                </div>
              )}
              <table className="pro-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input type="checkbox" checked={selectedIds.length > 0 && selectedIds.length === recipients.filter(r => !r.isArchived).length} onChange={() => toggleSelectAll(recipients.filter(r => !r.isArchived))} />
                    </th>
                    <th>RECIPIENT</th>
                    <th>SEQUENCE</th>
                    <th>STATUS</th>
                    <th>LAST ACTIVITY</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients
                    .filter(r => !r.isArchived)
                    .sort((a, b) => {
                      const priority = (s) => {
                        if (s.includes('Step')) return 1;
                        if (s === 'pending') return 2;
                        if (s === 'replied') return 3;
                        if (s === 'finished') return 4;
                        if (s === 'stopped') return 5;
                        return 6;
                      };
                      return priority(a.status) - priority(b.status);
                    })
                    .map((r, i) => (
                      <tr key={i} className={selectedIds.includes(r._id) ? 'row-selected' : ''}>
                        <td>
                          <input type="checkbox" checked={selectedIds.includes(r._id)} onChange={() => toggleSelectOne(r._id)} />
                        </td>
                        <td style={{ fontWeight: '500', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setIntelLead(r)}>
                          {r.email}
                        </td>
                        <td>{r.step > 3 ? 'Completed' : `Step ${r.step}`}</td>
                        <td><StatusBadge status={r.status} /></td>
                        <td>{r.lastSentAt ? new Date(r.lastSentAt).toLocaleString() : 'Queued'}</td>
                        <td>
                          <div className="action-btn-group">
                            {r.status !== 'finished' && r.status !== 'replied' && r.status !== 'stopped' && r.status !== 'sending' && (
                              <>
                                <button className="btn-icon btn-restart" onClick={async () => { await axios.post(`/api/send-now/${r._id}`); fetchRecipients(); fetchStats(); }}>Send Next</button>
                                <button className="btn-icon btn-stop" onClick={async () => { await axios.post(`/api/stop/${r._id}`); fetchRecipients(); fetchStats(); }}>Stop</button>
                              </>
                            )}

                            {r.status === 'stopped' && (
                              <>
                                <button className="btn-icon btn-continue" onClick={async () => { await axios.post(`/api/continue/${r._id}`); fetchRecipients(); fetchStats(); }}>Continue</button>
                                <button className="btn-icon btn-restart" onClick={async () => { await axios.post(`/api/restart/${r._id}`); fetchRecipients(); fetchStats(); }}>Restart</button>
                                <button className="btn-icon btn-continue" style={{ borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }} onClick={async () => { await axios.post(`/api/archive/${r._id}`); fetchRecipients(); fetchStats(); }}>Archive</button>
                              </>
                            )}

                            {selectedLeadForTpl === r._id ? (
                              <select
                                className="pro-select"
                                style={{ appearance: 'none', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px 25px 4px 10px', fontSize: '0.8rem' }}
                                onChange={(e) => {
                                  if (e.target.value) handleSendCustomTemplate(r._id, e.target.value);
                                  setSelectedLeadForTpl(null);
                                }}
                              >
                                <option value="">Pick Template...</option>
                                <optgroup label="Auto Sequence">
                                  <option value="step1">Sequence: Step 1 (Intro)</option>
                                  <option value="step2">Sequence: Step 2 (Follow-up)</option>
                                  <option value="step3">Sequence: Step 3 (Final)</option>
                                </optgroup>
                                <optgroup label="Custom Templates">
                                  {customTemplates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </optgroup>
                                <option value="">Cancel</option>
                              </select>
                            ) : (
                              <button className="btn-icon btn-continue" onClick={() => setSelectedLeadForTpl(r._id)}>Send Custom</button>
                            )}

                            <button className="btn-icon" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => {
                              setConfirmModal({
                                open: true,
                                title: `Delete ${r.email} forever?`,
                                onConfirm: async () => {
                                  await axios.delete(`/api/delete-recipient/${r._id}`);
                                  showToast("Lead Deleted!", "success");
                                  fetchRecipients(); fetchStats();
                                }
                              });
                            }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'variables' && (
            <div className="campaign-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="config-card">
                <h3>Variable Manager</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Add or toggle custom fields for your outreach forms.</p>

                <div className="var-input-group">
                  <input
                    placeholder="New variable (e.g. City)"
                    value={newFieldName}
                    onChange={e => setNewFieldName(e.target.value)}
                  />
                  <button className="var-add-btn" onClick={async () => {
                    if (!newFieldName) return;
                    await axios.post('/api/custom-fields', { name: newFieldName });
                    setNewFieldName('');
                    fetchCustomFields();
                    showToast("Field Added!", "success");
                  }}>Add Field</button>
                </div>

                <div className="variable-list">
                  {customFields.map(f => (
                    <div key={f._id} className="variable-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <input
                          type="checkbox"
                          className="pro-checkbox"
                          checked={f.active}
                          onChange={async () => { await axios.put(`/api/custom-fields/${f._id}`, { active: !f.active }); fetchCustomFields(); showToast("Field Updated!", "success"); }}
                        />
                        <span style={{ fontWeight: '500', color: f.active ? 'var(--text)' : 'var(--text-muted)' }}>{f.name}</span>
                      </div>
                      <button className="btn-icon btn-stop" style={{ padding: '4px 8px' }} onClick={() => {
                        setConfirmModal({
                          open: true,
                          title: `Delete variable "${f.name}"?`,
                          onConfirm: async () => {
                            await axios.delete(`/api/custom-fields/${f._id}`);
                            fetchCustomFields();
                            showToast("Field Deleted!", "success");
                          }
                        });
                      }}>Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'archive' && (
            <div className="log-card">
              <div style={{ padding: '1.5rem', background: '#f8fafc', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Records moved here are hidden from Delivery Logs but kept in database.</div>
              <table className="pro-table">
                <thead>
                  <tr>
                    <th>RECIPIENT</th>
                    <th>LAST STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients
                    .filter(r => r.isArchived)
                    .sort((a, b) => {
                      const priority = (s) => {
                        if (s.includes('Step')) return 1;
                        if (s === 'pending') return 2;
                        if (s === 'finished') return 3;
                        if (s === 'stopped') return 4;
                        return 5;
                      };
                      return priority(a.status) - priority(b.status);
                    })
                    .map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '500', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setIntelLead(r)}>
                          {r.email}
                        </td>
                        <td><StatusBadge status={r.status} /></td>
                        <td>
                          <div className="action-btn-group">
                            <button className="btn-icon btn-restart" onClick={async () => { await axios.post(`/api/restart/${r._id}`); fetchRecipients(); fetchStats(); }}>Restore & Restart</button>

                            {selectedLeadForTpl === r._id ? (
                              <select
                                className="pro-select"
                                style={{ appearance: 'none', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px 25px 4px 10px', fontSize: '0.8rem' }}
                                onChange={(e) => {
                                  if (e.target.value) handleSendCustomTemplate(r._id, e.target.value);
                                  setSelectedLeadForTpl(null);
                                }}
                              >
                                <option value="">Pick Template...</option>
                                <optgroup label="Auto Sequence">
                                  <option value="step1">Sequence: Step 1 (Intro)</option>
                                  <option value="step2">Sequence: Step 2 (Follow-up)</option>
                                  <option value="step3">Sequence: Step 3 (Final)</option>
                                </optgroup>
                                <optgroup label="Custom Templates">
                                  {customTemplates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </optgroup>
                                <option value="">Cancel</option>
                              </select>
                            ) : (
                              <button className="btn-icon btn-continue" onClick={() => setSelectedLeadForTpl(r._id)}>Send Custom</button>
                            )}

                            <button className="btn-icon" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => {
                              setConfirmModal({
                                open: true,
                                title: `Delete ${r.email} forever?`,
                                onConfirm: async () => {
                                  await axios.delete(`/api/delete-recipient/${r._id}`);
                                  showToast("Lead Deleted!", "success");
                                  fetchRecipients(); fetchStats();
                                }
                              });
                            }}>Delete</button>
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

      {intelLead && (
        <div className="modal-overlay">
          <div className="modal-content intel-modal">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="intel-avatar">{intelLead.email[0].toUpperCase()}</div>
                <div>
                  <h3 style={{ margin: 0 }}>{intelLead.email}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Intelligence View Enabled</span>
                </div>
              </div>
              <button className="btn-close" onClick={() => setIntelLead(null)}><CloseIcon /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--bg-dark)' }}>Profile Information</h4>
                  <div className="intel-info-box">
                    <div className="intel-field"><strong>Campaign:</strong> {intelLead.campaignId}</div>
                    <div className="intel-field"><strong>Status:</strong> {intelLead.status}</div>
                    <div className="intel-field"><strong>Current Step:</strong> {intelLead.step}</div>
                    <hr style={{ margin: '1rem 0', borderColor: '#f1f5f9' }} />
                    <p style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>CUSTOM DATA</p>
                    {intelLead.data ? Object.keys(intelLead.data).map(k => (
                      <div key={k} className="intel-field"><strong>{k}:</strong> {intelLead.data[k]}</div>
                    )) : <p>No data</p>}
                  </div>
                </div>
                <div>
                  <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--bg-dark)' }}>Communication Timeline</h4>
                  <div className="timeline">
                    {intelLead.history && intelLead.history.length > 0 ? intelLead.history.slice().reverse().map((h, idx) => (
                      <div key={idx} className="timeline-item">
                        <div className="timeline-date">{new Date(h.sentAt).toLocaleString()}</div>
                        <div className="timeline-event">{h.event}</div>
                        <div className="timeline-subject">{h.subject}</div>
                      </div>
                    )) : <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No communication logs yet.</p>}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ marginTop: '2rem' }}>
              <button className="launch-btn" onClick={() => setIntelLead(null)}>Close Intelligence View</button>
            </div>
          </div>
        </div>
      )}

      {confirmModal.open && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="log-card" style={{ maxWidth: '400px', width: '100%', padding: '2rem', textAlign: 'center', animation: 'slideIn 0.3s ease-out' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}><AlertIcon /></div>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{confirmModal.title}</h3>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="launch-btn" style={{ padding: '10px 25px' }} onClick={() => { confirmModal.onConfirm(); setConfirmModal({ open: false }); }}>Yes, Proceed</button>
              <button className="bulk-btn" style={{ backgroundColor: 'var(--danger)', padding: '10px 25px', color: 'white' }} onClick={() => setConfirmModal({ open: false })}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isVarModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Fill Template Variables</h3>
              <button className="btn-close" onClick={() => setIsVarModalOpen(false)}><CloseIcon /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Template: <b>{modalTpl?.name}</b> <br />
                Sending to: <b>{modalLead?.email}</b>
              </p>
              {Object.keys(modalData).map(key => (
                <div className="field" key={key}>
                  <label>Value for <code>{`{{${key}}}`}</code></label>
                  <input
                    type="text"
                    value={modalData[key]}
                    onChange={e => setModalData({ ...modalData, [key]: e.target.value })}
                    placeholder={`Enter ${key}...`}
                  />
                </div>
              ))}
            </div>
            <div className="modal-footer" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button className="launch-btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} onClick={confirmAndSendCustom}>Confirm & Send Email <RocketIcon /></button>
              <button className="launch-btn" style={{ flex: 1, backgroundColor: 'var(--bg-dark)' }} onClick={() => setIsVarModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {notification && (
        <div className={`toast toast-${notification.type}`}>
          {notification.type === 'success' ? <SuccessIcon /> : <ErrorIcon />}
          {notification.msg}
        </div>
      )}
    </div>
  );
}

export default App;
