import {
  EventEmitter,
  GameEvent,
  createEvent,
  MiddlewareEventEmitter,
  EventMiddleware,
  LoggingMiddleware,
  FilterMiddleware,
} from "../events";

describe("EventEmitter", () => {
  let emitter: EventEmitter;
  let listener: jest.Mock<void, [GameEvent]>;
  let testEvent: GameEvent;

  beforeEach(() => {
    emitter = new EventEmitter();
    listener = jest.fn();
    testEvent = { type: "test", data: "test-data" };
  });

  test("should register and trigger event listeners", () => {
    emitter.on("test", listener);
    emitter.emit(testEvent);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(testEvent);
  });

  test("should register multiple listeners for same event", () => {
    const listener2 = jest.fn();

    emitter.on("test", listener);
    emitter.on("test", listener2);
    emitter.emit(testEvent);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  test("should remove specific event listener", () => {
    const listener2 = jest.fn();

    emitter.on("test", listener);
    emitter.on("test", listener2);

    emitter.off("test", listener);
    emitter.emit(testEvent);

    expect(listener).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  test("should not trigger removed event listener", () => {
    emitter.on("test", listener);
    emitter.off("test", listener);
    emitter.emit(testEvent);

    expect(listener).not.toHaveBeenCalled();
  });

  test("should register once listener that auto-removes after being called", () => {
    emitter.once("test", listener);

    // First emit should trigger the listener
    emitter.emit(testEvent);
    expect(listener).toHaveBeenCalledTimes(1);

    // Second emit should not trigger the listener (it was removed)
    emitter.emit(testEvent);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("should remove all listeners for an event type", () => {
    const listener2 = jest.fn();

    emitter.on("test", listener);
    emitter.on("test", listener2);

    emitter.removeAllListeners("test");
    emitter.emit(testEvent);

    expect(listener).not.toHaveBeenCalled();
    expect(listener2).not.toHaveBeenCalled();
  });

  test("should remove all listeners when no event type specified", () => {
    const otherListener = jest.fn();
    const otherEvent = { type: "other" };

    emitter.on("test", listener);
    emitter.on("other", otherListener);

    emitter.removeAllListeners();

    emitter.emit(testEvent);
    emitter.emit(otherEvent);

    expect(listener).not.toHaveBeenCalled();
    expect(otherListener).not.toHaveBeenCalled();
  });

  test("should count listeners for an event type", () => {
    expect(emitter.listenerCount("test")).toBe(0);

    emitter.on("test", listener);
    expect(emitter.listenerCount("test")).toBe(1);

    const listener2 = jest.fn();
    emitter.on("test", listener2);
    expect(emitter.listenerCount("test")).toBe(2);

    emitter.off("test", listener);
    expect(emitter.listenerCount("test")).toBe(1);

    emitter.removeAllListeners("test");
    expect(emitter.listenerCount("test")).toBe(0);
  });

  test("should get all event names that have listeners", () => {
    expect(emitter.eventNames()).toEqual([]);

    emitter.on("test", listener);
    expect(emitter.eventNames()).toEqual(["test"]);

    emitter.on("other", jest.fn());
    expect(emitter.eventNames()).toContain("test");
    expect(emitter.eventNames()).toContain("other");
    expect(emitter.eventNames().length).toBe(2);

    emitter.removeAllListeners("test");
    expect(emitter.eventNames()).toEqual(["other"]);
  });

  test("should handle errors in event listeners", () => {
    // Spy on console.error to verify it's called
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // Create a listener that throws an error
    const errorListener = jest.fn(() => {
      throw new Error("Test error");
    });

    emitter.on("test", errorListener);
    emitter.on("test", listener); // This should still be called

    emitter.emit(testEvent);

    // Verify the error was caught and logged
    expect(consoleErrorSpy).toHaveBeenCalled();

    // Verify both listeners were attempted
    expect(errorListener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledTimes(1);

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  test("should add timestamp to events if not present", () => {
    const originalDateNow = Date.now;
    const mockDateNow = jest.fn(() => 12345);
    Date.now = mockDateNow;

    const listenerWithTimestamp = jest.fn((event: GameEvent) => {
      expect(event.timestamp).toBe(12345);
    });

    emitter.on("test", listenerWithTimestamp);

    // Event without timestamp
    emitter.emit({ type: "test" });

    expect(listenerWithTimestamp).toHaveBeenCalledTimes(1);

    // Restore Date.now
    Date.now = originalDateNow;
  });
});

describe("createEvent", () => {
  test("should create an event with the given type and data", () => {
    const originalDateNow = Date.now;
    const mockDateNow = jest.fn(() => 12345);
    Date.now = mockDateNow;

    const event = createEvent("test", { foo: "bar" });

    expect(event).toEqual({
      type: "test",
      timestamp: 12345,
      foo: "bar",
    });

    // Restore Date.now
    Date.now = originalDateNow;
  });

  test("should create an event with just the type if no data is provided", () => {
    const originalDateNow = Date.now;
    const mockDateNow = jest.fn(() => 12345);
    Date.now = mockDateNow;

    const event = createEvent("test");

    expect(event).toEqual({
      type: "test",
      timestamp: 12345,
    });

    // Restore Date.now
    Date.now = originalDateNow;
  });
});

describe("MiddlewareEventEmitter", () => {
  let emitter: MiddlewareEventEmitter;
  let listener: jest.Mock<void, [GameEvent]>;
  let testEvent: GameEvent;

  beforeEach(() => {
    emitter = new MiddlewareEventEmitter();
    listener = jest.fn();
    testEvent = { type: "test", data: "test-data" };
  });

  test("should process events through middleware", () => {
    // Create a middleware that modifies the event
    const testMiddleware: EventMiddleware = {
      process: (event: GameEvent) => ({
        ...event,
        processed: true,
      }),
    };

    emitter.addMiddleware(testMiddleware);
    emitter.on("test", listener);
    emitter.emit(testEvent);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0]).toMatchObject({
      ...testEvent,
      processed: true,
    });
  });

  test("should cancel event if middleware returns undefined", () => {
    // Create a middleware that cancels the event
    const cancellingMiddleware: EventMiddleware = {
      process: () => undefined,
    };

    emitter.addMiddleware(cancellingMiddleware);
    emitter.on("test", listener);
    emitter.emit(testEvent);

    expect(listener).not.toHaveBeenCalled();
  });

  test("should chain multiple middleware in order", () => {
    // Create middleware that add different properties
    const middleware1: EventMiddleware = {
      process: (event: GameEvent) => ({
        ...event,
        middleware1: true,
      }),
    };

    const middleware2: EventMiddleware = {
      process: (event: GameEvent) => ({
        ...event,
        middleware2: true,
      }),
    };

    emitter.addMiddleware(middleware1);
    emitter.addMiddleware(middleware2);
    emitter.on("test", listener);
    emitter.emit(testEvent);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0]).toMatchObject({
      ...testEvent,
      middleware1: true,
      middleware2: true,
    });
  });

  test("should remove middleware", () => {
    const middleware: EventMiddleware = {
      process: (event: GameEvent) => ({
        ...event,
        processed: true,
      }),
    };

    emitter.addMiddleware(middleware);
    emitter.on("test", listener);

    // First emit should process the event
    emitter.emit(testEvent);
    expect(listener.mock.calls[0][0]).toMatchObject({
      processed: true,
    });

    listener.mockClear();

    // Remove the middleware
    const result = emitter.removeMiddleware(middleware);
    expect(result).toBe(true);

    // Second emit should not process the event
    emitter.emit(testEvent);
    // Check that the processed flag is NOT present
    expect(listener.mock.calls[0][0].type).toBe(testEvent.type);
    expect(listener.mock.calls[0][0].data).toBe(testEvent.data);
    expect(listener.mock.calls[0][0].processed).toBeUndefined();
  });

  test("should return false when removing non-existent middleware", () => {
    const middleware: EventMiddleware = {
      process: (event: GameEvent) => event,
    };

    const result = emitter.removeMiddleware(middleware);
    expect(result).toBe(false);
  });
});

describe("LoggingMiddleware", () => {
  let middleware: LoggingMiddleware;
  let testEvent: GameEvent;

  beforeEach(() => {
    middleware = new LoggingMiddleware();
    testEvent = {
      type: "test",
      data: "test-data",
      timestamp: 1614556800000, // March 1, 2021 UTC
    };
  });

  test("should log events at the specified level", () => {
    // Spy on console methods
    const debugSpy = jest.spyOn(console, "debug").mockImplementation();
    const infoSpy = jest.spyOn(console, "info").mockImplementation();
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    const errorSpy = jest.spyOn(console, "error").mockImplementation();

    // Test debug level (default)
    middleware.process(testEvent);
    expect(debugSpy).toHaveBeenCalled();

    // Test info level
    debugSpy.mockClear();
    middleware = new LoggingMiddleware("info");
    middleware.process(testEvent);
    expect(infoSpy).toHaveBeenCalled();

    // Test warn level
    middleware = new LoggingMiddleware("warn");
    middleware.process(testEvent);
    expect(warnSpy).toHaveBeenCalled();

    // Test error level
    middleware = new LoggingMiddleware("error");
    middleware.process(testEvent);
    expect(errorSpy).toHaveBeenCalled();

    // Restore console methods
    debugSpy.mockRestore();
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test("should return the event unchanged", () => {
    // Silence console output for this test
    jest.spyOn(console, "debug").mockImplementation();

    const result = middleware.process(testEvent);
    expect(result).toBe(testEvent);

    // Restore console
    jest.restoreAllMocks();
  });

  test("should add timestamp if missing", () => {
    // Silence console output for this test
    jest.spyOn(console, "debug").mockImplementation();

    const originalDateNow = Date.now;
    const mockDateNow = jest.fn(() => 12345);
    Date.now = mockDateNow;

    const eventWithoutTimestamp = { type: "test" };
    middleware.process(eventWithoutTimestamp);

    // Verify timestamp was used in log message
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringContaining("1970-01-01"),
      expect.anything()
    );

    // Restore mocks
    Date.now = originalDateNow;
    jest.restoreAllMocks();
  });
});

describe("FilterMiddleware", () => {
  let middleware: FilterMiddleware;

  beforeEach(() => {
    middleware = new FilterMiddleware();
  });

  test("should allow unblocked event types", () => {
    const testEvent = { type: "test" };
    const result = middleware.process(testEvent);
    expect(result).toBe(testEvent);
  });

  test("should block specific event types", () => {
    middleware.blockEventType("test");

    const testEvent = { type: "test" };
    const result = middleware.process(testEvent);
    expect(result).toBeUndefined();

    // Other events should still pass through
    const otherEvent = { type: "other" };
    const otherResult = middleware.process(otherEvent);
    expect(otherResult).toBe(otherEvent);
  });

  test("should unblock previously blocked event types", () => {
    middleware.blockEventType("test");
    middleware.unblockEventType("test");

    const testEvent = { type: "test" };
    const result = middleware.process(testEvent);
    expect(result).toBe(testEvent);
  });
});
