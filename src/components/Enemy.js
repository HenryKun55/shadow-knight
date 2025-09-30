/* ===================================
   ENEMY COMPONENT - SHADOW KNIGHT
   ===================================
   Enemy component using centralized GameConfig for stats and behavior.
   All enemy values and timing reference configuration.
*/

import { GameConfig } from '../config/GameConfig.js';

export class Enemy {
  constructor(type = 'basic', options = {}) {
    this.type = type;
    
    // Get enemy configuration
    const enemyConfig = GameConfig.ENEMIES.TYPES[type.toUpperCase()] || GameConfig.ENEMIES.TYPES.GOBLIN;
    const defaults = GameConfig.ENEMIES.DEFAULTS;
    
    // Use configuration for stats
    this.maxHealth = options.maxHealth || enemyConfig.maxHealth || defaults.MAX_HEALTH;
    this.health = this.maxHealth;
    this.damage = options.damage || enemyConfig.damage || defaults.DAMAGE;
    this.speed = options.speed || enemyConfig.speed || defaults.SPEED;
    this.attackRange = options.attackRange || enemyConfig.attackRange || defaults.ATTACK_RANGE;
    this.detectionRange = options.detectionRange || enemyConfig.detectionRange || defaults.DETECTION_RANGE;
    this.attackCooldown = options.attackCooldown || defaults.ATTACK_COOLDOWN;

    this.state = defaults.INITIAL_STATE;
    this.target = null;
    this.lastAttackTime = 0;
    this.stateTimer = 0;

    this.facingDirection = 1;

    // Combat properties using configuration
    this.isAttacking = false;
    this.attackDuration = defaults.ATTACK_DURATION;
    this.attackTime = 0;
    this.stunDuration = defaults.STUN_DURATION;
    this.invulnerabilityTime = 0;
    
    // Death state properties using configuration
    const deathConfig = defaults.DEATH;
    this.deathTime = 0;
    this.deathAnimationDuration = deathConfig.ANIMATION_DURATION;
    this.isCorpse = false;
    this.isRagdoll = false;
    this.bounces = 0;
    this.finalRotation = 0;
    this.corpseDirection = 1;
    this.corpseCollisionWidth = 0;
    this.corpseCollisionHeight = 0;
  }

  takeDamage(amount) {
    if (this.invulnerabilityTime > 0 || this.isDead()) return false;

    this.health = Math.max(0, this.health - amount);
    this.invulnerabilityTime = GameConfig.ENEMIES.DEFAULTS.INVULNERABILITY_DURATION;

    if (this.health > 0) {
      this.state = 'stunned';
      this.stateTimer = this.stunDuration;
      this.isAttacking = false;
    } else {
      this.state = 'dead';
      this.deathTime = 0; // Start death animation timer
    }

    return true;
  }

  canAttack() {
    return !this.isAttacking &&
      !this.isDead() &&
      this.state !== 'stunned' &&
      Date.now() - this.lastAttackTime >= this.attackCooldown;
  }

  startAttack() {
    if (!this.canAttack()) return false;

    this.isAttacking = true;
    this.attackTime = 0;
    this.lastAttackTime = Date.now();
    this.state = 'attack'; // Legacy state, isAttacking is primary

    return true;
  }

  isDead() {
    return this.health <= 0 || this.state === 'dead';
  }

  isStunned() {
    return this.state === 'stunned';
  }

  updateTimers(deltaTime) {
    this.stateTimer = Math.max(0, this.stateTimer - deltaTime);
    this.invulnerabilityTime = Math.max(0, this.invulnerabilityTime - deltaTime);

    if (this.isAttacking) {
      this.attackTime += deltaTime;
      if (this.attackTime >= this.attackDuration) {
        this.isAttacking = false;
        this.state = this.target ? 'chase' : 'idle';
      }
    }

    if (this.state === 'stunned' && this.stateTimer <= 0) {
      this.state = this.target ? 'chase' : 'idle';
    }
    
    // Handle death animation
    if (this.state === 'dead') {
      this.deathTime += deltaTime;
      // Only become corpse after ragdoll physics are done AND time has passed
      if (this.deathTime >= this.deathAnimationDuration && !this.isRagdoll) {
        this.isCorpse = true;
      }
    }
  }

  setPatrolCenter(x, y) {
    // Placeholder for more advanced AI
  }
}

export const EnemyTypes = {
  GOBLIN: { maxHealth: 30, damage: 10, speed: 100 },
  ORC: { maxHealth: 80, damage: 25, speed: 60 },
};
