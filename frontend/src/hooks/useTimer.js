import { useState, useEffect } from 'react';

export const useTimer = (startTime = null, isRunning = false) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    // If startTime is provided, calculate elapsed seconds from that time
    if (startTime) {
      const elapsed = Math.floor((new Date() - new Date(startTime)) / 1000);
      setSeconds(Math.max(0, elapsed));
    }
  }, [startTime, isRunning]);

  // Auto-increment timer every second if running
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const reset = () => setSeconds(0);

  return {
    seconds,
    formatted: formatTime(seconds),
    reset,
  };
};
