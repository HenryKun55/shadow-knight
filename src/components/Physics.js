/* ===================================
   PHYSICS COMPONENT - SHADOW KNIGHT
   ===================================
   Physics component using centralized GameConfig for all physics constants.
   Handles gravity, friction, collisions with configurable values.
*/

import { GameConfig } from '../config/GameConfig.js';

export class Physics {
  constructor(options = {}) {
    // Use centralized physics configuration with fallbacks
    this.gravity = options.gravity || GameConfig.PHYSICS.GRAVITY;
    this.friction = options.friction || GameConfig.PHYSICS.FRICTION.GROUND;
    this.airResistance = options.airResistance || GameConfig.PHYSICS.FRICTION.AIR;
    this.mass = options.mass || 1;
    
    // Ground state
    this.onGround = false;
    
    // Collision tolerance from configuration
    this.collisionTolerance = GameConfig.PHYSICS.COLLISION.TOLERANCE;
    this.groundLevel = GameConfig.PHYSICS.COLLISION.GROUND_LEVEL;
  }

  applyGravity(velocity, deltaTime) {
    if (!this.onGround) {
      // Apply consistent gravity force per frame
      // gravity is in pixels/second², deltaTime is in ms, so convert properly
      const gravityForce = this.gravity * this.mass * (deltaTime / 1000);
      velocity.y += gravityForce;
      
      // Apply terminal velocity to prevent infinite acceleration
      this.applyTerminalVelocity(velocity);
    }
  }

  applyFriction(velocity) {
    // Apply friction based on ground state using configuration values
    if (this.onGround) {
      velocity.x *= this.friction;
    } else {
      // Only apply air resistance to horizontal movement, not vertical
      velocity.x *= this.airResistance;
      // No air resistance on vertical movement during normal gameplay
    }
  }

  checkGroundCollision(position, velocity, groundY = null, collision) {
    // Use configured ground level if not provided
    const effectiveGroundY = groundY !== null ? groundY : this.groundLevel;
    const boundsBottom = position.y + collision.offsetY + collision.height;

    // Check collision with tolerance
    if (boundsBottom >= (effectiveGroundY - this.collisionTolerance) && velocity.y >= 0) {
      // Snap to ground level
      position.y = effectiveGroundY - collision.height - collision.offsetY;
      velocity.y = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }
  }

  // Additional physics utility methods
  
  /**
   * Check if entity is falling (not on ground and moving downward)
   */
  isFalling(velocity) {
    return !this.onGround && velocity.y > 0;
  }

  /**
   * Check if entity is jumping (not on ground and moving upward)
   */
  isJumping(velocity) {
    return !this.onGround && velocity.y < 0;
  }

  /**
   * Apply terminal velocity limits
   */
  applyTerminalVelocity(velocity, maxFallSpeed = 800) {
    if (velocity.y > maxFallSpeed) {
      velocity.y = maxFallSpeed;
    }
  }

  /**
   * Reset physics state (useful for teleporting or respawning)
   */
  reset() {
    this.onGround = false;
  }

  /**
   * Check collision with platforms
   */
  checkPlatformCollision(position, velocity, platforms, collision) {
    if (!platforms || !collision) return;

    const entityLeft = position.x + collision.offsetX;
    const entityRight = position.x + collision.offsetX + collision.width;
    const entityTop = position.y + collision.offsetY;
    const entityBottom = position.y + collision.offsetY + collision.height;

    // Only check platform collision if falling or moving down
    if (velocity.y < 0) return;

    for (const platform of platforms) {
      // Check if entity is horizontally aligned with platform
      if (entityRight > platform.x && entityLeft < platform.x + platform.width) {
        // Check if entity is landing on top of platform
        const platformTop = platform.y;
        const platformBottom = platform.y + platform.height;

        // Landing on top of platform
        if (entityBottom >= platformTop - this.collisionTolerance && 
            entityBottom <= platformTop + this.collisionTolerance + Math.abs(velocity.y * 0.016)) {
          // Snap to platform top
          position.y = platformTop - collision.height - collision.offsetY;
          velocity.y = 0;
          this.onGround = true;
          return true; // Platform collision detected
        }
      }
    }
    return false; // No platform collision
  }
}
