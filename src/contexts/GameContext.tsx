import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import { useSound } from "./SoundContext";
import { useTheme } from "./ThemeContext";
import { supabase } from "../lib/supabase";

// Game difficulty levels
export type Difficulty = "easy" | "medium" | "hard";

// Different states the game can be in
export enum GameState {
  Idle = "idle",
  ShowingSequence = "showing",
  WaitingForInput = "waiting",
  GameOver = "gameover",
}

interface GameContextType {
  state: GameState;
  sequence: number[];
  userSequence: number[];
  score: number;
  highScore: number;
  activeTile: number | null;
  difficulty: Difficulty;
  multiplier: number;
  handleTileClick: (tileIndex: number) => void;
  startGame: () => void;
  stopGame: () => void;
  resetGame: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<GameState>(GameState.Idle);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [multiplier, setMultiplier] = useState(1);
  // Store all timeouts to clean them up when needed
  const sequenceTimeouts = useRef<number[]>([]);
  const { user, session } = useAuth();
  const { playTileSound } = useSound();
  const { currentTheme } = useTheme();

  // Fetch high score when user, session or difficulty changes
  useEffect(() => {
    if (user?.id && session) {
      fetchHighScore();
    }
  }, [user?.id, session, difficulty]);

  // Retrieve the user's high score from the database
  const fetchHighScore = async () => {
    try {
      const { data, error } = await supabase
        .from("high_scores")
        .select("score")
        .eq("user_id", user?.id)
        .eq("difficulty", difficulty)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setHighScore(data?.score ?? 0);
    } catch (error) {
      console.error("Failed to fetch high score:", error);
    }
  };

  // Save high score to the database
  const saveHighScore = async (newScore: number) => {
    if (!user?.id || !session) return;

    try {
      const { error } = await supabase.from("high_scores").upsert(
        {
          user_id: user.id,
          score: newScore,
          difficulty,
        },
        {
          onConflict: "user_id,difficulty",
        },
      );

      if (error) throw error;
    } catch (error) {
      console.error("Failed to save high score:", error);
    }
  };

  // Clear all pending timeouts
  const cleanup = () => {
    sequenceTimeouts.current.forEach((timeout) => window.clearTimeout(timeout));
    sequenceTimeouts.current = [];
  };

  // Get timing and scoring parameters based on difficulty level
  const getDifficultySettings = () => {
    switch (difficulty) {
      case "easy":
        return { flashDelay: 400, pauseDelay: 400, baseMultiplier: 1 };
      case "medium":
        return { flashDelay: 300, pauseDelay: 300, baseMultiplier: 2 };
      case "hard":
        return { flashDelay: 200, pauseDelay: 200, baseMultiplier: 3 };
      default:
        return { flashDelay: 400, pauseDelay: 400, baseMultiplier: 1 };
    }
  };

  // Calculate score multiplier based on sequence length and difficulty
  const calculateMultiplier = (
    sequenceLength: number,
    baseMultiplier: number,
  ) => {
    let lengthMultiplier = 1;
    if (sequenceLength >= 20) lengthMultiplier = 6;
    else if (sequenceLength >= 16) lengthMultiplier = 5;
    else if (sequenceLength >= 13) lengthMultiplier = 4;
    else if (sequenceLength >= 10) lengthMultiplier = 3;
    else if (sequenceLength >= 5) lengthMultiplier = 2;
    return baseMultiplier * lengthMultiplier;
  };

  // Initialize and start a new game
  const startGame = () => {
    cleanup();
    setState(GameState.Idle);
    setSequence([]);
    setUserSequence([]);
    setScore(0);
    setMultiplier(getDifficultySettings().baseMultiplier);
    setActiveTile(null);

    // Add a small delay to ensure state is reset before starting
    window.setTimeout(() => {
      const newTile = Math.floor(Math.random() * 9);
      setSequence([newTile]);
      playSequence([newTile]);
    }, 100);
  };

  // End the current game
  const stopGame = () => {
    cleanup();
    handleGameOver();
  };

  // Reset game state without starting a new game
  const resetGame = () => {
    cleanup();
    setSequence([]);
    setUserSequence([]);
    setScore(0);
    setMultiplier(getDifficultySettings().baseMultiplier);
    setActiveTile(null);
    setState(GameState.Idle);
  };

  // Add a new random tile to the sequence
  const addToSequence = () => {
    const newTile = Math.floor(Math.random() * 9);
    const newSequence = [...sequence, newTile];
    setSequence(newSequence);
    setUserSequence([]);
    playSequence(newSequence);
  };

  // Display the sequence to the player
  const playSequence = (sequence: number[]) => {
    setState(GameState.ShowingSequence);
    const { flashDelay, pauseDelay } = getDifficultySettings();

    sequence.forEach((tileIndex, i) => {
      const flashTimeout = window.setTimeout(
        () => {
          setActiveTile(tileIndex);
          playTileSound(tileIndex);

          const clearTimeout = window.setTimeout(() => {
            setActiveTile(null);

            if (i === sequence.length - 1) {
              setState(GameState.WaitingForInput);
            }
          }, flashDelay);

          sequenceTimeouts.current.push(clearTimeout);
        },
        i * (flashDelay + pauseDelay),
      );

      sequenceTimeouts.current.push(flashTimeout);
    });
  };

  // Process player's tile click
  const handleTileClick = (tileIndex: number) => {
    if (state !== GameState.WaitingForInput) return;

    const newUserSequence = [...userSequence, tileIndex];
    setUserSequence(newUserSequence);

    const { flashDelay } = getDifficultySettings();
    setActiveTile(tileIndex);
    playTileSound(tileIndex);

    const flashTimeout = window.setTimeout(
      () => setActiveTile(null),
      flashDelay,
    );
    sequenceTimeouts.current.push(flashTimeout);

    // Check if player made a mistake
    if (tileIndex !== sequence[userSequence.length]) {
      cleanup();
      handleGameOver();
      return;
    }

    // Player completed the current sequence correctly
    if (newUserSequence.length === sequence.length) {
      cleanup();

      // Update score and multiplier
      const { baseMultiplier } = getDifficultySettings();
      const newMultiplier = calculateMultiplier(
        sequence.length,
        baseMultiplier,
      );
      setMultiplier(newMultiplier);

      const basePoints = 1;
      const newScore = score + Math.round(basePoints * newMultiplier);
      setScore(newScore);

      // Update high score if needed
      if (newScore > highScore) {
        setHighScore(newScore);
        saveHighScore(newScore);
      }

      // Add next tile to sequence after a delay
      const nextSequenceTimeout = window.setTimeout(() => {
        addToSequence();
      }, 1000);
      sequenceTimeouts.current.push(nextSequenceTimeout);
    }
  };

  // Handle game over and save stats
  const handleGameOver = async () => {
    cleanup();
    setState(GameState.GameOver);

    try {
      if (!user?.id || !session) return;

      // Use the default theme UUID if the current theme is the default theme
      const themeId =
        currentTheme.id === "default"
          ? "00000000-0000-0000-0000-000000000000"
          : currentTheme.id;

      const { error: gameError } = await supabase.from("games").insert({
        user_id: user.id,
        score,
        difficulty,
        theme_id: themeId,
        streak: sequence.length - 1,
      });

      if (gameError) {
        console.error("Failed to save game:", gameError);
        throw gameError;
      }
    } catch (error) {
      console.error("Failed to save game stats:", error);
    }
  };

  // Context value to be provided
  const value = {
    state,
    sequence,
    userSequence,
    score,
    highScore,
    activeTile,
    difficulty,
    multiplier,
    handleTileClick,
    startGame,
    stopGame,
    resetGame,
    setDifficulty,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Custom hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
