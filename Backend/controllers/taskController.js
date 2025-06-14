
const User = require("../models/User");

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Task = require("../models/Task");
const TimeLog = require("../models/TimeLog");

// Helper: Format duration in seconds to HH:MM:SS
function formatDuration(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

// Helper: Split a log across calendar days if it spans midnight
function splitLogByDay(log) {
  const result = [];
  let { startTime, endTime, duration } = log;
  let current = new Date(startTime);
  const final = new Date(endTime);

  while (current.toDateString() !== final.toDateString()) {
    const midnight = new Date(current);
    midnight.setHours(24, 0, 0, 0);
    const segmentDuration = (midnight - current) / 1000;

    result.push({
      ...log._doc,
      date: current.toISOString().slice(0, 10),
      duration: segmentDuration,
    });

    current = new Date(midnight);
  }

  result.push({
    ...log._doc,
    date: current.toISOString().slice(0, 10),
    duration: (final - current) / 1000,
  });

  return result;
}

exports.getAnalysisForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date().toISOString().slice(0, 10);
    console.log("📅 Today:", today);

    const tasks = await Task.find({ assignedTo: new ObjectId(userId) });
    console.log("🧩 Tasks assigned to user:", tasks.length);

    const allLogs = await TimeLog.find({
      user: new ObjectId(userId),
      duration: { $gt: 0 },
      startTime: { $ne: null },
      endTime: { $ne: null },
    });

    console.log("📜 Logs found:", allLogs.length);
    let splitLogs = [];
    allLogs.forEach((log) => {
      splitLogs.push(...splitLogByDay(log));
    });

    const result = [];
    for (const task of tasks) {
      let totalDuration = 0;
      let todayDuration = 0;

      for (const log of splitLogs) {
        if (log.task.toString() === task._id.toString()) {
          totalDuration += log.duration;
          if (log.date === today) todayDuration += log.duration;
        }
      }

      result.push({
        taskId: task._id,
        title: task.title,
        todayDuration: Math.round(todayDuration),
        totalDuration: Math.round(totalDuration),
      });
    }

    console.log("✅ Final Result:", result);
    res.json({ data: result });
  } catch (err) {
    console.error("❌ getAnalysisForUser error:", err);
    res.status(500).json({ error: "Failed to generate user task breakdown" });
  }
};





function formatDuration(totalSeconds) {
  const hours   = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts   = [];
  if (hours)   parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return { hours, minutes, seconds, formatted: parts.join(' ') };
}

exports.getTaskToday = async (req, res) => {
  try {
    const { taskId } = req.params;
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // 1) Load assigned users
    const task = await Task.findById(taskId)
      .populate('assignedTo', 'name')
      .lean();
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // 2) Fetch any logs that might contribute today
    const logs = await TimeLog.find({
      taskId,
      status: { $in: ['In Progress','Hold','Completed'] },
      $or: [
        { endTime: { $gte: todayStart, $lte: now } },
        { status: 'In Progress', startTime: { $lte: now } }
      ]
    }).populate('userId', 'name');

    // 3) Aggregate seconds per user
    const byUser = {};
    logs.forEach(log => {
      const uid = log.userId._id.toString();
      // compute full duration (including in-progress tail)
      let secs = log.duration || 0;
      if (log.status === 'In Progress' && log.startTime) {
        secs += Math.floor((now - new Date(log.startTime)) / 1000);
      }
      // clamp to today window
      const start = new Date(log.startTime) < todayStart
        ? todayStart
        : log.startTime;
      const end = (log.status === 'In Progress') ? now : log.endTime;
      const todaySecs = Math.floor((new Date(end) - new Date(start)) / 1000);
      byUser[uid] = (byUser[uid] || 0) + Math.max(0, todaySecs);
    });

    // 4) Build response for every assigned member
    const data = task.assignedTo.map(u => {
      const uid = u._id.toString();
      const secs = byUser[uid] || 0;
      const { formatted } = formatDuration(secs);
      return {
        userId: uid,
        name: u.name,
        seconds: secs,
        time: formatted
      };
    });

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTaskNames = async (req, res) => {
  try {
    const tasks = await Task.find({}, '_id title');
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getMemberNames = async (req, res) => {
  console.log("Fetching member names");
  try {
    const members = await User.find({ role: { $in: ['freelancer', 'founding_member','ceo'] } }, '_id name email role');
    res.json({ members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getAnalysisForTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const logs = await TimeLog.find({ taskId })
      .populate('userId', 'name email role');
    const result = {};
    logs.forEach(log => {
      const user = log.userId;
      if (!result[user._id]) {
        result[user._id] = {
          name: user.name,
          email: user.email,
          role: user.role,
          totalSeconds: 0
        };
      }
      result[user._id].totalSeconds += log.duration || 0;
    });
    Object.values(result).forEach(user => {
      user.totalTime = formatDuration(user.totalSeconds).formatted;
    });
    res.json({ data: Object.values(result) });
  } catch (err) {
    res.status(500).json({ error: "Error in ALAL for task", message: err.message });

  }
}


function formatDurations(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

exports.createTask = async (req, res) => {
  try {
    if (req.user.role !== 'ceo') {
      return res.status(403).json({ error: 'Only CEO can create tasks' });
    }

    const { title, description, assignedTo } = req.body;

    const users = await User.find({ _id: { $in: assignedTo } });
    if (users.length !== assignedTo.length) {
      return res.status(400).json({ error: 'One or more users not found' });
    }

    const task = await Task.create({ title, description, assignedTo });

    // 👇 FIX field names: use `task` and `user`, not `taskId` and `userId`
    const logs = await Promise.all(
      assignedTo.map(user =>
        TimeLog.create({
          task: task._id,
          user,
          status: 'Not Started',
        })
      )
    );

    task.logs = logs.map(log => log._id);
    await task.save();

    res.status(201).json({ message: 'Task created successfully', taskId: task._id });
  } catch (err) {
    console.error("Create Task Error:", err);
    res.status(500).json({ error: err.message });
  }
};


exports.updateTaskStatus = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;
    const allowed = ['Not Started', 'In Progress', 'Hold', 'Completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    const task = await Task.findByIdAndUpdate(taskId, { status }, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    res.json({ message: 'Task status updated', status: task.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    let tasks;

    if (req.user.role === 'ceo') {
      // CEO sees all tasks with all logs
      tasks = await Task.find()
        .populate('assignedTo', 'name email role')
        .populate({
          path: 'logs',
          populate: { path: 'user', select: 'name email role' } // Use `user` instead of `userId` if that's how it's defined
        });
    } else {
      // Others see only their tasks with their own logs
      tasks = await Task.find({ assignedTo: req.user._id })
        .populate({
          path: 'logs',
          match: { user: req.user._id }, // Use `user` instead of `userId`
        });
    }

    res.status(200).json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getMyselfCEOTasks = async (req, res) => {
  try {
    let tasks;
    console.log("Fetching tasks for CEO:", req.user._id);
    tasks = await Task.find({ assignedTo: req.user._id })
        .populate({
          path: 'logs',
          match: { user: req.user._id }, // Use `user` instead of `userId`
        });
    // Return the tasks assigned to the CEO
     res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching CEO tasks:", error);
    return res.status(500).json({ message: "Error fetching CEO tasks", error });
  }
};