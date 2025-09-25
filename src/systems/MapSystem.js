export class MapSystem {
  constructor() {
    this.mapOverlay = null;
    this.mapGrid = null;
    this.rooms = [
      { id: 0, name: "Start", type: "normal", x: 2, y: 2 },
      { id: 1, name: "Hall", type: "normal", x: 1, y: 2 },
      { id: 2, name: "Arena", type: "boss", x: 0, y: 2 },
      { id: 3, name: "Corridor", type: "normal", x: 3, y: 2 },
      { id: 4, name: "Chamber", type: "normal", x: 4, y: 2 },
      { id: 5, name: "Upper Hall", type: "normal", x: 2, y: 1 },
      { id: 6, name: "Throne", type: "boss", x: 2, y: 0 },
      { id: 7, name: "Lower Hall", type: "normal", x: 2, y: 3 },
      { id: 8, name: "Depths", type: "boss", x: 2, y: 4 },
    ];
  }

  init() {
    this.mapOverlay = document.getElementById('map-overlay');
    this.mapGrid = document.getElementById('map-grid');
    this.generateMapGrid();
  }

  generateMapGrid() {
    if (!this.mapGrid) return;

    // Create 5x5 grid
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const room = this.rooms.find(r => r.x === x && r.y === y);
        const roomDiv = document.createElement('div');
        roomDiv.className = 'map-room';
        
        if (room) {
          roomDiv.dataset.roomId = room.id;
          roomDiv.textContent = room.name;
          if (room.type === 'boss') {
            roomDiv.classList.add('boss');
          }
          roomDiv.classList.add('unexplored');
        } else {
          roomDiv.style.visibility = 'hidden';
        }
        
        this.mapGrid.appendChild(roomDiv);
      }
    }
  }

  update() {
    // System update logic will be added here
  }

  showMap(mapState) {
    if (!this.mapOverlay) return;
    
    this.mapOverlay.classList.remove('hidden');
    this.updateMapDisplay(mapState);
  }

  hideMap() {
    if (!this.mapOverlay) return;
    this.mapOverlay.classList.add('hidden');
  }

  updateMapDisplay(mapState) {
    if (!this.mapGrid) return;

    const roomDivs = this.mapGrid.querySelectorAll('.map-room[data-room-id]');
    roomDivs.forEach(div => {
      const roomId = parseInt(div.dataset.roomId);
      
      // Reset classes
      div.classList.remove('current', 'visited', 'unexplored');
      
      // Set appropriate class
      if (roomId === mapState.currentRoom) {
        div.classList.add('current');
      } else if (mapState.isRoomVisited(roomId)) {
        div.classList.add('visited');
      } else {
        div.classList.add('unexplored');
      }
    });
  }

  isMapOpen() {
    return this.mapOverlay && !this.mapOverlay.classList.contains('hidden');
  }
}