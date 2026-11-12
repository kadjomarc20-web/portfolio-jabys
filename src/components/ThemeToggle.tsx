"use client";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, handleThemeSwitch } = useTheme();

  return (
    <button
      type="button"
      onClick={handleThemeSwitch}
      aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
      className="fixed right-4 top-4 z-50 inline-flex h-11 w-11 items-center justify-center border border-[#D6D1C7] bg-[#F3F1EC]/80 text-[#1F1D1A] backdrop-blur transition-colors hover:cursor-pointer hover:border-[#1F1D1A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D46] md:right-8 md:top-8 dark:border-[#3A352F] dark:bg-[#221f1d]/80 dark:text-[#F3F1EC] dark:hover:border-[#F3F1EC]"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
