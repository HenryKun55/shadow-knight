/* ===================================
   BOSS AI SYSTEM - SHADOW KNIGHT
   ===================================
   Boss AI system using centralized GameConfig for boss behavior and attack patterns.
   All boss mechanics and values reference configuration.
*/

import { CombatSystem } from "./CombatSystem.js";
import { GameConfig } from '../config/GameConfig.js';

export class BossAISystem {
  constructor() {
    this.game = null;
    
    // Cache boss configuration for performance
    this.bossConfig = GameConfig.BOSS;
    this.attackPatterns = this.bossConfig.ATTACK_PATTERNS;
    this.flashEffects = this.bossConfig.FLASH_EFFECTS;
  }

  update(deltaTime) {
    const bosses = this.game.getEntitiesWithComponent('Boss');
    if (bosses.length === 0) return;

    const player = this.game.getEntitiesWithComponent('Player')[0];
    if (!player) return;

    bosses.forEach(bossEntity => {
      const boss = bossEntity.getComponent('Boss');
      const position = bossEntity.getComponent('Position');
      const velocity = bossEntity.getComponent('Velocity');
      const sprite = bossEntity.getComponent('Sprite');

      if (!boss || !position || !velocity) return;
      
      // Always update timers, even for dead bosses (for death animation)
      boss.updateTimers(deltaTime);
      
      // Skip AI logic for dead bosses, but allow ragdoll physics
      if (boss.isDead()) {
        // Only stop AI movement if boss is already corpse (ragdoll finished)
        if (boss.isCorpse && velocity) {
          velocity.x = 0;
        }
        return;
      }

      if (!boss.target) boss.target = player;

      if (boss.state === 'dormant') {
        const playerPos = player.getComponent('Position');
        if (this.calculateDistance(position, playerPos) <= boss.detectionRange) {
          boss.state = 'active';
          if (sprite) {
            const activationFlash = this.flashEffects.ACTIVATION;
            sprite.flash(activationFlash.COLOR, activationFlash.DURATION);
          }
        }
        return;
      }

      this.updateBossState(boss, bossEntity, player, deltaTime);
    });
  }

  updateBossState(boss, bossEntity, player, deltaTime) {
    const position = bossEntity.getComponent('Position');
    const velocity = bossEntity.getComponent('Velocity');
    const sprite = bossEntity.getComponent('Sprite');

    switch (boss.state) {
      case 'active':
        this.handleActiveState(boss, position, velocity, sprite, player);
        break;
      case 'attacking':
        this.handleAttackingState(boss, bossEntity, deltaTime);
        break;
      case 'recovery':
        velocity.x *= this.bossConfig.RECOVERY_FRICTION;
        if (boss.stateTimer <= 0) {
          boss.state = 'active';
        }
        break;
    }
  }

  handleActiveState(boss, position, velocity, sprite, player) {
    const playerPos = player.getComponent('Position');
    const distance = this.calculateDistance(position, playerPos);

    const rangeMultiplier = this.bossConfig.ATTACK_RANGE_MULTIPLIER;
    if (distance > boss.attackRange * rangeMultiplier) {
      const direction = playerPos.x > position.x ? 1 : -1;
      velocity.x = direction * boss.speed;
      boss.facingDirection = direction;
      if (sprite) sprite.flipX = direction < 0;
    } else {
      velocity.x *= this.bossConfig.APPROACH_FRICTION;
      if (boss.canAttack()) {
        const pattern = boss.selectRandomAttackPattern();
        boss.startAttackPattern(pattern);
      }
    }
  }

  handleAttackingState(boss, bossEntity, deltaTime) {
    this.executeAttackPattern(boss, bossEntity, deltaTime);

    if (boss.stateTimer <= 0) {
      boss.state = 'recovery';
      boss.stateTimer = this.bossConfig.RECOVERY_DURATION;
    }
  }

  executeAttackPattern(boss, bossEntity) {
    const position = bossEntity.getComponent('Position');
    const velocity = bossEntity.getComponent('Velocity');
    const physics = bossEntity.getComponent('Physics');
    const combatSystem = this.game.getSystem(CombatSystem);
    if (!combatSystem) return;

    const duration = boss.getAttackDuration(boss.currentAttackPattern);
    const attackProgress = (duration - boss.stateTimer) / duration;

    switch (boss.currentAttackPattern) {
      case 'triple_slash':
        const tripleSlash = this.attackPatterns.TRIPLE_SLASH;
        if (attackProgress >= tripleSlash.TIMING.FIRST && boss.attackPatternStep === 0) {
          const slash1 = tripleSlash.SLASH_1;
          combatSystem.createHitbox(bossEntity, { 
            width: slash1.WIDTH, height: slash1.HEIGHT, damage: boss.damage * slash1.DAMAGE_MULTIPLIER, 
            x: position.x + (boss.facingDirection > 0 ? slash1.OFFSET_X_RIGHT : slash1.OFFSET_X_LEFT), 
            y: position.y + slash1.OFFSET_Y, 
            attackId: `${boss.lastAttackTime}-1` 
          });
          boss.attackPatternStep = 1;
        } else if (attackProgress >= tripleSlash.TIMING.SECOND && boss.attackPatternStep === 1) {
          const slash2 = tripleSlash.SLASH_2;
          combatSystem.createHitbox(bossEntity, { 
            width: slash2.WIDTH, height: slash2.HEIGHT, damage: boss.damage * slash2.DAMAGE_MULTIPLIER, 
            x: position.x + (boss.facingDirection > 0 ? slash2.OFFSET_X_RIGHT : slash2.OFFSET_X_LEFT), 
            y: position.y + slash2.OFFSET_Y, 
            attackId: `${boss.lastAttackTime}-2` 
          });
          boss.attackPatternStep = 2;
        } else if (attackProgress >= tripleSlash.TIMING.THIRD && boss.attackPatternStep === 2) {
          const slash3 = tripleSlash.SLASH_3;
          combatSystem.createHitbox(bossEntity, { 
            width: slash3.WIDTH, height: slash3.HEIGHT, damage: boss.damage * slash3.DAMAGE_MULTIPLIER, 
            x: position.x + (boss.facingDirection > 0 ? slash3.OFFSET_X_RIGHT : slash3.OFFSET_X_LEFT), 
            y: position.y + slash3.OFFSET_Y, 
            attackId: `${boss.lastAttackTime}-3` 
          });
          boss.attackPatternStep = 3;
        }
        break;

      case 'shadow_dash':
        const shadowDash = this.attackPatterns.SHADOW_DASH;
        if (attackProgress > shadowDash.TIMING.TRIGGER && boss.attackPatternStep === 0) {
          velocity.x = boss.facingDirection * boss.speed * shadowDash.SPEED_MULTIPLIER;
          const collision = bossEntity.getComponent('Collision');
          combatSystem.createHitbox(bossEntity, {
            width: collision.width, height: collision.height,
            damage: boss.damage * shadowDash.DAMAGE_MULTIPLIER,
            x: position.x + collision.offsetX,
            y: position.y + collision.offsetY,
            duration: shadowDash.DURATION, attackId: boss.lastAttackTime
          });
          boss.attackPatternStep = 1;
        }
        break;

      case 'ground_slam':
        const groundSlam = this.attackPatterns.GROUND_SLAM;
        if (attackProgress >= groundSlam.TIMING.TRIGGER && boss.attackPatternStep === 0) {
          combatSystem.createHitbox(bossEntity, { 
            width: groundSlam.WIDTH, 
            height: groundSlam.HEIGHT, 
            damage: boss.damage * groundSlam.DAMAGE_MULTIPLIER, 
            x: position.x + groundSlam.OFFSET_X, 
            y: position.y + groundSlam.OFFSET_Y, 
            attackId: boss.lastAttackTime 
          });
          boss.attackPatternStep = 1;
        }
        break;

      case 'teleport_strike':
        const teleportStrike = this.attackPatterns.TELEPORT_STRIKE;
        const playerPos = boss.target.getComponent('Position');
        if (attackProgress >= teleportStrike.TIMING.TELEPORT && boss.attackPatternStep === 0) {
          position.x = playerPos.x - (boss.facingDirection * teleportStrike.TELEPORT_DISTANCE);
          position.y = playerPos.y;
          const teleportFlash = this.flashEffects.TELEPORT;
          bossEntity.getComponent('Sprite')?.flash(teleportFlash.COLOR, teleportFlash.DURATION);
          boss.attackPatternStep = 1;
        } else if (attackProgress >= teleportStrike.TIMING.STRIKE && boss.attackPatternStep === 1) {
          combatSystem.createHitbox(bossEntity, {
            width: teleportStrike.WIDTH, 
            height: teleportStrike.HEIGHT, 
            damage: boss.damage * teleportStrike.DAMAGE_MULTIPLIER,
            x: position.x + (boss.facingDirection > 0 ? teleportStrike.OFFSET_X_RIGHT : teleportStrike.OFFSET_X_LEFT),
            y: position.y + teleportStrike.OFFSET_Y,
            attackId: boss.lastAttackTime
          });
          boss.attackPatternStep = 2;
        }
        break;

      case 'projectile_barrage':
        const projectileBarrage = this.attackPatterns.PROJECTILE_BARRAGE;
        const fireTimes = projectileBarrage.TIMING;
        fireTimes.forEach((time, index) => {
          if (attackProgress >= time && boss.attackPatternStep === index) {
            const direction = boss.target.getComponent('Position').x > position.x ? 1 : -1;
            combatSystem.createHitbox(bossEntity, {
              width: projectileBarrage.WIDTH, 
              height: projectileBarrage.HEIGHT, 
              damage: boss.damage * projectileBarrage.DAMAGE_MULTIPLIER,
              x: position.x + (direction * projectileBarrage.SPAWN_OFFSET_X), 
              y: position.y + projectileBarrage.SPAWN_OFFSET_Y,
              attackId: `${boss.lastAttackTime}-${index}`,
              velocity: { x: projectileBarrage.VELOCITY * direction, y: 0 }
            });
            boss.attackPatternStep = index + 1;
          }
        });
        break;

      case 'air_slam':
        const airSlam = this.attackPatterns.AIR_SLAM;
        if (attackProgress >= airSlam.TIMING.JUMP && boss.attackPatternStep === 0) {
          velocity.y = airSlam.JUMP_VELOCITY;
          boss.attackPatternStep = 1;
        } else if (attackProgress >= airSlam.TIMING.SLAM && boss.attackPatternStep === 1 && physics.onGround) {
          combatSystem.createHitbox(bossEntity, { 
            width: airSlam.SHOCKWAVE.WIDTH, 
            height: airSlam.SHOCKWAVE.HEIGHT, 
            damage: boss.damage * airSlam.DAMAGE_MULTIPLIER, 
            x: position.x + airSlam.SHOCKWAVE.OFFSET_X, 
            y: position.y + airSlam.SHOCKWAVE.OFFSET_Y, 
            attackId: boss.lastAttackTime 
          });
          const slamFlash = this.flashEffects.SLAM;
          bossEntity.getComponent('Sprite')?.flash(slamFlash.COLOR, slamFlash.DURATION);
          boss.attackPatternStep = 2;
        }
        break;

      case 'multi_projectile':
        const multiProjectile = this.attackPatterns.MULTI_PROJECTILE;
        const projectileFireTimes = multiProjectile.TIMING;
        projectileFireTimes.forEach((time, index) => {
          if (attackProgress >= time && boss.attackPatternStep === index) {
            const direction = boss.target.getComponent('Position').x > position.x ? 1 : -1;
            combatSystem.createHitbox(bossEntity, {
              width: multiProjectile.WIDTH, 
              height: multiProjectile.HEIGHT, 
              damage: boss.damage * multiProjectile.DAMAGE_MULTIPLIER,
              x: position.x + (direction * multiProjectile.SPAWN_OFFSET_X), 
              y: position.y + multiProjectile.BASE_OFFSET_Y + (index * multiProjectile.SPREAD_Y),
              attackId: `${boss.lastAttackTime}-${index}`,
              velocity: { 
                x: multiProjectile.VELOCITY * direction, 
                y: (index - 1) * multiProjectile.SPREAD_VELOCITY 
              }
            });
            boss.attackPatternStep = index + 1;
          }
        });
        if (boss.attackPatternStep === projectileFireTimes.length) boss.attackPatternStep = 0;
        break;

      case 'teleport_dash':
        const teleportDash = this.attackPatterns.TELEPORT_DASH;
        const playerTargetPos = boss.target.getComponent('Position');
        if (attackProgress >= teleportDash.TIMING.TELEPORT && boss.attackPatternStep === 0) {
          const teleportDistance = Math.random() > 0.5 ? teleportDash.TELEPORT_DISTANCE : -teleportDash.TELEPORT_DISTANCE;
          position.x = playerTargetPos.x + teleportDistance;
          position.y = playerTargetPos.y;
          const dashTeleportFlash = this.flashEffects.DASH_TELEPORT;
          bossEntity.getComponent('Sprite')?.flash(dashTeleportFlash.COLOR, dashTeleportFlash.DURATION);
          boss.attackPatternStep = 1;
        } else if (attackProgress >= teleportDash.TIMING.DASH && boss.attackPatternStep === 1) {
          velocity.x = boss.facingDirection * boss.speed * teleportDash.SPEED_MULTIPLIER;
          const collision = bossEntity.getComponent('Collision');
          combatSystem.createHitbox(bossEntity, {
            width: collision.width * teleportDash.HITBOX_WIDTH_MULTIPLIER, 
            height: collision.height,
            damage: boss.damage * teleportDash.DAMAGE_MULTIPLIER,
            x: position.x + collision.offsetX,
            y: position.y + collision.offsetY,
            duration: teleportDash.DURATION, 
            attackId: boss.lastAttackTime
          });
          boss.attackPatternStep = 2;
        }
        break;
    }
  }

  calculateDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
