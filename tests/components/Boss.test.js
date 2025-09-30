import { Boss } from '../../src/components/Boss.js';

describe('Boss Component', () => {
  test('should create boss with default values', () => {
    const boss = new Boss();
    
    expect(boss.health).toBe(500);
    expect(boss.maxHealth).toBe(500);
    expect(boss.attackDamage).toBe(50);
    expect(boss.speed).toBe(80);
    expect(boss.detectionRange).toBe(400);
    expect(boss.attackRange).toBe(80);
    expect(boss.isDead).toBe(false);
    expect(boss.isAttacking).toBe(false);
    expect(boss.lastAttackTime).toBe(0);
    expect(boss.state).toBe('idle');
    expect(boss.stateTimer).toBe(0);
    expect(boss.phase).toBe(1);
    expect(boss.enraged).toBe(false);
    expect(boss.specialAttackCooldown).toBe(0);
    expect(boss.dashCooldown).toBe(0);
    expect(boss.attackCombo).toBe(0);
    expect(boss.maxCombo).toBe(3);
    expect(boss.invulnerable).toBe(false);
    expect(boss.invulnerabilityTime).toBe(0);
  });

  test('should create boss with custom health', () => {
    const boss = new Boss(800);
    
    expect(boss.health).toBe(800);
    expect(boss.maxHealth).toBe(800);
  });

  test('should take damage correctly', () => {
    const boss = new Boss(500);
    
    boss.takeDamage(100);
    
    expect(boss.health).toBe(400);
    expect(boss.isDead).toBe(false);
  });

  test('should die when health reaches zero', () => {
    const boss = new Boss(500);
    
    boss.takeDamage(500);
    
    expect(boss.health).toBe(0);
    expect(boss.isDead).toBe(true);
  });

  test('should not go below zero health', () => {
    const boss = new Boss(500);
    
    boss.takeDamage(600);
    
    expect(boss.health).toBe(0);
    expect(boss.isDead).toBe(true);
  });

  test('should not take damage when invulnerable', () => {
    const boss = new Boss(500);
    boss.invulnerable = true;
    
    boss.takeDamage(100);
    
    expect(boss.health).toBe(500); // No damage taken
  });

  test('should not take damage when already dead', () => {
    const boss = new Boss(500);
    boss.takeDamage(500); // Kill the boss
    
    const healthBefore = boss.health;
    boss.takeDamage(50);
    
    expect(boss.health).toBe(healthBefore);
  });

  test('should heal correctly', () => {
    const boss = new Boss(500);
    boss.takeDamage(200); // Health becomes 300
    
    boss.heal(100);
    
    expect(boss.health).toBe(400);
  });

  test('should not heal above max health', () => {
    const boss = new Boss(500);
    
    boss.heal(100);
    
    expect(boss.health).toBe(500); // Should remain at max
  });

  test('should not heal when dead', () => {
    const boss = new Boss(500);
    boss.takeDamage(500); // Kill the boss
    
    boss.heal(100);
    
    expect(boss.health).toBe(0);
    expect(boss.isDead).toBe(true);
  });

  test('should check if alive correctly', () => {
    const boss = new Boss(500);
    
    expect(boss.isAlive()).toBe(true);
    
    boss.takeDamage(500);
    
    expect(boss.isAlive()).toBe(false);
  });

  test('should check if can attack correctly', () => {
    const boss = new Boss();
    
    expect(boss.canAttack()).toBe(true);
    
    boss.isAttacking = true;
    expect(boss.canAttack()).toBe(false);
    
    boss.isAttacking = false;
    boss.isDead = true;
    expect(boss.canAttack()).toBe(false);
  });

  test('should advance to phase 2 when health drops below 60%', () => {
    const boss = new Boss(500);
    
    boss.takeDamage(250); // Health becomes 250 (50%)
    boss.updatePhase();
    
    expect(boss.phase).toBe(2);
    expect(boss.enraged).toBe(true);
  });

  test('should advance to phase 3 when health drops below 30%', () => {
    const boss = new Boss(500);
    
    boss.takeDamage(400); // Health becomes 100 (20%)
    boss.updatePhase();
    
    expect(boss.phase).toBe(3);
    expect(boss.enraged).toBe(true);
  });

  test('should not go backwards in phases', () => {
    const boss = new Boss(500);
    boss.phase = 3;
    boss.health = 400; // 80% health
    
    boss.updatePhase();
    
    expect(boss.phase).toBe(3); // Should remain at phase 3
  });

  test('should get health percentage correctly', () => {
    const boss = new Boss(500);
    
    expect(boss.getHealthPercentage()).toBe(1.0);
    
    boss.takeDamage(250);
    expect(boss.getHealthPercentage()).toBe(0.5);
    
    boss.takeDamage(250);
    expect(boss.getHealthPercentage()).toBe(0.0);
  });

  test('should check if can use special attack', () => {
    const boss = new Boss();
    
    expect(boss.canUseSpecialAttack()).toBe(true);
    
    boss.specialAttackCooldown = 1000;
    expect(boss.canUseSpecialAttack()).toBe(false);
    
    boss.specialAttackCooldown = 0;
    boss.isDead = true;
    expect(boss.canUseSpecialAttack()).toBe(false);
  });

  test('should check if can dash', () => {
    const boss = new Boss();
    
    expect(boss.canDash()).toBe(true);
    
    boss.dashCooldown = 1000;
    expect(boss.canDash()).toBe(false);
    
    boss.dashCooldown = 0;
    boss.isDead = true;
    expect(boss.canDash()).toBe(false);
  });

  test('should increment attack combo', () => {
    const boss = new Boss();
    
    boss.incrementCombo();
    expect(boss.attackCombo).toBe(1);
    
    boss.incrementCombo();
    expect(boss.attackCombo).toBe(2);
  });

  test('should reset combo when max reached', () => {
    const boss = new Boss();
    boss.attackCombo = 3; // Max combo
    
    boss.incrementCombo();
    
    expect(boss.attackCombo).toBe(0);
  });

  test('should reset combo manually', () => {
    const boss = new Boss();
    boss.attackCombo = 2;
    
    boss.resetCombo();
    
    expect(boss.attackCombo).toBe(0);
  });

  test('should set state correctly', () => {
    const boss = new Boss();
    
    boss.setState('attacking');
    
    expect(boss.state).toBe('attacking');
    expect(boss.stateTimer).toBe(0);
  });

  test('should update state timer', () => {
    const boss = new Boss();
    boss.stateTimer = 100;
    
    boss.updateStateTimer(50);
    
    expect(boss.stateTimer).toBe(150);
  });

  test('should reset state timer', () => {
    const boss = new Boss();
    boss.stateTimer = 500;
    
    boss.resetStateTimer();
    
    expect(boss.stateTimer).toBe(0);
  });

  test('should handle invulnerability', () => {
    const boss = new Boss();
    
    boss.makeInvulnerable(1000);
    
    expect(boss.invulnerable).toBe(true);
    expect(boss.invulnerabilityTime).toBe(1000);
  });

  test('should remove invulnerability', () => {
    const boss = new Boss();
    boss.makeInvulnerable(1000);
    
    boss.removeInvulnerability();
    
    expect(boss.invulnerable).toBe(false);
    expect(boss.invulnerabilityTime).toBe(0);
  });

  test('should start special attack cooldown', () => {
    const boss = new Boss();
    
    boss.startSpecialAttackCooldown(3000);
    
    expect(boss.specialAttackCooldown).toBe(3000);
  });

  test('should start dash cooldown', () => {
    const boss = new Boss();
    
    boss.startDashCooldown(2000);
    
    expect(boss.dashCooldown).toBe(2000);
  });

  test('should get current phase stats', () => {
    const boss = new Boss();
    
    // Phase 1
    let stats = boss.getCurrentPhaseStats();
    expect(stats.attackMultiplier).toBe(1.0);
    expect(stats.speedMultiplier).toBe(1.0);
    
    // Phase 2
    boss.phase = 2;
    stats = boss.getCurrentPhaseStats();
    expect(stats.attackMultiplier).toBe(1.3);
    expect(stats.speedMultiplier).toBe(1.2);
    
    // Phase 3
    boss.phase = 3;
    stats = boss.getCurrentPhaseStats();
    expect(stats.attackMultiplier).toBe(1.6);
    expect(stats.speedMultiplier).toBe(1.5);
  });
});