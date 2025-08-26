import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";

// Theme interface defining the structure of a tile theme
export interface TileTheme {
  id: string;
  name: string;
  userId: string;
  colors: string[];
  tileShape: "square" | "circle" | "hexagon";
  createdAt: string;
  isDefault?: boolean;
}

// Default theme
export const DEFAULT_THEME: TileTheme = {
  id: "default",
  name: "Classic",
  userId: "system",
  colors: [
    "#EF4444",
    "#F59E0B",
    "#10B981",
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
    "#F97316",
    "#84CC16",
    "#06B6D4",
  ],
  tileShape: "square",
  createdAt: new Date().toISOString(),
  isDefault: true,
};

// Theme context interface defining available methods and properties
interface ThemeContextType {
  currentTheme: TileTheme;
  themes: TileTheme[];
  setCurrentTheme: (theme: TileTheme) => Promise<void>;
  createTheme: (
    theme: Omit<TileTheme, "id" | "userId" | "createdAt">,
  ) => Promise<void>;
  updateTheme: (theme: TileTheme) => Promise<void>;
  deleteTheme: (themeId: string) => Promise<void>;
  saving: boolean;
  error: string | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { user, session } = useAuth();
  const [themes, setThemes] = useState<TileTheme[]>([DEFAULT_THEME]);
  const [currentTheme, setCurrentThemeState] =
    useState<TileTheme>(DEFAULT_THEME);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load themes when session changes
  useEffect(() => {
    if (session) {
      Promise.all([fetchThemes(), fetchSavedTheme()]);
    } else {
      // Reset to defaults when not authenticated
      setThemes([DEFAULT_THEME]);
      setCurrentThemeState(DEFAULT_THEME);
    }
  }, [session]);

  // Fetch all themes for the current user
  const fetchThemes = async () => {
    try {
      const { data: userThemes, error } = await supabase
        .from("themes")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;

      const transformedThemes =
        userThemes?.map((theme) => ({
          id: theme.id,
          name: theme.name,
          userId: theme.user_id,
          colors: theme.colors,
          tileShape: theme.tile_shape,
          createdAt: theme.created_at,
        })) || [];

      setThemes([DEFAULT_THEME, ...transformedThemes]);
    } catch (error) {
      console.error("Failed to fetch themes:", error);
      setError("Failed to fetch themes");
    }
  };

  // Fetch user's saved theme preference
  const fetchSavedTheme = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("settings")
        .select("settings")
        .eq("user_id", user.id)
        .eq("category", "theme")
        .maybeSingle();

      // If there's no data or it's an expected error (no rows), use default theme
      if (!data || error) {
        setCurrentThemeState(DEFAULT_THEME);
        return;
      }

      // If there's an unexpected error, throw it
      if (error) throw error;

      // If we have data and a themeId, try to find the theme
      if (data.settings?.themeId) {
        const savedTheme = themes.find(
          (theme) => theme.id === data.settings.themeId,
        );
        if (savedTheme) {
          setCurrentThemeState(savedTheme);
        } else {
          // If the theme wasn't found, fall back to default
          setCurrentThemeState(DEFAULT_THEME);
        }
      } else {
        // If no themeId in settings, use default
        setCurrentThemeState(DEFAULT_THEME);
      }
    } catch (error) {
      console.error("Failed to fetch saved theme:", error);
      setError("Failed to fetch saved theme preference");
      // On error, ensure we're using the default theme
      setCurrentThemeState(DEFAULT_THEME);
    }
  };

  // Save the user's theme preference
  const setCurrentTheme = async (theme: TileTheme) => {
    if (!user?.id || !session) {
      setCurrentThemeState(theme);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const { error } = await supabase.from("settings").upsert(
        {
          user_id: user.id,
          category: "theme",
          settings: { themeId: theme.id },
        },
        {
          onConflict: "user_id,category",
        },
      );

      if (error) throw error;

      setCurrentThemeState(theme);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
      setError("Failed to save theme preference");
    } finally {
      setSaving(false);
    }
  };

  // Create a new theme
  const createTheme = async (
    theme: Omit<TileTheme, "id" | "userId" | "createdAt">,
  ) => {
    if (!user?.id || !session) {
      throw new Error("Not authenticated");
    }

    try {
      setSaving(true);
      setError(null);

      const { data, error } = await supabase
        .from("themes")
        .insert({
          user_id: user.id,
          name: theme.name,
          colors: theme.colors,
          tile_shape: theme.tileShape,
        })
        .select()
        .single();

      if (error) throw error;

      const newTheme: TileTheme = {
        id: data.id,
        name: data.name,
        userId: data.user_id,
        colors: data.colors,
        tileShape: data.tile_shape,
        createdAt: data.created_at,
      };

      setThemes([
        DEFAULT_THEME,
        ...themes.filter((t) => t.id !== "default"),
        newTheme,
      ]);
      await setCurrentTheme(newTheme);
    } catch (error) {
      console.error("Failed to create theme:", error);
      setError("Failed to create theme");
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Update an existing theme
  const updateTheme = async (theme: TileTheme) => {
    if (!user?.id || !session) {
      throw new Error("Not authenticated");
    }

    try {
      setSaving(true);
      setError(null);

      if (theme.id === "default") {
        throw new Error("Cannot update default theme");
      }

      const { data, error } = await supabase
        .from("themes")
        .update({
          name: theme.name,
          colors: theme.colors,
          tile_shape: theme.tileShape,
        })
        .eq("id", theme.id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedTheme: TileTheme = {
        id: data.id,
        name: data.name,
        userId: data.user_id,
        colors: data.colors,
        tileShape: data.tile_shape,
        createdAt: data.created_at,
      };

      setThemes([
        DEFAULT_THEME,
        ...themes.filter((t) => t.id !== "default" && t.id !== theme.id),
        updatedTheme,
      ]);

      if (currentTheme.id === theme.id) {
        await setCurrentTheme(updatedTheme);
      }
    } catch (error) {
      console.error("Failed to update theme:", error);
      setError("Failed to update theme");
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Delete a theme
  const deleteTheme = async (themeId: string) => {
    if (!user?.id || !session) {
      throw new Error("Not authenticated");
    }

    try {
      setSaving(true);
      setError(null);

      if (themeId === "default") {
        throw new Error("Cannot delete default theme");
      }

      const { error } = await supabase
        .from("themes")
        .delete()
        .eq("id", themeId)
        .eq("user_id", user.id);

      if (error) throw error;

      const updatedThemes = themes.filter((theme) => theme.id !== themeId);
      setThemes(updatedThemes);

      // If the deleted theme was the current theme, switch to default
      if (currentTheme.id === themeId) {
        await setCurrentTheme(DEFAULT_THEME);
      }
    } catch (error) {
      console.error("Failed to delete theme:", error);
      setError("Failed to delete theme");
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Context value containing all theme operations and state
  const value = {
    currentTheme,
    themes,
    setCurrentTheme,
    createTheme,
    updateTheme,
    deleteTheme,
    saving,
    error,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
