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

// Initialize the game
function init(): void {
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
