import React from "react";
import * as THREE from "three";
import { Character } from "../character";
import * as npc from "../../npc"; // Change to import entire module

jest.mock("../../npc", () => ({
  checkNPCInteractions: jest.fn(),
}));

describe("Character", () => {
  let scene: THREE.Scene;
  let character: Character;
  let mockAdd: jest.Mock;
  let mockVelocitySet: jest.Mock;
  let mockUpdateMatrix: jest.Mock;
  let mockSetFromObject: jest.Mock;
  let mockIntersectsBox: jest.Mock;

  beforeEach(() => {
    // Clear all mocks BEFORE setup
    jest.clearAllMocks();

    mockAdd = jest.fn();
    mockVelocitySet = jest.fn();
    mockUpdateMatrix = jest.fn();
    mockSetFromObject = jest.fn();
    mockIntersectsBox = jest.fn().mockReturnValue(false);

    scene = { add: mockAdd } as unknown as THREE.Scene;
    character = new Character({ scene: scene });

    // Mock the velocity
    character["velocity"] = {
      set: mockVelocitySet,
      lengthSq: jest.fn().mockReturnValue(1),
      x: 0,
      y: 0,
      z: 0,
    } as any;

    // Mock the mesh
    character["mesh"] = {
      ...character["mesh"],
      updateMatrix: mockUpdateMatrix,
      position: { clone: jest.fn().mockReturnThis(), x: 0, y: 0, z: 0 },
    } as any;

    // Mock the collider
    character["collider"] = {
      setFromObject: mockSetFromObject,
      intersectsBox: mockIntersectsBox,
    } as any;
  });

  describe("initialization", () => {
    it("initializes character and adds to scene", () => {
      expect(mockAdd).toHaveBeenCalled();
    });

    it("sets up key controls on mount", () => {
      const addEventListenerSpy = jest.spyOn(document, "addEventListener");
      character.componentDidMount();
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "keyup",
        expect.any(Function)
      );
    });

    it("removes key controls on unmount", () => {
      const removeEventListenerSpy = jest.spyOn(
        document,
        "removeEventListener"
      );
      character.componentWillUnmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keyup",
        expect.any(Function)
      );
    });

    afterAll(() => {
      jest.clearAllMocks();
    });
  });

  describe("movement and controls", () => {
    beforeEach(() => {
      character.componentDidMount();
    });

    it("handles forward movement", () => {
      // Simulate W key press
      const keyDownEvent = new KeyboardEvent("keydown", { code: "KeyW" });
      document.dispatchEvent(keyDownEvent);

      const obstacles: THREE.Object3D[] = [];
      character.update(obstacles);
      expect(mockVelocitySet).toHaveBeenCalled();

      // Release W key
      const keyUpEvent = new KeyboardEvent("keyup", { code: "KeyW" });
      document.dispatchEvent(keyUpEvent);
    });

    it("handles rotation controls", () => {
      // Press left arrow
      const keyDownEvent = new KeyboardEvent("keydown", { code: "ArrowLeft" });
      document.dispatchEvent(keyDownEvent);

      character["handleRotation"]();
      expect(character["mesh"].rotation.y).toBe(0.05);

      // Release left arrow
      const keyUpEvent = new KeyboardEvent("keyup", { code: "ArrowLeft" });
      document.dispatchEvent(keyUpEvent);

      character["handleRotation"]();
      expect(character["mesh"].rotation.y).toBe(0.05);
    });

    it("handles pitch controls", () => {
      // Press up arrow
      const keyDownEvent = new KeyboardEvent("keydown", { code: "ArrowUp" });
      document.dispatchEvent(keyDownEvent);

      character["handleRotation"]();
      expect(character["currentPitch"]).toBe(0.03);

      // Release up arrow
      const keyUpEvent = new KeyboardEvent("keyup", { code: "ArrowUp" });
      document.dispatchEvent(keyUpEvent);
    });

    it("handles movement with collision detection", () => {
      // Press W key to move forward
      const keyDownEvent = new KeyboardEvent("keydown", { code: "KeyW" });
      document.dispatchEvent(keyDownEvent);

      const obstacles: THREE.Object3D[] = [];
      character["handleMovement"](obstacles);
      expect(character["mesh"].updateMatrix).toHaveBeenCalled();
      expect(character["collider"].setFromObject).toHaveBeenCalled();

      // Release W key
      const keyUpEvent = new KeyboardEvent("keyup", { code: "KeyW" });
      document.dispatchEvent(keyUpEvent);
    });

    it("updates character with all components", () => {
      // Press W key to move
      const keyDownEvent = new KeyboardEvent("keydown", { code: "KeyW" });
      document.dispatchEvent(keyDownEvent);

      const obstacles: THREE.Object3D[] = [];
      character.update(obstacles);
      expect(npc.checkNPCInteractions).toHaveBeenCalled();

      // Release W key
      const keyUpEvent = new KeyboardEvent("keyup", { code: "KeyW" });
      document.dispatchEvent(keyUpEvent);
    });
  });

  describe("collision and boundaries", () => {
    it("checks for out of bounds", () => {
      character["mesh"].position.x = 30;
      expect(character["isOutOfBounds"]()).toBe(true);
    });

    it("detects collisions with obstacles", () => {
      const mockObstacle = new THREE.Mesh();
      const obstacles = [mockObstacle];
      expect(character["checkCollisions"](obstacles)).toBe(false);
    });
  });

  describe("camera controls", () => {
    it("updates camera position", () => {
      const camera = {
        position: new THREE.Vector3(),
        lookAt: jest.fn(),
        quaternion: { multiply: jest.fn() },
      } as unknown as THREE.Camera;

      character.updateCamera(camera);
      expect(camera.lookAt).toHaveBeenCalled();
    });

    it("resets camera view", () => {
      const consoleSpy = jest.spyOn(console, "log");
      character.resetCameraView();
      expect(character["currentPitch"]).toBe(0);
      expect(character["mesh"].rotation.y).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith("Camera view reset");
    });
  });
});
