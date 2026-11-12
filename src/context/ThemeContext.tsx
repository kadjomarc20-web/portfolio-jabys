"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  handleThemeSwitch: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Le thème est lu directement sur <html class="dark"> (posé par le script du
// layout avant l'affichage). On s'abonne aux changements de cette classe.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

const getTheme = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

// Côté serveur, on ne connaît pas le choix du visiteur : thème clair par défaut
const getServerTheme = (): Theme => "light";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);

  const handleThemeSwitch = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
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
