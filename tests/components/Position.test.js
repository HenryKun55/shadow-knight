import { Position } from '../../src/components/Position.js';

describe('Position Component', () => {
  test('should create position with default values', () => {
    const position = new Position();
    
    expect(position.x).toBe(0);
    expect(position.y).toBe(0);
  });

  test('should create position with custom values', () => {
    const position = new Position(100, 200);
    
    expect(position.x).toBe(100);
    expect(position.y).toBe(200);
  });

  test('should allow position updates', () => {
    const position = new Position(50, 75);
    
    position.x = 150;
    position.y = 225;
    
    expect(position.x).toBe(150);
    expect(position.y).toBe(225);
  });

  test('should handle negative coordinates', () => {
    const position = new Position(-50, -100);
    
    expect(position.x).toBe(-50);
    expect(position.y).toBe(-100);
  });

  test('should handle floating point coordinates', () => {
    const position = new Position(12.5, 25.75);
    
    expect(position.x).toBe(12.5);
    expect(position.y).toBe(25.75);
  });
});