// --- COMPLETE AND UNABRIDGED FILE ---

export class PlayerControlSystem {
  constructor() {
    this.game = null;
  }

  update(deltaTime) {
    const playerEntities = this.game.getEntitiesWithComponent('Player');

    playerEntities.forEach(entity => {
      const player = entity.getComponent('Player');

      if (player.isDead()) {
        this.handlePlayerDeath(entity);
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
    if (sprite && sprite.color !== '#555555') {
      sprite.color = '#555555';
      sprite.playAnimation('idle'); // Reset animation to idle on death
    }
    if (player) {
      // Reset combat states on death
      player.isAttacking = false;
      player.isDashing = false;
      player.attackTime = 0;
      player.dashTime = 0;
    }
  }

  handleMovementInput(player, velocity, physics, sprite) {
    const input = this.game.inputManager;
    let moveDirection = 0;
    if (input.isKeyDown('KeyA') || input.isKeyDown('ArrowLeft')) moveDirection -= 1;
    if (input.isKeyDown('KeyD') || input.isKeyDown('ArrowRight')) moveDirection += 1;

    if (!player.isDashing && !player.isAttacking) {
      if (moveDirection !== 0) {
        player.facingDirection = moveDirection;
        velocity.x = moveDirection * player.speed;
        if (sprite) sprite.flipX = moveDirection < 0;
      } else {
        velocity.x *= physics.onGround ? 0.6 : 0.98; // Increased ground deceleration
      }
    }

    if (input.isKeyPressed('KeyK')) {
      player.lastJumpInput = Date.now();
    }

    if (player.canJump(physics)) {
      if (player.jump(physics)) {
        velocity.y = -player.jumpPower;
        this.game.soundManager.play('jump');
        player.lastJumpInput = 0;
      }
    }

    if (input.isKeyPressed('KeyL')) {
      if (player.startDash()) {
        velocity.x = player.facingDirection * player.dashSpeed;
        velocity.y = 0;
        this.game.soundManager.play('dash');
      }
    }
  }

  handleCombatInput(player, physics) {
    const input = this.game.inputManager;
    if (input.isKeyDown('KeyJ')) {
      let direction = 'none';
      if (input.isKeyDown('ArrowUp') || input.isKeyDown('KeyW')) {
        direction = 'up';
      } else if (input.isKeyDown('ArrowDown') || input.isKeyDown('KeyS')) {
        direction = 'down';
      }
      if (player.startAttack(direction, physics)) {
        this.game.soundManager.play('attack');
      }
    }
  }

  updateAnimations(player, velocity, physics, sprite) {
    if (!sprite || player.isDashing || player.isDead()) return;

    if (player.isAttacking) {
      sprite.playAnimation('attack');
    } else if (!physics.onGround) {
      sprite.playAnimation(velocity.y < 0 ? 'jump' : 'fall');
    } else if (Math.abs(velocity.x) > 1) {
      sprite.playAnimation('run');
    } else {
      sprite.playAnimation('idle');
    }
  }
}
