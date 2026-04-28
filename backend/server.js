const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const { ImapFlow } = require('imapflow');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const puppeteer = require('puppeteer');
const { executablePath } = require('puppeteer');
const BROWSER_SESSION_DIR = path.join(__dirname, 'browser_session');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    const db = mongoose.connection.db;
    try {
      await db.collection('recipients').createIndex({ email: 1 }, { unique: true });
      console.log("Unique Lock Active! 🔒");
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

    console.log("Credentials Synced & Core Variables Initialized! ✅");

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Bulletproof Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

// Schema
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
  history: [{ sentAt: Date, event: String, subject: String }],
  isArchived: { type: Boolean, default: false }
});
const Recipient = mongoose.models.Recipient || mongoose.model('Recipient', recipientSchema);

// Custom Email Templates Schema
const emailTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const EmailTemplate = mongoose.models.EmailTemplate || mongoose.model('EmailTemplate', emailTemplateSchema);

// Custom Fields Schema
const customFieldSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const CustomField = mongoose.models.CustomField || mongoose.model('CustomField', customFieldSchema);

// Scraped Leads Schema
const scrapedLeadSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String,
  mapsLink: { type: String, unique: true },
  keyword: String,
  city: String,
  isContacted: { type: Boolean, default: false },
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
  createdAt: { type: Date, default: Date.now }
});
const ScrapedLead = mongoose.models.ScrapedLead || mongoose.model('ScrapedLead', scrapedLeadSchema);

const settingsSchema = new mongoose.Schema({
  igSession: { type: String, default: '' },
  liAt: { type: String, default: '' },
  fbCUser: { type: String, default: '' },
  fbXs: { type: String, default: '' }
});
const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

const upload = multer({ dest: 'uploads/' });

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

// ─── EMAIL EXTRACTOR UTILITY ────────────────────────────────────────────────
const extractEmailsFromText = (text) => {
  if (!text) return [];
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
        executablePath: executablePath(),
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
    res.json({ message: initialStatus === 'archived' ? "Lead Archived! ✅" : "Lead Added & Email Dispatched! " });
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
  try {
    const { name, subject, body } = req.body;
    await EmailTemplate.findByIdAndUpdate(req.params.id, { name, subject, body });
    res.json({ message: 'Template updated!' });
  } catch (e) { res.status(500).json({ error: e.message }); }
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
app.use(express.static(distPath, { setHeaders: (res, path) => { if (path.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache'); } }));
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    next();
  }
});

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

cron.schedule('*/10 * * * *', async () => {
  const sample = await Recipient.findOne({ status: { $nin: ['finished', 'replied', 'stopped', 'archived'] } });
  if (sample) {
    const cleanPass = sample.emailPass.replace(/\s+/g, '');
    const client = new ImapFlow({ host: 'imap.gmail.com', port: 993, secure: true, auth: { user: sample.emailUser.trim(), pass: cleanPass }, logger: false });
    client.on('error', err => {
      console.error("ImapFlow Error (Background Check):", err.message);
    });
    try {
      await client.connect();
      let lock = await client.getMailboxLock('INBOX');
      try {
        for await (let msg of client.listMessages('INBOX', { seen: false })) {
          const senderEmail = msg.envelope.from[0].address;
          const exists = await Recipient.findOne({ email: senderEmail, isArchived: { $ne: true }, status: { $nin: ['finished', 'stopped', 'replied'] } });
          if (exists) { exists.status = 'replied'; await exists.save(); }
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
      executablePath: executablePath(),
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

        // Try Bing → DuckDuckGo → Yahoo, accumulate links
        let allHrefs = [];
        for (const url of [bingUrl, ddgUrl, yahooUrl]) {
          try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 12000 });
            await new Promise(r => setTimeout(r, 800));
            const hrefs = await page.evaluate(() => {
              return Array.from(document.querySelectorAll('a[href]'))
                .map(a => a.href)
                .map(href => {
                  if (href.includes('RU=')) {
                    try { return decodeURIComponent(href.split('RU=')[1].split('/RK=')[0]); }
                    catch (e) { return href; }
                  }
                  if (href.includes('uddg=')) {
                    try { return decodeURIComponent(href.split('uddg=')[1].split('&')[0]); }
                    catch (e) { return href; }
                  }
                  return href;
                });
            });
            allHrefs.push(...hrefs);
          } catch (e) { }
        }

        const uniqueLinks = [...new Set(allHrefs)].filter(href => {
           if (source === 'ig') return href.includes('instagram.com/') && !href.includes('/explore/');
           if (source === 'facebook') return href.includes('facebook.com/') && !href.includes('/sharer') && !href.includes('/login') && !href.includes('/help');
           if (source === 'linkedin') return href.includes('linkedin.com/') && !href.includes('/login');
           return false;
        });

        if (uniqueLinks.length === 0) {
          if (pageNum > 2) break;
          continue;
        }

        // PARALLEL link processing — open multiple worker pages concurrently
        const CONCURRENCY = 1; // Reduced from 4 to 1 to prevent OOM crashes on Render
        sendData({ type: 'status', message: `Found ${uniqueLinks.length} ${source} links — sequential scanning...` });

        const visitLink = async (link) => {
          if (getCancelled()) return;
          
          sendData({ type: 'status', message: `🔍 Scanning: ${link}` });
          
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
            await workerPage.goto(link, { waitUntil: 'domcontentloaded', timeout: 10000 });
            await new Promise(r => setTimeout(r, 1200));

            const data = await workerPage.evaluate(() => ({
              text: document.documentElement.outerHTML,
              name: document.querySelector('h1')?.innerText || document.querySelector('h2')?.innerText || document.title.split('|')[0].split('-')[0].trim() || 'Unknown',
              mailtos: Array.from(document.querySelectorAll('a[href^="mailto:"]')).map(a => a.href.replace('mailto:', '').split('?')[0])
            }));

            const candidates = [...data.mailtos, ...extractEmailsFromText(data.text)];
            const validEmails = candidates.filter(isGenericEmail);

            if (validEmails.length > 0) {
              const finalEmail = validEmails[0];
              if (foundEmailsSet.has(finalEmail.toLowerCase())) return;
              foundEmailsSet.add(finalEmail.toLowerCase());

              const leadData = {
                name: data.name,
                phone: 'N/A', address: 'N/A',
                email: finalEmail,
                emailFound: true,
                emailSource: source,
                mapsLink: link,
                keyword, city
              };
              try { await ScrapedLead.findOneAndUpdate({ mapsLink: link }, { $set: leadData }, { upsert: true }); } catch (dbErr) { }
              sendData({ type: 'lead', data: leadData });
            }
          } catch (e) { /* swallow */ }
          finally {
            if (workerPage && !workerPage.isClosed()) { try { await workerPage.close(); } catch (e) { } }
          }
        };

        // Process in chunks of CONCURRENCY
        for (let i = 0; i < uniqueLinks.length; i += CONCURRENCY) {
          if (getCancelled()) break;
          const chunk = uniqueLinks.slice(i, i + CONCURRENCY);
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

// --- LEAD SCRAPER API (STREAMING VERSION) ---
app.get('/api/scrape-leads', async (req, res) => {
  const { keyword, city, mode, sources, igSession, liAt, fbCUser, fbXs } = req.query;
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
    if (!isCancelled) res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  let browser;
  const processedLinks = new Set();

  try {
    const launchArgs = {
      executablePath: executablePath(),
      userDataDir: BROWSER_SESSION_DIR,
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      timeout: 60000
    };

    try {
      browser = await puppeteer.launch(launchArgs);
    } catch (launchErr) {
      if (launchErr.message.includes('already running')) {
        console.log("⚠️ Browser lock detected. Force-clearing session...");
        const { execSync } = require('child_process');
        try { execSync(`pkill -f "${BROWSER_SESSION_DIR}"`); } catch (e) { }
        await new Promise(r => setTimeout(r, 1000));
        browser = await puppeteer.launch(launchArgs);
      } else {
        throw launchErr;
      }
    }

    if (sourceList.includes('map') && !isCancelled) {
      const page = await browser.newPage();
      const workerPage = await browser.newPage(); // Dedicated tab for deep details
      const query = `${keyword} in ${city}`;
      await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(query)}`);

      await page.waitForSelector('div[role="feed"]', { timeout: 15000 }).catch(() => { });

      let consecutiveNoResults = 0;
      for (let loop = 0; loop < 1000; loop++) {
        if (isCancelled) break;
        // BETTER SCROLL: Scroll to the last element in the feed
        const isEnd = await page.evaluate(async () => {
          const feed = document.querySelector('div[role="feed"]');
          if (feed) {
            const lastChild = feed.lastElementChild;
            if (lastChild) lastChild.scrollIntoView();
            await new Promise(r => setTimeout(r, 2500));

            // Check for "You've reached the end of the list" or similar markers
            const text = feed.innerText || "";
            return text.includes("You've reached the end of the list") || text.includes("No more results");
          }
          return false;
        });

        if (isEnd) {
          sendData({ type: 'status', message: "Reached the end of Google Maps results." });
          break;
        }

        const links = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('a[href*="https://www.google.com/maps/place/"]')).map(a => a.href);
        });

        const newLinks = [...new Set(links)].filter(link => !processedLinks.has(link));

        if (newLinks.length === 0) {
          consecutiveNoResults++;
          sendData({ type: 'status', message: `Iteration ${loop + 1}: Scrolling for more... (${consecutiveNoResults}/100)` });
          if (consecutiveNoResults >= 100) break; // Increased retry to 100 for deep scraping
          continue;
        }

        consecutiveNoResults = 0; // Reset counter if we found data
        for (let link of newLinks) {
          if (isCancelled) break;
          processedLinks.add(link);
          try {
            // SCRAPE USING WORKER PAGE (DOES NOT DISTURB MAIN FEED)
            await workerPage.goto(link, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await workerPage.waitForSelector('h1', { timeout: 5000 }).catch(() => {});
            await new Promise(r => setTimeout(r, 500));

            const details = await workerPage.evaluate(() => {
              let name = document.querySelector('h1')?.innerText;
              if (!name) {
                const title = document.title || '';
                name = title.split('- Google')[0].trim() || 'Unknown';
              }
              if (name === 'Unknown' || name === '' || name === 'Google Maps') return null; // Skip junk leads


              const websiteBtn = document.querySelector('[data-item-id="authority"]');

              // WE ONLY TARGET BUSINESSES WITHOUT WEBSITES
              if (websiteBtn) return null;

              const phoneBtn = document.querySelector('[data-item-id^="phone:tel:"]');
              let phone = phoneBtn ? phoneBtn.innerText || phoneBtn.getAttribute('aria-label') : 'N/A';
              if (phone !== 'N/A') phone = phone.replace(/[^\d+\s-]/g, '').trim();

              const addressBtn = document.querySelector('[data-item-id="address"]');
              let address = addressBtn ? addressBtn.innerText || addressBtn.getAttribute('aria-label') : 'N/A';
              if (address !== 'N/A') address = address.replace('Address: ', '').trim();

              return { name, phone, address };
            });

            if (details) {
              let leadData = { ...details, mapsLink: link, keyword, city };

              if (mode === 'emails_only') {
                sendData({ type: 'status', message: `Fetching email for ${leadData.name}...` });
                const emailResult = await findEmailForLead(leadData, null);
                if (emailResult.email && foundEmailsInThisRun.has(emailResult.email.toLowerCase())) {
                  sendData({ type: 'status', message: `Duplicate email skipped: ${emailResult.email}` });
                  continue;
                }
                if (emailResult.email) foundEmailsInThisRun.add(emailResult.email.toLowerCase());
                
                leadData.email = emailResult.email;
                leadData.emailFound = !!emailResult.email;
                leadData.emailSource = emailResult.emailSource;
                leadData.socialLinks = emailResult.socialLinks;
              }

              try { await ScrapedLead.findOneAndUpdate({ mapsLink: link }, { $set: leadData }, { upsert: true }); } catch (dbErr) { }
              sendData({ type: 'lead', data: leadData });
            }
          } catch (e) {
            console.log("Error in worker page:", e.message);
          }
        }
        sendData({ type: 'status', message: `Iteration ${loop + 1} done. Found ${newLinks.length} new leads.` });
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
    const leads = await ScrapedLead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (e) { res.status(500).json({ error: e.message }); }
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

app.delete('/api/saved-leads/:id', async (req, res) => {
  try {
    await ScrapedLead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead Deleted!' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/saved-leads/:id', async (req, res) => {
  try {
    const updated = await ScrapedLead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- SETTINGS API ---
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
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
    await settings.save();
    res.json(settings);
  } catch (e) { res.status(500).json({ error: e.message }); }
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
      const firstNameVal = isJunk ? (lead.keyword || '') : (rawName.split(/\s+/)[0] || '');

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

    // Reject duplicates
    const existing = await ScrapedLead.findOne({ email: cleanEmail });
    if (existing) return res.status(409).json({ error: 'Email already exists' });

    const lead = await ScrapedLead.create({
      name: (name || '').trim() || cleanEmail.split('@')[0],
      phone: (phone || '').trim() || 'N/A',
      address: (address || '').trim() || 'N/A',
      mapsLink: `manual:${cleanEmail}:${Date.now()}`,
      keyword: (keyword || '').trim() || 'manual',
      city: (city || '').trim() || 'N/A',
      email: cleanEmail,
      emailFound: true,
      emailSource: 'manual'
    });
    res.json(lead);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Duplicate entry' });
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
      executablePath: executablePath(),
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
