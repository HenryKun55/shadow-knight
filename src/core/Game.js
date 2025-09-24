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
  }

  setupCanvas() {
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
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

    this.update(this.deltaTime);
    this.render();

    requestAnimationFrame((time) => this.gameLoop(time));
  }

  update(deltaTime) {
    this.updateCamera();

    this.systems.forEach(system => {
      if (system.update) {
        system.update(deltaTime);
      }
    });

    for (const [id, entity] of this.entities) {
      if (!entity.active) {
        this.entities.delete(id);
      }
    }

    this.inputManager.update();
  }

  render() {
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
  }

  drawBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.worldBounds.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#0f0f23');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.worldBounds.width, this.worldBounds.height);

    // Draw stars
    this.ctx.fillStyle = 'white';
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * this.worldBounds.width;
      const y = Math.random() * this.worldBounds.height;
      const size = Math.random() * 2;
      this.ctx.fillRect(x, y, size, size);
    }

    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 620, this.worldBounds.width, this.worldBounds.height - 620);
  }
}
