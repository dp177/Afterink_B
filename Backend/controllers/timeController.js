const TimeLog = require('../models/TimeLog');
const User = require('../models/User');
const Task = require('../models/Task');
// Helper for formatting
function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  let parts = [];
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} second${seconds > 1 ? 's' : ''}`);
  return {
    hours, minutes, seconds,
    formatted: parts.join(', ')
  };
}
exports.getDailyLeaderboard = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();

    const logs = await TimeLog.aggregate([
      {
        $match: {
          endTime: { $gte: todayStart, $lte: todayEnd },
          duration: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: "$user",
          totalTime: { $sum: "$duration" }
        }
      },
      {
        $sort: { totalTime: -1 }
      }
    ]);

    res.status(200).json({ leaderboard: logs });
  } catch (error) {
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
};

exports.getTodayAnalytics = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['freelancer', 'founding_member'] } })
      .select('_id name email role');

    // Set today’s range (midnight to now)
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Find all logs relevant for today
    const logs = await TimeLog.find({
      $or: [
        // Ended today (for Hold/Completed logs)
        { status: { $in: ['Hold', 'Completed'] }, endTime: { $gte: todayStart, $lte: now } },
        // Still running and started today or earlier
        { status: 'In Progress', startTime: { $lte: now } }
      ]
    })
      .populate('userId', 'name email role')
      .populate('taskId', 'title');

    // Group results
    const summary = {};
    users.forEach(user => {
      summary[user._id.toString()] = {
        user: user.name,
        email: user.email,
        role: user.role,
        totalSeconds: 0,
        totalTime: '0 second',
        perTask: {}
      };
    });

    logs.forEach(log => {
      if (!log.userId || !log.taskId) return;
      const uid = log.userId._id.toString();
      const tname = log.taskId.title;
      if (!summary[uid]) return;

      if (!summary[uid].perTask[tname]) {
        summary[uid].perTask[tname] = {
          seconds: 0,
          time: '0 seconds'
        };
      }
      let duration = 0;

      if ((log.status === 'Hold' || log.status === 'Completed') && log.endTime >= todayStart) {
        // Only add today's portion for logs that spanned midnight
        const actualStart = log.startTime >= todayStart ? log.startTime : todayStart;
        duration = Math.floor((log.endTime - new Date(actualStart)) / 1000);
      } else if (log.status === 'In Progress' && log.startTime <= now) {
        // In progress: from today’s midnight or startTime (whichever is later) to now
        const sessionStart = log.startTime >= todayStart ? log.startTime : todayStart;
        duration = Math.floor((now - new Date(sessionStart)) / 1000);
      }
      if (duration < 0) duration = 0;

      summary[uid].perTask[tname].seconds += duration;
      summary[uid].perTask[tname].time = formatDuration(summary[uid].perTask[tname].seconds).formatted;
      summary[uid].totalSeconds += duration;
    });

    Object.values(summary).forEach(user => {
      user.totalTime = formatDuration(user.totalSeconds).formatted;
    });

    res.json({
      date: now.toISOString().slice(0, 10),
      data: Object.values(summary)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getRawUserTaskTotals = async (req, res) => {
  try {
    // Include role in select!
    const users = await User.find({ role: { $in: ['freelancer', 'founding_member'] } })
      .select('_id name email role');

    const checkedTime = req.query.checkedTime ? new Date(req.query.checkedTime) : new Date();

    const logs = await TimeLog.find({
      status: { $in: ['In Progress', 'Hold', 'Completed'] }
    })
      .populate('userId', 'name email role')
      .populate('taskId', 'title');

    const summary = {};
    users.forEach(user => {
      summary[user._id.toString()] = {
        user: user.name,
        email: user.email,
        role: user.role,    // <-- This will now be defined!
        totalSeconds: 0,
        totalTime: '0 second',
        perTask: {}
      };
    });

    logs.forEach(log => {
      if (!log.userId || !log.taskId) return;
      const uid = log.userId._id.toString();
      const tname = log.taskId.title;
      if (!summary[uid]) return;

      if (!summary[uid].perTask[tname]) {
        summary[uid].perTask[tname] = {
          seconds: 0,
          time: '0 seconds',
          // role: summary[uid].role, // You can add this if you want role in each perTask as well
        };
      }
      let duration = log.duration || 0;
      // If it's "In Progress", add extra time up to checkedTime (not yet on hold or completed)
      if (log.status === 'In Progress' && log.startTime) {
        const endPoint = checkedTime > log.startTime ? checkedTime : new Date(log.startTime);
        duration += Math.floor((endPoint - new Date(log.startTime)) / 1000);
      }
      summary[uid].perTask[tname].seconds += duration;
      summary[uid].perTask[tname].time = formatDuration(summary[uid].perTask[tname].seconds).formatted;
      summary[uid].totalSeconds += duration;
    });

    // Add formatted total time for each user
    Object.values(summary).forEach(user => {
      user.totalTime = formatDuration(user.totalSeconds).formatted;
    });

    res.json({ checkedTime, data: Object.values(summary) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @route POST /api/time/start
// @desc Start working on a task
exports.startTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const { taskId } = req.body;

    // Find the most recent "In Progress" task for this user
    const currentInProgressLog = await TimeLog.findOne({ user: userId, status: 'In Progress' }).sort({ startTime: -1 });

    if (currentInProgressLog) {
      // Move the current task to 'Hold' before starting a new task
      currentInProgressLog.status = 'Hold';
      currentInProgressLog.endTime = new Date();
      currentInProgressLog.duration = (currentInProgressLog.endTime - currentInProgressLog.startTime) / 1000;
      await currentInProgressLog.save();
    }

    // Create a new log for the task that's starting
    const newLog = new TimeLog({
      user: userId,
      task: taskId,
      status: 'In Progress',
      startTime: new Date(),
    });

    await newLog.save();

    res.status(200).json({ message: "Task started successfully", log: newLog });
  } catch (error) {
    console.error('Error starting task:', error);
    res.status(500).json({ error: "Error starting task" });
  }
};

// @route POST /api/time/hold
// @desc Pause current task
exports.holdTask = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the most recent task that is in progress for this user
    const log = await TimeLog.findOne({ user: userId, status: 'In Progress' }).sort({ startTime: -1 });

    if (!log) return res.status(404).json({ error: "No active task" });

    // Update the status to "Hold"
    log.status = 'Hold';
    log.endTime = new Date();

    // Calculate the time spent in progress and update the duration
    log.duration = (log.endTime - new Date(log.startTime)) / 1000; // in seconds
    await log.save();

    // Respond with the updated log
    res.status(200).json({ message: "Task put on hold", log });
  } catch (error) {
    console.error("Error putting task on hold:", error);
    res.status(500).json({ error: "Error putting task on hold" });
  }
};


// Helper: Format duration in seconds to HH:MM:SS
function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}:${m}:${s}`;
}
// Backend code for completing a task
// Backend code to complete task
exports.completeTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const { taskId } = req.body;

    // Find the most recent log entry for the task and user
    const log = await TimeLog.findOne({ user: userId, task: taskId, status: 'Hold' }).sort({ startTime: -1 });

    if (!log) {
      return res.status(404).json({ error: "Task must be on hold before completion" });
    }

    // Update the task's log to mark it as completed
    log.status = 'Completed';
    log.endTime = new Date();
    log.duration = (log.endTime - log.startTime) / 1000;
    await log.save();

    // Optional: Update task status here if you also want to mark the task itself as completed.
    const task = await Task.findById(taskId);
    if (task) {
      task.status = 'Completed';
      await task.save();
    }

    res.status(200).json({ message: "Task completed", log });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: "Error completing task" });
  }
};



