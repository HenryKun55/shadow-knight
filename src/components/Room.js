/* ===================================
   ROOM COMPONENT - SHADOW KNIGHT
   ===================================
   Room component for managing game room data and transitions.
*/

export class Room {
  constructor(id, theme, bounds, spawnPoint = null) {
    this.id = id;
    this.theme = theme;
    this.bounds = bounds;
    this.spawnPoint = spawnPoint || { x: 100, y: 550 };
    
    // Arrays for room contents
    this.doors = [];
    this.enemies = [];
    this.items = [];
    
    // Room state
    this.visited = false;
    this.cleared = false;
    this.isActive = false;
    this.hasBeenVisited = false;
    
    // Spawn points for player entering from different directions
    this.spawnPoints = {
      left: { x: bounds.x + 50, y: bounds.y + bounds.height - 100 },
      right: { x: bounds.x + bounds.width - 50, y: bounds.y + bounds.height - 100 },
      top: { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height - 50 },
      bottom: { x: bounds.x + bounds.width / 2, y: bounds.y + 50 },
      center: { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height - 100 }
    };
    
    // Track spawned entities
    this.spawnedEnemies = new Set();
    this.spawnedBosses = new Set();
    this.bossesDefeated = new Set();
  }
  
  // Door management
  addDoor(door) {
    this.doors.push(door);
  }
  
  removeDoor(door) {
    const index = this.doors.indexOf(door);
    if (index > -1) {
      this.doors.splice(index, 1);
    }
  }
  
  // Enemy management
  addEnemy(enemy) {
    this.enemies.push(enemy);
  }
  
  removeEnemy(enemy) {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
    }
  }
  
  hasEnemies() {
    return this.enemies.length > 0;
  }
  
  getEnemyCount() {
    return this.enemies.length;
  }
  
  // Item management
  addItem(item) {
    this.items.push(item);
  }
  
  removeItem(item) {
    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
    }
  }
  
  hasItems() {
    return this.items.length > 0;
  }
  
  getItemCount() {
    return this.items.length;
  }
  
  getDoorBySide(side) {
    return this.doors.find(door => door.side === side);
  }
  
  // Room state methods
  visit() {
    this.visited = true;
    this.hasBeenVisited = true;
  }
  
  clear() {
    this.cleared = true;
  }
  
  reset() {
    this.visited = false;
    this.cleared = false;
    this.doors = [];
    this.enemies = [];
    this.items = [];
  }
  
  // Utility methods
  isInside(x, y) {
    return x >= this.bounds.x && x <= this.bounds.x + this.bounds.width && 
           y >= this.bounds.y && y <= this.bounds.y + this.bounds.height;
  }
  
  containsPoint(x, y) {
    return x >= this.bounds.x && x < this.bounds.x + this.bounds.width && 
           y >= this.bounds.y && y < this.bounds.y + this.bounds.height;
  }
  
  getSpawnPoint(direction = 'center') {
    return { ...this.spawnPoints[direction] };
  }
  
  checkTransitions(playerX, playerY) {
    for (const door of this.doors) {
      if (playerX >= door.x && playerX <= door.x + door.width &&
          playerY >= door.y && playerY <= door.y + door.height) {
        return {
          toRoom: door.targetRoom,
          direction: door.side,
          spawnDirection: door.targetSpawn || this.getOppositeDirection(door.side)
        };
      }
    }
    return null;
  }
  
  getOppositeDirection(direction) {
    const opposites = {
      left: 'right',
      right: 'left',
      top: 'bottom',
      bottom: 'top'
    };
    return opposites[direction] || 'center';
  }
  
  activate() {
    this.isActive = true;
    if (!this.hasBeenVisited) {
      this.hasBeenVisited = true;
    }
  }
  
  deactivate() {
    this.isActive = false;
  }
  
  // Check if room is boss room
  isBossRoom() {
    return this.theme === 'boss' || this.enemies.some(enemy => enemy.type === 'boss');
  }
  
  // Get all interactive objects in room
  getAllObjects() {
    return {
      doors: [...this.doors],
      enemies: [...this.enemies],
      items: [...this.items]
    };
  }
}