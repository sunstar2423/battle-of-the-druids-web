# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a turn-based RPG game called "Battle of the Druids" converted from Python/Pygame to JavaScript/Phaser.js for web browsers. The game features a complete RPG experience with character classes, equipment systems, magic, and turn-based combat.

## Running the Game

```bash
# Start a local development server
python3 -m http.server 8000

# Alternative using Node.js
npx serve .

# Open in browser
# Navigate to http://localhost:8000
```

The game loads instantly in the browser - no installation required.

## Web Architecture

The game uses Phaser.js 3.70 with a modular scene-based architecture:

### Core JavaScript Modules (`/js/`)

- **`Game.js`**: Main game configuration and Phaser initialization
  - Scene management and game configuration
  - Error handling and audio context management
  - LoadGameScene for save file management

- **`GameData.js`**: Constants, enums, and data structures
  - COLORS, SCREEN_WIDTH/HEIGHT constants
  - CHARACTER_PRESETS with stats and abilities
  - WORLD_LOCATIONS with progression and enemy data
  - Equipment definitions and tier system

- **`Character.js`**: Character class and combat mechanics
  - Player and enemy character management
  - Combat calculations with equipment bonuses
  - Level progression and stat management

- **`Equipment.js`**: Equipment system and store logic
  - Weapon, armor, and accessory definitions
  - Tier-based equipment generation
  - Store inventory and pricing calculations

- **`SaveSystem.js`**: Browser localStorage save/load system
  - Multiple save slot management
  - Character persistence with equipment and progress
  - Save file metadata and date tracking

- **`Effects.js`**: Visual effects and animations
  - Particle systems for spells and attacks
  - DamageNumber floating text effects
  - Screen shake and visual feedback
  - BackgroundRenderer for location-specific backgrounds

- **`Assets.js`**: Asset loading and fallback management
  - Image loading with fallback to colored rectangles
  - Audio loading with error handling

### Scene Architecture (`/js/scenes/`)

- **`PreloadScene.js`**: Asset preloading and initialization
- **`CharacterSelectionScene.js`**: Character creation with class selection
- **`MainMenuScene.js`**: Game navigation and save management
- **`WorldMapScene.js`**: Location selection and progression
- **`BattleScene.js`**: Turn-based combat with visual effects
- **`InventoryScene.js`**: Equipment display and character stats
- **`StoreScene.js`**: Equipment purchasing system
- **`StatsScene.js`**: Character statistics and progress tracking

## Game Flow and Architecture

1. **Initialization**: `Game.js` configures Phaser and manages scene transitions
2. **Asset Loading**: `PreloadScene` loads all game assets with fallbacks
3. **Character Creation**: `CharacterSelectionScene` creates new characters or loads saves
4. **Game Loop**: Players navigate through scenes via `MainMenuScene`
5. **World Exploration**: `WorldMapScene` manages location unlocking and enemy encounters
6. **Combat**: `BattleScene` handles turn-based combat with visual effects
7. **Progression**: Equipment, stats, and saves persist via `SaveSystem`

## Legacy Python Version

The repository includes the original Python/Pygame version:
- **`Battle of the Druids - Pygame Graphics Version.py`**: Original monolithic Python version
- **`main.py`**: Entry point for modular Python version (requires `/game_modules/` - not present)
- **`requirements.txt`**: Python dependencies (pygame>=2.0.0)

## Asset Management

The game includes 40+ PNG images and audio files in the root directory:
- Character images: 120x120 PNG files (knight.png, wizard.png, rogue.png, soldier.png)
- Enemy images: 120x120 PNG files for diverse enemy types
- Audio files: WAV/MP3 format (attack.wav, heal.wav, victory.wav, background music)
- Background images: world_map.png, shop_background.png, location backgrounds

The web version gracefully handles missing assets with colored fallbacks.

## Development Guidelines

### Adding New Features
- **Game data**: Extend objects in `GameData.js`
- **New scenes**: Create in `/js/scenes/` and register in `Game.js`
- **Combat mechanics**: Modify `Character.js` and `BattleScene.js`
- **Visual effects**: Add to `Effects.js` classes
- **Equipment**: Extend definitions in `Equipment.js`

### Architecture Principles
- Scene-based architecture with clear separation of concerns
- Global game state managed through Phaser's registry system
- Modular JavaScript with no build system required
- localStorage persistence for cross-session saves
- Responsive design supporting desktop and mobile

### Browser Compatibility
- Modern browsers with ES6+ support
- Audio context handling for Chrome's autoplay restrictions
- Touch and mouse input support
- Automatic scaling for different screen sizes

The web version maintains 100% feature parity with the Python version while adding web-specific enhancements like instant loading, responsive design, and improved visual effects.