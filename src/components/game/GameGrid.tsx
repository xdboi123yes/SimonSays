import { useGame } from "../../contexts/GameContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useSound } from "../../contexts/SoundContext";
import { useControls } from "../../contexts/ControlsContext";
import { useEffect } from "react";

interface TileProps {
  index: number;
  color: string;
  isActive: boolean;
  shape: "square" | "circle" | "hexagon";
  onClick: () => void;
}

const Tile = ({ index, color, isActive, shape, onClick }: TileProps) => {
  const { playTileSound } = useSound();
  const { handleTileClick } = useControls();

  const handleClick = () => {
    handleTileClick(index);
    playTileSound(index);
    onClick();
  };

  // Base classes for all tiles
  let classes =
    "transition-all duration-200 cursor-pointer transform hover:brightness-110 ";

  // Add shape-specific classes
  if (shape === "square") {
    classes += "rounded-xl"; // Increased rounded corners for square tiles
  } else if (shape === "circle") {
    classes += "rounded-full";
  } else if (shape === "hexagon") {
    // Hexagon is implemented using clip-path with rounded corners
    classes += "rounded-lg";
  }

  // Add active state with dynamic animation speed
  if (isActive) {
    classes +=
      " ring-4 ring-white dark:ring-slate-900 brightness-125 scale-105 flash-animation";
  }

  return (
    <div
      className={classes}
      style={{
        backgroundColor: color,
        width: "100%",
        height: "100%",
        clipPath:
          shape === "hexagon"
            ? "polygon(50% 5%, 95% 25%, 95% 75%, 50% 95%, 5% 75%, 5% 25%)"
            : undefined,
      }}
      onClick={handleClick}
      data-index={index}
      role="button"
      tabIndex={0}
      aria-label={`Tile ${index + 1}`}
    />
  );
};

const GameGrid = () => {
  const { handleTileClick, activeTile, state, score, multiplier } = useGame();
  const { currentTheme } = useTheme();
  const { handleKeyPress } = useControls();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tileIndex = handleKeyPress(e.key);
      if (tileIndex !== null && tileIndex !== undefined) {
        handleTileClick(tileIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress, handleTileClick]);

  // Create a 3x3 grid
  const gridSize = 3;
  const tiles = Array.from({ length: gridSize * gridSize }, (_, i) => i);

  return (
    <div className="relative">
      <div
        className="grid grid-cols-3 gap-3 w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 game-grid"
        aria-label="Simon Says game grid"
      >
        {tiles.map((tileIndex) => (
          <Tile
            key={tileIndex}
            index={tileIndex}
            color={currentTheme.colors[tileIndex]}
            isActive={activeTile === tileIndex}
            shape={currentTheme.tileShape}
            onClick={() => handleTileClick(tileIndex)}
          />
        ))}
      </div>

      {/* Score Multiplier Display */}
      {state !== "idle" && multiplier > 1 && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
          {multiplier}x Multiplier
        </div>
      )}
    </div>
  );
};

export default GameGrid;
