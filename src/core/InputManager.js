export class InputManager {
    constructor() {
        this.keys = new Set();
        this.keysPressed = new Set();
        this.keysReleased = new Set();
        this.mouse = {
            x: 0,
            y: 0,
            buttons: new Set(),
            buttonsPressed: new Set(),
            buttonsReleased: new Set()
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.keys.has(e.code)) {
                this.keysPressed.add(e.code);
            }
            this.keys.add(e.code);
            // e.preventDefault(); // Removed to allow arrow keys to be registered
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
            this.keysReleased.add(e.code);
            // e.preventDefault(); // Removed to allow arrow keys to be registered
        });
        
        document.addEventListener('mousemove', (e) => {
            const canvas = document.getElementById('game-canvas');
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
            this.mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
        });
        
        document.addEventListener('mousedown', (e) => {
            if (!this.mouse.buttons.has(e.button)) {
                this.mouse.buttonsPressed.add(e.button);
            }
            this.mouse.buttons.add(e.button);
            e.preventDefault();
        });
        
        document.addEventListener('mouseup', (e) => {
            this.mouse.buttons.delete(e.button);
            this.mouse.buttonsReleased.add(e.button);
            e.preventDefault();
        });
        
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    isKeyDown(keyCode) {
        return this.keys.has(keyCode);
    }
    
    isKeyPressed(keyCode) {
        return this.keysPressed.has(keyCode);
    }
    
    isKeyReleased(keyCode) {
        return this.keysReleased.has(keyCode);
    }
    
    isMouseButtonDown(button) {
        return this.mouse.buttons.has(button);
    }
    
    isMouseButtonPressed(button) {
        return this.mouse.buttonsPressed.has(button);
    }
    
    isMouseButtonReleased(button) {
        return this.mouse.buttonsReleased.has(button);
    }
    
    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }
    
    // Call this at the end of each frame to clear pressed/released states
    update() {
        this.keysPressed.clear();
        this.keysReleased.clear();
        this.mouse.buttonsPressed.clear();
        this.mouse.buttonsReleased.clear();
    }
}