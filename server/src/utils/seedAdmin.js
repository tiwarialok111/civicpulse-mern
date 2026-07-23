/**
 * seedAdmin.js
 * Run once to create the first admin user:
 *   node src/utils/seedAdmin.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const ADMIN_EMAIL    = (process.env.ADMIN_EMAIL    || 'admin@civicpulse.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD  || 'Admin@123';
const ADMIN_NAME     = process.env.ADMIN_NAME      || 'Super Admin';

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`ℹ️  Admin already exists: ${ADMIN_EMAIL}`);
      process.exit(0);
    }

    await User.create({
      name:     ADMIN_NAME,
      email:    ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role:     'admin',
    });

    console.log('🎉 Admin account created!');
    console.log(`   Email   : ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('   ⚠️  Change this password after first login!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
