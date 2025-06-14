const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const {
  createTask,
  updateTaskStatus, // rename for clarity!
  getTasks,
  getMemberNames,
  getTaskNames,
  getAnalysisForTask,
  getAnalysisForUser,
  getMyselfCEOTasks
} = require('../controllers/taskController');

// CEO can create tasks
router.post('/create', auth, role(['ceo']), createTask);

// CEO can update overall status of any task
router.patch('/:id/status', auth, role(['ceo']), updateTaskStatus);

// All users can view (CEO: all, others: only assigned)
router.get('/', auth, getTasks);
router.get('/all-tasks', auth, role(['ceo']), getTaskNames);
router.get('/all-names', auth, role(['ceo']), getMemberNames);
router.get('/analytics/task/:taskId', auth, role(['ceo']), getAnalysisForTask);
router.get('/analytics/user/:userId', auth, role(['ceo']), getAnalysisForUser);
router.get('/analytics/task/:taskId/today',auth, role(['ceo']), getAnalysisForUser);

router.get('/myselfceotasks', auth, role(['ceo']), getMyselfCEOTasks);  // CEO-specific tasks

module.exports = router;
