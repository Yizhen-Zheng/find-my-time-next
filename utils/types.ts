export interface Task {
  title: string;
  duration?: number;
  taskId?: number; //the id in db
  userId?: number;
}

import { World } from "matter-js";

export type MatterContextType = {
  world: World;
  scene: HTMLDivElement;
};
