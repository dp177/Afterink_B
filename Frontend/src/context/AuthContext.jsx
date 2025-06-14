import { createContext, useContext, useState, useEffect } from "react";
import axios from "../utils/axios";
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
    
useEffect(() => {
  try {
    const stored = localStorage.getItem("user");
    if (stored && stored !== "undefined") {
      setUser(JSON.parse(stored));
    }
  } catch (err) {
    console.error("Failed to parse user from localStorage:", err);
    localStorage.removeItem("user"); // optional: clear bad value
  }
  setLoading(false);
}, []);

  



  const login = (userInfo) => {
    setUser(userInfo);
    localStorage.setItem("user", JSON.stringify(userInfo));
  };

  
const logout = async () => {
  await axios.post("/api/auth/logout");
  setUser(null);
  localStorage.removeItem("user");
};
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
