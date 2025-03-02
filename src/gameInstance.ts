// gameInstance.ts
import * as THREE from "three";
import { Character } from "./character";

// Global game instance to ensure only one instance runs
interface GameInstance {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  character: Character | null;
  animationId: number | null;
  initialized: boolean;
}

// Create singleton instance
export const gameInstance: GameInstance = {
  scene: null,
  camera: null,
  renderer: null,
  character: null,
  animationId: null,
  initialized: false,
};

// Clean up function to ensure proper disposal
export function cleanupGameInstance(): void {
  if (gameInstance.animationId !== null) {
    cancelAnimationFrame(gameInstance.animationId);
    gameInstance.animationId = null;
  }

  if (gameInstance.renderer) {
    gameInstance.renderer.dispose();
    // Get canvas and remove
    const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    if (canvas && canvas.parentNode) {
      // Just clear the WebGL context, don't remove the canvas
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl) {
        // @ts-ignore: loseContext is an extension
        const extension = gl.getExtension("WEBGL_lose_context");
        if (extension) extension.loseContext();
      }
    }
  }

  // Clear memory
  gameInstance.scene = null;
  gameInstance.camera = null;
  gameInstance.renderer = null;
  gameInstance.character = null;
  gameInstance.initialized = false;

  console.log("Game instance cleaned up");
}
