import { createContext } from "react";
import { MatterContextType } from "@/utils/types";
export const MatterContext = createContext<MatterContextType | null>(null);
