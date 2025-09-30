import { MapSystem } from '../../src/systems/MapSystem.js';
import { Entity } from '../../src/core/Entity.js';
import { Position } from '../../src/components/Position.js';
import { Player } from '../../src/components/Player.js';
import { MapState } from '../../src/components/MapState.js';

// Mock InputManager
const mockInputManager = {
  isAnyKeyPressed: jest.fn(),
  isKeyPressed: jest.fn()
};

describe('MapSystem', () => {
  let mapSystem;
  let entities;
  let playerEntity;

  beforeEach(() => {
    mapSystem = new MapSystem(mockInputManager);
    entities = [];

    // Create player entity with map state
    playerEntity = new Entity();
    playerEntity.addComponent('Position', new Position(100, 100));
    playerEntity.addComponent('Player', new Player());
    playerEntity.addComponent('MapState', new MapState());

    entities.push(playerEntity);

    // Reset mocks
    jest.clearAllMocks();
  });

  test('should create MapSystem with input manager', () => {
    expect(mapSystem).toBeDefined();
    expect(mapSystem.inputManager).toBe(mockInputManager);
  });

  test('should open map when map key is pressed', () => {
    const mapState = playerEntity.getComponent('MapState');
    
    mockInputManager.isAnyKeyPressed.mockImplementation((keys) => {
      return keys.includes('KeyM');
    });

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16);

    expect(mapState.isOpen).toBe(true);
  });

  test('should close map when map key is pressed and map is open', () => {
    const mapState = playerEntity.getComponent('MapState');
    mapState.openMap(); // Start with map open
    
    mockInputManager.isAnyKeyPressed.mockImplementation((keys) => {
      return keys.includes('KeyM');
    });

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16);

    expect(mapState.isOpen).toBe(false);
  });

  test('should toggle map state correctly', () => {
    const mapState = playerEntity.getComponent('MapState');
    
    expect(mapState.isOpen).toBe(false);
    
    // First press - open map
    mockInputManager.isAnyKeyPressed.mockReturnValue(true);
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16);
    expect(mapState.isOpen).toBe(true);
    
    // Reset input
    mockInputManager.isAnyKeyPressed.mockReturnValue(false);
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16);
    
    // Second press - close map
    mockInputManager.isAnyKeyPressed.mockReturnValue(true);
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16);
    expect(mapState.isOpen).toBe(false);
  });

  test('should prevent rapid toggling with key debouncing', () => {
    const mapState = playerEntity.getComponent('MapState');
    
    mockInputManager.isAnyKeyPressed.mockReturnValue(true);
    
    // Multiple rapid updates
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16);
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16);
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16);
    
    // Map should only toggle once
    expect(mapState.isOpen).toBe(true);
  });

  test('should handle entities without map state component', () => {
    const entityWithoutMap = new Entity();
    entityWithoutMap.addComponent('Position', new Position(200, 200));
    entityWithoutMap.addComponent('Player', new Player());
    // No MapState component
    
    entities.push(entityWithoutMap);

    mockInputManager.isAnyKeyPressed.mockReturnValue(true);

    expect(() => {
          // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16);
    }).not.toThrow();
  });

  test('should handle entities without player component', () => {
    const entityWithoutPlayer = new Entity();
    entityWithoutPlayer.addComponent('Position', new Position(200, 200));
    entityWithoutPlayer.addComponent('MapState', new MapState());
    // No Player component
    
    entities.push(entityWithoutPlayer);

    mockInputManager.isAnyKeyPressed.mockReturnValue(true);

    expect(() => {
          // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16);
    }).not.toThrow();
  });

  test('should not toggle map when player is dead', () => {
    const player = playerEntity.getComponent('Player');
    const mapState = playerEntity.getComponent('MapState');
    
    player.health = 0; // Dead player
    
    mockInputManager.isAnyKeyPressed.mockReturnValue(true);
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16);

    expect(mapState.isOpen).toBe(false); // Should remain closed
  });

  test('should not respond to input when no map key is pressed', () => {
    const mapState = playerEntity.getComponent('MapState');
    
    mockInputManager.isAnyKeyPressed.mockReturnValue(false);
    
    const initialMapState = mapState.isOpen;
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16);
    
    expect(mapState.isOpen).toBe(initialMapState); // No change
  });

  test('should handle multiple entities with map states', () => {
    // Create second player entity
    const player2Entity = new Entity();
    player2Entity.addComponent('Position', new Position(300, 300));
    player2Entity.addComponent('Player', new Player());
    player2Entity.addComponent('MapState', new MapState());
    
    entities.push(player2Entity);

    const mapState1 = playerEntity.getComponent('MapState');
    const mapState2 = player2Entity.getComponent('MapState');
    
    mockInputManager.isAnyKeyPressed.mockReturnValue(true);
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16);

    // Both should toggle (though in a real game, there would likely be only one player)
    expect(mapState1.isOpen).toBe(true);
    expect(mapState2.isOpen).toBe(true);
  });

  test('should reset key pressed state after processing', () => {
    const mapState = playerEntity.getComponent('MapState');
    
    mockInputManager.isAnyKeyPressed.mockReturnValue(true);
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16);
    
    expect(mapState.isOpen).toBe(true);
    
    // Should not toggle again on next frame without new key press
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16);
    expect(mapState.isOpen).toBe(true); // Still open
  });

  test('should work with different key mappings', () => {
    // Test with different key that might be mapped to map function
    mockInputManager.isAnyKeyPressed.mockImplementation((keys) => {
      return keys.includes('Tab'); // Alternative map key
    });

    const mapState = playerEntity.getComponent('MapState');
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16);

    // Should not respond to unmapped key
    expect(mapState.isOpen).toBe(false);
  });

  test('should handle input manager returning undefined', () => {
    mockInputManager.isAnyKeyPressed.mockReturnValue(undefined);
    
    const mapState = playerEntity.getComponent('MapState');
    const initialState = mapState.isOpen;

    expect(() => {
          // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16);
    }).not.toThrow();
    
    expect(mapState.isOpen).toBe(initialState); // No change
  });

  test('should handle empty entities array', () => {
    mockInputManager.isAnyKeyPressed.mockReturnValue(true);

    expect(() => {
      mapSystem.update([], 16);
    }).not.toThrow();
  });

  test('should maintain proper timing for key debouncing', () => {
    const mapState = playerEntity.getComponent('MapState');
    
    mockInputManager.isAnyKeyPressed.mockReturnValue(true);
    
    // First press
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16);
    expect(mapState.isOpen).toBe(true);
    
    // Release key
    mockInputManager.isAnyKeyPressed.mockReturnValue(false);
    // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(50); // Wait some time
    
    // Press again
    mockInputManager.isAnyKeyPressed.mockReturnValue(true);
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16);
    expect(mapState.isOpen).toBe(false); // Should toggle
  });

  test('should handle map system with player attacking', () => {
    const player = playerEntity.getComponent('Player');
    const mapState = playerEntity.getComponent('MapState');
    
    player.isAttacking = true;
    
    mockInputManager.isAnyKeyPressed.mockReturnValue(true);
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16);

    // Map should still be able to open even when attacking
    expect(mapState.isOpen).toBe(true);
  });

  test('should handle map system with player dashing', () => {
    const player = playerEntity.getComponent('Player');
    const mapState = playerEntity.getComponent('MapState');
    
    player.isDashing = true;
    
    mockInputManager.isAnyKeyPressed.mockReturnValue(true);
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16);

    // Map should still be able to open even when dashing
    expect(mapState.isOpen).toBe(true);
  });

  test('should properly track key release for next toggle', () => {
    const mapState = playerEntity.getComponent('MapState');
    
    // Press and hold key
    mockInputManager.isAnyKeyPressed.mockReturnValue(true);
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16); // Opens map
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16); // Key still held
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16); // Key still held
    
    expect(mapState.isOpen).toBe(true); // Should only toggle once
    
    // Release key
    mockInputManager.isAnyKeyPressed.mockReturnValue(false);
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16);
    
    // Press key again
    mockInputManager.isAnyKeyPressed.mockReturnValue(true);
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    mapSystem.game = mockGame;

    mapSystem.update(16); // Should close map
    
    expect(mapState.isOpen).toBe(false);
  });
});