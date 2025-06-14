import React, { useState } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";

export default function AddUserPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "freelancer",
  });
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(formData);
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData,
        { withCredentials: true }
      );

      console.log(res);
      setMessage("User created successfully.");
      setFormData({ name: "", email: "", password: "", role: "freelancer" });

      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage("Failed to create user.");
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f0f1a] text-white">
      {/* <Sidebar /> */}
      <div className="flex-1 p-10">
        <h2 className="text-3xl font-bold mb-8 text-white">Add New User</h2>

        <div className="bg-[#151526] p-10 rounded-2xl shadow-xl w-full max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-[#1e1e2f] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2962ff]"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-[#1e1e2f] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2962ff]"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-[#1e1e2f] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2962ff]"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-[#1e1e2f] text-white focus:outline-none focus:ring-2 focus:ring-[#2962ff]"
              >
                <option value="freelancer">Freelancer</option>
                <option value="founding_member">Founding Member</option>
                <option value="ceo">CEO</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-[#2962ff] hover:bg-[#3b7bff] py-3 rounded-lg text-white font-semibold text-lg transition-colors duration-200"
            >
              Create User
            </button>

            {message && (
              <p
                className={`mt-4 text-sm text-center ${
                  message === "User created successfully."
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
