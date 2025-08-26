import { Routes, Route, Navigate } from "react-router-dom";
import { Settings as SettingsIcon } from "lucide-react";
import SettingsNav from "../components/settings/SettingsNav";
import ThemeSettings from "../components/settings/ThemeSettings";
import SoundSettings from "../components/settings/SoundSettings";
import ControlSettings from "../components/settings/ControlSettings";
import { GameProvider } from "../contexts/GameContext";

// Main settings page layout containing navigation and settings sub-routes
const Settings = () => {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header section with icon and "Settings" title */}
      <div className="flex items-center justify-center mb-6">
        <SettingsIcon className="text-indigo-500 h-7 w-7 mr-3" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md">
        {/* Navigation component to switch between theme, sound, and control settings */}
        <SettingsNav />

        <div className="p-6">
          <GameProvider>
            {/* Define nested routes for individual settings pages */}
            <Routes>
              {/* Theme customization settings page */}
              <Route path="theme" element={<ThemeSettings />} />
              {/* Sound preferences (e.g., mute, volume) settings page */}
              <Route path="sound" element={<SoundSettings />} />
              {/* Controls settings page */}
              <Route path="controls" element={<ControlSettings />} />
              {/*Redirect to default settings page if no sub-route matches*/}
              <Route
                path="*"
                element={<Navigate to="/settings/theme" replace />}
              />
            </Routes>
          </GameProvider>
        </div>
      </div>
    </div>
  );
};

export default Settings;
