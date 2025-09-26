import { InputManager } from './InputManager.js';
import { SoundManager } from './SoundManager.js';
import { GameConfig } from '../config/GameConfig.js';
import { UIConstants } from '../config/UIConstants.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.inputManager = new InputManager();
    this.soundManager = new SoundManager();

    // Core game state
    this.entities = new Map();
    this.systems = [];
    this.isRunning = false;
    this.debugMode = GameConfig.DEBUG.ENABLED;

    // Time and performance tracking
    this.lastTime = 0;
    this.deltaTime = 0;
    this.frameCount = 0;
    this.fpsStartTime = performance.now();
    this.currentFPS = GameConfig.GAME.TARGET_FPS;

    // Performance profiling with configurable thresholds
    this.performanceStats = {
      update: 0,
      render: 0,
      systems: {},
      entities: 0
    };

    // Camera system with configurable settings
    this.camera = {
      x: 0,
      y: 0,
      width: GameConfig.GAME.WIDTH,
      height: GameConfig.GAME.HEIGHT,
      target: null,
      smoothing: 0.1
    };

    // World bounds from configuration
    this.worldBounds = {
      x: 0,
      y: 0,
      width: GameConfig.GAME.WORLD_BOUNDS.WIDTH,
      height: GameConfig.GAME.WORLD_BOUNDS.HEIGHT
    };

    this.setupCanvas();
    this.createBackgroundCache();
    this.createFPSDisplay();

    window.addEventListener('resize', () => this.resizeCanvas());
    this.resizeCanvas();
  }

  resizeCanvas() {
    // Game sempre usa dimensões internas configuradas
    const gameWidth = GameConfig.GAME.WIDTH;
    const gameHeight = GameConfig.GAME.HEIGHT;
    
    this.canvas.width = gameWidth;
    this.canvas.height = gameHeight;
    this.camera.width = gameWidth;
    this.camera.height = gameHeight;
    
    // Aplicar escala baseada na resolução escolhida
    this.applyResolutionScale();
    
    // Configurar estilo do body usando variáveis CSS
    this.setupBodyStyles();
    this.setupCanvas();
  }

  setResolution(resolution) {
    // Salvar resolução escolhida
    this.currentResolution = resolution;
    this.applyResolutionScale();
  }

  setupBodyStyles() {
    // Aplicar estilos do body de forma programática
    const bodyStyles = {
      background: 'var(--color-bg-primary)',
      margin: '0',
      padding: '0',
      overflow: 'hidden'
    };

    Object.assign(document.body.style, bodyStyles);
    Object.assign(document.documentElement.style, { margin: '0', padding: '0' });
  }

  applyResolutionScale() {
    const currentResolution = window.getCurrentResolution ? window.getCurrentResolution() : GameConfig.RESOLUTION.DEFAULT;
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Calcular escala usando margens configuradas
    const maxScale = Math.min(
      (windowWidth * GameConfig.RESOLUTION.MARGINS.HORIZONTAL) / GameConfig.GAME.WIDTH,
      (windowHeight * GameConfig.RESOLUTION.MARGINS.VERTICAL) / GameConfig.GAME.HEIGHT
    );
    
    // Usar escalas configuradas por resolução
    const resolutionScales = {
      [UIConstants.RESOLUTIONS.HD.key]: GameConfig.RESOLUTION.OPTIONS.HD.scale,
      [UIConstants.RESOLUTIONS.HD_PLUS.key]: GameConfig.RESOLUTION.OPTIONS.HD_PLUS.scale,
      [UIConstants.RESOLUTIONS.FULL_HD.key]: GameConfig.RESOLUTION.OPTIONS.FULL_HD.scale,
      [UIConstants.RESOLUTIONS.QHD_2K.key]: GameConfig.RESOLUTION.OPTIONS.QHD_2K.scale,
      [UIConstants.RESOLUTIONS.UHD_4K.key]: GameConfig.RESOLUTION.OPTIONS.UHD_4K.scale
    };
    
    const scaleMultiplier = resolutionScales[currentResolution] || GameConfig.RESOLUTION.OPTIONS.FULL_HD.scale;
    const scale = maxScale * scaleMultiplier;
    
    const displayWidth = GameConfig.GAME.WIDTH * scale;
    const displayHeight = GameConfig.GAME.HEIGHT * scale;
    
    // Aplicar estilos usando configurações centralizadas
    this.applyCanvasStyles(displayWidth, displayHeight);
    
    // Log de debug se habilitado
    if (GameConfig.DEBUG.ENABLED) {
      console.log(`Resolution: ${currentResolution}, Scale: ${scale.toFixed(3)}, Display: ${displayWidth.toFixed(0)}x${displayHeight.toFixed(0)}`);
    }
  }

  applyCanvasStyles(displayWidth, displayHeight) {
    const canvasStyles = {
      width: `${displayWidth}px`,
      height: `${displayHeight}px`,
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      border: 'none',
      background: 'var(--color-bg-primary)',
      zIndex: 'var(--z-index-canvas)',
      imageRendering: 'pixelated'
    };

    Object.assign(this.canvas.style, canvasStyles);
  }

  setupCanvas() {
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
  }

  createBackgroundCache() {
    this.backgroundCanvas = document.createElement('canvas');
    this.backgroundCanvas.width = this.worldBounds.width;
    this.backgroundCanvas.height = this.worldBounds.height;
    const bgCtx = this.backgroundCanvas.getContext('2d');

    const gradient = bgCtx.createLinearGradient(0, 0, 0, this.worldBounds.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#0f0f23');
    bgCtx.fillStyle = gradient;
    bgCtx.fillRect(0, 0, this.worldBounds.width, this.worldBounds.height);

    bgCtx.fillStyle = 'white';
    const stars = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * this.worldBounds.width,
        y: Math.random() * this.worldBounds.height,
        size: Math.random() * 2
      });
    }

    stars.forEach(star => {
      bgCtx.fillRect(star.x, star.y, star.size, star.size);
    });

    bgCtx.fillStyle = '#ffffff';
    bgCtx.fillRect(0, 620, this.worldBounds.width, this.worldBounds.height - 620);
  }

  createFPSDisplay() {
    // Remove existing display if any
    const existing = document.querySelector(UIConstants.SELECTORS.FPS_DISPLAY);
    if (existing) {
      existing.remove();
    }

    // Create FPS display element usando UIConstants
    this.fpsDisplay = UIConstants.UTILS.createElement('div', '', 'fps-display');
    
    // Aplicar estilos usando configurações centralizadas
    const fpsStyles = {
      position: 'fixed',
      top: `${GameConfig.UI.FPS_DISPLAY.position.top}px`,
      right: `${GameConfig.UI.FPS_DISPLAY.position.right}px`,
      width: `${GameConfig.UI.FPS_DISPLAY.width}px`,
      height: 'auto',
      maxHeight: `${GameConfig.UI.FPS_DISPLAY.maxHeight}px`,
      background: 'var(--bg-alpha-overlay)',
      border: 'var(--border-width-thin) solid var(--color-border-secondary)',
      borderRadius: 'var(--border-radius-sm)',
      color: 'var(--color-text-primary)',
      fontFamily: 'var(--font-family-ui)',
      fontSize: `${GameConfig.UI.FPS_DISPLAY.fontSize}px`,
      padding: 'var(--space-sm)',
      zIndex: 'var(--z-index-fps)',
      pointerEvents: 'none',
      whiteSpace: 'pre-line',
      lineHeight: 'var(--line-height-tight)',
      display: 'none'
    };

    Object.assign(this.fpsDisplay.style, fpsStyles);
    document.body.appendChild(this.fpsDisplay);
  }

  addEntity(entity) {
    this.entities.set(entity.id, entity);
    return entity;
  }

  removeEntity(entityId) {
    const entity = this.entities.get(entityId);
    if (entity) {
      entity.destroy();
      this.entities.delete(entityId);
    }
  }

  getEntity(entityId) {
    return this.entities.get(entityId);
  }

  getEntitiesWithComponent(componentName) {
    const result = [];
    for (const entity of this.entities.values()) {
      if (entity.active && entity.hasComponent(componentName)) {
        result.push(entity);
      }
    }
    return result;
  }

  addSystem(system) {
    system.game = this;
    this.systems.push(system);
  }

  getSystem(systemClass) {
    if (typeof systemClass === 'string') {
      return this.systems.find(s => s.constructor.name === systemClass);
    }
    return this.systems.find(s => s instanceof systemClass);
  }

  setCameraTarget(entity) {
    this.camera.target = entity;
  }

  updateCamera() {
    if (this.camera.target) {
      const position = this.camera.target.getComponent('Position');
      if (position) {
        const targetX = position.x - this.camera.width / 2;
        const targetY = position.y - this.camera.height / 2;

        this.camera.x += (targetX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (targetY - this.camera.y) * this.camera.smoothing;

        // FORÇA câmera a nunca mostrar além dos limites da sala atual
        const maxCameraX = Math.max(0, this.worldBounds.width - this.camera.width);
        const maxCameraY = Math.max(0, this.worldBounds.height - this.camera.height);
        
        this.camera.x = Math.max(0, Math.min(maxCameraX, this.camera.x));
        this.camera.y = Math.max(0, Math.min(maxCameraY, this.camera.y));
      }
    }
  }

  worldToScreen(worldX, worldY) {
    return {
      x: worldX - this.camera.x,
      y: worldY - this.camera.y
    };
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    
    // Mostra UI de FPS quando o jogo inicia
    if (this.fpsDisplay) {
      this.fpsDisplay.style.display = 'block';
    }
    
    this.gameLoop();
  }

  gameLoop(currentTime = performance.now()) {
    if (!this.isRunning) return;

    // Limitar delta time usando configuração para evitar saltos grandes
    this.deltaTime = Math.min(currentTime - this.lastTime, GameConfig.GAME.MAX_DELTA_TIME);
    this.lastTime = currentTime;

    // Atualizar FPS usando intervalo configurado
    this.frameCount++;
    if (currentTime - this.fpsStartTime >= GameConfig.GAME.PERFORMANCE.FPS_UPDATE_INTERVAL) {
      this.currentFPS = Math.round((this.frameCount * 1000) / (currentTime - this.fpsStartTime));
      this.frameCount = 0;
      this.fpsStartTime = currentTime;
    }

    this.update(this.deltaTime);
    this.render();

    requestAnimationFrame((time) => this.gameLoop(time));
  }

  update(deltaTime) {
    const updateStart = performance.now();

    this.updateCamera();

    this.systems.forEach(system => {
      if (system.update) {
        const systemStart = performance.now();
        system.update(deltaTime);
        const systemTime = performance.now() - systemStart;
        this.performanceStats.systems[system.constructor.name] = systemTime;
      }
    });

    for (const entity of this.entities.values()) {
      const sprite = entity.getComponent('Sprite');
      if (sprite) {
        sprite.update(deltaTime);
      }
    }

    this.inputManager.update();
    this.performanceStats.update = performance.now() - updateStart;
  }

  render() {
    const renderStart = performance.now();

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(-this.camera.x, -this.camera.y);

    this.drawBackground();

    this.systems.forEach(system => {
      if (system.render) {
        system.render(this.ctx);
      }
    });

    this.ctx.restore();
    this.performanceStats.render = performance.now() - renderStart;

    // Update FPS display HTML element (SEMPRE visível, independente de fade)
    this.updateFPSDisplay();
  }

  drawBackground() {
    this.ctx.drawImage(this.backgroundCanvas, 0, 0);
  }

  updateFPSDisplay() {
    if (!this.fpsDisplay || !GameConfig.DEBUG.SHOW_FPS) return;

    // Cor do FPS baseada nos thresholds configurados
    const { FPS_CRITICAL, FPS_WARNING } = GameConfig.DEBUG.PERFORMANCE_THRESHOLDS;
    const fpsColor = this.currentFPS < FPS_CRITICAL ? 
      'var(--color-primary-red)' : 
      this.currentFPS < FPS_WARNING ? 
        '#ffaa44' : 
        'var(--color-stamina)';
    
    let content = `<span style="color: ${fpsColor}; font-weight: bold; font-size: 14px;">FPS: ${this.currentFPS}</span>\n\n`;
    
    // Performance stats se habilitado
    if (GameConfig.DEBUG.SHOW_PERFORMANCE_STATS) {
      content += `Update: ${this.performanceStats.update.toFixed(2)}ms\n`;
      content += `Render: ${this.performanceStats.render.toFixed(2)}ms\n`;
      
      const spriteUpdateTime = this.performanceStats.entities || 0;
      content += `Entities: ${spriteUpdateTime.toFixed(2)}ms\n`;
      
      content += `\n`; // Linha separadora
      
      // Sistemas com performance stats
      for (const [systemName, time] of Object.entries(this.performanceStats.systems)) {
        const shortName = systemName.replace('System', '');
        content += `${shortName}: ${time.toFixed(2)}ms\n`;
      }
      
      // Frame time total com threshold configurado
      const totalFrameTime = this.performanceStats.update + this.performanceStats.render;
      const frameThreshold = GameConfig.DEBUG.PERFORMANCE_THRESHOLDS.FRAME_TIME_WARNING;
      const frameColor = totalFrameTime > frameThreshold ? 
        'var(--color-primary-red)' : 
        'var(--color-stamina)';
      content += `\n<span style="color: ${frameColor};">Frame: ${totalFrameTime.toFixed(2)}ms</span>`;
    }

    // Entity count se habilitado
    if (GameConfig.DEBUG.SHOW_ENTITY_COUNT) {
      content += `\nEntities: ${this.entities.size}`;
    }

    this.fpsDisplay.innerHTML = content;
  }
}
