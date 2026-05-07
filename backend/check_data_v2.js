const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const ScrapedLeadSchema = new mongoose.Schema({
  whatsappSentAt: Date,
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

const ScrapedLead = mongoose.model('ScrapedLead', ScrapedLeadSchema);

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bulk-email');
    console.log('✅ DB Connected');
    const total = await ScrapedLead.countDocuments();
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayCount = await ScrapedLead.countDocuments({ createdAt: { $gte: today } });
    console.log('Total Leads:', total);
    console.log('Today Leads:', todayCount);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
check();
