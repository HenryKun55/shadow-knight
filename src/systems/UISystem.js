// --- COMPLETE AND UNABRIDGED FILE ---

export class UISystem {
  constructor() {
    this.game = null;
    this.healthFill = document.getElementById('health-fill');
    this.staminaFill = document.getElementById('stamina-fill');
    this.healthText = document.querySelector('.health-text');
    this.gameOverShown = false;
  }

  update(deltaTime) {
    const playerEntity = this.game.getEntitiesWithComponent('Player')[0];
    if (!playerEntity) return;

    const player = playerEntity.getComponent('Player');
    this.updateHealthBar(player);
    this.updateStaminaBar(player);

    if (player.isDead() && !this.gameOverShown) {
      // Updated message
      this.showStatusMessage('GAME OVER\n\nPress Space to Restart', 9999999, '#ff4757');
      this.gameOverShown = true;
    }
  }

  updateHealthBar(player) {
    const healthPercentage = (player.health / player.maxHealth) * 100;
    if (this.healthFill) {
      this.healthFill.style.width = `${healthPercentage}%`;
      if (healthPercentage > 60) this.healthFill.style.background = 'linear-gradient(90deg, #ff4757, #ff6b6b)';
      else if (healthPercentage > 30) this.healthFill.style.background = 'linear-gradient(90deg, #ffa502, #ff6348)';
      else this.healthFill.style.background = 'linear-gradient(90deg, #ff3838, #ff4757)';
    }
    if (this.healthText) {
      this.healthText.textContent = `${Math.ceil(player.health)}/${player.maxHealth}`;
    }
  }

  updateStaminaBar(player) {
    const staminaPercentage = (player.stamina / player.maxStamina) * 100;
    if (this.staminaFill) {
      this.staminaFill.style.width = `${staminaPercentage}%`;
      this.staminaFill.style.opacity = staminaPercentage < 30 ? '0.6' : '1.0';
    }
  }

  showDamageNumber(amount, x, y, color = '#ff4757') {
    const damageElement = document.createElement('div');
    damageElement.textContent = `${Math.round(amount)}`;
    damageElement.className = 'damage-number';
    damageElement.style.left = `${x}px`;
    damageElement.style.top = `${y}px`;
    damageElement.style.color = color;
    document.body.appendChild(damageElement);
    setTimeout(() => {
      if (damageElement.parentNode) {
        damageElement.parentNode.removeChild(damageElement);
      }
    }, 1000);
  }

  showStatusMessage(message, duration = 2000, color = '#ffffff') {
    const messageElement = document.createElement('div');
    messageElement.innerHTML = message.replace(/\n/g, '<br>'); // Handle newlines
    messageElement.className = 'status-message';
    messageElement.style.color = color;
    messageElement.style.whiteSpace = 'pre-wrap'; // Ensure newlines are rendered
    document.body.appendChild(messageElement);

    if (duration < 999999) {
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.style.animation = 'fadeOut 0.5s ease-in-out forwards';
          setTimeout(() => {
            if (messageElement.parentNode) {
              messageElement.parentNode.removeChild(messageElement);
            }
          }, 500);
        }
      }, duration);
    }
  }
}

if (!document.getElementById('game-animations-style')) {
  const style = document.createElement('style');
  style.id = 'game-animations-style';
  style.textContent = `
        .damage-number {
            position: absolute; font-size: 20px; font-weight: bold; pointer-events: none;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8); z-index: 1000;
            animation: floatUp 1s ease-out forwards;
        }
        .status-message {
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            font-size: 60px; font-weight: bold; text-align: center;
            text-shadow: 3px 3px 6px rgba(0,0,0,0.8); pointer-events: none;
            z-index: 1001; animation: fadeInOut 0.5s ease-in-out;
        }
        @keyframes floatUp {
            0% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-50px); }
        }
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
            100% { opacity: 1; transform: translate(-50%, -50%) scale(1.0); }
        }
        @keyframes fadeOut {
            0% { opacity: 1; }
            100% { opacity: 0; }
        }
    `;
  document.head.appendChild(style);
}
