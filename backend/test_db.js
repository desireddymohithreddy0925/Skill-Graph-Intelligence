require('dotenv').config();
const mongoose = require('mongoose');
const DashboardData = require('./models/DashboardData');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const data = await DashboardData.findOne();
  const subjects = await mongoose.model('Subject', new mongoose.Schema({}, { strict: false }), 'subjects').countDocuments();
  const progress = await mongoose.model('UserProgress', new mongoose.Schema({}, { strict: false }), 'userprogresses').countDocuments();
  console.log("DASHBOARD DATA:", data);
  console.log("SUBJECTS COUNT:", subjects);
  console.log("PROGRESS COUNT:", progress);
  process.exit(0);
}
test();
