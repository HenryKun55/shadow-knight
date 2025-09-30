/* ===================================
   BOSS COMPONENT - SHADOW KNIGHT
   ===================================
   Boss component using centralized GameConfig for boss mechanics.
   All boss values and behavior reference configuration.
*/

import { GameConfig } from '../config/GameConfig.js';

export class Boss {
  constructor(definition) {
    if (!definition) {
      throw new Error('A boss definition must be provided!');
    }

    this.definition = definition;
    this.name = definition.name;
    this.maxHealth = definition.maxHealth;
    this.health = this.maxHealth;
    this.phase = 1;
    this.maxPhases = 3;

    this.damage = definition.damage;
    this.speed = definition.speed;
    this.attackRange = definition.attackRange || 100;
    this.detectionRange = definition.detectionRange || 400;

    // Use boss configuration
    const bossConfig = GameConfig.BOSS;
    
    this.state = bossConfig.INITIAL_STATE;
    this.target = null;
    this.stateTimer = 0;
    this.facingDirection = 1;

    this.attackPatterns = definition.attackPatterns;
    this.currentAttackPattern = null;
    this.attackPatternStep = 0;
    this.attackCooldown = bossConfig.ATTACK_COOLDOWN;
    this.lastAttackTime = 0;

    this.isInvulnerable = false;
    this.invulnerabilityTime = 0;
    this.enrageThreshold = bossConfig.ENRAGE_THRESHOLD;
    this.isEnraged = false;
    
    // Death state properties using configuration
    this.deathTime = 0;
    this.deathAnimationDuration = bossConfig.DEATH.ANIMATION_DURATION;
    this.isCorpse = false;
    this.isRagdoll = false; // Physics-based death animation
    this.bounces = 0; // Track ground bounces
    this.finalRotation = 0; // Final rotation when ragdoll stops
    this.corpseDirection = 1; // Which direction corpse is facing
    this.corpseCollisionWidth = 0; // Adjusted collision width for corpse
    this.corpseCollisionHeight = 0; // Adjusted collision height for corpse
  }

  takeDamage(amount) {
    if (this.isInvulnerable || this.invulnerabilityTime > 0 || this.isDead()) {
      return false;
    }
    this.health = Math.max(0, this.health - amount);
    this.invulnerabilityTime = 200;
    
    if (this.health <= 0) {
      this.state = 'dead';
      this.deathTime = 0; // Start death animation timer
    } else {
      this.checkPhaseTransition();
    }
    
    return true;
  }

  checkPhaseTransition() {
    const currentHealthPercentage = this.health / this.maxHealth;

    if (currentHealthPercentage <= 0.3 && this.phase < 3) {
      this.phase = 3;
      console.log('Boss entered Phase 3!');
    } else if (currentHealthPercentage <= 0.6 && this.phase < 2) {
      this.phase = 2;
      console.log('Boss entered Phase 2!');
    }
  }

  canAttack() {
    return this.state === 'active' &&
      Date.now() - this.lastAttackTime >= this.attackCooldown &&
      !this.isDead();
  }

  startAttackPattern(patternName) {
    if (!this.canAttack()) return false;

    this.currentAttackPattern = patternName;
    this.attackPatternStep = 0;
    this.state = 'attacking';
    this.stateTimer = this.getAttackDuration(patternName);
    this.lastAttackTime = Date.now();

    return true;
  }

  getAttackDuration(patternName) {
    const durations = {
      'triple_slash': 1200,
      'shadow_dash': 800,
      'ground_slam': 1500,
      'teleport_strike': 1000,
      'projectile_barrage': 2000,
      'air_slam': 1000,
      'multi_projectile': 1800,
      'teleport_dash': 700,
    };
    return durations[patternName] || 1000;
  }

  selectRandomAttackPattern() {
    const phaseKey = `phase${this.phase}`;
    const patterns = this.attackPatterns[phaseKey];
    if (!patterns || patterns.length === 0) return 'triple_slash';
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  updateTimers(deltaTime) {
    this.stateTimer = Math.max(0, this.stateTimer - deltaTime);
    this.invulnerabilityTime = Math.max(0, this.invulnerabilityTime - deltaTime);
    
    // Handle death animation (same as Enemy)
    if (this.state === 'dead') {
      this.deathTime += deltaTime;
      // Only become corpse after ragdoll physics are done AND time has passed
      if (this.deathTime >= this.deathAnimationDuration && !this.isRagdoll) {
        this.isCorpse = true;
      }
    }
  }

  isDead() {
    return this.health <= 0 || this.state === 'dead';
  }
}
