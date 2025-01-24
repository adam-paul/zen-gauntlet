/**
 * Utility functions for date and time operations
 */

/**
 * Returns the time of day as 'morning', 'afternoon', or 'evening'
 * based on the current hour.
 */
export const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

/**
 * Formats a date into a relative time string (e.g., "2 hours ago")
 * @param {string | Date} date - The date to format
 * @returns {string} A human-readable relative time string
 */
export const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = {
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  return 'just now';
}; 