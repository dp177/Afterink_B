const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { addUser } = require('../controllers/userController');

router.post('/add', auth, role('ceo'), addUser);

module.exports = router;