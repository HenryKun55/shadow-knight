export class MapSystem {
  constructor() {
    this.mapOverlay = null;
    this.mapCanvas = null;
    this.isOpen = false;
  }

  init() {
    this.createMapOverlay();
  }

  createMapOverlay() {
    // Remove existing overlay if any
    const existing = document.getElementById('map-overlay');
    if (existing) {
      existing.remove();
    }

    // Create background shadow overlay
    this.backgroundShadow = document.createElement('div');
    this.backgroundShadow.id = 'map-background-shadow';
    this.backgroundShadow.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.6);
      z-index: 999;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
      pointer-events: none;
      display: none;
    `;
    document.body.appendChild(this.backgroundShadow);

    // Create map overlay com animações
    this.mapOverlay = document.createElement('div');
    this.mapOverlay.id = 'map-overlay';
    this.mapOverlay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.95);
      width: 400px;
      height: 240px;
      background: rgba(0, 0, 30, 0.95);
      border: 3px solid #666;
      border-radius: 8px;
      z-index: 1000;
      font-family: monospace;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
      opacity: 0;
      transition: all 0.3s ease-in-out;
      pointer-events: none;
      display: none;
    `;

    // Map canvas
    this.mapCanvas = document.createElement('canvas');
    this.mapCanvas.width = 394;
    this.mapCanvas.height = 230;
    this.mapCanvas.style.cssText = `
      position: absolute;
      top: 3px;
      left: 3px;
      image-rendering: pixelated;
    `;

    this.mapOverlay.appendChild(this.mapCanvas);
    document.body.appendChild(this.mapOverlay);
  }

  update() {
    // Verifica se M está sendo pressionado (hold to view)
    const game = window.gameInstance;
    if (game && game.inputManager) {
      const isMPressed = game.inputManager.isKeyDown('KeyM');
      
      // Verifica se player pode acessar mapa
      const player = game.getEntitiesWithComponent('Player')[0];
      let canOpenMap = false;
      
      if (player) {
        const physics = player.getComponent('Physics');
        const playerComponent = player.getComponent('Player');
        
        // Player deve estar no chão E não estar em transição
        canOpenMap = physics && physics.onGround && 
                    playerComponent && !playerComponent.isTransitioning;
      }
      
      // Verifica se há transição de sala acontecendo
      const roomTransitionSystem = game.getSystem('RoomTransitionSystem');
      if (roomTransitionSystem && roomTransitionSystem.isTransitioning) {
        canOpenMap = false;
      }
      
      if (isMPressed && !this.isOpen && canOpenMap) {
        this.showMap();
      } else if (!isMPressed && this.isOpen) {
        this.hideMap();
      } else if (isMPressed && !canOpenMap && this.isOpen) {
        // Fecha mapa se player pular/cair enquanto mapa está aberto
        this.hideMap();
      }
      
      if (this.isOpen) {
        this.updateMapDisplay();
      }
    }
  }

  showMap() {
    this.isOpen = true;
    
    // Mostra elementos
    this.backgroundShadow.style.display = 'block';
    this.mapOverlay.style.display = 'block';
    
    // Força reflow antes da animação
    this.backgroundShadow.offsetHeight;
    this.mapOverlay.offsetHeight;
    
    // Anima entrada
    this.backgroundShadow.style.opacity = '1';
    this.mapOverlay.style.opacity = '1';
    this.mapOverlay.style.transform = 'translate(-50%, -50%) scale(1)';
    
    this.updateMapDisplay();
  }

  hideMap() {
    this.isOpen = false;
    
    // Anima saída
    this.backgroundShadow.style.opacity = '0';
    this.mapOverlay.style.opacity = '0';
    this.mapOverlay.style.transform = 'translate(-50%, -50%) scale(0.95)';
    
    // Esconde elementos após animação
    setTimeout(() => {
      this.backgroundShadow.style.display = 'none';
      this.mapOverlay.style.display = 'none';
    }, 300);
  }

  updateMapDisplay() {
    if (!this.mapCanvas) return;

    const game = window.gameInstance;
    if (!game) return;

    const roomTransitionSystem = game.getSystem('RoomTransitionSystem');
    if (!roomTransitionSystem) return;

    const player = game.getEntitiesWithComponent('Player')[0];
    if (!player) return;

    const position = player.getComponent('Position');
    const mapState = player.getComponent('MapState');
    if (!position || !mapState) return;

    const ctx = this.mapCanvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#000020';
    ctx.fillRect(0, 0, 394, 230);

    // Draw discovered rooms only (estilo SOTN)
    this.drawDiscoveredRooms(ctx, mapState, roomTransitionSystem, position);
  }

  drawDiscoveredRooms(ctx, mapState, roomTransitionSystem, playerPosition) {
    // MAPA ESTILO HOLLOW KNIGHT: salas pequenas e compactas
    const roomWidth = 40;    // Largura de cada sala no mapa (muito menor)
    const roomHeight = 25;   // Altura de cada sala no mapa (muito menor)
    const startX = 180;      // Centraliza melhor no canvas
    const startY = 110;

    mapState.visitedRooms.forEach(roomId => {
      const room = roomTransitionSystem.rooms[roomId];
      if (!room) return;

      // Position no mapa
      let mapX = startX + (roomId * roomWidth);
      let mapY = startY;

      // Cor da sala descoberta
      const isCurrent = roomId === mapState.currentRoom;
      const roomColor = room.theme === 'forest' ? '#004400' : '#440000';
      const borderColor = isCurrent ? '#00ff00' : '#666666';

      // Desenha retângulo da sala
      ctx.fillStyle = roomColor;
      ctx.fillRect(mapX, mapY, roomWidth, roomHeight);
      
      // Borda
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = isCurrent ? 2 : 1;
      ctx.strokeRect(mapX, mapY, roomWidth, roomHeight);

      // Se é a sala atual, desenha player dot
      if (isCurrent) {
        // Calcula posição do player dentro da sala no mapa
        const playerMapX = mapX + (playerPosition.x / 1280) * roomWidth;
        const playerMapY = mapY + (playerPosition.y / 720) * roomHeight;

        // Player dot (menor para salas pequenas)
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(playerMapX, playerMapY, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Nome da sala (fonte menor)
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(room.name, mapX + roomWidth/2, mapY - 3);
    });

    // Connections entre salas descobertas
    this.drawRoomConnections(ctx, mapState, startX, startY, roomWidth, roomHeight);

    // Info text
    ctx.fillStyle = '#cccccc';
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Hold M to view map (ground only)', 20, 210);
  }

  drawRoomConnections(ctx, mapState, startX, startY, roomWidth, roomHeight) {
    // Desenha conexões apenas entre salas descobertas
    const discoveredRooms = Array.from(mapState.visitedRooms).sort();
    
    for (let i = 0; i < discoveredRooms.length - 1; i++) {
      const room1 = discoveredRooms[i];
      const room2 = discoveredRooms[i + 1];
      
      if (room2 === room1 + 1) { // Salas adjacentes
        const x1 = startX + (room1 * roomWidth) + roomWidth;
        const y1 = startY + roomHeight / 2;
        const x2 = startX + (room2 * roomWidth);
        const y2 = startY + roomHeight / 2;

        // Linha de conexão (mais fina)
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
  }

  toggle() {
    if (this.isOpen) {
      this.hideMap();
    } else {
      this.showMap();
    }
  }

  isMapOpen() {
    return this.isOpen;
  }
}