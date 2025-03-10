import { System, SystemPriority, Entity } from "./types";
import { GameWorld } from "./world";

/**
 * SystemManager handles the registration, organization, and execution of ECS systems.
 * It provides more advanced system management functionality than the basic World implementation,
 * including system priority management, pausing/resuming specific systems, and system groups.
 */
export class SystemManager {
  private world: GameWorld;
  private activeSystems: Map<string, System> = new Map();
  private inactiveSystems: Map<string, System> = new Map();
  private systemGroups: Map<string, Set<System>> = new Map();

  /**
   * Creates a new SystemManager
   * @param world The World instance to manage systems for
   */
  constructor(world: GameWorld) {
    this.world = world;
  }

  /**
   * Registers a system with the manager and adds it to the world
   * @param system The system to register
   * @param groupName Optional group name to organize systems
   * @returns The registered system for chaining
   */
  public registerSystem(system: System, groupName?: string): System {
    // Generate a unique ID for the system if it doesn't have one
    const systemId =
      (system as any).id ||
      `system_${this.activeSystems.size + this.inactiveSystems.size}`;
    (system as any).id = systemId;

    // Add to appropriate map based on active state
    if (system.active) {
      this.activeSystems.set(systemId, system);
    } else {
      this.inactiveSystems.set(systemId, system);
    }

    // Add to group if specified
    if (groupName) {
      if (!this.systemGroups.has(groupName)) {
        this.systemGroups.set(groupName, new Set<System>());
      }
      this.systemGroups.get(groupName)!.add(system);
    }

    // Add system to world
    this.world.addSystem(system);

    return system;
  }

  /**
   * Unregisters a system from the manager and removes it from the world
   * @param system The system to unregister
   * @returns True if the system was successfully unregistered
   */
  public unregisterSystem(system: System): boolean {
    const systemId = (system as any).id;

    if (!systemId) {
      return false;
    }

    // Remove from active or inactive systems
    if (system.active) {
      this.activeSystems.delete(systemId);
    } else {
      this.inactiveSystems.delete(systemId);
    }

    // Remove from any groups
    this.systemGroups.forEach((systems) => {
      systems.delete(system);
    });

    // Clean up empty groups
    for (const [groupName, systems] of this.systemGroups.entries()) {
      if (systems.size === 0) {
        this.systemGroups.delete(groupName);
      }
    }

    // Remove from world
    return this.world.removeSystem(system);
  }

  /**
   * Gets a system by its ID
   * @param systemId The ID of the system to get
   * @returns The system, or undefined if not found
   */
  public getSystem(systemId: string): System | undefined {
    return (
      this.activeSystems.get(systemId) || this.inactiveSystems.get(systemId)
    );
  }

  /**
   * Gets all systems in a specific group
   * @param groupName The name of the group
   * @returns Array of systems in the group, or empty array if group doesn't exist
   */
  public getSystemsInGroup(groupName: string): System[] {
    const group = this.systemGroups.get(groupName);
    return group ? Array.from(group) : [];
  }

  /**
   * Enables a system that was previously disabled
   * @param systemId The ID of the system to enable
   * @returns True if the system was successfully enabled
   */
  public enableSystem(systemId: string): boolean {
    const system = this.inactiveSystems.get(systemId);

    if (!system) {
      return false;
    }

    system.active = true;
    this.inactiveSystems.delete(systemId);
    this.activeSystems.set(systemId, system);

    return true;
  }

  /**
   * Disables a system without removing it
   * @param systemId The ID of the system to disable
   * @returns True if the system was successfully disabled
   */
  public disableSystem(systemId: string): boolean {
    const system = this.activeSystems.get(systemId);

    if (!system) {
      return false;
    }

    system.active = false;
    this.activeSystems.delete(systemId);
    this.inactiveSystems.set(systemId, system);

    return true;
  }

  /**
   * Enables all systems in a group
   * @param groupName The name of the group to enable
   * @returns Number of systems enabled
   */
  public enableSystemGroup(groupName: string): number {
    const group = this.systemGroups.get(groupName);

    if (!group) {
      return 0;
    }

    let enabledCount = 0;

    group.forEach((system) => {
      const systemId = (system as any).id;

      if (this.inactiveSystems.has(systemId)) {
        this.enableSystem(systemId);
        enabledCount++;
      }
    });

    return enabledCount;
  }

  /**
   * Disables all systems in a group
   * @param groupName The name of the group to disable
   * @returns Number of systems disabled
   */
  public disableSystemGroup(groupName: string): number {
    const group = this.systemGroups.get(groupName);

    if (!group) {
      return 0;
    }

    let disabledCount = 0;

    group.forEach((system) => {
      const systemId = (system as any).id;

      if (this.activeSystems.has(systemId)) {
        this.disableSystem(systemId);
        disabledCount++;
      }
    });

    return disabledCount;
  }

  /**
   * Sets the priority of a system
   * @param systemId The ID of the system
   * @param priority The new priority
   * @returns True if the priority was successfully set
   */
  public setSystemPriority(
    systemId: string,
    priority: SystemPriority
  ): boolean {
    const system = this.getSystem(systemId);

    if (!system) {
      return false;
    }

    system.priority = priority;

    return true;
  }

  /**
   * Updates only systems in a specific group
   * @param groupName The name of the group to update
   * @param deltaTime The time in seconds since the last update
   * @returns Number of systems updated
   */
  public updateSystemGroup(groupName: string, deltaTime: number): number {
    const group = this.systemGroups.get(groupName);

    if (!group) {
      return 0;
    }

    let updatedCount = 0;

    // Convert to array, sort by priority, and update
    const sortedSystems = Array.from(group)
      .filter((system) => system.active)
      .sort((a, b) => a.priority - b.priority);

    for (const system of sortedSystems) {
      this.updateSystem(system, deltaTime);
      updatedCount++;
    }

    return updatedCount;
  }

  /**
   * Updates a single system with relevant entities
   * @param system The system to update
   * @param deltaTime The time in seconds since the last update
   */
  private updateSystem(system: System, deltaTime: number): void {
    const relevantEntities = this.getRelevantEntities(system);
    system.update(deltaTime, relevantEntities);
  }

  /**
   * Gets entities relevant to a specific system based on required components
   * @param system The system to get entities for
   * @returns Array of entities with all required components
   */
  private getRelevantEntities(system: System): Entity[] {
    return this.world.queryEntities({
      all: system.requiredComponents,
    });
  }

  /**
   * Gets all registered systems (both active and inactive)
   * @returns Array of all systems
   */
  public getAllSystems(): System[] {
    return [
      ...Array.from(this.activeSystems.values()),
      ...Array.from(this.inactiveSystems.values()),
    ];
  }

  /**
   * Gets all active systems
   * @returns Array of active systems
   */
  public getActiveSystems(): System[] {
    return Array.from(this.activeSystems.values());
  }

  /**
   * Gets all inactive systems
   * @returns Array of inactive systems
   */
  public getInactiveSystems(): System[] {
    return Array.from(this.inactiveSystems.values());
  }

  /**
   * Gets all system groups
   * @returns Array of group names
   */
  public getSystemGroups(): string[] {
    return Array.from(this.systemGroups.keys());
  }

  /**
   * Cleans up all systems and clears internal state
   */
  public destroy(): void {
    // Unregister all systems from the world
    this.getAllSystems().forEach((system) => {
      this.world.removeSystem(system);
    });

    // Clear internal state
    this.activeSystems.clear();
    this.inactiveSystems.clear();
    this.systemGroups.clear();
  }
}
