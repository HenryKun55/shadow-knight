import { Velocity } from '../../src/components/Velocity.js';

describe('Velocity Component', () => {
  test('should create velocity with default values', () => {
    const velocity = new Velocity();
    
    expect(velocity.x).toBe(0);
    expect(velocity.y).toBe(0);
  });

  test('should create velocity with custom values', () => {
    const velocity = new Velocity(5, -10);
    
    expect(velocity.x).toBe(5);
    expect(velocity.y).toBe(-10);
  });

  test('should allow velocity updates', () => {
    const velocity = new Velocity(1, 2);
    
    velocity.x = 10;
    velocity.y = -5;
    
    expect(velocity.x).toBe(10);
    expect(velocity.y).toBe(-5);
  });

  test('should handle floating point velocities', () => {
    const velocity = new Velocity(3.14, -2.71);
    
    expect(velocity.x).toBeCloseTo(3.14);
    expect(velocity.y).toBeCloseTo(-2.71);
  });
});