// --- COMPLETE AND UNABRIDGED FILE ---

export class Collision {
  constructor(width = 32, height = 32, offsetX = 0, offsetY = 0) {
    this.width = width;
    this.height = height;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  getBounds(position, sprite) {
    let boundsX = position.x + this.offsetX;

    if (sprite && sprite.flipX) {
      boundsX = position.x - this.offsetX - this.width;
    }

    return {
      x: boundsX,
      y: position.y + this.offsetY,
      width: this.width,
      height: this.height
    };
  }
}
