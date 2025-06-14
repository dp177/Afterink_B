import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "../../utils/axios";

export default function CEOProfile() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState([]);

  // Format time in hours and minutes
  const formatTime = (sec) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Fetch user profile, tasks, and analysis
  useEffect(() => {
    if (user && user._id) {
      axios.get(`/api/profile/${user._id}`, { withCredentials: true })
        .then((res) => {
          setTasks(res.data.tasks);
          setAnalysis(res.data.analysis);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 text-white bg-gray-950 min-h-screen">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl shadow-lg p-6 mb-8">
        {/* Profile Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">{user.name}</h1>
            <p className="text-lg text-gray-400 capitalize mt-1">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Tasks and Analysis */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">My Tasks and Analysis</h2>

        {tasks.length === 0 ? (
          <p>No tasks assigned.</p>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-white">{task.title}</h3>
              <p className="text-sm text-gray-400">{task.description}</p>
              <p className="mt-2 text-yellow-400">Status: {task.status}</p>

              {/* Task Analysis: Time Today and Total Time */}
              <div className="mt-3 space-y-2">
                <p className="text-sm text-green-400">Today's Time: {formatTime(analysis[task._id]?.today || 0)}</p>
                <p className="text-sm text-blue-400">Total Time: {formatTime(analysis[task._id]?.total || 0)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
