/**
 * Component Factory
 *
 * This factory is responsible for creating and recycling components.
 * It implements the object pool design pattern to minimize garbage collection.
 *
 * It provides:
 * - Component registration
 * - Component instantiation
 * - Component recycling
 */

import { Component, ComponentType, ComponentConstructor } from "./types";

/**
 * ComponentFactory provides centralized creation and management of components.
 * It manages a registry of component constructors and component pools.
 */
export class ComponentFactory {
  // Registry of component constructors mapped by component type
  private static componentRegistry: Map<
    ComponentType,
    ComponentConstructor<Component>
  > = new Map();

  // Object pools for each component type
  private static componentPools: Map<ComponentType, Component[]> = new Map();

  // Maximum pool size per component type (to avoid memory leaks)
  private static readonly MAX_POOL_SIZE = 1000;

  /**
   * Registers a component constructor for a specific component type
   * @param type The component type
   * @param constructor The component constructor
   */
  public static register<T extends Component>(
    type: ComponentType,
    constructor: ComponentConstructor<T>
  ): void {
    if (this.componentRegistry.has(type)) {
      console.warn(
        `Component type ${type} is already registered. Overwriting.`
      );
    }

    this.componentRegistry.set(
      type,
      constructor as ComponentConstructor<Component>
    );
    this.componentPools.set(type, []);
  }

  /**
   * Unregisters a component type
   * @param type The component type to unregister
   */
  public static unregister(type: ComponentType): void {
    this.componentRegistry.delete(type);
    this.componentPools.delete(type);
  }

  /**
   * Checks if a component type is registered
   * @param type The component type to check
   * @returns True if the component type is registered
   */
  public static isRegistered(type: ComponentType): boolean {
    return this.componentRegistry.has(type);
  }

  /**
   * Creates a new component of the specified type
   * Reuses a component from the pool if available
   * @param type The component type
   * @param args Arguments to pass to the component constructor
   * @returns The created or recycled component
   * @throws Error if the component type is not registered
   */
  public static create<T extends Component>(
    type: ComponentType,
    ...args: any[]
  ): T {
    if (!this.isRegistered(type)) {
      throw new Error(`Component type ${type} is not registered.`);
    }

    const pool = this.componentPools.get(type)!;
    let component: Component;

    // Try to reuse a component from the pool
    if (pool.length > 0) {
      component = pool.pop()!;
      // Reset component state
      this.resetComponent(component, ...args);
    } else {
      // Create a new component
      const constructor = this.componentRegistry.get(type)!;
      component = new constructor(...args);
    }

    // Ensure the component has the correct type
    component.type = type;

    // Set active to true for the returned component
    component.active = true;

    return component as T;
  }

  /**
   * Recycles a component back into its pool for future reuse
   * @param component The component to recycle
   */
  public static recycle(component: Component): void {
    const type = component.type;

    if (!this.isRegistered(type)) {
      return; // Ignore unregistered component types
    }

    const pool = this.componentPools.get(type)!;

    // Only add to pool if not already at max capacity
    // and if the component is not already in the pool (prevent duplicates)
    if (pool.length < this.MAX_POOL_SIZE && !pool.includes(component)) {
      // Mark the component as inactive
      component.active = false;
      // Clear the entityId
      component.entityId = "";

      pool.push(component);
    }
  }

  /**
   * Reset a component's state with new arguments
   * @param component The component to reset
   * @param args New arguments to initialize the component with
   */
  private static resetComponent(component: Component, ...args: any[]): void {
    // By default, we'll just set the active state to true
    component.active = true;

    // If the component has a reset method, call it
    if (
      "reset" in component &&
      typeof (component as any).reset === "function"
    ) {
      (component as any).reset(...args);
    } else {
      // For components without a reset method, we need to apply constructor arguments
      // This is a simplified approach - in a real implementation you might want
      // more sophisticated property copying based on component type
      if (args.length > 0) {
        // Apply properties from the first argument (assuming it's an object)
        Object.assign(component, args[0]);
      }
    }
  }

  /**
   * Clear all component pools
   * Call this when destroying the world
   */
  public static clearPools(): void {
    this.componentPools.forEach((pool) => {
      pool.length = 0;
    });
  }

  /**
   * Gets the number of available components in a pool
   * @param type The component type
   * @returns The number of components in the pool, or 0 if the type is not registered
   */
  public static getPoolSize(type: ComponentType): number {
    if (!this.isRegistered(type)) {
      return 0;
    }
    return this.componentPools.get(type)!.length;
  }

  /**
   * Gets the constructor for a component type
   * @param type The component type
   * @returns The component constructor, or undefined if not registered
   */
  public static getConstructor<T extends Component>(
    type: ComponentType
  ): ComponentConstructor<T> | undefined {
    return this.componentRegistry.get(type) as
      | ComponentConstructor<T>
      | undefined;
  }
}
