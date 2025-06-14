module.exports = function (allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      console.log('🚫 No user found on request');
      return res.status(401).json({ error: 'Unauthorized: No user data' });
    }

    console.log('🔍 Role check:', req.user.role);
    console.log('✅ Allowed roles:', allowedRoles);

    if (!allowedRoles.includes(req.user.role)) {
      console.log(`❌ Access denied: Role '${req.user.role}' not in allowed list`);
      return res.status(403).json({ error: 'Access denied' });
    }

    console.log('✅ Access granted');
    next();
  };
};
