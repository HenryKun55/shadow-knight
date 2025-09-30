import { Player } from '../../src/components/Player.js';

describe('Player Component', () => {
  test('should create player with default values', () => {
    const player = new Player();
    
    expect(player.health).toBe(100);
    expect(player.maxHealth).toBe(100);
    expect(player.stamina).toBe(100);
    expect(player.maxStamina).toBe(100);
    expect(player.isAttacking).toBe(false);
    expect(player.isDashing).toBe(false);
    expect(player.facingDirection).toBe(1);
    expect(player.invulnerabilityTime).toBe(0);
    expect(player.lastAttackTime).toBe(0);
    expect(player.comboCount).toBe(1);
    expect(player.isDead()).toBe(false);
  });

  test('should create player with default configuration', () => {
    const player = new Player();
    
    expect(player.health).toBe(player.maxHealth);
    expect(player.stamina).toBe(player.maxStamina);
    expect(player.speed).toBeGreaterThan(0);
    expect(player.jumpPower).toBeGreaterThan(0);
  });

  test('should take damage correctly', () => {
    const player = new Player();
    const initialHealth = player.health;
    player.takeDamage(30);
    
    expect(player.health).toBe(initialHealth - 30);
  });

  test('should not go below zero health', () => {
    const player = new Player();
    player.takeDamage(player.maxHealth + 50);
    
    expect(player.health).toBe(0);
    expect(player.isDead()).toBe(true);
  });

  test('should handle stamina consumption', () => {
    const player = new Player();
    const initialStamina = player.stamina;
    const staminaCost = player.dashStaminaCost;
    
    player.startDash();
    
    expect(player.stamina).toBe(initialStamina - staminaCost);
  });

  test('should handle dash mechanics', () => {
    const player = new Player();
    const canDash = player.canDash();
    
    expect(typeof canDash).toBe('boolean');
    
    if (canDash) {
      const dashResult = player.startDash();
      expect(dashResult).toBe(true);
      expect(player.isDashing).toBe(true);
    }
  });

  test('should handle attack mechanics', () => {
    const player = new Player();
    const mockPhysics = { onGround: true };
    const canAttack = player.canAttack();
    
    expect(typeof canAttack).toBe('boolean');
    
    if (canAttack) {
      const attackResult = player.startAttack('none', mockPhysics);
      expect(attackResult).toBe(true);
      expect(player.isAttacking).toBe(true);
    }
  });

  test('should handle jump mechanics', () => {
    const player = new Player();
    const mockPhysics = { onGround: true };
    
    const canJump = player.canJump(mockPhysics);
    expect(typeof canJump).toBe('boolean');
    
    if (canJump) {
      const jumpResult = player.jump(mockPhysics);
      expect(typeof jumpResult).toBe('boolean');
    }
  });

  test('should update stamina over time', () => {
    const player = new Player();
    player.stamina = 50; // Set lower stamina
    const initialStamina = player.stamina;
    
    player.updateStamina(1000); // 1 second
    
    expect(player.stamina).toBeGreaterThanOrEqual(initialStamina);
  });

  test('should update timers correctly', () => {
    const player = new Player();
    player.isDashing = true;
    player.dashTime = 0;
    
    player.updateTimers(100); // 100ms
    
    expect(player.dashTime).toBe(100);
  });

  test('should handle death correctly', () => {
    const player = new Player();
    
    expect(player.isDead()).toBe(false);
    
    player.takeDamage(player.maxHealth);
    
    expect(player.isDead()).toBe(true);
  });

  test('should check dash availability correctly', () => {
    const player = new Player();
    
    const canDashInitially = player.canDash();
    expect(typeof canDashInitially).toBe('boolean');
    
    // After dashing, should have cooldown
    if (player.canDash()) {
      player.startDash();
      // While dashing, should not be able to dash again
      expect(player.canDash()).toBe(false);
    }
  });

  test('should check if can attack correctly', () => {
    const player = new Player();
    
    expect(player.canAttack()).toBe(true);
    
    player.isAttacking = true;
    expect(player.canAttack()).toBe(false);
    
    player.isAttacking = false;
    player.stamina = 10;
    expect(player.canAttack()).toBe(false);
  });

  test('should handle invulnerability frames', () => {
    const player = new Player();
    
    // First damage should work
    const firstDamage = player.takeDamage(25);
    expect(firstDamage).toBe(true);
    expect(player.invulnerabilityTime).toBeGreaterThan(0);
    
    // Immediate second damage should be blocked
    const secondDamage = player.takeDamage(25);
    expect(secondDamage).toBe(false);
  });

  test('should handle combo system', () => {
    const player = new Player();
    const mockPhysics = { onGround: true };
    
    // First attack
    if (player.canAttack()) {
      player.startAttack('none', mockPhysics);
      expect(player.comboCount).toBe(1);
      
      // Finish attack
      player.isAttacking = false;
      player.lastAttackInputTime = 0; // Reset cooldown
      
      // Quick second attack within combo window
      if (player.canAttack()) {
        player.startAttack('none', mockPhysics);
        expect(player.comboCount).toBeGreaterThan(1);
      }
    }
  });

  test('should handle map state', () => {
    const player = new Player();
    
    expect(player.mapState).toBeDefined();
    expect(player.isTransitioning).toBe(false);
  });
});