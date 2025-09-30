import { Sprite } from '../../src/components/Sprite.js';

describe('Sprite Component', () => {
  test('should create sprite with required parameters', () => {
    const sprite = new Sprite('player.png', 32, 32);
    
    expect(sprite.imagePath).toBe('player.png');
    expect(sprite.width).toBe(32);
    expect(sprite.height).toBe(32);
    expect(sprite.currentFrame).toBe(0);
    expect(sprite.animations).toEqual({});
    expect(sprite.currentAnimation).toBeNull();
    expect(sprite.animationSpeed).toBe(100);
    expect(sprite.loop).toBe(true);
    expect(sprite.playing).toBe(false);
    expect(sprite.lastFrameTime).toBe(0);
    expect(sprite.flipX).toBe(false);
    expect(sprite.flipY).toBe(false);
    expect(sprite.scale).toBe(1);
    expect(sprite.opacity).toBe(1);
    expect(sprite.rotation).toBe(0);
  });

  test('should create sprite with optional parameters', () => {
    const sprite = new Sprite('enemy.png', 64, 48, 150, false);
    
    expect(sprite.imagePath).toBe('enemy.png');
    expect(sprite.width).toBe(64);
    expect(sprite.height).toBe(48);
    expect(sprite.animationSpeed).toBe(150);
    expect(sprite.loop).toBe(false);
  });

  test('should add animation correctly', () => {
    const sprite = new Sprite('character.png', 32, 32);
    
    sprite.addAnimation('walk', [0, 1, 2, 3]);
    
    expect(sprite.animations['walk']).toEqual([0, 1, 2, 3]);
  });

  test('should add multiple animations', () => {
    const sprite = new Sprite('character.png', 32, 32);
    
    sprite.addAnimation('idle', [0]);
    sprite.addAnimation('walk', [1, 2, 3, 4]);
    sprite.addAnimation('attack', [5, 6, 7]);
    
    expect(sprite.animations['idle']).toEqual([0]);
    expect(sprite.animations['walk']).toEqual([1, 2, 3, 4]);
    expect(sprite.animations['attack']).toEqual([5, 6, 7]);
  });

  test('should play animation correctly', () => {
    const sprite = new Sprite('character.png', 32, 32);
    sprite.addAnimation('walk', [0, 1, 2, 3]);
    
    sprite.play('walk');
    
    expect(sprite.currentAnimation).toBe('walk');
    expect(sprite.playing).toBe(true);
    expect(sprite.currentFrame).toBe(0);
  });

  test('should not play non-existent animation', () => {
    const sprite = new Sprite('character.png', 32, 32);
    
    sprite.play('nonexistent');
    
    expect(sprite.currentAnimation).toBeNull();
    expect(sprite.playing).toBe(false);
  });

  test('should stop animation correctly', () => {
    const sprite = new Sprite('character.png', 32, 32);
    sprite.addAnimation('walk', [0, 1, 2, 3]);
    sprite.play('walk');
    
    sprite.stop();
    
    expect(sprite.playing).toBe(false);
    expect(sprite.currentFrame).toBe(0);
  });

  test('should update animation frames over time', () => {
    const sprite = new Sprite('character.png', 32, 32, 100); // 100ms per frame
    sprite.addAnimation('walk', [0, 1, 2]);
    sprite.play('walk');
    
    // Simulate time passing
    sprite.lastFrameTime = 0;
    sprite.update(150); // 150ms should advance 1 frame
    
    expect(sprite.currentFrame).toBe(1);
  });

  test('should loop animation when enabled', () => {
    const sprite = new Sprite('character.png', 32, 32, 100, true);
    sprite.addAnimation('walk', [0, 1, 2]);
    sprite.play('walk');
    
    // Advance to last frame
    sprite.currentFrame = 2;
    sprite.lastFrameTime = 0;
    sprite.update(150); // Should loop back to frame 0
    
    expect(sprite.currentFrame).toBe(0);
  });

  test('should stop at last frame when loop is disabled', () => {
    const sprite = new Sprite('character.png', 32, 32, 100, false);
    sprite.addAnimation('walk', [0, 1, 2]);
    sprite.play('walk');
    
    // Advance to last frame
    sprite.currentFrame = 2;
    sprite.lastFrameTime = 0;
    sprite.update(150); // Should stay at frame 2 and stop playing
    
    expect(sprite.currentFrame).toBe(2);
    expect(sprite.playing).toBe(false);
  });

  test('should not update when not playing', () => {
    const sprite = new Sprite('character.png', 32, 32);
    sprite.addAnimation('walk', [0, 1, 2]);
    
    const initialFrame = sprite.currentFrame;
    sprite.update(1000); // Large time delta
    
    expect(sprite.currentFrame).toBe(initialFrame);
  });

  test('should handle transform properties', () => {
    const sprite = new Sprite('character.png', 32, 32);
    
    sprite.flipX = true;
    sprite.flipY = false;
    sprite.scale = 2.0;
    sprite.opacity = 0.8;
    sprite.rotation = Math.PI / 4;
    
    expect(sprite.flipX).toBe(true);
    expect(sprite.flipY).toBe(false);
    expect(sprite.scale).toBe(2.0);
    expect(sprite.opacity).toBe(0.8);
    expect(sprite.rotation).toBe(Math.PI / 4);
  });

  test('should get current frame from animation', () => {
    const sprite = new Sprite('character.png', 32, 32);
    sprite.addAnimation('walk', [5, 6, 7, 8]);
    sprite.play('walk');
    sprite.currentFrame = 2; // Third frame in animation
    
    expect(sprite.getCurrentAnimationFrame()).toBe(7);
  });

  test('should return 0 when no current animation', () => {
    const sprite = new Sprite('character.png', 32, 32);
    
    expect(sprite.getCurrentAnimationFrame()).toBe(0);
  });

  test('should handle empty animation array', () => {
    const sprite = new Sprite('character.png', 32, 32);
    sprite.addAnimation('empty', []);
    sprite.play('empty');
    
    expect(sprite.playing).toBe(true);
    expect(sprite.getCurrentAnimationFrame()).toBe(0);
  });

  test('should reset to first frame when switching animations', () => {
    const sprite = new Sprite('character.png', 32, 32);
    sprite.addAnimation('walk', [0, 1, 2]);
    sprite.addAnimation('run', [3, 4, 5]);
    
    sprite.play('walk');
    sprite.currentFrame = 2;
    
    sprite.play('run');
    
    expect(sprite.currentFrame).toBe(0);
    expect(sprite.currentAnimation).toBe('run');
  });
});