const TimeLog = require("../models/TimeLog");
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
      ...log,
      date: current.toISOString().slice(0, 10),
      duration: segmentDuration,
    });

    current = new Date(midnight);
  }

  result.push({
    ...log,
    date: current.toISOString().slice(0, 10),
    duration: (final - current) / 1000,
  });

  return result;
}

const getTaskWiseUserOverview = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const logsRaw = await TimeLog.aggregate([
      {
        $match: {
          duration: { $gt: 0 },
          startTime: { $ne: null },
          endTime: { $ne: null },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $lookup: {
          from: "tasks",
          localField: "task",
          foreignField: "_id",
          as: "taskInfo",
        },
      },
      { $unwind: "$userInfo" },
      { $unwind: "$taskInfo" },
      {
        $project: {
          taskId: "$taskInfo._id",
          task: "$taskInfo.title",
          userId: "$userInfo._id",
          user: "$userInfo.name",
          startTime: 1,
          endTime: 1,
          duration: 1,
        },
      },
    ]);

    const splitLogs = [];
    logsRaw.forEach((log) => {
      splitLogs.push(...splitLogByDay(log));
    });

    const taskMap = {};

    for (const log of splitLogs) {
      const taskKey = log.taskId.toString();
      const userKey = log.userId.toString();

      if (!taskMap[taskKey]) {
        taskMap[taskKey] = {
          taskId: log.taskId,
          task: log.task,
          users: {},
        };
      }

      const userEntry = taskMap[taskKey].users[userKey] || {
        userId: log.userId,
        user: log.user,
        todayDuration: 0,
        totalDuration: 0,
      };

      userEntry.totalDuration += log.duration;
      if (log.date === today) {
        userEntry.todayDuration += log.duration;
      }

      taskMap[taskKey].users[userKey] = userEntry;
    }

    const data = Object.values(taskMap).map((task) => ({
      taskId: task.taskId,
      task: task.task,
      users: Object.values(task.users).map((u) => ({
        userId: u.userId,
        user: u.user,
        todayDuration: Math.round(u.todayDuration),
        totalDuration: Math.round(u.totalDuration),
      })),
    }));

    res.status(200).json({ data });
  } catch (err) {
    console.error("Task-wise overview error:", err);
    res.status(500).json({ error: "Failed to generate task overview" });
  }
};
// Helper: Format duration in seconds to HH:MM:SS
function formatDuration(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

// Helper: Split a log across calendar days if it spans midnight
function splitLogByDayo(log) {
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

async function getLeaderboardForRange(start, end) {
  try {
    const logs = await TimeLog.find({
      startTime: { $gte: start },
      endTime: { $lte: end },
      duration: { $gt: 0 },
    })
      .populate("user", "name role"); // Ensure 'user' is populated correctly here

    const splitLogs = [];
    logs.forEach((log) => {
      if (log.user) {
        splitLogs.push(...splitLogByDayo(log));
      } else {
        console.warn("Log entry without a valid user:", log);
      }
    });

    const userDurationMap = {};

    for (const log of splitLogs) {
      if (log.user) {
        const uid = log.user._id.toString();
        if (!userDurationMap[uid]) {
          userDurationMap[uid] = {
            userId: uid,
            name: log.user.name,
            role: log.user.role,
            totalSeconds: 0,
          };
        }
        userDurationMap[uid].totalSeconds += log.duration;
      } else {
        console.warn("Log entry without a valid user:", log);
      }
    }

    const leaderboard = Object.values(userDurationMap)
      .sort((a, b) => b.totalSeconds - a.totalSeconds)
      .map((u) => ({
        ...u,
        formatted: formatDuration(u.totalSeconds),
      }));

    return leaderboard;
  } catch (error) {
    console.error("Error in getLeaderboardForRange:", error);
    throw new Error("Error generating leaderboard");
  }
}

const getDailyLeaderboard = async (req, res) => {
  try {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date();

    const leaderboard = await getLeaderboardForRange(start, end);
    res.json({ leaderboard });
  } catch (error) {
    console.error("Daily Leaderboard Error:", error);
    res.status(500).json({ error: "Failed to load daily leaderboard" });
  }
};

const getWeeklyLeaderboard = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.setDate(now.getDate() - 7));
    start.setHours(0, 0, 0, 0);
    const end = new Date();

    const leaderboard = await getLeaderboardForRange(start, end);
    res.json({ leaderboard });
  } catch (error) {
    console.error("Weekly Leaderboard Error:", error);
    res.status(500).json({ error: "Failed to load weekly leaderboard" });
  }
};

const getMonthlyLeaderboard = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.setDate(now.getDate() - 30));
    start.setHours(0, 0, 0, 0);
    const end = new Date();

    const leaderboard = await getLeaderboardForRange(start, end);
    res.json({ leaderboard });
  } catch (error) {
    console.error("Monthly Leaderboard Error:", error);
    res.status(500).json({ error: "Failed to load monthly leaderboard" });
  }
};

module.exports = {
  getDailyLeaderboard,
  getWeeklyLeaderboard,
  getMonthlyLeaderboard,
};


const getTopPerformer = async (req, res) => {
  try {
    const logs = await TimeLog.find({
      status: { $in: ["Hold", "Completed", "In Progress"] }
    }).populate("user");

    const userTimeMap = {};

    for (const log of logs) {
      const user = log.user;
      if (!user) continue;

      const uid = user._id.toString();

      if (!userTimeMap[uid]) {
        userTimeMap[uid] = {
          name: user.name,
          email: user.email,
          role: user.role,
          seconds: 0
        };
      }

      let duration = log.duration || 0;

      if (log.status === "In Progress" && log.startTime && !log.endTime) {
        duration += Math.floor((Date.now() - new Date(log.startTime)) / 1000);
      }

      userTimeMap[uid].seconds += duration;
    }

    const sorted = Object.values(userTimeMap)
      .sort((a, b) => b.seconds - a.seconds)
      .map(user => ({
        ...user,
        formatted: formatDuration(user.seconds)
      }));

    res.json({ topPerformer: sorted[0] || null });
  } catch (error) {
    console.error("Top Performer Error:", error);
    res.status(500).json({
      error: "Failed to determine top performer",
      message: error.message
    });
  }
};

module.exports = {
  getTaskWiseUserOverview,
  getDailyLeaderboard,
  getWeeklyLeaderboard,
  getMonthlyLeaderboard,
  getTopPerformer
};
