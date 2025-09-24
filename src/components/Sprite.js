// --- COMPLETE AND UNABRIDGED FILE ---
export class Sprite {
  constructor(options = {}) {
    this.image = new Image();
    this.image.src = options.imageSrc || 'https://placehold.co/32x32/ff0000/ffffff?text=X';
    this.width = options.width || 32;
    this.height = options.height || 32;
    this.offsetX = options.offsetX || 0;
    this.offsetY = options.offsetY || 0;

    this.frameWidth = options.frameWidth || this.width;
    this.frameHeight = options.frameHeight || this.height;

    this.animations = new Map();
    this.animationName = 'idle';
    this.currentFrame = 0;
    this.frameTimer = 0;

    this.flipX = false;
    this.visible = true;
    this.alpha = 1;
    this.shakeEffect = { x: 0, y: 0 };

    this.flashColor = null;
    this.flashDuration = 0;
    this.initialFlashDuration = 0;
    this.originalColor = null;

    this.color = options.color || null;
  }

  addAnimation(name, frames, frameTime = 100) {
    this.animations.set(name, { frames, frameTime });
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

    this.frameTimer += deltaTime;
    if (this.frameTimer >= anim.frameTime) {
      this.frameTimer = 0;
      this.currentFrame = (this.currentFrame + 1) % anim.frames.length;
    }

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
    if (this.originalColor === null) {
      this.originalColor = this.color;
    }
    this.color = color;
    this.flashColor = color;
    this.flashDuration = duration;
    this.initialFlashDuration = duration;
  }
}