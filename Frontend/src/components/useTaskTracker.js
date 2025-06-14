import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

export function useTaskTracker({ onStatusChange }) {
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [status, setStatus] = useState('Not Started');
  const [uptime, setUptime] = useState(0); // in seconds

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // ⏱ Start timer
  const startTimer = () => {
    startTimeRef.current = new Date();
    timerRef.current = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);
  };

  // 🛑 Stop timer
  const stopTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  // 🚀 Start task
  const startTask = async (taskId) => {
    try {
      await axios.post('http://localhost:5000/api/time/start', { taskId }, { withCredentials: true });
      setActiveTaskId(taskId);
      setStatus('In Progress');
      setUptime(0);
      startTimer();
      onStatusChange(taskId, 'In Progress'); // Propagate the status change to parent component
    } catch (err) {
      console.error("Error starting task:", err);
    }
  };

  // ✋ Hold task
  const holdTask = async () => {
    if (activeTaskId) {
      try {
        await axios.post('http://localhost:5000/api/time/hold', { taskId: activeTaskId }, { withCredentials: true });
        setStatus('Hold');
        stopTimer();
        onStatusChange(activeTaskId, 'Hold'); // Propagate the status change to parent component
      } catch (err) {
        console.error("Error holding task:", err);
      }
    }
  };

  // ✅ Complete task
  const completeTask = async () => {
    if (activeTaskId) {
      try {
        await axios.post('http://localhost:5000/api/time/complete', { taskId: activeTaskId }, { withCredentials: true });
        setStatus('Completed');
        stopTimer();
        onStatusChange(activeTaskId, 'Completed'); // Propagate the status change to parent component
      } catch (err) {
        console.error("Error completing task:", err);
      }
    }
  };

  // 🧠 Auto-hold on tab close
  useEffect(() => {
    const handleUnload = () => {
      if (activeTaskId && status === 'In Progress') {
        navigator.sendBeacon('/api/time/hold', JSON.stringify({ taskId: activeTaskId }));
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [activeTaskId, status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopTimer();
  }, []);

  return {
    activeTaskId,
    status,
    uptime,
    startTask,
    holdTask,
    completeTask
  };
}
