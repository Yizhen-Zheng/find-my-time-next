import { createContext } from "react";
import { ActiveTaskContextType } from "@/utils/types";
export const ActiveTaskContext = createContext<ActiveTaskContextType | null>(
  null
);
