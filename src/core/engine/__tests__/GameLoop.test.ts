import { GameLoop } from "../GameLoop";
import { time } from "../Time";
import { world } from "../../ecs/world";
import { ComponentFactory } from "../../ecs/componentFactory";
import { EVENTS, ENTITY_TAGS } from "../../../config/constants";
import { EventListener, GameEvent } from "../../ecs/types";

// Mock dependencies
jest.mock("../Time", () => ({
  time: {
    reset: jest.fn(),
    update: jest.fn(),
    isPaused: false,
    deltaTime: 0.016,
    elapsedTime: 0,
    fps: 60,
    shouldRunFixedUpdate: jest.fn().mockReturnValue(false),
    fixedDeltaTime: 0.016,
  },
}));

jest.mock("../../ecs/world", () => ({
  world: {
    initializeWorld: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    createPlayerEntity: jest.fn(),
    queryEntities: jest.fn().mockReturnValue([]),
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    createNPCEntity: jest.fn(),
    createSkybox: jest.fn(),
    createEntity: jest.fn(),
  },
}));

jest.mock("../../ecs/systemManager", () => {
  return {
    SystemManager: jest.fn().mockImplementation(() => ({
      updateSystemGroup: jest.fn(),
      destroy: jest.fn(),
      registerSystem: jest.fn(),
    })),
  };
});

jest.mock("../../ecs/componentFactory", () => ({
  ComponentFactory: {
    clearPools: jest.fn(),
  },
}));

describe("GameLoop", () => {
  let gameLoop: GameLoop;
  const originalRAF = global.requestAnimationFrame;
  const originalCAF = global.cancelAnimationFrame;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock requestAnimationFrame and cancelAnimationFrame
    global.requestAnimationFrame = jest.fn().mockReturnValue(123);
    global.cancelAnimationFrame = jest.fn();

    // Create a new GameLoop instance
    gameLoop = new GameLoop();
  });

  afterAll(() => {
    // Restore original functions
    global.requestAnimationFrame = originalRAF;
    global.cancelAnimationFrame = originalCAF;
  });

  describe("Initialization", () => {
    test("should initialize the game on construction", () => {
      expect(world.initializeWorld).toHaveBeenCalled();
      expect(world.on).toHaveBeenCalledTimes(2); // Should register event listeners
    });

    test("should register event listeners", () => {
      // Verify that event listeners are registered
      expect(world.on).toHaveBeenCalledWith(
        EVENTS.ENTITY_CREATED,
        expect.any(Function)
      );
      expect(world.on).toHaveBeenCalledWith(
        EVENTS.WORLD_INITIALIZED,
        expect.any(Function)
      );
    });

    test("should create initial entities if they do not exist", () => {
      expect(world.queryEntities).toHaveBeenCalledWith({
        tags: [ENTITY_TAGS.PLAYER],
      });
      expect(world.createPlayerEntity).toHaveBeenCalled();
    });
  });

  describe("Game Loop Control", () => {
    test("should start the game loop", () => {
      gameLoop.start();

      expect(time.reset).toHaveBeenCalled();
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    test("should not start the game loop if it is already running", () => {
      // Start once
      gameLoop.start();
      jest.clearAllMocks();

      // Try to start again
      gameLoop.start();

      // Should not call these again
      expect(time.reset).not.toHaveBeenCalled();
      expect(global.requestAnimationFrame).not.toHaveBeenCalled();
    });

    test("should stop the game loop", () => {
      // First start the loop
      gameLoop.start();

      // Then stop it
      gameLoop.stop();

      expect(global.cancelAnimationFrame).toHaveBeenCalledWith(123);
    });

    test("should not attempt to stop if not running", () => {
      // Without starting first
      gameLoop.stop();

      expect(global.cancelAnimationFrame).not.toHaveBeenCalled();
    });

    test("should pause and resume the game", () => {
      // Pause the game
      gameLoop.pause(true);
      expect(time.isPaused).toBe(true);

      // Resume the game
      gameLoop.pause(false);
      expect(time.isPaused).toBe(false);
    });

    test("should set debug mode", () => {
      gameLoop.setDebugMode(true);

      // Access private property for testing
      expect((gameLoop as any).debugMode).toBe(true);

      gameLoop.setDebugMode(false);
      expect((gameLoop as any).debugMode).toBe(false);
    });
  });

  describe("Game Loop Update Cycle", () => {
    test("should update time and call update systems", () => {
      // Get access to the private tick method
      const tickMethod = (gameLoop as any).tick;

      // Call tick
      tickMethod();

      // Check that time is updated
      expect(time.update).toHaveBeenCalled();

      // Check that systems are updated in the correct order
      const systemManager = (gameLoop as any).systemManager;
      expect(systemManager.updateSystemGroup).toHaveBeenCalledWith(
        "input",
        time.deltaTime
      );
      expect(world.update).toHaveBeenCalledWith(time.deltaTime);
      expect(systemManager.updateSystemGroup).toHaveBeenCalledWith(
        "render",
        time.deltaTime
      );
    });

    test("should not update main game logic when paused", () => {
      // Mock time.isPaused to be true
      (time as any).isPaused = true;

      // Get access to the private tick method
      const tickMethod = (gameLoop as any).tick;

      // Call tick
      tickMethod();

      // Should still update time
      expect(time.update).toHaveBeenCalled();

      // Should still process input
      const systemManager = (gameLoop as any).systemManager;
      expect(systemManager.updateSystemGroup).toHaveBeenCalledWith(
        "input",
        time.deltaTime
      );

      // But should not update world
      expect(world.update).not.toHaveBeenCalled();

      // Should still render
      expect(systemManager.updateSystemGroup).toHaveBeenCalledWith(
        "render",
        time.deltaTime
      );

      // Reset time.isPaused
      (time as any).isPaused = false;
    });

    test("should perform fixed update steps when needed", () => {
      // Mock shouldRunFixedUpdate to return true once, then false
      (time.shouldRunFixedUpdate as jest.Mock).mockImplementation(() => {
        (time.shouldRunFixedUpdate as jest.Mock).mockReturnValue(false);
        return true;
      });

      // Get access to the private tick method
      const tickMethod = (gameLoop as any).tick;

      // Call tick
      tickMethod();

      // Check that fixed update was called
      const systemManager = (gameLoop as any).systemManager;
      expect(systemManager.updateSystemGroup).toHaveBeenCalledWith(
        "physics",
        time.fixedDeltaTime
      );
    });
  });

  describe("Resource Management", () => {
    test("should clean up resources when destroyed", () => {
      // First start the loop
      gameLoop.start();

      // Then destroy it
      gameLoop.destroy();

      // Should stop the loop
      expect(global.cancelAnimationFrame).toHaveBeenCalledWith(123);

      // Should clean up systems
      const systemManager = (gameLoop as any).systemManager;
      expect(systemManager.destroy).toHaveBeenCalled();

      // Should clean up world
      expect(world.destroy).toHaveBeenCalled();

      // Should clean up component pools
      expect(ComponentFactory.clearPools).toHaveBeenCalled();
    });
  });

  describe("Event Handling", () => {
    test("should respond to world initialized event", () => {
      // Find the event listener for WORLD_INITIALIZED
      const calls = (world.on as jest.Mock).mock.calls;
      const worldInitListener = calls.find(
        (call) => call[0] === EVENTS.WORLD_INITIALIZED
      );

      // Verify the listener was registered
      expect(worldInitListener).toBeDefined();

      // Create a console spy
      const consoleSpy = jest.spyOn(console, "log");

      // Call the listener
      if (worldInitListener) {
        const listener = worldInitListener[1] as EventListener;
        listener({ type: EVENTS.WORLD_INITIALIZED } as GameEvent);
      }

      // Verify the console message
      expect(consoleSpy).toHaveBeenCalledWith("World initialized successfully");

      // Restore console
      consoleSpy.mockRestore();
    });

    test("should log entity creation in debug mode", () => {
      // Enable debug mode
      gameLoop.setDebugMode(true);

      // Find the event listener for ENTITY_CREATED
      const calls = (world.on as jest.Mock).mock.calls;
      const entityCreatedListener = calls.find(
        (call) => call[0] === EVENTS.ENTITY_CREATED
      );

      // Verify the listener was registered
      expect(entityCreatedListener).toBeDefined();

      // Create a console spy
      const consoleSpy = jest.spyOn(console, "log");

      // Call the listener
      if (entityCreatedListener) {
        const listener = entityCreatedListener[1] as EventListener;
        listener({
          type: EVENTS.ENTITY_CREATED,
          entityId: "test-entity-id",
        } as GameEvent);
      }

      // Verify the console message
      expect(consoleSpy).toHaveBeenCalledWith("Entity created: test-entity-id");

      // Restore console
      consoleSpy.mockRestore();
    });
  });
});
