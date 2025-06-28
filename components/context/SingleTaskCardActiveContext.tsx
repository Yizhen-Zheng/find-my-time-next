import { createContext } from "react";
import { SingleTaskCardActiveContextType } from "@/utils/types";

export const SingleTaskCardActiveContext =
  createContext<SingleTaskCardActiveContextType | null>(null);
// used for components to share active window(which is being edited or deleted)
// MAYBE: assume there'll be only one layer of popup, and popups share one UI(the container pop up)?
// seems currently only single-task-detailed-info need this popup
