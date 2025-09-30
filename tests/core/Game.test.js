import { Game } from '../../src/core/Game.js';

// Mock SoundManager
jest.mock('../../src/core/SoundManager.js', () => ({
  SoundManager: jest.fn().mockImplementation(() => ({
    preload: jest.fn().mockResolvedValue(),
    setMasterVolume: jest.fn(),
    setBGMVolume: jest.fn(),
    setSFXVolume: jest.fn(),
    play: jest.fn(),
    stop: jest.fn()
  }))
}));

// Mock canvas context
const mockContext = {
  clearRect: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn()
  })),
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  drawImage: jest.fn(),
  fillStyle: '#000000',
  strokeStyle: '#000000',
  textAlign: 'left',
  textBaseline: 'top',
  imageSmoothingEnabled: false
};

// Mock canvas
const mockCanvas = {
  getContext: jest.fn(() => mockContext),
  width: 1280,
  height: 720,
  style: {}
};

// Mock document.createElement for background canvas
global.document = {
  createElement: jest.fn((tag) => {
    if (tag === 'canvas') {
      return {
        getContext: jest.fn(() => mockContext),
        width: 0,
        height: 0,
        style: {}
      };
    }
    return {
      style: {},
      appendChild: jest.fn(),
      removeChild: jest.fn()
    };
  }),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    style: {}
  },
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(() => []),
  getElementById: jest.fn()
};

// Mock window
global.window = {
  ...global.window,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  innerWidth: 1920,
  innerHeight: 1080,
  getCurrentResolution: jest.fn(() => 'fullHD')
};

describe('Game', () => {
  let game;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create game instance
    game = new Game(mockCanvas);
  });

  afterEach(() => {
    if (game && game.isRunning) {
      game.stop();
    }
  });

  test('should create game instance with canvas', () => {
    expect(game).toBeDefined();
    expect(game.canvas).toBe(mockCanvas);
    expect(game.ctx).toBe(mockContext);
    expect(game.isRunning).toBe(false);
  });

  test('should initialize with default values', () => {
    expect(game.entities.size).toBe(0);
    expect(game.systems).toEqual([]);
    expect(game.camera).toBeDefined();
    expect(game.camera.x).toBe(0);
    expect(game.camera.y).toBe(0);
  });

  test('should add entities correctly', () => {
    const mockEntity = { id: 1, components: new Map() };
    
    game.addEntity(mockEntity);
    
    expect(game.entities.has(mockEntity.id)).toBe(true);
    expect(game.entities.size).toBe(1);
  });

  test('should remove entities correctly', () => {
    const mockEntity = { 
      id: 1, 
      components: new Map(),
      destroy: jest.fn() 
    };
    
    game.addEntity(mockEntity);
    expect(game.entities.size).toBe(1);
    
    game.removeEntity(mockEntity.id);
    expect(game.entities.size).toBe(0);
    expect(mockEntity.destroy).toHaveBeenCalled();
  });

  test('should add systems correctly', () => {
    const mockSystem = { 
      update: jest.fn(),
      name: 'TestSystem'
    };
    
    game.addSystem(mockSystem);
    
    expect(game.systems).toContain(mockSystem);
    expect(game.systems.length).toBe(1);
  });

  test('should update camera position', () => {
    const mockEntity = {
      id: 'player',
      getComponent: jest.fn((name) => {
        if (name === 'Position') return { x: 500, y: 300 };
        return null;
      })
    };
    
    game.setCameraTarget(mockEntity);
    game.updateCamera();
    
    // Camera should move towards target with smoothing
    expect(game.camera.x).toBeGreaterThan(0);
    expect(game.camera.y).toBeGreaterThan(0);
  });

  test('should constrain camera to world bounds', () => {
    game.camera.x = -1000; // Way outside bounds
    game.camera.y = -1000;
    
    game.updateCamera();
    
    expect(game.camera.x).toBeGreaterThanOrEqual(0);
    expect(game.camera.y).toBeGreaterThanOrEqual(0);
  });

  test('should handle start and stop correctly', async () => {
    expect(game.isRunning).toBe(false);
    
    await game.start();
    expect(game.isRunning).toBe(true);
    
    game.stop();
    expect(game.isRunning).toBe(false);
  });

  test('should call systems update on game loop', () => {
    const mockSystem = { 
      update: jest.fn(),
      name: 'TestSystem'
    };
    
    game.addSystem(mockSystem);
    game.update(16); // 16ms delta time
    
    expect(mockSystem.update).toHaveBeenCalledWith(16);
  });

  test('should clear canvas on render', () => {
    game.render();
    
    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 1280, 720);
  });

  test('should handle error in update gracefully', () => {
    const errorSystem = {
      update: jest.fn(() => { throw new Error('Test error'); }),
      name: 'ErrorSystem'
    };
    
    game.addSystem(errorSystem);
    
    // Should not throw
    expect(() => {
      game.update(16);
    }).not.toThrow();
  });

  test('should cap delta time to prevent huge jumps', () => {
    const mockSystem = { 
      update: jest.fn(),
      name: 'TestSystem'
    };
    
    game.addSystem(mockSystem);
    game.update(5000); // Very large delta time
    
    // Should be capped to reasonable value
    expect(mockSystem.update).toHaveBeenCalledWith(expect.any(Number));
    const deltaTime = mockSystem.update.mock.calls[0][0];
    expect(deltaTime).toBeLessThanOrEqual(100); // Should be capped
  });
});