# GEMINI.md

## Project Overview

This project, "Shadow Knight," is a 2D action game developed in JavaScript using an Entity-Component-System (ECS) architecture. It is inspired by games like Dark Souls and Hollow Knight, focusing on precise controls and challenging combat. The rendering is done on an HTML5 Canvas.

The codebase is structured with a clear separation of concerns:
- **`src/core`**: Contains the main game engine logic, including the game loop, entity manager, and input manager.
- **`src/components`**: Defines the data components for entities (e.g., `Position`, `Velocity`, `Sprite`).
- **`src/systems`**: Implements the logic that operates on entities with specific components (e.g., `MovementSystem`, `RenderSystem`, `CombatSystem`).
- **`src/entities`**: Contains definitions for creating complex entities like the player, enemies, and bosses.
- **`assets`**: Stores game assets such as images and sounds.

## Building and Running

### Prerequisites
- Node.js (>=16.0.0)
- npm (>=8.0.0)

### Installation
To install the development dependencies, run:
```bash
npm install
```

### Development
To start the local development server, run:
```bash
npm run dev
```
This will serve the game at `http://localhost:3000`. The server will automatically reload when files are changed.

### Building for Production
To create a production-ready build, run:
```bash
npm run build
```
This command will create a `dist` directory with the bundled and minified game files.

### Testing
The project is set up for testing, but no tests have been written yet. To run the test script:
```bash
npm run test
```

## Development Conventions

### Code Style
The project uses ESLint for linting and Prettier for code formatting.

- To run the linter:
  ```bash
  npm run lint
  ```
- To format the code:
  ```bash
  npm run format
  ```

### Architecture
The project follows an Entity-Component-System (ECS) pattern. When adding new features, it is important to adhere to this pattern:
- **Components** should only contain data.
- **Systems** should contain the logic that operates on entities based on their components.
- **Entities** are created by composing multiple components.

### Controls
- **WASD / Arrow Keys**: Move
- **Space / W / Up Arrow**: Jump
- **Shift**: Dash
- **Left Mouse**: Sword Attack
- **Right Mouse**: Parry
- **F3**: Toggle Debug Mode
