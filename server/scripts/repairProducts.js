require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL'];

const normalizeSizes = (sizes) => {
  if (!Array.isArray(sizes)) return [...DEFAULT_SIZES];

  const normalized = sizes
    .map((size) => String(size || '').trim().toUpperCase())
    .filter(Boolean);
  const unique = [...new Set(normalized)];
  if (unique.length === 0) return [...DEFAULT_SIZES];

  return unique;
};

const sameArray = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

const normalizeAdditionalImages = (images) => {
  if (!Array.isArray(images)) return [];
  const cleaned = images
    .map((item) => String(item || '').trim())
    .filter(Boolean);
  return [...new Set(cleaned)];
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in environment variables.');
  }

  await mongoose.connect(process.env.MONGO_URI);

  // Read potential legacy `sizes` field from raw documents.
  const rawProducts = await Product.collection.find({}, { projection: { _id: 1, sizes: 1 } }).toArray();
  const legacySizesById = new Map(
    rawProducts.map((doc) => [String(doc._id), Array.isArray(doc.sizes) ? doc.sizes : null])
  );

  const products = await Product.find().sort({ createdAt: -1 });
  let updatedCount = 0;
  let unchangedCount = 0;

  for (const product of products) {
    const legacySizes = legacySizesById.get(String(product._id));
    const sourceSizes =
      Array.isArray(product.availableSizes) && product.availableSizes.length > 0
        ? product.availableSizes
        : legacySizes;
    const normalizedSizes = normalizeSizes(sourceSizes);
    const normalizedImages = normalizeAdditionalImages(product.additionalImages);

    let changed = false;

    if (!sameArray(product.availableSizes || [], normalizedSizes)) {
      product.availableSizes = normalizedSizes;
      changed = true;
    }

    if (!sameArray(product.additionalImages || [], normalizedImages)) {
      product.additionalImages = normalizedImages;
      changed = true;
    }

    if (changed) {
      await product.save();
      updatedCount += 1;
    } else {
      unchangedCount += 1;
    }
  }

  console.info(`Products checked: ${products.length}`);
  console.info(`Products updated: ${updatedCount}`);
  console.info(`Products unchanged: ${unchangedCount}`);
};

run()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Failed to repair products:', error.message);
    try {
      await mongoose.disconnect();
    } catch (_) {
      // noop
    }
    process.exit(1);
  });
