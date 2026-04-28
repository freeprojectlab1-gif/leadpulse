const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://user:pass@cluster.../');
  
  const Recipient = mongoose.model('Recipient', new mongoose.Schema({}, { strict: false }));
  
  const all = await Recipient.find({});
  let updated = 0;
  for (const r of all) {
    if (r.body1 && r.body1.includes('that helps you stand out and build that trust.')) {
      const newBody1 = r.body1.replace(' that helps you stand out and build that trust.', '.');
      await Recipient.updateOne({ _id: r._id }, { $set: { body1: newBody1 } });
      updated++;
    }
  }
  console.log(`Updated ${updated} recipients.`);
  process.exit(0);
})();
