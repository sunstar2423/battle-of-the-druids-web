// Preload Scene for Battle of the Druids
// Loads all game assets before starting

class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Preload' });
        this.loadingText = null;
        this.progressBar = null;
        this.progressBox = null;
    }
    
    preload() {
        try {
            console.log('🔄 PreloadScene starting...');
            const { width, height } = this.scale;
            
            // Loading screen background
            this.add.rectangle(width / 2, height / 2, width, height, 0x2c3e50);
            
            // Loading title
            this.add.text(width / 2, height / 2 - 100, 'Battle of the Druids', {
                fontSize: '48px',
                fontFamily: 'Arial',
                fill: '#FFD700',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);
            
            // Loading text
            this.loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
                fontSize: '24px',
                fontFamily: 'Arial',
                fill: '#FFFFFF'
            }).setOrigin(0.5);
            
            // Progress bar background
            this.progressBox = this.add.graphics();
            this.progressBox.fillStyle(0x222222);
            this.progressBox.fillRect(width / 2 - 200, height / 2 + 50, 400, 30);
            
            // Progress bar
            this.progressBar = this.add.graphics();
            
            // Loading events
            this.load.on('progress', (value) => {
                try {
                    this.progressBar.clear();
                    this.progressBar.fillStyle(0x00FF00);
                    this.progressBar.fillRect(width / 2 - 195, height / 2 + 55, 390 * value, 20);
                } catch (error) {
                    console.error('Progress bar error:', error);
                }
            });
            
            this.load.on('fileprogress', (file) => {
                try {
                    this.loadingText.setText(`Loading: ${file.key}`);
                } catch (error) {
                    console.error('File progress error:', error);
                }
            });
            
            this.load.on('complete', () => {
                try {
                    console.log('✅ Asset loading complete');
                    this.loadingText.setText('Complete!');
                    this.time.delayedCall(500, () => {
                        console.log('🎯 Starting CharacterSelection scene');
                        this.scene.start('CharacterSelection');
                    });
                } catch (error) {
                    console.error('Load complete error:', error);
                }
            });
            
            // Load all assets
            console.log('📦 Loading assets...');
            AssetManager.preloadAssets(this);
            
            // Set error handling for missing files
            this.load.on('loaderror', (file) => {
                console.warn(`❌ Failed to load: ${file.key} (${file.url})`);
            });
            
            // Add success logging for audio files
            this.load.on('filecomplete', (key, type, data) => {
                if (type === 'audio') {
                    console.log(`🔊 Audio loaded successfully: ${key}`);
                }
            });
            
            console.log('✅ PreloadScene setup complete');
            
        } catch (error) {
            console.error('❌ PreloadScene error:', error);
            console.error('Stack trace:', error.stack);
        }
    }
}