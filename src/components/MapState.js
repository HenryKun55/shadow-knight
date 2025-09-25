export class MapState {
  constructor() {
    this.isOpen = false;
    this.wasMovingBeforeMap = false;
    this.mapOpenTime = 0;
    this.currentRoom = 0;
    this.visitedRooms = new Set([0]); // Start with room 0 visited
    this.slowMovementFactor = 0.3; // Player moves at 30% speed when viewing map
  }

  openMap() {
    this.isOpen = true;
    this.mapOpenTime = Date.now();
  }

  closeMap() {
    this.isOpen = false;
    this.wasMovingBeforeMap = false;
    this.mapOpenTime = 0;
  }

  visitRoom(roomId) {
    this.visitedRooms.add(roomId);
    this.currentRoom = roomId;
  }

  isRoomVisited(roomId) {
    return this.visitedRooms.has(roomId);
  }
}