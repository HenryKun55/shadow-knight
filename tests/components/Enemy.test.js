import { Enemy } from '../../src/components/Enemy.js';

describe('Enemy Component', () => {
  test('should create enemy with valid type', () => {
    const enemy = new Enemy('SHADOW_WARRIOR');
    
    expect(enemy.type).toBe('SHADOW_WARRIOR');
    expect(enemy.health).toBe(60);
    expect(enemy.maxHealth).toBe(60);
    expect(enemy.speed).toBe(60);
    expect(enemy.attackDamage).toBe(25);
    expect(enemy.detectionRange).toBe(250);
    expect(enemy.attackRange).toBe(50);
    expect(enemy.color).toBe('#ff4757');
    expect(enemy.isDead).toBe(false);
    expect(enemy.isAttacking).toBe(false);
    expect(enemy.lastAttackTime).toBe(0);
    expect(enemy.patrolDirection).toBe(1);
    expect(enemy.originalX).toBe(0);
    expect(enemy.state).toBe('patrol');
    expect(enemy.stateTimer).toBe(0);
    expect(enemy.aggro).toBe(false);
  });

  test('should create SHADOW_ASSASSIN enemy', () => {
    const enemy = new Enemy('SHADOW_ASSASSIN');
    
    expect(enemy.type).toBe('SHADOW_ASSASSIN');
    expect(enemy.health).toBe(40);
    expect(enemy.maxHealth).toBe(40);
    expect(enemy.speed).toBe(120);
    expect(enemy.attackDamage).toBe(30);
    expect(enemy.detectionRange).toBe(300);
    expect(enemy.attackRange).toBe(35);
    expect(enemy.color).toBe('#5f27cd');
  });

  test('should create ARMORED_KNIGHT enemy', () => {
    const enemy = new Enemy('ARMORED_KNIGHT');
    
    expect(enemy.type).toBe('ARMORED_KNIGHT');
    expect(enemy.health).toBe(100);
    expect(enemy.maxHealth).toBe(100);
    expect(enemy.speed).toBe(40);
    expect(enemy.attackDamage).toBe(35);
    expect(enemy.detectionRange).toBe(180);
    expect(enemy.attackRange).toBe(60);
    expect(enemy.color).toBe('#747d8c');
  });

  test('should throw error for invalid enemy type', () => {
    expect(() => {
      new Enemy('INVALID_TYPE');
    }).toThrow('Unknown enemy type: INVALID_TYPE');
  });

  test('should take damage correctly', () => {
    const enemy = new Enemy('SHADOW_WARRIOR');
    
    enemy.takeDamage(20);
    
    expect(enemy.health).toBe(40);
    expect(enemy.isDead).toBe(false);
  });

  test('should die when health reaches zero', () => {
    const enemy = new Enemy('SHADOW_WARRIOR');
    
    enemy.takeDamage(60);
    
    expect(enemy.health).toBe(0);
    expect(enemy.isDead).toBe(true);
  });

  test('should not go below zero health', () => {
    const enemy = new Enemy('SHADOW_WARRIOR');
    
    enemy.takeDamage(100); // More than max health
    
    expect(enemy.health).toBe(0);
    expect(enemy.isDead).toBe(true);
  });

  test('should not take damage when already dead', () => {
    const enemy = new Enemy('SHADOW_WARRIOR');
    enemy.takeDamage(60); // Kill the enemy
    
    const healthBeforeDamage = enemy.health;
    enemy.takeDamage(10); // Try to damage dead enemy
    
    expect(enemy.health).toBe(healthBeforeDamage);
  });

  test('should heal correctly', () => {
    const enemy = new Enemy('SHADOW_WARRIOR');
    enemy.takeDamage(30); // Health becomes 30
    
    enemy.heal(15);
    
    expect(enemy.health).toBe(45);
  });

  test('should not heal above max health', () => {
    const enemy = new Enemy('SHADOW_WARRIOR');
    
    enemy.heal(20); // Try to heal above max
    
    expect(enemy.health).toBe(60); // Should remain at max
  });

  test('should not heal when dead', () => {
    const enemy = new Enemy('SHADOW_WARRIOR');
    enemy.takeDamage(60); // Kill the enemy
    
    enemy.heal(30);
    
    expect(enemy.health).toBe(0);
    expect(enemy.isDead).toBe(true);
  });

  test('should check if alive correctly', () => {
    const enemy = new Enemy('SHADOW_WARRIOR');
    
    expect(enemy.isAlive()).toBe(true);
    
    enemy.takeDamage(60);
    
    expect(enemy.isAlive()).toBe(false);
  });

  test('should check if can attack correctly', () => {
    const enemy = new Enemy('SHADOW_WARRIOR');
    
    expect(enemy.canAttack()).toBe(true);
    
    enemy.isAttacking = true;
    expect(enemy.canAttack()).toBe(false);
    
    enemy.isAttacking = false;
    enemy.isDead = true;
    expect(enemy.canAttack()).toBe(false);
  });

  test('should update state timer', () => {
    const enemy = new Enemy('SHADOW_WARRIOR');
    
    enemy.stateTimer = 100;
    enemy.updateStateTimer(50);
    
    expect(enemy.stateTimer).toBe(150);
  });

  test('should reset state timer', () => {
    const enemy = new Enemy('SHADOW_WARRIOR');
    enemy.stateTimer = 500;
    
    enemy.resetStateTimer();
    
    expect(enemy.stateTimer).toBe(0);
  });

  test('should change state correctly', () => {
    const enemy = new Enemy('SHADOW_WARRIOR');
    
    enemy.setState('chase');
    
    expect(enemy.state).toBe('chase');
    expect(enemy.stateTimer).toBe(0); // Should reset timer
  });

  test('should set original position', () => {
    const enemy = new Enemy('SHADOW_WARRIOR');
    
    enemy.setOriginalPosition(150);
    
    expect(enemy.originalX).toBe(150);
  });

  test('should reverse patrol direction', () => {
    const enemy = new Enemy('SHADOW_WARRIOR');
    
    expect(enemy.patrolDirection).toBe(1);
    
    enemy.reversePatrolDirection();
    
    expect(enemy.patrolDirection).toBe(-1);
    
    enemy.reversePatrolDirection();
    
    expect(enemy.patrolDirection).toBe(1);
  });

  test('should activate aggro', () => {
    const enemy = new Enemy('SHADOW_WARRIOR');
    
    expect(enemy.aggro).toBe(false);
    
    enemy.activateAggro();
    
    expect(enemy.aggro).toBe(true);
  });

  test('should deactivate aggro', () => {
    const enemy = new Enemy('SHADOW_WARRIOR');
    enemy.activateAggro();
    
    enemy.deactivateAggro();
    
    expect(enemy.aggro).toBe(false);
  });

  test('should get health percentage', () => {
    const enemy = new Enemy('SHADOW_WARRIOR');
    
    expect(enemy.getHealthPercentage()).toBe(1.0);
    
    enemy.takeDamage(30); // Health becomes 30/60
    
    expect(enemy.getHealthPercentage()).toBe(0.5);
    
    enemy.takeDamage(30); // Health becomes 0/60
    
    expect(enemy.getHealthPercentage()).toBe(0.0);
  });
});