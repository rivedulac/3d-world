import React from "react";
import * as THREE from "three";
import { MessageSystem, MessageType } from "../message"; // TODO: Change to tsx

interface NPCProps {
  name: string;
  position: THREE.Vector3;
  message: string;
  scene: THREE.Scene;
}

export class NPC extends React.Component<NPCProps> {
  private name: string = "NPC";
  private position: THREE.Vector3;
  private message: string;
  public mesh: THREE.Mesh | null;
  public isInteracting: boolean;
  private interactionRange: number = 3;
  private leaveRange: number = 4;

  constructor(props: NPCProps) {
    super(props);
    this.name = props.name;
    this.position = props.position;
    this.message = props.message;
    this.mesh = null;
    this.isInteracting = false;
  }

  componentDidMount() {
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    this.props.scene.add(this.mesh);
  }

  componentWillUnmount() {
    if (this.mesh) {
      this.props.scene.remove(this.mesh);
    }
  }

  public checkInteraction(playerPosition: THREE.Vector3): boolean {
    if (!this.mesh) return false;
    const distance = playerPosition.distanceTo(this.mesh.position);
    return distance < this.interactionRange;
  }

  /**
   * Checks if the player has moved outside the NPC's conversation range
   * @param playerPosition The current position of the player in 3D space
   * @returns true if player is outside the leave range, false otherwise
   */
  public checkLeaveRange(playerPosition: THREE.Vector3): boolean {
    if (!this.mesh) return false;
    const distance = playerPosition.distanceTo(this.mesh.position);
    return distance > this.leaveRange;
  }

  public startConversation(): void {
    const formattedMessage = `
      <h3>${this.name}</h3>
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

// Create NPCs function (moved to a separate function to be called after scene creation)
export const createNPCs = (scene: THREE.Scene): NPC[] => {
  return [
    new NPC({
      name: "NPC 1",
      position: new THREE.Vector3(5, 0, 5),
      message: "Hello world!",
      scene,
    }),
    new NPC({
      name: "NPC 2",
      position: new THREE.Vector3(-5, 0, 5),
      message: "Welcome to my land!",
      scene,
    }),
    new NPC({
      name: "NPC 3",
      position: new THREE.Vector3(0, 0, -5),
      message: "How are you doing?",
      scene,
    }),
  ];
};

// Function to close conversation
export function closeConversation(npcs: NPC[]): void {
  MessageSystem.getInstance().hideConversation();
  npcs.forEach((npc) => (npc.isInteracting = false));
}

// Function to check NPC interactions
export function checkNPCInteractions(
  playerPosition: THREE.Vector3,
  npcs: NPC[]
): void {
  const interactingNPC = npcs.find((npc) => npc.isInteracting);
  if (interactingNPC) {
    if (interactingNPC.checkLeaveRange(playerPosition)) {
      closeConversation(npcs);
    }
    return;
  }

  if (MessageSystem.getInstance().isShowingConversation()) {
    return;
  }

  npcs.forEach((npc) => {
    if (npc.checkInteraction(playerPosition)) {
      npc.startConversation();
    }
  });
}
