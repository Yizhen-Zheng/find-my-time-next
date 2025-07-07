import { createContext } from "react";
import { SingleTaskCardActiveContextType } from "@/utils/types";

export const SingleTaskCardActiveContext =
  createContext<SingleTaskCardActiveContextType | null>(null);
 
