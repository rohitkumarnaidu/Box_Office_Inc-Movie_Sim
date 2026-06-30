import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

const STORAGE_KEY = "cineverse-theme";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem(STORAGE_KEY) || "system";
  });

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme(mode) {
      if (mode === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
      }
    }

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mq.matches ? "dark" : "light");
      const handler = (e) => applyTheme(e.matches ? "dark" : "light");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  function setThemeAndPersist(newTheme) {
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeAndPersist }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
