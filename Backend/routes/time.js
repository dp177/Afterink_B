const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

const {
  startTask,
  holdTask,
  completeTask,
  getUserTimeTable,
  getRawUserTaskTotals,
  getTodayAnalytics,
  getDailyLeaderboard
} = require('../controllers/timeController');


// Only freelancers and founding_members can start/hold/complete their task work
router.post('/start', auth, role(['freelancer', 'founding_member','ceo']), startTask);
router.post('/hold', auth, role(['freelancer', 'founding_member','ceo']), holdTask);
router.post('/complete', auth, role(['freelancer', 'founding_member','ceo']), completeTask);
router.get('/todaytime', auth, role(['freelancer', 'founding_member','ceo']), getDailyLeaderboard);
// CEO can view analytics for any range/all users
//router.get('/analytics/time-table', auth, role(['ceo']), getUserTimeTable);
router.get('/analytics/raw', auth, role(['ceo']), getRawUserTaskTotals);
router.get('/analytics/today', auth, role(['ceo']), getTodayAnalytics);

module.exports = router;
