import React from "react";
import * as THREE from "three";
import {
  NPC,
  createNPCs,
  closeConversation,
  checkNPCInteractions,
} from "../npc";
import { MessageSystem, MessageType } from "../../message";

// Mock MessageSystem
jest.mock("../../message", () => ({
  MessageType: {
    CONVERSATION: "conversation",
  },
  MessageSystem: {
    getInstance: jest.fn().mockReturnValue({
      show: jest.fn(),
      hideConversation: jest.fn(),
      isShowingConversation: jest.fn().mockReturnValue(false),
    }),
  },
}));

describe("NPC", () => {
  let scene: THREE.Scene;
  let npc: NPC;
  let mockAdd: jest.Mock;
  let mockRemove: jest.Mock;

  beforeEach(() => {
    mockAdd = jest.fn();
    mockRemove = jest.fn();
    scene = { add: mockAdd, remove: mockRemove } as unknown as THREE.Scene;

    npc = new NPC({
      name: "Test NPC",
      position: new THREE.Vector3(0, 0, 0),
      message: "Test message",
      scene,
    });
  });

  describe("initialization and lifecycle", () => {
    it("initializes with correct properties", () => {
      expect(npc["name"]).toBe("Test NPC");
      expect(npc["message"]).toBe("Test message");
      expect(npc.isInteracting).toBeFalsy();
    });

    it("creates and adds mesh to scene on mount", () => {
      npc.componentDidMount();
      expect(mockAdd).toHaveBeenCalled();
      expect(npc.mesh).toBeTruthy();
    });

    it("removes mesh from scene on unmount", () => {
      npc.componentDidMount();
      npc.componentWillUnmount();
      expect(mockRemove).toHaveBeenCalled();
    });
  });

  describe("interaction checks", () => {
    beforeEach(() => {
      npc.componentDidMount();
    });

    it("detects player within interaction range", () => {
      const playerPosition = new THREE.Vector3(0, 0, 2);
      expect(npc.checkInteraction(playerPosition)).toBeTruthy();
    });

    it("detects player outside interaction range", () => {
      const playerPosition = new THREE.Vector3(0, 0, 10);
      expect(npc.checkInteraction(playerPosition)).toBeFalsy();
    });

    it("detects player outside leave range", () => {
      const playerPosition = new THREE.Vector3(0, 0, 5);
      expect(npc.checkLeaveRange(playerPosition)).toBeTruthy();
    });
  });

  describe("conversation management", () => {
    it("starts conversation with correct message", () => {
      const messageSystem = MessageSystem.getInstance();
      npc.startConversation();

      expect(messageSystem.show).toHaveBeenCalledWith(
        expect.stringContaining("Test NPC"),
        MessageType.CONVERSATION
      );
      expect(npc.isInteracting).toBeTruthy();
    });

    it("ends conversation correctly", () => {
      npc.startConversation();
      npc.endConversation();
      expect(npc.isInteracting).toBeFalsy();
    });
  });
});

describe("NPC Helper Functions", () => {
  let scene: THREE.Scene;
  let npcs: NPC[];

  beforeEach(() => {
    scene = { add: jest.fn(), remove: jest.fn() } as unknown as THREE.Scene;
    npcs = createNPCs(scene);
  });

  describe("createNPCs", () => {
    it("creates correct number of NPCs", () => {
      expect(npcs.length).toBe(3);
    });

    it("initializes NPCs with correct properties", () => {
      expect(npcs[0]["name"]).toBe("NPC 1");
      expect(npcs[1]["name"]).toBe("NPC 2");
      expect(npcs[2]["name"]).toBe("NPC 3");
    });
  });

  describe("closeConversation", () => {
    it("closes all NPC conversations", () => {
      npcs[0].isInteracting = true;
      npcs[1].isInteracting = true;

      closeConversation(npcs);

      npcs.forEach((npc) => {
        expect(npc.isInteracting).toBeFalsy();
      });
      expect(MessageSystem.getInstance().hideConversation).toHaveBeenCalled();
    });
  });

  describe("checkNPCInteractions", () => {
    const playerPosition = new THREE.Vector3(0, 0, 0);

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("starts conversation when player is in range", () => {
      jest.spyOn(npcs[0], "checkInteraction").mockReturnValue(true);

      checkNPCInteractions(playerPosition, npcs);

      expect(npcs[0].isInteracting).toBeTruthy();
    });

    it("ends conversation when player moves out of range", () => {
      npcs[0].isInteracting = true;
      jest.spyOn(npcs[0], "checkLeaveRange").mockReturnValue(true);

      checkNPCInteractions(playerPosition, npcs);

      expect(npcs[0].isInteracting).toBeFalsy();
    });

    it("does not start new conversations while one is active", () => {
      npcs[0].isInteracting = true;
      jest.spyOn(npcs[1], "checkInteraction").mockReturnValue(true);

      checkNPCInteractions(playerPosition, npcs);

      expect(npcs[1].isInteracting).toBeFalsy();
    });

    it("does not start new conversations while message system is showing conversation", () => {
      (
        MessageSystem.getInstance().isShowingConversation as jest.Mock
      ).mockReturnValue(true);
      jest.spyOn(npcs[0], "checkInteraction").mockReturnValue(true);

      checkNPCInteractions(playerPosition, npcs);

      expect(npcs[0].isInteracting).toBeFalsy();
    });
  });
});
