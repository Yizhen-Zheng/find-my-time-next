import { Task } from "./types";

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

//------------------ generate obj optinos ------------------
// colors to choose comes here
// Color palette - soft, natural colors with lower saturation
const colorPalette = {
  coral: "#FFB3B3",
  sage: "#B3E6B3",
  lavender: "#C9B3FF",
  peach: "#FFD9B3",
  sky: "#99DDFF",
  sand: "#F2D9B3",
  mint: "#B3F2D9",
  blush: "#FFB3D9",
  periwinkle: "#B3B3FF",
  butter: "#FFF2B3",
};
const shapes = ["Ball", "Pentagon", "Rectangle", "Triangle"] as const;
type ShapeType = (typeof shapes)[number];

interface TaskObjectOptions {
  shapeType: ShapeType;
  size: {
    radius?: number;
    width?: number;
    height?: number;
  };
  restitution: number;
  friction: number;
  frictionAir: number;
  density: number;
  render: {
    fillStyle: string;
    strokeStyle: string;
    lineWidth: number;
  };
}
/**
 * Calculate the size of the object based on task duration and screen size
 * @param duration - Task duration in minutes
 * @param screenWidth - Screen width in pixels
 * @param screenHeight - Screen height in pixels
 * @returns Size object with radius or width/height
 */
export function calculateTaskSize(
  duration: number = 60, // default 1 hour
  screenWidth: number,
  screenHeight: number
): { radius?: number; width?: number; height?: number } {
  // Base size calculation: duration as percentage of 24 hours (1440 minutes)
  const dayMinutes = 1440;
  const durationRatio = Math.min(duration / dayMinutes, 1); // Cap at 100% of day

  // Calculate base size relative to screen dimensions
  // Using smaller dimension to ensure objects fit well on mobile
  const screenMin = Math.min(screenWidth, screenHeight);
  const baseSize = screenMin * 0.45; // 5% of smaller screen dimension as minimum
  const maxSize = screenMin * 0.25; // 25% of smaller screen dimension as maximum

  // Scale size based on duration
  const scaledSize = baseSize + (maxSize - baseSize) * Math.sqrt(durationRatio);

  return {
    radius: scaledSize / 2,
    width: scaledSize,
    height: scaledSize,
  };
}

/**
 * Calculate opacity based on due date proximity
 * @param dueDate - Due date string
 * @returns Opacity value between 0.3 and 1
 */
export function calculateOpacityFromDueDate(dueDate?: string): number {
  if (!dueDate) return 0.8; // Default opacity

  const now = new Date();
  const due = new Date(dueDate);
  const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

  // If overdue, maximum opacity
  if (diffHours < 24) return 1;

  // Map hours to opacity: 0-24h = 1-0.8, 24-72h = 0.8-0.6, 72h+ = 0.6-0.3
  if (diffHours <= 24) {
    return 1 - (diffHours / 24) * 0.2;
  } else if (diffHours <= 72) {
    return 0.8 - ((diffHours - 24) / 48) * 0.2;
  } else {
    return Math.max(0.3, 0.6 - ((diffHours - 72) / 168) * 0.3);
  }
}

/**
 * Calculate density based on creation date
 * @param createdAt - Creation date string
 * @returns Density value between 0.5 and 1.5
 */
export function calculateDensityFromCreatedAt(createdAt?: string): number {
  if (!createdAt) return 1; // Default density

  const now = new Date();
  const created = new Date(createdAt);
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

  // Older tasks have higher density (sink more)
  // 0 days = 0.5, 7+ days = 1.5
  const density = 0.5 + Math.min(diffDays / 7, 1);
  return density;
}

/**
 * Get color based on task type with opacity
 * @param taskType - Type of task
 * @param opacity - Opacity value
 * @returns RGBA color string
 */
export function getTaskColor(taskType?: string, opacity: number = 1): string {
  const colorKeys = Object.keys(colorPalette);
  let colorKey: string;

  if (taskType) {
    // Use task type to consistently select color

    const hash = taskType
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    colorKey = colorKeys[hash % colorKeys.length];
    colorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
  } else {
    // Random color if no task type
    colorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
  }

  const hexColor = colorPalette[colorKey as keyof typeof colorPalette];
  return hexColor;
  // Convert hex to RGBA
  // const r = parseInt(hexColor.slice(1, 3), 16);
  // const g = parseInt(hexColor.slice(3, 5), 16);
  // const b = parseInt(hexColor.slice(5, 7), 16);

  // return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Main helper function to generate task object options
 * @param task - Task object
 * @param screenWidth - Screen width
 * @param screenHeight - Screen height
 * @returns Complete options for creating Matter.js body
 */
export function getTaskObjectOptions(
  task: Task,
  screenWidth: number = window.innerWidth,
  screenHeight: number = window.innerHeight
): TaskObjectOptions {
  // Determine shape (random for now as requested)
  const shapeType = shapes[Math.floor(Math.random() * shapes.length)];

  // Calculate size based on duration
  const size = calculateTaskSize(task.duration, screenWidth, screenHeight);

  // Calculate opacity based on due date
  const opacity = calculateOpacityFromDueDate(task.dueDate);

  // Calculate density based on creation date
  const density = calculateDensityFromCreatedAt(task.createdAt);

  // Get color with opacity
  const fillColor = getTaskColor(task.taskType, opacity);

  // Physics properties can vary slightly based on importance
  const importanceModifier =
    task.importance === "high" ? 1.2 : task.importance === "low" ? 0.8 : 1;

  return {
    shapeType,
    size,
    restitution: 0.6 * importanceModifier,
    friction: 0.3,
    frictionAir: 0.01 / importanceModifier, // Higher importance = less air friction
    density,
    render: {
      fillStyle: fillColor,
      strokeStyle: "rgba(0, 0, 0, 0.2)", // Soft border
      lineWidth: 1,
    },
  };
}

//------------------ generate obj optinos ------------------

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

//sort tasks in ascending order so that taskStack can pop from last
export const sortTasks = (rawTasks: Task[]): Task[] => {
  //
  const importanceMap: { [key: string]: number } = {
    High: 3,
    Medium: 2,
    Low: 1,
  };
  const sortedTasks = rawTasks.sort((a, b) => {
    // 1, sorted by importance, ascending
    const importanceA = importanceMap[a.importance || "Low"];
    const importanceB = importanceMap[b.importance || "Low"];
    if (importanceA !== importanceB) {
      return importanceA - importanceB;
    }
    //2, sort by duration if same importance, ascending
    const durationA = a.duration || 0;
    const durationB = b.duration || 0;
    if (durationA !== durationB) {
      return durationA - durationB;
    }
    // 3. If both are the same, sort by dueDate (descending)
    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    return dateB - dateA;
  });
  console.log(rawTasks);
  console.log(sortedTasks);
  return sortedTasks;
};
