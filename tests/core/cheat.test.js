import { initializeCheats } from '../../src/core/cheat.js';

// Mock GameConfig
jest.mock('../../src/config/GameConfig.js', () => ({
  GameConfig: {
    DEBUG: { ENABLED: false }
  }
}));

// Mock DOM
global.document = {
  createElement: jest.fn((tag) => ({
    tagName: tag.toUpperCase(),
    style: {},
    classList: { add: jest.fn(), remove: jest.fn() },
    appendChild: jest.fn(),
    innerHTML: '',
    textContent: '',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  })),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  },
  getElementById: jest.fn(),
  querySelector: jest.fn()
};

global.window = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

describe('Cheat System', () => {
  let mockGame;
  let mockInputManager;

  beforeEach(() => {
    // Mock game object
    mockGame = {
      entities: [],
      camera: { x: 0, y: 0 },
      running: true
    };

    // Mock input manager
    mockInputManager = {
      isKeyPressed: jest.fn(),
      isAnyKeyPressed: jest.fn()
    };

    // Reset mocks
    jest.clearAllMocks();
  });

  test('should initialize cheat system', () => {
    expect(() => {
      initializeCheats(mockGame, mockInputManager);
    }).not.toThrow();
  });

  test('should create cheat menu DOM elements', () => {
    initializeCheats(mockGame, mockInputManager);

    expect(document.createElement).toHaveBeenCalled();
    expect(document.body.appendChild).toHaveBeenCalled();
  });

  test('should handle cheat menu toggle', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    mockInputManager.isKeyPressed.mockImplementation((key) => {
      return key === 'F4';
    });

    cheats.update();

    expect(document.createElement).toHaveBeenCalled();
  });

  test('should provide god mode functionality', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    expect(cheats.isGodModeEnabled()).toBe(false);

    cheats.toggleGodMode();
    expect(cheats.isGodModeEnabled()).toBe(true);

    cheats.toggleGodMode();
    expect(cheats.isGodModeEnabled()).toBe(false);
  });

  test('should provide infinite stamina functionality', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    expect(cheats.isInfiniteStaminaEnabled()).toBe(false);

    cheats.toggleInfiniteStamina();
    expect(cheats.isInfiniteStaminaEnabled()).toBe(true);
  });

  test('should provide no clip functionality', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    expect(cheats.isNoClipEnabled()).toBe(false);

    cheats.toggleNoClip();
    expect(cheats.isNoClipEnabled()).toBe(true);
  });

  test('should provide speed boost functionality', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    cheats.setSpeedMultiplier(2.0);
    expect(cheats.getSpeedMultiplier()).toBe(2.0);

    cheats.setSpeedMultiplier(0.5);
    expect(cheats.getSpeedMultiplier()).toBe(0.5);
  });

  test('should handle speed multiplier bounds', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    cheats.setSpeedMultiplier(-1); // Negative value
    expect(cheats.getSpeedMultiplier()).toBeGreaterThan(0);

    cheats.setSpeedMultiplier(100); // Very high value
    expect(cheats.getSpeedMultiplier()).toBeLessThanOrEqual(10); // Should be capped
  });

  test('should provide teleport functionality', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    expect(() => {
      cheats.teleportPlayer(500, 300);
    }).not.toThrow();
  });

  test('should provide heal player functionality', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    expect(() => {
      cheats.healPlayer();
    }).not.toThrow();
  });

  test('should provide kill all enemies functionality', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    expect(() => {
      cheats.killAllEnemies();
    }).not.toThrow();
  });

  test('should provide spawn enemy functionality', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    expect(() => {
      cheats.spawnEnemy('SHADOW_WARRIOR', 200, 200);
    }).not.toThrow();
  });

  test('should handle invalid enemy type when spawning', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    expect(() => {
      cheats.spawnEnemy('INVALID_ENEMY', 200, 200);
    }).not.toThrow();
  });

  test('should provide camera controls', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    cheats.setCameraPosition(100, 200);
    expect(mockGame.camera.x).toBe(100);
    expect(mockGame.camera.y).toBe(200);
  });

  test('should provide game speed controls', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    cheats.setGameSpeed(0.5);
    expect(cheats.getGameSpeed()).toBe(0.5);

    cheats.setGameSpeed(2.0);
    expect(cheats.getGameSpeed()).toBe(2.0);
  });

  test('should handle game speed bounds', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    cheats.setGameSpeed(0); // Zero speed
    expect(cheats.getGameSpeed()).toBeGreaterThan(0);

    cheats.setGameSpeed(-1); // Negative speed
    expect(cheats.getGameSpeed()).toBeGreaterThan(0);
  });

  test('should provide debug information toggle', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    expect(() => {
      cheats.toggleDebugInfo();
    }).not.toThrow();
  });

  test('should show cheat menu when enabled', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    cheats.showMenu();
    expect(document.createElement).toHaveBeenCalled();
  });

  test('should hide cheat menu when disabled', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    cheats.hideMenu();
    expect(document.body.removeChild).toHaveBeenCalled();
  });

  test('should handle cheat activation via keyboard shortcuts', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    // Mock key combinations
    mockInputManager.isKeyPressed.mockImplementation((key) => {
      switch (key) {
        case 'KeyG': return true; // God mode
        case 'KeyS': return true; // Infinite stamina
        case 'KeyN': return true; // No clip
        default: return false;
      }
    });

    expect(() => {
      cheats.handleKeyboardShortcuts();
    }).not.toThrow();
  });

  test('should reset all cheats', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    cheats.toggleGodMode();
    cheats.toggleInfiniteStamina();
    cheats.setSpeedMultiplier(3.0);

    cheats.resetAll();

    expect(cheats.isGodModeEnabled()).toBe(false);
    expect(cheats.isInfiniteStaminaEnabled()).toBe(false);
    expect(cheats.getSpeedMultiplier()).toBe(1.0);
  });

  test('should handle cheat persistence', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    cheats.toggleGodMode();
    const settings = cheats.exportSettings();

    expect(settings.godMode).toBe(true);

    cheats.resetAll();
    cheats.importSettings(settings);

    expect(cheats.isGodModeEnabled()).toBe(true);
  });

  test('should handle invalid cheat settings import', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    expect(() => {
      cheats.importSettings(null);
    }).not.toThrow();

    expect(() => {
      cheats.importSettings('invalid');
    }).not.toThrow();
  });

  test('should provide room teleportation', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    expect(() => {
      cheats.teleportToRoom(5);
    }).not.toThrow();
  });

  test('should handle invalid room teleportation', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    expect(() => {
      cheats.teleportToRoom(-1);
    }).not.toThrow();

    expect(() => {
      cheats.teleportToRoom(999);
    }).not.toThrow();
  });

  test('should provide item spawning', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    expect(() => {
      cheats.spawnItem('HEALTH_POTION', 300, 400);
    }).not.toThrow();
  });

  test('should provide level and experience cheats', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    expect(() => {
      cheats.setPlayerLevel(10);
    }).not.toThrow();

    expect(() => {
      cheats.giveExperience(1000);
    }).not.toThrow();
  });

  test('should provide weapon and equipment cheats', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    expect(() => {
      cheats.giveWeapon('LEGENDARY_SWORD');
    }).not.toThrow();

    expect(() => {
      cheats.maxUpgradeEquipment();
    }).not.toThrow();
  });

  test('should handle cheat menu navigation', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    expect(() => {
      cheats.navigateMenu('up');
    }).not.toThrow();

    expect(() => {
      cheats.navigateMenu('down');
    }).not.toThrow();

    expect(() => {
      cheats.activateMenuItem();
    }).not.toThrow();
  });

  test('should handle cheat system disable', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    cheats.disable();

    mockInputManager.isKeyPressed.mockReturnValue(true);
    cheats.update();

    // Should not respond to input when disabled
    expect(cheats.isEnabled()).toBe(false);
  });

  test('should handle cheat system enable', () => {
    const cheats = initializeCheats(mockGame, mockInputManager);

    cheats.disable();
    cheats.enable();

    expect(cheats.isEnabled()).toBe(true);
  });
});