import {
  EntityId,
  Entity,
  ComponentType,
  Component,
  SystemPriority,
  System,
  World,
  GameEvent,
  EventEmitter,
  EntityQueryOptions,
  GameState,
} from "../types";

// Mock implementations for testing
class MockComponent implements Component {
  type: ComponentType;
  entityId: EntityId;
  active: boolean;

  constructor(type: ComponentType, entityId: EntityId) {
    this.type = type;
    this.entityId = entityId;
    this.active = true;
  }
}

class MockSystem implements System {
  priority: SystemPriority;
  active: boolean;
  requiredComponents: ComponentType[];
  initializeCalled = false;
  cleanupCalled = false;
  lastDeltaTime: number | null = null;
  lastEntities: Entity[] | null = null;

  constructor(
    priority: SystemPriority = SystemPriority.NORMAL,
    requiredComponents: ComponentType[] = []
  ) {
    this.priority = priority;
    this.active = true;
    this.requiredComponents = requiredComponents;
  }

  update(deltaTime: number, entities: Entity[]): void {
    this.lastDeltaTime = deltaTime;
    this.lastEntities = entities;
  }

  initialize(world: World): void {
    this.initializeCalled = true;
  }

  cleanup(): void {
    this.cleanupCalled = true;
  }
}

class MockWorld implements World {
  entities: Map<EntityId, Entity> = new Map();
  systems: System[] = [];

  createEntity(): Entity {
    const id = `entity-${this.entities.size}`;
    const entity: Entity = {
      id,
      components: new Map(),
      active: true,
      tags: new Set(),
    };
    this.entities.set(id, entity);
    return entity;
  }

  removeEntity(entityId: EntityId): boolean {
    return this.entities.delete(entityId);
  }

  addComponent(entityId: EntityId, component: Component): boolean {
    const entity = this.entities.get(entityId);
    if (!entity) return false;
    entity.components.set(component.type, component);
    return true;
  }

  removeComponent(entityId: EntityId, componentType: ComponentType): boolean {
    const entity = this.entities.get(entityId);
    if (!entity) return false;
    return entity.components.delete(componentType);
  }

  getComponent<T extends Component>(
    entityId: EntityId,
    componentType: ComponentType
  ): T | null {
    const entity = this.entities.get(entityId);
    if (!entity) return null;
    return (entity.components.get(componentType) as T) || null;
  }

  // Add query entities method to use EntityQueryOptions
  queryEntities(options: EntityQueryOptions): Entity[] {
    return Array.from(this.entities.values()).filter((entity) => {
      if (!entity.active) return false;

      // Check 'all' components
      if (options.all && options.all.length > 0) {
        if (!options.all.every((type) => entity.components.has(type))) {
          return false;
        }
      }

      // Check 'any' components
      if (options.any && options.any.length > 0) {
        if (!options.any.some((type) => entity.components.has(type))) {
          return false;
        }
      }

      // Check 'none' components
      if (options.none && options.none.length > 0) {
        if (options.none.some((type) => entity.components.has(type))) {
          return false;
        }
      }

      // Check tags
      if (options.tags && options.tags.length > 0) {
        if (!options.tags.every((tag) => entity.tags.has(tag))) {
          return false;
        }
      }

      return true;
    });
  }

  addSystem(system: System): void {
    this.systems.push(system);
    if (system.initialize) {
      system.initialize(this);
    }
  }

  removeSystem(system: System): boolean {
    const index = this.systems.indexOf(system);
    if (index === -1) return false;

    if (system.cleanup) {
      system.cleanup();
    }

    this.systems.splice(index, 1);
    return true;
  }

  update(deltaTime: number): void {
    // Sort systems by priority
    const sortedSystems = [...this.systems].sort(
      (a, b) => a.priority - b.priority
    );

    for (const system of sortedSystems) {
      if (!system.active) continue;

      // Filter entities based on system requirements
      const filteredEntities = Array.from(this.entities.values()).filter(
        (entity) => {
          if (!entity.active) return false;

          // Check if entity has all required components
          return system.requiredComponents.every(
            (type) =>
              entity.components.has(type) && entity.components.get(type)!.active
          );
        }
      );

      system.update(deltaTime, filteredEntities);
    }
  }
}

class MockEventEmitter implements EventEmitter {
  private listeners: Map<string, EventListener[]> = new Map();

  on(eventType: string, listener: EventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
  }

  off(eventType: string, listener: EventListener): void {
    if (!this.listeners.has(eventType)) return;

    const eventListeners = this.listeners.get(eventType)!;
    const index = eventListeners.indexOf(listener);

    if (index !== -1) {
      eventListeners.splice(index, 1);
    }
  }

  emit(event: GameEvent): void {
    if (!this.listeners.has(event.type)) return;
    for (const listener of this.listeners.get(event.type)!) {
      listener(event as unknown as Event);
    }
  }
}

// Unit Tests
describe("ECS Type Definitions", () => {
  describe("Entity", () => {
    let world: MockWorld;
    let entity: Entity;

    beforeEach(() => {
      world = new MockWorld();
      entity = world.createEntity();
    });

    test("should create an entity with a unique ID", () => {
      const entity1 = world.createEntity();
      const entity2 = world.createEntity();

      expect(entity1.id).toBeDefined();
      expect(entity2.id).toBeDefined();
      expect(entity1.id).not.toEqual(entity2.id);
    });

    test("should add and remove components", () => {
      const transformComponent = new MockComponent(
        ComponentType.TRANSFORM,
        entity.id
      );
      const velocityComponent = new MockComponent(
        ComponentType.VELOCITY,
        entity.id
      );

      expect(world.addComponent(entity.id, transformComponent)).toBe(true);
      expect(world.addComponent(entity.id, velocityComponent)).toBe(true);

      expect(entity.components.size).toBe(2);
      expect(entity.components.has(ComponentType.TRANSFORM)).toBe(true);
      expect(entity.components.has(ComponentType.VELOCITY)).toBe(true);

      expect(world.removeComponent(entity.id, ComponentType.TRANSFORM)).toBe(
        true
      );
      expect(entity.components.size).toBe(1);
      expect(entity.components.has(ComponentType.TRANSFORM)).toBe(false);
    });

    test("should get component by type", () => {
      const transformComponent = new MockComponent(
        ComponentType.TRANSFORM,
        entity.id
      );
      world.addComponent(entity.id, transformComponent);

      const retrievedComponent = world.getComponent<MockComponent>(
        entity.id,
        ComponentType.TRANSFORM
      );
      expect(retrievedComponent).toBe(transformComponent);

      const nonExistentComponent = world.getComponent(
        entity.id,
        ComponentType.PLAYER
      );
      expect(nonExistentComponent).toBeNull();
    });

    test("should add and remove tags", () => {
      entity.tags.add("player");
      entity.tags.add("controllable");

      expect(entity.tags.size).toBe(2);
      expect(entity.tags.has("player")).toBe(true);
      expect(entity.tags.has("controllable")).toBe(true);

      entity.tags.delete("player");
      expect(entity.tags.size).toBe(1);
      expect(entity.tags.has("player")).toBe(false);
    });
  });

  describe("Systems", () => {
    let world: MockWorld;
    let system: MockSystem;

    beforeEach(() => {
      world = new MockWorld();
      system = new MockSystem(SystemPriority.NORMAL, [ComponentType.TRANSFORM]);
    });

    test("should initialize system when added to world", () => {
      world.addSystem(system);
      expect(system.initializeCalled).toBe(true);
    });

    test("should call cleanup when removed from world", () => {
      world.addSystem(system);
      world.removeSystem(system);
      expect(system.cleanupCalled).toBe(true);
    });

    test("should update system with correct entities", () => {
      const entity1 = world.createEntity();
      const entity2 = world.createEntity();
      const entity3 = world.createEntity();

      world.addComponent(
        entity1.id,
        new MockComponent(ComponentType.TRANSFORM, entity1.id)
      );
      world.addComponent(
        entity2.id,
        new MockComponent(ComponentType.TRANSFORM, entity2.id)
      );
      world.addComponent(
        entity3.id,
        new MockComponent(ComponentType.VELOCITY, entity3.id)
      );

      world.addSystem(system);
      world.update(0.16);

      expect(system.lastDeltaTime).toBe(0.16);
      expect(system.lastEntities).toHaveLength(2);
      expect(system.lastEntities!.map((e) => e.id)).toContain(entity1.id);
      expect(system.lastEntities!.map((e) => e.id)).toContain(entity2.id);
      expect(system.lastEntities!.map((e) => e.id)).not.toContain(entity3.id);
    });

    test("should execute systems in priority order", () => {
      const executionOrder: number[] = [];

      class PriorityTestSystem extends MockSystem {
        index: number;

        constructor(priority: SystemPriority, index: number) {
          super(priority, []);
          this.index = index;
        }

        update(deltaTime: number, entities: Entity[]): void {
          super.update(deltaTime, entities);
          executionOrder.push(this.index);
        }
      }

      const system1 = new PriorityTestSystem(SystemPriority.NORMAL, 1);
      const system2 = new PriorityTestSystem(SystemPriority.HIGH, 2);
      const system3 = new PriorityTestSystem(SystemPriority.LOWEST, 3);
      const system4 = new PriorityTestSystem(SystemPriority.HIGHEST, 4);

      world.addSystem(system1);
      world.addSystem(system2);
      world.addSystem(system3);
      world.addSystem(system4);

      world.update(0.16);

      // Systems should execute in order of increasing priority value
      // HIGHEST(0) -> HIGH(1) -> NORMAL(2) -> LOW(3) -> LOWEST(4)
      expect(executionOrder).toEqual([4, 2, 1, 3]);
    });

    test("should not update inactive systems", () => {
      world.addSystem(system);
      system.active = false;
      world.update(0.16);

      expect(system.lastDeltaTime).toBeNull();
      expect(system.lastEntities).toBeNull();
    });

    test("should not update inactive entities", () => {
      const entity = world.createEntity();
      world.addComponent(
        entity.id,
        new MockComponent(ComponentType.TRANSFORM, entity.id)
      );

      world.addSystem(system);
      entity.active = false;
      world.update(0.16);

      expect(system.lastEntities).toHaveLength(0);
    });
  });

  describe("EventEmitter", () => {
    let eventEmitter: MockEventEmitter;
    let listener1Called: boolean;
    let listener2Called: boolean;
    let receivedEvent: GameEvent | null;

    beforeEach(() => {
      eventEmitter = new MockEventEmitter();
      listener1Called = false;
      listener2Called = false;
      receivedEvent = null;
    });

    test("should register and trigger event listeners", () => {
      const listener1 = (event: GameEvent) => {
        listener1Called = true;
        receivedEvent = event;
      };

      eventEmitter.on("playerMove", listener1);
      eventEmitter.emit({ type: "playerMove", position: { x: 10, y: 20 } });

      expect(listener1Called).toBe(true);
      expect(receivedEvent).toEqual({
        type: "playerMove",
        position: { x: 10, y: 20 },
      });
    });

    test("should support multiple listeners for same event", () => {
      const listener1 = () => {
        listener1Called = true;
      };
      const listener2 = () => {
        listener2Called = true;
      };

      eventEmitter.on("collision", listener1);
      eventEmitter.on("collision", listener2);
      eventEmitter.emit({ type: "collision" });

      expect(listener1Called).toBe(true);
      expect(listener2Called).toBe(true);
    });

    test("should remove specific event listener", () => {
      const listener1 = () => {
        listener1Called = true;
      };
      const listener2 = () => {
        listener2Called = true;
      };

      eventEmitter.on("playerDeath", listener1);
      eventEmitter.on("playerDeath", listener2);

      eventEmitter.off("playerDeath", listener1);
      eventEmitter.emit({ type: "playerDeath" });

      expect(listener1Called).toBe(false);
      expect(listener2Called).toBe(true);
    });

    test("should not trigger listeners for different events", () => {
      const listener = () => {
        listener1Called = true;
      };

      eventEmitter.on("gameStart", listener);
      eventEmitter.emit({ type: "gamePause" });

      expect(listener1Called).toBe(false);
    });
  });

  describe("Game States", () => {
    test("should define all required game states", () => {
      expect(GameState.LOADING).toBe("loading");
      expect(GameState.RUNNING).toBe("running");
      expect(GameState.PAUSED).toBe("paused");
      expect(GameState.GAME_OVER).toBe("gameOver");
    });
  });

  describe("Component Types", () => {
    test("should define all required component types", () => {
      // Physics components
      expect(ComponentType.TRANSFORM).toBe("transform");
      expect(ComponentType.VELOCITY).toBe("velocity");
      expect(ComponentType.COLLIDER).toBe("collider");

      // Character components
      expect(ComponentType.PLAYER).toBe("player");
      expect(ComponentType.NPC).toBe("npc");
      expect(ComponentType.ANIMATION).toBe("animation");

      // Interaction components
      expect(ComponentType.INTERACTABLE).toBe("interactable");
      expect(ComponentType.DIALOGUE).toBe("dialogue");
      expect(ComponentType.TRIGGER).toBe("trigger");

      // UI components
      expect(ComponentType.BILLBOARD).toBe("billboard");
      expect(ComponentType.HUD).toBe("hud");
      expect(ComponentType.VIRTUAL_KEYBOARD).toBe("virtualKeyboard");
    });
  });

  describe("Entity Queries", () => {
    let world: MockWorld;

    beforeEach(() => {
      world = new MockWorld();

      // Create test entities with various components and tags
      const entity1 = world.createEntity();
      world.addComponent(
        entity1.id,
        new MockComponent(ComponentType.TRANSFORM, entity1.id)
      );
      world.addComponent(
        entity1.id,
        new MockComponent(ComponentType.PLAYER, entity1.id)
      );
      entity1.tags.add("player");
      entity1.tags.add("controllable");

      const entity2 = world.createEntity();
      world.addComponent(
        entity2.id,
        new MockComponent(ComponentType.TRANSFORM, entity2.id)
      );
      world.addComponent(
        entity2.id,
        new MockComponent(ComponentType.NPC, entity2.id)
      );
      world.addComponent(
        entity2.id,
        new MockComponent(ComponentType.DIALOGUE, entity2.id)
      );
      entity2.tags.add("npc");
      entity2.tags.add("friendly");

      const entity3 = world.createEntity();
      world.addComponent(
        entity3.id,
        new MockComponent(ComponentType.TRANSFORM, entity3.id)
      );
      world.addComponent(
        entity3.id,
        new MockComponent(ComponentType.BILLBOARD, entity3.id)
      );
      entity3.tags.add("ui");

      const entity4 = world.createEntity();
      world.addComponent(
        entity4.id,
        new MockComponent(ComponentType.INTERACTABLE, entity4.id)
      );
      world.addComponent(
        entity4.id,
        new MockComponent(ComponentType.TRIGGER, entity4.id)
      );
      entity4.tags.add("interactive");
      entity4.active = false; // This entity is inactive
    });

    test("should query entities with all specified components", () => {
      const results = world.queryEntities({
        all: [
          ComponentType.TRANSFORM,
          ComponentType.NPC,
          ComponentType.DIALOGUE,
        ],
      });

      expect(results.length).toBe(1);
      expect(results[0].components.has(ComponentType.NPC)).toBe(true);
      expect(results[0].tags.has("npc")).toBe(true);
    });

    test("should query entities with any of specified components", () => {
      const results = world.queryEntities({
        any: [ComponentType.PLAYER, ComponentType.BILLBOARD],
      });

      expect(results.length).toBe(2);
      // Should include player entity and billboard entity
      expect(results.some((e) => e.components.has(ComponentType.PLAYER))).toBe(
        true
      );
      expect(
        results.some((e) => e.components.has(ComponentType.BILLBOARD))
      ).toBe(true);
    });

    test("should query entities that do not have specified components", () => {
      const results = world.queryEntities({
        all: [ComponentType.TRANSFORM],
        none: [ComponentType.PLAYER],
      });

      expect(results.length).toBe(2);
      results.forEach((entity) => {
        expect(entity.components.has(ComponentType.TRANSFORM)).toBe(true);
        expect(entity.components.has(ComponentType.PLAYER)).toBe(false);
      });
    });

    test("should query entities with specified tags", () => {
      const results = world.queryEntities({
        tags: ["ui"],
      });

      expect(results.length).toBe(1);
      expect(results[0].components.has(ComponentType.BILLBOARD)).toBe(true);
    });

    test("should combine all query options", () => {
      const results = world.queryEntities({
        all: [ComponentType.TRANSFORM],
        any: [ComponentType.PLAYER, ComponentType.NPC],
        none: [ComponentType.BILLBOARD],
        tags: ["controllable"],
      });

      expect(results.length).toBe(1);
      expect(results[0].components.has(ComponentType.PLAYER)).toBe(true);
    });

    test("should exclude inactive entities from query results", () => {
      const results = world.queryEntities({
        any: [ComponentType.INTERACTABLE, ComponentType.TRIGGER],
      });

      expect(results.length).toBe(0); // The entity with these components is inactive
    });
  });
});
