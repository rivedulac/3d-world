import { startAnimation } from "./animation";
import { setScene, setWindowResize } from "../background";
import { billboards } from "../billboard";
import { Character } from "../character";
import { addEnvironmentObjects } from "../object";
import { gameInstance, cleanupGameInstance } from "./gameInstance";
import { MessageSystem } from "../message";
import { npcs } from "../npc";
import { ViewResetButton } from "../viewResetButton";
import { VirtualKeyboard } from "../virtualKeyboard";
import { KeyboardButton } from "../keyboardButton";

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

  // First set up the scene and display it - no loading screen yet
  const {
    scene: newScene,
    camera: newCamera,
    renderer: newRenderer,
  } = setScene();

  gameInstance.scene = newScene;
  gameInstance.camera = newCamera;
  gameInstance.renderer = newRenderer;

  // Render once to show the background
  newRenderer.render(newScene, newCamera);

  // Now show the loading screen - after the background is visible
  MessageSystem.getInstance().showLoading();

  // Use requestAnimationFrame to continue initialization on the next frame
  // This ensures the loading screen is rendered
  requestAnimationFrame(() => {
    console.log("Setting up environment objects...");
    addEnvironmentObjects(newScene);
    npcs.forEach((npc) => npc.createMesh(newScene));
    billboards.forEach((billboard) => billboard.createMesh(newScene));

    // Render another frame to show environment objects being added
    newRenderer.render(newScene, newCamera);

    console.log("Setting character...");
    gameInstance.character = new Character(newScene);

    // Initialize keyboard toggle button first
    console.log("Setting up keyboard button...");
    const keyboardButton = KeyboardButton.getInstance();

    // Setup key controls
    console.log("Setting up key controls...");
    gameInstance.character.setupControls();

    // Initialize virtual keyboard
    console.log("Setting up virtual keyboard...");
    const virtualKeyboard = VirtualKeyboard.getInstance();
    virtualKeyboard.setCharacter(gameInstance.character);

    // Initialize view reset button
    console.log("Setting up view reset button...");
    ViewResetButton.getInstance();

    // Adjust for window resize
    console.log("Setting up window resize...");
    setWindowResize(newCamera, newRenderer);

    // Start animation loop
    console.log("Starting animation loop...");
    startAnimation(newScene, newRenderer, gameInstance.character, newCamera);

    gameInstance.initialized = true;
    console.log("Game initialization complete.");

    setTimeout(() => {
      // Hide loading screen
      MessageSystem.getInstance().hideLoading();
      // Show game instructions
      MessageSystem.getInstance().showGameInstructions();

      // For touch devices, show virtual keyboard and set button state by default
      if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
        virtualKeyboard.show();
      }
    }, 1000);

    // Add some additional example instructions
    setTimeout(() => {
      MessageSystem.getInstance().addInstruction(
        "#2 Game Objective",
        `
        <p>Explore Shinyeong land.</p>
      `
      );
    }, 5000);

    setTimeout(() => {
      MessageSystem.getInstance().addInstruction("#3 Test message", "test");
    }, 10000);
  });
}

// Only start the game if we're in the browser environment
if (typeof window !== "undefined") {
  // Ensure the DOM is fully loaded before initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      init();
    });
  } else {
    init();
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
