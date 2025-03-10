/**
 * @jest-environment jsdom
 */
import { Scene } from "../Scene";
import * as THREE from "three";
import { GameWorld } from "../../ecs/world";
import { Entity } from "../../ecs/types";
import { ENTITY_TAGS, ASSETS } from "../../../config/constants";

// Mock dependencies
jest.mock("three", () => {
  // Create mock classes for THREE
  const mockColor = jest.fn().mockImplementation(() => ({
    set: jest.fn(),
  }));

  const mockThree = {
    Scene: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
      background: null,
      children: [],
    })),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() },
      lookAt: jest.fn(),
      aspect: 1,
      updateProjectionMatrix: jest.fn(),
    })),
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setSize: jest.fn(),
      setPixelRatio: jest.fn(),
      render: jest.fn(),
      dispose: jest.fn(),
      domElement: document.createElement("canvas"),
      shadowMap: { enabled: false },
    })),
    Color: mockColor,
    AmbientLight: jest.fn().mockImplementation(() => ({
      color: { set: jest.fn() },
      intensity: 1,
    })),
    DirectionalLight: jest.fn().mockImplementation(() => ({
      position: {
        set: jest.fn(),
        copy: jest.fn(),
      },
      color: { set: jest.fn() },
      intensity: 1,
      castShadow: false,
      shadow: {
        camera: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          near: 0,
          far: 0,
        },
        mapSize: { width: 0, height: 0 },
      },
    })),
    TextureLoader: jest.fn().mockImplementation(() => ({
      load: jest.fn((url, onLoad) => {
        // Default success - call onLoad with a mock texture
        if (onLoad) {
          onLoad({ isTexture: true });
        }
      }),
    })),
    SphereGeometry: jest.fn(),
    PlaneGeometry: jest.fn(),
    BoxGeometry: jest.fn(),
    MeshStandardMaterial: jest.fn(),
    MeshBasicMaterial: jest.fn(),
    Mesh: jest.fn().mockImplementation(() => ({
      rotation: { x: 0, y: 0, z: 0 },
      position: { y: 0 },
      castShadow: false,
      receiveShadow: false,
    })),
    Vector3: jest.fn().mockImplementation(() => ({
      set: jest.fn(),
      copy: jest.fn(),
    })),
    BackSide: "BACKSIDE",
    AxesHelper: jest.fn(),
    GridHelper: jest.fn(),
    DirectionalLightHelper: jest.fn().mockImplementation(() => ({
      update: jest.fn(),
    })),
    CameraHelper: jest.fn().mockImplementation(() => ({
      update: jest.fn(),
    })),
    Object3D: jest.fn().mockImplementation(() => ({
      visible: true,
    })),
  };

  return mockThree;
});

jest.mock("../../ecs/world", () => {
  const mockTagSet = {
    add: jest.fn(),
    has: jest.fn(() => true),
    delete: jest.fn(),
    size: 0,
  };
  return {
    GameWorld: jest.fn().mockImplementation(() => ({
      createEntity: jest.fn().mockImplementation(() => ({
        id: `entity-${Math.floor(Math.random() * 1000)}`,
        tags: mockTagSet,
        components: new Map(),
        active: true,
      })),
      entities: new Map(),
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    })),
  };
});

describe("Scene Class", () => {
  let testScene: Scene;
  let testContainer: HTMLElement;
  let world: GameWorld;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    testContainer = document.createElement("div");

    // Create a new Scene instance with default configuration
    world = new GameWorld();
    testScene = new Scene(world);
  });

  describe("Initialization", () => {
    test("should initialize with default configuration", () => {
      expect(testScene).toBeDefined();
      expect(THREE.Scene).toHaveBeenCalled();
    });

    test("should initialize with custom configuration", () => {
      const customConfig = {
        name: "Test Scene",
        createSkybox: false,
        createPlanet: false,
        backgroundColor: "#ff0000",
        ambientLightColor: "#00ff00",
        ambientLightIntensity: 0.5,
      };

      const customScene = new Scene(world, customConfig);
      expect(customScene).toBeDefined();

      // Access private config for testing
      const sceneConfig = (customScene as any).config;
      expect(sceneConfig.name).toBe("Test Scene");
      expect(sceneConfig.createSkybox).toBe(false);
      expect(sceneConfig.createPlanet).toBe(false);
      expect(sceneConfig.backgroundColor).toBe("#ff0000");
      expect(sceneConfig.ambientLightColor).toBe("#00ff00");
      expect(sceneConfig.ambientLightIntensity).toBe(0.5);
    });

    test("should set background color when no skybox is configured", () => {
      const customScene = new Scene(world, {
        createSkybox: false,
        backgroundColor: "#123456",
      });
      expect(THREE.Color).toHaveBeenCalledWith("#123456");
    });

    test("should setup renderer and camera during initialization", () => {
      testScene.initialize(testContainer);

      expect(THREE.WebGLRenderer).toHaveBeenCalled();
      expect(THREE.PerspectiveCamera).toHaveBeenCalled();

      const renderer = (testScene as any).renderer;
      expect(renderer.setSize).toHaveBeenCalled();
      expect(renderer.setPixelRatio).toHaveBeenCalled();
      expect(renderer.shadowMap.enabled).toBe(true);

      expect(testContainer.contains(renderer.domElement)).toBe(true);
    });

    test("should set up lighting during initialization", () => {
      testScene.initialize(testContainer);

      expect(THREE.AmbientLight).toHaveBeenCalled();
      expect(THREE.DirectionalLight).toHaveBeenCalled();

      const threeScene = (testScene as any).scene;
      // Just verify add was called, don't worry about exact count
      expect(threeScene.add).toHaveBeenCalled();
    });

    test("should use provided renderer and camera if given", () => {
      const customRenderer = new THREE.WebGLRenderer();
      const customCamera = new THREE.PerspectiveCamera();

      testScene.initialize(testContainer, customRenderer, customCamera);

      expect((testScene as any).renderer).toBe(customRenderer);
      expect((testScene as any).camera).toBe(customCamera);
    });

    test("should not re-initialize if already initialized", () => {
      // First initialization
      testScene.initialize(testContainer);

      // Spy on console.warn
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      // Try to initialize again
      testScene.initialize(testContainer);

      expect(consoleWarnSpy).toHaveBeenCalledWith("Scene already initialized");

      // Restore console.warn
      consoleWarnSpy.mockRestore();
    });
  });

  describe("Basic Scene Elements", () => {
    test("should create skybox with starfield texture when configured", () => {
      const customScene = new Scene(world, { createSkybox: true });
      customScene.initialize(testContainer);

      expect(world.createEntity).toHaveBeenCalled();

      // Check if an entity with skybox tag was created
      const mockEntity = world.createEntity();
      expect(mockEntity.tags.add).toHaveBeenCalledWith(ENTITY_TAGS.SKYBOX);

      // Just verify TextureLoader was called
      expect(THREE.TextureLoader).toHaveBeenCalled();
    });

    test("should create planet floor when configured", () => {
      const customScene = new Scene(world, { createPlanet: true });
      customScene.initialize(testContainer);

      expect(world.createEntity).toHaveBeenCalled();

      // Just verify TextureLoader was called
      expect(THREE.TextureLoader).toHaveBeenCalled();
    });

    test("should not create skybox when disabled in config", () => {
      // Clear previous calls to createEntity
      (world.createEntity as jest.Mock).mockClear();

      const customScene = new Scene(world, {
        createSkybox: false,
        createPlanet: false,
      });
      customScene.initialize(testContainer);

      // Expect no entities to be created (no calls to createEntity)
      expect(world.createEntity).not.toHaveBeenCalled();
    });

    test("should handle texture loading errors gracefully", () => {
      // Mock console.error
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Store original implementation
      const originalImplementation = (
        THREE.TextureLoader as jest.Mock
      ).getMockImplementation();

      // Override TextureLoader mock to simulate failure
      (THREE.TextureLoader as jest.Mock).mockImplementation(() => ({
        load: jest.fn((url, onLoad, onProgress, onError) => {
          // Simulate error
          if (onError) {
            onError(new Error("Texture loading failed"));
          }
        }),
      }));

      try {
        const customScene = new Scene(world, {
          createSkybox: true,
          createPlanet: true,
        });
        customScene.initialize(testContainer);

        // Verify error handling
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error loading skybox texture:",
          expect.any(Error)
        );
      } finally {
        // Restore original implementation and cleanup
        (THREE.TextureLoader as jest.Mock).mockImplementation(
          originalImplementation
        );
        consoleErrorSpy.mockRestore();
      }
    });
  });

  describe("Debug Helpers", () => {
    test("should add debug helpers when configured", () => {
      const customScene = new Scene(world, { showDebugHelpers: true });
      customScene.initialize(testContainer);

      expect(THREE.AxesHelper).toHaveBeenCalled();
      expect(THREE.GridHelper).toHaveBeenCalled();
      expect(THREE.DirectionalLightHelper).toHaveBeenCalled();
      expect(THREE.CameraHelper).toHaveBeenCalled();
    });

    test("should toggle debug helpers visibility", () => {
      const customScene = new Scene(world, { showDebugHelpers: true });
      customScene.initialize(testContainer);

      // Add some debug helpers
      const mockHelper1 = { visible: true };
      const mockHelper2 = { visible: true };
      (customScene as any).debugHelpers = [mockHelper1, mockHelper2];

      // Disable helpers
      customScene.setDebugHelpersVisible(false);

      expect(mockHelper1.visible).toBe(false);
      expect(mockHelper2.visible).toBe(false);

      // Re-enable helpers
      customScene.setDebugHelpersVisible(true);

      expect(mockHelper1.visible).toBe(true);
      expect(mockHelper2.visible).toBe(true);
    });
  });

  describe("Scene Management", () => {
    test("should add and remove objects from the scene", () => {
      testScene.initialize(testContainer);

      const mockObject = new THREE.Object3D();
      const entityId = "test-entity";

      // Add object
      testScene.addObject(mockObject, entityId);

      const threeScene = (testScene as any).scene;
      expect(threeScene.add).toHaveBeenCalledWith(mockObject);

      // Check if object is tracked
      const retrievedObject = testScene.getObjectForEntity(entityId);
      expect(retrievedObject).toBe(mockObject);

      // Remove object
      testScene.removeObject(mockObject, entityId);

      expect(threeScene.remove).toHaveBeenCalledWith(mockObject);

      // Check if object is no longer tracked
      const objectsMap = (testScene as any).entityObjects;
      expect(objectsMap.has(entityId)).toBe(false);
    });

    test("should handle window resize events", () => {
      testScene.initialize(testContainer);

      // Get the resize handler
      const resizeHandler = (testScene as any).handleResize;

      // Mock container dimensions
      Object.defineProperty(testContainer, "clientWidth", { value: 800 });
      Object.defineProperty(testContainer, "clientHeight", { value: 600 });

      // Call resize handler
      resizeHandler();

      // Get renderer and camera
      const renderer = (testScene as any).renderer;
      const camera = (testScene as any).camera;

      // Verify camera and renderer were updated
      expect(camera.aspect).toBe(800 / 600);
      expect(camera.updateProjectionMatrix).toHaveBeenCalled();
      expect(renderer.setSize).toHaveBeenCalledWith(800, 600);
    });

    test("should render the scene", () => {
      testScene.initialize(testContainer);

      testScene.render();

      const renderer = (testScene as any).renderer;
      const threeScene = (testScene as any).scene;
      const camera = (testScene as any).camera;

      expect(renderer.render).toHaveBeenCalledWith(threeScene, camera);
    });

    test("should create objects for entities", () => {
      testScene.initialize(testContainer);

      // Create a test entity
      const entity: Entity = {
        id: "test-entity",
        components: new Map(),
        active: true,
        tags: new Set<string>(),
      };

      const object = testScene.createObjectForEntity(entity);

      expect(object).not.toBeNull();
      expect(THREE.BoxGeometry).toHaveBeenCalled();
      expect(THREE.MeshStandardMaterial).toHaveBeenCalled();
      expect(THREE.Mesh).toHaveBeenCalled();

      const threeScene = (testScene as any).scene;
      expect(threeScene.add).toHaveBeenCalled();
    });
  });

  describe("Lighting Control", () => {
    test("should update ambient light properties", () => {
      testScene.initialize(testContainer);

      // Get the ambient light
      const ambientLight = (testScene as any).ambientLight;

      // Set color
      testScene.setAmbientLightColor("#ff0000");
      expect(ambientLight.color.set).toHaveBeenCalledWith("#ff0000");

      // Set intensity
      testScene.setAmbientLightIntensity(0.75);
      expect(ambientLight.intensity).toBe(0.75);
    });

    test("should update directional light properties", () => {
      testScene.initialize(testContainer);

      // Get the directional light
      const directionalLight = (testScene as any).directionalLight;

      // Set color
      testScene.setDirectionalLightColor("#00ff00");
      expect(directionalLight.color.set).toHaveBeenCalledWith("#00ff00");

      // Set intensity
      testScene.setDirectionalLightIntensity(0.85);
      expect(directionalLight.intensity).toBe(0.85);
    });

    it.todo("should update background color");
  });

  describe("Cleanup", () => {
    test("should clean up resources when destroyed", () => {
      // Create spy for window.removeEventListener
      const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

      testScene.initialize(testContainer);

      // Create a mock renderer with dispose method to test
      const mockDispose = jest.fn();
      (testScene as any).renderer = {
        dispose: mockDispose,
        domElement: document.createElement("canvas"),
      };
      testContainer.appendChild((testScene as any).renderer.domElement);

      testScene.destroy();

      const threeScene = (testScene as any).scene;

      // Verify cleanup
      expect(threeScene.clear).toHaveBeenCalled();
      expect(mockDispose).toHaveBeenCalled();
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "resize",
        expect.any(Function)
      );

      // Check that references were cleared
      expect((testScene as any).skyboxEntityId).toBeNull();
      expect((testScene as any).planetEntityId).toBeNull();
      expect((testScene as any).directionalLight).toBeNull();
      expect((testScene as any).ambientLight).toBeNull();
      expect((testScene as any).renderer).toBeNull();
      expect((testScene as any).initialized).toBe(false);

      // Restore spy
      removeEventListenerSpy.mockRestore();
    });
  });
});
