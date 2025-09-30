/* ===================================
   MAP SYSTEM - SHADOW KNIGHT
   ===================================
   Map system using centralized GameConfig for UI styling and map configuration.
   All map colors, dimensions, and behavior reference configuration.
*/

import { GameConfig } from '../config/GameConfig.js';
import { UIConstants } from '../config/UIConstants.js';

export class MapSystem {
  constructor() {
    this.mapOverlay = null;
    this.mapCanvas = null;
    this.isOpen = false;
    
    // Cache map configuration for performance
    this.mapConfig = GameConfig.MAP;
    this.inputKeys = GameConfig.INPUT.KEYS.MAP;
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

    // Create background shadow overlay using configuration
    this.backgroundShadow = document.createElement('div');
    this.backgroundShadow.id = UIConstants.IDS.MAP_BACKGROUND_SHADOW;
    const shadowStyles = this.mapConfig.UI.BACKGROUND_SHADOW;
    this.backgroundShadow.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: ${shadowStyles.BACKGROUND};
      z-index: ${shadowStyles.Z_INDEX};
      opacity: 0;
      transition: opacity ${shadowStyles.TRANSITION_DURATION}ms ease-in-out;
      pointer-events: none;
      display: none;
    `;
    document.body.appendChild(this.backgroundShadow);

    // Create map overlay using configuration
    this.mapOverlay = document.createElement('div');
    this.mapOverlay.id = UIConstants.SELECTORS.MAP_OVERLAY.replace('#', '');
    const overlayStyles = this.mapConfig.UI.OVERLAY;
    this.mapOverlay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(${overlayStyles.INITIAL_SCALE});
      width: ${overlayStyles.WIDTH}px;
      height: ${overlayStyles.HEIGHT}px;
      background: ${overlayStyles.BACKGROUND};
      border: ${overlayStyles.BORDER_WIDTH}px solid ${overlayStyles.BORDER_COLOR};
      border-radius: ${overlayStyles.BORDER_RADIUS}px;
      z-index: ${overlayStyles.Z_INDEX};
      font-family: ${overlayStyles.FONT_FAMILY};
      box-shadow: ${overlayStyles.BOX_SHADOW};
      opacity: 0;
      transition: all ${overlayStyles.TRANSITION_DURATION}ms ease-in-out;
      pointer-events: none;
      display: none;
    `;

    // Map canvas using configuration
    this.mapCanvas = document.createElement('canvas');
    const canvasConfig = this.mapConfig.UI.CANVAS;
    this.mapCanvas.width = canvasConfig.WIDTH;
    this.mapCanvas.height = canvasConfig.HEIGHT;
    this.mapCanvas.style.cssText = `
      position: absolute;
      top: ${canvasConfig.OFFSET_TOP}px;
      left: ${canvasConfig.OFFSET_LEFT}px;
      image-rendering: ${canvasConfig.RENDERING};
    `;

    this.mapOverlay.appendChild(this.mapCanvas);
    document.body.appendChild(this.mapOverlay);
  }

  update() {
    // Verifica se M está sendo pressionado (hold to view)
    const game = window.gameInstance;
    if (game && game.inputManager) {
      const isMPressed = this.inputKeys.some(key => game.inputManager.isKeyDown(key));
      
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
    
    // Hide elements after animation using configured duration
    setTimeout(() => {
      this.backgroundShadow.style.display = 'none';
      this.mapOverlay.style.display = 'none';
    }, this.mapConfig.UI.OVERLAY.TRANSITION_DURATION);
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
    
    // Clear canvas using configuration
    const canvasConfig = this.mapConfig.UI.CANVAS;
    ctx.fillStyle = this.mapConfig.COLORS.BACKGROUND;
    ctx.fillRect(0, 0, canvasConfig.WIDTH, canvasConfig.HEIGHT);

    // Draw discovered rooms only (estilo SOTN)
    this.drawDiscoveredRooms(ctx, mapState, roomTransitionSystem, position);
  }

  drawDiscoveredRooms(ctx, mapState, roomTransitionSystem, playerPosition) {
    // Room layout using configuration
    const roomLayout = this.mapConfig.ROOM_LAYOUT;
    const roomWidth = roomLayout.WIDTH;
    const roomHeight = roomLayout.HEIGHT;
    const startX = roomLayout.START_X;
    const startY = roomLayout.START_Y;

    mapState.visitedRooms.forEach(roomId => {
      const room = roomTransitionSystem.rooms[roomId];
      if (!room) return;

      // Position no mapa
      let mapX = startX + (roomId * roomWidth);
      let mapY = startY;

      // Room colors using configuration
      const isCurrent = roomId === mapState.currentRoom;
      const themeColors = this.mapConfig.COLORS.ROOM_THEMES;
      const roomColor = themeColors[room.theme?.toUpperCase()] || themeColors.DEFAULT;
      const borderColor = isCurrent ? this.mapConfig.COLORS.CURRENT_ROOM : this.mapConfig.COLORS.VISITED_ROOM;

      // Desenha retângulo da sala
      ctx.fillStyle = roomColor;
      ctx.fillRect(mapX, mapY, roomWidth, roomHeight);
      
      // Border using configuration
      ctx.strokeStyle = borderColor;
      const borderConfig = this.mapConfig.ROOM_LAYOUT.BORDER;
      ctx.lineWidth = isCurrent ? borderConfig.CURRENT_WIDTH : borderConfig.NORMAL_WIDTH;
      ctx.strokeRect(mapX, mapY, roomWidth, roomHeight);

      // Se é a sala atual, desenha player dot
      if (isCurrent) {
        // Calculate player position within room using configuration
        const worldBounds = GameConfig.WORLD.BOUNDS;
        const playerMapX = mapX + (playerPosition.x / worldBounds.width) * roomWidth;
        const playerMapY = mapY + (playerPosition.y / worldBounds.height) * roomHeight;

        // Player dot using configuration
        const playerDot = this.mapConfig.PLAYER_DOT;
        ctx.fillStyle = playerDot.COLOR;
        ctx.beginPath();
        ctx.arc(playerMapX, playerMapY, playerDot.RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      // Room name using configuration
      const textConfig = this.mapConfig.TEXT;
      ctx.fillStyle = textConfig.ROOM_NAME.COLOR;
      ctx.font = textConfig.ROOM_NAME.FONT;
      ctx.textAlign = textConfig.ROOM_NAME.ALIGN;
      ctx.fillText(room.name, mapX + roomWidth/2, mapY + textConfig.ROOM_NAME.OFFSET_Y);
    });

    // Connections entre salas descobertas
    this.drawRoomConnections(ctx, mapState, startX, startY, roomWidth, roomHeight);

    // Info text using configuration
    const infoConfig = this.mapConfig.TEXT.INFO;
    ctx.fillStyle = infoConfig.COLOR;
    ctx.font = infoConfig.FONT;
    ctx.textAlign = infoConfig.ALIGN;
    ctx.fillText(infoConfig.MESSAGE, infoConfig.X, infoConfig.Y);
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

        // Connection line using configuration
        const connectionConfig = this.mapConfig.CONNECTIONS;
        ctx.strokeStyle = connectionConfig.COLOR;
        ctx.lineWidth = connectionConfig.WIDTH;
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