import { Time } from "../Time";
import { TIME_CONSTANTS } from "../../../config/constants";

describe("Time Class", () => {
  let time: Time;
  const originalPerformanceNow = performance.now;

  // Mock performance.now for predictable testing
  let mockTime = 0;
  beforeEach(() => {
    time = new Time();
    mockTime = 0;
    performance.now = jest.fn(() => mockTime * TIME_CONSTANTS.MS_TO_SECONDS);
    time.reset();
  });

  afterAll(() => {
    // Restore the original performance.now
    performance.now = originalPerformanceNow;
  });

  // Helper to advance mock time
  const advanceTime = (seconds: number) => {
    mockTime += seconds;
    time.update();
  };

  test("should initialize with default values", () => {
    expect(time.elapsedTime).toBe(0);
    expect(time.deltaTime).toBe(0);
    expect(time.fixedDeltaTime).toBeCloseTo(TIME_CONSTANTS.DEFAULT_FIXED_DELTA);
    expect(time.timeScale).toBe(TIME_CONSTANTS.DEFAULT_TIME_SCALE);
    expect(time.fps).toBe(0);
    expect(time.isPaused).toBe(false);
  });

  test("should update delta time correctly", () => {
    advanceTime(TIME_CONSTANTS.FRAME_TIME_60FPS);
    expect(time.deltaTime).toBeCloseTo(TIME_CONSTANTS.FRAME_TIME_60FPS);
    expect(time.elapsedTime).toBeCloseTo(TIME_CONSTANTS.FRAME_TIME_60FPS);

    advanceTime(0.033); // Keep this as is since it's a test-specific value
    expect(time.deltaTime).toBeCloseTo(0.033);
    expect(time.elapsedTime).toBeCloseTo(0.049);
  });

  test("should apply time scaling correctly", () => {
    time.timeScale = 2.0; // Double speed
    advanceTime(TIME_CONSTANTS.FRAME_TIME_60FPS);
    expect(time.deltaTime).toBeCloseTo(TIME_CONSTANTS.FRAME_TIME_60FPS * 2); // 0.016 * 2
    expect(time.elapsedTime).toBeCloseTo(TIME_CONSTANTS.FRAME_TIME_60FPS * 2);

    time.timeScale = 0.5; // Half speed
    advanceTime(TIME_CONSTANTS.FRAME_TIME_60FPS);
    expect(time.deltaTime).toBeCloseTo(TIME_CONSTANTS.FRAME_TIME_60FPS * 0.5); // 0.016 * 0.5
    expect(time.elapsedTime).toBeCloseTo(TIME_CONSTANTS.FRAME_TIME_60FPS * 2.5); // 0.016 * 2 + 0.016 * 0.5
  });

  test("should handle pausing correctly", () => {
    advanceTime(TIME_CONSTANTS.FRAME_TIME_60FPS);
    expect(time.elapsedTime).toBeCloseTo(TIME_CONSTANTS.FRAME_TIME_60FPS);

    time.isPaused = true;
    advanceTime(1.0); // Advance by 1 second while paused
    expect(time.deltaTime).toBe(0);
    expect(time.elapsedTime).toBeCloseTo(TIME_CONSTANTS.FRAME_TIME_60FPS); // Should not change

    time.isPaused = false;
    advanceTime(TIME_CONSTANTS.FRAME_TIME_60FPS);
    expect(time.deltaTime).toBeCloseTo(TIME_CONSTANTS.FRAME_TIME_60FPS);
    expect(time.elapsedTime).toBeCloseTo(TIME_CONSTANTS.FRAME_TIME_60FPS * 2); // 0.016 + 0.016
  });

  test("should cap delta time at max value", () => {
    time.maxDeltaTime = 0.05;
    advanceTime(0.1); // Advance by 100ms (more than max)
    expect(time.deltaTime).toBeCloseTo(0.05); // Should be capped
    expect(time.elapsedTime).toBeCloseTo(0.05);
  });

  test("should calculate fixed updates correctly", () => {
    time.fixedDeltaTime = 0.02; // 50 fixed updates per second

    advanceTime(0.01); // Not enough time for fixed update
    expect(time.shouldRunFixedUpdate()).toBe(false);

    advanceTime(0.01); // Now we have 0.02 accumulated, should allow fixed update
    expect(time.shouldRunFixedUpdate()).toBe(true);
    expect(time.shouldRunFixedUpdate()).toBe(false); // Second check should be false

    advanceTime(0.05); // Enough time for 2 fixed updates
    expect(time.shouldRunFixedUpdate()).toBe(true);
    expect(time.shouldRunFixedUpdate()).toBe(true);
    expect(time.shouldRunFixedUpdate()).toBe(false); // Third check should be false
  });

  test("should calculate FPS correctly", () => {
    // We need to access private properties for testing
    const privateTime = time as any;
    privateTime._fpsUpdateInterval = 1.0;

    // Simulate 60 frames over 1 second
    for (let i = 0; i < 60; i++) {
      advanceTime(TIME_CONSTANTS.DEFAULT_FIXED_DELTA);
    }

    // FPS should be updated after 1 second
    expect(time.fps).toBeCloseTo(60, 0); // Allow some rounding error
  });

  test("should format time correctly", () => {
    expect(Time.formatTime(65)).toBe("01:05");
    expect(Time.formatTime(3661)).toBe("61:01");
    expect(Time.formatTime(0)).toBe("00:00");
  });

  test("should generate timestamp correctly", () => {
    const timestamp = Time.timestamp();
    expect(timestamp).toMatch(/^\d{2}:\d{2}:\d{2}\.\d{3}$/);
  });

  test("should measure real time since startup", () => {
    const startTime = time.realTimeSinceStartup;
    advanceTime(5);
    expect(time.realTimeSinceStartup - startTime).toBeCloseTo(5);

    // Real time should advance even when paused
    time.isPaused = true;
    advanceTime(3);
    expect(time.realTimeSinceStartup - startTime).toBeCloseTo(8);
  });

  test("should convert real time to game time", () => {
    expect(time.realToGameTime(10)).toBe(10); // Default time scale is 1.0

    time.timeScale = 2.5;
    expect(time.realToGameTime(10)).toBe(25);

    time.timeScale = 0.5;
    expect(time.realToGameTime(10)).toBe(5);
  });

  test("should enforce minimum values for time parameters", () => {
    time.fixedDeltaTime = -0.5;
    expect(time.fixedDeltaTime).toBeGreaterThanOrEqual(
      TIME_CONSTANTS.MIN_DELTA_TIME
    );

    time.maxDeltaTime = -0.5;
    expect(time.maxDeltaTime).toBeGreaterThanOrEqual(
      TIME_CONSTANTS.MIN_DELTA_TIME
    );

    time.timeScale = -1;
    expect(time.timeScale).toBeGreaterThanOrEqual(0);

    // Test private property
    const privateTime = time as any;
    privateTime.fpsUpdateInterval = 0.05;
    expect(privateTime._fpsUpdateInterval).toBeGreaterThanOrEqual(
      TIME_CONSTANTS.MIN_FPS_INTERVAL
    );
  });

  test("should reset all values correctly", () => {
    // Set some values
    advanceTime(5);
    time.timeScale = 2.0;
    time.isPaused = true;

    // Reset
    mockTime = 10; // Set mock time to 10 seconds
    time.reset();

    // Check values
    expect(time.elapsedTime).toBe(0);
    expect(time.deltaTime).toBe(0);
    expect(time.timeScale).toBe(TIME_CONSTANTS.DEFAULT_TIME_SCALE);
    expect(time.isPaused).toBe(false);

    // First update after reset should have delta time of 0
    time.update();
    expect(time.deltaTime).toBeCloseTo(0);
  });
});
