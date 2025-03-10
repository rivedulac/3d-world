import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { GameLoop } from "./GameLoop";
import { GAME_CANVAS_ID } from "../../config/constants";
import { Time } from "./Time";
import { GameWorld } from "../ecs/world";
declare const module: {
  hot?: {
    accept: () => void;
  };
};

const Game: React.FC = () => {
  useEffect(() => {
    const time = new Time();
    const world = new GameWorld();
    const gameLoop = new GameLoop(world, time);
    gameLoop.start();

    return () => {
      gameLoop.destroy();
    };
  }, []);

  return (
    <div
      id="game-container"
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#000",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "36px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      Welcome
    </div>
  );
};

// Initialize React app
const container = document.getElementById(GAME_CANVAS_ID);
if (!container) {
  console.error("Game container not found");
} else {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Game />
    </React.StrictMode>
  );
}

// Handle hot module replacement
if (module.hot) {
  module.hot.accept();
}

export default Game;
