const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is missing in environment variables.');
    }

    const decoded = jwt.verify(token, secret);
    req.admin = decoded;

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
