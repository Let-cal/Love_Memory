"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function DebugTheme() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg">
      <p>Current Theme: {theme}</p>
      <p>Resolved Theme: {resolvedTheme}</p>
    </div>
  );
}
