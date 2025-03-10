import { Time } from "./Time";
import { GameWorld } from "../ecs/world";
import { SystemManager } from "../ecs/systemManager";
import { EventEmitter } from "../ecs/types";
import { ComponentFactory } from "../ecs/componentFactory";
import { EVENTS, ENTITY_TAGS } from "../../config/constants";

/**
 * Core game loop that manages the update and render cycle.
 * Integrates ECS world, time, and system management.
 */
export class GameLoop {
  /** Whether the game loop is currently running */
  private isRunning: boolean = false;

  private world: GameWorld;

  private time: Time;

  /** Animation frame request ID for cancellation */
  private animationFrameId: number | null = null;

  /** System manager for organizing and running systems */
  private systemManager: SystemManager;

  /** Event emitter for game-wide events */
  private eventEmitter: EventEmitter;

  /** Physical systems group name */
  private readonly PHYSICS_GROUP = "physics";

  /** Render systems group name */
  private readonly RENDER_GROUP = "render";

  /** Input systems group name */
  private readonly INPUT_GROUP = "input";

  /** Whether debug mode is enabled */
  private debugMode: boolean = false;

  /**
   * Creates a new GameLoop instance
   * @param eventEmitter Optional event emitter for receiving events
   */
  constructor(world: GameWorld, time: Time, eventEmitter?: EventEmitter) {
    this.world = world;
    this.time = time;
    this.eventEmitter = eventEmitter || world; // Use world as default event emitter
    this.systemManager = new SystemManager(world);
    this.initializeGame();
  }

  /**
   * Initializes the game systems, entities, and resources
   */
  private initializeGame(): void {
    // Register event listeners
    this.registerEventListeners();

    // Initialize the world
    this.world.initializeWorld();

    // Register system groups
    this.initializeSystems();

    // Create initial entities
    this.createInitialEntities();

    console.log("Game initialized");
  }

  /**
   * Registers event listeners for game events
   */
  private registerEventListeners(): void {
    // Example event listeners
    this.eventEmitter.on(EVENTS.ENTITY_CREATED, (event) => {
      if (this.debugMode) {
        console.log(`Entity created: ${event.entityId}`);
      }
    });

    this.eventEmitter.on(EVENTS.WORLD_INITIALIZED, () => {
      console.log("World initialized successfully");
    });
  }

  /**
   * Initializes and registers all game systems with the system manager
   */
  private initializeSystems(): void {
    // TODO: Initialize systems here and register them with the appropriate groups

    // For example (commented out as placeholders):
    // this.systemManager.registerSystem(new MovementSystem(), this.PHYSICS_GROUP);
    // this.systemManager.registerSystem(new CollisionSystem(), this.PHYSICS_GROUP);
    // this.systemManager.registerSystem(new InputSystem(), this.INPUT_GROUP);
    // this.systemManager.registerSystem(new RenderSystem(), this.RENDER_GROUP);

    console.log("Systems initialized");
  }

  /**
   * Creates the initial entities needed at game start
   */
  private createInitialEntities(): void {
    // Create player entity if it doesn't exist
    if (this.world.queryEntities({ tags: [ENTITY_TAGS.PLAYER] }).length === 0) {
      this.world.createPlayerEntity();
    }

    console.log("Initial entities created");
  }

  /**
   * Starts the game loop
   */
  public start(): void {
    if (this.isRunning) return;

    console.log("Game loop starting");
    this.isRunning = true;

    // Reset time system
    this.time.reset();

    // Start the loop
    this.tick();

    console.log("Game started");
  }

  /**
   * Stops the game loop
   */
  public stop(): void {
    if (!this.isRunning) return;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.isRunning = false;
    console.log("Game stopped");
  }

  /**
   * Pauses the game loop without stopping it
   * @param isPaused Whether to pause the game
   */
  public pause(isPaused: boolean): void {
    this.time.isPaused = isPaused;
    console.log(isPaused ? "Game paused" : "Game resumed");
  }

  /**
   * Sets debug mode which controls logging and visualization
   * @param enabled Whether debug mode is enabled
   */
  public setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    console.log(`Debug mode ${enabled ? "enabled" : "disabled"}`);
  }

  /**
   * The main tick function called every frame
   */
  private tick = (): void => {
    // Update time
    this.time.update();

    // Process input (always process input even when paused)
    this.systemManager.updateSystemGroup(this.INPUT_GROUP, this.time.deltaTime);

    if (!this.time.isPaused) {
      // Regular update for non-physics systems
      this.update(this.time.deltaTime);

      // Fixed timestep updates for physics
      this.updateFixedTimestep();
    }

    // Render (runs even when paused, so UI updates are still visible)
    this.render();

    // Log FPS in debug mode occasionally
    if (this.debugMode && Math.floor(this.time.elapsedTime) % 5 === 0) {
      // Every 5 seconds
      console.log(`FPS: ${this.time.fps.toFixed(1)}`);
    }

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  /**
   * Updates game state for the current frame
   * @param deltaTime Time since last frame in seconds
   */
  private update(deltaTime: number): void {
    // Update the world (this runs all systems not in specific groups)
    this.world.update(deltaTime);
  }

  /**
   * Updates physics using fixed timestep
   */
  private updateFixedTimestep(): void {
    // Process physics at a fixed timestep
    while (this.time.shouldRunFixedUpdate()) {
      this.systemManager.updateSystemGroup(
        this.PHYSICS_GROUP,
        this.time.fixedDeltaTime
      );
    }
  }

  /**
   * Renders the current frame
   */
  private render(): void {
    // Update render systems
    this.systemManager.updateSystemGroup(
      this.RENDER_GROUP,
      this.time.deltaTime
    );
  }

  /**
   * Cleans up resources when the game is destroyed
   */
  public destroy(): void {
    this.stop();

    // Clean up systems
    this.systemManager.destroy();

    // Clean up world
    this.world.destroy();

    // Clean up component pools
    ComponentFactory.clearPools();

    console.log("Game destroyed");
  }
}
