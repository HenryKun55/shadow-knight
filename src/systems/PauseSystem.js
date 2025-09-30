/* ===================================
   PAUSE SYSTEM - SHADOW KNIGHT
   ===================================
   Complete pause system with menu, save options, and game state management.
   Handles game pausing, pause menu, and player options.
*/

import { GameConfig } from '../config/GameConfig.js';
import { UIConstants } from '../config/UIConstants.js';

export class PauseSystem {
  constructor() {
    this.game = null;
    this.saveSystem = null;
    this.pauseConfig = GameConfig.PAUSE_SYSTEM;
    
    // Pause state
    this.isPaused = false;
    this.pauseOverlay = null;
    this.pauseMenu = null;
    this.selectedMenuItem = 0;
    
    // Menu state
    this.menuItems = this.pauseConfig.MENU_ITEMS;
    this.showingConfirmation = false;
    this.confirmationCallback = null;
    
    // Input handling
    this.lastInputTime = 0;
    this.inputDelay = 150; // Prevent rapid input
    
    this.createPauseUI();
    this.setupEventListeners();
  }

  createPauseUI() {
    // Create pause overlay
    this.pauseOverlay = document.createElement('div');
    this.pauseOverlay.id = 'pause-overlay';
    this.pauseOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: ${this.pauseConfig.OVERLAY.BACKGROUND};
      z-index: ${this.pauseConfig.OVERLAY.Z_INDEX};
      display: none;
      align-items: center;
      justify-content: center;
      transition: opacity ${this.pauseConfig.OVERLAY.TRANSITION_DURATION}ms ease-in-out;
      font-family: monospace;
      color: white;
    `;

    // Create pause menu
    this.pauseMenu = document.createElement('div');
    this.pauseMenu.id = 'pause-menu';
    this.pauseMenu.style.cssText = `
      background: rgba(20, 20, 40, 0.95);
      border: 2px solid #4ecdc4;
      border-radius: 10px;
      padding: 40px;
      min-width: 300px;
      text-align: center;
      box-shadow: 0 0 30px rgba(78, 205, 196, 0.3);
    `;

    this.pauseOverlay.appendChild(this.pauseMenu);
    document.body.appendChild(this.pauseOverlay);
    
    this.updatePauseMenu();
    this.createStyles();
  }

  createStyles() {
    if (document.getElementById('pause-system-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'pause-system-styles';
    style.textContent = `
      .pause-title {
        font-size: 32px;
        color: #4ecdc4;
        margin-bottom: 30px;
        text-shadow: 0 0 10px rgba(78, 205, 196, 0.5);
      }
      
      .pause-menu-item {
        display: block;
        padding: 12px 20px;
        margin: 8px 0;
        background: transparent;
        border: 1px solid #666;
        color: #ccc;
        font-size: 16px;
        font-family: monospace;
        cursor: pointer;
        border-radius: 5px;
        transition: all 0.2s ease;
        width: 100%;
      }
      
      .pause-menu-item:hover,
      .pause-menu-item.selected {
        background: rgba(78, 205, 196, 0.2);
        border-color: #4ecdc4;
        color: #4ecdc4;
        transform: translateX(5px);
      }
      
      .pause-menu-item:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        color: #666;
      }
      
      .pause-menu-item:disabled:hover {
        background: transparent;
        border-color: #666;
        color: #666;
        transform: none;
      }
      
      .pause-subtitle {
        font-size: 14px;
        color: #888;
        margin-bottom: 20px;
      }
      
      .pause-warning {
        font-size: 12px;
        color: #ff6b6b;
        margin-top: 20px;
        font-style: italic;
      }
      
      .confirmation-dialog {
        background: rgba(40, 20, 20, 0.95);
        border: 2px solid #ff6b6b;
        border-radius: 8px;
        padding: 20px;
        margin-top: 20px;
      }
      
      .confirmation-title {
        color: #ff6b6b;
        font-size: 18px;
        margin-bottom: 15px;
      }
      
      .confirmation-buttons {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 15px;
      }
      
      .confirmation-button {
        padding: 8px 16px;
        background: transparent;
        border: 1px solid #666;
        color: #ccc;
        font-family: monospace;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s ease;
      }
      
      .confirmation-button:hover,
      .confirmation-button.selected {
        border-color: #ff6b6b;
        color: #ff6b6b;
      }
      
      .playtime-display {
        font-size: 12px;
        color: #888;
        margin-bottom: 15px;
      }
      
      .save-indicator {
        color: #4ecdc4;
        font-size: 14px;
        margin-top: 10px;
      }
    `;
    document.head.appendChild(style);
  }

  setupEventListeners() {
    document.addEventListener('keydown', (event) => {
      if (this.isPaused) {
        this.handlePauseInput(event);
      } else {
        // Check for pause key
        if (this.pauseConfig.KEYS.PAUSE.includes(event.code)) {
          event.preventDefault();
          this.pause();
        }
      }
    });
  }

  pause() {
    if (this.isPaused) return;
    
    this.isPaused = true;
    this.selectedMenuItem = 0;
    
    // Pause the game
    if (this.game) {
      this.game.isPaused = true;
    }
    
    // Show pause overlay
    this.pauseOverlay.style.display = 'flex';
    this.updatePauseMenu();
    
    // Stop auto-save during pause
    if (this.saveSystem) {
      this.saveSystem.stopAutoSave();
    }
    
    console.log('Game paused');
  }

  resume() {
    if (!this.isPaused) return;
    
    this.isPaused = false;
    this.showingConfirmation = false;
    
    // Resume the game
    if (this.game) {
      this.game.isPaused = false;
    }
    
    // Hide pause overlay
    this.pauseOverlay.style.display = 'none';
    
    // Restart auto-save
    if (this.saveSystem) {
      this.saveSystem.startAutoSave();
    }
    
    console.log('Game resumed');
  }

  handlePauseInput(event) {
    const currentTime = Date.now();
    if (currentTime - this.lastInputTime < this.inputDelay) return;
    
    event.preventDefault();
    this.lastInputTime = currentTime;
    
    if (this.showingConfirmation) {
      this.handleConfirmationInput(event);
      return;
    }
    
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.selectedMenuItem = Math.max(0, this.selectedMenuItem - 1);
        this.updatePauseMenu();
        break;
        
      case 'ArrowDown':
      case 'KeyS':
        this.selectedMenuItem = Math.min(this.getAvailableMenuItems().length - 1, this.selectedMenuItem + 1);
        this.updatePauseMenu();
        break;
        
      case 'Enter':
      case 'Space':
        this.selectMenuItem();
        break;
        
      case 'Escape':
        if (this.pauseConfig.KEYS.PAUSE.includes('Escape')) {
          this.resume();
        }
        break;
    }
  }

  handleConfirmationInput(event) {
    switch (event.code) {
      case 'Enter':
      case 'KeyY':
        if (this.confirmationCallback) {
          this.confirmationCallback(true);
        }
        break;
        
      case 'Escape':
      case 'KeyN':
        if (this.confirmationCallback) {
          this.confirmationCallback(false);
        }
        break;
    }
  }

  selectMenuItem() {
    const availableItems = this.getAvailableMenuItems();
    const selectedItem = availableItems[this.selectedMenuItem];
    
    if (!selectedItem) return;
    
    switch (selectedItem.action) {
      case 'resume':
        this.resume();
        break;
        
      case 'save':
        this.handleSave();
        break;
        
      case 'settings':
        this.openSettings();
        break;
        
      case 'mainMenu':
        this.confirmMainMenu();
        break;
    }
  }

  async handleSave() {
    if (!this.saveSystem) {
      this.showMessage('Save system not available!', 'error');
      return;
    }
    
    const success = await this.saveSystem.saveGame();
    if (success) {
      this.updatePauseMenu(); // Refresh menu to show save time
    }
  }

  openSettings() {
    // Toggle settings modal
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
      settingsModal.classList.toggle('hidden');
    }
  }

  confirmMainMenu() {
    this.showConfirmation(
      'Return to Main Menu?',
      'Any unsaved progress will be lost!',
      (confirmed) => {
        if (confirmed) {
          this.returnToMainMenu();
        } else {
          this.hideConfirmation();
        }
      }
    );
  }

  returnToMainMenu() {
    // Stop auto-save
    if (this.saveSystem) {
      this.saveSystem.stopAutoSave();
    }
    
    // Reset game state
    this.resume();
    
    // Show main menu
    const mainMenu = document.getElementById('main-menu');
    const uiOverlay = document.getElementById('ui-overlay');
    
    if (mainMenu) mainMenu.classList.remove('hidden');
    if (uiOverlay) uiOverlay.classList.add('hidden');
    
    // Reset game
    if (this.game) {
      this.game.reset();
    }
  }

  showConfirmation(title, message, callback) {
    this.showingConfirmation = true;
    this.confirmationCallback = callback;
    this.updatePauseMenu();
  }

  hideConfirmation() {
    this.showingConfirmation = false;
    this.confirmationCallback = null;
    this.updatePauseMenu();
  }

  updatePauseMenu() {
    if (!this.pauseMenu) return;
    
    let menuHTML = `
      <div class="pause-title">GAME PAUSED</div>
    `;
    
    // Add playtime if available
    if (this.saveSystem) {
      const playtime = this.formatPlaytime(this.saveSystem.statistics.totalPlaytime);
      menuHTML += `<div class="playtime-display">Playtime: ${playtime}</div>`;
    }
    
    if (this.showingConfirmation) {
      menuHTML += this.createConfirmationDialog();
    } else {
      menuHTML += this.createMainMenu();
    }
    
    this.pauseMenu.innerHTML = menuHTML;
  }

  createMainMenu() {
    const availableItems = this.getAvailableMenuItems();
    let menuHTML = '';
    
    availableItems.forEach((item, index) => {
      const isSelected = index === this.selectedMenuItem;
      const isDisabled = this.isMenuItemDisabled(item);
      
      menuHTML += `
        <button class="pause-menu-item ${isSelected ? 'selected' : ''}" 
                ${isDisabled ? 'disabled' : ''}>
          ${item.text}
        </button>
      `;
    });
    
    // Add save status if in rest area
    if (this.canSave()) {
      const lastSaveTime = this.getLastSaveTime();
      if (lastSaveTime) {
        menuHTML += `<div class="save-indicator">Last saved: ${lastSaveTime}</div>`;
      }
    } else {
      menuHTML += `<div class="pause-warning">Save only available at rest areas</div>`;
    }
    
    menuHTML += `<div class="pause-subtitle">Use arrow keys to navigate, Enter to select</div>`;
    
    return menuHTML;
  }

  createConfirmationDialog() {
    return `
      <div class="confirmation-dialog">
        <div class="confirmation-title">Return to Main Menu?</div>
        <div>Any unsaved progress will be lost!</div>
        <div class="confirmation-buttons">
          <button class="confirmation-button">Press Y to confirm</button>
          <button class="confirmation-button">Press N to cancel</button>
        </div>
      </div>
    `;
  }

  getAvailableMenuItems() {
    return this.menuItems.filter(item => {
      // Filter items based on current game state
      return true; // All items are currently available
    });
  }

  isMenuItemDisabled(item) {
    if (item.requiresRestArea && !this.canSave()) {
      return true;
    }
    
    return false;
  }

  canSave() {
    return this.saveSystem ? this.saveSystem.canSaveAtCurrentLocation() : false;
  }

  getLastSaveTime() {
    if (!this.saveSystem || !this.saveSystem.lastSaveTime) return null;
    
    const lastSave = new Date(this.saveSystem.lastSaveTime);
    return lastSave.toLocaleTimeString();
  }

  formatPlaytime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  showMessage(message, type = 'info') {
    const uiSystem = this.game?.getSystem('UISystem');
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
  toggle() {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  setPauseEnabled(enabled) {
    // Can be used to disable pausing during cutscenes, etc.
    this.pauseEnabled = enabled;
  }

  // Integration methods
  setSaveSystem(saveSystem) {
    this.saveSystem = saveSystem;
  }

  setGame(game) {
    this.game = game;
  }
}