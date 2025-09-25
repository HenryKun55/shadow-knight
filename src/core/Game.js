import { InputManager } from './InputManager.js';
import { SoundManager } from './SoundManager.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.inputManager = new InputManager();
    this.soundManager = new SoundManager();

    this.entities = new Map();
    this.systems = [];
    this.isRunning = false;
    this.debugMode = false;

    this.lastTime = 0;
    this.deltaTime = 0;
    this.frameCount = 0;
    this.fpsStartTime = performance.now();
    this.currentFPS = 60;

    // Performance profiling
    this.performanceStats = {
      update: 0,
      render: 0,
      systems: {},
      entities: 0
    };

    this.camera = {
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
      target: null,
      smoothing: 0.1
    };

    this.worldBounds = {
      x: 0,
      y: 0,
      width: 2560,
      height: 720
    };

    this.setupCanvas();
    this.createBackgroundCache();

    window.addEventListener('resize', () => this.resizeCanvas());
    this.resizeCanvas();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.camera.width = this.canvas.width;
    this.camera.height = this.canvas.height;
    this.setupCanvas();
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

        const bounds = this.camera.bounds || this.worldBounds;
        this.camera.x = Math.max(bounds.x, Math.min(bounds.x + bounds.width - this.camera.width, this.camera.x));
        this.camera.y = Math.max(bounds.y, Math.min(bounds.y + bounds.height - this.camera.height, this.camera.y));
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
    this.gameLoop();
  }

  gameLoop(currentTime = performance.now()) {
    if (!this.isRunning) return;

    this.deltaTime = Math.min(currentTime - this.lastTime, 100);
    this.lastTime = currentTime;

    this.frameCount++;
    if (currentTime - this.fpsStartTime >= 1000) {
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

    this.drawFPS();
  }

  drawBackground() {
    this.ctx.drawImage(this.backgroundCanvas, 0, 0);
  }

  drawFPS() {
    this.ctx.save();
    this.ctx.resetTransform();

    const boxWidth = 250;
    const padding = 10;
    const boxX = this.canvas.width - boxWidth - padding;
    const textX = this.canvas.width - padding;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(boxX, padding, boxWidth, 120);

    this.ctx.textAlign = 'right';

    this.ctx.fillStyle = this.currentFPS < 30 ? '#ff4444' : this.currentFPS < 50 ? '#ffaa44' : '#44ff44';
    this.ctx.font = 'bold 16px monospace';
    this.ctx.fillText(`FPS: ${this.currentFPS}`, textX, padding + 15);

    this.ctx.fillStyle = 'white';
    this.ctx.font = '11px monospace';

    let y = padding + 35;
    this.ctx.fillText(`Update: ${this.performanceStats.update.toFixed(1)}ms`, textX, y);
    y += 12;
    this.ctx.fillText(`Render: ${this.performanceStats.render.toFixed(1)}ms`, textX, y);
    y += 12;

    const spriteUpdateTime = this.performanceStats.entities || 0;
    this.ctx.fillText(`Entities: ${spriteUpdateTime.toFixed(1)}ms`, textX, y);
    y += 12;

    for (const [systemName, time] of Object.entries(this.performanceStats.systems)) {
      if (time > 0.1) {
        this.ctx.fillText(`${systemName}: ${time.toFixed(1)}ms`, textX, y);
        y += 12;
      }
    }

    this.ctx.restore();
  }
}
