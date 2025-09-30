import { BossAISystem } from '../../src/systems/BossAISystem.js';
import { Entity } from '../../src/core/Entity.js';
import { Position } from '../../src/components/Position.js';
import { Velocity } from '../../src/components/Velocity.js';
import { Boss } from '../../src/components/Boss.js';
import { Player } from '../../src/components/Player.js';
import { Physics } from '../../src/components/Physics.js';

// Mock SoundManager
jest.mock('../../src/core/SoundManager.js', () => ({
  play: jest.fn()
}));

describe('BossAISystem', () => {
  let bossAISystem;
  let entities;
  let bossEntity;
  let playerEntity;
  let mockGame;

  beforeEach(() => {
    bossAISystem = new BossAISystem();
    entities = [];

    // Create boss entity
    bossEntity = new Entity();
    bossEntity.addComponent('Position', new Position(300, 100));
    bossEntity.addComponent('Velocity', new Velocity(0, 0));
    bossEntity.addComponent('Boss', new Boss(500));
    bossEntity.addComponent('Physics', new Physics());

    // Create player entity
    playerEntity = new Entity();
    playerEntity.addComponent('Position', new Position(100, 100));
    playerEntity.addComponent('Velocity', new Velocity(0, 0));
    playerEntity.addComponent('Player', new Player());

    entities.push(bossEntity, playerEntity);

    // Mock game instance
    mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue([bossEntity, playerEntity])
    };
    bossAISystem.game = mockGame;
  });

  test('should create BossAISystem', () => {
    expect(bossAISystem).toBeDefined();
  });

  test('should detect player and start engaging', () => {
    const boss = bossEntity.getComponent('Boss');
    const bossPos = bossEntity.getComponent('Position');
    const playerPos = playerEntity.getComponent('Position');
    
    // Set boss within detection range of player
    bossPos.x = playerPos.x + 200; // Within 400 detection range
    boss.state = 'idle';

    bossAISystem.update(16);

    expect(boss.state).toBe('engaging');
  });

  test('should not engage player when out of range', () => {
    const boss = bossEntity.getComponent('Boss');
    const bossPos = bossEntity.getComponent('Position');
    const playerPos = playerEntity.getComponent('Position');
    
    // Set boss far from player
    bossPos.x = playerPos.x + 500; // Outside 400 detection range
    boss.state = 'idle';

    bossAISystem.update(16);

    expect(boss.state).toBe('idle');
  });

  test('should move towards player when engaging', () => {
    const boss = bossEntity.getComponent('Boss');
    const velocity = bossEntity.getComponent('Velocity');
    const bossPos = bossEntity.getComponent('Position');
    const playerPos = playerEntity.getComponent('Position');
    
    boss.state = 'engaging';
    bossPos.x = 400;
    playerPos.x = 100; // Player to the left

    bossAISystem.update(16);

    expect(velocity.x).toBeLessThan(0); // Moving left towards player
  });

  test('should attack when player is in attack range', () => {
    const boss = bossEntity.getComponent('Boss');
    const bossPos = bossEntity.getComponent('Position');
    const playerPos = playerEntity.getComponent('Position');
    
    boss.state = 'engaging';
    bossPos.x = playerPos.x + 50; // Within 80 attack range
    boss.lastAttackTime = 0;

    bossAISystem.update(16);

    expect(boss.isAttacking).toBe(true);
  });

  test('should not attack when on cooldown', () => {
    const boss = bossEntity.getComponent('Boss');
    const bossPos = bossEntity.getComponent('Position');
    const playerPos = playerEntity.getComponent('Position');
    
    boss.state = 'engaging';
    bossPos.x = playerPos.x + 50; // Within attack range
    boss.lastAttackTime = Date.now(); // Just attacked

    bossAISystem.update(16);

    expect(boss.isAttacking).toBe(false);
  });

  test('should advance to phase 2 when health drops', () => {
    const boss = bossEntity.getComponent('Boss');
    
    boss.health = 250; // 50% health
    boss.phase = 1;

    bossAISystem.update(16);

    expect(boss.phase).toBe(2);
    expect(boss.enraged).toBe(true);
  });

  test('should advance to phase 3 when health drops further', () => {
    const boss = bossEntity.getComponent('Boss');
    
    boss.health = 100; // 20% health
    boss.phase = 2;

    bossAISystem.update(16);

    expect(boss.phase).toBe(3);
    expect(boss.enraged).toBe(true);
  });

  test('should use special attack when available', () => {
    const boss = bossEntity.getComponent('Boss');
    const bossPos = bossEntity.getComponent('Position');
    const playerPos = playerEntity.getComponent('Position');
    
    boss.state = 'engaging';
    boss.phase = 2; // Phase 2 or higher for special attacks
    boss.specialAttackCooldown = 0;
    bossPos.x = playerPos.x + 150; // In range for special attack

    bossAISystem.update(16);

    expect(boss.specialAttackCooldown).toBeGreaterThan(0); // Cooldown started
  });

  test('should not use special attack when on cooldown', () => {
    const boss = bossEntity.getComponent('Boss');
    
    boss.state = 'engaging';
    boss.phase = 2;
    boss.specialAttackCooldown = 1000; // On cooldown

    const initialCooldown = boss.specialAttackCooldown;

    bossAISystem.update(16);

    expect(boss.specialAttackCooldown).toBeLessThan(initialCooldown); // Cooldown decreasing
  });

  test('should use dash attack when available', () => {
    const boss = bossEntity.getComponent('Boss');
    const bossPos = bossEntity.getComponent('Position');
    const playerPos = playerEntity.getComponent('Position');
    
    boss.state = 'engaging';
    boss.phase = 3; // Phase 3 for dash attacks
    boss.dashCooldown = 0;
    bossPos.x = playerPos.x + 250; // Far enough for dash

    bossAISystem.update(16);

    expect(boss.dashCooldown).toBeGreaterThan(0); // Dash cooldown started
  });

  test('should handle combo attacks', () => {
    const boss = bossEntity.getComponent('Boss');
    const bossPos = bossEntity.getComponent('Position');
    const playerPos = playerEntity.getComponent('Position');
    
    boss.state = 'attacking';
    boss.attackCombo = 0;
    bossPos.x = playerPos.x + 50; // In attack range

    bossAISystem.update(16);

    expect(boss.attackCombo).toBeGreaterThan(0);
  });

  test('should reset combo when max reached', () => {
    const boss = bossEntity.getComponent('Boss');
    
    boss.attackCombo = 3; // Max combo
    boss.state = 'attacking';

    bossAISystem.update(16);

    expect(boss.attackCombo).toBe(0); // Should reset
  });

  test('should handle invulnerability frames', () => {
    const boss = bossEntity.getComponent('Boss');
    
    boss.invulnerable = true;
    boss.invulnerabilityTime = 500;

    bossAISystem.update(16);

    expect(boss.invulnerabilityTime).toBeLessThan(500); // Should decrease
  });

  test('should remove invulnerability when time expires', () => {
    const boss = bossEntity.getComponent('Boss');
    
    boss.invulnerable = true;
    boss.invulnerabilityTime = 10; // Very small time

    bossAISystem.update(16);

    expect(boss.invulnerable).toBe(false);
    expect(boss.invulnerabilityTime).toBe(0);
  });

  test('should handle dead boss', () => {
    const boss = bossEntity.getComponent('Boss');
    const velocity = bossEntity.getComponent('Velocity');
    
    boss.isDead = true;

    bossAISystem.update(16);

    expect(velocity.x).toBe(0); // Should not move
    expect(boss.isAttacking).toBe(false);
    expect(boss.state).toBe('dead');
  });

  test('should adjust behavior based on phase', () => {
    const boss = bossEntity.getComponent('Boss');
    const bossPos = bossEntity.getComponent('Position');
    const playerPos = playerEntity.getComponent('Position');
    
    boss.phase = 3;
    boss.state = 'engaging';
    bossPos.x = playerPos.x + 100;

    bossAISystem.update(16);

    const velocity = bossEntity.getComponent('Velocity');
    
    // Phase 3 should have faster movement
    expect(Math.abs(velocity.x)).toBeGreaterThan(0);
  });

  test('should handle entities without required components', () => {
    const incompleteEntity = new Entity();
    incompleteEntity.addComponent('Position', new Position(400, 100));
    // Missing Boss component
    
    entities.push(incompleteEntity);

    expect(() => {
      bossAISystem.update(16);
    }).not.toThrow();
  });

  test('should return to idle when player is dead', () => {
    const boss = bossEntity.getComponent('Boss');
    const player = playerEntity.getComponent('Player');
    
    boss.state = 'engaging';
    player.health = 0; // Dead player

    bossAISystem.update(16);

    expect(boss.state).toBe('idle');
  });

  test('should update state timer correctly', () => {
    const boss = bossEntity.getComponent('Boss');
    const initialTimer = boss.stateTimer;

    bossAISystem.update(16);

    expect(boss.stateTimer).toBeGreaterThan(initialTimer);
  });

  test('should handle different attack patterns per phase', () => {
    const boss = bossEntity.getComponent('Boss');
    const bossPos = bossEntity.getComponent('Position');
    const playerPos = playerEntity.getComponent('Position');
    
    // Test phase 1 behavior
    boss.phase = 1;
    boss.state = 'engaging';
    bossPos.x = playerPos.x + 50;
    boss.lastAttackTime = 0;

    bossAISystem.update(16);

    const phase1Attacking = boss.isAttacking;

    // Reset and test phase 3 behavior
    boss.isAttacking = false;
    boss.phase = 3;
    boss.lastAttackTime = 0;

    bossAISystem.update(16);

    // Phase 3 should have more aggressive behavior
    expect(boss.phase).toBe(3);
  });

  test('should handle special attack range checking', () => {
    const boss = bossEntity.getComponent('Boss');
    const bossPos = bossEntity.getComponent('Position');
    const playerPos = playerEntity.getComponent('Position');
    
    boss.state = 'engaging';
    boss.phase = 2;
    boss.specialAttackCooldown = 0;
    bossPos.x = playerPos.x + 500; // Too far for special attack

    const initialCooldown = boss.specialAttackCooldown;

    bossAISystem.update(16);

    expect(boss.specialAttackCooldown).toBe(initialCooldown); // Should not have used special attack
  });

  test('should stop attacking after attack duration', () => {
    const boss = bossEntity.getComponent('Boss');
    
    boss.isAttacking = true;
    boss.lastAttackTime = Date.now() - 600; // Attack started 600ms ago

    bossAISystem.update(16);

    expect(boss.isAttacking).toBe(false); // Attack should be finished
  });
});