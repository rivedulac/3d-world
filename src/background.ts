import * as THREE from "three";
import { gameInstance } from "./gameInstance";

// Store global instance of resize handler
let globalResizeHandler: ((event: UIEvent) => void) | null = null;

export function setScene(): {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
} {
  console.log("Setting up 3D world...");
  const scene = new THREE.Scene();
  // scene.background = new THREE.Color(0xadd8e6);

  // Load the starfield image as the background
  const textureLoader = new THREE.TextureLoader();
  const galaxyTexture = textureLoader.load("assets/starfield.svg");

  // Set the texture as the scene background
  // This is much simpler than creating a sphere
  scene.background = galaxyTexture;

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, 5);
  camera.lookAt(0, 1, 0);

  // Get the canvas element
  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;

  // If there's an existing renderer in the gameInstance, dispose it properly
  if (gameInstance.renderer) {
    console.log("Disposing existing renderer");
    gameInstance.renderer.dispose();
    gameInstance.renderer = null;
  }

  // Create a new renderer - Always create a new one to avoid context issues
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    powerPreference: "high-performance", // Optimization
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Lighting and floor creation
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // Create a silver floor instead of green
  const floorTexture = textureLoader.load("assets/silver_floor.svg");
  const floorGeometry = new THREE.PlaneGeometry(50, 50);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0, // Silver color
    map: floorTexture, // Apply the texture
    roughness: 0.8, // Less rough for a more metallic feel
    metalness: 0.1, // Higher metalness for a more reflective appearance
    envMapIntensity: 0.5, // Control the reflection intensity
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2; // Make it horizontal
  floor.position.y = 0; // Position at ground level
  scene.add(floor);

  return { scene, camera, renderer };
}

export function setWindowResize(
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
): void {
  // Remove any existing resize listeners first
  if (globalResizeHandler) {
    window.removeEventListener("resize", globalResizeHandler);
    globalResizeHandler = null;
  }

  // Create new resize handler
  const resizeHandler = () => {
    // Make sure we're using the current game instance if available
    const currentCamera = gameInstance.camera || camera;
    const currentRenderer = gameInstance.renderer || renderer;

    if (currentCamera && currentCamera instanceof THREE.PerspectiveCamera) {
      currentCamera.aspect = window.innerWidth / window.innerHeight;
      currentCamera.updateProjectionMatrix();
    }

    if (currentRenderer) {
      currentRenderer.setSize(window.innerWidth, window.innerHeight);
    }
  };

  // Store the handler globally for future cleanup
  globalResizeHandler = resizeHandler;
  window.addEventListener("resize", resizeHandler);
}
