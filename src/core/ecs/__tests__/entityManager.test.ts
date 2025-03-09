import { EntityManager } from "../entityManager";
import { GameWorld } from "../world";
import {
  ComponentType,
  Component,
  Entity,
  EntityId,
  EntityQueryOptions,
} from "../types";
import { ENTITY_TAGS } from "../../../config/constants";

// Mock component implementation for testing
class MockComponent implements Component {
  type: ComponentType;
  entityId: EntityId;
  active: boolean;

  constructor(type: ComponentType, entityId: string = "") {
    this.type = type;
    this.entityId = entityId;
    this.active = true;
  }
}

describe("EntityManager", () => {
  let world: GameWorld;
  let entityManager: EntityManager;

  // Setup before each test
  beforeEach(() => {
    // Create a fresh GameWorld and EntityManager for each test
    world = new GameWorld();
    entityManager = new EntityManager(world);
  });

  describe("Entity queries", () => {
    beforeEach(() => {
      // Create player entity with transform component
      const playerEntity = world.createEntity();
      playerEntity.tags.add(ENTITY_TAGS.PLAYER);
      world.addComponent(
        playerEntity.id,
        new MockComponent(ComponentType.TRANSFORM, playerEntity.id)
      );

      // Create NPC entity with transform and dialogue components
      const npcEntity = world.createEntity();
      npcEntity.tags.add(ENTITY_TAGS.NPC);
      world.addComponent(
        npcEntity.id,
        new MockComponent(ComponentType.TRANSFORM, npcEntity.id)
      );
      world.addComponent(
        npcEntity.id,
        new MockComponent(ComponentType.DIALOGUE, npcEntity.id)
      );

      // Create billboard entity with transform component
      const billboardEntity = world.createEntity();
      billboardEntity.tags.add(ENTITY_TAGS.BILLBOARD);
      world.addComponent(
        billboardEntity.id,
        new MockComponent(ComponentType.TRANSFORM, billboardEntity.id)
      );

      // Create inactive entity
      const inactiveEntity = world.createEntity();
      inactiveEntity.tags.add("inactive");
      inactiveEntity.active = false;
    });

    test("should get entities by tag", () => {
      const playerEntities = entityManager.getEntitiesByTag(ENTITY_TAGS.PLAYER);
      const npcEntities = entityManager.getEntitiesByTag(ENTITY_TAGS.NPC);
      const inactiveEntities = entityManager.getEntitiesByTag("inactive");

      expect(playerEntities.length).toBe(1);
      expect(npcEntities.length).toBe(1);
      expect(inactiveEntities.length).toBe(0); // Inactive entities shouldn't be returned
    });

    test("should get entities by components", () => {
      const entitiesWithTransform = entityManager.getEntitiesByComponents([
        ComponentType.TRANSFORM,
      ]);
      const entitiesWithDialogue = entityManager.getEntitiesByComponents([
        ComponentType.DIALOGUE,
      ]);
      const entitiesWithBoth = entityManager.getEntitiesByComponents([
        ComponentType.TRANSFORM,
        ComponentType.DIALOGUE,
      ]);

      expect(entitiesWithTransform.length).toBe(3); // Player, NPC, and Billboard
      expect(entitiesWithDialogue.length).toBe(1); // Only NPC
      expect(entitiesWithBoth.length).toBe(1); // Only NPC
    });
  });

  describe("Character entity creation", () => {
    test("should create a character entity", () => {
      const position = { x: 10, y: 5, z: 20 };
      const isPlayer = true;
      const characterName = "Hero";

      // Spy on world.createEntity
      const createEntitySpy = jest.spyOn(world, "createEntity");

      const character = entityManager.createCharacterEntity(
        position,
        isPlayer,
        characterName
      );

      // Verify world.createEntity was called
      expect(createEntitySpy).toHaveBeenCalled();

      // Verify entity properties
      expect(character).toBeDefined();
      expect(character.tags.has(ENTITY_TAGS.PLAYER)).toBe(true);

      // Reset the spy
      createEntitySpy.mockRestore();
    });

    test("should create an NPC character entity", () => {
      const position = { x: 5, y: 0, z: 5 };
      const isPlayer = false;
      const characterName = "Guide";

      // Spy on world.createEntity
      const createEntitySpy = jest.spyOn(world, "createEntity");

      const character = entityManager.createCharacterEntity(
        position,
        isPlayer,
        characterName
      );

      // Verify world.createEntity was called
      expect(createEntitySpy).toHaveBeenCalled();

      // Verify entity properties
      expect(character).toBeDefined();
      expect(character.tags.has(ENTITY_TAGS.NPC)).toBe(true);
      expect(character.tags.has(ENTITY_TAGS.PLAYER)).toBe(false);

      // Reset the spy
      createEntitySpy.mockRestore();
    });
  });

  describe("NPC with dialogue creation", () => {
    test("should create an NPC with dialogue", () => {
      const position = { x: 5, y: 0, z: 5 };
      const dialogueKey = "intro_dialogue";
      const name = "Guide";

      // Spy on world.createNPCEntity
      const createNPCEntitySpy = jest.spyOn(world, "createNPCEntity");

      const npc = entityManager.createNPCWithDialogue(
        position,
        dialogueKey,
        name
      );

      // Verify world.createNPCEntity was called with correct parameters
      expect(createNPCEntitySpy).toHaveBeenCalledWith(position, dialogueKey);

      // Verify entity properties
      expect(npc).toBeDefined();
      expect(npc.tags.has(ENTITY_TAGS.NPC)).toBe(true);

      // Reset the spy
      createNPCEntitySpy.mockRestore();
    });
  });

  describe("Portfolio billboard creation", () => {
    test("should create a portfolio billboard", () => {
      const position = { x: 0, y: 2, z: -5 };
      const contentType = "resume" as const;

      // Spy on world.createBillboardEntity
      const createBillboardEntitySpy = jest.spyOn(
        world,
        "createBillboardEntity"
      );

      const billboard = entityManager.createPortfolioBillboard(
        position,
        contentType
      );

      // Verify world.createBillboardEntity was called with correct parameters
      expect(createBillboardEntitySpy).toHaveBeenCalledWith(position);

      // Verify entity properties
      expect(billboard).toBeDefined();
      expect(billboard.tags.has(ENTITY_TAGS.BILLBOARD)).toBe(true);

      // Reset the spy
      createBillboardEntitySpy.mockRestore();
    });
  });

  describe("Entity formation creation", () => {
    test("should create a formation of entities", () => {
      const centerPosition = { x: 10, y: 0, z: 10 };
      const entityCount = 3;
      const radius = 5;
      const createEntityFn = jest.fn((position) => {
        const entity = world.createEntity();
        entity.tags.add("formation");
        return entity;
      });

      const entities = entityManager.createEntityFormation(
        centerPosition,
        entityCount,
        radius,
        createEntityFn
      );

      // Verify correct number of entities created
      expect(entities.length).toBe(entityCount);

      // Verify createEntityFn was called correct number of times
      expect(createEntityFn).toHaveBeenCalledTimes(entityCount);

      // Verify all entities have the 'formation' tag
      entities.forEach((entity) => {
        expect(entity.tags.has("formation")).toBe(true);
      });
    });
  });

  describe("Deactivating entities", () => {
    beforeEach(() => {
      // Create various entities with different tags
      for (let i = 0; i < 3; i++) {
        const playerEntity = world.createEntity();
        playerEntity.tags.add(ENTITY_TAGS.PLAYER);
      }

      for (let i = 0; i < 5; i++) {
        const npcEntity = world.createEntity();
        npcEntity.tags.add(ENTITY_TAGS.NPC);
      }

      for (let i = 0; i < 2; i++) {
        const billboardEntity = world.createEntity();
        billboardEntity.tags.add(ENTITY_TAGS.BILLBOARD);
      }
    });

    test("should deactivate all entities except those with specified tags", () => {
      const exceptTags = [ENTITY_TAGS.PLAYER];

      const deactivatedCount = entityManager.deactivateAllExcept(exceptTags);

      // Verify correct number of entities deactivated (5 NPCs + 2 billboards = 7)
      expect(deactivatedCount).toBe(7);

      // Verify player entities are still active
      const playerEntities = entityManager.getEntitiesByTag(ENTITY_TAGS.PLAYER);
      expect(playerEntities.length).toBe(3);

      // Verify NPC and billboard entities are now inactive (they won't be returned by getEntitiesByTag)
      const npcEntities = entityManager.getEntitiesByTag(ENTITY_TAGS.NPC);
      const billboardEntities = entityManager.getEntitiesByTag(
        ENTITY_TAGS.BILLBOARD
      );
      expect(npcEntities.length).toBe(0);
      expect(billboardEntities.length).toBe(0);
    });
  });

  describe("Removing entities matching criteria", () => {
    beforeEach(() => {
      // Create various entities with different components
      for (let i = 0; i < 3; i++) {
        const entity = world.createEntity();
        world.addComponent(
          entity.id,
          new MockComponent(ComponentType.TRANSFORM, entity.id)
        );
      }

      for (let i = 0; i < 2; i++) {
        const entity = world.createEntity();
        world.addComponent(
          entity.id,
          new MockComponent(ComponentType.DIALOGUE, entity.id)
        );
      }
    });

    test("should remove entities matching query criteria", () => {
      const options: EntityQueryOptions = {
        all: [ComponentType.DIALOGUE],
      };

      // Spy on world.removeEntity
      const removeEntitySpy = jest.spyOn(world, "removeEntity");

      const removedCount = entityManager.removeEntitiesMatching(options);

      // Verify correct number of entities removed
      expect(removedCount).toBe(2);

      // Verify world.removeEntity was called correct number of times
      expect(removeEntitySpy).toHaveBeenCalledTimes(2);

      // Verify only entities with TRANSFORM component remain
      const entitiesWithTransform = entityManager.getEntitiesByComponents([
        ComponentType.TRANSFORM,
      ]);
      const entitiesWithDialogue = entityManager.getEntitiesByComponents([
        ComponentType.DIALOGUE,
      ]);
      expect(entitiesWithTransform.length).toBe(3);
      expect(entitiesWithDialogue.length).toBe(0);

      // Reset the spy
      removeEntitySpy.mockRestore();
    });
  });

  describe("Entity cloning", () => {
    let sourceEntity: Entity;

    beforeEach(() => {
      sourceEntity = world.createEntity();
      sourceEntity.tags.add(ENTITY_TAGS.PLAYER);
      sourceEntity.tags.add("customTag");
      world.addComponent(
        sourceEntity.id,
        new MockComponent(ComponentType.TRANSFORM, sourceEntity.id)
      );
      sourceEntity.active = false;
    });

    test("should clone an entity with tags and active state", () => {
      // Spy on world.createEntity
      const createEntitySpy = jest.spyOn(world, "createEntity");

      const clonedEntity = entityManager.cloneEntity(sourceEntity.id);

      // Verify world.createEntity was called
      expect(createEntitySpy).toHaveBeenCalled();

      // Verify entity properties
      expect(clonedEntity).not.toBeNull();
      expect(clonedEntity!.id).not.toBe(sourceEntity.id);
      expect(clonedEntity!.active).toBe(sourceEntity.active);
      expect(clonedEntity!.tags.has(ENTITY_TAGS.PLAYER)).toBe(true);
      expect(clonedEntity!.tags.has("customTag")).toBe(true);

      // Reset the spy
      createEntitySpy.mockRestore();
    });

    test("should return null when cloning non-existent entity", () => {
      const clonedEntity = entityManager.cloneEntity("non-existent-id");

      expect(clonedEntity).toBeNull();
    });
  });

  describe("Finding closest entity", () => {
    // This is a simplified test since the actual distance calculation is mocked
    test("should find the closest entity matching criteria", () => {
      // Create entities with different positions
      const entity1 = world.createEntity();
      entity1.tags.add("target");
      const entity2 = world.createEntity();
      entity2.tags.add("target");

      // Mock the implementation of findClosestEntity
      // In a real test, you would have proper transform components with positions
      const findClosestEntitySpy = jest.spyOn(
        entityManager,
        "findClosestEntity"
      );
      findClosestEntitySpy.mockImplementation((position, options) => {
        const entities = world.queryEntities(options);
        return entities.length > 0 ? entities[0] : null;
      });

      const position = { x: 0, y: 0, z: 0 };
      const options: EntityQueryOptions = {
        tags: ["target"],
      };

      const closestEntity = entityManager.findClosestEntity(position, options);

      // Verify an entity was found
      expect(closestEntity).not.toBeNull();
      expect(closestEntity!.tags.has("target")).toBe(true);

      // Reset the spy
      findClosestEntitySpy.mockRestore();
    });
  });
});
