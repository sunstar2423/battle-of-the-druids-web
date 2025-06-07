// Main Game Configuration for Battle of the Druids Web Edition
// Phaser.js game initialization and scene management


// Phaser game configuration
const gameConfig = {
    type: Phaser.AUTO,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#2c3e50',
    scene: [
        PreloadScene,
        CharacterSelectionScene,
        MainMenuScene,
        WorldMapScene,
        BattleScene,
        InventoryScene,
        StoreScene,
        StatsScene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.NO_CENTER,
        min: {
            width: 320,  // Support very small phones
            height: 480
        },
        max: {
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    input: {
        keyboard: true,
        mouse: true,
        touch: {
            capture: false  // Allow native touch gestures to pass through
        }
    },
    render: {
        antialias: true,
        pixelArt: false
    },
    audio: {
        disableWebAudio: false,
        noAudio: false
    }
};

// Initialize the game when the page loads
window.addEventListener('load', () => {
    console.log('🎮 Starting Battle of the Druids Web Edition...');
    
    try {
        // Remove loading message
        const loadingDiv = document.querySelector('.loading');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
        
        // Create the game
        const game = new Phaser.Game(gameConfig);
        
        // Global game reference for debugging
        window.game = game;
        
        // Handle audio context for modern browsers
        const resumeAudioContext = () => {
            if (game.sound && game.sound.context && game.sound.context.state === 'suspended') {
                game.sound.context.resume().then(() => {
                    console.log('🔊 Audio context resumed');
                }).catch(err => {
                    console.warn('Audio context resume failed:', err);
                });
            }
        };
        
        // Resume audio on first user interaction
        document.addEventListener('click', resumeAudioContext, { once: true });
        document.addEventListener('keydown', resumeAudioContext, { once: true });
        document.addEventListener('touchstart', resumeAudioContext, { once: true });
        
        console.log('✅ Game initialized successfully!');
        console.log('📝 Debug: Access game object via window.game');
        
    } catch (error) {
        console.error('❌ Failed to initialize game:', error);
        console.error('Stack trace:', error.stack);
        
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.innerHTML = `
                <div style="color: white; text-align: center; padding: 50px;">
                    <h2>Game Initialization Failed</h2>
                    <p>Error: ${error.message}</p>
                    <p style="font-size: 12px;">Check console for details</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; font-size: 16px;">
                        Try Again
                    </button>
                </div>
            `;
        }
    }
});

// Handle page visibility changes (pause/resume)
document.addEventListener('visibilitychange', () => {
    if (window.game) {
        if (document.hidden) {
            window.game.scene.pause();
        } else {
            window.game.scene.resume();
        }
    }
});

// Error handling
window.addEventListener('error', (event) => {
    console.error('Game Error:', event.error);
    console.error('Error details:', event.filename, event.lineno, event.colno);
    console.error('Stack trace:', event.error?.stack);
    
    // Show user-friendly error message
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.innerHTML = `
            <div style="color: white; text-align: center; padding: 50px;">
                <h2>Oops! Something went wrong</h2>
                <p>Please refresh the page to restart the game.</p>
                <button onclick="location.reload()" style="padding: 10px 20px; font-size: 16px;">
                    Refresh Page
                </button>
            </div>
        `;
    }
});

// Export for debugging
window.CHARACTER_PRESETS = CHARACTER_PRESETS;
window.WORLD_LOCATIONS = WORLD_LOCATIONS;

// Audio debugging function
window.testAudio = function() {
    console.log('🔧 Audio Debug Test Starting...');
    const scene = game.scene.getScene('MainMenu') || game.scene.getScene('CharacterSelection') || game.scene.scenes[0];
    
    if (!scene) {
        console.error('❌ No active scene found for audio test');
        return;
    }
    
    console.log('🎮 Testing with scene:', scene.scene.key);
    console.log('🔊 Scene.sound exists:', !!scene.sound);
    console.log('🔊 Audio context state:', scene.sound?.context?.state);
    console.log('🔊 Available audio files:', scene.cache.audio.getKeys());
    
    // Test each sound file
    const sounds = ['attack', 'heal', 'special', 'victory', 'defeat', 'buy', 'click', 'background_music'];
    sounds.forEach(soundName => {
        const exists = scene.cache.audio.exists(soundName);
        console.log(`🔊 ${soundName}: ${exists ? '✅ Loaded' : '❌ Missing'}`);
        
        if (exists) {
            try {
                scene.sound.play(soundName, { volume: 0.1 });
                console.log(`🔊 ${soundName}: ✅ Played successfully`);
            } catch (error) {
                console.log(`🔊 ${soundName}: ❌ Play failed:`, error);
            }
        }
    });
};

// Test finale victory screen
window.testFinaleVictory = function() {
    console.log('🎉 Testing finale victory screen...');
    const scene = game.scene.getScene('Battle');
    
    if (scene && scene.scene.isActive()) {
        console.log('✅ Triggering finale victory screen');
        scene.showFinaleVictory();
    } else {
        console.log('❌ Battle scene not active. Start a battle first, then run this command.');
    }
};

// Test enemy dialogue
window.testDialogue = function(enemyType = 'goblin') {
    console.log('💬 Testing enemy dialogue...');
    const scene = game.scene.getScene('Battle');
    
    if (scene && scene.scene.isActive()) {
        console.log('✅ Triggering dialogue for enemy type:', enemyType);
        scene.showEnemyDialogue(enemyType);
    } else {
        console.log('❌ Battle scene not active. Start a battle first, then run: testDialogue("goblin")');
    }
};