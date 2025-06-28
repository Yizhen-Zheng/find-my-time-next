import { World } from "matter-js";
import { createContext } from "react";
import { MatterContextType } from "@/utils/types";
export const MatterContext = createContext<MatterContextType | null>(null);
//potentially need split canvas and world seperately
