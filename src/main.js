/* ===================================
   MAIN ENTRY POINT - SHADOW KNIGHT
   ===================================
   Main application entry point using centralized configurations.
   Initializes the game with all systems and components.
*/

import { Game } from './core/Game.js';
import { Entity } from './core/Entity.js';
import { MapSystem } from './systems/MapSystem.js';
import { Position } from './components/Position.js';
import { Velocity } from './components/Velocity.js';
import { Physics } from './components/Physics.js';
import { Sprite } from './components/Sprite.js';
import { Player } from './components/Player.js';
import { MapState } from './components/MapState.js';
import { Enemy, EnemyTypes } from './components/Enemy.js';
import { Boss } from './components/Boss.js';
import { Collision } from './components/Collision.js';
import { MovementSystem } from './systems/MovementSystem.js';
import { PlayerControlSystem } from './systems/PlayerControlSystem.js';
import { EnemyAISystem } from './systems/EnemyAISystem.js';
import { BossAISystem } from './systems/BossAISystem.js';
import { CombatSystem } from './systems/CombatSystem.js';
import { RenderSystem } from './systems/RenderSystem.js';
import { UISystem } from './systems/UISystem.js';
import { RoomTransitionSystem } from './systems/RoomTransitionSystem.js';
import { bossDefinitions } from './entities/bossDefinitions.js';
import { cheats } from './core/cheat.js';

// Import centralized configurations
import { GameConfig, validateConfig } from './config/GameConfig.js';
import { UIConstants } from './config/UIConstants.js';
import { AudioConfig } from './config/AudioConfig.js';
import { SaveSystem } from './systems/SaveSystem.js';
import { PauseSystem } from './systems/PauseSystem.js';

class ShadowKnight {
  constructor() {
    this.game = null;
  }

  async init() {
    try {
      // Validate configuration before initializing
      if (!validateConfig()) {
        throw new Error('Configuration validation failed');
      }

      // Get canvas using UIConstants
      const canvas = UIConstants.UTILS.safeQuerySelector(UIConstants.SELECTORS.GAME_CANVAS);
      if (!canvas) {
        throw new Error('Game canvas not found');
      }

      this.game = new Game(canvas);
      this.setupUIEventListeners();

      // Note: Audio loading moved to startGame() to comply with browser audio policy

      const mapSystem = new MapSystem();
      mapSystem.init();

      const roomTransitionSystem = new RoomTransitionSystem();
      roomTransitionSystem.game = this.game;
      roomTransitionSystem.init();

      this.game.addSystem(new MovementSystem());
      this.game.addSystem(new PlayerControlSystem());
      this.game.addSystem(new EnemyAISystem());
      this.game.addSystem(new BossAISystem());
      this.game.addSystem(new CombatSystem());
      this.game.addSystem(new RenderSystem());
      this.game.addSystem(new UISystem());
      this.game.addSystem(mapSystem);
      this.game.addSystem(roomTransitionSystem);
      
      // Add new systems
      const saveSystem = new SaveSystem();
      saveSystem.game = this.game;
      this.game.addSystem(saveSystem);
      
      const pauseSystem = new PauseSystem();
      pauseSystem.setGame(this.game);
      pauseSystem.setSaveSystem(saveSystem);
      this.game.addSystem(pauseSystem);
      
      // Start auto-save
      saveSystem.startAutoSave();

      this.createPlayer();
      
      // Room spawning methods for RoomTransitionSystem
      this.game.spawnRoomEnemies = (enemies) => {
        enemies.forEach(enemy => {
          this.createEnemy(enemy.type, enemy.x, enemy.y, this.getEnemyStats(enemy.type));
        });
      };
      
      this.game.spawnRoomBosses = (bosses) => {
        bosses.forEach(boss => {
          if (boss.type === 'shadowLord') {
            this.createBoss(boss.x, boss.y);
          }
        });
      };

      // Força o estado correto da UI na inicialização
      document.getElementById('main-menu').classList.remove('hidden');
      document.getElementById('settings-modal').classList.add('hidden');

      document.getElementById('loading-screen').classList.add('hidden');
      console.log('Shadow Knight initialized. Waiting for player to start.');

    } catch (error) {
      console.error('Failed to initialize Shadow Knight:', error);
    }
  }

  setupUIEventListeners() {
    const mainMenu = document.getElementById('main-menu');
    const settingsModal = document.getElementById('settings-modal');
    const startButton = document.getElementById('start-button');
    const settingsButton = document.getElementById('settings-button');
    const closeSettingsButton = document.getElementById('close-settings-button');
    const uiOverlay = document.getElementById('ui-overlay');
    
    // Debug: verificar se elementos existem
    console.log('UI Elements found:', {
      mainMenu: !!mainMenu,
      settingsModal: !!settingsModal,
      startButton: !!startButton,
      settingsButton: !!settingsButton,
      closeSettingsButton: !!closeSettingsButton,
      uiOverlay: !!uiOverlay
    });

    if (!startButton || !settingsButton || !closeSettingsButton || !settingsModal) {
      console.error('Required UI elements not found');
      return;
    }

    startButton.addEventListener('click', async () => {
      // Criar fade overlay para inicialização
      const gameStartFade = document.createElement('div');
      gameStartFade.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: black;
        opacity: 0;
        z-index: 10000;
        transition: opacity 0.8s ease-in-out;
        pointer-events: none;
      `;
      document.body.appendChild(gameStartFade);
      
      // Fade out
      gameStartFade.style.opacity = '1';
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Esconde menu e mostra jogo
      mainMenu.classList.add('hidden');
      uiOverlay.classList.remove('hidden');
      
      // Inicializar audio context e carregar sons
      await this.game.soundManager.initAudioContext();
      
      // Load sounds using centralized audio configuration
      const soundsToLoad = GameConfig.AUDIO.SOUND_PATHS;
      await this.game.soundManager.loadSounds(soundsToLoad);
      
      this.game.start();
      this.game.soundManager.playBGM('bgm');
      
      // Pequena pausa e fade in
      await new Promise(resolve => setTimeout(resolve, 300));
      gameStartFade.style.opacity = '0';
      
      // Remove fade overlay após animação
      setTimeout(() => {
        if (gameStartFade.parentNode) {
          gameStartFade.parentNode.removeChild(gameStartFade);
        }
      }, 800);
    });

    settingsButton.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    closeSettingsButton.addEventListener('click', () => settingsModal.classList.add('hidden'));

    // Cheats (verifique se o elemento existe no seu HTML)
    const infiniteHealthCheckbox = document.getElementById('infinite-health');
    const infiniteStaminaCheckbox = document.getElementById('infinite-stamina');
    const oneHitKillsCheckbox = document.getElementById('one-hit-kills');

    if (infiniteHealthCheckbox) {
      infiniteHealthCheckbox.addEventListener('change', (e) => cheats.infiniteHealth = e.target.checked);
    }
    if (infiniteStaminaCheckbox) {
      infiniteStaminaCheckbox.addEventListener('change', (e) => cheats.infiniteStamina = e.target.checked);
    }
    if (oneHitKillsCheckbox) {
      oneHitKillsCheckbox.addEventListener('change', (e) => cheats.oneHitKills = e.target.checked);
    }
  }

  createPlayer() {
    this.player = new Entity('player');
    
    // Use spawn settings from configuration
    const spawnPos = GameConfig.PLAYER.SPAWN;
    this.player.addComponent('Position', new Position(spawnPos.DEFAULT_X, spawnPos.DEFAULT_Y));
    this.player.addComponent('Velocity', new Velocity(0, 0));
    this.player.addComponent('Physics', new Physics());
    
    // Create sprite with configured placeholder
    const sprite = new Sprite({
      imageSrc: 'https://placehold.co/256x64/4ecdc4/000000?text=Player',
      width: 32, 
      height: 58, 
      frameWidth: 64, 
      frameHeight: 58,
      offsetX: -16,
      offsetY: -29,
    });
    
    this.player.addComponent('Sprite', sprite);
    this.player.addComponent('Player', new Player());
    this.player.addComponent('MapState', new MapState());
    this.player.addComponent('Collision', new Collision(32, 58, -16, -29));
    
    this.game.addEntity(this.player);
    this.game.setCameraTarget(this.player);
  }

  getEnemyStats(type) {
    // Use centralized enemy configuration
    const enemyType = type.toUpperCase();
    return GameConfig.ENEMIES.TYPES[enemyType] || GameConfig.ENEMIES.TYPES.GOBLIN;
  }

  createEnemies() {
    // Enemies now spawned by room system
  }

  createEnemy(type, x, y, stats) {
    const enemy = new Entity(`enemy_${type}_${Date.now()}`);
    enemy.addComponent('Position', new Position(x, y));
    enemy.addComponent('Velocity', new Velocity(0, 0));
    
    // Use physics configuration for enemies
    enemy.addComponent('Physics', new Physics({ 
      gravity: GameConfig.PHYSICS.GRAVITY, 
      friction: GameConfig.PHYSICS.FRICTION.GROUND, 
      airResistance: GameConfig.PHYSICS.FRICTION.AIR 
    }));
    
    // Get enemy color from configuration
    const enemyType = type.toUpperCase();
    const enemyConfig = GameConfig.ENEMIES.TYPES[enemyType];
    const color = enemyConfig ? enemyConfig.color : GameConfig.ENEMIES.TYPES.GOBLIN.color;
    
    // Create sprite with enemy animations from configuration
    const sprite = new Sprite({ 
      width: 28, 
      height: 40, 
      color: color, 
      offsetX: -14, 
      offsetY: -20 
    });
    
    // Add animations using configuration
    const animations = GameConfig.ANIMATION.ENEMY;
    sprite.addAnimation('idle', animations.IDLE.frames, animations.IDLE.frameTime, animations.IDLE.loop);
    sprite.addAnimation('walk', animations.WALK.frames, animations.WALK.frameTime, animations.WALK.loop);
    sprite.addAnimation('run', animations.RUN.frames, animations.RUN.frameTime, animations.RUN.loop);
    sprite.addAnimation('attack', animations.ATTACK.frames, animations.ATTACK.frameTime, animations.ATTACK.loop);
    sprite.playAnimation('idle');
    
    enemy.addComponent('Sprite', sprite);
    
    const enemyComponent = new Enemy(type, stats);
    enemyComponent.setPatrolCenter(x, y);
    enemy.addComponent('Enemy', enemyComponent);
    enemy.addComponent('Collision', new Collision(28, 40, -14, -20));
    
    this.game.addEntity(enemy);
    return enemy;
  }

  createBoss(x = 2400, y = 580) {
    const bossDef = bossDefinitions.shadowLord;
    const boss = new Entity(bossDef.name);
    boss.addComponent('Position', new Position(x, y));
    boss.addComponent('Velocity', new Velocity(0, 0));
    boss.addComponent('Physics', new Physics({ gravity: 980, mass: 3 }));
    const sprite = new Sprite(bossDef.spriteOptions);
    sprite.addAnimation('idle', [0], 500, true);
    sprite.addAnimation('walk', [0, 1], 300, true);
    sprite.addAnimation('attack', [2], 200, false);
    sprite.addAnimation('cast', [3], 150, true);
    sprite.addAnimation('teleport', [4], 100, false);
    sprite.playAnimation('idle');
    boss.addComponent('Sprite', sprite);
    const bossComponent = new Boss(bossDef);
    boss.addComponent('Boss', bossComponent);
    boss.addComponent('Collision', new Collision(bossDef.collisionOptions.width, bossDef.collisionOptions.height, bossDef.collisionOptions.offsetX, bossDef.collisionOptions.offsetY));
    this.game.addEntity(boss);
    console.log(`${bossDef.name} has been summoned!`);
    return boss;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('DOM loaded, initializing Shadow Knight...');
    const shadowKnight = new ShadowKnight();
    shadowKnight.init();
    window.gameInstance = shadowKnight.game;
  } catch (error) {
    console.error('Failed to initialize game on DOM load:', error);
    
    // Show error to user
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: red;
      color: white;
      padding: 20px;
      border-radius: 10px;
      z-index: 10000;
    `;
    errorDiv.textContent = `Game failed to initialize: ${error.message}`;
    document.body.appendChild(errorDiv);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'F3' && window.gameInstance) {
    window.gameInstance.debugMode = !window.gameInstance.debugMode;
    e.preventDefault();
  }
  if (e.code === 'F4' && window.gameInstance) {
    document.getElementById('cheat-menu').classList.toggle('hidden');
    e.preventDefault();
  }
  if (e.code === 'Space' && window.gameInstance) {
    const player = window.gameInstance.getEntitiesWithComponent('Player')[0]?.getComponent('Player');
    if (player && player.isDead()) {
      window.location.reload();
    }
  }
});
