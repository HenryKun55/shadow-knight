import { RenderSystem } from '../../src/systems/RenderSystem.js';
import { Entity } from '../../src/core/Entity.js';
import { Position } from '../../src/components/Position.js';
import { Sprite } from '../../src/components/Sprite.js';
import { Player } from '../../src/components/Player.js';
import { Enemy } from '../../src/components/Enemy.js';
import { Collision } from '../../src/components/Collision.js';

describe('RenderSystem', () => {
  let renderSystem;
  let entities;
  let mockContext;
  let mockCamera;

  beforeEach(() => {
    // Mock canvas context
    mockContext = {
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      fillText: jest.fn(),
      measureText: jest.fn(() => ({ width: 100 })),
      setTransform: jest.fn(),
      globalAlpha: 1,
      fillStyle: '#000000',
      strokeStyle: '#000000',
      font: '16px Arial',
      textAlign: 'left',
      textBaseline: 'top'
    };

    // Mock camera
    mockCamera = {
      x: 0,
      y: 0
    };

    renderSystem = new RenderSystem(mockContext, mockCamera);
    entities = [];
  });

  test('should create RenderSystem with context and camera', () => {
    expect(renderSystem).toBeDefined();
    expect(renderSystem.ctx).toBe(mockContext);
    expect(renderSystem.camera).toBe(mockCamera);
  });

  test('should render entity with sprite', () => {
    const entity = new Entity();
    entity.addComponent('Position', new Position(100, 100));
    entity.addComponent('Sprite', new Sprite('player.png', 32, 32));
    
    entities.push(entity);

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    renderSystem.game = mockGame;

    renderSystem.update(16);

    expect(mockContext.save).toHaveBeenCalled();
    expect(mockContext.restore).toHaveBeenCalled();
  });

  test('should apply camera offset when rendering', () => {
    const entity = new Entity();
    entity.addComponent('Position', new Position(200, 150));
    entity.addComponent('Sprite', new Sprite('enemy.png', 24, 24));
    
    mockCamera.x = 50;
    mockCamera.y = 25;
    
    entities.push(entity);

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    renderSystem.game = mockGame;

    renderSystem.update(16);

    expect(mockContext.translate).toHaveBeenCalledWith(-50, -25);
  });

  test('should render player entity with health bar', () => {
    const entity = new Entity();
    entity.addComponent('Position', new Position(100, 100));
    entity.addComponent('Sprite', new Sprite('player.png', 32, 32));
    entity.addComponent('Player', new Player());
    
    entities.push(entity);

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    renderSystem.game = mockGame;

    renderSystem.update(16);

    expect(mockContext.fillRect).toHaveBeenCalled(); // Health bar background
  });

  test('should render enemy entity with different appearance', () => {
    const entity = new Entity();
    entity.addComponent('Position', new Position(200, 200));
    entity.addComponent('Sprite', new Sprite('enemy.png', 28, 28));
    entity.addComponent('Enemy', new Enemy('SHADOW_WARRIOR'));
    
    entities.push(entity);

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    renderSystem.game = mockGame;

    renderSystem.update(16);

    expect(mockContext.save).toHaveBeenCalled();
    expect(mockContext.restore).toHaveBeenCalled();
  });

  test('should render collision boxes in debug mode', () => {
    const entity = new Entity();
    entity.addComponent('Position', new Position(100, 100));
    entity.addComponent('Collision', new Collision(40, 40));
    
    entities.push(entity);

    // Enable debug mode
    renderSystem.debugMode = true;

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    renderSystem.game = mockGame;

    renderSystem.update(16);

    expect(mockContext.strokeRect).toHaveBeenCalled();
  });

  test('should not render collision boxes when debug mode is off', () => {
    const entity = new Entity();
    entity.addComponent('Position', new Position(100, 100));
    entity.addComponent('Collision', new Collision(40, 40));
    
    entities.push(entity);

    renderSystem.debugMode = false;

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    renderSystem.game = mockGame;

    renderSystem.update(16);

    expect(mockContext.strokeRect).not.toHaveBeenCalled();
  });

  test('should handle sprite transforms', () => {
    const entity = new Entity();
    entity.addComponent('Position', new Position(100, 100));
    
    const sprite = new Sprite('character.png', 32, 32);
    sprite.flipX = true;
    sprite.scale = 2.0;
    sprite.rotation = Math.PI / 4;
    sprite.opacity = 0.8;
    
    entity.addComponent('Sprite', sprite);
    entities.push(entity);

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    renderSystem.game = mockGame;

    renderSystem.update(16);

    expect(mockContext.scale).toHaveBeenCalledWith(-2.0, 2.0); // Flip X
    expect(mockContext.rotate).toHaveBeenCalledWith(Math.PI / 4);
    expect(mockContext.globalAlpha).toBe(0.8);
  });

  test('should handle entities without sprite component', () => {
    const entity = new Entity();
    entity.addComponent('Position', new Position(100, 100));
    // No sprite component
    
    entities.push(entity);

    expect(() => {
          // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    renderSystem.game = mockGame;

    renderSystem.update(16);
    }).not.toThrow();
  });

  test('should handle entities without position component', () => {
    const entity = new Entity();
    entity.addComponent('Sprite', new Sprite('test.png', 16, 16));
    // No position component
    
    entities.push(entity);

    expect(() => {
          // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    renderSystem.game = mockGame;

    renderSystem.update(16);
    }).not.toThrow();
  });

  test('should render multiple entities', () => {
    const entity1 = new Entity();
    entity1.addComponent('Position', new Position(50, 50));
    entity1.addComponent('Sprite', new Sprite('entity1.png', 20, 20));

    const entity2 = new Entity();
    entity2.addComponent('Position', new Position(150, 150));
    entity2.addComponent('Sprite', new Sprite('entity2.png', 30, 30));

    entities.push(entity1, entity2);

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    renderSystem.game = mockGame;

    renderSystem.update(16);

    expect(mockContext.save).toHaveBeenCalledTimes(2);
    expect(mockContext.restore).toHaveBeenCalledTimes(2);
  });

  test('should handle animated sprites', () => {
    const entity = new Entity();
    entity.addComponent('Position', new Position(100, 100));
    
    const sprite = new Sprite('animated.png', 32, 32);
    sprite.addAnimation('walk', [0, 1, 2, 3]);
    sprite.play('walk');
    sprite.currentFrame = 2;
    
    entity.addComponent('Sprite', sprite);
    entities.push(entity);

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    renderSystem.game = mockGame;

    renderSystem.update(16);

    expect(mockContext.save).toHaveBeenCalled();
  });

  test('should render damage numbers for enemies', () => {
    const entity = new Entity();
    entity.addComponent('Position', new Position(200, 200));
    entity.addComponent('Sprite', new Sprite('enemy.png', 32, 32));
    
    const enemy = new Enemy('SHADOW_WARRIOR');
    enemy.health = 30; // Damaged
    entity.addComponent('Enemy', enemy);
    
    entities.push(entity);

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    renderSystem.game = mockGame;

    renderSystem.update(16);

    // Should render health bar
    expect(mockContext.fillRect).toHaveBeenCalled();
  });

  test('should handle very large entities', () => {
    const entity = new Entity();
    entity.addComponent('Position', new Position(1000, 1000));
    entity.addComponent('Sprite', new Sprite('large.png', 200, 200));
    
    entities.push(entity);

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    renderSystem.game = mockGame;

    renderSystem.update(16);

    expect(mockContext.save).toHaveBeenCalled();
    expect(mockContext.restore).toHaveBeenCalled();
  });

  test('should handle negative positions', () => {
    const entity = new Entity();
    entity.addComponent('Position', new Position(-50, -100));
    entity.addComponent('Sprite', new Sprite('test.png', 32, 32));
    
    entities.push(entity);

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    renderSystem.game = mockGame;

    renderSystem.update(16);

    expect(mockContext.save).toHaveBeenCalled();
    expect(mockContext.restore).toHaveBeenCalled();
  });

  test('should toggle debug mode', () => {
    expect(renderSystem.debugMode).toBe(false);
    
    renderSystem.toggleDebug();
    expect(renderSystem.debugMode).toBe(true);
    
    renderSystem.toggleDebug();
    expect(renderSystem.debugMode).toBe(false);
  });

  test('should handle sprite with zero dimensions', () => {
    const entity = new Entity();
    entity.addComponent('Position', new Position(100, 100));
    entity.addComponent('Sprite', new Sprite('point.png', 0, 0));
    
    entities.push(entity);

    expect(() => {
          // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    renderSystem.game = mockGame;

    renderSystem.update(16);
    }).not.toThrow();
  });

  test('should apply sprite offset correctly', () => {
    const entity = new Entity();
    entity.addComponent('Position', new Position(100, 100));
    entity.addComponent('Sprite', new Sprite('offset.png', 32, 32));
    entity.addComponent('Collision', new Collision(20, 20, 10, -5)); // With offset
    
    entities.push(entity);
    renderSystem.debugMode = true;

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    renderSystem.game = mockGame;

    renderSystem.update(16);

    expect(mockContext.strokeRect).toHaveBeenCalled();
  });

  test('should handle context state properly', () => {
    const entity = new Entity();
    entity.addComponent('Position', new Position(100, 100));
    
    const sprite = new Sprite('test.png', 32, 32);
    sprite.opacity = 0.5;
    entity.addComponent('Sprite', sprite);
    
    entities.push(entity);

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    renderSystem.game = mockGame;

    renderSystem.update(16);

    expect(mockContext.save).toHaveBeenCalled();
    expect(mockContext.restore).toHaveBeenCalled();
    // After restore, globalAlpha should be reset
  });

  test('should render sorted by depth/layer if implemented', () => {
    const background = new Entity();
    background.addComponent('Position', new Position(0, 0));
    background.addComponent('Sprite', new Sprite('bg.png', 800, 600));

    const foreground = new Entity();
    foreground.addComponent('Position', new Position(100, 100));
    foreground.addComponent('Sprite', new Sprite('fg.png', 32, 32));

    entities.push(background, foreground);

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    renderSystem.game = mockGame;

    renderSystem.update(16);

    // Both should be rendered
    expect(mockContext.save).toHaveBeenCalledTimes(2);
  });
});