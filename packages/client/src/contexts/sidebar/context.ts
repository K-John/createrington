import { createContext } from "react";
import { SidebarContextType } from "./SidebarProvider";

export const SidebarContext = createContext<SidebarContextType | undefined>(
  undefined,
);
