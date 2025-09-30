/* ===================================
   PLAYER CONTROL SYSTEM - SHADOW KNIGHT
   ===================================
   Handles player input and movement using centralized GameConfig.
   All input mappings and player controls reference configuration.
*/

import { GameConfig } from '../config/GameConfig.js';

export class PlayerControlSystem {
  constructor() {
    this.game = null;
    
    // Cache input configuration for performance
    this.inputConfig = GameConfig.INPUT.KEYS;
  }

  update(deltaTime) {
    const playerEntities = this.game.getEntitiesWithComponent('Player');

    playerEntities.forEach(entity => {
      const player = entity.getComponent('Player');

      if (player.isDead()) {
        this.handlePlayerDeath(entity);
        return;
      }

      if (player.isTransitioning) {
        // Don't process input during room transitions
        return;
      }

      const velocity = entity.getComponent('Velocity');
      const physics = entity.getComponent('Physics');
      const sprite = entity.getComponent('Sprite');
      if (!velocity || !physics) return;

      if (player.hitStop > 0) {
        player.updateTimers(deltaTime);
        return;
      }

      this.handleMovementInput(player, velocity, physics, sprite);
      this.handleCombatInput(player, physics);
      player.updateTimers(deltaTime);
      player.updateStamina(deltaTime);
      this.updateAnimations(player, velocity, physics, sprite);
    });
  }

  handlePlayerDeath(playerEntity) {
    const velocity = playerEntity.getComponent('Velocity');
    const sprite = playerEntity.getComponent('Sprite');
    const player = playerEntity.getComponent('Player');

    if (velocity) {
      velocity.x = 0;
    }
    if (sprite && sprite.color !== GameConfig.COLORS.PLAYER.DEAD) {
      sprite.color = GameConfig.COLORS.PLAYER.DEAD;
      sprite.playAnimation(GameConfig.ANIMATION.PLAYER.IDLE.name);
      
      // Play death sound
      this.game.soundManager.play(GameConfig.AUDIO.SOUND_NAMES.PLAYER_DEATH);
    }
    if (player) {
      // Reset combat states on death
      player.isAttacking = false;
      player.isDashing = false;
      player.attackTime = 0;
      player.dashTime = 0;
      
      // Show Game Over after a delay
      if (!player.gameOverShown) {
        player.gameOverShown = true;
        setTimeout(() => {
          this.showGameOver();
        }, GameConfig.PLAYER.DEATH.GAME_OVER_DELAY);
      }
    }
  }
  
  showGameOver() {
    // Stop the game
    this.game.isRunning = false;
    
    // Create Game Over overlay
    const gameOverDiv = document.createElement('div');
    gameOverDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      color: white;
      font-family: monospace;
    `;
    
    gameOverDiv.innerHTML = `
      <h1 style="font-size: ${GameConfig.UI.GAME_OVER.TITLE_FONT_SIZE}; margin-bottom: 20px; color: ${GameConfig.UI.GAME_OVER.TITLE_COLOR};">GAME OVER</h1>
      <p style="font-size: ${GameConfig.UI.GAME_OVER.SUBTITLE_FONT_SIZE}; margin-bottom: 30px;">Press SPACE to restart</p>
    `;
    
    document.body.appendChild(gameOverDiv);
    
    // Listen for restart
    const restartHandler = (e) => {
      if (e.code === 'Space') {
        document.removeEventListener('keydown', restartHandler);
        document.body.removeChild(gameOverDiv);
        window.location.reload(); // Restart the game
      }
    };
    
    document.addEventListener('keydown', restartHandler);
  }


  handleMovementInput(player, velocity, physics, sprite) {
    const input = this.game.inputManager;
    let moveDirection = 0;
    
    // Verifica se o mapa está aberto (hold to view)
    const mapSystem = this.game.getSystem('MapSystem');
    const isViewingMap = mapSystem && mapSystem.isMapOpen();
    
    // Movement input using configuration
    const leftKeys = this.inputConfig.MOVEMENT.LEFT;
    const rightKeys = this.inputConfig.MOVEMENT.RIGHT;
    
    // Check left movement keys
    if (leftKeys.some(key => input.isKeyDown(key))) moveDirection -= 1;
    // Check right movement keys  
    if (rightKeys.some(key => input.isKeyDown(key))) moveDirection += 1;

    if (!player.isDashing && !player.isAttacking) {
      if (moveDirection !== 0) {
        player.facingDirection = moveDirection;
        let speed = player.speed;

        // Use configured map speed modifier
        if (isViewingMap) {
          speed *= GameConfig.PLAYER.MOVEMENT.MAP_SPEED_MODIFIER;
        }

        velocity.x = moveDirection * speed;
        if (sprite) sprite.flipX = moveDirection < 0;
      } else {
        // Use physics friction values from configuration
        velocity.x *= physics.onGround ? 
          GameConfig.PHYSICS.FRICTION.GROUND : 
          GameConfig.PHYSICS.FRICTION.AIR;
      }
    }

    // Pulo e dash desabilitados quando vendo mapa
    if (!isViewingMap) {
      // Jump input using configuration
      const jumpKeys = this.inputConfig.MOVEMENT.JUMP;
      if (jumpKeys.some(key => input.isKeyPressed(key))) {
        player.lastJumpInput = Date.now();
      }

      if (player.canJump(physics)) {
        if (player.jump(physics)) {
          velocity.y = -player.jumpPower;
          this.game.soundManager.play(GameConfig.AUDIO.SOUND_NAMES.JUMP);
          player.lastJumpInput = 0;
        }
      }

      // Dash input using configuration
      const dashKeys = this.inputConfig.MOVEMENT.DASH;
      if (dashKeys.some(key => input.isKeyPressed(key))) {
        if (player.startDash()) {
          velocity.x = player.facingDirection * player.dashSpeed;
          // Só zera velocity.y se estiver no chão
          if (physics.onGround) {
            velocity.y = 0;
          }
          this.game.soundManager.play(GameConfig.AUDIO.SOUND_NAMES.DASH);
        }
      }
    }
  }

  handleCombatInput(player, physics) {
    const input = this.game.inputManager;
    
    // Attack input using configuration - usar isKeyPressed para ataque único
    const attackKeys = this.inputConfig.COMBAT.ATTACK;
    if (attackKeys.some(key => input.isKeyPressed(key))) {
      let direction = 'none';
      
      // Directional attack input using configuration
      const upKeys = this.inputConfig.MOVEMENT.UP;
      const downKeys = this.inputConfig.MOVEMENT.DOWN;
      
      if (upKeys.some(key => input.isKeyDown(key))) {
        direction = 'up';
      } else if (downKeys.some(key => input.isKeyDown(key))) {
        direction = 'down';
      }
      
      if (player.startAttack(direction, physics)) {
        this.game.soundManager.play(GameConfig.AUDIO.SOUND_NAMES.ATTACK);
      }
    }
  }

  updateAnimations(player, velocity, physics, sprite) {
    if (!sprite || player.isDashing || player.isDead()) return;

    // Use animation names from configuration
    const animations = GameConfig.ANIMATION.PLAYER;
    
    if (player.isAttacking) {
      sprite.playAnimation(animations.ATTACK.name);
    } else if (!physics.onGround) {
      const animName = velocity.y < 0 ? animations.JUMP.name : animations.FALL.name;
      sprite.playAnimation(animName);
    } else if (Math.abs(velocity.x) > GameConfig.PLAYER.MOVEMENT.MIN_RUN_VELOCITY) {
      sprite.playAnimation(animations.RUN.name);
    } else {
      sprite.playAnimation(animations.IDLE.name);
    }
  }
}
