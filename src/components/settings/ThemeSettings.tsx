import { useState, useCallback, useRef, memo } from "react";
import { Trash2, Plus, Palette, Save, X, Loader2 } from "lucide-react";
import { useTheme, TileTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";

// Default theme values for creating new themes
const defaultNewTheme: Omit<TileTheme, "id" | "userId" | "createdAt"> = {
  name: "New Theme",
  colors: [
    "#ff5252",
    "#ff9800",
    "#4caf50",
    "#2196f3",
    "#9c27b0",
    "#e91e63",
    "#ffc107",
    "#3f51b5",
    "#00bcd4",
  ],
  tileShape: "square",
};

// Memoized tile component to prevent unnecessary re-renders
const ThemeTile = memo(
  ({
    color,
    index,
    shape,
    isEditMode,
    onColorChange,
  }: {
    color: string;
    index: number;
    shape: "square" | "circle" | "hexagon";
    isEditMode: boolean;
    onColorChange: (index: number, color: string) => void;
  }) => {
    let classes = "h-8 w-8 sm:h-10 sm:w-10 transition-all duration-200 ";

    if (shape === "square") {
      classes += "rounded-lg";
    } else if (shape === "circle") {
      classes += "rounded-full";
    } else if (shape === "hexagon") {
      classes += "clip-path-hexagon";
    }

    return (
      <div className="relative">
        <div
          className={classes}
          style={{
            backgroundColor: color,
            clipPath:
              shape === "hexagon"
                ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                : undefined,
          }}
        />

        {isEditMode && (
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(index, e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            aria-label={`Choose color for tile ${index + 1}`}
          />
        )}
      </div>
    );
  },
);

ThemeTile.displayName = "ThemeTile";

const ThemeSettings = () => {
  const {
    themes,
    currentTheme,
    setCurrentTheme,
    createTheme,
    updateTheme,
    deleteTheme,
    saving,
    error,
  } = useTheme();
  const [localError, setLocalError] = useState<string | null>(null);
  const { user, session } = useAuth();

  // UI state management
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTheme, setEditingTheme] = useState<TileTheme | null>(null);
  const [deleteConfirmTheme, setDeleteConfirmTheme] =
    useState<TileTheme | null>(null);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Use a ref to store temporary color changes
  const tempColorsRef = useRef<string[]>([]);

  // Initialize theme editing mode
  const startEditing = (theme: TileTheme) => {
    if (!session) {
      setLocalError("Please sign in to edit themes");
      return;
    }
    setLocalError(null);
    setEditingTheme({ ...theme });
    tempColorsRef.current = [...theme.colors];
    setIsEditing(true);
    setIsCreating(false);
  };

  // Start creating a new theme
  const startCreating = () => {
    if (!session) {
      setLocalError("Please sign in to create themes");
      return;
    }
    setLocalError(null);
    const newTheme = {
      ...defaultNewTheme,
      id: "new",
      userId: user!.id,
      createdAt: new Date().toISOString(),
    };
    setEditingTheme(newTheme);
    tempColorsRef.current = [...newTheme.colors];
    setIsCreating(true);
    setIsEditing(true);
  };

  // Cancel editing/creating and reset state
  const cancelEditing = () => {
    setIsEditing(false);
    setIsCreating(false);
    setEditingTheme(null);
    setLocalError(null);
    tempColorsRef.current = [];
  };

  // Handle color change with memoization to prevent unnecessary re-renders
  const handleColorChange = useCallback(
    (index: number, color: string) => {
      if (!editingTheme) return;

      // Update the temporary colors immediately
      tempColorsRef.current[index] = color;

      // Update the UI with the new colors
      setEditingTheme((prev) => {
        if (!prev) return prev;
        return { ...prev, colors: [...tempColorsRef.current] };
      });
    },
    [editingTheme],
  );

  // Update theme name
  const handleNameChange = (name: string) => {
    if (!editingTheme) return;
    setEditingTheme({ ...editingTheme, name });
  };

  // Update tile shape
  const handleShapeChange = (shape: "square" | "circle" | "hexagon") => {
    if (!editingTheme) return;
    setEditingTheme({ ...editingTheme, tileShape: shape });
  };

  // Save theme changes to database
  const handleSave = async () => {
    if (!editingTheme || !session) {
      setLocalError("You must be signed in to save themes");
      return;
    }

    try {
      setSaveMessage(null);

      if (isCreating) {
        const { id, userId, createdAt, ...themeData } = editingTheme;
        await createTheme(themeData);
      } else {
        await updateTheme(editingTheme);
      }

      setSaveMessage({ type: "success", text: "Settings saved successfully" });
      setTimeout(() => setSaveMessage(null), 3000);

      setIsEditing(false);
      setIsCreating(false);
      setEditingTheme(null);
      tempColorsRef.current = [];
    } catch (error) {
      console.error("Failed to save theme:", error);
      setSaveMessage({ type: "error", text: "Failed to save theme" });
    }
  };

  // Save current theme preference
  const handleSaveThemePreference = async (theme: TileTheme) => {
    try {
      await setCurrentTheme(theme);
      setSaveMessage({ type: "success", text: "Settings saved successfully" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({
        type: "error",
        text: "Failed to save theme preference",
      });
    }
  };

  // Show delete confirmation dialog
  const confirmDelete = (theme: TileTheme) => {
    setDeleteConfirmTheme(theme);
  };

  // Delete theme from database
  const handleDelete = async (themeId: string) => {
    if (themeId === "default" || !session) {
      setLocalError("You must be signed in to delete themes");
      return;
    }

    try {
      await deleteTheme(themeId);
      setDeleteConfirmTheme(null);
    } catch (error) {
      console.error("Failed to delete theme:", error);
      setLocalError("Failed to delete theme. Please try again.");
    }
  };

  // Auth guard
  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 dark:text-slate-400">
          Please sign in to manage themes
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Theme Settings</h2>

      {(localError || error) && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
          {localError || error}
        </div>
      )}

      {isEditing ? (
        <div>
          <div className="flex items-center space-x-4 mb-6">
            <label className="label">Theme Name:</label>
            <input
              type="text"
              value={editingTheme?.name || ""}
              onChange={(e) => handleNameChange(e.target.value)}
              className="input max-w-xs"
              required
            />
          </div>

          <div className="mb-6">
            <label className="label mb-2">Tile Shape:</label>
            <div className="flex space-x-4">
              <button
                onClick={() => handleShapeChange("square")}
                className={`px-3 py-1 rounded border ${
                  editingTheme?.tileShape === "square"
                    ? "bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-400"
                    : "border-slate-300 dark:border-slate-700"
                }`}
              >
                Square
              </button>
              <button
                onClick={() => handleShapeChange("circle")}
                className={`px-3 py-1 rounded border ${
                  editingTheme?.tileShape === "circle"
                    ? "bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-400"
                    : "border-slate-300 dark:border-slate-700"
                }`}
              >
                Circle
              </button>
              <button
                onClick={() => handleShapeChange("hexagon")}
                className={`px-3 py-1 rounded border ${
                  editingTheme?.tileShape === "hexagon"
                    ? "bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-400"
                    : "border-slate-300 dark:border-slate-700"
                }`}
              >
                Hexagon
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="label mb-2">Tile Colors:</label>
            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Click on a tile to choose its color
              </p>

              <div className="grid grid-cols-3 gap-4 w-36 sm:w-44 mx-auto mb-4">
                {editingTheme?.colors.map((color, index) => (
                  <ThemeTile
                    key={index}
                    color={color}
                    index={index}
                    shape={editingTheme.tileShape}
                    isEditMode={true}
                    onColorChange={handleColorChange}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary flex items-center"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Save className="h-5 w-5 mr-2" />
              )}
              {isCreating ? "Create Theme" : "Save Changes"}
            </button>

            <button
              onClick={cancelEditing}
              className="btn btn-secondary flex items-center"
            >
              <X className="h-5 w-5 mr-2" />
              Cancel
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
      ) : (
        <div>
          <div className="mb-6">
            <label className="label mb-2">Select Theme:</label>
            <div className="flex flex-wrap gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setCurrentTheme(theme)}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    currentTheme.id === theme.id
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                      : "bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                  }`}
                >
                  <span className="mr-2">{theme.name}</span>
                  {!theme.isDefault && (
                    <div className="flex space-x-2 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(theme);
                        }}
                        className="text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 p-1"
                        aria-label={`Edit ${theme.name}`}
                      >
                        <Palette size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(theme);
                        }}
                        className="text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 p-1"
                        aria-label={`Delete ${theme.name}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </button>
              ))}

              <button
                onClick={startCreating}
                className="px-4 py-2 rounded-md border border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center"
              >
                <Plus size={16} className="mr-2" />
                Create New Theme
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="label mb-2">Theme Preview:</label>
            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg flex justify-center">
              <div className="grid grid-cols-3 gap-4 w-36 sm:w-44">
                {currentTheme.colors.map((color, index) => (
                  <ThemeTile
                    key={index}
                    color={color}
                    index={index}
                    shape={currentTheme.tileShape}
                    isEditMode={false}
                    onColorChange={() => {}}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleSaveThemePreference(currentTheme)}
              disabled={saving}
              className="btn btn-primary flex items-center"
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
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmTheme && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Theme</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Are you sure you want to delete the theme "
              {deleteConfirmTheme.name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDelete(deleteConfirmTheme.id)}
                className="btn btn-danger"
              >
                Delete Theme
              </button>

              <button
                onClick={() => setDeleteConfirmTheme(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSettings;
