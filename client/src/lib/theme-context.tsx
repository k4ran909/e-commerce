import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type ThemePreference = "light" | "dark" | "system";

type ThemeContextValue = {
  preference: ThemePreference;
  activeTheme: "light" | "dark"; // resolved theme after considering system
  setPreference: (pref: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "themePreference";

function getInitialPreference(): ThemePreference {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system"; // default to system for better first-load UX
}

function resolveActive(pref: ThemePreference, mqlDark: MediaQueryList | null): "light" | "dark" {
  if (pref === "system") {
    return mqlDark && mqlDark.matches ? "dark" : "light";
  }
  return pref;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPrefState] = useState<ThemePreference>(getInitialPreference);
  const mqlRef = useRef<MediaQueryList | null>(null);
  const [systemDark, setSystemDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  // Set up media query listener for system changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      mqlRef.current = mql;
      const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    } catch {}
  }, []);

  // Persist preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, preference);
    } catch {}
  }, [preference]);

  const activeTheme = useMemo<"light" | "dark">(() => {
    return resolveActive(preference, mqlRef.current);
  }, [preference, systemDark]);

  // Apply theme class to root element
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", activeTheme === "dark");
  }, [activeTheme]);

  const updatePreference = (pref: ThemePreference) => setPrefState(pref);

  const value: ThemeContextValue = { preference, activeTheme, setPreference: updatePreference };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
