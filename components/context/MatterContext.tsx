import { World } from "matter-js";
import { createContext } from "react";
export const MatterContext = createContext<World | null>(null);
//
