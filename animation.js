let scene, renderer, character, camera;
let moveForward = false;
let moveBackward = false;
let rotateLeft = false;
let rotateRight = false;
let velocity = new THREE.Vector3();
let rotationSpeed = 0.05;
let movementSpeed = 0.1;

function onKeyDown(event) {
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

function onKeyUp(event) {
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

export function setKeyControls() {
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
}

function updateCharacter(character, camera) {
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

function animationLoop() {
  requestAnimationFrame(animationLoop);
  updateCharacter(character, camera);
  renderer.render(scene, camera);
}

export function startAnimation(parScene, parRenderer, parCharacter, parCamera) {
  scene = parScene;
  renderer = parRenderer;
  character = parCharacter;
  camera = parCamera;
  animationLoop();
}
