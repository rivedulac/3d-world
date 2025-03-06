import React from "react";
import { render } from "@testing-library/react";
import * as THREE from "three";
import {
  Animation,
  startAnimation,
  stopAnimation,
  setObstacles,
} from "../animation";
import { Character } from "../../character";
import { Billboard } from "../../scene/billboard";
import { gameInstance } from "../gameInstance";
import { checkBillboardInteractions } from "../../scene/billboard";

// Mock dependencies
jest.mock("../gameInstance");
jest.mock("../../scene/billboard", () => ({
  checkBillboardInteractions: jest.fn(),
  Billboard: jest.fn(),
}));

// Mock Character class
jest.mock("../../character", () => {
  // Create a complete mock mesh with position
  const position = new THREE.Vector3(0, 0, 0);
  const mockMesh = {
    position,
    rotation: new THREE.Euler(),
    geometry: new THREE.BoxGeometry(),
    material: new THREE.MeshBasicMaterial(),
  };

  const CharacterMock = jest.fn().mockImplementation(() => ({
    mesh: mockMesh,
    update: jest.fn(),
    updateCamera: jest.fn(),
    resetCameraView: jest.fn(),
  }));
  CharacterMock.prototype.mesh = mockMesh;
  return { Character: CharacterMock };
});

describe("Animation Component and Functions", () => {
  let mockScene: THREE.Scene;
  let mockRenderer: THREE.WebGLRenderer;
  let mockCamera: THREE.PerspectiveCamera;
  let mockCharacter: Character;
  let mockBillboards: Billboard[];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock objects
    mockScene = {
      traverse: jest.fn(),
      add: jest.fn(),
      remove: jest.fn(),
    } as unknown as THREE.Scene;

    mockRenderer = {
      render: jest.fn(),
      dispose: jest.fn(),
    } as unknown as THREE.WebGLRenderer;

    mockCamera = {
      position: new THREE.Vector3(),
      lookAt: jest.fn(),
    } as unknown as THREE.PerspectiveCamera;

    // Use the mocked Character constructor
    mockCharacter = new Character(mockScene);

    mockBillboards = [
      { checkInteraction: jest.fn() } as unknown as Billboard,
      { checkInteraction: jest.fn() } as unknown as Billboard,
    ];

    // Mock requestAnimationFrame and cancelAnimationFrame
    global.requestAnimationFrame = jest.fn();
    global.cancelAnimationFrame = jest.fn();
  });

  describe("Animation Component", () => {
    it("renders without crashing", () => {
      const { container } = render(
        <Animation
          scene={mockScene}
          renderer={mockRenderer}
          character={mockCharacter}
          camera={mockCamera}
          billboards={mockBillboards}
        />
      );
      expect(container).toBeTruthy();
    });

    it("starts animation on mount and cleans up on unmount", () => {
      const { unmount } = render(
        <Animation
          scene={mockScene}
          renderer={mockRenderer}
          character={mockCharacter}
          camera={mockCamera}
          billboards={mockBillboards}
        />
      );

      expect(global.requestAnimationFrame).toHaveBeenCalled();

      unmount();
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe("startAnimation", () => {
    it.todo("initializes game instance with correct parameters");

    it("handles mesh character correctly", () => {
      const meshCharacter = new THREE.Mesh();
      const mockNewCharacter = new Character(mockScene);
      (gameInstance as any).character = mockNewCharacter;

      startAnimation(mockScene, mockRenderer, meshCharacter, mockCamera);

      expect(mockScene.remove).toHaveBeenCalledWith(mockNewCharacter.mesh);
    });
  });

  describe("stopAnimation", () => {
    it("cancels animation frame and resets animation ID", () => {
      gameInstance.animationId = 123;
      stopAnimation();

      expect(global.cancelAnimationFrame).toHaveBeenCalledWith(123);
      expect(gameInstance.animationId).toBeNull();
    });
  });

  describe("setObstacles", () => {
    it("collects valid obstacles from scene", () => {
      const mockMesh1 = new THREE.Mesh(new THREE.PlaneGeometry());
      const mockMesh2 = new THREE.Mesh(new THREE.BoxGeometry());

      // Set up floor-level mesh
      mockMesh1.position.y = 0;
      mockMesh1.rotation.x = -Math.PI / 2;

      // Set up non-floor mesh
      mockMesh2.position.y = 1;

      mockScene.traverse = jest.fn((callback) => {
        callback(mockMesh1);
        callback(mockMesh2);
      });

      const obstacles = setObstacles(mockScene);
      expect(obstacles.length).toBe(1);
      expect(obstacles[0].position.y).toBe(1);
    });

    it("skips character mesh", () => {
      const characterMesh = mockCharacter.mesh;
      mockScene.traverse = jest.fn((callback) => {
        callback(characterMesh);
      });

      gameInstance.character = mockCharacter;
      const obstacles = setObstacles(mockScene);

      expect(obstacles).not.toContain(characterMesh);
    });
  });

  describe("Billboard Interactions", () => {
    it.todo("checks billboard interactions when billboards are available");
  });
});
