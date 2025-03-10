/**
 * Minimal math utilities for the 3D game engine
 * Primarily wraps Three.js math utilities with a few additional helpers
 */
import {
  Vector2 as ThreeVector2,
  Vector3 as ThreeVector3,
  Matrix4 as ThreeMatrix4,
  Quaternion as ThreeQuaternion,
  MathUtils,
} from "three";

// Re-export Three.js math classes
export {
  ThreeVector2 as Vector2,
  ThreeVector3 as Vector3,
  ThreeMatrix4 as Matrix4,
  ThreeQuaternion as Quaternion,
  MathUtils,
};

/**
 * Converts degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Converts radians to degrees
 * @param radians Angle in radians
 * @returns Angle in degrees
 */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Linearly interpolates between two values
 * @param start Start value
 * @param end End value
 * @param t Interpolation factor (0-1)
 * @returns Interpolated value
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

/**
 * Clamps a value between min and max
 * @param value Value to clamp
 * @param min Minimum value
 * @param max Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Checks if two floating point numbers are approximately equal
 * @param a First number
 * @param b Second number
 * @param epsilon Tolerance (default: 0.0001)
 * @returns True if numbers are approximately equal
 */
export function approxEquals(
  a: number,
  b: number,
  epsilon: number = 0.0001
): boolean {
  return Math.abs(a - b) < epsilon;
}

/**
 * Maps a value from one range to another
 * @param value Value to map
 * @param inMin Input range minimum
 * @param inMax Input range maximum
 * @param outMin Output range minimum
 * @param outMax Output range maximum
 * @returns Mapped value
 */
export function map(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}
