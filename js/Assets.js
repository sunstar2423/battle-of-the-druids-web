// Asset Management System for Battle of the Druids Web Edition
// Handles loading and fallback for images and sounds

class AssetManager {
    constructor(scene = null) {
        this.scene = scene;
        this.loadedImages = new Map();
        this.loadedSounds = new Map();
        this.fallbackColors = {
            knight: 0x0000FF, // COLORS.BLUE
            wizard: 0x800080, // COLORS.PURPLE
            rogue: 0x00FF00,  // COLORS.GREEN
            soldier: 0xA0522D, // Brown
            default: 0x808080  // COLORS.GRAY
        };
    }
    
    // Preload all game assets
    static preloadAssets(scene) {
        // Character images
        const characters = ['knight', 'wizard', 'rogue', 'soldier'];
        characters.forEach(char => {
            scene.load.image(char, `${char}.png`);
        });
        
        // Enemy images
        const enemies = [
            'goblin', 'orc', 'skeleton', 'banshee', 'ghost', 'vampire',
            'lich', 'dragon_whelp', 'ancient_warrior', 'ancient_guardian',
            'assassin', 'city_guard', 'dark_mage', 'elite_dark_mage',
            'fire_elemental', 'divine_beast', 'celestial', 'temple_guardian',
            'spirit_monk', 'pirate', 'ghost_ship', 'sea_serpent', 'kraken_spawn',
            'minotaur', 'golem', 'magma_golem', 'lava_beast', 'war_machine',
            'mech_dragon', 'lost_soul'
        ];
        enemies.forEach(enemy => {
            scene.load.image(enemy, `${enemy}.png`);
        });
        
        // Background images
        scene.load.image('world_map', 'world_map.png');
        scene.load.image('shop_background', 'shop_background.png');
        scene.load.image('menu', 'menu.png');
        
        // Location background images
        scene.load.image('arena', 'arena.png');
        scene.load.image('docks', 'docks.png');
        scene.load.image('mansion', 'mansion.png');
        scene.load.image('shrine', 'shrine.png');
        scene.load.image('volcaniccaves', 'volcaniccaves.png');
        scene.load.image('druidcastle', 'druidcastle.png');
        scene.load.image('botattack', 'botattack.png');
        scene.load.image('city', 'city.png');
        
        // Sound effects with fallback formats
        const sounds = ['attack', 'heal', 'special', 'victory', 'defeat', 'buy', 'click'];
        sounds.forEach(sound => {
            try {
                // Try to load WAV files with error handling
                scene.load.audio(sound, `${sound}.wav`);
                console.log(`📦 Loading audio: ${sound}.wav`);
            } catch (error) {
                console.error(`❌ Failed to queue audio: ${sound}`, error);
            }
        });
        
        // Background music with fallback
        try {
            scene.load.audio('background_music', 'background_music.wav');
            console.log(`📦 Loading audio: background_music.wav`);
        } catch (error) {
            console.error(`❌ Failed to queue background music`, error);
        }
        
        // Special victory assets
        try {
            scene.load.image('victory', 'victory.png');
            scene.load.audio('victory-fanfare', 'victory-fanfare.wav');
            console.log(`📦 Loading special victory assets`);
        } catch (error) {
            console.error(`❌ Failed to queue victory assets`, error);
        }
    }
    
    // Get character image or fallback
    getCharacterImage(scene, charType, x, y, size = 120) {
        const imageName = charType.toLowerCase();
        
        if (scene.textures.exists(imageName)) {
            const image = scene.add.image(x, y, imageName);
            image.setDisplaySize(size, size);
            return image;
        } else {
            // Fallback to colored circle
            const color = this.fallbackColors[imageName] || this.fallbackColors.default;
            return scene.add.circle(x, y, size / 2, color)
                .setStrokeStyle(3, 0x000000);
        }
    }
    
    // Get enemy image or fallback
    getEnemyImage(scene, enemyName, x, y, size = 120) {
        const imageName = enemyName.toLowerCase().replace(/ /g, '_');
        
        if (scene.textures.exists(imageName)) {
            const image = scene.add.image(x, y, imageName);
            image.setDisplaySize(size, size);
            return image;
        } else {
            // Fallback to red circle
            return scene.add.circle(x, y, size / 2, 0xFF0000)
                .setStrokeStyle(3, 0x000000);
        }
    }
    
    // Get background image or fallback
    getBackgroundImage(scene, backgroundName) {
        const { width, height } = scene.scale;
        
        if (scene.textures.exists(backgroundName)) {
            const bg = scene.add.image(width / 2, height / 2, backgroundName);
            bg.setDisplaySize(width, height);
            return bg;
        } else {
            // Fallback to gradient background
            return this.createGradientBackground(scene, backgroundName);
        }
    }
    
    // Create gradient background fallback
    createGradientBackground(scene, type) {
        const { width, height } = scene.scale;
        const graphics = scene.add.graphics();
        
        let color1, color2;
        switch (type) {
            case 'world_map':
                color1 = 0x87CEEB; // Sky blue
                color2 = 0x228B22; // Forest green
                break;
            case 'shop_background':
                color1 = 0x8B4513; // Saddle brown
                color2 = 0x2F4F4F; // Dark slate gray
                break;
            default:
                color1 = 0x2c3e50; // Dark blue
                color2 = 0x34495e; // Darker blue
        }
        
        graphics.fillGradientStyle(color1, color1, color2, color2);
        graphics.fillRect(0, 0, width, height);
        
        return graphics;
    }
    
    // Play sound with fallback
    playSound(scene, soundName, volume = 0.5) {
        try {
            console.log(`🔊 Attempting to play sound: ${soundName}`);
            console.log(`🔊 Scene.sound exists:`, !!scene.sound);
            console.log(`🔊 Available sounds:`, scene.sound ? Object.keys(scene.sound.sounds) : 'No sound manager');
            
            if (scene.sound && scene.cache.audio.exists(soundName)) {
                console.log(`🔊 Playing sound: ${soundName} at volume ${volume}`);
                scene.sound.play(soundName, { volume });
                return true;
            } else {
                console.warn(`🔊 Sound not found or not loaded: ${soundName}`);
                if (scene.sound) {
                    console.warn(`🔊 Available audio keys:`, scene.cache.audio.getKeys());
                }
            }
        } catch (error) {
            console.warn(`🔊 Could not play sound: ${soundName}`, error);
        }
        return false;
    }
    
    // Play background music
    playBackgroundMusic(scene, loop = true, volume = 0.3) {
        try {
            console.log(`🎵 Attempting to play background music`);
            console.log(`🎵 Scene.sound exists:`, !!scene.sound);
            console.log(`🎵 Background music exists:`, scene.cache.audio.exists('background_music'));
            
            if (scene.sound && scene.cache.audio.exists('background_music')) {
                console.log(`🎵 Playing background music at volume ${volume}`);
                const music = scene.sound.play('background_music', { 
                    loop, 
                    volume 
                });
                return music;
            } else {
                console.warn('🎵 Background music not found or not loaded');
            }
        } catch (error) {
            console.warn('🎵 Could not play background music:', error);
        }
        return null;
    }
    
    // Play victory fanfare (special method for finale)
    playVictoryFanfare(scene, volume = 0.8) {
        try {
            console.log(`🎵 Attempting to play victory fanfare`);
            
            if (scene.sound && scene.cache.audio.exists('victory-fanfare')) {
                console.log(`🎵 Playing victory fanfare at volume ${volume}`);
                const fanfare = scene.sound.play('victory-fanfare', { 
                    volume 
                });
                return fanfare;
            } else {
                console.warn('🎵 Victory fanfare not found, playing regular victory sound');
                // Fallback to regular victory sound
                if (scene.cache.audio.exists('victory')) {
                    return scene.sound.play('victory', { volume });
                }
            }
        } catch (error) {
            console.warn('🎵 Could not play victory fanfare:', error);
        }
        return null;
    }
}

// Global asset manager class - instances created per scene
window.AssetManager = AssetManager;