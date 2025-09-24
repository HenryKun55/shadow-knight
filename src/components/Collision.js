// --- COMPLETE AND UNABRIDGED FILE ---

export class Collision {
  constructor(width = 32, height = 32, offsetX = 0, offsetY = 0) {
    this.width = width;
    this.height = height;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  getBounds(position, sprite, entity = null) {
    let width = this.width;
    let height = this.height;
    let offsetX = this.offsetX;
    let offsetY = this.offsetY;
    
    // Check for corpse collision adjustments
    if (entity) {
      const enemy = entity.getComponent('Enemy');
      const boss = entity.getComponent('Boss');
      
      if ((enemy && enemy.isCorpse) || (boss && boss.isCorpse)) {
        const target = enemy || boss;
        if (target.corpseCollisionWidth > 0) {
          width = target.corpseCollisionWidth;
          height = target.corpseCollisionHeight;
          // Adjust offsets for rotated collision box
          offsetX = -width / 2;
          offsetY = -height / 2;
        }
      }
    }

    let boundsX = position.x + offsetX;

    if (sprite && sprite.flipX) {
      boundsX = position.x - offsetX - width;
    }

    return {
      x: boundsX,
      y: position.y + offsetY,
      width: width,
      height: height
    };
  }
}
