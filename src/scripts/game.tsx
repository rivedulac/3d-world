import React from "react";
import { createRoot } from "react-dom/client";
import * as THREE from "three";
import { Animation } from "../core/animation";
import { setScene } from "../scene/background";
import { Character } from "../entities/character";
import { Billboard, createBillboards } from "../scene/billboard";
import { MessageSystem } from "../message";
import { npcs } from "../npc";
import { addEnvironmentObjects } from "../object";
import ViewResetButton from "../ui/buttons/viewResetButton";
import { VirtualKeyboard } from "../ui/controls/virtualKeyboard";
import { KeyboardButton } from "../keyboardButton";

const Game: React.FC = () => {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [gameObjects, setGameObjects] = React.useState<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    character: Character;
    billboards: Billboard[];
  } | null>(null);

  React.useEffect(() => {
    const initGame = async () => {
      if (isInitialized) return;

      console.log("Starting game initialization...");

      // First set up the scene and display it
      const { scene, camera, renderer } = setScene();

      // Render once to show the background
      renderer.render(scene, camera);

      // Show loading screen
      MessageSystem.getInstance().showLoading();

      // Set up environment
      console.log("Setting up environment objects...");
      addEnvironmentObjects(scene);
      npcs.forEach((npc) => npc.createMesh(scene));
      const billboards = createBillboards(scene);

      // Render another frame to show environment objects
      renderer.render(scene, camera);

      // Create character and set up key controls
      console.log("Setting character...");
      const character = new Character({ scene });

      // Initialize keyboard toggle button
      console.log("Setting up keyboard button...");
      const keyboardButton = KeyboardButton.getInstance();

      // Initialize virtual keyboard
      console.log("Setting up virtual keyboard...");
      const virtualKeyboard = <VirtualKeyboard character={character} />;

      setGameObjects({
        scene,
        camera,
        renderer,
        character,
        billboards,
      });

      setIsInitialized(true);
      console.log("Game initialization complete.");

      setTimeout(() => {
        // Hide loading screen
        MessageSystem.getInstance().hideLoading();
        // Show game instructions
        MessageSystem.getInstance().showGameInstructions();
      }, 1000);
    };

    initGame();
  }, [isInitialized]);

  if (!gameObjects) {
    return <div>Loading...</div>;
  }

  const { scene, camera, renderer, character, billboards } = gameObjects;

  return (
    <React.Fragment>
      <Animation
        scene={scene}
        camera={camera}
        renderer={renderer}
        character={character}
        billboards={billboards}
      />
      <ViewResetButton />
    </React.Fragment>
  );
};

// Initialize the game when DOM is ready
const initializeGame = () => {
  const container = document.getElementById("gameCanvas");
  if (!container) {
    console.error("Game container not found");
    return;
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Game />
    </React.StrictMode>
  );
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeGame);
} else {
  initializeGame();
}

// Handle hot module replacement for development
declare const module: {
  hot?: {
    accept(path?: string, callback?: () => void): void;
    dispose(callback: (data: any) => void): void;
  };
};

if (module.hot) {
  module.hot.accept();
}

export default Game;
