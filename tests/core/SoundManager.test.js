import { SoundManager } from '../../src/core/SoundManager.js';

describe('SoundManager', () => {
  let soundManager;

  beforeEach(() => {
    // Mock localStorage
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn()
    };

    soundManager = new SoundManager();
  });

  test('should create SoundManager instance', () => {
    expect(soundManager).toBeDefined();
    expect(soundManager.sounds).toBeDefined();
    expect(soundManager.masterVolume).toBe(50);
    expect(soundManager.bgmVolume).toBe(30);
    expect(soundManager.sfxVolume).toBe(100);
  });

  test('should load volume settings from localStorage', () => {
    global.localStorage.getItem.mockImplementation((key) => {
      switch (key) {
        case 'shadow-knight-master-volume': return '75';
        case 'shadow-knight-bgm-volume': return '60';
        case 'shadow-knight-sfx-volume': return '90';
        default: return null;
      }
    });

    const sm = new SoundManager();
    
    expect(sm.masterVolume).toBe(75);
    expect(sm.bgmVolume).toBe(60);
    expect(sm.sfxVolume).toBe(90);
  });

  test('should use default volumes when localStorage is empty', () => {
    global.localStorage.getItem.mockReturnValue(null);
    
    const sm = new SoundManager();
    
    expect(sm.masterVolume).toBe(50);
    expect(sm.bgmVolume).toBe(30);
    expect(sm.sfxVolume).toBe(100);
  });

  test('should set master volume and save to localStorage', () => {
    soundManager.setMasterVolume(80);
    
    expect(soundManager.masterVolume).toBe(80);
    expect(global.localStorage.setItem).toHaveBeenCalledWith('shadow-knight-master-volume', '80');
  });

  test('should clamp master volume to 0-100 range', () => {
    soundManager.setMasterVolume(-10);
    expect(soundManager.masterVolume).toBe(0);
    
    soundManager.setMasterVolume(150);
    expect(soundManager.masterVolume).toBe(100);
  });

  test('should set BGM volume and save to localStorage', () => {
    soundManager.setBGMVolume(70);
    
    expect(soundManager.bgmVolume).toBe(70);
    expect(global.localStorage.setItem).toHaveBeenCalledWith('shadow-knight-bgm-volume', '70');
  });

  test('should set SFX volume and save to localStorage', () => {
    soundManager.setSFXVolume(85);
    
    expect(soundManager.sfxVolume).toBe(85);
    expect(global.localStorage.setItem).toHaveBeenCalledWith('shadow-knight-sfx-volume', '85');
  });

  test('should calculate final volume correctly', () => {
    soundManager.setMasterVolume(50); // 0.5
    soundManager.setSFXVolume(80);    // 0.8
    
    const finalVolume = soundManager.getFinalVolume('sfx');
    expect(finalVolume).toBeCloseTo(0.4); // 0.5 * 0.8
  });

  test('should calculate BGM final volume correctly', () => {
    soundManager.setMasterVolume(60); // 0.6
    soundManager.setBGMVolume(50);    // 0.5
    
    const finalVolume = soundManager.getFinalVolume('bgm');
    expect(finalVolume).toBeCloseTo(0.3); // 0.6 * 0.5
  });

  test('should preload sounds', async () => {
    const mockAudio = {
      load: jest.fn(),
      addEventListener: jest.fn((event, callback) => {
        if (event === 'canplaythrough') {
          setTimeout(callback, 10); // Simulate loading
        }
      })
    };

    global.Audio = jest.fn(() => mockAudio);

    await soundManager.preload();
    
    expect(global.Audio).toHaveBeenCalled();
    expect(Object.keys(soundManager.sounds).length).toBeGreaterThan(0);
  });

  test('should play sound with correct volume', () => {
    const mockAudio = {
      currentTime: 0,
      volume: 1,
      play: jest.fn().mockResolvedValue(),
      cloneNode: jest.fn().mockReturnThis()
    };

    soundManager.sounds['jump'] = mockAudio;
    soundManager.setMasterVolume(50);
    soundManager.setSFXVolume(80);

    soundManager.play('jump');

    expect(mockAudio.currentTime).toBe(0);
    expect(mockAudio.volume).toBeCloseTo(0.4); // 0.5 * 0.8
    expect(mockAudio.play).toHaveBeenCalled();
  });

  test('should handle playing non-existent sound gracefully', () => {
    // Should not throw
    expect(() => {
      soundManager.play('nonexistent');
    }).not.toThrow();
  });

  test('should handle audio play promise rejection', () => {
    const mockAudio = {
      currentTime: 0,
      volume: 1,
      play: jest.fn().mockRejectedValue(new Error('Play failed')),
      cloneNode: jest.fn().mockReturnThis()
    };

    soundManager.sounds['test'] = mockAudio;

    // Should not throw
    expect(() => {
      soundManager.play('test');
    }).not.toThrow();
  });

  test('should stop all sounds', () => {
    const mockAudio1 = {
      pause: jest.fn(),
      currentTime: 0
    };
    const mockAudio2 = {
      pause: jest.fn(),
      currentTime: 0
    };

    soundManager.sounds['sound1'] = mockAudio1;
    soundManager.sounds['sound2'] = mockAudio2;

    soundManager.stopAll();

    expect(mockAudio1.pause).toHaveBeenCalled();
    expect(mockAudio2.pause).toHaveBeenCalled();
    expect(mockAudio1.currentTime).toBe(0);
    expect(mockAudio2.currentTime).toBe(0);
  });

  test('should handle volume changes for different sound types', () => {
    soundManager.setMasterVolume(100);
    
    expect(soundManager.getFinalVolume('sfx')).toBeCloseTo(1.0); // 100% master * 100% sfx
    expect(soundManager.getFinalVolume('bgm')).toBeCloseTo(0.3); // 100% master * 30% bgm
  });
});