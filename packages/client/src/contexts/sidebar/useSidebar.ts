import { useContext } from "react";
import { SidebarContextType } from "./SidebarProvider";
import { SidebarContext } from "./context";

export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
