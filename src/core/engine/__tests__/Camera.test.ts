/**
 * @jest-environment jsdom
 */
import { Camera, CameraMode } from "../Camera";
import * as THREE from "three";
import { GameWorld } from "../../ecs/world";
import { Entity, EntityId } from "../../ecs/types";
import { Scene } from "../Scene";

// Mock dependencies
jest.mock("three", () => {
  // Create mock classes for THREE
  return {
    PerspectiveCamera: jest.fn().mockImplementation(() => ({
      position: {
        x: 0,
        y: 0,
        z: 0,
        copy: jest.fn(),
        set: jest.fn(),
      },
      lookAt: jest.fn(),
      aspect: 1,
      fov: 75,
      updateProjectionMatrix: jest.fn(),
    })),
    Vector3: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      z: 0,
      set: jest.fn().mockReturnThis(),
      copy: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnThis(),
      sub: jest.fn().mockReturnThis(),
      add: jest.fn().mockReturnThis(),
      normalize: jest.fn().mockReturnThis(),
      multiplyScalar: jest.fn().mockReturnThis(),
      lerp: jest.fn().mockReturnThis(),
    })),
    Raycaster: jest.fn().mockImplementation(() => ({
      set: jest.fn(),
      far: 0,
      intersectObjects: jest.fn().mockReturnValue([]),
    })),
  };
});

jest.mock("../../ecs/world", () => {
  // Import the real ENTITY_TAGS
  const { ENTITY_TAGS } = jest.requireActual("../../../config/constants");

  // Mock entity with tags
  const mockEntity: Entity = {
    id: "player-entity",
    active: true,
    components: new Map(),
    tags: new Set([ENTITY_TAGS.PLAYER]),
  };

  // Mock entities map
  const mockEntities = new Map<EntityId, Entity>([
    ["player-entity", mockEntity],
  ]);

  return {
    GameWorld: jest.fn().mockImplementation(() => ({
      entities: mockEntities,
      queryEntities: jest.fn().mockImplementation((options) => {
        if (options.tags && options.tags.includes(ENTITY_TAGS.PLAYER)) {
          return [mockEntity];
        }
        return [];
      }),
    })),
  };
});

jest.mock("../Scene", () => {
  return {
    Scene: jest.fn().mockImplementation(() => ({
      getScene: jest.fn().mockReturnValue({
        children: [],
      }),
    })),
  };
});

describe("Camera Class", () => {
  let camera: Camera;
  let world: GameWorld;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create dependencies
    world = new GameWorld();

    // Create camera with default config
    camera = new Camera(world);
  });

  describe("Initialization", () => {
    test("should initialize with default configuration", () => {
      expect(camera).toBeDefined();
      expect(THREE.PerspectiveCamera).toHaveBeenCalled();
      expect(THREE.Raycaster).toHaveBeenCalled();
    });

    test("should initialize with custom configuration", () => {
      const customConfig = {
        fov: 90,
        near: 0.2,
        far: 500,
        defaultMode: CameraMode.FIRST_PERSON,
      };

      const customCamera = new Camera(world, customConfig);

      expect(customCamera).toBeDefined();
      expect(customCamera.getConfig().fov).toBe(90);
      expect(customCamera.getConfig().near).toBe(0.2);
      expect(customCamera.getConfig().far).toBe(500);
      expect(customCamera.getMode()).toBe(CameraMode.FIRST_PERSON);
    });

    test("should initialize with container dimensions", () => {
      const scene = new Scene(world);

      camera.initialize(800, 600, scene);

      // Get the THREE.js camera
      const threeCamera = camera.getCamera();

      expect(threeCamera.aspect).toBe(800 / 600);
      expect(threeCamera.updateProjectionMatrix).toHaveBeenCalled();
      expect(camera.isInitialized()).toBe(true);
    });

    test("should find and target player entity on initialization", () => {
      const scene = new Scene(world);

      // Spy on setTarget method
      const setTargetSpy = jest.spyOn(camera, "setTarget");

      camera.initialize(800, 600, scene);

      // Verify setTarget was called with player entity ID
      expect(setTargetSpy).toHaveBeenCalledWith("player-entity");
      expect(camera.getTargetId()).toBe("player-entity");

      // Restore spy
      setTargetSpy.mockRestore();
    });

    test("should handle when already initialized", () => {
      const scene = new Scene(world);

      // First initialization
      camera.initialize(800, 600, scene);

      // Spy on console.warn
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      // Try to initialize again
      camera.initialize(800, 600, scene);

      expect(consoleWarnSpy).toHaveBeenCalledWith("Camera already initialized");

      // Restore console.warn
      consoleWarnSpy.mockRestore();
    });
  });

  describe("Camera Mode Management", () => {
    beforeEach(() => {
      // Initialize camera
      const scene = new Scene(world);
      camera.initialize(800, 600, scene);
    });

    test("should get current camera mode", () => {
      expect(camera.getMode()).toBe(CameraMode.FOLLOW); // Default mode
    });

    test("should set camera mode", () => {
      // Spy on resetPosition to verify it's called
      const resetPositionSpy = jest.spyOn(camera as any, "resetPosition");

      camera.setMode(CameraMode.FIRST_PERSON);

      expect(camera.getMode()).toBe(CameraMode.FIRST_PERSON);
      expect(resetPositionSpy).toHaveBeenCalled();

      // Restore spy
      resetPositionSpy.mockRestore();
    });
  });

  describe("Camera Update", () => {
    beforeEach(() => {
      // Initialize camera
      const scene = new Scene(world);
      camera.initialize(800, 600, scene);
    });

    test("should update camera position when target entity exists", () => {
      // Set up spies on private methods
      const updateTargetPositionSpy = jest.spyOn(
        camera as any,
        "updateTargetPosition"
      );
      const calculateDesiredPositionSpy = jest.spyOn(
        camera as any,
        "calculateDesiredPosition"
      );
      const applyPositionWithDampingSpy = jest.spyOn(
        camera as any,
        "applyPositionWithDamping"
      );
      const updateOrientationSpy = jest.spyOn(
        camera as any,
        "updateOrientation"
      );

      // Update camera
      camera.update(0.016);

      // Verify methods called
      expect(updateTargetPositionSpy).toHaveBeenCalled();
      expect(calculateDesiredPositionSpy).toHaveBeenCalled();
      expect(applyPositionWithDampingSpy).toHaveBeenCalledWith(0.016);
      expect(updateOrientationSpy).toHaveBeenCalled();

      // Restore spies
      updateTargetPositionSpy.mockRestore();
      calculateDesiredPositionSpy.mockRestore();
      applyPositionWithDampingSpy.mockRestore();
      updateOrientationSpy.mockRestore();
    });

    test("should not update if not initialized", () => {
      // Create new camera without initializing
      const uninitializedCamera = new Camera(world);

      // Spy on private method
      const updateTargetPositionSpy = jest.spyOn(
        uninitializedCamera as any,
        "updateTargetPosition"
      );

      // Update camera
      uninitializedCamera.update(0.016);

      // Verify method not called
      expect(updateTargetPositionSpy).not.toHaveBeenCalled();

      // Restore spy
      updateTargetPositionSpy.mockRestore();
    });
  });

  describe("Camera Position Calculations", () => {
    beforeEach(() => {
      // Initialize camera
      const scene = new Scene(world);
      camera.initialize(800, 600, scene);
    });

    test("should calculate position for different camera modes", () => {
      // Set up spies on private methods
      const firstPersonSpy = jest.spyOn(
        camera as any,
        "calculateFirstPersonPosition"
      );
      const followSpy = jest.spyOn(camera as any, "calculateFollowPosition");
      const orbitSpy = jest.spyOn(camera as any, "calculateOrbitPosition");

      // Test first-person mode
      camera.setMode(CameraMode.FIRST_PERSON);
      (camera as any).calculateDesiredPosition();
      expect(firstPersonSpy).toHaveBeenCalled();

      // Test follow mode
      camera.setMode(CameraMode.FOLLOW);
      (camera as any).calculateDesiredPosition();
      expect(followSpy).toHaveBeenCalled();

      // Test orbit mode
      camera.setMode(CameraMode.ORBIT);
      (camera as any).calculateDesiredPosition();
      expect(orbitSpy).toHaveBeenCalled();

      // Restore spies
      firstPersonSpy.mockRestore();
      followSpy.mockRestore();
      orbitSpy.mockRestore();
    });

    test("should handle first-person position calculation", () => {
      // Mock target position and desired position
      (camera as any).targetPosition = new THREE.Vector3();
      const mockDesiredPosition = (camera as any).desiredPosition;

      // Call method
      (camera as any).calculateFirstPersonPosition();

      // Verify desired position was set correctly
      expect(mockDesiredPosition.copy).toHaveBeenCalled();
    });

    test("should handle follow position calculation", () => {
      // Mock required vectors
      const mockTempVector = (camera as any).tempVector;
      const mockDesiredPosition = (camera as any).desiredPosition;

      // Call method
      (camera as any).calculateFollowPosition();

      // Verify calculations were performed
      expect(mockTempVector.set).toHaveBeenCalled();
      expect(mockDesiredPosition.copy).toHaveBeenCalled();
      expect(mockDesiredPosition.sub).toHaveBeenCalled();
    });

    test("should handle orbit position calculation", () => {
      // Mock desired position
      const mockDesiredPosition = (camera as any).desiredPosition;

      // Call method
      (camera as any).calculateOrbitPosition();

      // Verify desired position was set
      expect(mockDesiredPosition.set).toHaveBeenCalled();
    });
  });

  describe("Camera Rotation and Zoom", () => {
    beforeEach(() => {
      // Initialize camera
      const scene = new Scene(world);
      camera.initialize(800, 600, scene);
    });

    test("should rotate camera within limits", () => {
      // Initial values
      const initialYaw = camera.getConfig().yaw;
      const initialPitch = camera.getConfig().pitch;

      // Rotate camera
      camera.rotate(10, 5);

      // Get updated values
      const updatedYaw = camera.getConfig().yaw;
      const updatedPitch = camera.getConfig().pitch;

      // With sensitivity applied, changes should be less than raw inputs
      expect(updatedYaw).not.toBe(initialYaw);
      expect(updatedPitch).not.toBe(initialPitch);
    });

    test("should zoom camera within limits", () => {
      // Initial distance
      const initialDistance = camera.getConfig().distance;

      // Zoom in
      camera.zoom(-1);

      // Check zoomed in distance
      expect(camera.getConfig().distance).toBeLessThanOrEqual(initialDistance);

      // Zoom out
      camera.zoom(5);

      // Check zoomed out distance
      expect(camera.getConfig().distance).toBeGreaterThanOrEqual(
        initialDistance
      );
    });
  });

  describe("Camera Collisions", () => {
    beforeEach(() => {
      const scene = new Scene(world);
      camera.initialize(800, 600, scene);
    });

    test("should detect and handle collisions", () => {
      // Skip collision for first-person mode
      camera.setMode(CameraMode.FIRST_PERSON);

      // Spy on raycaster
      const raycasterSpy = jest.spyOn(
        (camera as any).raycaster,
        "intersectObjects"
      );

      // Call collision method
      (camera as any).handleCollisions();

      // Should not raycast in first-person mode
      expect(raycasterSpy).not.toHaveBeenCalled();

      // Switch to follow mode which should use collisions
      camera.setMode(CameraMode.FOLLOW);

      // Call collision method
      (camera as any).handleCollisions();

      // Should raycast in follow mode
      expect(raycasterSpy).toHaveBeenCalled();

      // Restore spy
      raycasterSpy.mockRestore();
    });

    test("should toggle collision detection", () => {
      // Collision should be enabled by default
      expect(camera.getConfig().useCollision).toBe(true);

      // Disable collision
      camera.setCollisionEnabled(false);

      // Verify collision is disabled
      expect(camera.getConfig().useCollision).toBe(false);
    });
  });

  describe("Utility Functions", () => {
    beforeEach(() => {
      const scene = new Scene(world);
      camera.initialize(800, 600, scene);
    });

    test("should handle window resize", () => {
      const threeCamera = camera.getCamera();

      camera.handleResize(1200, 800);

      expect(threeCamera.aspect).toBe(1200 / 800);
      expect(threeCamera.updateProjectionMatrix).toHaveBeenCalled();
    });

    test("should set FOV", () => {
      const threeCamera = camera.getCamera();

      camera.setFOV(60);

      expect(camera.getConfig().fov).toBe(60);
      expect(threeCamera.updateProjectionMatrix).toHaveBeenCalled();
    });

    test("should set distance", () => {
      camera.setDistance(7);

      expect(camera.getConfig().distance).toBe(7);
    });

    test("should set damping", () => {
      camera.setDamping(0.5);

      expect(camera.getConfig().damping).toBe(0.5);
    });

    test("should set sensitivity", () => {
      camera.setSensitivity(0.5);

      expect(camera.getConfig().sensitivity).toBe(0.5);
    });

    test("should set first-person height", () => {
      const initialHeight = camera.getConfig().firstPersonHeight;

      camera.setFirstPersonHeight(2.5);

      expect(camera.getConfig().firstPersonHeight).toBe(2.5);
      expect(camera.getConfig().firstPersonHeight).not.toBe(initialHeight);
    });
  });

  describe("Entity Targeting", () => {
    beforeEach(() => {
      const scene = new Scene(world);
      camera.initialize(800, 600, scene);
    });

    test("should set target entity", () => {
      // Set new target
      camera.setTarget("new-entity-id");

      expect(camera.getTargetId()).toBe("new-entity-id");
    });
  });

  describe("Camera Orientation", () => {
    beforeEach(() => {
      const scene = new Scene(world);
      camera.initialize(800, 600, scene);
    });

    test("should update orientation based on camera mode", () => {
      const threeCamera = camera.getCamera();

      // Test first-person orientation
      camera.setMode(CameraMode.FIRST_PERSON);
      (camera as any).updateOrientation();

      // Should look at point
      expect(threeCamera.lookAt).toHaveBeenCalled();

      // Reset mocks
      jest.clearAllMocks();

      // Test follow orientation
      camera.setMode(CameraMode.FOLLOW);
      (camera as any).updateOrientation();

      // Should look at target position
      expect(threeCamera.lookAt).toHaveBeenCalled();
    });
  });
});
