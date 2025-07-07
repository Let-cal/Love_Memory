// components/providers/sidebar-context.tsx
"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface SidebarContextType {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  toggleExpanded: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
  defaultExpanded?: boolean;
}

export function SidebarProvider({
  children,
  defaultExpanded = false,
}: SidebarProviderProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [mounted, setMounted] = useState(false);

  // Handle hydration and localStorage
  useEffect(() => {
    setMounted(true);

    // Check localStorage for persisted state
    const savedState = localStorage.getItem("sidebar-expanded");
    if (savedState !== null) {
      setExpanded(JSON.parse(savedState));
    }
  }, []);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("sidebar-expanded", JSON.stringify(expanded));
    }
  }, [expanded, mounted]);

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  const value = {
    expanded,
    setExpanded,
    toggleExpanded,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
