import * as THREE from "three";

// Set the character
export function setCharacter(scene: THREE.Scene): THREE.Mesh {
  console.log("Setting character...");

  // Create character (simple cube for now)
  const characterGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
  const characterMaterial = new THREE.MeshStandardMaterial({ color: 0x00aaff });
  const character = new THREE.Mesh(characterGeometry, characterMaterial);

  character.position.set(0, 0.5, 0);
  scene.add(character);

  return character;
}
