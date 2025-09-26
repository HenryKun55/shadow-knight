export class RoomTransitionSystem {
  constructor() {
    this.game = null;
    this.isTransitioning = false;
    this.fadeOverlay = null;
    this.transitionDuration = 1500;
    this.transitionCooldown = 0; // Previne transições acidentais
    this.lastTransitionTime = 0;
    
    // SALAS ISOLADAS - Cada uma tem suas próprias coordenadas 0-1280
    this.rooms = {
      0: {
        id: 0,
        name: "Forest Entrance",
        theme: "forest",
        // Cada sala tem coordenadas próprias de 0 a 1280
        worldBounds: { x: 0, y: 0, width: 1280, height: 720 },
        backgroundColor: '#1a2e1a', // Verde escuro
        groundColor: '#2d4a2d',    // Verde do chão
        
        // Porta COLADA na parede direita (x=1220)
        doors: [
          { x: 1220, y: 520, width: 60, height: 100, toRoom: 1, direction: "east" }
        ],
        
        // Enemies com coordenadas relativas à sala (0-1280)
        enemies: [
          { type: 'goblin', x: 400, y: 600 },
          { type: 'goblin', x: 800, y: 600 }
        ],
        
        // Player spawn SEGURO antes da porta colada (voltando da sala 1)
        playerSpawnFromEast: { x: 1180, y: 570 }, // Seguro antes da porta colada
        // Animação de entrada: Player "sai" da porta movendo-se para esquerda  
        playerEntranceAnimation: { startX: 1250, endX: 1180, y: 570 },
        // Player spawn inicial no início da sala
        playerSpawnInitial: { x: 100, y: 550 }
      },
      
      1: {
        id: 1,
        name: "Dark Dungeon", 
        theme: "dungeon",
        // Coordenadas próprias de 0 a 1280 (ISOLADA da sala 0)
        worldBounds: { x: 0, y: 0, width: 1280, height: 720 },
        backgroundColor: '#2e1a1a', // Vermelho escuro
        groundColor: '#4a2d2d',    // Vermelho do chão
        
        // Porta COLADA na parede esquerda (x=0)  
        doors: [
          { x: 0, y: 520, width: 60, height: 100, toRoom: 0, direction: "west" }
        ],
        
        // Boss e enemies com coordenadas relativas à sala (0-1280)
        enemies: [
          { type: 'orc', x: 500, y: 590 }
        ],
        bosses: [
          { type: 'shadowLord', x: 1000, y: 580 }
        ],
        
        // Player spawn SEGURO após a porta (entrada da sala 1)
        playerSpawnFromWest: { x: 100, y: 570 }, // Seguro após porta colada
        // Animação de entrada: Player "sai" da porta movendo-se para direita
        playerEntranceAnimation: { startX: 30, endX: 100, y: 570 }
      }
    };
    
    this.currentRoom = 0; // Inicia na sala 0
  }

  init() {
    this.createFadeOverlay();
    this.setupInitialRoom();
  }

  createFadeOverlay() {
    this.fadeOverlay = document.createElement('div');
    this.fadeOverlay.id = 'room-fade-overlay';
    this.fadeOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0; 
      width: 100vw;
      height: 100vh;
      background: black;
      opacity: 0;
      pointer-events: none;
      z-index: 5000;
      transition: opacity 0.8s ease-in-out;
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
    
    // Estrelas (menos para dungeon, mais para forest)
    const starCount = room.theme === 'forest' ? 150 : 50;
    ctx.fillStyle = 'white';
    for (let i = 0; i < starCount; i++) {
      const star = {
        x: Math.random() * room.worldBounds.width,
        y: Math.random() * room.worldBounds.height,
        size: Math.random() * 2
      };
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    
    // Ground específico da sala
    ctx.fillStyle = room.groundColor;
    ctx.fillRect(0, 620, room.worldBounds.width, room.worldBounds.height - 620);
  }

  update(deltaTime) {
    // Reduz cooldown de transição
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
    
    // Check door collisions apenas se cooldown passou
    if (this.transitionCooldown <= 0) {
      this.checkDoorCollisions(position, player, mapState);
    }
  }

  enforceRoomBounds(position) {
    const room = this.rooms[this.currentRoom];
    const bounds = room.worldBounds;
    
    // Player collision box: 32x58 com offset (-16, -29)
    const playerLeft = -16;
    const playerRight = 16;
    const playerTop = -29;
    const playerBottom = 29;
    
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
    if (position.y + playerBottom > bounds.y + bounds.height) {
      position.y = bounds.y + bounds.height - playerBottom;
    }
  }

  checkDoorCollisions(position, player, mapState) {
    const currentRoom = this.rooms[this.currentRoom];
    if (!currentRoom) return;
    
    // Player collision box
    const playerLeft = position.x - 16;
    const playerRight = position.x + 16;
    const playerTop = position.y - 29;
    const playerBottom = position.y + 29;
    
    for (const door of currentRoom.doors) {
      const doorLeft = door.x;
      const doorRight = door.x + door.width;
      const doorTop = door.y;
      const doorBottom = door.y + door.height;
      
      if (playerRight > doorLeft && playerLeft < doorRight &&
          playerBottom > doorTop && playerTop < doorBottom) {
        console.log(`Door collision! Transitioning to room ${door.toRoom}`);
        // Inicia cooldown para evitar loop de transições
        this.transitionCooldown = 2000; // 2 segundos de cooldown
        this.lastTransitionTime = Date.now();
        this.transitionToRoom(door.toRoom, player, mapState);
        break;
      }
    }
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
        // Calcula direção da porta
        const doorCenterX = currentDoor.x + (currentDoor.width / 2);
        const moveDistance = 30; // Pixels em direção à porta
        let targetX;
        
        if (currentDoor.direction === "east") {
          targetX = position.x + moveDistance; // Move para direita
        } else if (currentDoor.direction === "west") {
          targetX = position.x - moveDistance; // Move para esquerda
        }
        
        // Animação: movimento + fade out (otimizada)
        const duration = 720; // 720ms total
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
    
    // Fade out completo - PRETO TOTAL
    this.fadeOverlay.style.opacity = '1';
    await new Promise(resolve => setTimeout(resolve, 750)); // Mais tempo para fade completo
    
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
    
    // Pequena pausa adicional para garantir que tudo foi carregado
    await new Promise(resolve => setTimeout(resolve, 250));
    
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
    
    // Pausa antes de começar fade in (ambiente totalmente carregado)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('Starting fade in - new environment loaded...');
    
    // Fade in gradual
    this.fadeOverlay.style.opacity = '0';
    
    // ANIMAÇÃO DE ENTRADA: Player "sai" da porta com movimento + fade (igual saída!)
    if (sprite && entranceAnim) {
      sprite.alpha = 0;
      
      // FASE 1: Animação de "saída da porta" (movimento reverso + fade in)
      const exitSteps = 12;
      const exitDistance = 25; // Simula saída da porta
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
      
      // Animação otimizada: movimento de "saída da porta" + fade in + movimento final
      const totalDuration = 880; // 600ms + 280ms
      const phase1Duration = 600;
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
    
    setTimeout(() => {
      this.isTransitioning = false;
      if (playerComponent) {
        playerComponent.isTransitioning = false;
      }
    }, 200);
  }

  spawnRoomEntities(roomId) {
    const room = this.rooms[roomId];
    if (!room) return;
    
    if (!this.game.spawnRoomEnemies || !this.game.spawnRoomBosses) {
      console.warn('Room spawning methods not found');
      return;
    }
    
    // Spawn enemies
    if (room.enemies && room.enemies.length > 0) {
      this.game.spawnRoomEnemies(room.enemies);
      console.log(`Spawned ${room.enemies.length} enemies in ${room.name}`);
    }
    
    // Spawn bosses
    if (room.bosses && room.bosses.length > 0) {
      this.game.spawnRoomBosses(room.bosses);
      console.log(`Spawned ${room.bosses.length} bosses in ${room.name}`);
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
    
    return room.doors.map(door => ({
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