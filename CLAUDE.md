# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shadow Knight is a 2D action game built with HTML5 Canvas and vanilla JavaScript using Entity-Component-System (ECS) architecture. Inspired by Dark Souls and Hollow Knight, it features precise controls, challenging combat mechanics, and smooth 60 FPS gameplay.

## Common Development Commands

### Development Server
```bash
npm run dev          # Start development server on localhost:3000
npm start            # Alias for npm run dev
```

### Code Quality
```bash
npm run lint         # Run ESLint (defined in package.json eslintConfig)
npm run format       # Run Prettier (defined in package.json prettier config)
```

### Build and Deploy
```bash
npm run build        # Create production build in dist/ folder
npm run deploy       # Deploy to GitHub Pages
```

## Core Architecture

### ECS Pattern Implementation
The game uses a strict Entity-Component-System pattern:

- **Entities** (`src/core/Entity.js`): Containers with unique IDs that hold components
- **Components** (`src/components/`): Pure data structures (Position, Velocity, Sprite, Player, etc.)
- **Systems** (`src/systems/`): Logic processors that operate on entities with specific components

### Game Loop Structure
The main game loop in `src/core/Game.js` follows this pattern:
1. Update camera position based on player target
2. Run all system updates in order (Movement → PlayerControl → EnemyAI → BossAI → Combat → Render → UI)
3. Update sprite animations for all entities
4. Clear input manager state

### System Processing Order
Systems process in this specific order (defined in `src/main.js`):
1. `MovementSystem` - Physics and position updates
2. `PlayerControlSystem` - Player input handling
3. `EnemyAISystem` - Enemy behavior logic
4. `BossAISystem` - Boss-specific AI logic
5. `CombatSystem` - Combat calculations and collisions
6. `RenderSystem` - Draw all visual elements
7. `UISystem` - Health bars and UI overlays

### Key Components
- **Position**: World coordinates (x, y)
- **Velocity**: Movement speed and direction
- **Physics**: Gravity, friction, ground collision, mass
- **Sprite**: Visual representation with animation system
- **Player**: Player stats (health, stamina, combat state)
- **Enemy**: Enemy AI state and behavior patterns
- **Boss**: Complex boss mechanics and phases
- **Collision**: Hit box dimensions and offsets

## Game Mechanics

### Player Controls
- WASD/Arrow Keys: Movement
- Space/W/Up: Jump (with coyote time and jump buffering)
- Shift: Dash (stamina-gated with i-frames)
- Left Mouse: Attack (3-hit combo system)
- Right Mouse: Parry (perfect timing mechanics)
- F3: Toggle debug mode
- F4: Toggle cheat menu

### Camera System
Smooth camera following with world bounds constraint (2560x720 world size). Camera smoothing factor of 0.1 for fluid movement tracking.

### Audio System
Sound management through `SoundManager` with separate volume controls for master, BGM, and SFX. Preloads all audio files during initialization.

## File Structure Significance

### `/src/core/`
- `Game.js`: Main game class with ECS management, camera, and game loop
- `Entity.js`: Entity class with component management
- `InputManager.js`: Centralized input handling
- `SoundManager.js`: Audio system management
- `cheat.js`: Debug/cheat functionality

### `/src/components/`
Data-only classes that entities compose. Never contain logic, only state.

### `/src/systems/`
Logic processors. Each system queries entities by component requirements and processes them.

### `/src/entities/`
Factory functions for creating complex entities with multiple components (like bosses).

## Development Patterns

### Adding New Features
1. Create components for new data requirements
2. Create or modify systems to process the new logic
3. Register systems in correct order in `main.js`
4. Add entity creation logic if needed

### Performance Considerations
- Game targets 60 FPS with delta time-based updates
- Uses `requestAnimationFrame` for smooth rendering
- Entity queries are cached per frame in systems
- Sprite animations update independently of game logic

### Debug Features
- F3 toggles debug mode for collision visualization
- F4 opens cheat menu for testing
- Console logging for entity creation and game state
- Error handling with visual error messages

## Code Style Configuration
- ESLint: Browser environment, ES2022, extends eslint:recommended
- Prettier: 4-space tabs, single quotes, trailing commas
- Target: Modern browsers (Chrome 80+, Firefox 74+, Safari 13+, Edge 80+)