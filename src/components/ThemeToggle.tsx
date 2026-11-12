"use client";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
export function ThemeToggle() {
  const { theme, handleThemeSwitch } = useTheme();

  return (
    <button
      onClick={handleThemeSwitch}
      aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
      className="font-mono text-xs uppercase tracking-[0.25em] hover:cursor-pointer"
    >
      {theme === "dark" ? <Sun size={30} className="h-5 w-5" /> : <Moon size={30} className="h-5 w-5" />}
    </button>
  );
}