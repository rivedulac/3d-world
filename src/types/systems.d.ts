/**
 * Type declarations for system-related functionality
 * These types define the data structures and interfaces for all systems
 * that operate on entities with specific components
 */

declare namespace Systems {
  /**
   * Base system configuration
   */
  interface SystemConfig {
    /** System priority (lower number = higher priority) */
    priority: number;
    /** Whether system is active */
    active: boolean;
    /** Update frequency in Hz (0 = every frame) */
    frequency?: number;
    /** Whether system should be updated during pause */
    updateDuringPause?: boolean;
    /** Debug mode flag */
    debug?: boolean;
  }

  /**
   * Physics Systems
   */
  namespace Physics {
    /**
     * Movement system configuration
     */
    interface MovementSystemConfig extends SystemConfig {
      /** World gravity vector */
      gravity: Math.Vector3;
      /** Physics time step */
      fixedTimeStep: number;
      /** Max physics steps per frame */
      maxSubSteps: number;
      /** Physics world scale */
      worldScale: number;
      /** Velocity sleep threshold */
      velocitySleepThreshold: number;
      /** Angular velocity sleep threshold */
      angularSleepThreshold: number;
      /** Solver iteration count */
      solverIterations: number;
    }

    /**
     * Collision system configuration
     */
    interface CollisionSystemConfig extends SystemConfig {
      /** Spatial grid cell size */
      gridCellSize: number;
      /** Max collision pairs to process */
      maxCollisionPairs: number;
      /** Collision response method */
      responseMethod: "discrete" | "continuous";
      /** Collision layer matrix */
      collisionMatrix: boolean[][];
      /** Use broad phase */
      useBroadPhase: boolean;
      /** Broad phase algorithm */
      broadPhaseAlgorithm: "grid" | "sweepAndPrune" | "bvh";
      /** Contact point generation method */
      contactPointMethod: "deepest" | "average" | "multiple";
    }
  }

  /**
   * Character Systems
   */
  namespace Character {
    /**
     * Player control system configuration
     */
    interface PlayerControlSystemConfig extends SystemConfig {
      /** Movement speed multiplier */
      movementSpeedMultiplier: number;
      /** Look sensitivity multiplier */
      lookSensitivityMultiplier: number;
      /** Enable input smoothing */
      smoothInput: boolean;
      /** Input smoothing factor (0-1) */
      smoothingFactor: number;
      /** Jump cooldown in seconds */
      jumpCooldown: number;
      /** Air control factor (0-1) */
      airControlFactor: number;
      /** Enable running */
      enableRunning: boolean;
      /** Enable crouching */
      enableCrouching: boolean;
      /** Crouch height factor */
      crouchHeightFactor: number;
      /** Crouch speed factor */
      crouchSpeedFactor: number;
    }

    /**
     * NPC behavior system configuration
     */
    interface NPCBehaviorSystemConfig extends SystemConfig {
      /** Pathfinding update frequency in Hz */
      pathfindingFrequency: number;
      /** Max pathfinding iterations */
      maxPathfindingIterations: number;
      /** Path simplification tolerance */
      pathSimplificationTolerance: number;
      /** Perception update frequency */
      perceptionUpdateFrequency: number;
      /** Behavioral state update frequency */
      behavioralStateFrequency: number;
      /** Whether to use navigation mesh */
      useNavigationMesh: boolean;
      /** Default NPC speed */
      defaultSpeed: number;
      /** Enable group behaviors */
      enableGroupBehaviors: boolean;
      /** Global NPC density factor */
      npcDensityFactor: number;
    }

    /**
     * Animation system configuration
     */
    interface AnimationSystemConfig extends SystemConfig {
      /** Default transition time */
      defaultTransitionTime: number;
      /** Whether to update animations during pause */
      updateDuringPause: boolean;
      /** Whether to enable animation events */
      enableEvents: boolean;
      /** Default animation speed */
      defaultSpeed: number;
      /** Root motion application method */
      rootMotionMethod: "none" | "position" | "full";
      /** Whether to use animation instancing */
      useInstancing: boolean;
      /** Max animation instances */
      maxInstances: number;
    }
  }

  /**
   * Interaction Systems
   */
  namespace Interaction {
    /**
     * Dialogue system configuration
     */
    interface DialogueSystemConfig extends SystemConfig {
      /** Default text display speed */
      textSpeed: number;
      /** Auto-advance delay */
      autoAdvanceDelay: number;
      /** Whether to enable voice */
      enableVoice: boolean;
      /** Whether to enable portraits */
      enablePortraits: boolean;
      /** Whether to save dialogue history */
      saveHistory: boolean;
      /** Max dialogue history length */
      maxHistoryLength: number;
      /** Dialogue camera behavior */
      cameraBehavior: "static" | "focus" | "cinematic";
      /** Whether to pause game during dialogue */
      pauseDuringDialogue: boolean;
      /** Enable NLP dialogue */
      enableNLP: boolean;
      /** NLP confidence threshold */
      nlpConfidenceThreshold: number;
    }

    /**
     * Trigger system configuration
     */
    interface TriggerSystemConfig extends SystemConfig {
      /** Default trigger active state */
      defaultActive: boolean;
      /** Whether to visualize triggers in debug mode */
      visualizeInDebug: boolean;
      /** Maximum triggers to process per frame */
      maxTriggersPerFrame: number;
      /** Whether to use spatial partitioning */
      useSpatialPartitioning: boolean;
      /** Spatial partitioning cell size */
      spatialCellSize: number;
    }

    /**
     * Interaction system configuration
     */
    interface InteractionSystemConfig extends SystemConfig {
      /** Default interaction distance */
      defaultInteractionDistance: number;
      /** Whether to highlight interactable objects */
      highlightInteractables: boolean;
      /** Highlight color */
      highlightColor: Math.Color;
      /** Whether to show interaction prompts */
      showPrompts: boolean;
      /** Prompt display time */
      promptDisplayTime: number;
      /** Whether interaction requires line of sight */
      requireLineOfSight: boolean;
      /** Interaction raycast layers */
      interactionLayers: number[];
    }
  }

  /**
   * UI Systems
   */
  namespace UI {
    /**
     * Billboard update system configuration
     */
    interface BillboardUpdateSystemConfig extends SystemConfig {
      /** Billboard rotation speed */
      rotationSpeed: number;
      /** Billboard fade in/out time */
      fadeTime: number;
      /** Whether billboards always face camera */
      alwaysFaceCamera: boolean;
      /** Whether to constrain Y-axis rotation only */
      constrainYRotation: boolean;
      /** Default billboard scale */
      defaultScale: number;
      /** Billboard visibility distance */
      visibilityDistance: number;
      /** Billboard LOD distances */
      lodDistances: number[];
    }

    /**
     * HUD update system configuration
     */
    interface HUDUpdateSystemConfig extends SystemConfig {
      /** Whether HUD is visible by default */
      visibleByDefault: boolean;
      /** HUD fade in/out time */
      fadeTime: number;
      /** HUD scale */
      scale: number;
      /** Whether to show HUD in cutscenes */
      showInCutscenes: boolean;
      /** Whether HUD should auto-hide */
      autoHide: boolean;
      /** Auto-hide delay in seconds */
      autoHideDelay: number;
      /** HUD opacity */
      opacity: number;
    }

    /**
     * Virtual keyboard system configuration
     */
    interface VirtualKeyboardSystemConfig extends SystemConfig {
      /** Whether virtual keyboard is enabled */
      enabled: boolean;
      /** Whether to auto-show on mobile devices */
      autoShowOnMobile: boolean;
      /** Button size */
      buttonSize: number;
      /** Button spacing */
      buttonSpacing: number;
      /** Button opacity */
      buttonOpacity: number;
      /** Whether to use haptic feedback */
      useHapticFeedback: boolean;
      /** Haptic feedback intensity */
      hapticIntensity: number;
      /** Whether to use dynamic positioning */
      useDynamicPositioning: boolean;
    }
  }

  /**
   * Rendering Systems
   */
  namespace Rendering {
    /**
     * Render system configuration
     */
    interface RenderSystemConfig extends SystemConfig {
      /** Target frame rate */
      targetFrameRate: number;
      /** Whether to use VSync */
      useVSync: boolean;
      /** Whether to use anti-aliasing */
      useAntiAliasing: boolean;
      /** Anti-aliasing method */
      antiAliasingMethod: "FXAA" | "SMAA" | "MSAA";
      /** MSAA sample count */
      msaaSamples: 0 | 2 | 4 | 8;
      /** Whether to use HDR */
      useHDR: boolean;
      /** Whether to use bloom */
      useBloom: boolean;
      /** Bloom intensity */
      bloomIntensity: number;
      /** Whether to use ambient occlusion */
      useAmbientOcclusion: boolean;
      /** Whether to use shadows */
      useShadows: boolean;
      /** Shadow map size */
      shadowMapSize: number;
      /** Shadow type */
      shadowType: "basic" | "PCF" | "PCFSoft";
      /** Whether to use frustum culling */
      useFrustumCulling: boolean;
      /** Whether to use occlusion culling */
      useOcclusionCulling: boolean;
    }

    /**
     * Camera system configuration
     */
    interface CameraSystemConfig extends SystemConfig {
      /** Field of view */
      fov: number;
      /** Near clip plane */
      near: number;
      /** Far clip plane */
      far: number;
      /** Camera damping */
      damping: number;
      /** Camera collision offset */
      collisionOffset: number;
      /** Whether to use camera collision */
      useCameraCollision: boolean;
      /** Default camera mode */
      defaultMode: "follow" | "firstPerson" | "fixed" | "orbit";
      /** Max orbit distance */
      maxOrbitDistance: number;
      /** Min orbit distance */
      minOrbitDistance: number;
      /** Orbit damping */
      orbitDamping: number;
    }
  }

  /**
   * Audio Systems
   */
  namespace Audio {
    /**
     * Audio system configuration
     */
    interface AudioSystemConfig extends SystemConfig {
      /** Master volume */
      masterVolume: number;
      /** Music volume */
      musicVolume: number;
      /** SFX volume */
      sfxVolume: number;
      /** Voice volume */
      voiceVolume: number;
      /** Whether audio is enabled */
      enabled: boolean;
      /** Whether to use 3D audio */
      use3DAudio: boolean;
      /** Whether to use audio occlusion */
      useOcclusion: boolean;
      /** Max audio sources */
      maxSources: number;
      /** Audio rolloff factor */
      rolloffFactor: number;
      /** Whether to use Doppler effect */
      useDoppler: boolean;
      /** Doppler factor */
      dopplerFactor: number;
    }
  }

  /**
   * AI Systems
   */
  namespace AI {
    /**
     * NLP dialogue system configuration
     */
    interface NLPDialogueSystemConfig extends SystemConfig {
      /** NLP model path or identifier */
      modelId: string;
      /** Whether to use local or remote processing */
      useLocalProcessing: boolean;
      /** API endpoint for remote processing */
      apiEndpoint?: string;
      /** API key for remote processing */
      apiKey?: string;
      /** Whether to cache responses */
      cacheResponses: boolean;
      /** Max cache size */
      maxCacheSize: number;
      /** Response timeout in milliseconds */
      responseTimeout: number;
      /** Whether to use context from previous conversations */
      useConversationContext: boolean;
      /** Max context length */
      maxContextLength: number;
      /** Default response when NLP fails */
      fallbackResponse: string;
      /** Whether to use sentiment analysis */
      useSentimentAnalysis: boolean;
      /** Whether to use intent classification */
      useIntentClassification: boolean;
      /** Confidence threshold */
      confidenceThreshold: number;
    }

    /**
     * Pathfinding system configuration
     */
    interface PathfindingSystemConfig extends SystemConfig {
      /** Pathfinding method */
      method: "AStar" | "Dijkstra" | "NavMesh";
      /** Navigation mesh path */
      navMeshPath?: string;
      /** Whether to use dynamic obstacles */
      useDynamicObstacles: boolean;
      /** Grid cell size */
      gridCellSize: number;
      /** Whether to use hierarchical pathfinding */
      useHierarchical: boolean;
      /** Max path length */
      maxPathLength: number;
      /** Whether to smooth paths */
      smoothPaths: boolean;
      /** Path simplification tolerance */
      simplificationTolerance: number;
      /** Whether to cache paths */
      cachePaths: boolean;
      /** Max cache size */
      maxCacheSize: number;
    }
  }
}
