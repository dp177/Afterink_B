import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import { useState } from "react";
import { FaTachometerAlt, FaPlus, FaUserPlus, FaList, FaTasks, FaTrophy } from "react-icons/fa"; // Importing icons

const links = [
  { to: "/ceo/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
  { to: "/ceo/add-task", label: "Add Task", icon: <FaPlus /> },
  { to: "/ceo/add-user", label: "Add User", icon: <FaUserPlus /> },
  { to: "/ceo/leaderboard", label: "Leaderboard", icon: <FaList /> },
  { to: "/ceo/tasks", label: "My-Tasks", icon: <FaTasks /> },
  { to: "/top", label: "Top Performance", icon: <FaTrophy /> }
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(true); // State to control sidebar visibility

  // Toggle sidebar open/close
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className={`h-screen ${isOpen ? "w-64" : "w-16"} bg-[#181824] border-r border-[#25253a] flex flex-col transition-all duration-300`}>
      <div className="flex items-center justify-between gap-3 px-6 py-7">
        <img src={logo} alt="AfterInk" className="w-10 h-10 rounded-lg" />
        {isOpen && (
          <span className="text-xl text-white font-bold tracking-wide">
            AfterInk
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="text-white text-xl ml-auto"
        >
          {isOpen ? "❮" : "❯"} {/* Toggle arrow for open/close */}
        </button>
      </div>
      <nav className="flex-1 flex flex-col gap-1 px-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`block px-5 py-2 rounded-lg font-medium transition ${
              pathname === link.to
                ? "bg-[#232338] text-[#78aaff]"
                : "text-gray-300 hover:bg-[#20202d]"
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-lg">{link.icon}</span>
              {isOpen && <span>{link.label}</span>} {/* Show label if sidebar is open */}
            </div>
          </Link>
        ))}
      </nav>
      <div className="px-6 py-6 mt-auto">
        <div className="flex items-center justify-between gap-2">
          {isOpen && <span className="text-gray-400 text-sm">{user?.name}</span>}
          <button
            className="text-[#fa5252] text-xs font-semibold hover:underline"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
