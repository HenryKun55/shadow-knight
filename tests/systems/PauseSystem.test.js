import { PauseSystem } from '../../src/systems/PauseSystem.js';
import { Entity } from '../../src/core/Entity.js';

// Mock InputManager
const mockInputManager = {
  isKeyPressed: jest.fn(),
  isAnyKeyPressed: jest.fn()
};

describe('PauseSystem', () => {
  let pauseSystem;
  let entities;
  let mockGame;

  beforeEach(() => {
    pauseSystem = new PauseSystem(mockInputManager);
    entities = [];
    
    // Create mock game instance
    mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    pauseSystem.game = mockGame;

    // Reset mocks
    jest.clearAllMocks();
  });

  test('should create PauseSystem with input manager', () => {
    expect(pauseSystem).toBeDefined();
    expect(pauseSystem.inputManager).toBe(mockInputManager);
    expect(pauseSystem.isPaused).toBe(false);
  });

  test('should pause game when pause key is pressed', () => {
    mockInputManager.isKeyPressed.mockReturnValue(true);

    pauseSystem.update(16);

    expect(pauseSystem.isPaused).toBe(true);
  });

  test('should unpause game when pause key is pressed while paused', () => {
    pauseSystem.isPaused = true; // Start paused
    
    mockInputManager.isKeyPressed.mockReturnValue(true);

    pauseSystem.update(16);

    expect(pauseSystem.isPaused).toBe(false);
  });

  test('should toggle pause state correctly', () => {
    expect(pauseSystem.isPaused).toBe(false);

    // First press - pause
    mockInputManager.isKeyPressed.mockReturnValue(true);
    pauseSystem.update(16);
    expect(pauseSystem.isPaused).toBe(true);

    // Reset input
    mockInputManager.isKeyPressed.mockReturnValue(false);
    pauseSystem.update(16);

    // Second press - unpause
    mockInputManager.isKeyPressed.mockReturnValue(true);
    pauseSystem.update(16);
    expect(pauseSystem.isPaused).toBe(false);
  });

  test('should prevent rapid toggling with key debouncing', () => {
    mockInputManager.isKeyPressed.mockReturnValue(true);

    // Multiple rapid updates
    pauseSystem.update(16);
    pauseSystem.update(16);
    pauseSystem.update(16);

    // Should only toggle once
    expect(pauseSystem.isPaused).toBe(true);
  });

  test('should not toggle when pause key is not pressed', () => {
    mockInputManager.isKeyPressed.mockReturnValue(false);

    const initialPauseState = pauseSystem.isPaused;
    pauseSystem.update(16);

    expect(pauseSystem.isPaused).toBe(initialPauseState);
  });

  test('should handle escape key for pause', () => {
    mockInputManager.isKeyPressed.mockImplementation((key) => {
      return key === 'Escape';
    });

    pauseSystem.update(16);

    expect(pauseSystem.isPaused).toBe(true);
  });

  test('should handle P key for pause', () => {
    mockInputManager.isKeyPressed.mockImplementation((key) => {
      return key === 'KeyP';
    });

    pauseSystem.update(16);

    expect(pauseSystem.isPaused).toBe(true);
  });

  test('should return true when game is paused', () => {
    pauseSystem.isPaused = true;

    const result = pauseSystem.update(16);

    expect(result).toBe(true);
  });

  test('should return false when game is not paused', () => {
    pauseSystem.isPaused = false;
    mockInputManager.isKeyPressed.mockReturnValue(false);

    const result = pauseSystem.update(16);

    expect(result).toBe(false);
  });

  test('should maintain pause state across updates when no input', () => {
    pauseSystem.isPaused = true;
    mockInputManager.isKeyPressed.mockReturnValue(false);

    pauseSystem.update(16);
    pauseSystem.update(16);
    pauseSystem.update(16);

    expect(pauseSystem.isPaused).toBe(true);
  });

  test('should handle input manager returning undefined', () => {
    mockInputManager.isKeyPressed.mockReturnValue(undefined);

    const initialState = pauseSystem.isPaused;

    expect(() => {
      pauseSystem.update(16);
    }).not.toThrow();

    expect(pauseSystem.isPaused).toBe(initialState);
  });

  test('should handle multiple pause keys', () => {
    // Test that any valid pause key works
    const pauseKeys = ['Escape', 'KeyP', 'Space'];

    pauseKeys.forEach((key, index) => {
      pauseSystem.isPaused = false; // Reset state
      
      mockInputManager.isKeyPressed.mockImplementation((testKey) => {
        return testKey === key;
      });

      pauseSystem.update(16);
      expect(pauseSystem.isPaused).toBe(true);
    });
  });

  test('should reset key pressed state after processing', () => {
    mockInputManager.isKeyPressed.mockReturnValue(true);
    pauseSystem.update(16);

    expect(pauseSystem.isPaused).toBe(true);

    // Should not toggle again on next frame without new key press
    pauseSystem.update(16);
    expect(pauseSystem.isPaused).toBe(true); // Still paused
  });

  test('should handle pause/unpause timing correctly', () => {
    // Press key
    mockInputManager.isKeyPressed.mockReturnValue(true);
    pauseSystem.update(16);
    expect(pauseSystem.isPaused).toBe(true);

    // Release key
    mockInputManager.isKeyPressed.mockReturnValue(false);
    pauseSystem.update(50); // Wait some time

    // Press key again
    mockInputManager.isKeyPressed.mockReturnValue(true);
    pauseSystem.update(16);
    expect(pauseSystem.isPaused).toBe(false); // Should unpause
  });

  test('should provide pause state getter', () => {
    expect(pauseSystem.getPauseState()).toBe(false);

    pauseSystem.isPaused = true;
    expect(pauseSystem.getPauseState()).toBe(true);
  });

  test('should provide manual pause control', () => {
    pauseSystem.pause();
    expect(pauseSystem.isPaused).toBe(true);

    pauseSystem.unpause();
    expect(pauseSystem.isPaused).toBe(false);
  });

  test('should handle force pause without input', () => {
    pauseSystem.forcePause();
    expect(pauseSystem.isPaused).toBe(true);

    // Should remain paused even with input
    mockInputManager.isKeyPressed.mockReturnValue(false);
    pauseSystem.update(16);
    expect(pauseSystem.isPaused).toBe(true);
  });

  test('should handle force unpause', () => {
    pauseSystem.isPaused = true;
    
    pauseSystem.forceUnpause();
    expect(pauseSystem.isPaused).toBe(false);
  });

  test('should toggle pause programmatically', () => {
    expect(pauseSystem.isPaused).toBe(false);

    pauseSystem.togglePause();
    expect(pauseSystem.isPaused).toBe(true);

    pauseSystem.togglePause();
    expect(pauseSystem.isPaused).toBe(false);
  });

  test('should handle pause during different game states', () => {
    // Test pausing during normal gameplay
    mockInputManager.isKeyPressed.mockReturnValue(true);
    pauseSystem.update(16);
    expect(pauseSystem.isPaused).toBe(true);

    // Test that pause state persists
    mockInputManager.isKeyPressed.mockReturnValue(false);
    for (let i = 0; i < 100; i++) {
      pauseSystem.update(16);
    }
    expect(pauseSystem.isPaused).toBe(true);
  });

  test('should handle pause system with no input manager', () => {
    const pauseSystemNoInput = new PauseSystem(null);

    expect(() => {
      pauseSystemNoInput.game = mockGame;

      pauseSystemNoInput.update(16);
    }).not.toThrow();

    expect(pauseSystemNoInput.isPaused).toBe(false);
  });

  test('should handle pause callbacks', () => {
    const onPauseCallback = jest.fn();
    const onUnpauseCallback = jest.fn();

    pauseSystem.setCallbacks(onPauseCallback, onUnpauseCallback);

    // Pause
    mockInputManager.isKeyPressed.mockReturnValue(true);
    pauseSystem.update(16);

    expect(onPauseCallback).toHaveBeenCalled();

    // Reset
    mockInputManager.isKeyPressed.mockReturnValue(false);
    pauseSystem.update(16);

    // Unpause
    mockInputManager.isKeyPressed.mockReturnValue(true);
    pauseSystem.update(16);

    expect(onUnpauseCallback).toHaveBeenCalled();
  });

  test('should handle pause with time tracking', () => {
    const startTime = Date.now();

    pauseSystem.pause();
    
    // Simulate time passing while paused
    setTimeout(() => {
      pauseSystem.unpause();
      
      const pauseDuration = pauseSystem.getLastPauseDuration();
      expect(pauseDuration).toBeGreaterThan(0);
    }, 100);
  });

  test('should handle nested pause calls', () => {
    pauseSystem.pause();
    pauseSystem.pause(); // Second pause call
    
    expect(pauseSystem.isPaused).toBe(true);
    
    pauseSystem.unpause();
    expect(pauseSystem.isPaused).toBe(false);
  });

  test('should handle pause system reset', () => {
    pauseSystem.isPaused = true;
    
    pauseSystem.reset();
    
    expect(pauseSystem.isPaused).toBe(false);
  });

  test('should handle empty entities array', () => {
    mockInputManager.isKeyPressed.mockReturnValue(true);

    expect(() => {
      pauseSystem.update([], 16);
    }).not.toThrow();

    expect(pauseSystem.isPaused).toBe(true);
  });

  test('should handle pause system disable', () => {
    pauseSystem.disable();
    
    mockInputManager.isKeyPressed.mockReturnValue(true);
    pauseSystem.update(16);
    
    expect(pauseSystem.isPaused).toBe(false); // Should not pause when disabled
  });

  test('should handle pause system enable', () => {
    pauseSystem.disable();
    pauseSystem.enable();
    
    mockInputManager.isKeyPressed.mockReturnValue(true);
    pauseSystem.update(16);
    
    expect(pauseSystem.isPaused).toBe(true); // Should work normally when enabled
  });
});