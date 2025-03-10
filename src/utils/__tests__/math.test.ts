import { degToRad, radToDeg, lerp, clamp, approxEquals, map } from "../math";

describe("Math Utilities", () => {
  describe("Angle Conversions", () => {
    test("degToRad should convert degrees to radians", () => {
      expect(degToRad(0)).toBeCloseTo(0);
      expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
      expect(degToRad(180)).toBeCloseTo(Math.PI);
      expect(degToRad(360)).toBeCloseTo(2 * Math.PI);
    });

    test("radToDeg should convert radians to degrees", () => {
      expect(radToDeg(0)).toBeCloseTo(0);
      expect(radToDeg(Math.PI / 2)).toBeCloseTo(90);
      expect(radToDeg(Math.PI)).toBeCloseTo(180);
      expect(radToDeg(2 * Math.PI)).toBeCloseTo(360);
    });
  });

  describe("Interpolation", () => {
    test("lerp should linearly interpolate between values", () => {
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 10, 1)).toBe(10);

      // Test clamping
      expect(lerp(0, 10, -1)).toBe(0);
      expect(lerp(0, 10, 2)).toBe(10);
    });
  });

  describe("Range Operations", () => {
    test("clamp should constrain values to a range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    test("map should remap values from one range to another", () => {
      expect(map(5, 0, 10, 0, 100)).toBe(50);
      expect(map(0, 0, 10, 100, 200)).toBe(100);
      expect(map(10, 0, 10, 100, 200)).toBe(200);

      // Test mapping with negative ranges
      expect(map(0, -10, 10, -1, 1)).toBe(0);
      expect(map(-5, -10, 10, -1, 1)).toBe(-0.5);
    });
  });

  describe("Utility Functions", () => {
    test("approxEquals should compare floating point numbers with tolerance", () => {
      expect(approxEquals(0.1 + 0.2, 0.3)).toBe(true);
      expect(approxEquals(0.1 + 0.2, 0.31)).toBe(false);

      // Test with custom epsilon
      expect(approxEquals(0.1, 0.15, 0.1)).toBe(true);
      expect(approxEquals(0.1, 0.2, 0.05)).toBe(false);
    });
  });
});
