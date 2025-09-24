// --- COMPLETE AND UNABRIDGED FILE ---

import { CombatSystem } from './CombatSystem.js';

export class EnemyAISystem {
  constructor() {
    this.game = null;
  }

  update(deltaTime) {
    const enemies = this.game.getEntitiesWithComponent('Enemy');
    const playerEntities = this.game.getEntitiesWithComponent('Player');
    if (playerEntities.length === 0) return;
    const player = playerEntities[0];
    const playerPos = player.getComponent('Position');

    enemies.forEach(enemyEntity => {
      const enemy = enemyEntity.getComponent('Enemy');
      const position = enemyEntity.getComponent('Position');
      const velocity = enemyEntity.getComponent('Velocity');

      if (!enemy || !position || !velocity || enemy.isDead()) return;

      if (!enemy.target) enemy.target = player;
      enemy.updateTimers(deltaTime);

      if (enemy.isStunned() || enemy.isAttacking) {
        if (enemy.isAttacking) {
          this.executeAttackBehavior(enemy, enemyEntity, position);
        }
        return;
      }

      const distance = this.calculateDistance(position, playerPos);
      this.updateAIState(enemy, distance);
      this.executeStateBehavior(enemy, enemyEntity, velocity, playerPos);
    });
  }

  updateAIState(enemy, distanceToPlayer) {
    if (enemy.state === 'idle' && distanceToPlayer <= enemy.detectionRange) {
      enemy.state = 'chase';
    } else if (enemy.state === 'chase') {
      if (distanceToPlayer > enemy.detectionRange * 1.5) {
        enemy.state = 'idle';
      } else if (distanceToPlayer <= enemy.attackRange && enemy.canAttack()) {
        enemy.startAttack();
      }
    }
  }

  executeStateBehavior(enemy, enemyEntity, velocity, playerPos) {
    const sprite = enemyEntity.getComponent('Sprite');
    const position = enemyEntity.getComponent('Position');
    switch (enemy.state) {
      case 'idle':
        velocity.x *= 0.8;
        if (sprite) sprite.playAnimation('idle');
        break;
      case 'chase':
        const direction = playerPos.x > position.x ? 1 : -1;
        velocity.x = direction * enemy.speed;
        enemy.facingDirection = direction;
        if (sprite) {
          sprite.flipX = direction < 0;
          sprite.playAnimation('run');
        }
        break;
    }
  }

  executeAttackBehavior(enemy, enemyEntity, position) {
    enemyEntity.getComponent('Velocity').x *= 0.2;
    const attackProgress = enemy.attackTime / enemy.attackDuration;
    if (attackProgress >= 0.6 && attackProgress <= 0.8) {
      const combatSystem = this.game.getSystem(CombatSystem);
      const hitboxWidth = 60;
      combatSystem.createHitbox(enemyEntity, {
        x: position.x + (enemy.facingDirection > 0 ? 10 : -hitboxWidth),
        y: position.y - 10,
        width: hitboxWidth,
        height: 40,
        damage: enemy.damage,
        attackId: enemy.lastAttackTime
      });
    }
  }

  calculateDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
