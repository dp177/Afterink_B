import React from "react";
import { Outlet } from "react-router-dom";
import FoundingSidebar from "./FoundingSidebar";

export default function FoundingLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar: fixed width, vertical layout */}
      <FoundingSidebar className="flex-shrink-0" />

      {/* Main content: takes the remaining space */}
      <main className="flex-1 p-6 bg-gray-900 text-white overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
