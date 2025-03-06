import React from "react";
import * as THREE from "three";

interface BillboardConfig {
  position: THREE.Vector3;
  rotation?: number;
  title: string;
  message: string;
}

export class Billboard extends React.Component<BillboardConfig> {
  private position: THREE.Vector3;
  private rotation: number;
  private mesh: THREE.Group | null = null;
  private title: string;
  private message: string;
  private interactionRange: number = 3;
  private isInteracting: boolean = false;

  constructor(props: BillboardConfig) {
    super(props);
    this.position = props.position;
    this.rotation = props.rotation || 0;
    this.title = props.title;
    this.message = props.message;
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

    // Position the entire billboard properly
    this.mesh.position.y = 1.25;

    // Add to scene
    scene.add(this.mesh);
  }

  componentWillUnmount() {
    if (this.mesh && this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
    this.endInteraction();
  }

  public checkInteraction(playerPosition: THREE.Vector3): boolean {
    if (!this.mesh) return false;
    const distance = playerPosition.distanceTo(this.mesh.position);
    return distance < this.interactionRange;
  }

  public checkLeaveRange(playerPosition: THREE.Vector3): boolean {
    if (!this.mesh) return false;
    const distance = playerPosition.distanceTo(this.mesh.position);
    return distance > this.interactionRange + 1;
  }

  public startInteraction(): void {
    if (this.isInteracting) return;

    const formattedMessage = `
      <div style="text-align: center; width: 100%;">
        <h2>${this.title}</h2>
        <div style="text-align: left; margin: 15px 0;">${this.message}</div>
      </div>
    `;

    // TODO: Add the formatted message to the announcement
    this.isInteracting = true;
  }

  public endInteraction(): void {
    // TODO: Hide the announcement
    this.isInteracting = false;
  }

  public getIsInteracting(): boolean {
    return this.isInteracting;
  }
}

// Create billboards array
export const createBillboards = (scene: THREE.Scene): Billboard[] => {
  const billboards = [
    new Billboard({
      position: new THREE.Vector3(5, 0, -5),
      rotation: Math.PI / 4,
      title: "Welcome to My Land!",
      message:
        "<p>This is an interactive 3D world built with Three.js.</p><p>Walk around and explore the environment. Talk to NPCs by approaching them.</p><p>Use WASD to move and arrow keys to look around.</p>",
    }),
    new Billboard({
      position: new THREE.Vector3(-8, 0, 2),
      rotation: -Math.PI / 6,
      title: "Game Updates",
      message:
        "<p><strong>Version 1.18.0 Changes:</strong></p><ul><li>Added interactive billboards</li><li>Improved collision detection</li><li>Fixed camera rotation bugs</li><li>Added more environmental objects</li></ul>",
    }),
  ];

  // Create meshes for all billboards
  billboards.forEach((billboard) => billboard.createMesh(scene));

  return billboards;
};

// Function to check for billboard interactions
export function checkBillboardInteractions(
  playerPosition: THREE.Vector3,
  billboards: Billboard[]
): void {
  const interactingBillboard = billboards.find((billboard) =>
    billboard.getIsInteracting()
  );

  if (interactingBillboard) {
    if (interactingBillboard.checkLeaveRange(playerPosition)) {
      interactingBillboard.endInteraction();
    }
    return;
  }

  billboards.forEach((billboard) => {
    if (billboard.checkInteraction(playerPosition)) {
      billboard.startInteraction();
    }
  });
}
