const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
require('dotenv').config({ path: './.env' });

const seedAdmin = async () => {
  try {
    const plainPasscode = process.env.ADMIN_PASSCODE;

    if (!plainPasscode) {
      throw new Error('ADMIN_PASSCODE is required in .env');
    }

    await mongoose.connect(process.env.MONGO_URI);

    const passcodeHash = await bcrypt.hash(plainPasscode, 10);

    await Admin.findOneAndUpdate(
      {},
      { passcodeHash },
      {
        upsert: true,

        returnDocument: 'after',
        setDefaultsOnInsert: true,
      }
    );

    console.log('Admin passcode seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seedAdmin();
