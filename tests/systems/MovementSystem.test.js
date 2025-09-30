import { MovementSystem } from '../../src/systems/MovementSystem.js';
import { Entity } from '../../src/core/Entity.js';
import { Position } from '../../src/components/Position.js';
import { Velocity } from '../../src/components/Velocity.js';
import { Physics } from '../../src/components/Physics.js';

describe('MovementSystem', () => {
  let movementSystem;
  let entities;

  beforeEach(() => {
    movementSystem = new MovementSystem();
    entities = [];
  });

  test('should update entity position based on velocity', () => {
    const entity = new Entity();
    entity.addComponent('Position', new Position(0, 0));
    entity.addComponent('Velocity', new Velocity(10, 5));
    entity.addComponent('Physics', new Physics());
    entities.push(entity);

    // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([entity])
    };
    movementSystem.game = mockGame;

    const deltaTime = 1000; // 1 second
    movementSystem.update(deltaTime);

    const position = entity.getComponent('Position');
    // X movement with air resistance: 10 * 0.98 = 9.8
    expect(position.x).toBe(9.8);
    // Y movement: initial velocity 5 + gravity 980 = 985 (no air resistance on Y)
    expect(position.y).toBe(985);
  });

  test('should apply gravity to entities with physics', () => {
    const entity = new Entity();
    entity.addComponent('Position', new Position(0, 100));
    entity.addComponent('Velocity', new Velocity(0, 0));
    entity.addComponent('Physics', new Physics());
    entities.push(entity);

    // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([entity])
    };
    movementSystem.game = mockGame;

    const deltaTime = 100; // 0.1 second
    movementSystem.update(deltaTime);

    const velocity = entity.getComponent('Velocity');
    expect(velocity.y).toBeGreaterThan(0); // Should fall down
  });

  test('should not apply gravity to grounded entities', () => {
    const entity = new Entity();
    entity.addComponent('Position', new Position(0, 620)); // Ground level
    entity.addComponent('Velocity', new Velocity(0, 0));
    const physics = new Physics();
    physics.onGround = true;
    entity.addComponent('Physics', physics);
    entities.push(entity);

    // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([entity])
    };
    movementSystem.game = mockGame;

    const deltaTime = 100;
    movementSystem.update(deltaTime);

    const velocity = entity.getComponent('Velocity');
    expect(velocity.y).toBe(0); // Should not fall
  });

  test('should apply friction to grounded entities', () => {
    const entity = new Entity();
    entity.addComponent('Position', new Position(0, 620));
    entity.addComponent('Velocity', new Velocity(100, 0));
    const physics = new Physics();
    physics.onGround = true;
    entity.addComponent('Physics', physics);
    entities.push(entity);

    // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([entity])
    };
    movementSystem.game = mockGame;

    const deltaTime = 100;
    movementSystem.update(deltaTime);

    const velocity = entity.getComponent('Velocity');
    // Should apply ground friction: 100 * 0.6 = 60
    expect(velocity.x).toBe(60);
  });

  test('should apply air resistance to airborne entities', () => {
    const entity = new Entity();
    entity.addComponent('Position', new Position(0, 100));
    entity.addComponent('Velocity', new Velocity(100, 0));
    const physics = new Physics();
    physics.onGround = false;
    entity.addComponent('Physics', physics);
    entities.push(entity);

    // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([entity])
    };
    movementSystem.game = mockGame;

    const deltaTime = 100;
    movementSystem.update(deltaTime);

    const velocity = entity.getComponent('Velocity');
    // Should apply air resistance: 100 * 0.98 = 98
    expect(velocity.x).toBe(98);
  });

  test('should not update entities without position component', () => {
    const entity = new Entity();
    entity.addComponent('Velocity', new Velocity(10, 5));
    entity.addComponent('Physics', new Physics());
    entities.push(entity);

    // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([entity])
    };
    movementSystem.game = mockGame;

    const deltaTime = 100;
    // Should not throw error
    expect(() => movementSystem.update(deltaTime)).not.toThrow();
  });

  test('should not update entities without velocity component', () => {
    const entity = new Entity();
    entity.addComponent('Position', new Position(0, 0));
    entity.addComponent('Physics', new Physics());
    entities.push(entity);

    // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([entity])
    };
    movementSystem.game = mockGame;

    const deltaTime = 100;
    // Should not throw error
    expect(() => movementSystem.update(deltaTime)).not.toThrow();
  });

  test('should update entities without physics component', () => {
    const entity = new Entity();
    entity.addComponent('Position', new Position(0, 0));
    entity.addComponent('Velocity', new Velocity(10, 5));
    entities.push(entity);

    // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([entity])
    };
    movementSystem.game = mockGame;

    const deltaTime = 1000; // 1 second
    movementSystem.update(deltaTime);

    const position = entity.getComponent('Position');
    // Without physics, just basic movement
    expect(position.x).toBe(10);
    expect(position.y).toBe(5);
  });

  test('should handle multiple entities', () => {
    const entity1 = new Entity();
    entity1.addComponent('Position', new Position(0, 0));
    entity1.addComponent('Velocity', new Velocity(5, 0));
    
    const entity2 = new Entity();
    entity2.addComponent('Position', new Position(10, 10));
    entity2.addComponent('Velocity', new Velocity(3, 2));
    
    entities.push(entity1, entity2);

    // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    movementSystem.game = mockGame;

    const deltaTime = 1000; // 1 second
    movementSystem.update(deltaTime);

    const position1 = entity1.getComponent('Position');
    const position2 = entity2.getComponent('Position');
    
    expect(position1.x).toBe(5);
    expect(position1.y).toBe(0);
    expect(position2.x).toBe(13);
    expect(position2.y).toBe(12);
  });
});