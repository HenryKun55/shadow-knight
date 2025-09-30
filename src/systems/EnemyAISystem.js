/* ===================================
   ENEMY AI SYSTEM - SHADOW KNIGHT
   ===================================
   Enemy AI system using centralized GameConfig for AI behavior and timing.
   All AI parameters and animations reference configuration.
*/

import { CombatSystem } from './CombatSystem.js';
import { GameConfig } from '../config/GameConfig.js';

export class EnemyAISystem {
  constructor() {
    this.game = null;
    
    // Cache AI configuration for performance
    this.aiConfig = GameConfig.AI;
    this.enemyConfig = GameConfig.ENEMIES;
    this.animationConfig = GameConfig.ANIMATION.ENEMY;
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
      const sprite = enemyEntity.getComponent('Sprite'); // Get sprite here

      if (!enemy || !position || !velocity) return;
      
      // Always update timers, even for dead enemies (for death animation)
      enemy.updateTimers(deltaTime);
      
      // Skip AI logic for dead enemies, but keep them in the game
      if (enemy.isDead()) return;

      if (!enemy.target) enemy.target = player;

      if (enemy.isStunned() || enemy.isAttacking) {
        if (enemy.isAttacking) {
          this.executeAttackBehavior(enemy, enemyEntity, position);
        }
        return;
      }

      const distance = this.calculateDistance(position, playerPos);
      this.updateAIState(enemy, distance, sprite); // Pass sprite to updateAIState
      this.executeStateBehavior(enemy, enemyEntity, velocity, playerPos);
    });
  }

  updateAIState(enemy, distanceToPlayer, sprite) {
    const detectionRange = enemy.detectionRange;
    const attackRange = enemy.attackRange;
    const chaseMultiplier = this.aiConfig.CHASE_RANGE_MULTIPLIER;
    
    if (enemy.state === 'idle' && distanceToPlayer <= detectionRange) {
      enemy.state = 'chase';
    } else if (enemy.state === 'chase') {
      if (distanceToPlayer > detectionRange * chaseMultiplier) {
        enemy.state = 'idle';
      } else if (distanceToPlayer <= attackRange && enemy.canAttack()) {
        enemy.startAttack();
        if (sprite) {
          const flashConfig = this.aiConfig.ATTACK_FLASH;
          sprite.flash(flashConfig.COLOR, flashConfig.DURATION);
        }
      }
    }
  }

  executeStateBehavior(enemy, enemyEntity, velocity, playerPos) {
    const sprite = enemyEntity.getComponent('Sprite');
    const position = enemyEntity.getComponent('Position');
    switch (enemy.state) {
      case 'idle':
        velocity.x *= this.aiConfig.IDLE_FRICTION;
        if (sprite) sprite.playAnimation(this.animationConfig.IDLE.name);
        break;
      case 'chase':
        const direction = playerPos.x > position.x ? 1 : -1;
        velocity.x = direction * enemy.speed;
        enemy.facingDirection = direction;
        if (sprite) {
          sprite.flipX = direction < 0;
          sprite.playAnimation(this.animationConfig.RUN.name);
        }
        break;
    }
  }

  executeAttackBehavior(enemy, enemyEntity, position) {
    enemyEntity.getComponent('Velocity').x *= this.aiConfig.ATTACK_FRICTION;
    const attackProgress = enemy.attackTime / enemy.attackDuration;
    
    // Use configured attack timing window
    const attackWindow = this.aiConfig.ATTACK_WINDOW;
    if (attackProgress >= attackWindow.START && attackProgress <= attackWindow.END) {
      const combatSystem = this.game.getSystem(CombatSystem);
      const hitboxConfig = this.aiConfig.HITBOX;
      
      combatSystem.createHitbox(enemyEntity, {
        x: position.x + (enemy.facingDirection > 0 ? hitboxConfig.OFFSET_X_RIGHT : -hitboxConfig.WIDTH),
        y: position.y + hitboxConfig.OFFSET_Y,
        width: hitboxConfig.WIDTH,
        height: hitboxConfig.HEIGHT,
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
