// Helper function to convert timestamp to milliseconds from session start
export const getTimeFromStart = (timestamp: string, sessionStartTime: string): number => {
  // Ensure both timestamps are treated consistently
  const eventTime = new Date(timestamp).getTime();
  
  // If session start time doesn't have timezone info, assume it's UTC
  const normalizedStartTime = sessionStartTime.includes('+') || sessionStartTime.includes('Z') 
    ? sessionStartTime 
    : sessionStartTime + '+00:00';
    
  const startTime = new Date(normalizedStartTime).getTime();
  return eventTime - startTime;
};

export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
  return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
};

export const parseTimestamp = (timestamp: string): Date => {
  return new Date(timestamp);
};