// --- COMPLETE AND UNABRIDGED FILE ---

import { cheats } from '../core/cheat.js';

export class Player {
  constructor() {
    this.speed = 300;
    this.jumpPower = 500;
    this.dashSpeed = 800;
    this.dashDuration = 200;
    this.dashCooldown = 500;

    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.maxStamina = 100;
    this.stamina = this.maxStamina;
    this.staminaRegenRate = 50;

    this.dashStaminaCost = 30;
    this.attackStaminaCost = 15;

    this.dashDamage = 20;
    this.isDashAttacking = false;
    this.isDashing = false;
    this.dashTime = 0;
    this.lastDashTime = 0;
    this.isAttacking = false;
    this.attackTime = 0;
    this.attackDuration = 300;
    this.attackDirection = 'none';

    this.coyoteTime = 150;
    this.jumpBufferTime = 150;
    this.lastGroundTime = 0;
    this.lastJumpInput = 0;
    this.canDoubleJump = true;
    this.hasDoubleJumped = false;

    this.comboCount = 0;
    this.lastAttackTime = 0;
    this.lastAttackInputTime = 0;
    this.attackCooldown = 300;
    this.comboWindow = 800;
    this.invulnerabilityTime = 0;
    this.invulnerabilityDuration = 500;

    this.facingDirection = 1;
    this.hitStop = 0;
  }

  canDash() {
    if (cheats.infiniteStamina) return true;
    return !this.isDashing && this.stamina >= this.dashStaminaCost && Date.now() - this.lastDashTime >= this.dashCooldown;
  }

  canAttack() {
    const canPerformAttack = !this.isAttacking && !this.isDashing && (Date.now() - this.lastAttackInputTime >= this.attackCooldown);
    if (cheats.infiniteStamina) {
      return canPerformAttack; // Only check for attack state and cooldown
    }
    return canPerformAttack && this.stamina >= this.attackStaminaCost;
  }

  canJump(physics) {
    const timeSinceGrounded = Date.now() - this.lastGroundTime;
    const timeSinceJumpInput = Date.now() - this.lastJumpInput;
    return (physics.onGround || timeSinceGrounded <= this.coyoteTime || (this.canDoubleJump && !this.hasDoubleJumped)) && timeSinceJumpInput <= this.jumpBufferTime;
  }

  startDash() {
    if (!this.canDash()) return false;
    this.isDashing = true;
    this.isDashAttacking = true;
    this.dashTime = 0;
    this.lastDashTime = Date.now();
    if (!cheats.infiniteStamina) {
      this.stamina -= this.dashStaminaCost;
    }
    this.invulnerabilityTime = this.dashDuration;
    return true;
  }

  startAttack(direction = 'none', physics) {
    if (!this.canAttack()) {
      return false;
    }

    // Directional attack conditions
    if (direction === 'down' && physics.onGround) {
      return false; // Down attack only in air
    }

    this.isAttacking = true;
    this.attackTime = 0;
    this.attackDirection = direction;
    if (!cheats.infiniteStamina) {
      this.stamina -= this.attackStaminaCost;
    }
    const timeSinceLastAttack = Date.now() - this.lastAttackTime;
    if (timeSinceLastAttack <= this.comboWindow) {
      this.comboCount = Math.min(this.comboCount + 1, 3);
    } else {
      this.comboCount = 1;
    }
    this.lastAttackTime = Date.now();
    this.lastAttackInputTime = Date.now();
    return true;
  }

  jump(physics) {
    if (!this.canJump(physics)) return false;
    if (physics.onGround || Date.now() - this.lastGroundTime <= this.coyoteTime) {
      this.hasDoubleJumped = false;
    } else if (this.canDoubleJump && !this.hasDoubleJumped) {
      this.hasDoubleJumped = true;
    }
    return true;
  }

  takeDamage(amount, sprite) {
    if (this.invulnerabilityTime > 0) return false;
    this.health = Math.max(0, this.health - amount);
    this.invulnerabilityTime = this.invulnerabilityDuration;
    this.hitStop = 100;
    if (sprite) {
      sprite.flash('#ffffff', 150); // Flash white when taking damage
    }
    return true;
  }

  updateStamina(deltaTime) {
    if (cheats.infiniteStamina) {
      this.stamina = this.maxStamina;
      return;
    }
    if (!this.isDashing && !this.isAttacking) {
      this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegenRate * (deltaTime / 1000));
    }
  }

  updateTimers(deltaTime) {
    if (this.isDashing) {
      this.dashTime += deltaTime;
      if (this.dashTime >= this.dashDuration) {
        this.isDashing = false;
        this.isDashAttacking = false;
      }
    }
    if (this.isAttacking) {
      this.attackTime += deltaTime;
      if (this.attackTime >= this.attackDuration) {
        this.isAttacking = false;
        this.attackDirection = 'none';
      }
    }
    this.invulnerabilityTime = Math.max(0, this.invulnerabilityTime - deltaTime);
    this.hitStop = Math.max(0, this.hitStop - deltaTime);
  }

  isDead() {
    return this.health <= 0;
  }
}
