import { EnemyAISystem } from '../../src/systems/EnemyAISystem.js';
import { Entity } from '../../src/core/Entity.js';
import { Position } from '../../src/components/Position.js';
import { Velocity } from '../../src/components/Velocity.js';
import { Enemy } from '../../src/components/Enemy.js';
import { Player } from '../../src/components/Player.js';
import { Physics } from '../../src/components/Physics.js';

describe('EnemyAISystem', () => {
  let enemyAISystem;
  let entities;
  let enemyEntity;
  let playerEntity;

  beforeEach(() => {
    enemyAISystem = new EnemyAISystem();
    entities = [];

    // Create enemy entity
    enemyEntity = new Entity();
    enemyEntity.addComponent('Position', new Position(200, 100));
    enemyEntity.addComponent('Velocity', new Velocity(0, 0));
    enemyEntity.addComponent('Enemy', new Enemy('SHADOW_WARRIOR'));
    enemyEntity.addComponent('Physics', new Physics());

    // Create player entity
    playerEntity = new Entity();
    playerEntity.addComponent('Position', new Position(100, 100));
    playerEntity.addComponent('Velocity', new Velocity(0, 0));
    playerEntity.addComponent('Player', new Player());

    entities.push(enemyEntity, playerEntity);
  });

  test('should create EnemyAISystem', () => {
    expect(enemyAISystem).toBeDefined();
  });

  test('should detect player in range and start chasing', () => {
    const enemy = enemyEntity.getComponent('Enemy');
    const enemyPos = enemyEntity.getComponent('Position');
    const playerPos = playerEntity.getComponent('Position');
    
    // Set enemy within detection range of player
    enemyPos.x = playerPos.x + 100; // Within 250 detection range
    enemy.state = 'patrol';

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([enemyEntity, playerEntity])
    };
    enemyAISystem.game = mockGame;

    enemyAISystem.update(16);

    expect(enemy.state).toBe('chase');
    expect(enemy.aggro).toBe(true);
  });

  test('should not detect player when out of range', () => {
    const enemy = enemyEntity.getComponent('Enemy');
    const enemyPos = enemyEntity.getComponent('Position');
    const playerPos = playerEntity.getComponent('Position');
    
    // Set enemy far from player
    enemyPos.x = playerPos.x + 300; // Outside 250 detection range
    enemy.state = 'patrol';

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([enemyEntity, playerEntity])
    };
    enemyAISystem.game = mockGame;

    enemyAISystem.update(16);

    expect(enemy.state).toBe('patrol');
    expect(enemy.aggro).toBe(false);
  });

  test('should patrol when not chasing player', () => {
    const enemy = enemyEntity.getComponent('Enemy');
    const velocity = enemyEntity.getComponent('Velocity');
    
    enemy.state = 'patrol';
    enemy.patrolDirection = 1;

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([enemyEntity, playerEntity])
    };
    enemyAISystem.game = mockGame;

    enemyAISystem.update(16);

    expect(velocity.x).toBeGreaterThan(0); // Moving right
  });

  test('should reverse patrol direction at boundaries', () => {
    const enemy = enemyEntity.getComponent('Enemy');
    const enemyPos = enemyEntity.getComponent('Position');
    
    enemy.state = 'patrol';
    enemy.patrolDirection = 1;
    enemy.originalX = 200;
    enemyPos.x = 300; // At patrol boundary

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([enemyEntity, playerEntity])
    };
    enemyAISystem.game = mockGame;

    enemyAISystem.update(16);

    expect(enemy.patrolDirection).toBe(-1);
  });

  test('should move towards player when chasing', () => {
    const enemy = enemyEntity.getComponent('Enemy');
    const velocity = enemyEntity.getComponent('Velocity');
    const enemyPos = enemyEntity.getComponent('Position');
    const playerPos = playerEntity.getComponent('Position');
    
    enemy.state = 'chase';
    enemyPos.x = 300;
    playerPos.x = 100; // Player to the left

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([enemyEntity, playerEntity])
    };
    enemyAISystem.game = mockGame;

    enemyAISystem.update(16);

    expect(velocity.x).toBeLessThan(0); // Moving left towards player
  });

  test('should attack when player is in attack range', () => {
    const enemy = enemyEntity.getComponent('Enemy');
    const enemyPos = enemyEntity.getComponent('Position');
    const playerPos = playerEntity.getComponent('Position');
    
    enemy.state = 'chase';
    enemyPos.x = playerPos.x + 30; // Within 50 attack range
    enemy.lastAttackTime = 0;

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([enemyEntity, playerEntity])
    };
    enemyAISystem.game = mockGame;

    enemyAISystem.update(16);

    expect(enemy.isAttacking).toBe(true);
  });

  test('should not attack when on cooldown', () => {
    const enemy = enemyEntity.getComponent('Enemy');
    const enemyPos = enemyEntity.getComponent('Position');
    const playerPos = playerEntity.getComponent('Position');
    
    enemy.state = 'chase';
    enemyPos.x = playerPos.x + 30; // Within attack range
    enemy.lastAttackTime = Date.now(); // Just attacked

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([enemyEntity, playerEntity])
    };
    enemyAISystem.game = mockGame;

    enemyAISystem.update(16);

    expect(enemy.isAttacking).toBe(false);
  });

  test('should return to patrol when losing player', () => {
    const enemy = enemyEntity.getComponent('Enemy');
    const enemyPos = enemyEntity.getComponent('Position');
    const playerPos = playerEntity.getComponent('Position');
    
    enemy.state = 'chase';
    enemy.stateTimer = 4000; // Beyond chase duration
    enemyPos.x = playerPos.x + 300; // Out of range

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([enemyEntity, playerEntity])
    };
    enemyAISystem.game = mockGame;

    enemyAISystem.update(16);

    expect(enemy.state).toBe('patrol');
    expect(enemy.aggro).toBe(false);
  });

  test('should update state timer correctly', () => {
    const enemy = enemyEntity.getComponent('Enemy');
    const initialTimer = enemy.stateTimer;
    
        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([enemyEntity, playerEntity])
    };
    enemyAISystem.game = mockGame;

    enemyAISystem.update(16);

    expect(enemy.stateTimer).toBeGreaterThan(initialTimer);
  });

  test('should handle dead enemies', () => {
    const enemy = enemyEntity.getComponent('Enemy');
    const velocity = enemyEntity.getComponent('Velocity');
    
    enemy.isDead = true;

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([enemyEntity, playerEntity])
    };
    enemyAISystem.game = mockGame;

    enemyAISystem.update(16);

    expect(velocity.x).toBe(0); // Should not move
    expect(enemy.isAttacking).toBe(false);
  });

  test('should handle different enemy types with different stats', () => {
    // Create SHADOW_ASSASSIN enemy (faster)
    const assassinEntity = new Entity();
    assassinEntity.addComponent('Position', new Position(400, 100));
    assassinEntity.addComponent('Velocity', new Velocity(0, 0));
    assassinEntity.addComponent('Enemy', new Enemy('SHADOW_ASSASSIN'));
    assassinEntity.addComponent('Physics', new Physics());
    
    entities.push(assassinEntity);

    const assassin = assassinEntity.getComponent('Enemy');
    assassin.state = 'patrol';

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([enemyEntity, playerEntity])
    };
    enemyAISystem.game = mockGame;

    enemyAISystem.update(16);

    const assassinVelocity = assassinEntity.getComponent('Velocity');
    const warriorVelocity = enemyEntity.getComponent('Velocity');

    // Assassin should move faster than warrior
    expect(Math.abs(assassinVelocity.x)).toBeGreaterThan(Math.abs(warriorVelocity.x));
  });

  test('should handle entities without required components', () => {
    const incompleteEntity = new Entity();
    incompleteEntity.addComponent('Position', new Position(300, 100));
    // Missing Enemy component
    
    entities.push(incompleteEntity);

    expect(() => {
          // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([enemyEntity, playerEntity])
    };
    enemyAISystem.game = mockGame;

    enemyAISystem.update(16);
    }).not.toThrow();
  });

  test('should stop chasing when player is dead', () => {
    const enemy = enemyEntity.getComponent('Enemy');
    const player = playerEntity.getComponent('Player');
    
    enemy.state = 'chase';
    player.health = 0; // Dead player

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([enemyEntity, playerEntity])
    };
    enemyAISystem.game = mockGame;

    enemyAISystem.update(16);

    expect(enemy.state).toBe('patrol');
    expect(enemy.aggro).toBe(false);
  });

  test('should maintain chase state when player is in range', () => {
    const enemy = enemyEntity.getComponent('Enemy');
    const enemyPos = enemyEntity.getComponent('Position');
    const playerPos = playerEntity.getComponent('Position');
    
    enemy.state = 'chase';
    enemy.stateTimer = 1000; // Has been chasing for a while
    enemyPos.x = playerPos.x + 100; // Still in detection range

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([enemyEntity, playerEntity])
    };
    enemyAISystem.game = mockGame;

    enemyAISystem.update(16);

    expect(enemy.state).toBe('chase'); // Should continue chasing
  });

  test('should handle vertical distance in detection', () => {
    const enemy = enemyEntity.getComponent('Enemy');
    const enemyPos = enemyEntity.getComponent('Position');
    const playerPos = playerEntity.getComponent('Position');
    
    // Player directly above enemy, but within detection range
    enemyPos.x = playerPos.x;
    enemyPos.y = playerPos.y + 150; // 150 pixels below
    enemy.state = 'patrol';

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([enemyEntity, playerEntity])
    };
    enemyAISystem.game = mockGame;

    enemyAISystem.update(16);

    expect(enemy.state).toBe('chase'); // Should detect player
  });

  test('should stop attacking after attack duration', () => {
    const enemy = enemyEntity.getComponent('Enemy');
    
    enemy.isAttacking = true;
    enemy.lastAttackTime = Date.now() - 400; // Attack started 400ms ago

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([enemyEntity, playerEntity])
    };
    enemyAISystem.game = mockGame;

    enemyAISystem.update(16);

    expect(enemy.isAttacking).toBe(false); // Attack should be finished
  });

  test('should handle multiple enemies independently', () => {
    // Create second enemy
    const enemy2Entity = new Entity();
    enemy2Entity.addComponent('Position', new Position(500, 100));
    enemy2Entity.addComponent('Velocity', new Velocity(0, 0));
    enemy2Entity.addComponent('Enemy', new Enemy('ARMORED_KNIGHT'));
    enemy2Entity.addComponent('Physics', new Physics());
    
    entities.push(enemy2Entity);

    const enemy1 = enemyEntity.getComponent('Enemy');
    const enemy2 = enemy2Entity.getComponent('Enemy');
    
    enemy1.state = 'chase';
    enemy2.state = 'patrol';

        // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([enemyEntity, playerEntity])
    };
    enemyAISystem.game = mockGame;

    enemyAISystem.update(16);

    // Each enemy should maintain its own state
    expect(enemy1.state).toBe('chase');
    expect(enemy2.state).toBe('patrol');
  });
});