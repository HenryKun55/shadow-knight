// Jest setup file for Shadow Knight game testing

// Mock HTMLCanvasElement
Object.defineProperty(global.HTMLCanvasElement.prototype, 'style', {
  value: {},
  writable: true
});

Object.defineProperty(global.HTMLCanvasElement.prototype, 'width', {
  value: 1280,
  writable: true
});

Object.defineProperty(global.HTMLCanvasElement.prototype, 'height', {
  value: 720,
  writable: true
});

// Mock Canvas and WebGL contexts
global.HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
  if (contextType === '2d') {
    const mockGradient = {
      addColorStop: jest.fn()
    };
    
    return {
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(() => ({ data: new Array(4) })),
      putImageData: jest.fn(),
      createImageData: jest.fn(() => ({ data: new Array(4) })),
      createLinearGradient: jest.fn(() => mockGradient),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      fillText: jest.fn(),
      measureText: jest.fn(() => ({ width: 100 })),
      scale: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      strokeRect: jest.fn(),
      arc: jest.fn(),
      font: '16px Arial',
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      textAlign: 'left',
      textBaseline: 'top',
      imageSmoothingEnabled: false,
      canvas: {
        width: 1280,
        height: 720,
        style: {}
      }
    };
  }
  return null;
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
  return setTimeout(callback, 16); // Simulate 60fps
});

// Mock cancelAnimationFrame
global.cancelAnimationFrame = jest.fn((id) => {
  clearTimeout(id);
});

// Mock Audio API
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  load: jest.fn(),
  volume: 1,
  currentTime: 0,
  duration: 100,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
}));

// Mock performance.now()
global.performance.now = jest.fn(() => Date.now());

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};
global.localStorage = localStorageMock;

// Mock document and DOM methods
global.document.createElement = jest.fn((tagName) => {
  const element = {
    style: {},
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getAttribute: jest.fn(),
    setAttribute: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(() => []),
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(() => false),
      toggle: jest.fn()
    },
    innerHTML: '',
    textContent: '',
    parentNode: null,
    id: '',
    width: 1280,
    height: 720
  };
  
  if (tagName === 'canvas') {
    element.getContext = global.HTMLCanvasElement.prototype.getContext;
  }
  
  return element;
});

// Mock additional body methods if needed
if (global.document.body) {
  global.document.body.appendChild = jest.fn();
  global.document.body.removeChild = jest.fn();
}

global.document.querySelector = jest.fn();
global.document.querySelectorAll = jest.fn(() => []);
global.document.getElementById = jest.fn();

// Mock window methods
global.window.addEventListener = jest.fn();
global.window.removeEventListener = jest.fn();
global.window.innerWidth = 1920;
global.window.innerHeight = 1080;

// Suppress console.log during tests (optional)
// global.console.log = jest.fn();