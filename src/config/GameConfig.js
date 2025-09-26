/* ===================================
   GAME CONFIGURATION - SHADOW KNIGHT
   ===================================
   Centralized configuration object containing all game constants,
   settings, and configurable values for easy maintenance.
*/

export const GameConfig = {
  
  /* ==================== CORE GAME SETTINGS ==================== */
  
  GAME: {
    // Core game dimensions (internal resolution)
    WIDTH: 1280,
    HEIGHT: 720,
    ASPECT_RATIO: 16 / 9,
    TARGET_FPS: 60,
    MAX_DELTA_TIME: 100, // Maximum delta time to prevent huge jumps
    
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

  /* ==================== PLAYER CONFIGURATION ==================== */
  
  PLAYER: {
    // Movement settings
    MOVEMENT: {
      SPEED: 300,              // Horizontal movement speed
      JUMP_POWER: 500,         // Initial jump velocity
      DASH_SPEED: 800,         // Dash movement speed
      DASH_DURATION: 200,      // Dash duration in ms
      DASH_COOLDOWN: 500       // Cooldown between dashes
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
      ATTACK_DURATION: 300,
      ATTACK_COOLDOWN: 500,
      COMBO_WINDOW: 800,      // Time window for combo attacks
      MAX_COMBO_COUNT: 3
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
    }
  },

  /* ==================== PHYSICS CONFIGURATION ==================== */
  
  PHYSICS: {
    GRAVITY: 980,              // Gravity acceleration
    FRICTION: {
      GROUND: 0.6,             // Ground friction when stopping
      AIR: 0.98                // Air resistance
    },
    COLLISION: {
      GROUND_LEVEL: 620,       // Y position of ground
      TOLERANCE: 2             // Collision detection tolerance
    }
  },

  /* ==================== ROOM SYSTEM CONFIGURATION ==================== */
  
  ROOMS: {
    // Room definitions
    DEFINITIONS: {
      FOREST_ENTRANCE: {
        id: 0,
        name: 'Forest Entrance',
        theme: 'forest',
        bounds: { x: 0, y: 0, width: 1280, height: 720 },
        spawnPoint: { x: 100, y: 550 },
        doors: [
          { side: 'right', x: 1240, y: 520, width: 40, height: 100, targetRoom: 1, targetSpawn: 'left' }
        ],
        enemies: [
          { type: 'goblin', x: 400, y: 570 },
          { type: 'goblin', x: 600, y: 570 }
        ]
      },
      DARK_DUNGEON: {
        id: 1,
        name: 'Dark Dungeon',
        theme: 'dungeon',
        bounds: { x: 0, y: 0, width: 1280, height: 720 },
        spawnPoint: { x: 1180, y: 550 },
        doors: [
          { side: 'left', x: 0, y: 520, width: 40, height: 100, targetRoom: 0, targetSpawn: 'right' }
        ],
        enemies: [
          { type: 'orc', x: 800, y: 570 },
          { type: 'shadow_assassin', x: 400, y: 570 }
        ],
        bosses: [
          { type: 'shadowLord', x: 2400, y: 580 }
        ]
      }
    },
    
    // Transition settings
    TRANSITIONS: {
      FADE_DURATION: 1500,     // Transition fade duration
      PLAYER_ANIMATION_STEPS: 10, // Steps for player entrance/exit
      ANIMATION_STEP_DELAY: 50    // Delay between animation steps
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
    
    // Audio file paths
    SOUND_PATHS: {
      jump: 'assets/sounds/jump.wav',
      dash: 'assets/sounds/dash.wav',
      attack: 'assets/sounds/attack.wav',
      parry: 'assets/sounds/parry.wav',
      enemyHit: 'assets/sounds/enemy_hit.wav',
      enemyDeath: 'assets/sounds/enemy_death.wav',
      playerHit: 'assets/sounds/player_hit.wav',
      bgm: 'assets/sounds/background_music.mp3'
    },
    
    // Audio settings
    SETTINGS: {
      FADE_DURATION: 1000,     // Audio fade in/out duration
      PRELOAD_ALL: true        // Preload all sounds on game start
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
      RESTART: ['Space'] // When dead
    },
    
    // Input settings
    SETTINGS: {
      REPEAT_DELAY: 100,       // Key repeat delay
      DOUBLE_TAP_WINDOW: 300   // Double tap detection window
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
    
    // Debug colors
    COLORS: {
      COLLISION_BOX: '#ff0000',
      PLAYER_COLLISION: '#00ff00',
      ENEMY_COLLISION: '#ff6666',
      DOOR_COLLISION: '#ffff00'
    },
    
    // Performance thresholds
    PERFORMANCE_THRESHOLDS: {
      FPS_WARNING: 45,         // Warn if FPS drops below this
      FPS_CRITICAL: 30,        // Critical FPS level
      FRAME_TIME_WARNING: 16.67 // Warn if frame time exceeds this (60fps)
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
      IDLE: { frames: [0], frameTime: 300, loop: true },
      RUN: { frames: [0, 1, 2, 3], frameTime: 150, loop: true },
      JUMP: { frames: [4], frameTime: 100, loop: false },
      FALL: { frames: [5], frameTime: 100, loop: false },
      ATTACK: { frames: [6, 7, 8], frameTime: 100, loop: false },
      DASH: { frames: [9], frameTime: 50, loop: false }
    },
    
    // Enemy animations
    ENEMY: {
      IDLE: { frames: [0], frameTime: 300, loop: true },
      WALK: { frames: [0, 1], frameTime: 200, loop: true },
      RUN: { frames: [0, 1, 2], frameTime: 150, loop: true },
      ATTACK: { frames: [3], frameTime: 100, loop: false }
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