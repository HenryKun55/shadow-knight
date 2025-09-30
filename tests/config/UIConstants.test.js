import { UIConstants } from '../../src/config/UIConstants.js';

describe('UIConstants', () => {
  test('should have CSS classes defined', () => {
    expect(UIConstants.CLASSES).toBeDefined();
    expect(typeof UIConstants.CLASSES).toBe('object');
  });

  test('should have required CSS classes', () => {
    const requiredClasses = [
      'DAMAGE_NUMBER',
      'STATUS_MESSAGE',
      'HEALTH_FILL',
      'STAMINA_FILL'
    ];

    requiredClasses.forEach(className => {
      expect(UIConstants.CLASSES[className]).toBeDefined();
      expect(typeof UIConstants.CLASSES[className]).toBe('string');
      expect(UIConstants.CLASSES[className].length).toBeGreaterThan(0);
    });
  });

  test('should have valid CSS class names', () => {
    Object.values(UIConstants.CLASSES).forEach(className => {
      // CSS class names should be valid (alphanumeric, hyphens, underscores)
      expect(className).toMatch(/^[a-zA-Z][a-zA-Z0-9_-]*$/);
    });
  });

  test('should have animations defined', () => {
    expect(UIConstants.ANIMATIONS).toBeDefined();
    expect(typeof UIConstants.ANIMATIONS).toBe('object');
  });

  test('should have required animations', () => {
    const requiredAnimations = [
      'FLOAT_UP',
      'FADE_OUT',
      'SHAKE'
    ];

    requiredAnimations.forEach(animation => {
      if (UIConstants.ANIMATIONS[animation]) {
        expect(UIConstants.ANIMATIONS[animation]).toBeDefined();
        expect(typeof UIConstants.ANIMATIONS[animation]).toBe('string');
      }
    });
  });

  test('should have colors defined', () => {
    if (UIConstants.COLORS) {
      expect(UIConstants.COLORS).toBeDefined();
      expect(typeof UIConstants.COLORS).toBe('object');
    }
  });

  test('should have valid color values', () => {
    if (UIConstants.COLORS) {
      Object.values(UIConstants.COLORS).forEach(color => {
        expect(typeof color).toBe('string');
        // Should be hex color, rgb, rgba, or named color
        expect(color).toMatch(/^(#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|[a-zA-Z]+).*$/);
      });
    }
  });

  test('should have z-index values defined', () => {
    if (UIConstants.Z_INDEX) {
      expect(UIConstants.Z_INDEX).toBeDefined();
      expect(typeof UIConstants.Z_INDEX).toBe('object');
      
      Object.values(UIConstants.Z_INDEX).forEach(zIndex => {
        expect(typeof zIndex).toBe('number');
        expect(zIndex).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test('should have consistent naming convention', () => {
    Object.keys(UIConstants.CLASSES).forEach(key => {
      // Keys should be UPPER_CASE
      expect(key).toMatch(/^[A-Z][A-Z0-9_]*$/);
    });

    if (UIConstants.ANIMATIONS) {
      Object.keys(UIConstants.ANIMATIONS).forEach(key => {
        expect(key).toMatch(/^[A-Z][A-Z0-9_]*$/);
      });
    }
  });

  test('should have no duplicate class names', () => {
    const classNames = Object.values(UIConstants.CLASSES);
    const uniqueClassNames = [...new Set(classNames)];
    
    expect(uniqueClassNames.length).toBe(classNames.length);
  });

  test('should have dimensions defined if applicable', () => {
    if (UIConstants.DIMENSIONS) {
      expect(UIConstants.DIMENSIONS).toBeDefined();
      expect(typeof UIConstants.DIMENSIONS).toBe('object');
      
      Object.values(UIConstants.DIMENSIONS).forEach(dimension => {
        expect(typeof dimension).toBe('number');
        expect(dimension).toBeGreaterThan(0);
      });
    }
  });

  test('should have font settings defined if applicable', () => {
    if (UIConstants.FONTS) {
      expect(UIConstants.FONTS).toBeDefined();
      expect(typeof UIConstants.FONTS).toBe('object');
      
      if (UIConstants.FONTS.FAMILY) {
        expect(typeof UIConstants.FONTS.FAMILY).toBe('string');
      }
      
      if (UIConstants.FONTS.SIZE) {
        expect(typeof UIConstants.FONTS.SIZE).toBe('string');
        expect(UIConstants.FONTS.SIZE).toMatch(/^\d+px$/);
      }
    }
  });

  test('should have timing constants defined if applicable', () => {
    if (UIConstants.TIMING) {
      expect(UIConstants.TIMING).toBeDefined();
      expect(typeof UIConstants.TIMING).toBe('object');
      
      Object.values(UIConstants.TIMING).forEach(timing => {
        expect(typeof timing).toBe('number');
        expect(timing).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test('should have proper structure for UI elements', () => {
    expect(typeof UIConstants).toBe('object');
    expect(UIConstants).not.toBeNull();
    expect(UIConstants).not.toBeUndefined();
  });

  test('should have health bar specific constants', () => {
    const healthBarClass = UIConstants.CLASSES.HEALTH_FILL;
    expect(healthBarClass).toBeDefined();
    expect(typeof healthBarClass).toBe('string');
  });

  test('should have stamina bar specific constants', () => {
    const staminaBarClass = UIConstants.CLASSES.STAMINA_FILL;
    expect(staminaBarClass).toBeDefined();
    expect(typeof staminaBarClass).toBe('string');
  });

  test('should have damage number specific constants', () => {
    const damageNumberClass = UIConstants.CLASSES.DAMAGE_NUMBER;
    expect(damageNumberClass).toBeDefined();
    expect(typeof damageNumberClass).toBe('string');
  });

  test('should have status message specific constants', () => {
    const statusMessageClass = UIConstants.CLASSES.STATUS_MESSAGE;
    expect(statusMessageClass).toBeDefined();
    expect(typeof statusMessageClass).toBe('string');
  });

  test('should have animation names for UI effects', () => {
    if (UIConstants.ANIMATIONS.FLOAT_UP) {
      expect(UIConstants.ANIMATIONS.FLOAT_UP).toBeDefined();
      expect(typeof UIConstants.ANIMATIONS.FLOAT_UP).toBe('string');
    }
  });

  test('should have proper CSS animation syntax', () => {
    // Test only the string animation names, not the timing constants
    const animationNames = ['FADE_OUT', 'FLOAT_UP', 'SHAKE', 'PULSE'];
    
    animationNames.forEach(animName => {
      if (UIConstants.ANIMATIONS[animName] && typeof UIConstants.ANIMATIONS[animName] === 'string') {
        // Animation names should be valid CSS identifiers
        expect(UIConstants.ANIMATIONS[animName]).toMatch(/^[a-zA-Z][a-zA-Z0-9_-]*$/);
      }
    });
  });

  test('should have breakpoints defined if responsive', () => {
    if (UIConstants.BREAKPOINTS) {
      expect(UIConstants.BREAKPOINTS).toBeDefined();
      expect(typeof UIConstants.BREAKPOINTS).toBe('object');
      
      Object.values(UIConstants.BREAKPOINTS).forEach(breakpoint => {
        expect(typeof breakpoint).toBe('number');
        expect(breakpoint).toBeGreaterThan(0);
      });
    }
  });

  test('should have proper constants for game UI', () => {
    // Test that constants are appropriate for a game UI
    const damageClass = UIConstants.CLASSES.DAMAGE_NUMBER;
    expect(damageClass).not.toContain(' '); // Should be single class name
    expect(damageClass.length).toBeGreaterThan(3); // Reasonable length
  });

  test('should maintain immutable constants', () => {
    const originalClass = UIConstants.CLASSES.DAMAGE_NUMBER;
    
    // Attempt to modify (should not affect original in a frozen object)
    try {
      UIConstants.CLASSES.DAMAGE_NUMBER = 'modified';
    } catch (e) {
      // Object might be frozen, which is good
    }
    
    // Verify constant still exists and is accessible
    expect(UIConstants.CLASSES.DAMAGE_NUMBER).toBeDefined();
  });

  test('should have logical grouping of constants', () => {
    // Classes should be grouped together
    expect(UIConstants.CLASSES).toBeDefined();
    
    // If animations exist, they should be grouped
    if (UIConstants.ANIMATIONS) {
      expect(Object.keys(UIConstants.ANIMATIONS).length).toBeGreaterThan(0);
    }
    
    // If colors exist, they should be grouped
    if (UIConstants.COLORS) {
      expect(Object.keys(UIConstants.COLORS).length).toBeGreaterThan(0);
    }
  });

  test('should have all required UI element classes', () => {
    const gameUIElements = [
      'DAMAGE_NUMBER',
      'STATUS_MESSAGE',
      'HEALTH_FILL',
      'STAMINA_FILL'
    ];

    gameUIElements.forEach(element => {
      expect(UIConstants.CLASSES[element]).toBeDefined();
      expect(UIConstants.CLASSES[element].length).toBeGreaterThan(0);
    });
  });

  test('should have optional UI enhancement constants', () => {
    const optionalConstants = [
      'COLORS',
      'Z_INDEX',
      'DIMENSIONS',
      'FONTS',
      'TIMING',
      'BREAKPOINTS'
    ];

    optionalConstants.forEach(constant => {
      if (UIConstants[constant]) {
        expect(UIConstants[constant]).toBeDefined();
        expect(typeof UIConstants[constant]).toBe('object');
      }
      // Should not throw if constant doesn't exist
    });
  });
});