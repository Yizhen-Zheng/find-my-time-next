import type { Task } from "../../utils/types";
import { createContext } from "react";
export const TaskContext = createContext<Task | null>(null);
// used for components to share current active task (which is being edited or deleted)
