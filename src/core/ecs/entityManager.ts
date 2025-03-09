import { GameWorld } from "./world";
import { Entity, EntityId, ComponentType, EntityQueryOptions } from "./types";
import { DEFAULT_POSITIONS, ENTITY_TAGS } from "../../config/constants";

/**
 * EntityManager provides higher-level entity creation and management utilities
 * It focuses on specialized entity types, complex queries, and group operations
 * while delegating basic entity and component operations to GameWorld.
 */
export class EntityManager {
  private world: GameWorld;

  /**
   * Creates a new EntityManager
   * @param world The GameWorld instance to manage entities for
   */
  constructor(world: GameWorld) {
    this.world = world;
  }

  /**
   * Gets all entities with a specific tag
   * @param tag The tag to filter by
   * @returns An array of entities with the tag
   */
  public getEntitiesByTag(tag: string): Entity[] {
    return this.world.queryEntities({ tags: [tag] });
  }

  /**
   * Gets all entities with specific components
   * @param componentTypes The component types to filter by
   * @returns An array of entities with the components
   */
  public getEntitiesByComponents(componentTypes: ComponentType[]): Entity[] {
    return this.world.queryEntities({ all: componentTypes });
  }

  /**
   * Creates a character entity with required components
   * @param position Starting position
   * @param isPlayer Whether this is the player character
   * @param characterName Optional name for the character
   * @returns The created character entity
   */
  public createCharacterEntity(
    position = DEFAULT_POSITIONS.PLAYER,
    isPlayer = true,
    characterName?: string
  ): Entity {
    // Use the basic world method to create an entity
    const entity = this.world.createEntity();

    // Add the appropriate tag
    const tag = isPlayer ? ENTITY_TAGS.PLAYER : ENTITY_TAGS.NPC;
    entity.tags.add(tag);

    // TODO: Add components to the entity
    console.log(`Created character entity (${tag}) at position:`, position);
    if (characterName) {
      console.log(`Character name: ${characterName}`);
    }

    return entity;
  }

  /**
   * Creates an interactive object entity
   * @param position The position of the object
   * @param interactionType The type of interaction (examine, pick up, etc.)
   * @returns The created interactive object entity
   */
  public createInteractiveObject(
    position: { x: number; y: number; z: number },
    interactionType: string
  ): Entity {
    const entity = this.world.createEntity();

    entity.tags.add("interactive");

    // TODO: Add components to the entity
    // - TransformComponent
    // - InteractableComponent
    // - MeshComponent
    console.log(
      `Created interactive object (${interactionType}) at:`,
      position
    );

    return entity;
  }

  /**
   * Creates a group of entities in a formation
   * @param centerPosition The center position of the formation
   * @param entityCount Number of entities to create
   * @param radius Radius of the formation
   * @param createEntityFn Function to create each entity
   * @returns Array of created entities
   */
  public createEntityFormation(
    centerPosition: { x: number; y: number; z: number },
    entityCount: number,
    radius: number,
    createEntityFn: (position: { x: number; y: number; z: number }) => Entity
  ): Entity[] {
    const entities: Entity[] = [];

    // Simple circle formation
    for (let i = 0; i < entityCount; i++) {
      const angle = (i / entityCount) * Math.PI * 2;
      const position = {
        x: centerPosition.x + Math.cos(angle) * radius,
        y: centerPosition.y,
        z: centerPosition.z + Math.sin(angle) * radius,
      };

      entities.push(createEntityFn(position));
    }

    return entities;
  }

  /**
   * Creates a complete NPC with dialogue capabilities
   * @param position Position of the NPC
   * @param dialogueKey Key for the NPC's dialogue data
   * @param name Name of the NPC
   * @returns The created NPC entity
   */
  public createNPCWithDialogue(
    position = DEFAULT_POSITIONS.NPC,
    dialogueKey: string,
    name: string
  ): Entity {
    const npcEntity = this.world.createNPCEntity(position, dialogueKey);

    // TODO: Add additional components or setup beyond what the basic createNPCEntity does
    // For example, could add personality traits, appearance data, etc.
    console.log(`Created NPC "${name}" with dialogue key: ${dialogueKey}`);

    return npcEntity;
  }

  /**
   * Creates an interactive billboard with portfolio content
   * @param position Position of the billboard
   * @param contentType Type of portfolio content (resume, projects, skills)
   * @returns The created billboard entity
   */
  public createPortfolioBillboard(
    position = DEFAULT_POSITIONS.BILLBOARD,
    contentType: "resume" | "projects" | "skills"
  ): Entity {
    const billboardEntity = this.world.createBillboardEntity(position);

    // TODO: Add specialized components for the portfolio content
    console.log(`Created portfolio billboard with content: ${contentType}`);

    return billboardEntity;
  }

  /**
   * Deactivates all entities except for those with specified tags
   * @param exceptTags Tags of entities to keep active
   * @returns Number of entities deactivated
   */
  public deactivateAllExcept(exceptTags: string[]): number {
    let deactivatedCount = 0;

    this.world.entities.forEach((entity) => {
      // Check if entity has any of the exception tags
      const shouldKeepActive = exceptTags.some((tag) => entity.tags.has(tag));

      if (!shouldKeepActive && entity.active) {
        entity.active = false;
        deactivatedCount++;
      }
    });

    return deactivatedCount;
  }

  /**
   * Removes all entities that match the query
   * @param options Query options to match entities for removal
   * @returns Number of entities removed
   */
  public removeEntitiesMatching(options: EntityQueryOptions): number {
    const entitiesToRemove = this.world.queryEntities(options);

    for (const entity of entitiesToRemove) {
      this.world.removeEntity(entity.id);
    }

    return entitiesToRemove.length;
  }

  /**
   * Clones an entity, creating a new entity with the same components and tags
   * @param entityId The ID of the entity to clone
   * @returns The cloned entity, or null if the source entity doesn't exist
   */
  public cloneEntity(entityId: EntityId): Entity | null {
    const sourceEntity = this.world.entities.get(entityId);
    if (!sourceEntity) {
      return null;
    }

    // Create a new entity
    const clonedEntity = this.world.createEntity();

    // Copy active state
    clonedEntity.active = sourceEntity.active;

    // Copy tags
    sourceEntity.tags.forEach((tag) => {
      clonedEntity.tags.add(tag);
    });

    // In a complete implementation, you would copy all components
    // This would require a component factory or component cloning capability
    console.log(`Cloned entity ${entityId} to ${clonedEntity.id}`);

    return clonedEntity;
  }

  /**
   * Gets the closest entity to a position that matches the query
   * @param position The position to measure from
   * @param options Query options to match entities
   * @returns The closest matching entity, or null if none found
   */
  public findClosestEntity(
    position: { x: number; y: number; z: number },
    options: EntityQueryOptions
  ): Entity | null {
    const entities = this.world.queryEntities(options);

    if (entities.length === 0) {
      return null;
    }

    // This is a placeholder for distance calculation
    // In a real implementation, you would get the transform component
    // and calculate actual distance between positions
    const getDistance = (entity: Entity): number => {
      // Placeholder: random distance for demo purposes
      return Math.random() * 100;
    };

    let closestEntity = entities[0];
    let closestDistance = getDistance(closestEntity);

    for (let i = 1; i < entities.length; i++) {
      const distance = getDistance(entities[i]);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestEntity = entities[i];
      }
    }

    return closestEntity;
  }
}
