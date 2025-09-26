/* ===================================
   AUDIO CONFIGURATION - SHADOW KNIGHT
   ===================================
   Centralized audio system configuration including volume management,
   sound paths, and audio-related constants.
*/

import { GameConfig } from './GameConfig.js';

export const AudioConfig = {

  /* ==================== VOLUME MANAGEMENT ==================== */
  
  VOLUME: {
    // Default volume levels (0-1 range for Web Audio API)
    DEFAULTS: {
      MASTER: GameConfig.AUDIO.DEFAULT_VOLUMES.MASTER / 100,
      BGM: GameConfig.AUDIO.DEFAULT_VOLUMES.BGM / 100,
      SFX: GameConfig.AUDIO.DEFAULT_VOLUMES.SFX / 100
    },
    
    // Volume ranges and validation
    MIN: 0,
    MAX: 1,
    STEP: 0.01,
    
    // Volume curve types for better audio perception
    CURVES: {
      LINEAR: 'linear',
      EXPONENTIAL: 'exponential',
      LOGARITHMIC: 'logarithmic'
    },
    
    // Default curve for different audio types
    DEFAULT_CURVE: {
      MASTER: 'exponential',
      BGM: 'logarithmic',
      SFX: 'linear'
    }
  },

  /* ==================== SOUND CATEGORIES ==================== */
  
  CATEGORIES: {
    // Background music
    BGM: {
      name: 'Background Music',
      maxConcurrent: 1,
      fadeTime: 2000,
      loop: true,
      volume: 0.3
    },
    
    // Sound effects
    SFX: {
      name: 'Sound Effects',
      maxConcurrent: 8,
      fadeTime: 0,
      loop: false,
      volume: 1.0
    },
    
    // UI sounds
    UI: {
      name: 'User Interface',
      maxConcurrent: 4,
      fadeTime: 100,
      loop: false,
      volume: 0.8
    },
    
    // Ambient sounds
    AMBIENT: {
      name: 'Ambient',
      maxConcurrent: 3,
      fadeTime: 1000,
      loop: true,
      volume: 0.5
    }
  },

  /* ==================== SOUND DEFINITIONS ==================== */
  
  SOUNDS: {
    // Player actions
    PLAYER: {
      JUMP: {
        path: GameConfig.AUDIO.SOUND_PATHS.jump,
        category: 'SFX',
        volume: 0.6,
        pitch: 1.0,
        variants: 1
      },
      DASH: {
        path: GameConfig.AUDIO.SOUND_PATHS.dash,
        category: 'SFX',
        volume: 0.7,
        pitch: 1.0,
        variants: 1
      },
      ATTACK: {
        path: GameConfig.AUDIO.SOUND_PATHS.attack,
        category: 'SFX',
        volume: 0.8,
        pitch: 1.0,
        variants: 1
      },
      PARRY: {
        path: GameConfig.AUDIO.SOUND_PATHS.parry,
        category: 'SFX',
        volume: 0.9,
        pitch: 1.0,
        variants: 1
      },
      HIT: {
        path: GameConfig.AUDIO.SOUND_PATHS.playerHit,
        category: 'SFX',
        volume: 0.8,
        pitch: 1.0,
        variants: 1
      }
    },
    
    // Enemy sounds
    ENEMY: {
      HIT: {
        path: GameConfig.AUDIO.SOUND_PATHS.enemyHit,
        category: 'SFX',
        volume: 0.7,
        pitch: 1.0,
        variants: 1
      },
      DEATH: {
        path: GameConfig.AUDIO.SOUND_PATHS.enemyDeath,
        category: 'SFX',
        volume: 0.8,
        pitch: 1.0,
        variants: 1
      }
    },
    
    // Background music
    MUSIC: {
      MAIN_THEME: {
        path: GameConfig.AUDIO.SOUND_PATHS.bgm,
        category: 'BGM',
        volume: 1.0,
        pitch: 1.0,
        variants: 1
      }
    },
    
    // UI sounds (future expansion)
    UI: {
      MENU_SELECT: {
        path: 'assets/sounds/ui/menu_select.wav',
        category: 'UI',
        volume: 0.5,
        pitch: 1.0,
        variants: 1
      },
      MENU_CONFIRM: {
        path: 'assets/sounds/ui/menu_confirm.wav',
        category: 'UI',
        volume: 0.6,
        pitch: 1.0,
        variants: 1
      }
    }
  },

  /* ==================== AUDIO PROCESSING ==================== */
  
  PROCESSING: {
    // Audio context settings
    CONTEXT: {
      sampleRate: 44100,
      latencyHint: 'interactive'
    },
    
    // Audio buffer settings
    BUFFER: {
      size: 4096,
      channels: 2
    },
    
    // Audio effects
    EFFECTS: {
      REVERB: {
        enabled: false,
        roomSize: 0.3,
        damping: 0.5,
        wetness: 0.2
      },
      
      COMPRESSION: {
        enabled: true,
        threshold: -24,
        ratio: 3,
        attack: 0.003,
        release: 0.1
      },
      
      LIMITER: {
        enabled: true,
        threshold: -3,
        release: 0.05
      }
    }
  },

  /* ==================== SPATIAL AUDIO ==================== */
  
  SPATIAL: {
    // 3D audio settings (for future expansion)
    ENABLED: false,
    
    // Distance attenuation
    DISTANCE: {
      model: 'inverse',
      maxDistance: 1000,
      rolloffFactor: 1,
      refDistance: 1
    },
    
    // Doppler effect
    DOPPLER: {
      enabled: false,
      factor: 1,
      speedOfSound: 343.3
    }
  },

  /* ==================== PERFORMANCE SETTINGS ==================== */
  
  PERFORMANCE: {
    // Audio streaming
    STREAMING: {
      enabled: true,
      chunkSize: 1024,
      preloadTime: 2000
    },
    
    // Audio pooling
    POOLING: {
      enabled: true,
      maxPoolSize: 10,
      preloadCount: 3
    },
    
    // Audio quality settings
    QUALITY: {
      bitRate: 128, // kbps
      compression: 'mp3',
      fallbackFormat: 'wav'
    }
  },

  /* ==================== STORAGE KEYS ==================== */
  
  STORAGE_KEYS: {
    MASTER_VOLUME: GameConfig.STORAGE.KEYS.MASTER_VOLUME,
    BGM_VOLUME: GameConfig.STORAGE.KEYS.BGM_VOLUME,
    SFX_VOLUME: GameConfig.STORAGE.KEYS.SFX_VOLUME,
    AUDIO_SETTINGS: 'shadowknight-audio-settings'
  },

  /* ==================== ERROR HANDLING ==================== */
  
  ERRORS: {
    MESSAGES: {
      CONTEXT_FAILED: 'Failed to create audio context',
      LOAD_FAILED: 'Failed to load audio file',
      DECODE_FAILED: 'Failed to decode audio data',
      PLAY_FAILED: 'Failed to play audio',
      UNSUPPORTED_FORMAT: 'Audio format not supported'
    },
    
    RETRY: {
      maxAttempts: 3,
      delay: 1000,
      exponentialBackoff: true
    }
  }
};

/* ==================== AUDIO UTILITY FUNCTIONS ==================== */

export const AudioUtils = {
  
  // Convert percentage (0-100) to audio volume (0-1)
  percentageToVolume: (percentage) => {
    return Math.max(0, Math.min(1, percentage / 100));
  },
  
  // Convert audio volume (0-1) to percentage (0-100)
  volumeToPercentage: (volume) => {
    return Math.round(Math.max(0, Math.min(100, volume * 100)));
  },
  
  // Apply volume curve for better audio perception
  applyVolumeCurve: (volume, curve = 'linear') => {
    switch (curve) {
      case 'exponential':
        return Math.pow(volume, 2);
      case 'logarithmic':
        return Math.log10(volume * 9 + 1);
      case 'linear':
      default:
        return volume;
    }
  },
  
  // Calculate distance-based volume attenuation
  calculateDistanceVolume: (distance, maxDistance = 1000) => {
    if (distance >= maxDistance) return 0;
    return 1 - (distance / maxDistance);
  },
  
  // Generate random pitch variation
  generatePitchVariation: (basePitch = 1.0, variation = 0.1) => {
    const randomFactor = (Math.random() - 0.5) * 2 * variation;
    return Math.max(0.5, Math.min(2.0, basePitch + randomFactor));
  },
  
  // Validate audio format support
  isFormatSupported: (format) => {
    const audio = new Audio();
    return audio.canPlayType(`audio/${format}`) !== '';
  },
  
  // Get best supported audio format
  getBestFormat: (formats = ['mp3', 'wav', 'ogg']) => {
    return formats.find(format => AudioUtils.isFormatSupported(format)) || 'wav';
  }
};

/* ==================== AUDIO EVENTS ==================== */

export const AudioEvents = {
  // Audio system events
  CONTEXT_CREATED: 'audio:contextCreated',
  CONTEXT_RESUMED: 'audio:contextResumed',
  CONTEXT_SUSPENDED: 'audio:contextSuspended',
  
  // Sound events
  SOUND_LOADED: 'audio:soundLoaded',
  SOUND_PLAYING: 'audio:soundPlaying',
  SOUND_PAUSED: 'audio:soundPaused',
  SOUND_STOPPED: 'audio:soundStopped',
  SOUND_ENDED: 'audio:soundEnded',
  
  // Volume events
  VOLUME_CHANGED: 'audio:volumeChanged',
  MUTE_TOGGLED: 'audio:muteToggled',
  
  // Error events
  LOAD_ERROR: 'audio:loadError',
  PLAY_ERROR: 'audio:playError',
  CONTEXT_ERROR: 'audio:contextError'
};

export default AudioConfig;