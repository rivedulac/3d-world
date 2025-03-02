import * as THREE from "three";

// Store global instances to avoid creating multiple renderers
let globalRenderer: THREE.WebGLRenderer | null = null;
let globalResizeHandler: ((event: UIEvent) => void) | null = null;

export function setScene(): {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
} {
  console.log("Setting up 3D world...");
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xadd8e6);

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

  // Reuse existing renderer if available
  let renderer: THREE.WebGLRenderer;
  if (globalRenderer) {
    console.log("Reusing existing renderer");
    renderer = globalRenderer;
  } else {
    // Create a new renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Store the renderer instance globally
    globalRenderer = renderer;
  }

  // Lighting and floor creation
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  const floorGeometry = new THREE.PlaneGeometry(50, 50);
  const floorMaterial = new THREE.MeshStandardMaterial({
    roughness: 0.8,
    color: 0x4caf50,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
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
  }

  // Create new resize handler
  const resizeHandler = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  // Store the handler globally for future cleanup
  globalResizeHandler = resizeHandler;
  window.addEventListener("resize", resizeHandler);
}
