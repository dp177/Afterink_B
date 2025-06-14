const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  // 🔽 Enhanced: Log cookies to ensure the token is being sent
  console.log('Cookies:', req.cookies);

  const token = req.cookies?.token;
  if (!token) {
    console.log('Missing token');
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    // 🔽 Enhanced: Log token before verification
    console.log('Token:', token);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded);

    const user = await User.findById(decoded.id);
    console.log('User from DB:', user);

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'User not found' });
    }

    // 🔽 Enhanced: Log session version comparison
    console.log('Session version from JWT:', decoded.sessionVersion);
    console.log('Session version from DB:', user.sessionVersion);
    
    // 🚨 Compare session version
    if (user.sessionVersion !== decoded.sessionVersion) {
      console.log('Session expired or logged in elsewhere');
      return res.status(401).json({ error: 'Session expired or logged in elsewhere' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Error during token verification:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
};
