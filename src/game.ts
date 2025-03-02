import { setKeyControls, startAnimation } from "./animation";
import { setScene, setWindowResize } from "./background";
import { setCharacter } from "./character";
import { addEnvironmentObjects } from "./object";
import * as THREE from "three";

// Game variables
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let character: THREE.Mesh;
let isInitialized = false;

// Initialize the game
function init(): void {
  // Prevent double initialization
  if (isInitialized) {
    console.log("Game already initialized, skipping...");
    return;
  }

  const {
    scene: newScene,
    camera: newCamera,
    renderer: newRenderer,
  } = setScene();

  scene = newScene;
  camera = newCamera;
  renderer = newRenderer;

  addEnvironmentObjects(scene);
  character = setCharacter(scene);

  // Setup key controls
  setKeyControls();

  // Adjust for window resize
  setWindowResize(camera, renderer);

  // Start animation loop
  startAnimation(scene, renderer, character, camera);

  isInitialized = true;
  console.log("Game initialization complete.");
}

// Only start the game if we're in the browser environment
if (typeof window !== "undefined") {
  // Ensure the DOM is fully loaded before initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}

// Export for module hot reloading support
export { init };
