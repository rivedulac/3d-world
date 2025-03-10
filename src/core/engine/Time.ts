/**
 * Time management class for the game engine.
 * Provides utilities for tracking game time, delta time, and time scaling.
 */
import { TIME_CONSTANTS } from "../../config/constants";

export class Time {
  /** Time elapsed since game start in seconds */
  private _elapsedTime: number = 0;

  /** Time since last frame in seconds */
  private _deltaTime: number = 0;

  /** Fixed time step for physics and other systems requiring consistent updates */
  private _fixedDeltaTime: number = TIME_CONSTANTS.DEFAULT_FIXED_DELTA;

  /** Time scale factor (1.0 = normal speed) */
  private _timeScale: number = TIME_CONSTANTS.DEFAULT_TIME_SCALE;

  /** Time when the last frame started */
  private _lastFrameTime: number = 0;

  /** Current FPS calculated from recent frames */
  private _fps: number = 0;

  /** Number of frames counted for FPS calculation */
  private _frameCount: number = 0;

  /** Time accumulator for FPS calculation */
  private _fpsAccumulator: number = 0;

  /** Interval for FPS updates in seconds */
  private _fpsUpdateInterval: number = TIME_CONSTANTS.DEFAULT_FPS_INTERVAL;

  /** Maximum allowed delta time to prevent large jumps after pauses/lag */
  private _maxDeltaTime: number = TIME_CONSTANTS.DEFAULT_MAX_DELTA;

  /** Whether the time is currently paused */
  private _isPaused: boolean = false;

  /** Timestamp when the game was first started */
  private _startTime: number = 0;

  /** Time accumulator for fixed update steps */
  private _fixedTimeAccumulator: number = 0;

  /**
   * Creates a new Time instance
   */
  constructor() {
    this.reset();
  }

  /**
   * Resets all time-related values
   */
  public reset(): void {
    this._elapsedTime = 0;
    this._deltaTime = 0;
    this._fixedDeltaTime = TIME_CONSTANTS.DEFAULT_FIXED_DELTA;
    this._timeScale = TIME_CONSTANTS.DEFAULT_TIME_SCALE;
    this._lastFrameTime = performance.now() / TIME_CONSTANTS.MS_TO_SECONDS;
    this._fps = 0;
    this._frameCount = 0;
    this._fpsAccumulator = 0;
    this._fpsUpdateInterval = TIME_CONSTANTS.DEFAULT_FPS_INTERVAL;
    this._maxDeltaTime = TIME_CONSTANTS.DEFAULT_MAX_DELTA;
    this._isPaused = false;
    this._startTime = performance.now() / TIME_CONSTANTS.MS_TO_SECONDS;
    this._fixedTimeAccumulator = 0;
  }

  /**
   * Updates time values based on the current timestamp
   * Call this once at the beginning of each frame
   */
  public update(): void {
    const currentTime = performance.now() / TIME_CONSTANTS.MS_TO_SECONDS;
    let rawDeltaTime = currentTime - this._lastFrameTime;

    // Cap delta time to prevent extreme values
    rawDeltaTime = Math.min(rawDeltaTime, this._maxDeltaTime);

    // Update last frame time
    this._lastFrameTime = currentTime;

    // If paused, don't update game time
    if (this._isPaused) {
      this._deltaTime = 0;
      return;
    }

    // Apply time scale
    this._deltaTime = rawDeltaTime * this._timeScale;

    // Update elapsed time
    this._elapsedTime += this._deltaTime;

    // Update FPS counter
    this._fpsAccumulator += rawDeltaTime;
    this._frameCount++;

    if (this._fpsAccumulator >= this._fpsUpdateInterval) {
      this._fps = this._frameCount / this._fpsAccumulator;
      this._frameCount = 0;
      this._fpsAccumulator = 0;
    }

    // Update fixed time accumulator
    this._fixedTimeAccumulator += this._deltaTime;
  }

  /**
   * Checks if it's time for a fixed update step
   * @returns True if a fixed update should occur
   */
  public shouldRunFixedUpdate(): boolean {
    if (this._fixedTimeAccumulator >= this._fixedDeltaTime) {
      this._fixedTimeAccumulator -= this._fixedDeltaTime;
      return true;
    }
    return false;
  }

  /**
   * Gets the elapsed time since game start in seconds
   */
  public get elapsedTime(): number {
    return this._elapsedTime;
  }

  /**
   * Gets the time since last frame in seconds
   */
  public get deltaTime(): number {
    return this._deltaTime;
  }

  /**
   * Gets the fixed update time step in seconds
   */
  public get fixedDeltaTime(): number {
    return this._fixedDeltaTime;
  }

  /**
   * Sets the fixed update time step in seconds
   */
  public set fixedDeltaTime(value: number) {
    this._fixedDeltaTime = Math.max(TIME_CONSTANTS.MIN_DELTA_TIME, value);
  }

  /**
   * Gets the time scale factor
   */
  public get timeScale(): number {
    return this._timeScale;
  }

  /**
   * Sets the time scale factor
   * @param value New time scale (1.0 = normal, 0.5 = half speed, 2.0 = double speed)
   */
  public set timeScale(value: number) {
    this._timeScale = Math.max(0, value); // Prevent negative time
  }

  /**
   * Gets the current frames per second
   */
  public get fps(): number {
    return this._fps;
  }

  /**
   * Gets the total frame count since start
   */
  public get frameCount(): number {
    return this._frameCount;
  }

  /**
   * Gets whether the time is currently paused
   */
  public get isPaused(): boolean {
    return this._isPaused;
  }

  /**
   * Pauses or unpauses the time
   * @param value True to pause, false to unpause
   */
  public set isPaused(value: boolean) {
    if (this._isPaused !== value) {
      this._isPaused = value;
      if (!value) {
        // Reset last frame time when unpausing to prevent large delta
        this._lastFrameTime = performance.now() / TIME_CONSTANTS.MS_TO_SECONDS;
      }
    }
  }

  /**
   * Gets the time elapsed since the game started, ignoring pauses and time scale
   */
  public get realTimeSinceStartup(): number {
    return performance.now() / TIME_CONSTANTS.MS_TO_SECONDS - this._startTime;
  }

  /**
   * Sets the maximum allowed delta time
   * @param value Max delta time in seconds
   */
  public set maxDeltaTime(value: number) {
    this._maxDeltaTime = Math.max(TIME_CONSTANTS.MIN_DELTA_TIME, value);
  }

  /**
   * Gets the maximum allowed delta time
   */
  public get maxDeltaTime(): number {
    return this._maxDeltaTime;
  }

  /**
   * Sets the FPS update interval
   * @param value Interval in seconds
   */
  public set fpsUpdateInterval(value: number) {
    this._fpsUpdateInterval = Math.max(TIME_CONSTANTS.MIN_FPS_INTERVAL, value);
  }

  /**
   * Converts real-world time to game time
   * @param realTime Time in seconds
   * @returns Game time in seconds
   */
  public realToGameTime(realTime: number): number {
    return realTime * this._timeScale;
  }

  /**
   * Formats time in seconds to a string (mm:ss)
   * @param timeInSeconds Time in seconds
   * @returns Formatted time string
   */
  public static formatTime(timeInSeconds: number): string {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes
      .toString()
      .padStart(TIME_CONSTANTS.TIME_PAD_LENGTH, "0")}:${seconds
      .toString()
      .padStart(TIME_CONSTANTS.TIME_PAD_LENGTH, "0")}`;
  }

  /**
   * Creates a simple timestamp for logging (hh:mm:ss.ms)
   * @returns Timestamp string
   */
  public static timestamp(): string {
    const now = new Date();
    const hours = now
      .getHours()
      .toString()
      .padStart(TIME_CONSTANTS.TIME_PAD_LENGTH, "0");
    const minutes = now
      .getMinutes()
      .toString()
      .padStart(TIME_CONSTANTS.TIME_PAD_LENGTH, "0");
    const seconds = now
      .getSeconds()
      .toString()
      .padStart(TIME_CONSTANTS.TIME_PAD_LENGTH, "0");
    const milliseconds = now
      .getMilliseconds()
      .toString()
      .padStart(TIME_CONSTANTS.MS_PAD_LENGTH, "0");

    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  }
}
