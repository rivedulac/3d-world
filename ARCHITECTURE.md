# Game Architecture

## Overview

![Entity-Component-System Architecture](./screenshots/ecs.png)
This document outlines the Component-Entity-System (CES) architecture for our 3D game engine.
Please keep in mind that this is what we aim for, not what we have at the moment as of Mar 9, 2025.

## Development Phases

### Phase 1: Core Functionality

- Minimum Viable Product
- Simple rendering and movement
- Collision detection
- Pre-scripted NPC interactions
- Basic planet environment with walkable terrain
- Simple portfolio billboard implementation
- Character controller with keyboard/mouse input

### Phase 2: Foundational Optimization

- Performance profiling and optimization
- Asset loading optimization and management
- Memory usage optimization
- Implementation of spatial partitioning for physics
- Component pooling for improved memory efficiency
- Render pipeline optimization

### Phase 3: Enhanced Graphics and User Customization

- Advanced lighting and shadow systems
- Post-processing effects
- Weather and day/night cycle
- Character customization options
- Advanced animations with blending
- Mobile-responsive controls and UI
- Enhanced portfolio billboard with interactive elements

### Phase 4: Advanced Interactions

- Complex NPC behaviors and pathfinding
- Quest/task system for guiding users through portfolio
- Interactive objects with physics-based behaviors
- Advanced dialogue system with branching conversations
- Contextual interaction system
- Event-driven narrative elements

### Phase 5: AI Integration

- Natural Language Processing for NPC conversations
- Context-aware dialogue management
- Sentiment analysis for response customization
- Dynamic content generation based on conversation history
- Personalized user experience based on interaction patterns
- Integration with external AI services for enhanced capabilities

## Core Architecture

### 1. Entities

Base game objects that serve as containers for components.

```typescript
// Example structure
/src
  /entities
    /base
      Entity.ts       // Base entity class
    Character.ts      // Player character entity
    NPC.ts           // Non-player character entity
    Billboard.ts     // Interactive billboard entity
    WorldObject.ts   // Environmental objects
    InteractiveObject.ts // Objects the player can interact with
    TriggerZone.ts    // Areas that trigger events when entered
```

### 2. Components

Reusable modules that define specific behaviors or properties.

```typescript
/src
  /components
    /physics
      Transform.ts    // Position, rotation, scale
      Collider.ts    // Collision detection
      Velocity.ts    // Movement properties
      RigidBody.ts    // Physics simulation properties
    /rendering
      Mesh.ts        // 3D model representation
      Material.ts    // Visual properties
      Animation.ts   // Animation controller
      Light.ts       // Light source properties
    /input
      KeyboardInput.ts
      TouchInput.ts
      MouseInput.ts
    /behavior
      Movement.ts    // Movement behavior
      Interaction.ts // Interactive behavior
      AI.ts          // NPC behavior patterns
    /ui
      DialogueComponent.ts // Conversation system
      InteractableUI.ts   // UI elements for interaction
      BillboardContent.ts // Portfolio content display
```

### 3. Systems

Logic that operates on entities with specific components.

```typescript
/src
  /systems
    PhysicsSystem.ts    // Handles physics calculations
    RenderSystem.ts     // Manages rendering
    InputSystem.ts      // Processes input
    CollisionSystem.ts  // Handles collision detection
    AnimationSystem.ts  // Manages animations
    BehaviorSystem.ts   // Manages entity behaviors
    DialogueSystem.ts   // Manages NPC conversations
    InteractionSystem.ts // Processes player interactions
    UISystem.ts         // Updates UI elements
    CameraSystem.ts     // Controls camera behavior
```

## Project Structure

```typescript
/src
  /core
    /ecs
      types.ts              // Core ECS type definitions (runtime types)
      componentFactory.ts   // Component creation utilities
      entityManager.ts      // Entity management
      systemManager.ts      // System management
      world.ts              // Game world state
    /engine
      Game.tsx              // React entry point
      GameLoop.ts           // Main game loop
      Time.ts               // Time management
      Scene.ts              // Three.js scene management
      Camera.ts             // Camera controls and management
      Input.ts              // Input handling (keyboard, mouse, touch)

  /entities
    /base
      Entity.ts             // Base entity class
      EntityFactory.ts      // Factory methods for entity creation
    /prefabs
      Character.ts          // Player character entity
      NPC.ts                // Non-player character entity
      Billboard.ts          // Interactive billboard entity
      WorldObject.ts        // Environmental objects
      InteractiveObject.ts  // Objects the player can interact with
      TriggerZone.ts        // Interaction trigger zones

  /components
    /physics
      transform.ts          // Position, rotation, scale
      collider.ts           // Collision detection
      velocity.ts           // Movement properties
    /character
      player.ts             // Player-specific properties
      npc.ts                // NPC-specific properties
      animation.ts          // Character animations
    /interaction
      interactable.ts       // Interactive object properties
      dialogue.ts           // Conversation system properties
      trigger.ts            // Interaction trigger zones
    /ui
      billboard.ts          // Portfolio billboard properties
      hud.ts                // HUD elements
      virtualKeyboard.ts    // Mobile controls

  /systems
    /physics
      movement.ts           // Character movement
      collision.ts          // Collision handling
    /character
      playerControl.ts      // Player input handling
      npcBehavior.ts        // NPC behavior and pathfinding
      animation.ts          // Animation management
    /interaction
      dialogue.ts           // Dialogue system
      trigger.ts            // Interaction detection
    /ui
      billboardUpdate.ts    // Portfolio content management
      hudUpdate.ts          // HUD updates
      virtualKeyboard.ts    // Mobile input processing

  /ui                       // React UI Components
    /components
      DialogueBox.tsx       // Conversation interface
      Portfolio.tsx         // Portfolio content display
      VirtualKeyboard.tsx   // Mobile controls
      GameHUD.tsx           // Game interface elements
    /controls
      Button.tsx            // Reusable button component
      Joystick.tsx          // Mobile movement control
    /theme                  // UI styling and theming
      colors.ts             // Color palette
      typography.ts         // Text styling
      animations.ts         // UI animations

  /data
    /dialogue               // Pre-scripted conversations
      introNPC.json
      portfolioNPC.json
      skillsNPC.json
    /portfolio              // Portfolio content
      resume.json
      projects.json
      skills.json
    /world                  // World configuration
      objects.json          // Static object placement
      npcs.json             // NPC placement and properties

  /assets
    /models                 // 3D models
      /characters
        player.glb
        npc.glb
      /environment
        planet.glb
        trees.glb
    /textures               // Textures and materials
    /animations             // Character animations
    /sounds                 // Sound effects and music
    /placeholders           // Placeholder assets for development

  /utils
    math.ts                 // Math utilities
    debug.ts                // Debugging utilities
    events.ts               // Event system

  /services                 // Service-oriented functionality
    assetLoader.ts          // Centralized asset loading
    persistenceService.ts   // Save/load game state
    analyticsService.ts     // Usage tracking (optional)
    audioService.ts         // Sound management

  /repositories             // Data access layer
    dialogueRepository.ts   // Loading dialogue data
    portfolioRepository.ts  // Loading portfolio content
    worldRepository.ts      // Loading world configuration

  /config                   // Game configuration
    game.ts                 // General game settings
    physics.ts              // Physics settings
    graphics.ts             // Graphics settings
    audio.ts                // Audio settings
    constants.ts            // Game constants

  /state                    // Game state management
    gameState.ts            // Global game state
    persistentState.ts      // Saved game state
    contextState.ts         // Conversation context

  /ai                       // Future NLP integration
    /dialogue
      nlpProcessor.ts       // Natural language processing
      responseGen.ts        // Response generation
      contextManager.ts     // Conversation context tracking

  /types                    // TypeScript declaration files
    game.d.ts               // Game-wide type declarations
    components.d.ts         // Component-specific type declarations
    systems.d.ts            // System-specific type declarations
    services.d.ts           // Service-specific type declarations
    repositories.d.ts       // Repository-specific type declarations

  /hooks                    // Custom React hooks
    useGameInput.ts         // Input handling
    useGameState.ts         // Game state access
    useAssets.ts            // Asset loading
```

## Type System Organization

Our project uses a dual-layered type system to provide both runtime type safety and development-time type checking:

### Core ECS Types (`src/core/ecs/types.ts`)

- Contains **runtime types** used directly in the ECS implementation
- Defines foundational interfaces for entities, components, systems, and the world
- These types are explicitly imported and used in implementation code
- Includes concrete TypeScript interfaces, enums, and type aliases
- Compiles to JavaScript as part of the application
- Focused specifically on the ECS architecture

Example:

```typescript
// From src/core/ecs/types.ts
export interface Component {
  type: ComponentType;
  entityId: EntityId;
  active: boolean;
}
```

### Declaration Files (`src/types/*.d.ts`)

- Contains **ambient type declarations** for broader application use
- Provides module-specific and application-wide type definitions
- Available throughout the codebase without explicit imports
- Organized by domain (game, components, systems, etc.)
- Does not generate JavaScript code (type information only)
- May include type definitions for external libraries and global augmentations

Example:

```typescript
// From src/types/components.d.ts
declare namespace Components {
  interface TransformData {
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
  }
}
```

## Technical Implementation

### Three.js Integration

The game engine will leverage Three.js as the primary 3D rendering library:

```typescript
// Example of scene setup with Three.js
import * as THREE from "three";
import { World } from "@core/ecs/world";

export class SceneManager {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private world: World;

  constructor(world: World) {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.world = world;

    // Configure renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    // Add to DOM
    document.body.appendChild(this.renderer.domElement);

    // Setup initial scene
    this.setupLighting();
    this.setupEnvironment();
  }

  // Additional setup methods...
}
```

### React Integration

The game UI layer will be implemented using React, with Three.js canvas rendering managed through:

### ECS Implementation

The Entity-Component-System architecture will be implemented with TypeScript for type safety:

```typescript
// Example component registration
import { ComponentFactory } from "@core/ecs/componentFactory";
import { TransformComponent } from "@components/physics/transform";
import { MeshComponent } from "@components/rendering/mesh";

// Register components
ComponentFactory.register("transform", TransformComponent);
ComponentFactory.register("mesh", MeshComponent);

// Example entity creation
import { EntityManager } from "@core/ecs/entityManager";

const player = EntityManager.createEntity();
player.addComponent("transform", { position: { x: 0, y: 0, z: 0 } });
player.addComponent("mesh", { model: "player" });
```

## Portfolio Integration

The billboard and portfolio elements will be implemented as interactive game objects:

```typescript
// Example billboard component
import { Component } from "@core/ecs/types";

export interface BillboardComponentData {
  contentType: "resume" | "projects" | "skills";
  displayScale: number;
  interactionDistance: number;
}

export class BillboardComponent implements Component {
  public readonly type = "billboard";
  public contentType: string;
  public displayScale: number;
  public interactionDistance: number;

  constructor(data: BillboardComponentData) {
    this.contentType = data.contentType;
    this.displayScale = data.displayScale;
    this.interactionDistance = data.interactionDistance;
  }
}
```

## NPC Conversation System

The NPC conversation system will use a dialogue tree in early phases:

```typescript
// Example dialogue data structure
export interface DialogueNode {
  id: string;
  text: string;
  responses: DialogueResponse[];
}

export interface DialogueResponse {
  text: string;
  nextNodeId: string;
  condition?: (gameState: any) => boolean;
}

// Example dialogue system
export class DialogueSystem implements System {
  public readonly components = ["npc", "dialogue"];

  public update(entities: Entity[], deltaTime: number): void {
    const playerEntity = this.getPlayerEntity();
    const playerPosition = playerEntity.getComponent("transform").position;

    for (const entity of entities) {
      const npcComponent = entity.getComponent("npc");
      const dialogueComponent = entity.getComponent("dialogue");
      const transform = entity.getComponent("transform");

      // Check if player is in conversation range
      const distance = this.calculateDistance(
        transform.position,
        playerPosition
      );

      if (distance <= npcComponent.interactionDistance) {
        // Handle dialogue initiation or continuation
        this.handleDialogueInteraction(entity, playerEntity);
      }
    }
  }

  // Additional methods...
}
```

## NLP Integration (Phase 5)

The natural language processing for dynamic NPC conversations:

```typescript
// Example NLP processor
import { NLP } from "@ai/dialogue/nlpProcessor";
import { ResponseGenerator } from "@ai/dialogue/responseGen";
import { ContextManager } from "@ai/dialogue/contextManager";

export class NLPDialogueSystem implements System {
  private nlpProcessor: NLP;
  private responseGenerator: ResponseGenerator;
  private contextManager: ContextManager;

  constructor() {
    this.nlpProcessor = new NLP();
    this.responseGenerator = new ResponseGenerator();
    this.contextManager = new ContextManager();
  }

  public processUserInput(input: string, npcId: string): string {
    // Get conversation context
    const context = this.contextManager.getContext(npcId);

    // Process input with NLP
    const intent = this.nlpProcessor.analyze(input, context);

    // Generate appropriate response
    const response = this.responseGenerator.generate(intent, npcId, context);

    // Update context with new interaction
    this.contextManager.updateContext(npcId, input, response);

    return response;
  }
}
```

## Development Best Practices

### Coding Standards

- Use TypeScript for all implementation
- Follow strict typing for component data
- Implement interfaces for all systems and components
- Use pure functions where possible for predictable behavior
- Document all public APIs and component properties

### Testing Strategy

- Unit tests for core ECS functionality
- Component tests for individual component behavior
- System tests for system logic
- Integration tests for system interactions
- End-to-end tests for complete gameplay scenarios
- Performance tests for critical systems

### Performance Optimization

- Implement component pooling to reduce garbage collection
- Use spatial partitioning for physics and collision detection
- Implement object instancing for similar meshes
- Use level-of-detail techniques for distant objects
- Implement asset streaming for large world sections

### Mobile Considerations

- Implement adaptive rendering quality based on device capabilities
- Provide touch controls with virtual joystick and action buttons
- Optimize asset loading for mobile bandwidth constraints
- Implement battery-friendly rendering options

## Deployment Strategy

The game will be deployed as a web application accessible via standard browsers:

1. Development environment: Local development server
2. Staging environment: Netlify/Vercel preview deployments
3. Production environment: Custom domain with CDN integration

## Documentation

Comprehensive documentation will be maintained:

1. Architecture documentation (this document)
2. API documentation generated from code comments
3. Component and system documentation
4. Setup and configuration guides
5. Asset pipeline documentation

## Future Enhancements

Beyond Phase 5, potential enhancements include:

1. Multiplayer capabilities
2. VR/AR support
3. Advanced physics simulation
4. Procedural world generation
5. Integration with external portfolio services
6. Progressive web app capabilities for offline usage

## Conclusion

This architecture provides a solid foundation for a 3D game that showcases your technical skills while serving as an interactive portfolio. The modular design allows for incremental development across the planned phases, with clear separation of concerns and extensibility for future enhancements.
