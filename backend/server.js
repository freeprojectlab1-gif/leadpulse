const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB for Email Campaigns"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Recipient Schema (Stores everything including 3 steps)
const recipientSchema = new mongoose.Schema({
  email: String,
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

// Sending Logic Helper
const sendEmail = async (recipient) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: recipient.emailUser, pass: recipient.emailPass },
  });

  // Pick template based on current step with deep fallbacks
  let rawBody = recipient.body1 || recipient.body || "Hi {{First Name}}, Just wanted to share our latest portfolio. Let me know if you are interested.";
  if (recipient.step === 2) rawBody = recipient.body2 || "Hi {{First Name}}, Just following up on my previous email. Would love to chat about your website.";
  if (recipient.step === 3) rawBody = recipient.body3 || "Hi {{First Name}}, Last attempt to reach out. Let me know if we can help you with anything.";

  let personalizedBody = rawBody;
  
  if (recipient.data) {
    Object.keys(recipient.data).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = recipient.data[key];
      const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      personalizedBody = personalizedBody.replace(regex, value || "");
    });
  }

  try {
    await transporter.sendMail({
      from: recipient.emailUser,
      to: recipient.email,
      subject: recipient.subject,
      text: personalizedBody,
    });
    
    recipient.lastSentAt = new Date();
    const sentStep = recipient.step;
    recipient.step += 1;
    
    if (recipient.step > 3) {
      recipient.status = 'finished';
    } else {
      recipient.status = `Step ${sentStep} Sent`; 
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 3); 
      recipient.nextSendAt = nextDate;
    }
    await recipient.save();
    console.log(`Email Step ${sentStep} sent to ${recipient.email}`);
  } catch (err) {
    console.error(`Send Failed for ${recipient.email}:`, err);
  }
};

// API ROUTES
app.post('/api/start-campaign', upload.single('file'), async (req, res) => {
  const { subject, body1, body2, body3, emailUser, emailPass } = req.body;
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const workbook = xlsx.readFile(req.file.path);
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  
  const campaignId = 'CAMP_' + Date.now();

  const recipients = data.map(contact => ({
    email: contact.Email || contact.email || contact['Email Address'],
    campaignId,
    emailUser,
    emailPass,
    subject,
    body1,
    body2,
    body3,
    data: contact, 
    nextSendAt: new Date() 
  }));

  await Recipient.insertMany(recipients);
  res.json({ message: "Campaign created! Sequence active.", total: data.length });
});

app.get('/api/stats', async (req, res) => {
  const stats = await Recipient.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  res.json(stats);
});

app.get('/api/recipients', async (req, res) => {
  const list = await Recipient.find().sort({ lastSentAt: -1 }).limit(100);
  res.json(list);
});

app.post('/api/send-now/:id', async (req, res) => {
  try {
    const rec = await Recipient.findById(req.params.id);
    if (!rec) return res.status(404).json({ error: "Not found" });
    if (rec.status === 'finished') return res.status(400).json({ error: "Already finished" });
    
    await sendEmail(rec);
    res.json({ message: "Sent successfully!" });
  } catch (e) {
    console.error("Send Now Error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// SERVE FRONTEND (Single Server Mode)
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    next();
  }
});

// Background Cron Job (Every 1 minute)
cron.schedule('*/1 * * * *', async () => {
  console.log("Checking for pending/follow-up emails...");
  const now = new Date();
  const pending = await Recipient.find({
    status: { $ne: 'finished' },
    nextSendAt: { $lte: now }
  }).limit(5);

  for (const rec of pending) {
    await sendEmail(rec);
    await new Promise(r => setTimeout(r, 10000)); 
  }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`All-in-One Server on Port ${PORT}`));
