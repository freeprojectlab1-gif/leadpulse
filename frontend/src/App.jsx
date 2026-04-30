import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Lock,
  Search,
  Info,
  CheckCircle,
  AlertTriangle,
  Users,
  LayoutDashboard,
  Send,
  FileText,
  Folder,
  History,
  Archive,
  Settings,
  HelpCircle,
  Edit,
  Save,
  Rocket,
  X,
  Mail,
  Menu,
  Square,
  MessageSquare,
  ChevronDown,
  Calendar,
  Reply,
  Loader2,
  Phone,
  Flame,
  Globe,
  Eye,
  EyeOff,
  Briefcase,
  User,
  Building2,
  Clock,
  Target,
  ShieldCheck,
  Check,
  CheckCheck
} from 'lucide-react';

// --- ICONS (SVG) ---
const DashIcon = () => <LayoutDashboard size={20} />;
const SendIcon = () => <Send size={20} />;
const TemplateIcon = () => <FileText size={20} />;
const FolderIcon = () => <Folder size={20} />;
const HistoryIcon = () => <History size={20} />;
const ArchiveIcon = () => <Archive size={20} />;
const SettingsIcon = () => <Settings size={20} />;
const EditIcon = () => <Edit size={18} />;
const SaveIcon = () => <Save size={18} />;
const RocketIcon = () => <Rocket size={18} />;
const SuccessIcon = () => <CheckCircle size={20} />;
const ErrorIcon = () => <X size={20} />;
const InfoIcon = () => <History size={18} />;
const CloseIcon = () => <X size={20} />;
const MailIcon = () => <Mail size={18} />;
const MenuIcon = () => <Menu size={20} />;
const LockIcon = () => <Lock size={18} />;
const DesignIcon = () => <Rocket size={18} />;
const AlertIcon = () => <AlertTriangle size={48} color="#eab308" />;
const CheckIcon = () => <CheckCircle size={18} />;
const SearchIcon = () => <Search size={18} />;
const TargetIcon = () => <Target size={18} />;
const UsersIcon = () => <Users size={18} />;
const BusinessIcon = ({ size = 20, ...props }) => <Building2 size={size} {...props} />;
const ContactIcon = ({ size = 20, ...props }) => <User size={size} {...props} />;
const LocationIcon = ({ size = 20, ...props }) => <MapPin size={size} {...props} />;

const StatusBadge = ({ status }) => {
  const s = status.toLowerCase();
  const Icon = s.includes('step') || s === 'sent' || s === 'finished' ? SuccessIcon : s === 'replied' ? MailIcon : s === 'stopped' ? ErrorIcon : InfoIcon;
  return (
    <span className={`status-badge status-${s.replace(/ /g, '-')}`}>
      <Icon /> {status}
    </span>
  );
};

// ==================== WhatsApp Inbox Tab ====================
const WhatsAppInboxTab = ({ waStatus }) => {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [msgInput, setMsgInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const chatEndRef = React.useRef(null);

  // Broadcast mode
  const [broadcastMode, setBroadcastMode] = useState(false);
  const [selectedPhones, setSelectedPhones] = useState([]);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastDelay, setBroadcastDelay] = useState(3);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  const fetchConversations = async () => {
    try {
      const res = await axios.get('/api/recipients?limit=200');
      const all = (res.data.recipients || res.data || []);
      const waLeads = all.filter(r => r.replies && r.replies.some(x => x.type === 'whatsapp'));
      waLeads.sort((a, b) => {
        const aLast = Math.max(...a.replies.filter(x => x.type === 'whatsapp').map(x => new Date(x.receivedAt)));
        const bLast = Math.max(...b.replies.filter(x => x.type === 'whatsapp').map(x => new Date(x.receivedAt)));
        return bLast - aLast;
      });
      setConversations(waLeads);
      if (selected) {
        const updated = waLeads.find(r => r._id === selected._id);
        if (updated) setSelected(updated);
      }
    } catch (e) { }
    setLoading(false);
  };

  useEffect(() => { fetchConversations(); }, []);
  useEffect(() => { const t = setInterval(fetchConversations, 15000); return () => clearInterval(t); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selected]);

  const sendMessage = async () => {
    if (!msgInput.trim() || !selected || sending) return;
    const phone = selected.data?.Phone || selected.email?.replace('@whatsapp.com', '');
    if (!phone) return;
    setSending(true);
    try {
      await axios.post('/api/whatsapp/send', { phone, message: msgInput.trim() });
      setMsgInput('');
      setTimeout(fetchConversations, 1000);
    } catch (e) { alert('Failed to send: ' + (e.response?.data?.error || e.message)); }
    setSending(false);
  };

  const togglePhone = (phone) => {
    setSelectedPhones(prev =>
      prev.includes(phone) ? prev.filter(p => p !== phone) : [...prev, phone]
    );
  };

  const sendBroadcast = async () => {
    if (!broadcastMsg.trim() || selectedPhones.length === 0 || broadcasting) return;
    setBroadcasting(true);
    setBroadcastResult(null);
    try {
      const res = await axios.post('/api/whatsapp/broadcast', {
        phones: selectedPhones,
        message: broadcastMsg.trim(),
        delay: broadcastDelay * 1000
      });
      setBroadcastResult(res.data);
      setTimeout(fetchConversations, 2000);
    } catch (e) {
      setBroadcastResult({ error: e.response?.data?.error || e.message });
    }
    setBroadcasting(false);
  };

  const getName = (r) => {
    // Priority: Saved Name -> WhatsApp Name -> Formatted Phone -> ID
    const fn = r.data?.['First Name'] || r.data?.name || r.whatsappName;
    if (fn && fn !== 'WhatsApp User' && fn !== 'Unknown' && !fn.includes('@')) return fn;

    const phone = r.data?.Phone || r.email?.replace('@whatsapp.com', '');
    return phone ? ('+' + phone) : 'Unknown User';
  };

  const getPhone = (r) => {
    const p = r.data?.Phone || r.email?.replace('@whatsapp.com', '');
    if (!p) return '';
    return p.length > 15 ? 'Linked Device' : p;
  };
  const getWaMsgs = (r) => (r.replies || []).filter(x => x.type === 'whatsapp').sort((a, b) => new Date(a.receivedAt) - new Date(b.receivedAt));
  const getLastMsg = (r) => { const msgs = getWaMsgs(r); return msgs[msgs.length - 1]; };
  const formatTime = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    const now = new Date();
    const diff = now - dt;
    if (diff < 86400000) return dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    if (diff < 172800000) return 'Yesterday';
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };
  const filtered = conversations.filter(r => getName(r).toLowerCase().includes(search.toLowerCase()) || getPhone(r).includes(search));

  // Premium Palette based on WhatsApp Emerald but adjusted for LeadPulse
  const primaryBrand = '#10b981'; // Emerald 500
  const primaryHover = '#059669'; // Emerald 600

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 100px)',
      background: 'var(--surface)',
      borderRadius: '24px',
      overflow: 'hidden',
      border: '1px solid var(--border)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
      position: 'relative',
      margin: '0 20px 20px'
    }}>

      {/* LEFT: Conversation List */}
      <div style={{
        width: '380px',
        minWidth: '320px',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg)',
        zIndex: 10
      }}>
        {/* Header */}
        <div style={{ padding: '24px 20px 16px', background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: primaryBrand
              }}>
                <MessageSquare size={22} />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                {broadcastMode ? 'Broadcast' : 'Inbox'}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {broadcastMode && (
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: primaryBrand }}>
                  {selectedPhones.length} selected
                </span>
              )}
              <button
                onClick={() => { setBroadcastMode(!broadcastMode); setSelectedPhones([]); setBroadcastResult(null); }}
                style={{
                  padding: '6px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
                  background: broadcastMode ? primaryBrand : 'var(--surface)',
                  color: broadcastMode ? '#fff' : 'var(--text-muted)',
                  border: `1px solid ${broadcastMode ? primaryBrand : 'var(--border)'}`,
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                📣 {broadcastMode ? 'Cancel' : 'Broadcast'}
              </button>
              {!broadcastMode && (
                <div style={{
                  padding: '6px 12px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)',
                  fontSize: '0.8rem', fontWeight: 600, color: primaryBrand
                }}>
                  {conversations.length} Contacts
                </div>
              )}
            </div>
          </div>
          {broadcastMode && conversations.length > 0 && (
            <div style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}>
              <button onClick={() => setSelectedPhones(filtered.map(r => r.data?.Phone || r.email?.replace('@whatsapp.com', '')))} style={{
                fontSize: '0.78rem', fontWeight: 600, padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border)',
                background: 'var(--surface)', color: 'var(--text-muted)', cursor: 'pointer'
              }}>Select All ({filtered.length})</button>
              <button onClick={() => setSelectedPhones([])} style={{
                fontSize: '0.78rem', fontWeight: 600, padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border)',
                background: 'var(--surface)', color: 'var(--text-muted)', cursor: 'pointer'
              }}>Clear</button>
            </div>
          )}
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.7 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search contacts or numbers..."
              style={{
                width: '100%', padding: '14px 14px 14px 44px', borderRadius: '16px', border: '1px solid var(--border)',
                background: 'var(--surface)', color: 'var(--text-main)', fontSize: '0.95rem', outline: 'none',
                boxSizing: 'border-box', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}
            />
          </div>
        </div>

        {/* Conversations Scroll Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 20px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
              <Loader2 size={32} className="animate-spin" style={{ color: primaryBrand }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ opacity: 0.2, marginBottom: '16px' }}><MessageSquare size={64} /></div>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>No chats found</p>
              <p style={{ margin: '8px 0 0', fontSize: '0.9rem', opacity: 0.7 }}>Incoming messages will appear here.</p>
            </div>
          ) : filtered.map(r => {
            const lastMsg = getLastMsg(r);
            const isActive = selected?._id === r._id;
            const waMsgs = getWaMsgs(r);
            const phone = r.data?.Phone || r.email?.replace('@whatsapp.com', '');
            const isChecked = selectedPhones.includes(phone);
            return (
              <div
                key={r._id}
                onClick={() => broadcastMode ? togglePhone(phone) : setSelected(r)}
                style={{
                  padding: '16px 12px', margin: '4px 0', borderRadius: '16px', display: 'flex', gap: '16px',
                  alignItems: 'center', cursor: 'pointer', position: 'relative',
                  background: broadcastMode && isChecked ? 'rgba(16,185,129,0.08)' : isActive ? 'var(--surface)' : 'transparent',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive && !broadcastMode ? '0 10px 25px rgba(0,0,0,0.05)' : 'none',
                  border: broadcastMode && isChecked ? `1px solid ${primaryBrand}` : isActive ? '1px solid var(--border)' : '1px solid transparent'
                }}
              >
                {/* Avatar with dynamic color and status ring */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '18px',
                    background: r.profilePic ? 'transparent' : `linear-gradient(135deg, hsl(${getName(r).charCodeAt(0) * 13 % 360}, 70%, 60%), hsl(${getName(r).charCodeAt(0) * 13 % 360}, 80%, 45%))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                    fontWeight: 700, fontSize: '1.4rem', boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                  }}>
                    {r.profilePic ? (
                      <img src={r.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      getName(r)[0]?.toUpperCase()
                    )}
                  </div>
                  {broadcastMode ? (
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: '18px', background: isChecked ? 'rgba(16,185,129,0.85)' : 'rgba(0,0,0,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                    }}>
                      {isChecked && <CheckCheck size={22} color="#fff" />}
                    </div>
                  ) : (
                    <div style={{
                      position: 'absolute', bottom: -2, right: -2, width: '16px', height: '16px',
                      borderRadius: '50%', background: primaryBrand, border: '3px solid var(--bg)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{
                      fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>{getName(r)}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', opacity: 0.8 }}>{formatTime(lastMsg?.receivedAt)}</span>
                  </div>
                  <div style={{
                    fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    {lastMsg?.fromMe && <Check size={14} style={{ color: primaryBrand }} />}
                    {lastMsg?.body || <em style={{ opacity: 0.6 }}>Media attachment</em>}
                  </div>
                </div>

                {broadcastMode ? (
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                    border: `2px solid ${isChecked ? primaryBrand : 'var(--border)'}`,
                    background: isChecked ? primaryBrand : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                  }}>
                    {isChecked && <Check size={14} color="#fff" />}
                  </div>
                ) : waMsgs.length > 0 && !isActive && (
                  <div style={{
                    minWidth: '22px', height: '22px', borderRadius: '8px', background: primaryBrand,
                    color: '#fff', fontSize: '0.75rem', fontWeight: 800, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', padding: '0 6px',
                    boxShadow: `0 4px 10px rgba(16, 185, 129, 0.3)`
                  }}>
                    {waMsgs.length}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Broadcast Composer OR Chat View */}
      {broadcastMode ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', padding: '32px' }}>
          <div style={{
            background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)',
            padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.08)', maxWidth: '700px', width: '100%', margin: '0 auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(16,185,129,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem'
              }}>📣</div>
              <div>
                <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-main)' }}>WhatsApp Broadcast</h2>
                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {selectedPhones.length === 0 ? 'Select contacts from the left to get started' : `Sending to ${selectedPhones.length} contact${selectedPhones.length > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            {selectedPhones.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedPhones.map(p => {
                  const lead = conversations.find(r => (r.data?.Phone || r.email?.replace('@whatsapp.com', '')) === p);
                  const name = lead ? getName(lead) : '+' + p;
                  return (
                    <div key={p} style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px',
                      borderRadius: '20px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                      fontSize: '0.82rem', fontWeight: 600, color: primaryBrand
                    }}>
                      {name}
                      <span onClick={() => togglePhone(p)} style={{ cursor: 'pointer', opacity: 0.7, marginLeft: '2px' }}>✕</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>MESSAGE</label>
              <textarea
                value={broadcastMsg}
                onChange={e => setBroadcastMsg(e.target.value)}
                placeholder="Type your broadcast message here..."
                rows={5}
                style={{
                  width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--border)',
                  background: 'var(--bg)', color: 'var(--text-main)', fontSize: '1rem', resize: 'vertical',
                  outline: 'none', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box'
                }}
              />
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>
                {broadcastMsg.length} chars
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>DELAY BETWEEN MSGS</label>
              <input
                type="number" min={1} max={30} value={broadcastDelay}
                onChange={e => setBroadcastDelay(Number(e.target.value))}
                style={{
                  width: '80px', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)',
                  background: 'var(--bg)', color: 'var(--text-main)', fontSize: '1rem', outline: 'none'
                }}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>seconds</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', opacity: 0.7 }}>(prevents WhatsApp ban)</span>
            </div>

            {broadcastResult && (
              <div style={{
                padding: '16px 20px', borderRadius: '14px',
                background: broadcastResult.error ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                border: `1px solid ${broadcastResult.error ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                fontSize: '0.9rem', color: broadcastResult.error ? '#ef4444' : primaryBrand, fontWeight: 600
              }}>
                {broadcastResult.error ? (
                  <span>❌ Error: {broadcastResult.error}</span>
                ) : (
                  <span>✅ Done! Sent: {broadcastResult.sent} &nbsp;|&nbsp; Failed: {broadcastResult.failed}</span>
                )}
              </div>
            )}

            <button
              onClick={sendBroadcast}
              disabled={broadcasting || selectedPhones.length === 0 || !broadcastMsg.trim() || waStatus !== 'connected'}
              style={{
                padding: '16px 32px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                background: broadcasting || selectedPhones.length === 0 || !broadcastMsg.trim() || waStatus !== 'connected'
                  ? 'var(--border)' : `linear-gradient(135deg, ${primaryBrand}, #059669)`,
                color: '#fff', fontWeight: 800, fontSize: '1.05rem',
                boxShadow: selectedPhones.length > 0 && broadcastMsg.trim() ? '0 10px 25px rgba(16,185,129,0.3)' : 'none',
                transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
              }}
            >
              {broadcasting ? (
                <><Loader2 size={20} className="animate-spin" /> Sending to {selectedPhones.length} contacts...</>
              ) : (
                <>📣 Send Broadcast to {selectedPhones.length} Contact{selectedPhones.length !== 1 ? 's' : ''}</>
              )}
            </button>

            {waStatus !== 'connected' && (
              <p style={{ margin: 0, color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
                ⚠️ WhatsApp not connected. Connect first from WhatsApp Settings.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', position: 'relative' }}>
          {/* RIGHT: Chat View Area */}
          {selected ? (
            <>
              {/* Premium Chat Header */}
              <div style={{
                padding: '20px 30px', background: 'var(--surface)', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: '20px', zIndex: 10,
                backdropFilter: 'blur(20px)', background: 'rgba(var(--bg-rgb), 0.8)'
              }}>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '16px',
                  background: selected.profilePic ? 'transparent' : `linear-gradient(135deg, hsl(${getName(selected).charCodeAt(0) * 13 % 360}, 70%, 60%), hsl(${getName(selected).charCodeAt(0) * 13 % 360}, 80%, 45%))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  fontWeight: 700, fontSize: '1.2rem', boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                  overflow: 'hidden'
                }}>
                  {selected.profilePic ? (
                    <img src={selected.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    getName(selected)[0]?.toUpperCase()
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.01em' }}>{getName(selected)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: primaryBrand }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Online • +{getPhone(selected)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => window.open(`https://wa.me/${getPhone(selected)}`, '_blank')}
                    style={{
                      padding: '12px 20px', borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--border)',
                      color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                    }}
                  >
                    <Globe size={18} /> Open WhatsApp
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    style={{
                      width: '44px', height: '44px', borderRadius: '14px', background: 'var(--bg)',
                      border: '1px solid var(--border)', color: 'var(--text-main)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Messages Area with subtle background pattern */}
              <div style={{
                flex: 1, overflowY: 'auto', padding: '30px', display: 'flex', flexDirection: 'column', gap: '12px',
                background: 'var(--bg)', position: 'relative'
              }}>
                {/* Message groups or simple list */}
                {getWaMsgs(selected).map((msg, i) => {
                  const isFirstOfGroup = i === 0 || getWaMsgs(selected)[i - 1].fromMe !== msg.fromMe;
                  return (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: msg.fromMe ? 'flex-end' : 'flex-start',
                      marginTop: isFirstOfGroup ? '12px' : '0'
                    }}>
                      <div style={{
                        maxWidth: '70%',
                        background: msg.fromMe ? primaryBrand : 'var(--surface)',
                        color: msg.fromMe ? '#fff' : 'var(--text-main)',
                        borderRadius: msg.fromMe
                          ? (isFirstOfGroup ? '20px 20px 4px 20px' : '20px 4px 4px 20px')
                          : (isFirstOfGroup ? '20px 20px 20px 4px' : '4px 20px 20px 4px'),
                        padding: '12px 18px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        position: 'relative',
                        transition: 'transform 0.2s',
                        border: msg.fromMe ? 'none' : '1px solid var(--border)'
                      }}>
                        <div style={{ fontSize: '1rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', fontWeight: 450 }}>
                          {msg.body || <em style={{ opacity: 0.6 }}>Media attachment</em>}
                        </div>
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                          gap: '6px', marginTop: '6px', fontSize: '0.7rem',
                          opacity: 0.8, color: msg.fromMe ? '#fff' : 'var(--text-muted)'
                        }}>
                          {formatTime(msg.receivedAt)}
                          {msg.fromMe && <CheckCheck size={14} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Floating Send Box */}
              <div style={{ padding: '20px 30px 30px', background: 'transparent', position: 'relative' }}>
                <div style={{
                  background: 'var(--surface)', padding: '8px 8px 8px 24px', borderRadius: '24px',
                  display: 'flex', gap: '12px', alignItems: 'center', border: '1px solid var(--border)',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)'
                }}>
                  <input
                    value={msgInput}
                    onChange={e => setMsgInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder={waStatus === 'connected' ? "Type a premium message..." : "Engine disconnected..."}
                    disabled={waStatus !== 'connected'}
                    style={{
                      flex: 1, padding: '12px 0', border: 'none', outline: 'none',
                      fontSize: '1rem', background: 'transparent', color: 'var(--text-main)'
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!msgInput.trim() || sending || waStatus !== 'connected'}
                    style={{
                      width: '52px', height: '52px', borderRadius: '20px',
                      background: msgInput.trim() && waStatus === 'connected' ? primaryBrand : 'var(--bg)',
                      border: 'none', color: msgInput.trim() && waStatus === 'connected' ? '#fff' : 'var(--text-muted)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      boxShadow: msgInput.trim() && waStatus === 'connected' ? `0 10px 20px rgba(16, 185, 129, 0.3)` : 'none',
                      transform: msgInput.trim() ? 'scale(1)' : 'scale(0.95)'
                    }}
                  >
                    {sending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} style={{ marginLeft: '4px' }} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', background: 'var(--bg)', gap: '24px', textAlign: 'center', padding: '40px'
            }}>
              <div style={{
                width: '140px', height: '140px', borderRadius: '48px', background: 'var(--surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                boxShadow: '0 30px 60px rgba(0,0,0,0.08)', border: '1px solid var(--border)'
              }}>
                <MessageSquare size={60} style={{ color: primaryBrand, opacity: 0.8 }} />
                <div style={{
                  position: 'absolute', top: -10, right: -10, width: '40px', height: '40px',
                  borderRadius: '16px', background: primaryBrand, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)'
                }}>
                  <Flame size={20} />
                </div>
              </div>
              <div>
                <h2 style={{ margin: '0 0 12px', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Select a Conversation</h2>
                <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '400px', lineHeight: 1.6 }}>
                  Choose a contact from the left sidebar to start chatting. Your responses are synced in real-time.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
// ============================================================

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [passcode, setPasscode] = useState('');
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'dashboard');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const switchTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('activeTab', tab);
    setSelectedIds([]); // Clear selection on tab switch
  };

  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState(localStorage.getItem('saved_subject') || 'Growth Opportunity for {{Business}}');
  const [body1, setBody1] = useState(localStorage.getItem('saved_body1') || 'Hi {{First Name}},\n\nI came across {{Business}} on social media and decided to check it out.\n\nI noticed you don’t have a website yet.\n\nMany of your competitors already have one, which makes them look more professional and helps build trust with customers.\n\nI can create a clean, modern website for {{Business}}.\n\nIf this sounds useful, feel free to reply — I’d be happy to share a quick idea with you.\n\n— Muntazir\nSoftware Engineer | Website Developer');
  const [body2, setBody2] = useState(localStorage.getItem('saved_body2') || 'Hi {{First Name}}, following up...\n\nWhile you sleep, people are searching for your services online. Without a website, {{Business}} is invisible to them.\n\nLet\'s get you online so you stop missing out on these opportunities.\n\nReady to grow?\n\n— Muntazir\nWebsite & Software Developer');
  const [body3, setBody3] = useState(localStorage.getItem('saved_body3') || 'Hi {{First Name}},\n\nLast note from my side. I truly believe {{Business}} has massive potential, but it needs a digital home to thrive.\n\nIf you ever decide to take your business to the next level, I’m here to help.\n\nWishing you the very best!\n\n— Muntazir\nWebsite & Software Developer');
  const [emailUser, setEmailUser] = useState(localStorage.getItem('saved_user') || 'muntazir.site@gmail.com');
  const [emailPass, setEmailPass] = useState(localStorage.getItem('saved_pass') || 'bbad zuak ztni mnbr');
  const [igSession, setIgSession] = useState(localStorage.getItem('saved_igSession') || '');
  const [liAt, setLiAt] = useState(localStorage.getItem('saved_liAt') || '');
  const [fbCUser, setFbCUser] = useState(localStorage.getItem('saved_fbCUser') || '');
  const [fbXs, setFbXs] = useState(localStorage.getItem('saved_fbXs') || '');
  const [showCookies, setShowCookies] = useState(false);
  const [stats, setStats] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [savedLeads, setSavedLeads] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
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
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('pro_theme') || 'theme-light');
  const [scrapeKeyword, setScrapeKeyword] = useState('');
  const [scrapeCity, setScrapeCity] = useState('');
  const [scrapeMode, setScrapeMode] = useState('no_website');
  const [scrapeSources, setScrapeSources] = useState(['map']);
  const [scrapedLeads, setScrapedLeads] = useState([]);
  const [selectedScrapedPhones, setSelectedScrapedPhones] = useState([]);
  const [isScraperBroadcasting, setIsScraperBroadcasting] = useState(false);
  const [scraperWaDelay, setScraperWaDelay] = useState(3);
  const [waStatuses, setWaStatuses] = useState({});
  const [isScraping, setIsScraping] = useState(false);
  const [isLoadingSavedLeads, setIsLoadingSavedLeads] = useState(false);
  const [isBulkFinding, setIsBulkFinding] = useState(false);
  const [emailFindLog, setEmailFindLog] = useState('');
  const [isEnricherSending, setIsEnricherSending] = useState(false);
  const [enricherBulkPicker, setEnricherBulkPicker] = useState(false);
  const [enricherEditMode, setEnricherEditMode] = useState(false);
  const [addEmailModal, setAddEmailModal] = useState(false);
  const [addEmailForm, setAddEmailForm] = useState({ email: '', name: '', phone: '', city: '', keyword: '' });
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [viewReplyModal, setViewReplyModal] = useState({ open: false, lead: null });
  const [expandedLeadId, setExpandedLeadId] = useState(null);
  const [expandedReplyIdx, setExpandedReplyIdx] = useState(null);
  const [inlineEditLeadId, setInlineEditLeadId] = useState(null);
  const [inlineEditData, setInlineEditData] = useState({});
  const [keywordHistory, setKeywordHistory] = useState(JSON.parse(localStorage.getItem('keyword_history') || '[]'));
  const [cityHistory, setCityHistory] = useState(JSON.parse(localStorage.getItem('city_history') || '[]'));
  const [waModal, setWaModal] = useState({ open: false, phone: '', message: '' });
  const [waStatus, setWaStatus] = useState('disconnected');
  const [waQr, setWaQr] = useState('');

  const fetchWaStatus = async () => {
    try {
      const res = await axios.get('/api/whatsapp/status');
      setWaStatus(res.data.status);
      if (res.data.hasQr && res.data.status !== 'connected') {
        const qrRes = await axios.get('/api/whatsapp/qr');
        setWaQr(qrRes.data.qr);
      } else {
        setWaQr('');
      }
    } catch (err) { }
  };

  useEffect(() => {
    fetchWaStatus();
    const interval = setInterval(fetchWaStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // WhatsApp Templates State
  const [whatsappTemplates, setWhatsappTemplates] = useState([]);
  const [newWaTpl, setNewWaTpl] = useState({ message: '', details: '' });

  useEffect(() => {
    document.body.className = currentTheme;
    localStorage.setItem('pro_theme', currentTheme);
  }, [currentTheme]);

  // HEART-TOUCHING TEMPLATES FOR NO-WEBSITE CLIENTS
  useEffect(() => {
    localStorage.removeItem('saved_body1');
    localStorage.removeItem('saved_body2');
    localStorage.removeItem('saved_body3');
    setBody1('Hi {{First Name}},\n\nI came across {{Business}} on social media and decided to check it out.\n\nI noticed you don’t have a website yet.\n\nMany of your competitors already have one, which makes them look more professional and helps build trust with customers.\n\nI can create a clean, modern website for {{Business}}.\n\nIf this sounds useful, feel free to reply — I’d be happy to share a quick idea with you.\n\n— Muntazir\nSoftware Engineer | Website Developer');
    setBody2('Hi {{First Name}}, following up...\n\nWhile you sleep, people are searching for your services online. Without a website, {{Business}} is invisible to them.\n\nLet\'s get you online so you stop missing out on these opportunities.\n\nReady to grow?\n\n— Muntazir\nWebsite & Software Developer');
    setBody3('Hi {{First Name}},\n\nLast note from my side. I truly believe {{Business}} has massive potential, but it needs a digital home to thrive.\n\nIf you ever decide to take your business to the next level, I’m here to help.\n\nWishing you the very best!\n\n— Muntazir\nWebsite & Software Developer');
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchStats();
      fetchRecipients();
      fetchCustomTemplates();
      fetchCustomFields();
      fetchWhatsappTemplates(); // Load WA templates
      fetchSettings();
      const interval = setInterval(() => {
        fetchStats();
        fetchRecipients();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // Auto-fetch saved leads when entering Enricher / CRM tab (handles page reload too)
  useEffect(() => {
    if (isLoggedIn && (activeTab === 'email_finder' || activeTab === 'saved_leads')) {
      fetchSavedLeads();
    }
  }, [isLoggedIn, activeTab]);

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchWhatsappTemplates = async () => {
    try {
      const res = await axios.get('/api/whatsapp-templates');
      setWhatsappTemplates(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAddWhatsappTemplate = async () => {
    if (!newWaTpl.message || !newWaTpl.details) return showToast("Both fields are required", "error");
    try {
      await axios.post('/api/whatsapp-templates', newWaTpl);
      setNewWaTpl({ message: '', details: '' });
      fetchWhatsappTemplates();
      showToast("WhatsApp Template added!");
    } catch (err) { showToast("Failed to add template", "error"); }
  };

  const handleDeleteWhatsappTemplate = async (id) => {
    try {
      await axios.delete(`/api/whatsapp-templates/${id}`);
      fetchWhatsappTemplates();
      showToast("Template deleted");
    } catch (err) { }
  };

  const handleActivateWhatsappTemplate = async (id) => {
    try {
      await axios.put(`/api/whatsapp-templates/${id}/activate`);
      fetchWhatsappTemplates();
      showToast("Template activated!");
    } catch (err) { }
  };

  const handleWhatsappReply = (leadEmail) => {
    const activeTpl = whatsappTemplates.find(t => t.isActive);
    if (!activeTpl) {
      showToast("No active WhatsApp template found. Please create and activate one in WhatsApp Settings.", "error");
      return;
    }

    const lead = recipients.find(r => r.email === leadEmail);
    const phone = lead?.data?.Phone || lead?.data?.phone || lead?.phone;

    if (!phone) {
      showToast("No phone number found for this lead.", "error");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');

    // Process variables in the message
    let finalMsg = activeTpl.message;
    if (lead?.data) {
      Object.keys(lead.data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g'); // Support {{Var}}
        const regex2 = new RegExp(`{${key}}`, 'g');  // Support {Var}
        finalMsg = finalMsg.replace(regex, lead.data[key] || '').replace(regex2, lead.data[key] || '');
      });
    }

    // Show modal with message so user can copy and open WhatsApp
    setWaModal({ open: true, phone: cleanPhone, message: finalMsg });
  };

  const copyWaMessage = () => {
    const textArea = document.createElement('textarea');
    textArea.value = waModal.message;
    textArea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('✅ Message copied to clipboard!', 'success');
    } catch {
      showToast('Could not copy — please select and copy manually.', 'error');
    }
    document.body.removeChild(textArea);
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      if (res.data) {
        if (res.data.igSession) setIgSession(res.data.igSession);
        if (res.data.liAt) setLiAt(res.data.liAt);
        if (res.data.fbCUser) setFbCUser(res.data.fbCUser);
        if (res.data.fbXs) setFbXs(res.data.fbXs);
      }
    } catch (e) { console.error("Error fetching settings:", e); }
  };

  const handleSaveCookie = async (field, value) => {
    try {
      await axios.post('/api/settings', { [field]: value });
    } catch (e) { }
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

  const handleBulkFindEmails = (ids) => {
    if (!ids || ids.length === 0) return showToast('Leads select karo pehle!', 'error');
    setIsBulkFinding(true);
    setEmailFindLog('');
    showToast(`${ids.length} leads ke liye email dhundh raha hai...`, 'success');
    const es = new EventSource(`/api/bulk-find-emails?ids=${ids.join(',')}`);
    es.onmessage = (event) => {
      try {
        const d = JSON.parse(event.data);
        if (d.type === 'status') setEmailFindLog(d.message);
        if (d.type === 'lead_done') {
          setSavedLeads(prev => prev.map(l => l._id === d.leadId
            ? { ...l, email: d.email, emailFound: !!d.email, emailSource: d.emailSource, socialLinks: d.socialLinks }
            : l));
          if (d.email) showToast(`${d.name}: ${d.email}`, 'success');
        }
        if (d.type === 'done') {
          setIsBulkFinding(false);
          showToast(d.message, 'success');
          es.close();
        }
        if (d.type === 'error') {
          setIsBulkFinding(false);
          showToast('Error: ' + d.message, 'error');
          es.close();
        }
      } catch (_) { }
    };
    es.onerror = () => { setIsBulkFinding(false); es.close(); };
  };

  const handleScrape = (e) => {
    e.preventDefault();
    setIsScraping(true);
    setScrapedLeads([]);
    showToast("Live Scraping Started! Data will stream in every 10-15s...", "success");

    const url = `/api/scrape-leads?keyword=${encodeURIComponent(scrapeKeyword)}&city=${encodeURIComponent(scrapeCity)}&mode=${scrapeMode}&sources=${scrapeSources.join(',')}&igSession=${encodeURIComponent(igSession)}&liAt=${encodeURIComponent(liAt)}&fbCUser=${encodeURIComponent(fbCUser)}&fbXs=${encodeURIComponent(fbXs)}`;

    // Save to history
    if (!keywordHistory.includes(scrapeKeyword)) {
      const newHistory = [scrapeKeyword, ...keywordHistory].slice(0, 10);
      setKeywordHistory(newHistory);
      localStorage.setItem('keyword_history', JSON.stringify(newHistory));
    }
    if (!cityHistory.includes(scrapeCity)) {
      const newHistory = [scrapeCity, ...cityHistory].slice(0, 10);
      setCityHistory(newHistory);
      localStorage.setItem('city_history', JSON.stringify(newHistory));
    }

    const eventSource = new EventSource(url);
    window.currentScrapeES = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === 'lead') {
          console.log("New Lead Received:", parsed.data.name);
          setScrapedLeads(prev => [...prev, parsed.data]);
        } else if (parsed.type === 'status') {
          console.log("Scraper Status:", parsed.message);
        } else if (parsed.type === 'done') {
          showToast("Bulk Scraping Finished!", "success");
          eventSource.close();
          setIsScraping(false);
        } else if (parsed.type === 'error') {
          showToast("Error: " + parsed.message, "error");
          eventSource.close();
          setIsScraping(false);
        }
      } catch (err) {
        console.error("Failed to parse SSE data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource Error:", err);
      eventSource.close();
      setIsScraping(false);
    };
  };

  const stopScrape = () => {
    if (window.currentScrapeES) {
      window.currentScrapeES.close();
      window.currentScrapeES = null;
    }
    setIsScraping(false);
    showToast("Scraper Stopped. Refreshing...", "info");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };
  const handleDeleteGroup = async (keyword, city) => {
    setConfirmModal({
      open: true,
      title: `Delete ALL leads for "${keyword}" in "${city}"?`,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/saved-leads/group?keyword=${encodeURIComponent(keyword)}&city=${encodeURIComponent(city)}`);
          showToast("Folder and all leads deleted!", "success");
          fetchSavedLeads();
        } catch (e) { showToast("Delete failed", "error"); }
      }
    });
  };

  const handleSaveInlineEdit = async () => {
    try {
      await axios.put(`/api/saved-leads/${inlineEditLeadId}`, inlineEditData);
      showToast("Lead updated successfully!", "success");
      setInlineEditLeadId(null);
      fetchSavedLeads();
    } catch (err) {
      showToast("Failed to update lead", "error");
    }
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
    // Try recipients (campaign leads) first, then fall back to savedLeads (enricher)
    let lead = recipients.find(r => r._id === leadId);
    let isEnricherLead = false;
    if (!lead) {
      const sl = savedLeads.find(s => s._id === leadId);
      if (sl) {
        isEnricherLead = true;
        // Detect junk scraped names (Facebook headers, generic page labels) — fall back to keyword
        const junkNames = ['chats', 'ad', 'ads', 'search results', 'search result', 'home', 'about', 'contact', 'menu', 'profile', 'page', 'untitled', 'facebook', 'instagram'];
        const rawName = (sl.name || '').trim();
        const isJunk = !rawName || junkNames.includes(rawName.toLowerCase());
        const businessVal = isJunk ? (sl.keyword || rawName || '') : rawName;
        const firstNameVal = businessVal; // User requested full business name instead of first name split
        lead = {
          ...sl,
          data: {
            'Name': businessVal,
            'First Name': firstNameVal,
            'Business': businessVal,
            'Business Name': businessVal,
            'Phone': sl.phone || '',
            'Address': sl.address || '',
            'City': sl.city || '',
            'Keyword': sl.keyword || '',
            'Email': sl.email || ''
          },
          _enricherLead: true
        };
      }
    }

    let template = customTemplates.find(t => t._id === templateId);

    // Support for Step 1/2/3 pseudo-templates
    // For Enricher leads, fall back to global subject/body (Campaign tab values)
    if (templateId === 'step1') template = { _id: 'step1', name: 'Auto Sequence: Step 1', subject: (isEnricherLead ? subject : lead?.subject), body: (isEnricherLead ? body1 : lead?.body1) };
    if (templateId === 'step2') template = { _id: 'step2', name: 'Auto Sequence: Step 2', subject: (isEnricherLead ? subject : lead?.subject), body: (isEnricherLead ? body2 : lead?.body2) };
    if (templateId === 'step3') template = { _id: 'step3', name: 'Auto Sequence: Step 3', subject: (isEnricherLead ? subject : lead?.subject), body: (isEnricherLead ? body3 : lead?.body3) };

    if (!lead || !template) return;

    // Extract all {{vars}} or {vars} from subject and body (Clean extraction to avoid duplicates)
    const combined = (template.subject || "") + " " + (template.body || "");
    const matches = [...combined.matchAll(/\{+([^{}]+)\}+/g)];
    const vars = [...new Set(matches.map(m => m[1].trim()))];

    if (vars.length > 0) {
      const initialData = {};
      vars.forEach(v => {
        // SMART ALIASING — case-insensitive lookup
        const dataKeys = Object.keys(lead.data || {});
        const matchKey = dataKeys.find(k => k.toLowerCase() === v.toLowerCase());
        let val = matchKey ? lead.data[matchKey] : "";
        if (!val && v.toLowerCase() === 'business') val = lead.data?.['Business Name'] || lead.data?.['business'] || lead.data?.['Name'] || "";
        if (!val && v.toLowerCase() === 'first name') val = lead.data?.['Name'] || lead.data?.['first_name'] || "";
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
            if (isEnricherLead) {
              const res = await axios.post('/api/enricher-send', {
                leadIds: [leadId], templateId, emailUser, emailPass, customVars: {}
              });
              showToast(res.data.message, "success");
              fetchSavedLeads();
            } else {
              const res = await axios.post(`/api/send-custom/${leadId}/${templateId}`);
              showToast(res.data.message, "success");
              fetchRecipients();
            }
            setSelectedLeadForTpl(null);
          } catch (e) { showToast(e.response?.data?.error || "Error", "error"); }
        }
      });
    }
  };

  const confirmAndSendCustom = async () => {
    try {
      if (modalLead?._enricherLead) {
        if (!emailUser || !emailPass) return showToast('SMTP credentials missing — Campaign tab pe set karo!', 'error');
        const isStep = ['step1', 'step2', 'step3'].includes(modalTpl._id);
        const payload = {
          leadIds: [modalLead._id],
          emailUser,
          emailPass,
          customVars: modalData
        };
        if (isStep) {
          payload.template = { subject: modalTpl.subject, body: modalTpl.body };
        } else {
          payload.templateId = modalTpl._id;
        }
        const res = await axios.post('/api/enricher-send', payload);
        showToast(res.data.message, "success");
        setIsVarModalOpen(false);
        fetchSavedLeads();
      } else {
        const res = await axios.post(`/api/send-custom/${modalLead._id}/${modalTpl._id}`, { customData: modalData });
        showToast(res.data.message, "success");
        setIsVarModalOpen(false);
        fetchRecipients();
      }
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
    localStorage.setItem('saved_igSession', igSession);
    localStorage.setItem('saved_liAt', liAt);
    localStorage.setItem('saved_fbCUser', fbCUser);
    localStorage.setItem('saved_fbXs', fbXs);
    showToast("Templates & Credentials Saved!", "success");
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/stats');
      if (Array.isArray(res.data)) setStats(res.data);
    } catch (e) { }
  };

  const fetchRecipients = async () => {
    try {
      const res = await axios.get('/api/recipients');
      if (Array.isArray(res.data)) setRecipients(res.data);
    } catch (e) { }
  };

  const fetchSavedLeads = async () => {
    setIsLoadingSavedLeads(true);
    try {
      const res = await axios.get('/api/saved-leads');
      if (Array.isArray(res.data)) setSavedLeads(res.data);
    } catch (e) { } finally {
      setTimeout(() => setIsLoadingSavedLeads(false), 800); // Small delay for smooth transition
    }
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
      <div className="hero-vibe">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/bg-video.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <div className="cyber-scanner"></div>

        {/* PREMIUM THEME SWITCHER - LANDING PAGE */}
        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 100 }}>
          <select
            value={currentTheme}
            onChange={(e) => setCurrentTheme(e.target.value)}
            className="pro-select"
            style={{ padding: '8px 16px', fontSize: '0.85rem', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', backdropFilter: 'blur(20px)', cursor: 'pointer', outline: 'none' }}
          >
            <option value="theme-dark" style={{ color: '#000' }}>Dark Premium</option>
            <option value="theme-light" style={{ color: '#000' }}>Light Minimal</option>
            <option value="theme-cyber" style={{ color: '#000' }}>Neon Cyber</option>
            <option value="theme-abstract" style={{ color: '#000' }}>Creative Abstract</option>
            <option value="theme-glass-neon" style={{ color: '#000' }}>Dark Glass Neon</option>
            <option value="theme-light-gradient" style={{ color: '#000' }}>Light Soft Gradient</option>
          </select>
        </div>

        <div className="hero-content">
          <div className="brand" style={{ justifyContent: 'center', marginBottom: '1.5rem', fontSize: '1.5rem', color: '#fff', letterSpacing: '4px' }}>
            <img src="/logo.png" alt="logo" style={{ height: '40px', borderRadius: '10px' }} />
            PRO EMAILER
          </div>
          <h1 className="hero-title">Automate Cold Outreach.</h1>
          <p className="hero-subtitle">Scale your conversions with the most powerful, dynamic, and intelligent bulk-email infrastructure built for modern enterprises.</p>
          <form className="glass-card" onSubmit={handleLogin}>
            <input type="password" placeholder="Enter Secure Passcode" value={passcode} onChange={e => setPasscode(e.target.value)} />
            <button type="submit" className="glass-btn">Deploy Dashboard →</button>
          </form>
        </div>
      </div>
    );
  }

  const getStatCount = (id) => (Array.isArray(stats) ? stats : []).find(s => s._id === id)?.count || 0;

  return (
    <div className="dashboard-container">
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="brand">
          <img src="/logo.png" alt="LeadPulse" style={{ height: '38px', borderRadius: '8px' }} />
          LeadPulse
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
          <div className={`nav-item ${activeTab === 'scraper' ? 'active' : ''}`} onClick={() => { switchTab('scraper'); setIsMobileMenuOpen(false); }}>
            <SearchIcon /> Lead Scraper
          </div>
          <div className={`nav-item ${activeTab === 'email_finder' ? 'active' : ''}`} onClick={() => { switchTab('email_finder'); setIsMobileMenuOpen(false); fetchSavedLeads(); }}>
            <TargetIcon /> Email Enricher
          </div>
          <div className={`nav-item ${activeTab === 'saved_leads' ? 'active' : ''}`} onClick={() => { switchTab('saved_leads'); setIsMobileMenuOpen(false); fetchSavedLeads(); }}>
            <UsersIcon /> Lead Automation CRM
          </div>
          <div className={`nav-item ${activeTab === 'replied_leads' ? 'active' : ''}`} onClick={() => { switchTab('replied_leads'); setIsMobileMenuOpen(false); }}>
            <MessageSquare size={16} /> Replied Leads
          </div>
          <div className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => { switchTab('logs'); setIsMobileMenuOpen(false); }}>
            <HistoryIcon /> Delivery Logs
          </div>
          <div className={`nav-item ${activeTab === 'whatsapp_settings' ? 'active' : ''}`} onClick={() => { switchTab('whatsapp_settings'); setIsMobileMenuOpen(false); }}>
            <Phone size={20} /> <span>WhatsApp Settings</span>
          </div>
          <div className={`nav-item ${activeTab === 'whatsapp_linker' ? 'active' : ''}`} onClick={() => { switchTab('whatsapp_linker'); setIsMobileMenuOpen(false); }}>
            <div style={{ position: 'relative' }}>
              <Phone size={20} />
              <div style={{
                position: 'absolute', top: -4, right: -4, width: 8, height: 8, borderRadius: '50%',
                background: waStatus === 'connected' ? '#10b981' : waStatus === 'qr-ready' ? '#f59e0b' : '#ef4444',
                border: '2px solid var(--sidebar-bg)'
              }} />
            </div>
            <span>WhatsApp Linker</span>
          </div>
          <div className={`nav-item ${activeTab === 'whatsapp_inbox' ? 'active' : ''}`} onClick={() => { switchTab('whatsapp_inbox'); setIsMobileMenuOpen(false); }}>
            <MessageSquare size={20} />
            <span>WhatsApp Inbox</span>
          </div>
          <div className={`nav-item ${activeTab === 'custom_templates' ? 'active' : ''}`} onClick={() => { switchTab('custom_templates'); setIsMobileMenuOpen(false); }}>
            <FolderIcon /> Chat Templates
          </div>
          <div className={`nav-item ${activeTab === 'variables' ? 'active' : ''}`} onClick={() => { switchTab('variables'); setIsMobileMenuOpen(false); }}>
            <SettingsIcon /> Variable Manager
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
            <h2>{activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'campaign' ? 'New Campaign' : activeTab === 'template' ? 'Email Templates' : activeTab === 'custom_templates' ? 'Custom Templates' : activeTab === 'whatsapp_settings' ? 'WhatsApp Settings' : activeTab === 'whatsapp_linker' ? 'WhatsApp Linker' : activeTab === 'whatsapp_inbox' ? 'WhatsApp Inbox' : activeTab === 'variables' ? 'Variable Manager' : activeTab === 'logs' ? 'Delivery Logs' : activeTab === 'replied_leads' ? 'Replied Leads' : activeTab === 'scraper' ? 'Lead Scraper' : activeTab === 'email_finder' ? 'Email Enricher' : activeTab === 'saved_leads' ? 'Lead Automation CRM' : 'Archive'}</h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select
              value={currentTheme}
              onChange={(e) => setCurrentTheme(e.target.value)}
              className="pro-select"
              style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto', background: 'var(--card-bg)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
            >
              <option value="theme-dark">Dark Premium</option>
              <option value="theme-light">Light Minimal</option>
              <option value="theme-cyber">Neon Cyber</option>
              <option value="theme-abstract">Creative Abstract</option>
              <option value="theme-glass-neon">Dark Glass Neon</option>
              <option value="theme-light-gradient">Light Soft Gradient</option>
            </select>
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
                  <span className="stat-label">Active Replied</span>
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
                        <th>REPLY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipients.slice(0, 10).map((r, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: '500' }}>{r.email}</td>
                          <td>{r.step > 3 ? 'Completed' : `Step ${r.step}`}</td>
                          <td><span className={`status-badge status-${r.status.replace(/ /g, '-').toLowerCase()}`}>{r.status}</span></td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.lastSentAt ? new Date(r.lastSentAt).toLocaleString() : 'Queued'}</td>
                          <td>
                            {r.status === 'replied' && (
                              <button
                                className="reply-view-btn"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '5px 12px',
                                  fontSize: '0.75rem',
                                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                  border: 'none',
                                  borderRadius: '20px',
                                  color: 'white',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                                  transition: 'transform 0.2s'
                                }}
                                onClick={() => setViewReplyModal({ open: true, lead: r })}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                              >
                                <MessageSquare size={12} /> View Reply
                              </button>
                            )}
                          </td>
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

          {activeTab === 'scraper' && (
            <div className="content-area">
              <div className="config-card">
                <h3>Extract Local Businesses (No Website)</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Automatically searches Google Maps using browser automation and extracts businesses that do NOT have a digital presence.</p>
                <form onSubmit={handleScrape} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div className="field" style={{ flex: 1, minWidth: '150px' }}>
                    <label>Business Type / Keyword</label>
                    <input type="text" list="keyword-history" placeholder="e.g. Interior Designer, Furniture, Clinic..." required value={scrapeKeyword} onChange={e => setScrapeKeyword(e.target.value)} />
                    <datalist id="keyword-history">
                      {keywordHistory.map((h, i) => <option key={i} value={h} />)}
                    </datalist>
                  </div>
                  <div className="field" style={{ flex: 1, minWidth: '150px' }}>
                    <label>Target Location</label>
                    <input type="text" list="city-history" placeholder="e.g. Ahmedabad, Gujarat" required value={scrapeCity} onChange={e => setScrapeCity(e.target.value)} />
                    <datalist id="city-history">
                      {cityHistory.map((h, i) => <option key={i} value={h} />)}
                    </datalist>
                  </div>
                  <div className="field" style={{ flex: 1, minWidth: '350px' }}>
                    <label>Scrape Sources</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {[
                        { id: 'map', label: 'Google Maps', icon: <MapPin size={14} /> },
                        { id: 'facebook', label: 'Facebook', icon: <Facebook size={14} /> },
                        { id: 'ig', label: 'Instagram', icon: <Instagram size={14} /> },
                        { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={14} /> }
                      ].map(src => (
                        <label key={src.id} style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '6px 12px', background: scrapeSources.includes(src.id) ? 'var(--primary)' : 'transparent',
                          border: `1px solid ${scrapeSources.includes(src.id) ? 'var(--primary)' : 'var(--border)'}`,
                          borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', color: scrapeSources.includes(src.id) ? '#fff' : 'var(--text-muted)',
                          userSelect: 'none'
                        }}>
                          <input
                            type="checkbox"
                            checked={scrapeSources.includes(src.id)}
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              if (e.target.checked) setScrapeSources([...scrapeSources, src.id]);
                              else setScrapeSources(scrapeSources.filter(s => s !== src.id));
                            }}
                          />
                          {src.icon}
                          {src.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="field" style={{ flex: 1, minWidth: '200px' }}>
                    <label>Extraction Mode</label>
                    <select value={scrapeMode} onChange={e => setScrapeMode(e.target.value)} className="pro-select">
                      <option value="no_website">No Website (Name, Phone, Address)</option>
                      <option value="emails_only">No Website (Auto-Find Email & Name)</option>
                    </select>
                  </div>
                  <div className="field" style={{ flex: 0, minWidth: '200px' }}>
                    <label>&nbsp;</label>
                    {!isScraping ? (
                      <button type="submit" className="launch-btn">
                        <Rocket size={18} /> Start Extraction
                      </button>
                    ) : (
                      <button type="button" onClick={stopScrape} className="launch-btn btn-danger-stop">
                        <Square size={18} fill="currentColor" /> Stop Extraction
                      </button>
                    )}
                  </div>
                </form>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    <strong>Pro Tip:</strong> For deep Instagram/LinkedIn/Facebook email extraction on a live server, paste your session cookies below (they save automatically).
                  </p>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <div className="field" style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                      <label style={{ fontSize: '0.75rem' }}><Instagram size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> IG sessionid</label>
                      <input type={showCookies ? "text" : "password"} placeholder="sessionid cookie" value={igSession} onChange={e => { setIgSession(e.target.value); localStorage.setItem('saved_igSession', e.target.value); }} onBlur={() => handleSaveCookie('igSession', igSession)} style={{ paddingRight: '35px' }} />
                      <button type="button" onClick={() => setShowCookies(!showCookies)} style={{ position: 'absolute', right: '10px', top: '42px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                        {showCookies ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="field" style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                      <label style={{ fontSize: '0.75rem' }}><Linkedin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> LI li_at</label>
                      <input type={showCookies ? "text" : "password"} placeholder="li_at cookie" value={liAt} onChange={e => { setLiAt(e.target.value); localStorage.setItem('saved_liAt', e.target.value); }} onBlur={() => handleSaveCookie('liAt', liAt)} style={{ paddingRight: '35px' }} />
                      <button type="button" onClick={() => setShowCookies(!showCookies)} style={{ position: 'absolute', right: '10px', top: '42px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                        {showCookies ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="field" style={{ flex: 1, minWidth: '150px', position: 'relative' }}>
                      <label style={{ fontSize: '0.75rem' }}><Facebook size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> FB c_user</label>
                      <input type={showCookies ? "text" : "password"} placeholder="c_user" value={fbCUser} onChange={e => { setFbCUser(e.target.value); localStorage.setItem('saved_fbCUser', e.target.value); }} onBlur={() => handleSaveCookie('fbCUser', fbCUser)} style={{ paddingRight: '35px' }} />
                      <button type="button" onClick={() => setShowCookies(!showCookies)} style={{ position: 'absolute', right: '10px', top: '42px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                        {showCookies ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="field" style={{ flex: 1, minWidth: '150px', position: 'relative' }}>
                      <label style={{ fontSize: '0.75rem' }}><Facebook size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> FB xs</label>
                      <input type={showCookies ? "text" : "password"} placeholder="xs cookie" value={fbXs} onChange={e => { setFbXs(e.target.value); localStorage.setItem('saved_fbXs', e.target.value); }} onBlur={() => handleSaveCookie('fbXs', fbXs)} style={{ paddingRight: '35px' }} />
                      <button type="button" onClick={() => setShowCookies(!showCookies)} style={{ position: 'absolute', right: '10px', top: '42px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                        {showCookies ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {scrapedLeads.length > 0 && (
                <div className="log-card">
                  <table className="pro-table">
                    <thead>
                      <tr>
                        <th>Business Name</th>
                        {scrapeMode === 'emails_only' ? (
                          <th><Mail size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Email Found</th>
                        ) : (
                          <>
                            <th>Phone</th>
                            <th>Address</th>
                          </>
                        )}
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scrapedLeads.map((lead, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: '600' }}>{lead.name}</td>
                          {scrapeMode === 'emails_only' ? (
                            <td style={{ color: lead.emailFound ? '#6366f1' : 'var(--text-muted)' }}>
                              {lead.emailFound ? <strong>{lead.email}</strong> : 'Not Found'}
                            </td>
                          ) : (
                            <>
                              <td style={{ color: 'var(--success)', fontWeight: '500' }}>{lead.phone}</td>
                              <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{lead.address}</td>
                            </>
                          )}
                          <td>
                            <a href={lead.mapsLink} target="_blank" rel="noreferrer" className="btn-icon btn-restart" style={{ textDecoration: 'none' }}>View Map</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
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

          {activeTab === 'whatsapp_settings' && (
            <div className="campaign-grid">
              <div className="config-card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={20} /> Create WhatsApp Template</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Define messages that you can quickly send to leads via WhatsApp.</p>
                <div className="field">
                  <label>Template Details (e.g. Follow-up 1)</label>
                  <input
                    value={newWaTpl.details}
                    onChange={e => setNewWaTpl({ ...newWaTpl, details: e.target.value })}
                    placeholder="Enter template name/details"
                  />
                </div>
                <div className="field">
                  <label>WhatsApp Message</label>
                  <textarea
                    value={newWaTpl.message}
                    onChange={e => setNewWaTpl({ ...newWaTpl, message: e.target.value })}
                    placeholder="Enter your WhatsApp message here..."
                    style={{ height: '150px' }}
                  ></textarea>
                </div>
                <button className="launch-btn" onClick={handleAddWhatsappTemplate}>
                  <Save size={18} /> Save Template
                </button>
              </div>

              <div className="log-card full-width" style={{ marginTop: '2rem' }}>
                <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '1.1rem' }}>Your WhatsApp Library</div>
                <div style={{ padding: '1.5rem' }}>
                  {whatsappTemplates.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <Phone size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                      <p>No WhatsApp templates found. Create your first one above!</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                      {whatsappTemplates.map(t => (
                        <div key={t._id} style={{
                          border: t.isActive ? '2px solid var(--primary)' : '1px solid var(--border)',
                          borderRadius: '16px', padding: '1.5rem', background: 'white', position: 'relative',
                          boxShadow: t.isActive ? '0 10px 25px rgba(99, 102, 241, 0.12)' : '0 4px 6px rgba(0,0,0,0.02)',
                          transition: 'all 0.3s ease'
                        }}>
                          {t.isActive && (
                            <div style={{
                              position: 'absolute', top: '-10px', right: '20px', background: 'var(--primary)',
                              color: 'white', fontSize: '0.7rem', padding: '4px 12px', borderRadius: '20px', fontWeight: '800',
                              boxShadow: '0 4px 10px rgba(99, 102, 241, 0.4)'
                            }}>ACTIVE</div>
                          )}
                          <div style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '12px', color: 'var(--text)' }}>{t.details}</div>
                          <div style={{
                            fontSize: '0.9rem', color: 'var(--text)', background: '#f8fafc', padding: '15px',
                            borderRadius: '10px', minHeight: '100px', marginBottom: '20px', whiteSpace: 'pre-wrap',
                            border: '1px solid #edf2f7', lineHeight: '1.6'
                          }}>{t.message}</div>

                          <div style={{ display: 'flex', gap: '10px' }}>
                            {!t.isActive && (
                              <button
                                className="btn-icon btn-restart"
                                style={{ flex: 1, padding: '10px' }}
                                onClick={() => handleActivateWhatsappTemplate(t._id)}
                              >Activate Now</button>
                            )}
                            <button
                              className="btn-icon btn-stop"
                              style={{ flex: 0.4, padding: '10px' }}
                              onClick={() => {
                                setConfirmModal({
                                  open: true,
                                  title: `Delete template "${t.details}"?`,
                                  onConfirm: () => handleDeleteWhatsappTemplate(t._id)
                                });
                              }}
                            >Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
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
                        const tplId = e.target.value;
                        if (!tplId) return;
                        setConfirmModal({
                          open: true,
                          title: `Send this template to ${selectedIds.length} leads?`,
                          onConfirm: async () => {
                            try {
                              await axios.post('/api/bulk-send', { ids: selectedIds, templateId: tplId });
                              showToast("Bulk Dispatch Started!", "success");
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
                        <option value="step1">Sequence: Step 1 (Intro)</option>
                        <option value="step2">Sequence: Step 2 (Follow-up)</option>
                        <option value="step3">Sequence: Step 3 (Final)</option>
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

              {selectedIds.length > 0 && (
                <div className="bulk-bar" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px 20px', background: 'var(--primary)', color: 'white', borderRadius: '8px', margin: '1rem', animation: 'slideIn 0.3s ease-out' }}>
                  <span style={{ fontWeight: '600' }}>{selectedIds.length} Selected</span>
                  <select
                    className="pro-select"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '5px 10px' }}
                    onChange={(e) => {
                      const tplId = e.target.value;
                      if (!tplId) return;
                      setConfirmModal({
                        open: true,
                        title: `Send this template to ${selectedIds.length} archived leads?`,
                        onConfirm: async () => {
                          for (const id of selectedIds) {
                            try { await axios.post(`/api/send-custom/${id}/${tplId}`); } catch (e) { }
                          }
                          showToast("Bulk Dispatch Started!", "success");
                          setSelectedIds([]);
                          fetchRecipients();
                        }
                      });
                    }}
                  >
                    <option value="" style={{ color: 'black' }}>Bulk Send Template...</option>
                    <optgroup label="Auto Sequence" style={{ color: 'black' }}>
                      <option value="step1" style={{ color: 'black' }}>Sequence: Step 1 (Intro)</option>
                      <option value="step2" style={{ color: 'black' }}>Sequence: Step 2 (Follow-up)</option>
                      <option value="step3" style={{ color: 'black' }}>Sequence: Step 3 (Final)</option>
                    </optgroup>
                    <optgroup label="Custom Templates" style={{ color: 'black' }}>
                      {customTemplates.map(t => <option key={t._id} value={t._id} style={{ color: 'black' }}>{t.name}</option>)}
                    </optgroup>
                  </select>
                  <button
                    className="btn-icon"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                    onClick={() => {
                      setConfirmModal({
                        open: true,
                        title: `Delete ${selectedIds.length} leads forever?`,
                        onConfirm: async () => {
                          await axios.post('/api/bulk-delete', { ids: selectedIds });
                          showToast("Selected Leads Deleted!", "success");
                          setSelectedIds([]);
                          fetchRecipients(); fetchStats();
                        }
                      });
                    }}
                  >Delete Selected</button>
                  <button
                    className="btn-icon"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                    onClick={() => setSelectedIds([])}
                  >Cancel</button>
                </div>
              )}

              <table className="pro-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.length > 0 && recipients.filter(r => r.isArchived).length === selectedIds.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(recipients.filter(r => r.isArchived).map(r => r._id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                      />
                    </th>
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
                        const low = s.toLowerCase();
                        if (low.includes('step')) return 1;
                        if (low === 'pending') return 2;
                        if (low === 'finished') return 3;
                        if (low === 'replied') return 4;
                        if (low === 'stopped') return 100; // Force to absolute bottom
                        return 50;
                      };
                      return priority(a.status) - priority(b.status);
                    })
                    .map((r, i) => (
                      <tr key={i} className={selectedIds.includes(r._id) ? 'row-selected' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(r._id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedIds(prev => [...prev, r._id]);
                              else setSelectedIds(prev => prev.filter(id => id !== r._id));
                            }}
                          />
                        </td>
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
          {activeTab === 'replied_leads' && (
            <div className="content-area">
              <div className="log-card">
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                  <h3 style={{ margin: 0 }}>Replied Leads</h3>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>All leads who have responded to your emails.</p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="pro-table">
                    <thead>
                      <tr>
                        <th>RECIPIENT</th>
                        <th>LATEST REPLY</th>
                        <th>REPLIES</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipients.filter(r => r.status === 'replied').length > 0 ? (
                        recipients.filter(r => r.status === 'replied')
                          .sort((a, b) => {
                            const dateA = a.replies && a.replies.length > 0 ? new Date(a.replies[a.replies.length - 1].receivedAt) : 0;
                            const dateB = b.replies && b.replies.length > 0 ? new Date(b.replies[b.replies.length - 1].receivedAt) : 0;
                            return dateB - dateA;
                          })
                          .map((r, i) => (
                            <React.Fragment key={i}>
                              <tr
                                onClick={() => setExpandedLeadId(expandedLeadId === r._id ? null : r._id)}
                                style={{
                                  cursor: 'pointer',
                                  background: expandedLeadId === r._id ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.08) 0%, transparent 100%)' : 'transparent',
                                  transition: 'all 0.3s ease',
                                  borderLeft: expandedLeadId === r._id ? '4px solid var(--primary)' : '4px solid transparent'
                                }}
                                className="lead-row-hover"
                              >
                                <td style={{ padding: '1.2rem 1rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1rem', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                                      {r.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text)' }}>{r.email}</div>
                                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MessageSquare size={10} /> {(r.replies || []).length} interactions
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ maxWidth: '280px' }}>
                                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {r.replies && r.replies.length > 0 ? r.replies[r.replies.length - 1].subject : 'No content'}
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {r.replies && r.replies.length > 0 ? (r.replies[r.replies.length - 1].body || '').substring(0, 60) + '...' : ''}
                                  </div>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--primary)' }}>
                                      {r.replies && r.replies.length > 0 ? new Date(r.replies[r.replies.length - 1].receivedAt).toLocaleDateString() : 'N/A'}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                      {r.replies && r.replies.length > 0 ? new Date(r.replies[r.replies.length - 1].receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                  </div>
                                </td>
                                <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                                  <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px',
                                    background: expandedLeadId === r._id ? 'var(--text)' : 'rgba(99, 102, 241, 0.1)',
                                    color: expandedLeadId === r._id ? 'white' : 'var(--primary)',
                                    fontSize: '0.75rem', fontWeight: '700', transition: 'all 0.3s ease'
                                  }}>
                                    {expandedLeadId === r._id ? 'Close' : 'View Thread'} <ChevronDown size={14} style={{ transform: expandedLeadId === r._id ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                                  </div>
                                </td>
                              </tr>
                              {expandedLeadId === r._id && (
                                <tr>
                                  <td colSpan="4" style={{ padding: '0 1.5rem 2rem 1.5rem', background: 'rgba(99, 102, 241, 0.02)' }}>
                                    <div style={{ padding: '2rem', border: '1px solid var(--border)', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
                                        {/* Vertical Line Connector */}
                                        <div style={{ position: 'absolute', left: '20px', top: '20px', bottom: '20px', width: '2px', background: 'linear-gradient(to bottom, var(--primary) 0%, transparent 100%)', opacity: 0.2 }}></div>

                                        {[...(r.replies || [])].sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)).map((reply, idx) => (
                                          <div key={idx} style={{ position: 'relative', paddingLeft: '45px' }}>
                                            {/* Message Node */}
                                            <div style={{ position: 'absolute', left: '13px', top: '0', width: '16px', height: '16px', borderRadius: '50%', background: idx === 0 ? 'var(--primary)' : 'white', border: '3px solid var(--primary)', zIndex: 2 }}></div>

                                            <div style={{
                                              background: 'white', borderRadius: '12px', border: '1px solid var(--border)',
                                              boxShadow: idx === 0 ? '0 10px 25px rgba(99, 102, 241, 0.1)' : '0 4px 12px rgba(0,0,0,0.03)',
                                              overflow: 'hidden', animation: `slideIn 0.3s ease-out ${idx * 0.1}s both`
                                            }}>
                                              <div
                                                style={{
                                                  padding: '12px 20px', background: idx === 0 ? 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)' : '#f8fafc',
                                                  color: idx === 0 ? 'white' : 'var(--text)', cursor: 'pointer',
                                                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                                }}
                                                onClick={() => setExpandedReplyIdx(expandedReplyIdx === idx ? null : idx)}
                                              >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                  {idx === 0 && <span style={{ background: 'white', color: 'var(--primary)', fontSize: '0.65rem', fontWeight: '900', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>Latest</span>}
                                                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{reply.subject}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', opacity: 0.8 }}>
                                                  {reply.type === 'whatsapp' ? <MessageSquare size={12} /> : <Mail size={12} />}
                                                  <span style={{ fontWeight: '600' }}>{reply.type === 'whatsapp' ? 'WhatsApp' : 'Email'}</span>
                                                  <span style={{ opacity: 0.5 }}>•</span>
                                                  <Calendar size={12} /> {new Date(reply.receivedAt).toLocaleString()}
                                                </div>
                                              </div>
                                              {expandedReplyIdx === idx && (
                                                <div style={{ padding: '25px', background: 'white', position: 'relative' }}>
                                                  <div style={{
                                                    whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: '1.7', color: 'var(--text)',
                                                    fontFamily: 'Inter, system-ui, sans-serif'
                                                  }}>
                                                    {reply.body}
                                                  </div>
                                                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
                                                    <button
                                                      style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                      onClick={() => handleWhatsappReply(r.email)}
                                                    >
                                                      <Reply size={14} /> Direct WhatsApp
                                                    </button>
                                                    <button style={{ background: 'white', color: 'var(--text)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>
                                                      Mark as Important
                                                    </button>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ padding: '4rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MessageSquare size={30} />
                              </div>
                              <div>
                                <h4 style={{ margin: '0 0 5px 0' }}>No replies detected yet</h4>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Your leads will appear here as soon as they respond to your emails.</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'whatsapp_linker' && (
            <div className="tab-content" style={{ animation: 'fadeIn 0.5s ease-out' }}>
              <div className="log-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '3rem 2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(37, 211, 102, 0.1)',
                    color: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
                  }}>
                    <Phone size={40} />
                  </div>
                  <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>WhatsApp Automation Linker</h2>
                  <p style={{ color: 'var(--text-muted)' }}>Scan the QR code to sync your WhatsApp and start receiving replies directly here.</p>
                </div>

                <div style={{
                  background: '#f8fafc', padding: '2rem', borderRadius: '24px', border: '2px dashed #e2e8f0',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem'
                }}>
                  {waStatus === 'connected' ? (
                    <div style={{ color: '#10b981', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle size={60} />
                      <h3 style={{ margin: 0 }}>WhatsApp Connected!</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>System is now monitoring your messages for lead replies.</p>
                      <button
                        onClick={async () => { try { await axios.post('/api/whatsapp/logout'); fetchWaStatus(); } catch (e) { } }}
                        style={{ marginTop: '1rem', background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}
                      >Disconnect WhatsApp</button>
                    </div>
                  ) : waStatus === 'qr-ready' && waQr ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                      <div style={{ background: 'white', padding: '15px', borderRadius: '15px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(waQr)}`}
                          alt="WhatsApp QR Code"
                          style={{ width: '250px', height: '250px' }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b' }}>
                        <Loader2 className="animate-spin" size={20} />
                        <span style={{ fontWeight: '600' }}>Waiting for scan...</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', color: 'var(--text-muted)' }}>
                      <Loader2 className="animate-spin" size={40} />
                      <p>Initializing WhatsApp Engine...</p>
                      <button
                        onClick={async () => {
                          try { await axios.post('/api/whatsapp/restart'); } catch (e) { }
                          setTimeout(fetchWaStatus, 2000);
                        }}
                        style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.3)', padding: '8px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                      >🔄 Restart Engine & Get QR</button>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', textAlign: 'left' }}>
                  <div style={{ padding: '15px', background: 'white', borderRadius: '15px', border: '1px solid var(--border)' }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>Real-time Sync</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Replies appear in your dashboard instantly.</p>
                  </div>
                  <div style={{ padding: '15px', background: 'white', borderRadius: '15px', border: '1px solid var(--border)' }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>Multi-device</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Keep using WhatsApp on your phone normally.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'whatsapp_inbox' && <WhatsAppInboxTab waStatus={waStatus} />}

          {activeTab === 'email_finder' && (() => {
            const seen = new Set();
            const uniqueEmailLeads = savedLeads.filter(l => {
              if (!l.emailFound || !l.email) return false;
              const key = l.email.trim().toLowerCase();
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            const pendingLeads = savedLeads.filter(l => !l.emailFound);
            // Map recipients (auto-sequence enrolled) by email
            const recipientByEmail = {};
            recipients.forEach(r => {
              if (r.email) recipientByEmail[r.email.trim().toLowerCase()] = r;
            });
            const isAutoActive = (status) => ['pending', 'sending', 'replied'].includes(status) || (status || '').toLowerCase().includes('step');
            return (
              <div className="content-area">
                <div className="log-card">
                  <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h3 style={{ margin: 0 }}>Email Enricher</h3>
                      <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>All globally enriched emails — deduplicated across every scraped folder.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <div style={{ padding: '8px 14px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: '8px', fontSize: '0.85rem', color: '#6366f1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} /> Total: {uniqueEmailLeads.length}
                      </div>
                      <button
                        className="launch-btn"
                        style={{ width: 'auto', height: 'auto', padding: '6px 14px', fontSize: '0.8rem', borderRadius: '8px' }}
                        onClick={() => { setAddEmailForm({ email: '', name: '', phone: '', city: '', keyword: '' }); setAddEmailModal(true); }}
                      >
                        + Add Email
                      </button>
                      {pendingLeads.length > 0 && (
                        <button
                          className="launch-btn"
                          style={{ width: 'auto', height: 'auto', padding: '6px 14px', fontSize: '0.8rem', borderRadius: '8px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                          disabled={isBulkFinding}
                          onClick={() => handleBulkFindEmails(pendingLeads.map(l => l._id))}
                        >
                          {isBulkFinding ? <><Loader2 size={16} className="animate-spin" /> Searching...</> : <><Search size={16} /> Find Emails ({pendingLeads.length})</>}
                        </button>
                      )}
                      {uniqueEmailLeads.length > 0 && (
                        enricherBulkPicker ? (
                          <select
                            className="pro-select"
                            autoFocus
                            style={{ appearance: 'none', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 25px 6px 12px', fontSize: '0.8rem' }}
                            onChange={(e) => {
                              const tplId = e.target.value;
                              setEnricherBulkPicker(false);
                              if (!tplId) return;
                              if (!emailUser || !emailPass) return showToast('SMTP credentials missing — Campaign tab pe set karo!', 'error');
                              const stepMap = {
                                step1: { name: 'Sequence: Step 1', subject, body: body1 },
                                step2: { name: 'Sequence: Step 2', subject, body: body2 },
                                step3: { name: 'Sequence: Step 3', subject, body: body3 }
                              };
                              const isStep = !!stepMap[tplId];
                              const tplName = isStep ? stepMap[tplId].name : (customTemplates.find(t => t._id === tplId)?.name || 'template');
                              setConfirmModal({
                                open: true,
                                title: `Send "${tplName}" to all ${uniqueEmailLeads.length} emails?`,
                                onConfirm: async () => {
                                  setIsEnricherSending(true);
                                  try {
                                    const payload = {
                                      leadIds: uniqueEmailLeads.map(l => l._id),
                                      emailUser, emailPass, customVars: {}
                                    };
                                    if (isStep) payload.template = { subject: stepMap[tplId].subject, body: stepMap[tplId].body };
                                    else payload.templateId = tplId;
                                    const res = await axios.post('/api/enricher-send', payload);
                                    showToast(res.data.message, 'success');
                                    fetchSavedLeads();
                                  } catch (err) {
                                    showToast('Send failed: ' + (err.response?.data?.error || err.message), 'error');
                                  } finally { setIsEnricherSending(false); }
                                }
                              });
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
                          </select>
                        ) : (
                          <button
                            className="launch-btn"
                            style={{ width: 'auto', height: 'auto', padding: '6px 14px', fontSize: '0.8rem', borderRadius: '8px', background: 'linear-gradient(135deg,#10b981,#059669)' }}
                            disabled={isEnricherSending}
                            onClick={() => setEnricherBulkPicker(true)}
                          >
                            {isEnricherSending ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <><Mail size={16} /> Send All ({uniqueEmailLeads.length})</>}
                          </button>
                        )
                      )}
                      {uniqueEmailLeads.length > 0 && (
                        <button
                          className={enricherEditMode ? 'launch-btn' : 'glass-btn'}
                          style={{ width: 'auto', height: 'auto', padding: '6px 14px', fontSize: '0.8rem', borderRadius: '8px' }}
                          onClick={() => { setEnricherEditMode(m => !m); if (enricherEditMode) setSelectedIds([]); }}
                        >
                          {enricherEditMode ? 'Done' : 'Edit'}
                        </button>
                      )}
                      <button className="glass-btn" onClick={fetchSavedLeads} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Refresh</button>
                    </div>
                  </div>
                  {(isBulkFinding || emailFindLog) && (
                    <div style={{ margin: '1rem 1.5rem 0', padding: '10px 16px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', fontSize: '0.8rem', color: '#6366f1' }}>
                      {isBulkFinding && <Loader2 size={14} className="animate-spin" style={{ display: 'inline', marginRight: '6px' }} />}{emailFindLog || 'Starting...'}
                    </div>
                  )}
                  {enricherEditMode && selectedIds.length > 0 && uniqueEmailLeads.some(l => selectedIds.includes(l._id)) && (
                    <div className="bulk-bar">
                      <div className="bulk-info"><InfoIcon /> {selectedIds.filter(id => uniqueEmailLeads.some(l => l._id === id)).length} emails selected</div>
                      <div className="bulk-actions">
                        <button
                          className="bulk-btn"
                          style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontWeight: 600 }}
                          disabled={isEnricherSending}
                          onClick={() => {
                            const ids = selectedIds.filter(id => uniqueEmailLeads.some(l => l._id === id));
                            if (!emailUser || !emailPass) return showToast('SMTP credentials missing — Campaign tab pe set karo!', 'error');
                            if (!subject || !body1) return showToast('Campaign subject & Step 1 body missing — Campaign tab pe set karo!', 'error');
                            setConfirmModal({
                              open: true,
                              title: `Start 3-step Email Marketing for ${ids.length} selected emails? (Will use Campaign tab's subject + Step 1/2/3 bodies, tracked in Delivery Logs)`,
                              onConfirm: async () => {
                                setIsEnricherSending(true);
                                try {
                                  const res = await axios.post('/api/enricher-enroll', {
                                    leadIds: ids, emailUser, emailPass, subject, body1, body2, body3
                                  });
                                  showToast(res.data.message, 'success');
                                  setSelectedIds([]);
                                  setEnricherEditMode(false);
                                  fetchSavedLeads();
                                  fetchRecipients();
                                  fetchStats();
                                } catch (err) {
                                  showToast('Enroll failed: ' + (err.response?.data?.error || err.message), 'error');
                                } finally { setIsEnricherSending(false); }
                              }
                            });
                          }}
                        >
                          {isEnricherSending ? <><Loader2 size={14} className="animate-spin" style={{ display: 'inline', marginRight: '4px' }} /> Starting...</> : <><Rocket size={14} /> Start Email Marketing (3-Step Auto)</>}
                        </button>
                        <select
                          className="pro-select"
                          style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                          onChange={(e) => {
                            const tplId = e.target.value;
                            e.target.value = '';
                            if (!tplId) return;
                            if (!emailUser || !emailPass) return showToast('SMTP credentials missing — Campaign tab pe set karo!', 'error');
                            const ids = selectedIds.filter(id => uniqueEmailLeads.some(l => l._id === id));
                            const stepMap = {
                              step1: { name: 'Sequence: Step 1', subject, body: body1 },
                              step2: { name: 'Sequence: Step 2', subject, body: body2 },
                              step3: { name: 'Sequence: Step 3', subject, body: body3 }
                            };
                            const isStep = !!stepMap[tplId];
                            const tplName = isStep ? stepMap[tplId].name : (customTemplates.find(t => t._id === tplId)?.name || 'template');
                            setConfirmModal({
                              open: true,
                              title: `Send "${tplName}" to ${ids.length} selected emails?`,
                              onConfirm: async () => {
                                setIsEnricherSending(true);
                                try {
                                  const payload = { leadIds: ids, emailUser, emailPass, customVars: {} };
                                  if (isStep) payload.template = { subject: stepMap[tplId].subject, body: stepMap[tplId].body };
                                  else payload.templateId = tplId;
                                  const res = await axios.post('/api/enricher-send', payload);
                                  showToast(res.data.message, 'success');
                                  setSelectedIds([]);
                                  fetchSavedLeads();
                                } catch (err) {
                                  showToast('Send failed: ' + (err.response?.data?.error || err.message), 'error');
                                } finally { setIsEnricherSending(false); }
                              }
                            });
                          }}
                        >
                          <option value="" style={{ color: 'var(--bg-dark)' }}>Bulk Send Template...</option>
                          <optgroup label="Auto Sequence" style={{ color: 'var(--bg-dark)' }}>
                            <option value="step1">Sequence: Step 1 (Intro)</option>
                            <option value="step2">Sequence: Step 2 (Follow-up)</option>
                            <option value="step3">Sequence: Step 3 (Final)</option>
                          </optgroup>
                          <optgroup label="Custom Templates" style={{ color: 'var(--bg-dark)' }}>
                            {customTemplates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                          </optgroup>
                        </select>
                        <button className="bulk-btn" style={{ backgroundColor: 'var(--danger)' }} onClick={() => setSelectedIds([])}>Cancel</button>
                      </div>
                    </div>
                  )}
                  {isLoadingSavedLeads ? (
                    <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</p>
                  ) : uniqueEmailLeads.length === 0 ? (
                    <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No emails enriched yet. Use "Find Emails" above to start enriching scraped leads.</p>
                  ) : (
                    <div style={{ overflowX: 'auto', width: '100%' }}>
                      <table className="pro-table" style={{ minWidth: '950px' }}>
                        <thead>
                          <tr>
                            {enricherEditMode && (
                              <th style={{ width: '40px' }}>
                                <input
                                  type="checkbox"
                                  checked={uniqueEmailLeads.length > 0 && uniqueEmailLeads.every(l => selectedIds.includes(l._id))}
                                  onChange={() => {
                                    const allSelected = uniqueEmailLeads.every(l => selectedIds.includes(l._id));
                                    if (allSelected) setSelectedIds(prev => prev.filter(id => !uniqueEmailLeads.some(l => l._id === id)));
                                    else setSelectedIds(prev => [...new Set([...prev, ...uniqueEmailLeads.map(l => l._id)])]);
                                  }}
                                />
                              </th>
                            )}
                            <th style={{ width: '50px' }}>#</th>
                            <th style={{ minWidth: '220px' }}><Mail size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Email</th>
                            <th style={{ minWidth: '160px' }}>Business</th>
                            <th style={{ minWidth: '120px' }}>Phone</th>
                            <th style={{ minWidth: '90px' }}>Source</th>
                            <th style={{ minWidth: '120px' }}>Location</th>
                            <th style={{ minWidth: '230px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uniqueEmailLeads.map((lead, idx) => {
                            const recipient = recipientByEmail[lead.email.trim().toLowerCase()];
                            const autoActive = recipient && isAutoActive(recipient.status);
                            const rowClass = (enricherEditMode && selectedIds.includes(lead._id)) ? 'row-selected' : '';
                            const rowStyle = autoActive ? { background: 'rgba(16, 185, 129, 0.08)' } : (recipient ? { background: 'rgba(99, 102, 241, 0.05)' } : {});
                            return (
                              <tr key={lead._id} className={rowClass} style={rowStyle}>
                                {enricherEditMode && (
                                  <td>
                                    <input
                                      type="checkbox"
                                      checked={selectedIds.includes(lead._id)}
                                      onChange={() => toggleSelectOne(lead._id)}
                                    />
                                  </td>
                                )}
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{idx + 1}</td>
                                <td>
                                  {inlineEditLeadId === lead._id ? (
                                    <input
                                      className="pro-input"
                                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: '100%' }}
                                      value={inlineEditData.email || ''}
                                      onChange={e => setInlineEditData({ ...inlineEditData, email: e.target.value })}
                                    />
                                  ) : recipient ? (
                                    <span
                                      onClick={() => setIntelLead(recipient)}
                                      style={{ color: autoActive ? '#10b981' : '#6366f1', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                      title="Click to view delivery logs"
                                    >
                                      <Mail size={14} /> {lead.email}
                                      {autoActive && (
                                        <span style={{ marginLeft: '6px', padding: '2px 8px', background: '#10b981', color: 'white', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 700 }}>
                                          AUTO • Step {recipient.step}
                                        </span>
                                      )}
                                      {!autoActive && recipient && (
                                        <span style={{ marginLeft: '6px', padding: '2px 8px', background: 'var(--text-muted)', color: 'white', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 700 }}>
                                          {(recipient.status || '').toUpperCase()}
                                        </span>
                                      )}
                                    </span>
                                  ) : (
                                    <a href={`mailto:${lead.email}`} style={{ color: '#6366f1', fontWeight: '600', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {lead.email}</a>
                                  )}
                                </td>
                                <td style={{ fontWeight: '600' }}>
                                  {inlineEditLeadId === lead._id ? (
                                    <input
                                      className="pro-input"
                                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: '100%' }}
                                      value={inlineEditData.name || ''}
                                      onChange={e => setInlineEditData({ ...inlineEditData, name: e.target.value })}
                                    />
                                  ) : lead.name}
                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>{lead.keyword}</div>
                                </td>
                                <td style={{ color: 'var(--success)', fontWeight: '500' }}>
                                  {inlineEditLeadId === lead._id ? (
                                    <input
                                      className="pro-input"
                                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: '100%', color: 'var(--success)' }}
                                      value={inlineEditData.phone || ''}
                                      onChange={e => setInlineEditData({ ...inlineEditData, phone: e.target.value })}
                                    />
                                  ) : (lead.phone || '—')}
                                </td>
                                <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{(() => {
                                  const map = { ig: 'Instagram', instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn', website: 'Website', search_engine: 'Search Engine', google_dork: 'Google Search', google: 'Google' };
                                  const s = (lead.emailSource || '').toLowerCase();
                                  return map[s] || (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—');
                                })()}</td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{lead.city}</td>
                                <td>
                                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    {inlineEditLeadId === lead._id ? (
                                      <>
                                        <button
                                          className="btn-icon"
                                          style={{ borderColor: '#10b981', color: '#10b981', fontSize: '0.78rem' }}
                                          onClick={handleSaveInlineEdit}
                                        >Save</button>
                                        <button
                                          className="btn-icon"
                                          style={{ borderColor: 'var(--text-muted)', color: 'var(--text-muted)', fontSize: '0.78rem' }}
                                          onClick={() => setInlineEditLeadId(null)}
                                        >Cancel</button>
                                      </>
                                    ) : selectedLeadForTpl === lead._id ? (
                                      <select
                                        className="pro-select"
                                        style={{ appearance: 'none', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px 25px 4px 10px', fontSize: '0.8rem' }}
                                        onChange={(e) => {
                                          if (e.target.value) handleSendCustomTemplate(lead._id, e.target.value);
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
                                      <>
                                        <button
                                          className="btn-icon"
                                          style={{ borderColor: '#10b981', color: '#10b981', fontSize: '0.78rem' }}
                                          onClick={() => setSelectedLeadForTpl(lead._id)}
                                          title="Send email"
                                        >Send</button>
                                        <button
                                          className="btn-icon"
                                          style={{ borderColor: '#6366f1', color: '#6366f1', fontSize: '0.78rem' }}
                                          onClick={() => {
                                            setInlineEditLeadId(lead._id);
                                            setInlineEditData({ email: lead.email, name: lead.name, phone: lead.phone });
                                          }}
                                          title="Edit lead"
                                        >Edit</button>
                                      </>
                                    )}
                                    <button
                                      onClick={() => {
                                        setConfirmModal({
                                          open: true,
                                          title: `Delete this lead (${lead.email})?`,
                                          onConfirm: async () => {
                                            try {
                                              await axios.delete(`/api/saved-leads/${lead._id}`);
                                              showToast("Lead Deleted!", "success");
                                              fetchSavedLeads();
                                            } catch (e) {
                                              showToast("Delete failed", "error");
                                            }
                                          }
                                        });
                                      }}
                                      className="btn-icon btn-stop"
                                    >Del</button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}


          {activeTab === 'saved_leads' && (
            <div className="content-area">
              <div className="log-card">
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>Lead Automation CRM</h3>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Centralized vault for all AI-scraped high-intent leads.</p>
                  </div>
                  <div>
                    <button className="glass-btn" onClick={fetchSavedLeads} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Refresh CRM</button>
                  </div>
                </div>
                {isLoadingSavedLeads ? (
                  <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="config-card skeleton-pulse" style={{ height: '180px', border: '1px solid var(--border)' }}></div>
                    ))}
                  </div>
                ) : savedLeads.length === 0 ? (
                  <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No saved leads yet. Go to Lead Scraper to extract some!</p>
                ) : !selectedGroup ? (
                  <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    {Object.entries(savedLeads.reduce((acc, lead) => {
                      const groupName = `${(lead.keyword || 'Unknown').toUpperCase()} in ${(lead.city || 'Unknown').toUpperCase()}`;
                      if (!acc[groupName]) acc[groupName] = [];
                      acc[groupName].push(lead);
                      return acc;
                    }, {})).map(([groupName, leads]) => {
                      const sample = leads[0] || {};
                      return (
                        <div key={groupName} className="config-card" style={{ cursor: 'pointer', textAlign: 'center', border: '1px solid var(--primary)', transition: 'all 0.2s ease', position: 'relative', animation: 'fadeInScale 0.4s ease forwards' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteGroup(sample.keyword, sample.city); }}
                            style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
                            title="Delete Folder"
                          ><X size={14} /></button>
                          <div onClick={() => setSelectedGroup(groupName)}>
                            <div style={{ marginBottom: '1rem', color: 'var(--primary)' }}><FolderIcon /></div>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1rem' }}>{groupName}</h4>
                            <p style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '0.85rem' }}>{leads.length} Target Leads</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button className="btn-icon btn-continue" onClick={() => { setSelectedGroup(null); setSelectedIds([]); }} style={{ fontSize: '0.8rem' }}>← Back</button>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)', flex: 1 }}>{selectedGroup}</span>
                    </div>

                    {(() => {
                      const groupLeads = savedLeads.filter(lead => `${(lead.keyword || 'Unknown').toUpperCase()} in ${(lead.city || 'Unknown').toUpperCase()}` === selectedGroup);
                      const allSelected = groupLeads.length > 0 && groupLeads.every(l => selectedIds.includes(l._id));
                      const someSelected = groupLeads.some(l => selectedIds.includes(l._id));

                      return (
                        <>
                          {someSelected && (
                            <div className="bulk-bar" style={{ margin: '1rem 1.5rem', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', boxShadow: '0 10px 15px -3px rgba(79, 102, 241, 0.3)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '600' }}>
                                <Info size={18} />
                                {selectedIds.filter(id => groupLeads.some(l => l._id === id)).length} leads selected from this folder
                              </div>
                              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <button
                                  className="bulk-btn"
                                  style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}
                                  disabled={isScraperBroadcasting}
                                  onClick={() => {
                                    const selectedLeads = groupLeads.filter(l => selectedIds.includes(l._id) && l.phone && l.phone !== 'N/A');
                                    const phones = selectedLeads.map(l => l.phone.replace(/\D/g, ''));
                                    if (phones.length === 0) return alert('No leads with valid phone numbers selected!');

                                    const activeWaTpl = whatsappTemplates.find(t => t.isActive);
                                    if (!activeWaTpl) return alert("Please activate a WhatsApp template in WhatsApp Settings first!");
                                    if (waStatus !== 'connected') return alert("WhatsApp is not connected!");

                                    setConfirmModal({
                                      open: true,
                                      title: `Send Active WA Msg to ${phones.length} leads?`,
                                      onConfirm: async () => {
                                        setIsScraperBroadcasting(true);
                                        try {
                                          const res = await axios.post('/api/whatsapp/broadcast', {
                                            phones: phones,
                                            message: activeWaTpl.message,
                                            delay: scraperWaDelay * 1000 || 3000
                                          });
                                          alert(`✅ Sent: ${res.data.sent} | ❌ Failed: ${res.data.failed}`);
                                          setSelectedIds([]);

                                          if (res.data.details) {
                                            setWaStatuses(prev => {
                                              const newStats = { ...prev };
                                              res.data.details.forEach(d => {
                                                newStats[d.phone] = d.status;
                                              });
                                              return newStats;
                                            });
                                          }

                                        } catch (err) {
                                          alert('WA Broadcast failed: ' + (err.response?.data?.error || err.message));
                                        } finally { setIsScraperBroadcasting(false); }
                                      }
                                    });
                                  }}
                                >
                                  {isScraperBroadcasting ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <><Phone size={16} /> Send WA Msg</>}
                                </button>
                                <button
                                  className="bulk-btn"
                                  style={{ background: 'white', color: 'var(--primary)', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                  onClick={() => {
                                    const ids = selectedIds.filter(id => groupLeads.some(l => l._id === id && l.email && l.emailFound));
                                    if (ids.length === 0) return showToast('No leads with emails selected!', 'error');
                                    if (!emailUser || !emailPass) return showToast('SMTP credentials missing — Campaign tab pe set karo!', 'error');
                                    if (!subject || !body1) return showToast('Campaign subject & Step 1 body missing — Campaign tab pe set karo!', 'error');

                                    setConfirmModal({
                                      open: true,
                                      title: `Start 3-step Email Automation for ${ids.length} selected leads?`,
                                      onConfirm: async () => {
                                        setIsEnricherSending(true);
                                        try {
                                          const res = await axios.post('/api/enricher-enroll', {
                                            leadIds: ids, emailUser, emailPass, subject, body1, body2, body3
                                          });
                                          showToast(res.data.message, 'success');
                                          setSelectedIds([]);
                                          fetchSavedLeads();
                                          fetchRecipients();
                                          fetchStats();
                                        } catch (err) {
                                          showToast('Enroll failed: ' + (err.response?.data?.error || err.message), 'error');
                                        } finally { setIsEnricherSending(false); }
                                      }
                                    });
                                  }}
                                >
                                  {isEnricherSending ? <><Loader2 size={16} className="animate-spin" /> Starting...</> : <><Rocket size={16} /> Start Automation</>}
                                </button>
                                <button
                                  style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
                                  onClick={() => setSelectedIds([])}
                                >Cancel</button>
                              </div>
                            </div>
                          )}
                          <table className="pro-table">
                            <thead>
                              <tr>
                                <th style={{ width: '50px', textAlign: 'center', paddingLeft: '1.5rem' }}>
                                  <input
                                    type="checkbox"
                                    checked={allSelected}
                                    ref={el => { if (el) el.indeterminated = someSelected && !allSelected; }}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        const newIds = Array.from(new Set([...selectedIds, ...groupLeads.map(l => l._id)]));
                                        setSelectedIds(newIds);
                                      } else {
                                        const idsToKeep = selectedIds.filter(id => !groupLeads.some(l => l._id === id));
                                        setSelectedIds(idsToKeep);
                                      }
                                    }}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                  />
                                </th>
                                <th>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <BusinessIcon size={14} /> Business Name
                                  </div>
                                </th>
                                <th>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ContactIcon size={14} /> Contact / Link
                                  </div>
                                </th>
                                <th>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <LocationIcon size={14} /> Location
                                  </div>
                                </th>
                                <th>Status</th>
                                <th style={{ paddingRight: '1.5rem' }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {groupLeads.map((lead) => (
                                <tr key={lead._id} style={{ borderBottom: '1px solid var(--border)', background: selectedIds.includes(lead._id) ? 'rgba(79, 102, 241, 0.04)' : 'transparent' }}>
                                  <td style={{ textAlign: 'center', paddingLeft: '1.5rem' }}>
                                    <input
                                      type="checkbox"
                                      checked={selectedIds.includes(lead._id)}
                                      onChange={() => {
                                        if (selectedIds.includes(lead._id)) setSelectedIds(selectedIds.filter(id => id !== lead._id));
                                        else setSelectedIds([...selectedIds, lead._id]);
                                      }}
                                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                    />
                                  </td>
                                  <td style={{ padding: '1.25rem 1.5rem' }}>
                                    {inlineEditLeadId === lead._id ? (
                                      <input className="pro-input" style={{ padding: '4px 8px', fontSize: '0.8rem', width: '100%' }} value={inlineEditData.name || ''} onChange={e => setInlineEditData({ ...inlineEditData, name: e.target.value })} />
                                    ) : (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.95rem' }}>{lead.name}</span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'rgba(79, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '4px', width: 'fit-content', fontWeight: '600', textTransform: 'uppercase' }}>{lead.keyword || 'Lead'}</span>
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ padding: '1.25rem 1.5rem' }}>
                                    {inlineEditLeadId === lead._id ? (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <input className="pro-input" style={{ padding: '4px 8px', fontSize: '0.8rem', width: '100%' }} placeholder="Phone" value={inlineEditData.phone || ''} onChange={e => setInlineEditData({ ...inlineEditData, phone: e.target.value })} />
                                        <input className="pro-input" style={{ padding: '4px 8px', fontSize: '0.8rem', width: '100%' }} placeholder="Email" value={inlineEditData.email || ''} onChange={e => setInlineEditData({ ...inlineEditData, email: e.target.value })} />
                                      </div>
                                    ) : (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {lead.phone && lead.phone !== 'N/A' ? (
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {(() => {
                                              const cleanP = lead.phone.replace(/\D/g, '');
                                              const stat = waStatuses[cleanP];
                                              const waStatusColor = stat === 'failed' ? '#ef4444' : stat === 'sent' ? '#eab308' : 'var(--success)';
                                              return (
                                                <span style={{ color: waStatusColor, fontWeight: '600', fontSize: '0.9rem' }}>{lead.phone}</span>
                                              );
                                            })()}
                                            <button
                                              onClick={() => {
                                                const activeTpl = whatsappTemplates.find(t => t.isActive);
                                                const cleanPhone = lead.phone.replace(/\D/g, '');
                                                let msg = activeTpl ? activeTpl.message : '';
                                                setWaModal({ open: true, phone: cleanPhone, message: msg });
                                              }}
                                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', padding: '2px' }}
                                              title="Send WhatsApp Message"
                                            ><MessageSquare size={16} /></button>
                                          </div>
                                        ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>}

                                        {lead.emailFound ? (
                                          <a href={`mailto:${lead.email}`} style={{ color: 'var(--primary)', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                                            <Mail size={12} /> {lead.email}
                                          </a>
                                        ) : lead.email ? (
                                          <a href={`mailto:${lead.email}`} style={{ color: 'var(--primary)', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                                            <Mail size={12} /> {lead.email}
                                          </a>
                                        ) : null}
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                      <span style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: '500' }}>{lead.city || 'Unknown'}</span>
                                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{lead.address && lead.address !== 'N/A' ? lead.address : 'Address not found'}</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <button
                                      onClick={async () => { await axios.put(`/api/saved-leads/${lead._id}/contacted`); fetchSavedLeads(); }}
                                      className={`status-badge ${lead.isContacted ? 'status-sent' : 'status-pending'}`}
                                      style={{ cursor: 'pointer', border: 'none', padding: '6px 12px', borderRadius: '20px', fontWeight: '600', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                    >
                                      {lead.isContacted ? <><Check size={14} /> Contacted</> : <><Clock size={14} /> Pending</>}
                                    </button>
                                  </td>
                                  <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                      {inlineEditLeadId === lead._id ? (
                                        <>
                                          <button className="btn-icon" style={{ borderColor: 'var(--success)', color: 'var(--success)', fontSize: '0.75rem' }} onClick={handleSaveInlineEdit}>Save</button>
                                          <button className="btn-icon" style={{ borderColor: 'var(--text-muted)', color: 'var(--text-muted)', fontSize: '0.75rem' }} onClick={() => setInlineEditLeadId(null)}>Cancel</button>
                                        </>
                                      ) : (
                                        <>
                                          <button className="btn-icon" style={{ borderColor: 'var(--primary)', color: 'var(--primary)', fontSize: '0.75rem', padding: '6px 12px' }} onClick={() => { setInlineEditLeadId(lead._id); setInlineEditData({ name: lead.name, phone: lead.phone, email: lead.email, address: lead.address, city: lead.city }); }}>Edit</button>
                                          {lead.mapsLink && (
                                            <a href={lead.mapsLink} target="_blank" rel="noreferrer" className="btn-icon" style={{ borderColor: 'var(--warning)', color: 'var(--warning)', textDecoration: 'none', fontSize: '0.75rem', padding: '6px 12px' }}>Map</a>
                                          )}
                                          <button
                                            onClick={() => {
                                              setConfirmModal({
                                                open: true,
                                                title: `Delete ${lead.name}?`,
                                                onConfirm: async () => {
                                                  await axios.delete(`/api/saved-leads/${lead._id}`);
                                                  fetchSavedLeads();
                                                }
                                              });
                                            }}
                                            className="btn-icon"
                                            style={{ borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: '0.75rem', padding: '6px 12px' }}
                                          >Del</button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
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

      {/* WhatsApp Send Modal */}
      {waModal.open && (
        <div className="modal-overlay" style={{ zIndex: 9998 }}>
          <div className="log-card" style={{ maxWidth: '520px', width: '100%', padding: '2rem', animation: 'slideIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={22} style={{ color: '#25D366' }} /> Send WhatsApp Message
              </h3>
              <button onClick={() => setWaModal({ open: false, phone: '', message: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              📱 To: <strong>+{waModal.phone}</strong>
            </p>

            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Your Active Message</label>
              <textarea
                id="wa-msg-textarea"
                readOnly
                value={waModal.message}
                style={{
                  width: '100%', height: '180px', padding: '14px', borderRadius: '12px',
                  border: '2px solid #25D366', background: '#f0fdf4', color: '#1a1a1a',
                  fontSize: '0.9rem', lineHeight: '1.6', resize: 'none', boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
                onClick={e => e.target.select()}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={copyWaMessage}
                style={{
                  flex: 1, padding: '13px', borderRadius: '10px', border: '2px solid #25D366',
                  background: 'white', color: '#25D366', fontWeight: '700', fontSize: '0.95rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                📋 Copy Message
              </button>
              <button
                onClick={() => {
                  const encodedMsg = encodeURIComponent(waModal.message);
                  window.open(`https://web.whatsapp.com/send?phone=${waModal.phone}&text=${encodedMsg}`, '_blank');
                }}
                style={{
                  flex: 1, padding: '13px', borderRadius: '10px', border: 'none',
                  background: '#25D366', color: 'white', fontWeight: '700', fontSize: '0.95rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <Phone size={18} /> Open WhatsApp
              </button>
            </div>

            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '1rem' }}>
              Tip: Click <strong>Copy Message</strong> first, then <strong>Open WhatsApp</strong> and paste with Ctrl+V
            </p>
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

      {addEmailModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Email Manually</h3>
              <button className="btn-close" onClick={() => !isAddingEmail && setAddEmailModal(false)}><CloseIcon /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Add a contact directly to the Email Enricher list. Email is required, others optional.
              </p>
              <div className="field">
                <label>Email <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  type="email"
                  value={addEmailForm.email}
                  onChange={e => setAddEmailForm({ ...addEmailForm, email: e.target.value })}
                  placeholder="contact@business.com"
                  autoFocus
                />
              </div>
              <div className="field">
                <label>Business / Name</label>
                <input
                  type="text"
                  value={addEmailForm.name}
                  onChange={e => setAddEmailForm({ ...addEmailForm, name: e.target.value })}
                  placeholder="Acme Corp"
                />
              </div>
              <div className="field">
                <label>Phone</label>
                <input
                  type="text"
                  value={addEmailForm.phone}
                  onChange={e => setAddEmailForm({ ...addEmailForm, phone: e.target.value })}
                  placeholder="+1 555 1234"
                />
              </div>
              <div className="field">
                <label>City</label>
                <input
                  type="text"
                  value={addEmailForm.city}
                  onChange={e => setAddEmailForm({ ...addEmailForm, city: e.target.value })}
                  placeholder="New York"
                />
              </div>
              <div className="field">
                <label>Category / Keyword</label>
                <input
                  type="text"
                  value={addEmailForm.keyword}
                  onChange={e => setAddEmailForm({ ...addEmailForm, keyword: e.target.value })}
                  placeholder="Plumber, Restaurant, etc."
                />
              </div>
            </div>
            <div className="modal-footer" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button
                className="launch-btn"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                disabled={isAddingEmail || !addEmailForm.email.trim()}
                onClick={async () => {
                  setIsAddingEmail(true);
                  try {
                    await axios.post('/api/saved-leads/manual', addEmailForm);
                    showToast('Email added!', 'success');
                    setAddEmailModal(false);
                    fetchSavedLeads();
                  } catch (e) {
                    showToast(e.response?.data?.error || 'Add failed', 'error');
                  } finally { setIsAddingEmail(false); }
                }}
              >
                {isAddingEmail ? <><Loader2 size={16} className="animate-spin" /> Adding...</> : <>Add Email <RocketIcon /></>}
              </button>
              <button
                className="launch-btn"
                style={{ flex: 1, backgroundColor: 'var(--bg-dark)' }}
                disabled={isAddingEmail}
                onClick={() => setAddEmailModal(false)}
              >Cancel</button>
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
      {viewReplyModal.open && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3>Replies from {viewReplyModal.lead?.email}</h3>
              <button className="close-btn" onClick={() => setViewReplyModal({ open: false, lead: null })}>&times;</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {(viewReplyModal.lead?.replies || []).length > 0 ? (
                viewReplyModal.lead.replies.map((reply, idx) => (
                  <div key={idx} style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                      <div style={{ fontWeight: '700', fontSize: '1rem' }}>Subject: {reply.subject}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Received: {new Date(reply.receivedAt).toLocaleString()}</div>
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text)' }}>
                      {reply.body}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No reply content found.
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ marginTop: '2rem', textAlign: 'right' }}>
              <button className="bulk-btn" onClick={() => setViewReplyModal({ open: false, lead: null })}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
