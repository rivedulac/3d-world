import { SystemManager } from "../systemManager";
import { GameWorld } from "../world";
import {
  System,
  SystemPriority,
  Component,
  ComponentType,
  Entity,
} from "../types";

// Mock system for testing
class MockSystem implements System {
  priority: SystemPriority;
  active: boolean;
  requiredComponents: ComponentType[];
  updateCalled = false;
  lastDeltaTime: number | null = null;
  lastEntities: Entity[] | null = null;
  initializeCalled = false;
  cleanupCalled = false;

  constructor(
    priority: SystemPriority = SystemPriority.NORMAL,
    requiredComponents: ComponentType[] = [ComponentType.TRANSFORM],
    active = true
  ) {
    this.priority = priority;
    this.requiredComponents = requiredComponents;
    this.active = active;
  }

  update(deltaTime: number, entities: Entity[]): void {
    this.updateCalled = true;
    this.lastDeltaTime = deltaTime;
    this.lastEntities = entities;
  }

  initialize(world: any): void {
    this.initializeCalled = true;
  }

  cleanup(): void {
    this.cleanupCalled = true;
  }
}

// Mock component for testing
class MockComponent implements Component {
  type: ComponentType;
  entityId: string;
  active: boolean;

  constructor(type: ComponentType, entityId: string = "") {
    this.type = type;
    this.entityId = entityId;
    this.active = true;
  }
}

describe("SystemManager", () => {
  let world: GameWorld;
  let systemManager: SystemManager;

  beforeEach(() => {
    world = new GameWorld();
    systemManager = new SystemManager(world);
  });

  describe("system registration", () => {
    test("should register a system with the world", () => {
      const addSystemSpy = jest.spyOn(world, "addSystem");
      const system = new MockSystem();

      systemManager.registerSystem(system);

      expect(addSystemSpy).toHaveBeenCalledWith(system);
      expect(systemManager.getActiveSystems()).toContain(system);
      expect(world.systems).toContain(system);

      addSystemSpy.mockRestore();
    });

    test("should assign ID to registered system", () => {
      const system = new MockSystem();
      systemManager.registerSystem(system);

      expect((system as any).id).toBeDefined();
    });

    test("should add system to correct map based on active state", () => {
      const activeSystem = new MockSystem(
        SystemPriority.NORMAL,
        [ComponentType.TRANSFORM],
        true
      );
      const inactiveSystem = new MockSystem(
        SystemPriority.NORMAL,
        [ComponentType.TRANSFORM],
        false
      );

      systemManager.registerSystem(activeSystem);
      systemManager.registerSystem(inactiveSystem);

      expect(systemManager.getActiveSystems()).toContain(activeSystem);
      expect(systemManager.getActiveSystems()).not.toContain(inactiveSystem);
      expect(systemManager.getInactiveSystems()).toContain(inactiveSystem);
      expect(systemManager.getInactiveSystems()).not.toContain(activeSystem);
    });

    test("should add system to specified group", () => {
      const system1 = new MockSystem();
      const system2 = new MockSystem();
      const groupName = "testGroup";

      systemManager.registerSystem(system1, groupName);
      systemManager.registerSystem(system2, groupName);

      const groupSystems = systemManager.getSystemsInGroup(groupName);
      expect(groupSystems).toContain(system1);
      expect(groupSystems).toContain(system2);
      expect(groupSystems.length).toBe(2);
    });
  });

  describe("system unregistration", () => {
    test("should unregister a system from the world", () => {
      const removeSystemSpy = jest.spyOn(world, "removeSystem");
      const system = new MockSystem();
      systemManager.registerSystem(system);

      const result = systemManager.unregisterSystem(system);

      expect(result).toBe(true);
      expect(removeSystemSpy).toHaveBeenCalledWith(system);
      expect(systemManager.getAllSystems()).not.toContain(system);

      removeSystemSpy.mockRestore();
    });

    test("should return false when unregistering a system that does not exist", () => {
      const system = new MockSystem();
      // Not registering the system

      const result = systemManager.unregisterSystem(system);

      expect(result).toBe(false);
    });

    test("should remove system from groups when unregistered", () => {
      const system = new MockSystem();
      const groupName = "testGroup";
      systemManager.registerSystem(system, groupName);

      systemManager.unregisterSystem(system);

      const groupSystems = systemManager.getSystemsInGroup(groupName);
      expect(groupSystems).not.toContain(system);
      expect(groupSystems.length).toBe(0);
    });

    test("should clean up empty groups after system removal", () => {
      const system = new MockSystem();
      const groupName = "testGroup";
      systemManager.registerSystem(system, groupName);

      systemManager.unregisterSystem(system);

      expect(systemManager.getSystemGroups()).not.toContain(groupName);
    });
  });

  describe("system retrieval", () => {
    test("should get a system by ID", () => {
      const system = new MockSystem();
      systemManager.registerSystem(system);
      const systemId = (system as any).id;

      const retrievedSystem = systemManager.getSystem(systemId);

      expect(retrievedSystem).toBe(system);
    });

    test("should return undefined for non-existent system ID", () => {
      const retrievedSystem = systemManager.getSystem("non-existent-id");

      expect(retrievedSystem).toBeUndefined();
    });

    test("should get all systems", () => {
      const system1 = new MockSystem(
        SystemPriority.NORMAL,
        [ComponentType.TRANSFORM],
        true
      );
      const system2 = new MockSystem(
        SystemPriority.NORMAL,
        [ComponentType.TRANSFORM],
        false
      );
      systemManager.registerSystem(system1);
      systemManager.registerSystem(system2);

      const allSystems = systemManager.getAllSystems();

      expect(allSystems).toContain(system1);
      expect(allSystems).toContain(system2);
      expect(allSystems.length).toBe(2);
    });
  });

  describe("enabling and disabling systems", () => {
    test("should enable an inactive system", () => {
      const system = new MockSystem(
        SystemPriority.NORMAL,
        [ComponentType.TRANSFORM],
        false
      );
      systemManager.registerSystem(system);
      const systemId = (system as any).id;
      expect(system.active).toBe(false);

      const result = systemManager.enableSystem(systemId);

      expect(result).toBe(true);
      expect(system.active).toBe(true);
      expect(systemManager.getActiveSystems()).toContain(system);
      expect(systemManager.getInactiveSystems()).not.toContain(system);
    });

    test("should return false when enabling a non-existent system", () => {
      const result = systemManager.enableSystem("non-existent-id");

      expect(result).toBe(false);
    });

    test("should disable an active system", () => {
      const system = new MockSystem();
      systemManager.registerSystem(system);
      const systemId = (system as any).id;
      expect(system.active).toBe(true);
      const result = systemManager.disableSystem(systemId);

      expect(result).toBe(true);
      expect(system.active).toBe(false);
      expect(systemManager.getActiveSystems()).not.toContain(system);
      expect(systemManager.getInactiveSystems()).toContain(system);
    });

    test("should return false when disabling a non-existent system", () => {
      const result = systemManager.disableSystem("non-existent-id");

      expect(result).toBe(false);
    });
  });

  describe("system groups", () => {
    test("should enable all systems in a group", () => {
      const system1 = new MockSystem(
        SystemPriority.NORMAL,
        [ComponentType.TRANSFORM],
        false
      );
      const system2 = new MockSystem(
        SystemPriority.NORMAL,
        [ComponentType.TRANSFORM],
        false
      );
      const system3 = new MockSystem(
        SystemPriority.NORMAL,
        [ComponentType.TRANSFORM],
        true
      );
      const groupName = "testGroup";

      systemManager.registerSystem(system1, groupName);
      systemManager.registerSystem(system2, groupName);
      systemManager.registerSystem(system3, groupName);

      const enabledCount = systemManager.enableSystemGroup(groupName);

      expect(enabledCount).toBe(2); // Only 2 were inactive
      expect(system1.active).toBe(true);
      expect(system2.active).toBe(true);
      expect(system3.active).toBe(true);
    });

    test("should return 0 when enabling a non-existent group", () => {
      const enabledCount =
        systemManager.enableSystemGroup("non-existent-group");

      expect(enabledCount).toBe(0);
    });

    test("should disable all systems in a group", () => {
      const system1 = new MockSystem(
        SystemPriority.NORMAL,
        [ComponentType.TRANSFORM],
        true
      );
      const system2 = new MockSystem(
        SystemPriority.NORMAL,
        [ComponentType.TRANSFORM],
        true
      );
      const system3 = new MockSystem(
        SystemPriority.NORMAL,
        [ComponentType.TRANSFORM],
        false
      );
      const groupName = "testGroup";

      systemManager.registerSystem(system1, groupName);
      systemManager.registerSystem(system2, groupName);
      systemManager.registerSystem(system3, groupName);

      const disabledCount = systemManager.disableSystemGroup(groupName);

      expect(disabledCount).toBe(2); // Only 2 were active
      expect(system1.active).toBe(false);
      expect(system2.active).toBe(false);
      expect(system3.active).toBe(false);
    });

    test("should return 0 when disabling a non-existent group", () => {
      const disabledCount =
        systemManager.disableSystemGroup("non-existent-group");

      expect(disabledCount).toBe(0);
    });

    test("should get all system groups", () => {
      const group1 = "group1";
      const group2 = "group2";

      systemManager.registerSystem(new MockSystem(), group1);
      systemManager.registerSystem(new MockSystem(), group2);

      const groups = systemManager.getSystemGroups();

      expect(groups).toContain(group1);
      expect(groups).toContain(group2);
      expect(groups.length).toBe(2);
    });
  });

  describe("system priority", () => {
    test("should set system priority", () => {
      const system = new MockSystem(SystemPriority.NORMAL);
      systemManager.registerSystem(system);
      const systemId = (system as any).id;

      const result = systemManager.setSystemPriority(
        systemId,
        SystemPriority.HIGH
      );

      expect(result).toBe(true);
      expect(system.priority).toBe(SystemPriority.HIGH);
    });

    test("should return false when setting priority for non-existent system", () => {
      const result = systemManager.setSystemPriority(
        "non-existent-id",
        SystemPriority.HIGH
      );

      expect(result).toBe(false);
    });
  });

  describe("updating systems", () => {
    test("should update systems in a group based on priority", () => {
      // Create test entities with required components
      const entity = world.createEntity();
      world.addComponent(
        entity.id,
        new MockComponent(ComponentType.TRANSFORM, entity.id)
      );

      // Create systems with different priorities
      const highPrioritySystem = new MockSystem(SystemPriority.HIGH);
      const normalPrioritySystem = new MockSystem(SystemPriority.NORMAL);
      const lowPrioritySystem = new MockSystem(SystemPriority.LOW);
      const inactiveSystem = new MockSystem(
        SystemPriority.NORMAL,
        [ComponentType.TRANSFORM],
        false
      );

      const groupName = "testGroup";

      // Register all systems in the same group
      systemManager.registerSystem(normalPrioritySystem, groupName);
      systemManager.registerSystem(highPrioritySystem, groupName);
      systemManager.registerSystem(lowPrioritySystem, groupName);
      systemManager.registerSystem(inactiveSystem, groupName);

      // Update only systems in this group
      const updatedCount = systemManager.updateSystemGroup(groupName, 0.16);

      // Verify results
      expect(updatedCount).toBe(3); // Only active systems are updated
      expect(highPrioritySystem.updateCalled).toBe(true);
      expect(normalPrioritySystem.updateCalled).toBe(true);
      expect(lowPrioritySystem.updateCalled).toBe(true);
      expect(inactiveSystem.updateCalled).toBe(false);

      // Check update order through lastDeltaTime (first updated should be highPrioritySystem)
      expect(highPrioritySystem.lastDeltaTime).toBe(0.16);

      // Check that entities were passed correctly
      expect(highPrioritySystem.lastEntities).toHaveLength(1);
      expect(normalPrioritySystem.lastEntities).toHaveLength(1);
      expect(lowPrioritySystem.lastEntities).toHaveLength(1);
    });

    test("should return 0 when updating a non-existent group", () => {
      const updatedCount = systemManager.updateSystemGroup(
        "non-existent-group",
        0.16
      );

      expect(updatedCount).toBe(0);
    });
  });

  describe("cleanup", () => {
    test("should destroy all systems and clear internal state", () => {
      const system1 = new MockSystem();
      const system2 = new MockSystem();
      const groupName = "testGroup";

      systemManager.registerSystem(system1, groupName);
      systemManager.registerSystem(system2);

      const removeSystemSpy = jest.spyOn(world, "removeSystem");

      systemManager.destroy();

      expect(removeSystemSpy).toHaveBeenCalledTimes(2);
      expect(removeSystemSpy).toHaveBeenCalledWith(system1);
      expect(removeSystemSpy).toHaveBeenCalledWith(system2);
      expect(systemManager.getAllSystems()).toHaveLength(0);
      expect(systemManager.getSystemGroups()).toHaveLength(0);

      removeSystemSpy.mockRestore();
    });
  });
});
