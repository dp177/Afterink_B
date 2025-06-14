import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";

// CEO pages
import Dashboard from "./pages/CEO/Dashboard";
import Leaderboard from "./pages/CEO/Leaderboard";
import AddTaskPage from "./pages/CEO/AddTaskPage";
import AddUserPage from "./pages/CEO/AddUserPage";
import TopPerfomancePage from "./pages/TopPerfomancePage";
import CEOTasks from "./pages/CEO/CEOTasks";
import CEOLayout from "./pages/CEOLayout";
import CEOProfile from "./pages/CEO/CEOProfile";
// Founding-member layout & pages
import FoundingLayout from "./pages/Founding/FoundingLayout";
import MyTasks from "./pages/Founding/MyTasks";
import FreelancerAnalysis from "./pages/Founding/FreelancerAnalysis";
import AddFreelancerForm from "./pages/Founding/AddFreelancerForm";
import FoundingProfile from "./pages/Founding/FoundingProfile";
// Route guards
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-white p-10">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function CEOOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-white p-10">Loading...</div>;
  return user?.role === "ceo" ? children : <Navigate to="/login" replace />;
}

function FoundingOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-white p-10">Loading...</div>;
  return user?.role === "founding_member" ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* CEO Routes */}
         import CEOLayout from "./pages/CEO/Layout";

<Route path="/ceo" element={<CEOOnlyRoute><CEOLayout /></CEOOnlyRoute>}>
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="add-task" element={<AddTaskPage />} />
  <Route path="add-user" element={<AddUserPage />} />
  <Route path="leaderboard" element={<Leaderboard />} />
  <Route path="top" element={<TopPerfomancePage />} />
  <Route path="tasks" element={<CEOTasks />} />
    <Route path="profile" element={<CEOProfile />} />
  <Route index element={<Navigate to="dashboard" replace />} />
</Route>

          {/* Founding Member Routes */}
          <Route path="/founding" element={<FoundingOnlyRoute><FoundingLayout /></FoundingOnlyRoute>}>
            <Route path="tasks" element={<MyTasks />} />
            <Route path="analysis" element={<FreelancerAnalysis />} />
            <Route path="add-user" element={<AddFreelancerForm />} />
             <Route path="profile" element={<FoundingProfile />} />
            <Route index element={<Navigate to="tasks" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
