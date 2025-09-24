// --- COMPLETE AND UNABRIDGED FILE ---

export class Enemy {
  constructor(type = 'basic', options = {}) {
    this.type = type;
    this.maxHealth = options.maxHealth || 50;
    this.health = this.maxHealth;
    this.damage = options.damage || 15;
    this.speed = options.speed || 80;
    this.attackRange = options.attackRange || 60;
    this.detectionRange = options.detectionRange || 200;
    this.attackCooldown = options.attackCooldown || 1500;

    this.state = 'idle'; // idle, chase, attack, stunned, dead
    this.target = null;
    this.lastAttackTime = 0;
    this.stateTimer = 0;

    this.facingDirection = 1;

    this.isAttacking = false;
    this.attackDuration = 400;
    this.attackTime = 0;
    this.stunDuration = 800;
    this.invulnerabilityTime = 0;
  }

  takeDamage(amount) {
    if (this.invulnerabilityTime > 0 || this.isDead()) return false;

    this.health = Math.max(0, this.health - amount);
    this.invulnerabilityTime = 300;

    if (this.health > 0) {
      this.state = 'stunned';
      this.stateTimer = this.stunDuration;
      this.isAttacking = false;
    } else {
      this.state = 'dead';
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
  }

  setPatrolCenter(x, y) {
    // Placeholder for more advanced AI
  }
}

export const EnemyTypes = {
  GOBLIN: { maxHealth: 30, damage: 10, speed: 100 },
  ORC: { maxHealth: 80, damage: 25, speed: 60 },
};
