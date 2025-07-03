import { createContext } from "react";
import { TaskOnDeleteContextType } from "@/utils/types";
export const TaskOnDeleteContext =
  createContext<TaskOnDeleteContextType | null>(null);
