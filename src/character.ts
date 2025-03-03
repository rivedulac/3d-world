import * as THREE from "three";
import { checkNPCInteractions } from "./npc";

// Set the character
export function setCharacter(scene: THREE.Scene): THREE.Mesh {
  console.log("Setting character...");

  // Create character (simple cube for now)
  const characterGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
  const characterMaterial = new THREE.MeshStandardMaterial({ color: 0x00aaff });
  const character = new THREE.Mesh(characterGeometry, characterMaterial);

  character.position.set(0, 0.5, 0);
  scene.add(character);

  return character;
}

export class Character {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  collider: THREE.Box3;
  rotationSpeed: number = 0.05;
  pitchSpeed: number = 0.03;
  movementSpeed: number = 0.1;
  // Movement controls
  moveForward: boolean = false;
  moveBackward: boolean = false;
  // Rotation controls
  yawLeft: boolean = false;
  yawRight: boolean = false;
  pitchUp: boolean = false;
  pitchDown: boolean = false;
  // Max pitch angles in radians
  maxPitchUp: number = Math.PI / 4; // 45 degrees up
  maxPitchDown: number = -Math.PI / 6; // 30 degrees down
  // Current pitch angle
  currentPitch: number = 0;

  keyControlsSetup = false;

  constructor(scene: THREE.Scene) {
    // Create character (simple cube)
    const characterGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
    const characterMaterial = new THREE.MeshStandardMaterial({
      color: 0x00aaff,
    });
    this.mesh = new THREE.Mesh(characterGeometry, characterMaterial);
    this.mesh.position.set(0, 0.5, 0);

    // Create collision box
    this.collider = new THREE.Box3().setFromObject(this.mesh);

    // Initialize velocity
    this.velocity = new THREE.Vector3();

    // Add to scene
    scene.add(this.mesh);

    console.log("Character created");
  }

  // Set up key controls for character
  setupControls(): void {
    if (this.keyControlsSetup) {
      console.log("Key controls already set up, skipping...");
      return;
    }

    // Bind the event handlers to the class instance
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    // Remove any existing event listeners first to prevent multiple bindings
    document.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("keyup", this.onKeyUp);

    // Add event listeners
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);

    this.keyControlsSetup = true;
    console.log("Character controls set up");
  }

  // Handle keydown events
  onKeyDown(event: KeyboardEvent): void {
    switch (event.code) {
      // Movement keys
      case "KeyW":
        this.moveForward = true;
        break;
      case "KeyS":
        this.moveBackward = true;
        break;
      // Rotation keys
      case "ArrowLeft":
        this.yawLeft = true;
        break;
      case "ArrowRight":
        this.yawRight = true;
        break;
      case "ArrowUp":
        this.pitchUp = true;
        break;
      case "ArrowDown":
        this.pitchDown = true;
        break;
    }
  }

  // Handle keyup events
  onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      // Movement keys
      case "KeyW":
        this.moveForward = false;
        break;
      case "KeyS":
        this.moveBackward = false;
        break;
      // Rotation keys
      case "ArrowLeft":
        this.yawLeft = false;
        break;
      case "ArrowRight":
        this.yawRight = false;
        break;
      case "ArrowUp":
        this.pitchUp = false;
        break;
      case "ArrowDown":
        this.pitchDown = false;
        break;
    }
  }

  update(obstacles: THREE.Object3D[]): void {
    // Handle yaw rotation (left/right)
    if (this.yawLeft) {
      this.mesh.rotation.y += this.rotationSpeed;
    }
    if (this.yawRight) {
      this.mesh.rotation.y -= this.rotationSpeed;
    }

    // Handle pitch rotation (up/down) with limits
    if (this.pitchUp) {
      this.currentPitch += this.pitchSpeed;
      if (this.currentPitch > this.maxPitchUp) {
        this.currentPitch = this.maxPitchUp;
      }
    }
    if (this.pitchDown) {
      this.currentPitch -= this.pitchSpeed;
      if (this.currentPitch < this.maxPitchDown) {
        this.currentPitch = this.maxPitchDown;
      }
    }

    // Reset velocity
    this.velocity.set(0, 0, 0);

    // Calculate movement based on character's rotation
    if (this.moveForward) {
      this.velocity.x = Math.sin(this.mesh.rotation.y) * this.movementSpeed;
      this.velocity.z = Math.cos(this.mesh.rotation.y) * this.movementSpeed;
    }
    if (this.moveBackward) {
      this.velocity.x = -Math.sin(this.mesh.rotation.y) * this.movementSpeed;
      this.velocity.z = -Math.cos(this.mesh.rotation.y) * this.movementSpeed;
    }

    // Only proceed with movement if we're actually moving
    if (this.velocity.lengthSq() > 0) {
      // Store original position for collision detection
      const originalPosition = this.mesh.position.clone();

      // Move character
      this.mesh.position.x += this.velocity.x;
      this.mesh.position.z += this.velocity.z;
      this.mesh.updateMatrix();

      // Update collider to the new position
      this.collider.setFromObject(this.mesh);

      // Check collisions with obstacles
      if (this.checkCollisions(obstacles) || this.isOutOfBounds()) {
        // Collision detected or out of bounds, revert position
        this.mesh.position.copy(originalPosition);
        this.mesh.updateMatrix();
        // Update collider to the reverted position
        this.collider.setFromObject(this.mesh);
      }
    }

    // Check for NPC interactions
    checkNPCInteractions(this.mesh.position);
  }

  // Add a new method to check if the character is out of bounds
  isOutOfBounds(): boolean {
    // Get the floor size (50x50 as defined in background.ts)
    const floorSize = 50;
    const halfFloorSize = floorSize / 2;

    // Define a small margin to prevent the character from going exactly to the edge
    const margin = 0.5; // Half the width of the character

    // Check if character is outside the floor boundaries
    if (
      Math.abs(this.mesh.position.x) > halfFloorSize - margin ||
      Math.abs(this.mesh.position.z) > halfFloorSize - margin
    ) {
      return true;
    }

    return false;
  }

  // Check collisions with obstacles
  checkCollisions(obstacles: THREE.Object3D[]): boolean {
    for (const obstacle of obstacles) {
      // Skip non-mesh objects
      if (!(obstacle instanceof THREE.Mesh)) continue;

      // Create a temporary box3 for the obstacle
      const obstacleBox = new THREE.Box3().setFromObject(obstacle);

      // Check for intersection
      if (this.collider.intersectsBox(obstacleBox)) {
        return true;
      }
    }
    return false;
  }

  // Update camera to follow character
  updateCamera(camera: THREE.Camera): void {
    const cameraDistance = 5;

    // Calculate the horizontal position behind the character
    const directionX = Math.sin(this.mesh.rotation.y);
    const directionZ = Math.cos(this.mesh.rotation.y);

    // First position the camera behind the character (without pitch)
    camera.position.x = this.mesh.position.x - directionX * cameraDistance;
    camera.position.z = this.mesh.position.z - directionZ * cameraDistance;

    // Set base camera height (fixed height from character)
    const baseHeight = 1.5; // Height above character
    camera.position.y = this.mesh.position.y + baseHeight;

    // Always look at the character's position (center of view)
    // This keeps the character centered in the view
    camera.lookAt(this.mesh.position);

    // Apply pitch rotation directly to the camera (keeping character centered)
    // Create a pitch rotation matrix
    const pitchQuaternion = new THREE.Quaternion();
    // Create a rotation around the camera's local X axis by the pitch amount
    pitchQuaternion.setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      this.currentPitch
    );

    // Apply the pitch rotation to the camera (maintaining character at center)
    camera.quaternion.multiply(pitchQuaternion);
  }

  // Reset the camera view to its default orientation
  resetCameraView(): void {
    // Reset pitch and yaw to 0 (neutral position)
    this.currentPitch = 0;
    this.mesh.rotation.y = 0;
    console.log("Camera view reset");
  }
}
