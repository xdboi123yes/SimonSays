import { useState, useEffect } from "react";
import {
  BarChart3,
  Award,
  BarChart2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

interface Achievement {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
}

interface GameStats {
  gamesPlayed: number;
  totalScore: number;
  averageScore: number;
  maxStreak: number;
  mostUsedDifficulty: string;
  mostUsedTheme: string;
  easySummary: {
    gamesPlayed: number;
    highScore: number;
    averageScore: number;
  };
  mediumSummary: {
    gamesPlayed: number;
    highScore: number;
    averageScore: number;
  };
  hardSummary: {
    gamesPlayed: number;
    highScore: number;
    averageScore: number;
  };
}

const Stats = () => {
  const { user, session } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Load achievements and statistics when user session is available
  useEffect(() => {
    document.title = "Simon Says - Stats & Achievements";
    if (session) {
      Promise.all([fetchAchievements(), fetchStats()]).finally(() =>
        setLoading(false),
      );
    } else {
      setLoading(false);
    }
  }, [session]);

  // Fetch user's earned achievements from Supabase
  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", user?.id)
        .order("earned_at", { ascending: false });

      if (error) throw error;

      setAchievements(
        data.map((achievement) => ({
          id: achievement.achievement_id,
          name: achievement.name,
          description: achievement.description,
          earnedAt: achievement.earned_at,
        })),
      );
    } catch (error) {
      console.error("Failed to fetch achievements:", error);
      setError("Failed to load achievements");
    }
  };

  // Fetch and calculate overall game statistics and summaries by difficulty
  const fetchStats = async () => {
    try {
      if (!user?.id) return;

      // Fetch all game records and max streak
      const [gamesResponse, maxStreakResponse] = await Promise.all([
        supabase
          .from("games")
          .select(
            `
            *,
            themes (
              name
            )
          `,
          )
          .eq("user_id", user.id),
        supabase
          .from("games")
          .select("streak")
          .eq("user_id", user.id)
          .order("streak", { ascending: false })
          .limit(1),
      ]);

      if (gamesResponse.error) throw gamesResponse.error;
      if (maxStreakResponse.error) throw maxStreakResponse.error;

      const games = gamesResponse.data;
      const maxStreak = maxStreakResponse.data[0]?.streak || 0;

      // Calculate statistics
      const gamesPlayed = games.length;
      const totalScore = games.reduce((sum, game) => sum + game.score, 0);
      const averageScore = gamesPlayed > 0 ? totalScore / gamesPlayed : 0;

      // Find most used difficulty
      const difficultyCounts = games.reduce(
        (counts, game) => {
          counts[game.difficulty] = (counts[game.difficulty] || 0) + 1;
          return counts;
        },
        {} as Record<string, number>,
      );

      const entries: [string, number][] = Object.entries(difficultyCounts);
      const mostUsedDifficulty =
        entries.length > 0
          ? entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0]
          : "easy";

      // Find most used theme
      const themeCounts = games.reduce(
        (counts, game) => {
          const themeName = game.themes?.name || "Default";
          counts[themeName] = (counts[themeName] || 0) + 1;
          return counts;
        },
        {} as Record<string, number>,
      );

      const themeEntries: [string, number][] = Object.entries(themeCounts);

      const mostUsedTheme =
        themeEntries.length > 0
          ? themeEntries.reduce((a, b) => (a[1] > b[1] ? a : b))[0]
          : "Default";

      // Calculate stats per difficulty
      const calculateDifficultySummary = (difficultyGames: typeof games) => ({
        gamesPlayed: difficultyGames.length,
        highScore:
          difficultyGames.length > 0
            ? Math.max(...difficultyGames.map((game) => game.score))
            : 0,
        averageScore:
          difficultyGames.length > 0
            ? difficultyGames.reduce((sum, game) => sum + game.score, 0) /
              difficultyGames.length
            : 0,
      });

      const stats: GameStats = {
        gamesPlayed,
        totalScore,
        averageScore,
        maxStreak,
        mostUsedDifficulty:
          mostUsedDifficulty.charAt(0).toUpperCase() +
          mostUsedDifficulty.slice(1),
        mostUsedTheme,
        easySummary: calculateDifficultySummary(
          games.filter((game) => game.difficulty === "easy"),
        ),
        mediumSummary: calculateDifficultySummary(
          games.filter((game) => game.difficulty === "medium"),
        ),
        hardSummary: calculateDifficultySummary(
          games.filter((game) => game.difficulty === "hard"),
        ),
      };

      setStats(stats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setError("Failed to load statistics");
    }
  };

  // Resets game statistics (but not achievements) for current user
  const handleResetStats = async () => {
    if (!user?.id || !session) return;

    try {
      setResetting(true);
      setError(null);

      // Delete all game records
      const { error: gamesError } = await supabase
        .from("games")
        .delete()
        .eq("user_id", user.id);

      if (gamesError) throw gamesError;

      // Delete all high scores
      const { error: highScoresError } = await supabase
        .from("high_scores")
        .delete()
        .eq("user_id", user.id);

      if (highScoresError) throw highScoresError;

      setShowResetConfirm(false);
      setStats(null);
    } catch (error) {
      console.error("Failed to reset stats:", error);
      setError("Failed to reset statistics");
    } finally {
      setResetting(false);
    }
  };

  if (!session) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Please sign in to view your stats and achievements
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center text-error-600 dark:text-error-400 flex items-center justify-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  const achievementProgressCompletedCount = achievements.length;
  const achievementProgressTotalCount = 4; // Total number of possible achievements
  const achievementProgressPercentage = Math.round(
    (achievementProgressCompletedCount / achievementProgressTotalCount) * 100,
  );

  // Maps to display proper icon, name and description for each achievement
  const achievementIcons: Record<string, React.ReactNode> = {
    "sharp-starter": <Award className="h-8 w-8 text-amber-400" />,
    "memory-master": <Award className="h-8 w-8 text-indigo-400" />,
    "reflex-lord": <Award className="h-8 w-8 text-emerald-400" />,
    "simon-slayer": <Award className="h-8 w-8 text-purple-400" />,
  };

  const achievementNames: Record<string, string> = {
    "sharp-starter": "Sharp Starter",
    "memory-master": "Memory Master",
    "reflex-lord": "Reflex Lord",
    "simon-slayer": "Simon Slayer",
  };

  const achievementDescriptions: Record<string, string> = {
    "sharp-starter": "Reach a score of 5 points in a single game",
    "memory-master": "Reach a score of 10 points in a single game",
    "reflex-lord": "Reach a score of 15 points in a single game",
    "simon-slayer": "Reach a score of 20 points in a single game",
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-green-500";
      case "medium":
        return "text-amber-500";
      case "hard":
        return "text-red-500";
      default:
        return "text-indigo-500";
    }
  };

  // Renders statistics summary and achievement cards UI
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-center mb-8">
        <BarChart3 className="text-indigo-500 h-7 w-7 mr-3" />
        <h1 className="text-3xl font-bold">Stats & Achievements</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-slate-500" />
              Game Statistics
            </h2>

            {stats ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-center">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Games Played
                    </div>
                    <div className="text-2xl font-bold">
                      {stats.gamesPlayed}
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-center">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Average Score
                    </div>
                    <div className="text-2xl font-bold">
                      {stats.averageScore.toFixed(1)}
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-center">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Max Streak
                    </div>
                    <div className="text-2xl font-bold">{stats.maxStreak}</div>
                  </div>

                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-center">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Total Score
                    </div>
                    <div className="text-2xl font-bold">{stats.totalScore}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                      Most Used Difficulty
                    </div>
                    <div className="font-medium">
                      <span
                        className={getDifficultyColor(stats.mostUsedDifficulty)}
                      >
                        {stats.mostUsedDifficulty}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                      Most Used Theme
                    </div>
                    <div className="font-medium">{stats.mostUsedTheme}</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold mb-3">Difficulty Breakdown</h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          Easy
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {stats.easySummary.gamesPlayed} games
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          Avg: {stats.easySummary.averageScore.toFixed(1)}
                        </div>
                        <div className="text-sm">
                          Best: {stats.easySummary.highScore}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                          Medium
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {stats.mediumSummary.gamesPlayed} games
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          Avg: {stats.mediumSummary.averageScore.toFixed(1)}
                        </div>
                        <div className="text-sm">
                          Best: {stats.mediumSummary.highScore}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                          Hard
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {stats.hardSummary.gamesPlayed} games
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          Avg: {stats.hardSummary.averageScore.toFixed(1)}
                        </div>
                        <div className="text-sm">
                          Best: {stats.hardSummary.highScore}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  {showResetConfirm ? (
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                        This will reset all your game statistics. Your
                        achievements will remain. This action cannot be undone.
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleResetStats}
                          disabled={resetting}
                          className="btn btn-danger text-sm"
                        >
                          {resetting && (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          )}
                          Confirm Reset
                        </button>
                        <button
                          onClick={() => setShowResetConfirm(false)}
                          disabled={resetting}
                          className="btn btn-secondary text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                    >
                      Reset Statistics
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                Play some games to see your statistics!
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Award className="h-5 w-5 mr-2 text-slate-500" />
              Achievements
            </h2>

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {achievementProgressCompletedCount} of{" "}
                  {achievementProgressTotalCount} earned
                </span>
                <span className="text-sm font-medium">
                  {achievementProgressPercentage}%
                </span>
              </div>
              <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{ width: `${achievementProgressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-6">
              {[
                "sharp-starter",
                "memory-master",
                "reflex-lord",
                "simon-slayer",
              ].map((achievementId) => {
                const achievement = achievements.find(
                  (a) => a.id === achievementId,
                );
                const isEarned = !!achievement;

                return (
                  <div
                    key={achievementId}
                    className={`flex items-start p-4 rounded-lg ${
                      isEarned
                        ? "bg-indigo-50 dark:bg-indigo-900/30"
                        : "bg-slate-100 dark:bg-slate-700/30 opacity-60"
                    }`}
                  >
                    <div className="mr-4 mt-1">
                      {achievementIcons[achievementId]}
                    </div>
                    <div>
                      <h3 className="font-semibold flex items-center">
                        {achievementNames[achievementId]}
                        {isEarned && (
                          <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                            Earned
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {achievementDescriptions[achievementId]}
                      </p>
                      {isEarned && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                          Earned on {formatDate(achievement.earnedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
