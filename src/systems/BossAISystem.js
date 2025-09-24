// --- COMPLETE AND UNABRIDGED FILE ---

import { CombatSystem } from "./CombatSystem.js";

export class BossAISystem {
  constructor() {
    this.game = null;
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
          if (sprite) sprite.flash('#ff0000', 500);
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
        velocity.x *= 0.95;
        if (boss.stateTimer <= 0) {
          boss.state = 'active';
        }
        break;
    }
  }

  handleActiveState(boss, position, velocity, sprite, player) {
    const playerPos = player.getComponent('Position');
    const distance = this.calculateDistance(position, playerPos);

    if (distance > boss.attackRange * 1.2) {
      const direction = playerPos.x > position.x ? 1 : -1;
      velocity.x = direction * boss.speed;
      boss.facingDirection = direction;
      if (sprite) sprite.flipX = direction < 0;
    } else {
      velocity.x *= 0.7;
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
      boss.stateTimer = 500; // Fixed, shorter recovery duration
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
        if (attackProgress >= 0.25 && boss.attackPatternStep === 0) {
          combatSystem.createHitbox(bossEntity, { width: 120, height: 80, damage: boss.damage, x: position.x + (boss.facingDirection > 0 ? 0 : -120), y: position.y - 40, attackId: `${boss.lastAttackTime}-1` });
          boss.attackPatternStep = 1;
        } else if (attackProgress >= 0.5 && boss.attackPatternStep === 1) {
          combatSystem.createHitbox(bossEntity, { width: 120, height: 80, damage: boss.damage, x: position.x + (boss.facingDirection > 0 ? 10 : -130), y: position.y - 40, attackId: `${boss.lastAttackTime}-2` });
          boss.attackPatternStep = 2;
        } else if (attackProgress >= 0.75 && boss.attackPatternStep === 2) {
          combatSystem.createHitbox(bossEntity, { width: 130, height: 90, damage: boss.damage * 1.2, x: position.x + (boss.facingDirection > 0 ? 0 : -130), y: position.y - 45, attackId: `${boss.lastAttackTime}-3` });
          boss.attackPatternStep = 3;
        }
        break;

      case 'shadow_dash':
        if (attackProgress > 0.3 && boss.attackPatternStep === 0) {
          velocity.x = boss.facingDirection * boss.speed * 3;
          combatSystem.createHitbox(bossEntity, {
            width: bossEntity.getComponent('Collision').width, height: bossEntity.getComponent('Collision').height,
            damage: boss.damage * 1.2,
            x: position.x + bossEntity.getComponent('Collision').offsetX,
            y: position.y + bossEntity.getComponent('Collision').offsetY,
            duration: 400, attackId: boss.lastAttackTime
          });
          boss.attackPatternStep = 1;
        }
        break;

      case 'ground_slam':
        if (attackProgress >= 0.7 && boss.attackPatternStep === 0) {
          combatSystem.createHitbox(bossEntity, { width: 200, height: 40, damage: boss.damage * 0.8, x: position.x - 100, y: position.y, attackId: boss.lastAttackTime });
          boss.attackPatternStep = 1;
        }
        break;

      case 'teleport_strike':
        const playerPos = boss.target.getComponent('Position');
        if (attackProgress >= 0.3 && boss.attackPatternStep === 0) {
          position.x = playerPos.x - (boss.facingDirection * 100);
          position.y = playerPos.y;
          bossEntity.getComponent('Sprite')?.flash('#9c88ff', 150);
          boss.attackPatternStep = 1;
        } else if (attackProgress >= 0.6 && boss.attackPatternStep === 1) {
          combatSystem.createHitbox(bossEntity, {
            width: 90, height: 60, damage: boss.damage * 1.5,
            x: position.x + (boss.facingDirection > 0 ? 0 : -90),
            y: position.y - 30,
            attackId: boss.lastAttackTime
          });
          boss.attackPatternStep = 2;
        }
        break;

      case 'projectile_barrage':
        const fireTimes = [0.2, 0.4, 0.6, 0.8];
        fireTimes.forEach((time, index) => {
          if (attackProgress >= time && boss.attackPatternStep === index) {
            const direction = boss.target.getComponent('Position').x > position.x ? 1 : -1;
            combatSystem.createHitbox(bossEntity, {
              width: 30, height: 10, damage: boss.damage * 0.5,
              x: position.x + (direction * 30), y: position.y - 15,
              attackId: `${boss.lastAttackTime}-${index}`,
              velocity: { x: 800 * direction, y: 0 }
            });
            boss.attackPatternStep = index + 1;
          }
        });
        break;

      case 'air_slam':
        if (attackProgress >= 0.2 && boss.attackPatternStep === 0) {
          velocity.y = -600; // Jump up
          boss.attackPatternStep = 1;
        } else if (attackProgress >= 0.6 && boss.attackPatternStep === 1 && physics.onGround) {
          // Slam down and create shockwave
          combatSystem.createHitbox(bossEntity, { width: 300, height: 50, damage: boss.damage * 1.5, x: position.x - 150, y: position.y + 30, attackId: boss.lastAttackTime });
          bossEntity.getComponent('Sprite')?.flash('#ff0000', 200);
          boss.attackPatternStep = 2;
        }
        break;

      case 'multi_projectile':
        const projectileFireTimes = [0.2, 0.4, 0.6];
        projectileFireTimes.forEach((time, index) => {
          if (attackProgress >= time && boss.attackPatternStep === index) {
            const direction = boss.target.getComponent('Position').x > position.x ? 1 : -1;
            combatSystem.createHitbox(bossEntity, {
              width: 20, height: 20, damage: boss.damage * 0.7,
              x: position.x + (direction * 50), y: position.y - 20 + (index * 10),
              attackId: `${boss.lastAttackTime}-${index}`,
              velocity: { x: 600 * direction, y: (index - 1) * 100 } // Spread projectiles
            });
            boss.attackPatternStep = index + 1;
          }
        });
        if (boss.attackPatternStep === projectileFireTimes.length) boss.attackPatternStep = 0; // Reset for next attack
        break;

      case 'teleport_dash':
        const playerTargetPos = boss.target.getComponent('Position');
        if (attackProgress >= 0.3 && boss.attackPatternStep === 0) {
          // Teleport near player
          position.x = playerTargetPos.x + (Math.random() > 0.5 ? 200 : -200);
          position.y = playerTargetPos.y; // Keep on ground level
          bossEntity.getComponent('Sprite')?.flash('#00ffff', 100);
          boss.attackPatternStep = 1;
        } else if (attackProgress >= 0.5 && boss.attackPatternStep === 1) {
          // Short dash after teleport
          velocity.x = boss.facingDirection * boss.speed * 4;
          combatSystem.createHitbox(bossEntity, {
            width: bossEntity.getComponent('Collision').width * 1.5, height: bossEntity.getComponent('Collision').height,
            damage: boss.damage * 1.8,
            x: position.x + bossEntity.getComponent('Collision').offsetX,
            y: position.y + bossEntity.getComponent('Collision').offsetY,
            duration: 200, attackId: boss.lastAttackTime
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
