const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });

async function testDB() {
  try {
    console.log('Connecting to:', process.env.MONGO_URI || 'mongodb://localhost:27017/bulk-email');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bulk-email');
    console.log('✅ MongoDB Connected successfully!');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections found:', collections.map(c => c.name));
    process.exit(0);
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
}

testDB();
