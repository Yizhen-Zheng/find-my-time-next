import { World } from "matter-js";
import { createContext } from "react";
type MatterContextType = {
  world: World;
  scene: HTMLDivElement;
};
export const MatterContext = createContext<World | null>(null);
//
