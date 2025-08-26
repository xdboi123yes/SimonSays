import { useEffect } from "react";
import {
  GameProvider,
  useGame,
  GameState,
  Difficulty,
} from "../contexts/GameContext";
import { TrophyIcon, RefreshCcw, PlayIcon, StopCircle } from "lucide-react";
import GameGrid from "../components/game/GameGrid";
import GameOver from "../components/game/GameOver";
import ThemeDisplay from "../components/game/ThemeDisplay";

// Component for selecting game difficulty (Easy, Medium, Hard)
const DifficultySelector = () => {
  const { difficulty, setDifficulty, state } = useGame();

  // Options available for difficulty selection
  const difficultyOptions: { value: Difficulty; label: string }[] = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ];

  return (
    <div className="flex justify-center mb-4">
      <div className="btn-group inline-flex">
        {difficultyOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setDifficulty(option.value)}
            // Disable difficulty selection if game is in progress
            disabled={state !== GameState.Idle}
            className={`px-4 py-2 text-sm font-medium ${
              difficulty === option.value
                ? "bg-indigo-600 text-white dark:bg-indigo-700"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            } border border-gray-300 dark:border-slate-700 first:rounded-l-md last:rounded-r-md focus:z-10 focus:outline-none transition-colors`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Component for displaying score, high score and game control buttons
const GameControls = () => {
  const { state, score, highScore, startGame, stopGame } = useGame();

  return (
    <div className="flex flex-col items-center mt-4 space-y-3">
      <div className="flex justify-between w-full max-w-xs">
        <div className="text-center">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Score
          </div>
          <div className="text-2xl font-bold">{score}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center">
            <TrophyIcon size={14} className="mr-1 text-yellow-500" /> High Score
          </div>
          <div className="text-2xl font-bold">{highScore}</div>
        </div>
      </div>

      <button
        /* Start, Stop or Restart game based on current state */
        onClick={state === GameState.Idle ? startGame : stopGame}
        /* Disable the button during sequence display to prevent interaction */
        disabled={state === GameState.ShowingSequence}
        className="btn btn-primary w-40 flex items-center justify-center gap-2"
      >
        {state === GameState.Idle ? (
          <>
            <PlayIcon size={16} />
            Start Game
          </>
        ) : state === GameState.GameOver ? (
          <>
            <RefreshCcw size={16} />
            Play Again
          </>
        ) : (
          <>
            <StopCircle size={16} />
            Stop Game
          </>
        )}
      </button>
    </div>
  );
};

// Main game UI layout including grid, controls, and theme
const GameContent = () => {
  const { state } = useGame();

  return (
    <div className="flex flex-col items-center pt-8">
      <h1 className="text-3xl font-bold text-center mb-4">Simon Says</h1>

      <DifficultySelector />

      <div className="relative">
        {/* Interactive grid where sequence is shown and user input is taken */}
        <GameGrid />
        {/* Show "Game Over" overlay when the game ends */}
        {state === GameState.GameOver && <GameOver />}
      </div>

      <GameControls />

      <div className="fixed bottom-4 right-4">
        {/* Floating button to display color theme */}
        <ThemeDisplay />
      </div>
    </div>
  );
};

// Root page for the game, wraps everything inside GameProvider
const PlayPage = () => {
  useEffect(() => {
    // Set browser tab title on page load
    document.title = "Play Simon Says";
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <GameProvider>
        <GameContent />
      </GameProvider>
    </div>
  );
};

export default PlayPage;
