import type { Task } from "../../utils/types";
import { createContext } from "react";
interface TaskContextInterface {
  task: Task;
  currentTime: Date;
}
export const TaskContext = createContext<Task | null>(null);
// used for components to share current active task (which is being edited or deleted)
//
