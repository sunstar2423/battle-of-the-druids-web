# Battle of the Druids - Web Edition

Web-based RPG built with Phaser.js featuring character classes, tactical combat, and progression. Battle enemies online to earn Dragon Shards and claim the legendary DRUID CLOAK!

A complete conversion of the Python/Pygame Battle of the Druids to JavaScript/Phaser.js for web browsers.

## 🎮 How to Play

1. **Start a local server**:
   ```bash
   cd battle-of-the-druids-web
   python3 -m http.server 8000
   ```

2. **Open in browser**: Go to `http://localhost:8000`

3. **Play the game**:
   - Create a character (Knight, Wizard, Rogue, or Soldier)
   - Explore the world map and battle enemies
   - Visit the store to buy better equipment
   - Check your inventory to see equipped items
   - Save/load your progress

## ✨ Features

### ✅ Complete Game Systems
- **Character Classes**: Knight, Wizard, Rogue, Soldier with unique abilities
- **Equipment System**: Weapons, armor, accessories with tier progression
- **Magic System**: Wizard spells with mana management
- **Battle System**: Turn-based combat with visual effects
- **World Map**: 9 locations with unlock progression
- **Save System**: localStorage-based save/load with multiple slots
- **Store System**: Tiered equipment purchasing
- **Inventory System**: Visual equipment display and stats

### ✅ Visual Enhancements
- **Particle Effects**: Spell effects, attack animations
- **Screen Shake**: Impact feedback for special attacks
- **Damage Numbers**: Floating combat feedback
- **Gradient Backgrounds**: Location-specific atmospheres
- **Responsive Design**: Works on desktop and mobile
- **Modern UI**: Clean, intuitive interface

### ✅ Web-Specific Improvements
- **Instant Loading**: No installation required
- **Easy Sharing**: Just send a link
- **Auto-Save**: Progress saved to browser storage
- **Mobile Support**: Touch-friendly controls
- **Modern Performance**: Smooth 60fps gameplay

## 🚀 Advantages Over Python Version

1. **Distribution**: Share via web link vs Python installation
2. **Performance**: Smooth animations and effects
3. **Accessibility**: Works on any device with a browser
4. **Development Speed**: Faster iteration with instant browser refresh
5. **Modern Features**: Built-in scaling, mobile support, visual effects

## 🎯 Technical Implementation

- **Engine**: Phaser.js 3.70
- **Architecture**: Modular scene-based system
- **Save System**: Browser localStorage
- **Effects**: Custom particle systems
- **Responsive**: Automatic scaling for different screen sizes

## 🔧 Development Notes

The conversion maintains 100% feature parity with the Python version while adding web-specific enhancements. The modular architecture makes it easy to add new features, locations, spells, or equipment.

## 🎪 Ready to Play!

This is a complete, fully functional RPG that demonstrates the power of modern web game development with JavaScript and Phaser.js!
