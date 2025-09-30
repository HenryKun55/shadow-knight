/* ===================================
   MOVEMENT SYSTEM - SHADOW KNIGHT
   ===================================
   Movement system using centralized GameConfig for physics and collision.
   All physics constants and world bounds reference configuration.
*/

import { GameConfig } from '../config/GameConfig.js';

export class MovementSystem {
  constructor() {
    this.game = null;
    
    // Cache physics configuration for performance
    this.physicsConfig = GameConfig.PHYSICS;
    this.worldBounds = GameConfig.WORLD.BOUNDS;
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
      const player = entity.getComponent('Player');

      if (!position || !velocity) return;

      position.update();
      
      // Check if entity is dead but still needs physics
      const isDead = (enemy && enemy.isDead()) || (boss && boss.isDead());

      if (physics) {
        physics.applyGravity(velocity, deltaTime);
        
        // Special ragdoll physics for dead enemies
        if (isDead && (enemy?.isRagdoll || boss?.isRagdoll)) {
          // Air resistance for ragdolls using configuration
          velocity.x *= this.physicsConfig.RAGDOLL.AIR_RESISTANCE.X;
          velocity.y *= this.physicsConfig.RAGDOLL.AIR_RESISTANCE.Y;
          
          if (collision) {
            // Get current room's ground level
            const roomTransitionSystem = this.game.getSystem('RoomTransitionSystem');
            const currentRoom = roomTransitionSystem?.rooms[roomTransitionSystem?.currentRoom];
            const groundY = currentRoom?.customGroundLevel || this.physicsConfig.COLLISION.GROUND_LEVEL;
            const groundHit = position.y + collision.offsetY + collision.height >= groundY;
            
            // Ragdoll ground bouncing
            if (groundHit && velocity.y > 0) {
              const target = enemy || boss;
              
              // First few bounces using configuration
              const maxBounces = this.physicsConfig.RAGDOLL.MAX_BOUNCES;
              const bounceThreshold = this.physicsConfig.RAGDOLL.BOUNCE_VELOCITY_THRESHOLD;
              
              if (target.bounces < maxBounces && Math.abs(velocity.y) > bounceThreshold) {
                const bounceForce = this.physicsConfig.RAGDOLL.BOUNCE_FORCE;
                const bounceDecay = this.physicsConfig.RAGDOLL.BOUNCE_DECAY;
                velocity.y = -velocity.y * (bounceForce - target.bounces * bounceDecay);
                velocity.x *= this.physicsConfig.RAGDOLL.HORIZONTAL_BOUNCE_DAMPING;
                target.bounces++;
                
                // Force proper ground position - stick to ground
                position.y = groundY - collision.height - collision.offsetY;
              } else {
                // Stop bouncing and STICK to ground
                velocity.y = 0;
                velocity.x *= this.physicsConfig.RAGDOLL.FINAL_SETTLING_DAMPING;
                // CRITICAL: Force exact ground position like player
                position.y = groundY - collision.height - collision.offsetY;
                
                // Capture final rotation based on velocity direction
                const finalVelocityX = velocity.x;
                
                const minRotationVelocity = this.physicsConfig.RAGDOLL.MIN_ROTATION_VELOCITY;
                if (Math.abs(finalVelocityX) > minRotationVelocity) {
                  // Lying on side based on final movement direction
                  const rightRotation = this.physicsConfig.RAGDOLL.ROTATION.RIGHT;
                  const leftRotation = this.physicsConfig.RAGDOLL.ROTATION.LEFT;
                  target.finalRotation = finalVelocityX > 0 ? rightRotation : leftRotation;
                  target.corpseDirection = finalVelocityX > 0 ? 1 : -1;
                } else {
                  // Simple side lying (always same direction for consistency)
                  target.finalRotation = this.physicsConfig.RAGDOLL.ROTATION.DEFAULT;
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
            velocity.x *= this.physicsConfig.DEAD_ENTITY.SETTLING_DAMPING;
            if (collision) {
              // Get current room's ground level
              const roomTransitionSystem = this.game.getSystem('RoomTransitionSystem');
              const currentRoom = roomTransitionSystem?.rooms[roomTransitionSystem?.currentRoom];
              const groundY = currentRoom?.customGroundLevel || this.physicsConfig.COLLISION.GROUND_LEVEL;
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
          // Don't apply friction if player is dashing
          if (!player || !player.isDashing) {
            physics.applyFriction(velocity);
          }
          if (collision) {
            // Check platform collision first
            const roomTransitionSystem = this.game.getSystem('RoomTransitionSystem');
            if (roomTransitionSystem) {
              const currentRoom = roomTransitionSystem.rooms[roomTransitionSystem.currentRoom];
              if (currentRoom && currentRoom.platforms) {
                const platformCollision = physics.checkPlatformCollision(position, velocity, currentRoom.platforms, collision);
                // Only check ground collision if no platform collision
                if (!platformCollision) {
                  // Get current room's ground level
                  const roomTransitionSystem = this.game.getSystem('RoomTransitionSystem');
                  const currentRoom = roomTransitionSystem?.rooms[roomTransitionSystem?.currentRoom];
                  const groundY = currentRoom?.customGroundLevel || this.physicsConfig.COLLISION.GROUND_LEVEL;
                  physics.checkGroundCollision(position, velocity, groundY, collision);
                }
              } else {
                // Get current room's ground level
                const roomTransitionSystem = this.game.getSystem('RoomTransitionSystem');
                const currentRoom = roomTransitionSystem?.rooms[roomTransitionSystem?.currentRoom];
                const groundY = currentRoom?.customGroundLevel || this.physicsConfig.COLLISION.GROUND_LEVEL;
                physics.checkGroundCollision(position, velocity, groundY, collision);
              }
            } else {
              // Get current room's ground level
              const roomTransitionSystem = this.game.getSystem('RoomTransitionSystem');
              const currentRoom = roomTransitionSystem?.rooms[roomTransitionSystem?.currentRoom];
              const groundY = currentRoom?.customGroundLevel || this.physicsConfig.COLLISION.GROUND_LEVEL;
              physics.checkGroundCollision(position, velocity, groundY, collision);
            }
          }
        }
      }

      // Apply velocity using time scaling configuration
      const timeScale = this.physicsConfig.TIME_SCALE;
      position.x += velocity.x * (deltaTime / 1000) * timeScale;
      position.y += velocity.y * (deltaTime / 1000) * timeScale;

      if (collision && sprite) {
        const bounds = collision.getBounds(position, sprite, entity);
        if (bounds.x < 0) {
          position.x = 0 - (bounds.x - position.x);
          velocity.x = 0;
        } else if (bounds.x + bounds.width > this.worldBounds.width) {
          position.x = this.worldBounds.width - bounds.width - (bounds.x - position.x);
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
