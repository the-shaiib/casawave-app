const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const generateToken = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is missing in environment variables.');
  }

  return jwt.sign({ role: 'admin' }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const verifyPasscode = async (req, res) => {
  try {
    const { passcode } = req.body;

    if (!passcode) {
      return res.status(400).json({ message: 'Passcode is required.' });
    }

    const admin = await Admin.findOne();

    if (!admin) {
      return res.status(404).json({ message: 'Admin passcode is not seeded yet.' });
    }

    const isMatch = await bcrypt.compare(passcode, admin.passcodeHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid passcode.' });
    }

    const token = generateToken();

    return res.status(200).json({
      message: 'Access granted.',
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error.' });
  }
};

module.exports = {
  verifyPasscode,
};
