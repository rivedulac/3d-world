/**
 * Scene management class for the game engine.
 * Manages the 3D scene, including rendering, lighting, and camera integration.
 * Handles the connection between ECS entities and Three.js objects.
 */
import * as THREE from "three";
import { GameWorld } from "../ecs/world";
import { Entity, EntityId } from "../ecs/types";
import { ASSETS, ENTITY_TAGS } from "../../config/constants";
import { Vector3 } from "../../utils/math";

/**
 * Scene configuration options
 */
export interface SceneConfig {
  /** Scene name for identification */
  name: string;
  /** Whether to auto-initialize skybox */
  createSkybox?: boolean;
  /** Whether to auto-initialize planet */
  createPlanet?: boolean;
  /** Background color (if no skybox) */
  backgroundColor?: string;
  /** Ambient light color */
  ambientLightColor?: string;
  /** Ambient light intensity */
  ambientLightIntensity?: number;
  /** Directional light color */
  directionalLightColor?: string;
  /** Directional light intensity */
  directionalLightIntensity?: number;
  /** Whether to show debug helpers */
  showDebugHelpers?: boolean;
}

/**
 * Default configuration for scenes
 */
const DEFAULT_SCENE_CONFIG: SceneConfig = {
  name: "Default Scene",
  createSkybox: true,
  createPlanet: true,
  backgroundColor: "#000000",
  ambientLightColor: "#ffffff",
  ambientLightIntensity: 0.3,
  directionalLightColor: "#ffffff",
  directionalLightIntensity: 0.8,
  showDebugHelpers: false,
};

/**
 * Manages the 3D scene for the game
 */
export class Scene {
  /** Three.js scene object */
  private scene: THREE.Scene;

  /** Current scene configuration */
  private config: SceneConfig;

  private world: GameWorld;

  /** Three.js renderer */
  private renderer: THREE.WebGLRenderer | null = null;

  /** Main camera */
  private camera: THREE.PerspectiveCamera | null = null;

  /** Whether the scene has been initialized */
  private initialized: boolean = false;

  /** Map of entity IDs to their Three.js objects */
  private entityObjects: Map<EntityId, THREE.Object3D> = new Map();

  /** Debug helpers */
  private debugHelpers: THREE.Object3D[] = [];

  /** Directional light for the scene */
  private directionalLight: THREE.DirectionalLight | null = null;

  /** Ambient light for the scene */
  private ambientLight: THREE.AmbientLight | null = null;

  /** Skybox entity ID */
  private skyboxEntityId: EntityId | null = null;

  /** Planet entity ID */
  private planetEntityId: EntityId | null = null;

  /** DOM element for renderer */
  private container: HTMLElement | null = null;

  /**
   * Creates a new Scene instance
   * @param config Scene configuration options
   */
  constructor(world: GameWorld, config: Partial<SceneConfig> = {}) {
    this.world = world;
    this.config = { ...DEFAULT_SCENE_CONFIG, ...config };
    this.scene = new THREE.Scene();

    if (!this.config.createSkybox) {
      this.scene.background = new THREE.Color(this.config.backgroundColor);
    }

    // Register event listeners for entity management
    this.registerEventListeners();
  }

  /**
   * Initializes the scene with renderer and camera
   * @param container DOM element to render to
   * @param renderer Optional existing WebGL renderer
   * @param camera Optional existing camera
   */
  public initialize(
    container: HTMLElement,
    renderer?: THREE.WebGLRenderer,
    camera?: THREE.PerspectiveCamera
  ): void {
    if (this.initialized) {
      console.warn("Scene already initialized");
      return;
    }

    this.container = container;

    // Set up renderer
    this.renderer = renderer || new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;

    // Append renderer to container if not already there
    if (
      !renderer &&
      container &&
      !container.contains(this.renderer.domElement)
    ) {
      container.appendChild(this.renderer.domElement);
    }

    // Set up camera if not provided
    if (!camera) {
      this.camera = new THREE.PerspectiveCamera(
        75, // Field of view
        container.clientWidth / container.clientHeight, // Aspect ratio
        0.1, // Near clipping plane
        1000 // Far clipping plane
      );
      this.camera.position.set(0, 5, 10);
      this.camera.lookAt(0, 0, 0);
    } else {
      this.camera = camera;
    }

    // Set up lighting
    this.setupLighting();

    // Create basic scene elements if configured
    this.createBasicSceneElements();

    // Mark as initialized
    this.initialized = true;

    // Handle window resize
    window.addEventListener("resize", this.handleResize);

    console.log(`Scene "${this.config.name}" initialized`);
  }

  /**
   * Sets up scene lighting
   */
  private setupLighting(): void {
    // Ambient light for general illumination
    this.ambientLight = new THREE.AmbientLight(
      this.config.ambientLightColor,
      this.config.ambientLightIntensity
    );
    this.scene.add(this.ambientLight);

    // Directional light for shadows and directional illumination
    this.directionalLight = new THREE.DirectionalLight(
      this.config.directionalLightColor,
      this.config.directionalLightIntensity
    );
    this.directionalLight.position.set(10, 10, 10);
    this.directionalLight.castShadow = true;

    // Configure shadow properties
    if (this.directionalLight.shadow.camera) {
      this.directionalLight.shadow.mapSize.width = 2048;
      this.directionalLight.shadow.mapSize.height = 2048;
      const d = 20;
      this.directionalLight.shadow.camera.left = -d;
      this.directionalLight.shadow.camera.right = d;
      this.directionalLight.shadow.camera.top = d;
      this.directionalLight.shadow.camera.bottom = -d;
      this.directionalLight.shadow.camera.near = 0.5;
      this.directionalLight.shadow.camera.far = 50;
    }
    this.scene.add(this.directionalLight);

    // Add debug helpers if configured
    if (this.config.showDebugHelpers) {
      this.addDebugHelpers();
    }
  }

  /**
   * Adds debug visualization helpers to the scene
   */
  private addDebugHelpers(): void {
    // Add axes helper
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);
    this.debugHelpers.push(axesHelper);

    // Add directional light helper if light exists
    if (this.directionalLight) {
      const lightHelper = new THREE.DirectionalLightHelper(
        this.directionalLight,
        5
      );
      this.scene.add(lightHelper);
      this.debugHelpers.push(lightHelper);

      // Add shadow camera helper
      const shadowHelper = new THREE.CameraHelper(
        this.directionalLight.shadow.camera
      );
      this.scene.add(shadowHelper);
      this.debugHelpers.push(shadowHelper);
    }

    // Add grid helper
    const gridHelper = new THREE.GridHelper(20, 20);
    this.scene.add(gridHelper);
    this.debugHelpers.push(gridHelper);
  }

  /**
   * Creates basic scene elements (skybox, planet)
   */
  private createBasicSceneElements(): void {
    // Create skybox if configured
    if (this.config.createSkybox) {
      this.createSkybox();
    }

    // Create planet if configured
    if (this.config.createPlanet) {
      this.createPlanet();
    }
  }

  /**
   * Creates the skybox
   */
  private createSkybox(): void {
    const skyboxEntity = this.world.createEntity();
    skyboxEntity.tags.add(ENTITY_TAGS.SKYBOX);
    this.skyboxEntityId = skyboxEntity.id;

    // Create a simple color background as fallback
    this.scene.background = new THREE.Color("#000010");

    // Create a mesh-based skybox
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      ASSETS.SKYBOX,
      (texture) => {
        // Create a large sphere with the texture
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.BackSide, // Render on the inside of the sphere
        });

        const skybox = new THREE.Mesh(geometry, material);
        this.scene.add(skybox);
        this.entityObjects.set(skyboxEntity.id, skybox);

        console.log("Skybox created with starfield texture");
      },
      undefined,
      (error) => {
        console.error("Error loading skybox texture:", error);
        // Fallback is already set (simple color background)
      }
    );
  }

  /**
   * Creates the planet floor
   */
  private createPlanet(): void {
    const planetEntity = this.world.createEntity();
    planetEntity.tags.add(ENTITY_TAGS.PLANET);
    this.planetEntityId = planetEntity.id;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      ASSETS.PLANET,
      (texture) => {
        // Create planet with texture
        const geometry = new THREE.PlaneGeometry(100, 100);
        const material = new THREE.MeshStandardMaterial({
          map: texture,
          metalness: 0.8,
          roughness: 0.4,
          side: THREE.DoubleSide,
        });

        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        plane.receiveShadow = true;
        plane.position.y = 0;

        this.scene.add(plane);
        this.entityObjects.set(planetEntity.id, plane);

        console.log("Planet created with silver floor texture");
      },
      undefined,
      (error) => {
        console.error("Error loading planet texture:", error);

        // Fallback to a simple material
        const geometry = new THREE.PlaneGeometry(100, 100);
        const material = new THREE.MeshStandardMaterial({
          color: 0xb0b0b8,
          metalness: 0.8,
          roughness: 0.4,
          side: THREE.DoubleSide,
        });

        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -Math.PI / 2;
        plane.receiveShadow = true;
        plane.position.y = 0;

        this.scene.add(plane);
        this.entityObjects.set(planetEntity.id, plane);
      }
    );
  }

  /**
   * Registers event listeners for entity management
   */
  private registerEventListeners(): void {
    // TODO: Implement event listeners for entity/component lifecycle events
    // This will be expanded when component types are more fully defined
  }

  /**
   * Updates the scene for the current frame
   * @param deltaTime Time since last frame in seconds
   */
  public update(deltaTime: number): void {
    if (!this.initialized) return;

    // Update debug helpers if enabled
    if (this.config.showDebugHelpers) {
      this.updateDebugHelpers();
    }

    // TODO: Add scene-level updates
  }

  /**
   * Updates debug visualization helpers
   */
  private updateDebugHelpers(): void {
    // Update light helpers
    this.debugHelpers.forEach((helper) => {
      if (helper instanceof THREE.DirectionalLightHelper) {
        helper.update();
      }
      if (helper instanceof THREE.CameraHelper) {
        helper.update();
      }
    });
  }

  /**
   * Renders the scene using the current camera
   */
  public render(): void {
    if (!this.initialized || !this.renderer || !this.camera) return;
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Handles window resize event
   */
  private handleResize = (): void => {
    if (!this.initialized || !this.renderer || !this.camera || !this.container)
      return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  /**
   * Adds an object to the scene
   * @param object Object to add
   * @param entityId Optional entity ID to associate with this object
   */
  public addObject(object: THREE.Object3D, entityId?: EntityId): void {
    this.scene.add(object);
    if (entityId) {
      this.entityObjects.set(entityId, object);
    }
  }

  /**
   * Removes an object from the scene
   * @param object Object to remove
   * @param entityId Optional entity ID to remove association
   */
  public removeObject(object: THREE.Object3D, entityId?: EntityId): void {
    this.scene.remove(object);
    if (entityId) {
      this.entityObjects.delete(entityId);
    }
  }

  /**
   * Gets a Three.js object associated with an entity
   * @param entityId The entity ID
   * @returns The associated Three.js object, or undefined if none exists
   */
  public getObjectForEntity(entityId: EntityId): THREE.Object3D | undefined {
    return this.entityObjects.get(entityId);
  }

  /**
   * Creates a 3D object for an entity based on its components
   * @param entity The entity to create an object for
   * @returns The created object or null if no object could be created
   */
  public createObjectForEntity(entity: Entity): THREE.Object3D | null {
    // TODO: Implement full object creation based on entity components
    // This is a placeholder implementation
    if (!this.entityObjects.has(entity.id)) {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      cube.castShadow = true;
      cube.receiveShadow = true;

      this.addObject(cube, entity.id);
      return cube;
    }

    return null;
  }

  /**
   * Sets the camera for the scene
   * @param camera The camera to use
   */
  public setCamera(camera: THREE.PerspectiveCamera): void {
    this.camera = camera;
  }

  /**
   * Gets the current camera
   * @returns The current camera
   */
  public getCamera(): THREE.PerspectiveCamera | null {
    return this.camera;
  }

  /**
   * Gets the Three.js scene object
   * @returns The Three.js scene
   */
  public getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Gets the renderer
   * @returns The current renderer
   */
  public getRenderer(): THREE.WebGLRenderer | null {
    return this.renderer;
  }

  /**
   * Sets the renderer for the scene
   * @param renderer The renderer to use
   */
  public setRenderer(renderer: THREE.WebGLRenderer): void {
    this.renderer = renderer;
  }

  /**
   * Toggles debug helpers visibility
   * @param visible Whether debug helpers should be visible
   */
  public setDebugHelpersVisible(visible: boolean): void {
    this.config.showDebugHelpers = visible;

    this.debugHelpers.forEach((helper) => {
      helper.visible = visible;
    });

    if (visible && this.debugHelpers.length === 0) {
      this.addDebugHelpers();
    }
  }

  /**
   * Sets the ambient light color
   * @param color The color to set
   */
  public setAmbientLightColor(color: string): void {
    if (this.ambientLight) {
      this.ambientLight.color.set(color);
    }
    this.config.ambientLightColor = color;
  }

  /**
   * Sets the ambient light intensity
   * @param intensity The intensity to set
   */
  public setAmbientLightIntensity(intensity: number): void {
    if (this.ambientLight) {
      this.ambientLight.intensity = intensity;
    }
    this.config.ambientLightIntensity = intensity;
  }

  /**
   * Sets the directional light color
   * @param color The color to set
   */
  public setDirectionalLightColor(color: string): void {
    if (this.directionalLight) {
      this.directionalLight.color.set(color);
    }
    this.config.directionalLightColor = color;
  }

  /**
   * Sets the directional light intensity
   * @param intensity The intensity to set
   */
  public setDirectionalLightIntensity(intensity: number): void {
    if (this.directionalLight) {
      this.directionalLight.intensity = intensity;
    }
    this.config.directionalLightIntensity = intensity;
  }

  /**
   * Sets the directional light position
   * @param position The position to set
   */
  public setDirectionalLightPosition(position: Vector3): void {
    if (this.directionalLight) {
      const threePosition = new THREE.Vector3(
        position.x,
        position.y,
        position.z
      );
      this.directionalLight.position.copy(threePosition);
    }
  }

  /**
   * Sets the background color of the scene
   * @param color The color to set
   */
  public setBackgroundColor(color: string): void {
    // TODO: Implement background color setting
  }

  /**
   * Cleans up the scene and releases resources
   */
  public destroy(): void {
    // Remove event listeners
    window.removeEventListener("resize", this.handleResize);

    // Clear scene
    this.scene.clear();

    // Clear entity mappings
    this.entityObjects.clear();

    // Clear debug helpers
    this.debugHelpers = [];

    // Clear references
    this.skyboxEntityId = null;
    this.planetEntityId = null;
    this.directionalLight = null;
    this.ambientLight = null;

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();

      // Remove renderer from DOM if it was added by us
      if (this.container && this.container.contains(this.renderer.domElement)) {
        this.container.removeChild(this.renderer.domElement);
      }

      this.renderer = null;
    }

    this.initialized = false;
    console.log(`Scene "${this.config.name}" destroyed`);
  }
}
