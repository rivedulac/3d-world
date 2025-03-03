import * as THREE from "three";
import { MessageSystem, MessageType } from "./message";

interface BillboardConfig {
  position: THREE.Vector3;
  rotation?: number;
  title: string;
  message: string;
}

export class Billboard {
  private position: THREE.Vector3;
  private rotation: number;
  private mesh: THREE.Group | null = null;
  private title: string;
  private message: string;
  private interactionRange: number = 3;
  private isInteracting: boolean = false;

  constructor(config: BillboardConfig) {
    this.position = config.position;
    this.rotation = config.rotation || 0;
    this.title = config.title;
    this.message = config.message;
  }

  public createMesh(scene: THREE.Scene): void {
    // Create a group to hold all billboard parts
    this.mesh = new THREE.Group();
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotation;

    // Create the wooden frame
    const frameGeometry = new THREE.BoxGeometry(3, 2.5, 0.2);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513, // Brown color for wood
      roughness: 0.9,
      metalness: 0.1,
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);

    // Create inner paper/board part
    const boardGeometry = new THREE.PlaneGeometry(2.7, 2.2);
    const boardMaterial = new THREE.MeshStandardMaterial({
      color: 0xfaf0e6, // Light off-white for paper
      roughness: 0.5,
      metalness: 0,
    });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.position.z = 0.11; // Slightly in front of frame

    // Create legs/posts
    const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2.5, 8);
    const postMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.9,
      metalness: 0.1,
    });

    const leftPost = new THREE.Mesh(postGeometry, postMaterial);
    leftPost.position.set(-1.2, -2.5, 0);

    const rightPost = new THREE.Mesh(postGeometry, postMaterial);
    rightPost.position.set(1.2, -2.5, 0);

    // Add a small "ANNOUNCEMENTS" text indicator at the top
    const headerGeometry = new THREE.BoxGeometry(2.5, 0.3, 0.05);
    const headerMaterial = new THREE.MeshStandardMaterial({ color: 0x593e1a });
    const header = new THREE.Mesh(headerGeometry, headerMaterial);
    header.position.y = 1.3;
    header.position.z = 0.13;

    // Add all parts to the group
    this.mesh.add(frame);
    this.mesh.add(board);
    this.mesh.add(leftPost);
    this.mesh.add(rightPost);
    this.mesh.add(header);

    // Position the entire billboard properly (adjust base y position to account for posts)
    this.mesh.position.y = 1.25; // Half of the board height + post height

    // Add to scene
    scene.add(this.mesh);
  }

  public checkInteraction(playerPosition: THREE.Vector3): boolean {
    if (!this.mesh) return false;
    const distance = playerPosition.distanceTo(this.mesh.position);
    return distance < this.interactionRange;
  }

  public checkLeaveRange(playerPosition: THREE.Vector3): boolean {
    if (!this.mesh) return false;
    const distance = playerPosition.distanceTo(this.mesh.position);
    return distance > this.interactionRange + 1; // Slightly larger than interaction range
  }

  public startInteraction(): void {
    if (this.isInteracting) return;

    // Format the message with title and content
    const formattedMessage = `
      <div style="text-align: center; width: 100%;">
        <h2>${this.title}</h2>
        <div style="text-align: left; margin: 15px 0;">${this.message}</div>
      </div>
    `;

    // Show centered announcement
    MessageSystem.getInstance().showAnnouncement(formattedMessage);
    this.isInteracting = true;
  }

  public endInteraction(): void {
    MessageSystem.getInstance().hideAnnouncement();
    this.isInteracting = false;
  }

  public getIsInteracting(): boolean {
    return this.isInteracting;
  }
}

// Create billboards array for easy access
export const billboards: Billboard[] = [
  new Billboard({
    position: new THREE.Vector3(5, 0, -5),
    rotation: Math.PI / 4, // 45 degrees
    title: "Welcome to My Land!",
    message:
      "<p>This is an interactive 3D world built with Three.js.</p><p>Walk around and explore the environment. Talk to NPCs by approaching them.</p><p>Use WASD to move and arrow keys to look around.</p>",
  }),
  new Billboard({
    position: new THREE.Vector3(-8, 0, 2),
    rotation: -Math.PI / 6, // -30 degrees
    title: "Game Updates",
    message:
      "<p><strong>Version 1.18.0 Changes:</strong></p><ul><li>Added interactive billboards</li><li>Improved collision detection</li><li>Fixed camera rotation bugs</li><li>Added more environmental objects</li></ul>",
  }),
];

// Function to check for billboard interactions
export function checkBillboardInteractions(
  playerPosition: THREE.Vector3
): void {
  // Check if any billboards that are currently interacting should end their interaction
  // because the player walked away
  const interactingBillboard = billboards.find((billboard) =>
    billboard.getIsInteracting()
  );
  if (interactingBillboard) {
    if (interactingBillboard.checkLeaveRange(playerPosition)) {
      // Player walked away from a billboard they were interacting with
      interactingBillboard.endInteraction();
    }
    return; // Don't check for new interactions while in interaction
  }

  // Check if player is close enough to any billboard to start an interaction
  billboards.forEach((billboard) => {
    if (billboard.checkInteraction(playerPosition)) {
      billboard.startInteraction();
    }
  });
}
