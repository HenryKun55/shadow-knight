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
import { cheats } from './core/cheat.js'; // Assumindo que você tem este arquivo para cheats

class ShadowKnight {
  constructor() {
    this.game = null;
  }

  async init() {
    try {
      this.game = new Game(document.getElementById('game-canvas'));

      this.setupUIEventListeners();

      const soundsToLoad = {
        jump: 'assets/sounds/jump.wav', dash: 'assets/sounds/dash.wav', attack: 'assets/sounds/attack.wav',
        parry: 'assets/sounds/parry.wav', enemyHit: 'assets/sounds/enemy_hit.wav', enemyDeath: 'assets/sounds/enemy_death.wav',
        playerHit: 'assets/sounds/player_hit.wav', bgm: 'assets/sounds/background_music.mp3',
      };
      await this.game.soundManager.loadSounds(soundsToLoad);

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
    this.player.addComponent('Position', new Position(100, 550)); // Start in room 0 at entrance
    this.player.addComponent('Velocity', new Velocity(0, 0));
    this.player.addComponent('Physics', new Physics());
    const sprite = new Sprite({
      imageSrc: 'https://placehold.co/256x64/4ecdc4/000000?text=Player',
      width: 32, height: 58, frameWidth: 64, frameHeight: 58,
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
    switch (type) {
      case 'goblin': return EnemyTypes.GOBLIN;
      case 'orc': return EnemyTypes.ORC;
      default: return EnemyTypes.GOBLIN;
    }
  }

  createEnemies() {
    // Enemies now spawned by room system
  }

  createEnemy(type, x, y, stats) {
    const enemy = new Entity(`enemy_${type}_${Date.now()}`);
    enemy.addComponent('Position', new Position(x, y));
    enemy.addComponent('Velocity', new Velocity(0, 0));
    enemy.addComponent('Physics', new Physics({ gravity: 980, friction: 0.8, airResistance: 0.95 }));
    let color = '#ff6b6b';
    switch (type) {
      case 'goblin': color = '#2ed573'; break;
      case 'orc': color = '#ff4757'; break;
      case 'shadow_assassin': color = '#5f27cd'; break;
      case 'armored_knight': color = '#747d8c'; break;
    }
    const sprite = new Sprite({ width: 28, height: 40, color: color, offsetX: -14, offsetY: -20 });
    sprite.addAnimation('idle', [0], 300, true);
    sprite.addAnimation('walk', [0, 1], 200, true);
    sprite.addAnimation('run', [0, 1, 2], 150, true);
    sprite.addAnimation('attack', [3], 100, false);
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
  const shadowKnight = new ShadowKnight();
  shadowKnight.init();
  window.gameInstance = shadowKnight.game;
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
