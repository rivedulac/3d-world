/**
 * Events utility for the 3D game engine
 * Provides a centralized event system for game-wide communication.
 */

/**
 * Event data interface
 */
export interface GameEvent {
  /** Event type identifier */
  type: string;
  /** Optional event data */
  [key: string]: any;
}

/**
 * Event callback function type
 */
export type EventListener = (event: GameEvent) => void;

/**
 * Event emitter class that allows registration and triggering of events
 */
export class EventEmitter {
  /** Map of event types to sets of listeners */
  private listeners: Map<string, Set<EventListener>> = new Map();

  /**
   * Registers a listener for an event type
   * @param type Event type to listen for
   * @param listener Callback function to execute when event occurs
   */
  public on(type: string, listener: EventListener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    this.listeners.get(type)!.add(listener);
  }

  /**
   * Registers a listener that will be removed after being called once
   * @param type Event type to listen for
   * @param listener Callback function to execute when event occurs
   */
  public once(type: string, listener: EventListener): void {
    // Create a wrapper that will call the listener and then remove itself
    const onceListener: EventListener = (event: GameEvent) => {
      listener(event);
      this.off(type, onceListener);
    };

    this.on(type, onceListener);
  }

  /**
   * Removes a listener for an event type
   * @param type Event type to remove listener from
   * @param listener Callback function to remove
   */
  public off(type: string, listener: EventListener): void {
    const typeListeners = this.listeners.get(type);

    if (!typeListeners) {
      return;
    }

    typeListeners.delete(listener);

    // Clean up empty sets
    if (typeListeners.size === 0) {
      this.listeners.delete(type);
    }
  }

  /**
   * Removes all listeners for a specific event type, or all listeners if no type is specified
   * @param type Optional event type to remove all listeners from
   */
  public removeAllListeners(type?: string): void {
    if (type) {
      this.listeners.delete(type);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Emits an event to all registered listeners
   * @param event Event object to emit
   */
  public emit(event: GameEvent): void {
    const typeListeners = this.listeners.get(event.type);

    if (!typeListeners) {
      return;
    }

    // Add timestamp to event if not present
    if (event.timestamp === undefined) {
      event.timestamp = Date.now();
    }

    // Execute all listeners
    typeListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in event listener for ${event.type}:`, error);
      }
    });
  }

  /**
   * Gets the number of listeners for a specific event type
   * @param type Event type to check
   * @returns Number of listeners
   */
  public listenerCount(type: string): number {
    const typeListeners = this.listeners.get(type);
    return typeListeners ? typeListeners.size : 0;
  }

  /**
   * Gets all event types that have listeners
   * @returns Array of event types
   */
  public eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }
}

/**
 * Creates an event with the given type and data
 * @param type Event type
 * @param data Additional event data
 * @returns GameEvent object
 */
export function createEvent(
  type: string,
  data: Record<string, any> = {}
): GameEvent {
  return {
    type,
    timestamp: Date.now(),
    ...data,
  };
}

/**
 * Middleware interface for event processing
 */
export interface EventMiddleware {
  /**
   * Process an event before it's dispatched to listeners
   * @param event The event to process
   * @returns The processed event, or undefined to cancel the event
   */
  process(event: GameEvent): GameEvent | undefined;
}

/**
 * Enhanced event emitter with middleware support
 */
export class MiddlewareEventEmitter extends EventEmitter {
  private middleware: EventMiddleware[] = [];

  /**
   * Adds middleware to the event processing pipeline
   * @param middleware The middleware to add
   */
  public addMiddleware(middleware: EventMiddleware): void {
    this.middleware.push(middleware);
  }

  /**
   * Removes middleware from the event processing pipeline
   * @param middleware The middleware to remove
   * @returns True if the middleware was removed, false otherwise
   */
  public removeMiddleware(middleware: EventMiddleware): boolean {
    const index = this.middleware.indexOf(middleware);
    if (index !== -1) {
      this.middleware.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Emits an event, processing it through middleware first
   * @param event The event to emit
   */
  public override emit(event: GameEvent): void {
    let processedEvent = { ...event };

    // Process through middleware
    for (const mw of this.middleware) {
      processedEvent = mw.process(processedEvent) as GameEvent;

      // If middleware returns undefined, cancel the event
      if (!processedEvent) {
        return;
      }
    }

    // Emit the processed event
    super.emit(processedEvent);
  }
}

/**
 * Debugging middleware that logs all events
 */
export class LoggingMiddleware implements EventMiddleware {
  private logLevel: "debug" | "info" | "warn" | "error";

  constructor(logLevel: "debug" | "info" | "warn" | "error" = "debug") {
    this.logLevel = logLevel;
  }

  public process(event: GameEvent): GameEvent {
    const timestamp = new Date(event.timestamp || Date.now()).toISOString();
    const message = `[${timestamp}] Event: ${event.type}`;

    switch (this.logLevel) {
      case "debug":
        console.debug(message, event);
        break;
      case "info":
        console.info(message, event);
        break;
      case "warn":
        console.warn(message, event);
        break;
      case "error":
        console.error(message, event);
        break;
    }

    return event;
  }
}

/**
 * Filtering middleware that can block certain event types
 */
export class FilterMiddleware implements EventMiddleware {
  private blockedTypes: Set<string> = new Set();

  /**
   * Blocks an event type from being emitted
   * @param type The event type to block
   */
  public blockEventType(type: string): void {
    this.blockedTypes.add(type);
  }

  /**
   * Unblocks an event type, allowing it to be emitted
   * @param type The event type to unblock
   */
  public unblockEventType(type: string): void {
    this.blockedTypes.delete(type);
  }

  public process(event: GameEvent): GameEvent | undefined {
    if (this.blockedTypes.has(event.type)) {
      return undefined; // Block the event
    }
    return event; // Allow the event
  }
}
