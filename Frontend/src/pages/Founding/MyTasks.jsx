import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "../../utils/axios";

export default function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changingId, setChangingId] = useState(null);
  const [uptimeMap, setUptimeMap] = useState({});
  const [activeTask, setActiveTask] = useState(null); // Track active task

  // Format the time in "hh:mm:ss"
  const formatUptime = (sec) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, "0");
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // Update task statuses
  const startTask = async (taskId) => {
    setChangingId(taskId);
    try {
      // Check if any task is already in progress and set it to hold
      const inProgressTask = tasks.find(t => t.memberStatus === "In Progress");
      if (inProgressTask) {
        await axios.post("http://localhost:5000/api/time/hold", { taskId: inProgressTask._id });  // Put the current task on hold
        setTasks(prev => prev.map(t => t._id === inProgressTask._id ? { ...t, memberStatus: "Hold" } : t));
      }

      // Now, start the new task
      await axios.post("http://localhost:5000/api/time/start", { taskId });
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, memberStatus: "In Progress" } : t));
      setUptimeMap(prev => ({ ...prev, [taskId]: 0 }));
      setActiveTask(taskId); // Set the active task
    } catch (error) {
      console.error("Error starting task", error);
    } finally {
      setChangingId(null); // Re-enable buttons after task status change
    }
  };

  const holdTask = async (taskId) => {
    setChangingId(taskId);
    try {
      await axios.post("http://localhost:5000/api/time/hold", { taskId });
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, memberStatus: "Hold" } : t));
      setActiveTask(null); // Reset active task when it's put on hold
    } catch (error) {
      console.error("Error putting task on hold", error);
    } finally {
      setChangingId(null); // Re-enable buttons after task status change
    }
  };

  const completeTask = async (taskId) => {
    setChangingId(taskId);
    try {
      await axios.post("http://localhost:5000/api/time/complete", { taskId });
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, memberStatus: "Completed" } : t));
      setActiveTask(null); // Reset active task when task is completed
    } catch (error) {
      console.error("Error completing task", error);
    } finally {
      setChangingId(null); // Re-enable buttons after task status change
    }
  };

  // Fetch tasks data
  useEffect(() => {
    axios.get("/api/tasks", { withCredentials: true })
      .then(res => {
        setTasks(res.data);
        const uptimeInit = {};
        res.data.forEach(task => {
          if (task.memberStatus === "In Progress") {
            uptimeInit[task._id] = 0;
            setActiveTask(task._id); // Set active task if one exists
          }
        });
        setUptimeMap(uptimeInit);
      })
      .finally(() => setLoading(false));
  }, []);

  // Update uptime in real-time for active tasks
  useEffect(() => {
    const interval = setInterval(() => {
      setUptimeMap(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(id => updated[id] += 1);
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-gray-400">Loading...</div>;

  return (
    <div className="p-6 text-white bg-gray-950 min-h-screen">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl shadow-lg p-6 mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-300">Welcome back 👋</p>
          <h1 className="text-2xl font-bold">{user?.name || "Freelancer"}</h1>
          <p className="text-sm text-gray-400 capitalize mt-1">{user?.role}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold text-white">
          {user?.name?.charAt(0).toUpperCase() || "F"}
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">My Tasks</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <div key={task._id} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <h3 className="text-lg text-white font-semibold">{task.title}</h3>
            <p className="text-sm text-gray-400">{task.description}</p>
            <p className="text-sm mt-1 text-yellow-400">Status: {task.memberStatus || "Not Started"}</p>
            {task.memberStatus === "In Progress" && (
              <p className="text-sm text-green-400">Uptime: {formatUptime(uptimeMap[task._id] || 0)}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => startTask(task._id)}
                disabled={task.memberStatus === "In Progress" || changingId === task._id}
                className={`text-sm px-3 py-1 rounded ${task.memberStatus === "In Progress" ? "bg-blue-600 text-white" : "bg-gray-500 text-white"}`}
              >
                In Progress
              </button>
              <button
                onClick={() => holdTask(task._id)}
                disabled={task.memberStatus !== "In Progress" || changingId === task._id}
                className={`text-sm px-3 py-1 rounded ${task.memberStatus === "Hold" ? "bg-yellow-600 text-white" : "bg-yellow-500 text-white"}`}
              >
                Hold
              </button>
              <button
                onClick={() => completeTask(task._id)}
                disabled={task.memberStatus !== "Hold" || changingId === task._id}
                className={`text-sm px-3 py-1 rounded ${task.memberStatus === "Completed" ? "bg-green-600 text-white" : "bg-green-500 text-white"}`}
              >
                Complete
              </button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-10">
            No tasks assigned.
          </div>
        )}
      </div>
    </div>
  );
}
