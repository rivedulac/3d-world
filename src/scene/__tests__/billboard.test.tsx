import React from "react";
import * as THREE from "three";
import {
  Billboard,
  createBillboards,
  checkBillboardInteractions,
} from "../billboard";

describe("Billboard", () => {
  let scene: THREE.Scene;
  let billboard: Billboard;
  let mockAdd: jest.Mock;
  let mockRemove: jest.Mock;

  const testConfig = {
    position: new THREE.Vector3(0, 0, 0),
    rotation: Math.PI / 4,
    title: "Test Billboard",
    message: "Test Message",
  };

  beforeEach(() => {
    mockAdd = jest.fn();
    mockRemove = jest.fn();
    scene = {
      add: mockAdd,
      remove: mockRemove,
    } as unknown as THREE.Scene;

    billboard = new Billboard(testConfig);
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("creates billboard with correct properties", () => {
      expect(billboard["position"]).toEqual(testConfig.position);
      expect(billboard["rotation"]).toBe(testConfig.rotation);
      expect(billboard["title"]).toBe(testConfig.title);
      expect(billboard["message"]).toBe(testConfig.message);
    });

    it("uses default rotation when not provided", () => {
      const billboardNoRotation = new Billboard({
        ...testConfig,
        rotation: undefined,
      });
      expect(billboardNoRotation["rotation"]).toBe(0);
    });
  });

  describe("mesh creation", () => {
    it("creates mesh and adds to scene", () => {
      billboard.createMesh(scene);
      expect(mockAdd).toHaveBeenCalled();
      expect(billboard["mesh"]).toBeTruthy();
    });

    it("positions mesh correctly", () => {
      billboard.createMesh(scene);
      const expectedPosition = new THREE.Vector3(
        testConfig.position.x,
        testConfig.position.y + 1.25,
        testConfig.position.z
      );
      expect(billboard["mesh"]?.position.x).toBe(expectedPosition.x);
      expect(billboard["mesh"]?.position.y).toBe(expectedPosition.y);
      expect(billboard["mesh"]?.position.z).toBe(expectedPosition.z);
      expect(billboard["mesh"]?.rotation.y).toBe(testConfig.rotation);
    });

    it("creates mesh with correct components", () => {
      billboard.createMesh(scene);
      expect(billboard["mesh"]?.children.length).toBe(5);
    });

    it("creates mesh with all required parts", () => {
      billboard.createMesh(scene);
      const mesh = billboard["mesh"];

      const frame = mesh?.children[0];
      const board = mesh?.children[1];
      const leftPost = mesh?.children[2];
      const rightPost = mesh?.children[3];
      const header = mesh?.children[4];

      expect(frame).toBeTruthy();
      expect(board).toBeTruthy();
      expect(leftPost).toBeTruthy();
      expect(rightPost).toBeTruthy();
      expect(header).toBeTruthy();

      expect(leftPost?.position.x).toBe(-1.2);
      expect(rightPost?.position.x).toBe(1.2);
    });
  });

  describe("interaction checks", () => {
    beforeEach(() => {
      billboard.createMesh(scene);
    });

    it("detects player within interaction range", () => {
      const playerPosition = new THREE.Vector3(0, 0, 2);
      expect(billboard.checkInteraction(playerPosition)).toBeTruthy();
    });

    it("detects player outside interaction range", () => {
      const playerPosition = new THREE.Vector3(0, 0, 10);
      expect(billboard.checkInteraction(playerPosition)).toBeFalsy();
    });

    it("detects player outside leave range", () => {
      const playerPosition = new THREE.Vector3(0, 0, 5);
      expect(billboard.checkLeaveRange(playerPosition)).toBeTruthy();
    });

    it("returns false when mesh is not created", () => {
      const newBillboard = new Billboard(testConfig);
      const playerPosition = new THREE.Vector3(0, 0, 2);
      expect(newBillboard.checkInteraction(playerPosition)).toBeFalsy();
      expect(newBillboard.checkLeaveRange(playerPosition)).toBeFalsy();
    });
  });

  describe("interaction management", () => {
    it("starts interaction correctly", () => {
      billboard.startInteraction();
      expect(billboard.getIsInteracting()).toBeTruthy();
    });

    it("prevents duplicate interaction starts", () => {
      billboard.startInteraction();
      billboard.startInteraction();
      expect(billboard.getIsInteracting()).toBeTruthy();
    });

    it("ends interaction correctly", () => {
      billboard.startInteraction();
      billboard.endInteraction();
      expect(billboard.getIsInteracting()).toBeFalsy();
    });
  });

  describe("cleanup", () => {
    it("removes mesh from scene on unmount", () => {
      billboard.createMesh(scene);
      billboard["mesh"]!.parent = scene;
      billboard.componentWillUnmount();
      expect(mockRemove).toHaveBeenCalled();
    });

    it("ends interaction on unmount", () => {
      billboard.startInteraction();
      billboard.componentWillUnmount();
      expect(billboard.getIsInteracting()).toBeFalsy();
    });
  });
});

describe("Billboard Factory and Interactions", () => {
  let scene: THREE.Scene;
  let mockAdd: jest.Mock;

  beforeEach(() => {
    mockAdd = jest.fn();
    scene = { add: mockAdd } as unknown as THREE.Scene;
    jest.clearAllMocks();
  });

  describe("createBillboards", () => {
    it("creates correct number of billboards", () => {
      const billboards = createBillboards(scene);
      expect(billboards.length).toBe(2);
      expect(mockAdd).toHaveBeenCalled();
    });

    it("initializes billboards with correct properties", () => {
      const billboards = createBillboards(scene);
      expect(billboards[0]["title"]).toBe("Welcome to My Land!");
      expect(billboards[1]["title"]).toBe("Game Updates");
    });
  });

  describe("checkBillboardInteractions", () => {
    let billboards: Billboard[];
    let playerPosition: THREE.Vector3;

    beforeEach(() => {
      billboards = createBillboards(scene);
      playerPosition = new THREE.Vector3(0, 0, 0);
    });

    it("starts interaction when player is in range", () => {
      jest.spyOn(billboards[0], "checkInteraction").mockReturnValue(true);

      checkBillboardInteractions(playerPosition, billboards);
      expect(billboards[0].getIsInteracting()).toBeTruthy();
    });

    it("ends interaction when player leaves range", () => {
      billboards[0].startInteraction();
      jest.spyOn(billboards[0], "checkLeaveRange").mockReturnValue(true);

      checkBillboardInteractions(playerPosition, billboards);
      expect(billboards[0].getIsInteracting()).toBeFalsy();
    });

    it("prevents new interactions while one is active", () => {
      billboards[0].startInteraction();
      jest.spyOn(billboards[1], "checkInteraction").mockReturnValue(true);

      checkBillboardInteractions(playerPosition, billboards);
      expect(billboards[1].getIsInteracting()).toBeFalsy();
    });
  });
});
