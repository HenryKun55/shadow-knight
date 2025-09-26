/* ===================================
   UI CONSTANTS - SHADOW KNIGHT
   ===================================
   Centralized UI element selectors, class names, and DOM manipulation
   constants for consistent UI management across the application.
*/

export const UIConstants = {

  /* ==================== DOM ELEMENT SELECTORS ==================== */
  
  SELECTORS: {
    // Main containers
    GAME_CONTAINER: '#game-container',
    GAME_CANVAS: '#game-canvas',
    
    // Menu screens
    LOADING_SCREEN: '#loading-screen',
    MAIN_MENU: '#main-menu',
    SETTINGS_MODAL: '#settings-modal',
    CHEAT_MENU: '#cheat-menu',
    
    // UI overlays
    UI_OVERLAY: '#ui-overlay',
    MAP_OVERLAY: '#map-overlay',
    MAP_GRID: '#map-grid',
    
    // HUD elements
    HUD: '#hud',
    HEALTH_BAR: '.health-bar',
    HEALTH_FILL: '#health-fill',
    HEALTH_TEXT: '#health-text',
    STAMINA_BAR: '.stamina-bar',
    STAMINA_FILL: '#stamina-fill',
    
    // Controls and info
    CONTROLS_HINT: '#controls-hint',
    FPS_DISPLAY: '#fps-display',
    
    // Buttons
    START_BUTTON: '#start-button',
    SETTINGS_BUTTON: '#settings-button',
    CLOSE_SETTINGS_BUTTON: '#close-settings-button',
    
    // Form elements
    MASTER_VOLUME_INPUT: '#master-volume-input',
    BGM_VOLUME_INPUT: '#bgm-volume-input',
    SFX_VOLUME_INPUT: '#sfx-volume-input',
    RESOLUTION_BUTTONS: '.resolution-btn',
    
    // Cheat checkboxes
    INFINITE_HEALTH_CHECKBOX: '#infinite-health',
    INFINITE_STAMINA_CHECKBOX: '#infinite-stamina',
    ONE_HIT_KILLS_CHECKBOX: '#one-hit-kills'
  },

  /* ==================== CSS CLASS NAMES ==================== */
  
  CLASSES: {
    // State classes
    HIDDEN: 'hidden',
    ACTIVE: 'active',
    DISABLED: 'disabled',
    MODAL_OPEN: 'modal-open',
    
    // Component classes
    MODAL: 'modal',
    MODAL_CONTENT: 'modal-content',
    MENU_BUTTON: 'menu-button',
    VOLUME_BUTTON: 'volume-btn',
    VOLUME_CONTROL: 'volume-control',
    VOLUME_INPUT: 'volume-input',
    RESOLUTION_BUTTON: 'resolution-btn',
    RESOLUTION_BUTTONS_CONTAINER: 'resolution-buttons',
    SETTING: 'setting',
    RESOLUTION_SETTING: 'resolution-setting',
    
    // Map classes
    MAP_ROOM: 'map-room',
    MAP_ROOM_UNEXPLORED: 'unexplored',
    MAP_ROOM_VISITED: 'visited',
    MAP_ROOM_CURRENT: 'current',
    MAP_ROOM_BOSS: 'boss',
    
    // UI state classes
    HEALTH_FILL: 'health-fill',
    STAMINA_FILL: 'stamina-fill',
    HEALTH_TEXT: 'health-text'
  },

  /* ==================== UI TEXT CONSTANTS ==================== */
  
  TEXT: {
    // Game title and branding
    GAME_TITLE: 'Shadow Knight',
    GAME_SUBTITLE: 'Mechanically Delicious 2D Action',
    
    // Menu text
    START_BUTTON: 'Start Game',
    SETTINGS_BUTTON: 'Settings',
    CLOSE_BUTTON: 'Close',
    
    // Settings labels
    MASTER_VOLUME_LABEL: 'Master Volume',
    BGM_VOLUME_LABEL: 'BGM Volume',
    SFX_VOLUME_LABEL: 'SFX Volume',
    SCREEN_RESOLUTION_LABEL: 'Screen Resolution',
    
    // Resolution options
    RESOLUTION_HD: 'HD',
    RESOLUTION_HD_PLUS: 'HD+',
    RESOLUTION_FHD: 'FHD',
    RESOLUTION_2K: '2K',
    RESOLUTION_4K: '4K',
    
    // Cheat labels
    INFINITE_HEALTH_LABEL: 'Infinite Health',
    INFINITE_STAMINA_LABEL: 'Infinite Stamina',
    ONE_HIT_KILLS_LABEL: 'One-Hit Kills',
    
    // Control hints
    CONTROLS_HINT: {
      MOVE: 'WASD/Arrow Keys: Move',
      JUMP: 'K: Jump',
      DASH: 'L: Dash',
      ATTACK: 'J: Attack',
      MAP: 'M: Map',
      DEBUG: 'F3: Debug Mode',
      CHEATS: 'F4: Toggle Cheats'
    },
    
    // Loading and status messages
    LOADING_MESSAGE: 'Loading Shadow Knight...',
    GAME_OVER_MESSAGE: 'Game Over - Press Space to Restart',
    
    // Error messages
    ERROR_AUDIO_LOAD: 'Failed to load audio files',
    ERROR_GAME_INIT: 'Failed to initialize game',
    ERROR_SAVE_DATA: 'Failed to save game data'
  },

  /* ==================== UI ANIMATION CONSTANTS ==================== */
  
  ANIMATIONS: {
    // Fade animations
    FADE_IN_DURATION: 800,
    FADE_OUT_DURATION: 800,
    GAME_START_FADE_DURATION: 1500,
    
    // UI transitions
    MODAL_TRANSITION_DURATION: 300,
    BUTTON_HOVER_DURATION: 200,
    HEALTH_BAR_TRANSITION: 300,
    STAMINA_BAR_TRANSITION: 200,
    
    // Map animations
    MAP_FADE_DURATION: 400,
    MAP_SCALE_DURATION: 300,
    
    // FPS display
    FPS_UPDATE_INTERVAL: 100
  },

  /* ==================== RESOLUTION CONFIGURATION ==================== */
  
  RESOLUTIONS: {
    HD: {
      key: '1280x720',
      label: 'HD',
      width: 1280,
      height: 720,
      displayName: '1280x720 (HD)'
    },
    HD_PLUS: {
      key: '1600x900',
      label: 'HD+',
      width: 1600,
      height: 900,
      displayName: '1600x900 (HD+)'
    },
    FULL_HD: {
      key: '1920x1080',
      label: 'FHD',
      width: 1920,
      height: 1080,
      displayName: '1920x1080 (Full HD)'
    },
    QHD_2K: {
      key: '2560x1440',
      label: '2K',
      width: 2560,
      height: 1440,
      displayName: '2560x1440 (2K)'
    },
    UHD_4K: {
      key: '3840x2160',
      label: '4K',
      width: 3840,
      height: 2160,
      displayName: '3840x2160 (4K)'
    }
  },

  /* ==================== EVENT TYPES ==================== */
  
  EVENTS: {
    // DOM events
    CLICK: 'click',
    CHANGE: 'change',
    INPUT: 'input',
    KEYDOWN: 'keydown',
    KEYUP: 'keyup',
    RESIZE: 'resize',
    LOAD: 'load',
    
    // Custom game events
    GAME_START: 'gameStart',
    GAME_OVER: 'gameOver',
    PLAYER_DEATH: 'playerDeath',
    LEVEL_COMPLETE: 'levelComplete',
    VOLUME_CHANGE: 'volumeChange',
    RESOLUTION_CHANGE: 'resolutionChange',
    
    // UI events
    MODAL_OPEN: 'modalOpen',
    MODAL_CLOSE: 'modalClose',
    SETTINGS_CHANGE: 'settingsChange'
  },

  /* ==================== VOLUME CONTROL CONSTANTS ==================== */
  
  VOLUME: {
    MIN: 0,
    MAX: 100,
    DEFAULT_MASTER: 50,
    DEFAULT_BGM: 30,
    DEFAULT_SFX: 100,
    STEP_SMALL: 1,
    STEP_LARGE: 10,
    
    // Volume button text
    DECREASE_LARGE: '--',
    DECREASE_SMALL: '-',
    INCREASE_SMALL: '+',
    INCREASE_LARGE: '++'
  },

  /* ==================== CSS CUSTOM PROPERTIES ==================== */
  
  CSS_PROPERTIES: {
    // Health bar
    HEALTH_WIDTH: '--health-width',
    HEALTH_COLOR: '--health-color',
    
    // Stamina bar  
    STAMINA_WIDTH: '--stamina-width',
    STAMINA_COLOR: '--stamina-color',
    
    // Canvas scaling
    CANVAS_SCALE: '--canvas-scale',
    CANVAS_WIDTH: '--canvas-width',
    CANVAS_HEIGHT: '--canvas-height',
    
    // Theme colors
    PRIMARY_COLOR: '--color-primary-red',
    BACKGROUND_COLOR: '--color-bg-primary',
    TEXT_COLOR: '--color-text-primary'
  },

  /* ==================== ACCESSIBILITY CONSTANTS ==================== */
  
  ACCESSIBILITY: {
    // ARIA labels
    ARIA_LABELS: {
      VOLUME_SLIDER: 'Volume control slider',
      RESOLUTION_BUTTON: 'Resolution option',
      SETTINGS_MODAL: 'Game settings dialog',
      HEALTH_BAR: 'Player health status',
      STAMINA_BAR: 'Player stamina status',
      MAP_OVERLAY: 'Game map overlay'
    },
    
    // Tab index values
    TAB_INDEX: {
      MODAL_CONTENT: 0,
      BUTTON: 0,
      INPUT: 0,
      DISABLED: -1
    },
    
    // Screen reader text
    SCREEN_READER: {
      HEALTH_STATUS: 'Health: {current} out of {max}',
      STAMINA_STATUS: 'Stamina: {current} out of {max}',
      VOLUME_LEVEL: 'Volume level: {level} percent',
      RESOLUTION_SELECTED: 'Resolution set to {resolution}'
    }
  },

  /* ==================== VALIDATION CONSTANTS ==================== */
  
  VALIDATION: {
    // Input validation rules
    VOLUME_RANGE: { min: 0, max: 100 },
    
    // Required elements for game initialization
    REQUIRED_ELEMENTS: [
      '#game-canvas',
      '#ui-overlay',
      '#main-menu',
      '#settings-modal'
    ],
    
    // Element existence checks
    OPTIONAL_ELEMENTS: [
      '#cheat-menu',
      '#map-overlay',
      '#fps-display'
    ]
  },

  /* ==================== UTILITY FUNCTIONS ==================== */
  
  UTILS: {
    // Common DOM operations
    createElement: (tag, className = '', id = '') => {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (id) element.id = id;
      return element;
    },
    
    // Element visibility helpers
    show: (selector) => {
      const element = document.querySelector(selector);
      if (element) element.classList.remove(UIConstants.CLASSES.HIDDEN);
    },
    
    hide: (selector) => {
      const element = document.querySelector(selector);
      if (element) element.classList.add(UIConstants.CLASSES.HIDDEN);
    },
    
    // Class manipulation helpers
    addClass: (selector, className) => {
      const element = document.querySelector(selector);
      if (element) element.classList.add(className);
    },
    
    removeClass: (selector, className) => {
      const element = document.querySelector(selector);
      if (element) element.classList.remove(className);
    },
    
    toggleClass: (selector, className) => {
      const element = document.querySelector(selector);
      if (element) element.classList.toggle(className);
    },
    
    // Safe element selection
    safeQuerySelector: (selector) => {
      try {
        return document.querySelector(selector);
      } catch (error) {
        console.warn(`Invalid selector: ${selector}`, error);
        return null;
      }
    },
    
    safeQuerySelectorAll: (selector) => {
      try {
        return Array.from(document.querySelectorAll(selector));
      } catch (error) {
        console.warn(`Invalid selector: ${selector}`, error);
        return [];
      }
    }
  }
};

/* ==================== UI STATE MANAGEMENT ==================== */

export class UIState {
  constructor() {
    this.currentModal = null;
    this.isMapOpen = false;
    this.isGameRunning = false;
    this.currentResolution = UIConstants.RESOLUTIONS.HD.key;
    this.volumes = {
      master: UIConstants.VOLUME.DEFAULT_MASTER,
      bgm: UIConstants.VOLUME.DEFAULT_BGM,
      sfx: UIConstants.VOLUME.DEFAULT_SFX
    };
  }
  
  // Modal state management
  openModal(modalSelector) {
    if (this.currentModal) this.closeModal();
    this.currentModal = modalSelector;
    UIConstants.UTILS.removeClass(modalSelector, UIConstants.CLASSES.HIDDEN);
    UIConstants.UTILS.addClass('body', UIConstants.CLASSES.MODAL_OPEN);
  }
  
  closeModal() {
    if (this.currentModal) {
      UIConstants.UTILS.addClass(this.currentModal, UIConstants.CLASSES.HIDDEN);
      UIConstants.UTILS.removeClass('body', UIConstants.CLASSES.MODAL_OPEN);
      this.currentModal = null;
    }
  }
  
  // Map state management
  toggleMap() {
    this.isMapOpen = !this.isMapOpen;
    if (this.isMapOpen) {
      UIConstants.UTILS.show(UIConstants.SELECTORS.MAP_OVERLAY);
    } else {
      UIConstants.UTILS.hide(UIConstants.SELECTORS.MAP_OVERLAY);
    }
  }
  
  // Resolution management
  setResolution(resolutionKey) {
    this.currentResolution = resolutionKey;
    // Update active button
    UIConstants.UTILS.safeQuerySelectorAll(UIConstants.SELECTORS.RESOLUTION_BUTTONS)
      .forEach(btn => btn.classList.remove(UIConstants.CLASSES.ACTIVE));
    
    const activeBtn = document.querySelector(`[onclick="setResolutionButton('${resolutionKey}')"]`);
    if (activeBtn) activeBtn.classList.add(UIConstants.CLASSES.ACTIVE);
  }
  
  // Volume management
  setVolume(type, value) {
    this.volumes[type] = Math.max(0, Math.min(100, value));
    const input = document.querySelector(`#${type}-volume-input`);
    if (input) input.value = this.volumes[type];
  }
}

export default UIConstants;