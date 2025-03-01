// Game variables
let scene, camera, renderer;
let character;
let moveForward = false;
let moveBackward = false;
let rotateLeft = false;
let rotateRight = false;
let velocity = new THREE.Vector3();
let rotationSpeed = 0.05;
let movementSpeed = 0.1;

// Initialize the game
function init() {
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  // Create camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, 5);
  camera.lookAt(0, 1, 0);

  // Create renderer
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("gameCanvas"),
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // Create grass floor
  const floorGeometry = new THREE.PlaneGeometry(50, 50);
  const floorTexture = new THREE.TextureLoader().load(
    "data:image/png;base64,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"
  );
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(10, 10);

  const floorMaterial = new THREE.MeshStandardMaterial({
    map: floorTexture,
    roughness: 0.8,
    color: 0x88aa55,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  scene.add(floor);

  // Add background objects
  addEnvironmentObjects();

  // Create character (simple cube for now)
  const characterGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
  const characterMaterial = new THREE.MeshStandardMaterial({ color: 0x00aaff });
  character = new THREE.Mesh(characterGeometry, characterMaterial);
  character.position.set(0, 0.5, 0);
  scene.add(character);

  // Setup key controls
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  // Adjust for window resize
  window.addEventListener("resize", onWindowResize);

  // Start animation loop
  animate();
}

function onKeyDown(event) {
  switch (event.code) {
    case "KeyW":
      moveForward = true;
      break;
    case "KeyA":
      rotateLeft = true;
      break;
    case "KeyS":
      moveBackward = true;
      break;
    case "KeyD":
      rotateRight = true;
      break;
  }
}

function onKeyUp(event) {
  switch (event.code) {
    case "KeyW":
      moveForward = false;
      break;
    case "KeyA":
      rotateLeft = false;
      break;
    case "KeyS":
      moveBackward = false;
      break;
    case "KeyD":
      rotateRight = false;
      break;
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateCharacter() {
  // Handle rotation
  if (rotateLeft) {
    character.rotation.y += rotationSpeed;
  }
  if (rotateRight) {
    character.rotation.y -= rotationSpeed;
  }

  // Reset velocity
  velocity.x = 0;
  velocity.z = 0;

  // Calculate movement based on character's rotation
  if (moveForward) {
    velocity.x = Math.sin(character.rotation.y) * movementSpeed;
    velocity.z = Math.cos(character.rotation.y) * movementSpeed;
  }
  if (moveBackward) {
    velocity.x = -Math.sin(character.rotation.y) * movementSpeed;
    velocity.z = -Math.cos(character.rotation.y) * movementSpeed;
  }

  // Move character
  character.position.x -= velocity.x;
  character.position.z -= velocity.z;

  // Update camera position to follow character
  const cameraDistance = 5;
  const cameraHeight = 2;
  camera.position.x =
    character.position.x + Math.sin(character.rotation.y) * cameraDistance;
  camera.position.z =
    character.position.z + Math.cos(character.rotation.y) * cameraDistance;
  camera.position.y = character.position.y + cameraHeight;
  camera.lookAt(character.position);
}

function animate() {
  requestAnimationFrame(animate);
  updateCharacter();
  renderer.render(scene, camera);
}

// Create environment objects (trees, rocks, house)
function addEnvironmentObjects() {
  // Create trees
  function createTree(x, z) {
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, 0.75, z);

    const leavesGeometry = new THREE.ConeGeometry(1, 2, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.set(x, 2.5, z);

    scene.add(trunk);
    scene.add(leaves);
  }

  // Create rocks
  function createRock(x, z, scale) {
    const rockGeometry = new THREE.DodecahedronGeometry(scale, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.9,
    });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.position.set(x, scale / 2, z);
    rock.rotation.y = Math.random() * Math.PI;
    scene.add(rock);
  }

  // Create simple house
  function createHouse(x, z) {
    // House base
    const baseGeometry = new THREE.BoxGeometry(4, 2.5, 3);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xd2b48c });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(x, 1.25, z);

    // Roof
    const roofGeometry = new THREE.ConeGeometry(3, 2, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xa52a2a });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(x, 3.5, z);
    roof.rotation.y = Math.PI / 4;

    // Door
    const doorGeometry = new THREE.PlaneGeometry(1, 1.8);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(x, 1.15, z + 1.51);

    scene.add(base);
    scene.add(roof);
    scene.add(door);
  }

  // Add trees around the area
  createTree(-8, -8);
  createTree(-5, -10);
  createTree(-12, -3);
  createTree(8, -8);
  createTree(10, -5);
  createTree(12, -12);
  createTree(-8, 8);
  createTree(-10, 12);
  createTree(8, 10);
  createTree(12, 8);

  // Add rocks
  createRock(-3, -7, 0.7);
  createRock(5, -4, 0.5);
  createRock(-6, 2, 0.4);
  createRock(7, 6, 0.6);
  createRock(-4, 5, 0.3);

  // Add house
  createHouse(0, -15);
  createHouse(-15, 5);
  createHouse(15, 0);
}

// Start the game
init();
