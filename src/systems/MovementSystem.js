// --- COMPLETE AND UNABRIDGED FILE ---

export class MovementSystem {
  constructor() {
    this.game = null;
  }

  update(deltaTime) {
    const entities = this.game.getEntitiesWithComponent('Position');

    entities.forEach(entity => {
      const position = entity.getComponent('Position');
      const velocity = entity.getComponent('Velocity');
      const physics = entity.getComponent('Physics');
      const collision = entity.getComponent('Collision');
      const sprite = entity.getComponent('Sprite');
      const enemy = entity.getComponent('Enemy');
      const boss = entity.getComponent('Boss');

      if (!position || !velocity) return;

      position.update();
      
      // Check if entity is dead but still needs physics
      const isDead = (enemy && enemy.isDead()) || (boss && boss.isDead());

      if (physics) {
        physics.applyGravity(velocity, deltaTime);
        
        // Special ragdoll physics for dead enemies
        if (isDead && (enemy?.isRagdoll || boss?.isRagdoll)) {
          // Air resistance for ragdolls
          velocity.x *= 0.98;
          velocity.y *= 0.999; // Slight air resistance on Y too
          
          if (collision) {
            const groundY = 620;
            const groundHit = position.y + collision.offsetY + collision.height >= groundY;
            
            // Ragdoll ground bouncing
            if (groundHit && velocity.y > 0) {
              const target = enemy || boss;
              
              // First few bounces
              if (target.bounces < 3 && Math.abs(velocity.y) > 50) {
                velocity.y = -velocity.y * (0.4 - target.bounces * 0.1); // Decreasing bounce
                velocity.x *= 0.7; // Lose horizontal momentum on bounce
                target.bounces++;
                
                // Force proper ground position - stick to ground
                position.y = groundY - collision.height - collision.offsetY;
              } else {
                // Stop bouncing and STICK to ground
                velocity.y = 0;
                velocity.x *= 0.85; // Final settling
                // CRITICAL: Force exact ground position like player
                position.y = groundY - collision.height - collision.offsetY;
                
                // Capture final rotation based on velocity direction
                const finalVelocityX = velocity.x;
                
                if (Math.abs(finalVelocityX) > 10) {
                  // Lying on side based on final movement direction
                  target.finalRotation = finalVelocityX > 0 ? Math.PI/2 : -Math.PI/2;
                  target.corpseDirection = finalVelocityX > 0 ? 1 : -1;
                } else {
                  // Simple side lying (always same direction for consistency)
                  target.finalRotation = Math.PI/2; // Always lie to the right
                  target.corpseDirection = 1;
                }
                
                // For rotated corpse, adjust position and collision
                if (collision && sprite) {
                  // When rotated 90 degrees, dimensions swap
                  target.corpseCollisionWidth = sprite.height;
                  target.corpseCollisionHeight = sprite.width;
                  
                  // Position corpse so it touches the ground
                  position.y = groundY - target.corpseCollisionHeight - collision.offsetY;
                }
                
                target.isRagdoll = false; // Stop ragdoll physics
              }
            } else if (groundHit) {
              // Already touching ground, keep stuck
              position.y = groundY - collision.height - collision.offsetY;
              velocity.y = Math.min(0, velocity.y); // Don't allow upward movement
            } else {
              // Normal collision check for walls
              physics.checkGroundCollision(position, velocity, groundY, collision);
            }
          }
        } else if (isDead) {
          // Dead enemies that are no longer ragdoll - completely stop physics
          const target = enemy || boss;
          if (target.isCorpse) {
            // Corpse state - completely static, no physics at all
            velocity.x = 0;
            velocity.y = 0;
            // Keep them exactly where they died
            return; // Skip all physics processing
          } else {
            // Recently dead but not yet corpse - minimal physics to settle
            velocity.x *= 0.95;
            if (collision) {
              const groundY = 620;
              const groundHit = position.y + collision.offsetY + collision.height >= groundY;
              if (groundHit) {
                position.y = groundY - collision.height - collision.offsetY;
                velocity.y = 0;
              } else {
                physics.checkGroundCollision(position, velocity, groundY, collision);
              }
            }
          }
        } else {
          // Normal living entity physics
          physics.applyFriction(velocity);
          if (collision) {
            const groundY = 620;
            physics.checkGroundCollision(position, velocity, groundY, collision);
          }
        }
      }

      position.x += velocity.x * (deltaTime / 1000);
      position.y += velocity.y * (deltaTime / 1000);

      if (collision && sprite) {
        const bounds = collision.getBounds(position, sprite, entity);
        if (bounds.x < 0) {
          position.x = 0 - (bounds.x - position.x);
          velocity.x = 0;
        } else if (bounds.x + bounds.width > this.game.worldBounds.width) {
          position.x = this.game.worldBounds.width - bounds.width - (bounds.x - position.x);
          velocity.x = 0;
        }
        if (bounds.y < 0) {
          position.y = 0 - (bounds.y - position.y);
          velocity.y = 0;
        }
      }
    });
  }
}
