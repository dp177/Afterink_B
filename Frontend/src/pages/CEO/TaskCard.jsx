import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const SLICE_COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

const STATUS_COLORS = {
  "Not Started": "bg-gray-500",
  "In Progress": "bg-yellow-500",
  "Completed": "bg-green-600",
  "Blocked": "bg-red-600",
  "Hold": "bg-purple-600",
};
const renderCustomTooltip = (dataKey, data) => ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;
    const total = data.reduce((sum, entry) => sum + entry[dataKey], 0);
    const percent = total === 0 ? 0 : ((value / total) * 100).toFixed(1);
    return (
      <div className="bg-gray-800 text-white text-xs p-2 rounded shadow">
        <p>{name}</p>
        <p>{percent}%</p>
      </div>
    );
  }
  return null;
};

export default function TaskCard({ task, savingId, onSaveStatus }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDetails = () => {
    if (task.assignedTo.length > 0) setIsOpen((prev) => !prev);
  };

  const pieDataToday = task.assignedTo.map((user, idx) => ({
    name: user.name,
    value: task.dailyStats.find((d) => d.userId === user._id)?.seconds || 0,
    fill: SLICE_COLORS[idx % SLICE_COLORS.length],
  }));

  const pieDataTotal = task.assignedTo.map((user, idx) => ({
    name: user.name,
    value: task.totalStats.find((t) => t.userId === user._id)?.seconds || 0,
    fill: SLICE_COLORS[idx % SLICE_COLORS.length],
  }));

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden transition-all duration-300">
      <div
        onClick={toggleDetails}
        className="cursor-pointer p-4 flex justify-between items-start hover:bg-gray-800"
      >
        <div>
          <h3 className="text-lg font-semibold text-white">{task.title}</h3>
          <p className="text-sm text-gray-400">Description: {task.description}</p>
        </div>
        <div
          className={`text-sm font-semibold text-white px-3 py-1 rounded ${STATUS_COLORS[task.status] || "bg-gray-500"}`}
        >
          {task.status}
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[2000px] p-4" : "max-h-0 p-0 overflow-hidden"
        } ${task.assignedTo.length === 0 && !isOpen ? "min-h-[150px]" : ""}`}
      >
        {task.assignedTo.length === 0 ? (
          <div className="text-gray-400 text-sm text-center py-6">
            No members assigned to this task.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-between gap-4">
              <div className="w-full md:w-[45%] bg-gray-800 p-4 rounded">
                <h4 className="text-white text-sm mb-2">Today's Work Distribution</h4>
               <ResponsiveContainer width="100%" height={200}>
  <PieChart>
    <Pie data={pieDataToday} dataKey="value" nameKey="name" outerRadius={60}>
      {pieDataToday.map((entry, idx) => (
        <Cell key={`today-${idx}`} fill={entry.fill} />
      ))}
    </Pie>
    <Tooltip content={renderCustomTooltip("value", pieDataToday)} />
  </PieChart>
</ResponsiveContainer>

              </div>

              <div className="w-full md:w-[45%] bg-gray-800 p-4 rounded">
                <h4 className="text-white text-sm mb-2">Total Work Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
  <Pie data={pieDataTotal} dataKey="value" nameKey="name" outerRadius={60}>
    {pieDataTotal.map((entry, idx) => (
      <Cell key={`total-${idx}`} fill={entry.fill} />
    ))}
  </Pie>
 <Tooltip content={renderCustomTooltip("value", pieDataTotal)} />

</PieChart>

                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
  <div className="bg-gray-800 rounded-lg p-4 shadow-md">
    <h4 className="text-white text-sm font-semibold mb-3 border-b border-gray-700 pb-1">
      ⏱️ Today's Time
    </h4>
    <ul className="space-y-2">
      {task.assignedTo.map((user) => {
        const daily = task.dailyStats.find((d) => d.userId === user._id);
        return (
          <li
            key={user._id}
            className="flex justify-between text-sm text-gray-300 bg-gray-700 px-3 py-1.5 rounded"
          >
            <span className="truncate">{user.name}</span>
            <span className="font-mono">{daily?.formatted || "00:00:00"}</span>
          </li>
        );
      })}
    </ul>
  </div>

  <div className="bg-gray-800 rounded-lg p-4 shadow-md">
    <h4 className="text-white text-sm font-semibold mb-3 border-b border-gray-700 pb-1">
      🗓️ Total Time
    </h4>
    <ul className="space-y-2">
      {task.assignedTo.map((user) => {
        const total = task.totalStats.find((t) => t.userId === user._id);
        return (
          <li
            key={user._id}
            className="flex justify-between text-sm text-gray-300 bg-gray-700 px-3 py-1.5 rounded"
          >
            <span className="truncate">{user.name}</span>
            <span className="font-mono">{total?.formatted || "00:00:00"}</span>
          </li>
        );
      })}
    </ul>
  </div>
</div>


            

            <div className="flex flex-wrap gap-2 mt-4">
              {["Not Started", "In Progress",  "Hold","Completed",].map((status) => (
                <button
                  key={status}
                  disabled={savingId === task._id}
                  onClick={() => onSaveStatus(task._id, status)}
                  className={`text-sm px-3 py-1 rounded ${
                    task.status === status
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
