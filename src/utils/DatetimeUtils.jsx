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