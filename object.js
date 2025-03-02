// Create environment objects (trees, rocks, house)
export function addEnvironmentObjects(scene) {
  console.log("Adding environment objects...");
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
