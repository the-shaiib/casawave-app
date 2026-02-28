require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const REQUIRED_CONFIRMATION = 'YES_DELETE_ALL_PRODUCTS';

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in environment variables.');
  }

  if (process.env.CONFIRM_PURGE_PRODUCTS !== REQUIRED_CONFIRMATION) {
    throw new Error(
      `Refusing destructive action. Set CONFIRM_PURGE_PRODUCTS=${REQUIRED_CONFIRMATION} to continue.`
    );
  }

  await mongoose.connect(process.env.MONGO_URI);
  const existingCount = await Product.countDocuments();
  const result = await Product.deleteMany({});

  console.info(`Products before purge: ${existingCount}`);
  console.info(`Products deleted: ${result.deletedCount || 0}`);
};

run()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Failed to purge products:', error.message);
    try {
      await mongoose.disconnect();
    } catch (_) {
      // noop
    }
    process.exit(1);
  });
