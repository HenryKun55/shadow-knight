/* ===================================
   MAP STATE COMPONENT - SHADOW KNIGHT
   ===================================
   Map state component using centralized GameConfig for map settings.
   All map behavior and defaults reference configuration.
*/

import { GameConfig } from '../config/GameConfig.js';

export class MapState {
  constructor() {
    this.isOpen = false;
    this.wasMovingBeforeMap = false;
    this.mapOpenTime = 0;
    
    // Use map configuration
    const mapConfig = GameConfig.ROOMS.MAP;
    this.currentRoom = GameConfig.ROOMS.INITIAL_ROOM;
    this.visitedRooms = new Set([this.currentRoom]);
    this.slowMovementFactor = mapConfig.SLOW_MOVEMENT_FACTOR;
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