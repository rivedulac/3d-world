/**
 * Type declarations for component-related functionality
 * These types define the data structures and interfaces for all components
 */

declare namespace Components {
  /**
   * Physics Components
   */
  namespace Physics {
    /**
     * Transform component data
     */
    interface TransformData {
      /** Position in 3D space */
      position: Math.Vector3;
      /** Rotation as a quaternion */
      rotation: Math.Quaternion;
      /** Scale in 3D space */
      scale: Math.Vector3;
      /** Local matrix cached for performance */
      localMatrix?: Math.Matrix4;
      /** World matrix cached for performance */
      worldMatrix?: Math.Matrix4;
      /** Optional parent transform for hierarchical transformations */
      parent?: string;
      /** Optional children transforms */
      children?: string[];
    }

    /**
     * Velocity component data
     */
    interface VelocityData {
      /** Linear velocity vector */
      linear: Math.Vector3;
      /** Angular velocity vector */
      angular: Math.Vector3;
      /** Maximum linear speed */
      maxSpeed?: number;
      /** Maximum angular speed */
      maxAngularSpeed?: number;
      /** Linear damping factor */
      damping?: number;
      /** Angular damping factor */
      angularDamping?: number;
    }

    /**
     * Collider types
     */
    type ColliderType = "box" | "sphere" | "capsule" | "mesh";

    /**
     * Collider component data
     */
    interface ColliderData {
      /** Type of collider */
      type: ColliderType;
      /** Whether this collider is a trigger (no physical response) */
      isTrigger: boolean;
      /** Collider center offset from transform position */
      center: Math.Vector3;
      /** Specific shape parameters based on collider type */
      shapeParams:
        | BoxColliderParams
        | SphereColliderParams
        | CapsuleColliderParams
        | MeshColliderParams;
      /** Physics material properties */
      material?: {
        /** Friction coefficient */
        friction: number;
        /** Restitution (bounciness) */
        restitution: number;
      };
      /** Layer for collision filtering */
      layer?: number;
      /** Collision mask for filtering */
      mask?: number;
    }

    /**
     * Box collider parameters
     */
    interface BoxColliderParams {
      /** Box size (width, height, depth) */
      size: Math.Vector3;
    }

    /**
     * Sphere collider parameters
     */
    interface SphereColliderParams {
      /** Sphere radius */
      radius: number;
    }

    /**
     * Capsule collider parameters
     */
    interface CapsuleColliderParams {
      /** Capsule radius */
      radius: number;
      /** Capsule height */
      height: number;
      /** Orientation axis (0=X, 1=Y, 2=Z) */
      direction: 0 | 1 | 2;
    }

    /**
     * Mesh collider parameters
     */
    interface MeshColliderParams {
      /** Mesh reference or path */
      mesh: string;
      /** Whether to use a convex hull (faster but less accurate) */
      convex: boolean;
    }

    /**
     * RigidBody component data
     */
    interface RigidBodyData {
      /** Mass of the body (0 for static) */
      mass: number;
      /** Whether the body is affected by gravity */
      affectedByGravity: boolean;
      /** Whether to lock rotation on specific axes */
      freezeRotation: {
        x: boolean;
        y: boolean;
        z: boolean;
      };
      /** Whether to lock position on specific axes */
      freezePosition: {
        x: boolean;
        y: boolean;
        z: boolean;
      };
      /** Linear drag coefficient */
      drag: number;
      /** Angular drag coefficient */
      angularDrag: number;
      /** Rigid body type */
      type: "static" | "dynamic" | "kinematic";
      /** Center of mass offset */
      centerOfMass?: Math.Vector3;
    }
  }

  /**
   * Rendering Components
   */
  namespace Rendering {
    /**
     * Mesh component data
     */
    interface MeshData {
      /** Mesh geometry reference or path */
      geometry: string;
      /** Materials applied to the mesh */
      materials: MaterialData[];
      /** Whether the mesh casts shadows */
      castShadow: boolean;
      /** Whether the mesh receives shadows */
      receiveShadow: boolean;
      /** Visibility flag */
      visible: boolean;
      /** Custom shader parameters */
      shaderParams?: Record<string, any>;
      /** Level of detail configuration */
      lod?: {
        /** Distances at which to switch LOD levels */
        distances: number[];
        /** Mesh references for each LOD level */
        meshes: string[];
      };
    }

    /**
     * Material data
     */
    interface MaterialData {
      /** Material type */
      type: "basic" | "standard" | "physical" | "toon" | "custom";
      /** Base color or map */
      color: Math.Color | string;
      /** Texture maps */
      maps?: {
        /** Diffuse/albedo map */
        diffuse?: string;
        /** Normal map */
        normal?: string;
        /** Roughness map */
        roughness?: string;
        /** Metalness map */
        metalness?: string;
        /** Ambient occlusion map */
        ao?: string;
        /** Emissive map */
        emissive?: string;
      };
      /** Material properties */
      properties?: {
        /** Roughness (0-1) for PBR materials */
        roughness?: number;
        /** Metalness (0-1) for PBR materials */
        metalness?: number;
        /** Emissive color */
        emissive?: Math.Color;
        /** Emissive intensity */
        emissiveIntensity?: number;
        /** Whether material is transparent */
        transparent?: boolean;
        /** Opacity value (0-1) */
        opacity?: number;
        /** Depth test flag */
        depthTest?: boolean;
        /** Depth write flag */
        depthWrite?: boolean;
        /** Alpha test threshold */
        alphaTest?: number;
      };
      /** Custom shader reference */
      shader?: string;
    }

    /**
     * Animation component data
     */
    interface AnimationData {
      /** Current animation state name */
      currentState: string;
      /** Available animation states */
      states: Record<string, AnimationState>;
      /** Animation clips */
      clips: AnimationClip[];
      /** Transition times between states */
      transitions: Record<string, Record<string, number>>;
      /** Global animation speed multiplier */
      speed: number;
    }

    /**
     * Animation state
     */
    interface AnimationState {
      /** Clip name(s) for this state */
      clipNames: string[];
      /** Whether to loop the animation */
      loop: boolean;
      /** Playback speed for this state */
      speed: number;
      /** Weight for blending (0-1) */
      weight: number;
    }

    /**
     * Animation clip
     */
    interface AnimationClip {
      /** Unique name for the clip */
      name: string;
      /** Duration in seconds */
      duration: number;
      /** Animation data reference */
      data: string;
    }

    /**
     * Light component types
     */
    type LightType =
      | "ambient"
      | "directional"
      | "point"
      | "spot"
      | "hemisphere";

    /**
     * Light component data
     */
    interface LightData {
      /** Type of light */
      type: LightType;
      /** Light color */
      color: Math.Color;
      /** Light intensity */
      intensity: number;
      /** Whether light casts shadows */
      castShadow: boolean;
      /** Light-specific parameters */
      params:
        | AmbientLightParams
        | DirectionalLightParams
        | PointLightParams
        | SpotLightParams
        | HemisphereLightParams;
      /** Shadow configuration */
      shadow?: {
        /** Shadow map size */
        mapSize: number;
        /** Shadow camera near plane */
        cameraNear: number;
        /** Shadow camera far plane */
        cameraFar: number;
        /** Shadow bias */
        bias: number;
        /** Shadow opacity */
        opacity?: number;
      };
    }

    interface AmbientLightParams {
      // Ambient lights don't have specific parameters
    }

    interface DirectionalLightParams {
      /** Target position */
      target?: Math.Vector3;
    }

    interface PointLightParams {
      /** Light decay */
      decay: number;
      /** Light distance (0 = no limit) */
      distance: number;
    }

    interface SpotLightParams {
      /** Target position */
      target?: Math.Vector3;
      /** Light decay */
      decay: number;
      /** Light distance (0 = no limit) */
      distance: number;
      /** Spotlight angle in radians */
      angle: number;
      /** Spotlight penumbra (0-1) */
      penumbra: number;
    }

    interface HemisphereLightParams {
      /** Ground color */
      groundColor: Math.Color;
    }
  }

  /**
   * Character Components
   */
  namespace Character {
    /**
     * Player component data
     */
    interface PlayerData {
      /** Player name or identifier */
      name: string;
      /** Camera control parameters */
      camera: {
        /** Offset from player position */
        offset: Math.Vector3;
        /** Look sensitivity */
        sensitivity: number;
        /** Min/max pitch angles (vertical) */
        pitchLimits: [number, number];
        /** Min/max yaw angles (horizontal) */
        yawLimits?: [number, number];
        /** Whether camera is first-person */
        firstPerson: boolean;
        /** First-person camera height */
        eyeHeight?: number;
      };
      /** Movement parameters */
      movement: {
        /** Walk speed in units per second */
        walkSpeed: number;
        /** Run speed in units per second */
        runSpeed: number;
        /** Jump force */
        jumpForce: number;
        /** Whether player is currently grounded */
        grounded: boolean;
      };
      /** Input control scheme */
      controls: "keyboard" | "gamepad" | "touch";
    }

    /**
     * NPC component data
     */
    interface NPCData {
      /** NPC name */
      name: string;
      /** Behavior type */
      behavior: "static" | "patrol" | "follow" | "flee" | "custom";
      /** Dialog key for conversation system */
      dialogKey?: string;
      /** NPC personality traits */
      personality?: {
        /** Friendliness (0-1) */
        friendliness?: number;
        /** Aggressiveness (0-1) */
        aggressiveness?: number;
        /** Intelligence (0-1) */
        intelligence?: number;
        /** Custom personality attributes */
        [key: string]: number | undefined;
      };
      /** NPC state */
      state: "idle" | "walking" | "talking" | "working" | string;
      /** Perception radius */
      perceptionRadius?: number;
      /** Interaction distance */
      interactionDistance: number;
      /** Movement parameters */
      movement?: {
        /** Movement speed */
        speed: number;
        /** Patrol waypoints */
        waypoints?: Math.Vector3[];
        /** Current waypoint index */
        currentWaypoint?: number;
        /** Whether to patrol in a loop */
        loop?: boolean;
        /** Wait time at waypoints */
        waypointWaitTime?: number;
      };
    }

    /**
     * Animation controller component data
     */
    interface AnimationControllerData {
      /** Available animations */
      animations: Record<string, string>;
      /** Current animation */
      current: string;
      /** Previous animation */
      previous?: string;
      /** Blend weight between current and previous */
      blendWeight: number;
      /** Blend time for transitions */
      blendTime: number;
      /** Animation speed multiplier */
      speed: number;
      /** Whether animation should loop */
      loop: boolean;
      /** Animation events */
      events?: Record<string, AnimationEvent[]>;
    }

    /**
     * Animation event
     */
    interface AnimationEvent {
      /** Time in animation when event triggers */
      time: number;
      /** Event name */
      name: string;
      /** Event parameters */
      params?: any;
    }
  }

  /**
   * Interaction Components
   */
  namespace Interaction {
    /**
     * Interactable component data
     */
    interface InteractableData {
      /** Interaction type */
      type: "examine" | "pickup" | "use" | "talk" | "custom";
      /** Interaction prompt text */
      prompt: string;
      /** Interaction distance */
      distance: number;
      /** Whether interaction is currently possible */
      enabled: boolean;
      /** Cooldown between interactions in seconds */
      cooldown?: number;
      /** Time of last interaction */
      lastInteraction?: number;
      /** Number of interactions */
      interactionCount: number;
      /** Custom data for specific interaction types */
      data?: any;
      /** Callback events */
      callbacks?: {
        /** Called when interaction starts */
        onInteract?: string;
        /** Called when interaction ends */
        onInteractEnd?: string;
        /** Called when interaction is in progress */
        onInteractHold?: string;
      };
    }

    /**
     * Dialogue component data
     */
    interface DialogueData {
      /** Dialogue tree reference */
      dialogueTreeId: string;
      /** Current dialogue node */
      currentNodeId: string;
      /** Dialogue history */
      history: string[];
      /** Character name */
      characterName: string;
      /** Character personality traits */
      personality?: Record<string, number>;
      /** Custom dialogue variables */
      variables?: Record<string, any>;
      /** Dialogue state */
      state: "inactive" | "ready" | "talking" | "listening" | "ended";
      /** Dialogue portrait */
      portrait?: string;
      /** Voice profile for audio */
      voice?: string;
    }

    /**
     * Trigger component data
     */
    interface TriggerData {
      /** Trigger shape */
      shape: "box" | "sphere" | "custom";
      /** Trigger dimensions based on shape */
      dimensions: Math.Vector3 | number;
      /** Trigger offset from entity position */
      offset: Math.Vector3;
      /** Whether trigger is currently active */
      active: boolean;
      /** Whether trigger fires once or repeatedly */
      oneShot: boolean;
      /** Whether trigger has fired */
      triggered: boolean;
      /** Entities currently in trigger zone */
      entitiesInZone: string[];
      /** Tags that can trigger this zone */
      triggerTags: string[];
      /** Cooldown between triggers in seconds */
      cooldown?: number;
      /** Event to emit when triggered */
      onEnterEvent?: string;
      /** Event to emit when entity exits trigger */
      onExitEvent?: string;
      /** Event to emit while entity stays in trigger */
      onStayEvent?: string;
    }
  }

  /**
   * UI Components
   */
  namespace UI {
    /**
     * Billboard component data
     */
    interface BillboardData {
      /** Billboard content type */
      contentType: "resume" | "projects" | "skills" | "contact";
      /** Scale of the billboard */
      scale: Math.Vector3;
      /** Whether billboard always faces camera */
      faceCamera: boolean;
      /** Whether to face camera on Y axis only */
      faceCameraY: boolean;
      /** Content reference */
      contentId: string;
      /** Whether billboard is currently visible */
      visible: boolean;
      /** Interaction distance */
      interactionDistance: number;
      /** Current display state */
      state: "inactive" | "overview" | "detailed";
      /** Display options */
      options?: {
        /** Background color */
        backgroundColor?: Math.Color;
        /** Text color */
        textColor?: Math.Color;
        /** Font size */
        fontSize?: number;
        /** Custom styles */
        styles?: Record<string, any>;
      };
    }

    /**
     * HUD component data
     */
    interface HUDData {
      /** HUD elements */
      elements: HUDElement[];
      /** Whether HUD is visible */
      visible: boolean;
      /** HUD opacity */
      opacity: number;
      /** HUD scale */
      scale: number;
    }

    /**
     * HUD element types
     */
    type HUDElementType =
      | "text"
      | "icon"
      | "progress"
      | "button"
      | "container"
      | "custom";

    /**
     * HUD element common properties
     */
    interface HUDElement {
      /** Element ID */
      id: string;
      /** Element type */
      type: HUDElementType;
      /** Screen position (0-1 for each axis) */
      position: Math.Vector2;
      /** Element size */
      size: Math.Vector2;
      /** Anchor point (0-1 for each axis) */
      anchor: Math.Vector2;
      /** Whether element is visible */
      visible: boolean;
      /** Element opacity */
      opacity: number;
      /** Element-specific data */
      data: any;
    }

    /**
     * Virtual keyboard component data
     */
    interface VirtualKeyboardData {
      /** Whether keyboard is visible */
      visible: boolean;
      /** Keyboard layout */
      layout: "movement" | "action" | "dialogue" | "custom";
      /** Button size */
      buttonSize: number;
      /** Button opacity */
      opacity: number;
      /** Vibration feedback intensity */
      vibration: number;
      /** Custom layout definition */
      customLayout?: VirtualButton[];
    }

    /**
     * Virtual button
     */
    interface VirtualButton {
      /** Button ID */
      id: string;
      /** Button label/icon */
      label: string;
      /** Button position (0-1 for each axis) */
      position: Math.Vector2;
      /** Button size */
      size: Math.Vector2;
      /** Button action */
      action: string;
      /** Whether button is held down */
      isDown: boolean;
    }
  }
}
