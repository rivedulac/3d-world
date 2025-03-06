import React from "react";
import * as THREE from "three";
import { checkNPCInteractions } from "../npc";

const ROTATION_SPEED = 0.05;
const PITCH_SPEED = 0.03;
const MOVEMENT_SPEED = 0.1;

interface CharacterProps {
  scene: THREE.Scene;
  onCharacterCreated?: (character: Character) => void;
}

export class Character extends React.Component<CharacterProps> {
  public rotationSpeed: number = ROTATION_SPEED;
  public pitchSpeed: number = PITCH_SPEED;
  public movementSpeed: number = MOVEMENT_SPEED;
  public keyControlsSetup: boolean = false;
  public setupControls: () => void = this.componentDidMount.bind(this);
  public mesh: THREE.Mesh;
  public velocity: THREE.Vector3;
  public collider: THREE.Box3;

  // Movement controls
  public moveForward: boolean = false;
  public moveBackward: boolean = false;
  // Rotation controls
  public yawLeft: boolean = false;
  public yawRight: boolean = false;
  public pitchUp: boolean = false;
  public pitchDown: boolean = false;
  // Max pitch angles in radians
  public maxPitchUp: number = Math.PI / 4; // 45 degrees up
  public maxPitchDown: number = -Math.PI / 6; // 30 degrees down
  // Current pitch angle
  public currentPitch: number = 0;

  constructor(props: CharacterProps) {
    super(props);
    const { scene } = this.props;

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
    this.props.onCharacterCreated?.(this);
  }

  componentDidMount(): void {
    if (this.keyControlsSetup) {
      console.log("Key controls already set up, skipping...");
      return;
    }

    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);

    this.keyControlsSetup = true;
    console.log("Character controls set up");
  }

  componentWillUnmount(): void {
    // Clean up event listeners
    document.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("keyup", this.onKeyUp);
  }

  public onKeyDown = (event: KeyboardEvent): void => {
    switch (event.code) {
      case "KeyW":
        this.moveForward = true;
        break;
      case "KeyS":
        this.moveBackward = true;
        break;
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
  };

  public onKeyUp = (event: KeyboardEvent): void => {
    switch (event.code) {
      case "KeyW":
        this.moveForward = false;
        break;
      case "KeyS":
        this.moveBackward = false;
        break;
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
  };

  public handleRotation(): void {
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
  }

  public calculateVelocity(): void {
    this.velocity.set(0, 0, 0);

    if (this.moveForward) {
      this.velocity.x = Math.sin(this.mesh.rotation.y) * this.movementSpeed;
      this.velocity.z = Math.cos(this.mesh.rotation.y) * this.movementSpeed;
    }
    if (this.moveBackward) {
      this.velocity.x = -Math.sin(this.mesh.rotation.y) * this.movementSpeed;
      this.velocity.z = -Math.cos(this.mesh.rotation.y) * this.movementSpeed;
    }
  }

  public handleMovement(obstacles: THREE.Object3D[]): void {
    if (this.velocity.lengthSq() > 0) {
      const originalPosition = this.mesh.position.clone();

      this.mesh.position.x += this.velocity.x;
      this.mesh.position.z += this.velocity.z;
      this.mesh.updateMatrix();

      this.collider.setFromObject(this.mesh);

      if (this.checkCollisions(obstacles) || this.isOutOfBounds()) {
        this.mesh.position.copy(originalPosition);
        this.mesh.updateMatrix();
        this.collider.setFromObject(this.mesh);
      }
    }
  }

  public update(obstacles: THREE.Object3D[]): void {
    this.handleRotation();
    this.calculateVelocity();
    this.handleMovement(obstacles);
    checkNPCInteractions(this.mesh.position);
  }

  public isOutOfBounds(): boolean {
    const floorSize = 50;
    const halfFloorSize = floorSize / 2;
    const margin = 0.5; // Half the width of the character

    if (
      Math.abs(this.mesh.position.x) > halfFloorSize - margin ||
      Math.abs(this.mesh.position.z) > halfFloorSize - margin
    ) {
      return true;
    }

    return false;
  }

  public checkCollisions(obstacles: THREE.Object3D[]): boolean {
    for (const obstacle of obstacles) {
      if (!(obstacle instanceof THREE.Mesh)) continue;

      const obstacleBox = new THREE.Box3().setFromObject(obstacle);

      if (this.collider.intersectsBox(obstacleBox)) {
        return true;
      }
    }
    return false;
  }

  public updateCamera(camera: THREE.Camera): void {
    const cameraDistance = 5;

    // Calculate the horizontal position behind the character
    const directionX = Math.sin(this.mesh.rotation.y);
    const directionZ = Math.cos(this.mesh.rotation.y);

    // First position the camera behind the character (without pitch)
    camera.position.x = this.mesh.position.x - directionX * cameraDistance;
    camera.position.z = this.mesh.position.z - directionZ * cameraDistance;

    // Set base camera height
    const baseHeight = 1.5;
    camera.position.y = this.mesh.position.y + baseHeight;

    // Always look at the character's position
    camera.lookAt(this.mesh.position);

    // Apply pitch rotation
    const pitchQuaternion = new THREE.Quaternion();
    pitchQuaternion.setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      this.currentPitch
    );

    camera.quaternion.multiply(pitchQuaternion);
  }

  public resetCameraView(): void {
    this.currentPitch = 0;
    this.mesh.rotation.y = 0;
    console.log("Camera view reset");
  }
}

// Helper function to create a character instance
export function createCharacter(scene: THREE.Scene): Character {
  const characterComponent = new Character({ scene });
  return characterComponent;
}
