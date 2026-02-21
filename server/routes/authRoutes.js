const express = require('express');
const { verifyPasscode } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/verify', verifyPasscode);
router.get('/protected', authMiddleware, (req, res) => {
  return res.status(200).json({ message: 'Protected route access confirmed.' });
});

module.exports = router;
