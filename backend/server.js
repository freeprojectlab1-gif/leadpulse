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
    } catch(e) {
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
    
    app.listen(5001, () => {
      console.log(`Bulletproof Server running on port 5001`);
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

const upload = multer({ dest: 'uploads/' });

// SPINTAX
const applySpintax = (text) => {
  if (!text) return "";
  return text.replace(/\{([^{}]*)\}/g, (match, choices) => {
    const arr = choices.split('|');
    return arr[Math.floor(Math.random() * arr.length)];
  });
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
                📧 <a href="mailto:muntazir.site@gmail.com" style="color: #4f46e5; text-decoration: none; font-weight: 600;">muntazir.site@gmail.com</a>
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">
              <span style="background: #f0fdf4; padding: 5px 10px; border-radius: 6px; display: inline-block;">
                💬 <a href="https://wa.me/918511868872" style="color: #10b981; text-decoration: none; font-weight: 600;">WhatsApp: +91 8511868872</a>
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

    // STEP 1: Replace placeholders FIRST (before spintax destroys double brackets)
    let pBody = rawBody;
    if (recipient.data) {
      Object.keys(recipient.data).forEach(key => {
        const placeholder = `{{${key}}}`;
        const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        pBody = pBody.replace(regex, recipient.data[key] || "");
      });
    }

    // STEP 2: Apply Spintax AFTER placeholders are filled
    pBody = applySpintax(pBody);
    let pSubject = applySpintax(recipient.subject || "Outreach");

    // VALIDATION: Check for missing variables
    const remainingVars = [...pBody.matchAll(/\{\{([^}]*)\}\}/g), ...pSubject.matchAll(/\{\{([^}]*)\}\}/g)];
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
      } catch(e) { /* Skip duplicates */ }
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
    res.json({ message: initialStatus === 'archived' ? "Lead Archived! ✅" : "Lead Added & Email Dispatched! 🚀" });
  } catch(e) {
    res.status(400).json({ error: "Lead already exists in database! Target blocked for safety." });
  }
});

app.get('/api/stats', async (req, res) => {
  const stats = await Recipient.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
  res.json(stats);
});

app.get('/api/recipients', async (req, res) => {
  const list = await Recipient.find().sort({ lastSentAt: -1, _id: -1 }).limit(100);
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
      // We simulate the custom send logic for each
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

        let body = applySpintax(template.body);
        let subject = applySpintax(template.subject);
        
        // Smart merge
        if (lead.data) {
          Object.keys(lead.data).forEach(key => {
            const ph = `{{${key}}}`;
            const rx = new RegExp(ph.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            body = body.replace(rx, lead.data[key] || '');
            subject = subject.replace(rx, lead.data[key] || '');
          });
        }

        await transporter.sendMail({ from: lead.emailUser, to: lead.email, subject, html: wrapHtml(body) });
        lead.history.push({ sentAt: new Date(), event: `Bulk: ${templateId}`, subject });
        await lead.save();
      }
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

    // Replace placeholders in template
    let body = template.body;
    let subject = template.subject;
    
    Object.keys(mergedData).forEach(key => {
      const ph = `{{${key}}}`;
      const rx = new RegExp(ph.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      body = body.replace(rx, mergedData[key] || '');
      subject = subject.replace(rx, mergedData[key] || '');
    });

    // VALIDATION: Check for missing variables
    const finalBody = applySpintax(body);
    const finalSubject = applySpintax(subject);
    const remainingVars = [...finalBody.matchAll(/\{\{([^}]*)\}\}/g), ...finalSubject.matchAll(/\{\{([^}]*)\}\}/g)];
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
app.use(express.static(distPath));
app.use((req, res, next) => { if (!req.path.startsWith('/api')) res.sendFile(path.join(distPath, 'index.html')); else next(); });

cron.schedule('*/1 * * * *', async () => {
  const pending = await Recipient.find({ 
    isArchived: { $ne: true },
    status: { $nin: ['finished', 'replied', 'stopped', 'sending'] }, 
    nextSendAt: { $lte: new Date() } 
  }).limit(5);
  
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

