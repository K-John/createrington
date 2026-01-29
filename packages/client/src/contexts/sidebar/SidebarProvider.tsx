import React, { useState, ReactNode } from "react";
import { SidebarContext } from "./context";

export interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, setIsCollapsed, toggleCollapsed }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
