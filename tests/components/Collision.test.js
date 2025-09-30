import { Collision } from '../../src/components/Collision.js';

describe('Collision Component', () => {
  test('should create collision with required parameters', () => {
    const collision = new Collision(32, 48);
    
    expect(collision.width).toBe(32);
    expect(collision.height).toBe(48);
    expect(collision.offsetX).toBe(0);
    expect(collision.offsetY).toBe(0);
    expect(collision.solid).toBe(true);
    expect(collision.sensor).toBe(false);
    expect(collision.tags).toEqual([]);
  });

  test('should create collision with all parameters', () => {
    const collision = new Collision(64, 64, 10, -5, false, true, ['enemy', 'projectile']);
    
    expect(collision.width).toBe(64);
    expect(collision.height).toBe(64);
    expect(collision.offsetX).toBe(10);
    expect(collision.offsetY).toBe(-5);
    expect(collision.solid).toBe(false);
    expect(collision.sensor).toBe(true);
    expect(collision.tags).toEqual(['enemy', 'projectile']);
  });

  test('should default optional parameters correctly', () => {
    const collision = new Collision(50, 75, 5);
    
    expect(collision.width).toBe(50);
    expect(collision.height).toBe(75);
    expect(collision.offsetX).toBe(5);
    expect(collision.offsetY).toBe(0); // Default
    expect(collision.solid).toBe(true); // Default
    expect(collision.sensor).toBe(false); // Default
    expect(collision.tags).toEqual([]); // Default
  });

  test('should calculate bounding box correctly with no offset', () => {
    const collision = new Collision(40, 60);
    const position = { x: 100, y: 200 };
    
    const bounds = collision.getBounds(position);
    
    expect(bounds.left).toBe(100);
    expect(bounds.right).toBe(140); // 100 + 40
    expect(bounds.top).toBe(200);
    expect(bounds.bottom).toBe(260); // 200 + 60
  });

  test('should calculate bounding box correctly with offset', () => {
    const collision = new Collision(30, 50, 10, -5);
    const position = { x: 100, y: 200 };
    
    const bounds = collision.getBounds(position);
    
    expect(bounds.left).toBe(110); // 100 + 10
    expect(bounds.right).toBe(140); // 110 + 30
    expect(bounds.top).toBe(195); // 200 - 5
    expect(bounds.bottom).toBe(245); // 195 + 50
  });

  test('should detect collision between overlapping boxes', () => {
    const collision1 = new Collision(40, 40);
    const collision2 = new Collision(40, 40);
    
    const position1 = { x: 100, y: 100 };
    const position2 = { x: 120, y: 120 }; // Overlapping
    
    expect(collision1.intersects(collision2, position1, position2)).toBe(true);
  });

  test('should not detect collision between non-overlapping boxes', () => {
    const collision1 = new Collision(40, 40);
    const collision2 = new Collision(40, 40);
    
    const position1 = { x: 100, y: 100 };
    const position2 = { x: 200, y: 200 }; // Far away
    
    expect(collision1.intersects(collision2, position1, position2)).toBe(false);
  });

  test('should detect collision at exact boundary', () => {
    const collision1 = new Collision(40, 40);
    const collision2 = new Collision(40, 40);
    
    const position1 = { x: 100, y: 100 };
    const position2 = { x: 140, y: 100 }; // Touching right edge
    
    expect(collision1.intersects(collision2, position1, position2)).toBe(false);
  });

  test('should detect collision with one pixel overlap', () => {
    const collision1 = new Collision(40, 40);
    const collision2 = new Collision(40, 40);
    
    const position1 = { x: 100, y: 100 };
    const position2 = { x: 139, y: 100 }; // One pixel overlap
    
    expect(collision1.intersects(collision2, position1, position2)).toBe(true);
  });

  test('should handle collision with negative positions', () => {
    const collision1 = new Collision(40, 40);
    const collision2 = new Collision(40, 40);
    
    const position1 = { x: -20, y: -20 };
    const position2 = { x: -10, y: -10 }; // Overlapping
    
    expect(collision1.intersects(collision2, position1, position2)).toBe(true);
  });

  test('should handle collision with offsets', () => {
    const collision1 = new Collision(40, 40, 10, 10);
    const collision2 = new Collision(40, 40, -5, -5);
    
    const position1 = { x: 100, y: 100 };
    const position2 = { x: 135, y: 135 }; // Should overlap with offsets
    
    expect(collision1.intersects(collision2, position1, position2)).toBe(true);
  });

  test('should add tags correctly', () => {
    const collision = new Collision(32, 32);
    
    collision.addTag('player');
    collision.addTag('character');
    
    expect(collision.tags).toContain('player');
    expect(collision.tags).toContain('character');
    expect(collision.tags.length).toBe(2);
  });

  test('should not add duplicate tags', () => {
    const collision = new Collision(32, 32);
    
    collision.addTag('player');
    collision.addTag('player'); // Duplicate
    
    expect(collision.tags).toEqual(['player']);
    expect(collision.tags.length).toBe(1);
  });

  test('should remove tags correctly', () => {
    const collision = new Collision(32, 32, 0, 0, true, false, ['player', 'character']);
    
    collision.removeTag('player');
    
    expect(collision.tags).not.toContain('player');
    expect(collision.tags).toContain('character');
    expect(collision.tags.length).toBe(1);
  });

  test('should handle removing non-existent tag', () => {
    const collision = new Collision(32, 32, 0, 0, true, false, ['player']);
    
    collision.removeTag('enemy'); // Doesn't exist
    
    expect(collision.tags).toEqual(['player']);
  });

  test('should check if has tag correctly', () => {
    const collision = new Collision(32, 32, 0, 0, true, false, ['player', 'character']);
    
    expect(collision.hasTag('player')).toBe(true);
    expect(collision.hasTag('character')).toBe(true);
    expect(collision.hasTag('enemy')).toBe(false);
  });

  test('should clear all tags', () => {
    const collision = new Collision(32, 32, 0, 0, true, false, ['player', 'character', 'hero']);
    
    collision.clearTags();
    
    expect(collision.tags).toEqual([]);
    expect(collision.tags.length).toBe(0);
  });

  test('should handle zero-sized collision boxes', () => {
    const collision1 = new Collision(0, 0);
    const collision2 = new Collision(40, 40);
    
    const position1 = { x: 100, y: 100 };
    const position2 = { x: 100, y: 100 };
    
    expect(collision1.intersects(collision2, position1, position2)).toBe(false);
  });

  test('should handle very large collision boxes', () => {
    const collision1 = new Collision(1000, 1000);
    const collision2 = new Collision(40, 40);
    
    const position1 = { x: 0, y: 0 };
    const position2 = { x: 500, y: 500 }; // Inside large box
    
    expect(collision1.intersects(collision2, position1, position2)).toBe(true);
  });

  test('should create sensor collision correctly', () => {
    const collision = new Collision(50, 50, 0, 0, false, true);
    
    expect(collision.solid).toBe(false);
    expect(collision.sensor).toBe(true);
  });

  test('should update collision properties', () => {
    const collision = new Collision(32, 32);
    
    collision.width = 64;
    collision.height = 48;
    collision.offsetX = 8;
    collision.offsetY = -4;
    collision.solid = false;
    collision.sensor = true;
    
    expect(collision.width).toBe(64);
    expect(collision.height).toBe(48);
    expect(collision.offsetX).toBe(8);
    expect(collision.offsetY).toBe(-4);
    expect(collision.solid).toBe(false);
    expect(collision.sensor).toBe(true);
  });
});