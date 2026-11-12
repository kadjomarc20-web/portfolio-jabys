"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  handleThemeSwitch: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  // Au montage : on lit l'état déjà appliqué par le script du layout
  useEffect(() => {
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light"
    );
  }, []);

  const handleThemeSwitch = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* stockage indisponible (navigation privée, etc.) */
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, handleThemeSwitch }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook pratique + garde-fou si on l'utilise hors du Provider
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme doit être utilisé dans un ThemeProvider");
  return ctx;
}