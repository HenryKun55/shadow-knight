import { MapState } from '../../src/components/MapState.js';

describe('MapState Component', () => {
  test('should create MapState with default values', () => {
    const mapState = new MapState();
    
    expect(mapState.isOpen).toBe(false);
    expect(mapState.currentRoom).toBe(0);
    expect(mapState.visitedRooms).toBeInstanceOf(Set);
    expect(mapState.visitedRooms.has(0)).toBe(true);
    expect(mapState.slowMovementFactor).toBe(0.3);
  });

  test('should open map correctly', () => {
    const mapState = new MapState();
    
    mapState.openMap();
    
    expect(mapState.isOpen).toBe(true);
  });

  test('should close map correctly', () => {
    const mapState = new MapState();
    mapState.openMap();
    
    mapState.closeMap();
    
    expect(mapState.isOpen).toBe(false);
  });

  test('should toggle map state', () => {
    const mapState = new MapState();
    
    expect(mapState.isOpen).toBe(false);
    
    mapState.toggleMap();
    expect(mapState.isOpen).toBe(true);
    
    mapState.toggleMap();
    expect(mapState.isOpen).toBe(false);
  });

  test('should visit new room correctly', () => {
    const mapState = new MapState();
    
    mapState.visitRoom(5);
    
    expect(mapState.currentRoom).toBe(5);
    expect(mapState.visitedRooms.has(5)).toBe(true);
  });

  test('should handle visiting already visited room', () => {
    const mapState = new MapState();
    mapState.visitRoom(3);
    
    const visitedCountBefore = mapState.visitedRooms.size;
    mapState.visitRoom(3); // Visit same room again
    
    expect(mapState.currentRoom).toBe(3);
    expect(mapState.visitedRooms.size).toBe(visitedCountBefore); // No change in size
  });

  test('should check if room is visited correctly', () => {
    const mapState = new MapState();
    mapState.visitRoom(2);
    mapState.visitRoom(7);
    
    expect(mapState.hasVisited(0)).toBe(true); // Initial room
    expect(mapState.hasVisited(2)).toBe(true);
    expect(mapState.hasVisited(7)).toBe(true);
    expect(mapState.hasVisited(5)).toBe(false); // Not visited
  });

  test('should get visited room count correctly', () => {
    const mapState = new MapState();
    
    expect(mapState.getVisitedCount()).toBe(1); // Initial room
    
    mapState.visitRoom(1);
    mapState.visitRoom(2);
    mapState.visitRoom(3);
    
    expect(mapState.getVisitedCount()).toBe(4);
  });

  test('should get visited rooms as array', () => {
    const mapState = new MapState();
    mapState.visitRoom(5);
    mapState.visitRoom(10);
    
    const visitedArray = mapState.getVisitedRooms();
    
    expect(Array.isArray(visitedArray)).toBe(true);
    expect(visitedArray).toContain(0); // Initial room
    expect(visitedArray).toContain(5);
    expect(visitedArray).toContain(10);
    expect(visitedArray.length).toBe(3);
  });

  test('should clear visited rooms correctly', () => {
    const mapState = new MapState();
    mapState.visitRoom(1);
    mapState.visitRoom(2);
    mapState.visitRoom(3);
    
    mapState.clearVisitedRooms();
    
    expect(mapState.visitedRooms.size).toBe(0);
    expect(mapState.getVisitedCount()).toBe(0);
  });

  test('should reset to initial state', () => {
    const mapState = new MapState();
    mapState.openMap();
    mapState.visitRoom(5);
    mapState.visitRoom(10);
    
    mapState.reset();
    
    expect(mapState.isOpen).toBe(false);
    expect(mapState.currentRoom).toBe(0);
    expect(mapState.visitedRooms.has(0)).toBe(true);
    expect(mapState.visitedRooms.size).toBe(1);
  });

  test('should handle negative room numbers', () => {
    const mapState = new MapState();
    
    mapState.visitRoom(-1);
    
    expect(mapState.currentRoom).toBe(-1);
    expect(mapState.hasVisited(-1)).toBe(true);
  });

  test('should handle large room numbers', () => {
    const mapState = new MapState();
    
    mapState.visitRoom(999);
    
    expect(mapState.currentRoom).toBe(999);
    expect(mapState.hasVisited(999)).toBe(true);
  });

  test('should maintain slow movement factor', () => {
    const mapState = new MapState();
    
    expect(mapState.slowMovementFactor).toBe(0.3);
    
    // Should not change when opening/closing map
    mapState.openMap();
    expect(mapState.slowMovementFactor).toBe(0.3);
    
    mapState.closeMap();
    expect(mapState.slowMovementFactor).toBe(0.3);
  });

  test('should handle visiting same room multiple times', () => {
    const mapState = new MapState();
    
    mapState.visitRoom(5);
    mapState.visitRoom(5);
    mapState.visitRoom(5);
    
    expect(mapState.currentRoom).toBe(5);
    expect(mapState.visitedRooms.size).toBe(2); // Initial room + room 5
  });

  test('should handle room visitation sequence', () => {
    const mapState = new MapState();
    
    // Visit rooms in sequence
    mapState.visitRoom(1);
    mapState.visitRoom(2);
    mapState.visitRoom(3);
    mapState.visitRoom(2); // Go back to room 2
    mapState.visitRoom(4);
    
    expect(mapState.currentRoom).toBe(4);
    expect(mapState.hasVisited(1)).toBe(true);
    expect(mapState.hasVisited(2)).toBe(true);
    expect(mapState.hasVisited(3)).toBe(true);
    expect(mapState.hasVisited(4)).toBe(true);
    expect(mapState.getVisitedCount()).toBe(5); // 0, 1, 2, 3, 4
  });

  test('should preserve map state across operations', () => {
    const mapState = new MapState();
    
    mapState.openMap();
    mapState.visitRoom(10);
    mapState.closeMap();
    mapState.visitRoom(20);
    mapState.openMap();
    
    expect(mapState.isOpen).toBe(true);
    expect(mapState.currentRoom).toBe(20);
    expect(mapState.hasVisited(10)).toBe(true);
    expect(mapState.hasVisited(20)).toBe(true);
  });
});