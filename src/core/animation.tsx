import React from "react";
import * as THREE from "three";
import { Character } from "../character";
import { gameInstance } from "./gameInstance";
import { checkBillboardInteractions } from "../scene/billboard";
import { Billboard } from "../scene/billboard";

let obstacles: THREE.Object3D[] = [];

// Update the setObstacles function to include billboards
export function setObstacles(gameScene: THREE.Scene): THREE.Object3D[] {
  const sceneObstacles: THREE.Object3D[] = [];

  gameScene.traverse((object) => {
    // Skip non-mesh objects
    if (!(object instanceof THREE.Mesh)) return;

    // Skip the character mesh
    if (gameInstance.character && object === gameInstance.character.mesh)
      return;

    // Skip the floor (assuming it's at y=0 with rotation.x = -Math.PI/2)
    if (
      Math.abs(object.position.y) < 0.01 &&
      Math.abs(object.rotation.x + Math.PI / 2) < 0.01 &&
      object.geometry instanceof THREE.PlaneGeometry
    )
      return;

    // Add to obstacles list
    sceneObstacles.push(object);
  });

  console.log(
    `Collected ${sceneObstacles.length} obstacles for collision detection`
  );
  return sceneObstacles;
}

// Update the animationLoop function to include billboard interactions
function animationLoop(): void {
  if (
    !gameInstance.scene ||
    !gameInstance.renderer ||
    !gameInstance.camera ||
    !gameInstance.character
  ) {
    console.error("Animation loop called with uninitialized game objects");
    return;
  }

  gameInstance.animationId = requestAnimationFrame(animationLoop);
  gameInstance.character.update(obstacles);
  gameInstance.character.updateCamera(gameInstance.camera);

  // Check for billboard interactions if billboards are available
  if (billboards && billboards.length > 0) {
    checkBillboardInteractions(
      gameInstance.character.mesh.position,
      billboards
    );
  }

  gameInstance.renderer.render(gameInstance.scene, gameInstance.camera);
}

export function stopAnimation(): void {
  if (gameInstance.animationId !== null) {
    cancelAnimationFrame(gameInstance.animationId);
    gameInstance.animationId = null;
    console.log("Animation stopped");
  }
}

interface AnimationProps {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  character: Character | THREE.Mesh;
  camera: THREE.Camera;
  billboards?: Billboard[];
}

// Add billboards as a module-level variable
let billboards: Billboard[] | undefined;

export const Animation: React.FC<AnimationProps> = ({
  scene,
  renderer,
  character,
  camera,
  billboards: propBillboards,
}) => {
  React.useEffect(() => {
    billboards = propBillboards; // Store billboards for animation loop
    startAnimation(scene, renderer, character, camera);
    return () => {
      stopAnimation();
      billboards = undefined;
    };
  }, [scene, renderer, character, camera, propBillboards]);

  return null;
};

export function startAnimation(
  parScene: THREE.Scene,
  parRenderer: THREE.WebGLRenderer,
  parCharacter: Character | THREE.Mesh,
  parCamera: THREE.Camera
): void {
  // Stop any existing animation first
  stopAnimation();

  gameInstance.scene = parScene;
  gameInstance.renderer = parRenderer;

  if (parCharacter instanceof Character) {
    gameInstance.character = parCharacter;
  } else {
    console.warn("Deprecated: Using a THREE.Mesh instead of Character class");
    gameInstance.character = new Character(parScene);
    parScene.remove(gameInstance.character.mesh);
    gameInstance.character.mesh = parCharacter as THREE.Mesh;
  }

  gameInstance.camera = parCamera as THREE.PerspectiveCamera;
  obstacles = setObstacles(parScene);

  console.log("Animation started");
  animationLoop();
}

export default Animation;
