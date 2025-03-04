import React from "react";

interface GameControlsProps {
  version: string;
}

export const GameControls: React.FC<GameControlsProps> = ({ version }) => {
  return (
    <div className="game-controls">
      <h3>🎮 Game Controls 🎮</h3>
      <p>Version: {version}</p>
      <div className="controls-section">
        <h4>Movement:</h4>
        <p>🇼 Move Forward</p>
        <p>🇸 Move Backward</p>
      </div>
      <div className="controls-section">
        <h4>Rotation:</h4>
        <p>◀️ ▶️ Turn Left/Right</p>
        <p>🔼 🔽 Look Up/Down</p>
      </div>
    </div>
  );
};

export default GameControls;
