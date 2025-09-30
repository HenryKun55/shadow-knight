import { Entity } from '../../src/core/Entity.js';
import { Position } from '../../src/components/Position.js';
import { Velocity } from '../../src/components/Velocity.js';

describe('Entity', () => {
  let entity;

  beforeEach(() => {
    entity = new Entity();
  });

  test('should create entity with unique ID', () => {
    const entity1 = new Entity();
    const entity2 = new Entity();
    
    expect(entity1.id).not.toBe(entity2.id);
    expect(typeof entity1.id).toBe('string');
    expect(typeof entity2.id).toBe('string');
  });

  test('should add components correctly', () => {
    const position = new Position(10, 20);
    entity.addComponent(Position, position);
    
    expect(entity.hasComponent(Position)).toBe(true);
    expect(entity.getComponent(Position)).toBe(position);
  });

  test('should remove components correctly', () => {
    const position = new Position(10, 20);
    entity.addComponent(Position, position);
    
    expect(entity.hasComponent(Position)).toBe(true);
    
    entity.removeComponent(Position);
    
    expect(entity.hasComponent(Position)).toBe(false);
    expect(entity.getComponent(Position)).toBeUndefined();
  });

  test('should handle multiple components', () => {
    const position = new Position(10, 20);
    const velocity = new Velocity(5, -3);
    
    entity.addComponent(Position, position);
    entity.addComponent(Velocity, velocity);
    
    expect(entity.hasComponent(Position)).toBe(true);
    expect(entity.hasComponent(Velocity)).toBe(true);
    expect(entity.getComponent(Position)).toBe(position);
    expect(entity.getComponent(Velocity)).toBe(velocity);
  });

  test('should replace existing component', () => {
    const position1 = new Position(10, 20);
    const position2 = new Position(30, 40);
    
    entity.addComponent(Position, position1);
    expect(entity.getComponent(Position)).toBe(position1);
    
    entity.addComponent(Position, position2);
    expect(entity.getComponent(Position)).toBe(position2);
  });

  test('should return undefined for non-existent component', () => {
    expect(entity.getComponent(Position)).toBeUndefined();
    expect(entity.hasComponent(Position)).toBe(false);
  });

  test('should handle component removal when component does not exist', () => {
    expect(() => {
      entity.removeComponent(Position);
    }).not.toThrow();
    
    expect(entity.hasComponent(Position)).toBe(false);
  });
});