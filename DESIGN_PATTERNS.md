# Design Patterns

## Core Patterns

### 1. Component-Entity-System (CES)

Primary architectural pattern for game logic organization.

```typescript
// Entity
class Entity {
  id: string;
  components: Map<string, Component>;
}

// Component
interface Component {
  type: string;
  entity: Entity;
}

// System
abstract class System {
  abstract update(deltaTime: number): void;
  abstract query(): Entity[];
}
```

### 2. Observer Pattern

Used for event handling and state updates.

```typescript
class EventEmitter {
  subscribe(event: string, callback: Function): void;
  emit(event: string, data: any): void;
}
```

### 3. Object Pool

Memory management for frequently created/destroyed objects.

```typescript
class ComponentPool<T extends Component> {
  acquire(): T;
  release(component: T): void;
}
```

### 4. Command Pattern

Input handling and action execution.

```typescript
interface Command {
  execute(): void;
  undo(): void;
}
```

### 5. State Pattern

Managing entity behavior states.

```typescript
interface EntityState {
  update(entity: Entity): void;
  enter(): void;
  exit(): void;
}
```

## Implementation Examples

### 1. Entity Component Setup

```typescript
// Creating a character
const character = new Entity("player");
character.addComponent(new TransformComponent());
character.addComponent(new MovementComponent());
character.addComponent(new ColliderComponent());
```

### 2. System Implementation

```typescript
class MovementSystem extends System {
  update(deltaTime: number): void {
    const entities = this.query();
    entities.forEach((entity) => {
      const transform = entity.getComponent<TransformComponent>();
      const movement = entity.getComponent<MovementComponent>();
      // Update position based on movement
    });
  }

  query(): Entity[] {
    return world.getEntitiesWith([TransformComponent, MovementComponent]);
  }
}
```

### 3. Component Communication

```typescript
class CollisionSystem extends System {
  update(): void {
    this.query().forEach((entity) => {
      if (this.detectCollision(entity)) {
        world.emit("collision", { entity });
      }
    });
  }
}
```

## React Integration Patterns

### 1. Game State Observer

```typescript
const GameStateContext = React.createContext(null);

function useGameState() {
  return React.useContext(GameStateContext);
}
```

### 2. Component Bridge

```typescript
interface GameComponentProps {
  entityId: string;
}

const GameComponent: React.FC<GameComponentProps> = ({ entityId }) => {
  const entity = useEntity(entityId);
  // Render based on entity state
};
```

### 3. System-UI Communication

```typescript
class UISystem extends System {
  update(): void {
    // Update UI state based on game state
    uiStore.dispatch(updateUIAction(gameState));
  }
}
```

## Best Practices

### 1. Component Design

- Keep components focused and minimal
- Use composition over inheritance
- Maintain clear dependencies

### 2. System Organization

- Single responsibility principle
- Clear update order
- Efficient querying

### 3. Performance Optimization

- Use component pools
- Minimize garbage collection
- Batch similar operations

### 4. State Management

- Centralized game state
- Immutable state updates
- Clear state ownership

### 5. Testing

- Unit tests for systems
- Component isolation
- Mock dependencies

## Anti-patterns to Avoid

1. Deep entity hierarchies
2. Component inheritance
3. Direct component-to-component communication
4. Tight coupling between systems
5. Mixed responsibilities in components

## Future Considerations

1. Serialization support
2. Network synchronization
3. Asset management
4. Scene management
5. Performance monitoring
