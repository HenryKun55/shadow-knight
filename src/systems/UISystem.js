/* ===================================
   UI SYSTEM - SHADOW KNIGHT
   ===================================
   UI system using centralized GameConfig and UIConstants for all interface elements.
   All UI colors, thresholds, and styling reference configuration.
*/

import { GameConfig } from '../config/GameConfig.js';
import { UIConstants } from '../config/UIConstants.js';

export class UISystem {
  constructor() {
    this.game = null;
    
    // Cache UI elements using UIConstants
    this.healthFill = UIConstants.UTILS.safeQuerySelector(UIConstants.SELECTORS.HEALTH_FILL);
    this.staminaFill = UIConstants.UTILS.safeQuerySelector(UIConstants.SELECTORS.STAMINA_FILL);
    this.healthText = UIConstants.UTILS.safeQuerySelector(UIConstants.SELECTORS.HEALTH_TEXT);
    this.gameOverShown = false;
    
    // Cache UI configuration for performance
    this.uiConfig = GameConfig.UI;
    this.healthColors = this.uiConfig.HEALTH_BAR.COLORS;
    this.thresholds = this.uiConfig.HEALTH_BAR.THRESHOLDS;
  }

  update(deltaTime) {
    const playerEntity = this.game.getEntitiesWithComponent('Player')[0];
    if (!playerEntity) return;

    const player = playerEntity.getComponent('Player');
    this.updateHealthBar(player);
    this.updateStaminaBar(player);

    if (player.isDead() && !this.gameOverShown) {
      // Show game over message using configuration
      this.showStatusMessage(
        UIConstants.MESSAGES.GAME_OVER, 
        this.uiConfig.MESSAGES.PERMANENT_DURATION, 
        this.uiConfig.MESSAGES.GAME_OVER_COLOR
      );
      this.gameOverShown = true;
    }
  }

  updateHealthBar(player) {
    const healthPercentage = (player.health / player.maxHealth) * 100;
    if (this.healthFill) {
      this.healthFill.style.width = `${healthPercentage}%`;
      
      // Apply health bar colors based on configuration thresholds
      if (healthPercentage > this.thresholds.GOOD) {
        this.healthFill.style.background = this.healthColors.GOOD;
      } else if (healthPercentage > this.thresholds.WARNING) {
        this.healthFill.style.background = this.healthColors.WARNING;
      } else {
        this.healthFill.style.background = this.healthColors.CRITICAL;
      }
    }
    if (this.healthText) {
      this.healthText.textContent = `${Math.ceil(player.health)}/${player.maxHealth}`;
    }
  }

  updateStaminaBar(player) {
    const staminaPercentage = (player.stamina / player.maxStamina) * 100;
    if (this.staminaFill) {
      this.staminaFill.style.width = `${staminaPercentage}%`;
      
      // Apply stamina opacity based on configuration threshold
      const lowStaminaThreshold = this.uiConfig.STAMINA_BAR.LOW_THRESHOLD;
      const lowOpacity = this.uiConfig.STAMINA_BAR.LOW_OPACITY;
      this.staminaFill.style.opacity = staminaPercentage < lowStaminaThreshold ? lowOpacity : '1.0';
    }
  }

  showDamageNumber(amount, x, y, color = null) {
    const damageElement = document.createElement('div');
    damageElement.textContent = `${Math.round(amount)}`;
    damageElement.className = UIConstants.CLASSES.DAMAGE_NUMBER;
    damageElement.style.left = `${x}px`;
    damageElement.style.top = `${y}px`;
    damageElement.style.color = color || this.uiConfig.DAMAGE_NUMBERS.DEFAULT_COLOR;
    document.body.appendChild(damageElement);
    
    // Use configured duration
    const duration = this.uiConfig.DAMAGE_NUMBERS.DURATION;
    setTimeout(() => {
      if (damageElement.parentNode) {
        damageElement.parentNode.removeChild(damageElement);
      }
    }, duration);
  }

  showStatusMessage(message, duration = null, color = null) {
    const messageElement = document.createElement('div');
    messageElement.innerHTML = message.replace(/\n/g, '<br>'); // Handle newlines
    messageElement.className = UIConstants.CLASSES.STATUS_MESSAGE;
    messageElement.style.color = color || this.uiConfig.MESSAGES.DEFAULT_COLOR;
    messageElement.style.whiteSpace = 'pre-wrap'; // Ensure newlines are rendered
    document.body.appendChild(messageElement);

    // Use configured durations
    const effectiveDuration = duration || this.uiConfig.MESSAGES.DEFAULT_DURATION;
    const permanentThreshold = this.uiConfig.MESSAGES.PERMANENT_THRESHOLD;
    const fadeOutDuration = this.uiConfig.ANIMATION.FADE_OUT_DURATION;
    
    if (effectiveDuration < permanentThreshold) {
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.style.animation = `${UIConstants.ANIMATIONS.FADE_OUT} ${fadeOutDuration}ms ease-in-out forwards`;
          setTimeout(() => {
            if (messageElement.parentNode) {
              messageElement.parentNode.removeChild(messageElement);
            }
          }, fadeOutDuration);
        }
      }, effectiveDuration);
    }
  }
}

// Initialize dynamic UI styles using configuration
if (!document.getElementById(UIConstants.STYLE_IDS.GAME_ANIMATIONS)) {
  const style = document.createElement('style');
  style.id = UIConstants.STYLE_IDS.GAME_ANIMATIONS;
  
  // Build styles using configuration values
  const damageConfig = GameConfig.UI.DAMAGE;
  const messageConfig = GameConfig.UI.MESSAGES;
  const animConfig = GameConfig.UI.ANIMATION;
  
  style.textContent = `
        .${UIConstants.CLASSES.DAMAGE_NUMBER} {
            position: absolute; 
            font-size: ${damageConfig.FONT_SIZE}; 
            font-weight: ${damageConfig.FONT_WEIGHT}; 
            pointer-events: none;
            text-shadow: ${damageConfig.TEXT_SHADOW}; 
            z-index: ${damageConfig.Z_INDEX};
            animation: ${UIConstants.ANIMATIONS.FLOAT_UP} ${damageConfig.DURATION}ms ease-out forwards;
        }
        .${UIConstants.CLASSES.STATUS_MESSAGE} {
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            font-size: ${messageConfig.FONT_SIZE}; 
            font-weight: ${messageConfig.FONT_WEIGHT}; 
            text-align: center;
            text-shadow: ${messageConfig.TEXT_SHADOW}; 
            pointer-events: none;
            z-index: ${messageConfig.Z_INDEX}; 
            animation: ${UIConstants.ANIMATIONS.FADE_IN_OUT} ${animConfig.FADE_IN_DURATION}ms ease-in-out;
        }
        @keyframes ${UIConstants.ANIMATIONS.FLOAT_UP} {
            0% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(${animConfig.FLOAT_DISTANCE}); }
        }
        @keyframes ${UIConstants.ANIMATIONS.FADE_IN_OUT} {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(${animConfig.SCALE_START}); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(${animConfig.SCALE_PEAK}); }
            100% { opacity: 1; transform: translate(-50%, -50%) scale(${animConfig.SCALE_END}); }
        }
        @keyframes ${UIConstants.ANIMATIONS.FADE_OUT} {
            0% { opacity: 1; }
            100% { opacity: 0; }
        }
    `;
  document.head.appendChild(style);
}
