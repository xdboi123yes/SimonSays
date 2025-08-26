import { useState, useEffect } from "react";
import { Loader2, Trophy, Medal } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Difficulty } from "../contexts/GameContext";
import { useAuth } from "../contexts/AuthContext";

// Defines the shape of leaderboard data shown to the user
interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  difficulty: Difficulty;
  createdAt: string;
}

const Leaderboard = () => {
  const { session } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Difficulty | "all">("all");
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard data whenever the session or filter changes
  useEffect(() => {
    document.title = "Simon Says - Leaderboard";
    if (session) {
      fetchLeaderboard();
    }
  }, [filter, session]);

  const fetchLeaderboard = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      // Supabase query: join with users table to get username for each high score entry
      let query = supabase
        .from("high_scores")
        .select(
          `
          id,
          score,
          difficulty,
          created_at,
          user_id,
          users!high_scores_user_id_fkey (
            username
          )
        `,
        )
        .order("score", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20);

      // Apply difficulty filter if a specific difficulty is selected
      if (filter !== "all") {
        query = query.eq("difficulty", filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Format raw Supabase data to match LeaderboardEntry structure
      const formattedEntries: LeaderboardEntry[] = data.map((entry: any) => ({
        id: entry.id,
        username: entry.users.username,
        score: entry.score,
        difficulty: entry.difficulty as Difficulty,
        createdAt: entry.created_at,
      }));

      setEntries(formattedEntries);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      setError("Failed to load leaderboard data");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Returns tailwind color class based on difficulty level
  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case "easy":
        return "text-green-500";
      case "medium":
        return "text-amber-500";
      case "hard":
        return "text-red-500";
      default:
        return "";
    }
  };

  // Format ISO date string into human-readable short format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // If the user is not signed in, show a message instead of the leaderboard
  if (!session) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Please sign in to view the leaderboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-center mb-8">
        <Trophy className="text-yellow-500 h-8 w-8 mr-3" />
        <h1 className="text-3xl font-bold">Leaderboard</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`btn ${filter === "all" ? "btn-primary" : "btn-secondary"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("easy")}
              className={`btn ${filter === "easy" ? "btn-success" : "btn-secondary"}`}
            >
              Easy
            </button>
            <button
              onClick={() => setFilter("medium")}
              className={`btn ${filter === "medium" ? "bg-amber-500 text-white hover:bg-amber-600" : "btn-secondary"}`}
            >
              Medium
            </button>
            <button
              onClick={() => setFilter("hard")}
              className={`btn ${filter === "hard" ? "bg-red-500 text-white hover:bg-red-600" : "btn-secondary"}`}
            >
              Hard
            </button>
          </div>
        </div>

        {error ? (
          <div className="text-center py-12 text-error-600 dark:text-error-400">
            {error}
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            No scores yet. Be the first to set a record!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {/* Render each leaderboard row with rank, username, score, difficulty and date */}
                {entries.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        {/* Display gold, silver, bronze icons for top 3 ranks */}
                        {index === 0 && (
                          <Medal className="h-5 w-5 text-yellow-500 mr-1" />
                        )}
                        {index === 1 && (
                          <Medal className="h-5 w-5 text-slate-400 mr-1" />
                        )}
                        {index === 2 && (
                          <Medal className="h-5 w-5 text-amber-600 mr-1" />
                        )}
                        {index > 2 && <span className="ml-2">{index + 1}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {entry.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                      {entry.score}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`${getDifficultyColor(entry.difficulty)} font-medium`}
                      >
                        {entry.difficulty.charAt(0).toUpperCase() +
                          entry.difficulty.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(entry.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
