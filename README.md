# Battle of the Druids - Web Edition

A complete turn-based RPG game converted from Python/Pygame to JavaScript/Phaser.js for web browsers. Experience epic battles, character progression, and strategic combat - all playable instantly in your browser!

**Developed by Titan Blade Games**

## 🎮 Play Now

**[► Play Battle of the Druids](http://battle-of-the-druids-web.s3-website-ap-southeast-2.amazonaws.com/)**

No downloads, no installation - just click and play!

## 🚀 How to Play

1. **Online**: Simply visit the game URL above
2. **Local Development**:
   ```bash
   cd battle-of-the-druids-web
   python3 -m http.server 8000
   # Open http://localhost:8000
   ```

3. **Gameplay**:
   - Create a character (Knight, Wizard, Rogue, or Soldier)
   - Explore the world map and battle enemies
   - Visit the store to buy better equipment
   - Check your inventory to see equipped items and stats
   - Progress through 9 unique locations

## ✨ Features

### ✅ Complete Game Systems
- **Character Classes**: Knight, Wizard, Rogue, Soldier with unique abilities
- **Equipment System**: Weapons, armor, accessories with tier progression
- **Magic System**: Wizard spells with mana management
- **Battle System**: Turn-based combat with visual effects
- **World Map**: 9 locations with progressive unlock requirements
- **Store System**: Tiered equipment purchasing with gold economy
- **Inventory System**: Visual equipment display and comprehensive stats

### ✅ Visual Enhancements
- **Particle Effects**: Spell effects, attack animations, damage numbers
- **Screen Shake**: Impact feedback for special attacks
- **Floating Text**: Real-time combat feedback
- **Dynamic Backgrounds**: Location-specific atmospheres
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Modern UI**: Clean, intuitive interface with hover effects

### ✅ Web-Specific Features
- **Instant Loading**: No installation required
- **Session-Based**: Fresh adventure every time you play
- **Easy Sharing**: Just send a link
- **Mobile Support**: Touch-friendly controls
- **Modern Performance**: Smooth 60fps gameplay
- **Cross-Platform**: Works on any device with a browser

## 🎯 Game Progression

**Locations** (unlock by completing previous areas):
1. **Arena** - Starting location for new warriors
2. **Maze** - Labyrinthine challenges  
3. **Haunted Mansion** - Supernatural encounters
4. **Pirate Docks** - Maritime battles
5. **Ancient City** - Archaeological dangers
6. **Sacred Shrine** - Divine guardians
7. **Volcanic Caves** - Elemental fury
8. **Battle of Druids Castle** - The ultimate challenge
9. **Bot Attack** - Futuristic warfare

**Character Classes**:
- **Knight**: Balanced warrior with strong defense
- **Wizard**: Magical attacker with powerful spells and mana
- **Rogue**: Fast assassin with critical strike potential
- **Soldier**: Tough fighter with excellent all-around capabilities

## 🔧 Technical Implementation

- **Engine**: Phaser.js 3.70 with modular scene architecture
- **Deployment**: AWS S3 static hosting with GitHub Actions CI/CD
- **Performance**: Optimized asset loading with fallback systems
- **Architecture**: Clean separation of concerns across multiple modules
- **Responsive**: Automatic scaling for different screen sizes

## 🏗️ Project Structure

```
js/
├── Game.js              # Main game configuration and initialization
├── GameData.js          # Game constants, character presets, locations
├── Character.js         # Character classes and combat mechanics
├── Equipment.js         # Equipment system and store logic
├── Effects.js           # Visual effects and animations
├── Assets.js            # Asset loading and fallback management
└── scenes/
    ├── PreloadScene.js  # Asset preloading
    ├── CharacterSelectionScene.js
    ├── MainMenuScene.js
    ├── WorldMapScene.js
    ├── BattleScene.js
    ├── InventoryScene.js
    └── StoreScene.js
```

## 🚀 Advantages Over Python Version

1. **Distribution**: Instant web access vs Python environment setup
2. **Performance**: Hardware-accelerated graphics and smooth animations
3. **Accessibility**: Cross-platform compatibility
4. **Development**: Faster iteration with modern web tools
5. **Features**: Enhanced visual effects and responsive design

## 🎪 Ready for Adventure!

Battle of the Druids showcases modern web game development capabilities while delivering a complete, engaging RPG experience. Perfect for demonstrating JavaScript game development skills and providing hours of strategic combat entertainment!

---

**© 2025 Titan Blade Games** - Bringing epic adventures to your browser!