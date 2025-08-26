import { useState } from "react";
import { User, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const Account = () => {
  const { user, updateUser } = useAuth();

  // Username state and related status flags
  const [username, setUsername] = useState(user?.username || "");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState(false);

  // Validates username input for minimum length and allowed characters
  const validateUsername = (name: string) => {
    if (!name) return setUsernameError("Username is required"), false;
    if (name.length < 3)
      return setUsernameError("Username must be at least 3 characters"), false;
    if (!/^[a-zA-Z0-9_]+$/.test(name))
      return (
        setUsernameError("Only letters, numbers, and underscores allowed"),
        false
      );
    setUsernameError(null);
    return true;
  };

  // Handles form submission to update username
  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();

    if (username === user?.username) {
      setUsernameError("Please enter a different username");
      return;
    }

    if (!validateUsername(username)) return;

    try {
      setUsernameLoading(true);
      setUsernameError(null);

      await updateUser({ username });

      setUsernameSuccess(true);
      setTimeout(() => setUsernameSuccess(false), 3000);
    } catch (error) {
      setUsernameError("Failed to update username. It may already be taken.");
    } finally {
      setUsernameLoading(false);
    }
  };

  // State for delete account confirmation UI
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Calls Supabase function to delete user and related data
  const handleRequestAccountDeletion = async () => {
    if (deleteConfirmText !== "DELETE") {
      setDeleteError("Please type DELETE to confirm");
      return;
    }

    try {
      setDeleteLoading(true);
      setDeleteError(null);
      const { error } = await supabase.rpc("delete_user_and_data", {
        uid: user?.id,
      });

      if (error) throw error;

      // Sign out and redirect to login after successful deletion
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Delete failed:", error);
      setDeleteError("Failed to delete account. Please try again later.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-center mb-8">
        <User className="text-indigo-500 h-7 w-7 mr-3" />
        <h1 className="text-3xl font-bold">Account Settings</h1>
      </div>

      <div className="space-y-8">
        {/* Update username section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-slate-500" />
              Update Username
            </h2>

            <form onSubmit={handleUpdateUsername}>
              {/* Show validation or success message */}
              {usernameError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md text-sm flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{usernameError}</span>
                </div>
              )}

              {usernameSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md text-sm">
                  Username updated successfully!
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="username" className="label">
                  New Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  required
                  minLength={3}
                />
              </div>

              <button
                type="submit"
                disabled={usernameLoading}
                className="btn btn-primary"
              >
                {usernameLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : null}
                Update Username
              </button>
            </form>
          </div>
        </div>

        {/* Delete account section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-error-600 dark:text-error-400 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Delete Account
            </h2>

            <p className="text-slate-600 dark:text-slate-400 mb-4">
              This action is permanent and cannot be undone. All your data,
              including scores, themes, and settings will be deleted.
            </p>

            {showDeleteConfirm ? (
              <div>
                {/* Error message when DELETE confirmation text is invalid */}
                {deleteError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md text-sm flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{deleteError}</span>
                  </div>
                )}

                <div className="mb-4">
                  <label className="label">Type DELETE to confirm</label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="input"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleRequestAccountDeletion}
                    disabled={deleteLoading}
                    className="btn btn-danger"
                  >
                    {deleteLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : null}
                    Confirm Deletion
                  </button>

                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="btn btn-secondary"
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn btn-danger"
              >
                Delete Account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
