import * as THREE from "three";
import { MessageSystem, MessageType } from "./message";

interface NPCConfig {
  position: THREE.Vector3;
  message: string;
}

class NPC {
  private position: THREE.Vector3;
  private message: string;
  public mesh: THREE.Mesh | null;
  public isInteracting: boolean;
  private interactionRange: number = 3; // Distance at which interaction is possible
  private leaveRange: number = 4; // Distance at which conversation ends (slightly larger)

  constructor(config: NPCConfig) {
    this.position = config.position;
    this.message = config.message;
    this.mesh = null;
    this.isInteracting = false;
  }

  public createMesh(scene: THREE.Scene): void {
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    scene.add(this.mesh);
  }

  public checkInteraction(playerPosition: THREE.Vector3): boolean {
    if (!this.mesh) return false;
    const distance = playerPosition.distanceTo(this.mesh.position);
    return distance < this.interactionRange; // Interaction range
  }

  public checkLeaveRange(playerPosition: THREE.Vector3): boolean {
    if (!this.mesh) return false;
    const distance = playerPosition.distanceTo(this.mesh.position);
    return distance > this.leaveRange; // Leave conversation range (slightly larger than interaction range)
  }

  public startConversation(): void {
    // Use the MessageSystem with CONVERSATION type
    const formattedMessage = `
      <h3>NPC</h3>
      <p>${this.message}</p>
    `;

    MessageSystem.getInstance().show(
      formattedMessage,
      MessageType.CONVERSATION
    );
    this.isInteracting = true;
  }

  public endConversation(): void {
    this.isInteracting = false;
  }
}

// Create NPCs
export const npcs: NPC[] = [
  new NPC({ position: new THREE.Vector3(5, 0, 5), message: "Hello world!" }),
  new NPC({
    position: new THREE.Vector3(-5, 0, 5),
    message: "Welcome to my land!",
  }),
  new NPC({
    position: new THREE.Vector3(0, 0, -5),
    message: "How are you doing?",
  }),
];

// Function to close conversation
export function closeConversation(): void {
  // Use MessageSystem to hide the conversation
  MessageSystem.getInstance().hideConversation();
  npcs.forEach((npc) => (npc.isInteracting = false));
}

// Function to check NPC interactions
export function checkNPCInteractions(playerPosition: THREE.Vector3): void {
  // Check if any NPCs that are currently in conversation should end their conversation
  // because the player walked away
  const interactingNPC = npcs.find((npc) => npc.isInteracting);
  if (interactingNPC) {
    if (interactingNPC.checkLeaveRange(playerPosition)) {
      // Player walked away from an NPC they were talking to
      closeConversation();
    }
    return; // Don't check for new interactions while in conversation
  }

  // Only check for new interactions if no conversation is currently showing
  if (MessageSystem.getInstance().isShowingConversation()) {
    return; // Don't check for new interactions while in conversation
  }

  // Check if player is close enough to any NPC to start a conversation
  npcs.forEach((npc) => {
    if (npc.checkInteraction(playerPosition)) {
      npc.startConversation();
    }
  });
}
