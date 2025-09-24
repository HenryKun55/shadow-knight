// --- COMPLETE AND UNABRIDGED FILE ---

export class Physics {
  constructor(options = {}) {
    this.gravity = options.gravity || 980;
    this.friction = options.friction || 0.9;
    this.airResistance = options.airResistance || 0.99;
    this.mass = options.mass || 1;
    this.onGround = false;
  }

  applyGravity(velocity, deltaTime) {
    if (!this.onGround) {
      velocity.y += this.gravity * this.mass * (deltaTime / 1000);
    }
  }

  applyFriction(velocity) {
    if (this.onGround) {
      velocity.x *= this.friction;
    } else {
      velocity.x *= this.airResistance;
    }
  }

  checkGroundCollision(position, velocity, groundY, collision) {
    const boundsBottom = position.y + collision.offsetY + collision.height;

    if (boundsBottom >= groundY && velocity.y >= 0) {
      position.y = groundY - collision.height - collision.offsetY;
      velocity.y = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }
  }
}
