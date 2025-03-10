/**
 * Camera management class for the game engine.
 * Handles camera positioning, movement, and various camera modes.
 * Integrates with the ECS system to follow entities and handle collisions.
 */
import * as THREE from "three";
import { GameWorld } from "../ecs/world";
import { Entity, EntityId, ComponentType } from "../ecs/types";
import { ENTITY_TAGS } from "../../config/constants";
import { Vector3, clamp } from "../../utils/math";
import { Scene } from "./Scene";

/**
 * Camera modes supported by the engine
 */
export enum CameraMode {
  /** First-person view from player's perspective */
  FIRST_PERSON = "firstPerson",
  /** Third-person view following the player */
  FOLLOW = "follow",
  /** Fixed camera position looking at a target */
  FIXED = "fixed",
  /** Orbiting around a target */
  ORBIT = "orbit",
}

/**
 * Configuration for the camera
 */
export interface CameraConfig {
  /** Field of view in degrees */
  fov: number;
  /** Near clipping plane */
  near: number;
  /** Far clipping plane */
  far: number;
  /** Default camera mode */
  defaultMode: CameraMode;
  /** Default camera position */
  defaultPosition: Vector3;
  /** Default target position to look at */
  defaultTarget: Vector3;
  /** Camera movement damping factor (0-1) */
  damping: number;
  /** Distance from target in follow/orbit modes */
  distance: number;
  /** Minimum distance from target */
  minDistance: number;
  /** Maximum distance from target */
  maxDistance: number;
  /** Offset from target in follow mode */
  offset: Vector3;
  /** Height of camera in first-person mode */
  firstPersonHeight: number;
  /** Whether to use collision detection */
  useCollision: boolean;
  /** Collision offset to prevent clipping */
  collisionOffset: number;
  /** Min/max pitch angles (vertical) in degrees */
  pitchLimits: [number, number];
  /** Min/max yaw angles (horizontal) in degrees */
  yawLimits: [number, number];
  /** Pitch angle */
  pitch: number;
  /** Yaw angle */
  yaw: number;
  /** Mouse sensitivity for camera rotation */
  sensitivity: number;
}

/**
 * Default camera configuration
 */
const DEFAULT_CAMERA_CONFIG: CameraConfig = {
  fov: 75,
  near: 0.1,
  far: 1000,
  defaultMode: CameraMode.FOLLOW,
  defaultPosition: new Vector3(0, 5, 10),
  defaultTarget: new Vector3(0, 0, 0),
  damping: 0.1,
  distance: 5,
  minDistance: 2,
  maxDistance: 10,
  offset: new Vector3(0, 2, 0),
  firstPersonHeight: 1.7,
  useCollision: true,
  collisionOffset: 0.5,
  pitchLimits: [-30, 60], // Negative is looking up, positive is looking down
  yawLimits: [-180, 180],
  pitch: 0,
  yaw: 0,
  sensitivity: 0.2,
};

/**
 * Camera class for managing the game camera
 */
export class Camera {
  /** The THREE.js camera instance */
  private camera: THREE.PerspectiveCamera;

  /** Reference to the game world */
  private world: GameWorld;

  /** Current camera configuration */
  private config: CameraConfig;

  /** Current camera mode */
  private mode: CameraMode;

  /** Target entity to follow */
  private targetEntityId: EntityId | null = null;

  /** Current target position */
  private targetPosition: THREE.Vector3;

  /** Current camera position (actual) */
  private currentPosition: THREE.Vector3;

  /** Desired camera position (before constraints and collisions) */
  private desiredPosition: THREE.Vector3;

  /** Whether the camera has been initialized */
  private initialized: boolean = false;

  /** Raycaster for collision detection */
  private raycaster: THREE.Raycaster;

  /** Reference to the scene for raycasting */
  private scene: Scene | null = null;

  /** Temporary vector for calculations */
  private tempVector: THREE.Vector3 = new THREE.Vector3();

  /**
   * Creates a new Camera instance
   * @param world The game world
   * @param config Camera configuration
   */
  constructor(world: GameWorld, config: Partial<CameraConfig> = {}) {
    this.world = world;
    this.config = { ...DEFAULT_CAMERA_CONFIG, ...config };
    this.mode = this.config.defaultMode;

    // Create the THREE.js camera
    this.camera = new THREE.PerspectiveCamera(
      this.config.fov,
      1, // Aspect ratio will be set in initialize()
      this.config.near,
      this.config.far
    );

    // Initialize positions
    this.targetPosition = new THREE.Vector3(
      this.config.defaultTarget.x,
      this.config.defaultTarget.y,
      this.config.defaultTarget.z
    );

    this.currentPosition = new THREE.Vector3(
      this.config.defaultPosition.x,
      this.config.defaultPosition.y,
      this.config.defaultPosition.z
    );

    this.desiredPosition = this.currentPosition.clone();

    // Initialize raycaster for collision detection
    this.raycaster = new THREE.Raycaster();
  }

  /**
   * Initializes the camera with the container dimensions
   * @param containerWidth Width of the container
   * @param containerHeight Height of the container
   * @param scene Optional scene reference for collision detection
   */
  public initialize(
    containerWidth: number,
    containerHeight: number,
    scene?: Scene
  ): void {
    if (this.initialized) {
      console.warn("Camera already initialized");
      return;
    }

    // Set aspect ratio
    this.camera.aspect = containerWidth / containerHeight;
    this.camera.updateProjectionMatrix();

    // Store scene reference for collision detection
    if (scene) {
      this.scene = scene;
    }

    // Find player entity if it exists
    const playerEntities = this.world.queryEntities({
      tags: [ENTITY_TAGS.PLAYER],
    });

    if (playerEntities.length > 0) {
      this.setTarget(playerEntities[0].id);
    }

    // Set initial position and orientation
    this.resetPosition();

    this.initialized = true;
    console.log("Camera initialized");
  }

  /**
   * Updates the camera for the current frame
   * @param deltaTime Time since last frame in seconds
   */
  public update(deltaTime: number): void {
    if (!this.initialized) return;

    // Update target position if following an entity
    if (this.targetEntityId) {
      this.updateTargetPosition();
    }

    // Calculate desired position based on mode
    this.calculateDesiredPosition();

    // Check for collisions
    if (this.config.useCollision) {
      this.handleCollisions();
    }

    // Apply position with damping
    this.applyPositionWithDamping(deltaTime);

    // Update camera look-at
    this.updateOrientation();
  }

  /**
   * Updates the target position based on the target entity
   */
  private updateTargetPosition(): void {
    if (!this.targetEntityId) return;

    const entity = this.world.entities.get(this.targetEntityId);
    if (!entity) {
      // Target entity no longer exists
      this.targetEntityId = null;
      return;
    }

    // TODO: Replace this with actual transform component once implemented
    // For now, use a placeholder method to get position
    const position = this.getEntityPosition(entity);

    if (position) {
      this.targetPosition.set(position.x, position.y, position.z);

      // Add offset
      this.targetPosition.y += this.config.offset.y;
    }
  }

  /**
   * Placeholder method to get entity position
   * TODO: Replace with proper component access when transform component is implemented
   */
  private getEntityPosition(entity: Entity): Vector3 | null {
    // This is a placeholder. In the actual implementation, you would get the
    // position from the entity's transform component.
    const transformComponent = entity.components.get(ComponentType.TRANSFORM);

    if (transformComponent) {
      // Assuming transformComponent has a position property
      // return transformComponent.position;
      return new Vector3(0, 0, 0); // Placeholder
    }

    // Fallback to default position if no transform found
    return this.config.defaultTarget;
  }

  /**
   * Calculates the desired camera position based on the current mode
   */
  private calculateDesiredPosition(): void {
    switch (this.mode) {
      case CameraMode.FIRST_PERSON:
        this.calculateFirstPersonPosition();
        break;
      case CameraMode.FOLLOW:
        this.calculateFollowPosition();
        break;
      case CameraMode.ORBIT:
        this.calculateOrbitPosition();
        break;
      case CameraMode.FIXED:
        // Fixed cameras don't move automatically
        break;
    }
  }

  /**
   * Calculates camera position for first-person mode
   */
  private calculateFirstPersonPosition(): void {
    // In first-person mode, position is at the target plus height offset
    this.desiredPosition.copy(this.targetPosition);
    this.desiredPosition.y += this.config.firstPersonHeight;
  }

  /**
   * Calculates camera position for follow mode
   */
  private calculateFollowPosition(): void {
    // Direction from target to camera (based on yaw angle)
    const angle = (this.config.yaw * Math.PI) / 180;

    // Calculate position behind and above player
    this.tempVector.set(
      Math.sin(angle) * this.config.distance,
      this.config.offset.y,
      Math.cos(angle) * this.config.distance
    );

    // Set desired position
    this.desiredPosition.copy(this.targetPosition).sub(this.tempVector);
  }

  /**
   * Calculates camera position for orbit mode
   */
  private calculateOrbitPosition(): void {
    // Convert pitch and yaw to radians
    const pitchRad = (this.config.pitch * Math.PI) / 180;
    const yawRad = (this.config.yaw * Math.PI) / 180;

    // Calculate position using spherical coordinates
    const x = Math.sin(yawRad) * Math.cos(pitchRad) * this.config.distance;
    const y = Math.sin(pitchRad) * this.config.distance;
    const z = Math.cos(yawRad) * Math.cos(pitchRad) * this.config.distance;

    // Set desired position
    this.desiredPosition.set(
      this.targetPosition.x + x,
      this.targetPosition.y + y,
      this.targetPosition.z + z
    );
  }

  /**
   * Checks for collisions between camera and world objects
   */
  private handleCollisions(): void {
    if (!this.scene) return;

    // Skip collision for first-person camera
    if (this.mode === CameraMode.FIRST_PERSON) return;

    // Direction from target to camera
    this.tempVector
      .copy(this.desiredPosition)
      .sub(this.targetPosition)
      .normalize();

    // Set up raycaster
    this.raycaster.set(this.targetPosition, this.tempVector);
    this.raycaster.far = this.config.distance;

    // Get all objects in the scene
    const threeScene = this.scene.getScene();

    // Perform raycasting against scene objects
    const intersects = this.raycaster.intersectObjects(
      threeScene.children,
      true
    );

    // If collision detected, adjust camera position
    if (intersects.length > 0) {
      const collision = intersects[0];

      // If collision is closer than desired distance, adjust position
      if (
        collision.distance <
        this.config.distance - this.config.collisionOffset
      ) {
        // Set camera just beyond collision point
        const adjustedDistance =
          collision.distance - this.config.collisionOffset;
        this.tempVector.multiplyScalar(adjustedDistance);
        this.desiredPosition.copy(this.targetPosition).add(this.tempVector);
      }
    }
  }

  /**
   * Applies position changes with damping for smooth camera movement
   */
  private applyPositionWithDamping(deltaTime: number): void {
    // Only apply damping in follow or orbit mode
    if (
      this.mode === CameraMode.FIRST_PERSON ||
      this.mode === CameraMode.FIXED
    ) {
      this.currentPosition.copy(this.desiredPosition);
    } else {
      // Calculate damping factor
      const dampingFactor =
        1 - Math.pow(1 - this.config.damping, deltaTime * 60);

      // Interpolate current position towards desired position
      this.currentPosition.lerp(this.desiredPosition, dampingFactor);
    }

    // Apply to THREE.js camera
    this.camera.position.copy(this.currentPosition);
  }

  /**
   * Updates the camera orientation to look at the target
   */
  private updateOrientation(): void {
    // In first-person mode, orientation is controlled by pitch and yaw
    if (this.mode === CameraMode.FIRST_PERSON) {
      // Calculate direction vector from pitch and yaw
      const pitchRad = (this.config.pitch * Math.PI) / 180;
      const yawRad = (this.config.yaw * Math.PI) / 180;

      // Calculate look-at point
      this.tempVector
        .set(
          Math.sin(yawRad) * Math.cos(pitchRad),
          Math.sin(pitchRad),
          Math.cos(yawRad) * Math.cos(pitchRad)
        )
        .add(this.camera.position);

      this.camera.lookAt(this.tempVector);
    } else {
      // All other modes look at the target
      this.camera.lookAt(this.targetPosition);
    }
  }

  /**
   * Sets the target entity for the camera to follow
   * @param entityId ID of the entity to target
   */
  public setTarget(entityId: EntityId): void {
    this.targetEntityId = entityId;
    console.log(`Camera targeting entity: ${entityId}`);
  }

  /**
   * Sets the camera mode
   * @param mode The new camera mode
   */
  public setMode(mode: CameraMode): void {
    this.mode = mode;

    // Reset position when changing modes
    this.resetPosition();

    console.log(`Camera mode set to: ${mode}`);
  }

  /**
   * Resets the camera position based on current mode
   */
  public resetPosition(): void {
    // Calculate initial position based on mode
    switch (this.mode) {
      case CameraMode.FIRST_PERSON:
        this.calculateFirstPersonPosition();
        break;
      case CameraMode.FOLLOW:
        this.calculateFollowPosition();
        break;
      case CameraMode.ORBIT:
        this.calculateOrbitPosition();
        break;
      case CameraMode.FIXED:
        // Use default position for fixed camera
        this.desiredPosition.set(
          this.config.defaultPosition.x,
          this.config.defaultPosition.y,
          this.config.defaultPosition.z
        );
        break;
    }

    // Set current position immediately without damping
    this.currentPosition.copy(this.desiredPosition);
    this.camera.position.copy(this.currentPosition);

    // Update orientation
    this.updateOrientation();
  }

  /**
   * Rotates the camera (adjusts pitch and yaw)
   * @param deltaYaw Change in yaw angle
   * @param deltaPitch Change in pitch angle
   */
  public rotate(deltaYaw: number, deltaPitch: number): void {
    // Apply sensitivity
    deltaYaw *= this.config.sensitivity;
    deltaPitch *= this.config.sensitivity;

    // Update yaw (horizontal rotation)
    this.config.yaw = (this.config.yaw + deltaYaw) % 360;
    if (this.config.yaw < 0) this.config.yaw += 360;

    // Apply yaw limits if specified
    if (this.config.yawLimits[0] !== -180 || this.config.yawLimits[1] !== 180) {
      this.config.yaw = clamp(
        this.config.yaw,
        this.config.yawLimits[0],
        this.config.yawLimits[1]
      );
    }

    // Update pitch (vertical rotation) with limits
    this.config.pitch = clamp(
      this.config.pitch + deltaPitch,
      this.config.pitchLimits[0],
      this.config.pitchLimits[1]
    );
  }

  /**
   * Zooms the camera by adjusting distance
   * @param delta Change in distance (positive = zoom out, negative = zoom in)
   */
  public zoom(delta: number): void {
    // Adjust distance
    this.config.distance = clamp(
      this.config.distance + delta,
      this.config.minDistance,
      this.config.maxDistance
    );
  }

  /**
   * Sets the first-person height
   * @param height New height in world units
   */
  public setFirstPersonHeight(height: number): void {
    this.config.firstPersonHeight = height;

    // Update position if in first-person mode
    if (this.mode === CameraMode.FIRST_PERSON) {
      this.resetPosition();
    }
  }

  /**
   * Sets the camera's field of view
   * @param fov Field of view in degrees
   */
  public setFOV(fov: number): void {
    this.config.fov = fov;
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Sets the camera's follow distance
   * @param distance Follow distance
   */
  public setDistance(distance: number): void {
    this.config.distance = clamp(
      distance,
      this.config.minDistance,
      this.config.maxDistance
    );
  }

  /**
   * Sets the camera's damping factor
   * @param damping Damping factor (0-1)
   */
  public setDamping(damping: number): void {
    this.config.damping = clamp(damping, 0, 1);
  }

  /**
   * Sets whether collision detection is enabled
   * @param enabled Whether collision is enabled
   */
  public setCollisionEnabled(enabled: boolean): void {
    this.config.useCollision = enabled;
  }

  /**
   * Sets the camera sensitivity
   * @param sensitivity New sensitivity value
   */
  public setSensitivity(sensitivity: number): void {
    this.config.sensitivity = Math.max(0.01, sensitivity);
  }

  /**
   * Handles window resize
   * @param width New container width
   * @param height New container height
   */
  public handleResize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Gets the THREE.js camera instance
   * @returns THREE.js camera
   */
  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  /**
   * Gets the current camera mode
   * @returns Current camera mode
   */
  public getMode(): CameraMode {
    return this.mode;
  }

  /**
   * Gets the current camera configuration
   * @returns Camera configuration
   */
  public getConfig(): CameraConfig {
    return { ...this.config };
  }

  /**
   * Gets the current target entity ID
   * @returns Target entity ID or null if no target
   */
  public getTargetId(): EntityId | null {
    return this.targetEntityId;
  }

  /**
   * Gets whether the camera is initialized
   * @returns True if initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }
}
