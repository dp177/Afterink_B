import React, { useState } from "react";
import axios from "../../utils/axios";

export default function AddFreelancerForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "freelancer",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/auth/register", formData);
      setMessage("Freelancer added successfully.");
      setFormData({ name: "", email: "", password: "", role: "freelancer" });
    } catch {
      setMessage("Failed to add freelancer.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Add Freelancer</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full px-4 py-2 bg-gray-800 text-white rounded"
          required
        />
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full px-4 py-2 bg-gray-800 text-white rounded"
          required
        />
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full px-4 py-2 bg-gray-800 text-white rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Freelancer
        </button>
        {message && <p className="text-sm text-green-400 mt-2">{message}</p>}
      </form>
    </div>
  );
}
