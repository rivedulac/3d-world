import { startAnimation } from "./animation";
import { setScene, setWindowResize } from "./background";
import { Character } from "./character";
import { addEnvironmentObjects } from "./object";
import { gameInstance, cleanupGameInstance } from "./gameInstance";
import * as THREE from "three";

// Initialize the game
function init(): void {
  // Prevent double initialization
  if (gameInstance.initialized) {
    console.log("Game already initialized, skipping...");
    return;
  }

  // Clean up any existing instance first
  cleanupGameInstance();

  console.log("Starting game initialization...");

  const {
    scene: newScene,
    camera: newCamera,
    renderer: newRenderer,
  } = setScene();

  gameInstance.scene = newScene;
  gameInstance.camera = newCamera;
  gameInstance.renderer = newRenderer;

  console.log("Setting up environment objects...");
  addEnvironmentObjects(newScene);

  console.log("Setting character...");
  gameInstance.character = new Character(newScene);

  // Setup key controls
  console.log("Setting up key controls...");
  gameInstance.character.setupControls();

  // Adjust for window resize
  console.log("Setting up window resize...");
  setWindowResize(newCamera, newRenderer);

  // Start animation loop
  console.log("Starting animation loop...");
  startAnimation(newScene, newRenderer, gameInstance.character, newCamera);

  gameInstance.initialized = true;
  console.log("Game initialization complete.");
}

// Only start the game if we're in the browser environment
if (typeof window !== "undefined") {
  // Ensure the DOM is fully loaded before initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    // Set a small timeout to ensure any previous instance is fully cleaned up
    setTimeout(init, 100);
  }
}

// Handle hot module replacement for development
// @ts-ignore: Ignoring TS error for module.hot which is provided by webpack
if (module.hot) {
  // @ts-ignore: Ignoring TS error for module.hot
  module.hot.dispose(() => {
    console.log("Hot module replacement - cleaning up");
    cleanupGameInstance();
  });

  // @ts-ignore: Ignoring TS error for module.hot
  module.hot.accept(() => {
    console.log("Hot module replacement - reinitializing");
    setTimeout(() => {
      if (!gameInstance.initialized) {
        init();
      }
    }, 300);
  });
}

// Export for module hot reloading support
export { init, cleanupGameInstance };
