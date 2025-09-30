import { GameConfig } from '../../src/config/GameConfig.js';

describe('GameConfig', () => {
  test('should have required GAME properties', () => {
    expect(GameConfig.GAME).toBeDefined();
    expect(GameConfig.GAME.TITLE).toBeDefined();
    expect(GameConfig.GAME.VERSION).toBeDefined();
    expect(GameConfig.GAME.TARGET_FPS).toBe(60);
    expect(GameConfig.GAME.DELTA_TIME_CAP).toBeDefined();
  });

  test('should have WORLD configuration', () => {
    expect(GameConfig.WORLD).toBeDefined();
    expect(GameConfig.WORLD.WIDTH).toBe(2560);
    expect(GameConfig.WORLD.HEIGHT).toBe(720);
    expect(GameConfig.WORLD.GRAVITY).toBe(980);
  });

  test('should have PLAYER configuration', () => {
    expect(GameConfig.PLAYER).toBeDefined();
    expect(GameConfig.PLAYER.MOVEMENT).toBeDefined();
    expect(GameConfig.PLAYER.COMBAT).toBeDefined();
    expect(GameConfig.PLAYER.HEALTH).toBeDefined();
    
    expect(typeof GameConfig.PLAYER.MOVEMENT.SPEED).toBe('number');
    expect(typeof GameConfig.PLAYER.MOVEMENT.JUMP_FORCE).toBe('number');
    expect(typeof GameConfig.PLAYER.COMBAT.ATTACK_DAMAGE).toBe('number');
  });

  test('should have UI configuration with required properties', () => {
    expect(GameConfig.UI).toBeDefined();
    expect(GameConfig.UI.DAMAGE).toBeDefined();
    expect(GameConfig.UI.MESSAGES).toBeDefined();
    expect(GameConfig.UI.ANIMATION).toBeDefined();
    
    expect(GameConfig.UI.DAMAGE.FONT_SIZE).toBeDefined();
    expect(GameConfig.UI.DAMAGE.FONT_WEIGHT).toBeDefined();
    expect(GameConfig.UI.DAMAGE.DURATION).toBeDefined();
  });

  test('should have PHYSICS configuration', () => {
    expect(GameConfig.PHYSICS).toBeDefined();
    expect(GameConfig.PHYSICS.GRAVITY).toBe(980);
    expect(GameConfig.PHYSICS.FRICTION).toBeDefined();
    expect(GameConfig.PHYSICS.COLLISION).toBeDefined();
  });

  test('should have ENEMIES configuration', () => {
    expect(GameConfig.ENEMIES).toBeDefined();
    expect(GameConfig.ENEMIES.TYPES).toBeDefined();
    expect(GameConfig.ENEMIES.AI).toBeDefined();
    
    expect(GameConfig.ENEMIES.TYPES.SHADOW_WARRIOR).toBeDefined();
    expect(GameConfig.ENEMIES.TYPES.SHADOW_ASSASSIN).toBeDefined();
    expect(GameConfig.ENEMIES.TYPES.ARMORED_KNIGHT).toBeDefined();
  });

  test('should have INPUT configuration', () => {
    expect(GameConfig.INPUT).toBeDefined();
    expect(GameConfig.INPUT.KEYS).toBeDefined();
    expect(GameConfig.INPUT.MOUSE).toBeDefined();
    
    expect(Array.isArray(GameConfig.INPUT.KEYS.MOVE_LEFT)).toBe(true);
    expect(Array.isArray(GameConfig.INPUT.KEYS.MOVE_RIGHT)).toBe(true);
    expect(Array.isArray(GameConfig.INPUT.KEYS.JUMP)).toBe(true);
  });

  test('should have ROOMS configuration', () => {
    expect(GameConfig.ROOMS).toBeDefined();
    expect(GameConfig.ROOMS.GRID).toBeDefined();
    expect(GameConfig.ROOMS.SIZE).toBeDefined();
    expect(GameConfig.ROOMS.TYPES).toBeDefined();
  });

  test('should have AUDIO configuration', () => {
    expect(GameConfig.AUDIO).toBeDefined();
    expect(GameConfig.AUDIO.MASTER_VOLUME).toBeDefined();
    expect(GameConfig.AUDIO.BGM_VOLUME).toBeDefined();
    expect(GameConfig.AUDIO.SFX_VOLUME).toBeDefined();
  });

  test('should validate numeric values are within reasonable ranges', () => {
    expect(GameConfig.GAME.TARGET_FPS).toBeGreaterThan(0);
    expect(GameConfig.WORLD.WIDTH).toBeGreaterThan(0);
    expect(GameConfig.WORLD.HEIGHT).toBeGreaterThan(0);
    expect(GameConfig.PLAYER.MOVEMENT.SPEED).toBeGreaterThan(0);
    expect(GameConfig.PHYSICS.GRAVITY).toBeGreaterThan(0);
  });

  test('should have consistent enemy configurations', () => {
    Object.values(GameConfig.ENEMIES.TYPES).forEach(enemyType => {
      expect(enemyType.health).toBeGreaterThan(0);
      expect(enemyType.speed).toBeGreaterThan(0);
      expect(enemyType.attackDamage).toBeGreaterThan(0);
      expect(enemyType.detectionRange).toBeGreaterThan(0);
      expect(enemyType.attackRange).toBeGreaterThan(0);
      expect(enemyType.color).toBeDefined();
    });
  });
});