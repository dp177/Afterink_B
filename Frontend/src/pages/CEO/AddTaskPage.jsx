import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import axios from "../../utils/axios";

export default function AddTaskPage() {
  const [members, setMembers] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch all freelancers & founding members
 useEffect(() => {
  axios
    .get("/api/tasks/all-names", { withCredentials: true }) // Add this option
    .then(res => setMembers(res.data.members || []))
    .catch(() => setMembers([]));
}, []);

  const toggleMember = id => {
    setAssignedTo(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await axios.post("/api/tasks/create", {
        title,
        description,
        assignedTo
      });
      setSuccess("Task created successfully!");
      setTitle("");
      setDescription("");
      setAssignedTo([]);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="flex h-screen bg-[#17171e]">
      {/* <aside className="w-64 flex-shrink-0 h-full overflow-y-auto">
        <Sidebar />
      </aside> */}
      <main className="flex-1 overflow-y-auto p-8">
        <h2 className="text-2xl font-bold text-gray-100 mb-6">Add New Task</h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-[#222233] p-6 rounded-2xl shadow-lg"
        >
          {error && (
            <div className="text-red-400 bg-red-900/20 p-2 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-400 bg-green-900/20 p-2 rounded">
              {success}
            </div>
          )}

          <div>
            <label className="block text-gray-200 mb-1">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full bg-[#1f1f2d] border border-[#343454] px-3 py-2 rounded-lg text-gray-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-200 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[#1f1f2d] border border-[#343454] px-3 py-2 rounded-lg text-gray-100 focus:outline-none"
            />
          </div>

          <div>
            <span className="block text-gray-200 mb-1">Assign To</span>
            <div className="max-h-40 overflow-y-auto bg-[#1f1f2d] border border-[#343454] rounded-lg p-2">
              {members.map(m => (
                <label
                  key={m._id}
                  className="flex items-center gap-2 mb-2 text-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={assignedTo.includes(m._id)}
                    onChange={() => toggleMember(m._id)}
                    className="form-checkbox h-4 w-4 text-blue-500 rounded focus:ring-0"
                  />
                  {m.name} <span className="text-xs text-gray-400">({m.role})</span>
                </label>
              ))}
              {members.length === 0 && (
                <div className="text-gray-400 text-sm">No members available</div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
          >
            Create Task
          </button>
        </form>
      </main>
    </div>
  );
}
