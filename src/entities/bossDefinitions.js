// --- COMPLETE AND UNABRIDGED FILE ---

export const bossDefinitions = {
  shadowLord: {
    name: 'Shadow Lord',
    maxHealth: 1200,
    damage: 60,
    speed: 100,
    attackRange: 100,
    detectionRange: 400,
    spriteOptions: {
      width: 64, height: 80, color: '#2d1b69', offsetX: -32, offsetY: -40,
    },
    collisionOptions: {
      width: 64, height: 80, offsetX: -32, offsetY: -40,
    },
    attackPatterns: {
      phase1: ['triple_slash', 'shadow_dash', 'ground_slam'],
      phase2: ['teleport_strike', 'projectile_barrage', 'air_slam', 'multi_projectile'],
      phase3: ['ground_slam', 'triple_slash', 'shadow_dash', 'teleport_dash', 'multi_projectile'],
    },
  },
};
