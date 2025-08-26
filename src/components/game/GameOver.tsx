import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { useGame } from "../../contexts/GameContext";
import { Trophy, Award, RefreshCcw } from "lucide-react";

type AchievementId =
  | "sharp-starter"
  | "memory-master"
  | "reflex-lord"
  | "simon-slayer";

const achievementDetails: Record<
  AchievementId,
  { name: string; description: string }
> = {
  "sharp-starter": {
    name: "Sharp Starter",
    description: "Reach a score of 5 points in a single game",
  },
  "memory-master": {
    name: "Memory Master",
    description: "Reach a score of 10 points in a single game",
  },
  "reflex-lord": {
    name: "Reflex Lord",
    description: "Reach a score of 15 points in a single game",
  },
  "simon-slayer": {
    name: "Simon Slayer",
    description: "Reach a score of 20 points in a single game",
  },
};

const GameOver = () => {
  const { user, session } = useAuth();
  const { score, startGame, resetGame } = useGame();
  const [achievements, setAchievements] = useState<AchievementId[]>([]);
  const [newAchievements, setNewAchievements] = useState<AchievementId[]>([]);
  const [saving, setSaving] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && session && score > 0) {
      checkAchievements();
    } else {
      setSaving(false);
    }
  }, [user?.id, session, score]);

  const checkAchievements = async () => {
    if (!user?.id || !session) {
      setSaving(false);
      return;
    }

    try {
      setError(null);
      const achievementsToUnlock: AchievementId[] = [];

      if (score >= 5) achievementsToUnlock.push("sharp-starter");
      if (score >= 10) achievementsToUnlock.push("memory-master");
      if (score >= 15) achievementsToUnlock.push("reflex-lord");
      if (score >= 20) achievementsToUnlock.push("simon-slayer");

      if (achievementsToUnlock.length === 0) {
        setSaving(false);
        return;
      }

      // Check which achievements are already earned
      const { data: existingAchievements, error: fetchError } = await supabase
        .from("achievements")
        .select("achievement_id")
        .eq("user_id", user.id);

      if (fetchError) throw fetchError;

      // Create a Set of existing achievement IDs for efficient lookup
      const existingIds = new Set(
        (existingAchievements || [])
          .map((a) => a.achievement_id)
          .filter(Boolean),
      );

      // Filter out achievements that the user already has
      const newAchievementsToInsert = achievementsToUnlock.filter(
        (id) => !existingIds.has(id),
      );

      if (newAchievementsToInsert.length === 0) {
        setSaving(false);
        return;
      }

      // Prepare achievements data for insertion
      const achievementsToInsert = newAchievementsToInsert.map((id) => ({
        user_id: user.id,
        achievement_id: id,
        name: achievementDetails[id].name,
        description: achievementDetails[id].description,
      }));

      // Insert only new achievements
      const { error: insertError } = await supabase
        .from("achievements")
        .upsert(achievementsToInsert, { onConflict: "user_id,achievement_id" });

      if (insertError) throw insertError;

      setNewAchievements(newAchievementsToInsert);
      setAchievements((prev) => [...prev, ...newAchievementsToInsert]);
    } catch (error) {
      console.error("Failed to save achievements:", error);
      setError(
        "Failed to save achievements. Your score has been recorded, but achievements may not have been updated.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Final Score: <span className="font-bold text-xl">{score}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {newAchievements.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">New Achievements!</h3>
            <div className="space-y-2">
              {newAchievements.map((id) => (
                <div
                  key={id}
                  className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg flex items-center"
                >
                  <Award className="h-5 w-5 text-indigo-500 mr-2" />
                  <span className="font-medium">
                    {achievementDetails[id].name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => startGame()}
            disabled={saving}
            className="btn btn-primary w-full"
          >
            <RefreshCcw className="h-5 w-5 mr-2" />
            Play Again
          </button>
          <button
            onClick={() => resetGame()}
            disabled={saving}
            className="btn btn-secondary w-full"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
