/**
 * Core ECS (Entity-Component-System) type definitions
 * This file defines the fundamental types used throughout the game architecture
 */

// ----- Entity Types -----

/**
 * Unique identifier for an entity
 */
export type EntityId = string;

/**
 * Basic entity interface
 */
export interface Entity {
  id: EntityId;
  components: Map<ComponentType, Component>;
  active: boolean;
  tags: Set<string>;
}

// ----- Component Types -----

/**
 * Enum of all available component types
 * This will be extended as you add more components
 */
export enum ComponentType {
  // Physics
  TRANSFORM = "transform",
  VELOCITY = "velocity",
  COLLIDER = "collider",

  // Character
  PLAYER = "player",
  NPC = "npc",
  ANIMATION = "animation",

  // Interaction
  INTERACTABLE = "interactable",
  DIALOGUE = "dialogue",
  TRIGGER = "trigger",

  // UI
  BILLBOARD = "billboard",
  HUD = "hud",
  VIRTUAL_KEYBOARD = "virtualKeyboard",
}

/**
 * Base component interface
 * All components must implement this interface
 */
export interface Component {
  type: ComponentType;
  entityId: EntityId;
  active: boolean;
}

/**
 * Component constructor type
 */
export type ComponentConstructor<T extends Component> = new (
  ...args: any[]
) => T;

// ----- System Types -----

/**
 * System priority level
 * Determines the order in which systems are executed each frame
 */
export enum SystemPriority {
  HIGHEST = 0,
  HIGH = 1,
  NORMAL = 2,
  LOW = 3,
  LOWEST = 4,
}

/**
 * Base system interface
 * All systems must implement this interface
 */
export interface System {
  priority: SystemPriority;
  active: boolean;
  requiredComponents: ComponentType[];
  update(deltaTime: number, entities: Entity[]): void;
  initialize?(world: World): void;
  cleanup?(): void;
}

/**
 * System constructor type
 */
export type SystemConstructor<T extends System> = new (...args: any[]) => T;

// ----- World Types -----

/**
 * World interface
 * The main container for entities, components, and systems
 */
export interface World {
  entities: Map<EntityId, Entity>;
  systems: System[];

  createEntity(): Entity;
  removeEntity(entityId: EntityId): boolean;

  addComponent(entityId: EntityId, component: Component): boolean;
  removeComponent(entityId: EntityId, componentType: ComponentType): boolean;
  getComponent<T extends Component>(
    entityId: EntityId,
    componentType: ComponentType
  ): T | null;

  addSystem(system: System): void;
  removeSystem(system: System): boolean;

  update(deltaTime: number): void;
}

// ----- Event Types -----

/**
 * Base event interface for the event system
 */
export interface GameEvent {
  type: string;
  [key: string]: any;
}

/**
 * Event listener type
 */
export type EventListener = (event: GameEvent) => void;

/**
 * Event emitter interface
 */
export interface EventEmitter {
  on(eventType: string, listener: EventListener): void;
  off(eventType: string, listener: EventListener): void;
  emit(event: GameEvent): void;
}

// ----- Query Types -----

/**
 * Entity query options for filtering entities
 */
export interface EntityQueryOptions {
  all?: ComponentType[]; // Entity must have ALL of these components
  any?: ComponentType[]; // Entity must have ANY of these components
  none?: ComponentType[]; // Entity must have NONE of these components
  tags?: string[]; // Entity must have ALL of these tags
}

/**
 * Time interface for game timing
 */
export interface GameTime {
  deltaTime: number; // Time in seconds since last frame
  elapsedTime: number; // Total time in seconds since game start
  frameCount: number; // Total frames since game start
}

/**
 * Game state enum
 */
export enum GameState {
  LOADING = "loading",
  RUNNING = "running",
  PAUSED = "paused",
  GAME_OVER = "gameOver",
}
