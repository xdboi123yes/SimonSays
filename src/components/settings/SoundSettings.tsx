import { useState, useEffect } from "react";
import { VolumeX, Volume2, Save, Loader2 } from "lucide-react";
import { useSound } from "../../contexts/SoundContext";
import { useAuth } from "../../contexts/AuthContext";

const SoundSettings = () => {
  // Get sound settings and update function from context
  const { settings, updateSettings } = useSound();
  // Get user session for authentication check
  const { session } = useAuth();
  // Local state to manage settings before saving
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Update local settings when context settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Toggle sound effects on/off
  const handleToggle = () => {
    setLocalSettings((prev) => ({
      ...prev,
      sfxEnabled: !prev.sfxEnabled,
    }));
  };

  // Handle volume slider changes
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setLocalSettings((prev) => ({
      ...prev,
      volume,
    }));
  };

  // Save settings to the server/context
  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMessage(null);
      await updateSettings(localSettings);
      setSaveMessage({ type: "success", text: "Settings saved successfully" });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (error) {
      setSaveMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  // Show sign-in message if user is not authenticated
  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 dark:text-slate-400">
          Please sign in to manage sound settings
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Sound Settings</h2>

      <div className="space-y-6">
        {/* Sound Effects Toggle Switch */}
        <div>
          <label className="flex items-center cursor-pointer">
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                className="sr-only"
                checked={localSettings.sfxEnabled}
                onChange={handleToggle}
              />
              <div
                className={`w-12 h-6 rounded-full transition ${
                  localSettings.sfxEnabled
                    ? "bg-indigo-500"
                    : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`transform transition-transform duration-200 ease-in-out h-6 w-6 rounded-full bg-white shadow-md ${
                    localSettings.sfxEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
              <span className="ml-3 font-medium text-slate-900 dark:text-slate-100">
                Sound Effects
              </span>
            </div>
          </label>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-16">
            Game sounds when tiles are clicked
          </p>
        </div>

        {/* Volume Slider */}
        <div>
          <label className="block mb-2">
            <span className="font-medium text-slate-900 dark:text-slate-100">
              Volume
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={localSettings.volume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
            disabled={!localSettings.sfxEnabled}
          />
          <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mt-1">
            <span>0%</span>
            <span>{Math.round(localSettings.volume * 100)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Current Status Display */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center mb-4 text-slate-500 dark:text-slate-400">
            {localSettings.sfxEnabled ? (
              <Volume2 className="h-6 w-6 mr-2" />
            ) : (
              <VolumeX className="h-6 w-6 mr-2" />
            )}
            <span>
              Sound is currently{" "}
              {localSettings.sfxEnabled ? "enabled" : "disabled"}
            </span>
          </div>
        </div>

        {/* Save Button and Status Message */}
        <div className="pt-4 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            Save Settings
          </button>

          {saveMessage && (
            <span
              className={`text-sm ${
                saveMessage.type === "success"
                  ? "text-success-600 dark:text-success-400"
                  : "text-error-600 dark:text-error-400"
              }`}
            >
              {saveMessage.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoundSettings;
