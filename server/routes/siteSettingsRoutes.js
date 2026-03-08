const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getSiteSettings,
  updateSiteSettings,
} = require('../controllers/siteSettingsController');

const router = express.Router();

router.get('/', getSiteSettings);
router.put('/', authMiddleware, updateSiteSettings);

module.exports = router;
