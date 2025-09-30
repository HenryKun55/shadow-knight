/* ===================================
   GAME CONFIGURATION - SHADOW KNIGHT
   ===================================
   Centralized configuration object containing all game constants,
   settings, and configurable values for easy maintenance.
*/

export const GameConfig = {
  
  /* ==================== CORE GAME SETTINGS ==================== */
  
  GAME: {
    // Core game info
    TITLE: 'Shadow Knight',
    VERSION: '1.0.0',
    
    // Core game dimensions (internal resolution)
    WIDTH: 1280,
    HEIGHT: 720,
    ASPECT_RATIO: 16 / 9,
    TARGET_FPS: 60,
    MAX_DELTA_TIME: 100, // Maximum delta time to prevent huge jumps
    DELTA_TIME_CAP: 100,
    
    // World bounds (for camera constraints)
    WORLD_BOUNDS: {
      WIDTH: 2560,
      HEIGHT: 720
    },
    
    // Performance monitoring
    PERFORMANCE: {
      FPS_UPDATE_INTERVAL: 1000, // Update FPS display every second
      FRAME_SAMPLE_SIZE: 60 // Number of frames to average for FPS
    }
  },
  
  WORLD: {
    WIDTH: 2560,
    HEIGHT: 720,
    GRAVITY: 980,
    BOUNDS: {
      width: 2560,
      height: 720
    },
    DOOR: {
      INTERIOR_PADDING: 5
    }
  },

  /* ==================== ROOM THEMES CONFIGURATION ==================== */
  
  ROOM_THEMES: {
    FOREST: { STAR_COUNT: 50 },
    DUNGEON: { STAR_COUNT: 20 },
    CEMETERY: { STAR_COUNT: 100 },
    SANCTUARY: { STAR_COUNT: 200 },
    CAVE: { STAR_COUNT: 10 },
    DEFAULT: { STAR_COUNT: 75 }
  },

  /* ==================== RESOLUTION SCALING ==================== */
  
  RESOLUTION: {
    // Available resolution options
    OPTIONS: {
      HD: { width: 1280, height: 720, label: 'HD', scale: 0.65 },
      HD_PLUS: { width: 1600, height: 900, label: 'HD+', scale: 0.75 },
      FULL_HD: { width: 1920, height: 1080, label: 'FHD', scale: 0.85 },
      QHD_2K: { width: 2560, height: 1440, label: '2K', scale: 0.95 },
      UHD_4K: { width: 3840, height: 2160, label: '4K', scale: 1.0 }
    },
    
    // Margin factors for UI spacing
    MARGINS: {
      HORIZONTAL: 0.95, // 5% horizontal margin
      VERTICAL: 0.80    // 20% vertical margin for UI
    },
    
    // Default resolution
    DEFAULT: 'HD'
  },

  /* ==================== CAMERA CONFIGURATION ==================== */
  
  CAMERA: {
    SMOOTHING_FACTOR: 0.1
  },

  /* ==================== BACKGROUND CONFIGURATION ==================== */
  
  BACKGROUND: {
    GRADIENT_START: '#1a1a2e',
    GRADIENT_END: '#0f0f23',
    DEFAULT_STAR_COUNT: 200,
    STAR_MAX_SIZE: 2,
    GROUND_Y_POSITION: 620
  },

  /* ==================== SPRITE CONFIGURATION ==================== */
  
  SPRITE: {
    ANIMATION: {
      STAR_SIZE_MAX: 2
    },
    CORPSE: {
      ALPHA: 0.8
    },
    RAGDOLL: {
      ROTATION_FACTOR: 0.3,
      IMPACT_SCALE: 1.1,
      MIN_ALPHA: 0.7
    },
    DEATH: {
      MIN_SCALE_Y: 0.3,
      SCALE_REDUCTION_FACTOR: 0.7,
      MIN_ALPHA: 0.4,
      ALPHA_REDUCTION_FACTOR: 0.6,
      COLOR_CHANGE_THRESHOLD_LOW: 0.2,
      COLOR_CHANGE_THRESHOLD_HIGH: 0.6
    }
  },

  /* ==================== PLAYER CONFIGURATION ==================== */
  
  PLAYER: {
    // Movement settings
    MOVEMENT: {
      SPEED: 300,              // Horizontal movement speed
      JUMP_POWER: 500,         // Initial jump velocity
      JUMP_FORCE: 500,         // Alias for JUMP_POWER
      DASH_SPEED: 800,         // Dash movement speed
      DASH_DURATION: 200,      // Dash duration in ms
      DASH_COOLDOWN: 500,      // Cooldown between dashes
      MAP_SPEED_MODIFIER: 0.3, // Speed when map is open
      MIN_RUN_VELOCITY: 10     // Minimum velocity for run animation
    },
    
    // Health and stamina
    STATS: {
      MAX_HEALTH: 100,
      MAX_STAMINA: 100,
      STAMINA_REGEN_RATE: 50,  // Points per second
      INVULNERABILITY_DURATION: 1000 // After taking damage
    },
    
    // Stamina costs
    STAMINA_COSTS: {
      DASH: 30,
      ATTACK: 15
    },
    
    // Combat settings
    COMBAT: {
      DASH_DAMAGE: 20,
      ATTACK_DAMAGE: 20,
      ATTACK_DURATION: 300,
      ATTACK_COOLDOWN: 300,
      COMBO_WINDOW: 800,      // Time window for combo attacks
      MAX_COMBO_COUNT: 3,
      HIT_STOP_DURATION: 100  // Hit stop when taking damage
    },
    
    // Death settings
    DEATH: {
      GAME_OVER_DELAY: 2000    // Delay before showing game over screen
    },
    
    // Visual effects
    VISUAL_EFFECTS: {
      DAMAGE_FLASH_COLOR: '#ffffff',
      DAMAGE_FLASH_DURATION: 150
    },
    
    // Health settings
    HEALTH: {
      MAX_HEALTH: 100,
      REGENERATION_RATE: 0
    },
    
    // Jump mechanics
    JUMP: {
      COYOTE_TIME: 150,       // Grace period after leaving ground
      BUFFER_TIME: 150,       // Input buffer for jump
      DOUBLE_JUMP_ENABLED: true
    },
    
    // Spawn settings
    SPAWN: {
      DEFAULT_X: 100,
      DEFAULT_Y: 550,
      DEFAULT_ROOM: 0
    },
    
    // Collision settings
    COLLISION: {
      OFFSET_X: -16,
      OFFSET_Y: -29
    }
  },

  /* ==================== AI SYSTEM CONFIGURATION ==================== */
  
  AI: {
    CHASE_RANGE_MULTIPLIER: 1.5,
    IDLE_FRICTION: 0.8,
    ATTACK_FRICTION: 0.9,
    ATTACK_WINDOW: {
      START: 0.3,
      END: 0.7
    },
    ATTACK_FLASH: {
      COLOR: '#ff6666',
      DURATION: 150
    },
    HITBOX: {
      OFFSET_X_RIGHT: 30,
      WIDTH: 40,
      OFFSET_Y: -20,
      HEIGHT: 60
    }
  },

  /* ==================== BOSS CONFIGURATION ==================== */
  
  BOSS: {
    INITIAL_STATE: 'dormant',
    ATTACK_COOLDOWN: 1500,
    ENRAGE_THRESHOLD: 0.3,
    RECOVERY_FRICTION: 0.85,
    ATTACK_RANGE_MULTIPLIER: 1.2,
    APPROACH_FRICTION: 0.9,
    RECOVERY_DURATION: 1000,
    
    ATTACK_PATTERNS: {
      PHASE_1: ['basic_attack', 'charge'],
      PHASE_2: ['basic_attack', 'charge', 'special_attack'],
      PHASE_3: ['basic_attack', 'charge', 'special_attack', 'dash_attack'],
      
      TRIPLE_SLASH: {
        TIMING: {
          FIRST: 0.2,
          SECOND: 0.5,
          THIRD: 0.8
        },
        SLASH_1: {
          WIDTH: 80, HEIGHT: 60, DAMAGE_MULTIPLIER: 1.0,
          OFFSET_X_RIGHT: 40, OFFSET_X_LEFT: -120, OFFSET_Y: -30
        },
        SLASH_2: {
          WIDTH: 90, HEIGHT: 70, DAMAGE_MULTIPLIER: 1.2,
          OFFSET_X_RIGHT: 50, OFFSET_X_LEFT: -140, OFFSET_Y: -35
        },
        SLASH_3: {
          WIDTH: 100, HEIGHT: 80, DAMAGE_MULTIPLIER: 1.5,
          OFFSET_X_RIGHT: 60, OFFSET_X_LEFT: -160, OFFSET_Y: -40
        }
      },
      
      SHADOW_DASH: {
        TIMING: { TRIGGER: 0.3 },
        WIDTH: 120, HEIGHT: 80, DAMAGE_MULTIPLIER: 1.3,
        SPEED: 400, DISTANCE: 200
      },
      
      GROUND_SLAM: {
        TIMING: { TRIGGER: 0.4 },
        WIDTH: 200, HEIGHT: 100, DAMAGE_MULTIPLIER: 2.0,
        OFFSET_X: -100, OFFSET_Y: 20
      },
      
      TELEPORT_STRIKE: {
        TIMING: { TRIGGER: 0.2 },
        WIDTH: 100, HEIGHT: 80, DAMAGE_MULTIPLIER: 1.8,
        TELEPORT_RANGE: 300
      },
      
      PROJECTILE_BARRAGE: {
        TIMING: { 
          FIRST: 0.2, SECOND: 0.4, THIRD: 0.6, FOURTH: 0.8, FIFTH: 1.0
        },
        PROJECTILE_COUNT: 5, SPEED: 300, SIZE: 20, DAMAGE: 25
      },
      
      AIR_SLAM: {
        TIMING: { TRIGGER: 0.5 },
        WIDTH: 150, HEIGHT: 120, DAMAGE_MULTIPLIER: 2.5,
        JUMP_HEIGHT: 200, GRAVITY_MULTIPLIER: 2.0
      },
      
      MULTI_PROJECTILE: {
        TIMING: { TRIGGER: 0.3 },
        PROJECTILE_COUNT: 8, SPREAD_ANGLE: 45, SPEED: 250,
        SIZE: 15, DAMAGE: 20
      },
      
      TELEPORT_DASH: {
        TIMING: { TRIGGER: 0.25 },
        WIDTH: 140, HEIGHT: 90, DAMAGE_MULTIPLIER: 1.6,
        TELEPORT_DISTANCE: 250, DASH_SPEED: 500
      }
    },
    
    FLASH_EFFECTS: {
      DAMAGE_FLASH_DURATION: 100,
      ENRAGE_FLASH_DURATION: 200,
      ACTIVATION: {
        COLOR: '#4ecdc4',
        DURATION: 300
      },
      TELEPORT: {
        COLOR: '#9b59b6',
        DURATION: 200
      },
      SLAM: {
        COLOR: '#e74c3c',
        DURATION: 250
      },
      DASH_TELEPORT: {
        COLOR: '#f39c12',
        DURATION: 180
      }
    },
    
    PHASES: {
      PHASE_1_HEALTH_THRESHOLD: 0.75,
      PHASE_2_HEALTH_THRESHOLD: 0.50,
      PHASE_3_HEALTH_THRESHOLD: 0.25
    },
    TIMING: {
      ATTACK_COOLDOWN: 1500,
      SPECIAL_ATTACK_COOLDOWN: 3000,
      DASH_COOLDOWN: 2500
    },
    MOVEMENT: {
      BASE_SPEED: 100,
      ENRAGED_SPEED_MULTIPLIER: 1.5
    },
    DETECTION: {
      RANGE: 400,
      ATTACK_RANGE: 80
    },
    DEATH: {
      ANIMATION_DURATION: 2000
    }
  },

  /* ==================== COMBAT CONFIGURATION ==================== */
  
  COMBAT: {
    DEFAULT_HITBOX_DURATION: 100,
    
    DASH_ATTACK: {
      HITBOX_DURATION: 150
    },
    
    HIT_FLASH: {
      COLOR: '#ff6666',
      DURATION: 150
    },
    
    VISUAL_EFFECTS: {
      EXTRA_DURATION: 50,
      PLAYER_COLOR: 'rgba(78, 205, 196, 0.6)',
      ENEMY_COLOR: 'rgba(255, 103, 87, 0.6)'
    },
    
    RAGDOLL: {
      KNOCKBACK_FORCE: {
        MIN: 100,
        MAX: 300
      },
      UPWARD_IMPULSE: {
        MIN: 200,
        MAX: 400
      }
    },
    
    PLAYER: {
      ATTACK_WINDOW: {
        START: 0.2,
        END: 0.8
      },
      DAMAGE: {
        BASE: 20,
        COMBO_MULTIPLIER: 1.2,
        CRITICAL_MULTIPLIER: 2.0,
        CRITICAL_CHANCE: 0.05
      },
      KNOCKBACK: {
        FORCE: 150,
        DURATION: 200
      },
      HITBOX: {
        BASE: {
          WIDTH: 60, HEIGHT: 50,
          OFFSET_X_RIGHT: 30, OFFSET_X_LEFT: -90,
          OFFSET_Y: -25,
          DAMAGE: 20, KNOCKBACK: 100, DURATION: 150
        },
        UP: {
          WIDTH: 50, HEIGHT: 80,
          OFFSET_X_RIGHT: 10, OFFSET_X_LEFT: -60,
          OFFSET_Y: -80,
          DAMAGE: 25, KNOCKBACK: 120, DURATION: 180
        },
        DOWN: {
          WIDTH: 70, HEIGHT: 40,
          OFFSET_X_RIGHT: 20, OFFSET_X_LEFT: -90,
          OFFSET_Y: 10,
          DAMAGE: 30, KNOCKBACK: 150, DURATION: 200
        }
      },
      COMBO: [
        {
          DAMAGE_BONUS: 0, KNOCKBACK_BONUS: 0,
          WIDTH_BONUS: 0, HEIGHT_BONUS: 0,
          OFFSET_X_BONUS: 0, OFFSET_Y_BONUS: 0
        },
        {
          DAMAGE_BONUS: 5, KNOCKBACK_BONUS: 20,
          WIDTH_BONUS: 10, HEIGHT_BONUS: 5,
          OFFSET_X_BONUS: 5, OFFSET_Y_BONUS: 0
        },
        {
          DAMAGE_BONUS: 10, KNOCKBACK_BONUS: 40,
          WIDTH_BONUS: 20, HEIGHT_BONUS: 10,
          OFFSET_X_BONUS: 10, OFFSET_Y_BONUS: 0
        }
      ]
    },
    ENEMY: {
      DAMAGE: {
        BASE: 15,
        VARIANCE: 0.1
      },
      KNOCKBACK: {
        FORCE: 100,
        DURATION: 150
      }
    },
    COLLISION: {
      TOLERANCE: 5,
      OVERLAP_THRESHOLD: 0.5
    },
    STATUS_EFFECTS: {
      POISON: {
        DURATION: 3000,
        DAMAGE_PER_SECOND: 5
      },
      STUN: {
        DURATION: 1000
      }
    }
  },

  /* ==================== ENEMY CONFIGURATION ==================== */
  
  ENEMIES: {
    // Enemy types and their stats
    TYPES: {
      GOBLIN: {
        health: 30,
        speed: 80,
        attackDamage: 15,
        detectionRange: 200,
        attackRange: 40,
        color: '#2ed573'
      },
      ORC: {
        health: 60,
        speed: 60,
        attackDamage: 25,
        detectionRange: 250,
        attackRange: 50,
        color: '#ff4757'
      },
      SHADOW_ASSASSIN: {
        health: 40,
        speed: 120,
        attackDamage: 30,
        detectionRange: 300,
        attackRange: 35,
        color: '#5f27cd'
      },
      ARMORED_KNIGHT: {
        health: 100,
        speed: 40,
        attackDamage: 35,
        detectionRange: 180,
        attackRange: 60,
        color: '#747d8c'
      }
    },
    
    // AI behavior settings
    AI: {
      UPDATE_INTERVAL: 16,     // AI update frequency in ms
      PATROL_DISTANCE: 100,    // Default patrol range
      CHASE_DURATION: 3000,    // How long to chase player
      ATTACK_COOLDOWN: 1500    // Time between attacks
    },
    
    // Default values for all enemies
    DEFAULTS: {
      MAX_HEALTH: 50,
      DAMAGE: 20,
      SPEED: 80,
      ATTACK_RANGE: 40,
      DETECTION_RANGE: 200,
      ATTACK_COOLDOWN: 1500,
      ATTACK_DURATION: 300,
      STUN_DURATION: 500,
      INITIAL_STATE: 'patrol',
      INVULNERABILITY_DURATION: 100,
      DEATH: {
        ANIMATION_DURATION: 1000
      }
    }
  },

  /* ==================== PHYSICS CONFIGURATION ==================== */
  
  PHYSICS: {
    GRAVITY: 980,              // Gravity acceleration
    TIME_SCALE: 1.0,           // Time scaling factor for movement
    MAX_VELOCITY: 1000,        // Maximum velocity
    FRICTION: {
      GROUND: 0.6,             // Ground friction when stopping
      AIR: 0.995               // Air resistance (closer to 1.0 for less drag)
    },
    COLLISION: {
      GROUND_LEVEL: 620,       // Y position of ground
      TOLERANCE: 2,            // Collision detection tolerance
      DEFAULTS: {
        WIDTH: 32,             // Default collision box width
        HEIGHT: 32,            // Default collision box height
        OFFSET_X: 0,           // Default X offset
        OFFSET_Y: 0            // Default Y offset
      }
    },
    RAGDOLL: {
      AIR_RESISTANCE: {
        X: 0.98,
        Y: 0.99
      },
      MAX_BOUNCES: 3,
      BOUNCE_VELOCITY_THRESHOLD: 50,
      BOUNCE_FORCE: 0.6,
      BOUNCE_DECAY: 0.15,
      HORIZONTAL_BOUNCE_DAMPING: 0.8,
      FINAL_SETTLING_DAMPING: 0.85,
      MIN_ROTATION_VELOCITY: 10,
      ROTATION: {
        RIGHT: Math.PI / 2,
        LEFT: -Math.PI / 2,
        DEFAULT: Math.PI / 2
      },
      IMPACT_COLOR_THRESHOLD: 150
    },
    DEAD_ENTITY: {
      SETTLING_DAMPING: 0.95
    }
  },

  /* ==================== COLLISION CONFIGURATION ==================== */
  
  COLLISION: {
    DEFAULTS: {
      WIDTH: 32,             // Default collision box width
      HEIGHT: 32,            // Default collision box height
      OFFSET_X: 0,           // Default X offset
      OFFSET_Y: 0            // Default Y offset
    }
  },

  /* ==================== ROOM SYSTEM CONFIGURATION ==================== */
  
  ROOM_TRANSITION: {
    DURATION: 1500,
    FADE_DURATION: 800,
    PLAYER_ANIMATION_STEPS: 10,
    ANIMATION_STEP_DELAY: 50,
    COOLDOWN: 2000, // Increased to prevent rapid transitions
    FADE_OVERLAY_ID: 'room-transition-overlay',
    FADE_OVERLAY: {
      BACKGROUND: '#000000',
      Z_INDEX: 9999,
      TRANSITION_DURATION: 800
    },
    TIMING: {
      FADE_OUT_WAIT: 500,
      SETUP_WAIT: 200,
      PRE_FADE_IN_WAIT: 300,
      FINAL_CLEANUP: 200,
      // New timing values for optimized transitions
      FADE_OUT_DURATION: 300,
      ENVIRONMENT_SETUP_WAIT: 100,
      PRE_FADE_IN_WAIT_NEW: 100
    },
    HOLE: {
      DEFAULT_RADIUS: 40,
      ROOM_MAPPING: {
        TO_ROOM_2: 2
      }
    },
    FALLING: {
      INITIAL_VELOCITY: 200,
      DURATION: 1200,
      DISTANCE: 100,
      ROTATION_DEGREES: 720,
      FADE_MULTIPLIER: 0.7,
      LANDING_X: 640,  // Center of room 2
      LANDING_Y: 1150, // Ground level for room 2 (updated)
      START_Y: -50,    // Start above screen
      ANIMATION_DURATION: 1000
    },
    CLIMBING: {
      FADE_DURATION: 300,
      EXIT_X: 900,
      EXIT_Y: 580,
      SETUP_WAIT: 100,
      ANIMATION_DURATION: 800
    },
    ANIMATION: {
      EXIT_MOVE_DISTANCE: 50,
      EXIT_DURATION: 600,
      ENTRANCE_STEPS: 10,
      ENTRANCE_EXIT_DISTANCE: 80,
      ENTRANCE_TOTAL_DURATION: 1000,
      ENTRANCE_PHASE1_DURATION: 400
    }
  },
  
  ROOMS: {
    // Grid configuration
    GRID: {
      COLUMNS: 5,
      ROWS: 5,
      TOTAL: 25
    },
    
    // Room size
    SIZE: {
      WIDTH: 1280,
      HEIGHT: 720
    },
    
    // Room types
    TYPES: {
      NORMAL: 'normal',
      BOSS: 'boss',
      TREASURE: 'treasure',
      SPAWN: 'spawn'
    },
    
    // Initial room
    INITIAL_ROOM: 0,
    
    // Map overlay configuration
    MAP: {
      SLOW_MOVEMENT_FACTOR: 0.3,
      OPEN_DELAY: 500,
      CLOSE_DELAY: 300
    },
    
    // Holes configuration
    HOLES: {
      RADIUS: 40,
      GRADIENT_COLORS: {
        OUTER: 'rgba(10, 10, 10, 0.9)',
        MIDDLE: 'rgba(20, 20, 30, 0.7)', 
        INNER: 'rgba(40, 40, 50, 0.3)'
      },
      INNER_COLOR: 'rgba(5, 5, 5, 0.95)',
      RIM_COLOR: 'rgba(100, 80, 60, 0.4)',
      RIM_WIDTH: 2,
      CLIMB_UP: {
        GRADIENT_COLORS: {
          CENTER: 'rgba(255, 255, 200, 0.8)',
          MIDDLE: 'rgba(100, 150, 200, 0.6)',
          EDGE: 'rgba(50, 50, 100, 0.8)'
        },
        BORDER_COLOR: 'rgba(255, 255, 100, 0.9)',
        BORDER_WIDTH: 3
      }
    },
    
    // Platforms configuration
    PLATFORMS: {
      BASE_COLOR: '#4a4a4a',
      HIGHLIGHT_COLOR: '#6a6a6a',
      HIGHLIGHT_HEIGHT: 3,
      SHADOW_COLOR: '#2a2a2a',
      SHADOW_HEIGHT: 3,
      TEXTURE_COLOR: '#3a3a3a',
      TEXTURE_SPACING: 20
    },
    
    // Room definitions - using worldBounds for consistency with NEW_ROOMS
    0: {
      id: 0,
      name: 'Forest Entrance',
      theme: 'forest',
      worldBounds: { x: 0, y: 0, width: 1280, height: 720 },
      backgroundColor: '#1a2e1a',
      groundColor: '#2d4a2d',
      spawnPoint: { x: 100, y: 550 },
      doors: [
        { x: 1240, y: 520, width: 40, height: 100, toRoom: 1, direction: 'east' }
      ],
      enemies: [
        { type: 'goblin', x: 400, y: 570 },
        { type: 'goblin', x: 600, y: 570 }
      ],
      playerSpawnFromWest: { x: 100, y: 550 },
      playerSpawnFromEast: { x: 1180, y: 550 },
      playerEntranceAnimation: {
        startX: 1240,
        y: 550,
        endX: 1180
      }
    },
    1: {
      id: 1,
      name: 'Dark Dungeon',
      theme: 'dungeon',
      worldBounds: { x: 0, y: 0, width: 1280, height: 720 },
      backgroundColor: '#1a1a2e',
      groundColor: '#2d2d4a',
      spawnPoint: { x: 1180, y: 550 },
      doors: [
        { x: 0, y: 520, width: 40, height: 100, toRoom: 0, direction: 'west' }
      ],
      holes: [
        { x: 900, y: 620, radius: 35, toRoom: 2, type: 'fall' }
      ],
      enemies: [
        { type: 'orc', x: 800, y: 570 },
        { type: 'shadow_assassin', x: 400, y: 570 }
      ],
      bosses: [
        { type: 'shadowLord', x: 640, y: 580 }
      ],
      playerSpawnFromWest: { x: 100, y: 550 },
      playerSpawnFromEast: { x: 1180, y: 550 },
      playerSpawnFromClimb: { x: 700, y: 550 }, // Safe spawn when climbing back from cavern
      playerEntranceAnimation: {
        startX: 0,
        y: 550,
        endX: 100
      }
    },
    
    // Transition settings
    TRANSITIONS: {
      FADE_DURATION: 1500,     // Transition fade duration
      PLAYER_ANIMATION_STEPS: 10, // Steps for player entrance/exit
      ANIMATION_STEP_DELAY: 50    // Delay between animation steps
    }
  },

  /* ==================== ASSETS CONFIGURATION ==================== */
  
  ASSETS: {
    BACKGROUND: {
      PLACEHOLDER: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4MCIgaGVpZ2h0PSI3MjAiIHZpZXdCb3g9IjAgMCAxMjgwIDcyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyODAiIGhlaWdodD0iNzIwIiBmaWxsPSIjMGQxMTE3Ii8+CjwvcmVnPgo=',
      ERROR_MESSAGE: 'Failed to load background image, using fallback'
    }
  },
  
  /* ==================== SPRITE CONFIGURATION ==================== */
  
  SPRITE: {
    DEFAULTS: {
      PLACEHOLDER_IMAGE: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjNGE5ZWZmIi8+Cjwvc3ZnPgo=',
      WIDTH: 32,
      HEIGHT: 32,
      OFFSET_X: 0,
      OFFSET_Y: 0,
      INITIAL_ANIMATION: 'idle',
      VISIBLE: true,
      ALPHA: 1.0
    },
    FLASH: {
      DEFAULT_COLOR: '#ffffff',
      DEFAULT_DURATION: 150
    },
    ANIMATION: {
      DEFAULT_FRAME_TIME: 100
    }
  },

  COLORS: {
    BACKGROUND: '#0d1117',
    GROUND: '#2d2d2d',
    PLAYER: {
      DEFAULT: '#4a9eff',
      DEAD: '#666666'
    },
    ENEMY: {
      DEFAULT: '#ff4757',
      CORPSE: '#444444',
      IMPACT: '#ff6666',
      DEATH_FADE: '#888888'
    },
    UI: '#ffffff',
    WORLD: {
      GROUND: '#2d2d2d',
      DOOR_FRAME: '#8b4513',
      DOOR_INTERIOR: '#654321'
    }
  },

  /* ==================== AUDIO CONFIGURATION ==================== */
  
  AUDIO: {
    // Default volume levels (0-100)
    DEFAULT_VOLUMES: {
      MASTER: 50,
      BGM: 30,
      SFX: 100
    },
    
    // Volume aliases
    MASTER_VOLUME: 50,
    BGM_VOLUME: 30,
    SFX_VOLUME: 100,
    
    // Audio file paths
    SOUND_PATHS: {
      jump: 'assets/sounds/jump.wav',
      dash: 'assets/sounds/dash.wav',
      attack: 'assets/sounds/attack.wav',
      parry: 'assets/sounds/parry.wav',
      enemyHit: 'assets/sounds/enemy_hit.wav',
      enemyDeath: 'assets/sounds/enemy_death.ogg',
      playerHit: 'assets/sounds/player_hit.wav',
      bgm: 'assets/sounds/background_music.mp3'
    },
    
    // Audio settings
    SETTINGS: {
      FADE_DURATION: 1000,     // Audio fade in/out duration
      PRELOAD_ALL: true        // Preload all sounds on game start
    },
    
    // Sound names for easy reference
    SOUND_NAMES: {
      JUMP: 'jump',
      DASH: 'dash',
      ATTACK: 'attack',
      PARRY: 'parry',
      ENEMY_HIT: 'enemyHit',
      ENEMY_DEATH: 'enemyDeath',
      PLAYER_HIT: 'playerHit',
      PLAYER_DEATH: 'playerHit', // Reutilizar som existente
      BGM: 'bgm'
    }
  },

  /* ==================== UI CONFIGURATION ==================== */
  
  UI: {
    // HUD element positions and sizes
    HUD: {
      HEALTH_BAR: {
        width: 300,
        height: 25,
        position: { top: 20, left: 20 }
      },
      STAMINA_BAR: {
        width: 250,
        height: 15,
        position: { top: 55, left: 20 }
      }
    },
    
    // Controls hint panel
    CONTROLS: {
      position: { bottom: 20, right: 20 },
      fontSize: 14,
      background: 'rgba(0, 0, 0, 0.8)',
      borderRadius: 8
    },
    
    // FPS display
    FPS_DISPLAY: {
      position: { top: 10, right: 10 },
      width: 260,
      maxHeight: 180,
      fontSize: 9,
      updateInterval: 100     // Update every 100ms
    },
    
    // Map overlay
    MAP: {
      ROOM_SIZE: { width: 80, height: 60 },
      GRID: { columns: 5, rows: 5, gap: 10 },
      COLORS: {
        unexplored: '#222222',
        visited: '#3a506b',
        current: '#fca311',
        boss: '#e71d36'
      }
    },
    
    // Game Over screen
    GAME_OVER: {
      TITLE_COLOR: '#ff4444',
      TITLE_FONT_SIZE: '48px',
      SUBTITLE_FONT_SIZE: '18px'
    },
    
    // Damage numbers
    DAMAGE: {
      FONT_SIZE: '20px',
      FONT_WEIGHT: 'bold',
      TEXT_SHADOW: '2px 2px 4px rgba(0,0,0,0.8)',
      Z_INDEX: 1000,
      DURATION: 1000
    },
    
    // Status messages
    MESSAGES: {
      FONT_SIZE: '24px',
      FONT_WEIGHT: 'bold',
      DURATION: 2000,
      FADE_DURATION: 500
    },
    
    // Animation timing
    ANIMATION: {
      FADE_DURATION: 300,
      SLIDE_DURATION: 400
    },
    
    // Health bar configuration
    HEALTH_BAR: {
      COLORS: {
        HIGH: '#00ff00',     // Green when health is high
        MEDIUM: '#ffff00',   // Yellow when health is medium
        LOW: '#ff0000'       // Red when health is low
      },
      THRESHOLDS: {
        LOW: 0.25,           // Below 25% = low health
        MEDIUM: 0.75         // Below 75% = medium health
      }
    },
    
    // Stamina bar configuration
    STAMINA_BAR: {
      LOW_THRESHOLD: 25,
      LOW_OPACITY: 0.6
    },
    
    // Damage numbers
    DAMAGE_NUMBERS: {
      DEFAULT_COLOR: '#ff6666',
      DURATION: 1000
    },
    
    // UI messages
    MESSAGES: {
      DEFAULT_COLOR: '#ffffff',
      DEFAULT_DURATION: 2000,
      PERMANENT_DURATION: 999999,
      PERMANENT_THRESHOLD: 900000,
      GAME_OVER_COLOR: '#ff6666'
    },
    
    // UI animations
    ANIMATION: {
      FADE_OUT_DURATION: 500,
      FADE_IN_DURATION: 300,
      FLOAT_DISTANCE: '-50px',
      SCALE_START: 0.8,
      SCALE_PEAK: 1.1,
      SCALE_END: 1.0
    }
  },

  /* ==================== INPUT CONFIGURATION ==================== */
  
  INPUT: {
    // Key mappings
    KEYS: {
      // Movement
      MOVE_LEFT: ['KeyA', 'ArrowLeft'],
      MOVE_RIGHT: ['KeyD', 'ArrowRight'],
      JUMP: ['KeyK', 'Space'],
      DASH: ['KeyL'],
      
      // Combat
      ATTACK: ['KeyJ'],
      ATTACK_UP: ['KeyW', 'ArrowUp'],
      ATTACK_DOWN: ['KeyS', 'ArrowDown'],
      
      // UI
      MAP: ['KeyM'],
      DEBUG: ['F3'],
      CHEATS: ['F4'],
      RESTART: ['Space'], // When dead
      
      // Organized movement keys
      MOVEMENT: {
        LEFT: ['KeyA', 'ArrowLeft'],
        RIGHT: ['KeyD', 'ArrowRight'],
        UP: ['KeyW', 'ArrowUp'],
        DOWN: ['KeyS', 'ArrowDown'],
        JUMP: ['KeyK', 'Space'],
        DASH: ['KeyL']
      },
      COMBAT: {
        ATTACK: ['KeyJ']
      }
    },
    
    // Input settings
    SETTINGS: {
      REPEAT_DELAY: 100,       // Key repeat delay
      DOUBLE_TAP_WINDOW: 300   // Double tap detection window
    },
    
    // Mouse settings
    MOUSE: {
      LEFT_BUTTON: 0,
      RIGHT_BUTTON: 2,
      SENSITIVITY: 1.0
    }
  },

  /* ==================== DEBUG CONFIGURATION ==================== */
  
  DEBUG: {
    // Debug mode settings
    ENABLED: false,            // Enable debug mode by default
    SHOW_COLLISION_BOXES: true,
    SHOW_FPS: true,
    SHOW_PERFORMANCE_STATS: true,
    SHOW_ENTITY_COUNT: true,
    
    // Debug rendering settings
    LINE_WIDTH: 2,
    DOOR_LINE_WIDTH: 2,
    
    // Debug text settings
    TEXT: {
      COLOR: '#ffffff',
      FONT: '12px monospace',
      ALIGN: 'left'
    },
    
    // Debug colors
    COLORS: {
      COLLISION_BOX: '#ff0000',
      PLAYER_COLLISION: '#00ff00',
      ENEMY_COLLISION: '#ff6666',
      DOOR_COLLISION: '#ffff00',
      HITBOX: '#ff0000',
      BOSS_INFO: '#ff6666',
      ENEMY_INFO: '#ffaa44'
    },
    
    // Performance thresholds
    PERFORMANCE_THRESHOLDS: {
      FPS_WARNING: 45,         // Warn if FPS drops below this
      FPS_CRITICAL: 30,        // Critical FPS level
      FRAME_TIME_WARNING: 16.67 // Warn if frame time exceeds this (60fps)
    }
  },

  /* ==================== MAP SYSTEM CONFIGURATION ==================== */
  
  MAP: {
    UI: {
      BACKGROUND_SHADOW: {
        BACKGROUND: 'rgba(0, 0, 0, 0.8)',
        Z_INDEX: 1000,
        TRANSITION_DURATION: 300
      },
      OVERLAY: {
        INITIAL_SCALE: 0.95,
        WIDTH: 600,
        HEIGHT: 400,
        BACKGROUND: 'rgba(20, 20, 30, 0.95)',
        BORDER_WIDTH: 2,
        BORDER_COLOR: '#4a5568',
        BORDER_RADIUS: 8,
        Z_INDEX: 1001,
        FONT_FAMILY: 'monospace',
        BOX_SHADOW: '0 10px 30px rgba(0, 0, 0, 0.8)',
        TRANSITION_DURATION: 300
      },
      CANVAS: {
        WIDTH: 560,
        HEIGHT: 320,
        OFFSET_TOP: 20,
        OFFSET_LEFT: 20,
        RENDERING: 'pixelated'
      }
    },
    COLORS: {
      BACKGROUND: '#1a1a2e',
      CURRENT_ROOM: '#fca311',
      VISITED_ROOM: '#3a506b',
      ROOM_THEMES: {
        FOREST: '#2d5016',
        DUNGEON: '#2c1810',
        CEMETERY: '#1a1a2e',
        SANCTUARY: '#1a2e2e',
        CAVE: '#1a1a1a',
        DEFAULT: '#2a2a3a'
      }
    },
    ROOM_LAYOUT: {
      WIDTH: 80,
      HEIGHT: 60,
      START_X: 50,
      START_Y: 50,
      BORDER: {
        NORMAL_WIDTH: 1,
        CURRENT_WIDTH: 3
      }
    },
    PLAYER_DOT: {
      COLOR: '#ffffff',
      RADIUS: 3
    },
    TEXT: {
      ROOM_NAME: {
        COLOR: '#ffffff',
        FONT: '12px monospace',
        ALIGN: 'center',
        OFFSET_Y: -10
      },
      INFO: {
        COLOR: '#cccccc',
        FONT: '14px monospace',
        ALIGN: 'center',
        X: 280,
        Y: 350,
        MESSAGE: 'Hold M to view map'
      }
    },
    CONNECTIONS: {
      COLOR: '#666666',
      WIDTH: 2
    }
  },

  /* ==================== STORAGE CONFIGURATION ==================== */
  
  STORAGE: {
    // LocalStorage keys
    KEYS: {
      MASTER_VOLUME: 'shadowknight-master-volume',
      BGM_VOLUME: 'shadowknight-bgm-volume',
      SFX_VOLUME: 'shadowknight-sfx-volume',
      RESOLUTION: 'shadowknight-resolution',
      GAME_PROGRESS: 'shadowknight-progress',
      SETTINGS: 'shadowknight-settings'
    },
    
    // Storage settings
    SETTINGS: {
      AUTO_SAVE: true,
      SAVE_INTERVAL: 30000,    // Auto-save every 30 seconds
      MAX_SAVE_SLOTS: 3
    }
  },

  /* ==================== ANIMATION CONFIGURATION ==================== */
  
  ANIMATION: {
    // Default animation settings
    DEFAULT_FRAME_TIME: 100,   // Default frame duration in ms
    
    // Player animations
    PLAYER: {
      IDLE: { name: 'idle', frames: [0], frameTime: 300, loop: true },
      RUN: { name: 'run', frames: [0, 1, 2, 3], frameTime: 150, loop: true },
      JUMP: { name: 'jump', frames: [4], frameTime: 100, loop: false },
      FALL: { name: 'fall', frames: [5], frameTime: 100, loop: false },
      ATTACK: { name: 'attack', frames: [6, 7, 8], frameTime: 100, loop: false },
      DASH: { name: 'dash', frames: [9], frameTime: 50, loop: false }
    },
    
    // Enemy animations
    ENEMY: {
      IDLE: { name: 'idle', frames: [0], frameTime: 300, loop: true },
      WALK: { name: 'walk', frames: [0, 1], frameTime: 200, loop: true },
      RUN: { name: 'run', frames: [0, 1, 2], frameTime: 150, loop: true },
      ATTACK: { name: 'attack', frames: [3], frameTime: 100, loop: false }
    }
  },

  /* ==================== CHEAT CONFIGURATION ==================== */
  
  CHEATS: {
    // Available cheats
    AVAILABLE: {
      INFINITE_HEALTH: false,
      INFINITE_STAMINA: false,
      ONE_HIT_KILLS: false,
      NO_CLIP: false,
      SPEED_BOOST: false
    },
    
    // Cheat multipliers
    MULTIPLIERS: {
      SPEED_BOOST: 2.0,
      DAMAGE_BOOST: 10.0
    }
  },

  /* ==================== SAVE SYSTEM ==================== */
  
  SAVE_SYSTEM: {
    // Save file configuration
    SAVE_FILE_VERSION: '1.0.0',
    MAX_SAVE_SLOTS: 3,
    AUTO_SAVE_INTERVAL: 300000, // 5 minutes in milliseconds
    
    // Save protection
    SAVE_PROTECTION: {
      VALIDATION_TIMEOUT: 5000, // 5 seconds
      CORRUPTION_BACKUP_COUNT: 3,
      ENCRYPTION_ENABLED: false // Could be enabled for security
    },
    
    // Save data structure
    SAVE_DATA_KEYS: {
      PLAYER_STATS: 'playerStats',
      GAME_PROGRESS: 'gameProgress', 
      WORLD_STATE: 'worldState',
      PLAYTIME: 'playtime',
      STATISTICS: 'statistics',
      SETTINGS: 'settings'
    },
    
    // Save locations (rest areas)
    REST_AREAS: {
      0: { name: 'Forest Shrine', description: 'A peaceful grove where knights rest.' },
      2: { name: 'Ancient Bonfire', description: 'Warmth flickers in the darkness.' },
      5: { name: 'Crystal Sanctuary', description: 'Mystical energy rejuvenates the soul.' }
    }
  },

  /* ==================== PAUSE SYSTEM ==================== */
  
  PAUSE_SYSTEM: {
    // Pause menu configuration
    OVERLAY: {
      BACKGROUND: 'rgba(0, 0, 0, 0.8)',
      Z_INDEX: 9999,
      TRANSITION_DURATION: 300
    },
    
    // Pause menu options
    MENU_ITEMS: [
      { id: 'resume', text: 'Resume Game', action: 'resume' },
      { id: 'save', text: 'Save Game', action: 'save', requiresRestArea: true },
      { id: 'settings', text: 'Settings', action: 'settings' },
      { id: 'mainMenu', text: 'Main Menu', action: 'mainMenu', confirmation: true }
    ],
    
    // Key bindings
    KEYS: {
      PAUSE: ['Escape', 'KeyP'],
      CONFIRM: ['Enter', 'Space'],
      CANCEL: ['Escape']
    }
  },

  /* ==================== STATISTICS TRACKING ==================== */
  
  STATISTICS: {
    // Player performance tracking
    COMBAT: {
      ENEMIES_KILLED: 'enemiesKilled',
      BOSSES_DEFEATED: 'bossesDefeated', 
      DAMAGE_DEALT: 'damageDealt',
      DAMAGE_TAKEN: 'damageTaken',
      DEATHS: 'deaths',
      PERFECT_PARRIES: 'perfectParries'
    },
    
    // Exploration tracking
    EXPLORATION: {
      ROOMS_DISCOVERED: 'roomsDiscovered',
      SECRETS_FOUND: 'secretsFound',
      DISTANCE_TRAVELED: 'distanceTraveled',
      JUMPS_MADE: 'jumpsMade',
      DASHES_USED: 'dashesUsed'
    },
    
    // Time tracking
    TIME: {
      TOTAL_PLAYTIME: 'totalPlaytime',
      LEVEL_COMPLETION_TIME: 'levelCompletionTime',
      FASTEST_BOSS_KILL: 'fastestBossKill',
      SESSION_START: 'sessionStart'
    }
  },

  /* ==================== NEW ROOMS CONFIGURATION ==================== */
  
  NEW_ROOMS: {
    2: {
      id: 2,
      name: "Underground Cavern",
      theme: "cave",
      type: "vertical", // Special type for hole/pit areas
      worldBounds: { x: 0, y: 0, width: 1280, height: 1440 }, // Taller room
      backgroundColor: '#1a1a2e',
      groundColor: '#2d2d4a',
      
      // Custom ground level for this room (different from global)
      customGroundLevel: 1200,
      
      // Underground cavern - accessed via hole from room 1
      holes: [
        { x: 900, y: 1200, radius: 40, toRoom: 1, type: 'climb_up' }
      ],
      
      enemies: [
        { type: 'bat', x: 400, y: 1170 },
        { type: 'spider', x: 600, y: 1170 }
      ],
      
      // Special spawn for hole entry - on the ground level
      playerSpawnFromHole: { x: 640, y: 1150 },
      playerSpawnFromClimb: { x: 150, y: 1150 },
      
      // Collectibles/secrets
      secrets: [
        { type: 'crystal', x: 850, y: 350, value: 50 }
      ]
    },
    
    3: {
      id: 3,
      name: "Moonlit Cemetery",
      theme: "cemetery", 
      worldBounds: { x: 0, y: 0, width: 1280, height: 720 },
      backgroundColor: '#0f0f23',
      groundColor: '#2a2a3a',
      
      doors: [
        { x: 0, y: 520, width: 60, height: 100, toRoom: 1, direction: "west" },
        { x: 1220, y: 520, width: 60, height: 100, toRoom: 4, direction: "east" }
      ],
      
      // Environmental storytelling
      tombstones: [
        { x: 200, y: 580, text: "Here lies Sir Gareth\nA noble knight" },
        { x: 400, y: 590, text: "In memory of\nthe fallen" },
        { x: 800, y: 575, text: "Rest in peace\nBrave souls" }
      ],
      
      enemies: [
        { type: 'skeleton', x: 300, y: 600 },
        { type: 'ghost', x: 700, y: 580 },
        { type: 'skeleton', x: 1000, y: 600 }
      ],
      
      // Atmospheric elements
      moonlight: { intensity: 0.7, color: '#b8c6db' },
      fog: { density: 0.3, speed: 0.5 },
      
      playerSpawnFromWest: { x: 100, y: 570 },
      playerSpawnFromEast: { x: 1180, y: 570 },
      playerEntranceAnimation: { startX: 30, endX: 100, y: 570 }
    },
    
    4: {
      id: 4,
      name: "Crystal Sanctuary", 
      theme: "sanctuary",
      type: "rest_area", // Special type for save points
      worldBounds: { x: 0, y: 0, width: 1280, height: 720 },
      backgroundColor: '#1a2e2e',
      groundColor: '#2d4a4a',
      
      doors: [
        { x: 0, y: 520, width: 60, height: 100, toRoom: 3, direction: "west" },
        { x: 1220, y: 520, width: 60, height: 100, toRoom: 5, direction: "east" }
      ],
      
      // Rest area elements
      restPoint: {
        x: 640, y: 550,
        radius: 80,
        effect: 'healing_crystal',
        description: 'A mystical crystal radiates peaceful energy.'
      },
      
      // NPC for narrative
      npc: {
        x: 500, y: 580,
        name: "Ancient Spirit",
        dialogue: [
          "Welcome, weary traveler...",
          "This sanctuary offers respite from your journey.",
          "Rest here, and your progress shall be preserved.",
          "The crystal's light will guide you safely."
        ],
        sprite: 'spirit'
      },
      
      // No enemies in rest areas
      enemies: [],
      
      // Healing properties
      healing: {
        rate: 20, // HP per second
        stamina_rate: 30, // Stamina per second
        full_heal_time: 3000 // 3 seconds for full heal
      },
      
      // Atmospheric crystals
      crystals: [
        { x: 300, y: 400, size: 'small', color: '#4ecdc4' },
        { x: 980, y: 450, size: 'medium', color: '#44a08d' },
        { x: 640, y: 300, size: 'large', color: '#96c93d' }
      ],
      
      playerSpawnFromWest: { x: 100, y: 570 },
      playerSpawnFromEast: { x: 1180, y: 570 },
      playerEntranceAnimation: { startX: 30, endX: 100, y: 570 }
    }
  }
};

/* ==================== ENVIRONMENT DETECTION ==================== */

// Detect if running in development mode
export const isDevelopment = () => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname === '';
};

// Get current environment settings
export const getEnvironmentConfig = () => {
  const env = isDevelopment() ? 'development' : 'production';
  
  return {
    environment: env,
    debug: env === 'development' ? GameConfig.DEBUG : { ...GameConfig.DEBUG, ENABLED: false },
    logging: env === 'development'
  };
};

/* ==================== VALIDATION HELPERS ==================== */

// Validate configuration object
export const validateConfig = () => {
  const errors = [];
  
  // Validate required properties
  if (!GameConfig.GAME.WIDTH || !GameConfig.GAME.HEIGHT) {
    errors.push('Game dimensions must be defined');
  }
  
  if (!GameConfig.PLAYER.MOVEMENT.SPEED) {
    errors.push('Player movement speed must be defined');
  }
  
  // Validate resolution options
  Object.values(GameConfig.RESOLUTION.OPTIONS).forEach(option => {
    if (!option.width || !option.height || !option.scale) {
      errors.push(`Invalid resolution option: ${option.label}`);
    }
  });
  
  if (errors.length > 0) {
    console.error('Configuration validation failed:', errors);
    return false;
  }
  
  return true;
};

// Export default configuration
export default GameConfig;