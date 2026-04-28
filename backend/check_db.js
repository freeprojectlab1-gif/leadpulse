require('dotenv').config({path: './backend/.env'});
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const indexes = await db.collection('recipients').indexInformation();
  console.log('Indexes:', indexes);
  const dups = await db.collection('recipients').aggregate([
    { $group: { _id: '$email', count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]).toArray();
  console.log('Duplicates:', dups.length);
  process.exit(0);
});
