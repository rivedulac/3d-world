import React from "react";
import { render } from "@testing-library/react";
import * as THREE from "three";
import { GameCanvas, setScene, setWindowResize } from "../background";
import { gameInstance } from "../../core/gameInstance";

// Mock gameInstance
jest.mock("../../core/gameInstance", () => ({
  gameInstance: {
    renderer: null,
    camera: null,
  },
}));

// Mock Three.js
jest.mock("three", () => {
  const mockTextureLoad = jest.fn().mockReturnValue("mockedTexture");
  const mockSetSize = jest.fn();
  const mockDispose = jest.fn();

  return {
    Scene: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      background: null,
    })),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() },
      lookAt: jest.fn(),
      aspect: 0,
      updateProjectionMatrix: jest.fn(),
    })),
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setSize: mockSetSize,
      setPixelRatio: jest.fn(),
      dispose: mockDispose,
    })),
    TextureLoader: jest.fn().mockImplementation(() => ({
      load: mockTextureLoad,
    })),
    AmbientLight: jest.fn(),
    DirectionalLight: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() },
    })),
    PlaneGeometry: jest.fn(),
    MeshStandardMaterial: jest.fn(),
    Mesh: jest.fn().mockImplementation(() => ({
      rotation: { x: 0 },
      position: { y: 0 },
    })),
  };
});

describe("Background", () => {
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    // Create and add mock canvas
    mockCanvas = document.createElement("canvas");
    mockCanvas.id = "gameCanvas";
    document.body.appendChild(mockCanvas);

    // Reset gameInstance
    gameInstance.renderer = null;
    gameInstance.camera = null;

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.body.removeChild(mockCanvas);
  });

  describe("GameCanvas Component", () => {
    it("renders canvas element with correct id", () => {
      const { container } = render(<GameCanvas />);
      const canvas = container.querySelector("#gameCanvas");
      expect(canvas).toBeInTheDocument();
    });
  });

  describe("setScene", () => {
    it("creates and returns scene, camera, and renderer", () => {
      const { scene, camera, renderer } = setScene();

      expect(scene).toBeDefined();
      expect(camera).toBeDefined();
      expect(renderer).toBeDefined();

      expect(THREE.Scene).toHaveBeenCalled();
      expect(THREE.PerspectiveCamera).toHaveBeenCalled();
      expect(THREE.WebGLRenderer).toHaveBeenCalled();
    });

    it("loads textures for background and floor", () => {
      setScene();

      const textureLoader = new THREE.TextureLoader();
      expect(textureLoader.load).toHaveBeenCalledWith(
        "src/assets/starfield.svg"
      );
      expect(textureLoader.load).toHaveBeenCalledWith(
        "src/assets/silver_floor.svg"
      );
    });

    it("disposes existing renderer if present in gameInstance", () => {
      const mockDispose = jest.fn();
      gameInstance.renderer = {
        dispose: mockDispose,
      } as unknown as THREE.WebGLRenderer;

      setScene();

      expect(mockDispose).toHaveBeenCalled();
      expect(gameInstance.renderer).toBeNull();
    });

    it("sets up lights and floor", () => {
      const { scene } = setScene();

      expect(THREE.AmbientLight).toHaveBeenCalledWith(0xffffff, 0.6);
      expect(THREE.DirectionalLight).toHaveBeenCalledWith(0xffffff, 0.8);
      expect(THREE.PlaneGeometry).toHaveBeenCalledWith(50, 50);
      expect(THREE.MeshStandardMaterial).toHaveBeenCalled();
    });
  });

  describe("setWindowResize", () => {
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;

    beforeEach(() => {
      // Create camera with necessary methods
      camera = {
        aspect: 0,
        updateProjectionMatrix: jest.fn(),
        constructor: THREE.PerspectiveCamera, // needed for instanceof check
      } as unknown as THREE.PerspectiveCamera;

      // Create renderer with necessary methods
      renderer = {
        setSize: jest.fn(),
      } as unknown as THREE.WebGLRenderer;

      // Set window dimensions
      global.innerWidth = 1024;
      global.innerHeight = 768;
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it.todo("updates camera and renderer on resize");

    it.todo("uses gameInstance camera and renderer if available");

    it("removes existing resize listener before adding new one", () => {
      const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

      setWindowResize(camera, renderer);
      setWindowResize(camera, renderer);

      expect(removeEventListenerSpy).toHaveBeenCalled();
    });

    it.todo("handles instanceof check correctly");
  });
});
