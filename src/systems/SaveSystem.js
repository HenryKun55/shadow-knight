/* ===================================
   SAVE SYSTEM - SHADOW KNIGHT
   ===================================
   Complete save/load system with corruption protection and statistics tracking.
   Handles player progress, statistics, and game state persistence.
*/

import { GameConfig } from '../config/GameConfig.js';
import { UIConstants } from '../config/UIConstants.js';

export class SaveSystem {
  constructor() {
    this.game = null;
    this.saveConfig = GameConfig.SAVE_SYSTEM;
    this.statisticsConfig = GameConfig.STATISTICS;
    
    // Save state management
    this.isSaving = false;
    this.saveInProgress = false;
    this.lastSaveTime = 0;
    this.currentSaveSlot = 1;
    
    // Statistics tracking
    this.statistics = this.initializeStatistics();
    this.sessionStartTime = Date.now();
    
    // Save protection
    this.saveProtectionActive = false;
    this.backupSaves = [];
    
    // Prevent page unload during save
    this.setupSaveProtection();
  }

  initializeStatistics() {
    const stats = {};
    
    // Initialize combat statistics
    Object.values(this.statisticsConfig.COMBAT).forEach(key => {
      stats[key] = 0;
    });
    
    // Initialize exploration statistics
    Object.values(this.statisticsConfig.EXPLORATION).forEach(key => {
      stats[key] = 0;
    });
    
    // Initialize time statistics
    Object.values(this.statisticsConfig.TIME).forEach(key => {
      stats[key] = 0;
    });
    
    stats[this.statisticsConfig.TIME.SESSION_START] = this.sessionStartTime;
    
    return stats;
  }

  setupSaveProtection() {
    // Prevent accidental page close during save
    window.addEventListener('beforeunload', (event) => {
      if (this.saveInProgress) {
        const message = 'Game save in progress! Closing now may corrupt your save data.';
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    });
  }

  async saveGame(saveSlot = this.currentSaveSlot, showUI = true) {
    if (this.isSaving) {
      console.warn('Save already in progress');
      return false;
    }

    // Check if in rest area
    if (!this.canSaveAtCurrentLocation()) {
      this.showSaveMessage('You can only save at rest areas!', 'error');
      return false;
    }

    try {
      this.isSaving = true;
      this.saveInProgress = true;
      
      if (showUI) {
        this.showSavingIndicator();
      }

      // Create save data
      const saveData = await this.createSaveData();
      
      // Validate save data
      if (!this.validateSaveData(saveData)) {
        throw new Error('Save data validation failed');
      }

      // Create backup before saving
      await this.createBackup(saveSlot);
      
      // Save to localStorage with timestamp
      const saveKey = `shadowknight_save_${saveSlot}`;
      const savePayload = {
        version: this.saveConfig.SAVE_FILE_VERSION,
        timestamp: Date.now(),
        data: saveData,
        checksum: this.calculateChecksum(saveData)
      };

      localStorage.setItem(saveKey, JSON.stringify(savePayload));
      
      // Update last save time
      this.lastSaveTime = Date.now();
      
      if (showUI) {
        this.hideSavingIndicator();
        this.showSaveMessage('Game saved successfully!', 'success');
      }

      console.log(`Game saved to slot ${saveSlot}:`, saveData);
      return true;

    } catch (error) {
      console.error('Save failed:', error);
      
      if (showUI) {
        this.hideSavingIndicator();
        this.showSaveMessage('Failed to save game!', 'error');
      }
      
      return false;
    } finally {
      this.isSaving = false;
      // Keep save protection active for a moment
      setTimeout(() => {
        this.saveInProgress = false;
      }, 1000);
    }
  }

  async loadGame(saveSlot = this.currentSaveSlot) {
    try {
      const saveKey = `shadowknight_save_${saveSlot}`;
      const saveString = localStorage.getItem(saveKey);
      
      if (!saveString) {
        console.warn(`No save data found in slot ${saveSlot}`);
        return null;
      }

      const savePayload = JSON.parse(saveString);
      
      // Validate save payload
      if (!this.validateSavePayload(savePayload)) {
        throw new Error('Save file is corrupted or invalid');
      }

      // Extract save data
      const saveData = savePayload.data;
      
      // Apply save data to game
      await this.applySaveData(saveData);
      
      console.log(`Game loaded from slot ${saveSlot}:`, saveData);
      return saveData;

    } catch (error) {
      console.error('Load failed:', error);
      
      // Try to restore from backup
      const backupData = await this.tryRestoreFromBackup(saveSlot);
      if (backupData) {
        console.log('Restored from backup save');
        return backupData;
      }
      
      this.showSaveMessage('Failed to load game!', 'error');
      return null;
    }
  }

  async createSaveData() {
    const player = this.game.getEntitiesWithComponent('Player')[0];
    const playerComponent = player?.getComponent('Player');
    const position = player?.getComponent('Position');
    const mapState = player?.getComponent('MapState');
    
    if (!player || !playerComponent || !position || !mapState) {
      throw new Error('Required player components not found');
    }

    // Update statistics before saving
    this.updatePlaytime();

    const saveData = {
      // Player state
      [this.saveConfig.SAVE_DATA_KEYS.PLAYER_STATS]: {
        health: playerComponent.health,
        maxHealth: playerComponent.maxHealth,
        stamina: playerComponent.stamina,
        maxStamina: playerComponent.maxStamina,
        position: { x: position.x, y: position.y },
        facingDirection: playerComponent.facingDirection
      },

      // Game progress
      [this.saveConfig.SAVE_DATA_KEYS.GAME_PROGRESS]: {
        currentRoom: mapState.currentRoom,
        visitedRooms: Array.from(mapState.visitedRooms),
        defeatedEnemies: this.getDefeatedEnemies(),
        defeatedBosses: this.getDefeatedBosses(),
        discoveredSecrets: this.getDiscoveredSecrets()
      },

      // World state
      [this.saveConfig.SAVE_DATA_KEYS.WORLD_STATE]: {
        roomStates: this.getRoomStates(),
        activeQuests: [], // For future quest system
        worldEvents: this.getWorldEvents()
      },

      // Playtime
      [this.saveConfig.SAVE_DATA_KEYS.PLAYTIME]: {
        totalPlaytime: this.statistics[this.statisticsConfig.TIME.TOTAL_PLAYTIME],
        sessionStart: this.sessionStartTime,
        lastSaveTime: Date.now()
      },

      // Statistics
      [this.saveConfig.SAVE_DATA_KEYS.STATISTICS]: { ...this.statistics },

      // Settings (if needed)
      [this.saveConfig.SAVE_DATA_KEYS.SETTINGS]: {
        // Can include audio settings, key bindings, etc.
      }
    };

    return saveData;
  }

  async applySaveData(saveData) {
    const player = this.game.getEntitiesWithComponent('Player')[0];
    const playerComponent = player?.getComponent('Player');
    const position = player?.getComponent('Position');
    const mapState = player?.getComponent('MapState');
    
    if (!player || !playerComponent || !position || !mapState) {
      throw new Error('Required player components not found');
    }

    // Apply player stats
    const playerStats = saveData[this.saveConfig.SAVE_DATA_KEYS.PLAYER_STATS];
    if (playerStats) {
      playerComponent.health = playerStats.health;
      playerComponent.maxHealth = playerStats.maxHealth;
      playerComponent.stamina = playerStats.stamina;
      playerComponent.maxStamina = playerStats.maxStamina;
      playerComponent.facingDirection = playerStats.facingDirection;
      
      position.x = playerStats.position.x;
      position.y = playerStats.position.y;
    }

    // Apply game progress
    const gameProgress = saveData[this.saveConfig.SAVE_DATA_KEYS.GAME_PROGRESS];
    if (gameProgress) {
      mapState.currentRoom = gameProgress.currentRoom;
      mapState.visitedRooms = new Set(gameProgress.visitedRooms);
      
      // Transition to saved room
      const roomTransitionSystem = this.game.getSystem('RoomTransitionSystem');
      if (roomTransitionSystem) {
        roomTransitionSystem.currentRoom = gameProgress.currentRoom;
        roomTransitionSystem.setCurrentRoom(gameProgress.currentRoom);
      }
    }

    // Apply statistics
    const statistics = saveData[this.saveConfig.SAVE_DATA_KEYS.STATISTICS];
    if (statistics) {
      this.statistics = { ...statistics };
    }

    // Apply world state
    const worldState = saveData[this.saveConfig.SAVE_DATA_KEYS.WORLD_STATE];
    if (worldState) {
      this.applyWorldState(worldState);
    }
  }

  canSaveAtCurrentLocation() {
    const roomTransitionSystem = this.game.getSystem('RoomTransitionSystem');
    if (!roomTransitionSystem) return false;
    
    const currentRoomId = roomTransitionSystem.currentRoom;
    return this.saveConfig.REST_AREAS.hasOwnProperty(currentRoomId);
  }

  // Statistics tracking methods
  trackStatistic(category, statistic, value = 1) {
    const key = this.statisticsConfig[category.toUpperCase()][statistic.toUpperCase()];
    if (key && this.statistics.hasOwnProperty(key)) {
      this.statistics[key] += value;
    }
  }

  updatePlaytime() {
    const currentTime = Date.now();
    const sessionPlaytime = currentTime - this.sessionStartTime;
    this.statistics[this.statisticsConfig.TIME.TOTAL_PLAYTIME] += sessionPlaytime;
    this.sessionStartTime = currentTime;
  }

  // Helper methods for save data
  getDefeatedEnemies() {
    // Track defeated enemies per room
    // Implementation depends on how enemies are managed
    return {};
  }

  getDefeatedBosses() {
    // Track defeated bosses
    return [];
  }

  getDiscoveredSecrets() {
    // Track discovered secrets
    return [];
  }

  getRoomStates() {
    // Get state of each room (enemies defeated, items collected, etc.)
    return {};
  }

  getWorldEvents() {
    // Get any world-changing events that occurred
    return [];
  }

  applyWorldState(worldState) {
    // Apply saved world state
    console.log('Applied world state:', worldState);
  }

  // Save validation and protection
  validateSaveData(saveData) {
    const requiredKeys = Object.values(this.saveConfig.SAVE_DATA_KEYS);
    return requiredKeys.every(key => saveData.hasOwnProperty(key));
  }

  validateSavePayload(savePayload) {
    if (!savePayload.version || !savePayload.timestamp || !savePayload.data) {
      return false;
    }
    
    // Check version compatibility
    if (savePayload.version !== this.saveConfig.SAVE_FILE_VERSION) {
      console.warn('Save file version mismatch');
      // Could implement migration logic here
    }
    
    // Verify checksum if present
    if (savePayload.checksum) {
      const calculatedChecksum = this.calculateChecksum(savePayload.data);
      if (calculatedChecksum !== savePayload.checksum) {
        console.error('Save file checksum mismatch - data may be corrupted');
        return false;
      }
    }
    
    return this.validateSaveData(savePayload.data);
  }

  calculateChecksum(data) {
    // Simple checksum calculation
    const jsonString = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  async createBackup(saveSlot) {
    try {
      const saveKey = `shadowknight_save_${saveSlot}`;
      const existingSave = localStorage.getItem(saveKey);
      
      if (existingSave) {
        const backupKey = `shadowknight_backup_${saveSlot}_${Date.now()}`;
        localStorage.setItem(backupKey, existingSave);
        
        // Maintain backup limit
        this.cleanupOldBackups(saveSlot);
      }
    } catch (error) {
      console.warn('Failed to create backup:', error);
    }
  }

  cleanupOldBackups(saveSlot) {
    const backupKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`shadowknight_backup_${saveSlot}_`)) {
        backupKeys.push(key);
      }
    }
    
    // Sort by timestamp and remove oldest if over limit
    backupKeys.sort().reverse();
    const limit = this.saveConfig.SAVE_PROTECTION.CORRUPTION_BACKUP_COUNT;
    
    if (backupKeys.length > limit) {
      backupKeys.slice(limit).forEach(key => {
        localStorage.removeItem(key);
      });
    }
  }

  async tryRestoreFromBackup(saveSlot) {
    try {
      const backupKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`shadowknight_backup_${saveSlot}_`)) {
          backupKeys.push(key);
        }
      }
      
      // Try most recent backup
      if (backupKeys.length > 0) {
        backupKeys.sort().reverse();
        const backupData = localStorage.getItem(backupKeys[0]);
        if (backupData) {
          const savePayload = JSON.parse(backupData);
          if (this.validateSavePayload(savePayload)) {
            await this.applySaveData(savePayload.data);
            return savePayload.data;
          }
        }
      }
    } catch (error) {
      console.error('Backup restoration failed:', error);
    }
    
    return null;
  }

  // UI Methods
  showSavingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'saving-indicator';
    indicator.innerHTML = `
      <div class="saving-content">
        <div class="saving-spinner"></div>
        <span>Saving game...</span>
        <div class="saving-warning">⚠️ Do not close this page!</div>
      </div>
    `;
    indicator.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: monospace;
      color: white;
    `;
    
    document.body.appendChild(indicator);
    
    // Add CSS for spinner
    if (!document.getElementById('saving-indicator-styles')) {
      const style = document.createElement('style');
      style.id = 'saving-indicator-styles';
      style.textContent = `
        .saving-content {
          text-align: center;
          font-size: 18px;
        }
        .saving-spinner {
          width: 40px;
          height: 40px;
          margin: 0 auto 20px;
          border: 4px solid #444;
          border-top: 4px solid #4ecdc4;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .saving-warning {
          margin-top: 15px;
          color: #ff6b6b;
          font-size: 14px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  hideSavingIndicator() {
    const indicator = document.getElementById('saving-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  showSaveMessage(message, type = 'info') {
    const uiSystem = this.game.getSystem('UISystem');
    if (uiSystem) {
      const colors = {
        success: '#4ecdc4',
        error: '#ff6b6b',
        info: '#ffffff'
      };
      uiSystem.showStatusMessage(message, 2000, colors[type] || colors.info);
    }
  }

  // Public API
  getSaveSlots() {
    const slots = [];
    for (let i = 1; i <= this.saveConfig.MAX_SAVE_SLOTS; i++) {
      const saveKey = `shadowknight_save_${i}`;
      const saveData = localStorage.getItem(saveKey);
      
      if (saveData) {
        try {
          const savePayload = JSON.parse(saveData);
          slots.push({
            slot: i,
            timestamp: savePayload.timestamp,
            valid: this.validateSavePayload(savePayload),
            playtime: savePayload.data?.playtime?.totalPlaytime || 0,
            currentRoom: savePayload.data?.gameProgress?.currentRoom || 0
          });
        } catch (error) {
          slots.push({
            slot: i,
            corrupted: true,
            error: error.message
          });
        }
      } else {
        slots.push({
          slot: i,
          empty: true
        });
      }
    }
    return slots;
  }

  deleteSave(saveSlot) {
    const saveKey = `shadowknight_save_${saveSlot}`;
    localStorage.removeItem(saveKey);
    
    // Also remove backups
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`shadowknight_backup_${saveSlot}_`)) {
        localStorage.removeItem(key);
      }
    }
  }

  // Auto-save functionality
  startAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    this.autoSaveInterval = setInterval(() => {
      if (this.canSaveAtCurrentLocation() && !this.isSaving) {
        this.saveGame(this.currentSaveSlot, false); // Silent auto-save
      }
    }, this.saveConfig.AUTO_SAVE_INTERVAL);
  }

  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }
}