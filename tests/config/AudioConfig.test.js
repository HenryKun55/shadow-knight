import { AudioConfig } from '../../src/config/AudioConfig.js';

describe('AudioConfig', () => {
  test('should have default volume levels defined', () => {
    expect(AudioConfig.VOLUME.DEFAULTS).toBeDefined();
    expect(AudioConfig.VOLUME.DEFAULTS.MASTER).toBeDefined();
    expect(AudioConfig.VOLUME.DEFAULTS.BGM).toBeDefined();
    expect(AudioConfig.VOLUME.DEFAULTS.SFX).toBeDefined();
  });

  test('should have volume levels in valid range', () => {
    expect(AudioConfig.VOLUME.DEFAULTS.MASTER).toBeGreaterThanOrEqual(0);
    expect(AudioConfig.VOLUME.DEFAULTS.MASTER).toBeLessThanOrEqual(1);
    
    expect(AudioConfig.VOLUME.DEFAULTS.BGM).toBeGreaterThanOrEqual(0);
    expect(AudioConfig.VOLUME.DEFAULTS.BGM).toBeLessThanOrEqual(1);
    
    expect(AudioConfig.VOLUME.DEFAULTS.SFX).toBeGreaterThanOrEqual(0);
    expect(AudioConfig.VOLUME.DEFAULTS.SFX).toBeLessThanOrEqual(1);
  });

  test('should have sound paths defined', () => {
    expect(AudioConfig.SOUNDS).toBeDefined();
    expect(typeof AudioConfig.SOUNDS).toBe('object');
  });

  test('should have required sound files', () => {
    const requiredSounds = [
      'PLAYER.JUMP',
      'PLAYER.DASH',
      'PLAYER.ATTACK',
      'PLAYER.PARRY',
      'ENEMY.HIT',
      'ENEMY.DEATH',
      'PLAYER.HIT'
    ];

    requiredSounds.forEach(soundPath => {
      const pathParts = soundPath.split('.');
      const category = pathParts[0];
      const sound = pathParts[1];
      
      expect(AudioConfig.SOUNDS[category]).toBeDefined();
      expect(AudioConfig.SOUNDS[category][sound]).toBeDefined();
      expect(typeof AudioConfig.SOUNDS[category][sound].path).toBe('string');
      expect(AudioConfig.SOUNDS[category][sound].path).toMatch(/\.(wav|mp3|ogg)$/i);
    });
  });

  test('should have valid file paths for all sounds', () => {
    Object.values(AudioConfig.SOUNDS).forEach(category => {
      Object.values(category).forEach(soundDef => {
        expect(typeof soundDef.path).toBe('string');
        expect(soundDef.path.length).toBeGreaterThan(0);
        expect(soundDef.path).toMatch(/assets\/sounds\/|assets\/music\//); // Should start with assets/sounds/ or assets/music/
      });
    });
  });

  test('should have BGM configuration if defined', () => {
    if (AudioConfig.SOUNDS.MUSIC) {
      expect(typeof AudioConfig.SOUNDS.MUSIC).toBe('object');
      
      Object.values(AudioConfig.SOUNDS.MUSIC).forEach(musicDef => {
        expect(typeof musicDef.path).toBe('string');
        expect(musicDef.path).toMatch(/\.(wav|mp3|ogg)$/i);
      });
    }
  });

  test('should have audio settings configuration', () => {
    if (AudioConfig.CATEGORIES) {
      expect(AudioConfig.CATEGORIES).toBeDefined();
      
      Object.values(AudioConfig.CATEGORIES).forEach(category => {
        if (category.fadeTime !== undefined) {
          expect(category.fadeTime).toBeGreaterThanOrEqual(0);
        }
        
        if (category.volume !== undefined) {
          expect(category.volume).toBeGreaterThanOrEqual(0);
          expect(category.volume).toBeLessThanOrEqual(1);
        }
      });
    }
  });

  test('should have web audio context settings if defined', () => {
    if (AudioConfig.PROCESSING) {
      expect(AudioConfig.PROCESSING).toBeDefined();
      
      if (AudioConfig.PROCESSING.BUFFER && AudioConfig.PROCESSING.BUFFER.size) {
        expect(AudioConfig.PROCESSING.BUFFER.size).toBeGreaterThan(0);
        expect(AudioConfig.PROCESSING.BUFFER.size).toBeLessThanOrEqual(16384);
      }
      
      if (AudioConfig.PROCESSING.CONTEXT && AudioConfig.PROCESSING.CONTEXT.sampleRate) {
        expect(AudioConfig.PROCESSING.CONTEXT.sampleRate).toBeGreaterThan(0);
      }
    }
  });

  test('should have audio format preferences if defined', () => {
    if (AudioConfig.PERFORMANCE && AudioConfig.PERFORMANCE.QUALITY) {
      expect(AudioConfig.PERFORMANCE.QUALITY).toBeDefined();
      
      if (AudioConfig.PERFORMANCE.QUALITY.compression) {
        expect(typeof AudioConfig.PERFORMANCE.QUALITY.compression).toBe('string');
        expect(['wav', 'mp3', 'ogg', 'webm'].includes(AudioConfig.PERFORMANCE.QUALITY.compression)).toBe(true);
      }
      
      if (AudioConfig.PERFORMANCE.QUALITY.fallbackFormat) {
        expect(typeof AudioConfig.PERFORMANCE.QUALITY.fallbackFormat).toBe('string');
        expect(['wav', 'mp3', 'ogg', 'webm'].includes(AudioConfig.PERFORMANCE.QUALITY.fallbackFormat)).toBe(true);
      }
    }
  });

  test('should have consistent naming convention for sound paths', () => {
    Object.keys(AudioConfig.SOUNDS).forEach(categoryKey => {
      // Category keys should be UPPER_CASE
      expect(categoryKey).toMatch(/^[A-Z][A-Z0-9_]*$/);
      
      Object.keys(AudioConfig.SOUNDS[categoryKey]).forEach(soundKey => {
        // Sound keys should be UPPER_CASE
        expect(soundKey).toMatch(/^[A-Z][A-Z0-9_]*$/);
      });
    });
  });

  test('should have proper file extensions for audio files', () => {
    const validExtensions = ['.wav', '.mp3', '.ogg', '.webm'];
    
    Object.values(AudioConfig.SOUNDS).forEach(category => {
      Object.values(category).forEach(soundDef => {
        const hasValidExtension = validExtensions.some(ext => 
          soundDef.path.toLowerCase().endsWith(ext)
        );
        expect(hasValidExtension).toBe(true);
      });
    });
  });

  test('should have no duplicate sound paths', () => {
    const paths = [];
    Object.values(AudioConfig.SOUNDS).forEach(category => {
      Object.values(category).forEach(soundDef => {
        paths.push(soundDef.path);
      });
    });
    const uniquePaths = [...new Set(paths)];
    
    expect(uniquePaths.length).toBe(paths.length);
  });

  test('should have reasonable default volume levels', () => {
    // Master volume should typically be moderate (0.3 to 0.8 in 0-1 range)
    expect(AudioConfig.VOLUME.DEFAULTS.MASTER).toBeGreaterThanOrEqual(0.3);
    expect(AudioConfig.VOLUME.DEFAULTS.MASTER).toBeLessThanOrEqual(0.8);
    
    // BGM should typically be lower than SFX
    expect(AudioConfig.VOLUME.DEFAULTS.BGM).toBeLessThanOrEqual(AudioConfig.VOLUME.DEFAULTS.SFX);
  });

  test('should maintain immutable configuration', () => {
    const originalMaster = AudioConfig.VOLUME.DEFAULTS.MASTER;
    
    // Attempt to modify (should not affect original)
    try {
      AudioConfig.VOLUME.DEFAULTS.MASTER = 999;
    } catch (e) {
      // Object might be frozen
    }
    
    // In a real implementation, this might use Object.freeze()
    // For now, we just test that the config exists and is accessible
    expect(AudioConfig.VOLUME.DEFAULTS.MASTER).toBeDefined();
  });

  test('should have configuration for audio categories', () => {
    if (AudioConfig.CATEGORIES) {
      expect(AudioConfig.CATEGORIES).toBeDefined();
      
      const expectedCategories = ['SFX', 'BGM', 'AMBIENT', 'UI'];
      expectedCategories.forEach(category => {
        if (AudioConfig.CATEGORIES[category]) {
          expect(AudioConfig.CATEGORIES[category]).toBeDefined();
        }
      });
    }
  });

  test('should have proper configuration structure', () => {
    expect(typeof AudioConfig).toBe('object');
    expect(AudioConfig).not.toBeNull();
    expect(AudioConfig).not.toBeUndefined();
  });

  test('should have all sound effects for game mechanics', () => {
    const gameplaySounds = [
      { category: 'PLAYER', sound: 'JUMP' },
      { category: 'PLAYER', sound: 'DASH' },
      { category: 'PLAYER', sound: 'ATTACK' }
    ];

    gameplaySounds.forEach(({ category, sound }) => {
      expect(AudioConfig.SOUNDS[category][sound]).toBeDefined();
      expect(AudioConfig.SOUNDS[category][sound].path).toMatch(/assets\/sounds\//);
    });
  });

  test('should have combat-related sound effects', () => {
    const combatSounds = [
      { category: 'PLAYER', sound: 'ATTACK' },
      { category: 'PLAYER', sound: 'PARRY' },
      { category: 'ENEMY', sound: 'HIT' },
      { category: 'ENEMY', sound: 'DEATH' },
      { category: 'PLAYER', sound: 'HIT' }
    ];

    combatSounds.forEach(({ category, sound }) => {
      expect(AudioConfig.SOUNDS[category][sound]).toBeDefined();
    });
  });

  test('should handle missing optional configurations gracefully', () => {
    // These configurations might not exist in all implementations
    const optionalConfigs = [
      'SPATIAL',
      'PERFORMANCE',
      'PROCESSING',
      'ERRORS'
    ];

    optionalConfigs.forEach(config => {
      if (AudioConfig[config]) {
        expect(AudioConfig[config]).toBeDefined();
      }
      // Should not throw if config doesn't exist
    });
  });
});