import { v4 as uuidv4 } from "uuid";
import {
  Entity,
  EntityId,
  Component,
  ComponentType,
  System,
  World,
  EntityQueryOptions,
  GameEvent,
  EventEmitter,
  EventListener,
  GameTime,
} from "./types";
import { DEFAULT_POSITIONS, ENTITY_TAGS, EVENTS } from "../../config/constants";

/**
 * Implementation of the World interface.
 * Manages all entities, components, and systems in the game.
 */
export class GameWorld implements World, EventEmitter {
  public entities: Map<EntityId, Entity>;
  public systems: System[];
  public time: GameTime;

  private eventListeners: Map<string, Set<EventListener>>;

  constructor() {
    this.entities = new Map<EntityId, Entity>();
    this.systems = [];
    this.eventListeners = new Map<string, Set<EventListener>>();
    this.time = {
      deltaTime: 0,
      elapsedTime: 0,
      frameCount: 0,
    };
  }

  /**
   * Creates a new entity with a unique ID
   */
  public createEntity(): Entity {
    const entityId = uuidv4();
    const entity: Entity = {
      id: entityId,
      components: new Map<ComponentType, Component>(),
      active: true,
      tags: new Set<string>(),
    };

    this.entities.set(entityId, entity);

    // Emit entity created event
    this.emit({
      type: EVENTS.ENTITY_CREATED,
      entityId: entityId,
    });

    return entity;
  }

  /**
   * Removes an entity and all its components
   */
  public removeEntity(entityId: EntityId): boolean {
    const entity = this.entities.get(entityId);

    if (!entity) {
      return false;
    }

    // Remove all components
    entity.components.forEach((component) => {
      this.emit({
        type: EVENTS.COMPONENT_REMOVED,
        entityId: entityId,
        componentType: component.type,
      });
    });

    // Remove entity
    const result = this.entities.delete(entityId);

    // Emit entity removed event
    if (result) {
      this.emit({
        type: EVENTS.ENTITY_REMOVED,
        entityId: entityId,
      });
    }

    return result;
  }

  /**
   * Adds a component to an entity
   */
  public addComponent(entityId: EntityId, component: Component): boolean {
    const entity = this.entities.get(entityId);

    if (!entity) {
      return false;
    }

    // Set the entityId on the component
    component.entityId = entityId;

    // Add component to entity
    entity.components.set(component.type, component);

    // Emit component added event
    this.emit({
      type: EVENTS.COMPONENT_ADDED,
      entityId: entityId,
      componentType: component.type,
    });

    return true;
  }

  /**
   * Removes a component from an entity
   */
  public removeComponent(
    entityId: EntityId,
    componentType: ComponentType
  ): boolean {
    const entity = this.entities.get(entityId);

    if (!entity || !entity.components.has(componentType)) {
      return false;
    }

    // Remove component
    const result = entity.components.delete(componentType);

    // Emit component removed event
    if (result) {
      this.emit({
        type: EVENTS.COMPONENT_REMOVED,
        entityId: entityId,
        componentType: componentType,
      });
    }

    return result;
  }

  /**
   * Gets a component from an entity
   */
  public getComponent<T extends Component>(
    entityId: EntityId,
    componentType: ComponentType
  ): T | null {
    const entity = this.entities.get(entityId);

    if (!entity) {
      return null;
    }

    const component = entity.components.get(componentType) as T;

    return component || null;
  }

  /**
   * Adds a system to the world
   */
  public addSystem(system: System): void {
    this.systems.push(system);

    // Sort systems by priority
    this.systems.sort((a, b) => a.priority - b.priority);

    // Initialize system if it has an initialize method
    if (system.initialize) {
      system.initialize(this);
    }

    // Emit system added event
    this.emit({
      type: EVENTS.SYSTEM_ADDED,
      system: system,
    });
  }

  /**
   * Removes a system from the world
   */
  public removeSystem(system: System): boolean {
    const index = this.systems.indexOf(system);

    if (index === -1) {
      return false;
    }

    // Call cleanup if it exists
    if (system.cleanup) {
      system.cleanup();
    }

    // Remove system
    this.systems.splice(index, 1);

    // Emit system removed event
    this.emit({
      type: EVENTS.SYSTEM_REMOVED,
      system: system,
    });

    return true;
  }

  /**
   * Updates all systems with the given delta time
   */
  public update(deltaTime: number): void {
    // Update time
    this.time.deltaTime = deltaTime;
    this.time.elapsedTime += deltaTime;
    this.time.frameCount++;

    // Update each active system with relevant entities
    for (const system of this.systems) {
      if (system.active) {
        const relevantEntities = this.queryEntities({
          all: system.requiredComponents,
        });

        system.update(deltaTime, relevantEntities);
      }
    }
  }

  /**
   * Queries entities based on component requirements
   */
  public queryEntities(options: EntityQueryOptions): Entity[] {
    const result: Entity[] = [];

    for (const entity of this.entities.values()) {
      if (!entity.active) {
        continue;
      }

      let includeEntity = true;

      // Check for required components (all)
      if (options.all) {
        for (const componentType of options.all) {
          if (!entity.components.has(componentType)) {
            includeEntity = false;
            break;
          }
        }
      }

      // Check for any components (any)
      if (includeEntity && options.any) {
        includeEntity = false;
        for (const componentType of options.any) {
          if (entity.components.has(componentType)) {
            includeEntity = true;
            break;
          }
        }
      }

      // Check for excluded components (none)
      if (includeEntity && options.none) {
        for (const componentType of options.none) {
          if (entity.components.has(componentType)) {
            includeEntity = false;
            break;
          }
        }
      }

      // Check for required tags
      if (includeEntity && options.tags) {
        for (const tag of options.tags) {
          if (!entity.tags.has(tag)) {
            includeEntity = false;
            break;
          }
        }
      }

      // Add entity to result if it meets all criteria
      if (includeEntity) {
        result.push(entity);
      }
    }

    return result;
  }

  /**
   * Adds an event listener
   */
  public on(eventType: string, listener: EventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set<EventListener>());
    }

    this.eventListeners.get(eventType)!.add(listener);
  }

  /**
   * Removes an event listener
   */
  public off(eventType: string, listener: EventListener): void {
    const listeners = this.eventListeners.get(eventType);

    if (listeners) {
      listeners.delete(listener);

      if (listeners.size === 0) {
        this.eventListeners.delete(eventType);
      }
    }
  }

  /**
   * Emits an event to all registered listeners
   */
  public emit(event: GameEvent): void {
    const listeners = this.eventListeners.get(event.type);

    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }

  /**
   * Initializes the world with basic setup
   * This includes creating the planet and skybox
   */
  public initializeWorld(): void {
    // Here you would set up your initial scene
    this.createSkybox();
    this.createPlanet();

    // Emit world initialized event
    this.emit({
      type: EVENTS.WORLD_INITIALIZED,
    });
  }

  /**
   * Creates the skybox using starfield image
   */
  private createSkybox(): void {
    // Create skybox entity
    const skyboxEntity = this.createEntity();

    // Add skybox tag
    skyboxEntity.tags.add(ENTITY_TAGS.SKYBOX);

    // TODO: add the necessary components for a skybox
    // a transform component and a mesh/material component
    // Example (pseudo-code):
    // this.addComponent(skyboxEntity.id, new TransformComponent());
    // this.addComponent(skyboxEntity.id, new MeshComponent(ASSETS.SKYBOX));

    console.log("Skybox created with entity ID:", skyboxEntity.id);
  }

  /**
   * Creates the planet floor using silver floor image
   */
  private createPlanet(): void {
    // Create planet entity
    const planetEntity = this.createEntity();

    // Add planet tag
    planetEntity.tags.add(ENTITY_TAGS.PLANET);

    // TODO: add the necessary components for the planet
    // Example (pseudo-code):
    // this.addComponent(planetEntity.id, new TransformComponent());
    // this.addComponent(planetEntity.id, new MeshComponent(ASSETS.PLANET));
    // this.addComponent(planetEntity.id, new ColliderComponent('floor'));

    console.log("Planet created with entity ID:", planetEntity.id);
  }

  /**
   * Creates a default player entity
   */
  public createPlayerEntity(position = DEFAULT_POSITIONS.PLAYER): Entity {
    const playerEntity = this.createEntity();

    // Add player tag
    playerEntity.tags.add(ENTITY_TAGS.PLAYER);

    // Here you would add player components
    // Example (pseudo-code):
    // this.addComponent(playerEntity.id, new TransformComponent(position));
    // this.addComponent(playerEntity.id, new PlayerComponent());
    // this.addComponent(playerEntity.id, new ColliderComponent('player'));
    // this.addComponent(playerEntity.id, new VelocityComponent());

    console.log("Player created with entity ID:", playerEntity.id);

    return playerEntity;
  }

  /**
   * Creates an NPC entity
   */
  public createNPCEntity(
    position = DEFAULT_POSITIONS.NPC,
    dialogueKey: string
  ): Entity {
    const npcEntity = this.createEntity();

    // Add NPC tag
    npcEntity.tags.add(ENTITY_TAGS.NPC);

    // Here you would add NPC components
    // Example (pseudo-code):
    // this.addComponent(npcEntity.id, new TransformComponent(position));
    // this.addComponent(npcEntity.id, new NPCComponent(dialogueKey));
    // this.addComponent(npcEntity.id, new ColliderComponent('npc'));

    console.log("NPC created with entity ID:", npcEntity.id);

    return npcEntity;
  }

  /**
   * Creates a billboard entity for displaying portfolio information
   */
  public createBillboardEntity(position = DEFAULT_POSITIONS.BILLBOARD): Entity {
    const billboardEntity = this.createEntity();

    // Add billboard tag
    billboardEntity.tags.add(ENTITY_TAGS.BILLBOARD);

    // Here you would add billboard components
    // Example (pseudo-code):
    // this.addComponent(billboardEntity.id, new TransformComponent(position));
    // this.addComponent(billboardEntity.id, new BillboardComponent());
    // this.addComponent(billboardEntity.id, new InteractableComponent());

    console.log("Billboard created with entity ID:", billboardEntity.id);

    return billboardEntity;
  }

  /**
   * Cleans up and destroys the world
   * Call this when shutting down to prevent memory leaks
   */
  public destroy(): void {
    // Clean up all systems
    for (const system of this.systems) {
      if (system.cleanup) {
        system.cleanup();
      }
    }

    // Clear all entities, components, and systems
    this.entities.clear();
    this.systems.length = 0;
    this.eventListeners.clear();

    console.log("World destroyed");
  }
}

// Create a singleton instance for global access
export const world = new GameWorld();
