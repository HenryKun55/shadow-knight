import { RoomTransitionSystem } from '../../src/systems/RoomTransitionSystem.js';
import { Entity } from '../../src/core/Entity.js';
import { Position } from '../../src/components/Position.js';
import { Player } from '../../src/components/Player.js';
import { Room } from '../../src/components/Room.js';

describe('RoomTransitionSystem', () => {
  let roomTransitionSystem;
  let entities;
  let playerEntity;
  let roomEntity;

  beforeEach(() => {
    roomTransitionSystem = new RoomTransitionSystem();
    entities = [];

    // Create player entity
    playerEntity = new Entity();
    playerEntity.addComponent('Position', new Position(100, 520));
    playerEntity.addComponent('Player', new Player());

    // Create room entity with doors
    roomEntity = new Entity();
    roomEntity.addComponent('Position', new Position(0, 0));
    
    const room = new Room(1, 'forest', { x: 0, y: 0, width: 1280, height: 720 });
    // Add a door on the right side
    room.addDoor({
      side: 'right',
      x: 1240,
      y: 520,
      width: 40,
      height: 100,
      targetRoom: 2,
      targetSpawn: 'left'
    });
    roomEntity.addComponent('Room', room);

    entities.push(playerEntity, roomEntity);
  });

  test('should create RoomTransitionSystem', () => {
    expect(roomTransitionSystem).toBeDefined();
  });

  test('should detect when player enters door area', () => {
    const playerPos = playerEntity.getComponent('Position');
    
    // Move player to door area
    playerPos.x = 1245; // Inside door x range
    playerPos.y = 550;  // Inside door y range

    const transitionOccurred =     // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    roomTransitionSystem.game = mockGame;

    roomTransitionSystem.update(16);

    expect(transitionOccurred).toBe(true);
  });

  test('should not trigger transition when player is not in door area', () => {
    const playerPos = playerEntity.getComponent('Position');
    
    // Keep player away from door
    playerPos.x = 640; // Middle of room
    playerPos.y = 360;

    const transitionOccurred =     // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    roomTransitionSystem.game = mockGame;

    roomTransitionSystem.update(16);

    expect(transitionOccurred).toBe(false);
  });

  test('should not trigger transition when player is dead', () => {
    const player = playerEntity.getComponent('Player');
    const playerPos = playerEntity.getComponent('Position');
    
    player.health = 0; // Dead player
    playerPos.x = 1245; // In door area
    playerPos.y = 550;

    const transitionOccurred =     // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    roomTransitionSystem.game = mockGame;

    roomTransitionSystem.update(16);

    expect(transitionOccurred).toBe(false);
  });

  test('should handle player at exact door boundaries', () => {
    const playerPos = playerEntity.getComponent('Position');
    
    // Position player at door boundary
    playerPos.x = 1240; // Exact left edge of door
    playerPos.y = 520;  // Exact top edge of door

    const transitionOccurred =     // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    roomTransitionSystem.game = mockGame;

    roomTransitionSystem.update(16);

    expect(transitionOccurred).toBe(true);
  });

  test('should handle player just outside door boundaries', () => {
    const playerPos = playerEntity.getComponent('Position');
    
    // Position player just outside door
    playerPos.x = 1239; // Just left of door
    playerPos.y = 550;

    const transitionOccurred =     // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    roomTransitionSystem.game = mockGame;

    roomTransitionSystem.update(16);

    expect(transitionOccurred).toBe(false);
  });

  test('should handle room with multiple doors', () => {
    const room = roomEntity.getComponent('Room');
    
    // Add a second door on the left side
    room.addDoor({
      side: 'left',
      x: 0,
      y: 520,
      width: 40,
      height: 100,
      targetRoom: 0,
      targetSpawn: 'right'
    });

    const playerPos = playerEntity.getComponent('Position');
    
    // Test left door
    playerPos.x = 20; // Inside left door
    playerPos.y = 550;

    const transitionOccurred =     // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    roomTransitionSystem.game = mockGame;

    roomTransitionSystem.update(16);

    expect(transitionOccurred).toBe(true);
  });

  test('should handle room with no doors', () => {
    const room = roomEntity.getComponent('Room');
    room.doors = []; // Remove all doors

    const playerPos = playerEntity.getComponent('Position');
    playerPos.x = 1245; // Where door used to be
    playerPos.y = 550;

    const transitionOccurred =     // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    roomTransitionSystem.game = mockGame;

    roomTransitionSystem.update(16);

    expect(transitionOccurred).toBe(false);
  });

  test('should handle entities without required components', () => {
    const incompleteEntity = new Entity();
    incompleteEntity.addComponent('Position', new Position(300, 300));
    // Missing Player and Room components
    
    entities.push(incompleteEntity);

    expect(() => {
          // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    roomTransitionSystem.game = mockGame;

    roomTransitionSystem.update(16);
    }).not.toThrow();
  });

  test('should handle multiple players (edge case)', () => {
    // Create second player
    const player2Entity = new Entity();
    player2Entity.addComponent('Position', new Position(1245, 550));
    player2Entity.addComponent('Player', new Player());
    
    entities.push(player2Entity);

    const transitionOccurred =     // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    roomTransitionSystem.game = mockGame;

    roomTransitionSystem.update(16);

    // Should detect transition for any player in door area
    expect(transitionOccurred).toBe(true);
  });

  test('should handle doors at different positions', () => {
    const room = roomEntity.getComponent('Room');
    room.doors = []; // Clear existing doors
    
    // Add door at top
    room.addDoor({
      side: 'top',
      x: 600,
      y: 0,
      width: 80,
      height: 40,
      targetRoom: 3,
      targetSpawn: 'bottom'
    });

    const playerPos = playerEntity.getComponent('Position');
    playerPos.x = 620; // Inside top door
    playerPos.y = 20;

    const transitionOccurred =     // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    roomTransitionSystem.game = mockGame;

    roomTransitionSystem.update(16);

    expect(transitionOccurred).toBe(true);
  });

  test('should handle doors at bottom of room', () => {
    const room = roomEntity.getComponent('Room');
    room.doors = []; // Clear existing doors
    
    // Add door at bottom
    room.addDoor({
      side: 'bottom',
      x: 600,
      y: 680,
      width: 80,
      height: 40,
      targetRoom: 4,
      targetSpawn: 'top'
    });

    const playerPos = playerEntity.getComponent('Position');
    playerPos.x = 620; // Inside bottom door
    playerPos.y = 700;

    const transitionOccurred =     // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    roomTransitionSystem.game = mockGame;

    roomTransitionSystem.update(16);

    expect(transitionOccurred).toBe(true);
  });

  test('should handle very small doors', () => {
    const room = roomEntity.getComponent('Room');
    room.doors = []; // Clear existing doors
    
    // Add tiny door
    room.addDoor({
      side: 'right',
      x: 1270,
      y: 550,
      width: 10,
      height: 20,
      targetRoom: 5,
      targetSpawn: 'left'
    });

    const playerPos = playerEntity.getComponent('Position');
    playerPos.x = 1275; // Inside tiny door
    playerPos.y = 555;

    const transitionOccurred =     // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    roomTransitionSystem.game = mockGame;

    roomTransitionSystem.update(16);

    expect(transitionOccurred).toBe(true);
  });

  test('should handle very large doors', () => {
    const room = roomEntity.getComponent('Room');
    room.doors = []; // Clear existing doors
    
    // Add large door covering entire right side
    room.addDoor({
      side: 'right',
      x: 1200,
      y: 0,
      width: 80,
      height: 720,
      targetRoom: 6,
      targetSpawn: 'left'
    });

    const playerPos = playerEntity.getComponent('Position');
    playerPos.x = 1220; // Inside large door
    playerPos.y = 100;  // Anywhere vertically

    const transitionOccurred =     // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    roomTransitionSystem.game = mockGame;

    roomTransitionSystem.update(16);

    expect(transitionOccurred).toBe(true);
  });

  test('should return correct transition data', () => {
    const playerPos = playerEntity.getComponent('Position');
    playerPos.x = 1245;
    playerPos.y = 550;

    const result =     // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    roomTransitionSystem.game = mockGame;

    roomTransitionSystem.update(16);

    expect(result).toBe(true);
    // In a full implementation, this might return transition details
    // like target room ID and spawn point
  });

  test('should handle player exactly at door corner', () => {
    const playerPos = playerEntity.getComponent('Position');
    
    // Test all four corners of the door
    const doorCorners = [
      { x: 1240, y: 520 }, // Top-left
      { x: 1280, y: 520 }, // Top-right  
      { x: 1240, y: 620 }, // Bottom-left
      { x: 1280, y: 620 }  // Bottom-right
    ];

    doorCorners.forEach(corner => {
      playerPos.x = corner.x;
      playerPos.y = corner.y;
      
      const transitionOccurred =     // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    roomTransitionSystem.game = mockGame;

    roomTransitionSystem.update(16);
      expect(transitionOccurred).toBe(true);
    });
  });

  test('should handle floating point positions', () => {
    const playerPos = playerEntity.getComponent('Position');
    
    // Use floating point coordinates
    playerPos.x = 1245.7;
    playerPos.y = 550.3;

    const transitionOccurred =     // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    roomTransitionSystem.game = mockGame;

    roomTransitionSystem.update(16);

    expect(transitionOccurred).toBe(true);
  });

  test('should handle negative door coordinates', () => {
    const room = roomEntity.getComponent('Room');
    room.doors = []; // Clear existing doors
    
    // Add door with negative coordinates (edge case)
    room.addDoor({
      side: 'left',
      x: -40,
      y: 520,
      width: 40,
      height: 100,
      targetRoom: 7,
      targetSpawn: 'right'
    });

    const playerPos = playerEntity.getComponent('Position');
    playerPos.x = -20; // Inside negative door area
    playerPos.y = 550;

    const transitionOccurred =     // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    roomTransitionSystem.game = mockGame;

    roomTransitionSystem.update(16);

    expect(transitionOccurred).toBe(true);
  });

  test('should handle empty entities array', () => {
    expect(() => {
      roomTransitionSystem.update([], 16);
    }).not.toThrow();
  });

  test('should handle door with zero dimensions', () => {
    const room = roomEntity.getComponent('Room');
    room.doors = []; // Clear existing doors
    
    // Add door with zero dimensions
    room.addDoor({
      side: 'right',
      x: 1240,
      y: 520,
      width: 0,
      height: 0,
      targetRoom: 8,
      targetSpawn: 'left'
    });

    const playerPos = playerEntity.getComponent('Position');
    playerPos.x = 1240; // Exactly at door position
    playerPos.y = 520;

    const transitionOccurred =     // Mock game instance
    const mockGame = {
      getEntitiesWithComponent: jest.fn().mockReturnValue(entities)
    };
    roomTransitionSystem.game = mockGame;

    roomTransitionSystem.update(16);

    expect(transitionOccurred).toBe(false); // Zero-size door should not trigger
  });
});