import { CombatSystem } from '../../src/systems/CombatSystem.js';
import { Entity } from '../../src/core/Entity.js';
import { Position } from '../../src/components/Position.js';
import { Player } from '../../src/components/Player.js';
import { Enemy } from '../../src/components/Enemy.js';
import { Collision } from '../../src/components/Collision.js';

// Mock SoundManager
jest.mock('../../src/core/SoundManager.js', () => ({
  play: jest.fn()
}));

describe('CombatSystem', () => {
  let combatSystem;
  let entities;
  let playerEntity;
  let enemyEntity;
  let mockGame;

  beforeEach(() => {
    combatSystem = new CombatSystem();
    entities = [];

    // Create player entity
    playerEntity = new Entity();
    playerEntity.addComponent('Position', new Position(100, 100));
    playerEntity.addComponent('Player', new Player());
    playerEntity.addComponent('Collision', new Collision(30, 50));

    // Create enemy entity
    enemyEntity = new Entity();
    enemyEntity.addComponent('Position', new Position(150, 100));
    enemyEntity.addComponent('Enemy', new Enemy('GOBLIN'));
    enemyEntity.addComponent('Collision', new Collision(25, 40));

    entities.push(playerEntity, enemyEntity);

    // Mock game instance
    mockGame = {
      getEntitiesWithComponent: jest.fn().mockImplementation((componentName) => {
        if (componentName === 'Player') {
          return [playerEntity];
        } else if (componentName === 'Enemy') {
          return [enemyEntity];
        } else if (componentName === 'Position') {
          return [playerEntity, enemyEntity];
        } else if (componentName === 'Collision') {
          return [playerEntity, enemyEntity];
        }
        return [];
      })
    };
    combatSystem.game = mockGame;
  });

  test('should detect collision between player and enemy', () => {
    const player = playerEntity.getComponent('Player');
    const enemy = enemyEntity.getComponent('Enemy');
    const initialHealth = enemy.health;
    
    player.isAttacking = true;

    combatSystem.update(16);

    expect(enemy.health).toBeLessThan(initialHealth); // Should take damage
  });

  test('should not damage enemy when player is not attacking', () => {
    const player = playerEntity.getComponent('Player');
    player.isAttacking = false;

    const enemy = enemyEntity.getComponent('Enemy');
    const initialHealth = enemy.health;

    combatSystem.update(16);

    expect(enemy.health).toBe(initialHealth);
  });

  test('should damage player when enemy attacks', () => {
    const enemy = enemyEntity.getComponent('Enemy');
    enemy.isAttacking = true;

    const player = playerEntity.getComponent('Player');
    const initialHealth = player.health;

    combatSystem.update(16);

    expect(player.health).toBeLessThan(initialHealth);
  });

  test('should not damage invulnerable player', () => {
    const enemy = enemyEntity.getComponent('Enemy');
    enemy.isAttacking = true;

    const player = playerEntity.getComponent('Player');
    player.invulnerable = true;
    const initialHealth = player.health;

    combatSystem.update(16);

    expect(player.health).toBe(initialHealth);
  });

  test('should handle player parrying enemy attack', () => {
    const enemy = enemyEntity.getComponent('Enemy');
    enemy.isAttacking = true;

    const player = playerEntity.getComponent('Player');
    player.isParrying = true;
    const initialHealth = player.health;

    combatSystem.update(16);

    expect(player.health).toBe(initialHealth); // No damage from parry
    expect(enemy.isStunned()).toBe(true); // Enemy should be stunned
  });

  test('should handle multiple enemies attacking', () => {
    const enemy2 = new Entity();
    enemy2.addComponent('Position', new Position(50, 100));
    enemy2.addComponent('Enemy', new Enemy('GOBLIN'));
    enemy2.addComponent('Collision', new Collision(20, 35));

    const enemy2Component = enemy2.getComponent('Enemy');
    enemy2Component.isAttacking = true;

    entities.push(enemy2);
    mockGame.getEntitiesWithComponent.mockReturnValue([playerEntity, enemyEntity, enemy2]);

    const player = playerEntity.getComponent('Player');
    const initialHealth = player.health;

    combatSystem.update(16);

    expect(player.health).toBeLessThan(initialHealth);
  });

  test('should handle player dash attack', () => {
    const player = playerEntity.getComponent('Player');
    player.isDashing = true;

    const enemy = enemyEntity.getComponent('Enemy');
    const initialHealth = enemy.health;

    combatSystem.update(16);

    expect(enemy.health).toBeLessThan(initialHealth);
  });

  test('should not damage dead enemies', () => {
    const player = playerEntity.getComponent('Player');
    player.isAttacking = true;

    const enemy = enemyEntity.getComponent('Enemy');
    enemy.health = 0;

    combatSystem.update(16);

    expect(enemy.health).toBe(0); // Should remain 0
  });

  test('should handle combo attacks', () => {
    const player = playerEntity.getComponent('Player');
    player.isAttacking = true;
    player.comboCount = 2; // Combo attack

    const enemy = enemyEntity.getComponent('Enemy');
    const initialHealth = enemy.health;

    combatSystem.update(16);

    const damageDealt = initialHealth - enemy.health;
    expect(damageDealt).toBeGreaterThan(20); // Combo should do more damage
  });

  test('should handle critical hits', () => {
    const player = playerEntity.getComponent('Player');
    player.isAttacking = true;

    // Mock critical hit
    Math.random = jest.fn(() => 0.01); // Force critical hit

    const enemy = enemyEntity.getComponent('Enemy');
    const initialHealth = enemy.health;

    combatSystem.update(16);

    const damageDealt = initialHealth - enemy.health;
    expect(damageDealt).toBeGreaterThan(20); // Critical should do more damage
  });

  test('should handle entities without collision components', () => {
    const entityWithoutCollision = new Entity();
    entityWithoutCollision.addComponent('Position', new Position(200, 100));
    entityWithoutCollision.addComponent('Player', new Player());

    entities.push(entityWithoutCollision);
    mockGame.getEntitiesWithComponent.mockReturnValue([playerEntity, enemyEntity, entityWithoutCollision]);

    expect(() => {
      combatSystem.update(16);
    }).not.toThrow();
  });

  test('should handle collision detection edge cases', () => {
    // Position entities at exact boundaries
    const playerPos = playerEntity.getComponent('Position');
    const enemyPos = enemyEntity.getComponent('Position');
    
    playerPos.x = 100;
    enemyPos.x = 130; // Exactly at collision boundary

    const player = playerEntity.getComponent('Player');
    player.isAttacking = true;

    combatSystem.update(16);

    // Should handle boundary collision correctly
    expect(() => combatSystem.update(16)).not.toThrow();
  });

  test('should handle player death', () => {
    const enemy = enemyEntity.getComponent('Enemy');
    enemy.isAttacking = true;
    enemy.damage = 999; // High damage to kill player

    const player = playerEntity.getComponent('Player');
    player.health = 1; // Low health

    combatSystem.update(16);

    expect(player.health).toBe(0);
    expect(player.isDead()).toBe(true);
  });

  test('should handle enemy death', () => {
    const player = playerEntity.getComponent('Player');
    player.isAttacking = true;
    player.damage = 999; // High damage to kill enemy

    const enemy = enemyEntity.getComponent('Enemy');
    enemy.health = 1; // Low health

    combatSystem.update(16);

    expect(enemy.health).toBe(0);
    expect(enemy.isDead()).toBe(true);
  });

  test('should handle damage reduction from armor', () => {
    const player = playerEntity.getComponent('Player');
    player.armor = 10; // Some armor value

    const enemy = enemyEntity.getComponent('Enemy');
    enemy.isAttacking = true;
    enemy.damage = 30;

    const initialHealth = player.health;

    combatSystem.update(16);

    const damageDealt = initialHealth - player.health;
    expect(damageDealt).toBeLessThan(30); // Should be reduced by armor
  });

  test('should handle invulnerability frames correctly', () => {
    const player = playerEntity.getComponent('Player');
    player.invulnerabilityTime = 500; // Has i-frames

    const enemy = enemyEntity.getComponent('Enemy');
    enemy.isAttacking = true;

    const initialHealth = player.health;

    combatSystem.update(16);

    expect(player.health).toBe(initialHealth); // No damage during i-frames
    expect(player.invulnerabilityTime).toBeLessThan(500); // I-frames should decrease
  });

  test('should handle knockback effects', () => {
    const player = playerEntity.getComponent('Player');
    player.isAttacking = true;

    const enemyPos = enemyEntity.getComponent('Position');
    const initialX = enemyPos.x;

    combatSystem.update(16);

    // Enemy should be knocked back
    expect(enemyPos.x).not.toBe(initialX);
  });

  test('should handle special attack types', () => {
    const player = playerEntity.getComponent('Player');
    player.isAttacking = true;
    player.attackType = 'heavy'; // Special attack type

    const enemy = enemyEntity.getComponent('Enemy');
    const initialHealth = enemy.health;

    combatSystem.update(16);

    const damageDealt = initialHealth - enemy.health;
    expect(damageDealt).toBeGreaterThan(20); // Heavy attack should do more damage
  });

  test('should handle area of effect attacks', () => {
    // Create multiple enemies in range
    const enemy2 = new Entity();
    enemy2.addComponent('Position', new Position(120, 100));
    enemy2.addComponent('Enemy', new Enemy('GOBLIN'));
    enemy2.addComponent('Collision', new Collision(20, 35));

    entities.push(enemy2);
    mockGame.getEntitiesWithComponent.mockReturnValue([playerEntity, enemyEntity, enemy2]);

    const player = playerEntity.getComponent('Player');
    player.isAttacking = true;
    player.attackType = 'aoe'; // Area attack

    combatSystem.update(16);

    const enemy1 = enemyEntity.getComponent('Enemy');
    const enemy2Component = enemy2.getComponent('Enemy');

    // Both enemies should take damage
    expect(enemy1.health).toBeLessThan(40);
    expect(enemy2Component.health).toBeLessThan(30);
  });

  test('should handle status effects from combat', () => {
    const player = playerEntity.getComponent('Player');
    player.isAttacking = true;
    player.weaponType = 'poison'; // Poison weapon

    const enemy = enemyEntity.getComponent('Enemy');

    combatSystem.update(16);

    expect(enemy.statusEffects).toContain('poison');
  });
});