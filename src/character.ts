import * as THREE from "three";

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
  movementSpeed: number = 0.1;
  moveForward: boolean = false;
  moveBackward: boolean = false;
  rotateLeft: boolean = false;
  rotateRight: boolean = false;
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
      case "KeyW":
        this.moveForward = true;
        break;
      case "KeyA":
        this.rotateLeft = true;
        break;
      case "KeyS":
        this.moveBackward = true;
        break;
      case "KeyD":
        this.rotateRight = true;
        break;
    }
  }

  // Handle keyup events
  onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case "KeyW":
        this.moveForward = false;
        break;
      case "KeyA":
        this.rotateLeft = false;
        break;
      case "KeyS":
        this.moveBackward = false;
        break;
      case "KeyD":
        this.rotateRight = false;
        break;
    }
  }

  // Update character position and rotation
  update(obstacles: THREE.Object3D[]): void {
    // Handle rotation
    if (this.rotateLeft) {
      this.mesh.rotation.y += this.rotationSpeed;
    }
    if (this.rotateRight) {
      this.mesh.rotation.y -= this.rotationSpeed;
    }

    // Reset velocity
    this.velocity.set(0, 0, 0);

    // Calculate movement based on character's rotation
    if (this.moveForward) {
      this.velocity.x = -Math.sin(this.mesh.rotation.y) * this.movementSpeed;
      this.velocity.z = -Math.cos(this.mesh.rotation.y) * this.movementSpeed;
    }
    if (this.moveBackward) {
      this.velocity.x = Math.sin(this.mesh.rotation.y) * this.movementSpeed;
      this.velocity.z = Math.cos(this.mesh.rotation.y) * this.movementSpeed;
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
      if (this.checkCollisions(obstacles)) {
        // Collision detected, revert position
        this.mesh.position.copy(originalPosition);
        this.mesh.updateMatrix();
        // Update collider to the reverted position
        this.collider.setFromObject(this.mesh);
      }
    }
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
    const cameraHeight = 2;

    camera.position.x =
      this.mesh.position.x + Math.sin(this.mesh.rotation.y) * cameraDistance;
    camera.position.z =
      this.mesh.position.z + Math.cos(this.mesh.rotation.y) * cameraDistance;
    camera.position.y = this.mesh.position.y + cameraHeight;
    camera.lookAt(this.mesh.position);
  }
}
