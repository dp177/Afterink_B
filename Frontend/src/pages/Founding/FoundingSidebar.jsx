import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png"; // Adjust path if needed
import { FaTachometerAlt, FaUserPlus, FaTasks } from "react-icons/fa"; // Importing icons for better visuals

const links = [
  { to: "/founding/tasks", label: "My Tasks", icon: <FaTasks /> },
  { to: "/founding/add-user", label: "Add Freelancer", icon: <FaUserPlus /> },
];

export default function FoundingSidebar() {
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(true); // State for sidebar visibility

  // Toggle sidebar open/close
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <aside className={`h-screen ${isOpen ? "w-64" : "w-16"} bg-gray-950 border-r border-gray-800 text-white flex flex-col transition-all duration-300`}>
      {/* Logo Section */}
      <div className="flex items-center justify-between gap-3 px-6 py-8">
        <img src={logo} alt="Logo" className="w-10 h-10 rounded-lg" />
        {isOpen && <span className="text-xl font-bold tracking-wide">AfterInk FM</span>}
        <button
          onClick={toggleSidebar}
          className="text-white text-xl ml-auto"
        >
          {isOpen ? "❮" : "❯"} {/* Toggle arrow for open/close */}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 flex flex-col gap-2 px-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-2 rounded-lg font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            {isOpen && <span>{link.label}</span>} {/* Show label if sidebar is open */}
          </NavLink>
        ))}
      </nav>

      {/* Logout Section */}
      <div className="px-6 py-6 mt-auto border-t border-gray-800">
        <div className="flex items-center justify-between gap-2 text-sm">
          {isOpen && <span className="text-gray-400">{user?.name}</span>}
          <button
            onClick={logout}
            className="text-red-500 font-semibold hover:underline"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
