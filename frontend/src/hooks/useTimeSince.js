import { useState, useEffect } from 'react';

/**
 * Custom hook to calculate time elapsed since a given date string.
 * Updates every 30 seconds.
 */
export const useTimeSince = (dateString) => {
  const [timeSince, setTimeSince] = useState('');

  useEffect(() => {
    if (!dateString) return;

    const calculateTime = () => {
      const now = new Date();
      const past = new Date(dateString);
      const diffInMs = now - past;
      
      const seconds = Math.floor(diffInMs / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
      if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
      if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
      return 'Just now';
    };

    // Initial calculation
    setTimeSince(calculateTime());

    // Update interval (30 seconds)
    const interval = setInterval(() => {
      setTimeSince(calculateTime());
    }, 30000);

    return () => clearInterval(interval);
  }, [dateString]);

  return timeSince;
};
