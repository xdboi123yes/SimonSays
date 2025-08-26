import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

// Sound settings interface defines user configurable options
interface SoundSettings {
  sfxEnabled: boolean;
  volume: number;
}

// Context interface that defines all sound-related functions
interface SoundContextType {
  settings: SoundSettings;
  updateSettings: (newSettings: Partial<SoundSettings>) => Promise<void>;
  playTileSound: (tileIndex: number) => void;
  playSuccessSound: () => void;
  playGameOverSound: () => void;
  playAchievementSound: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

// Hook to access sound functionality throughout the app
export const useSound = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
};

// Default sound configuration
const DEFAULT_SETTINGS: SoundSettings = {
  sfxEnabled: true,
  volume: 0.5,
};

// Define sound frequencies for each tile
const TILE_FREQUENCIES = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  349.23, // F4
  392.0, // G4
  440.0, // A4
  493.88, // B4
  523.25, // C5
  587.33, // D5
];

export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const { user, session } = useAuth();
  const [settings, setSettings] = useState<SoundSettings>(DEFAULT_SETTINGS);
  const audioContext = useRef<AudioContext>();

  useEffect(() => {
    // Initialize AudioContext on first user interaction
    const initAudio = () => {
      if (!audioContext.current) {
        audioContext.current = new AudioContext();
      }
    };

    window.addEventListener("click", initAudio, { once: true });
    window.addEventListener("touchstart", initAudio, { once: true });

    return () => {
      window.removeEventListener("click", initAudio);
      window.removeEventListener("touchstart", initAudio);
    };
  }, []);

  useEffect(() => {
    if (user?.id && session) {
      fetchSettings();
    }
  }, [user?.id, session]);

  // Retrieves user sound settings from database or creates default settings
  const fetchSettings = async () => {
    if (!user?.id) return;

    try {
      // First try to fetch existing settings
      const { data: existingSettings, error: fetchError } = await supabase
        .from("settings")
        .select("settings")
        .eq("user_id", user.id)
        .eq("category", "sound")
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
            category: "sound",
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
      console.error("Failed to fetch/create sound settings:", error);
      // Fallback to default settings on error
      setSettings(DEFAULT_SETTINGS);
    }
  };

  // Saves updated sound settings to the database
  const updateSettings = async (newSettings: Partial<SoundSettings>) => {
    if (!user?.id || !session) return;

    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      const { error } = await supabase.from("settings").upsert(
        {
          user_id: user.id,
          category: "sound",
          settings: updatedSettings,
        },
        {
          onConflict: "user_id,category",
        },
      );

      if (error) throw error;
    } catch (error) {
      console.error("Failed to update sound settings:", error);
      // Revert settings if save failed
      setSettings(settings);
    }
  };

  // Core function for sound generation using Web Audio API
  const playTone = (
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
  ) => {
    if (!settings.sfxEnabled || !audioContext.current) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(
      frequency,
      audioContext.current.currentTime,
    );

    gainNode.gain.setValueAtTime(
      settings.volume,
      audioContext.current.currentTime,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.current.currentTime + duration,
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.start();
    oscillator.stop(audioContext.current.currentTime + duration);
  };

  // Plays sound for a single tile
  const playTileSound = (tileIndex: number) => {
    if (!settings.sfxEnabled) return;
    playTone(TILE_FREQUENCIES[tileIndex], 0.2);
  };

  // Plays positive feedback sound
  const playSuccessSound = () => {
    if (!settings.sfxEnabled) return;
    // Play an ascending arpeggio
    [0, 2, 4].forEach((i, index) => {
      setTimeout(() => {
        playTone(TILE_FREQUENCIES[i], 0.15);
      }, index * 100);
    });
  };

  // Plays negative feedback sound
  const playGameOverSound = () => {
    if (!settings.sfxEnabled) return;
    // Play a descending pattern
    [6, 4, 2, 0].forEach((i, index) => {
      setTimeout(() => {
        playTone(TILE_FREQUENCIES[i] / 2, 0.2, "square");
      }, index * 150);
    });
  };

  // Plays celebratory sound for achievements
  const playAchievementSound = () => {
    if (!settings.sfxEnabled) return;
    // Play a special achievement jingle
    [0, 4, 7, 4].forEach((i, index) => {
      setTimeout(() => {
        playTone(TILE_FREQUENCIES[i] * 2, 0.15, "triangle");
      }, index * 100);
    });
  };

  const value = {
    settings,
    updateSettings,
    playTileSound,
    playSuccessSound,
    playGameOverSound,
    playAchievementSound,
  };

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
};
