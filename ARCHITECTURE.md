# Game Architecture

## Overview

This document outlines the Component-Entity-System (CES) architecture for our 3D game engine.
Please keep in mind that this is what we aim for, not what we have at the moment as of Mar 6 2025.

## Development Phases

### Phase 1: Core Functionality

- Minimum Viable Product
- Simple rendering and movement
- Collision detection
- Pre-scripted NPC interactions

### Phase 2: Foundational optimization

- To be done

### Phase 3: Enhanced Graphics and User Customization

- To be done

### Phase 4: Advanced Interactions

- To be done

### Phase 5: AI Integration

- To be done

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
    /rendering
      Mesh.ts        // 3D model representation
      Material.ts    // Visual properties
    /input
      KeyboardInput.ts
      TouchInput.ts
    /behavior
      Movement.ts    // Movement behavior
      Interaction.ts // Interactive behavior
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
```

## Project Structure

```typescript
/src
  /core                  // Core game engine functionality
    /ecs                 // Entity-Component-System core
      Entity.ts          // Base entity class
      Component.ts       // Base component class
      System.ts         // Base system class
      World.ts          // Game world container
      SystemManager.ts   // Manages system execution
      EntityManager.ts   // Manages entity lifecycle
      ComponentManager.ts // Manages component registration
    /engine
      Game.tsx          // Main game loop and React entry point
      GameLoop.ts
      Time.ts           // Game time management
      Input.ts          // Input management
      Scene.ts          // Scene management

  /components           // Game components
    /physics
      TransformComponent.ts
      ColliderComponent.ts
      VelocityComponent.ts
    /rendering
      MeshComponent.ts
      MaterialComponent.ts
      CameraComponent.ts
    /input
      KeyboardComponent.ts
      TouchComponent.ts
    /behavior
      MovementComponent.ts
      InteractionComponent.ts
      AIComponent.ts

  /systems              // Game systems
    /physics
      MovementSystem.ts
      CollisionSystem.ts
    /rendering
      RenderSystem.ts
      AnimationSystem.ts
    /input
      InputSystem.ts
    /behavior
      AISystem.ts
      InteractionSystem.ts

  /entities             // Game entities
    /prefabs            // Pre-configured entity templates
      Character.ts
      NPC.ts
      Billboard.ts
    /factory            // Entity creation factories
      EntityFactory.ts

  /ui                   // React UI components
    /components
      VirtualKeyboard.tsx
      GameHUD.tsx
      MessageSystem.tsx
    /controls
      Button.tsx
      Joystick.tsx

  /utils               // Utility functions and helpers
    Math.ts
    Debug.ts
    EventEmitter.ts

  /config             // Game configuration
    GameConfig.ts
    SystemConfig.ts
    EntityConfig.ts

  /assets             // Asset management
    AssetLoader.ts
    AssetManager.ts

  /types              // TypeScript type definitions
    GameTypes.ts
    ComponentTypes.ts
    SystemTypes.ts
```

### Key Directories

#### /core

Contains the fundamental game engine architecture and ECS implementation.

#### /components

Houses all component definitions, organized by functionality.

#### /systems

Contains all system implementations, grouped by domain.

#### /entities

Stores entity definitions and factory methods.

#### /ui

React components for game interface elements.

#### /utils

Helper functions and utility classes.

#### /config

Game configuration and constants.

#### /assets

Asset management and loading.

#### /types

TypeScript type definitions and interfaces.

### File Naming Conventions

- Components: `*Component.ts`
- Systems: `*System.ts`
- React Components: `*.tsx`
- Utilities: `*.ts`
- Configuration: `*Config.ts`

### Import Structure

```typescript
// Core imports
import { Entity, Component, System } from "@core/ecs";
import { Game } from "@core/engine";

// Component imports
import { TransformComponent } from "@components/physics";
import { MeshComponent } from "@components/rendering";

// System imports
import { MovementSystem } from "@systems/physics";
import { RenderSystem } from "@systems/rendering";

// Entity imports
import { Character } from "@entities/prefabs";

// UI imports
import { GameHUD } from "@ui/components";
```

This structure promotes:

- Clear separation of concerns
- Easy location of related code
- Scalable architecture
- Maintainable codebase
- Clear dependencies

## Data Flow

1. Systems query for entities with specific component combinations
2. Systems process components and update entity state
3. Changes propagate through relevant systems
4. Render system updates visual representation

## Key Concepts

### Entity Composition

- Entities are composed of multiple components
- No inheritance hierarchy for entities
- Components define behavior and properties

### Component Design

- Components are pure data containers
- No behavior logic in components
- Components can depend on other components

### System Responsibility

- Systems contain all game logic
- Systems operate on component combinations
- Systems are independent and focused

## Performance Considerations

- Component pools for memory management
- System execution order optimization
- Spatial partitioning for physics/collision
- Component data alignment for cache efficiency

## Integration with React

- UI layer remains in React
- Game logic separated from UI
- React components observe game state
- Event system bridges game and UI
