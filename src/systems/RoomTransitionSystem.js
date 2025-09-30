/* ===================================
   ROOM TRANSITION SYSTEM - SHADOW KNIGHT
   ===================================
   Room transition system using centralized GameConfig for room data and transitions.
   All room definitions, timing, and effects reference configuration.
*/

import { GameConfig } from '../config/GameConfig.js';

export class RoomTransitionSystem {
  constructor() {
    this.game = null;
    this.isTransitioning = false;
    this.fadeOverlay = null;
    
    // Cache room system configuration for performance
    this.transitionConfig = GameConfig.ROOM_TRANSITION;
    this.transitionDuration = this.transitionConfig.DURATION;
    this.transitionCooldown = 0;
    this.lastTransitionTime = 0;
    
    // Use room definitions from configuration
    this.rooms = {
      ...GameConfig.ROOMS,
      ...GameConfig.NEW_ROOMS
    };
    
    this.currentRoom = GameConfig.ROOMS.INITIAL_ROOM;
  }

  init() {
    this.createFadeOverlay();
    this.setupInitialRoom();
  }

  createFadeOverlay() {
    this.fadeOverlay = document.createElement('div');
    this.fadeOverlay.id = this.transitionConfig.FADE_OVERLAY_ID;
    const fadeStyles = this.transitionConfig.FADE_OVERLAY;
    this.fadeOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0; 
      width: 100vw;
      height: 100vh;
      background: ${fadeStyles.BACKGROUND};
      opacity: 0;
      pointer-events: none;
      z-index: ${fadeStyles.Z_INDEX};
      transition: opacity ${fadeStyles.TRANSITION_DURATION}ms ease-in-out;
    `;
    document.body.appendChild(this.fadeOverlay);
  }

  setupInitialRoom() {
    // Configura a sala inicial
    this.setCurrentRoom(this.currentRoom);
    
    // IMPORTANTE: Spawna inimigos da sala inicial
    console.log('Setting up initial room entities...');
    this.spawnRoomEntities(this.currentRoom);
  }

  setCurrentRoom(roomId) {
    const room = this.rooms[roomId];
    if (!room) return;
    
    // IMPORTANTE: Configura os bounds do mundo para APENAS esta sala
    this.game.worldBounds = {
      x: 0,
      y: 0, 
      width: room.worldBounds.width,  // SEMPRE 1280
      height: room.worldBounds.height // SEMPRE 720
    };
    
    // Recria o background para esta sala específica
    this.game.createBackgroundCache = () => {
      this.createRoomBackground(room);
    };
    this.game.createBackgroundCache();
    
    // Atualiza câmera bounds
    this.game.camera.bounds = room.worldBounds;
    
    console.log(`Set current room to ${roomId} (${room.name}). World bounds: 0-${room.worldBounds.width}`);
  }

  createRoomBackground(room) {
    const canvas = this.game.backgroundCanvas;
    const ctx = canvas.getContext('2d');
    
    // Resize canvas para sala atual
    canvas.width = room.worldBounds.width;
    canvas.height = room.worldBounds.height;
    
    // Background específico da sala
    const gradient = ctx.createLinearGradient(0, 0, 0, room.worldBounds.height);
    gradient.addColorStop(0, room.backgroundColor);
    gradient.addColorStop(1, '#0f0f23');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, room.worldBounds.width, room.worldBounds.height);
    
    // Stars based on theme using configuration
    const themeConfig = GameConfig.ROOM_THEMES[room.theme?.toUpperCase()] || GameConfig.ROOM_THEMES.DEFAULT;
    const starCount = themeConfig.STAR_COUNT;
    ctx.fillStyle = 'white';
    for (let i = 0; i < starCount; i++) {
      const star = {
        x: Math.random() * room.worldBounds.width,
        y: Math.random() * room.worldBounds.height,
        size: Math.random() * 2
      };
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    
    // Room-specific ground using configuration
    ctx.fillStyle = room.groundColor;
    const groundY = room.customGroundLevel || GameConfig.PHYSICS.COLLISION.GROUND_LEVEL;
    ctx.fillRect(0, groundY, room.worldBounds.width, room.worldBounds.height - groundY);
  }

  update(deltaTime) {
    // Reduce transition cooldown using configuration
    if (this.transitionCooldown > 0) {
      this.transitionCooldown -= deltaTime;
    }
    
    if (this.isTransitioning) return;
    
    const player = this.game.getEntitiesWithComponent('Player')[0];
    if (!player) return;
    
    const position = player.getComponent('Position');
    const mapState = player.getComponent('MapState');
    if (!position || !mapState) return;
    
    // Colisão com bordas da sala (impede movimento além dos limites)
    this.enforceRoomBounds(position);
    
    // Check door collisions and holes only if cooldown passed
    if (this.transitionCooldown <= 0) {
      this.checkDoorCollisions(position, player, mapState);
      this.checkHoleCollisions(position, player, mapState);
    }
  }

  enforceRoomBounds(position) {
    const room = this.rooms[this.currentRoom];
    const bounds = room.worldBounds;
    
    // Player collision box using configuration
    const playerBounds = GameConfig.PLAYER.COLLISION;
    const playerLeft = playerBounds.OFFSET_X;
    const playerRight = -playerBounds.OFFSET_X;
    const playerTop = playerBounds.OFFSET_Y;
    const playerBottom = -playerBounds.OFFSET_Y;
    
    // Check if player is near a hole before enforcing bounds
    let nearHole = false;
    if (room.holes) {
      for (const hole of room.holes) {
        const distance = Math.sqrt(
          Math.pow(position.x - hole.x, 2) + 
          Math.pow(position.y - hole.y, 2)
        );
        if (distance < hole.radius + 20) { // Give some extra space around holes
          nearHole = true;
          break;
        }
      }
    }
    
    // Limita movimento nas bordas da sala
    if (position.x + playerLeft < bounds.x) {
      position.x = bounds.x - playerLeft;
    }
    if (position.x + playerRight > bounds.x + bounds.width) {
      position.x = bounds.x + bounds.width - playerRight;
    }
    if (position.y + playerTop < bounds.y) {
      position.y = bounds.y - playerTop;
    }
    // Only enforce bottom bound if player is NOT near a hole
    if (!nearHole && position.y + playerBottom > bounds.y + bounds.height) {
      position.y = bounds.y + bounds.height - playerBottom;
    }
  }

  checkDoorCollisions(position, player, mapState) {
    const currentRoom = this.rooms[this.currentRoom];
    if (!currentRoom) return;
    
    // Player collision box using configuration
    const playerBounds = GameConfig.PLAYER.COLLISION;
    const playerLeft = position.x + playerBounds.OFFSET_X;
    const playerRight = position.x - playerBounds.OFFSET_X;
    const playerTop = position.y + playerBounds.OFFSET_Y;
    const playerBottom = position.y - playerBounds.OFFSET_Y;
    
    for (const door of (currentRoom.doors || [])) {
      const doorLeft = door.x;
      const doorRight = door.x + door.width;
      const doorTop = door.y;
      const doorBottom = door.y + door.height;
      
      if (playerRight > doorLeft && playerLeft < doorRight &&
          playerBottom > doorTop && playerTop < doorBottom) {
        console.log(`Door collision! Transitioning to room ${door.toRoom}`);
        // Start cooldown to avoid transition loops using configuration
        this.transitionCooldown = this.transitionConfig.COOLDOWN;
        this.lastTransitionTime = Date.now();
        this.transitionToRoom(door.toRoom, player, mapState);
        break;
      }
    }
  }

  checkHoleCollisions(position, player, mapState) {
    const currentRoom = this.rooms[this.currentRoom];
    if (!currentRoom) return;
    
    // Check if current room has holes defined directly
    if (currentRoom.holes) {
      for (const hole of currentRoom.holes) {
        const distance = Math.sqrt(
          Math.pow(position.x - hole.x, 2) + 
          Math.pow(position.y - hole.y, 2)
        );
        
        
        if (distance < hole.radius) {
          if (hole.type === 'climb_up') {
            console.log(`Hole collision! Climbing up to room ${hole.toRoom}`);
            this.transitionCooldown = this.transitionConfig.COOLDOWN;
            this.lastTransitionTime = Date.now();
            this.transitionToRoomViaClimb(hole.toRoom, player, mapState);
          } else {
            console.log(`Hole collision! Falling into room ${hole.toRoom}`);
            this.transitionCooldown = this.transitionConfig.COOLDOWN;
            this.lastTransitionTime = Date.now();
            this.transitionToRoomViaHole(hole.toRoom, player, mapState);
          }
          break;
        }
      }
    }
    
    // Old hole system removed to prevent conflicts
  }

  findRoomThatLeadsToHole(holeRoomId) {
    // Find which room should have the hole entrance
    // For now, assume room 1 has hole to room 2
    if (holeRoomId === 2) return 1;
    return null;
  }

  async transitionToRoom(newRoomId, player, mapState) {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    const position = player.getComponent('Position');
    const playerComponent = player.getComponent('Player');
    const sprite = player.getComponent('Sprite');
    
    console.log(`Transitioning from room ${this.currentRoom} to room ${newRoomId}`);
    
    // Disable player controls
    if (playerComponent) {
      playerComponent.isTransitioning = true;
    }
    
    // ANIMAÇÃO DE SAÍDA: Player move em direção à porta + fade out
    if (sprite) {
      const currentRoom = this.rooms[this.currentRoom];
      const currentDoor = currentRoom.doors.find(door => door.toRoom === newRoomId);
      
      if (currentDoor) {
        // Calculate door direction using configuration
        const doorCenterX = currentDoor.x + (currentDoor.width / 2);
        const moveDistance = this.transitionConfig.ANIMATION.EXIT_MOVE_DISTANCE;
        let targetX;
        
        if (currentDoor.direction === "east") {
          targetX = position.x + moveDistance; // Move para direita
        } else if (currentDoor.direction === "west") {
          targetX = position.x - moveDistance; // Move para esquerda
        }
        
        // Animation: movement + fade out using configuration
        const duration = this.transitionConfig.ANIMATION.EXIT_DURATION;
        const startTime = performance.now();
        const startX = position.x;
        
        await new Promise(resolve => {
          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            sprite.alpha = 1 - progress;
            position.x = startX + (targetX - startX) * progress;
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              resolve();
            }
          };
          requestAnimationFrame(animate);
        });
        
        console.log(`Exit animation completed. Player moved toward door.`);
      }
    }
    
    // Complete fade out using configuration
    this.fadeOverlay.style.opacity = '1';
    await new Promise(resolve => setTimeout(resolve, this.transitionConfig.TIMING.FADE_OUT_WAIT));
    
    // AGORA que está completamente preto, muda o ambiente
    console.log('Screen completely black - switching environment...');
    
    // LIMPEZA COMPLETA DA SALA ATUAL
    this.clearRoomEntities();
    
    // MUDANÇA COMPLETA DE AMBIENTE
    const previousRoom = this.currentRoom;
    this.currentRoom = newRoomId;
    
    // Configura nova sala (bounds, background, etc.)
    this.setCurrentRoom(newRoomId);
    
    // Atualiza map state
    mapState.currentRoom = newRoomId;
    mapState.visitedRooms.add(newRoomId);
    
    // Additional pause to ensure everything is loaded using configuration
    await new Promise(resolve => setTimeout(resolve, this.transitionConfig.TIMING.SETUP_WAIT));
    
    // Posiciona player na nova sala baseado na direção de onde veio
    const newRoom = this.rooms[newRoomId];
    let spawnPos, entranceAnim;
    
    if (newRoomId === 0) {
      // Entrando na sala 0 - sempre vem do leste (sala 1)
      spawnPos = newRoom.playerSpawnFromEast;
      entranceAnim = newRoom.playerEntranceAnimation;
    } else if (newRoomId === 1) {
      // Entrando na sala 1 - sempre vem do oeste (sala 0)  
      spawnPos = newRoom.playerSpawnFromWest;
      entranceAnim = newRoom.playerEntranceAnimation;
    }
    
    if (spawnPos && entranceAnim) {
      // Inicia na posição da porta (início da animação)
      position.x = entranceAnim.startX;
      position.y = entranceAnim.y;
      console.log(`Player positioned for entrance animation: (${position.x}, ${position.y}) in room ${newRoomId}`);
    } else {
      console.error(`No spawn position defined for transition to room ${newRoomId}`);
    }
    
    console.log(`Player positioned at: (${position.x}, ${position.y}) in room ${newRoomId}`);
    
    // Spawna entities da nova sala
    this.spawnRoomEntities(newRoomId);
    
    // Pause before starting fade in using configuration
    await new Promise(resolve => setTimeout(resolve, this.transitionConfig.TIMING.PRE_FADE_IN_WAIT));
    
    console.log('Starting fade in - new environment loaded...');
    
    // Fade in gradual
    this.fadeOverlay.style.opacity = '0';
    
    // ANIMAÇÃO DE ENTRADA: Player "sai" da porta com movimento + fade (igual saída!)
    if (sprite && entranceAnim) {
      sprite.alpha = 0;
      
      // PHASE 1: Door exit animation using configuration
      const animConfig = this.transitionConfig.ANIMATION;
      const exitSteps = animConfig.ENTRANCE_STEPS;
      const exitDistance = animConfig.ENTRANCE_EXIT_DISTANCE;
      let exitStartX, exitDirection;
      
      if (newRoomId === 0) {
        // Sala 0: vem do leste, "sai" da porta direita movendo para esquerda
        exitStartX = entranceAnim.startX + exitDistance;
        exitDirection = -1; // Move para esquerda
      } else {
        // Sala 1: vem do oeste, "sai" da porta esquerda movendo para direita  
        exitStartX = entranceAnim.startX - exitDistance;
        exitDirection = 1; // Move para direita
      }
      
      position.x = exitStartX;
      
      // Optimized animation using configuration
      const totalDuration = animConfig.ENTRANCE_TOTAL_DURATION;
      const phase1Duration = animConfig.ENTRANCE_PHASE1_DURATION;
      const startTime = performance.now();
      
      await new Promise(resolve => {
        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const totalProgress = Math.min(elapsed / totalDuration, 1);
          
          if (elapsed < phase1Duration) {
            // FASE 1: Saída da porta + fade in
            const phase1Progress = elapsed / phase1Duration;
            sprite.alpha = phase1Progress;
            position.x = exitStartX + (exitDirection * exitDistance * phase1Progress);
          } else {
            // FASE 2: Movimento para posição segura
            const phase2Progress = (elapsed - phase1Duration) / (totalDuration - phase1Duration);
            const currentX = exitStartX + (exitDirection * exitDistance);
            position.x = currentX + (entranceAnim.endX - currentX) * phase2Progress;
          }
          
          if (totalProgress < 1) {
            requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(animate);
      });
      
      // Garante posição final segura
      position.x = entranceAnim.endX;
      sprite.alpha = 1;
      
      console.log(`Enhanced entrance animation completed. Final position: (${position.x}, ${position.y})`);
    }
    
    // Enable player immediately after fade in
    this.isTransitioning = false;
    if (playerComponent) {
      playerComponent.isTransitioning = false;
    }
  }

  async transitionToRoomViaHole(newRoomId, player, mapState) {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    const position = player.getComponent('Position');
    const playerComponent = player.getComponent('Player');
    const sprite = player.getComponent('Sprite');
    const velocity = player.getComponent('Velocity');
    
    console.log(`Falling through hole from room ${this.currentRoom} to room ${newRoomId}`);
    
    // Disable player controls
    if (playerComponent) {
      playerComponent.isTransitioning = true;
    }
    
    // FALLING ANIMATION: Player falls down with spinning effect
    if (sprite && velocity) {
      // Initial fall effect
      velocity.y = 200; // Start falling
      sprite.alpha = 1;
      
      // Falling animation with rotation effect
      const fallDuration = 1200;
      const startTime = performance.now();
      const startY = position.y;
      const fallDistance = 100;
      
      await new Promise(resolve => {
        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / fallDuration, 1);
          
          // Falling motion with acceleration
          position.y = startY + (fallDistance * progress * progress);
          
          // Spinning effect (visual only)
          if (sprite.element) {
            sprite.element.style.transform = `rotate(${progress * 720}deg)`;
          }
          
          // Fade out as falling
          sprite.alpha = 1 - (progress * 0.7);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(animate);
      });
    }
    
    // Complete fade out
    this.fadeOverlay.style.opacity = '1';
    await new Promise(resolve => setTimeout(resolve, this.transitionConfig.TIMING.FADE_OUT_DURATION));
    
    // ENVIRONMENT CHANGE
    console.log('Screen completely black - entering cavern...');
    
    this.clearRoomEntities();
    
    const previousRoom = this.currentRoom;
    this.currentRoom = newRoomId;
    
    this.setCurrentRoom(newRoomId);
    
    // Update map state
    mapState.currentRoom = newRoomId;
    mapState.visitedRooms.add(newRoomId);
    
    await new Promise(resolve => setTimeout(resolve, this.transitionConfig.TIMING.ENVIRONMENT_SETUP_WAIT));
    
    // Position player for falling animation using room-specific coordinates
    const newRoom = this.rooms[newRoomId];
    const spawnPos = newRoom.playerSpawnFromHole || { 
      x: this.transitionConfig.FALLING.LANDING_X, 
      y: this.transitionConfig.FALLING.LANDING_Y 
    };
    
    position.x = spawnPos.x;
    position.y = this.transitionConfig.FALLING.START_Y; // Start above screen
    console.log(`Player positioned for falling: (${position.x}, ${position.y}) -> target: (${spawnPos.x}, ${spawnPos.y})`);
    
    // Spawn entities for new room
    this.spawnRoomEntities(newRoomId);
    
    await new Promise(resolve => setTimeout(resolve, this.transitionConfig.TIMING.PRE_FADE_IN_WAIT_NEW));
    
    console.log('Starting fade in - cavern environment loaded...');
    
    // Fade in gradually
    this.fadeOverlay.style.opacity = '0';
    
    // FALLING ANIMATION: Player falls from hole above
    if (sprite && velocity) {
      sprite.alpha = 1; // Player is visible
      velocity.y = this.transitionConfig.FALLING.INITIAL_VELOCITY; // Start falling
      velocity.x = 0; // No horizontal movement
      
      // Animate fall to ground using room-specific target
      const fallDuration = this.transitionConfig.FALLING.ANIMATION_DURATION;
      const startY = position.y;
      const targetY = spawnPos.y; // Use room-specific Y position
      const startTime = performance.now();
      
      await new Promise(resolve => {
        const animateFall = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / fallDuration, 1);
          
          // Eased fall animation
          const easedProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          position.y = startY + (targetY - startY) * easedProgress;
          
          if (progress < 1) {
            requestAnimationFrame(animateFall);
          } else {
            // Ensure final position
            position.y = targetY;
            velocity.y = 0;
            resolve();
          }
        };
        requestAnimationFrame(animateFall);
      });
      
      console.log(`Fall animation completed. Final position: (${position.x}, ${position.y})`);
    }
    
    // Enable player immediately after fade in
    this.isTransitioning = false;
    if (playerComponent) {
      playerComponent.isTransitioning = false;
    }
  }

  async transitionToRoomViaClimb(newRoomId, player, mapState) {
    console.log(`Climbing transition from room ${this.currentRoom} to room ${newRoomId}`);
    
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    const position = player.getComponent('Position');
    const velocity = player.getComponent('Velocity');
    const sprite = player.getComponent('Sprite');
    const playerComponent = player.getComponent('Player');
    
    if (playerComponent) {
      playerComponent.isTransitioning = true;
    }

    // Quick fade out
    this.fadeOverlay.style.opacity = '1';
    await new Promise(resolve => setTimeout(resolve, this.transitionConfig.CLIMBING.FADE_DURATION));
    
    // Environment change
    this.clearRoomEntities();
    const previousRoom = this.currentRoom;
    this.currentRoom = newRoomId;
    this.setCurrentRoom(newRoomId);
    
    // Update map state
    mapState.currentRoom = newRoomId;
    mapState.visitedRooms.add(newRoomId);
    
    // Position player safely away from the hole in the destination room
    const newRoom = this.rooms[newRoomId];
    const safeSpawn = newRoom.playerSpawnFromClimb || { x: 700, y: 550 }; // Safe distance from hole
    position.x = safeSpawn.x;
    position.y = safeSpawn.y;
    velocity.x = 0;
    velocity.y = 0;
    console.log(`Player positioned after climb to room ${newRoomId}: (${position.x}, ${position.y})`);
    
    // Spawn entities for new room
    this.spawnRoomEntities(newRoomId);
    
    await new Promise(resolve => setTimeout(resolve, this.transitionConfig.CLIMBING.SETUP_WAIT));
    
    // Fade in
    this.fadeOverlay.style.opacity = '0';
    
    // CLIMBING ANIMATION: Player emerges from hole
    if (sprite && velocity) {
      sprite.alpha = 1;
      
      // Animate climbing out of hole
      const climbDuration = this.transitionConfig.CLIMBING.ANIMATION_DURATION;
      const startY = position.y + 50; // Start slightly below ground
      const targetY = position.y;
      const startTime = performance.now();
      
      position.y = startY; // Set starting position
      
      await new Promise(resolve => {
        const animateClimb = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / climbDuration, 1);
          
          // Eased climb animation (ease-out)
          const easedProgress = 1 - Math.pow(1 - progress, 2);
          position.y = startY + (targetY - startY) * easedProgress;
          
          if (progress < 1) {
            requestAnimationFrame(animateClimb);
          } else {
            // Ensure final position
            position.y = targetY;
            resolve();
          }
        };
        requestAnimationFrame(animateClimb);
      });
      
      console.log(`Climb animation completed. Final position: (${position.x}, ${position.y})`);
    }
    
    // Enable player immediately after animation
    this.isTransitioning = false;
    if (playerComponent) {
      playerComponent.isTransitioning = false;
    }
  }

  // Easing function for bouncy landing
  easeOutBounce(t) {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  }

  spawnRoomEntities(roomId) {
    const room = this.rooms[roomId];
    if (!room) {
      console.error(`Room ${roomId} not found!`);
      return;
    }
    
    console.log(`Spawning entities for room ${roomId} (${room.name})`);
    console.log('Room data:', room);
    
    if (!this.game.spawnRoomEnemies || !this.game.spawnRoomBosses) {
      console.warn('Room spawning methods not found');
      return;
    }
    
    // Spawn enemies
    if (room.enemies && room.enemies.length > 0) {
      console.log(`Spawning ${room.enemies.length} enemies:`, room.enemies);
      this.game.spawnRoomEnemies(room.enemies);
      console.log(`Spawned ${room.enemies.length} enemies in ${room.name}`);
    } else {
      console.log(`No enemies to spawn in ${room.name}`);
    }
    
    // Spawn bosses
    if (room.bosses && room.bosses.length > 0) {
      console.log(`Spawning ${room.bosses.length} bosses:`, room.bosses);
      this.game.spawnRoomBosses(room.bosses);
      console.log(`Spawned ${room.bosses.length} bosses in ${room.name}`);
    } else {
      console.log(`No bosses to spawn in ${room.name}`);
    }
  }

  clearRoomEntities() {
    const enemies = this.game.getEntitiesWithComponent('Enemy');
    const bosses = this.game.getEntitiesWithComponent('Boss');
    
    [...enemies, ...bosses].forEach(entity => {
      this.game.removeEntity(entity.id);
    });
    
    console.log('Cleared all room entities');
  }

  // Para o RenderSystem
  getCurrentRoomDoors() {
    const room = this.rooms[this.currentRoom];
    if (!room) return [];
    
    return (room.doors || []).map(door => ({
      x: door.x,
      y: door.y,
      width: door.width,
      height: door.height,
      toRoom: door.toRoom
    }));
  }

  // Para o MapSystem
  getCurrentRoomData() {
    return this.rooms[this.currentRoom];
  }
}