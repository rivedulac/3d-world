/**
 * Global constants for the 3D game
 * This file centralizes all constant values used throughout the application
 */

// ----- Core Engine Constants -----

/**
 * Game canvas ID used for rendering
 */
export const GAME_CANVAS_ID = "gameCanvas";

// ----- World Constants -----

/**
 * Asset paths for major game elements
 */
export const ASSETS = {
  SKYBOX: "assets/starfield.svg",
  PLANET: "assets/silver_floor.svg",
};

/**
 * Default positions for entities
 */
export const DEFAULT_POSITIONS = {
  PLAYER: { x: 0, y: 0, z: 0 },
  NPC: { x: 5, y: 0, z: 5 },
  BILLBOARD: { x: 0, y: 2, z: -5 },
};

// ----- Event Types -----

/**
 * Game event names currently used in the world.ts implementation
 */
export const EVENTS = {
  // Entity events
  ENTITY_CREATED: "entity:created",
  ENTITY_REMOVED: "entity:removed",
  COMPONENT_ADDED: "component:added",
  COMPONENT_REMOVED: "component:removed",

  // System events
  SYSTEM_ADDED: "system:added",
  SYSTEM_REMOVED: "system:removed",

  // World events
  WORLD_INITIALIZED: "world:initialized",
};

// ----- Entity Tags -----

/**
 * Entity tag names used in GameWorld implementation
 */
export const ENTITY_TAGS = {
  SKYBOX: "skybox",
  PLANET: "planet",
  PLAYER: "player",
  NPC: "npc",
  BILLBOARD: "billboard",
};
