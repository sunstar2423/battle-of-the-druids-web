// Main Menu Scene for Battle of the Druids
// Central hub for all game activities

class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
        this.player = null;
        this.buttons = [];
    }
    
    create() {
        const { width, height } = this.scale;
        
        // Get player from registry
        this.player = this.registry.get('currentPlayer');
        
        if (!this.player) {
            // No player found, go back to character selection
            this.scene.start('CharacterSelection');
            return;
        }
        
        // Background
        BackgroundRenderer.drawMenuBackground(this);
        
        // Initialize asset manager and start background music
        this.assetManager = new AssetManager(this);
        this.assetManager.playBackgroundMusic(this, true, 0.2);
        
        // Title
        this.add.text(width / 2, 150, 'Battle of the Druids', {
            fontSize: '64px',
            fontFamily: 'Arial',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Player info
        this.add.text(width / 2, 220, `${this.player.name} - Level ${this.player.victories + 1}`, {
            fontSize: '24px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, 250, `Gold: ${this.player.gold} | Dragon Shards: ${this.player.dragonShards}`, {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#FFD700'
        }).setOrigin(0.5);
        
        // Create menu buttons
        this.createMenuButtons();
        
        // Add audio test button
        this.createAudioTestButton();
        
        // Input handling for ESC key
        this.input.keyboard.on('keydown-ESC', () => {
            // Could add pause menu or return to character selection
        });
    }
    
    createMenuButtons() {
        const { width } = this.scale;
        const buttonData = [
            { text: 'World Map', y: 320, action: () => this.scene.start('WorldMap') },
            { text: 'Store', y: 380, action: () => this.scene.start('Store') },
            { text: 'Inventory', y: 440, action: () => this.scene.start('Inventory') },
            { text: 'Stats', y: 500, action: () => this.scene.start('Stats') },
            { text: 'Save Game', y: 560, action: () => this.showSaveMenu() },
            { text: 'Load Game', y: 620, action: () => this.scene.start('LoadGame') },
            { text: 'Quit', y: 680, action: () => this.quitGame() }
        ];
        
        buttonData.forEach(btn => {
            const button = this.add.rectangle(width / 2, btn.y, 200, 50, COLORS.DARK_GRAY)
                .setStrokeStyle(2, COLORS.WHITE)
                .setInteractive();
            
            const buttonText = this.add.text(width / 2, btn.y, btn.text, {
                fontSize: '20px',
                fontFamily: 'Arial',
                fill: '#FFFFFF'
            }).setOrigin(0.5);
            
            // Button interactions
            button.on('pointerdown', () => {
                console.log(`🔧 Main menu button clicked: ${btn.text}`);
                this.assetManager.playSound(this, 'click', 0.4);
                btn.action();
            });
            button.on('pointerover', () => {
                button.setFillStyle(COLORS.GRAY);
                buttonText.setStyle({ fill: '#FFD700' });
            });
            button.on('pointerout', () => {
                button.setFillStyle(COLORS.DARK_GRAY);
                buttonText.setStyle({ fill: '#FFFFFF' });
            });
            
            this.buttons.push({ rect: button, text: buttonText });
        });
    }
    
    showSaveMenu() {
        console.log('🔧 showSaveMenu called');
        // Create overlay for save menu - completely cover the screen
        const { width, height } = this.scale;
        
        // Hide ALL existing UI elements
        this.children.list.forEach(child => {
            if (child.setVisible) {
                child.setVisible(false);
                if (child.disableInteractive) {
                    child.disableInteractive();
                }
            }
        });
        
        // Create full screen background
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e, 1.0)
            .setInteractive()
            .setDepth(1000);
        
        // Create save menu background
        const menuBg = this.add.rectangle(width / 2, height / 2, 500, 400, COLORS.DARK_GRAY)
            .setStrokeStyle(4, COLORS.WHITE)
            .setDepth(1001);
        
        // Add title
        this.add.text(width / 2, height / 2 - 150, 'Save Game', {
            fontSize: '48px',
            fontFamily: 'Arial',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5)
          .setDepth(1002);
        
        // Quick Save button
        const quickSaveBtn = this.add.rectangle(width / 2, height / 2 - 50, 350, 50, COLORS.GREEN)
            .setStrokeStyle(3, COLORS.WHITE)
            .setInteractive()
            .setDepth(1002);
        
        this.add.text(width / 2, height / 2 - 50, 'Quick Save', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5)
          .setDepth(1003);
        
        // Add hover effects for debugging
        quickSaveBtn.on('pointerover', () => {
            console.log('🔧 Quick Save button HOVERED');
            quickSaveBtn.setFillStyle(0x00AA00); // Lighter green on hover
        });
        
        quickSaveBtn.on('pointerout', () => {
            console.log('🔧 Quick Save button UN-HOVERED');
            quickSaveBtn.setFillStyle(COLORS.GREEN); // Back to normal green
        });
        
        quickSaveBtn.on('pointerdown', () => {
            console.log('🔧 Quick Save button clicked');
            this.assetManager.playSound(this, 'click', 0.4);
            const success = saveSystem.quickSave(this.player);
            console.log('💾 Quick save result:', success);
            this.showSaveMessage(success ? 'Quick save successful!' : 'Save failed!', success);
            this.closeSaveMenu(overlay, menuBg);
        });
        
        // New Save button
        const newSaveBtn = this.add.rectangle(width / 2, height / 2 + 20, 350, 50, COLORS.BLUE)
            .setStrokeStyle(3, COLORS.WHITE)
            .setInteractive()
            .setDepth(1002);
        
        this.add.text(width / 2, height / 2 + 20, 'New Save (Auto-named)', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5)
          .setDepth(1003);
        
        // Add hover effects for debugging
        newSaveBtn.on('pointerover', () => {
            console.log('🔧 New Save button HOVERED');
            newSaveBtn.setFillStyle(0x4444FF); // Lighter blue on hover
        });
        
        newSaveBtn.on('pointerout', () => {
            console.log('🔧 New Save button UN-HOVERED');
            newSaveBtn.setFillStyle(COLORS.BLUE); // Back to normal blue
        });
        
        newSaveBtn.on('pointerdown', () => {
            console.log('🔧 New Save button clicked');
            this.assetManager.playSound(this, 'click', 0.4);
            const saveName = `${this.player.name}_${new Date().toISOString().slice(0, 16).replace('T', '_')}`;
            const success = saveSystem.saveCharacter(this.player, saveName);
            console.log('💾 New save result:', success, 'Save name:', saveName);
            this.showSaveMessage(success ? `Saved as '${saveName}'!` : 'Save failed!', success);
            this.closeSaveMenu(overlay, menuBg);
        });
        
        // Close button
        const closeBtn = this.add.rectangle(width / 2, height / 2 + 100, 200, 50, COLORS.RED)
            .setStrokeStyle(3, COLORS.WHITE)
            .setInteractive()
            .setDepth(1002);
        
        this.add.text(width / 2, height / 2 + 100, 'Cancel', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5)
          .setDepth(1003);
        
        // Add hover effects for debugging
        closeBtn.on('pointerover', () => {
            console.log('🔧 Cancel button HOVERED');
            closeBtn.setFillStyle(0xFF4444); // Lighter red on hover
        });
        
        closeBtn.on('pointerout', () => {
            console.log('🔧 Cancel button UN-HOVERED');
            closeBtn.setFillStyle(COLORS.RED); // Back to normal red
        });
        
        closeBtn.on('pointerdown', () => {
            console.log('🔧 Cancel button clicked');
            this.assetManager.playSound(this, 'click', 0.4);
            this.closeSaveMenu(overlay, menuBg);
        });
    }
    
    closeSaveMenu(overlay, menuBg) {
        console.log('🔧 Closing save menu and restoring main menu');
        
        // Destroy save menu elements (they will be automatically cleaned up)
        // We don't need to manually destroy since we're restoring all elements
        
        // Restore ALL UI elements that were hidden
        this.children.list.forEach(child => {
            // Skip the save menu elements we just created
            if (child.depth < 1000) {
                if (child.setVisible) {
                    child.setVisible(true);
                    if (child.setInteractive && this.isMainMenuButton(child)) {
                        child.setInteractive();
                    }
                }
            } else {
                // Remove save menu elements
                if (child.destroy) {
                    child.destroy();
                }
            }
        });
    }
    
    isMainMenuButton(gameObject) {
        // Check if this is one of our main menu buttons
        return this.buttons.some(btn => btn.rect === gameObject);
    }
    
    showSaveMessage(message, success) {
        const { width, height } = this.scale;
        
        const messageText = this.add.text(width / 2, height - 100, message, {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: success ? '#00FF00' : '#FF0000',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Fade out after 3 seconds
        this.tweens.add({
            targets: messageText,
            alpha: 0,
            duration: 3000,
            onComplete: () => messageText.destroy()
        });
    }
    
    quitGame() {
        // Create confirmation dialog
        const { width, height } = this.scale;
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, COLORS.BLACK, 0.8)
            .setInteractive();
        
        const dialogBg = this.add.rectangle(width / 2, height / 2, 300, 200, COLORS.DARK_GRAY)
            .setStrokeStyle(3, COLORS.WHITE);
        
        this.add.text(width / 2, height / 2 - 40, 'Quit Game?', {
            fontSize: '24px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, height / 2, 'Return to Character Selection?', {
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#CCCCCC'
        }).setOrigin(0.5);
        
        // Yes button
        const yesBtn = this.add.rectangle(width / 2 - 60, height / 2 + 50, 100, 40, COLORS.RED)
            .setStrokeStyle(2, COLORS.WHITE)
            .setInteractive();
        
        this.add.text(width / 2 - 60, height / 2 + 50, 'Yes', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        yesBtn.on('pointerdown', () => {
            this.registry.remove('currentPlayer');
            this.scene.start('CharacterSelection');
        });
        
        // No button
        const noBtn = this.add.rectangle(width / 2 + 60, height / 2 + 50, 100, 40, COLORS.GREEN)
            .setStrokeStyle(2, COLORS.WHITE)
            .setInteractive();
        
        this.add.text(width / 2 + 60, height / 2 + 50, 'No', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        noBtn.on('pointerdown', () => {
            overlay.destroy();
            dialogBg.destroy();
        });
    }
    
    createAudioTestButton() {
        const { width, height } = this.scale;
        
        // Audio test button in top right
        const testButton = this.add.rectangle(width - 100, 50, 120, 40, 0x444444)
            .setStrokeStyle(2, COLORS.WHITE)
            .setInteractive();
        
        this.add.text(width - 100, 50, 'Test Audio', {
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        testButton.on('pointerdown', () => {
            console.log('🔧 Manual audio test triggered');
            
            // Test multiple audio methods
            console.log('🔊 Testing direct sound play...');
            if (this.sound) {
                try {
                    console.log('🔊 Available sounds:', Object.keys(this.sound.sounds));
                    console.log('🔊 Audio cache keys:', this.cache.audio.getKeys());
                    
                    // Try direct play
                    if (this.cache.audio.exists('click')) {
                        this.sound.play('click', { volume: 0.5 });
                        console.log('✅ Click sound played directly');
                    } else {
                        console.warn('❌ Click sound not in cache');
                    }
                    
                    // Try AssetManager method
                    if (this.assetManager) {
                        this.assetManager.playSound(this, 'click', 0.5);
                    }
                } catch (error) {
                    console.error('❌ Audio test failed:', error);
                }
            } else {
                console.error('❌ No sound manager available');
            }
        });
    }
    
    update() {
        // Update player reference in registry in case it was modified
        this.registry.set('currentPlayer', this.player);
    }
}