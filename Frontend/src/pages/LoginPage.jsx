import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axios";
import logo from "../assets/logo.png"; // Adjust path to your logo

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();

  // ✅ Auto redirect based on role
  useEffect(() => {
    if (!user) return;
    if (user.role === "ceo") {
      navigate("/ceo/dashboard");
    } else if (user.role === "founding_member") {
      navigate("/founding/tasks");
    }
  }, [user, navigate]);

  // ✅ Handle login submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBtnLoading(true);
    try {
      const res = await axios.post("/api/auth/login", { email, password }, { withCredentials: true });
      login(res.data.user); // this updates context & triggers redirect
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Login failed");
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#15151b] relative overflow-hidden">
      {/* Subtle background dots */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg className="w-full h-full" width="100%" height="100%">
          <defs>
            <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#2a2a35" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <form
        onSubmit={handleSubmit}
        className="z-10 w-full max-w-md mx-auto rounded-2xl shadow-2xl p-8 backdrop-blur-xl bg-gradient-to-br from-[#1a1b23] to-[#20212a] border border-[#24243a]/60 relative"
        style={{
          boxShadow: "0 4px 32px 0 rgba(30,30,50,0.45), 0 1.5px 5px 0 rgba(0,0,0,0.18)",
        }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img
            src={logo}
            alt="AfterInk Logo"
            className="w-14 h-14 rounded-xl border border-[#34354a] shadow-lg bg-[#23233b] p-2"
          />
        </div>

        {/* Headings */}
        <h1 className="text-center text-2xl font-semibold text-gray-100">Welcome to AfterInk</h1>
        <p className="text-center text-gray-400 text-sm mb-6">Creative Agency Dashboard</p>

        {/* Error */}
        {error && (
          <p className="text-red-500 mb-4 text-center text-sm">{error}</p>
        )}

        {/* Email Input */}
        <div className="mb-4">
          <label className="text-gray-300 text-sm mb-1 block">Email</label>
          <div className="relative">
            <input
              type="email"
              autoFocus
              required
              placeholder="Enter your email address..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#191923] border border-[#28283c] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#76aaff] transition"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76aaff]">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 4h16v16H4z" />
                <path d="M22 6.5l-10 7L2 6.5" />
              </svg>
            </span>
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label className="text-gray-300 text-sm mb-1 block">Password</label>
          <input
            type="password"
            required
            placeholder="Enter your password..."
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-[#191923] border border-[#28283c] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#76aaff] transition"
          />
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={btnLoading}
          className="w-full py-2 rounded-lg bg-[#76aaff] hover:bg-[#4e77e8] text-gray-900 font-semibold text-base shadow-lg transition disabled:opacity-50"
        >
          {btnLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
