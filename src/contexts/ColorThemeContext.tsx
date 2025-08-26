import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

// Define available theme options
type ThemeType = "light" | "dark";

// Interface for the theme context
interface ColorThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(
  undefined,
);

// Custom hook to access the theme context
export const useColorTheme = () => {
  const context = useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider");
  }
  return context;
};

export const ColorThemeProvider = ({ children }: { children: ReactNode }) => {
  // Initialize theme from localStorage or system preference
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    return prefersDark ? "dark" : "light";
  });

  // Apply theme to document and save to localStorage when theme changes
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  // Listen for system theme preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem("theme") === null) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ColorThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
};
