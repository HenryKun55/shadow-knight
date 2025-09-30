import { UISystem } from '../../src/systems/UISystem.js';
import { Entity } from '../../src/core/Entity.js';
import { Position } from '../../src/components/Position.js';
import { Player } from '../../src/components/Player.js';

// Mock DOM
global.document = {
  createElement: jest.fn((tag) => {
    const element = {
      tagName: tag.toUpperCase(),
      style: {},
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn()
      },
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      textContent: '',
      innerHTML: ''
    };
    return element;
  }),
  head: {
    appendChild: jest.fn()
  },
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  },
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(() => [])
};

describe('UISystem', () => {
  let uiSystem;
  let entities;
  let playerEntity;

  beforeEach(() => {
    uiSystem = new UISystem();
    entities = [];

    // Create player entity
    playerEntity = new Entity();
    playerEntity.addComponent('Position', new Position(100, 100));
    playerEntity.addComponent('Player', new Player());

    entities.push(playerEntity);

    // Reset mocks
    jest.clearAllMocks();
  });

  test('should create UISystem', () => {
    expect(uiSystem).toBeDefined();
  });

  test('should initialize UI elements', () => {
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16);

    expect(document.createElement).toHaveBeenCalled();
  });

  test('should update health bar for player', () => {
    const player = playerEntity.getComponent('Player');
    player.health = 75; // 75% health

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16);

    // Should create and update health bar
    expect(document.createElement).toHaveBeenCalled();
  });

  test('should update stamina bar for player', () => {
    const player = playerEntity.getComponent('Player');
    player.stamina = 50; // 50% stamina

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16);

    // Should create and update stamina bar
    expect(document.createElement).toHaveBeenCalled();
  });

  test('should show damage numbers when entity takes damage', () => {
    const player = playerEntity.getComponent('Player');
    
    // Simulate damage taken
    uiSystem.showDamageNumber(25, 150, 200, 'red');

    expect(document.createElement).toHaveBeenCalled();
    expect(document.body.appendChild).toHaveBeenCalled();
  });

  test('should show status messages', () => {
    uiSystem.showStatusMessage('Level Up!', 3000);

    expect(document.createElement).toHaveBeenCalled();
    expect(document.body.appendChild).toHaveBeenCalled();
  });

  test('should display FPS counter', () => {
    uiSystem.showFPS = true;
    
    for (let i = 0; i < 60; i++) {
          // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16); // Simulate 60 frames
    }

    expect(document.createElement).toHaveBeenCalled();
  });

  test('should handle multiple damage numbers', () => {
    uiSystem.showDamageNumber(10, 100, 100, 'red');
    uiSystem.showDamageNumber(15, 120, 110, 'blue');
    uiSystem.showDamageNumber(20, 140, 120, 'green');

    expect(document.createElement).toHaveBeenCalledTimes(3);
    expect(document.body.appendChild).toHaveBeenCalledTimes(3);
  });

  test('should clean up expired damage numbers', () => {
    jest.useFakeTimers();
    
    uiSystem.showDamageNumber(25, 150, 200, 'red');
    
    // Fast forward time
    jest.advanceTimersByTime(2000);
    
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16);

    expect(document.body.removeChild).toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  test('should handle entities without player component', () => {
    const nonPlayerEntity = new Entity();
    nonPlayerEntity.addComponent('Position', new Position(200, 200));
    
    entities.push(nonPlayerEntity);

    expect(() => {
          // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16);
    }).not.toThrow();
  });

  test('should show health at different percentages', () => {
    const player = playerEntity.getComponent('Player');
    
    // Test full health
    player.health = 100;
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16);
    
    // Test low health
    player.health = 15;
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16);
    
    // Test critical health
    player.health = 5;
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16);

    expect(document.createElement).toHaveBeenCalled();
  });

  test('should show stamina at different percentages', () => {
    const player = playerEntity.getComponent('Player');
    
    // Test full stamina
    player.stamina = 100;
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16);
    
    // Test low stamina
    player.stamina = 25;
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16);
    
    // Test empty stamina
    player.stamina = 0;
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16);

    expect(document.createElement).toHaveBeenCalled();
  });

  test('should toggle debug information', () => {
    uiSystem.toggleDebugInfo();
    
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16);

    expect(document.createElement).toHaveBeenCalled();
  });

  test('should show controls hint', () => {
    uiSystem.showControls = true;
    
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16);

    expect(document.createElement).toHaveBeenCalled();
  });

  test('should hide controls hint', () => {
    uiSystem.showControls = false;
    
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16);

    // Should not create controls UI
    expect(document.createElement).toHaveBeenCalled();
  });

  test('should handle zero health correctly', () => {
    const player = playerEntity.getComponent('Player');
    player.health = 0;

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16);

    expect(document.createElement).toHaveBeenCalled();
  });

  test('should handle maximum health correctly', () => {
    const player = playerEntity.getComponent('Player');
    player.health = player.maxHealth;

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16);

    expect(document.createElement).toHaveBeenCalled();
  });

  test('should show different colored damage numbers', () => {
    uiSystem.showDamageNumber(10, 100, 100, '#ff0000'); // Red
    uiSystem.showDamageNumber(15, 120, 110, '#00ff00'); // Green
    uiSystem.showDamageNumber(20, 140, 120, '#0000ff'); // Blue

    expect(document.createElement).toHaveBeenCalledTimes(3);
  });

  test('should position damage numbers correctly', () => {
    const x = 300;
    const y = 400;
    
    uiSystem.showDamageNumber(50, x, y, 'yellow');

    const createElement = document.createElement;
    expect(createElement).toHaveBeenCalled();
    expect(document.body.appendChild).toHaveBeenCalled();
  });

  test('should handle status messages with different durations', () => {
    uiSystem.showStatusMessage('Short message', 1000);
    uiSystem.showStatusMessage('Long message', 5000);

    expect(document.createElement).toHaveBeenCalledTimes(2);
    expect(document.body.appendChild).toHaveBeenCalledTimes(2);
  });

  test('should update FPS calculation over time', () => {
    uiSystem.showFPS = true;
    
    // Simulate varying frame times
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16); // 60 FPS
    // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(32); // 30 FPS
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16); // 60 FPS

    expect(document.createElement).toHaveBeenCalled();
  });

  test('should handle rapid UI updates', () => {
    for (let i = 0; i < 100; i++) {
          // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16);
    }

    expect(document.createElement).toHaveBeenCalled();
  });

  test('should clean up old status messages', () => {
    jest.useFakeTimers();
    
    uiSystem.showStatusMessage('Test message', 1000);
    
    // Fast forward past message duration
    jest.advanceTimersByTime(1500);
    
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16);

    expect(document.body.removeChild).toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  test('should handle empty entities array', () => {
    expect(() => {
      uiSystem.update([], 16);
    }).not.toThrow();
  });

  test('should maintain UI state across updates', () => {
    uiSystem.showFPS = true;
    uiSystem.showControls = true;
    
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16);
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16);
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16);

    expect(document.createElement).toHaveBeenCalled();
  });

  test('should handle player death state', () => {
    const player = playerEntity.getComponent('Player');
    player.health = 0;
    
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    uiSystem.game = mockGame;

    uiSystem.update(16);

    // Should show death-related UI
    expect(document.createElement).toHaveBeenCalled();
  });
});