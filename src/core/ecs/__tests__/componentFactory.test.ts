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
  let componentFactory: ComponentFactory;

  // Create a fresh ComponentFactory for each test
  beforeEach(() => {
    componentFactory = new ComponentFactory();
  });

  describe("registration", () => {
    test("should register a component constructor", () => {
      componentFactory.register(ComponentType.TRANSFORM, MockComponent);

      expect(componentFactory.isRegistered(ComponentType.TRANSFORM)).toBe(true);
    });

    test("should unregister a component constructor", () => {
      componentFactory.register(ComponentType.TRANSFORM, MockComponent);
      componentFactory.unregister(ComponentType.TRANSFORM);

      expect(componentFactory.isRegistered(ComponentType.TRANSFORM)).toBe(
        false
      );
    });

    test("should log a warning when registering a duplicate component type", () => {
      // Mock console.warn
      const originalWarn = console.warn;
      const mockWarn = jest.fn();
      console.warn = mockWarn;

      componentFactory.register(ComponentType.TRANSFORM, MockComponent);
      componentFactory.register(ComponentType.TRANSFORM, MockComponent);

      expect(mockWarn).toHaveBeenCalledWith(
        expect.stringContaining("already registered")
      );

      // Restore console.warn
      console.warn = originalWarn;
    });

    test("should get component constructor", () => {
      componentFactory.register(ComponentType.TRANSFORM, MockComponent);

      const constructor = componentFactory.getConstructor(
        ComponentType.TRANSFORM
      );

      expect(constructor).toBe(MockComponent);
    });

    test("should return undefined for unregistered component constructor", () => {
      const constructor = componentFactory.getConstructor(
        ComponentType.VELOCITY
      );

      expect(constructor).toBeUndefined();
    });
  });

  describe("component creation", () => {
    test("should create a component", () => {
      componentFactory.register(ComponentType.TRANSFORM, MockComponent);

      const component = componentFactory.create<MockComponent>(
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
        componentFactory.create(ComponentType.VELOCITY);
      }).toThrow(/not registered/);
    });
  });

  describe("component recycling", () => {
    test("should recycle and reuse components", () => {
      componentFactory.register(ComponentType.TRANSFORM, MockComponent);

      // Create a component
      const component1 = componentFactory.create<MockComponent>(
        ComponentType.TRANSFORM,
        ComponentType.TRANSFORM,
        42
      );
      component1.entityId = "entity1";

      // Recycle it
      componentFactory.recycle(component1);

      // Check pool size
      expect(componentFactory.getPoolSize(ComponentType.TRANSFORM)).toBe(1);

      // Create another component - should reuse the recycled one
      const component2 = componentFactory.create<MockComponent>(
        ComponentType.TRANSFORM,
        ComponentType.TRANSFORM,
        100
      );

      // Pool should now be empty
      expect(componentFactory.getPoolSize(ComponentType.TRANSFORM)).toBe(0);

      // Should be the same object (recycled)
      expect(component2).toBe(component1);

      // But with updated properties
      expect(component2.value).toBe(100); // This value comes from the reset method
      expect(component2.entityId).toBe("");
      expect(component2.active).toBe(true);
    });

    test("should handle components without a reset method", () => {
      componentFactory.register(ComponentType.VELOCITY, BasicComponent);

      // Create a component
      const component1 = componentFactory.create<BasicComponent>(
        ComponentType.VELOCITY
      );
      component1.entityId = "entity1";
      component1.active = true;

      // Recycle it
      componentFactory.recycle(component1);

      // Create another component - should reuse the recycled one
      const component2 = componentFactory.create<BasicComponent>(
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
      componentFactory.recycle(component);

      // Shouldn't have a pool for this type
      expect(componentFactory.getPoolSize(ComponentType.PLAYER)).toBe(0);
    });

    test("should not exceed max pool size", () => {
      componentFactory.register(ComponentType.TRANSFORM, MockComponent);

      // Access the MAX_POOL_SIZE through reflection
      const maxPoolSize = (componentFactory as any).MAX_POOL_SIZE;
      const components = [];

      // Create and recycle more components than MAX_POOL_SIZE
      for (let i = 0; i < maxPoolSize + 10; i++) {
        const component = componentFactory.create<MockComponent>(
          ComponentType.TRANSFORM
        );
        components.push(component);
      }

      // Recycle all components
      components.forEach((component) => componentFactory.recycle(component));

      // Pool size should be capped at MAX_POOL_SIZE
      expect(componentFactory.getPoolSize(ComponentType.TRANSFORM)).toBe(
        maxPoolSize
      );
    });
  });

  describe("utility functions", () => {
    test("should clear all component pools", () => {
      componentFactory.register(ComponentType.TRANSFORM, MockComponent);
      componentFactory.register(ComponentType.VELOCITY, BasicComponent);

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
        componentFactory.recycle(transformComponent);
        componentFactory.recycle(velocityComponent);
      }

      // Verify pool sizes
      expect(componentFactory.getPoolSize(ComponentType.TRANSFORM)).toBe(5);
      expect(componentFactory.getPoolSize(ComponentType.VELOCITY)).toBe(5);

      // Clear all pools
      componentFactory.clearPools();

      // Verify pools are empty
      expect(componentFactory.getPoolSize(ComponentType.TRANSFORM)).toBe(0);
      expect(componentFactory.getPoolSize(ComponentType.VELOCITY)).toBe(0);
    });

    test("should return 0 for pool size of unregistered components", () => {
      expect(componentFactory.getPoolSize(ComponentType.NPC)).toBe(0);
    });
  });

  describe("instance separation", () => {
    test("should maintain separate component registries between instances", () => {
      // Create two separate component factory instances
      const factory1 = new ComponentFactory();
      const factory2 = new ComponentFactory();

      // Register a component only in factory1
      factory1.register(ComponentType.TRANSFORM, MockComponent);

      // Factory1 should have the component registered
      expect(factory1.isRegistered(ComponentType.TRANSFORM)).toBe(true);

      // Factory2 should not have the component registered
      expect(factory2.isRegistered(ComponentType.TRANSFORM)).toBe(false);
    });

    test("should maintain separate component pools between instances", () => {
      // Create two separate component factory instances
      const factory1 = new ComponentFactory();
      const factory2 = new ComponentFactory();

      // Register the same component type in both factories
      factory1.register(ComponentType.TRANSFORM, MockComponent);
      factory2.register(ComponentType.TRANSFORM, MockComponent);

      // Create and recycle a component in factory1
      const component = factory1.create<MockComponent>(ComponentType.TRANSFORM);
      factory1.recycle(component);

      // Factory1 should have one component in its pool
      expect(factory1.getPoolSize(ComponentType.TRANSFORM)).toBe(1);

      // Factory2 should have an empty pool
      expect(factory2.getPoolSize(ComponentType.TRANSFORM)).toBe(0);
    });
  });
});
