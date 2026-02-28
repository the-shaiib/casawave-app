require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const formatSizes = (sizes) => {
  if (!Array.isArray(sizes) || sizes.length === 0) return 'none';
  return sizes.join(', ');
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in environment variables.');
  }

  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find().sort({ createdAt: -1 }).lean();

  console.info(`Total products: ${products.length}`);
  for (const product of products) {
    const id = product?._id ? String(product._id) : 'unknown-id';
    const name = String(product?.name || 'Unnamed product');
    const sizes = formatSizes(product?.availableSizes);
    console.info(`${id} | ${name} | sizes: ${sizes}`);
  }
};

run()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Failed to list products:', error.message);
    try {
      await mongoose.disconnect();
    } catch (_) {
      // noop
    }
    process.exit(1);
  });
