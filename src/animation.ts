import * as THREE from "three";

// Define types for global variables
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let character: THREE.Mesh;
let camera: THREE.Camera;
let moveForward: boolean = false;
let moveBackward: boolean = false;
let rotateLeft: boolean = false;
let rotateRight: boolean = false;
let velocity: THREE.Vector3 = new THREE.Vector3();
let rotationSpeed = 0.05;
let movementSpeed = 0.1;
let animationFrameId: number | null = null;

function onKeyDown(event: KeyboardEvent): void {
  switch (event.code) {
    case "KeyW":
      moveForward = true;
      break;
    case "KeyA":
      rotateLeft = true;
      break;
    case "KeyS":
      moveBackward = true;
      break;
    case "KeyD":
      rotateRight = true;
      break;
  }
}

function onKeyUp(event: KeyboardEvent): void {
  switch (event.code) {
    case "KeyW":
      moveForward = false;
      break;
    case "KeyA":
      rotateLeft = false;
      break;
    case "KeyS":
      moveBackward = false;
      break;
    case "KeyD":
      rotateRight = false;
      break;
  }
}

// Track whether we've set up key controls already
let keyControlsSetup = false;

export function setKeyControls(): void {
  // Prevent double-binding of event listeners
  if (keyControlsSetup) {
    console.log("Key controls already set up, skipping...");
    return;
  }

  // Remove any existing event listeners first (safeguard)
  document.removeEventListener("keydown", onKeyDown);
  document.removeEventListener("keyup", onKeyUp);

  // Add new event listeners
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  keyControlsSetup = true;
  console.log("Key controls set up");
}

function updateCharacter(character: THREE.Mesh, camera: THREE.Camera): void {
  // Handle rotation
  if (rotateLeft) {
    character.rotation.y += rotationSpeed;
  }
  if (rotateRight) {
    character.rotation.y -= rotationSpeed;
  }

  // Reset velocity
  velocity.x = 0;
  velocity.z = 0;

  // Calculate movement based on character's rotation
  if (moveForward) {
    velocity.x = Math.sin(character.rotation.y) * movementSpeed;
    velocity.z = Math.cos(character.rotation.y) * movementSpeed;
  }
  if (moveBackward) {
    velocity.x = -Math.sin(character.rotation.y) * movementSpeed;
    velocity.z = -Math.cos(character.rotation.y) * movementSpeed;
  }
  // Move character
  character.position.x -= velocity.x;
  character.position.z -= velocity.z;

  // Update camera position to follow character
  const cameraDistance = 5;
  const cameraHeight = 2;
  camera.position.x =
    character.position.x + Math.sin(character.rotation.y) * cameraDistance;
  camera.position.z =
    character.position.z + Math.cos(character.rotation.y) * cameraDistance;
  camera.position.y = character.position.y + cameraHeight;
  camera.lookAt(character.position);
}

function animationLoop(): void {
  animationFrameId = requestAnimationFrame(animationLoop);
  updateCharacter(character, camera);
  renderer.render(scene, camera);
}

export function stopAnimation(): void {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    console.log("Animation stopped");
  }
}

export function startAnimation(
  parScene: THREE.Scene,
  parRenderer: THREE.WebGLRenderer,
  parCharacter: THREE.Mesh,
  parCamera: THREE.Camera
): void {
  // Stop any existing animation first
  stopAnimation();

  scene = parScene;
  renderer = parRenderer;
  character = parCharacter;
  camera = parCamera;

  console.log("Animation started");
  animationLoop();
}
