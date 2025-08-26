import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

// Define types for user control settings
interface ControlSettings {
  keyboardEnabled: boolean;
  touchVibration: boolean;
  autoZoom: boolean;
}

// Define Context API interface
interface ControlsContextType {
  settings: ControlSettings;
  updateSettings: (newSettings: Partial<ControlSettings>) => Promise<void>;
  handleKeyPress: (key: string) => void;
  handleTileClick: (index: number) => void;
}

const ControlsContext = createContext<ControlsContextType | undefined>(
  undefined,
);

// Custom hook to access controls context
export const useControls = () => {
  const context = useContext(ControlsContext);
  if (context === undefined) {
    throw new Error("useControls must be used within a ControlsProvider");
  }
  return context;
};

// Default control settings when none exist in the database
const DEFAULT_SETTINGS: ControlSettings = {
  keyboardEnabled: true,
  touchVibration: true,
  autoZoom: true,
};

export const ControlsProvider = ({ children }: { children: ReactNode }) => {
  const { user, session } = useAuth();
  const [settings, setSettings] = useState<ControlSettings>(DEFAULT_SETTINGS);

  // Load user settings when authenticated
  useEffect(() => {
    if (user?.id && session) {
      fetchSettings();
    }
  }, [user?.id, session]);

  // Setup or remove auto-zoom functionality when setting changes
  useEffect(() => {
    if (settings.autoZoom) {
      setupAutoZoom();
    }
    return () => {
      // Remove auto-zoom meta tag if it exists
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0",
        );
      }
    };
  }, [settings.autoZoom]);

  // Retrieve user settings from database or create default settings
  const fetchSettings = async () => {
    if (!user?.id) return;

    try {
      // First try to fetch existing settings
      const { data: existingSettings, error: fetchError } = await supabase
        .from("settings")
        .select("settings")
        .eq("user_id", user.id)
        .eq("category", "controls")
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (!existingSettings) {
        // If no settings exist, create default settings
        const { data: newSettings, error: insertError } = await supabase
          .from("settings")
          .insert({
            user_id: user.id,
            category: "controls",
            settings: DEFAULT_SETTINGS,
          })
          .select("settings")
          .single();

        if (insertError) throw insertError;

        setSettings(DEFAULT_SETTINGS);
      } else {
        setSettings(existingSettings.settings);
      }
    } catch (error) {
      console.error("Failed to fetch/create control settings:", error);
      // Fallback to default settings on error
      setSettings(DEFAULT_SETTINGS);
    }
  };

  // Save updated settings to database
  const updateSettings = async (newSettings: Partial<ControlSettings>) => {
    if (!user?.id || !session) return;

    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      const { error } = await supabase.from("settings").upsert(
        {
          user_id: user.id,
          category: "controls",
          settings: updatedSettings,
        },
        {
          onConflict: "user_id,category",
        },
      );

      if (error) throw error;
    } catch (error) {
      console.error("Failed to update control settings:", error);
      // Revert settings if save failed
      setSettings(settings);
    }
  };

  // Handle keyboard input for game controls
  const handleKeyPress = (key: string) => {
    if (!settings.keyboardEnabled) return null;

    // Map number keys 1-9 to tile indices 0-8
    const numKey = parseInt(key);
    if (numKey >= 1 && numKey <= 9) {
      return numKey - 1;
    }
    return null;
  };

  // Handle touch input with optional vibration feedback
  const handleTileClick = (index: number) => {
    if (settings.touchVibration && "vibrate" in navigator) {
      navigator.vibrate(50); // 50ms vibration
    }
    return index;
  };

  // Set up automatic zoom to fit game grid on screen
  const setupAutoZoom = () => {
    // Function to calculate and set the optimal viewport scale
    const setOptimalScale = () => {
      if (!settings.autoZoom) return;

      const gameGrid = document.querySelector(".game-grid");
      if (!gameGrid) return;

      const gridRect = gameGrid.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Calculate the scale needed to fit the grid with some padding
      const horizontalScale = (screenWidth * 0.9) / gridRect.width;
      const verticalScale = (screenHeight * 0.7) / gridRect.height;
      const scale = Math.min(horizontalScale, verticalScale, 1); // Don't zoom in more than 100%

      // Update viewport meta tag
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          "content",
          `width=device-width, initial-scale=${scale}, user-scalable=no`,
        );
      }
    };

    // Set initial scale
    setOptimalScale();

    // Update scale on orientation change and resize
    window.addEventListener("resize", setOptimalScale);
    window.addEventListener("orientationchange", setOptimalScale);

    return () => {
      window.removeEventListener("resize", setOptimalScale);
      window.removeEventListener("orientationchange", setOptimalScale);
    };
  };

  const value = {
    settings,
    updateSettings,
    handleKeyPress,
    handleTileClick,
  };

  return (
    <ControlsContext.Provider value={value}>
      {children}
    </ControlsContext.Provider>
  );
};
