/* ===================================
   COMBAT SYSTEM - SHADOW KNIGHT
   ===================================
   Combat system using centralized GameConfig for damage, hitboxes, and effects.
   All combat values and timings reference configuration.
*/

import { UISystem } from './UISystem.js';
import { cheats } from '../core/cheat.js';
import { GameConfig } from '../config/GameConfig.js';

export class CombatSystem {
  constructor() {
    this.game = null;
    this.activeHitboxes = [];
    this.activeVisualEffects = [];
    
    // Cache combat configuration for performance
    this.combatConfig = GameConfig.COMBAT;
    this.playerCombat = GameConfig.COMBAT.PLAYER;
    this.soundNames = GameConfig.AUDIO.SOUND_NAMES;
  }

  update(deltaTime) {
    this.updateHitboxes(deltaTime);
    this.updateVisualEffects(deltaTime);
    this.handlePlayerAttacks();
    this.handlePlayerDashAttacks();
    this.checkAllCollisions();
  }

  updateVisualEffects(deltaTime) {
    this.activeVisualEffects = this.activeVisualEffects.filter(effect => {
      effect.duration -= deltaTime;
      return effect.duration > 0;
    });
  }

  updateHitboxes(deltaTime) {
    this.activeHitboxes.forEach(hitbox => {
      // If the hitbox has velocity (it's a projectile), move it.
      if (hitbox.velocity) {
        hitbox.x += hitbox.velocity.x * (deltaTime / 1000);
        hitbox.y += hitbox.velocity.y * (deltaTime / 1000);
      }
    });

    this.activeHitboxes = this.activeHitboxes.filter(hitbox => {
      hitbox.duration -= deltaTime;
      return hitbox.duration > 0;
    });
  }

  handlePlayerAttacks() {
    const playerEntities = this.game.getEntitiesWithComponent('Player');
    playerEntities.forEach(playerEntity => {
      const player = playerEntity.getComponent('Player');
      const position = playerEntity.getComponent('Position');

      if (player.isAttacking) {
        const attackProgress = player.attackTime / player.attackDuration;
        // Use configured attack timing window
        const attackWindow = this.playerCombat.ATTACK_WINDOW;
        if (attackProgress >= attackWindow.START && attackProgress <= attackWindow.END) {
          const hitboxData = this.getPlayerHitboxData(player, position);
          this.createHitbox(playerEntity, {
            ...hitboxData,
            attackId: player.lastAttackTime
          });
        }
      }
    });
  }

  handlePlayerDashAttacks() {
    const playerEntities = this.game.getEntitiesWithComponent('Player');
    playerEntities.forEach(playerEntity => {
      const player = playerEntity.getComponent('Player');
      const position = playerEntity.getComponent('Position');
      const collision = playerEntity.getComponent('Collision');
      const sprite = playerEntity.getComponent('Sprite');

      if (player.isDashing && player.isDashAttacking) {
        const bounds = collision.getBounds(position, sprite, playerEntity);
        this.createHitbox(playerEntity, {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          damage: player.dashDamage,
          duration: this.combatConfig.DASH_ATTACK.HITBOX_DURATION,
          attackId: 'dash_attack_' + Date.now(),
        });
      }
    });
  }

  getPlayerHitboxData(player, position) {
    // Use configuration for base hitbox values
    const baseConfig = this.playerCombat.HITBOX.BASE;
    let baseWidth = baseConfig.WIDTH;
    let baseHeight = baseConfig.HEIGHT;
    let baseOffsetX = (player.facingDirection > 0 ? baseConfig.OFFSET_X_RIGHT : baseConfig.OFFSET_X_LEFT);
    let baseOffsetY = baseConfig.OFFSET_Y;
    let damage = baseConfig.DAMAGE;
    let knockback = baseConfig.KNOCKBACK;
    let duration = baseConfig.DURATION;

    if (player.attackDirection === 'up') {
      const upConfig = this.playerCombat.HITBOX.UP;
      baseWidth = upConfig.WIDTH;
      baseHeight = upConfig.HEIGHT;
      baseOffsetX = (player.facingDirection > 0 ? upConfig.OFFSET_X_RIGHT : upConfig.OFFSET_X_LEFT);
      baseOffsetY = upConfig.OFFSET_Y;
      damage = upConfig.DAMAGE;
      knockback = upConfig.KNOCKBACK;
      duration = upConfig.DURATION;
    } else if (player.attackDirection === 'down') {
      const downConfig = this.playerCombat.HITBOX.DOWN;
      baseWidth = downConfig.WIDTH;
      baseHeight = downConfig.HEIGHT;
      baseOffsetX = (player.facingDirection > 0 ? downConfig.OFFSET_X_RIGHT : downConfig.OFFSET_X_LEFT);
      baseOffsetY = downConfig.OFFSET_Y;
      damage = downConfig.DAMAGE;
      knockback = downConfig.KNOCKBACK;
      duration = downConfig.DURATION;
    }

    let hitboxX = position.x + baseOffsetX;
    let hitboxY = position.y + baseOffsetY;

    // Apply combo modifiers using configuration
    const comboConfig = this.playerCombat.COMBO;
    const comboIndex = Math.min(player.comboCount, comboConfig.length) - 1;
    const combo = comboConfig[comboIndex] || comboConfig[0];
    
    return {
      damage: damage + combo.DAMAGE_BONUS,
      knockback: knockback + combo.KNOCKBACK_BONUS,
      width: baseWidth + combo.WIDTH_BONUS,
      height: baseHeight + combo.HEIGHT_BONUS,
      x: hitboxX + combo.OFFSET_X_BONUS,
      y: hitboxY + combo.OFFSET_Y_BONUS,
      duration: duration
    };
  }

  checkAllCollisions() {
    const playerEntities = this.game.getEntitiesWithComponent('Player');
    const enemyEntities = [...this.game.getEntitiesWithComponent('Enemy'), ...this.game.getEntitiesWithComponent('Boss')];

    this.activeHitboxes.forEach(hitbox => {
      if (hitbox.hitEntities.has(hitbox.source)) return;

      if (hitbox.source.hasComponent('Player')) {
        this.checkPlayerHit(hitbox, enemyEntities);
      } else {
        this.checkEnemyHit(hitbox, playerEntities);
      }
    });
  }

  checkPlayerHit(hitbox, targets) {
    targets.forEach(targetEntity => {
      if (hitbox.hitEntities.has(targetEntity)) return;
      const target = targetEntity.getComponent('Enemy') || targetEntity.getComponent('Boss');
      const position = targetEntity.getComponent('Position');
      const collision = targetEntity.getComponent('Collision');
      const sprite = targetEntity.getComponent('Sprite');
      const velocity = targetEntity.getComponent('Velocity');
      if (!target || !position || !collision || target.isDead()) return;

      const targetBounds = collision.getBounds(position, sprite, targetEntity);
      if (this.checkRectCollision(hitbox, targetBounds)) {
        hitbox.hitEntities.add(targetEntity);
        let damageToDeal = hitbox.damage;
        if (cheats.oneHitKills) {
          damageToDeal = target.health; // Deal enough damage to kill in one hit
        }
        if (target.takeDamage(damageToDeal)) {
          this.game.soundManager.play(this.soundNames.ENEMY_HIT);
          if (sprite) {
            const flashConfig = this.combatConfig.HIT_FLASH;
            sprite.flash(flashConfig.COLOR, flashConfig.DURATION);
          }
          if (target.isDead()) {
            this.game.soundManager.play(this.soundNames.ENEMY_DEATH);
            this.handleEnemyDeath(targetEntity, target, sprite, velocity);
          }
        }
      }
    });
  }

  checkEnemyHit(hitbox, targets) {
    const uiSystem = this.game.getSystem(UISystem);

    targets.forEach(targetEntity => {
      if (hitbox.hitEntities.has(targetEntity)) return;
      const player = targetEntity.getComponent('Player');
      const position = targetEntity.getComponent('Position');
      const collision = targetEntity.getComponent('Collision');
      const sprite = targetEntity.getComponent('Sprite');
      if (!player || player.isDead()) return;
      
      // Don't damage player during room transitions
      if (player.isTransitioning) return;

      const targetBounds = collision.getBounds(position, sprite, targetEntity);
      if (this.checkRectCollision(hitbox, targetBounds)) {
        hitbox.hitEntities.add(targetEntity);
        if (cheats.infiniteHealth) {
          // Player takes no damage if infinite health cheat is active
          return;
        }
        if (player.takeDamage(hitbox.damage, sprite)) {
          this.game.soundManager.play(this.soundNames.PLAYER_HIT);
          if (uiSystem) {
            const screenPos = this.game.worldToScreen(position.x, position.y);
            uiSystem.showDamageNumber(hitbox.damage, screenPos.x, screenPos.y);
          }
        }
      }
    });
  }

  createHitbox(sourceEntity, options) {
    const existingHitbox = this.activeHitboxes.find(h => h.source === sourceEntity && h.attackId === options.attackId);
    if (existingHitbox) return;

    const hitbox = {
      source: sourceEntity,
      x: options.x,
      y: options.y,
      width: options.width,
      height: options.height,
      damage: options.damage,
      duration: options.duration || this.combatConfig.DEFAULT_HITBOX_DURATION,
      attackId: options.attackId,
      velocity: options.velocity || null,
      hitEntities: new Set()
    };
    this.activeHitboxes.push(hitbox);

    // Create visual effect using configuration
    const visualConfig = this.combatConfig.VISUAL_EFFECTS;
    const effectDuration = hitbox.duration + visualConfig.EXTRA_DURATION;
    
    this.activeVisualEffects.push({
      x: hitbox.x,
      y: hitbox.y,
      width: hitbox.width,
      height: hitbox.height,
      duration: effectDuration,
      initialDuration: effectDuration,
      velocity: hitbox.velocity,
      color: sourceEntity.hasComponent('Player') ? 
        visualConfig.PLAYER_COLOR : 
        visualConfig.ENEMY_COLOR
    });
  }

  checkRectCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;
  }

  handleEnemyDeath(targetEntity, target, sprite, velocity) {    
    console.log(`handleEnemyDeath called for ${target.constructor.name}`);
    
    // Realistic ragdoll physics using configuration
    if (velocity) {
      const ragdollConfig = this.combatConfig.RAGDOLL;
      const randomDirection = (Math.random() - 0.5) * 2; // -1 to 1
      const knockbackForce = ragdollConfig.KNOCKBACK_FORCE.MIN + 
        Math.random() * (ragdollConfig.KNOCKBACK_FORCE.MAX - ragdollConfig.KNOCKBACK_FORCE.MIN);
      
      velocity.x = randomDirection * knockbackForce;
      velocity.y = ragdollConfig.UPWARD_IMPULSE.MIN - 
        Math.random() * (ragdollConfig.UPWARD_IMPULSE.MAX - ragdollConfig.UPWARD_IMPULSE.MIN);
    }
    
    // Mark as ragdoll for special physics handling
    target.isRagdoll = true;
    target.bounces = 0; // Track ground bounces
    
    console.log(`After ragdoll setup for ${target.constructor.name}: isRagdoll=${target.isRagdoll}`);
    
    if (sprite) {
      sprite.playAnimation(GameConfig.ANIMATION.ENEMY.IDLE.name);
    }
  }

  render(ctx) {
    ctx.save();
    this.activeVisualEffects.forEach(effect => {
      ctx.globalAlpha = (effect.duration / effect.initialDuration);
      ctx.fillStyle = effect.color;
      ctx.fillRect(effect.x, effect.y, effect.width, effect.height);
    });
    ctx.restore();

    if (this.game.debugMode) {
      const debugConfig = GameConfig.DEBUG;
      ctx.strokeStyle = debugConfig.COLORS.HITBOX;
      ctx.lineWidth = debugConfig.LINE_WIDTH;
      this.activeHitboxes.forEach(hitbox => {
        ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
      });
    }
  }
}
