const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
const { ImapFlow } = require('imapflow');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const puppeteer = require('puppeteer');
const { executablePath } = require('puppeteer');
const { createWorker, PSM } = require('tesseract.js');
const crypto = require('crypto');
const BROWSER_SESSION_DIR = path.join(__dirname, 'browser_session');

const app = express();
app.use(cors());
app.use(express.json());
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'leadpulse_avatars',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 400, height: 400, crop: 'limit' }]
  },
});
const cloudUpload = multer({ storage: cloudinaryStorage });

const { simpleParser } = require('mailparser');

// --- Schemas & Models ---
const emailTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const EmailTemplate = mongoose.models.EmailTemplate || mongoose.model('EmailTemplate', emailTemplateSchema);

const scrapedLeadSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String,
  mapsLink: { type: String, unique: true },
  keyword: String,
  city: String,
  isContacted: { type: Boolean, default: false },
  whatsappStatus: { type: String, default: 'pending' },
  whatsappSentAt: { type: Date, default: null },
  whatsappFailedAt: { type: Date, default: null },
  whatsappError: { type: String, default: null },
  whatsappLastMessage: { type: String, default: null },
  whatsappUpdatedAt: { type: Date, default: null },
  website: { type: String, default: null }, // If populated, lead has a website — skip email enrichment
  // Email Enrichment Fields
  email: { type: String, default: null },
  emailFound: { type: Boolean, default: false },
  emailSource: { type: String, default: null }, // 'google', 'facebook', 'instagram', 'linkedin'
  socialLinks: {
    facebook: { type: String, default: null },
    instagram: { type: String, default: null },
    linkedin: { type: String, default: null }
  },
  category: String,
  latitude: Number,
  longitude: Number,
  source: String,
  radiusKm: Number,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  leadStatus: { type: String, enum: ['pending', 'contacted', 'interested', 'not_interested', 'wrong_number', 'callback'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
const ScrapedLead = mongoose.models.ScrapedLead || mongoose.model('ScrapedLead', scrapedLeadSchema);

const settingsSchema = new mongoose.Schema({
  igSession: { type: String, default: '' },
  liAt: { type: String, default: '' },
  fbCUser: { type: String, default: '' },
  fbXs: { type: String, default: '' },
  profilePic: { type: String, default: '' },
  publicEmail: { type: String, default: '' },
  userName: { type: String, default: 'Muntazir' },
  userRole: { type: String, default: 'Admin' },
  mapBusinessCategories: { type: [String], default: [] }
});
const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

const whatsappTemplateSchema = new mongoose.Schema({
  message: { type: String, required: true },
  details: { type: String, required: true },
  isActive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const WhatsappTemplate = mongoose.models.WhatsappTemplate || mongoose.model('WhatsappTemplate', whatsappTemplateSchema);

const recipientSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  campaignId: String,
  step: { type: Number, default: 1 },
  status: { type: String, default: 'pending' },
  lastSentAt: Date,
  nextSendAt: Date,
  emailUser: String,
  emailPass: String,
  subject: String,
  body1: String,
  body2: String,
  body3: String,
  data: mongoose.Schema.Types.Mixed,
  profilePic: { type: String, default: null },
  whatsappName: { type: String, default: null },
  history: [{ sentAt: Date, event: String, subject: String }],
  replies: [{
    receivedAt: { type: Date, default: Date.now },
    subject: String,
    body: String,
    type: { type: String, default: 'email' }, // 'email' or 'whatsapp'
    fromMe: { type: Boolean, default: false }
  }],
  isArchived: { type: Boolean, default: false }
});
const Recipient = mongoose.models.Recipient || mongoose.model('Recipient', recipientSchema);

const customFieldSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const CustomField = mongoose.models.CustomField || mongoose.model('CustomField', customFieldSchema);

const userSchema = new mongoose.Schema({
  loginId: { type: String, required: true, unique: true, index: true },
  fullName: { type: String, required: true },
  phone: { type: String, default: '' },
  position: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  passwordHash: { type: String, required: true },
  passwordSalt: { type: String, required: true },
  active: { type: Boolean, default: true },
  access: { type: Map, of: Boolean, default: {} },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  lastLoginAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'team_members' });
const User = mongoose.models.User || mongoose.model('User', userSchema);

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  dueDate: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

const AUTH_SECRET = process.env.AUTH_SECRET || 'leadpulse-auth-secret';
const AUTH_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const MEMBER_ACCESS_KEYS = [
  'dashboard',
  'campaign',
  'logs',
  'scraper',
  'map_finder',
  'email_finder',
  'mobile_finder',
  'saved_leads',
  'archive',
  'profile',
  'whatsapp_settings',
  'whatsapp_linker',
  'replied_leads',
  'whatsapp_inbox',
  'template',
  'custom_templates',
  'variables',
  'tasks'
];
const REQUIRED_MEMBER_ACCESS = new Set(['dashboard']);
const MEMBER_DEFAULT_ACCESS = MEMBER_ACCESS_KEYS.reduce((acc, key) => {
  acc[key] = REQUIRED_MEMBER_ACCESS.has(key);
  return acc;
}, {});
const FULL_ACCESS = MEMBER_ACCESS_KEYS.reduce((acc, key) => {
  acc[key] = true;
  return acc;
}, {});

const normalizeLoginId = (value) => String(value || '').trim().toLowerCase();
const normalizePhoneNumber = (value) => String(value || '').replace(/\D/g, '');
const mapToObject = (value) => {
  if (!value) return {};
  if (value instanceof Map) return Object.fromEntries(value.entries());
  if (typeof value.toJSON === 'function') return value.toJSON();
  return typeof value === 'object' ? { ...value } : {};
};
const normalizeAccess = (value = {}, fallback = {}) => {
  const raw = mapToObject(value);
  const output = {};
  MEMBER_ACCESS_KEYS.forEach((key) => {
    if (raw[key] !== undefined) {
      output[key] = !!raw[key];
    } else if (fallback[key] !== undefined) {
      output[key] = !!fallback[key];
    }
  });
  return output;
};
const sanitizeUser = (user) => {
  if (!user) return null;
  return {
    _id: user._id,
    loginId: user.loginId,
    fullName: user.fullName,
    phone: user.phone || '',
    position: user.position || '',
    role: user.role || 'member',
    active: !!user.active,
    access: user.role === 'admin' ? FULL_ACCESS : normalizeAccess(user.access, MEMBER_DEFAULT_ACCESS),
    lastLoginAt: user.lastLoginAt || null,
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null
  };
};

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 64, 'sha512').toString('hex');
  return { salt, hash };
};

const verifyPassword = (password, salt, expectedHash) => {
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
};

const signAuthToken = (payload) => {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
};

const verifyAuthToken = (token) => {
  const value = String(token || '');
  const [body, sig] = value.split('.');
  if (!body || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(body).digest('base64url');
  if (sig !== expectedSig) return null;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch (e) {
    return null;
  }
  if (!payload?.exp || Date.now() > payload.exp) return null;
  return payload;
};

const issueAuthToken = (user) => signAuthToken({
  userId: String(user._id),
  role: user.role,
  loginId: user.loginId,
  exp: Date.now() + AUTH_TOKEN_TTL_MS
});

const getAuthTokenFromReq = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return req.headers['x-auth-token'] || '';
};

const requireAuth = async (req, res, next) => {
  if (req.path.startsWith('/auth/login') || req.path.startsWith('/auth/me')) return next();
  const token = getAuthTokenFromReq(req);
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  const payload = verifyAuthToken(token);
  if (!payload) return res.status(401).json({ error: 'Session expired or invalid' });

  try {
    const user = await User.findById(payload.userId);
    if (!user || !user.active) return res.status(401).json({ error: 'User account inactive or missing' });
    req.user = sanitizeUser(user);
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

const seedDefaultAdmin = async () => {
  const defaultLoginId = normalizeLoginId(process.env.ADMIN_LOGIN_ID || 'admin');
  const defaultPassword = String(process.env.ADMIN_PASSWORD || 'muntazir_pro');
  const defaultName = String(process.env.ADMIN_NAME || 'Muntazir');
  const defaultPhone = normalizePhoneNumber(process.env.ADMIN_PHONE || '');
  const defaultPosition = String(process.env.ADMIN_POSITION || 'Owner');

  let admin = await User.findOne({ loginId: defaultLoginId });
  if (!admin) {
    const { salt, hash } = hashPassword(defaultPassword);
    admin = await User.create({
      loginId: defaultLoginId,
      fullName: defaultName,
      phone: defaultPhone,
      position: defaultPosition,
      role: 'admin',
      passwordSalt: salt,
      passwordHash: hash,
      access: FULL_ACCESS,
      active: true
    });
    console.log(`[Auth] Seeded default admin account: ${defaultLoginId}`);
  }
  return admin;
};

app.post('/api/auth/login', async (req, res) => {
  try {
    const loginId = normalizeLoginId(req.body.loginId || req.body.phone || req.body.username);
    const password = String(req.body.password || '');
    if (!loginId || !password) return res.status(400).json({ error: 'loginId and password are required' });

    console.log(`[Auth] Login attempt for: ${loginId}`);
    const lookupClauses = [{ loginId }];
    const loginPhone = normalizePhoneNumber(loginId);
    const bodyPhone = normalizePhoneNumber(req.body.phone);
    if (loginPhone) lookupClauses.push({ phone: loginPhone });
    if (bodyPhone && bodyPhone !== loginPhone) lookupClauses.push({ phone: bodyPhone });

    let user = await User.findOne({ $or: lookupClauses });

    if (!user && loginId === 'admin') {
      user = await User.findOne({ role: 'admin' });
    }

    console.log(`[Auth] Login lookup result: ${user ? `${user.loginId} (${user.role})` : 'none'}`);
    if (!user || !user.active) return res.status(401).json({ error: 'Invalid credentials' });
    if (!verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      console.log('[Auth] Password mismatch.');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLoginAt = new Date();
    await user.save();
    const token = issueAuthToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.active) return res.status(401).json({ error: 'Session invalid' });
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api', requireAuth);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    const db = mongoose.connection.db;
    try {
      await db.collection('recipients').createIndex({ email: 1 }, { unique: true });
      console.log("Unique Lock Active!");
    } catch (e) {
      console.log("Database Ready.");
    }

    // --- STARTUP SYNC & INIT ---
    console.log("Initializing System...");
    // First: Reset any stuck 'sending' leads
    await Recipient.updateMany({ status: 'sending' }, { $set: { status: 'pending' } });

    // Then: Sync all leads with latest credentials
    await Recipient.updateMany(
      { isArchived: { $ne: true }, status: { $nin: ['finished'] } },
      { $set: { emailUser: 'muntazir.site@gmail.com', emailPass: 'bbad zuak ztni mnbr' } }
    );

    // Initialize Core Variables if missing
    const coreVars = ['First Name', 'Website', 'Business'];
    for (const v of coreVars) {
      const exists = await CustomField.findOne({ name: v });
      if (!exists) await CustomField.create({ name: v, active: true });
    }

    await seedDefaultAdmin();

    console.log("Credentials Synced & Core Variables Initialized!");
  })
  .catch(err => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

const { Client, LocalAuth } = require('whatsapp-web.js');
let waClient;
let waQr = "";
let waStatus = "disconnected";

// --- WhatsApp Daily Limit Tracker ---
const WA_DAILY_LIMIT = 45;
let waDailySent = 0;
let waDailyDate = new Date().toDateString();

const syncWaDailyCounter = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const count = await ScrapedLead.countDocuments({
      whatsappSentAt: { $gte: today }
    });
    waDailySent = count;
    waDailyDate = new Date().toDateString();
    console.log(`[WhatsApp] 📊 Daily counter synced from DB: ${waDailySent}/${WA_DAILY_LIMIT}`);
  } catch (err) {
    console.error('[WhatsApp] ❌ Failed to sync daily counter:', err.message);
  }
};

const resetDailyCounterIfNeeded = async () => {
  const today = new Date().toDateString();
  if (today !== waDailyDate) {
    await syncWaDailyCounter();
    console.log('[WhatsApp] 🔄 Daily counter reset/synced for new day.');
  }
};

// Initial sync
setTimeout(syncWaDailyCounter, 5000); // Wait for DB connection


// --- WhatsApp Client Logic ---

const { execSync } = require('child_process');
const WA_SESSION_DIR = path.join(__dirname, 'wa_session');

const resetWhatsappSession = () => {
  try {
    fs.rmSync(WA_SESSION_DIR, { recursive: true, force: true });
  } catch (e) { }
  try {
    fs.rmSync(BROWSER_SESSION_DIR, { recursive: true, force: true });
  } catch (e) { }
};

const initWhatsapp = async () => {
  // Kill any existing Chrome processes and clear locks
  try { execSync('pkill -9 -f chrome-linux64 2>/dev/null', { stdio: 'ignore' }); } catch (e) { }
  try { execSync('rm -f ' + path.join(__dirname, 'wa_session/session/Singleton*'), { stdio: 'ignore' }); } catch (e) { }
  await new Promise(r => setTimeout(r, 2000)); // Wait for Chrome to fully die

  const chromePath = '/usr/bin/google-chrome-stable';
  console.log('[WhatsApp] Initializing client...');
  waClient = new Client({
    authStrategy: new LocalAuth({ dataPath: path.join(__dirname, 'wa_session') }),
    puppeteer: { headless: true, executablePath: chromePath, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--disable-gpu'] },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
  });
  waClient.on('qr', (qr) => { waQr = qr; waStatus = 'qr-ready'; console.log('[WhatsApp] QR Ready.'); });
  waClient.on('authenticated', () => { waQr = ''; waStatus = 'connected'; console.log('[WhatsApp] Authenticated!'); });
  waClient.on('ready', async () => {
    waQr = ''; waStatus = 'connected'; console.log('[WhatsApp] READY!');
    // One-time fix: refresh all WA leads with correct contact names/pics
    setTimeout(async () => {
      try {
        const waLeads = await Recipient.find({ email: /@whatsapp\.com$/ });
        console.log(`[WhatsApp] 🔧 Refreshing contact info for ${waLeads.length} leads via chats...`);

        // Build a map of phone -> chat from actual WhatsApp chats
        const allChats = await waClient.getChats();
        const chatMap = {};
        for (const chat of allChats) {
          if (chat.isGroup) continue;
          const chatPhone = chat.id.user || chat.id._serialized.split('@')[0];
          chatMap[chatPhone] = chat;
        }

        let fixed = 0;
        for (const lead of waLeads) {
          const phone = lead.email.replace('@whatsapp.com', '');
          const chat = chatMap[phone];
          if (!chat) continue;

          let freshName = null;
          let freshPic = null;
          try {
            const contact = await chat.getContact();
            freshName = contact.pushname || contact.name;
            freshPic = await contact.getProfilePicUrl().catch(() => null);
          } catch (e) { }

          let changed = false;
          if (freshName) {
            lead.whatsappName = freshName;
            if (!lead.data?.['First Name'] || lead.data['First Name'].startsWith('+')) {
              lead.data = { ...lead.data, 'First Name': freshName };
            }
            changed = true;
          }
          if (freshPic) { lead.profilePic = freshPic; changed = true; }
          if (changed) { await lead.save(); fixed++; }
        }
        console.log(`[WhatsApp] ✅ Contact refresh done. Fixed ${fixed}/${waLeads.length} leads.`);
      } catch (e) { console.error('[WhatsApp] Contact refresh error:', e.message); }
    }, 5000);
  });
  waClient.on('auth_failure', () => { waStatus = 'disconnected'; waQr = ''; });
  waClient.on('disconnected', () => { waStatus = 'disconnected'; console.log('[WhatsApp] Disconnected.'); setTimeout(() => initWhatsapp(), 3000); });
  const processMessage = async (msg, phone) => {
    try {
      const leadLookup = {
        $or: [
          { 'data.Phone': { $regex: phone + '$' } },
          { 'data.phone': { $regex: phone + '$' } },
          { 'data.Phone': { $regex: phone.slice(-10) } },
          { email: phone + '@whatsapp.com' }
        ]
      };

      let lead = await Recipient.findOne(leadLookup);
      // Fetch contact via chat (works for both @c.us and @lid formats)
      let contact = null;
      try {
        const chat = await msg.getChat();
        contact = await chat.getContact();
      } catch (e) { }

      if (!lead) {
        let name = contact ? (contact.pushname || contact.name) : null;
        let pic = null;
        if (contact) {
          pic = await contact.getProfilePicUrl().catch(() => null);
        }
        if (!name) name = '+' + phone;

        const whatsappEmail = phone + '@whatsapp.com';
        lead = await Recipient.findOneAndUpdate(
          { email: whatsappEmail },
          {
            $setOnInsert: {
              email: whatsappEmail,
              status: 'replied',
              profilePic: pic,
              whatsappName: name,
              data: {
                'First Name': name,
                Phone: phone,
                Source: 'WhatsApp Inbound',
                waId: phone
              },
              replies: []
            }
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log(`[WhatsApp] 🆕 New lead: ${name} (${phone})`);
      } else {
        // Always refresh name + pic from actual contact
        if (contact) {
          const freshName = contact.pushname || contact.name;
          if (freshName) {
            lead.whatsappName = freshName;
            if (freshName !== lead.data?.['First Name'] && lead.data?.['First Name']?.startsWith('+')) {
              lead.data['First Name'] = freshName; // Only update if it was a phone placeholder
            }
          }
          if (!lead.profilePic) {
            lead.profilePic = await contact.getProfilePicUrl().catch(() => null);
          }
        }
      }
      const isDup = (lead.replies || []).some(r => r.type === 'whatsapp' && r.body === msg.body && Math.abs(new Date(r.receivedAt) - new Date(msg.timestamp * 1000)) < 30000);
      if (!isDup) {
        lead.status = 'replied';
        lead.replies.push({ receivedAt: new Date(msg.timestamp * 1000), subject: 'WhatsApp Message', body: msg.body, type: 'whatsapp' });
        await lead.save();
        console.log(`[WhatsApp] ✅ Reply saved from +${phone}: "${msg.body.substring(0, 40)}"`);
      }
    } catch (err) { console.error('[WhatsApp] processMessage error:', err.message); }
  };

  // Also keep event listeners as backup
  waClient.on('message', async (msg) => { if (!msg.fromMe && (msg.from.includes('@c.us') || msg.from.includes('@lid'))) await processMessage(msg, msg.from.split('@')[0]); });
  waClient.on('message_create', async (msg) => { if (!msg.fromMe && (msg.from.includes('@c.us') || msg.from.includes('@lid'))) await processMessage(msg, msg.from.split('@')[0]); });

  waClient.initialize().catch(err => { console.error('[WhatsApp] Init Error:', err.message); waStatus = 'disconnected'; waQr = ''; });

  setTimeout(async () => {
    if (waStatus === 'disconnected' && !waQr) {
      console.log('[WhatsApp] Startup timeout. Resetting session and retrying...');
      resetWhatsappSession();
      try { await waClient.destroy(); } catch (e) { }
      waClient = null;
      setTimeout(() => initWhatsapp(), 2000);
    }
  }, 30000);

  let polls = 0, openings = 0, chatPollStarted = false;
  let lastChecked = Date.now() - 604800000; // Check last 7 days on startup



  const scanChats = async () => {
    try {
      const chats = await waClient.getChats();
      console.log(`[WhatsApp] Scanning ${chats.length} chats (since ${new Date(lastChecked).toLocaleTimeString()})`);
      let found = 0;
      for (const chat of chats) {
        if (chat.isGroup) continue;
        const msgs = await chat.fetchMessages({ limit: 10 });
        for (const msg of msgs) {
          if (msg.fromMe) continue;
          if (!msg.from.includes('@c.us') && !msg.from.includes('@lid')) continue;
          const msgTimeMs = msg.timestamp * 1000;
          if (msgTimeMs < lastChecked) continue;
          const phone = msg.from.split('@')[0];
          console.log(`[WhatsApp] 📩 Processing: +${phone} — "${msg.body.substring(0, 40)}" (${new Date(msgTimeMs).toLocaleTimeString()})`);
          await processMessage(msg, phone);
          found++;
        }
      }
      console.log(`[WhatsApp] Scan done: ${found} new msgs saved.`);
      lastChecked = Date.now() - 2000;
    } catch (e) { console.error('[WhatsApp] scanChats error:', e.message); }
  };


  const startChatPoll = () => {
    if (chatPollStarted) return;
    chatPollStarted = true;
    console.log('[WhatsApp] 🔄 Chat polling started.');
    scanChats(); // Immediate first scan
    setInterval(scanChats, 15000); // Then every 15s
  };


  const poll = setInterval(async () => {
    if (++polls > 90) { clearInterval(poll); return; }
    try {
      const state = await waClient.getState();
      if (state === 'CONNECTED') {
        if (waStatus !== 'connected') { waStatus = 'connected'; waQr = ''; console.log('[WhatsApp] CONNECTED via poll!'); }
        clearInterval(poll);
        // Don't start chatPoll here - wait for 'ready' event which guarantees full init
      } else if (state === 'OPENING') {
        if (++openings > 15 && !waQr) { console.log('[WhatsApp] OPENING timeout'); clearInterval(poll); try { await waClient.destroy(); } catch (e) { } setTimeout(() => initWhatsapp(), 2000); }
      } else { openings = 0; }
    } catch (e) { }
  }, 2000);

  // Start chat polling ONLY from ready event (guarantees full init)
  waClient.on('ready', () => { startChatPoll(); });

};

initWhatsapp();


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });
const mapScreenshotUpload = multer({
  storage,
  limits: {
    fileSize: 12 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed'));
    }
    cb(null, true);
  }
});

// SPINTAX ENGINE (Support {Hi|Hello|Hey} format - MUST contain a pipe |)
const applySpintax = (text) => {
  if (!text) return "";
  return text.replace(/\{([^{}|]+\|[^{}]*)\}/g, (match, choices) => {
    const arr = choices.split('|');
    return arr[Math.floor(Math.random() * arr.length)];
  });
};

// --- GENERIC EMAIL PROVIDERS ---
const GENERIC_PROVIDERS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com',
  'aol.com', 'mail.com', 'zoho.com', 'protonmail.com', 'yandex.com',
  'gmx.com', 'live.com', 'msn.com', 'me.com', 'rocketmail.com', 'rediffmail.com',
  'mac.com', 'googlemail.com', 'mail.ru', 'att.net', 'comcast.net', 'verizon.net',
  'btinternet.com', 'bellsouth.net', 'charter.net', 'cox.net', 'earthlink.net',
  'juno.com', 'mindspring.com', 'netzero.net', 'prodigy.net', 'sbcglobal.net',
  'web.de', 't-online.de', 'wanadoo.fr', 'orange.fr', 'free.fr', 'laposte.net',
  'tiscali.it', 'alice.it', 'virgilio.it', 'tin.it', 'libero.it'
];

const isGenericEmail = (email) => {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return GENERIC_PROVIDERS.includes(domain);
};

const cleanSocialName = (rawName, link) => {
  if (!rawName) return 'Unknown';
  let name = rawName.split('|')[0].split('-')[0].trim();
  const lower = name.toLowerCase();

  const junkWords = [
    'facebook', 'instagram', 'linkedin', 'chats', 'notifications', 'messenger',
    'log in', 'sign in', 'sign up', 'home', 'about', 'menu', 'profile', 'page',
    'unknown', 'untitled', 'search', 'feed', 'watch', 'reels', 'stories',
    'marketplace', 'groups', 'friends', 'gaming'
  ];

  const isJunk = (t) => !t || t.length < 2 || junkWords.some(w => t.toLowerCase().includes(w));

  // For Facebook/Instagram: ALWAYS try URL first — most reliable since login session pollutes og:title
  if (link && (link.includes('facebook.com') || link.includes('instagram.com'))) {
    try {
      const url = new URL(link);
      const pathParts = url.pathname.split('/').filter(p =>
        p.length > 1 && !['p', 'reel', 'reels', 'profile.php', 'pages', 'photo', 'video', 'posts'].includes(p)
      );
      if (pathParts.length > 0) {
        let slug = pathParts[0];
        // Split CamelCase: "OpenLatteCafe" → "Open Latte Cafe"
        slug = slug.replace(/([a-z])([A-Z])/g, '$1 $2');
        // Replace hyphens/underscores/dots with spaces
        slug = slug.replace(/[-_.]/g, ' ').trim();

        // Smart keyword splitting for all-lowercase slugs
        // e.g. "bigeasycafetx" → "big easy cafe tx"
        const bizKeywords = [
          'cafe', 'coffee', 'bakery', 'catering', 'kitchen', 'grill', 'bistro',
          'restaurant', 'diner', 'bar', 'lounge', 'shop', 'store', 'salon',
          'barbershop', 'spa', 'studio', 'garage', 'auto', 'repair', 'cleaning',
          'plumbing', 'electric', 'hvac', 'roofing', 'landscaping', 'photography',
          'photography', 'design', 'media', 'agency', 'consulting', 'services',
          'solutions', 'group', 'company', 'co', 'inc', 'llc', 'corp'
        ];
        const keywordRegex = new RegExp(`(${bizKeywords.join('|')})`, 'gi');
        slug = slug.replace(keywordRegex, ' $1 ').replace(/\s+/g, ' ').trim();

        // Title case each word
        slug = slug.split(' ').filter(w => w.length > 0)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
        if (slug && slug.length > 1) return slug;
      }
    } catch (e) { }
  }

  // Fallback: use rawName if it's not junk
  if (!isJunk(rawName)) {
    let name = rawName.replace(/^\(\d+\)\s*/, '').split('|')[0].split('-')[0].trim();
    if (!isJunk(name)) return name;
  }

  return 'Unknown';
};

const hasCustomWebsite = (text) => {
  if (!text) return false;
  const domainRegex = /(?:[a-zA-Z0-9-]+\.)+(com|net|org|co|us|info|biz|io|me|tv|shop|store|online|site|tech|website|agency)\b/gi;
  const matches = text.match(domainRegex) || [];

  const ignoreDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'msn.com',
    'facebook.com', 'instagram.com', 'linkedin.com', 'twitter.com', 'tiktok.com', 'youtube.com',
    'pinterest.com', 'snapchat.com', 'reddit.com', 'tumblr.com', 'whatsapp.com', 't.me', 'telegram.me',
    'linktr.ee', 'campsite.bio', 'apple.com', 'google.com', 'bing.com', 'yelp.com', 'tripadvisor.com',
    'foursquare.com', 'yellowpages.com', 'bbb.org', 'trustpilot.com', 'wix.com', 'wordpress.com',
    'weebly.com', 'squarespace.com', 'shopify.com', 'mail.com', 'amazon.com', 'ebay.com', 'etsy.com',
    'doordash.com', 'ubereats.com', 'grubhub.com', 'postmates.com', 'zomato.com', 'swiggy.com',
    'foodpanda.com', 'deliveroo.co', 'just-eat.com', 'booking.com', 'fbcdn.net', 'akamaihd.net',
    'schema.org', 'w3.org', 'ogp.me', 'gstatic.com', 'googleusercontent.com', 'wixpress.com',
    'sentry.io', 'stripe.com', 'paypal.com', 'github.com', 'gitlab.com', 'bitbucket.org'
  ];

  for (const match of matches) {
    const lower = match.toLowerCase();
    let isIgnored = false;
    for (const idom of ignoreDomains) {
      if (lower === idom || lower.endsWith('.' + idom)) {
        isIgnored = true; break;
      }
    }
    if (!isIgnored) return true; // Found a custom domain!
  }
  return false;
};

// ─── EMAIL EXTRACTOR UTILITY ────────────────────────────────────────────────
const extractEmailsFromText = (rawText) => {
  if (!rawText) return [];

  // High Read Power: Deobfuscate hidden emails
  const text = rawText
    .replace(/\[at\]/gi, '@')
    .replace(/\(at\)/gi, '@')
    .replace(/\[dot\]/gi, '.')
    .replace(/\(dot\)/gi, '.')
    .replace(/ at /gi, '@')
    .replace(/ dot /gi, '.');

  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const found = text.match(emailRegex) || [];
  // Filter common false positives
  const blacklist = ['example.com', 'sentry.io', 'wixpress.com', 'squarespace.com',
    'amazonaws.com', 'cloudflare.com', 'google.com', 'facebook.com',
    'instagram.com', 'twitter.com', 'linkedin.com', 'apple.com', 'microsoft.com'];
  return [...new Set(found)].filter(email => {
    const lower = email.toLowerCase();
    if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.gif') || lower.endsWith('.svg')) return false;
    if (lower.includes('@2x') || lower.includes('@3x')) return false;
    if (lower.startsWith('noreply') || lower.startsWith('no-reply') || lower.startsWith('donotreply')) return false;
    return !blacklist.some(b => lower.includes(b));
  });
};

// ─── FIND EMAIL FOR LEAD (5-STRATEGY PIPELINE, browser-reusable) ────────────
const findEmailForLead = async (lead, sendStatusUpdate, sharedBrowser = null) => {
  let browser = sharedBrowser;
  let ownBrowser = false;
  let page;
  try {
    if (!browser) {
      browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome-stable',
        userDataDir: BROWSER_SESSION_DIR,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled'],
        timeout: 60000
      });
      ownBrowser = true;
    }

    page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
    // Block heavy resources for speed
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const t = req.resourceType();
      if (t === 'image' || t === 'media' || t === 'font' || t === 'stylesheet') req.abort();
      else req.continue();
    });

    const socialLinks = { facebook: null, instagram: null, linkedin: null };
    let foundEmail = null;
    let emailSource = null;

    // ── STRATEGY 0: Check Website (If available) ────────────────────────────
    if (lead.website) {
      try {
        if (sendStatusUpdate) sendStatusUpdate(`🌐 Checking website: ${lead.website}`);
        await page.goto(lead.website, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await new Promise(r => setTimeout(r, 1200));

        const webResult = await page.evaluate(() => {
          const text = document.body.innerText;
          const mailtoLinks = Array.from(document.querySelectorAll('a[href^="mailto:"]'))
            .map(a => a.href.replace('mailto:', '').split('?')[0]);
          return { text, mailtoLinks };
        });

        const allCandidates = [...webResult.mailtoLinks, ...extractEmailsFromText(webResult.text)];
        const validEmails = allCandidates.filter(isGenericEmail);
        if (validEmails.length > 0) {
          foundEmail = validEmails[0];
          emailSource = 'website';
          if (sendStatusUpdate) sendStatusUpdate(`✅ Email found on website: ${foundEmail}`);
        }
      } catch (e) { /* swallow */ }
    }

    // ── STRATEGY 1: Combined search (Bing → DDG → Yahoo) — extracts emails AND social links
    if (!foundEmail) {
      try {
        const query = `"${lead.name}" "${lead.city}" email contact`;
        if (sendStatusUpdate) sendStatusUpdate(`Searching: ${lead.name}...`);

        const searchUrls = [
          `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
          `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
          `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`
        ];

        let combinedText = '';
        let combinedHrefs = [];
        for (const url of searchUrls) {
          try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
            await new Promise(r => setTimeout(r, 1200));
            const data = await page.evaluate(() => ({
              text: document.body.innerText,
              hrefs: Array.from(document.querySelectorAll('a[href]')).map(a => a.href).filter(Boolean)
            }));
            combinedText += ' ' + data.text;
            combinedHrefs.push(...data.hrefs);
            // Early break if we already have a valid email
            const found = extractEmailsFromText(combinedText).filter(isGenericEmail);
            if (found.length > 0) break;
          } catch (e) { /* try next engine */ }
        }

        // Extract social links from search results
        for (const href of combinedHrefs) {
          let real = href;
          if (href.includes('RU=')) {
            try { real = decodeURIComponent(href.split('RU=')[1].split('/RK=')[0]); } catch (e) { }
          }
          if (!socialLinks.facebook && real.includes('facebook.com/') && !real.includes('/sharer') && !real.includes('/login')) {
            socialLinks.facebook = real.split('?')[0];
          }
          if (!socialLinks.instagram && real.includes('instagram.com/') && !real.includes('/p/') && !real.includes('/explore/')) {
            socialLinks.instagram = real.split('?')[0];
          }
          if (!socialLinks.linkedin && real.includes('linkedin.com/') && !real.includes('/jobs/') && !real.includes('/login')) {
            socialLinks.linkedin = real.split('?')[0];
          }
        }

        const validEmails = extractEmailsFromText(combinedText).filter(isGenericEmail);
        if (validEmails.length > 0) {
          foundEmail = validEmails[0];
          emailSource = 'search_engine';
          if (sendStatusUpdate) sendStatusUpdate(`Email found via Search Engine: ${foundEmail}`);
        }
      } catch (e) { /* swallow */ }
    }

    // ── STRATEGY 2: Facebook About page ─────────────────────────────────────
    if (!foundEmail && socialLinks.facebook) {
      try {
        if (sendStatusUpdate) sendStatusUpdate(`Checking Facebook page...`);
        const fbAboutUrl = socialLinks.facebook.replace(/\/$/, '') + '/about';
        await page.goto(fbAboutUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await new Promise(r => setTimeout(r, 1500));
        const fbText = await page.evaluate(() => document.body.innerText);
        const validEmails = extractEmailsFromText(fbText).filter(isGenericEmail);
        if (validEmails.length > 0) {
          foundEmail = validEmails[0];
          emailSource = 'facebook';
          if (sendStatusUpdate) sendStatusUpdate(`Email found via Facebook: ${foundEmail}`);
        }
      } catch (e) { /* swallow */ }
    }

    // ── STRATEGY 3: Instagram Bio ────────────────────────────────────────────
    if (!foundEmail && socialLinks.instagram) {
      try {
        if (sendStatusUpdate) sendStatusUpdate(`Checking Instagram bio...`);
        await page.goto(socialLinks.instagram, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await new Promise(r => setTimeout(r, 1500));
        const igResult = await page.evaluate(() => ({
          text: document.body.innerText,
          mailtoLinks: Array.from(document.querySelectorAll('a[href^="mailto:"]')).map(a => a.href.replace('mailto:', '').split('?')[0])
        }));
        const candidates = [...igResult.mailtoLinks, ...extractEmailsFromText(igResult.text)];
        const validEmails = candidates.filter(isGenericEmail);
        if (validEmails.length > 0) {
          foundEmail = validEmails[0];
          emailSource = 'instagram';
          if (sendStatusUpdate) sendStatusUpdate(`✅ Email found via Instagram: ${foundEmail}`);
        }
      } catch (e) { /* swallow */ }
    }

    // ── STRATEGY 4: LinkedIn Company Page ───────────────────────────────────
    if (!foundEmail && socialLinks.linkedin) {
      try {
        if (sendStatusUpdate) sendStatusUpdate(`💼 Checking LinkedIn page...`);
        await page.goto(socialLinks.linkedin, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await new Promise(r => setTimeout(r, 1500));
        const liText = await page.evaluate(() => document.body.innerText);
        const validEmails = extractEmailsFromText(liText).filter(isGenericEmail);
        if (validEmails.length > 0) {
          foundEmail = validEmails[0];
          emailSource = 'linkedin';
          if (sendStatusUpdate) sendStatusUpdate(`Email found via LinkedIn: ${foundEmail}`);
        }
      } catch (e) { /* swallow */ }
    }

    if (!foundEmail && sendStatusUpdate) sendStatusUpdate(`❌ No email found for ${lead.name}`);
    return { email: foundEmail, emailSource, socialLinks };

  } catch (err) {
    console.error('[EmailFinder] Fatal error:', err.message);
    return { email: null, emailSource: null, socialLinks: { facebook: null, instagram: null, linkedin: null } };
  } finally {
    if (page) { try { await page.close(); } catch (e) { } }
    if (ownBrowser && browser) { try { await browser.close(); } catch (e) { } }
  }
};

// HTML WRAPPER FOR DESIGN & TRUST
const wrapHtml = (body) => {
  const formattedBody = body.replace(/\n/g, '<br/>');
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #f1f5f9; border-radius: 16px; color: #1e293b; background-color: #ffffff;">
      <div style="font-size: 16px; line-height: 1.6;">
        ${formattedBody}
      </div>
      <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #f1f5f9; font-size: 13px; color: #64748b;">
        <p style="margin: 0 0 10px 0; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">Let's Connect Directly:</p>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 5px 0;">
              <span style="background: #f8fafc; padding: 5px 10px; border-radius: 6px; display: inline-block;">
                 <a href="mailto:muntazir.site@gmail.com" style="color: #4f46e5; text-decoration: none; font-weight: 600;">muntazir.site@gmail.com</a>
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">
              <span style="background: #f0fdf4; padding: 5px 10px; border-radius: 6px; display: inline-block;">
                <a href="https://wa.me/918511868872" style="color: #10b981; text-decoration: none; font-weight: 600;">WhatsApp: +91 8511868872</a>
              </span>
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;
};

// GLOBAL LOCK VARIABLE (Memory Level Protection)
let activeSending = new Set();

// ATOMIC SENDING
const sendEmail = async (recipientId) => {
  if (activeSending.has(recipientId.toString())) {
    console.log(`[LOCK] Skip ${recipientId} - Already in progress`);
    return;
  }
  activeSending.add(recipientId.toString());

  let recipient = null;
  try {
    console.log(`[ENGINE] Attempting to process lead ID: ${recipientId}`);
    recipient = await Recipient.findOneAndUpdate(
      { _id: recipientId, status: { $nin: ['sending', 'replied', 'stopped', 'finished', 'archived'] } },
      { $set: { status: 'sending' } },
      { new: true }
    );

    if (!recipient) {
      console.log(`[ENGINE] Lead ID ${recipientId} not available or already sending.`);
      activeSending.delete(recipientId.toString());
      return;
    }

    console.log(`[SMTP] Connecting as ${recipient.emailUser}...`);
    const cleanPass = recipient.emailPass.replace(/\s+/g, '');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 465, secure: true,
      auth: { user: recipient.emailUser.trim(), pass: cleanPass }
    });

    let rawBody = recipient.body1 || "Hi {{First Name}}, Just checking in.";
    if (recipient.step === 2) rawBody = recipient.body2 || "Hi {{First Name}}, Follow up.";
    if (recipient.step === 3) rawBody = recipient.body3 || "Hi {{First Name}}, Final touch.";

    // STEP 1: Replace placeholders (Support both {{var}} and {var})
    let pBody = rawBody;
    let pSubject = recipient.subject || "Outreach";

    if (recipient.data) {
      Object.keys(recipient.data).forEach(key => {
        const doubleTag = `{{${key}}}`;
        const singleTag = `{${key}}`;
        const val = recipient.data[key] || "";

        const dRegex = new RegExp(doubleTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const sRegex = new RegExp(singleTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

        pBody = pBody.replace(dRegex, val).replace(sRegex, val);
        pSubject = pSubject.replace(dRegex, val).replace(sRegex, val);
      });
    }

    // STEP 2: Apply Spintax AFTER placeholders are filled
    pBody = applySpintax(pBody);
    pSubject = applySpintax(pSubject);

    // VALIDATION: Check for missing variables (both formats)
    const remainingVars = [
      ...pBody.matchAll(/\{\{([^}]*)\}\}/g), ...pBody.matchAll(/\{([^}]*)\}/g),
      ...pSubject.matchAll(/\{\{([^}]*)\}\}/g), ...pSubject.matchAll(/\{([^}]*)\}/g)
    ];
    if (remainingVars.length > 0) {
      const missing = [...new Set(remainingVars.map(v => v[0]))].join(', ');
      throw new Error(`Missing template variables: ${missing}. Please add these columns to your data.`);
    }

    console.log(`[SMTP] Delivering to ${recipient.email}...`);
    await transporter.sendMail({
      from: recipient.emailUser,
      to: recipient.email,
      subject: pSubject,
      html: wrapHtml(pBody)
    });


    const sentStep = recipient.step;
    let nextStatus = `Step ${sentStep} Sent`;
    let nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 3);
    if (sentStep >= 3) { nextStatus = 'finished'; nextDate = null; }

    await Recipient.findByIdAndUpdate(recipientId, {
      status: nextStatus,
      step: sentStep + 1,
      lastSentAt: new Date(),
      nextSendAt: nextStatus === 'finished' ? null : nextDate,
      $push: { history: { sentAt: new Date(), event: `Sent ${nextStatus}`, subject: pSubject } }
    });
    console.log(`[SUCCESS] Sent to ${recipient.email}`);
  } catch (err) {
    const errorMsg = recipient ? `[FAILED] ${recipient.email}` : `[FAILED] Lead ID ${recipientId}`;
    console.error(errorMsg, ":", err.message);
    if (recipientId) await Recipient.findByIdAndUpdate(recipientId, { status: 'pending' });
  } finally {
    activeSending.delete(recipientId.toString());
  }
};

app.post('/api/start-campaign', upload.single('file'), async (req, res) => {
  const { subject, body1, body2, body3, emailUser, emailPass } = req.body;
  const workbook = xlsx.readFile(req.file.path);
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

  for (const contact of data) {
    const email = contact.Email || contact.email || contact['Email Address'];
    if (!email) continue;
    try {
      await Recipient.create({
        email, campaignId: 'CAMP_' + Date.now(), emailUser, emailPass, subject, body1, body2, body3, data: contact,
        nextSendAt: new Date(Date.now() + 5000) // 5 sec automation start
      });
    } catch (e) { /* Skip duplicates */ }
  }
  res.json({ message: "Campaign Processed!" });
});

app.post('/api/add-recipient', async (req, res) => {
  const { email, subject, body1, body2, body3, emailUser, emailPass, data, status: initialStatus } = req.body;
  try {
    const nr = new Recipient({
      email,
      status: initialStatus || 'pending',
      campaignId: 'MANUAL_' + Date.now(),
      emailUser, emailPass, subject, body1, body2, body3, data,
      nextSendAt: initialStatus === 'archived' ? null : new Date(Date.now() + 5000)
    });
    await nr.save();
    // INSTANT DISPATCH only if not archived
    if (initialStatus !== 'archived') sendEmail(nr._id);
    res.json({ message: initialStatus === 'archived' ? "Lead Archived!" : "Lead Added & Email Dispatched!" });
  } catch (e) {
    res.status(400).json({ error: "Lead already exists in database! Target blocked for safety." });
  }
});

app.get('/api/stats', async (req, res) => {
  const stats = await Recipient.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
  res.json(stats);
});

app.get('/api/recipients', async (req, res) => {
  const list = await Recipient.find().sort({ lastSentAt: -1, _id: -1 });
  res.json(list);
});

app.post('/api/send-now/:id', async (req, res) => {
  try { await sendEmail(req.params.id); res.json({ message: "Dispatched!" }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/stop/:id', async (req, res) => { await Recipient.findByIdAndUpdate(req.params.id, { status: 'stopped' }); res.json({ message: "Stopped!" }); });
app.post('/api/restart/:id', async (req, res) => { await Recipient.findByIdAndUpdate(req.params.id, { step: 1, status: 'pending', isArchived: false, nextSendAt: new Date() }); res.json({ message: "Restarted!" }); });
app.post('/api/continue/:id', async (req, res) => { await Recipient.findByIdAndUpdate(req.params.id, { status: 'pending', isArchived: false, nextSendAt: new Date() }); res.json({ message: "Resumed!" }); });
app.post('/api/archive/:id', async (req, res) => { await Recipient.findByIdAndUpdate(req.params.id, { isArchived: true }); res.json({ message: "Archived!" }); });
app.delete('/api/delete-recipient/:id', async (req, res) => { await Recipient.findByIdAndDelete(req.params.id); res.json({ message: "Deleted!" }); });

// ─── BULK ACTIONS ───────────────────────────────────────────────────────
app.post('/api/bulk-archive', async (req, res) => {
  const { ids } = req.body;
  await Recipient.updateMany({ _id: { $in: ids } }, { $set: { isArchived: true } });
  res.json({ message: `${ids.length} leads archived!` });
});

app.post('/api/bulk-send', async (req, res) => {
  const { ids, templateId } = req.body;
  try {
    for (const id of ids) {
      try {
        const lead = await Recipient.findById(id);
        let template = null;
        if (templateId === 'step1') template = { subject: lead.subject, body: lead.body1 };
        else if (templateId === 'step2') template = { subject: lead.subject, body: lead.body2 };
        else if (templateId === 'step3') template = { subject: lead.subject, body: lead.body3 };
        else template = await EmailTemplate.findById(templateId);

        if (lead && template) {
          const cleanPass = lead.emailPass.replace(/\s+/g, '');
          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com', port: 465, secure: true,
            auth: { user: lead.emailUser.trim(), pass: cleanPass }
          });

          let body = template.body;
          let subject = template.subject;

          if (lead.data) {
            Object.keys(lead.data).forEach(key => {
              const doubleTag = `{{${key}}}`;
              const singleTag = `{${key}}`;
              const val = lead.data[key] || "";
              const dRegex = new RegExp(doubleTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
              const sRegex = new RegExp(singleTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
              body = body.replace(dRegex, val).replace(sRegex, val);
              subject = subject.replace(dRegex, val).replace(sRegex, val);
            });
          }

          const finalBody = applySpintax(body);
          const finalSubject = applySpintax(subject);

          await transporter.sendMail({ from: lead.emailUser, to: lead.email, subject: finalSubject, html: wrapHtml(finalBody) });
          lead.history.push({ sentAt: new Date(), event: `Bulk: ${templateId}`, subject: finalSubject });
          await lead.save();
        }
      } catch (e) { console.error(`Bulk send error: ${e.message}`); }
    }
    res.json({ message: `Bulk email processing finished for ${ids.length} leads!` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── CUSTOM FIELD ROUTES ────────────────────────────────────────────────
app.get('/api/custom-fields', async (req, res) => {
  console.log(`[API] GET /api/custom-fields triggered at ${new Date().toISOString()}`);
  try {
    const fields = await CustomField.find().sort({ createdAt: 1 });
    console.log(`[API] Found ${fields.length} fields.`);
    res.json(fields);
  } catch (e) {
    console.error("[API] Error fetching fields:", e.message);
    res.status(500).json({ error: e.message });
  }
});
app.post('/api/custom-fields', async (req, res) => {
  try {
    const { name } = req.body;
    const f = await CustomField.create({ name });
    res.json(f);
  } catch (e) { res.status(400).json({ error: 'Field already exists' }); }
});
app.put('/api/custom-fields/:id', async (req, res) => {
  await CustomField.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: 'Updated' });
});
app.delete('/api/custom-fields/:id', async (req, res) => {
  await CustomField.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// ─── CUSTOM TEMPLATE ROUTES ───────────────────────────────────────────────
// Get all templates
app.get('/api/email-templates', async (req, res) => {
  const templates = await EmailTemplate.find().sort({ createdAt: -1 });
  res.json(templates);
});

// Create template
app.post('/api/email-templates', async (req, res) => {
  try {
    const { name, subject, body } = req.body;
    if (!name || !subject || !body) return res.status(400).json({ error: 'All fields required!' });
    const t = await EmailTemplate.create({ name, subject, body });
    res.json({ message: 'Template saved!', template: t });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete template
app.delete('/api/email-templates/:id', async (req, res) => {
  await EmailTemplate.findByIdAndDelete(req.params.id);
  res.json({ message: 'Template deleted!' });
});

// Update template
app.put('/api/email-templates/:id', async (req, res) => {
  const { name, subject, body } = req.body;
  await EmailTemplate.findByIdAndUpdate(req.params.id, { name, subject, body });
  res.json({ success: true });
});

// --- WhatsApp Template Routes ---
app.get('/api/whatsapp-templates', async (req, res) => {
  try {
    const templates = await WhatsappTemplate.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/whatsapp-templates', async (req, res) => {
  try {
    const { message, details } = req.body;
    const count = await WhatsappTemplate.countDocuments();
    const template = await WhatsappTemplate.create({
      message,
      details,
      isActive: count === 0
    });
    res.json(template);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/whatsapp-templates/:id/activate', async (req, res) => {
  try {
    await WhatsappTemplate.updateMany({}, { $set: { isActive: false } });
    await WhatsappTemplate.findByIdAndUpdate(req.params.id, { $set: { isActive: true } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/whatsapp-templates/:id', async (req, res) => {
  try {
    await WhatsappTemplate.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Send custom template to a specific lead
app.post('/api/send-custom/:leadId/:templateId', async (req, res) => {
  try {
    const lead = await Recipient.findById(req.params.leadId);
    let template = null;
    if (req.params.templateId === 'step1') template = { subject: lead.subject, body: lead.body1 };
    else if (req.params.templateId === 'step2') template = { subject: lead.subject, body: lead.body2 };
    else if (req.params.templateId === 'step3') template = { subject: lead.subject, body: lead.body3 };
    else template = await EmailTemplate.findById(req.params.templateId);

    if (!lead || !template) return res.status(404).json({ error: 'Lead or Template not found!' });

    const cleanPass = lead.emailPass.replace(/\s+/g, '');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 465, secure: true,
      auth: { user: lead.emailUser.trim(), pass: cleanPass }
    });

    // Merge original data with user-provided customData
    const customData = req.body.customData || {};
    const mergedData = { ...(lead.data || {}), ...customData };

    // Save updated data back to lead for future use
    lead.data = mergedData;
    await lead.save();

    // Replace placeholders (Support both {{var}} and {var})
    let body = template.body;
    let subject = template.subject;

    Object.keys(mergedData).forEach(key => {
      const doubleTag = `{{${key}}}`;
      const singleTag = `{${key}}`;
      const val = mergedData[key] || "";

      const dRegex = new RegExp(doubleTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const sRegex = new RegExp(singleTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

      body = body.replace(dRegex, val).replace(sRegex, val);
      subject = subject.replace(dRegex, val).replace(sRegex, val);
    });

    // VALIDATION: Check for missing variables (both formats)
    const finalBody = applySpintax(body);
    const finalSubject = applySpintax(subject);
    const remainingVars = [
      ...finalBody.matchAll(/\{\{([^}]*)\}\}/g), ...finalBody.matchAll(/\{([^}]*)\}/g),
      ...finalSubject.matchAll(/\{\{([^}]*)\}\}/g), ...finalSubject.matchAll(/\{([^}]*)\}/g)
    ];

    if (remainingVars.length > 0) {
      const missing = [...new Set(remainingVars.map(v => v[0]))].join(', ');
      return res.status(400).json({ error: `Missing variables for this lead: ${missing}` });
    }

    await transporter.sendMail({
      from: lead.emailUser,
      to: lead.email,
      subject: finalSubject,
      html: wrapHtml(finalBody)
    });

    // Log to history
    lead.history.push({ sentAt: new Date(), event: 'Custom Template Sent', subject: finalSubject });
    await lead.save();

    res.json({ message: `Custom email sent to ${lead.email}! ✅` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const distPath = path.join(__dirname, '../frontend/dist');
const distIndexPath = path.join(distPath, 'index.html');
const hasFrontendBuild = fs.existsSync(distIndexPath);

if (hasFrontendBuild) {
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
    }
  }));
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(distIndexPath);
    } else {
      next();
    }
  });
} else {
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Frontend not built</title>
    <meta http-equiv="refresh" content="0; url=http://localhost:5173" />
    <style>
      body { font-family: Arial, sans-serif; padding: 32px; line-height: 1.5; }
      code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; }
      a { color: #0f62fe; }
    </style>
  </head>
  <body>
    <h1>Frontend build not found</h1>
    <p>The backend is running on <code>5001</code>, but <code>frontend/dist/index.html</code> is missing.</p>
    <p>Run <code>npm run build</code> from the project root, or use <code>npm run hard-start</code> to start backend and frontend together.</p>
    <p>Redirecting to <a href="http://localhost:5173">http://localhost:5173</a> now.</p>
  </body>
</html>`);
  });
}

cron.schedule('*/1 * * * *', async () => {
  const pending = await Recipient.find({
    isArchived: { $ne: true },
    status: { $nin: ['finished', 'replied', 'stopped', 'sending'] },
    nextSendAt: { $lte: new Date() }
  });

  for (const rec of pending) {
    await sendEmail(rec._id);
    // TURBO MODE (10-20 sec gap)
    await new Promise(r => setTimeout(r, Math.floor(Math.random() * 10000) + 10000));
  }
});

cron.schedule('*/1 * * * *', async () => {
  console.log("[IMAP Check] Starting Deep Scan...");
  const accounts = await Recipient.aggregate([
    { $match: { emailUser: { $exists: true, $ne: '' } } },
    { $group: { _id: "$emailUser", pass: { $first: "$emailPass" } } }
  ]);

  for (const acc of accounts) {
    const cleanPass = acc.pass.replace(/\s+/g, '');
    const client = new ImapFlow({
      host: 'imap.gmail.com', port: 993, secure: true,
      auth: { user: acc._id.trim(), pass: cleanPass },
      logger: false
    });
    client.on('error', err => console.error("ImapFlow Error:", err.message));

    try {
      await client.connect();
      let lock = await client.getMailboxLock('INBOX');
      try {
        const mailbox = await client.status('INBOX', { messages: true });
        const totalMsg = mailbox.messages || 0;
        const startRange = Math.max(1, totalMsg - 50);

        for await (let msg of client.fetch(`${startRange}:*`, { envelope: true, source: true, uid: true })) {
          const senderEmail = msg.envelope.from[0].address;
          const messageId = msg.envelope.messageId;
          const exists = await Recipient.findOne({ email: senderEmail, isArchived: { $ne: true }, status: { $nin: ['finished', 'stopped'] } });

          if (exists) {
            const parsed = await simpleParser(msg.source);
            const subject = parsed.subject || 'No Subject';
            const body = parsed.text || parsed.html || 'No Content';

            const isDuplicate = (exists.replies || []).some(r => {
              if (r.messageId && messageId && r.messageId === messageId) return true;
              return r.subject === subject && (r.body || '').substring(0, 100) === body.substring(0, 100);
            });

            if (!isDuplicate) {
              exists.status = 'replied';
              exists.replies.push({
                messageId,
                receivedAt: msg.envelope.date || new Date(),
                subject,
                body
              });
              await exists.save();
              console.log(`[IMAP Check] NEW REPLY captured from: ${senderEmail}`);
            }
          }
        }
      } finally { lock.release(); }
      await client.logout();
    } catch (err) { console.error("IMAP Error:", err.message); }
  }
});

// --- OPEN BROWSER FOR LOGIN ---
app.get('/api/open-browser', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome-stable',
      userDataDir: BROWSER_SESSION_DIR,
      headless: false,
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Open Instagram and LinkedIn in separate tabs
    const page1 = await browser.newPage();
    await page1.goto('https://www.instagram.com', { waitUntil: 'domcontentloaded' });

    const page2 = await browser.newPage();
    await page2.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });

    res.json({ message: 'Browser opened successfully! Please log in, then close the browser window.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- SOCIAL SCRAPING ENGINE ---
const scrapeSocialDirectly = async (source, keyword, city, browser, sendData, foundEmailsSet, getCancelled, cookies = {}) => {
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  // Block heavy resources on the search-results page itself for speed
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const t = req.resourceType();
    if (t === 'image' || t === 'media' || t === 'font' || t === 'stylesheet') req.abort();
    else req.continue();
  });

  let siteDomain = '';
  if (source === 'ig') siteDomain = 'instagram.com';
  else if (source === 'facebook') siteDomain = 'facebook.com';
  else if (source === 'linkedin') siteDomain = 'linkedin.com';

  const queries = [
    `site:${siteDomain} "${keyword}" "${city}"`,
    `site:${siteDomain} "${keyword}" in "${city}" email`,
    `site:${siteDomain} "${keyword}" "${city}" contact`,
    `site:${siteDomain} "${keyword}" ${city} "gmail.com"`
  ];

  try {
    for (const query of queries) {
      if (getCancelled()) break;

      for (let pageNum = 0; pageNum < 1000; pageNum++) {
        if (getCancelled()) break;

        const start = pageNum * 10 + 1;
        const bingUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}&first=${start}`;
        const ddgUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}&s=${start}`;
        const yahooUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}&b=${start}`;

        sendData({ type: 'status', message: `${source.toUpperCase()} • Query ${queries.indexOf(query) + 1} • Page ${pageNum + 1}` });

        // PARALLEL SEARCH: Try Bing + DuckDuckGo + Yahoo at the exact same time
        let allHrefs = [];
        await Promise.all([bingUrl, ddgUrl, yahooUrl].map(async (url) => {
          let tempPage;
          try {
            tempPage = await browser.newPage();
            await tempPage.setRequestInterception(true);
            tempPage.on('request', (req) => {
              const t = req.resourceType();
              if (t === 'image' || t === 'media' || t === 'font' || t === 'stylesheet') req.abort();
              else req.continue();
            });
            await tempPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 });
            await new Promise(r => setTimeout(r, 400));
            const resultData = await tempPage.evaluate(() => {
              const blocks = Array.from(document.querySelectorAll('.b_algo, .result, .algo, .g, li.b_algo, div.algo-sr'));
              let items = [];
              if (blocks.length > 0) {
                blocks.forEach(b => {
                  const a = b.querySelector('a');
                  if (a) items.push({ href: a.href, snippet: b.innerText, title: a.innerText });
                });
              } else {
                Array.from(document.querySelectorAll('a[href]')).forEach(a => {
                  items.push({ href: a.href, snippet: '', title: a.innerText });
                });
              }
              return items.map(item => {
                let h = item.href;
                if (h.includes('RU=')) try { h = decodeURIComponent(h.split('RU=')[1].split('/RK=')[0]); } catch (e) { }
                if (h.includes('uddg=')) try { h = decodeURIComponent(h.split('uddg=')[1].split('&')[0]); } catch (e) { }
                return { href: h, snippet: item.snippet, title: item.title };
              });
            });
            allHrefs.push(...resultData);
          } catch (e) { }
          finally { if (tempPage) await tempPage.close().catch(() => { }); }
        }));

        const uniqueItems = [];
        const seenUrls = new Set();
        for (const item of allHrefs) {
          const href = item.href;
          if (seenUrls.has(href)) continue;
          seenUrls.add(href);

          if (source === 'ig' && (!href.includes('instagram.com/') || href.includes('/explore/'))) continue;
          if (source === 'facebook' && (!href.includes('facebook.com/') || href.includes('/sharer') || href.includes('/login') || href.includes('/help'))) continue;
          if (source === 'linkedin' && (!href.includes('linkedin.com/') || href.includes('/login'))) continue;

          uniqueItems.push(item);
        }

        if (uniqueItems.length === 0) {
          if (pageNum > 2) break;
          continue;
        }

        // PARALLEL link processing — open multiple worker pages concurrently
        const CONCURRENCY = 14;
        sendData({ type: 'status', message: `Found ${uniqueItems.length} ${source} links — parallel scanning (14x)...` });

        const visitLink = async (item) => {
          if (getCancelled()) return;
          const link = item.href;
          const snippetText = item.snippet + " " + item.title;

          // Skip if they already have a website!
          if (hasCustomWebsite(snippetText)) {
            sendData({ type: 'status', message: `⏭️ Skipped ${link} (Already has a custom website in snippet)` });
            return;
          }

          // PRE-FETCH EMAIL FROM SNIPPET
          const snippetEmails = extractEmailsFromText(snippetText).filter(isGenericEmail);
          let preFoundEmail = snippetEmails.length > 0 ? snippetEmails[0] : null;

          if (preFoundEmail) {
            sendData({ type: 'status', message: `⚡ Pre-found email in snippet, fetching real name...` });
          }

          sendData({ type: 'status', message: `🔍 Deep Scanning: ${link}` });

          let workerPage;
          try {
            workerPage = await browser.newPage();
            await workerPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            // Inject Cookies for Deep Scraping
            if (source === 'ig' && cookies.igSession) {
              await workerPage.setCookie({ name: 'sessionid', value: cookies.igSession, domain: '.instagram.com' });
            } else if (source === 'linkedin' && cookies.liAt) {
              await workerPage.setCookie({ name: 'li_at', value: cookies.liAt, domain: '.linkedin.com' });
            } else if (source === 'facebook' && cookies.fbCUser && cookies.fbXs) {
              await workerPage.setCookie({ name: 'c_user', value: cookies.fbCUser, domain: '.facebook.com' });
              await workerPage.setCookie({ name: 'xs', value: cookies.fbXs, domain: '.facebook.com' });
            }

            await workerPage.setRequestInterception(true);
            workerPage.on('request', (req) => {
              const t = req.resourceType();
              if (t === 'image' || t === 'media' || t === 'font' || t === 'stylesheet') req.abort();
              else req.continue();
            });
            const isFacebook = link.includes('facebook.com');
            const targetUrl = isFacebook
              ? (link.includes('profile.php') ? `${link}&sk=about` : `${link.replace(/\/$/, '')}/about`)
              : link;

            await workerPage.goto(targetUrl, { waitUntil: isFacebook ? 'networkidle2' : 'domcontentloaded', timeout: 20000 });
            await new Promise(r => setTimeout(r, isFacebook ? 4000 : 1500));

            const data = await workerPage.evaluate(() => {
              const ogTitle = document.querySelector('meta[property="og:title"]')?.content || '';
              const h1Text = document.querySelector('h1')?.innerText?.replace(/^\(\d+\)\s*/, '').trim() || '';
              const titleText = document.title.replace(/^\(\d+\)\s*/, '').split('|')[0].split('-')[0].trim();

              // Prefer og:title if it doesn't say generic words
              const genericWords = ['facebook', 'instagram', 'linkedin', 'log in', 'sign in', 'sign up', 'notifications'];
              const isGenericTitle = (t) => !t || genericWords.some(w => t.toLowerCase().includes(w));

              const rawName = (!isGenericTitle(ogTitle) ? ogTitle : null)
                || (!isGenericTitle(h1Text) ? h1Text : null)
                || (!isGenericTitle(titleText) ? titleText : null)
                || ogTitle || titleText || 'Unknown';

              return {
                text: document.documentElement.outerHTML,
                rawName,
                bioLinks: Array.from(document.querySelectorAll('a[href]')).map(a => a.href).join(' '),
                mailtos: Array.from(document.querySelectorAll('a[href^="mailto:"]')).map(a => a.href.replace('mailto:', '').split('?')[0]),
                // Aggressive phone extraction for FB/Social
                allPhones: Array.from(document.body.innerText.matchAll(/(?:\+?\d{1,3}[\s-]*)?\(?\d{2,4}\)?[\s-]*\d{3,4}[\s-]*\d{3,4}/g)).map(m => m[0])
              };
            });

            // Skip if they already have a website in their bio links!
            if (hasCustomWebsite(data.bioLinks)) {
              sendData({ type: 'status', message: `⏭️ Skipped ${link} (Already has a custom website in bio)` });
              return;
            }

            const candidates = [...data.mailtos, ...extractEmailsFromText(data.text)];
            if (preFoundEmail) candidates.push(preFoundEmail);
            const validEmails = candidates.filter(isGenericEmail);

            // Phone extraction logic
            let finalPhone = 'N/A';
            const phoneCandidates = (data.allPhones || []).map(p => extractMobileDigits(p)).filter(Boolean);
            if (phoneCandidates.length > 0) finalPhone = phoneCandidates[0];

            if (validEmails.length > 0 || finalPhone !== 'N/A') {
              const finalEmail = validEmails.length > 0 ? validEmails[0] : null;

              if (finalEmail && foundEmailsSet.has(finalEmail.toLowerCase())) return;
              if (finalEmail) foundEmailsSet.add(finalEmail.toLowerCase());

              const leadData = {
                name: cleanSocialName(data.rawName, link),
                phone: finalPhone,
                address: 'N/A',
                email: finalEmail || 'N/A',
                emailFound: !!finalEmail,
                emailSource: source,
                mapsLink: link,
                keyword, city
              };

              try {
                await ScrapedLead.findOneAndUpdate(
                  { mapsLink: link },
                  { $set: leadData, $setOnInsert: { createdAt: new Date() } },
                  { upsert: true }
                );
              } catch (dbErr) { }

              sendData({ type: 'lead', data: leadData });
            }
          } catch (e) { /* swallow */ }
          finally {
            if (workerPage && !workerPage.isClosed()) { try { await workerPage.close(); } catch (e) { } }
          }
        };

        // Process in chunks of CONCURRENCY
        for (let i = 0; i < uniqueItems.length; i += CONCURRENCY) {
          if (getCancelled()) break;
          const chunk = uniqueItems.slice(i, i + CONCURRENCY);
          await Promise.all(chunk.map(visitLink));
        }

        await new Promise(r => setTimeout(r, 800));
      }
    }
  } catch (e) {
    console.log(`[SocialScraper] Error searching ${source}:`, e.message);
  } finally {
    if (page && !page.isClosed()) await page.close();
  }
};

const getMapsZoomForRadius = (radiusKm) => {
  const radius = Number(radiusKm) || 5;
  if (radius <= 1) return 16;
  if (radius <= 3) return 15;
  if (radius <= 7) return 14;
  if (radius <= 15) return 13;
  if (radius <= 30) return 12;
  return 11;
};

const parseGoogleMapsCoords = (value = '') => {
  const text = String(value);
  const placeMatch = text.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (placeMatch) return { latitude: Number(placeMatch[1]), longitude: Number(placeMatch[2]) };
  const atMatch = text.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),/);
  if (atMatch) return { latitude: Number(atMatch[1]), longitude: Number(atMatch[2]) };
  return {};
};

const distanceKm = (aLat, aLng, bLat, bLng) => {
  if (![aLat, aLng, bLat, bLng].every(Number.isFinite)) return null;
  const toRad = (v) => (v * Math.PI) / 180;
  const earthKm = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return earthKm * 2 * Math.atan2(Math.sqrt(s1 + s2), Math.sqrt(1 - s1 - s2));
};

const extractMobileDigits = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return null;

  // Priority 1: +91 prefix with possible spaces/dashes, followed by 10/11 digits
  const withPlusPrefix = raw.match(/\+91[\s\-\.]?([\d][\s\-\.\d]{10,15})/);
  if (withPlusPrefix) {
    let d = withPlusPrefix[1].replace(/\D/g, '');
    if (d.startsWith('0') && d.length === 11) d = d.slice(1);
    if (d.length === 10 && /^[6-9]/.test(d)) return `91${d}`;
  }

  // Priority 2: 91 prefix (no +) with 10 digit mobile
  const with91 = raw.replace(/[\s\-\.]/g, '').match(/^91([6-9]\d{9})$/);
  if (with91) return `91${with91[1]}`;

  // Priority 3: Standalone 10-digit mobile (strip spaces/dashes first)
  // Handles leading zero often found on Google Maps (e.g., 08894545782)
  const cleaned = raw.replace(/[\s\-\.]/g, '');
  const standalone = cleaned.match(/(?<!\d)0?([6-9]\d{9})(?!\d)/);
  if (standalone) return `91${standalone[1]}`;

  // Priority 4: Find mobile anywhere in string (handles formats like '+91 098765 43210')
  const anyMobile = raw.match(/(?:\+?91[\s\-\.]{0,3})?0?([6-9][\s\-\.]{0,3}(?:\d[\s\-\.]{0,3}){9})/);
  if (anyMobile) {
    const d = anyMobile[1].replace(/\D/g, '');
    if (d.length === 10 && /^[6-9]/.test(d)) return `91${d}`;
  }

  return null;
};


const hasValidMobileNumber = (value) => !!extractMobileDigits(value);
const hasAnyPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 6;
};

const buildDigitFlexibleRegex = (digits) => {
  const cleaned = String(digits || '').replace(/\D/g, '');
  if (!cleaned) return null;
  return new RegExp(cleaned.split('').map(d => `${d}\\D*`).join(''), 'i');
};

const findScrapedLeadCandidatesByPhone = async (value) => {
  const target = extractMobileDigits(value);
  if (!target) return [];

  const digits10 = target.slice(-10);
  const targetFlex = buildDigitFlexibleRegex(target);
  const digits10Flex = buildDigitFlexibleRegex(digits10);
  const candidates = await ScrapedLead.find({
    $or: [
      { phone: { $regex: digits10 } },
      { phone: { $regex: target } },
      ...(digits10Flex ? [{ phone: digits10Flex }] : []),
      ...(targetFlex ? [{ phone: targetFlex }] : []),
      { 'data.Phone': { $regex: digits10 } },
      { 'data.Phone': { $regex: target } },
      ...(digits10Flex ? [{ 'data.Phone': digits10Flex }] : []),
      ...(targetFlex ? [{ 'data.Phone': targetFlex }] : []),
      { 'data.phone': { $regex: digits10 } },
      { 'data.phone': { $regex: target } },
      ...(digits10Flex ? [{ 'data.phone': digits10Flex }] : []),
      ...(targetFlex ? [{ 'data.phone': targetFlex }] : [])
    ]
  }).limit(50);

  return candidates.filter(lead => {
    const leadPhone = extractMobileDigits(lead.phone || lead.data?.Phone || lead.data?.phone || '');
    return leadPhone && (
      leadPhone === target ||
      leadPhone.endsWith(digits10) ||
      target.endsWith(leadPhone.slice(-10))
    );
  });
};

const findScrapedLeadByPhone = async (value) => {
  const candidates = await findScrapedLeadCandidatesByPhone(value);
  return candidates[0] || null;
};

const updateScrapedLeadWhatsappStatus = async ({ phone, status, message = null, error = null }) => {
  const leads = await findScrapedLeadCandidatesByPhone(phone);
  if (!leads.length) return null;

  const now = new Date();
  const update = {
    whatsappStatus: status,
    whatsappUpdatedAt: now
  };

  if (typeof message === 'string') update.whatsappLastMessage = message;

  if (status === 'sent') {
    update.whatsappSentAt = now;
    update.whatsappFailedAt = null;
    update.whatsappError = null;
    update.isContacted = true;
  } else if (status === 'failed') {
    update.whatsappFailedAt = now;
    update.whatsappError = error || 'WhatsApp send failed';
  } else if (status === 'pending') {
    update.whatsappError = null;
  }

  await ScrapedLead.updateMany(
    { _id: { $in: leads.map(lead => lead._id) } },
    { $set: update }
  );

  return leads[0];
};

const DEFAULT_MAP_BUSINESS_CATEGORIES = [
  'restaurant',
  'cafe',
  'coffee shop',
  'tea stall',
  'snack shop',
  'food stall',
  'street food',
  'tiffin service',
  'mess',
  'salon',
  'barber',
  'spa',
  'beauty salon',
  'unisex salon',
  'nail salon',
  'grocery store',
  'supermarket',
  'convenience store',
  'department store',
  'market',
  'kirana store',
  'clothing store',
  'fashion store',
  'apparel store',
  'boutique',
  'tailor',
  'hardware store',
  'building materials store',
  'cement store',
  'mobile shop',
  'mobile phone shop',
  'mobile repair',
  'electronics store',
  'computer store',
  'computer repair',
  'printer repair',
  'internet cafe',
  'gym',
  'fitness center',
  'yoga studio',
  'dentist',
  'clinic',
  'medical clinic',
  'diagnostic centre',
  'hospital',
  'pharmacy',
  'medical store',
  'bakery',
  'ice cream shop',
  'sweets shop',
  'bakeries',
  'furniture store',
  'home goods store',
  'interior designer',
  'modular kitchen',
  'car repair',
  'car wash',
  'tire shop',
  'battery shop',
  'gas station',
  'auto parts store',
  'car dealership',
  'real estate agency',
  'property dealer',
  'travel agency',
  'tour operator',
  'jewellery store',
  'jewelry store',
  'printing shop',
  'photocopy shop',
  'lamination shop',
  'pet shop',
  'book store',
  'gift shop',
  'toy store',
  'sports store',
  'hotel',
  'guest house',
  'lodging',
  'school',
  'college',
  'university',
  'coaching center',
  'laundry',
  'dry cleaner',
  'restaurant',
  'fast food',
  'food court',
  'juice shop',
  'sweet shop',
  'dessert shop',
  'meat shop',
  'fish market',
  'vegetable market',
  'flower shop',
  'hardware merchant',
  'stationery store',
  'gift article shop',
  'bank',
  'atm',
  'finance',
  'insurance',
  'saloon',
  'warehouse',
  'office',
  'it company',
  'software company',
  'marketing agency',
  'advertising agency',
  'architect',
  'builder',
  'contractor',
  'plumber',
  'electrician',
  'mechanic',
  'doctor',
  'physiotherapy',
  'lab',
];

const normalizeMapCategory = (value) => String(value || '').toLowerCase().trim().replace(/\s+/g, ' ');

const parseCategoryInput = (value) => (
  Array.isArray(value)
    ? value.flatMap(item => String(item).split(/[\n,]+/))
    : String(value || '').split(/[\n,]+/)
).map(normalizeMapCategory).filter(Boolean);

const dedupeCategories = (items) => [...new Set(items.map(normalizeMapCategory).filter(Boolean))];

const getMapSearchTerms = (keyword, shouldFindAllBusinesses, categories = DEFAULT_MAP_BUSINESS_CATEGORIES) => {
  if (shouldFindAllBusinesses) return dedupeCategories(categories);
  const term = String(keyword || '').trim();
  return term ? [term] : [];
};

const OVERPASS_ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];

const OVERPASS_KEYWORD_ALIASES = {
  restaurant: [
    ['amenity', 'restaurant'],
    ['amenity', 'cafe'],
    ['amenity', 'fast_food'],
    ['amenity', 'bar'],
    ['amenity', 'pub'],
  ],
  cafes: [['amenity', 'cafe']],
  cafe: [['amenity', 'cafe']],
  gym: [['leisure', 'fitness_centre']],
  dentist: [['amenity', 'dentist']],
  clinic: [['amenity', 'clinic']],
  pharmacy: [['amenity', 'pharmacy']],
  salon: [['shop', 'hairdresser']],
  bakery: [['shop', 'bakery']],
  'grocery store': [['shop', 'supermarket'], ['shop', 'convenience']],
  'clothing store': [['shop', 'clothes']],
  'hardware store': [['shop', 'hardware']],
  'mobile shop': [['shop', 'electronics']],
  'electronics store': [['shop', 'electronics']],
  'furniture store': [['shop', 'furniture']],
  'car repair': [['shop', 'car_repair']],
  'real estate agency': [['office', 'estate_agent']],
  'travel agency': [['office', 'travel_agent']],
  'jewellery store': [['shop', 'jewelry']],
  'printing shop': [['shop', 'copyshop']],
  'pet shop': [['shop', 'pet']],
  hotel: [['tourism', 'hotel']],
  school: [['amenity', 'school']],
  office: [['office', null]],
};

const normalizeBusinessText = (value) => String(value || '').toLowerCase().trim().replace(/\s+/g, ' ');

const getBusinessMatchTokens = (keyword) => {
  const key = normalizeBusinessText(keyword);
  const tokens = new Set([key, key.replace(/s$/, '')].filter(Boolean));
  const aliases = OVERPASS_KEYWORD_ALIASES[key] || [];
  for (const [, value] of aliases) {
    if (value) tokens.add(String(value).toLowerCase());
  }
  return [...tokens];
};

const matchesBusinessKeyword = (item, keyword) => {
  const key = normalizeBusinessText(keyword);
  if (!key) return true;
  const haystack = normalizeBusinessText([
    item.name,
    item.category,
    item.address,
    item.website,
  ].filter(Boolean).join(' '));
  return getBusinessMatchTokens(key).some(token => haystack.includes(token));
};

const buildOverpassQuery = ({ keyword, lat, lng, radiusMeters, allBusinesses, limit }) => {
  const baseRadius = Math.max(500, Math.min(Number(radiusMeters) || 5000, 50000));
  const maxOut = Math.max(20, Math.min(Number(limit) || 60, 200));

  if (allBusinesses) {
    return `
      [out:json][timeout:25];
      (
        nwr(around:${baseRadius},${lat},${lng})["name"]["amenity"];
        nwr(around:${baseRadius},${lat},${lng})["name"]["shop"];
        nwr(around:${baseRadius},${lat},${lng})["name"]["office"];
        nwr(around:${baseRadius},${lat},${lng})["name"]["craft"];
        nwr(around:${baseRadius},${lat},${lng})["name"]["healthcare"];
        nwr(around:${baseRadius},${lat},${lng})["name"]["tourism"];
        nwr(around:${baseRadius},${lat},${lng})["name"]["leisure"];
      );
      out center tags qt ${maxOut};
    `;
  }

  const key = normalizeBusinessText(keyword);
  const aliases = OVERPASS_KEYWORD_ALIASES[key] || [];
  const clauses = aliases.length
    ? aliases
      .map(([tag, value]) => value
        ? `nwr(around:${baseRadius},${lat},${lng})["name"]["${tag}"="${value}"];`
        : `nwr(around:${baseRadius},${lat},${lng})["name"]["${tag}"];`)
      .join('\n')
    : `
        nwr(around:${baseRadius},${lat},${lng})["name"]["amenity"];
        nwr(around:${baseRadius},${lat},${lng})["name"]["shop"];
        nwr(around:${baseRadius},${lat},${lng})["name"]["office"];
        nwr(around:${baseRadius},${lat},${lng})["name"]["craft"];
        nwr(around:${baseRadius},${lat},${lng})["name"]["healthcare"];
        nwr(around:${baseRadius},${lat},${lng})["name"]["tourism"];
        nwr(around:${baseRadius},${lat},${lng})["name"]["leisure"];
      `;

  return `
    [out:json][timeout:25];
    (
      ${clauses}
    );
    out center tags qt ${maxOut};
  `;
};

const fetchOverpassBusinesses = async ({ keyword, lat, lng, radiusKm, limit, allBusinesses }) => {
  const query = buildOverpassQuery({
    keyword,
    lat,
    lng,
    radiusMeters: Number(radiusKm) * 1000,
    allBusinesses,
    limit
  });

  const payload = new URLSearchParams({ data: query });
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json',
    'User-Agent': 'LeadPulse/1.0 (+local development)',
  };

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers, body: payload.toString() });
      if (!res.ok) continue;
      const json = await res.json();
      const elements = Array.isArray(json.elements) ? json.elements : [];
      if (elements.length === 0) continue;

      return elements.map((el) => {
        const tags = el.tags || {};
        const coords = el.lat && el.lon
          ? { latitude: Number(el.lat), longitude: Number(el.lon) }
          : el.center
            ? { latitude: Number(el.center.lat), longitude: Number(el.center.lon) }
            : { latitude: null, longitude: null };

        const name = tags.name || tags.brand || tags.operator || tags['addr:housename'] || 'Unknown';
        const phone = extractMobileDigits(tags.phone || tags['contact:phone'] || tags['contact:mobile'] || tags['phone'] || '');
        const website = tags.website || tags['contact:website'] || tags['contact:web'] || '';
        const address = [
          tags['addr:housenumber'],
          tags['addr:street'],
          tags['addr:suburb'],
          tags['addr:city'],
        ].filter(Boolean).join(', ') || tags['addr:full'] || tags['addr:place'] || 'N/A';
        const category = tags.amenity || tags.shop || tags.office || tags.craft || tags.healthcare || tags.tourism || tags.leisure || 'business';

        return {
          name,
          phone,
          address,
          website,
          latitude: coords.latitude,
          longitude: coords.longitude,
          category,
        };
      }).filter(item => item.name && item.name !== 'Unknown');
    } catch (err) {
      console.log('[Overpass] endpoint failed:', endpoint, err.message);
    }
  }

  return [];
};

const configureFastMapsPage = async (page) => {
  page.setCacheEnabled(false);
  page.setDefaultNavigationTimeout(30000);
  page.setDefaultTimeout(10000);
  await page.setRequestInterception(true).catch(() => { });
  page.on('request', (req) => {
    const resourceType = req.resourceType();
    if (['image', 'media', 'font', 'stylesheet', 'manifest', 'ping'].includes(resourceType)) return req.abort().catch(() => { });
    return req.continue().catch(() => { });
  });
  // Log every page navigation
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) {
      console.log(`[Browser] 🌐 Visited: ${frame.url()}`);
    }
  });
};


const launchScraperBrowser = async () => {
  const launchArgs = {
    executablePath: '/usr/bin/google-chrome-stable',
    userDataDir: BROWSER_SESSION_DIR,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    timeout: 90000
  };

  try {
    return await puppeteer.launch(launchArgs);
  } catch (launchErr) {
    if (launchErr.message.includes('already running')) {
      console.log("⚠️ Browser lock detected. Force-clearing session...");
      const { execSync } = require('child_process');
      try { execSync(`pkill -f "${BROWSER_SESSION_DIR}"`); } catch (e) { }
      await new Promise(r => setTimeout(r, 1000));
      return puppeteer.launch(launchArgs);
    }
    throw launchErr;
  }
};

// Generate a grid of lat/lng points to cover a radius area with overlapping sub-searches
// This allows Maps to return more unique businesses than a single center search
const generateSearchGrid = (centerLat, centerLng, radiusKm) => {
  if (radiusKm <= 5) return [{ lat: centerLat, lng: centerLng }]; // Small radius: 1 point

  const points = [{ lat: centerLat, lng: centerLng }]; // Always include center
  const KM_PER_DEGREE_LAT = 111;
  const KM_PER_DEGREE_LNG = 111 * Math.cos(centerLat * Math.PI / 180);

  // Step = half the radius to ensure overlap
  const step = radiusKm <= 15 ? radiusKm * 0.5 : radiusKm * 0.4;
  const offsets = [-step, 0, step];

  for (const dLat of offsets) {
    for (const dLng of offsets) {
      if (dLat === 0 && dLng === 0) continue; // Already added center
      const newLat = centerLat + (dLat / KM_PER_DEGREE_LAT);
      const newLng = centerLng + (dLng / KM_PER_DEGREE_LNG);
      // Only add if the point is within the radius
      const dist = Math.sqrt(dLat ** 2 + dLng ** 2);
      if (dist <= radiusKm) points.push({ lat: newLat, lng: newLng });
    }
  }
  console.log(`[MapFinder] 🗺️ Grid: ${points.length} search points for ${radiusKm}km radius`);
  return points;
};

const isGenericMapsName = (value) => {
  const normalized = normalizeBusinessText(value);
  if (!normalized) return true;
  return [
    'business',
    'businesses',
    'google maps',
    'google',
    'unknown',
    'place'
  ].includes(normalized);
};

const extractMapsNameFromUrl = (pageUrl) => {
  try {
    const url = new URL(pageUrl);
    const segments = url.pathname.split('/').filter(Boolean);
    const placeIndex = segments.indexOf('place');
    const raw = placeIndex >= 0 ? segments[placeIndex + 1] : segments[segments.length - 1];
    if (!raw) return '';
    return decodeURIComponent(raw.replace(/\+/g, ' ')).trim();
  } catch {
    return '';
  }
};

const isClosedMapsText = (value) => {
  const normalized = String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (!normalized) return false;
  return [
    'permanently closed',
    'temporarily closed',
    'closed permanently',
    'business permanently closed'
  ].some(term => normalized.includes(term));
};

const normalizeMapScreenshotLines = (rawText) => {
  const lines = String(rawText || '')
    .split(/\r?\n/)
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const deduped = [];
  const seen = new Set();
  for (const line of lines) {
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(line);
  }
  return deduped;
};

const isScreenshotNoiseLine = (line) => {
  const value = String(line || '').toLowerCase().trim();
  if (!value) return true;
  return [
    'overview',
    'reviews',
    'about',
    'directions',
    'save',
    'nearby',
    'send to phone',
    'send to',
    'share',
    'your maps history',
    'add a label',
    'suggest an edit',
    'from the owner',
    'see all',
    'copy address',
    'copy',
    'maps',
    'google maps'
  ].some(term => value.includes(term));
};

const extractPhoneFromScreenshotLine = (line) => {
  const raw = String(line || '').trim();
  if (!raw) return '';
  if (!/[\d][\d\s().+\-]{5,}/.test(raw)) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 6) return '';
  return digits;
};

const isLikelyWebsiteLine = (line) => {
  const value = String(line || '').toLowerCase().trim();
  if (!value || value.includes('google')) return false;
  return /[a-z0-9-]+\.(com|in|net|org|co|io|biz|info|ai|me|uk|us|ca|au|site|online|store|tech|xyz)\b/i.test(value);
};

const isLikelyPlusCodeLine = (line) => /[23456789CFGHJMPQRVWX]{4}\+[23456789CFGHJMPQRVWX]{2}/i.test(String(line || ''));

const isLikelyHoursLine = (line) => {
  const value = String(line || '').toLowerCase().trim();
  return /^(open|closed)\b/.test(value) || /\bcloses?\b/.test(value) || /\b(am|pm)\b/.test(value);
};

const isLikelyRatingLine = (line) => {
  const value = String(line || '');
  return /\b[0-5](?:\.\d)?\s*\(\s*\d{1,5}\s*\)/.test(value) || /\b[0-5](?:\.\d)?\b/.test(value) && /\(\s*\d+\s*\)/.test(value);
};

const isLikelyAddressLine = (line) => {
  const value = String(line || '').trim();
  if (!value) return false;
  if (isLikelyWebsiteLine(value) || extractPhoneFromScreenshotLine(value) || isLikelyPlusCodeLine(value) || isLikelyHoursLine(value)) return false;
  return /,/.test(value) || /\b\d{5,6}\b/.test(value) || /\b(?:Road|Rd|Street|St|Avenue|Ave|Lane|Ln|Taluka|District|Nagar|Cross|Behind|Near|Floor|Block|Bengaluru|Bangalore|Mumbai|Delhi|Gujarat|Maharashtra|Rajasthan|Karnataka|Tamil Nadu|Kerala|Punjab|Haryana|Uttar Pradesh|Madhya Pradesh|Goa|Bengal|Bihar|Odisha|Assam|Telangana|Andhra Pradesh|India)\b/i.test(value);
};

const isLikelyCategoryLine = (line) => {
  const value = String(line || '').toLowerCase().trim();
  if (!value || isLikelyAddressLine(value) || isLikelyWebsiteLine(value) || extractPhoneFromScreenshotLine(value) || isLikelyPlusCodeLine(value) || isLikelyHoursLine(value) || isLikelyRatingLine(value)) return false;
  return /\b(?:supplier|manufacturer|restaurant|hotel|cafe|clinic|store|shop|wholesale|dealer|service|services|factory|agency|salon|bar|bistro|bakery|pharmacy|hospital|school|manufacturer)\b/i.test(value);
};

const extractOcrLines = (ocrData) => {
  const lines = [];
  const blocks = Array.isArray(ocrData?.blocks) ? ocrData.blocks : [];

  for (const block of blocks) {
    for (const paragraph of block.paragraphs || []) {
      for (const line of paragraph.lines || []) {
        const rawText = String(line?.text || '')
          .replace(/\s+/g, ' ')
          .trim();
        if (!rawText) continue;

        const bbox = line?.bbox || {};
        const confidence = Number.isFinite(line?.confidence) ? line.confidence : 0;
        lines.push({
          text: rawText,
          confidence,
          bbox,
          x0: Number.isFinite(bbox.x0) ? bbox.x0 : 0,
          y0: Number.isFinite(bbox.y0) ? bbox.y0 : 0,
          x1: Number.isFinite(bbox.x1) ? bbox.x1 : 0,
          y1: Number.isFinite(bbox.y1) ? bbox.y1 : 0,
          height: Number.isFinite(bbox.y1) && Number.isFinite(bbox.y0) ? Math.max(0, bbox.y1 - bbox.y0) : 0,
        });
      }
    }
  }

  if (lines.length === 0 && ocrData?.text) {
    normalizeMapScreenshotLines(ocrData.text).forEach((text, index) => {
      lines.push({
        text,
        confidence: 0,
        bbox: {},
        x0: 0,
        y0: index * 10,
        x1: 0,
        y1: 0,
        height: 0,
      });
    });
  }

  const deduped = [];
  const seen = new Set();
  for (const line of lines.sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0)) {
    const key = line.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(line);
  }
  return deduped;
};

const scoreBusinessNameLine = (line, index) => {
  let score = (line.confidence || 0) + (line.height || 0) * 1.8;
  if (index <= 1) score += 40;
  else if (index <= 3) score += 25;
  else if (index <= 5) score += 10;

  const text = String(line.text || '').trim();
  const lower = text.toLowerCase();
  if (!text || isScreenshotNoiseLine(text)) score -= 200;
  if (isLikelyWebsiteLine(text) || extractPhoneFromScreenshotLine(text) || isLikelyPlusCodeLine(text) || isLikelyRatingLine(text) || isLikelyHoursLine(text)) score -= 150;
  if (isLikelyAddressLine(text)) score -= 80;
  if (/^\d+$/.test(text)) score -= 150;
  if (/[|]/.test(text)) score -= 30;
  if (lower.split(/\s+/).length <= 1 && text.length < 4) score -= 50;
  return score;
};

const pickBusinessName = (lines) => {
  const topLines = lines.slice(0, Math.min(8, lines.length));
  const candidates = topLines
    .map((line, index) => ({ ...line, score: scoreBusinessNameLine(line, index) }))
    .filter(line => line.score > -50)
    .sort((a, b) => b.score - a.score);
  return candidates[0]?.text || lines[0]?.text || 'Unknown';
};

const pickRating = (lines) => {
  for (const line of lines) {
    const text = String(line.text || '');
    const match = text.match(/\b([0-5](?:\.\d)?)\s*\(\s*(\d{1,5})\s*\)/);
    if (match) return { rating: Number(match[1]), reviews: Number(match[2]) };
  }
  return { rating: null, reviews: null };
};

const pickWebsite = (lines) => {
  const site = lines.find(line => isLikelyWebsiteLine(line.text));
  return site?.text || '';
};

const pickPhone = (lines) => {
  const candidates = lines
    .map(line => {
      const digits = extractPhoneFromScreenshotLine(line.text);
      return digits ? { ...line, digits } : null;
    })
    .filter(Boolean)
    .sort((a, b) => {
      const aLen = a.digits.length;
      const bLen = b.digits.length;
      if (bLen !== aLen) return bLen - aLen;
      return (b.confidence || 0) - (a.confidence || 0);
    });

  return candidates[0]?.digits || '';
};

const pickPlusCode = (lines) => {
  const candidate = lines.find(line => isLikelyPlusCodeLine(line.text));
  return candidate?.text || '';
};

const pickHours = (lines) => {
  const candidate = lines.find(line => isLikelyHoursLine(line.text));
  return candidate?.text || '';
};

const pickCategory = (lines, nameIndex) => {
  for (let i = nameIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (isLikelyRatingLine(line.text)) continue;
    if (isLikelyCategoryLine(line.text)) return line.text;
    if (i - nameIndex <= 2 && !isLikelyAddressLine(line.text) && !isLikelyWebsiteLine(line.text) && !extractPhoneFromScreenshotLine(line.text)) {
      if (String(line.text || '').split(/\s+/).length <= 4) return line.text;
    }
  }
  return '';
};

const pickAddress = (lines, nameIndex) => {
  let startIdx = -1;
  for (let i = nameIndex + 1; i < lines.length; i++) {
    if (isLikelyAddressLine(lines[i].text)) {
      startIdx = i;
      break;
    }
  }
  if (startIdx === -1) {
    startIdx = lines.findIndex(line => isLikelyAddressLine(line.text));
  }
  if (startIdx === -1) return '';

  const parts = [];
  for (let i = startIdx; i < lines.length; i++) {
    const text = String(lines[i].text || '').trim();
    if (!text || isScreenshotNoiseLine(text)) continue;
    if (isLikelyWebsiteLine(text) || extractPhoneFromScreenshotLine(text) || isLikelyPlusCodeLine(text) || isLikelyHoursLine(text)) break;
    if (isLikelyRatingLine(text)) break;
    if (i > startIdx && isLikelyCategoryLine(text)) break;

    parts.push(text);
    if (parts.length >= 3) {
      const next = lines[i + 1]?.text || '';
      if (!isLikelyAddressLine(next) && !/\b\d{6}\b/.test(next)) break;
    }
  }
  return parts.join(', ');
};

const buildOcrPayload = (ocrPasses) => {
  const passes = Array.isArray(ocrPasses) ? ocrPasses.filter(Boolean) : [ocrPasses].filter(Boolean);
  const lines = [];
  const seen = new Set();
  let confidence = null;

  for (const pass of passes) {
    if (typeof pass?.confidence === 'number') {
      confidence = confidence === null ? pass.confidence : Math.max(confidence, pass.confidence);
    }
    for (const line of extractOcrLines(pass)) {
      const key = line.text.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push(line);
    }
  }

  lines.sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0);
  return {
    text: lines.map(line => line.text).join('\n'),
    confidence,
    lines
  };
};

const runMapScreenshotOcrPass = async (filePath, psm) => {
  const worker = await createWorker('eng', 1);
  try {
    await worker.setParameters({
      tessedit_pageseg_mode: psm,
      preserve_interword_spaces: '1',
      user_defined_dpi: '300',
    });
    const result = await worker.recognize(filePath, {}, { text: true, blocks: true, tsv: true });
    return result?.data || {};
  } finally {
    await worker.terminate().catch(() => { });
  }
};

const extractMapScreenshotData = (ocrPayload) => {
  const lines = Array.isArray(ocrPayload?.lines) ? ocrPayload.lines : normalizeMapScreenshotLines(ocrPayload?.text || '').map((text, index) => ({
    text,
    confidence: 0,
    x0: 0,
    y0: index * 10,
    x1: 0,
    y1: 0,
    height: 0,
  }));

  const cleanedLines = lines.filter(line => !isScreenshotNoiseLine(line.text));
  const businessName = pickBusinessName(cleanedLines);
  const businessIndex = cleanedLines.findIndex(line => line.text === businessName);
  const rating = pickRating(cleanedLines);
  const website = pickWebsite(cleanedLines);
  const phone = pickPhone(cleanedLines);
  const plusCode = pickPlusCode(cleanedLines);
  const hours = pickHours(cleanedLines);
  const category = pickCategory(cleanedLines, Math.max(0, businessIndex));
  const address = pickAddress(cleanedLines, Math.max(0, businessIndex));

  return {
    businessName,
    rating: rating.rating,
    reviews: rating.reviews,
    category,
    address,
    hours,
    website,
    phone,
    plusCode,
    extractedAt: new Date().toISOString(),
    rawText: cleanedLines.map(line => line.text).join('\n')
  };
};

const extractMapScreenshotText = async (filePath) => {
  const autoPass = await runMapScreenshotOcrPass(filePath, PSM.AUTO);
  const autoPayload = buildOcrPayload(autoPass);

  let passes = [autoPass];
  if (!autoPayload.lines || autoPayload.lines.length < 5 || (autoPayload.confidence || 0) < 45) {
    const sparsePass = await runMapScreenshotOcrPass(filePath, PSM.SPARSE_TEXT);
    passes.push(sparsePass);
  }

  const payload = buildOcrPayload(passes);
  return payload;
};

const extractGoogleMapsLead = async (workerPage, link, options = {}) => {

  const { noWebsiteOnly = true, originLat, originLng, radiusKm, fallbackName = '' } = options;

  try {
    await workerPage.goto(link, { waitUntil: 'domcontentloaded', timeout: 35000 });

  } catch (navErr) {
    // Timeout is OK — Maps often loads enough content before full load
    if (!navErr.message.includes('detached')) {
      console.log(`[extractGMaps] Nav warning (continuing): ${navErr.message.slice(0, 60)}`);
    } else {
      return null; // Frame detached = dead page, skip
    }
  }

  // Wait for page to render business info
  await workerPage.waitForSelector('h1', { timeout: 5000 }).catch(() => { });
  // Also try to wait for phone or address to appear — indicates page is ready
  await workerPage.waitForSelector('[data-item-id^="phone:tel:"], a[href^="tel:"], [aria-label^="Phone:"]', { timeout: 4000 }).catch(() => { });
  await new Promise(r => setTimeout(r, 1500));

  let details;
  try {
    details = await workerPage.evaluate((skipWebsites, fallbackName) => {
      const pageText = [
        document.body?.innerText || '',
        document.body?.textContent || '',
        document.title || '',
        document.querySelector('[role="main"]')?.getAttribute('aria-label') || ''
      ].join(' \n ');
      const closedPatterns = [
        /permanently\s+closed/i,
        /temporarily\s+closed/i,
        /closed\s+permanently/i,
        /business\s+permanently\s+closed/i
      ];
      if (closedPatterns.some(pattern => pattern.test(pageText))) return { closed: true };

      const isGeneric = (value) => {
        const normalized = String(value || '').toLowerCase().trim().replace(/\s+/g, ' ');
        if (!normalized) return true;
        return ['business', 'businesses', 'google maps', 'google', 'unknown', 'place'].includes(normalized);
      };

      const extractFromPath = () => {
        try {
          const segments = location.pathname.split('/').filter(Boolean);
          const placeIndex = segments.indexOf('place');
          const raw = placeIndex >= 0 ? segments[placeIndex + 1] : segments[segments.length - 1];
          return raw ? decodeURIComponent(raw.replace(/\+/g, ' ')).trim() : '';
        } catch {
          return '';
        }
      };

      // --- NAME: multiple fallback selectors ---
      // NOTE: [role="main"] aria-label returns the SEARCH KEYWORD, not the business name — DO NOT USE
      let name = document.querySelector('h1')?.innerText?.trim();
      if (!name || isGeneric(name)) {
        // Try specific Google Maps business name classes
        name = document.querySelector('h1.DUwDvf, h1[class*="fontHeadlineLarge"], .DUwDvf')?.innerText?.trim();
      }
      if (!name || isGeneric(name)) {
        // Try title tag — split by · and - to get just the business name
        const title = document.title || '';
        const fromTitle = title.split('·')[0].split(' - Google')[0].trim();
        if (fromTitle && !isGeneric(fromTitle)) name = fromTitle;
      }
      if (!name || isGeneric(name)) {
        // Try URL path — most reliable fallback
        name = extractFromPath();
      }
      if (!name || isGeneric(name)) {
        name = fallbackName || 'Business';
      }

      // --- WEBSITE FILTER ---
      const websiteBtn = document.querySelector('[data-item-id="authority"], a[data-item-id="authority"], [aria-label*="website" i]');
      if (skipWebsites && websiteBtn) return null;

      // --- PHONE: multiple fallback selectors ---
      let phone = 'N/A';
      const phoneSelectors = [
        '[data-item-id^="phone:tel:"]',
        'button[data-item-id^="phone"]',
        '[aria-label^="Phone:"]',
        '[aria-label^="phone:"]',
        'a[href^="tel:"]',
      ];
      for (const sel of phoneSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          phone = el.innerText?.trim() || el.getAttribute('aria-label')?.trim() || el.getAttribute('href')?.replace('tel:', '') || 'N/A';
          if (phone && phone !== 'N/A') break;
        }
      }
      if (phone !== 'N/A') phone = phone.replace(/[^\d+\s\-]/g, '').trim();

      // --- ADDRESS ---
      const addressSelectors = [
        '[data-item-id="address"]',
        'button[data-item-id="address"]',
        '[aria-label^="Address:"]',
        'button[aria-label^="Address:"]'
      ];
      let address = 'N/A';
      for (const sel of addressSelectors) {
        const el = document.querySelector(sel);
        if (!el) continue;
        address = el.innerText?.trim() || el.textContent?.trim() || el.getAttribute('aria-label')?.trim() || 'N/A';
        if (address && address !== 'N/A') break;
      }
      if (address !== 'N/A') address = address.replace(/^Address:\s*/i, '').trim();

      return { name, phone, address, pageUrl: window.location.href };
    }, noWebsiteOnly, fallbackName);
  } catch (evalErr) {
    console.log(`[extractGMaps] Evaluate error (detached?): ${evalErr.message.slice(0, 60)}`);
    return null;
  }

  if (!details) return null;
  if (details.closed) return { closed: true };

  const combinedText = [
    details.name,
    details.address,
    details.pageUrl || link
  ].join(' ');
  if (isClosedMapsText(combinedText)) return null;

  const coords = parseGoogleMapsCoords(details.pageUrl || link);
  const distance = distanceKm(Number(originLat), Number(originLng), coords.latitude, coords.longitude);
  // if (distance !== null && Number(radiusKm) > 0 && distance > Number(radiusKm)) return null;

  const resolvedName = !isGenericMapsName(details.name)
    ? details.name
    : (!isGenericMapsName(extractMapsNameFromUrl(details.pageUrl || link))
      ? extractMapsNameFromUrl(details.pageUrl || link)
      : fallbackName || details.name || 'Business');

  return {
    name: resolvedName,
    rawName: details.name,
    phone: details.phone,
    address: details.address,
    latitude: coords.latitude,
    longitude: coords.longitude,
    distanceKm: distance
  };
};



app.get('/api/map-businesses', async (req, res) => {
  const { keyword, lat, lng, locationLabel, radiusKm = 5, limit = 60, noWebsiteOnly = 'true', allBusinesses = 'false' } = req.query;
  const originLat = Number(lat);
  const originLng = Number(lng);
  const radius = Math.max(0.5, Math.min(Number(radiusKm) || 5, 50));
  const maxLeads = Math.max(5, Math.min(Number(limit) || 60, 200));
  const shouldFindAllBusinesses = allBusinesses === 'true';
  const searchKeyword = shouldFindAllBusinesses ? 'businesses' : String(keyword || '').trim();
  const savedKeyword = shouldFindAllBusinesses ? 'All Businesses' : searchKeyword;

  if ((!shouldFindAllBusinesses && !searchKeyword) || !Number.isFinite(originLat) || !Number.isFinite(originLng)) {
    return res.status(400).json({ error: 'Keyword, lat and lng are required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let browser;
  let isCancelled = false;
  req.on('close', () => {
    isCancelled = true;
    if (browser) browser.close().catch(() => { });
  });

  const sendData = (data) => {
    if (!isCancelled) res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const processedLinks = new Set();
  let saved = 0;

  try {
    console.log(`[MapFinder] 🚀 Launching browser...`);
    browser = await launchScraperBrowser();
    console.log(`[MapFinder] ✅ Browser launched.`);
    const page = await browser.newPage();
    await configureFastMapsPage(page);
    const workerCount = shouldFindAllBusinesses ? 10 : 8;
    const workerPages = await Promise.all(
      Array.from({ length: workerCount }, async () => {
        const workerPage = await browser.newPage();
        await configureFastMapsPage(workerPage);
        return workerPage;
      })
    );
    const zoom = getMapsZoomForRadius(radius);
    const searchTerms = getMapSearchTerms(searchKeyword, shouldFindAllBusinesses);
    console.log(`[MapFinder] 🔧 ${workerCount} worker pages ready. Terms: ${searchTerms.join(', ')}`);
    const locPrefix = locationLabel ? `${locationLabel} • ` : '';
    const city = `${locPrefix}MAP ${originLat.toFixed(4)}, ${originLng.toFixed(4)} • ${radius}km`;
    const gridPoints = generateSearchGrid(originLat, originLng, radius);

    sendData({ type: 'status', message: `Searching ${gridPoints.length} area(s) × ${searchTerms.length} term(s) within ${radius}km...` });

    for (const term of searchTerms) {
      for (const gridPoint of gridPoints) {
        if (isCancelled || saved >= maxLeads) break;

        const query = `${term} near ${gridPoint.lat},${gridPoint.lng}`;
        const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${gridPoint.lat},${gridPoint.lng},${zoom}z`;

        console.log(`[MapFinder] 🌍 Grid point (${gridPoint.lat.toFixed(4)}, ${gridPoint.lng.toFixed(4)}): ${term}`);
        sendData({
          type: 'status',
          message: `Scanning "${term}" at grid point ${gridPoints.indexOf(gridPoint) + 1}/${gridPoints.length}... saved ${saved}/${maxLeads}.`
        });

        await page.goto(mapsUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        const feedFound = await page.waitForSelector('div[role="feed"]', { timeout: 15000 }).catch(() => null);
        console.log(`[MapFinder] Feed selector: ${feedFound ? '✅ Found' : '❌ Not found — page may not have loaded'}`);


        let consecutiveNoResults = 0;
        const maxDryScrolls = shouldFindAllBusinesses ? 8 : 20; // Was 100 — reduced to fail fast

        for (let loop = 0; !isCancelled && saved < maxLeads; loop++) {
          await page.evaluate(async () => {
            const feed = document.querySelector('div[role="feed"]');
            if (feed?.lastElementChild) feed.lastElementChild.scrollIntoView();
            await new Promise(r => setTimeout(r, 500));
          });

          const links = await page.evaluate(() => {
            const selectors = [
              'a[href*="https://www.google.com/maps/place/"]',
              'a[href*="/maps/place/"]'
            ];
            return selectors.flatMap(selector => Array.from(document.querySelectorAll(selector)).map(a => a.href));
          });

          const newLinks = [...new Set(links)].filter(link => !processedLinks.has(link));
          console.log(`[MapFinder] Loop ${loop}: ${links.length} total, ${newLinks.length} new`);

          if (newLinks.length === 0) {
            consecutiveNoResults++;
            sendData({ type: 'status', message: `Still searching ${term}... saved ${saved}/${maxLeads}.` });
            if (consecutiveNoResults >= maxDryScrolls) {
              sendData({ type: 'status', message: `No more fresh ${term} results. Moving ahead...` });
              break;
            }
            if (consecutiveNoResults % 40 === 0) {
              await page.goto(mapsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => { });
              await page.waitForSelector('div[role="feed"]', { timeout: 10000 }).catch(() => { });
            }
            await new Promise(r => setTimeout(r, 500));
            continue;
          }

          consecutiveNoResults = 0;
          const batch = newLinks.slice(0, Math.max(0, maxLeads - saved));

          const processMapLink = async (link, workerPage) => {
            try {
              console.log(`[MapFinder] 🔗 Visiting: ${decodeURIComponent(link.split('/place/')[1]?.split('/')[0] || link)}`);
              const details = await extractGoogleMapsLead(workerPage, link, {
                noWebsiteOnly: noWebsiteOnly !== 'false',
                originLat,
                originLng,
                radiusKm: radius,
                fallbackName: term
              });

              if (details?.closed) {
                sendData({ type: 'status', message: `⏭️ Skipped permanently closed place: ${term}` });
                return;
              }

              // If filtered due to website — log only, do NOT save
              if (!details && noWebsiteOnly !== 'false') {
                const websiteCheck = await extractGoogleMapsLead(workerPage, link, {
                  noWebsiteOnly: false,
                  originLat,
                  originLng,
                  radiusKm: radius,
                  fallbackName: term
                });
                if (websiteCheck) {
                  console.log(`[MapFinder] 🌐 SKIPPED (has website): ${websiteCheck.name} | ${websiteCheck.phone}`);
                } else {
                  console.log(`[MapFinder] ⛔ Skipped: permanently closed (name/range check disabled)`);
                }
                return; // ← NOT saved
              }

              if (!details) { console.log(`[MapFinder] ⛔ Skipped: permanently closed (name/range check disabled)`); return; }
              if (isCancelled || saved >= maxLeads) return;

              // Validate phone before saving
              console.log(`[MapFinder] 📞 Raw phone for "${details.name}": "${details.phone}"`);
              const cleanPhone = (details.phone);
              if (!cleanPhone) {
                console.log(`[MapFinder] ⏭️ Invalid phone skipped: "${details.phone}"`);
                return;
              }

              const leadData = {
                ...details,
                phone: cleanPhone,
                mapsLink: link,
                keyword: savedKeyword,
                category: term,
                city,
                source: 'map-range',
                radiusKm: radius
              };

              await ScrapedLead.findOneAndUpdate(
                { mapsLink: link },
                { $set: leadData, $setOnInsert: { createdAt: new Date() } },
                { upsert: true, new: true }
              );

              saved++;
              console.log(`[MapFinder] ✅ ${details.name} → ${cleanPhone}`);
              sendData({ type: 'lead', data: leadData, saved });
            } catch (e) {
              console.log('[MapFinder] worker error:', e.message);
            }
          };

          for (let i = 0; i < batch.length && !isCancelled && saved < maxLeads; i += workerPages.length) {
            const chunk = batch.slice(i, i + workerPages.length);
            chunk.forEach(link => processedLinks.add(link));
            await Promise.all(chunk.map((link, index) => processMapLink(link, workerPages[index])));
          }

          sendData({ type: 'status', message: `Saved ${saved} leads. Found ${newLinks.length} new ${term} links.` });
        } // end scroll loop
      } // end gridPoints loop
    } // end searchTerms loop

    if (!isCancelled) {
      const message = saved >= maxLeads
        ? `Target complete. Saved ${saved} nearby businesses to Lead Automation CRM.`
        : `Finished map scan. Saved ${saved} nearby businesses to Lead Automation CRM.`;
      sendData({ type: 'done', message });
    }
  } catch (error) {
    sendData({ type: 'error', message: error.message });
  } finally {
    if (browser) await browser.close().catch(() => { });
    res.end();
  }
});

// --- LEAD SCRAPER API (STREAMING VERSION) ---
app.get('/api/scrape-leads', async (req, res) => {
  const { keyword, city, mode, sources, igSession, liAt, fbCUser, fbXs } = req.query;
  console.log(`[Scraper] 🚀 Scrape request received! Keyword: "${keyword}", City: "${city}", Sources: ${sources}`);
  if (!keyword || !city) return res.status(400).json({ error: 'Keyword and City are required' });

  const sourceList = sources ? sources.split(',') : ['map'];
  const foundEmailsInThisRun = new Set();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let isCancelled = false;
  req.on('close', () => {
    console.log("Client closed connection. Stopping scraper.");
    isCancelled = true;
    if (browser) browser.close().catch(() => { });
  });

  const sendData = (data) => {
    if (!isCancelled) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      if (typeof res.flush === 'function') res.flush();
    }
  };

  sendData({ type: 'status', message: "🚀 Scraper Engine Initializing..." });

  let browser;
  const processedLinks = new Set();

  try {
    const launchArgs = {
      executablePath: '/usr/bin/google-chrome-stable',
      userDataDir: BROWSER_SESSION_DIR + '_scraper', // ← separate dir, no lock conflict with Map Finder
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
        // ❌ Removed: --single-process, --no-zygote (crash with 6+ pages)
      ],
      timeout: 60000
    };

    console.log("[Scraper] 🛠️ Launching browser...");
    try {
      browser = await puppeteer.launch(launchArgs);
      console.log("[Scraper] ✅ Browser launched successfully!");
    } catch (launchErr) {
      console.error("[Scraper] ❌ Initial browser launch failed:", launchErr.message);
      if (launchErr.message.includes('already running') || launchErr.message.includes('locked')) {
        console.log("⚠️ Browser lock detected. Force-clearing session...");
        const { execSync } = require('child_process');
        try {
          execSync(`pkill -9 -f "${BROWSER_SESSION_DIR}"`);
          await new Promise(r => setTimeout(r, 2000));
        } catch (e) { }
        browser = await puppeteer.launch(launchArgs);
        console.log("[Scraper] ✅ Browser launched after force-clear!");
      } else {
        throw launchErr;
      }
    }

    if (sourceList.includes('map') && !isCancelled) {
      console.log("[Scraper] 🗺️ Launching Google Maps scraper...");

      // Step 1: Geocode city to get lat/lng (for proper Maps URL)
      let cityLat = null, cityLng = null;
      try {
        const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
        const geoRes = await fetch(geoUrl, { headers: { 'User-Agent': 'LeadPulse/1.0' } });
        const geoData = await geoRes.json();
        if (geoData.length > 0) {
          cityLat = parseFloat(geoData[0].lat);
          cityLng = parseFloat(geoData[0].lon);
          console.log(`[Scraper] 📍 Geocoded "${city}" → ${cityLat}, ${cityLng}`);
          sendData({ type: 'status', message: `📍 Scanning entire "${city}" — no radius limit.` });
        }
      } catch (geoErr) {
        console.log(`[Scraper] ⚠️ Geocode failed, using text search only: ${geoErr.message}`);
      }

      const page = await browser.newPage();
      const workerCount = 6;
      const workerPages = await Promise.all(
        Array.from({ length: workerCount }, async (_, idx) => {
          const workerPage = await browser.newPage();
          await configureFastMapsPage(workerPage);
          return workerPage;
        })
      );

      const query = `${keyword} in ${city}`;
      const mapsUrl = cityLat
        ? `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${cityLat},${cityLng},12z`
        : `https://www.google.com/maps/search/${encodeURIComponent(query)}`;

      await configureFastMapsPage(page);
      console.log(`[Scraper] 🔎 Navigating to: ${mapsUrl}`);
      sendData({ type: 'status', message: `Searching "${keyword}" in ${city}...` });
      await page.goto(mapsUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });

      await page.waitForSelector('div[role="feed"], [aria-label^="Results for"]', { timeout: 10000 }).catch(() => {
        console.log("[Scraper] ⚠️ Feed selector not found, attempting to continue anyway...");
      });

      let consecutiveNoResults = 0;
      for (let loop = 0; loop < 1000; loop++) {
        if (isCancelled) break;

        // Scroll the feed — use setTimeout (requestAnimationFrame hangs in headless!)
        await page.evaluate(async () => {
          const feed = document.querySelector('div[role="feed"]');
          if (feed?.lastElementChild) feed.lastElementChild.scrollIntoView();
          await new Promise(r => setTimeout(r, 500));
        });

        // Check if we've hit the end of results
        const isEnd = await page.evaluate(() => {
          const feed = document.querySelector('div[role="feed"]');
          const text = feed?.innerText || '';
          return text.includes("You've reached the end") || text.includes("No more results");
        }).catch(() => false);

        if (isEnd) {
          console.log(`[Scraper] 🏁 Reached end of Maps results after ${loop} loops.`);
          sendData({ type: 'status', message: "Reached the end of Google Maps results." });
          break;
        }

        const links = await page.evaluate(() => {
          const selectors = [
            'a[href*="/maps/place/"]',
            'a[href*="https://www.google.com/maps/place/"]'
          ];
          return [...new Set(selectors.flatMap(s => Array.from(document.querySelectorAll(s)).map(a => a.href)))];
        });

        const newLinks = links.filter(link => !processedLinks.has(link));
        console.log(`[Scraper] Loop ${loop}: ${links.length} total links, ${newLinks.length} new`);

        if (newLinks.length === 0) {
          consecutiveNoResults++;
          const msg = `Iteration ${loop + 1}: Scrolling for more... (${consecutiveNoResults}/25)`;
          console.log(`[Scraper] ${msg}`);
          sendData({ type: 'status', message: msg });

          await page.evaluate(() => {
            const feed = document.querySelector('div[role="feed"]');
            if (feed) feed.scrollBy(0, 1500);
          });

          if (consecutiveNoResults >= 25) break;
          await new Promise(r => setTimeout(r, 300));
          continue;
        }

        consecutiveNoResults = 0;
        const batch = newLinks.slice(0, Math.max(0, 200 - processedLinks.size));
        const processLink = async (link, workerPage) => {
          if (isCancelled) return;
          processedLinks.add(link);
          console.log(`[Scraper] 🔗 Visiting: ${decodeURIComponent(link.split('/place/')[1]?.split('/')[0] || link)}`);
          sendData({ type: 'status', message: `Visiting: ${decodeURIComponent(link.split('/place/')[1]?.split('/')[0] || link.slice(0, 60))}` });

          try {
            const details = await extractGoogleMapsLead(workerPage, link, {
              noWebsiteOnly: mode === 'no_website', // ← only filter if user chose 'No Website' mode
              originLat: cityLat,
              originLng: cityLng,
              radiusKm: 0,  // 0 = entire city, no radius limit
              fallbackName: keyword
            });

            if (details?.closed) {
              sendData({ type: 'status', message: `⏭️ Skipped permanently closed place: ${keyword}` });
              return;
            }

            if (!details || isCancelled) {
              console.log(`[Scraper] ⛔ No details returned (website filtered / closed / no name)`);
              return;
            }
            console.log(`[Scraper] ✅ Got details: ${details.name} | Phone: ${details.phone}`);
            if (!hasValidMobileNumber(details.phone)) {
              console.log(`[Scraper] ⏭️ No valid mobile: ${details.name} | ${details.phone}`);
              return;
            }

            let leadData = { ...details, mapsLink: link, keyword, city };

            if (mode === 'emails_only') {
              sendData({ type: 'status', message: `Fetching email for ${leadData.name}...` });
              const emailResult = await findEmailForLead(leadData, null);
              if (emailResult.email && foundEmailsInThisRun.has(emailResult.email.toLowerCase())) {
                sendData({ type: 'status', message: `Duplicate email skipped: ${emailResult.email}` });
                return;
              }
              if (emailResult.email) foundEmailsInThisRun.add(emailResult.email.toLowerCase());

              leadData.email = emailResult.email;
              leadData.emailFound = !!emailResult.email;
              leadData.emailSource = emailResult.emailSource;
              leadData.socialLinks = emailResult.socialLinks;
            }

            // Global Phone De-duplication Logic
            const mobileDigits = details.phone ? extractMobileDigits(details.phone) : null;
            if (mobileDigits) {
              const existing = await ScrapedLead.findOne({ phone: mobileDigits });
              if (existing && existing.mapsLink !== link) {
                // If it's the same number but a different link, skip it
                sendData({ type: 'status', message: `Skipping duplicate number: ${details.phone}` });
                return;
              }
              // Ensure we use the cleaned digits for saving
              leadData.phone = mobileDigits;
            }

            try { await ScrapedLead.findOneAndUpdate({ mapsLink: link }, { $set: leadData }, { upsert: true }); } catch (dbErr) { }
            sendData({ type: 'lead', data: leadData });
          } catch (e) {
            console.log("Error in worker page:", e.message);
          }
        };

        for (let i = 0; i < batch.length && !isCancelled; i += workerPages.length) {
          const chunk = batch.slice(i, i + workerPages.length);
          await Promise.all(chunk.map((link, index) => processLink(link, workerPages[index])));
        }
        sendData({ type: 'status', message: `Iteration ${loop + 1} done. Found ${newLinks.length} new leads.` });
        if (newLinks.length < workerPages.length) await new Promise(r => setTimeout(r, 100));
      }
    } // End of Map Block

    // Social Sources
    for (let src of ['ig', 'facebook', 'linkedin']) {
      if (isCancelled) break;
      if (sourceList.includes(src)) {
        await scrapeSocialDirectly(src, keyword, city, browser, sendData, foundEmailsInThisRun, () => isCancelled, { igSession, liAt, fbCUser, fbXs });
      }
    }

    if (!isCancelled) sendData({ type: 'done', message: 'Finished successfully.' });
  } catch (error) {
    sendData({ type: 'error', message: error.message });
  } finally {
    if (browser) await browser.close();
    res.end();
  }
});

// --- SAVED LEADS API ---
app.get('/api/saved-leads', async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { assignedTo: req.user._id };
    const leads = await ScrapedLead.find(filter).populate('assignedTo', 'fullName loginId position').sort({ createdAt: -1 });
    const totalCount = await ScrapedLead.countDocuments();
    const totalWithPhone = await ScrapedLead.countDocuments({ phone: { $exists: true, $ne: null, $ne: 'N/A' } });
    const totalWithEmail = await ScrapedLead.countDocuments({ email: { $exists: true, $ne: null }, emailFound: true });
    res.json({ leads, totalCount, totalWithPhone, totalWithEmail });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/saved-leads/assign', requireAdmin, async (req, res) => {
  try {
    const { keyword, city, leadIds, assignedTo } = req.body;
    const targetUserId = assignedTo || null;

    if (targetUserId) {
      const userExists = await User.findById(targetUserId);
      if (!userExists) return res.status(404).json({ error: 'Team member not found' });
    }

    let query = {};
    if (leadIds && Array.isArray(leadIds) && leadIds.length > 0) {
      query = { _id: { $in: leadIds } };
    } else if (keyword && city) {
      query = { keyword: new RegExp('^' + keyword.trim() + '$', 'i'), city: new RegExp('^' + city.trim() + '$', 'i') };
    } else {
      return res.status(400).json({ error: 'Either leadIds or (keyword and city) are required' });
    }

    const result = await ScrapedLead.updateMany(query, { assignedTo: targetUserId });
    res.json({ success: true, message: `Successfully assigned leads!` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.delete('/api/saved-leads/group', async (req, res) => {
  try {
    const { keyword, city } = req.query;
    if (!keyword || !city) return res.status(400).json({ error: 'Keyword and City required' });

    await ScrapedLead.deleteMany({
      keyword: keyword,
      city: city
    });

    res.json({ message: `All leads for ${keyword} in ${city} deleted!` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/saved-leads/bulk-delete', async (req, res) => {
  try {
    const { leadIds } = req.body;
    if (!Array.isArray(leadIds) || leadIds.length === 0) return res.status(400).json({ error: 'leadIds required' });
    await ScrapedLead.deleteMany({ _id: { $in: leadIds } });
    res.json({ message: `${leadIds.length} leads deleted successfully!` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/saved-leads/bulk-delete-no-number', async (req, res) => {
  try {
    const result = await ScrapedLead.deleteMany({
      $or: [
        { phone: { $exists: false } },
        { phone: null },
        { phone: "" },
        { phone: "N/A" },
        { phone: "n/a" }
      ]
    });
    res.json({ message: `${result.deletedCount} leads without numbers deleted successfully!` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/saved-leads/:id', async (req, res) => {
  try {
    await ScrapedLead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead Deleted!' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/saved-leads', async (req, res) => {
  try {
    const leadData = { ...req.body };
    if (leadData.phone) {
      leadData.phone = extractMobileDigits(leadData.phone) || leadData.phone;
    }
    const newLead = new ScrapedLead(leadData);
    await newLead.save();
    res.status(201).json(newLead);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/saved-leads/manual', async (req, res) => {
  try {
    const leadData = { ...req.body };
    if (leadData.phone) {
      leadData.phone = extractMobileDigits(leadData.phone) || leadData.phone;
    }
    leadData.keyword = leadData.keyword || 'Manual';
    const newLead = new ScrapedLead(leadData);
    await newLead.save();
    res.status(201).json(newLead);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/saved-leads/:id', async (req, res) => {
  try {
    const nextBody = { ...req.body };
    if (nextBody.phone !== undefined) {
      const rawPhone = String(nextBody.phone || '').trim();
      const placeholderPhone = ['n/a', 'na', '-', 'none', 'null'].includes(rawPhone.toLowerCase());
      if (!rawPhone || placeholderPhone) {
        delete nextBody.phone;
      } else {
        const mobile = extractMobileDigits(rawPhone);
        if (!mobile) {
          return res.status(400).json({ error: 'Please enter a valid mobile number' });
        }
        nextBody.phone = mobile;
      }
    }
    const updated = await ScrapedLead.findByIdAndUpdate(req.params.id, nextBody, { new: true });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- SETTINGS API ---
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({ mapBusinessCategories: DEFAULT_MAP_BUSINESS_CATEGORIES });
    if (!Array.isArray(settings.mapBusinessCategories) || settings.mapBusinessCategories.length === 0) {
      settings.mapBusinessCategories = DEFAULT_MAP_BUSINESS_CATEGORIES;
      await settings.save();
    }
    res.json(settings);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    if (req.body.igSession !== undefined) settings.igSession = req.body.igSession;
    if (req.body.liAt !== undefined) settings.liAt = req.body.liAt;
    if (req.body.fbCUser !== undefined) settings.fbCUser = req.body.fbCUser;
    if (req.body.fbXs !== undefined) settings.fbXs = req.body.fbXs;
    if (req.body.userName !== undefined) settings.userName = req.body.userName;
    if (req.body.userRole !== undefined) settings.userRole = req.body.userRole;
    if (req.body.profilePic !== undefined) settings.profilePic = req.body.profilePic;
    if (req.body.publicEmail !== undefined) settings.publicEmail = req.body.publicEmail;
    if (req.body.mapBusinessCategories !== undefined) {
      settings.mapBusinessCategories = dedupeCategories(parseCategoryInput(req.body.mapBusinessCategories));
    }
    await settings.save();
    res.json(settings);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map(sanitizeUser));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/users', requireAdmin, async (req, res) => {
  try {
    const fullName = String(req.body.fullName || req.body.name || '').trim();
    const phone = normalizePhoneNumber(req.body.phone);
    const position = String(req.body.position || '').trim();
    const password = String(req.body.password || '').trim();
    const loginId = normalizeLoginId(req.body.loginId || phone || fullName);

    if (!fullName || !phone || !position || !password) {
      return res.status(400).json({ error: 'fullName, phone, position, and password are required' });
    }

    const existingMatches = await User.find({ $or: [{ loginId }, { phone }] }).sort({ active: 1, updatedAt: -1 }).lean();
    const inactiveExisting = existingMatches.find(user => !user.active);
    const activeExisting = existingMatches.find(user => user.active);
    console.log('[Team] Create request ->', existingMatches.map(user => ({
      id: String(user._id),
      loginId: user.loginId,
      phone: user.phone,
      active: user.active,
      updatedAt: user.updatedAt
    })));

    if (activeExisting) {
        return res.status(409).json({
          error: 'User with this login or phone already exists',
          conflict: {
            id: activeExisting._id,
            loginId: activeExisting.loginId,
            phone: activeExisting.phone,
            active: activeExisting.active
          }
        });
    }

    if (inactiveExisting) {
      const { salt, hash } = hashPassword(password);
      const updatedUser = await User.findByIdAndUpdate(
        inactiveExisting._id,
        {
          loginId,
          fullName,
          phone,
          position,
          role: 'member',
          passwordSalt: salt,
          passwordHash: hash,
          createdBy: req.user._id,
          active: true,
          updatedAt: new Date()
        },
        { returnDocument: 'after' }
      );

      return res.status(200).json({
        message: 'Team member reactivated successfully',
        user: sanitizeUser(updatedUser)
      });
    }

    const { salt, hash } = hashPassword(password);
    const access = normalizeAccess(req.body.access, MEMBER_DEFAULT_ACCESS);
    const user = await User.create({
      loginId,
      fullName,
      phone,
      position,
      role: 'member',
      passwordSalt: salt,
      passwordHash: hash,
      access,
      createdBy: req.user._id,
      active: true
    });

    res.status(201).json({
      message: 'Team member created successfully',
      user: sanitizeUser(user)
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const nextFullName = req.body.fullName !== undefined ? String(req.body.fullName).trim() : user.fullName;
    const nextPhone = req.body.phone !== undefined ? normalizePhoneNumber(req.body.phone) : user.phone;
    const nextPosition = req.body.position !== undefined ? String(req.body.position).trim() : user.position;
    const nextLoginId = req.body.loginId !== undefined ? normalizeLoginId(req.body.loginId) : user.loginId;
    const nextActive = req.body.active !== undefined ? !!req.body.active : user.active;

    if (!nextFullName || !nextPhone || !nextPosition || !nextLoginId) {
      return res.status(400).json({ error: 'fullName, phone, position, and loginId are required' });
    }

    const nextAccess = req.body.access !== undefined ? normalizeAccess(req.body.access, user.role === 'admin' ? FULL_ACCESS : MEMBER_DEFAULT_ACCESS) : null;
    const duplicate = await User.findOne({
      _id: { $ne: user._id },
      $or: [{ loginId: nextLoginId }, { phone: nextPhone }]
    });
    if (duplicate) {
      return res.status(409).json({
        error: 'Another user already uses this login or phone',
        conflict: {
          id: duplicate._id,
          loginId: duplicate.loginId,
          phone: duplicate.phone,
          active: duplicate.active
        }
      });
    }

    user.fullName = nextFullName;
    user.phone = nextPhone;
    user.position = nextPosition;
    user.loginId = nextLoginId;
    user.active = nextActive;
    if (nextAccess) {
      user.access = nextAccess;
    }
    if (req.body.password !== undefined && String(req.body.password).trim()) {
      const { salt, hash } = hashPassword(String(req.body.password).trim());
      user.passwordSalt = salt;
      user.passwordHash = hash;
    }
    user.updatedAt = new Date();
    await user.save();
    res.json({ message: 'User updated', user: sanitizeUser(user) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/users/:id', requireAdmin, async (req, res) => {
  try {
    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({ error: 'You cannot deactivate your own account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.active = false;
    user.updatedAt = new Date();
    await user.save();
    res.json({ message: 'User deactivated', user: sanitizeUser(user) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/map-categories', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({ mapBusinessCategories: DEFAULT_MAP_BUSINESS_CATEGORIES });
    const categories = Array.isArray(settings.mapBusinessCategories) && settings.mapBusinessCategories.length > 0
      ? dedupeCategories(settings.mapBusinessCategories)
      : DEFAULT_MAP_BUSINESS_CATEGORIES;
    res.json({ categories });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/map-categories', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({ mapBusinessCategories: DEFAULT_MAP_BUSINESS_CATEGORIES });

    const current = Array.isArray(settings.mapBusinessCategories) && settings.mapBusinessCategories.length > 0
      ? dedupeCategories(settings.mapBusinessCategories)
      : [...DEFAULT_MAP_BUSINESS_CATEGORIES];

    const addList = parseCategoryInput(req.body.add ?? req.body.addCategories ?? req.body.categories);
    const removeList = parseCategoryInput(req.body.remove ?? req.body.removeCategories);

    const next = current
      .filter(item => !removeList.includes(normalizeMapCategory(item)))
      .concat(addList);

    settings.mapBusinessCategories = dedupeCategories(next);
    await settings.save();

    res.json({ categories: settings.mapBusinessCategories });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/upload-avatar', cloudUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    // Use the secure Cloudinary URL instead of local path
    const avatarUrl = req.file.path;

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    settings.profilePic = avatarUrl;
    await settings.save();

    res.json({ url: avatarUrl });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/extract-map-screenshot', (req, res) => {
  mapScreenshotUpload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const uploadedFile = req.file;
    if (!uploadedFile) return res.status(400).json({ error: 'No image uploaded' });

    try {
      const ocrPayload = await extractMapScreenshotText(uploadedFile.path);
      const extracted = extractMapScreenshotData(ocrPayload);
      const response = {
        message: 'Map screenshot parsed successfully',
        confidence: ocrPayload.confidence,
        extracted
      };

      if (String(req.body?.autoSave || '').toLowerCase() === 'true') {
        const cleanName = String(extracted.businessName || 'Unknown').trim() || 'Unknown';
        const cleanPhone = String(extracted.phone || '').trim();
        if (!hasValidMobileNumber(cleanPhone)) {
          return res.json({
            message: 'Map screenshot parsed, but skipped saving because no valid mobile number was found',
            confidence: ocrPayload.confidence,
            extracted,
            saved: false,
            skipped: true
          });
        }
        const savedLead = await ScrapedLead.findOneAndUpdate(
          { mapsLink: `screenshot:${uploadedFile.filename}` },
          {
            $set: {
              name: cleanName,
              phone: cleanPhone
            },
            $unset: {
              address: '',
              website: '',
              category: '',
              keyword: '',
              city: '',
              email: '',
              emailFound: '',
              emailSource: '',
              socialLinks: '',
              latitude: '',
              longitude: '',
              source: '',
              radiusKm: ''
            },
            $setOnInsert: { createdAt: new Date() }
          },
          { upsert: true, new: true }
        );
        response.savedLead = savedLead;
        response.saved = true;
      }

      res.json(response);
    } catch (e) {
      res.status(500).json({ error: e.message });
    } finally {
      fs.unlink(uploadedFile.path, () => { });
    }
  });
});

// ─── ENROLL ENRICHER LEADS into the auto-sequence (creates Recipients) ──
app.post('/api/enricher-enroll', async (req, res) => {
  const { leadIds, emailUser, emailPass, subject, body1, body2, body3 } = req.body;
  if (!Array.isArray(leadIds) || leadIds.length === 0) return res.status(400).json({ error: 'leadIds required' });
  if (!emailUser || !emailPass) return res.status(400).json({ error: 'SMTP credentials required' });
  if (!subject || !body1) return res.status(400).json({ error: 'Subject and at least Step 1 body required' });

  const results = { enrolled: 0, duplicates: 0, skipped: 0, failed: 0, errors: [] };
  const seen = new Set();

  for (const id of leadIds) {
    try {
      const lead = await ScrapedLead.findById(id);
      if (!lead || !lead.email || !lead.emailFound) { results.skipped++; continue; }
      const key = lead.email.trim().toLowerCase();
      if (seen.has(key)) { results.skipped++; continue; }
      seen.add(key);

      // Smart business / first name from scraped data
      const junkNames = ['chats', 'ad', 'ads', 'search results', 'search result', 'home', 'about', 'contact', 'menu', 'profile', 'page', 'untitled', 'facebook', 'instagram'];
      const rawName = (lead.name || '').trim();
      const isJunk = !rawName || junkNames.includes(rawName.toLowerCase());
      const businessVal = isJunk ? (lead.keyword || rawName || '') : rawName;
      const firstNameVal = businessVal; // User requested full business name instead of first name split

      const data = {
        'Name': businessVal,
        'First Name': firstNameVal,
        'Business': businessVal,
        'Business Name': businessVal,
        'Phone': lead.phone || '',
        'Address': lead.address || '',
        'City': lead.city || '',
        'Keyword': lead.keyword || '',
        'Email': lead.email
      };

      try {
        const nr = new Recipient({
          email: lead.email,
          status: 'pending',
          step: 1,
          campaignId: 'ENRICHER_' + Date.now(),
          emailUser, emailPass, subject, body1, body2, body3, data,
          nextSendAt: new Date(Date.now() + 5000)
        });
        await nr.save();
        sendEmail(nr._id); // instant dispatch of Step 1
        lead.isContacted = true;
        await lead.save();
        results.enrolled++;
      } catch (dupErr) {
        if (dupErr.code === 11000) results.duplicates++;
        else { results.failed++; results.errors.push({ id, error: dupErr.message }); }
      }
    } catch (e) {
      results.failed++;
      results.errors.push({ id, error: e.message });
    }
  }

  res.json({
    message: `Enrolled ${results.enrolled} into auto-sequence — ${results.duplicates} already existed, ${results.skipped} skipped, ${results.failed} failed`,
    ...results
  });
});

// Manually add a saved lead with email (for Email Enricher)
app.post('/api/saved-leads/manual', async (req, res) => {
  try {
    const { email, name, phone, city, keyword, address } = req.body;
    if (!email || !email.trim()) return res.status(400).json({ error: 'Email is required' });
    const cleanEmail = email.trim().toLowerCase();

    // Auto-Capitalization Helper
    const cap = (str) => {
      if (!str) return 'N/A';
      return str.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    };

    const mobile = String(phone || '').trim() ? extractMobileDigits(phone) : '';
    if (String(phone || '').trim() && !mobile) {
      return res.status(400).json({ error: 'Please enter a valid mobile number' });
    }

    const leadData = {
      name: cap(name) !== 'N/A' ? cap(name) : cleanEmail.split('@')[0],
      phone: mobile || 'N/A',
      address: (address || '').trim() || 'N/A',
      keyword: cap(keyword) !== 'N/A' ? cap(keyword) : 'Manual',
      city: cap(city) !== 'N/A' ? cap(city) : 'N/A',
      email: cleanEmail,
      emailFound: true,
      emailSource: 'manual'
    };

    // UPSERT: Update if exists, otherwise create
    const lead = await ScrapedLead.findOneAndUpdate(
      { email: cleanEmail },
      { $set: leadData, $setOnInsert: { mapsLink: `manual:${cleanEmail}:${Date.now()}` } },
      { upsert: true, new: true }
    );

    res.json(lead);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/saved-leads/:id/contacted', async (req, res) => {
  try {
    const lead = await ScrapedLead.findById(req.params.id);
    lead.isContacted = !lead.isContacted;
    await lead.save();
    res.json(lead);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── ENRICHER SEND (send emails to ScrapedLead enriched emails) ─────────
app.post('/api/enricher-send', async (req, res) => {
  const { leadIds, templateId, template: inlineTemplate, emailUser, emailPass, customVars } = req.body;
  if (!Array.isArray(leadIds) || leadIds.length === 0) return res.status(400).json({ error: 'leadIds required' });
  if (!templateId && !inlineTemplate) return res.status(400).json({ error: 'templateId or template required' });
  if (!emailUser || !emailPass) return res.status(400).json({ error: 'SMTP credentials required' });

  try {
    let template;
    if (inlineTemplate && inlineTemplate.subject && inlineTemplate.body) {
      template = { subject: inlineTemplate.subject, body: inlineTemplate.body };
    } else {
      template = await EmailTemplate.findById(templateId);
      if (!template) return res.status(404).json({ error: 'Template not found' });
    }

    const cleanPass = emailPass.replace(/\s+/g, '');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 465, secure: true,
      auth: { user: emailUser.trim(), pass: cleanPass }
    });

    const results = { sent: 0, failed: 0, skipped: 0, errors: [] };
    const sentEmails = new Set();

    for (const id of leadIds) {
      try {
        const lead = await ScrapedLead.findById(id);
        if (!lead || !lead.email || !lead.emailFound) { results.skipped++; continue; }
        const emailKey = lead.email.trim().toLowerCase();
        if (sentEmails.has(emailKey)) { results.skipped++; continue; }
        sentEmails.add(emailKey);

        const junkNames = ['chats', 'ad', 'ads', 'search results', 'search result', 'home', 'about', 'contact', 'menu', 'profile', 'page', 'untitled', 'facebook', 'instagram'];
        const rawName = (lead.name || '').trim();
        const isJunk = !rawName || junkNames.includes(rawName.toLowerCase());
        const businessVal = isJunk ? (lead.keyword || rawName || '') : rawName;
        const firstNameVal = isJunk ? (lead.keyword || '') : (rawName.split(/\s+/)[0] || '');
        const autoVars = {
          name: businessVal,
          business: businessVal,
          'business name': businessVal,
          'first name': firstNameVal,
          phone: lead.phone || '',
          address: lead.address || '',
          city: lead.city || '',
          keyword: lead.keyword || '',
          email: lead.email || ''
        };
        // customVars from modal override / supplement auto-extracted vars
        const userVars = customVars || {};
        const mergedVars = { ...autoVars };
        Object.keys(userVars).forEach(k => {
          if (userVars[k] && String(userVars[k]).trim()) mergedVars[k.toLowerCase()] = userVars[k];
          // also keep original case key
          if (userVars[k] && String(userVars[k]).trim()) mergedVars[k] = userVars[k];
        });

        let subject = template.subject || '';
        let body = template.body || '';
        Object.keys(mergedVars).forEach(key => {
          const re = new RegExp(`\\{+\\s*${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}+`, 'gi');
          subject = subject.replace(re, mergedVars[key]);
          body = body.replace(re, mergedVars[key]);
        });

        const finalSubject = applySpintax(subject);
        const finalBody = applySpintax(body);

        await transporter.sendMail({
          from: emailUser.trim(),
          to: lead.email,
          subject: finalSubject,
          html: wrapHtml(finalBody)
        });

        lead.isContacted = true;
        await lead.save();
        results.sent++;
      } catch (e) {
        results.failed++;
        results.errors.push({ id, error: e.message });
        console.error(`[ENRICHER SEND] Failed for ${id}: ${e.message}`);
      }
    }

    res.json({ message: `Done — sent ${results.sent}, failed ${results.failed}, skipped ${results.skipped}`, ...results });
  } catch (e) {
    console.error('[ENRICHER SEND] Fatal:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─── EMAIL FINDER API (Single Lead — SSE Streaming) ──────────────────────────
app.get('/api/find-email/:id', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendData = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    const lead = await ScrapedLead.findById(req.params.id);
    if (!lead) { sendData({ type: 'error', message: 'Lead not found' }); return res.end(); }

    sendData({ type: 'status', message: `🚀 Starting email search for ${lead.name}...` });

    const result = await findEmailForLead(lead, (msg) => sendData({ type: 'status', message: msg }));

    // Persist results to DB
    const updateData = { socialLinks: result.socialLinks };
    if (result.email) {
      updateData.email = result.email;
      updateData.emailFound = true;
      updateData.emailSource = result.emailSource;
    }
    await ScrapedLead.findByIdAndUpdate(lead._id, { $set: updateData });

    sendData({
      type: 'done',
      leadId: lead._id,
      email: result.email,
      emailSource: result.emailSource,
      socialLinks: result.socialLinks,
      message: result.email ? `✅ Email found: ${result.email}` : '❌ No email found'
    });
  } catch (e) {
    sendData({ type: 'error', message: e.message });
  } finally {
    res.end();
  }
});

// ─── BULK EMAIL FINDER API (Multiple Leads — SSE Streaming) ──────────────────
app.get('/api/bulk-find-emails', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendData = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  let browser;
  try {
    const ids = (req.query.ids || '').split(',').filter(Boolean);
    if (ids.length === 0) { sendData({ type: 'error', message: 'No lead IDs provided' }); return res.end(); }

    const allLeads = await ScrapedLead.find({ _id: { $in: ids } });

    // Skip leads that already have a website (per user preference) or already have an email
    const leads = [];
    let skippedWebsite = 0;
    let skippedAlreadyHasEmail = 0;
    for (const l of allLeads) {
      if (l.website) { skippedWebsite++; continue; }
      if (l.emailFound && l.email) { skippedAlreadyHasEmail++; continue; }
      leads.push(l);
    }

    sendData({
      type: 'start',
      total: leads.length,
      message: `🎯 Starting email search for ${leads.length} leads (skipped ${skippedWebsite} with websites, ${skippedAlreadyHasEmail} already enriched)...`
    });

    if (leads.length === 0) {
      sendData({ type: 'done', found: 0, total: 0, message: `Nothing to enrich.` });
      return res.end();
    }

    // Launch ONE browser, reuse for all leads (massive speedup vs per-lead launch)
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome-stable',
      userDataDir: BROWSER_SESSION_DIR,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled'],
      timeout: 60000
    });

    let found = 0;
    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      sendData({ type: 'status', message: `[${i + 1}/${leads.length}] Searching: ${lead.name}...`, leadId: lead._id });

      const result = await findEmailForLead(lead, (msg) => sendData({ type: 'status', message: msg, leadId: lead._id }), browser);

      const updateData = { socialLinks: result.socialLinks };
      if (result.email) {
        updateData.email = result.email;
        updateData.emailFound = true;
        updateData.emailSource = result.emailSource;
        found++;
      }
      await ScrapedLead.findByIdAndUpdate(lead._id, { $set: updateData });

      sendData({
        type: 'lead_done',
        leadId: lead._id,
        name: lead.name,
        email: result.email,
        emailSource: result.emailSource,
        socialLinks: result.socialLinks
      });

      // Reduced rate limit delay between leads
      if (i < leads.length - 1) await new Promise(r => setTimeout(r, 1000));
    }

    sendData({ type: 'done', found, total: leads.length, message: `✅ Done! Found emails for ${found}/${leads.length} leads.` });
  } catch (e) {
    sendData({ type: 'error', message: e.message });
  } finally {
    if (browser) { try { await browser.close(); } catch (e) { } }
    res.end();
  }
});

const PORT = process.env.PORT || 5001;
app.get('/api/whatsapp/status', (req, res) => {
  console.log(`[API] Status requested: ${waStatus}, hasQr: ${!!waQr}`);
  res.json({ status: waStatus, hasQr: !!waQr });
});

// WhatsApp Daily Limit Stats
app.get('/api/whatsapp/daily-stats', async (req, res) => {
  await resetDailyCounterIfNeeded();
  res.json({
    sent: waDailySent,
    limit: WA_DAILY_LIMIT,
    remaining: Math.max(0, WA_DAILY_LIMIT - waDailySent),
    overLimit: waDailySent >= WA_DAILY_LIMIT,
    date: waDailyDate
  });
});

app.get('/api/whatsapp/debug-chats', async (req, res) => {
  try {
    if (!waClient || waStatus !== 'connected') return res.json({ error: 'Not connected', waStatus });
    const chats = await waClient.getChats();
    const result = [];
    for (const chat of chats.slice(0, 10)) {
      if (chat.isGroup) continue;
      const msgs = await chat.fetchMessages({ limit: 3 });
      result.push({
        name: chat.name,
        id: chat.id._serialized,
        msgs: msgs.filter(m => !m.fromMe).map(m => ({ from: m.from, body: m.body.substring(0, 50), ts: new Date(m.timestamp * 1000).toISOString(), fromMe: m.fromMe }))
      });
    }
    res.json({ total: chats.length, chats: result });
  } catch (e) { res.json({ error: e.message }); }
});

app.get('/api/whatsapp/qr', (req, res) => {
  console.log(`[API] QR requested. Ready: ${!!waQr}`);
  if (!waQr) return res.status(404).json({ error: "QR not ready" });
  res.json({ qr: waQr });
});

app.post('/api/whatsapp/send', async (req, res) => {
  const { phone, message } = req.body;
  console.log(`[WhatsApp] Send requested -> phone: ${phone || 'N/A'}, chars: ${message ? String(message).length : 0}, status: ${waStatus}, daily: ${waDailySent}/${WA_DAILY_LIMIT}`);
  if (!phone || !message) return res.status(400).json({ error: 'phone and message required' });
  if (!waClient || waStatus !== 'connected') return res.status(503).json({ error: 'WhatsApp not connected' });
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    console.log(`[WhatsApp] Sending direct message to cleaned phone: +${cleanPhone}`);

    // Find the actual chat by scanning all chats for matching phone number
    // This handles both @c.us and @lid formats used in newer WhatsApp
    let targetChat = null;
    const chats = await waClient.getChats();
    for (const chat of chats) {
      if (chat.isGroup) continue;
      const chatPhone = chat.id.user || chat.id._serialized.split('@')[0];
      if (chatPhone === cleanPhone || chatPhone.endsWith(cleanPhone) || cleanPhone.endsWith(chatPhone)) {
        targetChat = chat;
        break;
      }
    }

    if (targetChat) {
      // Use existing chat (works with @lid format)
      console.log(`[WhatsApp] Using existing chat id: ${targetChat.id?._serialized || 'unknown'}`);
      await targetChat.sendMessage(message);
    } else {
      // Fallback: try @c.us directly
      const chatId = cleanPhone + '@c.us';
      console.log(`[WhatsApp] Fallback send via chat id: ${chatId}`);
      await waClient.sendMessage(chatId, message);
    }

    console.log(`[WhatsApp] ✉️ Sent to +${cleanPhone}: "${message.substring(0, 40)}"`);

    // Save sent message to lead replies and scraped lead status
    const lead = await Recipient.findOne({
      $or: [
        { 'data.Phone': { $regex: cleanPhone + '$' } },
        { email: cleanPhone + '@whatsapp.com' }
      ]
    });
    if (lead) {
      lead.replies.push({ receivedAt: new Date(), subject: 'WhatsApp Sent', body: message, type: 'whatsapp', fromMe: true });
      await lead.save();
    }
    await updateScrapedLeadWhatsappStatus({ phone: cleanPhone, status: 'sent', message });

    // Increment daily counter for manual sends too
    await resetDailyCounterIfNeeded();
    waDailySent++;

    res.json({ success: true, dailySent: waDailySent });
  } catch (e) {
    console.error('[WhatsApp] Send error:', e.message);
    await updateScrapedLeadWhatsappStatus({ phone, status: 'failed', error: e.message });
    res.status(500).json({ error: e.message });
  }
});

// WhatsApp Broadcast - send message to multiple contacts
const INTERAKT_SECRET_KEY = process.env.INTERAKT_SECRET_KEY || "";

const sendWhatsappInterakt = async (phone, message) => {
  if (!INTERAKT_SECRET_KEY) throw new Error("Interakt API Key not configured");

  let normalizedPhone = phone.replace(/\D/g, '');
  if (normalizedPhone.startsWith('0')) normalizedPhone = normalizedPhone.slice(1);
  if (normalizedPhone.length === 10) normalizedPhone = '91' + normalizedPhone;
  if (!normalizedPhone.startsWith('+')) normalizedPhone = '+' + normalizedPhone;

  // Note: For official API, you usually need a pre-approved template.
  // For now, we attempt a session message or a generic template approach.
  const response = await fetch('https://api.interakt.ai/v1/public/message/', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${INTERAKT_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fullPhoneNumber: normalizedPhone,
      type: "Template",
      template: {
        name: "lead_pulse_generic", // This template name must exist and be approved in Interakt
        languageCode: "en",
        bodyValues: [message] // Passing the custom message as a variable
      }
    })
  });

  const resData = await response.json();
  if (!response.ok) throw new Error(resData.message || "Interakt API Error");
  return resData;
};

app.post('/api/whatsapp/broadcast', async (req, res) => {
  const { phones, message, messages, delay = 3000, provider = 'browser' } = req.body;
  console.log(`[WA Broadcast] Request received -> phones: ${Array.isArray(phones) ? phones.length : 0}, provider: ${provider}, daily: ${waDailySent}/${WA_DAILY_LIMIT}, status: ${waStatus}`);
  if (!phones || !Array.isArray(phones) || phones.length === 0) return res.status(400).json({ error: 'phones array required' });
  if (!message && (!Array.isArray(messages) || messages.length === 0)) return res.status(400).json({ error: 'message required' });

  if (provider === 'browser' && (!waClient || waStatus !== 'connected')) {
    return res.status(503).json({ error: 'WhatsApp not connected' });
  }

  const results = { sent: 0, failed: 0, skipped: 0, details: [] };

  // Pre-build chat map once (only for browser mode)
  let chatMap = {};
  if (provider === 'browser') {
    const allChats = await waClient.getChats().catch(() => []);
    for (const chat of allChats) {
      if (chat.isGroup) continue;
      const chatPhone = chat.id.user || chat.id._serialized.split('@')[0];
      chatMap[chatPhone] = chat;
    }
  }

  for (const [index, phone] of phones.entries()) {
    const cleanPhone = String(phone).replace(/\D/g, '');
    const outgoingMessage = Array.isArray(messages) && messages[index] ? String(messages[index]) : message;

    try {
      if (provider === 'interakt') {
        console.log(`[Interakt Broadcast] Sending to: ${phone}`);
        await sendWhatsappInterakt(cleanPhone, outgoingMessage);
        results.sent++;
        await updateScrapedLeadWhatsappStatus({ phone: cleanPhone, status: 'sent', message: outgoingMessage });
        results.details.push({ phone: cleanPhone, status: 'sent', provider: 'interakt' });
        // Minimal delay for API calls to avoid rate limits
        if (index < phones.length - 1) await new Promise(r => setTimeout(r, 200));
        continue;
      }

      // ── Step 1: Normalize phone to full international format ───────────
      let normalizedPhone = cleanPhone;
      // Strip leading 0 (local format: 07xxx or 09xxx → 7xxx/9xxx)
      if (normalizedPhone.startsWith('0') && normalizedPhone.length >= 10) {
        normalizedPhone = normalizedPhone.slice(1);
      }
      // If 10 digits starting with 6-9 (Indian mobile, no country code) → add 91
      if (normalizedPhone.length === 10 && /^[6-9]/.test(normalizedPhone)) {
        normalizedPhone = '91' + normalizedPhone;
      }

      console.log(`[WA Broadcast] Processing: ${phone} -> Normalized: ${normalizedPhone}`);

      // ── Step 2: Resolve WA ID using getNumberId ────────────────────────
      let resolvedId = null;
      try {
        resolvedId = await waClient.getNumberId(normalizedPhone);
        if (resolvedId) {
          console.log(`[WA Broadcast] ✅ ID Resolved: ${resolvedId._serialized}`);
        } else {
          console.log(`[WA Broadcast] ❌ ID NOT Resolved for: ${normalizedPhone}`);
        }
      } catch (checkErr) {
        console.warn(`[WA Broadcast] getNumberId failed for +${normalizedPhone}: ${checkErr.message}`);
        // If lookup itself throws, attempt send anyway (don't falsely fail)
        resolvedId = { _serialized: normalizedPhone + '@c.us' };
      }

      if (!resolvedId) {
        const errMsg = 'Not on WhatsApp';
        await updateScrapedLeadWhatsappStatus({ phone: cleanPhone, status: 'failed', message: outgoingMessage, error: errMsg });
        results.failed++;
        results.details.push({ phone: cleanPhone, status: 'failed', error: errMsg });
        console.warn(`[WA Broadcast] ⚠️ Not on WhatsApp: +${normalizedPhone}`);
        if (index < phones.length - 1) await new Promise(r => setTimeout(r, Math.min(delay, 1500)));
        continue;
      }

      // ── Step 2: Find existing chat or send fresh ──────────────────────
      let targetChat = null;
      for (const [chatPhone, chat] of Object.entries(chatMap)) {
        if (chatPhone === cleanPhone || chatPhone.endsWith(cleanPhone) || cleanPhone.endsWith(chatPhone)) {
          targetChat = chat;
          break;
        }
      }

      // ── Daily Limit Check ─────────────────────────────────────────────
      // ── 5s Fixed Delay (anti-ban) ────────────────────────────────────
      const safeDelay = 5000 + Math.floor(Math.random() * 2000); // 5-7s
      await resetDailyCounterIfNeeded();
      if (waDailySent >= WA_DAILY_LIMIT) {
        console.warn(`[WA Broadcast] ⚠️ Daily limit reached (${waDailySent}/${WA_DAILY_LIMIT}). Sending anyway but be careful!`);
        results.details.push({ phone: cleanPhone, status: 'warn_overlimit', sentCount: waDailySent });
      }

      if (targetChat) {
        console.log(`[WA Broadcast] Using existing chat for +${cleanPhone}: ${targetChat.id?._serialized || 'unknown'}`);
        await targetChat.sendMessage(outgoingMessage);
      } else {
        console.log(`[WA Broadcast] Fallback send for +${cleanPhone} via ${resolvedId._serialized}`);
        await waClient.sendMessage(resolvedId._serialized, outgoingMessage);
      }

      waDailySent++;
      console.log(`[WA Broadcast] 📊 Daily count: ${waDailySent}/${WA_DAILY_LIMIT}`);

      // ── Step 3: Persist to DB ─────────────────────────────────────────
      let lead = await Recipient.findOne({
        $or: [
          { 'data.Phone': { $regex: cleanPhone + '$' } },
          { email: cleanPhone + '@whatsapp.com' }
        ]
      });
      if (lead) {
        lead.replies.push({ receivedAt: new Date(), subject: 'WhatsApp Broadcast', body: outgoingMessage, type: 'whatsapp', fromMe: true });
        await lead.save();
      }
      await updateScrapedLeadWhatsappStatus({ phone: cleanPhone, status: 'sent', message: outgoingMessage });

      results.sent++;
      results.details.push({ phone: cleanPhone, status: 'sent', dailySent: waDailySent });
      console.log(`[WA Broadcast] ✅ Sent to +${cleanPhone}`);

      // ── 15s Fixed Delay (anti-ban) ────────────────────────────────────
      if (index < phones.length - 1) {
        const safeDelay = 15000 + Math.floor(Math.random() * 5000); // 15-20s
        console.log(`[WA Broadcast] ⏳ Waiting ${Math.round(safeDelay / 1000)}s before next message...`);
        await new Promise(r => setTimeout(r, safeDelay));
      }
    } catch (e) {
      await updateScrapedLeadWhatsappStatus({ phone: cleanPhone, status: 'failed', message: outgoingMessage, error: e.message });
      results.failed++;
      results.details.push({ phone: cleanPhone, status: 'failed', error: e.message });
      console.error(`[WA Broadcast] ❌ Failed +${cleanPhone}: ${e.message}`);
    }
  }

  console.log(`[WA Broadcast] Done: ${results.sent} sent, ${results.failed} failed`);
  res.json({ success: true, ...results });
});


app.post('/api/whatsapp/logout', async (req, res) => {
  try {
    if (waClient) {
      await waClient.logout();
      waStatus = "disconnected";
      waQr = "";
      res.json({ success: true });
    } else {
      res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/whatsapp/restart', async (req, res) => {
  try {
    waStatus = "disconnected";
    waQr = "";
    resetWhatsappSession();
    if (waClient) {
      try { await waClient.destroy(); } catch (e) { }
    }
    waClient = null;
    setTimeout(() => initWhatsapp(), 1000);
    res.json({ success: true, message: "WhatsApp restarting..." });
    console.log('[WhatsApp] Manual restart triggered.');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Task Management API ---

// GET /api/tasks - Admin gets all tasks, Member gets own tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { assignedTo: req.user._id };
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'fullName loginId position phone')
      .populate('assignedBy', 'fullName loginId')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks - Admin creates a task
app.post('/api/tasks', requireAdmin, async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;
    if (!title || !assignedTo) return res.status(400).json({ error: 'Title and assignedTo are required' });

    const member = await User.findById(assignedTo);
    if (!member || !member.active) return res.status(404).json({ error: 'Team member not found or inactive' });

    const task = await Task.create({
      title,
      description: description || '',
      assignedTo,
      assignedBy: req.user._id,
      priority: priority || 'medium',
      dueDate: dueDate || null
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'fullName loginId position phone')
      .populate('assignedBy', 'fullName loginId');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tasks/:id - Update task (admin can edit all, member can update status only)
app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.user.role !== 'admin' && String(task.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    if (req.user.role === 'admin') {
      if (req.body.title) task.title = req.body.title;
      if (req.body.description !== undefined) task.description = req.body.description;
      if (req.body.assignedTo) task.assignedTo = req.body.assignedTo;
      if (req.body.priority) task.priority = req.body.priority;
      if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate;
    }

    if (req.body.status) {
      task.status = req.body.status;
      if (req.body.status === 'completed') task.completedAt = new Date();
      else task.completedAt = null;
    }

    task.updatedAt = new Date();
    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'fullName loginId position phone')
      .populate('assignedBy', 'fullName loginId');

    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id - Admin only
app.delete('/api/tasks/:id', requireAdmin, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Bulletproof Server running on port ${PORT}`);
});
