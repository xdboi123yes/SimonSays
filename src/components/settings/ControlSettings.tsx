import { useState, useEffect } from "react";
import { MousePointer, Smartphone, Save, Loader2 } from "lucide-react";
import { useControls } from "../../contexts/ControlsContext";
import { useAuth } from "../../contexts/AuthContext";

const ControlSettings = () => {
  // Get settings and update function from context
  const { settings, updateSettings } = useControls();
  const { session } = useAuth();
  // Maintain local state for settings changes
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

  // Toggle individual settings
  const handleToggle = (setting: keyof typeof settings) => {
    setLocalSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  // Save settings to backend
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

  // Require authentication to manage settings
  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 dark:text-slate-400">
          Please sign in to manage control settings
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Control Settings</h2>

      <div className="space-y-6">
        {/* Keyboard Controls Toggle */}
        <div>
          <label className="flex items-center cursor-pointer">
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                className="sr-only"
                checked={localSettings.keyboardEnabled}
                onChange={() => handleToggle("keyboardEnabled")}
              />
              <div
                className={`w-12 h-6 rounded-full transition ${
                  localSettings.keyboardEnabled
                    ? "bg-indigo-500"
                    : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`transform transition-transform duration-200 ease-in-out h-6 w-6 rounded-full bg-white shadow-md ${
                    localSettings.keyboardEnabled
                      ? "translate-x-6"
                      : "translate-x-0"
                  }`}
                />
              </div>
              <span className="ml-3 font-medium text-slate-900 dark:text-slate-100">
                Keyboard Controls
              </span>
            </div>
          </label>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-16">
            Use number keys (1-9) to select tiles
          </p>
        </div>

        {/* Touch Vibration Toggle */}
        <div>
          <label className="flex items-center cursor-pointer">
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                className="sr-only"
                checked={localSettings.touchVibration}
                onChange={() => handleToggle("touchVibration")}
              />
              <div
                className={`w-12 h-6 rounded-full transition ${
                  localSettings.touchVibration
                    ? "bg-indigo-500"
                    : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`transform transition-transform duration-200 ease-in-out h-6 w-6 rounded-full bg-white shadow-md ${
                    localSettings.touchVibration
                      ? "translate-x-6"
                      : "translate-x-0"
                  }`}
                />
              </div>
              <span className="ml-3 font-medium text-slate-900 dark:text-slate-100">
                Touch Vibration
              </span>
            </div>
          </label>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-16">
            Vibrate on touch devices when tiles are pressed
          </p>
        </div>

        {/* Auto-Zoom Toggle */}
        <div>
          <label className="flex items-center cursor-pointer">
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                className="sr-only"
                checked={localSettings.autoZoom}
                onChange={() => handleToggle("autoZoom")}
              />
              <div
                className={`w-12 h-6 rounded-full transition ${
                  localSettings.autoZoom
                    ? "bg-indigo-500"
                    : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`transform transition-transform duration-200 ease-in-out h-6 w-6 rounded-full bg-white shadow-md ${
                    localSettings.autoZoom ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
              <span className="ml-3 font-medium text-slate-900 dark:text-slate-100">
                Auto-Zoom
              </span>
            </div>
          </label>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-16">
            Automatically adjust zoom level on mobile devices
          </p>
        </div>

        {/* Info section */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex items-center text-slate-500 dark:text-slate-400">
              <MousePointer className="h-5 w-5 mr-2" />
              <span>Mouse/Touch control is always enabled</span>
            </div>

            <div className="flex items-center text-slate-500 dark:text-slate-400">
              <Smartphone className="h-5 w-5 mr-2" />
              <span>Mobile-optimized controls</span>
            </div>
          </div>
        </div>

        {/* Save button and status message */}
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

export default ControlSettings;
