/* ===================================
   COLLISION COMPONENT - SHADOW KNIGHT
   ===================================
   Collision component using centralized GameConfig for collision detection.
   All collision bounds and offsets reference configuration.
*/

import { GameConfig } from '../config/GameConfig.js';

export class Collision {
  constructor(width = null, height = null, offsetX = null, offsetY = null) {
    // Use collision configuration defaults if not specified
    const defaults = GameConfig.COLLISION.DEFAULTS;
    this.width = width || defaults.WIDTH;
    this.height = height || defaults.HEIGHT;
    this.offsetX = offsetX || defaults.OFFSET_X;
    this.offsetY = offsetY || defaults.OFFSET_Y;
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
