// --- COMPLETE AND UNABRIDGED FILE ---

import { UISystem } from './UISystem.js';
import { cheats } from '../core/cheat.js';

export class CombatSystem {
  constructor() {
    this.game = null;
    this.activeHitboxes = [];
    this.activeVisualEffects = [];
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
        if (attackProgress >= 0.4 && attackProgress <= 0.6) {
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
        const bounds = collision.getBounds(position, sprite);
        this.createHitbox(playerEntity, {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          damage: player.dashDamage,
          duration: 50, // Short duration for dash hitbox
          attackId: 'dash_attack_' + Date.now(),
        });
      }
    });
  }

  getPlayerHitboxData(player, position) {
    let baseWidth = 60;
    let baseHeight = 40;
    let baseOffsetX = (player.facingDirection > 0 ? 16 : -76);
    let baseOffsetY = -5;
    let damage = 25;
    let knockback = 150;
    let duration = 100; // Default duration

    if (player.attackDirection === 'up') {
      baseWidth = 40;
      baseHeight = 60;
      baseOffsetX = (player.facingDirection > 0 ? 26 : -66);
      baseOffsetY = -80; // Above player
      damage = 30;
      knockback = 100;
      duration = 200; // Longer duration for visibility
    } else if (player.attackDirection === 'down') {
      baseWidth = 40;
      baseHeight = 60;
      baseOffsetX = (player.facingDirection > 0 ? 26 : -66);
      baseOffsetY = 20; // Below player
      damage = 30;
      knockback = 100;
      duration = 200; // Longer duration for visibility
    }

    let hitboxX = position.x + baseOffsetX;
    let hitboxY = position.y + baseOffsetY;

    switch (player.comboCount) {
      case 1: return { damage: damage, knockback: knockback, width: baseWidth, height: baseHeight, x: hitboxX, y: hitboxY, duration: duration };
      case 2: return { damage: damage + 5, knockback: knockback + 30, width: baseWidth + 20, height: baseHeight, x: hitboxX - 10, y: hitboxY, duration: duration };
      case 3: return { damage: damage + 10, knockback: knockback + 100, width: baseWidth + 30, height: baseHeight + 10, x: hitboxX - 15, y: hitboxY - 5, duration: duration };
      default: return { damage: damage, knockback: knockback, width: baseWidth, height: baseHeight, x: hitboxX, y: hitboxY, duration: duration };
    }
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
      if (!target || !position || !collision || target.isDead()) return;

      const targetBounds = collision.getBounds(position, sprite);
      if (this.checkRectCollision(hitbox, targetBounds)) {
        hitbox.hitEntities.add(targetEntity);
        let damageToDeal = hitbox.damage;
        if (cheats.oneHitKills) {
          damageToDeal = target.health; // Deal enough damage to kill in one hit
        }
        if (target.takeDamage(damageToDeal)) {
          this.game.soundManager.play('enemyHit');
          if (target.isDead()) {
            this.game.soundManager.play('enemyDeath');
            if (!targetEntity.hasComponent('Boss')) {
              targetEntity.getComponent('Sprite').color = '#555';
              setTimeout(() => this.game.removeEntity(targetEntity.id), 1000);
            }
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

      const targetBounds = collision.getBounds(position, sprite);
      if (this.checkRectCollision(hitbox, targetBounds)) {
        hitbox.hitEntities.add(targetEntity);
        if (cheats.infiniteHealth) {
          // Player takes no damage if infinite health cheat is active
          return;
        }
        if (player.takeDamage(hitbox.damage)) {
          this.game.soundManager.play('playerHit');
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
      duration: options.duration || 100,
      attackId: options.attackId,
      velocity: options.velocity || null,
      hitEntities: new Set()
    };
    this.activeHitboxes.push(hitbox);

    this.activeVisualEffects.push({
      x: hitbox.x,
      y: hitbox.y,
      width: hitbox.width,
      height: hitbox.height,
      duration: hitbox.duration + 20, // Visual lasts slightly longer
      initialDuration: hitbox.duration + 20,
      velocity: hitbox.velocity, // Pass velocity to visual effect
      color: sourceEntity.hasComponent('Player') ? 'rgba(255, 255, 150, 0.7)' : 'rgba(255, 100, 100, 0.7)'
    });
  }

  checkRectCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;
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
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      this.activeHitboxes.forEach(hitbox => {
        ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
      });
    }
  }
}
