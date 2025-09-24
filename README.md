# Shadow Knight

A mechanically delicious 2D action game inspired by Dark Souls, Hollow Knight, and Silksong. Features precise controls, challenging combat, and tight responsive gameplay.

## Features

### 🎮 **Mechanically Delicious Controls**
- Buttery smooth movement with proper acceleration/deceleration
- Coyote time (150ms grace period after leaving platforms)
- Jump buffering (150ms input buffer for responsive controls)
- Air control for precise mid-air movement
- Stamina-gated dash with invulnerability frames

### ⚔️ **Deep Combat System**
- Mouse-based combat (Left: Attack, Right: Parry)
- 3-hit combo system with timing windows
- Perfect parry mechanics with tight timing
- Stamina management system
- Visual feedback with screen shake and hit stop

### 🏗️ **Technical Excellence**
- Entity-Component-System (ECS) architecture
- 60 FPS game loop with delta timing
- Smooth camera system with world bounds
- Real-time UI with health/stamina tracking
- Modular system design for easy expansion

## Controls

| Input | Action |
|-------|--------|
| WASD / Arrow Keys | Move |
| Space / W / Up Arrow | Jump |
| Shift | Dash |
| Left Mouse | Sword Attack |
| Right Mouse | Parry |
| F3 | Toggle Debug Mode |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser and navigate to:
# http://localhost:3000
```

## Development

```bash
# Run linting
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Clean build artifacts
npm run clean
```

## Project Structure

```
shadow-knight/
├── src/
│   ├── core/           # Game engine core
│   ├── components/     # ECS components
│   ├── systems/        # ECS systems
│   ├── entities/       # Entity factories
│   └── utils/          # Helper functions
├── assets/             # Game assets
├── styles/             # CSS files
└── index.html          # Entry point
```

## Architecture

Built using Entity-Component-System (ECS) pattern for maximum flexibility and maintainability. Each entity is composed of components that hold data, while systems contain the logic that operates on entities with specific components.

### Core Systems
- **MovementSystem**: Handles physics and position updates
- **PlayerControlSystem**: Processes player input and actions
- **RenderSystem**: Draws all visual elements
- **UISystem**: Manages health bars and UI elements

### Key Components
- **Position**: World coordinates
- **Velocity**: Movement speed and direction
- **Physics**: Gravity, friction, ground collision
- **Sprite**: Visual representation and animations
- **Player**: Player-specific stats and abilities

## Performance

- Target: 60 FPS on modern browsers
- Uses `requestAnimationFrame` for smooth rendering
- Efficient entity management with component-based updates
- Optimized collision detection and physics

## Browser Support

- Chrome 80+
- Firefox 74+
- Safari 13+
- Edge 80+

## License

MIT License - feel free to use this code for learning or your own projects!