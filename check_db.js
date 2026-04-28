const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const checkDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const Recipient = mongoose.model('Recipient', new mongoose.Schema({}));
    const ScrapedLead = mongoose.model('ScrapedLead', new mongoose.Schema({}));
    const EmailTemplate = mongoose.model('EmailTemplate', new mongoose.Schema({}));

    const recipientCount = await Recipient.countDocuments();
    const leadCount = await ScrapedLead.countDocuments();
    const templateCount = await EmailTemplate.countDocuments();

    console.log(`Recipients: ${recipientCount}`);
    console.log(`Scraped Leads: ${leadCount}`);
    console.log(`Templates: ${templateCount}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkDb();
