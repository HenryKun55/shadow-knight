/* ===================================
   PLAYER COMPONENT - SHADOW KNIGHT
   ===================================
   Player component using centralized GameConfig for all stats and mechanics.
   All values now reference the configuration system for consistency.
*/

import { cheats } from '../core/cheat.js';
import { MapState } from './MapState.js';
import { GameConfig } from '../config/GameConfig.js';

export class Player {
  constructor() {
    // Movement settings from configuration
    this.speed = GameConfig.PLAYER.MOVEMENT.SPEED;
    this.jumpPower = GameConfig.PLAYER.MOVEMENT.JUMP_POWER;
    this.dashSpeed = GameConfig.PLAYER.MOVEMENT.DASH_SPEED;
    this.dashDuration = GameConfig.PLAYER.MOVEMENT.DASH_DURATION;
    this.dashCooldown = GameConfig.PLAYER.MOVEMENT.DASH_COOLDOWN;

    // Health and stamina from configuration
    this.maxHealth = GameConfig.PLAYER.STATS.MAX_HEALTH;
    this.health = this.maxHealth;
    this.maxStamina = GameConfig.PLAYER.STATS.MAX_STAMINA;
    this.stamina = this.maxStamina;
    this.staminaRegenRate = GameConfig.PLAYER.STATS.STAMINA_REGEN_RATE;

    // Stamina costs from configuration
    this.dashStaminaCost = GameConfig.PLAYER.STAMINA_COSTS.DASH;
    this.attackStaminaCost = GameConfig.PLAYER.STAMINA_COSTS.ATTACK;

    // Combat settings from configuration
    this.dashDamage = GameConfig.PLAYER.COMBAT.DASH_DAMAGE;
    this.isDashAttacking = false;
    this.isDashing = false;
    this.dashTime = 0;
    this.lastDashTime = 0;
    this.isAttacking = false;
    this.attackTime = 0;
    this.attackDuration = GameConfig.PLAYER.COMBAT.ATTACK_DURATION;

    this.attackCooldown = GameConfig.PLAYER.COMBAT.ATTACK_COOLDOWN;
    this.lastAttackInputTime = 0;

    this.attackDirection = 'none';

    // Jump mechanics from configuration
    this.coyoteTime = GameConfig.PLAYER.JUMP.COYOTE_TIME;
    this.jumpBufferTime = GameConfig.PLAYER.JUMP.BUFFER_TIME;
    this.lastGroundTime = 0;
    this.lastJumpInput = 0;
    this.canDoubleJump = GameConfig.PLAYER.JUMP.DOUBLE_JUMP_ENABLED;
    this.hasDoubleJumped = false;

    // Combat combo system from configuration
    this.comboCount = 1;
    this.comboWindow = GameConfig.PLAYER.COMBAT.COMBO_WINDOW;
    this.maxComboCount = GameConfig.PLAYER.COMBAT.MAX_COMBO_COUNT;
    this.lastAttackTime = 0;

    // Invulnerability settings
    this.invulnerabilityDuration = GameConfig.PLAYER.STATS.INVULNERABILITY_DURATION;
    this.invulnerabilityTime = 0;
    this.hitStop = 0;

    // Map system
    this.mapState = new MapState();
    this.isTransitioning = false;

    // Player direction
    this.facingDirection = 1; // 1 for right, -1 for left
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

    // Update attack input time immediately to prevent double attacks
    this.lastAttackInputTime = Date.now();

    // Directional attack conditions
    if (direction === 'down' && physics.onGround) {
      return false; // Down attack only in air
    }

    this.isAttacking = true;
    this.attackTime = 0;
    this.attackDirection = direction;
    
    // Use cheat system or consume stamina
    if (!cheats.infiniteStamina) {
      this.stamina -= this.attackStaminaCost;
    }
    
    // Combo system using configuration
    const timeSinceLastAttack = Date.now() - this.lastAttackTime;
    if (timeSinceLastAttack <= this.comboWindow) {
      this.comboCount = Math.min(this.comboCount + 1, this.maxComboCount);
    } else {
      this.comboCount = 1;
    }
    
    this.lastAttackTime = Date.now();
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
    this.hitStop = GameConfig.PLAYER.COMBAT.HIT_STOP_DURATION;
    if (sprite) {
      // Força reset do flash antes de aplicar novo
      sprite.flashDuration = 0;
      sprite.flashColor = null;
      if (sprite.originalColor !== null) {
        sprite.color = sprite.originalColor;
        sprite.originalColor = null;
      }
      sprite.flash(GameConfig.PLAYER.VISUAL_EFFECTS.DAMAGE_FLASH_COLOR, GameConfig.PLAYER.VISUAL_EFFECTS.DAMAGE_FLASH_DURATION);
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
