import { PlayerControlSystem } from '../../src/systems/PlayerControlSystem.js';
import { Entity } from '../../src/core/Entity.js';
import { Position } from '../../src/components/Position.js';
import { Velocity } from '../../src/components/Velocity.js';
import { Player } from '../../src/components/Player.js';
import { Physics } from '../../src/components/Physics.js';

// Mock SoundManager
jest.mock('../../src/core/SoundManager.js', () => ({
  play: jest.fn()
}));

describe('PlayerControlSystem', () => {
  let playerControlSystem;
  let entities;
  let playerEntity;
  let mockInputManager;
  let mockGame;

  beforeEach(() => {
    // Mock InputManager
    mockInputManager = {
      isAnyKeyPressed: jest.fn(),
      isMousePressed: jest.fn(),
      getMousePosition: jest.fn(() => ({ x: 0, y: 0 }))
    };

    playerControlSystem = new PlayerControlSystem(mockInputManager);
    entities = [];

    // Create player entity
    playerEntity = new Entity();
    playerEntity.addComponent('Position', new Position(100, 100));
    playerEntity.addComponent('Velocity', new Velocity(0, 0));
    playerEntity.addComponent('Player', new Player());
    playerEntity.addComponent('Physics', new Physics());

    entities.push(playerEntity);

    // Mock game instance
    mockGame = {
      getEntitiesWithComponent: jest.fn().mockImplementation((componentName) => {
        if (componentName === 'Player') {
          return [playerEntity];
        }
        return [];
      })
    };
    playerControlSystem.game = mockGame;
  });

  test('should create PlayerControlSystem with input manager', () => {
    expect(playerControlSystem).toBeDefined();
    expect(playerControlSystem.inputManager).toBe(mockInputManager);
  });

  test('should handle left movement input', () => {
    mockInputManager.isAnyKeyPressed.mockImplementation((keys) => {
      return keys.includes('KeyA') || keys.includes('ArrowLeft');
    });

    const velocity = playerEntity.getComponent('Velocity');
    const initialVx = velocity.x;

    playerControlSystem.update(16);

    expect(velocity.x).toBeLessThan(initialVx);
  });

  test('should handle right movement input', () => {
    mockInputManager.isAnyKeyPressed.mockImplementation((keys) => {
      return keys.includes('KeyD') || keys.includes('ArrowRight');
    });

    const velocity = playerEntity.getComponent('Velocity');
    const initialVx = velocity.x;

    playerControlSystem.update(16);

    expect(velocity.x).toBeGreaterThan(initialVx);
  });

  test('should handle jump input', () => {
    const physics = playerEntity.getComponent('Physics');
    physics.onGround = true; // Must be on ground to jump

    mockInputManager.isAnyKeyPressed.mockImplementation((keys) => {
      return keys.includes('KeyK') || keys.includes('Space');
    });

    const velocity = playerEntity.getComponent('Velocity');
    const initialVy = velocity.y;

    playerControlSystem.update(16);

    expect(velocity.y).toBeLessThan(initialVy); // Negative Y is up
  });

  test('should not jump when not on ground', () => {
    const physics = playerEntity.getComponent('Physics');
    physics.onGround = false; // Not on ground

    mockInputManager.isAnyKeyPressed.mockImplementation((keys) => {
      return keys.includes('KeyK') || keys.includes('Space');
    });

    const velocity = playerEntity.getComponent('Velocity');
    const initialVy = velocity.y;

    playerControlSystem.update(16);

    expect(velocity.y).toBe(initialVy); // Should not change
  });

  test('should handle dash input', () => {
    mockInputManager.isAnyKeyPressed.mockImplementation((keys) => {
      return keys.includes('KeyL');
    });

    const player = playerEntity.getComponent('Player');
    const initialDashing = player.isDashing;

    playerControlSystem.update(16);

    expect(player.isDashing).toBe(true);
  });

  test('should handle attack input', () => {
    mockInputManager.isMousePressed.mockReturnValue(true);

    const player = playerEntity.getComponent('Player');

    playerControlSystem.update(16);

    expect(player.isAttacking).toBe(true);
  });

  test('should not dash when stamina is low', () => {
    const player = playerEntity.getComponent('Player');
    player.stamina = 10; // Low stamina

    mockInputManager.isAnyKeyPressed.mockImplementation((keys) => {
      return keys.includes('KeyL');
    });

    const initialDashing = player.isDashing;

    playerControlSystem.update(16);

    expect(player.isDashing).toBe(initialDashing);
  });

  test('should handle coyote time for jumping', () => {
    const player = playerEntity.getComponent('Player');
    const physics = playerEntity.getComponent('Physics');
    
    // Player was on ground recently (coyote time)
    physics.onGround = false;
    player.lastGroundTime = Date.now() - 100; // 100ms ago (within coyote time)

    mockInputManager.isAnyKeyPressed.mockImplementation((keys) => {
      return keys.includes('KeyK') || keys.includes('Space');
    });

    const velocity = playerEntity.getComponent('Velocity');
    const initialVy = velocity.y;

    playerControlSystem.update(16);

    expect(velocity.y).toBeLessThan(initialVy); // Should still be able to jump
  });

  test('should handle jump buffering', () => {
    const player = playerEntity.getComponent('Player');
    const physics = playerEntity.getComponent('Physics');
    
    // Player pressed jump recently (buffer time)
    physics.onGround = false;
    player.lastJumpInput = Date.now() - 50; // 50ms ago (within buffer time)

    // Now lands on ground
    physics.onGround = true;

    playerControlSystem.update(16);

    const velocity = playerEntity.getComponent('Velocity');
    expect(velocity.y).toBeLessThan(0); // Should auto-jump due to buffering
  });

  test('should handle double jump', () => {
    const player = playerEntity.getComponent('Player');
    const physics = playerEntity.getComponent('Physics');
    
    physics.onGround = false;
    player.canDoubleJump = true;
    player.hasDoubleJumped = false;

    mockInputManager.isAnyKeyPressed.mockImplementation((keys) => {
      return keys.includes('KeyK') || keys.includes('Space');
    });

    const velocity = playerEntity.getComponent('Velocity');
    const initialVy = velocity.y;

    playerControlSystem.update(16);

    expect(velocity.y).toBeLessThan(initialVy);
    expect(player.hasDoubleJumped).toBe(true);
  });

  test('should handle attack combo system', () => {
    const player = playerEntity.getComponent('Player');
    
    mockInputManager.isMousePressed.mockReturnValue(true);

    // First attack
    playerControlSystem.update(16);
    expect(player.isAttacking).toBe(true);
    
    // Simulate attack finishing
    player.isAttacking = false;
    player.comboCount = 1;

    // Second attack within combo window
    playerControlSystem.update(16);
    expect(player.comboCount).toBeGreaterThan(1);
  });

  test('should handle directional attacks', () => {
    const player = playerEntity.getComponent('Player');
    
    mockInputManager.isMousePressed.mockReturnValue(true);
    mockInputManager.isAnyKeyPressed.mockImplementation((keys) => {
      return keys.includes('KeyW') || keys.includes('ArrowUp');
    });

    playerControlSystem.update(16);

    expect(player.attackDirection).toBe('up');
  });

  test('should handle parrying input', () => {
    mockInputManager.isMousePressed.mockImplementation((button) => {
      return button === 2; // Right mouse button
    });

    const player = playerEntity.getComponent('Player');

    playerControlSystem.update(16);

    expect(player.isParrying).toBe(true);
  });

  test('should handle entities without required components', () => {
    const incompleteEntity = new Entity();
    incompleteEntity.addComponent('Position', new Position(200, 100));
    // Missing Player component

    entities.push(incompleteEntity);
    mockGame.getEntitiesWithComponent.mockReturnValue([playerEntity, incompleteEntity]);

    expect(() => {
      playerControlSystem.update(16);
    }).not.toThrow();
  });

  test('should handle input manager edge cases', () => {
    // Test with null input manager methods
    mockInputManager.isAnyKeyPressed.mockReturnValue(null);
    mockInputManager.isMousePressed.mockReturnValue(null);

    expect(() => {
      playerControlSystem.update(16);
    }).not.toThrow();
  });

  test('should handle stamina consumption during movement', () => {
    const player = playerEntity.getComponent('Player');
    const initialStamina = player.stamina;

    mockInputManager.isAnyKeyPressed.mockImplementation((keys) => {
      return keys.includes('KeyL'); // Dash key
    });

    playerControlSystem.update(16);

    expect(player.stamina).toBeLessThan(initialStamina);
  });

  test('should prevent actions when player is in transition', () => {
    const player = playerEntity.getComponent('Player');
    player.isTransitioning = true;

    mockInputManager.isAnyKeyPressed.mockReturnValue(true);
    mockInputManager.isMousePressed.mockReturnValue(true);

    const initialAttacking = player.isAttacking;
    const initialDashing = player.isDashing;

    playerControlSystem.update(16);

    expect(player.isAttacking).toBe(initialAttacking);
    expect(player.isDashing).toBe(initialDashing);
  });

  test('should handle rapid input changes', () => {
    mockInputManager.isAnyKeyPressed.mockImplementation((keys) => {
      return Math.random() > 0.5; // Random inputs
    });

    expect(() => {
      for (let i = 0; i < 10; i++) {
        playerControlSystem.update(16);
      }
    }).not.toThrow();
  });

  test('should properly reset movement when no input', () => {
    const velocity = playerEntity.getComponent('Velocity');
    velocity.x = 100; // Set initial velocity

    mockInputManager.isAnyKeyPressed.mockReturnValue(false);
    mockInputManager.isMousePressed.mockReturnValue(false);

    playerControlSystem.update(16);

    // Velocity should be reduced (not necessarily 0 due to physics)
    expect(Math.abs(velocity.x)).toBeLessThan(100);
  });
});