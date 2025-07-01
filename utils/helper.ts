export const calculateCurrentTimeYPosition = (
  upperBoundTime: number,
  lowerBoundTime: number,
  currentTimeMinutes: number,
  topMargine: number = 10,
  bottomMargine: number = 10
): number => {
  // Calculate position based on current time
  const upperMinutes = upperBoundTime;
  const lowerMinutes = lowerBoundTime;
  const currentMinutes = currentTimeMinutes;
  // Handle day wrap-around (e.g., if lowerBound is next day)
  const totalMinutes =
    lowerMinutes > upperMinutes
      ? lowerMinutes - upperMinutes
      : 24 * 60 - upperMinutes + lowerMinutes;

  let elapsedMinutes;
  if (lowerMinutes > upperMinutes) {
    // Normal case (8:00 to 20:00)
    elapsedMinutes = currentMinutes - upperMinutes;
  } else {
    // end time is the next day of start time (Time range crosses midnight)
    if (currentMinutes >= upperMinutes) {
      // current time is in the same day as start time
      elapsedMinutes = currentMinutes - upperMinutes;
    } else {
      // current time is in the same day as end time
      elapsedMinutes = 24 * 60 - upperMinutes + currentMinutes;
    }
  }
  // make sure elapsed minutes is in valid range
  elapsedMinutes = Math.max(0, Math.min(elapsedMinutes, totalMinutes));

  // Calculate position (0 = top, 1 = bottom)
  const progress = elapsedMinutes / totalMinutes;

  // Convert to screen coordinates (accounting for body height)
  const screenHeight = window.innerHeight;
  const bodyHeight = 4; // Thin horizontal line

  return topMargine + progress * (screenHeight - topMargine - bottomMargine);
};

// ----------- task visual generator-----------
// TODO:  conditionally switch params for creating matters Body
// will need a decision function, depends on duration, category, ...
// and this condition will be extracted by Gemini', returning JSON ,...
export const getShapeColor = (shape: string): string => {
  const colors = {
    Ball: ["#ff6b6b", "#ff8e53", "#ff6b9d", "#c44569", "#88ebeb"],
    Rectangle: ["#4ecdc4", "#45aaf2", "#26de81", "#2bcbba"],
    Pentagon: ["#45b7d1", "#96ceb4", "#ffeaa7", "#dda0dd"],
  };
  const shapeColors = colors[shape as keyof typeof colors] || colors.Ball;
  return shapeColors[Math.floor(Math.random() * shapeColors.length)];
};

export const chooseShape = (shapeName: string) => {
  /*
    TODO: move the choose shape and return the confige params mechanism from task object to here
    in order to clean-up component code
    */
  return;
};
// colors to choose comes here
// Non-MVP: user choose color from a palette
export const taskColor = ["#c2fcd9"];

// obj area calculator
export const timeToArea = (
  startTime: number,
  endTime: number,
  upperBound: number,
  lowerBound: number
) => {
  /*
    TODO: consider the screen size (maybe query the device), 
    the area response to total available time (e.g.: total available is 6 hour, task time takes 3 hours, then the object should have approximately 1/2 area of the container's white space)
    */

  return;
};

/**
 * Converts an ISO date string to YY-MM-DD format.
 * @param isoString The date string from Supabase (e.g., '2025-07-01T14:05:52.098901+00:00')
 * @returns A formatted string 'YY-MM-DD' (e.g., '25-07-01')
 */
export const formatToYYMMDD = (isoString?: string): string => {
  // 1. Create a Date object. The ISO format is parsed natively.
  let date;
  if (isoString) {
    date = new Date(isoString);
  } else {
    date = new Date();
  }
  // 2. Get the last two digits of the year.
  const year = date.getFullYear().toString().slice(-2);
  // 3. Get the month. **IMPORTANT**: getMonth() is 0-indexed (0=Jan, 11=Dec), so we add 1.
  // We then use padStart to ensure it's always two digits (e.g., '07' instead of '7').
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  // 4. Get the day of the month and pad it to two digits.
  const day = date.getDate().toString().padStart(2, "0");
  // 5. Join them with hyphens.
  return `${year}-${month}-${day}`;
};
