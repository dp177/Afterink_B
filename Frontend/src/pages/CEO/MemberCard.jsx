import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";

const roleConfig = {
  ceo: { color: "bg-purple-600", icon: "💼" },
  founding_member: { color: "bg-green-600", icon: "🛠️" },
  freelancer: { color: "bg-blue-600", icon: "👨‍💻" },
};

const formatHMS = (sec = 0) => {
  const h = Math.floor(sec / 3600).toString().padStart(2, "0");
  const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
};

export default function MemberCard({ member, isOpen, onToggle }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    axios
      .get(`/api/tasks/analytics/user/${member._id}`)
      .then((res) => setStats(res.data.data || []))
      .catch(() => setStats([]))
      .finally(() => setLoading(false));
  }, [isOpen, member._id]);

  const cfg = roleConfig[member.role] || roleConfig.freelancer;

  return (
    <div className="flex flex-col">
      <div
        onClick={onToggle}
        className={`flex items-center bg-[#222233] rounded-2xl shadow-lg p-4 cursor-pointer border border-[#292947] transition ${
          isOpen ? "ring-2 ring-blue-500" : "hover:shadow-xl"
        }`}
      >
        <span className={`${cfg.color} text-white rounded-full p-2 text-xl`}>
          {cfg.icon}
        </span>
        <div className="ml-4">
          <h3 className="text-lg text-gray-100 font-semibold">{member.name}</h3>
          <p className="text-sm text-gray-400">{member.email}</p>
        </div>
      </div>

      {isOpen && (
        <div className="bg-[#1f1f2d] rounded-b-2xl border border-t-0 border-[#292947] mt-0 p-6 space-y-4">
          {loading ? (
            <div className="text-gray-400">Loading analytics…</div>
          ) : (
            <>
              <h4 className="text-lg text-gray-100 font-semibold">
                Task Breakdown
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-200">
                  <thead>
                    <tr className="border-b border-[#343454]">
                      <th className="py-2 px-4">Task</th>
                      <th className="py-2 px-4">Today</th>
                      <th className="py-2 px-4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((t) => (
                      <tr key={t.title} className="border-b border-[#343454]">
                        <td className="py-2 px-4">{t.title}</td>
                        <td className="py-2 px-4">
                          {formatHMS(t.todayDuration)}
                        </td>
                        <td className="py-2 px-4">
                          {formatHMS(t.totalDuration)}
                        </td>
                      </tr>
                    ))}
                    {stats.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="text-center text-gray-400 py-4"
                        >
                          No tasks recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
