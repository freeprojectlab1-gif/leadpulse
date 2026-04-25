const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const { ImapFlow } = require('imapflow');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    const db = mongoose.connection.db;
    try {
        // Step 1: Ensure unique index without wiping data
        await db.collection('recipients').createIndex({ email: 1 }, { unique: true });
        console.log("Unique Lock Active! 🔒");
    } catch(e) {
        console.log("Database Ready.");
    }
  })
  .catch(err => console.error("MongoDB Connection Error:", err));

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
  data: mongoose.Schema.Types.Mixed 
});
const Recipient = mongoose.model('Recipient', recipientSchema);
const upload = multer({ dest: 'uploads/' });

// SPINTAX
const applySpintax = (text) => {
  if (!text) return "";
  return text.replace(/\{([^{}]*)\}/g, (match, choices) => {
    const arr = choices.split('|');
    return arr[Math.floor(Math.random() * arr.length)];
  });
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

    console.log(`[SMTP] Delivering to ${recipient.email}...`);
    await transporter.sendMail({ 
        from: recipient.emailUser, 
        to: recipient.email, 
        subject: applySpintax(recipient.subject || "Outreach"), 
        text: pBody 
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
      nextSendAt: nextStatus === 'finished' ? null : nextDate
    });
    console.log(`[SUCCESS] Sent to ${recipient.email}`);
  } catch (err) {
    console.error(`[FAILED] ${recipient.email}:`, err.message);
    await Recipient.findByIdAndUpdate(recipientId, { status: 'pending' });
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
  const { email, subject, body1, body2, body3, emailUser, emailPass, data } = req.body;
  try {
    const nr = new Recipient({ 
        email, campaignId: 'MANUAL_' + Date.now(), emailUser, emailPass, subject, body1, body2, body3, data, 
        nextSendAt: new Date(Date.now() + 5000) 
    });
    await nr.save();
    // INSTANT DISPATCH
    sendEmail(nr._id); 
    res.json({ message: "Lead Added & Email Dispatched! 🚀" });
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
app.post('/api/restart/:id', async (req, res) => { await Recipient.findByIdAndUpdate(req.params.id, { step: 1, status: 'pending', nextSendAt: new Date() }); res.json({ message: "Restarted!" }); });
app.post('/api/continue/:id', async (req, res) => { await Recipient.findByIdAndUpdate(req.params.id, { status: 'pending', nextSendAt: new Date() }); res.json({ message: "Resumed!" }); });
app.post('/api/archive/:id', async (req, res) => { await Recipient.findByIdAndUpdate(req.params.id, { status: 'archived' }); res.json({ message: "Archived!" }); });
app.delete('/api/delete-recipient/:id', async (req, res) => { await Recipient.findByIdAndDelete(req.params.id); res.json({ message: "Deleted!" }); });

const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));
app.use((req, res, next) => { if (!req.path.startsWith('/api')) res.sendFile(path.join(distPath, 'index.html')); else next(); });

cron.schedule('*/1 * * * *', async () => {
  const pending = await Recipient.find({ 
    status: { $nin: ['finished', 'replied', 'stopped', 'sending', 'archived'] }, 
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
            const exists = await Recipient.findOne({ email: senderEmail, status: { $nin: ['finished', 'stopped', 'replied', 'archived'] } });
            if (exists) { exists.status = 'replied'; await exists.save(); }
          }
        } finally { lock.release(); }
        await client.logout();
      } catch (err) { console.error("IMAP Error:", err.message); }
  }
});

app.listen(5001, async () => {
  console.log(`Bulletproof Server running on port 5001`);
  // First: Reset any stuck 'sending' leads
  await Recipient.updateMany({ status: 'sending' }, { $set: { status: 'pending' } });
  // Then: Sync all leads with latest credentials
  await Recipient.updateMany(
    { status: { $nin: ['finished', 'archived'] } }, 
    { $set: { emailUser: 'muntazir.site@gmail.com', emailPass: 'bbad zuak ztni mnbr' } }
  );
  console.log("Credentials Synced & Stuck Leads Reset! ✅");
});
