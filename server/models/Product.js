const mongoose = require('mongoose');

const ALLOWED_CATEGORIES = ['Hoodies', 'T-shirts', 'Pants', 'Ensemble'];
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

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: ALLOWED_CATEGORIES,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    additionalImages: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    availableSizes: {
      type: [String],
      default: () => [...DEFAULT_SIZES],
      set: normalizeSizes,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
