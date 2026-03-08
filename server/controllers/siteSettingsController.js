const SiteSettings = require('../models/SiteSettings');

const SETTINGS_KEY = 'main';
const MAX_IMAGE_PAYLOAD_LENGTH = 50 * 1024 * 1024;

const isSupportedImageValue = (value) =>
  typeof value === 'string' &&
  (value.startsWith('data:image/') ||
    value.startsWith('http://') ||
    value.startsWith('https://'));

const getOrCreateSiteSettings = async () => {
  let settings = await SiteSettings.findOne({ key: SETTINGS_KEY });

  if (!settings) {
    settings = await SiteSettings.create({ key: SETTINGS_KEY });
  }

  return settings;
};

const getSiteSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSiteSettings();

    return res.status(200).json({
      homeHeroImage: settings.homeHeroImage || '',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error.' });
  }
};

const updateSiteSettings = async (req, res) => {
  try {
    const { homeHeroImage } = req.body || {};

    if (!isSupportedImageValue(homeHeroImage)) {
      return res.status(400).json({
        message: 'homeHeroImage must be a valid image data URL or absolute image URL.',
      });
    }

    if (homeHeroImage.length > MAX_IMAGE_PAYLOAD_LENGTH) {
      return res.status(413).json({
        message: 'Image payload too large. Please upload a smaller image.',
      });
    }

    const settings = await SiteSettings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      {
        $set: {
          key: SETTINGS_KEY,
          homeHeroImage,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      message: 'Site settings updated successfully.',
      homeHeroImage: settings.homeHeroImage || '',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error.' });
  }
};

module.exports = {
  getSiteSettings,
  updateSiteSettings,
};
