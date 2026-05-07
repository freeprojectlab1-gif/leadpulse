const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });

const ScrapedLeadSchema = new mongoose.Schema({
  keyword: String,
  city: String,
  whatsappStatus: String,
  whatsappSentAt: Date,
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

const ScrapedLead = mongoose.model('ScrapedLead', ScrapedLeadSchema);

async function checkCounts() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bulk-email');
    console.log('✅ Connected to MongoDB');
    
    const totalLeads = await ScrapedLead.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLeads = await ScrapedLead.countDocuments({ createdAt: { $gte: today } });
    const todaySent = await ScrapedLead.countDocuments({ whatsappSentAt: { $gte: today } });

    console.log('--- Database Stats ---');
    console.log('Total Scraped Leads:', totalLeads);
    console.log('Leads Scraped Today:', todayLeads);
    console.log('WhatsApp Sent Today:', todaySent);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkCounts();
