
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const currentUser = req.user; // Comes from auth middleware

    // Validate if user already exists
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already exists' });

    // Only CEO can add founding members
    if (role === 'founding_member' && currentUser.role !== 'ceo') {
      return res.status(403).json({ error: 'Only CEO can create founding members' });
    }

    // Freelancers can be added by both CEO and founding members
    if (role === 'freelancer' && !['ceo', 'founding_member'].includes(currentUser.role)) {
      return res.status(403).json({ error: 'Only CEO or Founding Members can add freelancers' });
    }

    // Restrict invalid role creation
    if (!['freelancer', 'founding_member'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role assignment' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashed, role });

    res.status(201).json({ message: `${role} created`, userId: newUser._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
