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

      if (!position || !velocity) return;

      position.update();

      if (physics) {
        physics.applyGravity(velocity, deltaTime);
        physics.applyFriction(velocity);
        if (collision) {
          const groundY = 620;
          physics.checkGroundCollision(position, velocity, groundY, collision);
        }
      }

      position.x += velocity.x * (deltaTime / 1000);
      position.y += velocity.y * (deltaTime / 1000);

      if (collision && sprite) {
        const bounds = collision.getBounds(position, sprite);
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
