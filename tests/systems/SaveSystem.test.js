import { SaveSystem } from '../../src/systems/SaveSystem.js';
import { Entity } from '../../src/core/Entity.js';
import { Position } from '../../src/components/Position.js';
import { Player } from '../../src/components/Player.js';
import { MapState } from '../../src/components/MapState.js';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

global.localStorage = mockLocalStorage;

describe('SaveSystem', () => {
  let saveSystem;
  let entities;
  let playerEntity;

  beforeEach(() => {
    saveSystem = new SaveSystem();
    entities = [];

    // Create player entity
    playerEntity = new Entity();
    playerEntity.addComponent('Position', new Position(100, 100));
    playerEntity.addComponent('Player', new Player());
    playerEntity.addComponent('MapState', new MapState());

    entities.push(playerEntity);

    // Reset mocks
    jest.clearAllMocks();
  });

  test('should create SaveSystem', () => {
    expect(saveSystem).toBeDefined();
  });

  test('should save player data to localStorage', () => {
    const player = playerEntity.getComponent('Player');
    const position = playerEntity.getComponent('Position');
    const mapState = playerEntity.getComponent('MapState');

    player.health = 75;
    player.stamina = 60;
    position.x = 250;
    position.y = 350;
    mapState.visitRoom(5);

    saveSystem.saveGame(entities);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'shadow-knight-save',
      expect.any(String)
    );
  });

  test('should create valid JSON when saving', () => {
    saveSystem.saveGame(entities);

    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    
    const saveCall = mockLocalStorage.setItem.mock.calls[0];
    expect(saveCall[0]).toBe('shadow-knight-save');
    
    // Should be valid JSON
    expect(() => {
      JSON.parse(saveCall[1]);
    }).not.toThrow();
  });

  test('should load player data from localStorage', () => {
    const saveData = {
      player: {
        health: 85,
        maxHealth: 100,
        stamina: 70,
        maxStamina: 100
      },
      position: {
        x: 300,
        y: 400
      },
      mapState: {
        currentRoom: 7,
        visitedRooms: [0, 1, 2, 7]
      },
      timestamp: Date.now()
    };

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(saveData));

    const loadedData = saveSystem.loadGame();

    expect(loadedData).toBeDefined();
    expect(loadedData.player.health).toBe(85);
    expect(loadedData.position.x).toBe(300);
    expect(loadedData.mapState.currentRoom).toBe(7);
  });

  test('should return null when no save data exists', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const loadedData = saveSystem.loadGame();

    expect(loadedData).toBeNull();
  });

  test('should handle corrupted save data gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid json data');

    const loadedData = saveSystem.loadGame();

    expect(loadedData).toBeNull();
  });

  test('should apply loaded data to entities', () => {
    const saveData = {
      player: {
        health: 90,
        maxHealth: 100,
        stamina: 80,
        maxStamina: 100
      },
      position: {
        x: 500,
        y: 600
      },
      mapState: {
        currentRoom: 3,
        visitedRooms: [0, 1, 3]
      }
    };

    saveSystem.applyLoadedData(entities, saveData);

    const player = playerEntity.getComponent('Player');
    const position = playerEntity.getComponent('Position');
    const mapState = playerEntity.getComponent('MapState');

    expect(player.health).toBe(90);
    expect(player.stamina).toBe(80);
    expect(position.x).toBe(500);
    expect(position.y).toBe(600);
    expect(mapState.currentRoom).toBe(3);
  });

  test('should handle partial save data when applying', () => {
    const incompleteSaveData = {
      player: {
        health: 50
        // Missing other player properties
      }
      // Missing position and mapState
    };

    expect(() => {
      saveSystem.applyLoadedData(entities, incompleteSaveData);
    }).not.toThrow();

    const player = playerEntity.getComponent('Player');
    expect(player.health).toBe(50);
  });

  test('should delete save data', () => {
    saveSystem.deleteSave();

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('shadow-knight-save');
  });

  test('should check if save exists', () => {
    // Test when save exists
    mockLocalStorage.getItem.mockReturnValue('{"player": {}}');
    expect(saveSystem.hasSaveData()).toBe(true);

    // Test when save doesn't exist
    mockLocalStorage.getItem.mockReturnValue(null);
    expect(saveSystem.hasSaveData()).toBe(false);
  });

  test('should handle localStorage errors when saving', () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    expect(() => {
      saveSystem.saveGame(entities);
    }).not.toThrow();
  });

  test('should handle localStorage errors when loading', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('Storage access denied');
    });

    const loadedData = saveSystem.loadGame();
    expect(loadedData).toBeNull();
  });

  test('should save timestamp with save data', () => {
    const beforeSave = Date.now();
    saveSystem.saveGame(entities);
    const afterSave = Date.now();

    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    
    const saveCall = mockLocalStorage.setItem.mock.calls[0];
    const saveData = JSON.parse(saveCall[1]);
    
    expect(saveData.timestamp).toBeGreaterThanOrEqual(beforeSave);
    expect(saveData.timestamp).toBeLessThanOrEqual(afterSave);
  });

  test('should preserve visited rooms when saving and loading', () => {
    const mapState = playerEntity.getComponent('MapState');
    mapState.visitRoom(1);
    mapState.visitRoom(5);
    mapState.visitRoom(10);

    saveSystem.saveGame(entities);

    const saveCall = mockLocalStorage.setItem.mock.calls[0];
    const saveData = JSON.parse(saveCall[1]);
    
    expect(saveData.mapState.visitedRooms).toContain(0); // Initial room
    expect(saveData.mapState.visitedRooms).toContain(1);
    expect(saveData.mapState.visitedRooms).toContain(5);
    expect(saveData.mapState.visitedRooms).toContain(10);
  });

  test('should handle empty entities array when saving', () => {
    expect(() => {
      saveSystem.saveGame([]);
    }).not.toThrow();
  });

  test('should handle entities without required components when saving', () => {
    const incompleteEntity = new Entity();
    incompleteEntity.addComponent('Position', new Position(0, 0));
    // Missing Player and MapState components

    const entitiesWithIncomplete = [playerEntity, incompleteEntity];

    expect(() => {
      saveSystem.saveGame(entitiesWithIncomplete);
    }).not.toThrow();
  });

  test('should handle auto-save functionality', () => {
    jest.useFakeTimers();
    
    saveSystem.enableAutoSave(entities, 5000); // Auto-save every 5 seconds

    // Fast forward time
    jest.advanceTimersByTime(5000);

    expect(mockLocalStorage.setItem).toHaveBeenCalled();

    saveSystem.disableAutoSave();
    jest.useRealTimers();
  });

  test('should disable auto-save correctly', () => {
    jest.useFakeTimers();
    
    saveSystem.enableAutoSave(entities, 1000);
    saveSystem.disableAutoSave();

    // Fast forward time - should not save
    jest.advanceTimersByTime(2000);

    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  test('should validate save data integrity', () => {
    const validSaveData = {
      player: { health: 100, stamina: 100 },
      position: { x: 0, y: 0 },
      mapState: { currentRoom: 0, visitedRooms: [0] },
      timestamp: Date.now()
    };

    const invalidSaveData = {
      player: { health: -10 }, // Invalid health
      position: { x: 'invalid' }, // Invalid position
      timestamp: 'not a number'
    };

    expect(saveSystem.isValidSaveData(validSaveData)).toBe(true);
    expect(saveSystem.isValidSaveData(invalidSaveData)).toBe(false);
  });

  test('should get save data age correctly', () => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const saveData = {
      player: {},
      timestamp: oneHourAgo
    };

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(saveData));

    const age = saveSystem.getSaveAge();
    expect(age).toBeGreaterThan(3500000); // Approximately 1 hour in ms
  });

  test('should return null for save age when no save exists', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const age = saveSystem.getSaveAge();
    expect(age).toBeNull();
  });

  test('should create backup saves', () => {
    saveSystem.createBackup(entities);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      expect.stringContaining('shadow-knight-backup'),
      expect.any(String)
    );
  });

  test('should restore from backup', () => {
    const backupData = {
      player: { health: 95 },
      position: { x: 123, y: 456 },
      timestamp: Date.now()
    };

    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key.includes('backup')) {
        return JSON.stringify(backupData);
      }
      return null;
    });

    const restored = saveSystem.restoreFromBackup();

    expect(restored).toBeDefined();
    expect(restored.player.health).toBe(95);
  });

  test('should handle multiple save slots', () => {
    saveSystem.saveToSlot(entities, 2);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'shadow-knight-save-slot-2',
      expect.any(String)
    );
  });

  test('should load from specific save slot', () => {
    const slotData = {
      player: { health: 60 },
      timestamp: Date.now()
    };

    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'shadow-knight-save-slot-3') {
        return JSON.stringify(slotData);
      }
      return null;
    });

    const loaded = saveSystem.loadFromSlot(3);

    expect(loaded).toBeDefined();
    expect(loaded.player.health).toBe(60);
  });
});