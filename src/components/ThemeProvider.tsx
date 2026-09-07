"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
  mounted: false,
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const initRef = useRef(true);

  useEffect(() => {
    if (!initRef.current) return;
    initRef.current = false;

    const stored = (localStorage.getItem("poetly-theme") as Theme) || "system";
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const isDark = stored === "dark" || (stored === "system" && mq.matches);
    const next = isDark ? "dark" : "light";

    document.documentElement.classList.toggle("dark", isDark);
    setThemeState(stored);
    setResolvedTheme(next);
    setMounted(true);

    const handleMediaChange = () => {
      const currentStored = (localStorage.getItem("poetly-theme") as Theme) || "system";
      const newIsDark = currentStored === "dark" || (currentStored === "system" && mq.matches);
      setResolvedTheme(newIsDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", newIsDark);
    };

    mq.addEventListener("change", handleMediaChange);
    return () => mq.removeEventListener("change", handleMediaChange);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("poetly-theme", t);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const isDark = t === "dark" || (t === "system" && mq.matches);
    setResolvedTheme(isDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDark);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}
