
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Register route: protected so only CEO and founding_members can register others
router.post(
  '/register',
  authMiddleware,
  roleMiddleware(['ceo', 'founding_member']),
  authController.register
);

// Login route remains public
router.post('/login', authController.login);
router.post('/logout',authController.logout)

module.exports = router;
