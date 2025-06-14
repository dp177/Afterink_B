import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const FreelancerAnalysis = () => {
  const [freelancers, setFreelancers] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/dashboard/overview", { withCredentials: true })
      .then((res) => {
        const tasks = res.data.data;
        const stats = {};

        tasks.forEach((task) => {
          const title = task.title;

          // Total Stats
          task.totalStats.forEach((person) => {
            if (
  person.name?.startsWith("freelancer") ||
  person.name?.startsWith("founding_member")
)
 {
              if (!stats[person.name])
                stats[person.name] = {
                  name: person.name,
                  totalSeconds: 0,
                  todaySeconds: 0,
                  taskBreakdown: {},
                };

              stats[person.name].totalSeconds += person.seconds;
              if (!stats[person.name].taskBreakdown[title])
                stats[person.name].taskBreakdown[title] = { total: 0, today: 0 };
              stats[person.name].taskBreakdown[title].total += person.seconds;
            }
          });

          // Daily Stats
          task.dailyStats.forEach((person) => {
           if (
  person.name?.startsWith("freelancer") ||
  person.name?.startsWith("founding_member")
)
{
              if (!stats[person.name])
                stats[person.name] = {
                  name: person.name,
                  totalSeconds: 0,
                  todaySeconds: 0,
                  taskBreakdown: {},
                };

              stats[person.name].todaySeconds += person.seconds;
              if (!stats[person.name].taskBreakdown[title])
                stats[person.name].taskBreakdown[title] = { total: 0, today: 0 };
              stats[person.name].taskBreakdown[title].today += person.seconds;
            }
          });
        });

        const formatted = Object.values(stats).map((f) => ({
          ...f,
          totalHours: +(f.totalSeconds / 3600).toFixed(2),
          todayHours: +(f.todaySeconds / 3600).toFixed(2),
          taskBreakdownMinutes: Object.fromEntries(
            Object.entries(f.taskBreakdown).map(([task, times]) => [
              task,
              {
                total: +(times.total / 60).toFixed(1),
                today: +(times.today / 60).toFixed(1),
              },
            ])
          ),
        }));

        setFreelancers(formatted);
      });
  }, []);

  const barChartData = {
    labels: freelancers.map((f) => f.name),
    datasets: [
      {
        label: "Total Hours",
        data: freelancers.map((f) => f.totalHours),
        backgroundColor: "rgba(59,130,246,0.7)",
      },
      {
        label: "Today Hours",
        data: freelancers.map((f) => f.todayHours),
        backgroundColor: "rgba(234,88,12,0.7)",
      },
    ],
  };

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Freelancer Deep Analysis</h2>

      <div className="bg-gray-800 p-4 rounded-xl mb-6">
        <h3 className="text-xl mb-2">Total vs Today Work (Hours)</h3>
        <Bar data={barChartData} />
      </div>

      {freelancers.map((freelancer, idx) => {
        const taskData = Object.entries(freelancer.taskBreakdownMinutes);
        const rowTotal = taskData.reduce(
          (acc, [_, { total, today }]) => {
            acc.total += total;
            acc.today += today;
            return acc;
          },
          { total: 0, today: 0 }
        );

        const pieData = {
          labels: taskData.map(([task]) => task),
          datasets: [
            {
              data: taskData.map(([_, v]) => v.total),
              backgroundColor: [
                "#60A5FA", "#F87171", "#FBBF24", "#34D399", "#A78BFA", "#F472B6",
              ],
            },
          ],
        };

        return (
          <div
            key={idx}
            className="bg-gray-800 p-6 rounded-xl mb-8 shadow-md border border-gray-700"
          >
            <h3 className="text-xl font-semibold mb-2">{freelancer.name}</h3>
            <p>Total Hours: {freelancer.totalHours}</p>
            <p>Today Hours: {freelancer.todayHours}</p>

            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div>
                <h4 className="font-medium mb-2">Task Breakdown (mins)</h4>
                <table className="w-full text-sm text-white border border-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-3 py-1">Task</th>
                      <th className="px-3 py-1">Today (min)</th>
                      <th className="px-3 py-1">Total (min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taskData.map(([task, { today, total }], i) => (
                      <tr key={i} className="border-t border-gray-600">
                        <td className="px-3 py-1">{task}</td>
                        <td className="px-3 py-1">{today}</td>
                        <td className="px-3 py-1">{total}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-800 font-semibold border-t border-gray-600">
                    <tr>
                      <td className="px-3 py-1 text-right">Total</td>
                      <td className="px-3 py-1">{rowTotal.today.toFixed(1)}</td>
                      <td className="px-3 py-1">{rowTotal.total.toFixed(1)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div>
                <h4 className="font-medium mb-2">Time Distribution (Pie)</h4>
                <Pie data={pieData} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FreelancerAnalysis;
