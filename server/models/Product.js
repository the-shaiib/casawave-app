const mongoose = require('mongoose');

const ALLOWED_CATEGORIES = ['Hoodies', 'T-shirts', 'Pants', 'Ensemble'];

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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
