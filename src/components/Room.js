export class Room {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type || 'normal'; // normal, boss
    
    // Room boundaries
    this.x = config.x;
    this.y = config.y;
    this.width = config.width;
    this.height = config.height;
    
    // Spawn points for player entering from different directions
    this.spawnPoints = {
      left: { x: this.x + 50, y: this.y + this.height - 100 },
      right: { x: this.x + this.width - 50, y: this.y + this.height - 100 },
      top: { x: this.x + this.width / 2, y: this.y + this.height - 50 },
      bottom: { x: this.x + this.width / 2, y: this.y + 50 },
      center: { x: this.x + this.width / 2, y: this.y + this.height - 100 }
    };
    
    // Override spawn points if provided
    if (config.spawnPoints) {
      Object.assign(this.spawnPoints, config.spawnPoints);
    }
    
    // Transition zones (areas that trigger room changes)
    this.transitions = config.transitions || [];
    
    // Enemies that should spawn in this room
    this.enemySpawns = config.enemySpawns || [];
    this.bossSpawns = config.bossSpawns || [];
    
    // Track if enemies are alive (for respawn logic)
    this.spawnedEnemies = new Set();
    this.spawnedBosses = new Set();
    this.bossesDefeated = new Set();
    
    // Room state
    this.isActive = false;
    this.hasBeenVisited = false;
  }
  
  isInside(x, y) {
    return x >= this.x && x <= this.x + this.width && 
           y >= this.y && y <= this.y + this.height;
  }
  
  getSpawnPoint(direction = 'center') {
    return { ...this.spawnPoints[direction] };
  }
  
  checkTransitions(playerX, playerY) {
    for (const transition of this.transitions) {
      if (playerX >= transition.x && playerX <= transition.x + transition.width &&
          playerY >= transition.y && playerY <= transition.y + transition.height) {
        return {
          toRoom: transition.toRoom,
          direction: transition.direction,
          spawnDirection: transition.spawnDirection || this.getOppositeDirection(transition.direction)
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
}