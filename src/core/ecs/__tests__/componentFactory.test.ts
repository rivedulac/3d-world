import { ComponentFactory } from "../componentFactory";
import { Component, ComponentType } from "../types";

// Mock component implementation for testing
class MockComponent implements Component {
  type: ComponentType;
  entityId: string;
  active: boolean;
  value: number; // Additional test property

  constructor(
    type: ComponentType = ComponentType.TRANSFORM,
    value: number = 0
  ) {
    this.type = type;
    this.entityId = "";
    this.active = true;
    this.value = value;
  }

  // Custom reset method to test component reuse
  reset(
    type: ComponentType = ComponentType.TRANSFORM,
    value: number = 0
  ): void {
    this.type = type; // Maintain the component type
    this.entityId = "";
    this.active = true;
    this.value = value; // Explicitly set value from the argument
  }
}

// Mock component with no reset method
class BasicComponent implements Component {
  type: ComponentType;
  entityId: string;
  active: boolean;
  // Add an id property to help ensure uniqueness in tests
  id: number;

  constructor(type: ComponentType = ComponentType.VELOCITY) {
    this.type = type;
    this.entityId = "";
    this.active = true;
    this.id = Math.floor(Math.random() * 1000000); // Random id for uniqueness
  }
}

describe("ComponentFactory", () => {
  // Clear the registry before each test to ensure isolation
  beforeEach(() => {
    // Clear the registry by using unregister on any registered components
    [
      ComponentType.TRANSFORM,
      ComponentType.VELOCITY,
      ComponentType.PLAYER,
      ComponentType.NPC,
    ].forEach((type) => {
      if (ComponentFactory.isRegistered(type)) {
        ComponentFactory.unregister(type);
      }
    });
  });

  afterAll(() => {
    ComponentFactory.clearPools();
  });

  describe("registration", () => {
    test("should register a component constructor", () => {
      ComponentFactory.register(ComponentType.TRANSFORM, MockComponent);

      expect(ComponentFactory.isRegistered(ComponentType.TRANSFORM)).toBe(true);
    });

    test("should unregister a component constructor", () => {
      ComponentFactory.register(ComponentType.TRANSFORM, MockComponent);
      ComponentFactory.unregister(ComponentType.TRANSFORM);

      expect(ComponentFactory.isRegistered(ComponentType.TRANSFORM)).toBe(
        false
      );
    });

    test("should log a warning when registering a duplicate component type", () => {
      // Mock console.warn
      const originalWarn = console.warn;
      const mockWarn = jest.fn();
      console.warn = mockWarn;

      ComponentFactory.register(ComponentType.TRANSFORM, MockComponent);
      ComponentFactory.register(ComponentType.TRANSFORM, MockComponent);

      expect(mockWarn).toHaveBeenCalledWith(
        expect.stringContaining("already registered")
      );

      // Restore console.warn
      console.warn = originalWarn;
    });

    test("should get component constructor", () => {
      ComponentFactory.register(ComponentType.TRANSFORM, MockComponent);

      const constructor = ComponentFactory.getConstructor(
        ComponentType.TRANSFORM
      );

      expect(constructor).toBe(MockComponent);
    });

    test("should return undefined for unregistered component constructor", () => {
      const constructor = ComponentFactory.getConstructor(
        ComponentType.VELOCITY
      );

      expect(constructor).toBeUndefined();
    });
  });

  describe("component creation", () => {
    test("should create a component", () => {
      ComponentFactory.register(ComponentType.TRANSFORM, MockComponent);

      const component = ComponentFactory.create<MockComponent>(
        ComponentType.TRANSFORM,
        ComponentType.TRANSFORM,
        42
      );

      expect(component).toBeInstanceOf(MockComponent);
      expect(component.type).toBe(ComponentType.TRANSFORM);
      expect(component.value).toBe(42);
    });

    test("should throw an error when creating an unregistered component", () => {
      expect(() => {
        ComponentFactory.create(ComponentType.VELOCITY);
      }).toThrow(/not registered/);
    });
  });

  describe("component recycling", () => {
    test("should recycle and reuse components", () => {
      ComponentFactory.register(ComponentType.TRANSFORM, MockComponent);

      // Create a component
      const component1 = ComponentFactory.create<MockComponent>(
        ComponentType.TRANSFORM,
        ComponentType.TRANSFORM,
        42
      );
      component1.entityId = "entity1";

      // Recycle it
      ComponentFactory.recycle(component1);

      // Check pool size
      expect(ComponentFactory.getPoolSize(ComponentType.TRANSFORM)).toBe(1);

      // Create another component - should reuse the recycled one
      const component2 = ComponentFactory.create<MockComponent>(
        ComponentType.TRANSFORM,
        ComponentType.TRANSFORM,
        100
      );

      // Pool should now be empty
      expect(ComponentFactory.getPoolSize(ComponentType.TRANSFORM)).toBe(0);

      // Should be the same object (recycled)
      expect(component2).toBe(component1);

      // But with updated properties
      expect(component2.value).toBe(100); // This value comes from the reset method
      expect(component2.entityId).toBe("");
      expect(component2.active).toBe(true);
    });

    test("should handle components without a reset method", () => {
      ComponentFactory.register(ComponentType.VELOCITY, BasicComponent);

      // Create a component
      const component1 = ComponentFactory.create<BasicComponent>(
        ComponentType.VELOCITY
      );
      component1.entityId = "entity1";
      component1.active = true;

      // Recycle it
      ComponentFactory.recycle(component1);

      // Create another component - should reuse the recycled one
      const component2 = ComponentFactory.create<BasicComponent>(
        ComponentType.VELOCITY
      );

      // Should be the same object (recycled)
      expect(component2).toBe(component1);

      // But with reset active state
      expect(component2.active).toBe(true);
      expect(component2.entityId).toBe("");
    });

    test("should ignore recycling of unregistered components", () => {
      // Create a component without registering its type
      const component = new MockComponent(ComponentType.PLAYER);

      // This should not throw an error
      ComponentFactory.recycle(component);

      // Shouldn't have a pool for this type
      expect(ComponentFactory.getPoolSize(ComponentType.PLAYER)).toBe(0);
    });

    test("should not exceed max pool size", () => {
      ComponentFactory.register(ComponentType.TRANSFORM, MockComponent);

      // Access the MAX_POOL_SIZE through reflection
      const maxPoolSize = (ComponentFactory as any).MAX_POOL_SIZE;
      const components = [];

      // Create and recycle more components than MAX_POOL_SIZE
      for (let i = 0; i < maxPoolSize + 10; i++) {
        const component = ComponentFactory.create<MockComponent>(
          ComponentType.TRANSFORM
        );
        components.push(component);
      }

      // Recycle all components
      components.forEach((component) => ComponentFactory.recycle(component));

      // Pool size should be capped at MAX_POOL_SIZE
      expect(ComponentFactory.getPoolSize(ComponentType.TRANSFORM)).toBe(
        maxPoolSize
      );
    });
  });

  describe("utility functions", () => {
    test("should clear all component pools", () => {
      // Clear any existing pools first
      ComponentFactory.clearPools();

      // Unregister and re-register component types to ensure clean state
      if (ComponentFactory.isRegistered(ComponentType.TRANSFORM)) {
        ComponentFactory.unregister(ComponentType.TRANSFORM);
      }
      if (ComponentFactory.isRegistered(ComponentType.VELOCITY)) {
        ComponentFactory.unregister(ComponentType.VELOCITY);
      }

      ComponentFactory.register(ComponentType.TRANSFORM, MockComponent);
      ComponentFactory.register(ComponentType.VELOCITY, BasicComponent);

      // Create and store components in arrays to ensure they're unique
      const transformComponents: MockComponent[] = [];
      const velocityComponents: BasicComponent[] = [];

      // Create 5 unique components of each type
      for (let i = 0; i < 5; i++) {
        // Create new components directly using constructors to ensure uniqueness
        const transformComponent = new MockComponent(
          ComponentType.TRANSFORM,
          i
        );
        const velocityComponent = new BasicComponent(ComponentType.VELOCITY);

        transformComponents.push(transformComponent);
        velocityComponents.push(velocityComponent);

        // Immediately recycle each component
        ComponentFactory.recycle(transformComponent);
        ComponentFactory.recycle(velocityComponent);
      }

      // Verify pool sizes
      expect(ComponentFactory.getPoolSize(ComponentType.TRANSFORM)).toBe(5);
      expect(ComponentFactory.getPoolSize(ComponentType.VELOCITY)).toBe(5);

      // Clear all pools
      ComponentFactory.clearPools();

      // Verify pools are empty
      expect(ComponentFactory.getPoolSize(ComponentType.TRANSFORM)).toBe(0);
      expect(ComponentFactory.getPoolSize(ComponentType.VELOCITY)).toBe(0);
    });

    test("should return 0 for pool size of unregistered components", () => {
      expect(ComponentFactory.getPoolSize(ComponentType.NPC)).toBe(0);
    });

    test("should return 0 for pool size of unregistered components", () => {
      expect(ComponentFactory.getPoolSize(ComponentType.NPC)).toBe(0);
    });
  });
});
