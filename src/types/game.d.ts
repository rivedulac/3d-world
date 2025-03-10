/**
 * Global type declarations for game-related functionality
 * These types are available across the application without explicit imports
 */

declare namespace Game {
  /**
   * Game state representation
   */
  interface GameState {
    /** Current game state (loading, running, paused, etc.) */
    status: GameStatus;
    /** Time since game started in seconds */
    elapsedTime: number;
    /** Current frame number */
    frameCount: number;
    /** Delta time between frames in seconds */
    deltaTime: number;
    /** Whether debug mode is enabled */
    debugMode: boolean;
  }

  /**
   * Possible game status values
   */
  type GameStatus = "loading" | "running" | "paused" | "gameOver";

  /**
   * Input state representation
   */
  interface InputState {
    /** Keys currently pressed */
    keys: Record<string, boolean>;
    /** Mouse position coordinates */
    mousePosition: Vector2;
    /** Whether mouse button is pressed */
    mouseDown: boolean;
    /** Touch inputs for mobile */
    touches: TouchInput[];
  }

  /**
   * Touch input information
   */
  interface TouchInput {
    /** Touch identifier */
    id: number;
    /** Touch position */
    position: Vector2;
    /** Whether this is a new touch this frame */
    isNew: boolean;
  }

  /**
   * Game configuration options
   */
  interface GameConfig {
    /** Canvas dimensions */
    resolution: {
      width: number;
      height: number;
    };
    /** Graphics quality preset */
    graphicsQuality: "low" | "medium" | "high" | "ultra";
    /** Audio volume levels */
    audio: {
      master: number;
      music: number;
      effects: number;
    };
    /** Input sensitivity settings */
    controls: {
      mouseSensitivity: number;
      invertY: boolean;
      touchControls: boolean;
    };
    /** Performance settings */
    performance: {
      maxFPS: number;
      enableVSync: boolean;
      enableAntialiasing: boolean;
    };
  }

  /**
   * Game scene information
   */
  interface Scene {
    /** Unique identifier for the scene */
    id: string;
    /** Human-readable name of the scene */
    name: string;
    /** Whether the scene is currently loaded */
    isLoaded: boolean;
    /** Entities in this scene */
    entities: string[];
  }

  /**
   * Asset types supported by the game
   */
  type AssetType = "model" | "texture" | "audio" | "animation" | "shader";

  /**
   * Asset metadata
   */
  interface AssetInfo {
    /** Asset identifier */
    id: string;
    /** Type of asset */
    type: AssetType;
    /** Path to the asset file */
    path: string;
    /** Whether the asset is currently loaded */
    loaded: boolean;
    /** Asset-specific metadata */
    metadata?: Record<string, any>;
  }

  /**
   * Camera configuration
   */
  interface CameraConfig {
    /** Field of view in degrees */
    fov: number;
    /** Near clipping plane */
    near: number;
    /** Far clipping plane */
    far: number;
    /** Camera position */
    position: Vector3;
    /** Look-at target */
    target: Vector3;
    /** Up vector */
    up: Vector3;
    /** Camera movement limits */
    limits?: {
      minDistance?: number;
      maxDistance?: number;
      minPolarAngle?: number;
      maxPolarAngle?: number;
      minAzimuthAngle?: number;
      maxAzimuthAngle?: number;
    };
  }

  /**
   * Time-related utilities
   */
  interface Time {
    /** Current game time in seconds */
    current: number;
    /** Time scale factor (1.0 = normal speed) */
    scale: number;
    /** Time since last frame in seconds */
    delta: number;
    /** Frames per second */
    fps: number;
  }
}

/**
 * Global mathematical types used throughout the game
 */
declare namespace Math {
  /**
   * 2D vector
   */
  interface Vector2 {
    x: number;
    y: number;
  }

  /**
   * 3D vector
   */
  interface Vector3 {
    x: number;
    y: number;
    z: number;
  }

  /**
   * Quaternion for rotations
   */
  interface Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
  }

  /**
   * Color representation
   */
  interface Color {
    r: number;
    g: number;
    b: number;
    a?: number;
  }

  /**
   * Matrix4x4 for transformations
   */
  interface Matrix4 {
    elements: Float32Array | number[];
  }

  /**
   * Bounding box
   */
  interface BoundingBox {
    min: Vector3;
    max: Vector3;
  }

  /**
   * Ray for raycasting
   */
  interface Ray {
    origin: Vector3;
    direction: Vector3;
  }
}

/**
 * Utility types
 */
declare namespace Utils {
  /**
   * Result of a raycast operation
   */
  interface RaycastResult {
    /** Whether the ray hit something */
    hit: boolean;
    /** Distance to the hit point */
    distance: number;
    /** Position of the hit point */
    point?: Math.Vector3;
    /** Normal at the hit point */
    normal?: Math.Vector3;
    /** Entity that was hit */
    entityId?: string;
  }

  /**
   * Event with type safety
   */
  interface TypedEvent<T extends string, D = any> {
    /** Event type */
    type: T;
    /** Event data */
    data: D;
    /** Timestamp when the event was created */
    timestamp: number;
  }

  /**
   * Generic object pool
   */
  interface ObjectPool<T> {
    /** Get an object from the pool */
    acquire(): T;
    /** Return an object to the pool */
    release(obj: T): void;
    /** Current size of the pool */
    size: number;
    /** Maximum size of the pool */
    maxSize: number;
  }
}
