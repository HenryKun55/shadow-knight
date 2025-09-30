import { Room } from '../../src/components/Room.js';

describe('Room Component', () => {
  test('should create room with required parameters', () => {
    const room = new Room(5, 'forest', { x: 0, y: 0, width: 1280, height: 720 });
    
    expect(room.id).toBe(5);
    expect(room.theme).toBe('forest');
    expect(room.bounds).toEqual({ x: 0, y: 0, width: 1280, height: 720 });
    expect(room.doors).toEqual([]);
    expect(room.enemies).toEqual([]);
    expect(room.items).toEqual([]);
    expect(room.visited).toBe(false);
    expect(room.cleared).toBe(false);
    expect(room.spawnPoint).toEqual({ x: 100, y: 550 });
  });

  test('should create room with custom spawn point', () => {
    const spawnPoint = { x: 200, y: 300 };
    const room = new Room(1, 'cave', { x: 0, y: 0, width: 1280, height: 720 }, spawnPoint);
    
    expect(room.spawnPoint).toEqual(spawnPoint);
  });

  test('should add door correctly', () => {
    const room = new Room(1, 'forest', { x: 0, y: 0, width: 1280, height: 720 });
    const door = {
      side: 'right',
      x: 1240,
      y: 520,
      width: 40,
      height: 100,
      targetRoom: 2,
      targetSpawn: 'left'
    };
    
    room.addDoor(door);
    
    expect(room.doors).toContain(door);
    expect(room.doors.length).toBe(1);
  });

  test('should add multiple doors', () => {
    const room = new Room(1, 'forest', { x: 0, y: 0, width: 1280, height: 720 });
    const door1 = { side: 'right', x: 1240, y: 520, width: 40, height: 100, targetRoom: 2, targetSpawn: 'left' };
    const door2 = { side: 'left', x: 0, y: 520, width: 40, height: 100, targetRoom: 0, targetSpawn: 'right' };
    
    room.addDoor(door1);
    room.addDoor(door2);
    
    expect(room.doors.length).toBe(2);
    expect(room.doors).toContain(door1);
    expect(room.doors).toContain(door2);
  });

  test('should add enemy correctly', () => {
    const room = new Room(1, 'forest', { x: 0, y: 0, width: 1280, height: 720 });
    const enemy = { type: 'goblin', x: 400, y: 570 };
    
    room.addEnemy(enemy);
    
    expect(room.enemies).toContain(enemy);
    expect(room.enemies.length).toBe(1);
  });

  test('should add multiple enemies', () => {
    const room = new Room(1, 'forest', { x: 0, y: 0, width: 1280, height: 720 });
    const enemy1 = { type: 'goblin', x: 400, y: 570 };
    const enemy2 = { type: 'orc', x: 600, y: 570 };
    
    room.addEnemy(enemy1);
    room.addEnemy(enemy2);
    
    expect(room.enemies.length).toBe(2);
    expect(room.enemies).toContain(enemy1);
    expect(room.enemies).toContain(enemy2);
  });

  test('should add item correctly', () => {
    const room = new Room(1, 'forest', { x: 0, y: 0, width: 1280, height: 720 });
    const item = { type: 'health_potion', x: 300, y: 550 };
    
    room.addItem(item);
    
    expect(room.items).toContain(item);
    expect(room.items.length).toBe(1);
  });

  test('should remove enemy correctly', () => {
    const room = new Room(1, 'forest', { x: 0, y: 0, width: 1280, height: 720 });
    const enemy1 = { type: 'goblin', x: 400, y: 570 };
    const enemy2 = { type: 'orc', x: 600, y: 570 };
    
    room.addEnemy(enemy1);
    room.addEnemy(enemy2);
    
    room.removeEnemy(enemy1);
    
    expect(room.enemies.length).toBe(1);
    expect(room.enemies).not.toContain(enemy1);
    expect(room.enemies).toContain(enemy2);
  });

  test('should remove item correctly', () => {
    const room = new Room(1, 'forest', { x: 0, y: 0, width: 1280, height: 720 });
    const item1 = { type: 'health_potion', x: 300, y: 550 };
    const item2 = { type: 'mana_potion', x: 400, y: 550 };
    
    room.addItem(item1);
    room.addItem(item2);
    
    room.removeItem(item1);
    
    expect(room.items.length).toBe(1);
    expect(room.items).not.toContain(item1);
    expect(room.items).toContain(item2);
  });

  test('should mark room as visited', () => {
    const room = new Room(1, 'forest', { x: 0, y: 0, width: 1280, height: 720 });
    
    room.visit();
    
    expect(room.visited).toBe(true);
  });

  test('should mark room as cleared', () => {
    const room = new Room(1, 'forest', { x: 0, y: 0, width: 1280, height: 720 });
    
    room.clear();
    
    expect(room.cleared).toBe(true);
  });

  test('should check if room has enemies', () => {
    const room = new Room(1, 'forest', { x: 0, y: 0, width: 1280, height: 720 });
    
    expect(room.hasEnemies()).toBe(false);
    
    room.addEnemy({ type: 'goblin', x: 400, y: 570 });
    
    expect(room.hasEnemies()).toBe(true);
  });

  test('should check if room has items', () => {
    const room = new Room(1, 'forest', { x: 0, y: 0, width: 1280, height: 720 });
    
    expect(room.hasItems()).toBe(false);
    
    room.addItem({ type: 'health_potion', x: 300, y: 550 });
    
    expect(room.hasItems()).toBe(true);
  });

  test('should get enemy count correctly', () => {
    const room = new Room(1, 'forest', { x: 0, y: 0, width: 1280, height: 720 });
    
    expect(room.getEnemyCount()).toBe(0);
    
    room.addEnemy({ type: 'goblin', x: 400, y: 570 });
    room.addEnemy({ type: 'orc', x: 600, y: 570 });
    
    expect(room.getEnemyCount()).toBe(2);
  });

  test('should get item count correctly', () => {
    const room = new Room(1, 'forest', { x: 0, y: 0, width: 1280, height: 720 });
    
    expect(room.getItemCount()).toBe(0);
    
    room.addItem({ type: 'health_potion', x: 300, y: 550 });
    room.addItem({ type: 'mana_potion', x: 400, y: 550 });
    room.addItem({ type: 'sword', x: 500, y: 550 });
    
    expect(room.getItemCount()).toBe(3);
  });

  test('should find door by side', () => {
    const room = new Room(1, 'forest', { x: 0, y: 0, width: 1280, height: 720 });
    const rightDoor = { side: 'right', x: 1240, y: 520, width: 40, height: 100, targetRoom: 2, targetSpawn: 'left' };
    const leftDoor = { side: 'left', x: 0, y: 520, width: 40, height: 100, targetRoom: 0, targetSpawn: 'right' };
    
    room.addDoor(rightDoor);
    room.addDoor(leftDoor);
    
    expect(room.getDoorBySide('right')).toBe(rightDoor);
    expect(room.getDoorBySide('left')).toBe(leftDoor);
    expect(room.getDoorBySide('top')).toBeUndefined();
  });

  test('should check if position is inside room bounds', () => {
    const room = new Room(1, 'forest', { x: 100, y: 50, width: 1280, height: 720 });
    
    expect(room.containsPoint(200, 100)).toBe(true); // Inside
    expect(room.containsPoint(50, 100)).toBe(false); // Left of bounds
    expect(room.containsPoint(1500, 100)).toBe(false); // Right of bounds
    expect(room.containsPoint(200, 25)).toBe(false); // Above bounds
    expect(room.containsPoint(200, 800)).toBe(false); // Below bounds
  });

  test('should reset room state', () => {
    const room = new Room(1, 'forest', { x: 0, y: 0, width: 1280, height: 720 });
    
    room.addEnemy({ type: 'goblin', x: 400, y: 570 });
    room.addItem({ type: 'health_potion', x: 300, y: 550 });
    room.visit();
    room.clear();
    
    room.reset();
    
    expect(room.visited).toBe(false);
    expect(room.cleared).toBe(false);
    // Note: enemies and items should be restored from original data in a full implementation
  });

  test('should handle room with no doors', () => {
    const room = new Room(1, 'isolated', { x: 0, y: 0, width: 1280, height: 720 });
    
    expect(room.doors.length).toBe(0);
    expect(room.getDoorBySide('right')).toBeUndefined();
  });

  test('should handle removing non-existent enemy', () => {
    const room = new Room(1, 'forest', { x: 0, y: 0, width: 1280, height: 720 });
    const enemy = { type: 'goblin', x: 400, y: 570 };
    
    // Should not throw error
    expect(() => {
      room.removeEnemy(enemy);
    }).not.toThrow();
    
    expect(room.enemies.length).toBe(0);
  });

  test('should handle removing non-existent item', () => {
    const room = new Room(1, 'forest', { x: 0, y: 0, width: 1280, height: 720 });
    const item = { type: 'health_potion', x: 300, y: 550 };
    
    // Should not throw error
    expect(() => {
      room.removeItem(item);
    }).not.toThrow();
    
    expect(room.items.length).toBe(0);
  });

  test('should handle room bounds edge cases', () => {
    const room = new Room(1, 'forest', { x: 0, y: 0, width: 1280, height: 720 });
    
    // Test boundary points
    expect(room.containsPoint(0, 0)).toBe(true); // Top-left corner
    expect(room.containsPoint(1279, 719)).toBe(true); // Bottom-right corner (inside)
    expect(room.containsPoint(1280, 720)).toBe(false); // Outside bottom-right
  });
});