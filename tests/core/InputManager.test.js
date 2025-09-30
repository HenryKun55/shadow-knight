import { InputManager } from '../../src/core/InputManager.js';

describe('InputManager', () => {
  let inputManager;
  let mockCanvas;

  beforeEach(() => {
    // Mock canvas
    mockCanvas = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      getBoundingClientRect: jest.fn(() => ({
        left: 0,
        top: 0,
        width: 1280,
        height: 720
      }))
    };

    // Mock window
    global.window = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };

    inputManager = new InputManager(mockCanvas);
  });

  afterEach(() => {
    inputManager.destroy();
  });

  test('should create InputManager instance', () => {
    expect(inputManager).toBeDefined();
    expect(inputManager.keys).toBeDefined();
    expect(inputManager.mouse).toBeDefined();
  });

  test('should initialize with empty key states', () => {
    expect(Object.keys(inputManager.keys).length).toBe(0);
    expect(inputManager.mouse.x).toBe(0);
    expect(inputManager.mouse.y).toBe(0);
    expect(inputManager.mouse.leftButton).toBe(false);
    expect(inputManager.mouse.rightButton).toBe(false);
  });

  test('should register event listeners on creation', () => {
    expect(global.window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(global.window.addEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
    expect(mockCanvas.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(mockCanvas.addEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function));
    expect(mockCanvas.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
  });

  test('should handle key down events', () => {
    const keyEvent = new KeyboardEvent('keydown', { code: 'KeyA' });
    
    inputManager.handleKeyDown(keyEvent);
    
    expect(inputManager.keys['KeyA']).toBe(true);
  });

  test('should handle key up events', () => {
    // First press key
    inputManager.keys['KeyA'] = true;
    
    const keyEvent = new KeyboardEvent('keyup', { code: 'KeyA' });
    inputManager.handleKeyUp(keyEvent);
    
    expect(inputManager.keys['KeyA']).toBe(false);
  });

  test('should prevent default for movement keys', () => {
    const keyEvent = {
      code: 'Space',
      preventDefault: jest.fn()
    };
    
    inputManager.handleKeyDown(keyEvent);
    
    expect(keyEvent.preventDefault).toHaveBeenCalled();
  });

  test('should handle mouse down events', () => {
    const mouseEvent = {
      button: 0, // Left button
      clientX: 100,
      clientY: 200,
      preventDefault: jest.fn()
    };
    
    inputManager.handleMouseDown(mouseEvent);
    
    expect(inputManager.mouse.leftButton).toBe(true);
    expect(mouseEvent.preventDefault).toHaveBeenCalled();
  });

  test('should handle mouse up events', () => {
    // First press button
    inputManager.mouse.leftButton = true;
    
    const mouseEvent = {
      button: 0, // Left button
      clientX: 100,
      clientY: 200,
      preventDefault: jest.fn()
    };
    
    inputManager.handleMouseUp(mouseEvent);
    
    expect(inputManager.mouse.leftButton).toBe(false);
  });

  test('should handle mouse move events', () => {
    const mouseEvent = {
      clientX: 150,
      clientY: 250
    };
    
    inputManager.handleMouseMove(mouseEvent);
    
    expect(inputManager.mouse.x).toBe(150);
    expect(inputManager.mouse.y).toBe(250);
  });

  test('should check if key is pressed', () => {
    inputManager.keys['KeyA'] = true;
    inputManager.keys['KeyB'] = false;
    
    expect(inputManager.isKeyPressed('KeyA')).toBe(true);
    expect(inputManager.isKeyPressed('KeyB')).toBe(false);
    expect(inputManager.isKeyPressed('KeyC')).toBe(false);
  });

  test('should check if any key in array is pressed', () => {
    inputManager.keys['KeyA'] = true;
    inputManager.keys['KeyB'] = false;
    
    expect(inputManager.isAnyKeyPressed(['KeyA', 'KeyB'])).toBe(true);
    expect(inputManager.isAnyKeyPressed(['KeyB', 'KeyC'])).toBe(false);
    expect(inputManager.isAnyKeyPressed([])).toBe(false);
  });

  test('should get mouse position', () => {
    inputManager.mouse.x = 300;
    inputManager.mouse.y = 400;
    
    const position = inputManager.getMousePosition();
    
    expect(position.x).toBe(300);
    expect(position.y).toBe(400);
  });

  test('should check mouse button states', () => {
    inputManager.mouse.leftButton = true;
    inputManager.mouse.rightButton = false;
    
    expect(inputManager.isMousePressed(0)).toBe(true);
    expect(inputManager.isMousePressed(2)).toBe(false);
  });

  test('should clear input state', () => {
    inputManager.keys['KeyA'] = true;
    inputManager.mouse.leftButton = true;
    
    inputManager.clearState();
    
    expect(inputManager.keys['KeyA']).toBe(false);
    expect(inputManager.mouse.leftButton).toBe(false);
  });

  test('should remove event listeners on destroy', () => {
    inputManager.destroy();
    
    expect(global.window.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(global.window.removeEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
    expect(mockCanvas.removeEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(mockCanvas.removeEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function));
    expect(mockCanvas.removeEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
  });

  test('should handle right mouse button', () => {
    const mouseEvent = {
      button: 2, // Right button
      clientX: 100,
      clientY: 200,
      preventDefault: jest.fn()
    };
    
    inputManager.handleMouseDown(mouseEvent);
    expect(inputManager.mouse.rightButton).toBe(true);
    
    inputManager.handleMouseUp(mouseEvent);
    expect(inputManager.mouse.rightButton).toBe(false);
  });

  test('should handle multiple keys pressed simultaneously', () => {
    inputManager.handleKeyDown({ code: 'KeyA' });
    inputManager.handleKeyDown({ code: 'KeyB' });
    inputManager.handleKeyDown({ code: 'Space' });
    
    expect(inputManager.keys['KeyA']).toBe(true);
    expect(inputManager.keys['KeyB']).toBe(true);
    expect(inputManager.keys['Space']).toBe(true);
  });
});