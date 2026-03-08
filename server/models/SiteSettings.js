const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'main',
      trim: true,
    },
    homeHeroImage: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
