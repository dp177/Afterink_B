import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiAward } from "react-icons/fi";

export default function TopPerformerCard() {
  const [top, setTop] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/dashboard/leaderboard/daily", {
        withCredentials: true,
      })
      .then((res) => {
        const data = res.data;
        if (data.leaderboard && data.leaderboard.length > 0) {
          setTop(data.leaderboard[0]);
        }
      })
      .catch((err) => {
        console.error("Failed to load leaderboard", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-800 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-800 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-800 rounded"></div>
              <div className="h-4 bg-gray-800 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!top) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 flex flex-col items-center justify-center min-h-[200px]">
        <FiAward className="text-gray-600 text-3xl mb-2" />
        <p className="text-gray-400 text-center">No top performer data available</p>
        <button
          onClick={handleGoBack}
          className="mt-4 flex items-center justify-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
        >
          <FiArrowLeft className="mr-2" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-800 shadow-xl w-full max-w-md mx-auto">
      <div className="flex justify-between items-start mb-4">
        <button
          onClick={handleGoBack}
          className="flex items-center justify-center p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors duration-200"
          aria-label="Go back"
        >
          <FiArrowLeft className="text-white" />
        </button>
        <h2 className="text-white text-xl font-bold text-center flex-1">
          <span className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 text-transparent bg-clip-text">
            🥇 Today's Top Performer
          </span>
        </h2>
        <div className="w-8"></div> {/* Spacer for balance */}
      </div>

      <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white font-bold">
              {top.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-white truncate">{top.name}</p>
            <p className="text-sm text-gray-300 capitalize">
              {top.role.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>

      

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleGoBack}
          className="flex items-center justify-center px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
        >
          <FiArrowLeft className="mr-2" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}