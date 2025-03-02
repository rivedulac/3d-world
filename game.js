import { setKeyControls, startAnimation } from "./animation.js";
import { setScene, setWindowResize } from "./background.js";
import { setCharacter } from "./character.js";
import { addEnvironmentObjects } from "./object.js";

// Game variables
let scene, camera, renderer;
let character;

// Initialize the game
function init() {
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
}

// Start the game
init();
