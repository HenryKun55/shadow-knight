/* ===================================
   SPRITE COMPONENT - SHADOW KNIGHT
   ===================================
   Sprite component using centralized GameConfig for animation and visual settings.
   All timing, defaults, and visual effects reference configuration.
*/

import { GameConfig } from '../config/GameConfig.js';

export class Sprite {
  constructor(options = {}) {
    // Cache sprite configuration for performance
    this.spriteConfig = GameConfig.SPRITE;
    this.defaults = this.spriteConfig.DEFAULTS;
    
    this.image = new Image();
    this.image.src = options.imageSrc || this.defaults.PLACEHOLDER_IMAGE;
    this.width = options.width || this.defaults.WIDTH;
    this.height = options.height || this.defaults.HEIGHT;
    this.offsetX = options.offsetX || this.defaults.OFFSET_X;
    this.offsetY = options.offsetY || this.defaults.OFFSET_Y;

    this.frameWidth = options.frameWidth || this.width;
    this.frameHeight = options.frameHeight || this.height;

    this.animations = new Map();
    this.animationName = this.defaults.INITIAL_ANIMATION;
    this.currentFrame = 0;
    this.frameTimer = 0;

    this.flipX = false;
    this.visible = this.defaults.VISIBLE;
    this.alpha = this.defaults.ALPHA;
    this.shakeEffect = { x: 0, y: 0 };

    // Flash effect properties using configuration
    this.flashColor = null;
    this.flashDuration = 0;
    this.initialFlashDuration = 0;
    this.originalColor = null;

    this.color = options.color || null;
  }

  addAnimation(name, frames, frameTime = null) {
    const effectiveFrameTime = frameTime || this.spriteConfig.ANIMATION.DEFAULT_FRAME_TIME;
    this.animations.set(name, { frames, frameTime: effectiveFrameTime });
  }

  playAnimation(name) {
    if (this.animationName !== name) {
      this.animationName = name;
      this.currentFrame = 0;
      this.frameTimer = 0;
    }
  }

  update(deltaTime) {
    const anim = this.animations.get(this.animationName);
    if (!anim) return;

    // Update animation frame using configuration
    this.frameTimer += deltaTime;
    if (this.frameTimer >= anim.frameTime) {
      this.frameTimer = 0;
      this.currentFrame = (this.currentFrame + 1) % anim.frames.length;
    }

    // Update flash effect using configuration
    if (this.flashDuration > 0) {
      this.flashDuration -= deltaTime;
      if (this.flashDuration <= 0) {
        this.flashDuration = 0;
        if (this.originalColor !== null) {
          this.color = this.originalColor;
          this.originalColor = null;
        }
        this.flashColor = null;
        this.initialFlashDuration = 0;
      }
    }
  }

  flash(color, duration) {
    // Flash effect using configuration defaults if not specified
    const flashConfig = this.spriteConfig.FLASH;
    const effectiveColor = color || flashConfig.DEFAULT_COLOR;
    const effectiveDuration = duration || flashConfig.DEFAULT_DURATION;
    
    if (this.originalColor === null) {
      this.originalColor = this.color;
    }
    this.color = effectiveColor;
    this.flashColor = effectiveColor;
    this.flashDuration = effectiveDuration;
    this.initialFlashDuration = effectiveDuration;
  }
}