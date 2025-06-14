import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { FaEdit } from "react-icons/fa"; // For edit icon in buttons

const COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B"];

export default function TaskOverviewCards() {
  const [allTasks, setAllTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [userRole, setUserRole] = useState(""); // State to hold the current user's role (CEO)
  const [statusToUpdate, setStatusToUpdate] = useState(null); // State to track the task being updated

  // Helper function to format time duration
  function formatDuration(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  }

  // Fetch task data and logs
  useEffect(() => {
    async function fetchData() {
      try {
        const [taskRes, overviewRes] = await Promise.all([
          axios.get("/api/tasks"),
          axios.get("/api/dashboard/overview"),
        ]);
        const taskList = taskRes.data?.tasks || taskRes.data || [];
        setAllTasks(taskList);
        setLogs(overviewRes.data?.data || []);
        // Set user role based on current session
        setUserRole(localStorage.getItem("role")); // assuming role is stored in localStorage
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Toggle expand/collapse of task details
  const toggleExpand = (taskId) => {
    setExpandedId(expandedId === taskId ? null : taskId);
  };

  // Get log for specific task
  const getLogForTask = (taskId) => logs.find((log) => log.taskId === taskId);

  // Change task status (CEO functionality)
  const changeTaskStatus = async (taskId, newStatus) => {
    try {
      // Update main task status
      await axios.patch(`/api/tasks/${taskId}/status`, { status: newStatus });
      // Optionally refetch tasks after updating
      const taskRes = await axios.get("/api/tasks");
      setAllTasks(taskRes.data?.tasks || []);
      setStatusToUpdate(null); // Close the status update modal after changing
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  // Handle modal open for task status update
  const openStatusUpdateModal = (taskId) => {
    setStatusToUpdate(taskId); // Open the modal for the specific task
  };

  // Handle modal close
  const closeStatusUpdateModal = () => {
    setStatusToUpdate(null); // Close the modal
  };

  if (loading) return <div className="text-gray-400">Loading tasks...</div>;
  if (!allTasks || allTasks.length === 0) return <div className="text-gray-400">No tasks found.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">All Tasks</h2>
      {allTasks.map((task) => {
        const log = getLogForTask(task._id);
        const pieDataToday = task.assignedTo.map((user, i) => ({
          name: user.name,
          value: log?.users?.find((u) => u.userId === user._id)?.todayDuration || 0,
        }));

        const pieDataTotal = task.assignedTo.map((user, i) => ({
          name: user.name,
          value: log?.users?.find((u) => u.userId === user._id)?.totalDuration || 0,
        }));

        return (
          <div
            key={task._id}
            className="bg-black rounded-xl border border-gray-700 overflow-hidden transition-all transform hover:scale-105 hover:shadow-xl"
            style={{ background: "rgba(0,0,0,0.7)" }} // Smooth dark background
          >
            <div
              onClick={() => toggleExpand(task._id)}
              className="cursor-pointer px-6 py-4 flex justify-between items-start hover:bg-gray-800 transition-all"
            >
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">{task.title}</h3>
                <p className="text-sm text-gray-400">{task.description}</p>
              </div>
              <span className="bg-yellow-600 text-sm text-white px-3 py-1 rounded-full self-start">{task.status}</span>
            </div>

            {expandedId === task._id && (
              <div className="px-6 py-4 border-t border-gray-800 bg-gray-800">
                {/* Task status change buttons */}
                {userRole === "CEO" && (
                  <div className="flex space-x-2 mb-4">
                    {["Not Started", "In Progress", "Hold", "Completed"].map((status) => (
                      <button
                        key={status}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg transition-all hover:bg-blue-700"
                        onClick={() => changeTaskStatus(task._id, status)}
                      >
                        Mark as {status}
                      </button>
                    ))}
                    <button
                      onClick={() => openStatusUpdateModal(task._id)}
                      className="text-white bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      <FaEdit className="inline mr-2" /> Edit Status
                    </button>
                  </div>
                )}

                {/* Pie chart and other details */}
                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  <div className="bg-[#1f1f2e] p-4 rounded-xl backdrop-blur-md">
                    <h4 className="text-sm text-white mb-2">Today's Work Distribution</h4>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={pieDataToday} dataKey="value" nameKey="name" outerRadius={60}>
                          {pieDataToday.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-[#1f1f2e] p-4 rounded-xl backdrop-blur-md">
                    <h4 className="text-sm text-white mb-2">Total Work Distribution</h4>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={pieDataTotal} dataKey="value" nameKey="name" outerRadius={60}>
                          {pieDataTotal.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 text-gray-300 text-sm">
                  <div>
                    <h4 className="font-semibold mb-1">Today's Time</h4>
                    <ul>
                      {task.assignedTo.map((user) => {
                        const u = log?.users?.find((x) => x.userId === user._id);
                        return (
                          <li key={user._id}>
                            • {user.name}: {formatDuration(u?.todayDuration || 0)}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-1">Total Time</h4>
                    <ul>
                      {task.assignedTo.map((user) => {
                        const u = log?.users?.find((x) => x.userId === user._id);
                        return (
                          <li key={user._id}>
                            • {user.name}: {formatDuration(u?.totalDuration || 0)}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Modal for Status Update */}
      {statusToUpdate && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96">
            <h2 className="text-white text-2xl mb-4">Change Task Status</h2>
            <div className="space-y-4">
              {["Not Started", "In Progress", "Hold", "Completed"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    changeTaskStatus(statusToUpdate, status);
                    closeStatusUpdateModal();
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all"
                >
                  Mark as {status}
                </button>
              ))}
            </div>
            <button
              onClick={closeStatusUpdateModal}
              className="mt-4 w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
