const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Auth Middleware for Cookie-based JWT
module.exports = async (req, res, next) => {
  // 🔽 CHANGED: Read token from cookie
  console.log('Cookies:', req.cookies);

  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ error: 'User not found' });

    // 🚨 Compare session version
    if (user.sessionVersion !== decoded.sessionVersion) {
      return res.status(401).json({ error: 'Session expired or logged in elsewhere' });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
