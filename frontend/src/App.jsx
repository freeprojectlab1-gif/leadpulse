import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import LandingPage from './LandingPage';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Textarea, Label, Badge, Separator, Progress, Switch, Tabs, TabsList, TabsTrigger, TabsContent, Dialog, DialogContent, DialogHeader, DialogTitle, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Avatar, AvatarFallback, AvatarImage, Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, Checkbox } from '@/components/ui';
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
  CheckCheck,
  TrendingUp,
  UploadCloud,
  Plus,
  ArrowRight,
  Shield,
  Camera,
  Database,
  RefreshCw,
  ChevronLeft,
  AlertCircle,
  PenTool,
  Copy,
  Sun,
  Moon,
  Upload,
  MessageCircle,
  Smartphone,
  Activity,
  Hash,
  Brackets,
  Zap,
  MousePointer2
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
const WhatsAppIcon = ({ size = 18, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.264 8.264 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.85.83-.85 2.02c0 1.19.87 2.33.99 2.49c.12.17 1.71 2.62 4.14 3.67c.58.25 1.02.4 1.38.51c.58.18 1.11.16 1.53.1c.46-.07 1.47-.6 1.67-1.17c.21-.58.21-1.07.14-1.17s-.22-.15-.47-.27" />
  </svg>
);

const StatusBadge = ({ status }) => {
  const s = status.toLowerCase();
  const Icon = s.includes('step') || s === 'sent' || s === 'finished' ? SuccessIcon : s === 'replied' ? MailIcon : s === 'stopped' ? ErrorIcon : InfoIcon;
  return (
    <span className={`status-badge status-${s.replace(/ /g, '-')}`}>
      <Icon /> {status}
    </span>
  );
};

const BRAND_NAME = 'LeadPulse';
const BRAND_SUBTITLE = 'Social Lead Generation & Outreach';
const PAGE_TITLES = {
  dashboard: 'Dashboard',
  campaign: 'Campaign Studio',
  template: 'Email Templates',
  custom_templates: 'Custom Folders',
  whatsapp_settings: 'WhatsApp Settings',
  whatsapp_linker: 'WhatsApp Linker',
  whatsapp_inbox: 'WhatsApp Inbox',
  variables: 'Variables',
  logs: 'Delivery Logs',
  replied_leads: 'Email Replies',
  scraper: 'Lead Scraper',
  map_finder: 'Maps Finder',
  email_finder: 'Enrichment',
  mobile_finder: 'Mobile Enricher',
  saved_leads: 'Automation CRM',
  archive: 'Archive',
  profile: 'Profile',
  security: 'Security',
  team_management: 'Team Management',
  team_access: 'Access Control',
};

const ACCESS_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, locked: true },
      { id: 'campaign', label: 'New Campaign', icon: Rocket },
      { id: 'logs', label: 'Delivery Logs', icon: Activity },
    ],
  },
  {
    label: 'Lead Generation',
    items: [
      { id: 'scraper', label: 'Lead Scraper', icon: Globe },
      { id: 'map_finder', label: 'Map Finder', icon: MapPin },
      { id: 'email_finder', label: 'Email Enricher', icon: Mail },
      { id: 'mobile_finder', label: 'Mobile Enricher', icon: Smartphone },
      { id: 'saved_leads', label: 'Automation CRM', icon: Database },
    ],
  },
  {
    label: 'Inbox & Templates',
    items: [
      { id: 'replied_leads', label: 'Email Replies', icon: Reply },
      { id: 'whatsapp_inbox', label: 'WhatsApp Inbox', icon: WhatsAppIcon },
      { id: 'template', label: 'Email Templates', icon: FileText },
      { id: 'custom_templates', label: 'Custom Folders', icon: Folder },
      { id: 'variables', label: 'Variable Manager', icon: Hash },
    ],
  },
  {
    label: 'Integrations',
    items: [
      { id: 'whatsapp_settings', label: 'WhatsApp Settings', icon: WhatsAppIcon },
      { id: 'whatsapp_linker', label: 'WhatsApp Linker', icon: WhatsAppIcon },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'archive', label: 'Archive', icon: ArchiveIcon },
    ],
  },
];
const ACCESS_TABS = ACCESS_SECTIONS.flatMap(section => section.items);
const ACCESS_TAB_IDS = ACCESS_TABS.map(item => item.id);
const MEMBER_DEFAULT_ACCESS = ACCESS_TAB_IDS.reduce((acc, key) => {
  acc[key] = key === 'dashboard';
  return acc;
}, {});
const FULL_ACCESS = ACCESS_TAB_IDS.reduce((acc, key) => {
  acc[key] = true;
  return acc;
}, {});

const BACKEND_ORIGIN = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const AUTH_TOKEN_KEY = 'leadpulse_auth_token';
const AUTH_USER_KEY = 'leadpulse_auth_user';

const getStoredAuthUser = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || 'null');
  } catch (e) {
    return null;
  }
};

const setAxiosAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
};

const normalizeAccess = (access = {}, fallback = {}) => {
  const raw = access && typeof access.toJSON === 'function' ? access.toJSON() : access;
  const source = raw && typeof raw === 'object' ? raw : {};
  const output = {};
  ACCESS_TAB_IDS.forEach((id) => {
    if (source[id] !== undefined) {
      output[id] = !!source[id];
    } else if (fallback[id] !== undefined) {
      output[id] = !!fallback[id];
    }
  });
  return output;
};

const getResolvedAccess = (user) => {
  if (!user) return {};
  if (user.role === 'admin') return { ...FULL_ACCESS };
  return normalizeAccess(user.access, MEMBER_DEFAULT_ACCESS);
};

const postApiWithFallback = async (url, data, config = {}) => {
  try {
    return await axios.post(url, data, config);
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404 && url.startsWith('/api/')) {
      const fallbackUrl = new URL(url, BACKEND_ORIGIN).toString();
      return axios.post(fallbackUrl, data, config);
    }
    throw err;
  }
};

// ==================== WhatsApp Inbox Tab ====================
const WhatsAppInboxTab = ({ waStatus, savedLeads = [], onRefreshSavedLeads }) => {
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
  const [sendError, setSendError] = useState('');
  const normalizePhone = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
    if (digits.length === 12 && digits.startsWith('91')) return digits;
    return digits.slice(-12);
  };

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
    setSendError('');
    try {
      await axios.post('/api/whatsapp/send', { phone, message: msgInput.trim() });
      setMsgInput('');
      setTimeout(fetchConversations, 1000);
    } catch (e) { setSendError('Failed to send: ' + (e.response?.data?.error || e.message)); }
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
        delay: broadcastDelay * 1000,
        provider: waProvider
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
  const allMobileLeads = (() => {
    const seen = new Set();
    return (Array.isArray(savedLeads) ? savedLeads : [])
      .map(lead => {
        const phone = normalizePhone(lead.phone || lead.data?.Phone || lead.data?.phone || '');
        return { ...lead, _phone: phone };
      })
      .filter(lead => lead._phone && lead._phone.length >= 10)
      .filter(lead => {
        if (seen.has(lead._phone)) return false;
        seen.add(lead._phone);
        return true;
      })
      .filter(lead => {
        const haystack = `${lead.name || ''} ${lead._phone} ${lead.keyword || ''} ${lead.city || ''}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
      });
  })();

  // Premium Palette based on WhatsApp Emerald but adjusted for the current brand
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

          <div style={{
            marginTop: '14px',
            marginBottom: '14px',
            padding: '14px',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            background: 'var(--surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  All Mobile Leads
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  CRM se valid mobile numbers
                </div>
              </div>
              <button
                onClick={() => onRefreshSavedLeads?.()}
                style={{
                  padding: '6px 10px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text-main)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Refresh
              </button>
            </div>

            <div style={{ maxHeight: '220px', overflowY: 'auto', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 2 }}>
                  <tr style={{ textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>Name</th>
                    <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>Mobile</th>
                    <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>State</th>
                  </tr>
                </thead>
                <tbody>
                  {allMobileLeads.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ padding: '18px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No mobile leads found
                      </td>
                    </tr>
                  ) : allMobileLeads.slice(0, 40).map(lead => {
                    const status = String(lead.whatsappStatus || 'pending').toLowerCase();
                    const badgeColor = status === 'sent' ? '#10b981' : status === 'failed' ? '#ef4444' : '#f59e0b';
                    const label = status === 'sent' ? 'Sent' : status === 'failed' ? 'Failed' : 'Pending';
                    return (
                      <tr
                        key={lead._id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => window.open(`https://wa.me/${lead._phone}`, '_blank')}
                        title="Open WhatsApp chat"
                      >
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-main)', fontWeight: 700, maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {lead.name || lead.keyword || 'Unknown'}
                        </td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-main)', fontWeight: 700 }}>
                          +{lead._phone}
                        </td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            background: `${badgeColor}15`,
                            color: badgeColor,
                            fontWeight: 800,
                            fontSize: '0.72rem'
                          }}>
                            {label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
                {sendError && (
                  <div style={{
                    margin: '0 0 10px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.22)',
                    color: '#ef4444',
                    fontSize: '0.85rem',
                    fontWeight: 650
                  }}>
                    {sendError}
                  </div>
                )}
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

const EmailChart = ({ recipients }) => {
  const [filter, setFilter] = useState('daily');
  const [mode, setMode] = useState('overall');
  const [chartType, setChartType] = useState('bar');

  const toStartOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const getDayKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const getMonthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`;
  const getWeekStart = (date) => {
    const d = toStartOfDay(date);
    d.setDate(d.getDate() - d.getDay());
    return d;
  };

  const now = new Date();
  const emailDates = [], waDates = [];
  recipients.forEach(r => {
    if (r.history) r.history.forEach(h => { if (h.sentAt) { const d = new Date(h.sentAt); if (!isNaN(d)) emailDates.push(d); } });
    if (r.whatsappSentAt) { const d = new Date(r.whatsappSentAt); if (!isNaN(d)) waDates.push(d); }
    if (r.replies) r.replies.forEach(rep => { if (rep.type === 'whatsapp' && rep.fromMe && rep.receivedAt) { const d = new Date(rep.receivedAt); if (!isNaN(d)) waDates.push(d); } });
  });

  const buildPoints = (dates) => {
    let pts = [];
    if (filter === 'daily') {
      pts = Array.from({ length: 7 }).map((_, i) => { const d = toStartOfDay(now); d.setDate(d.getDate() - (6 - i)); return { key: getDayKey(d), label: d.toLocaleDateString('en-IN', { weekday: 'short' }), count: 0 }; });
      const m = new Map(pts.map((p, i) => [p.key, i]));
      dates.forEach(d => { const i = m.get(getDayKey(toStartOfDay(d))); if (i !== undefined) pts[i].count++; });
    } else if (filter === 'weekly') {
      const ws = getWeekStart(now);
      pts = Array.from({ length: 4 }).map((_, i) => { const d = new Date(ws); d.setDate(d.getDate() - (3 - i) * 7); return { key: getDayKey(d), label: i === 3 ? 'This Week' : `Wk ${i + 1}`, count: 0 }; });
      const m = new Map(pts.map((p, i) => [p.key, i]));
      dates.forEach(d => { const i = m.get(getDayKey(getWeekStart(d))); if (i !== undefined) pts[i].count++; });
    } else {
      pts = Array.from({ length: 6 }).map((_, i) => { const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1); return { key: getMonthKey(d), label: d.toLocaleDateString('en-IN', { month: 'short' }), count: 0 }; });
      const m = new Map(pts.map((p, i) => [p.key, i]));
      dates.forEach(d => { const i = m.get(getMonthKey(d)); if (i !== undefined) pts[i].count++; });
    }
    return pts;
  };

  const emailPts = buildPoints(emailDates);
  const waPts = buildPoints(waDates);
  const allPts = emailPts.map((p, i) => ({ ...p, count: p.count + (waPts[i]?.count || 0) }));
  const points = mode === 'emails' ? emailPts : mode === 'whatsapp' ? waPts : allPts;
  const counts = points.map(p => p.count);
  const maxCount = Math.max(...counts, 1);
  const totalSent = counts.reduce((s, c) => s + c, 0);
  const peak = Math.max(...counts, 0);

  // SVG dimensions
  const W = 580, H = 200;
  const pad = { t: 20, r: 20, b: 36, l: 32 };
  const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
  const pts2svg = points.map((p, i) => ({
    ...p,
    x: pad.l + (points.length <= 1 ? pw / 2 : (pw / (points.length - 1)) * i),
    y: pad.t + ph - (p.count / maxCount) * ph
  }));

  const linePath = pts2svg.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const smoothPath = pts2svg.reduce((acc, p, i, arr) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + p.x) / 2;
    return acc + ` C${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
  }, '');
  const areaPath = pts2svg.length ? `${smoothPath} L${pts2svg[pts2svg.length - 1].x},${pad.t + ph} L${pts2svg[0].x},${pad.t + ph}Z` : '';

  const emailTotal = emailPts.reduce((s, p) => s + p.count, 0);
  const waTotal = waPts.reduce((s, p) => s + p.count, 0);
  const donutTotal = emailTotal + waTotal || 1;
  const emailAngle = (emailTotal / donutTotal) * 360;
  const cx = 90, cy = 90, r = 65, ri = 42;
  const polarToXY = (angle, radius) => ({ x: cx + radius * Math.cos((angle - 90) * Math.PI / 180), y: cy + radius * Math.sin((angle - 90) * Math.PI / 180) });
  const describeArc = (start, end, outerR, innerR) => {
    const s1 = polarToXY(start, outerR), e1 = polarToXY(end, outerR);
    const s2 = polarToXY(end, innerR), e2 = polarToXY(start, innerR);
    const lg = end - start > 180 ? 1 : 0;
    return `M${s1.x},${s1.y} A${outerR},${outerR} 0 ${lg} 1 ${e1.x},${e1.y} L${s2.x},${s2.y} A${innerR},${innerR} 0 ${lg} 0 ${e2.x},${e2.y} Z`;
  };

  // Heatmap - last 28 days grid
  const heatDays = Array.from({ length: 28 }).map((_, i) => {
    const d = toStartOfDay(now); d.setDate(d.getDate() - (27 - i));
    const key = getDayKey(d);
    const eCount = emailDates.filter(ed => getDayKey(toStartOfDay(ed)) === key).length;
    const wCount = waDates.filter(wd => getDayKey(toStartOfDay(wd)) === key).length;
    return { d, count: eCount + wCount, label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) };
  });
  const maxHeat = Math.max(...heatDays.map(d => d.count), 1);

  const chartTypes = [
    { id: 'bar', label: 'Bar', icon: '▐' },
    { id: 'area', label: 'Area', icon: '◠' },
    { id: 'line', label: 'Line', icon: '╱' },
    { id: 'donut', label: 'Donut', icon: '◎' },
    { id: 'heat', label: 'Heat', icon: '▦' },
  ];

  return (
    <div className="w-full flex flex-col gap-5 p-1">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-black text-foreground">
            {mode === 'emails' ? '📧 Email' : mode === 'whatsapp' ? '📱 WhatsApp' : '📊 Overall'} Delivery Analytics
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{totalSent} total sent • Peak: {peak}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Chart type buttons */}
          <div className="flex rounded-lg border border-border/50 overflow-hidden bg-background/50">
            {chartTypes.map(ct => (
              <button
                key={ct.id}
                onClick={() => setChartType(ct.id)}
                className={`px-3 py-1.5 text-[11px] font-bold transition-all ${chartType === ct.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                title={ct.label}
              >
                <span className="mr-1">{ct.icon}</span>{ct.label}
              </button>
            ))}
          </div>
          {/* Mode & Filter - hide for donut/heat */}
          {!['donut', 'heat'].includes(chartType) && (
            <>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger className="w-[110px] h-8 text-[11px] bg-background/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overall">Overall</SelectItem>
                  <SelectItem value="emails">Emails</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[100px] h-8 text-[11px] bg-background/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </div>

      {/* ── BAR CHART ── */}
      {chartType === 'bar' && (
        <div className="relative w-full h-[320px] bg-gradient-to-b from-muted/10 to-transparent rounded-2xl border border-border/40 p-4 flex items-end justify-between gap-2">
          {[0.25, 0.5, 0.75, 1].map(ratio => (
            <div key={ratio} className="absolute left-4 right-4 h-px bg-border/30" style={{ bottom: `${ratio * 80 + 12}%` }}>
              <span className="absolute -top-3 -left-1 text-[9px] text-muted-foreground/60">{Math.round(maxCount * ratio)}</span>
            </div>
          ))}
          {points.map((p) => {
            const h = maxCount > 0 ? (p.count / maxCount) * 100 : 0;
            const isPeak = p.count === peak && p.count > 0;
            return (
              <div key={p.key} className="relative flex flex-col items-center justify-end h-full flex-1 group cursor-default">
                <div className="absolute -top-1 opacity-0 group-hover:opacity-100 transition-all bg-primary text-primary-foreground text-[10px] font-black py-0.5 px-2 rounded-full shadow-lg z-20 pointer-events-none whitespace-nowrap">
                  {p.count} sent
                </div>
                <div className="w-full px-1 flex justify-center items-end h-[85%]">
                  <div
                    className={`w-full max-w-[48px] rounded-t-lg transition-all duration-700 ease-out relative overflow-hidden ${isPeak ? 'bg-primary shadow-[0_0_20px_rgba(66,120,244,0.6)]' : 'bg-primary/30 group-hover:bg-primary/60'}`}
                    style={{ height: `${Math.max(h, 2)}%` }}
                  >
                    {isPeak && <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />}
                    {isPeak && <div className="absolute inset-x-0 top-0 h-0.5 bg-white/60" />}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold mt-2">{p.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── AREA / LINE CHART ── */}
      {(chartType === 'area' || chartType === 'line') && (
        <div className="w-full rounded-2xl border border-border/40 bg-gradient-to-b from-muted/10 to-transparent overflow-hidden">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: '320px' }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4278f4" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#4278f4" stopOpacity="0.01" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Grid */}
            {[0.25, 0.5, 0.75, 1].map(r => (
              <g key={r}>
                <line x1={pad.l} y1={pad.t + ph - r * ph} x2={pad.l + pw} y2={pad.t + ph - r * ph} stroke="currentColor" strokeOpacity="0.07" strokeWidth="1" strokeDasharray="4 4" />
                <text x={pad.l - 4} y={pad.t + ph - r * ph + 4} textAnchor="end" fontSize="9" fill="currentColor" fillOpacity="0.4">{Math.round(maxCount * r)}</text>
              </g>
            ))}
            {/* Area fill */}
            {chartType === 'area' && <path d={areaPath} fill="url(#areaGrad)" />}
            {/* Line */}
            <path d={smoothPath} fill="none" stroke="#4278f4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
            {/* Dots */}
            {pts2svg.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="5" fill="#4278f4" opacity="0.2" />
                <circle cx={p.x} cy={p.y} r="3.5" fill="#4278f4" />
                <circle cx={p.x} cy={p.y} r="1.5" fill="white" />
                <text x={p.x} y={pad.t + ph + 22} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity="0.5">{p.label}</text>
                {p.count > 0 && <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="9" fill="#4278f4" fontWeight="bold">{p.count}</text>}
              </g>
            ))}
            {/* Baseline */}
            <line x1={pad.l} y1={pad.t + ph} x2={pad.l + pw} y2={pad.t + ph} stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />
          </svg>
        </div>
      )}

      {/* ── DONUT CHART ── */}
      {chartType === 'donut' && (
        <div className="flex flex-col sm:flex-row items-center gap-8 p-6 rounded-2xl border border-border/40 bg-gradient-to-br from-muted/10 to-transparent min-h-[240px]">
          <svg width="180" height="180" viewBox="0 0 180 180" className="shrink-0">
            <defs>
              <filter id="dshadow"><feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#4278f4" floodOpacity="0.3" /></filter>
            </defs>
            {donutTotal > 1 ? (
              <>
                <path d={describeArc(0, emailAngle, r, ri)} fill="#4278f4" filter="url(#dshadow)" />
                <path d={describeArc(emailAngle, 360, r, ri)} fill="#10b981" filter="url(#dshadow)" />
              </>
            ) : (
              <>
                <circle cx={cx} cy={cy} r={r} fill="#4278f4" opacity="0.2" />
                <circle cx={cx} cy={cy} r={ri} fill="none" stroke="#4278f4" strokeWidth="1" strokeDasharray="4 4" />
              </>
            )}
            <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fontWeight="900" fill="currentColor">{donutTotal}</text>
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.5" fontWeight="bold">TOTAL</text>
          </svg>
          <div className="flex flex-col gap-5 flex-1">
            <div>
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">All-Time Distribution</div>
              <div className="text-2xl font-black text-foreground">{donutTotal} Messages Sent</div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Email Sent', count: emailTotal, color: '#4278f4', bg: 'bg-primary/10' },
                { label: 'WhatsApp Sent', count: waTotal, color: '#10b981', bg: 'bg-emerald-500/10' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">{item.label}</span>
                      <span className="text-xs font-black" style={{ color: item.color }}>{item.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(item.count / donutTotal) * 100}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Email Rate', val: donutTotal > 0 ? `${Math.round((emailTotal / donutTotal) * 100)}%` : '0%' },
                { label: 'WA Rate', val: donutTotal > 0 ? `${Math.round((waTotal / donutTotal) * 100)}%` : '0%' },
              ].map(s => (
                <div key={s.label} className="bg-muted/30 rounded-xl p-3 border border-border/30">
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{s.label}</div>
                  <div className="text-xl font-black text-foreground">{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── HEATMAP (last 28 days) ── */}
      {chartType === 'heat' && (
        <div className="rounded-2xl border border-border/40 bg-gradient-to-b from-muted/10 to-transparent p-6">
          <div className="text-xs text-muted-foreground font-bold mb-4 uppercase tracking-widest">Activity Heatmap — Last 28 Days</div>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-[9px] text-muted-foreground font-bold text-center uppercase">{d}</div>
            ))}
            {heatDays.map((d, i) => {
              const intensity = d.count / maxHeat;
              const opacity = d.count === 0 ? 0.07 : 0.15 + intensity * 0.85;
              return (
                <div
                  key={i}
                  className="aspect-square rounded-md flex items-center justify-center cursor-default relative group transition-transform hover:scale-110"
                  style={{ backgroundColor: `rgba(66,120,244,${opacity})` }}
                  title={`${d.label}: ${d.count} messages`}
                >
                  {d.count > 0 && <span className="text-[9px] font-black text-white/80">{d.count}</span>}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-bold py-1 px-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-border/50 z-10">
                    {d.label}: {d.count}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-4 justify-end">
            <span className="text-[10px] text-muted-foreground">Less</span>
            {[0.07, 0.25, 0.5, 0.75, 1].map(o => (
              <div key={o} className="w-4 h-4 rounded-sm" style={{ backgroundColor: `rgba(66,120,244,${o})` }} />
            ))}
            <span className="text-[10px] text-muted-foreground">More</span>
          </div>
        </div>
      )}
    </div>
  );
};


// ============================================================

const isGenericMapLeadName = (value) => {
  const normalized = String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!normalized) return true;
  return ['business', 'businesses', 'google maps', 'google', 'unknown', 'n/a', 'place'].includes(normalized);
};

const getMapLeadDisplayName = (lead = {}) => {
  const name = String(lead.name || '').trim();
  if (name && !isGenericMapLeadName(name)) return name;
  const fallback = String(lead.category || lead.keyword || lead.city || lead.mapsLink || '').trim();
  return fallback || name || 'Business';
};

const getMapLeadDisplaySubtitle = (lead = {}) => {
  const phone = String(lead.phone || '').trim();
  if (phone && phone !== 'N/A') return phone;
  const address = String(lead.address || '').trim();
  if (address && address !== 'N/A') return address;
  const fallback = String(lead.keyword || lead.category || lead.city || '').trim();
  return fallback || 'Address not found';
};

const MapBusinessFinder = ({
  keyword,
  setKeyword,
  allBusinesses,
  setAllBusinesses,
  selectedLocation,
  setSelectedLocation,
  radiusKm,
  setRadiusKm,
  limit,
  setLimit,
  noWebsiteOnly,
  setNoWebsiteOnly,
  mapCategories,
  categoryAddText,
  setCategoryAddText,
  categoryRemoveText,
  setCategoryRemoveText,
  onAddCategories,
  onRemoveCategories,
  isUpdatingCategories,
  isSearching,
  mapLeads,
  mapStatus,
  onSearch,
  onStop,
  onOpenCrm
}) => {
  const [zoom, setZoom] = useState(14);
  const [locationSearch, setLocationSearch] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mapSearchHistory') || '[]'); } catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);
  const mapRef = React.useRef(null);
  const tileSize = 256;

  const saveToHistory = () => {
    const entry = {
      id: Date.now(),
      keyword: allBusinesses ? 'All Businesses' : keyword,
      location: selectedLocation?.label || `${selectedLocation?.lat?.toFixed(4)}, ${selectedLocation?.lng?.toFixed(4)}`,
      lat: selectedLocation?.lat,
      lng: selectedLocation?.lng,
      radiusKm,
      noWebsiteOnly,
      allBusinesses,
      date: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    };
    const updated = [entry, ...searchHistory.filter(h => h.keyword !== entry.keyword || h.location !== entry.location)].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem('mapSearchHistory', JSON.stringify(updated));
  };

  const loadHistoryEntry = (entry) => {
    if (!allBusinesses && entry.keyword !== 'All Businesses') setKeyword(entry.keyword);
    if (entry.lat && entry.lng) setSelectedLocation({ lat: entry.lat, lng: entry.lng, label: entry.location });
    setRadiusKm(entry.radiusKm);
    setNoWebsiteOnly(entry.noWebsiteOnly);
    setShowHistory(false);
  };

  const deleteHistoryEntry = (id, e) => {
    e.stopPropagation();
    const updated = searchHistory.filter(h => h.id !== id);
    setSearchHistory(updated);
    localStorage.setItem('mapSearchHistory', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('mapSearchHistory');
    setShowHistory(false);
  };

  const latLngToWorld = (lat, lng, z) => {
    const scale = tileSize * 2 ** z;
    const sinLat = Math.sin((lat * Math.PI) / 180);
    return {
      x: ((lng + 180) / 360) * scale,
      y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale
    };
  };

  // Expose saveToHistory so parent can call it before starting search
  React.useEffect(() => {
    window.__mapSaveHistory = saveToHistory;
    return () => { window.__mapSaveHistory = null; };
  });

  const worldToLatLng = (x, y, z) => {
    const scale = tileSize * 2 ** z;
    const lng = (x / scale) * 360 - 180;
    const n = Math.PI - (2 * Math.PI * y) / scale;
    const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    return { lat, lng };
  };

  const centerWorld = latLngToWorld(selectedLocation.lat, selectedLocation.lng, zoom);
  const centerTileX = Math.floor(centerWorld.x / tileSize);
  const centerTileY = Math.floor(centerWorld.y / tileSize);
  const tileOffsetX = centerWorld.x - centerTileX * tileSize;
  const tileOffsetY = centerWorld.y - centerTileY * tileSize;
  const tileRange = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

  const handleMapClick = (e) => {
    const rect = mapRef.current.getBoundingClientRect();
    const x = centerWorld.x + (e.clientX - rect.left - rect.width / 2);
    const y = centerWorld.y + (e.clientY - rect.top - rect.height / 2);
    const next = worldToLatLng(x, y, zoom);
    setSelectedLocation({ lat: Number(next.lat.toFixed(6)), lng: Number(next.lng.toFixed(6)), label: 'Selected map point' });
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSelectedLocation({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
          label: 'Current location'
        });
      },
      () => { },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const geocodeLocation = async () => {
    if (!locationSearch.trim() || isGeocoding) return;
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(locationSearch.trim())}`);
      const data = await res.json();
      if (data?.[0]) {
        setSelectedLocation({
          lat: Number(Number(data[0].lat).toFixed(6)),
          lng: Number(Number(data[0].lon).toFixed(6)),
          label: data[0].display_name
        });
      }
    } catch (_) { }
    setIsGeocoding(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-8 animate-fade-in">
      <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-xl shadow-lg flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/20 flex justify-between items-center">
          <div>
            <Badge variant="outline" className="mb-1 text-primary border-primary/20 bg-primary/5 uppercase text-[10px] tracking-wider">Geo Lead Finder</Badge>
            <h3 className="font-bold text-foreground text-lg">Live Map Scanner</h3>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-600 border-transparent hover:bg-emerald-500/20 shadow-none"><CheckCircle size={14} className="mr-1.5" /> CRM Auto Save</Badge>
        </div>

        <div className="p-4 bg-background/50 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border/50">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-sm font-semibold text-foreground">
              <label>Business Type</label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-normal">
                <input type="checkbox" className="rounded border-border text-primary focus:ring-primary h-3 w-3" checked={allBusinesses} onChange={e => setAllBusinesses(e.target.checked)} />
                <span className="text-muted-foreground">All Businesses</span>
              </label>
            </div>
            <Input
              value={allBusinesses ? '' : keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder={allBusinesses ? 'Scanning every nearby business' : 'e.g. dentists, cafes, gyms'}
              disabled={allBusinesses}
              className="bg-card/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Search Location</label>
            <div className="flex gap-2">
              <Input
                value={locationSearch}
                onChange={e => setLocationSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') geocodeLocation(); }}
                placeholder="Type area, city, landmark..."
                className="bg-card/50 flex-1"
              />
              <Button variant="secondary" size="icon" onClick={geocodeLocation} disabled={isGeocoding} className="shrink-0 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border-none">
                {isGeocoding ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              </Button>
            </div>
          </div>
        </div>

        <div className="relative w-full h-[400px] bg-muted/30 overflow-hidden cursor-crosshair group flex-1" ref={mapRef} onClick={handleMapClick}>
          <div
            className="absolute inset-0 pointer-events-none transition-transform duration-75 ease-linear"
            style={{
              transform: `translate(calc(50% - ${tileOffsetX}px), calc(50% - ${tileOffsetY}px))`
            }}
          >
            {tileRange.flatMap(dx => tileRange.map(dy => {
              const x = centerTileX + dx;
              const y = centerTileY + dy;
              return (
                <img
                  key={`${zoom}-${x}-${y}`}
                  src={`https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`}
                  alt=""
                  draggable="false"
                  className="absolute select-none shadow-[0_0_1px_rgba(0,0,0,0.1)] opacity-70"
                  style={{ width: 256, height: 256, left: `${dx * tileSize}px`, top: `${dy * tileSize}px`, filter: 'var(--map-filter, none)' }}
                />
              );
            }))}
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/40 bg-primary/10 pointer-events-none transition-all duration-300 shadow-[0_0_30px_rgba(66,120,244,0.1)]" style={{ width: `${Math.min(330, 72 + radiusKm * 12)}px`, height: `${Math.min(330, 72 + radiusKm * 12)}px` }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary drop-shadow-md pointer-events-none"><MapPin size={34} fill="currentColor" className="-mt-4" /></div>

          <div className="absolute top-4 right-4 flex flex-col gap-2 shadow-md rounded-lg overflow-hidden bg-background/80 backdrop-blur-md border border-border/50">
            <button type="button" className="w-8 h-8 flex items-center justify-center hover:bg-muted text-foreground font-bold transition-colors border-b border-border/50" onClick={(e) => { e.stopPropagation(); setZoom(Math.min(17, zoom + 1)); }}>+</button>
            <button type="button" className="w-8 h-8 flex items-center justify-center hover:bg-muted text-foreground font-bold transition-colors" onClick={(e) => { e.stopPropagation(); setZoom(Math.max(11, zoom - 1)); }}>-</button>
          </div>

          <Button variant="secondary" size="sm" className="absolute bottom-4 right-4 shadow-md bg-background/80 backdrop-blur-md border border-border/50 font-bold" onClick={(e) => { e.stopPropagation(); useCurrentLocation(); }}>
            <Target size={14} className="mr-1.5" /> Locate Me
          </Button>
        </div>

        <div className="p-3 bg-muted/40 text-xs flex justify-between items-center text-muted-foreground border-t border-border/50">
          <span className="flex items-center gap-1.5 font-medium truncate pr-4 max-w-[60%]"><MapPin size={12} className="text-primary shrink-0" /> {selectedLocation.label}</span>
          <strong className="font-mono">{selectedLocation.lat}, {selectedLocation.lng}</strong>
        </div>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-lg flex flex-col h-full">
        <div className="p-5 border-b border-border/50 bg-muted/20">
          <Badge variant="outline" className="mb-1 text-primary border-primary/20 bg-primary/5 uppercase text-[10px] tracking-wider">Range Setup</Badge>
          <h3 className="font-bold text-foreground text-lg">Scan Settings</h3>
        </div>

        <CardContent className="p-5 flex-1 flex flex-col space-y-6">
          <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex justify-between items-center text-sm font-semibold text-foreground">
              <label>Search Radius</label>
              <strong className="text-primary">{radiusKm} km</strong>
            </div>
            <input type="range" min="1" max="120" value={radiusKm} onChange={e => setRadiusKm(Number(e.target.value))} className="w-full accent-primary" />

          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Max Leads (Limit)</label>
            <Input type="number" min="5" max="200" value={limit} onChange={e => setLimit(Number(e.target.value))} className="bg-card/50" />
          </div>

          <label className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors cursor-pointer bg-background/50">
            <input type="checkbox" className="rounded border-border text-primary focus:ring-primary h-4 w-4" checked={noWebsiteOnly} onChange={e => setNoWebsiteOnly(e.target.checked)} />
            <span className="text-sm font-medium text-foreground">No-website businesses only</span>
          </label>

          <div className="space-y-3 p-4 rounded-xl bg-background/50 border border-border/50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-foreground">Business Category Manager</div>
                <p className="text-xs text-muted-foreground">Add/remove multiple categories from backend without code changes.</p>
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                {mapCategories.length} active
              </Badge>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add Categories</label>
              <Textarea
                value={categoryAddText}
                onChange={e => setCategoryAddText(e.target.value)}
                placeholder={"restaurant\ncafe\nsalon"}
                className="min-h-[74px] bg-card/50 resize-none text-sm"
              />
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs font-bold"
                  disabled={isUpdatingCategories || !categoryAddText.trim()}
                  onClick={onAddCategories}
                >
                  <Plus size={14} className="mr-1.5" /> Add Multiple
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Remove Categories</label>
              <Textarea
                value={categoryRemoveText}
                onChange={e => setCategoryRemoveText(e.target.value)}
                placeholder={"restaurant\ncafe"}
                className="min-h-[74px] bg-card/50 resize-none text-sm"
              />
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  className="text-xs font-bold"
                  disabled={isUpdatingCategories || !categoryRemoveText.trim()}
                  onClick={onRemoveCategories}
                >
                  <X size={14} className="mr-1.5" /> Remove Multiple
                </Button>
              </div>
            </div>

            <div className="max-h-[120px] overflow-y-auto flex flex-wrap gap-2 pr-1">
              {mapCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onRemoveCategories([cat])}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                  title="Click to remove"
                >
                  {cat}
                  <X size={12} />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            {!isSearching ? (
              <Button className="w-full h-12 text-sm font-bold shadow-glow-primary group bg-primary hover:bg-primary/90 text-white transition-all" onClick={onSearch}>
                <Rocket size={18} className="mr-2 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /> Fetch & Save to CRM
              </Button>
            ) : (
              <Button variant="destructive" className="w-full h-12 text-sm font-bold shadow-sm animate-pulse" onClick={onStop}>
                <Square size={18} fill="currentColor" className="mr-2" /> Stop Search
              </Button>
            )}
          </div>

          <div className="mt-4 p-4 rounded-xl bg-muted/40 border border-border/30">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{isSearching ? 'Scanning live map data...' : 'Ready'}</div>
            <p className="text-sm text-foreground/80 leading-relaxed">{mapStatus || 'Select a map point, choose a range, then fetch businesses.'}</p>
          </div>

          {/* ── SEARCH HISTORY ── */}
          <div className="mt-3">
            <button
              onClick={() => setShowHistory(v => !v)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 border border-border/30 hover:bg-muted/60 transition-colors text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-2 font-medium">
                <span>🕐</span> Search History ({searchHistory.length})
              </span>
              <span className="text-xs">{showHistory ? '▲ Hide' : '▼ Show'}</span>
            </button>

            {showHistory && (
              <div className="mt-2 space-y-1 max-h-[220px] overflow-y-auto">
                {searchHistory.length === 0 ? (
                  <p className="text-xs text-center text-muted-foreground py-4">No history yet</p>
                ) : (
                  <>
                    <button onClick={clearHistory} className="w-full text-xs text-red-400 hover:text-red-300 text-right pr-1 pb-1">Clear All</button>
                    {searchHistory.map(entry => (
                      <div
                        key={entry.id}
                        onClick={() => loadHistoryEntry(entry)}
                        className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/40 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group"
                      >
                        <div className="flex flex-col truncate pr-2">
                          <span className="text-sm font-semibold text-foreground truncate">{entry.keyword}</span>
                          <span className="text-xs text-muted-foreground truncate">📍 {entry.location} · {entry.radiusKm}km</span>
                          <span className="text-[10px] text-muted-foreground/60">{entry.date}</span>
                        </div>
                        <button
                          onClick={(e) => deleteHistoryEntry(entry.id, e)}
                          className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                        >✕</button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 mt-2 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <strong className="text-sm text-foreground">{mapLeads.length} saved this run</strong>
              <Button variant="outline" size="sm" className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10" onClick={onOpenCrm}>Open CRM</Button>
            </div>


            <div className="flex-1 min-h-[150px] max-h-[200px] overflow-y-auto space-y-2 pr-1">
              {mapLeads.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/60 text-center gap-2 p-6 border-2 border-dashed border-border/50 rounded-xl">
                  <Globe size={32} className="opacity-50" />
                  <span className="text-sm">No map leads fetched yet.</span>
                </div>
              ) : mapLeads.slice(0, 8).map((lead, idx) => (
                <div className="flex justify-between items-center p-3 rounded-lg bg-card border border-border/50 shadow-sm text-sm hover:border-primary/30 transition-colors" key={`${lead.mapsLink || lead.name}-${idx}`}>
                  <div className="flex flex-col truncate pr-2">
                    <strong className="text-foreground truncate">{getMapLeadDisplayName(lead)}</strong>
                    <span className="text-xs text-muted-foreground truncate">{getMapLeadDisplaySubtitle(lead)}</span>
                  </div>
                  {lead.mapsLink && <Button variant="secondary" size="sm" className="h-6 text-[10px] uppercase font-bold shrink-0 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary" asChild><a href={lead.mapsLink} target="_blank" rel="noreferrer">Map</a></Button>}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================
function App() {
  const storedToken = localStorage.getItem(AUTH_TOKEN_KEY) || '';
  const storedUser = getStoredAuthUser();
  const [authToken, setAuthToken] = useState(storedToken);
  const [currentUser, setCurrentUser] = useState(storedUser);
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(storedToken));
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginId, setLoginId] = useState(localStorage.getItem('saved_login_id') || 'admin');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'dashboard');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const switchTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('activeTab', tab);
    setSelectedIds([]); // Clear selection on tab switch
  };

  const canAccessTab = (tabId, user = currentUser) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (tabId === 'team_management') return false;
    const access = getResolvedAccess(user);
    return access[tabId] !== false;
  };

  const getVisibleTabs = (items) => items.filter(item => canAccessTab(item.id));

  const getFirstAllowedTab = (user = currentUser) => {
    if (!user) return 'dashboard';
    if (user.role === 'admin') return 'dashboard';
    const first = ACCESS_TABS.find(item => canAccessTab(item.id, user));
    return first?.id || 'dashboard';
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState({
    userName: storedUser?.fullName || 'Muntazir',
    userRole: storedUser?.role === 'admin' ? 'Admin' : (storedUser?.position || 'Member'),
    publicEmail: '',
    profilePic: ''
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamForm, setTeamForm] = useState({
    fullName: '',
    phone: '',
    position: '',
    loginId: '',
    password: ''
  });
  const [teamSaving, setTeamSaving] = useState(false);
  const [teamMessage, setTeamMessage] = useState('');
  const [teamEditOpen, setTeamEditOpen] = useState(false);
  const [teamEditTarget, setTeamEditTarget] = useState(null);
  const [teamEditForm, setTeamEditForm] = useState({
    fullName: '',
    phone: '',
    position: '',
    loginId: '',
    password: '',
    active: true
  });
  const [teamEditChangePassword, setTeamEditChangePassword] = useState(false);
  const [teamEditSaving, setTeamEditSaving] = useState(false);
  const [teamAccessOpen, setTeamAccessOpen] = useState(false);
  const [teamAccessTarget, setTeamAccessTarget] = useState(null);
  const [teamAccessForm, setTeamAccessForm] = useState({});
  const [teamAccessSaving, setTeamAccessSaving] = useState(false);
  const [teamAccessDirty, setTeamAccessDirty] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [notification, setNotification] = useState(null);
  const [dynamicValues, setDynamicValues] = useState({});
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', onConfirm: null });
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('pro_theme') || 'theme-dark');
  const [scrapeKeyword, setScrapeKeyword] = useState('');
  const [scrapeCity, setScrapeCity] = useState('');
  const [scrapeMode, setScrapeMode] = useState('no_website');
  const [scrapeSources, setScrapeSources] = useState(['map']);
  const [scrapedLeads, setScrapedLeads] = useState([]);
  const [mapKeyword, setMapKeyword] = useState('Restaurants');
  const [mapAllBusinesses, setMapAllBusinesses] = useState(false);
  const [mapLocation, setMapLocation] = useState({ lat: 23.0225, lng: 72.5714, label: 'Ahmedabad, Gujarat' });
  const [mapRadiusKm, setMapRadiusKm] = useState(5);
  const [mapLeadLimit, setMapLeadLimit] = useState(600);
  const [mapNoWebsiteOnly, setMapNoWebsiteOnly] = useState(true);
  const [mapCategories, setMapCategories] = useState([]);
  const [categoryAddText, setCategoryAddText] = useState('restaurant\ncafe');
  const [categoryRemoveText, setCategoryRemoveText] = useState('');
  const [isUpdatingCategories, setIsUpdatingCategories] = useState(false);
  const [mapLeads, setMapLeads] = useState([]);
  const [mapStatus, setMapStatus] = useState('');
  const [isMapSearching, setIsMapSearching] = useState(false);
  const [selectedScrapedPhones, setSelectedScrapedPhones] = useState([]);
  const [isScraperBroadcasting, setIsScraperBroadcasting] = useState(false);
  const [scraperWaDelay, setScraperWaDelay] = useState(20);
  const [waStatuses, setWaStatuses] = useState({});
  const [isScraping, setIsScraping] = useState(false);
  const [isLoadingSavedLeads, setIsLoadingSavedLeads] = useState(false);
  const [isMapScreenshotDialogOpen, setIsMapScreenshotDialogOpen] = useState(false);
  const [mapScreenshotFile, setMapScreenshotFile] = useState(null);
  const [isMapScreenshotUploading, setIsMapScreenshotUploading] = useState(false);
  const [mapScreenshotResult, setMapScreenshotResult] = useState(null);
  const [isMapScreenshotDragging, setIsMapScreenshotDragging] = useState(false);
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
  const [waProvider, setWaProvider] = useState('browser'); // 'browser' or 'interakt'
  const [waDailyStats, setWaDailyStats] = useState({ sent: 0, limit: 80, remaining: 80 });
  const [waQr, setWaQr] = useState('');
  const lastSavedPublicEmailRef = useRef('');
  const publicEmailSaveTimerRef = useRef(null);

  const teamAccessPreviewAccess = activeTab === 'team_access' && teamAccessTarget
    ? ACCESS_TABS.reduce((acc, item) => {
      acc[item.id] = item.locked ? true : !!teamAccessForm[item.id];
      return acc;
    }, {})
    : null;
  const sidebarUser = activeTab === 'team_access' && teamAccessTarget
    ? { ...teamAccessTarget, access: teamAccessPreviewAccess || getResolvedAccess(teamAccessTarget) }
    : currentUser;
  const getSidebarVisibleTabs = (items) => items.filter(item => canAccessTab(item.id, sidebarUser));

  const fetchWaStatus = async () => {
    try {
      const res = await axios.get('/api/whatsapp/status');
      setWaStatus(res.data.status);

      // Fetch daily stats
      const statsRes = await axios.get('/api/whatsapp/daily-stats');
      setWaDailyStats(statsRes.data);

      if (res.data.hasQr && res.data.status !== 'connected') {
        const qrRes = await axios.get('/api/whatsapp/qr');
        setWaQr(qrRes.data.qr);
      } else {
        setWaQr('');
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        handleLogout(false);
        return;
      }
      if (!status || status >= 500) {
        return;
      }
      setWaStatus('disconnected');
      setWaQr('');
      setWaDailyStats({ sent: 0, limit: 80, remaining: 80 });
    }
  };

  useEffect(() => {
    setAxiosAuthToken(authToken);
  }, [authToken]);

  useEffect(() => {
    if (!authToken) return;
    fetchWaStatus();
    const interval = setInterval(fetchWaStatus, 5000);
    return () => clearInterval(interval);
  }, [authToken]);

  useEffect(() => {
    if (!authToken) return;
    const hydrateSession = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        const user = res.data.user;
        if (!user) throw new Error('Session invalid');
        setCurrentUser(user);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        setIsLoggedIn(true);
        setShowLoginForm(true);
        setProfile({
          userName: user.fullName || 'User',
          userRole: user.role === 'admin' ? 'Admin' : (user.position || 'Member'),
          publicEmail: '',
          profilePic: ''
        });
        const nextTab = getFirstAllowedTab(user);
        setActiveTab(nextTab);
        localStorage.setItem('activeTab', nextTab);
      } catch (e) {
        handleLogout(false);
      }
    };
    hydrateSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !currentUser) return;
    if (canAccessTab(activeTab, currentUser)) return;
    const nextTab = getFirstAllowedTab(currentUser);
    if (nextTab !== activeTab) {
      switchTab(nextTab);
    }
  }, [isLoggedIn, currentUser, activeTab]);

  const getLeadPhoneKey = (lead) => String(lead?.phone || lead?.data?.Phone || lead?.data?.phone || '').replace(/\D/g, '');
  const getLeadWhatsappStatus = (lead) => {
    const phoneKey = getLeadPhoneKey(lead);
    return String(lead?.whatsappStatus || waStatuses[phoneKey] || 'pending').toLowerCase();
  };
  const syncLeadWhatsappStatus = (phone, status) => {
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    if (!cleanPhone) return;

    setSavedLeads(prev => prev.map(lead => {
      const leadPhone = getLeadPhoneKey(lead);
      if (!leadPhone) return lead;
      if (
        leadPhone === cleanPhone ||
        leadPhone.endsWith(cleanPhone) ||
        cleanPhone.endsWith(leadPhone)
      ) {
        return {
          ...lead,
          whatsappStatus: status,
          whatsappUpdatedAt: new Date().toISOString()
        };
      }
      return lead;
    }));

    setWaStatuses(prev => ({ ...prev, [cleanPhone]: status }));
  };

  // WhatsApp Templates State
  const [whatsappTemplates, setWhatsappTemplates] = useState([]);
  const defaultWaTemplate = {
    details: 'Business intro',
    message: 'Hello {{Business}},'
  };
  const [newWaTpl, setNewWaTpl] = useState(defaultWaTemplate);

  useEffect(() => {
    // Sync with document element for Tailwind 'class' mode
    if (currentTheme === 'theme-dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Sync body classes
    document.body.className = currentTheme;
    localStorage.setItem('pro_theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    document.title = `${PAGE_TITLES[activeTab] || 'Workspace'} | ${BRAND_NAME}`;
  }, [activeTab]);

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
      fetchSavedLeads();
      fetchCustomTemplates();
      fetchCustomFields();
      fetchWhatsappTemplates(); // Load WA templates
      fetchSettings();
      fetchMapCategories();
      const interval = setInterval(() => {
        fetchStats();
        fetchRecipients();
        // Note: fetchSavedLeads is intentionally NOT polled — it's fetched on tab switch
        // and manual Refresh to avoid unwanted table re-renders and selection resets.
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (profile.publicEmail === lastSavedPublicEmailRef.current) return;
    clearTimeout(publicEmailSaveTimerRef.current);
    publicEmailSaveTimerRef.current = setTimeout(async () => {
      try {
        await axios.post('/api/settings', { publicEmail: profile.publicEmail });
        lastSavedPublicEmailRef.current = profile.publicEmail;
      } catch (e) {
        console.error('Auto-save public email failed:', e);
      }
    }, 600);
    return () => clearTimeout(publicEmailSaveTimerRef.current);
  }, [isLoggedIn, profile.publicEmail]);

  // Auto-fetch saved leads when entering Enricher / CRM tab (handles page reload too)
  useEffect(() => {
    if (isLoggedIn && (activeTab === 'email_finder' || activeTab === 'mobile_finder' || activeTab === 'saved_leads')) {
      fetchSavedLeads();
    }
  }, [isLoggedIn, activeTab]);

  useEffect(() => {
    if (!isMapScreenshotDialogOpen) return;

    const onPaste = (e) => handleMapScreenshotPaste(e);
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [isMapScreenshotDialogOpen]);

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const playNotificationSound = () => {
    try {
      // Premium notification sound
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.6;
      audio.play().catch(e => console.warn("Sound play failed:", e));
    } catch (e) {
      console.warn("Audio setup failed:", e);
    }
  };

  const sendBrowserNotification = (title, body) => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png'
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification(title, { body, icon: 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png' });
          }
        });
      }
    }
    playNotificationSound();
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

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
      setNewWaTpl(defaultWaTemplate);
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

  const escapeTemplateKey = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const getLeadTemplateVars = (lead = {}) => {
    const data = lead.data || {};
    const name = data['Name'] || data['Business Name'] || data.Business || data.name || lead.name || lead.whatsappName || '';
    const phone = data.Phone || data.phone || lead.phone || lead.email?.replace('@whatsapp.com', '') || '';
    return {
      ...data,
      Name: name,
      name,
      'First Name': data['First Name'] || name,
      Business: data.Business || data['Business Name'] || data.Name || lead.business || lead.name || name,
      'Business Name': data['Business Name'] || data.Business || data.Name || lead.business || lead.name || name,
      Phone: phone,
      phone,
      City: data.City || data.city || lead.city || '',
      city: data.city || data.City || lead.city || '',
      Address: data.Address || data.address || lead.address || '',
      address: data.address || data.Address || lead.address || '',
      Email: data.Email || data.email || lead.email || '',
      email: data.email || data.Email || lead.email || ''
    };
  };

  const renderTemplateMessage = (template, lead) => {
    let message = template || '';
    const vars = getLeadTemplateVars(lead);
    Object.entries(vars).forEach(([key, value]) => {
      const safeKey = escapeTemplateKey(key);
      const regex = new RegExp(`\\{+\\s*${safeKey}\\s*\\}+`, 'gi');
      message = message.replace(regex, value || '');
    });
    return message;
  };

  const getWhatsAppDigits = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length <= 10) return digits;
    return digits.slice(-10);
  };

  const openWhatsappComposer = (lead) => {
    const activeTpl = whatsappTemplates.find(t => t.isActive);
    const cleanPhone = getWhatsAppDigits(lead?.phone || lead?.data?.Phone || lead?.data?.phone || lead?.email?.replace('@whatsapp.com', ''));
    if (!cleanPhone) {
      showToast('No phone number found for this lead.', 'error');
      return;
    }

    const msg = activeTpl ? renderTemplateMessage(activeTpl.message, lead) : '';
    setWaModal({ open: true, phone: cleanPhone, message: msg, leadId: lead?._id || '' });
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

    const finalMsg = renderTemplateMessage(activeTpl.message, lead);

    // Show modal with message so user can copy and open WhatsApp
    setWaModal({ open: true, phone: cleanPhone, message: finalMsg, leadId: lead?._id || '' });
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

  const copyWaNumber = () => {
    const cleanPhone = getWhatsAppDigits(waModal.phone);
    if (!cleanPhone) {
      showToast('No phone number available to copy.', 'error');
      return;
    }

    const textArea = document.createElement('textarea');
    textArea.value = cleanPhone;
    textArea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('✅ Number copied to clipboard!', 'success');
    } catch {
      showToast('Could not copy number — please select and copy manually.', 'error');
    }
    document.body.removeChild(textArea);
  };

  const markWhatsappStatusFromModal = async (status) => {
    const cleanPhone = getWhatsAppDigits(waModal.phone);
    if (!cleanPhone) {
      showToast('No phone number available.', 'error');
      return;
    }

    try {
      if (waModal.leadId) {
        await axios.put(`/api/saved-leads/${waModal.leadId}`, {
          whatsappStatus: status,
          whatsappUpdatedAt: new Date().toISOString()
        });
      }
      syncLeadWhatsappStatus(cleanPhone, status);
      fetchSavedLeads();
      showToast(`WhatsApp status marked as ${status}.`, 'success');
      setWaModal({ open: false, phone: '', message: '', leadId: '' });
    } catch (err) {
      showToast(`Failed to update WhatsApp status: ${err.response?.data?.error || err.message}`, 'error');
    }
  };

  const fetchSettings = async (userContext = currentUser) => {
    try {
      const res = await axios.get('/api/settings');
      if (res.data) {
        if (res.data.igSession) setIgSession(res.data.igSession);
        if (res.data.liAt) setLiAt(res.data.liAt);
        if (res.data.fbCUser) setFbCUser(res.data.fbCUser);
        if (res.data.fbXs) setFbXs(res.data.fbXs);
        if (Array.isArray(res.data.mapBusinessCategories) && res.data.mapBusinessCategories.length > 0) {
          setMapCategories(res.data.mapBusinessCategories);
        }
        lastSavedPublicEmailRef.current = res.data.publicEmail || '';
        setProfile({
          userName: userContext?.fullName || res.data.userName || 'User',
          userRole: userContext?.role === 'admin' ? 'Admin' : (userContext?.position || res.data.userRole || 'Member'),
          publicEmail: res.data.publicEmail || '',
          profilePic: res.data.profilePic || ''
        });
      }
    } catch (e) { console.error("Error fetching settings:", e); }
  };

  const fetchMapCategories = async () => {
    try {
      const res = await axios.get('/api/map-categories');
      if (Array.isArray(res.data?.categories)) {
        setMapCategories(res.data.categories);
      }
    } catch (e) {
      console.error('Error fetching map categories:', e);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      showToast('Uploading avatar...', 'info');
      const res = await postApiWithFallback('/api/upload-avatar', formData);
      setProfile(prev => ({ ...prev, profilePic: res.data.url }));
      showToast('✅ Avatar updated!', 'success');
    } catch (err) {
      showToast('Upload failed', 'error');
    }
  };

  const handleSaveProfile = async (data) => {
    try {
      await axios.post('/api/settings', data);
      if (typeof data.publicEmail === 'string') {
        lastSavedPublicEmailRef.current = data.publicEmail;
      }
      setProfile(prev => ({ ...prev, ...data }));
      showToast('✅ Profile saved!', 'success');
    } catch (err) {
      showToast('Save failed', 'error');
    }
  };

  const parseCategoryText = (text) => [...new Set(String(text || '')
    .split(/[\n,]+/)
    .map(item => item.toLowerCase().trim().replace(/\s+/g, ' '))
    .filter(Boolean))];

  const applyMapCategoryUpdate = async ({ add = [], remove = [] } = {}) => {
    const addList = Array.isArray(add) ? add : parseCategoryText(add);
    const removeList = Array.isArray(remove) ? remove : parseCategoryText(remove);

    if (addList.length === 0 && removeList.length === 0) {
      showToast('Category list is empty', 'error');
      return;
    }

    setIsUpdatingCategories(true);
    try {
      const res = await axios.post('/api/map-categories', {
        add: addList,
        remove: removeList
      });
      const next = Array.isArray(res.data?.categories) ? res.data.categories : [];
      setMapCategories(next);
      setCategoryAddText('');
      setCategoryRemoveText('');
      showToast(`Categories updated (${next.length} active).`, 'success');
    } catch (e) {
      showToast(e.response?.data?.error || 'Category update failed', 'error');
    } finally {
      setIsUpdatingCategories(false);
    }
  };

  const handleAddMapCategories = async () => {
    await applyMapCategoryUpdate({ add: parseCategoryText(categoryAddText) });
  };

  const handleRemoveMapCategories = async (input) => {
    if (Array.isArray(input)) {
      await applyMapCategoryUpdate({ remove: input });
      return;
    }
    await applyMapCategoryUpdate({ remove: parseCategoryText(categoryRemoveText) });
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
          sendBrowserNotification("Bulk Email Hunt Complete", d.message);
          es.close();
        }
        if (d.type === 'error') {
          setIsBulkFinding(false);
          showToast('Error: ' + d.message, 'error');
          sendBrowserNotification("Email Hunt Stopped (Error)", d.message);
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

    console.log("[Frontend] 🚀 Connecting to Scraper URL:", url);
    const eventSource = new EventSource(url);
    window.currentScrapeES = eventSource;

    eventSource.onopen = () => console.log("[Frontend] ✅ SSE Connection Established!");
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
          sendBrowserNotification("Scraping Finished", "Successfully fetched all available leads.");
          eventSource.close();
          setIsScraping(false);
        } else if (parsed.type === 'error') {
          showToast("Error: " + parsed.message, "error");
          sendBrowserNotification("Scraper Stopped (Error)", parsed.message);
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
    sendBrowserNotification("Scraper Stopped", "Process was stopped manually.");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleMapBusinessSearch = () => {
    if (!mapAllBusinesses && !mapKeyword.trim()) return showToast("Business type is required", "error");
    if (!mapLocation?.lat || !mapLocation?.lng) return showToast("Select a map location first", "error");
    // Trigger history save via a custom event the component listens to
    window.__mapSaveHistory?.();

    setIsMapSearching(true);
    setMapLeads([]);
    setMapStatus('Starting map range scan...');
    showToast("Map scanner started. Leads will save directly to CRM.", "success");

    const params = new URLSearchParams({
      keyword: mapAllBusinesses ? 'businesses' : mapKeyword.trim(),
      allBusinesses: String(mapAllBusinesses),
      lat: String(mapLocation.lat),
      lng: String(mapLocation.lng),
      locationLabel: mapLocation.label || '',
      radiusKm: String(mapRadiusKm),
      limit: String(mapLeadLimit),
      noWebsiteOnly: String(mapNoWebsiteOnly)
    });

    const eventSource = new EventSource(`/api/map-businesses?${params.toString()}`);
    window.currentMapBusinessES = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === 'lead') {
          setMapLeads(prev => [...prev, parsed.data]);
          setMapStatus(`Saved ${parsed.saved || ''} businesses to CRM...`);
        } else if (parsed.type === 'status') {
          setMapStatus(parsed.message);
        } else if (parsed.type === 'done') {
          setMapStatus(parsed.message);
          showToast(parsed.message, "success");
          sendBrowserNotification("Map Search Finished", parsed.message);
          eventSource.close();
          setIsMapSearching(false);
          fetchSavedLeads();
        } else if (parsed.type === 'error') {
          setMapStatus(parsed.message);
          showToast("Map error: " + parsed.message, "error");
          sendBrowserNotification("Map Scanner Stopped (Error)", parsed.message);
          eventSource.close();
          setIsMapSearching(false);
        }
      } catch (err) {
        console.error("Failed to parse map SSE:", err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setIsMapSearching(false);
      setMapStatus('Map scanner connection closed.');
    };
  };

  const stopMapBusinessSearch = () => {
    if (window.currentMapBusinessES) {
      window.currentMapBusinessES.close();
      window.currentMapBusinessES = null;
    }
    setIsMapSearching(false);
    setMapStatus('Map search stopped.');
    sendBrowserNotification("Map Search Stopped", "The scanner was stopped manually.");
    fetchSavedLeads();
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

  const toggleLeadContacted = async (leadId, currentVal) => {
    try {
      await axios.put(`/api/saved-leads/${leadId}`, { isContacted: !currentVal });
      fetchSavedLeads();
      showToast(`Marked as ${!currentVal ? 'Contacted' : 'Not Contacted'}`, "success");
    } catch (err) { showToast("Failed to update", "error"); }
  };

  const cycleWhatsappStatus = async (leadId, currentStatus) => {
    const statuses = ['pending', 'sent', 'failed'];
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];
    try {
      await axios.put(`/api/saved-leads/${leadId}`, { whatsappStatus: nextStatus });
      fetchSavedLeads();
      showToast(`WhatsApp status: ${nextStatus}`, "success");
    } catch (err) { showToast("Failed to update status", "error"); }
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

  const handleLogout = (reload = true) => {
    setAuthToken('');
    setCurrentUser(null);
    setIsLoggedIn(false);
    setShowLoginForm(false);
    setProfile({ userName: 'Muntazir', userRole: 'Admin', publicEmail: '', profilePic: '' });
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    delete axios.defaults.headers.common.Authorization;
    if (reload) window.location.reload();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', {
        loginId,
        password
      });
      const user = res.data.user;
      const token = res.data.token;
      setAuthToken(token);
      setCurrentUser(user);
      setIsLoggedIn(true);
      setShowLoginForm(true);
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      localStorage.setItem('saved_login_id', loginId);
      setAxiosAuthToken(token);
      setProfile({
        userName: user.fullName || 'User',
        userRole: user.role === 'admin' ? 'Admin' : (user.position || 'Member'),
        publicEmail: '',
        profilePic: ''
      });
      setPassword('');
      const nextTab = getFirstAllowedTab(user);
      setActiveTab(nextTab);
      localStorage.setItem('activeTab', nextTab);
      showToast(`Welcome, ${user.fullName || user.loginId}!`, "success");
      fetchSettings(user);
    } catch (err) {
      showToast(err.response?.data?.error || "Invalid credentials!", "error");
    }
  };

  const fetchTeamMembers = async () => {
    if (currentUser?.role !== 'admin') return;
    setTeamLoading(true);
    try {
      const res = await axios.get('/api/users');
      setTeamMembers(Array.isArray(res.data) ? res.data : []);
      setTeamMessage('');
    } catch (e) {
      setTeamMembers([]);
      setTeamMessage(e.response?.data?.error || e.message);
    } finally {
      setTeamLoading(false);
    }
  };

  const handleCreateTeamMember = async (e) => {
    e.preventDefault();
    setTeamSaving(true);
    setTeamMessage('');
    try {
      const res = await axios.post('/api/users', teamForm);
      setTeamMembers(prev => [res.data.user, ...prev]);
      setTeamForm({ fullName: '', phone: '', position: '', loginId: '', password: '' });
      setTeamMessage('Team member created successfully');
      showToast('Team member added', 'success');
    } catch (err) {
      setTeamMessage(err.response?.data?.error || err.message);
      showToast(err.response?.data?.error || err.message, 'error');
    } finally {
      setTeamSaving(false);
    }
  };

  const handleDeactivateTeamMember = async (id) => {
    try {
      await axios.delete(`/api/users/${id}`);
      setTeamMembers(prev => prev.map(user => user._id === id ? { ...user, active: false } : user));
      showToast('Team member deactivated', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    }
  };

  const openTeamAccess = (member) => {
    setTeamAccessTarget(member);
    const resolved = getResolvedAccess(member);
    setTeamAccessForm(ACCESS_TABS.reduce((acc, item) => {
      acc[item.id] = item.locked ? true : (resolved[item.id] ?? false);
      return acc;
    }, {}));
    setTeamAccessDirty(false);
    setActiveTab('team_access');
    localStorage.setItem('activeTab', 'team_access');
  };

  const saveTeamAccessSnapshot = async (accessSnapshot) => {
    if (!teamAccessTarget?._id) return;
    setTeamAccessSaving(true);
    try {
      const res = await axios.patch(`/api/users/${teamAccessTarget._id}`, { access: accessSnapshot });
      setTeamMembers(prev => prev.map(user => user._id === teamAccessTarget._id ? res.data.user : user));
      setTeamAccessTarget(prev => prev ? { ...prev, access: res.data.user.access } : prev);
      setTeamMessage('Access permissions saved successfully');
      showToast('Access updated', 'success');
      setTeamAccessDirty(false);
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setTeamMessage(msg);
      showToast(msg, 'error');
      throw err;
    } finally {
      setTeamAccessSaving(false);
    }
  };

  const toggleTeamAccess = async (tabId) => {
    if (teamAccessSaving) return;
    const nextAccess = {
      ...teamAccessForm,
      [tabId]: !teamAccessForm[tabId]
    };
    setTeamAccessForm(nextAccess);
    setTeamAccessDirty(true);
    try {
      await saveTeamAccessSnapshot(nextAccess);
    } catch (e) {
      setTeamAccessForm(prev => ({ ...prev, [tabId]: !nextAccess[tabId] }));
    }
  };

  const handleSaveTeamAccess = async (e) => {
    e.preventDefault();
    if (!teamAccessTarget?._id) return;
    setTeamMessage('');
    const access = ACCESS_TABS.reduce((acc, item) => {
      acc[item.id] = item.locked ? true : !!teamAccessForm[item.id];
      return acc;
    }, {});
    try {
      await saveTeamAccessSnapshot(access);
      setActiveTab('team_management');
      localStorage.setItem('activeTab', 'team_management');
    } catch (err) { }
  };

  const openTeamEdit = (member) => {
    setTeamEditTarget(member);
    setTeamEditForm({
      fullName: member.fullName || '',
      phone: member.phone || '',
      position: member.position || '',
      loginId: member.loginId || '',
      password: '',
      active: member.active !== false
    });
    setTeamEditChangePassword(false);
    setTeamEditOpen(true);
  };

  const handleUpdateTeamMember = async (e) => {
    e.preventDefault();
    if (!teamEditTarget?._id) return;
    setTeamEditSaving(true);
    setTeamMessage('');
    try {
      const payload = {
        fullName: teamEditForm.fullName,
        phone: teamEditForm.phone,
        position: teamEditForm.position,
        loginId: teamEditForm.loginId,
        active: teamEditForm.active
      };
      if (teamEditChangePassword || teamEditForm.password.trim()) {
        if (!teamEditForm.password.trim()) {
          showToast('Please enter a new password or turn off password change.', 'error');
          setTeamEditSaving(false);
          return;
        }
        payload.password = teamEditForm.password;
      }
      const res = await axios.patch(`/api/users/${teamEditTarget._id}`, payload);
      setTeamMembers(prev => prev.map(user => user._id === teamEditTarget._id ? res.data.user : user));
      setTeamMessage('Team member updated successfully');
      showToast('Team member updated', 'success');
      setTeamEditOpen(false);
      setTeamEditTarget(null);
      setTeamEditChangePassword(false);
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setTeamMessage(msg);
      showToast(msg, 'error');
    } finally {
      setTeamEditSaving(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && currentUser?.role === 'admin' && (activeTab === 'team_management' || activeTab === 'team_access')) {
      fetchTeamMembers();
    }
  }, [activeTab, isLoggedIn, currentUser?.role]);

  useEffect(() => {
    if (activeTab !== 'team_access') return;
    if (!teamAccessTarget && teamMembers.length > 0) {
      setTeamAccessTarget(teamMembers[0]);
      const resolved = getResolvedAccess(teamMembers[0]);
      setTeamAccessForm(ACCESS_TABS.reduce((acc, item) => {
        acc[item.id] = item.locked ? true : (resolved[item.id] ?? false);
        return acc;
      }, {}));
    }
  }, [activeTab, teamAccessTarget, teamMembers]);

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

  const pickMapScreenshotFile = (file) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) {
      showToast('Please choose an image file', 'error');
      return;
    }
    setMapScreenshotFile(file);
  };

  const handleMapScreenshotPick = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    pickMapScreenshotFile(selectedFile);
  };

  const handleMapScreenshotDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMapScreenshotDragging(false);
    const droppedFile = e.dataTransfer?.files?.[0] || null;
    pickMapScreenshotFile(droppedFile);
  };

  const handleMapScreenshotPaste = (e) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imageItem = items.find(item => item.type && item.type.startsWith('image/'));
    const pastedFile = imageItem?.getAsFile?.() || null;
    if (pastedFile) {
      e.preventDefault();
      pickMapScreenshotFile(pastedFile);
      showToast('Screenshot pasted from clipboard', 'success');
    }
  };

  const handleMapScreenshotUpload = async () => {
    if (!mapScreenshotFile) {
      showToast('Please choose a screenshot first', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('image', mapScreenshotFile);
    formData.append('autoSave', 'true');

    setIsMapScreenshotUploading(true);
    try {
      const res = await postApiWithFallback('/api/extract-map-screenshot', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMapScreenshotResult(res.data);
      setMapScreenshotFile(null);
      setIsMapScreenshotDialogOpen(false);
      setIsMapScreenshotDragging(false);
      showToast(
        res.data?.saved === false
          ? 'Screenshot parsed, but skipped because no valid mobile number was found'
          : 'Screenshot parsed and saved to CRM',
        res.data?.saved === false ? 'info' : 'success'
      );
      fetchSavedLeads();
    } catch (err) {
      showToast(err.response?.data?.error || 'Screenshot upload failed', 'error');
    } finally {
      setIsMapScreenshotUploading(false);
      setIsMapScreenshotDragging(false);
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
    if (!showLoginForm) {
      return <LandingPage onGetStarted={() => setShowLoginForm(true)} />;
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden relative">
        {/* Modern Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
          <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[80px] animate-pulse delay-1000"></div>
        </div>

        <div className="absolute top-8 left-8 flex items-center gap-2 cursor-pointer group z-50" onClick={() => setShowLoginForm(false)}>
          <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-all bg-background/50 backdrop-blur-sm">
            <ArrowRight className="rotate-180" size={16} />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-[0.2em] hidden sm:block">Back to Home</span>
        </div>

        <div className="w-full max-w-[440px] space-y-10 text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-glow-primary/20 relative group">
              <Rocket className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase">{BRAND_NAME}</h2>
              <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{BRAND_SUBTITLE}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl leading-tight">
              Access Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-primary bg-[length:200%_auto] animate-shimmer">Infrastructure.</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-[340px] mx-auto leading-relaxed font-medium">
              Deploy your cold outreach engine. <br /> Secure administrative access required.
            </p>
          </div>

          <Card className="w-full border-border/40 bg-card/40 backdrop-blur-2xl shadow-2xl overflow-hidden group rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-12 relative z-10">
              <form onSubmit={handleLogin} className="space-y-10">
                <div className="space-y-4 text-left">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-1">Login ID</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary opacity-50" />
                    <Input
                      type="text"
                      placeholder="admin or phone number"
                      value={loginId}
                      onChange={e => setLoginId(e.target.value)}
                      className="bg-background/40 border-border/40 pl-14 h-16 text-center font-mono text-xl tracking-[0.15em] focus:ring-primary/20 focus:border-primary/40 rounded-2xl"
                    />
                  </div>
                </div>
                <div className="space-y-4 text-left">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-1">Password</Label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary opacity-50" />
                    <Input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="bg-background/40 border-border/40 pl-14 h-16 text-center font-mono text-xl tracking-[0.35em] focus:ring-primary/20 focus:border-primary/40 rounded-2xl"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-16 rounded-2xl text-[11px] font-black shadow-glow-primary group relative overflow-hidden tracking-[0.2em] uppercase">
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Verify & Deploy <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-primary bg-[length:200%_auto] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2">
            <ShieldCheck size={12} /> Neural Security Active v2.5.0
          </p>
        </div>
      </div>
    );
  }

  const getStatCount = (id) => (Array.isArray(stats) ? stats : []).find(s => s._id === id)?.count || 0;

  const getWhatsappLeadStats = () => {
    const counts = { sent: 0, failed: 0, pending: 0, total: 0 };
    (Array.isArray(savedLeads) ? savedLeads : []).forEach(lead => {
      if (!lead?.phone || lead.phone === 'N/A') return;
      const status = String(lead.whatsappStatus || 'pending').toLowerCase();
      if (status === 'sent') counts.sent += 1;
      else if (status === 'failed') counts.failed += 1;
      else counts.pending += 1;
      counts.total += 1;
    });
    return counts;
  };
  const whatsappLeadStats = getWhatsappLeadStats();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* MODERN SIDEBAR */}
      <aside className={`${isSidebarCollapsed ? 'w-[78px]' : 'w-[260px]'} flex-shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out z-50 ${isMobileMenuOpen ? 'fixed inset-y-0 left-0 shadow-2xl w-[260px]' : 'hidden md:flex'}`}>
        <div className={`h-16 flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-6'} border-b border-sidebar-border/30 overflow-hidden`}>
          <div className={`flex items-center gap-2.5 font-extrabold text-xl tracking-tight text-sidebar-foreground transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="bg-primary p-1.5 rounded-lg shrink-0">
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </div>
            <span>{BRAND_NAME}</span>
          </div>

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`hidden md:flex h-8 w-8 items-center justify-center rounded-lg border border-sidebar-border/50 bg-sidebar-accent/50 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all ${isSidebarCollapsed ? 'mx-auto' : 'ml-auto'}`}
          >
            {isSidebarCollapsed ? <ChevronLeft size={16} className="rotate-180" /> : <ChevronLeft size={16} />}
          </button>

          <button className="ml-auto md:hidden text-sidebar-foreground/50 hover:text-sidebar-foreground" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto py-6 ${isSidebarCollapsed ? 'px-2' : 'px-4'} custom-scrollbar space-y-8 overflow-x-hidden`}>

          {/* Main Group */}
          <div>
            {!isSidebarCollapsed && <div className="px-2 text-[10px] font-bold text-sidebar-foreground/40 tracking-[0.1em] mb-3 truncate">Overview</div>}
            <div className="space-y-1">
              {getSidebarVisibleTabs([
                { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { id: 'campaign', icon: Rocket, label: 'New Campaign' },
                { id: 'logs', icon: Activity, label: 'Delivery Logs' },
              ]).map(item => (
                <TooltipProvider key={item.id} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => { switchTab(item.id); setIsMobileMenuOpen(false); }}
                        className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === item.id
                          ? 'bg-sidebar-accent text-sidebar-foreground shadow-sm'
                          : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                          }`}
                      >
                        <item.icon size={18} className={activeTab === item.id ? 'text-primary' : ''} />
                        {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </button>
                    </TooltipTrigger>
                    {isSidebarCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>


          {/* Sourcing Group */}
          <div>
            {!isSidebarCollapsed && <div className="px-2 text-[10px] font-bold text-sidebar-foreground/40 tracking-[0.1em] mb-3 truncate">Lead Generation</div>}
            <div className="space-y-1">
              {getSidebarVisibleTabs([
                { id: 'scraper', icon: Globe, label: 'Lead Scraper' },
                { id: 'map_finder', icon: MapPin, label: 'Map Finder' },
                { id: 'email_finder', icon: Mail, label: 'Email Enricher' },
                { id: 'mobile_finder', icon: Smartphone, label: 'Mobile Enricher' },
                { id: 'saved_leads', icon: Database, label: 'Automation CRM' },
              ]).map(item => (
                <TooltipProvider key={item.id} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => { switchTab(item.id); setIsMobileMenuOpen(false); if (item.id === 'email_finder' || item.id === 'mobile_finder' || item.id === 'saved_leads') fetchSavedLeads(); }}
                        className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === item.id ? 'bg-sidebar-accent text-sidebar-foreground shadow-sm' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                          }`}
                      >
                        <item.icon size={18} className={activeTab === item.id ? 'text-primary' : ''} />
                        {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </button>
                    </TooltipTrigger>
                    {isSidebarCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>


          {/* Inbox Group */}
          <div>
            {!isSidebarCollapsed && <div className="px-2 text-[10px] font-bold text-sidebar-foreground/40 tracking-[0.1em] mb-3 truncate">Inbox & Templates</div>}
            <div className="space-y-1">
              {getSidebarVisibleTabs([
                { id: 'replied_leads', icon: Reply, label: 'Email Replies' },
                { id: 'whatsapp_inbox', icon: WhatsAppIcon, label: 'WhatsApp Inbox' },
                { id: 'template', icon: FileText, label: 'Email Templates' },
                { id: 'custom_templates', icon: Folder, label: 'Custom Folders' },
                { id: 'variables', icon: Hash, label: 'Variable Manager' },
              ]).map(item => (
                <TooltipProvider key={item.id} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => { switchTab(item.id); setIsMobileMenuOpen(false); }}
                        className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === item.id ? 'bg-sidebar-accent text-sidebar-foreground shadow-sm' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                          }`}
                      >
                        <item.icon size={18} className={activeTab === item.id ? 'text-primary' : ''} />
                        {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </button>
                    </TooltipTrigger>
                    {isSidebarCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>


          {/* Integrations */}
          <div>
            {!isSidebarCollapsed && <div className="px-2 text-[10px] font-bold text-sidebar-foreground/40 tracking-[0.1em] mb-3 truncate">Integrations</div>}
            <div className="space-y-1">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => { switchTab('whatsapp_settings'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'whatsapp_settings' ? 'bg-sidebar-accent text-sidebar-foreground shadow-sm' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                        }`}
                    >
                      <WhatsAppIcon size={18} className={activeTab === 'whatsapp_settings' ? 'text-primary' : ''} />
                      {!isSidebarCollapsed && <span className="truncate">WhatsApp Settings</span>}
                    </button>
                  </TooltipTrigger>
                  {isSidebarCollapsed && <TooltipContent side="right">WhatsApp Settings</TooltipContent>}
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => { switchTab('whatsapp_linker'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-3'} py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'whatsapp_linker' ? 'bg-sidebar-accent text-sidebar-foreground shadow-sm' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                        }`}
                    >
                      <div className={`flex items-center ${isSidebarCollapsed ? '' : 'gap-3'}`}>
                        <WhatsAppIcon size={18} className={activeTab === 'whatsapp_linker' ? 'text-primary' : ''} />
                        {!isSidebarCollapsed && <span className="truncate">WhatsApp Linker</span>}
                      </div>
                      {!isSidebarCollapsed && <div className={`w-1.5 h-1.5 rounded-full ${waStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : waStatus === 'qr-ready' ? 'bg-amber-500' : 'bg-red-500'}`}></div>}
                    </button>
                  </TooltipTrigger>
                  {isSidebarCollapsed && <TooltipContent side="right">WhatsApp Linker</TooltipContent>}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>


          <div>
            {!isSidebarCollapsed && <div className="px-2 text-[10px] font-bold text-sidebar-foreground/40 tracking-[0.1em] mb-3 truncate">System</div>}
            <div className="space-y-1">
              {getSidebarVisibleTabs([
                { id: 'logs', icon: HistoryIcon, label: 'System Logs' },
                { id: 'archive', icon: ArchiveIcon, label: 'Archive' },
                ...(sidebarUser?.role === 'admin' ? [{ id: 'team_management', icon: UsersIcon, label: 'Team Management' }] : []),
              ]).map(item => (
                <TooltipProvider key={item.id} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => { switchTab(item.id); setIsMobileMenuOpen(false); }}
                        className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === item.id ? 'bg-sidebar-accent text-sidebar-foreground shadow-sm' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                          }`}
                      >
                        <item.icon size={18} className={activeTab === item.id ? 'text-primary' : ''} />
                        {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </button>
                    </TooltipTrigger>
                    {isSidebarCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className={`mt-auto p-4 border-t border-sidebar-border/30 ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}>
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} p-2 rounded-xl bg-sidebar-accent/30 overflow-hidden`}>
            <Avatar className="h-8 w-8 border border-sidebar-border/50 shrink-0">
              {profile.profilePic ? (
                <AvatarImage src={profile.profilePic} className="object-cover" />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs uppercase">
                  {profile.userName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-sidebar-foreground truncate">{profile.userName}</span>
                <span className="text-[9px] text-sidebar-foreground/50 truncate">{profile.userRole}</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}

      <main className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
        {/* TOP HEADER */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-border bg-background/80 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-6">
            <button className="md:hidden text-foreground/60 hover:text-foreground" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground/40 text-sm font-medium">Pages</span>
              <ChevronLeft size={14} className="rotate-180 text-muted-foreground/40" />
              <h1 className="text-sm font-semibold tracking-tight text-foreground">
                {PAGE_TITLES[activeTab] || 'Workspace'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">System Live</span>
            </div>

            <Badge
              variant="outline"
              className={`hidden md:flex gap-1.5 px-3 py-1 border-none rounded-lg text-[11px] font-bold tracking-tight ${waStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                }`}
            >
              <div className={`w-1 h-1 rounded-full ${waStatus === 'connected' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              {waStatus.toUpperCase()}
            </Badge>

            <Badge
              variant="outline"
              className={`hidden md:flex gap-1.5 px-3 py-1 border-none rounded-lg text-[11px] font-bold tracking-tight ${waDailyStats.sent >= waDailyStats.limit ? 'bg-red-500/10 text-red-600' :
                  waDailyStats.sent >= waDailyStats.limit * 0.8 ? 'bg-amber-500/10 text-amber-600' :
                    'bg-emerald-500/10 text-emerald-600'
                }`}
            >
              <div className={`w-1 h-1 rounded-full ${waDailyStats.sent >= waDailyStats.limit ? 'bg-red-500' :
                  waDailyStats.sent >= waDailyStats.limit * 0.8 ? 'bg-amber-500' :
                    'bg-emerald-500'
                }`}></div>
              WA: {waDailyStats.sent}/{waDailyStats.limit} Sent
            </Badge>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl h-9 w-9 text-foreground/60 hover:text-primary hover:bg-primary/5 transition-all"
              onClick={() => setCurrentTheme(currentTheme === 'theme-light' ? 'theme-dark' : 'theme-light')}
            >
              {currentTheme === 'theme-light' ? <Moon size={18} /> : <Sun size={18} />}
            </Button>

            <div className="w-[1px] h-4 bg-border mx-1 hidden sm:block"></div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-full border border-transparent hover:border-border hover:bg-accent/50 transition-all">
                  <div className="flex flex-col items-end hidden lg:flex">
                    <span className="text-[11px] font-bold text-foreground leading-tight">{profile.userName}</span>
                    <span className="text-[9px] text-muted-foreground leading-tight">{profile.userRole}</span>
                  </div>
                  <Avatar className="h-8 w-8 border border-border shadow-sm">
                    {profile.profilePic ? (
                      <AvatarImage src={profile.profilePic} className="object-cover" />
                    ) : (
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                        {profile.userName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 border-border/50 shadow-xl rounded-xl">
                <DropdownMenuLabel className="text-xs">Management</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => switchTab('profile')} className="text-xs py-2 cursor-pointer rounded-lg mx-1">
                  <User size={14} className="mr-2 opacity-60" /> Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => switchTab('security')} className="text-xs py-2 cursor-pointer rounded-lg mx-1">
                  <ShieldCheck size={14} className="mr-2 opacity-60" /> Security
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleLogout()} className="text-xs py-2 text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg mx-1">
                  <X size={14} className="mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <section className={`flex-1 overflow-y-auto p-6 md:p-8 ${activeTab === 'whatsapp_inbox' ? '!p-0 overflow-hidden' : ''}`}>
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-fade-in pb-10">
              {/* HERO WELCOME */}
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Welcome back, {profile.userName}</h2>
                <p className="text-muted-foreground text-sm font-medium">Here's what's happening across your outreach channels today.</p>
              </div>


              {/* TOP STATS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: 'Total CRM Leads',
                    value: savedLeads.length,
                    sub: 'Total CRM leads scraped',
                    icon: Database,
                    color: 'text-primary',
                    bg: 'bg-primary/5',
                    border: 'border-primary/20'
                  },
                  {
                    label: 'Email Campaigns',
                    value: savedLeads.filter(l => l.email && l.emailFound).length,
                    sub: 'Emails found in CRM',
                    icon: Mail,
                    color: 'text-indigo-500',
                    bg: 'bg-indigo-500/5',
                    border: 'border-indigo-500/20'
                  },
                  {
                    label: 'WhatsApp Leads',
                    value: savedLeads.filter(l => l.phone && l.phone !== 'N/A').length,
                    sub: 'Valid WA numbers in CRM',
                    icon: MessageSquare,
                    color: 'text-emerald-500',
                    bg: 'bg-emerald-500/5',
                    border: 'border-emerald-500/20'
                  },
                  {
                    label: 'Completed',
                    value: getStatCount('finished'),
                    sub: 'Finished sequences',
                    icon: CheckCircle,
                    color: 'text-blue-500',
                    bg: 'bg-blue-500/5',
                    border: 'border-blue-500/20'
                  }
                ].map((stat, i) => (
                  <Card key={i} className="premium-card bg-card/50 backdrop-blur-sm shadow-none hover:shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
                      <CardTitle className="text-sm font-bold text-muted-foreground">{stat.label}</CardTitle>
                      <div className={`p-2 ${stat.bg} ${stat.color} rounded-xl border ${stat.border} group-hover:scale-110 transition-transform`}>
                        <stat.icon size={16} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-black tracking-tight text-foreground">{stat.value}</div>
                      <p className="text-[10px] font-medium text-muted-foreground mt-1.5 flex items-center gap-1.5">
                        <TrendingUp size={12} className="text-emerald-500" />
                        {stat.sub}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'WA Sent', value: whatsappLeadStats.sent, icon: CheckCheck, color: 'text-emerald-500' },
                  { label: 'WA Failed', value: whatsappLeadStats.failed, icon: AlertTriangle, color: 'text-destructive' },
                  { label: 'WA Pending', value: whatsappLeadStats.pending, icon: Clock, color: 'text-amber-500' }
                ].map((stat, i) => (
                  <div key={i} className="premium-card bg-muted/20 rounded-2xl p-5 flex items-center justify-between group">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground mb-1">{stat.label}</p>
                      <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className="p-2 bg-background rounded-lg border border-border shadow-sm">
                      <stat.icon size={18} className={stat.color} />
                    </div>
                  </div>
                ))}
              </div>

              {/* SECONDARY STATS ROW */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Replied', value: recipients.filter(r => r.status === 'replied' && !r.email?.includes('@whatsapp.com')).length, icon: Reply, color: 'text-emerald-500' },
                  { label: 'Active Automations', value: getStatCount('pending') + getStatCount('Step 1 Sent') + getStatCount('Step 2 Sent'), icon: Rocket, color: 'text-amber-500' },
                  { label: 'Stopped', value: getStatCount('stopped'), icon: X, color: 'text-destructive' },
                  { label: 'Failed', value: getStatCount('failed'), icon: AlertTriangle, color: 'text-amber-500' }
                ].map((stat, i) => (
                  <div key={i} className="premium-card bg-muted/20 rounded-2xl p-5 flex items-center justify-between group">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground mb-1">{stat.label}</p>
                      <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className="p-2 bg-background rounded-lg border border-border shadow-sm">
                      <stat.icon size={18} className={stat.color} />
                    </div>
                  </div>
                ))}
              </div>

              {/* CHART & LOGS AREA */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                  <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm overflow-hidden h-full">
                    <CardHeader className="border-b border-border/40 bg-muted/20 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                            <TrendingUp size={16} className="text-primary" /> Performance Analytics
                          </CardTitle>
                          <CardDescription className="text-[11px] mt-0.5">Real-time engagement tracking across all channels</CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-[10px] font-bold px-3 rounded-lg border-border/60"
                          onClick={() => switchTab('logs')}
                        >
                          View Full Report
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="h-[480px] w-full bg-muted/10 rounded-2xl border border-dashed border-border/60 flex items-center justify-center">
                        <EmailChart recipients={[...recipients, ...savedLeads]} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="xl:col-span-1">
                  <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm h-full flex flex-col overflow-hidden">
                    <CardHeader className="border-b border-border/40 bg-muted/20 px-6 py-4">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                        <HistoryIcon size={16} className="text-primary" /> Activity Log
                      </CardTitle>
                      <CardDescription className="text-[11px] mt-0.5">Latest automation events & status updates</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-0 scrollbar-hide">
                      <div className="divide-y divide-border/30">
                        {recipients.slice(0, 10).map((r, i) => (
                          <div key={i} className="px-6 py-4 hover:bg-muted/40 transition-colors flex items-center justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-bold text-foreground truncate" title={r.email}>{r.email}</p>
                              <p className="text-[10px] font-medium text-muted-foreground mt-1 flex items-center gap-1.5 uppercase tracking-tight">
                                <span className={r.step > 3 ? 'text-emerald-500' : 'text-primary'}>
                                  {r.step > 3 ? 'Completed' : `Sequence Step ${r.step}`}
                                </span>
                                <span className="opacity-30">•</span>
                                <span>{r.lastSentAt ? new Date(r.lastSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Queued'}</span>
                              </p>
                            </div>
                            <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-[0.05em] px-2 py-0.5 rounded-md border-border/50 ${r.status === 'replied' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                              r.status === 'failed' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                r.status === 'finished' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-muted text-muted-foreground'
                              }`}>
                              {r.status}
                            </Badge>
                          </div>
                        ))}
                        {recipients.length === 0 && (
                          <div className="p-10 text-center flex flex-col items-center justify-center h-full opacity-50">
                            <Archive size={32} className="mb-3 text-muted-foreground" />
                            <p className="text-xs font-bold text-muted-foreground">No recent activity</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'map_finder' && (
            <MapBusinessFinder
              keyword={mapKeyword}
              setKeyword={setMapKeyword}
              allBusinesses={mapAllBusinesses}
              setAllBusinesses={setMapAllBusinesses}
              selectedLocation={mapLocation}
              setSelectedLocation={setMapLocation}
              radiusKm={mapRadiusKm}
              setRadiusKm={setMapRadiusKm}
              limit={mapLeadLimit}
              setLimit={setMapLeadLimit}
              noWebsiteOnly={mapNoWebsiteOnly}
              setNoWebsiteOnly={setMapNoWebsiteOnly}
              mapCategories={mapCategories}
              categoryAddText={categoryAddText}
              setCategoryAddText={setCategoryAddText}
              categoryRemoveText={categoryRemoveText}
              setCategoryRemoveText={setCategoryRemoveText}
              onAddCategories={handleAddMapCategories}
              onRemoveCategories={handleRemoveMapCategories}
              isUpdatingCategories={isUpdatingCategories}
              isSearching={isMapSearching}
              mapLeads={mapLeads}
              mapStatus={mapStatus}
              onSearch={handleMapBusinessSearch}
              onStop={stopMapBusinessSearch}
              onOpenCrm={() => { fetchSavedLeads(); switchTab('saved_leads'); }}
            />
          )}

          {activeTab === 'scraper' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
              <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SearchIcon size={22} className="text-primary" /> Lead Scraper Engine
                  </CardTitle>
                  <CardDescription>Automatically extract local businesses from Google Maps, Facebook, Instagram, and LinkedIn.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleScrape} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Business Type / Keyword</Label>
                        <Input
                          type="text"
                          list="keyword-history"
                          placeholder="e.g. Interior Designer, Clinic..."
                          required
                          value={scrapeKeyword}
                          onChange={e => setScrapeKeyword(e.target.value)}
                          className="bg-background/50"
                        />
                        <datalist id="keyword-history">
                          {keywordHistory.map((h, i) => <option key={i} value={h} />)}
                        </datalist>
                      </div>

                      <div className="space-y-2">
                        <Label>Target Location</Label>
                        <Input
                          type="text"
                          list="city-history"
                          placeholder="e.g. Ahmedabad, Gujarat"
                          required
                          value={scrapeCity}
                          onChange={e => setScrapeCity(e.target.value)}
                          className="bg-background/50"
                        />
                        <datalist id="city-history">
                          {cityHistory.map((h, i) => <option key={i} value={h} />)}
                        </datalist>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Scrape Sources</Label>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { id: 'map', label: 'Google Maps', icon: <MapPin size={16} /> },
                          { id: 'facebook', label: 'Facebook', icon: <Facebook size={16} /> },
                          { id: 'ig', label: 'Instagram', icon: <Instagram size={16} /> },
                          { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={16} /> }
                        ].map(src => (
                          <label
                            key={src.id}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer text-sm font-medium transition-all duration-200 border ${scrapeSources.includes(src.id)
                              ? 'bg-primary text-primary-foreground border-primary shadow-glow-sm'
                              : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted'
                              }`}
                          >
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={scrapeSources.includes(src.id)}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                      <div className="space-y-2">
                        <Label>Extraction Mode</Label>
                        <Select value={scrapeMode} onValueChange={setScrapeMode}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no_website">No Website (Name, Phone, Address)</SelectItem>
                            <SelectItem value="emails_only">No Website (Auto-Find Email & Name)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="pb-1">
                        {!isScraping ? (
                          <Button type="submit" className="w-full sm:w-auto shadow-glow-primary">
                            <Rocket className="mr-2 h-4 w-4" /> Start Extraction
                          </Button>
                        ) : (
                          <Button type="button" variant="destructive" onClick={stopScrape} className="w-full sm:w-auto shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                            <Square className="mr-2 h-4 w-4" fill="currentColor" /> Stop Extraction
                          </Button>
                        )}
                      </div>
                    </div>
                  </form>

                  <Separator className="my-8" />

                  <div className="space-y-4">
                    <div className="bg-muted/40 border border-border/50 rounded-lg p-3">
                      <p className="text-sm text-foreground/80 flex items-center gap-2">
                        <span className="font-bold text-primary">Pro Tip:</span>
                        For deep Instagram/LinkedIn/Facebook email extraction on a live server, paste your session cookies below (they save automatically).
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      <div className="space-y-1.5 relative">
                        <Label className="text-xs flex items-center gap-1.5"><Instagram size={14} className="text-pink-500" /> IG sessionid</Label>
                        <div className="relative">
                          <Input type={showCookies ? "text" : "password"} placeholder="sessionid cookie" value={igSession} onChange={e => { setIgSession(e.target.value); localStorage.setItem('saved_igSession', e.target.value); }} onBlur={() => handleSaveCookie('igSession', igSession)} className="pr-10 bg-background/50 font-mono text-xs" />
                          <button type="button" onClick={() => setShowCookies(!showCookies)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showCookies ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5 relative">
                        <Label className="text-xs flex items-center gap-1.5"><Linkedin size={14} className="text-blue-500" /> LI li_at</Label>
                        <div className="relative">
                          <Input type={showCookies ? "text" : "password"} placeholder="li_at cookie" value={liAt} onChange={e => { setLiAt(e.target.value); localStorage.setItem('saved_liAt', e.target.value); }} onBlur={() => handleSaveCookie('liAt', liAt)} className="pr-10 bg-background/50 font-mono text-xs" />
                          <button type="button" onClick={() => setShowCookies(!showCookies)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showCookies ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5 relative">
                        <Label className="text-xs flex items-center gap-1.5"><Facebook size={14} className="text-blue-600" /> FB c_user</Label>
                        <div className="relative">
                          <Input type={showCookies ? "text" : "password"} placeholder="c_user" value={fbCUser} onChange={e => { setFbCUser(e.target.value); localStorage.setItem('saved_fbCUser', e.target.value); }} onBlur={() => handleSaveCookie('fbCUser', fbCUser)} className="pr-10 bg-background/50 font-mono text-xs" />
                          <button type="button" onClick={() => setShowCookies(!showCookies)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showCookies ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5 relative">
                        <Label className="text-xs flex items-center gap-1.5"><Facebook size={14} className="text-blue-600" /> FB xs</Label>
                        <div className="relative">
                          <Input type={showCookies ? "text" : "password"} placeholder="xs cookie" value={fbXs} onChange={e => { setFbXs(e.target.value); localStorage.setItem('saved_fbXs', e.target.value); }} onBlur={() => handleSaveCookie('fbXs', fbXs)} className="pr-10 bg-background/50 font-mono text-xs" />
                          <button type="button" onClick={() => setShowCookies(!showCookies)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showCookies ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {scrapedLeads.length > 0 && (
                <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Extracted Leads ({scrapedLeads.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="px-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold border-y border-border">
                          <tr>
                            <th className="px-6 py-3">Business Name</th>
                            {scrapeMode === 'emails_only' ? (
                              <th className="px-6 py-3"><div className="flex items-center gap-2"><Mail size={14} /> Email Found</div></th>
                            ) : (
                              <>
                                <th className="px-6 py-3">Phone</th>
                                <th className="px-6 py-3">Address</th>
                              </>
                            )}
                            <th className="px-6 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {scrapedLeads.map((lead, idx) => (
                            <tr key={idx} className="hover:bg-muted/30 transition-colors">
                              <td className="px-6 py-3 font-medium text-foreground">{lead.name}</td>
                              {scrapeMode === 'emails_only' ? (
                                <td className={`px-6 py-3 font-medium ${lead.emailFound ? 'text-primary' : 'text-muted-foreground/70'}`}>
                                  {lead.emailFound ? lead.email : 'Not Found'}
                                </td>
                              ) : (
                                <>
                                  <td className="px-6 py-3 text-emerald-500 font-medium whitespace-nowrap">{lead.phone}</td>
                                  <td className="px-6 py-3 text-muted-foreground text-xs">{lead.address}</td>
                                </>
                              )}
                              <td className="px-6 py-3 text-right">
                                <Button variant="outline" size="sm" asChild className="h-8">
                                  <a href={lead.mapsLink} target="_blank" rel="noreferrer">
                                    <MapPin className="mr-2 h-3.5 w-3.5" /> View Map
                                  </a>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'template' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
              <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock size={20} className="text-primary" /> 1. SMTP Configuration
                  </CardTitle>
                  <CardDescription>Configure your sending email account (Gmail App Passwords recommended).</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Gmail User / Sending Email</Label>
                      <Input type="text" value={emailUser} onChange={e => setEmailUser(e.target.value)} placeholder="yourname@gmail.com" className="bg-background/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>App Password</Label>
                      <Input type="password" value={emailPass} onChange={e => setEmailPass(e.target.value)} placeholder="xxxx xxxx xxxx xxxx" className="bg-background/50" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail size={20} className="text-primary" /> 2. Automated 3-Step Sequence
                  </CardTitle>
                  <CardDescription>Define your default drip sequence that executes when a new lead is added.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Main Subject Line</Label>
                    <Input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Enter an engaging subject line..." className="bg-background/50 text-lg font-medium" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-indigo-500"><Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20">Step 1</Badge> Initial Pitch (Day 1)</Label>
                      <Textarea value={body1} onChange={e => setBody1(e.target.value)} placeholder="First email content..." className="min-h-[250px] bg-background/50 resize-none" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-primary"><Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Step 2</Badge> Follow-up (Day 4)</Label>
                      <Textarea value={body2} onChange={e => setBody2(e.target.value)} placeholder="Follow-up content..." className="min-h-[250px] bg-background/50 resize-none" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-emerald-500"><Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Step 3</Badge> Final Touch (Day 10)</Label>
                      <Textarea value={body3} onChange={e => setBody3(e.target.value)} placeholder="Break-up/final email content..." className="min-h-[250px] bg-background/50 resize-none" />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end border-t border-border/50">
                    <Button onClick={handleSaveTemplates} className="w-full sm:w-auto shadow-glow-primary">
                      <Save className="mr-2 h-4 w-4" /> Save Sequence Templates
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'custom_templates' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Editor Area */}
                <div className="xl:col-span-5 space-y-6">
                  <Card className={`border-border/50 bg-card/50 backdrop-blur-xl shadow-lg transition-all ${editingTemplateId ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20' : ''}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {editingTemplateId ? <><Edit size={20} className="text-amber-500" /> Edit Template</> : <><Edit size={20} className="text-primary" /> Design New Template</>}
                      </CardTitle>
                      <CardDescription>Create reusable single-email templates for bulk dispatch.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="tplName">Template Name (Internal)</Label>
                        <Input id="tplName" placeholder="e.g. AC Repair Cold Pitch" className="bg-background/50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tplSub">Email Subject</Label>
                        <Input id="tplSub" placeholder="e.g. Improving {{Business}} Online" className="bg-background/50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tplBody">Email Body</Label>
                        <Textarea id="tplBody" placeholder="Hi {{First Name}}, I saw {{Business}}..." className="min-h-[250px] bg-background/50" />
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={handleSaveCustomTemplate}
                          className={`flex-1 ${editingTemplateId ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'shadow-glow-primary'}`}
                        >
                          {editingTemplateId ? <><Save className="mr-2 h-4 w-4" /> Update Changes</> : <><Rocket className="mr-2 h-4 w-4" /> Save New Template</>}
                        </Button>
                        {editingTemplateId && (
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setEditingTemplateId(null);
                              document.getElementById('tplName').value = '';
                              document.getElementById('tplSub').value = '';
                              document.getElementById('tplBody').value = '';
                            }}
                          >
                            Cancel Edit
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Library Area */}
                <div className="xl:col-span-7">
                  <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-lg h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Folder size={20} className="text-primary" /> Template Library
                      </CardTitle>
                      <CardDescription>Your saved templates ready for bulk deployment.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {customTemplates.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                          <Folder size={48} className="opacity-20 mb-4" />
                          <p>No custom templates yet.</p>
                          <p className="text-sm opacity-70 mt-1">Design your first template on the left.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {customTemplates.map(t => (
                            <div key={t._id} className="group border border-border/60 hover:border-primary/50 bg-background/40 hover:bg-card rounded-xl p-4 transition-all hover:shadow-lg">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{t.name}</h4>
                                  <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate" title={t.subject}>{t.subject}</p>
                                </div>
                              </div>
                              <div className="text-xs text-foreground/70 bg-muted/30 p-2 rounded max-h-16 overflow-hidden relative mb-4">
                                {t.body}
                                <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-muted/30 to-transparent"></div>
                              </div>
                              <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="flex-1 h-8"
                                  onClick={() => {
                                    setEditingTemplateId(t._id);
                                    document.getElementById('tplName').value = t.name;
                                    document.getElementById('tplSub').value = t.subject;
                                    document.getElementById('tplBody').value = t.body;
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                >
                                  <Edit className="mr-1.5 h-3 w-3" /> Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive px-2"
                                  onClick={() => {
                                    setConfirmModal({
                                      open: true,
                                      title: `Delete template "${t.name}"?`,
                                      onConfirm: async () => {
                                        await axios.delete(`/api/email-templates/${t._id}`);
                                        showToast("Template Deleted!", "success");
                                        fetchCustomTemplates();
                                      }
                                    });
                                  }}
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'whatsapp_settings' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
              <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone size={20} className="text-emerald-500" /> Create WhatsApp Template
                  </CardTitle>
                  <CardDescription>Define messages that you can quickly send to leads via WhatsApp.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Template Details (e.g. Follow-up 1)</Label>
                    <Input
                      value={newWaTpl.details}
                      onChange={e => setNewWaTpl({ ...newWaTpl, details: e.target.value })}
                      placeholder="Enter template name/details"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp Message Content</Label>
                    <Textarea
                      value={newWaTpl.message}
                      onChange={e => setNewWaTpl({ ...newWaTpl, message: e.target.value })}
                      placeholder="Hi {{First Name}}, I came across {{Business}} and wanted to share a quick idea..."
                      className="min-h-[150px] bg-background/50"
                    />
                    <div className="bg-primary/5 text-primary text-xs p-3 rounded-lg border border-primary/10 mt-2">
                      <span className="font-semibold">Variables supported:</span> {'{{First Name}}'}, {'{{Business}}'}, {'{{Phone}}'}, {'{{City}}'}, {'{{Address}}'} and your custom lead fields.
                    </div>
                  </div>
                  <Button onClick={handleAddWhatsappTemplate} className="shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-emerald-500 hover:bg-emerald-600 text-white border-transparent">
                    <Save className="mr-2 h-4 w-4" /> Save WhatsApp Template
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Your WhatsApp Library</CardTitle>
                </CardHeader>
                <CardContent>
                  {whatsappTemplates.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                      <Phone size={48} className="opacity-20 mb-4" />
                      <p>No WhatsApp templates found.</p>
                      <p className="text-sm opacity-70 mt-1">Create your first one above!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {whatsappTemplates.map(t => (
                        <div key={t._id} className={`relative rounded-xl border ${t.isActive ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20' : 'border-border/60 hover:border-primary/50'} bg-background/40 hover:bg-card p-5 transition-all overflow-hidden`}>
                          {t.isActive && (
                            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm z-10">
                              ACTIVE
                            </div>
                          )}
                          <h4 className="font-bold text-foreground text-lg mb-3 pr-12">{t.details}</h4>
                          <div className="text-sm text-foreground/80 bg-muted/30 p-3 rounded-lg min-h-[100px] max-h-[150px] overflow-y-auto mb-4 border border-border/40 whitespace-pre-wrap">
                            {t.message}
                          </div>

                          <div className="flex items-center gap-2 pt-3 border-t border-border/40">
                            {!t.isActive && (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="flex-1 h-8 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:text-emerald-700 border-none"
                                onClick={() => handleActivateWhatsappTemplate(t._id)}
                              >
                                <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Activate
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-8 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive ${t.isActive ? 'w-full' : ''}`}
                              onClick={() => {
                                setConfirmModal({
                                  open: true,
                                  title: `Delete template "${t.details}"?`,
                                  onConfirm: () => handleDeleteWhatsappTemplate(t._id)
                                });
                              }}
                            >
                              <Archive className={t.isActive ? "mr-2 h-4 w-4" : "h-4 w-4"} /> {t.isActive && "Delete"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'campaign' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* BULK UPLOAD CARD */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-lg h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UploadCloud size={20} className="text-primary" /> 1. Bulk Outreach
                    </CardTitle>
                    <CardDescription>Upload your Excel or CSV list to initialize multiple sequences simultaneously.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${file ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50 hover:bg-muted/30'}`}
                      onClick={() => document.getElementById('f').click()}
                    >
                      <input id="f" type="file" hidden onChange={handleFileChange} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                      <div className="flex flex-col items-center justify-center gap-3">
                        {file ? (
                          <>
                            <div className="p-3 bg-primary/20 rounded-full text-primary">
                              <FileText size={28} />
                            </div>
                            <p className="font-semibold text-foreground">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                          </>
                        ) : (
                          <>
                            <div className="p-3 bg-muted rounded-full text-muted-foreground">
                              <UploadCloud size={28} />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Click to upload spreadsheet</p>
                              <p className="text-xs text-muted-foreground mt-1">Supports .csv, .xls, .xlsx</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <Button
                      className="w-full shadow-glow-primary h-12 text-md font-bold"
                      onClick={handleStartCampaign}
                      disabled={sending || !file}
                    >
                      {sending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Starting Sequence...</> : <><Rocket className="mr-2 h-5 w-5" /> Launch Bulk Campaign</>}
                    </Button>
                  </CardContent>
                </Card>

                {/* SINGLE LEAD CARD */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-lg h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User size={20} className="text-indigo-500" /> 2. Quick Add Lead
                    </CardTitle>
                    <CardDescription>Manually inject a single high-priority lead into the active sequence.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="manual_email">Lead Email Address <span className="text-destructive">*</span></Label>
                      <Input id="manual_email" type="email" placeholder="executive@enterprise.com" className="bg-background/50" />
                    </div>

                    {customFields.filter(f => f.active).length > 0 && (
                      <div className="space-y-4 pt-2">
                        <Separator />
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dynamic Variables</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {customFields.filter(f => f.active).map(f => (
                            <div className="space-y-1.5" key={f._id}>
                              <Label>{f.name}</Label>
                              <Input
                                type="text"
                                placeholder={`Value for {{${f.name}}}`}
                                className="bg-background/50"
                                onChange={(e) => setDynamicValues(prev => ({ ...prev, [f.name]: e.target.value }))}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex gap-3 text-sm mt-4">
                      <InfoIcon className="text-primary shrink-0 mt-0.5" size={16} />
                      <div className="text-foreground/80">
                        <span className="font-bold text-primary">Pro Tip:</span> Use spintax like <code className="bg-background/50 px-1 py-0.5 rounded border border-border text-xs">{'{Hi|Hello|Hey}'}</code> in templates to maximize inbox placement.
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button
                        className="flex-1 font-semibold"
                        onClick={async (e) => {
                          const btn = e.currentTarget;
                          const em = document.getElementById('manual_email')?.value;
                          if (!em) return showToast("Email is required", "error");
                          if (btn.disabled) return;
                          btn.disabled = true;
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
                            setTimeout(() => { btn.disabled = false; }, 1500);
                          } catch (err) { showToast(err.response?.data?.error || "Error", "error"); btn.disabled = false; }
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add to Sequence
                      </Button>
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={async (e) => {
                          const btn = e.currentTarget;
                          const em = document.getElementById('manual_email')?.value;
                          if (!em) return showToast("Email is required", "error");
                          if (btn.disabled) return;
                          btn.disabled = true;
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
                            setTimeout(() => { btn.disabled = false; }, 1500);
                          } catch (err) { showToast(err.response?.data?.error || "Error", "error"); btn.disabled = false; }
                        }}
                      >
                        <Archive className="mr-2 h-4 w-4" /> Save to Archive
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
              <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <History size={20} className="text-primary" /> Delivery Logs
                      </CardTitle>
                      <CardDescription>Monitor your active campaigns and past outreaches.</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                {selectedIds.length > 0 && (
                  <div className="mx-6 mb-4 p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-inner">
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <Info size={18} /> {selectedIds.length} leads selected
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <select
                        className="flex h-10 w-full sm:w-[200px] items-center justify-between rounded-md border border-primary/30 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                        <option value="">Bulk Send Template...</option>
                        <optgroup label="Auto Sequence">
                          <option value="step1">Sequence: Step 1 (Intro)</option>
                          <option value="step2">Sequence: Step 2 (Follow-up)</option>
                          <option value="step3">Sequence: Step 3 (Final)</option>
                        </optgroup>
                        <optgroup label="Custom Templates">
                          {customTemplates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </optgroup>
                      </select>
                      <Button variant="secondary" onClick={handleBulkArchive} className="bg-background border border-border hover:bg-muted text-foreground">
                        <Archive className="mr-2 h-4 w-4" /> Bulk Archive
                      </Button>
                      <Button variant="destructive" onClick={() => setSelectedIds([])} className="shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <CardContent className="p-0">
                  <div className="overflow-x-auto rounded-b-xl">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold border-y border-border">
                        <tr>
                          <th className="px-4 py-3 w-[40px] text-center">
                            <input
                              type="checkbox"
                              className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                              checked={selectedIds.length > 0 && selectedIds.length === recipients.filter(r => !r.isArchived).length}
                              onChange={() => toggleSelectAll(recipients.filter(r => !r.isArchived))}
                            />
                          </th>
                          <th className="px-4 py-3">Recipient</th>
                          <th className="px-4 py-3">Sequence</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Last Activity</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
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
                            <tr key={i} className={`transition-colors hover:bg-muted/30 ${selectedIds.includes(r._id) ? 'bg-primary/5' : ''}`}>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                                  checked={selectedIds.includes(r._id)}
                                  onChange={() => toggleSelectOne(r._id)}
                                />
                              </td>
                              <td className="px-4 py-3 font-medium text-primary hover:text-primary/80 cursor-pointer underline decoration-primary/30 underline-offset-4" onClick={() => setIntelLead(r)}>
                                {r.email}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {r.step > 3 ? <span className="text-emerald-500 font-medium">Completed</span> : `Step ${r.step}`}
                              </td>
                              <td className="px-4 py-3">
                                <StatusBadge status={r.status} />
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                {r.lastSentAt ? new Date(r.lastSentAt).toLocaleString() : 'Queued'}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {r.status !== 'finished' && r.status !== 'replied' && r.status !== 'stopped' && r.status !== 'sending' && (
                                    <>
                                      <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10" onClick={async () => { await axios.post(`/api/send-now/${r._id}`); fetchRecipients(); fetchStats(); }}>
                                        Send Next
                                      </Button>
                                      <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-amber-500/30 text-amber-600 hover:bg-amber-500/10" onClick={async () => { await axios.post(`/api/stop/${r._id}`); fetchRecipients(); fetchStats(); }}>
                                        Stop
                                      </Button>
                                    </>
                                  )}

                                  {r.status === 'stopped' && (
                                    <>
                                      <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-primary/30 text-primary hover:bg-primary/10" onClick={async () => { await axios.post(`/api/continue/${r._id}`); fetchRecipients(); fetchStats(); }}>
                                        Continue
                                      </Button>
                                      <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10" onClick={async () => { await axios.post(`/api/restart/${r._id}`); fetchRecipients(); fetchStats(); }}>
                                        Restart
                                      </Button>
                                      <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-muted-foreground hover:bg-muted" onClick={async () => { await axios.post(`/api/archive/${r._id}`); fetchRecipients(); fetchStats(); }}>
                                        Archive
                                      </Button>
                                    </>
                                  )}

                                  {selectedLeadForTpl === r._id ? (
                                    <select
                                      className="flex h-8 w-[150px] items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                      onChange={(e) => {
                                        if (e.target.value) handleSendCustomTemplate(r._id, e.target.value);
                                        setSelectedLeadForTpl(null);
                                      }}
                                    >
                                      <option value="">Pick Template...</option>
                                      <optgroup label="Auto Sequence">
                                        <option value="step1">Step 1 (Intro)</option>
                                        <option value="step2">Step 2 (Follow-up)</option>
                                        <option value="step3">Step 3 (Final)</option>
                                      </optgroup>
                                      <optgroup label="Custom Templates">
                                        {customTemplates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                      </optgroup>
                                      <option value="">Cancel</option>
                                    </select>
                                  ) : (
                                    <Button variant="outline" size="sm" className="h-8 text-xs font-medium" onClick={() => setSelectedLeadForTpl(r._id)}>
                                      Custom
                                    </Button>
                                  )}

                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => {
                                    setConfirmModal({
                                      open: true,
                                      title: `Delete ${r.email} forever?`,
                                      onConfirm: async () => {
                                        await axios.delete(`/api/delete-recipient/${r._id}`);
                                        showToast("Lead Deleted!", "success");
                                        fetchRecipients(); fetchStats();
                                      }
                                    });
                                  }}>
                                    <Archive size={14} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'variables' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
              <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database size={20} className="text-primary" /> Variable Manager
                  </CardTitle>
                  <CardDescription>Add or toggle custom fields for your outreach forms.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-3 items-end">
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="new_var">Create New Variable</Label>
                      <Input
                        id="new_var"
                        placeholder="e.g. City, Industry, Size"
                        value={newFieldName}
                        onChange={e => setNewFieldName(e.target.value)}
                        className="bg-background/50"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newFieldName) {
                            axios.post('/api/custom-fields', { name: newFieldName }).then(() => {
                              setNewFieldName('');
                              fetchCustomFields();
                              showToast("Field Added!", "success");
                            });
                          }
                        }}
                      />
                    </div>
                    <Button className="shadow-glow-primary" onClick={async () => {
                      if (!newFieldName) return;
                      await axios.post('/api/custom-fields', { name: newFieldName });
                      setNewFieldName('');
                      fetchCustomFields();
                      showToast("Field Added!", "success");
                    }}>
                      <Plus className="mr-2 h-4 w-4" /> Add Field
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <h4 className="font-semibold text-sm mb-4 text-foreground/80 uppercase tracking-wider">Active Variables</h4>
                    <div className="space-y-3">
                      {customFields.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No custom variables created yet.</p>
                      ) : (
                        customFields.map(f => (
                          <div key={f._id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${f.active ? 'bg-background border-primary/20' : 'bg-muted/30 border-border/50 opacity-70'}`}>
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                checked={f.active}
                                onChange={async () => {
                                  await axios.put(`/api/custom-fields/${f._id}`, { active: !f.active });
                                  fetchCustomFields();
                                  showToast("Field Updated!", "success");
                                }}
                              />
                              <span className={`font-medium ${f.active ? 'text-foreground' : 'text-muted-foreground line-through'}`}>{f.name}</span>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive px-2" onClick={() => {
                              setConfirmModal({
                                open: true,
                                title: `Delete variable "${f.name}"?`,
                                onConfirm: async () => {
                                  await axios.delete(`/api/custom-fields/${f._id}`);
                                  fetchCustomFields();
                                  showToast("Field Deleted!", "success");
                                }
                              });
                            }}>
                              <Archive className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'archive' && (
            <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
              <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Archive size={20} className="text-primary" /> Archive
                  </CardTitle>
                  <CardDescription>Records moved here are hidden from Delivery Logs but kept in database.</CardDescription>
                </CardHeader>

                {selectedIds.length > 0 && (
                  <div className="mx-6 mb-4 p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <span className="font-bold">{selectedIds.length}</span> Selected
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <select
                        className="flex h-10 w-full sm:w-[200px] items-center justify-between rounded-md border border-primary/30 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                        <option value="">Bulk Send Template...</option>
                        <optgroup label="Auto Sequence">
                          <option value="step1">Sequence: Step 1 (Intro)</option>
                          <option value="step2">Sequence: Step 2 (Follow-up)</option>
                          <option value="step3">Sequence: Step 3 (Final)</option>
                        </optgroup>
                        <optgroup label="Custom Templates">
                          {customTemplates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </optgroup>
                      </select>
                      <Button variant="destructive" onClick={() => {
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
                      }} className="shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                        Delete Selected
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedIds([])} className="border-border">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <CardContent className="p-0">
                  <div className="overflow-x-auto rounded-b-xl">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold border-y border-border">
                        <tr>
                          <th className="px-4 py-3 w-[40px] text-center">
                            <input
                              type="checkbox"
                              className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                              checked={selectedIds.length > 0 && recipients.filter(r => r.isArchived).length === selectedIds.length}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedIds(recipients.filter(r => r.isArchived).map(r => r._id));
                                else setSelectedIds([]);
                              }}
                            />
                          </th>
                          <th className="px-4 py-3">Recipient</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {recipients
                          .filter(r => r.isArchived)
                          .sort((a, b) => {
                            const priority = (s) => {
                              const low = s.toLowerCase();
                              if (low.includes('step')) return 1;
                              if (low === 'pending') return 2;
                              if (low === 'finished') return 3;
                              if (low === 'replied') return 4;
                              if (low === 'stopped') return 100;
                              return 50;
                            };
                            return priority(a.status) - priority(b.status);
                          })
                          .map((r, i) => (
                            <tr key={i} className={`transition-colors hover:bg-muted/30 ${selectedIds.includes(r._id) ? 'bg-primary/5' : ''}`}>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                                  checked={selectedIds.includes(r._id)}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedIds(prev => [...prev, r._id]);
                                    else setSelectedIds(prev => prev.filter(id => id !== r._id));
                                  }}
                                />
                              </td>
                              <td className="px-4 py-3 font-medium text-primary hover:text-primary/80 cursor-pointer underline decoration-primary/30 underline-offset-4" onClick={() => setIntelLead(r)}>
                                {r.email}
                              </td>
                              <td className="px-4 py-3">
                                <StatusBadge status={r.status} />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10" onClick={async () => { await axios.post(`/api/restart/${r._id}`); fetchRecipients(); fetchStats(); }}>
                                    Restore & Restart
                                  </Button>

                                  {selectedLeadForTpl === r._id ? (
                                    <select
                                      className="flex h-8 w-[150px] items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                      onChange={(e) => {
                                        if (e.target.value) handleSendCustomTemplate(r._id, e.target.value);
                                        setSelectedLeadForTpl(null);
                                      }}
                                    >
                                      <option value="">Pick Template...</option>
                                      <optgroup label="Auto Sequence">
                                        <option value="step1">Step 1 (Intro)</option>
                                        <option value="step2">Step 2 (Follow-up)</option>
                                        <option value="step3">Step 3 (Final)</option>
                                      </optgroup>
                                      <optgroup label="Custom Templates">
                                        {customTemplates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                      </optgroup>
                                      <option value="">Cancel</option>
                                    </select>
                                  ) : (
                                    <Button variant="outline" size="sm" className="h-8 text-xs font-medium" onClick={() => setSelectedLeadForTpl(r._id)}>
                                      Custom
                                    </Button>
                                  )}

                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => {
                                    setConfirmModal({
                                      open: true,
                                      title: `Delete ${r.email} forever?`,
                                      onConfirm: async () => {
                                        await axios.delete(`/api/delete-recipient/${r._id}`);
                                        showToast("Lead Deleted!", "success");
                                        fetchRecipients(); fetchStats();
                                      }
                                    });
                                  }}>
                                    <Archive size={14} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Profile Settings</h2>
                <p className="text-muted-foreground text-sm font-medium">Update your professional identity and presence.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-1 border-border/40 bg-card/40 backdrop-blur-sm shadow-sm overflow-hidden h-fit sticky top-24">
                  <div className="h-24 bg-gradient-to-br from-primary/20 to-primary/5 border-b border-border/40"></div>
                  <CardContent className="p-6 -mt-12 text-center">
                    <div className="relative inline-block group">
                      <Avatar className="h-24 w-24 border-4 border-background shadow-2xl mx-auto mb-4 transition-transform group-hover:scale-105 duration-300">
                        {profile.profilePic ? (
                          <AvatarImage src={profile.profilePic} className="object-cover" />
                        ) : (
                          <AvatarFallback className="bg-primary text-primary-foreground font-bold text-2xl">
                            {profile.userName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <label className="absolute bottom-4 right-0 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary/90 transition-colors border-2 border-background">
                        <Camera size={14} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                      </label>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{profile.userName}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">{profile.userRole}</p>
                    <div className="mt-6 pt-6 border-t border-border/30">
                      <Button variant="outline" size="sm" className="w-full rounded-xl border-border/60 relative overflow-hidden group">
                        <span className="relative z-10 flex items-center gap-2">
                          <Upload size={14} /> Change Avatar
                        </span>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleAvatarUpload} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2 border-border/40 bg-card/40 backdrop-blur-sm shadow-sm">
                  <CardHeader className="border-b border-border/40 bg-muted/20">
                    <CardTitle className="text-sm font-bold">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Display Name</Label>
                        <Input
                          value={profile.userName}
                          onChange={(e) => setProfile(prev => ({ ...prev, userName: e.target.value }))}
                          className="bg-background/50 border-border/40 focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Your Role</Label>
                        <Input
                          value={profile.userRole}
                          onChange={(e) => setProfile(prev => ({ ...prev, userRole: e.target.value }))}
                          className="bg-background/50 border-border/40 focus:border-primary/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Public Email (Optional)</Label>
                      <Input
                        value={profile.publicEmail}
                        onChange={(e) => setProfile(prev => ({ ...prev, publicEmail: e.target.value }))}
                        placeholder="admin@leadpulse.io"
                        className="bg-background/50 border-border/40 focus:border-primary/50"
                      />
                    </div>
                    <div className="pt-4">
                      <Button onClick={() => handleSaveProfile({ userName: profile.userName, userRole: profile.userRole, publicEmail: profile.publicEmail })} className="rounded-xl shadow-glow-primary px-8">Save Profile</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'team_management' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Team Management</h2>
                  <p className="text-muted-foreground text-sm font-medium">Create logins for your team and control who can access the workspace.</p>
                </div>
                <Button variant="outline" className="rounded-xl" onClick={fetchTeamMembers} disabled={teamLoading}>
                  {teamLoading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <RefreshCw size={16} className="mr-2" />}
                  Refresh Team
                </Button>
              </div>

              {teamMessage && (
                <div className="p-4 rounded-xl border border-border/40 bg-card/60 text-sm text-foreground">
                  {teamMessage}
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <Card className="xl:col-span-1 border-border/40 bg-card/40 backdrop-blur-sm shadow-sm">
                  <CardHeader className="border-b border-border/40 bg-muted/20">
                    <CardTitle className="text-sm font-bold">Add Team Member</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <form className="space-y-4" onSubmit={handleCreateTeamMember}>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Name</Label>
                        <Input
                          value={teamForm.fullName}
                          onChange={(e) => setTeamForm(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Aman Sharma"
                          className="bg-background/50 border-border/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Number</Label>
                        <Input
                          value={teamForm.phone}
                          onChange={(e) => setTeamForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+91 9876543210"
                          className="bg-background/50 border-border/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Position</Label>
                        <Input
                          value={teamForm.position}
                          onChange={(e) => setTeamForm(prev => ({ ...prev, position: e.target.value }))}
                          placeholder="Sales Executive"
                          className="bg-background/50 border-border/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Login ID</Label>
                        <Input
                          value={teamForm.loginId}
                          onChange={(e) => setTeamForm(prev => ({ ...prev, loginId: e.target.value }))}
                          placeholder="Optional. Defaults to phone"
                          className="bg-background/50 border-border/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Password</Label>
                        <Input
                          type="password"
                          value={teamForm.password}
                          onChange={(e) => setTeamForm(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Set team password"
                          className="bg-background/50 border-border/40"
                        />
                      </div>
                      <Button type="submit" className="w-full rounded-xl shadow-glow-primary" disabled={teamSaving}>
                        {teamSaving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Plus size={16} className="mr-2" />}
                        Create Member
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="xl:col-span-2 border-border/40 bg-card/40 backdrop-blur-sm shadow-sm overflow-hidden">
                  <CardHeader className="border-b border-border/40 bg-muted/20">
                    <CardTitle className="text-sm font-bold flex items-center justify-between">
                      Team Members
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{teamMembers.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/20 text-xs uppercase tracking-wider text-muted-foreground">
                          <tr>
                            <th className="text-left p-4">Name</th>
                            <th className="text-left p-4">Phone</th>
                            <th className="text-left p-4">Position</th>
                            <th className="text-left p-4">Login ID</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-right p-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teamMembers.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="p-10 text-center text-sm text-muted-foreground">
                                {teamLoading ? 'Loading team members...' : 'No team members added yet.'}
                              </td>
                            </tr>
                          ) : teamMembers.map((member) => (
                            <tr key={member._id} className="border-t border-border/40">
                              <td className="p-4 font-semibold text-foreground">
                                <button
                                  type="button"
                                  onClick={() => openTeamAccess(member)}
                                  className="text-left hover:text-primary transition-colors"
                                >
                                  {member.fullName}
                                </button>
                              </td>
                              <td className="p-4 text-sm text-muted-foreground">{member.phone || '-'}</td>
                              <td className="p-4 text-sm text-muted-foreground">{member.position || '-'}</td>
                              <td className="p-4 text-sm font-mono text-foreground">{member.loginId}</td>
                              <td className="p-4">
                                <Badge variant="outline" className={member.active ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}>
                                  {member.active ? 'Active' : 'Disabled'}
                                </Badge>
                              </td>
                              <td className="p-4 text-right">
                                {member.role === 'admin' ? (
                                  <span className="text-xs text-muted-foreground font-semibold">Admin</span>
                                ) : (
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="rounded-lg"
                                      onClick={() => openTeamAccess(member)}
                                    >
                                      <Shield size={14} className="mr-2" />
                                      Access
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="rounded-lg"
                                      onClick={() => openTeamEdit(member)}
                                    >
                                      <Edit size={14} className="mr-2" />
                                      Edit
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="rounded-lg"
                                      disabled={!member.active}
                                      onClick={() => handleDeactivateTeamMember(member._id)}
                                    >
                                      Deactivate
                                    </Button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Dialog open={teamEditOpen} onOpenChange={(open) => {
                setTeamEditOpen(open);
                if (!open) setTeamEditTarget(null);
              }}>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Edit Team Member</DialogTitle>
                  </DialogHeader>
                  <form className="space-y-4" onSubmit={handleUpdateTeamMember}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Name</Label>
                        <Input
                          value={teamEditForm.fullName}
                          onChange={(e) => setTeamEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                          className="bg-background/50 border-border/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Number</Label>
                        <Input
                          value={teamEditForm.phone}
                          onChange={(e) => setTeamEditForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="bg-background/50 border-border/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Position</Label>
                        <Input
                          value={teamEditForm.position}
                          onChange={(e) => setTeamEditForm(prev => ({ ...prev, position: e.target.value }))}
                          className="bg-background/50 border-border/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Login ID</Label>
                        <Input
                          value={teamEditForm.loginId}
                          onChange={(e) => setTeamEditForm(prev => ({ ...prev, loginId: e.target.value }))}
                          className="bg-background/50 border-border/40"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Password</Label>
                      <Input
                        type="password"
                        value={teamEditForm.password}
                        onChange={(e) => setTeamEditForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Leave blank to keep current password"
                        className="bg-background/50 border-border/40"
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">Account Status</p>
                        <p className="text-xs text-muted-foreground">Disable or re-enable the selected member.</p>
                      </div>
                      <Button
                        type="button"
                        variant={teamEditForm.active ? 'outline' : 'secondary'}
                        className="rounded-lg"
                        onClick={() => setTeamEditForm(prev => ({ ...prev, active: !prev.active }))}
                      >
                        {teamEditForm.active ? 'Active' : 'Disabled'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <Button type="button" variant="outline" className="rounded-xl" onClick={() => setTeamEditOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="rounded-xl shadow-glow-primary" disabled={teamEditSaving}>
                        {teamEditSaving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeTab === 'team_access' && currentUser?.role === 'admin' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-10">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Access Control</h2>
                  <p className="text-muted-foreground text-sm font-medium">Choose which tabs this member can see after login.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {teamAccessTarget ? teamAccessTarget.fullName : 'No member selected'}
                  </Badge>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      setActiveTab('team_management');
                      localStorage.setItem('activeTab', 'team_management');
                    }}
                  >
                    Back to Team
                  </Button>
                </div>
              </div>

              {!teamAccessTarget ? (
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
                  <CardContent className="p-10 text-center">
                    <Users size={36} className="mx-auto text-primary mb-4" />
                    <h3 className="text-lg font-bold text-foreground mb-2">Select a team member</h3>
                    <p className="text-sm text-muted-foreground">Open Team Management and click a member to manage tab access.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <Card className="xl:col-span-1 border-border/40 bg-card/50 backdrop-blur-sm shadow-sm h-fit sticky top-24">
                    <div className="h-24 bg-gradient-to-br from-primary/20 to-primary/5 border-b border-border/40"></div>
                    <CardContent className="p-6 -mt-12">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-4 border-background shadow-2xl">
                          <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xl">
                            {teamAccessTarget.fullName?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className="text-xl font-extrabold text-foreground truncate">{teamAccessTarget.fullName}</h3>
                          <p className="text-sm text-muted-foreground truncate">{teamAccessTarget.loginId}</p>
                          <div className="mt-2 flex gap-2 flex-wrap">
                            <Badge variant="outline" className={teamAccessTarget.active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}>
                              {teamAccessTarget.active ? 'Active' : 'Disabled'}
                            </Badge>
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 capitalize">
                              {teamAccessTarget.role || 'member'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 space-y-3 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Phone</span>
                          <span className="text-foreground font-semibold">{teamAccessTarget.phone || '-'}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Position</span>
                          <span className="text-foreground font-semibold">{teamAccessTarget.position || '-'}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Enabled tabs</span>
                          <span className="text-foreground font-semibold">{Object.values(teamAccessForm || {}).filter(Boolean).length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="xl:col-span-2 space-y-6">
                    {ACCESS_SECTIONS.map(section => (
                      <Card key={section.label} className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-border/40 bg-muted/20">
                          <CardTitle className="text-sm font-bold flex items-center justify-between">
                            {section.label}
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              {section.items.filter(item => teamAccessForm[item.id]).length}/{section.items.length}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          {section.items.map(item => {
                            const Icon = item.icon;
                            const locked = !!item.locked;
                            return (
                              <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border/30 last:border-b-0">
                                <div className="flex items-center gap-4 min-w-0">
                                  <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <Icon size={18} />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-sm font-semibold text-foreground">{item.label}</span>
                                      {locked && (
                                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-amber-500/10 text-amber-500 border-amber-500/20">
                                          Required
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      Controls whether this tab appears for the member after login.
                                    </p>
                                  </div>
                                </div>
                                <Switch
                                  checked={locked ? true : !!teamAccessForm[item.id]}
                                  onCheckedChange={() => !locked && toggleTeamAccess(item.id)}
                                  disabled={locked || teamAccessSaving}
                                />
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    ))}

                    <div className="flex items-center justify-end gap-3">
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => {
                          setActiveTab('team_management');
                          localStorage.setItem('activeTab', 'team_management');
                        }}
                      >
                        Close
                      </Button>
                      <Button
                        className="rounded-xl shadow-glow-primary"
                        onClick={handleSaveTeamAccess}
                        disabled={teamAccessSaving}
                      >
                        {teamAccessSaving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <ShieldCheck size={16} className="mr-2" />}
                        Save Access
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Security & Access</h2>
                <p className="text-muted-foreground text-sm font-medium">Configure your password, 2FA, and session management.</p>
              </div>

              <div className="space-y-6">
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm">
                  <CardHeader className="border-b border-border/40 bg-muted/20">
                    <CardTitle className="text-sm font-bold">Change Password</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Current Password</Label>
                        <Input type="password" placeholder="••••••••" className="bg-background/50 border-border/40" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider opacity-60">New Password</Label>
                        <Input type="password" placeholder="••••••••" className="bg-background/50 border-border/40" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Confirm New</Label>
                        <Input type="password" placeholder="••••••••" className="bg-background/50 border-border/40" />
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button className="rounded-xl shadow-glow-primary">Update Password</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm">
                  <CardHeader className="border-b border-border/40 bg-muted/20">
                    <CardTitle className="text-sm font-bold flex items-center justify-between">
                      Two-Factor Authentication
                      <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20 uppercase tracking-wider">Disabled</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-foreground">Authenticator App</p>
                      <p className="text-xs text-muted-foreground">Use an app like Google Authenticator or 1Password to generate codes.</p>
                    </div>
                    <Button variant="outline" className="rounded-xl border-border/60">Configure</Button>
                  </CardContent>
                </Card>

                <Card className="border-border/40 bg-destructive/5 border-destructive/20 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-destructive">Danger Zone</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Permanently delete your account and all associated lead data. This action is irreversible.</p>
                    <Button variant="destructive" className="rounded-xl shadow-sm">Delete Account</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'replied_leads' && (
            <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
              <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare size={20} className="text-primary" /> Email Replied Leads
                  </CardTitle>
                  <CardDescription>All leads who have responded to your emails.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto rounded-b-xl">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold border-y border-border">
                        <tr>
                          <th className="px-6 py-3">Recipient</th>
                          <th className="px-6 py-3">Latest Reply</th>
                          <th className="px-6 py-3">Time</th>
                          <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {(() => {
                          const repliedEmailLeads = recipients.filter(r => r.status === 'replied' && !r.email.includes('@whatsapp.com'));
                          return repliedEmailLeads.length > 0 ? (
                            repliedEmailLeads
                              .sort((a, b) => {
                                const dateA = a.replies && a.replies.length > 0 ? new Date(a.replies[a.replies.length - 1].receivedAt) : 0;
                                const dateB = b.replies && b.replies.length > 0 ? new Date(b.replies[b.replies.length - 1].receivedAt) : 0;
                                return dateB - dateA;
                              })
                              .map((r, i) => (
                                <React.Fragment key={i}>
                                  <tr
                                    onClick={() => setExpandedLeadId(expandedLeadId === r._id ? null : r._id)}
                                    className={`transition-colors cursor-pointer hover:bg-muted/30 ${expandedLeadId === r._id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                                  >
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                                          {r.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                          <div className="font-bold text-foreground text-sm">{r.email}</div>
                                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <MessageSquare size={10} /> {(r.replies || []).length} interactions
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-[280px]">
                                      <div className="text-sm font-semibold text-foreground mb-1 truncate">
                                        {r.replies && r.replies.length > 0 ? r.replies[r.replies.length - 1].subject : 'No content'}
                                      </div>
                                      <div className="text-xs text-muted-foreground truncate">
                                        {r.replies && r.replies.length > 0 ? (r.replies[r.replies.length - 1].body || '').substring(0, 60) + '...' : ''}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-semibold text-primary">
                                          {r.replies && r.replies.length > 0 ? new Date(r.replies[r.replies.length - 1].receivedAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground">
                                          {r.replies && r.replies.length > 0 ? new Date(r.replies[r.replies.length - 1].receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <Badge variant={expandedLeadId === r._id ? "default" : "secondary"} className="cursor-pointer">
                                        {expandedLeadId === r._id ? 'Close' : 'View Thread'} <ChevronDown size={14} className={`ml-1 transition-transform ${expandedLeadId === r._id ? 'rotate-180' : ''}`} />
                                      </Badge>
                                    </td>
                                  </tr>
                                  {expandedLeadId === r._id && (
                                    <tr>
                                      <td colSpan="4" className="p-0 bg-muted/10">
                                        <div className="p-6 m-4 border border-border/60 rounded-xl bg-card shadow-sm">
                                          <div className="flex flex-col gap-6 relative">
                                            {/* Vertical Line Connector */}
                                            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary/30 to-transparent"></div>

                                            {[...(r.replies || [])].sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)).map((reply, idx) => (
                                              <div key={idx} className="relative pl-11">
                                                {/* Message Node */}
                                                <div className={`absolute left-[11px] top-1.5 w-4 h-4 rounded-full border-[3px] border-primary z-10 ${idx === 0 ? 'bg-primary shadow-[0_0_10px_rgba(66,120,244,0.4)]' : 'bg-background'}`}></div>

                                                <div className={`bg-background rounded-xl border border-border/60 overflow-hidden transition-all duration-300 ${idx === 0 ? 'shadow-md ring-1 ring-primary/20' : 'shadow-sm'}`}>
                                                  <div
                                                    className={`px-4 py-3 cursor-pointer flex justify-between items-center ${idx === 0 ? 'bg-primary/5 border-b border-primary/10' : 'bg-muted/30 border-b border-border/40 hover:bg-muted/50'}`}
                                                    onClick={() => setExpandedReplyIdx(expandedReplyIdx === idx ? null : idx)}
                                                  >
                                                    <div className="flex items-center gap-3">
                                                      {idx === 0 && <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 text-[10px] px-2 py-0">LATEST</Badge>}
                                                      <span className="font-bold text-sm text-foreground">{reply.subject}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                      {reply.type === 'whatsapp' ? <MessageSquare size={12} className="text-emerald-500" /> : <Mail size={12} className="text-primary" />}
                                                      <span>{reply.type === 'whatsapp' ? 'WhatsApp' : 'Email'}</span>
                                                      <span>•</span>
                                                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(reply.receivedAt).toLocaleString()}</span>
                                                    </div>
                                                  </div>
                                                  {expandedReplyIdx === idx && (
                                                    <div className="p-5 bg-background">
                                                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-medium">
                                                        {reply.body}
                                                      </div>
                                                      <div className="mt-5 pt-4 border-t border-border/50 flex gap-3">
                                                        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm border-transparent" onClick={() => handleWhatsappReply(r.email)}>
                                                          <Reply size={14} className="mr-2" /> Direct WhatsApp
                                                        </Button>
                                                        <Button size="sm" variant="outline">
                                                          Mark as Important
                                                        </Button>
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
                              <td colSpan="4" className="p-16 text-center">
                                <div className="flex flex-col items-center gap-4">
                                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                    <MessageSquare size={32} />
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-semibold text-foreground mb-1">No replies detected yet</h4>
                                    <p className="text-sm text-muted-foreground">Your leads will appear here as soon as they respond to your emails.</p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'whatsapp_linker' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in py-10">
              <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-xl overflow-hidden relative">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                <CardContent className="p-10 text-center flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 shadow-inner border border-emerald-500/20">
                    <Phone size={40} />
                  </div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-3">WhatsApp Automation Linker</h2>
                  <p className="text-muted-foreground mb-10 max-w-md">Scan the QR code to sync your WhatsApp and start receiving replies directly here.</p>

                  <div className="w-full bg-muted/30 p-8 rounded-2xl border-2 border-dashed border-border/60 flex flex-col items-center gap-6">
                    {waStatus === 'connected' ? (
                      <div className="flex flex-col items-center gap-4 text-emerald-500 animate-in zoom-in duration-300">
                        <CheckCircle size={72} className="drop-shadow-sm" />
                        <div>
                          <h3 className="text-xl font-bold text-foreground m-0">WhatsApp Connected!</h3>
                          <p className="text-sm text-muted-foreground mt-1">System is now monitoring your messages for lead replies.</p>
                        </div>
                        <Button
                          variant="destructive"
                          className="mt-4 font-semibold shadow-sm"
                          onClick={async () => { try { await axios.post('/api/whatsapp/logout'); fetchWaStatus(); } catch (e) { } }}
                        >
                          Disconnect WhatsApp
                        </Button>
                      </div>
                    ) : waStatus === 'qr-ready' && waQr ? (
                      <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
                        <div className="bg-white p-4 rounded-2xl shadow-xl border border-border/50">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(waQr)}`}
                            alt="WhatsApp QR Code"
                            className="w-[250px] h-[250px]"
                          />
                        </div>
                        <div className="flex items-center gap-3 text-amber-500 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
                          <Loader2 className="animate-spin" size={18} />
                          <span className="font-semibold text-sm">Waiting for scan...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-5 text-muted-foreground py-8">
                        <Loader2 className="animate-spin text-primary" size={48} />
                        <p className="font-medium">Initializing WhatsApp Engine...</p>
                        <Button
                          variant="outline"
                          className="mt-2 border-primary/30 text-primary hover:bg-primary/10 font-semibold"
                          onClick={async () => {
                            try { await axios.post('/api/whatsapp/restart'); } catch (e) { }
                            setTimeout(fetchWaStatus, 2000);
                          }}
                        >
                          🔄 Restart Engine & Get QR
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
                    <div className="p-5 bg-card rounded-2xl border border-border/50 shadow-sm flex gap-4 items-start">
                      <div className="mt-1 p-2 bg-primary/10 text-primary rounded-lg">
                        <Globe size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm mb-1">Real-time Sync</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">Replies appear in your dashboard instantly without refreshing.</p>
                      </div>
                    </div>
                    <div className="p-5 bg-card rounded-2xl border border-border/50 shadow-sm flex gap-4 items-start">
                      <div className="mt-1 p-2 bg-primary/10 text-primary rounded-lg">
                        <Phone size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm mb-1">Multi-device</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">Keep using WhatsApp on your phone normally while linked.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-border/40 w-full text-left">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                        <Zap size={20} />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">Official API (Interakt)</h3>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-primary/5 border border-indigo-500/10">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-sm font-bold text-foreground">Interakt Integration Status</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Official WhatsApp Business API</p>
                        </div>
                        <Badge className="bg-emerald-500 text-white border-transparent">ACTIVE</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                        API is connected. To use this mode, select "Interakt" in the CRM Lead Group dropdown when sending messages.
                        <br /><span className="text-indigo-500 font-bold mt-1 block">Note: Ensure "lead_pulse_generic" template is approved in Interakt.</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
              <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
                <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-lg">
                  <CardHeader className="pb-4 border-b border-border/50">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Mail size={20} className="text-primary" /> Email Enricher
                        </CardTitle>
                        <CardDescription>All globally enriched emails — deduplicated across every scraped folder.</CardDescription>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 py-1.5 px-3">
                          Total: {uniqueEmailLeads.length}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setAddEmailForm({ email: '', name: '', phone: '', city: '', keyword: '' }); setAddEmailModal(true); }}
                        >
                          <Plus size={16} className="mr-1.5" /> Add Email
                        </Button>

                        {pendingLeads.length > 0 && (
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-white shadow-glow-primary"
                            disabled={isBulkFinding}
                            onClick={() => handleBulkFindEmails(pendingLeads.map(l => l._id))}
                          >
                            {isBulkFinding ? <><Loader2 size={16} className="animate-spin mr-1.5" /> Searching...</> : <><Search size={16} className="mr-1.5" /> Find Emails ({pendingLeads.length})</>}
                          </Button>
                        )}

                        {uniqueEmailLeads.length > 0 && (
                          enricherBulkPicker ? (
                            <select
                              className="flex h-9 w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              autoFocus
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
                            <Button
                              size="sm"
                              className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                              disabled={isEnricherSending}
                              onClick={() => setEnricherBulkPicker(true)}
                            >
                              {isEnricherSending ? <><Loader2 size={16} className="animate-spin mr-1.5" /> Sending...</> : <><Send size={16} className="mr-1.5" /> Send All ({uniqueEmailLeads.length})</>}
                            </Button>
                          )
                        )}

                        {uniqueEmailLeads.length > 0 && (
                          <Button
                            variant={enricherEditMode ? "default" : "outline"}
                            size="sm"
                            onClick={() => { setEnricherEditMode(m => !m); if (enricherEditMode) setSelectedIds([]); }}
                          >
                            {enricherEditMode ? 'Done' : 'Edit'}
                          </Button>
                        )}

                        <Button variant="ghost" size="sm" onClick={fetchSavedLeads}>
                          Refresh
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {(isBulkFinding || emailFindLog) && (
                    <div className="mx-6 mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary flex items-center">
                      {isBulkFinding && <Loader2 size={16} className="animate-spin mr-2" />}
                      {emailFindLog || 'Starting...'}
                    </div>
                  )}

                  {enricherEditMode && selectedIds.length > 0 && uniqueEmailLeads.some(l => selectedIds.includes(l._id)) && (
                    <div className="mx-6 mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <Info size={18} /> {selectedIds.filter(id => uniqueEmailLeads.some(l => l._id === id)).length} emails selected
                      </div>
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <Button
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-sm"
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
                          {isEnricherSending ? <><Loader2 size={16} className="animate-spin mr-1.5" /> Starting...</> : <><Rocket size={16} className="mr-1.5" /> Start Email Marketing (3-Step Auto)</>}
                        </Button>
                        <select
                          className="flex h-10 w-[200px] items-center justify-between rounded-md border border-primary/30 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                          <option value="">Bulk Send Template...</option>
                          <optgroup label="Auto Sequence">
                            <option value="step1">Sequence: Step 1 (Intro)</option>
                            <option value="step2">Sequence: Step 2 (Follow-up)</option>
                            <option value="step3">Sequence: Step 3 (Final)</option>
                          </optgroup>
                          <optgroup label="Custom Templates">
                            {customTemplates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                          </optgroup>
                        </select>
                        <Button variant="destructive" onClick={() => setSelectedIds([])} className="shadow-sm">Cancel</Button>
                      </div>
                    </div>
                  )}

                  <CardContent className="p-0 mt-4">
                    {isLoadingSavedLeads ? (
                      <div className="py-12 flex justify-center items-center">
                        <Loader2 className="animate-spin text-primary mr-2" size={24} />
                        <span className="text-muted-foreground">Loading leads...</span>
                      </div>
                    ) : uniqueEmailLeads.length === 0 ? (
                      <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                          <Mail size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">No emails enriched yet</h3>
                        <p className="text-muted-foreground max-w-md">Use "Find Emails" above to start enriching scraped leads or manually add new contacts.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-b-xl border-t border-border/50">
                        <table className="w-full text-sm text-left border-collapse">
                          <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold border-b border-border">
                            <tr>
                              {enricherEditMode && (
                                <th className="px-4 py-3 w-[40px] text-center border-r border-border/50">
                                  <input
                                    type="checkbox"
                                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                                    checked={uniqueEmailLeads.length > 0 && uniqueEmailLeads.every(l => selectedIds.includes(l._id))}
                                    onChange={() => {
                                      const allSelected = uniqueEmailLeads.every(l => selectedIds.includes(l._id));
                                      if (allSelected) setSelectedIds(prev => prev.filter(id => !uniqueEmailLeads.some(l => l._id === id)));
                                      else setSelectedIds(prev => [...new Set([...prev, ...uniqueEmailLeads.map(l => l._id)])]);
                                    }}
                                  />
                                </th>
                              )}
                              <th className="px-4 py-3 w-[50px] text-center border-r border-border/50">#</th>
                              <th className="px-4 py-3 min-w-[220px]">Email</th>
                              <th className="px-4 py-3 min-w-[160px]">Business</th>
                              <th className="px-4 py-3 min-w-[120px]">Phone</th>
                              <th className="px-4 py-3 min-w-[110px]">Source</th>
                              <th className="px-4 py-3 min-w-[120px]">Location</th>
                              <th className="px-4 py-3 min-w-[180px] text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50">
                            {uniqueEmailLeads.map((lead, idx) => {
                              const recipient = recipientByEmail[lead.email.trim().toLowerCase()];
                              const autoActive = recipient && isAutoActive(recipient.status);

                              return (
                                <tr
                                  key={lead._id}
                                  className={`transition-colors hover:bg-muted/30 
                                    ${enricherEditMode && selectedIds.includes(lead._id) ? 'bg-primary/5' : ''} 
                                    ${autoActive ? 'bg-emerald-500/5' : (recipient ? 'bg-indigo-500/5' : '')}`
                                  }
                                >
                                  {enricherEditMode && (
                                    <td className="px-4 py-3 text-center border-r border-border/50">
                                      <input
                                        type="checkbox"
                                        className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                                        checked={selectedIds.includes(lead._id)}
                                        onChange={() => toggleSelectOne(lead._id)}
                                      />
                                    </td>
                                  )}
                                  <td className="px-4 py-3 text-center text-xs text-muted-foreground font-medium border-r border-border/50">{idx + 1}</td>
                                  <td className="px-4 py-3">
                                    {inlineEditLeadId === lead._id ? (
                                      <Input
                                        className="h-8 text-xs font-medium"
                                        value={inlineEditData.email || ''}
                                        onChange={e => setInlineEditData({ ...inlineEditData, email: e.target.value })}
                                      />
                                    ) : recipient ? (
                                      <span
                                        onClick={() => setIntelLead(recipient)}
                                        className={`font-semibold text-sm cursor-pointer flex items-center gap-1.5 underline underline-offset-4 decoration-primary/30 hover:opacity-80 transition-opacity ${autoActive ? 'text-emerald-600' : 'text-primary'}`}
                                        title="Click to view delivery logs"
                                      >
                                        <Mail size={14} />
                                        <span className="truncate max-w-[180px] block">{lead.email}</span>
                                        {autoActive ? (
                                          <Badge className="ml-1 bg-emerald-500 text-[10px] uppercase px-1.5 py-0 h-4">
                                            Auto • S{recipient.step}
                                          </Badge>
                                        ) : (
                                          <Badge variant="outline" className="ml-1 border-muted-foreground/30 text-muted-foreground text-[10px] uppercase px-1.5 py-0 h-4">
                                            {(recipient.status || '')}
                                          </Badge>
                                        )}
                                      </span>
                                    ) : (
                                      <a href={`mailto:${lead.email}`} className="text-primary font-medium text-sm flex items-center gap-1.5 hover:underline decoration-primary/30 underline-offset-4">
                                        <Mail size={14} /> <span className="truncate max-w-[180px] block">{lead.email}</span>
                                      </a>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    {inlineEditLeadId === lead._id ? (
                                      <Input
                                        className="h-8 text-xs"
                                        value={inlineEditData.name || ''}
                                        onChange={e => setInlineEditData({ ...inlineEditData, name: e.target.value })}
                                      />
                                    ) : (
                                      <>
                                        <div className="font-semibold text-foreground text-sm truncate max-w-[140px]">{lead.name}</div>
                                        {lead.keyword && <div className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[140px] bg-muted/50 inline-block px-1.5 rounded">{lead.keyword}</div>}
                                      </>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 font-medium text-emerald-600 text-sm">
                                    {inlineEditLeadId === lead._id ? (
                                      <Input
                                        className="h-8 text-xs text-emerald-600 border-emerald-200 focus-visible:ring-emerald-500"
                                        value={inlineEditData.phone || ''}
                                        onChange={e => setInlineEditData({ ...inlineEditData, phone: e.target.value })}
                                      />
                                    ) : (lead.phone || <span className="text-muted-foreground/50 font-normal">—</span>)}
                                  </td>
                                  <td className="px-4 py-3">
                                    <Badge variant="outline" className="text-[10px] font-medium bg-background border-border/60 text-muted-foreground">
                                      {(() => {
                                        const map = { ig: 'Instagram', instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn', website: 'Website', search_engine: 'Search Engine', google_dork: 'Google Search', google: 'Google' };
                                        const s = (lead.emailSource || '').toLowerCase();
                                        return map[s] || (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—');
                                      })()}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3 text-xs text-muted-foreground truncate max-w-[100px]">
                                    {lead.city || '—'}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {inlineEditLeadId === lead._id ? (
                                        <>
                                          <Button variant="outline" size="sm" className="h-8 px-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 text-xs" onClick={handleSaveInlineEdit}>
                                            Save
                                          </Button>
                                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => setInlineEditLeadId(null)}>
                                            Cancel
                                          </Button>
                                        </>
                                      ) : selectedLeadForTpl === lead._id ? (
                                        <select
                                          className="flex h-8 w-[140px] items-center justify-between rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                          onChange={(e) => {
                                            if (e.target.value) handleSendCustomTemplate(lead._id, e.target.value);
                                            setSelectedLeadForTpl(null);
                                          }}
                                        >
                                          <option value="">Pick Template...</option>
                                          <optgroup label="Auto Sequence">
                                            <option value="step1">Step 1 (Intro)</option>
                                            <option value="step2">Step 2 (Follow-up)</option>
                                            <option value="step3">Step 3 (Final)</option>
                                          </optgroup>
                                          <optgroup label="Custom Templates">
                                            {customTemplates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                          </optgroup>
                                          <option value="">Cancel</option>
                                        </select>
                                      ) : (
                                        <>
                                          <Button variant="outline" size="sm" className="h-7 px-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 text-xs" onClick={() => setSelectedLeadForTpl(lead._id)}>
                                            Send
                                          </Button>
                                          <Button variant="outline" size="sm" className="h-7 px-2 border-primary/30 text-primary hover:bg-primary/10 text-xs" onClick={() => {
                                            setInlineEditLeadId(lead._id);
                                            setInlineEditData({ email: lead.email, name: lead.name, phone: lead.phone });
                                          }}>
                                            Edit
                                          </Button>
                                        </>
                                      )}
                                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => {
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
                                      }}>
                                        <X size={14} />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })()}

          {activeTab === 'mobile_finder' && (() => {
            // Group by phone and pick the "best" entry (one with status or most recent)
            const leadsByPhone = {};
            savedLeads.forEach(l => {
              if (!l.phone || l.phone === 'N/A') return;
              const cleanP = l.phone.replace(/\D/g, '');
              if (!cleanP) return;

              const existing = leadsByPhone[cleanP];
              if (!existing) {
                leadsByPhone[cleanP] = l;
              } else {
                // Priority: Status > Recent Update > Existing
                const hasStatus = (lead) => lead.whatsappStatus && lead.whatsappStatus !== 'pending';
                if (!hasStatus(existing) && hasStatus(l)) {
                  leadsByPhone[cleanP] = l;
                } else if (hasStatus(existing) === hasStatus(l)) {
                  if (new Date(l.whatsappUpdatedAt || l.createdAt) > new Date(existing.whatsappUpdatedAt || existing.createdAt)) {
                    leadsByPhone[cleanP] = l;
                  }
                }
              }
            });
            const uniqueMobileLeads = Object.values(leadsByPhone).sort((a, b) => {
              const statusA = getLeadWhatsappStatus(a);
              const statusB = getLeadWhatsappStatus(b);
              const rank = { 'pending': 1, 'failed': 2, 'sending': 3, 'sent': 4 };
              const rankA = rank[statusA] || 5;
              const rankB = rank[statusB] || 5;
              if (rankA !== rankB) return rankA - rankB;
              return new Date(b.whatsappUpdatedAt || b.createdAt) - new Date(a.whatsappUpdatedAt || a.createdAt);
            });

            return (
              <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
                <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-lg">
                  <CardHeader className="pb-4 border-b border-border/50">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Phone size={20} className="text-emerald-500" /> Mobile Enricher
                        </CardTitle>
                        <CardDescription>All globally enriched phone numbers — deduplicated across every scraped folder.</CardDescription>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 py-1.5 px-3">
                          Total: {uniqueMobileLeads.length}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setAddEmailForm({ email: '', name: '', phone: '', city: '', keyword: '' }); setAddEmailModal(true); }}
                        >
                          <Plus size={16} className="mr-1.5" /> Add Number
                        </Button>

                        {uniqueMobileLeads.length > 0 && (
                          <Button
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-sm"
                            disabled={isScraperBroadcasting}
                            onClick={() => {
                              const phones = uniqueMobileLeads.map(l => l.phone.replace(/\D/g, ''));
                              const activeWaTpl = whatsappTemplates.find(t => t.isActive);
                              if (!activeWaTpl) return showToast("Please activate a WhatsApp template in WhatsApp Settings first!", 'error');
                              if (waProvider === 'browser' && waStatus !== 'connected') return showToast("WhatsApp is not connected!", 'error');

                              setConfirmModal({
                                open: true,
                                title: `Send Active WA Msg to ALL ${phones.length} enriched mobile numbers?`,
                                onConfirm: async () => {
                                  setIsScraperBroadcasting(true);
                                  try {
                                    const activeWaTpl = whatsappTemplates.find(t => t.isActive);
                                    for (let i = 0; i < uniqueMobileLeads.length; i++) {
                                      const lead = uniqueMobileLeads[i];
                                      const cleanP = lead.phone.replace(/\D/g, '');

                                      // Local state update for "Sending"
                                      setWaStatuses(prev => ({ ...prev, [cleanP]: 'sending' }));

                                      try {
                                        await axios.post('/api/whatsapp/send', {
                                          phone: cleanP,
                                          message: renderTemplateMessage(activeWaTpl.message, lead)
                                        });
                                        syncLeadWhatsappStatus(cleanP, 'sent');
                                      } catch (err) {
                                        syncLeadWhatsappStatus(cleanP, 'failed');
                                      }

                                      // Progress Delay
                                      if (i < uniqueMobileLeads.length - 1) {
                                        await new Promise(r => setTimeout(r, (scraperWaDelay * 1000 || 3000) + Math.random() * 500));
                                      }
                                    }
                                    showToast(`WhatsApp Broadcast finished!`, 'success');
                                    fetchSavedLeads();
                                    fetchStats();
                                  } catch (err) {
                                    showToast('WA Broadcast failed: ' + err.message, 'error');
                                  } finally {
                                    setIsScraperBroadcasting(false);
                                  }
                                }
                              });
                            }}
                          >
                            {isScraperBroadcasting ? <><Loader2 size={16} className="animate-spin mr-2" /> Sending...</> : <><Send size={16} className="mr-2" /> Send All WA ({uniqueMobileLeads.length})</>}
                          </Button>
                        )}

                        <Button
                          variant={enricherEditMode ? "default" : "outline"}
                          size="sm"
                          onClick={() => { setEnricherEditMode(m => !m); if (enricherEditMode) setSelectedIds([]); }}
                        >
                          {enricherEditMode ? 'Done' : 'Edit'}
                        </Button>

                        <Button variant="ghost" size="sm" onClick={fetchSavedLeads}>
                          Refresh
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {enricherEditMode && selectedIds.length > 0 && uniqueMobileLeads.some(l => selectedIds.includes(l._id)) && (
                    <div className="mx-6 mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
                      <div className="flex items-center gap-2 text-emerald-600 font-medium">
                        <Info size={18} /> {selectedIds.filter(id => uniqueMobileLeads.some(l => l._id === id)).length} numbers selected
                      </div>
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <Button
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-sm"
                          disabled={isScraperBroadcasting}
                          onClick={() => {
                            const ids = selectedIds.filter(id => uniqueMobileLeads.some(l => l._id === id));
                            const selectedLeads = uniqueMobileLeads.filter(l => ids.includes(l._id));
                            const phones = selectedLeads.map(l => l.phone.replace(/\D/g, ''));

                            const activeWaTpl = whatsappTemplates.find(t => t.isActive);
                            if (!activeWaTpl) return showToast("Please activate a WhatsApp template in WhatsApp Settings first!", 'error');
                            if (waStatus !== 'connected') return showToast("WhatsApp is not connected!", 'error');

                            setConfirmModal({
                              open: true,
                              title: `Send Active WA Msg to ${phones.length} selected leads?`,
                              onConfirm: async () => {
                                setIsScraperBroadcasting(true);
                                try {
                                  const activeWaTpl = whatsappTemplates.find(t => t.isActive);
                                  const selectedLeads = uniqueMobileLeads.filter(l => ids.includes(l._id));

                                  for (let i = 0; i < selectedLeads.length; i++) {
                                    const lead = selectedLeads[i];
                                    const cleanP = lead.phone.replace(/\D/g, '');

                                    setWaStatuses(prev => ({ ...prev, [cleanP]: 'sending' }));

                                    try {
                                      await axios.post('/api/whatsapp/send', {
                                        phone: cleanP,
                                        message: renderTemplateMessage(activeWaTpl.message, lead)
                                      });
                                      syncLeadWhatsappStatus(cleanP, 'sent');
                                    } catch (err) {
                                      syncLeadWhatsappStatus(cleanP, 'failed');
                                    }

                                    if (i < selectedLeads.length - 1) {
                                      await new Promise(r => setTimeout(r, (scraperWaDelay * 1000 || 3000) + Math.random() * 500));
                                    }
                                  }
                                  showToast(`Bulk Send finished!`, 'success');
                                  setSelectedIds([]);
                                  setEnricherEditMode(false);
                                  fetchSavedLeads();
                                  fetchStats();
                                } catch (err) {
                                  showToast('Bulk Send failed: ' + err.message, 'error');
                                } finally {
                                  setIsScraperBroadcasting(false);
                                }
                              }
                            });
                          }}
                        >
                          {isScraperBroadcasting ? <><Loader2 size={16} className="animate-spin mr-1.5" /> Sending...</> : <><Send size={16} className="mr-1.5" /> Send Bulk WA</>}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            const ids = selectedIds.filter(id => uniqueMobileLeads.some(l => l._id === id));
                            setConfirmModal({
                              open: true,
                              title: `Delete ${ids.length} selected leads?`,
                              onConfirm: async () => {
                                try {
                                  await axios.post('/api/saved-leads/bulk-delete', { leadIds: ids });
                                  showToast("Leads Deleted!", "success");
                                  setSelectedIds([]);
                                  fetchSavedLeads();
                                } catch (e) { showToast("Delete failed", "error"); }
                              }
                            });
                          }}
                        >
                          Delete Selected
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedIds([])} className="shadow-sm">Cancel</Button>
                      </div>
                    </div>
                  )}

                  <CardContent className="p-0 mt-4">
                    {isLoadingSavedLeads ? (
                      <div className="py-12 flex justify-center items-center">
                        <Loader2 className="animate-spin text-primary mr-2" size={24} />
                        <span className="text-muted-foreground">Loading leads...</span>
                      </div>
                    ) : uniqueMobileLeads.length === 0 ? (
                      <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-4">
                          <Phone size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">No mobile numbers enriched yet</h3>
                        <p className="text-muted-foreground max-w-md">Scrape some leads with phone numbers to see them here.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-b-xl border-t border-border/50">
                        <table className="w-full text-sm text-left border-collapse">
                          <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold border-b border-border">
                            <tr>
                              {enricherEditMode && (
                                <th className="px-4 py-3 w-[40px] text-center border-r border-border/50">
                                  <input
                                    type="checkbox"
                                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                                    checked={uniqueMobileLeads.length > 0 && uniqueMobileLeads.every(l => selectedIds.includes(l._id))}
                                    onChange={() => {
                                      const allSelected = uniqueMobileLeads.every(l => selectedIds.includes(l._id));
                                      if (allSelected) setSelectedIds(prev => prev.filter(id => !uniqueMobileLeads.some(l => l._id === id)));
                                      else setSelectedIds(prev => [...new Set([...prev, ...uniqueMobileLeads.map(l => l._id)])]);
                                    }}
                                  />
                                </th>
                              )}
                              <th className="px-4 py-3 w-[50px] text-center border-r border-border/50">#</th>
                              <th className="px-4 py-3 min-w-[160px]">Phone Number</th>
                              <th className="px-4 py-3 min-w-[180px]">Business Name</th>
                              <th className="px-4 py-3 min-w-[120px]">Email</th>
                              <th className="px-4 py-3 min-w-[120px]">Location</th>
                              <th className="px-4 py-3 min-w-[140px]">Last WA Activity</th>
                              <th className="px-4 py-3 min-w-[150px] text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50">
                            {uniqueMobileLeads.map((lead, idx) => {
                              const cleanP = lead.phone.replace(/\D/g, '');
                              const stat = getLeadWhatsappStatus(lead);
                              const waStatusClass = stat === 'failed' ? 'bg-destructive/10 text-destructive' : stat === 'sent' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground';

                              return (
                                <tr
                                  key={lead._id}
                                  className={`transition-colors hover:bg-muted/30 
                                    ${enricherEditMode && selectedIds.includes(lead._id) ? 'bg-primary/5' : ''}`
                                  }
                                >
                                  {enricherEditMode && (
                                    <td className="px-4 py-3 text-center border-r border-border/50">
                                      <input
                                        type="checkbox"
                                        className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                                        checked={selectedIds.includes(lead._id)}
                                        onChange={() => toggleSelectOne(lead._id)}
                                      />
                                    </td>
                                  )}
                                  <td className="px-4 py-3 text-center text-xs text-muted-foreground font-medium border-r border-border/50">{idx + 1}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-foreground text-sm tracking-tight">{lead.phone}</span>
                                      {stat !== 'pending' && (
                                        <Badge
                                          variant="outline"
                                          className={`text-[9px] uppercase font-black px-1.5 py-0.5 h-4.5 border transition-all duration-300 ${stat === 'sent' ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)]' :
                                              stat === 'failed' ? 'bg-rose-500/15 text-rose-600 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.1)]' :
                                                stat === 'sending' ? 'bg-blue-500/15 text-blue-600 border-blue-500/30 animate-pulse' :
                                                  'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                            }`}
                                        >
                                          {stat}
                                        </Badge>
                                      )}
                                      {stat === 'pending' && (
                                        <span className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-widest italic">Pending</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="font-semibold text-foreground text-sm truncate max-w-[160px]">{lead.name}</div>
                                    {lead.keyword && <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{lead.keyword}</div>}
                                  </td>
                                  <td className="px-4 py-3 text-xs text-muted-foreground">
                                    {lead.email || <span className="opacity-30">—</span>}
                                  </td>
                                  <td className="px-4 py-3 text-xs text-muted-foreground">
                                    {lead.city || '—'}
                                  </td>
                                  <td className="px-4 py-3 text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                    {lead.whatsappUpdatedAt ? new Date(lead.whatsappUpdatedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : <span className="opacity-30">—</span>}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-3 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 text-xs font-bold"
                                        onClick={() => openWhatsappComposer(lead)}
                                      >
                                        <MessageSquare size={14} className="mr-1.5" /> WhatsApp
                                      </Button>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => {
                                        setConfirmModal({
                                          open: true,
                                          title: `Delete this lead (${lead.phone})?`,
                                          onConfirm: async () => {
                                            try {
                                              await axios.delete(`/api/saved-leads/${lead._id}`);
                                              showToast("Lead Deleted!", "success");
                                              fetchSavedLeads();
                                            } catch (e) { showToast("Delete failed", "error"); }
                                          }
                                        });
                                      }}>
                                        <X size={14} />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })()}


          {activeTab === 'saved_leads' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
              <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-lg">
                <CardHeader className="pb-4 border-b border-border/50">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Database size={20} className="text-primary" /> Lead Automation CRM
                      </CardTitle>
                      <CardDescription>Centralized vault for all AI-scraped high-intent leads.</CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        setInlineEditLeadId('new');
                        setInlineEditData({ name: '', phone: '', email: '', city: '', address: '', keyword: 'Manual' });
                      }}>
                        <Plus size={14} className="mr-2" /> Add Lead
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setIsMapScreenshotDialogOpen(true)}>
                        <UploadCloud size={14} className="mr-2" /> Upload Screenshot
                      </Button>
                      <Button variant="outline" size="sm" onClick={fetchSavedLeads}>
                        <RefreshCw size={14} className="mr-2" /> Refresh CRM
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => {
                        setConfirmModal({
                          open: true,
                          title: "Delete all leads without phone numbers?",
                          onConfirm: async () => {
                            try {
                              const res = await axios.post('/api/saved-leads/bulk-delete-no-number');
                              showToast(res.data.message || "Leads without numbers deleted!", "success");
                              fetchSavedLeads();
                              fetchStats();
                            } catch (e) {
                              showToast("Failed to delete leads", "error");
                            }
                          }
                        });
                      }}>
                        <X size={14} className="mr-2" /> Delete No Number
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <Dialog
                  open={isMapScreenshotDialogOpen}
                  onOpenChange={(open) => {
                    setIsMapScreenshotDialogOpen(open);
                    if (!open) setIsMapScreenshotDragging(false);
                  }}
                >
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Camera size={18} className="text-primary" /> Upload Map Screenshot
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div
                        className={`rounded-2xl border border-dashed p-6 text-center transition-all outline-none ${isMapScreenshotDragging
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                            : 'border-border bg-muted/20'
                          }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsMapScreenshotDragging(true);
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          setIsMapScreenshotDragging(true);
                        }}
                        onDragLeave={() => setIsMapScreenshotDragging(false)}
                        onDrop={handleMapScreenshotDrop}
                        onClick={() => document.getElementById('map-screenshot-input')?.click()}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            document.getElementById('map-screenshot-input')?.click();
                          }
                        }}
                      >
                        <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${isMapScreenshotDragging ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                          <UploadCloud size={22} />
                        </div>
                        <p className="text-sm font-medium text-foreground">Drop a Google Maps screenshot here</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Paste with Ctrl+V, drop a file, or choose one manually.
                        </p>
                        <input
                          id="map-screenshot-input"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleMapScreenshotPick}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById('map-screenshot-input')?.click();
                          }}
                        >
                          Choose file
                        </Button>
                      </div>

                      {mapScreenshotFile && (
                        <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm">
                          <div className="font-medium text-foreground">Selected file</div>
                          <div className="mt-1 truncate text-muted-foreground">{mapScreenshotFile.name}</div>
                        </div>
                      )}

                      {mapScreenshotResult?.extracted && (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm space-y-1">
                          <div className="font-semibold text-emerald-600">Last extracted data</div>
                          <div><span className="text-muted-foreground">Name:</span> {mapScreenshotResult.extracted.businessName || 'Unknown'}</div>
                          <div><span className="text-muted-foreground">Mobile:</span> {mapScreenshotResult.extracted.phone || '—'}</div>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsMapScreenshotDialogOpen(false)} disabled={isMapScreenshotUploading}>
                          Cancel
                        </Button>
                        <Button onClick={handleMapScreenshotUpload} disabled={isMapScreenshotUploading || !mapScreenshotFile}>
                          {isMapScreenshotUploading ? 'Uploading...' : 'Upload & Save'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <CardContent className="p-6">
                  {isLoadingSavedLeads ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-40 rounded-xl bg-muted/50 border border-border animate-pulse"></div>
                      ))}
                    </div>
                  ) : savedLeads.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                        <Database size={32} />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">No saved leads yet</h3>
                      <p className="text-muted-foreground max-w-md">Go to Lead Scraper to extract some and build your lists!</p>
                    </div>
                  ) : !selectedGroup ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {inlineEditLeadId === 'new' && (
                        <div className="bg-card rounded-2xl border-2 border-dashed border-primary/40 p-6 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                          <h4 className="font-bold text-primary mb-4">Add New Lead</h4>
                          <div className="space-y-3 w-full">
                            <Input placeholder="Business Name" value={inlineEditData.name} onChange={e => setInlineEditData({ ...inlineEditData, name: e.target.value })} className="h-8 text-xs" />
                            <Input placeholder="Phone Number" value={inlineEditData.phone} onChange={e => setInlineEditData({ ...inlineEditData, phone: e.target.value })} className="h-8 text-xs" />
                            <Input placeholder="City" value={inlineEditData.city} onChange={e => setInlineEditData({ ...inlineEditData, city: e.target.value })} className="h-8 text-xs" />
                            <div className="flex gap-2">
                              <Button size="sm" className="flex-1 h-8 text-xs" onClick={async () => {
                                try {
                                  await axios.post('/api/saved-leads', inlineEditData);
                                  showToast("Lead Added!", "success");
                                  setInlineEditLeadId(null);
                                  fetchSavedLeads();
                                } catch (e) { showToast("Add failed", "error"); }
                              }}>Save</Button>
                              <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={() => setInlineEditLeadId(null)}>Cancel</Button>
                            </div>
                          </div>
                        </div>
                      )}
                      {Object.entries(savedLeads.reduce((acc, lead) => {
                        const groupName = `${(lead.keyword || 'Unknown').toUpperCase()} in ${(lead.city || 'Unknown').toUpperCase()}`;
                        if (!acc[groupName]) acc[groupName] = [];
                        acc[groupName].push(lead);
                        return acc;
                      }, {})).map(([groupName, leads]) => {
                        const sample = leads[0] || {};
                        return (
                          <div key={groupName} className="group relative bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden animate-in zoom-in duration-300" onClick={() => setSelectedGroup(groupName)}>
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 to-indigo-500/60 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-3 right-3 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
                              onClick={(e) => { e.stopPropagation(); handleDeleteGroup(sample.keyword, sample.city); }}
                              title="Delete Folder"
                            >
                              <X size={14} />
                            </Button>

                            <div className="p-6 flex flex-col items-center text-center">
                              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Folder size={24} />
                              </div>
                              <h4 className="font-bold text-foreground text-sm mb-2 line-clamp-2">{groupName}</h4>

                              <div className="flex flex-wrap justify-center gap-2 mb-4">
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-transparent text-[10px]">
                                  {leads.length} Total
                                </Badge>
                                <Badge className="bg-blue-500/10 text-blue-600 border-transparent text-[10px]">
                                  {leads.filter(l => getLeadWhatsappStatus(l) === 'sent').length} Sent
                                </Badge>
                                <Badge className="bg-rose-500/10 text-rose-600 border-transparent text-[10px]">
                                  {leads.filter(l => getLeadWhatsappStatus(l) === 'failed').length} Failed
                                </Badge>
                                <Badge className="bg-amber-500/10 text-amber-600 border-transparent text-[10px]">
                                  {leads.filter(l => getLeadWhatsappStatus(l) === 'pending').length} Pending
                                </Badge>
                              </div>

                              <div className="w-full bg-muted/40 h-1.5 rounded-full overflow-hidden mt-auto">
                                <div
                                  className="h-full bg-emerald-500 transition-all duration-500"
                                  style={{ width: `${(leads.filter(l => getLeadWhatsappStatus(l) === 'sent').length / leads.length) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-4 pb-2 border-b border-border/50">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedGroup(null); setSelectedIds([]); }} className="text-muted-foreground hover:text-foreground">
                          <ChevronLeft size={16} className="mr-1" /> Back to Folders
                        </Button>
                        <h3 className="font-bold text-foreground flex-1 truncate flex items-center gap-2">
                          <span className="text-primary font-black uppercase text-[10px] bg-primary/10 px-2 py-0.5 rounded tracking-widest">Location</span>
                          {selectedGroup}
                        </h3>
                      </div>

                      {(() => {
                        const groupLeads = savedLeads
                          .filter(lead => `${(lead.keyword || 'Unknown').toUpperCase()} in ${(lead.city || 'Unknown').toUpperCase()}` === selectedGroup)
                          .sort((a, b) => {
                            const statusA = getLeadWhatsappStatus(a);
                            const statusB = getLeadWhatsappStatus(b);
                            const rank = { 'pending': 1, 'failed': 2, 'sending': 3, 'sent': 4 };
                            const rankA = rank[statusA] || 5;
                            const rankB = rank[statusB] || 5;
                            if (rankA !== rankB) return rankA - rankB;
                            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                          });
                        const allSelected = groupLeads.length > 0 && groupLeads.every(l => selectedIds.includes(l._id));
                        const someSelected = groupLeads.some(l => selectedIds.includes(l._id));

                        return (
                          <>
                            {someSelected && (
                              <div className="p-4 rounded-xl bg-primary text-primary-foreground flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg animate-in slide-in-from-top-2">
                                <div className="flex items-center gap-2 font-semibold">
                                  <Info size={18} />
                                  <span>{selectedIds.filter(id => groupLeads.some(l => l._id === id)).length} leads selected</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                  <Button
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm border-transparent font-bold"
                                    disabled={isScraperBroadcasting}
                                    onClick={() => {
                                      // Robust lead filtering
                                      const selectedLeads = groupLeads.filter(l => {
                                        if (!selectedIds.includes(l._id)) return false;
                                        const p = l.phone || l.data?.Phone || l.email; // Fallback to email if it's a WA ID
                                        return p && p !== 'N/A';
                                      });

                                      const phones = selectedLeads.map(l => {
                                        const p = l.phone || l.data?.Phone || l.email || '';
                                        return p.replace(/\D/g, '');
                                      }).filter(p => p.length >= 10);

                                      if (phones.length === 0) return showToast('No leads with valid phone numbers selected!', 'error');

                                      const activeWaTpl = whatsappTemplates.find(t => t.isActive);
                                      if (!activeWaTpl) return showToast("Please activate a WhatsApp template in WhatsApp Settings first!", 'error');
                                      if (waProvider === 'browser' && waStatus !== 'connected') return showToast("WhatsApp is not connected!", 'error');

                                      setConfirmModal({
                                        open: true,
                                        title: `Send Active WA Msg to ${phones.length} leads?`,
                                        onConfirm: async () => {
                                          setIsScraperBroadcasting(true);
                                          try {
                                            const res = await axios.post('/api/whatsapp/broadcast', {
                                              phones: phones,
                                              message: activeWaTpl.message,
                                              messages: selectedLeads.map(lead => renderTemplateMessage(activeWaTpl.message, lead)),
                                              delay: scraperWaDelay * 1000 || 3000,
                                              provider: waProvider
                                            });
                                            showToast(`WhatsApp done. Sent: ${res.data.sent} | Failed: ${res.data.failed}`, res.data.failed ? 'info' : 'success');
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
                                            fetchSavedLeads();
                                            fetchStats();

                                          } catch (err) {
                                            showToast('WA Broadcast failed: ' + (err.response?.data?.error || err.message), 'error');
                                          } finally { setIsScraperBroadcasting(false); }
                                        }
                                      });
                                    }}
                                  >
                                    {isScraperBroadcasting ? <><Loader2 size={16} className="animate-spin mr-2" /> Sending...</> : <><Phone size={16} className="mr-2" /> Send WA Msg</>}
                                  </Button>
                                  <select
                                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-bold shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    value={waProvider}
                                    onChange={(e) => setWaProvider(e.target.value)}
                                  >
                                    <option value="browser">🌐 Browser</option>
                                    <option value="interakt">⚡ Interakt</option>
                                  </select>
                                  <Button
                                    variant="secondary"
                                    className="font-bold text-primary"
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
                                    {isEnricherSending ? <><Loader2 size={16} className="animate-spin mr-2" /> Starting...</> : <><Rocket size={16} className="mr-2" /> Start Automation</>}
                                  </Button>
                                  <Button variant="ghost" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setSelectedIds([])}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                            <div className="overflow-x-auto rounded-xl border border-border/50">
                              <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold border-b border-border">
                                  <tr>
                                    <th className="px-4 py-3 w-[50px] text-center border-r border-border/50">
                                      <input
                                        type="checkbox"
                                        className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                                        checked={allSelected}
                                        ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            const newIds = Array.from(new Set([...selectedIds, ...groupLeads.map(l => l._id)]));
                                            setSelectedIds(newIds);
                                          } else {
                                            const idsToKeep = selectedIds.filter(id => !groupLeads.some(l => l._id === id));
                                            setSelectedIds(idsToKeep);
                                          }
                                        }}
                                      />
                                    </th>
                                    <th className="px-4 py-3 min-w-[200px]">Business Name</th>
                                    <th className="px-4 py-3 min-w-[220px]">Contact / Link</th>
                                    <th className="px-4 py-3 min-w-[150px]">Location</th>
                                    <th className="px-4 py-3 min-w-[120px]">Status</th>
                                    <th className="px-4 py-3 min-w-[150px] text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                  {groupLeads.map((lead) => (
                                    <tr key={lead._id} className={`transition-colors hover:bg-muted/30 ${selectedIds.includes(lead._id) ? 'bg-primary/5' : ''}`}>
                                      <td className="px-4 py-3 text-center border-r border-border/50">
                                        <input
                                          type="checkbox"
                                          className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                                          checked={selectedIds.includes(lead._id)}
                                          onChange={() => {
                                            if (selectedIds.includes(lead._id)) setSelectedIds(selectedIds.filter(id => id !== lead._id));
                                            else setSelectedIds([...selectedIds, lead._id]);
                                          }}
                                        />
                                      </td>
                                      <td className="px-4 py-3">
                                        {inlineEditLeadId === lead._id ? (
                                          <Input className="h-8 text-xs" value={inlineEditData.name || ''} onChange={e => setInlineEditData({ ...inlineEditData, name: e.target.value })} />
                                        ) : (
                                          <div className="flex flex-col gap-1">
                                            <span className="font-bold text-foreground text-sm">{lead.name}</span>
                                            <Badge variant="outline" className="w-fit text-[10px] uppercase font-semibold text-primary border-primary/20 bg-primary/5 px-1.5 py-0 h-4">
                                              {lead.keyword || 'Lead'}
                                            </Badge>
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-4 py-3">
                                        {inlineEditLeadId === lead._id ? (
                                          <div className="flex flex-col gap-2">
                                            <Input className="h-8 text-xs border-emerald-200 focus-visible:ring-emerald-500 text-emerald-600" placeholder="Phone" value={inlineEditData.phone || ''} onChange={e => setInlineEditData({ ...inlineEditData, phone: e.target.value })} />
                                            <Input className="h-8 text-xs" placeholder="Email" value={inlineEditData.email || ''} onChange={e => setInlineEditData({ ...inlineEditData, email: e.target.value })} />
                                          </div>
                                        ) : (
                                          <div className="flex flex-col gap-2">
                                            {lead.phone && lead.phone !== 'N/A' ? (
                                              <div className="flex items-center gap-2">
                                                {(() => {
                                                  const cleanP = lead.phone.replace(/\D/g, '');
                                                  const stat = getLeadWhatsappStatus(lead);
                                                  const waStatusClass = stat === 'failed' ? 'text-destructive' : stat === 'sent' ? 'text-emerald-600' : 'text-amber-500';
                                                  return (
                                                    <span className={`font-semibold text-sm ${waStatusClass}`}>{lead.phone}</span>
                                                  );
                                                })()}
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                                                  onClick={() => openWhatsappComposer(lead)}
                                                  title="Send WhatsApp Message"
                                                >
                                                  <MessageSquare size={14} />
                                                </Button>
                                              </div>
                                            ) : <span className="text-muted-foreground/50 text-sm">—</span>}

                                            {(lead.emailFound || lead.email) && (
                                              <a href={`mailto:${lead.email}`} className="text-primary text-xs font-medium flex items-center gap-1.5 hover:underline decoration-primary/30 underline-offset-4 w-fit">
                                                <Mail size={12} /> <span className="truncate max-w-[150px]">{lead.email}</span>
                                              </a>
                                            )}
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-4 py-3 text-sm">
                                        <div className="flex flex-col gap-1">
                                          <span className="font-medium text-foreground">{lead.city || 'Unknown'}</span>
                                          <span className="text-xs text-muted-foreground truncate max-w-[130px]">{lead.address && lead.address !== 'N/A' ? lead.address : 'Address not found'}</span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="flex flex-col gap-2">
                                          {(() => {
                                            const stat = getLeadWhatsappStatus(lead);
                                            const label = stat === 'sent' ? 'Sent' : stat === 'failed' ? 'Failed' : 'Pending';
                                            const badgeClass = stat === 'sent'
                                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20'
                                              : stat === 'failed'
                                                ? 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
                                                : 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20';
                                            const Icon = stat === 'sent' ? CheckCheck : stat === 'failed' ? AlertTriangle : Clock;
                                            return (
                                              <Badge
                                                variant="outline"
                                                className={`w-fit cursor-pointer transition-all ${badgeClass}`}
                                                onClick={(e) => { e.stopPropagation(); cycleWhatsappStatus(lead._id, stat); }}
                                                title="Click to cycle status"
                                              >
                                                <Icon size={12} className="mr-1" /> WhatsApp {label}
                                              </Badge>
                                            );
                                          })()}
                                          <Badge
                                            variant="outline"
                                            className={`w-fit cursor-pointer transition-all ${lead.isContacted ? 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20' : 'bg-slate-500/5 text-slate-400 border-slate-500/10 hover:bg-slate-500/10'}`}
                                            onClick={(e) => { e.stopPropagation(); toggleLeadContacted(lead._id, lead.isContacted); }}
                                            title="Click to toggle contact status"
                                          >
                                            {lead.isContacted ? <Check size={12} className="mr-1" /> : <Clock size={12} className="mr-1" />}
                                            {lead.isContacted ? 'Contacted' : 'Not Contacted'}
                                          </Badge>
                                          {lead.phone && lead.phone !== 'N/A' && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="w-fit h-7 px-2 text-xs border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openWhatsappComposer(lead);
                                              }}
                                            >
                                              <MessageSquare size={12} className="mr-1" /> WhatsApp
                                            </Button>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                          {inlineEditLeadId === lead._id ? (
                                            <>
                                              <Button variant="outline" size="sm" className="h-7 px-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 text-xs" onClick={handleSaveInlineEdit}>Save</Button>
                                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setInlineEditLeadId(null)}>Cancel</Button>
                                            </>
                                          ) : (
                                            <>
                                              <Button variant="outline" size="sm" className="h-7 px-2 text-xs border-primary/30 text-primary hover:bg-primary/10" onClick={() => { setInlineEditLeadId(lead._id); setInlineEditData({ name: lead.name, phone: lead.phone, email: lead.email, address: lead.address, city: lead.city }); }}>Edit</Button>
                                              {lead.phone && lead.phone !== 'N/A' && (
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="h-7 px-2 text-xs border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                                                  onClick={() => openWhatsappComposer(lead)}
                                                >
                                                  <MessageSquare size={14} className="mr-1" /> WhatsApp
                                                </Button>
                                              )}
                                              {lead.mapsLink && (
                                                <Button variant="outline" size="sm" className="h-7 px-2 text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/10" asChild>
                                                  <a href={lead.mapsLink} target="_blank" rel="noreferrer">Map</a>
                                                </Button>
                                              )}
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
                                              >
                                                <X size={14} />
                                              </Button>
                                            </>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </section>
      </main>

      {intelLead && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start p-6 border-b border-border/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  {intelLead.email[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{intelLead.email}</h3>
                  <span className="text-sm text-primary font-medium">Intelligence View Enabled</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-muted" onClick={() => setIntelLead(null)}>
                <X size={20} />
              </Button>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-foreground mb-4 flex items-center gap-2"><Info size={16} className="text-primary" /> Profile Information</h4>
                  <div className="bg-muted/50 rounded-xl p-4 border border-border/50 space-y-3 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-border/50"><strong className="text-foreground">Campaign:</strong> <span className="text-muted-foreground truncate max-w-[150px]">{intelLead.campaignId}</span></div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/50"><strong className="text-foreground">Status:</strong> <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 capitalize">{intelLead.status}</Badge></div>
                    <div className="flex justify-between items-center"><strong className="text-foreground">Current Step:</strong> <Badge className="bg-emerald-500 text-white">{intelLead.step}</Badge></div>

                    {intelLead.data && Object.keys(intelLead.data).length > 0 && (
                      <div className="pt-4 mt-2 border-t border-border/50">
                        <p className="text-[10px] font-bold text-muted-foreground mb-2">Custom Data</p>
                        <div className="space-y-2">
                          {Object.keys(intelLead.data).map(k => (
                            <div key={k} className="flex justify-between text-xs"><strong className="text-foreground">{k}:</strong> <span className="text-muted-foreground truncate max-w-[120px]">{intelLead.data[k]}</span></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-4 flex items-center gap-2"><Clock size={16} className="text-primary" /> Communication Timeline</h4>
                  <div className="relative pl-4 border-l-2 border-primary/20 space-y-6 max-h-[300px] overflow-y-auto pr-2">
                    {intelLead.history && intelLead.history.length > 0 ? intelLead.history.slice().reverse().map((h, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background"></div>
                        <div className="text-xs text-primary font-semibold mb-1">{new Date(h.sentAt).toLocaleString()}</div>
                        <div className="font-medium text-sm text-foreground mb-1">{h.event}</div>
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md">{h.subject}</div>
                      </div>
                    )) : <p className="text-sm text-muted-foreground">No communication logs yet.</p>}
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="p-4 border-t border-border/50 flex justify-end bg-muted/20">
              <Button onClick={() => setIntelLead(null)}>Close Intelligence View</Button>
            </div>
          </Card>
        </div>
      )}

      {/* WhatsApp Send Modal */}
      {waModal.open && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-[520px] shadow-xl border-[#25D366]/30 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                  <Phone size={24} className="text-[#25D366]" /> Send WhatsApp
                </h3>
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-muted" onClick={() => setWaModal({ open: false, phone: '', message: '', leadId: '' })}>
                  <X size={20} />
                </Button>
              </div>

              <div className="mb-4 flex items-center gap-2 bg-muted/50 p-3 rounded-lg border border-border/50">
                <span className="text-2xl">📱</span>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Recipient</div>
                  <div className="font-bold text-foreground">{getWhatsAppDigits(waModal.phone)}</div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-sm font-semibold text-foreground">Your Active Message</label>
                <textarea
                  readOnly
                  value={waModal.message}
                  className="w-full h-[180px] p-4 rounded-xl border-2 border-[#25D366]/50 bg-[#25D366]/5 text-foreground text-sm leading-relaxed resize-none focus:outline-none focus:border-[#25D366]"
                  onClick={e => e.target.select()}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="h-12 border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 font-bold"
                  onClick={copyWaNumber}
                >
                  <Copy size={18} className="mr-2" /> Copy Number
                </Button>
                <Button
                  variant="outline"
                  className="h-12 border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 font-bold"
                  onClick={copyWaMessage}
                >
                  <Copy size={18} className="mr-2" /> Copy Message
                </Button>
                <Button
                  variant="secondary"
                  className="h-12 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 hover:text-blue-700 font-bold border border-blue-500/20"
                  onClick={() => markWhatsappStatusFromModal('sent')}
                >
                  <CheckCircle size={18} className="mr-2" /> Mark Sent
                </Button>
                <Button
                  variant="secondary"
                  className="h-12 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 hover:text-rose-700 font-bold border border-rose-500/20"
                  onClick={() => markWhatsappStatusFromModal('failed')}
                >
                  <X size={18} className="mr-2" /> Mark Failed
                </Button>
                <Button
                  className="h-12 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold border-none"
                  onClick={() => {
                    const encodedMsg = encodeURIComponent(waModal.message || '');
                    const cleanPhone = getWhatsAppDigits(waModal.phone);
                    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
                    window.open(waUrl, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <Phone size={18} className="mr-2" /> Open WhatsApp
                </Button>
              </div>

              <p className="text-center text-muted-foreground text-xs mt-4">
                Tip: Copy the number/message if needed, then use <strong className="text-foreground">Mark Sent</strong> after sending.
              </p>
            </div>
          </Card>
        </div>
      )}

      {confirmModal.open && (
        <div className="fixed inset-0 z-[110] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm shadow-xl border-border/50 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-6">{confirmModal.title}</h3>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="secondary" className="w-full sm:w-auto font-medium" onClick={() => setConfirmModal({ open: false })}>Cancel</Button>
                <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold shadow-glow-primary" onClick={() => { confirmModal.onConfirm(); setConfirmModal({ open: false }); }}>Yes, Proceed</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {addEmailModal && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-xl border-border/50 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-border/50">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2"><Plus size={18} className="text-primary" /> Add Contact Manually</h3>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-muted-foreground hover:bg-muted" onClick={() => !isAddingEmail && setAddEmailModal(false)}>
                <X size={16} />
              </Button>
            </div>
            <CardContent className="p-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                Add a contact directly to the system. Email or Phone is required for enrichment tracking.
              </p>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Email <span className="text-destructive">*</span></label>
                <Input
                  type="email"
                  value={addEmailForm.email}
                  onChange={e => setAddEmailForm({ ...addEmailForm, email: e.target.value })}
                  placeholder="contact@business.com"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Business / Name</label>
                  <Input
                    type="text"
                    value={addEmailForm.name}
                    onChange={e => setAddEmailForm({ ...addEmailForm, name: e.target.value })}
                    placeholder="Acme Corp"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Phone</label>
                  <Input
                    type="text"
                    value={addEmailForm.phone}
                    onChange={e => setAddEmailForm({ ...addEmailForm, phone: e.target.value })}
                    placeholder="+1 555 1234"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">City</label>
                  <Input
                    type="text"
                    value={addEmailForm.city}
                    onChange={e => setAddEmailForm({ ...addEmailForm, city: e.target.value })}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Keyword</label>
                  <Input
                    type="text"
                    value={addEmailForm.keyword}
                    onChange={e => setAddEmailForm({ ...addEmailForm, keyword: e.target.value })}
                    placeholder="Plumber, etc."
                  />
                </div>
              </div>
            </CardContent>
            <div className="p-4 border-t border-border/50 flex gap-3 bg-muted/20">
              <Button
                variant="secondary"
                className="flex-1 font-medium"
                disabled={isAddingEmail}
                onClick={() => setAddEmailModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold shadow-glow-primary"
                disabled={isAddingEmail || (!addEmailForm.email.trim() && !addEmailForm.phone.trim())}
                onClick={async () => {
                  setIsAddingEmail(true);
                  try {
                    await axios.post('/api/saved-leads/manual', addEmailForm);
                    showToast('Contact added!', 'success');
                    setAddEmailModal(false);
                    fetchSavedLeads();
                  } catch (e) {
                    showToast(e.response?.data?.error || 'Add failed', 'error');
                  } finally { setIsAddingEmail(false); }
                }}
              >
                {isAddingEmail ? <><Loader2 size={16} className="animate-spin mr-2" /> Adding...</> : <><Plus size={16} className="mr-2" /> Add Contact</>}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {isVarModalOpen && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-xl border-border/50 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-border/50">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2"><PenTool size={18} className="text-primary" /> Fill Template Variables</h3>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-muted-foreground hover:bg-muted" onClick={() => setIsVarModalOpen(false)}>
                <X size={16} />
              </Button>
            </div>
            <CardContent className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="bg-muted/50 p-3 rounded-lg border border-border/50 text-sm">
                <div className="flex gap-2 mb-1"><span className="text-muted-foreground w-16">Template:</span> <span className="font-bold text-foreground">{modalTpl?.name}</span></div>
                <div className="flex gap-2"><span className="text-muted-foreground w-16">To:</span> <span className="font-bold text-primary">{modalLead?.email}</span></div>
              </div>

              <div className="space-y-4 mt-4">
                {Object.keys(modalData).map(key => (
                  <div className="space-y-1.5" key={key}>
                    <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                      <span>Value for <code className="bg-muted px-1.5 py-0.5 rounded text-primary text-xs ml-1">{`{{${key}}}`}</code></span>
                    </label>
                    <Input
                      type="text"
                      value={modalData[key]}
                      onChange={e => setModalData({ ...modalData, [key]: e.target.value })}
                      placeholder={`Enter ${key}...`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-4 border-t border-border/50 flex gap-3 bg-muted/20">
              <Button variant="secondary" className="flex-1 font-medium" onClick={() => setIsVarModalOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold shadow-glow-primary" onClick={confirmAndSendCustom}>
                <Send size={16} className="mr-2" /> Send Email
              </Button>
            </div>
          </Card>
        </div>
      )}

      {viewReplyModal.open && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl shadow-xl border-border/50 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-border/50 bg-muted/20">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <MessageSquare size={18} className="text-primary" />
                  Replies from <span className="text-primary ml-1">{viewReplyModal.lead?.email}</span>
                </h3>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-muted-foreground hover:bg-muted" onClick={() => setViewReplyModal({ open: false, lead: null })}>
                <X size={16} />
              </Button>
            </div>
            <CardContent className="p-0 overflow-y-auto flex-1">
              <div className="p-6 space-y-6">
                {(viewReplyModal.lead?.replies || []).length > 0 ? (
                  viewReplyModal.lead.replies.map((reply, idx) => (
                    <div key={idx} className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-muted/30 px-4 py-3 border-b border-border/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div className="font-bold text-sm text-foreground">Re: {reply.subject}</div>
                        <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                          <Clock size={12} /> {new Date(reply.receivedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed font-mono bg-muted/10">
                        {reply.body}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
                    <MessageSquare size={32} className="opacity-20 mb-3" />
                    <p>No reply content found.</p>
                  </div>
                )}
              </div>
            </CardContent>
            <div className="p-4 border-t border-border/50 flex justify-end bg-muted/20">
              <Button onClick={() => setViewReplyModal({ open: false, lead: null })}>Close</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default App;
