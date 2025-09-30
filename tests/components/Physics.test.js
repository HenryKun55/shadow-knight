import { Physics } from '../../src/components/Physics.js';

describe('Physics Component', () => {
  test('should create physics with default values', () => {
    const physics = new Physics();
    
    expect(physics.gravity).toBe(980);
    expect(physics.friction).toBe(0.6);
    expect(physics.airResistance).toBe(0.98);
    expect(physics.grounded).toBe(false);
    expect(physics.mass).toBe(1);
    expect(physics.bounceAmount).toBe(0);
    expect(physics.terminalVelocity).toBe(1000);
  });

  test('should create physics with custom values', () => {
    const physics = new Physics(500, 0.8, 0.95);
    
    expect(physics.gravity).toBe(500);
    expect(physics.friction).toBe(0.8);
    expect(physics.airResistance).toBe(0.95);
  });

  test('should allow property updates', () => {
    const physics = new Physics();
    
    physics.gravity = 1200;
    physics.friction = 0.7;
    physics.grounded = true;
    physics.mass = 2;
    
    expect(physics.gravity).toBe(1200);
    expect(physics.friction).toBe(0.7);
    expect(physics.grounded).toBe(true);
    expect(physics.mass).toBe(2);
  });

  test('should handle zero gravity', () => {
    const physics = new Physics(0);
    
    expect(physics.gravity).toBe(0);
  });

  test('should handle maximum friction', () => {
    const physics = new Physics(980, 1.0);
    
    expect(physics.friction).toBe(1.0);
  });

  test('should handle minimum friction', () => {
    const physics = new Physics(980, 0.0);
    
    expect(physics.friction).toBe(0.0);
  });

  test('should handle different mass values', () => {
    const lightPhysics = new Physics();
    lightPhysics.mass = 0.5;
    
    const heavyPhysics = new Physics();
    heavyPhysics.mass = 3.0;
    
    expect(lightPhysics.mass).toBe(0.5);
    expect(heavyPhysics.mass).toBe(3.0);
  });

  test('should handle bounce physics', () => {
    const physics = new Physics();
    physics.bounceAmount = 0.8;
    
    expect(physics.bounceAmount).toBe(0.8);
  });

  test('should handle terminal velocity', () => {
    const physics = new Physics();
    physics.terminalVelocity = 500;
    
    expect(physics.terminalVelocity).toBe(500);
  });

  test('should support chaining property assignments', () => {
    const physics = new Physics();
    
    physics.gravity = 1500;
    physics.friction = 0.9;
    physics.grounded = true;
    
    expect(physics.gravity).toBe(1500);
    expect(physics.friction).toBe(0.9);
    expect(physics.grounded).toBe(true);
  });
});