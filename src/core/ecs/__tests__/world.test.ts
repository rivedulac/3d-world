import { GameWorld } from "../world";
import {
  ComponentType,
  SystemPriority,
  Component,
  Entity,
  System,
} from "../types";
import { EVENTS, ENTITY_TAGS } from "../../../config/constants";

// Mock component for testing without needing componentFactory
class MockComponent implements Component {
  type: ComponentType;
  entityId: string;
  active: boolean;

  constructor(
    type: ComponentType = ComponentType.TRANSFORM,
    entityId: string = ""
  ) {
    this.type = type;
    this.entityId = entityId;
    this.active = true;
  }
}

// Mock system for testing
class MockSystem implements System {
  priority = SystemPriority.NORMAL;
  active = true;
  requiredComponents = [ComponentType.TRANSFORM];
  updateCalled = false;
  initializeCalled = false;
  cleanupCalled = false;
  lastDeltaTime = 0;

  update(deltaTime: number, entities: Entity[]) {
    this.updateCalled = true;
    this.lastDeltaTime = deltaTime;
  }

  initialize(world: any) {
    this.initializeCalled = true;
  }

  cleanup() {
    this.cleanupCalled = true;
  }
}

describe("GameWorld", () => {
  let world: GameWorld;

  beforeEach(() => {
    world = new GameWorld();
  });

  describe("entity management", () => {
    test("should create an entity with unique ID", () => {
      const entity = world.createEntity();

      expect(entity).toBeDefined();
      expect(entity.id).toBeDefined();
      expect(entity.components.size).toBe(0);
      expect(entity.active).toBe(true);
      expect(entity.tags.size).toBe(0);
      expect(world.entities.has(entity.id)).toBe(true);
    });

    test("should remove an entity", () => {
      const entity = world.createEntity();
      const result = world.removeEntity(entity.id);

      expect(result).toBe(true);
      expect(world.entities.has(entity.id)).toBe(false);
    });

    test("should return false when removing a non-existent entity", () => {
      const result = world.removeEntity("non-existent-id");

      expect(result).toBe(false);
    });
  });

  describe("component management", () => {
    test("should add a component to an entity", () => {
      const entity = world.createEntity();
      const component = new MockComponent(ComponentType.TRANSFORM, entity.id);
      const result = world.addComponent(entity.id, component);

      expect(result).toBe(true);
      expect(entity.components.has(ComponentType.TRANSFORM)).toBe(true);
      expect(entity.components.get(ComponentType.TRANSFORM)).toBe(component);
    });

    test("should return false when adding a component to a non-existent entity", () => {
      const component = new MockComponent(ComponentType.TRANSFORM);
      const result = world.addComponent("non-existent-id", component);

      expect(result).toBe(false);
    });

    test("should remove a component from an entity", () => {
      const entity = world.createEntity();
      const component = new MockComponent(ComponentType.TRANSFORM, entity.id);
      world.addComponent(entity.id, component);

      const result = world.removeComponent(entity.id, ComponentType.TRANSFORM);

      expect(result).toBe(true);
      expect(entity.components.has(ComponentType.TRANSFORM)).toBe(false);
    });

    test("should return false when removing a non-existent component", () => {
      const entity = world.createEntity();
      const result = world.removeComponent(entity.id, ComponentType.TRANSFORM);

      expect(result).toBe(false);
    });

    test("should get a component from an entity", () => {
      const entity = world.createEntity();
      const component = new MockComponent(ComponentType.TRANSFORM, entity.id);
      world.addComponent(entity.id, component);

      const retrievedComponent = world.getComponent<MockComponent>(
        entity.id,
        ComponentType.TRANSFORM
      );

      expect(retrievedComponent).toBe(component);
    });

    test("should return null when getting a non-existent component", () => {
      const entity = world.createEntity();
      const retrievedComponent = world.getComponent(
        entity.id,
        ComponentType.TRANSFORM
      );

      expect(retrievedComponent).toBeNull();
    });
  });

  describe("system management", () => {
    test("should add a system", () => {
      const system = new MockSystem();
      world.addSystem(system);

      expect(world.systems.length).toBe(1);
      expect(world.systems[0]).toBe(system);
      expect(system.initializeCalled).toBe(true);
    });

    test("should remove a system", () => {
      const system = new MockSystem();
      world.addSystem(system);

      const result = world.removeSystem(system);

      expect(result).toBe(true);
      expect(world.systems.length).toBe(0);
      expect(system.cleanupCalled).toBe(true);
    });

    test("should return false when removing a non-existent system", () => {
      const system = new MockSystem();

      const result = world.removeSystem(system);

      expect(result).toBe(false);
    });

    test("should update systems with delta time", () => {
      const system = new MockSystem();
      world.addSystem(system);

      world.update(0.16);

      expect(system.updateCalled).toBe(true);
      expect(system.lastDeltaTime).toBe(0.16);
    });

    test("should not update inactive systems", () => {
      const system = new MockSystem();
      system.active = false;
      world.addSystem(system);

      world.update(0.16);

      expect(system.updateCalled).toBe(false);
    });

    test("should sort systems by priority", () => {
      const system1 = new MockSystem();
      system1.priority = SystemPriority.HIGH;

      const system2 = new MockSystem();
      system2.priority = SystemPriority.LOW;

      const system3 = new MockSystem();
      system3.priority = SystemPriority.NORMAL;

      world.addSystem(system3);
      world.addSystem(system1);
      world.addSystem(system2);

      expect(world.systems[0]).toBe(system1);
      expect(world.systems[1]).toBe(system3);
      expect(world.systems[2]).toBe(system2);
    });
  });

  describe("entity queries", () => {
    test("should query entities with required components", () => {
      const entity1 = world.createEntity();
      const component1 = new MockComponent(ComponentType.TRANSFORM, entity1.id);
      world.addComponent(entity1.id, component1);

      const entity2 = world.createEntity();

      const result = world.queryEntities({ all: [ComponentType.TRANSFORM] });

      expect(result.length).toBe(1);
      expect(result[0]).toBe(entity1);
    });

    test("should query entities with any of specified components", () => {
      const entity1 = world.createEntity();
      const component1 = new MockComponent(ComponentType.TRANSFORM, entity1.id);
      world.addComponent(entity1.id, component1);

      const entity2 = world.createEntity();

      const result = world.queryEntities({
        any: [ComponentType.TRANSFORM, ComponentType.VELOCITY],
      });

      expect(result.length).toBe(1);
      expect(result[0]).toBe(entity1);
    });

    test("should query entities without specified components", () => {
      const entity1 = world.createEntity();
      const component1 = new MockComponent(ComponentType.TRANSFORM, entity1.id);
      world.addComponent(entity1.id, component1);

      const entity2 = world.createEntity();

      const result = world.queryEntities({ none: [ComponentType.TRANSFORM] });

      expect(result.length).toBe(1);
      expect(result[0]).toBe(entity2);
    });

    test("should query entities with specific tags", () => {
      const entity1 = world.createEntity();
      entity1.tags.add(ENTITY_TAGS.PLAYER);

      const entity2 = world.createEntity();
      entity2.tags.add("enemy");

      const result = world.queryEntities({ tags: [ENTITY_TAGS.PLAYER] });

      expect(result.length).toBe(1);
      expect(result[0]).toBe(entity1);
    });

    test("should not include inactive entities in queries", () => {
      const entity1 = world.createEntity();
      const component1 = new MockComponent(ComponentType.TRANSFORM, entity1.id);
      world.addComponent(entity1.id, component1);
      entity1.active = false;

      const result = world.queryEntities({ all: [ComponentType.TRANSFORM] });

      expect(result.length).toBe(0);
    });
  });

  describe("event system", () => {
    test("should add event listeners", () => {
      const listener = jest.fn();
      world.on("test", listener);

      // Accessing private property for testing using bracket notation
      const eventListeners = (world as any).eventListeners;
      expect(eventListeners.has("test")).toBe(true);
      expect(eventListeners.get("test").has(listener)).toBe(true);
    });

    test("should remove event listeners", () => {
      const listener = jest.fn();
      world.on("test", listener);
      world.off("test", listener);

      const eventListeners = (world as any).eventListeners;
      expect(eventListeners.has("test")).toBe(false);
    });

    test("should emit events to listeners", () => {
      const listener = jest.fn();
      world.on("test", listener);

      world.emit({ type: "test", data: "value" });

      expect(listener).toHaveBeenCalledWith({ type: "test", data: "value" });
    });

    test("should emit entity created event", () => {
      const listener = jest.fn();
      world.on(EVENTS.ENTITY_CREATED, listener);

      const entity = world.createEntity();

      expect(listener).toHaveBeenCalledWith({
        type: EVENTS.ENTITY_CREATED,
        entityId: entity.id,
      });
    });

    test("should emit entity removed event", () => {
      const entity = world.createEntity();

      const listener = jest.fn();
      world.on(EVENTS.ENTITY_REMOVED, listener);

      world.removeEntity(entity.id);

      expect(listener).toHaveBeenCalledWith({
        type: EVENTS.ENTITY_REMOVED,
        entityId: entity.id,
      });
    });

    test("should emit component added event", () => {
      const entity = world.createEntity();
      const component = new MockComponent(ComponentType.TRANSFORM, entity.id);

      const listener = jest.fn();
      world.on(EVENTS.COMPONENT_ADDED, listener);

      world.addComponent(entity.id, component);

      expect(listener).toHaveBeenCalledWith({
        type: EVENTS.COMPONENT_ADDED,
        entityId: entity.id,
        componentType: ComponentType.TRANSFORM,
      });
    });

    test("should emit component removed event", () => {
      const entity = world.createEntity();
      const component = new MockComponent(ComponentType.TRANSFORM, entity.id);
      world.addComponent(entity.id, component);

      const listener = jest.fn();
      world.on(EVENTS.COMPONENT_REMOVED, listener);

      world.removeComponent(entity.id, ComponentType.TRANSFORM);

      expect(listener).toHaveBeenCalledWith({
        type: EVENTS.COMPONENT_REMOVED,
        entityId: entity.id,
        componentType: ComponentType.TRANSFORM,
      });
    });
  });

  describe("world initialization", () => {
    test("should create skybox and planet entities", () => {
      // Spy on the createEntity method
      const createEntitySpy = jest.spyOn(world, "createEntity");

      world.initializeWorld();

      // Should have called createEntity twice (skybox and planet)
      expect(createEntitySpy).toHaveBeenCalledTimes(2);

      // Verify tags were added
      let skyboxFound = false;
      let planetFound = false;

      world.entities.forEach((entity) => {
        if (entity.tags.has(ENTITY_TAGS.SKYBOX)) skyboxFound = true;
        if (entity.tags.has(ENTITY_TAGS.PLANET)) planetFound = true;
      });

      expect(skyboxFound).toBe(true);
      expect(planetFound).toBe(true);
    });

    test("should emit world:initialized event", () => {
      const listener = jest.fn();
      world.on(EVENTS.WORLD_INITIALIZED, listener);

      world.initializeWorld();

      expect(listener).toHaveBeenCalledWith({
        type: EVENTS.WORLD_INITIALIZED,
      });
    });
  });

  describe("specialized entity creation", () => {
    test("should create a player entity with correct tags", () => {
      const position = { x: 10, y: 5, z: 20 };
      const playerEntity = world.createPlayerEntity(position);

      expect(playerEntity).toBeDefined();
      expect(playerEntity.tags.has(ENTITY_TAGS.PLAYER)).toBe(true);
      expect(world.entities.has(playerEntity.id)).toBe(true);
    });

    test("should create an NPC entity with correct tags", () => {
      const position = { x: 5, y: 0, z: 5 };
      const dialogueKey = "intro_dialogue";
      const npcEntity = world.createNPCEntity(position, dialogueKey);

      expect(npcEntity).toBeDefined();
      expect(npcEntity.tags.has(ENTITY_TAGS.NPC)).toBe(true);
      expect(world.entities.has(npcEntity.id)).toBe(true);
    });

    test("should create a billboard entity with correct tags", () => {
      const position = { x: 0, y: 2, z: -5 };
      const billboardEntity = world.createBillboardEntity(position);

      expect(billboardEntity).toBeDefined();
      expect(billboardEntity.tags.has(ENTITY_TAGS.BILLBOARD)).toBe(true);
      expect(world.entities.has(billboardEntity.id)).toBe(true);
    });
  });

  describe("world destruction", () => {
    test("should clean up all systems and clear entities", () => {
      const system = new MockSystem();
      world.addSystem(system);

      world.createEntity(); // Create an entity

      world.destroy();

      expect(system.cleanupCalled).toBe(true);
      expect(world.entities.size).toBe(0);
      expect(world.systems.length).toBe(0);

      // Access private property for testing
      const eventListeners = (world as any).eventListeners;
      expect(eventListeners.size).toBe(0);
    });
  });
});
