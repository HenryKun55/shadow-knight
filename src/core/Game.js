// --- COMPLETE AND UNABRIDGED FILE ---

import { InputManager } from './InputManager.js';
import { Entity } from './Entity.js';
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

        this.camera.x = Math.max(0, Math.min(this.worldBounds.width - this.camera.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.worldBounds.height - this.camera.height, this.camera.y));
      }
    }
  }

  worldToScreen(worldX, worldY) {
    return {
      x: worldX - this.camera.x,
      y: worldY - this.camera.y
    };
  }

  screenToWorld(screenX, screenY) {
    return {
      x: screenX + this.camera.x,
      y: screenY + this.camera.y
    };
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
    document.getElementById('loading-screen').classList.add('hidden');
  }

  stop() {
    this.isRunning = false;
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

    // Update active systems with profiling
    this.systems.forEach(system => {
      if (system.update) {
        const systemStart = performance.now();
        system.update(deltaTime);
        const systemTime = performance.now() - systemStart;
        this.performanceStats.systems[system.constructor.name] = systemTime;
      }
    });

    // Update sprites for all entities (even inactive ones for death effects)
    const spriteStart = performance.now();
    for (const entity of this.entities.values()) {
      const sprite = entity.getComponent('Sprite');
      if (sprite) {
        sprite.update(deltaTime);
      }
    }
    this.performanceStats.entities = performance.now() - spriteStart;

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
    
    // Always show FPS counter
    this.drawFPS();
  }

  drawBackground() {
    this.ctx.drawImage(this.backgroundCanvas, 0, 0);
  }

  drawFPS() {
    this.ctx.save();
    this.ctx.resetTransform();
    
    // Background box for better visibility
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(5, 5, 250, 120);
    
    // FPS text
    this.ctx.fillStyle = this.currentFPS < 30 ? '#ff4444' : this.currentFPS < 50 ? '#ffaa44' : '#44ff44';
    this.ctx.font = 'bold 16px monospace';
    this.ctx.fillText(`FPS: ${this.currentFPS}`, 10, 25);
    
    // Performance breakdown
    this.ctx.fillStyle = 'white';
    this.ctx.font = '11px monospace';
    
    let y = 45;
    this.ctx.fillText(`Update: ${this.performanceStats.update.toFixed(1)}ms`, 10, y);
    y += 12;
    this.ctx.fillText(`Render: ${this.performanceStats.render.toFixed(1)}ms`, 10, y);
    y += 12;
    this.ctx.fillText(`Entities: ${this.performanceStats.entities.toFixed(1)}ms`, 10, y);
    y += 12;
    
    // System breakdown
    for (const [systemName, time] of Object.entries(this.performanceStats.systems)) {
      if (time > 0.1) { // Only show systems taking > 0.1ms
        this.ctx.fillText(`${systemName}: ${time.toFixed(1)}ms`, 10, y);
        y += 12;
      }
    }
    
    this.ctx.restore();
  }
}
