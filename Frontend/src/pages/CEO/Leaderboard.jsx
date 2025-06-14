import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import Sidebar from "../../components/Sidebar";
import { motion } from "framer-motion";

export default function LeaderboardPage() {
  const [daily, setDaily] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get("/api/dashboard/leaderboard/daily"),
      axios.get("/api/dashboard/leaderboard/weekly"),
      axios.get("/api/dashboard/leaderboard/monthly"),
    ])
      .then(([dRes, wRes, mRes]) => {
        setDaily(dRes.data.leaderboard || []);
        setWeekly(wRes.data.leaderboard || []);
        setMonthly(mRes.data.leaderboard || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const renderList = (entries) => {
    const maxSec = entries[0]?.seconds || 1;
    return (
      <ul className="divide-y divide-[#343454]">
        {entries.map((user, idx) => {
          const perc = Math.floor((user.seconds / maxSec) * 100);
          return (
            <motion.li
              key={user.email}
              className="flex items-center justify-between py-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-400 w-6 text-center">{idx + 1}</span>
                <div className="w-8 h-8 bg-[#2a2a3a] rounded-full flex items-center justify-center text-gray-200 font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-100">{user.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user.role.replace("_", " ")}</div>
                </div>
              </div>
              <div className="flex-1 mx-4 h-3 bg-[#20202d] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${perc}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <span className="text-gray-200 text-sm font-medium">
                {user.formatted || user.totalTime}
              </span>
            </motion.li>
          );
        })}
      </ul>
    );
  };

  const sections = [
    { title: "Daily Top", data: daily },
    { title: "Weekly Top", data: weekly },
    { title: "Monthly Top", data: monthly },
  ];

  return (
    <div className="flex h-screen bg-[#17171e]">
      {/* Sidebar */}
      {/* <aside className="w-64 flex-shrink-0 h-full overflow-y-auto">
        <Sidebar />
      </aside> */}

      {/* Main */}
      <main className="flex-1 overflow-y-auto px-10 py-8 space-y-8">
        <h2 className="text-3xl font-bold text-gray-100 mb-4">Leaderboards</h2>
        {loading ? (
          <div className="text-gray-400">Loading leaderboards...</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
            {sections.map((sec) => (
              <div
                key={sec.title}
                className="bg-[#222233] rounded-2xl shadow-lg p-6 flex flex-col"
              >
                <h3 className="text-xl font-semibold text-gray-100 mb-4">
                  {sec.title}
                </h3>
                {sec.data.length > 0 ? (
                  renderList(sec.data)
                ) : sec.title === "Daily Top" ? (
                  <div className="text-gray-400 italic">No one has started work today.</div>
                ) : (
                  <div className="text-gray-400 italic">No data available.</div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
