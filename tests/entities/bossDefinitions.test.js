import { createShadowLord } from '../../src/entities/bossDefinitions.js';
import { Entity } from '../../src/core/Entity.js';
import { Position } from '../../src/components/Position.js';
import { Velocity } from '../../src/components/Velocity.js';
import { Boss } from '../../src/components/Boss.js';
import { Sprite } from '../../src/components/Sprite.js';
import { Physics } from '../../src/components/Physics.js';
import { Collision } from '../../src/components/Collision.js';

describe('Boss Definitions', () => {
  test('should create Shadow Lord boss entity', () => {
    const x = 400;
    const y = 300;
    
    const shadowLord = createShadowLord(x, y);
    
    expect(shadowLord).toBeInstanceOf(Entity);
  });

  test('should create Shadow Lord with correct position', () => {
    const x = 500;
    const y = 250;
    
    const shadowLord = createShadowLord(x, y);
    const position = shadowLord.getComponent(Position);
    
    expect(position).toBeDefined();
    expect(position.x).toBe(x);
    expect(position.y).toBe(y);
  });

  test('should create Shadow Lord with velocity component', () => {
    const shadowLord = createShadowLord(100, 100);
    const velocity = shadowLord.getComponent(Velocity);
    
    expect(velocity).toBeDefined();
    expect(velocity.x).toBe(0);
    expect(velocity.y).toBe(0);
  });

  test('should create Shadow Lord with boss component', () => {
    const shadowLord = createShadowLord(100, 100);
    const boss = shadowLord.getComponent(Boss);
    
    expect(boss).toBeDefined();
    expect(boss.health).toBeGreaterThan(0);
    expect(boss.maxHealth).toBeGreaterThan(0);
    expect(boss.attackDamage).toBeGreaterThan(0);
  });

  test('should create Shadow Lord with sprite component', () => {
    const shadowLord = createShadowLord(100, 100);
    const sprite = shadowLord.getComponent(Sprite);
    
    expect(sprite).toBeDefined();
    expect(sprite.imagePath).toBeDefined();
    expect(sprite.width).toBeGreaterThan(0);
    expect(sprite.height).toBeGreaterThan(0);
  });

  test('should create Shadow Lord with physics component', () => {
    const shadowLord = createShadowLord(100, 100);
    const physics = shadowLord.getComponent(Physics);
    
    expect(physics).toBeDefined();
    expect(physics.gravity).toBeDefined();
    expect(physics.friction).toBeDefined();
  });

  test('should create Shadow Lord with collision component', () => {
    const shadowLord = createShadowLord(100, 100);
    const collision = shadowLord.getComponent(Collision);
    
    expect(collision).toBeDefined();
    expect(collision.width).toBeGreaterThan(0);
    expect(collision.height).toBeGreaterThan(0);
  });

  test('should create Shadow Lord with proper boss stats', () => {
    const shadowLord = createShadowLord(100, 100);
    const boss = shadowLord.getComponent(Boss);
    
    expect(boss.health).toBe(boss.maxHealth); // Start at full health
    expect(boss.phase).toBe(1); // Start at phase 1
    expect(boss.isDead).toBe(false);
    expect(boss.isAttacking).toBe(false);
    expect(boss.state).toBe('idle');
  });

  test('should create Shadow Lord with sprite animations', () => {
    const shadowLord = createShadowLord(100, 100);
    const sprite = shadowLord.getComponent(Sprite);
    
    expect(Object.keys(sprite.animations).length).toBeGreaterThan(0);
    expect(sprite.animations['idle']).toBeDefined();
  });

  test('should handle negative position coordinates', () => {
    const shadowLord = createShadowLord(-50, -100);
    const position = shadowLord.getComponent(Position);
    
    expect(position.x).toBe(-50);
    expect(position.y).toBe(-100);
  });

  test('should handle very large position coordinates', () => {
    const shadowLord = createShadowLord(10000, 5000);
    const position = shadowLord.getComponent(Position);
    
    expect(position.x).toBe(10000);
    expect(position.y).toBe(5000);
  });

  test('should create Shadow Lord with floating point coordinates', () => {
    const shadowLord = createShadowLord(123.45, 678.90);
    const position = shadowLord.getComponent(Position);
    
    expect(position.x).toBeCloseTo(123.45);
    expect(position.y).toBeCloseTo(678.90);
  });

  test('should create Shadow Lord with unique entity ID', () => {
    const shadowLord1 = createShadowLord(100, 100);
    const shadowLord2 = createShadowLord(200, 200);
    
    expect(shadowLord1.id).not.toBe(shadowLord2.id);
    expect(typeof shadowLord1.id).toBe('number');
    expect(typeof shadowLord2.id).toBe('number');
  });

  test('should create Shadow Lord with proper collision bounds', () => {
    const shadowLord = createShadowLord(100, 100);
    const collision = shadowLord.getComponent(Collision);
    const position = shadowLord.getComponent(Position);
    
    const bounds = collision.getBounds(position);
    
    expect(bounds.left).toBeDefined();
    expect(bounds.right).toBeDefined();
    expect(bounds.top).toBeDefined();
    expect(bounds.bottom).toBeDefined();
    expect(bounds.right).toBeGreaterThan(bounds.left);
    expect(bounds.bottom).toBeGreaterThan(bounds.top);
  });

  test('should create Shadow Lord with solid collision', () => {
    const shadowLord = createShadowLord(100, 100);
    const collision = shadowLord.getComponent(Collision);
    
    expect(collision.solid).toBe(true);
    expect(collision.sensor).toBe(false);
  });

  test('should create Shadow Lord with boss tag in collision', () => {
    const shadowLord = createShadowLord(100, 100);
    const collision = shadowLord.getComponent(Collision);
    
    expect(collision.hasTag('boss')).toBe(true);
  });

  test('should create Shadow Lord with proper sprite scale', () => {
    const shadowLord = createShadowLord(100, 100);
    const sprite = shadowLord.getComponent(Sprite);
    
    expect(sprite.scale).toBeGreaterThan(0);
    expect(sprite.scale).toBeLessThanOrEqual(3); // Reasonable scale range
  });

  test('should create Shadow Lord with proper physics settings', () => {
    const shadowLord = createShadowLord(100, 100);
    const physics = shadowLord.getComponent(Physics);
    
    expect(physics.mass).toBeGreaterThan(0);
    expect(physics.gravity).toBeGreaterThan(0);
    expect(physics.friction).toBeGreaterThanOrEqual(0);
    expect(physics.friction).toBeLessThanOrEqual(1);
  });

  test('should create Shadow Lord with initial grounded state', () => {
    const shadowLord = createShadowLord(100, 100);
    const physics = shadowLord.getComponent(Physics);
    
    expect(physics.grounded).toBe(false); // Should start in air
  });

  test('should create Shadow Lord with boss-appropriate health', () => {
    const shadowLord = createShadowLord(100, 100);
    const boss = shadowLord.getComponent(Boss);
    
    expect(boss.health).toBeGreaterThan(100); // Should be higher than regular enemy
    expect(boss.maxHealth).toBeGreaterThan(100);
    expect(boss.health).toBe(boss.maxHealth);
  });

  test('should create Shadow Lord with boss-appropriate damage', () => {
    const shadowLord = createShadowLord(100, 100);
    const boss = shadowLord.getComponent(Boss);
    
    expect(boss.attackDamage).toBeGreaterThan(20); // Should be higher than regular enemy
  });

  test('should create Shadow Lord with all required animation states', () => {
    const shadowLord = createShadowLord(100, 100);
    const sprite = shadowLord.getComponent(Sprite);
    
    const requiredAnimations = ['idle', 'walk', 'attack', 'hurt', 'death'];
    
    requiredAnimations.forEach(animation => {
      expect(sprite.animations[animation]).toBeDefined();
      expect(Array.isArray(sprite.animations[animation])).toBe(true);
      expect(sprite.animations[animation].length).toBeGreaterThan(0);
    });
  });

  test('should create Shadow Lord with proper initial animation', () => {
    const shadowLord = createShadowLord(100, 100);
    const sprite = shadowLord.getComponent(Sprite);
    
    expect(sprite.currentAnimation).toBe('idle');
    expect(sprite.playing).toBe(true);
  });

  test('should create Shadow Lord with proper size for boss', () => {
    const shadowLord = createShadowLord(100, 100);
    const sprite = shadowLord.getComponent(Sprite);
    const collision = shadowLord.getComponent(Collision);
    
    // Boss should be larger than regular enemies
    expect(sprite.width).toBeGreaterThan(32);
    expect(sprite.height).toBeGreaterThan(32);
    expect(collision.width).toBeGreaterThan(30);
    expect(collision.height).toBeGreaterThan(40);
  });

  test('should create multiple Shadow Lords with independent states', () => {
    const shadowLord1 = createShadowLord(100, 100);
    const shadowLord2 = createShadowLord(300, 200);
    
    const boss1 = shadowLord1.getComponent(Boss);
    const boss2 = shadowLord2.getComponent(Boss);
    
    // Modify one boss
    boss1.health = 50;
    boss1.phase = 2;
    
    // Other boss should be unaffected
    expect(boss2.health).toBe(boss2.maxHealth);
    expect(boss2.phase).toBe(1);
  });

  test('should create Shadow Lord with proper entity component count', () => {
    const shadowLord = createShadowLord(100, 100);
    
    // Should have all required components
    const componentCount = shadowLord.components.size;
    expect(componentCount).toBeGreaterThanOrEqual(6); // Position, Velocity, Boss, Sprite, Physics, Collision
  });
});