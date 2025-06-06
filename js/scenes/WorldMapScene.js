// World Map Scene for Battle of the Druids
// Shows all battle locations and allows player to select them

class WorldMapScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WorldMap' });
        this.player = null;
        this.locations = [];
        this.locationCircles = [];
    }
    
    create() {
        const { width, height } = this.scale;
        
        // Get player from registry
        this.player = this.registry.get('currentPlayer');
        
        if (!this.player) {
            this.scene.start('CharacterSelection');
            return;
        }
        
        // Background
        BackgroundRenderer.drawWorldMapBackground(this);
        
        // Initialize asset manager for audio
        this.assetManager = new AssetManager(this);
        
        // Title
        this.add.text(width / 2, 50, 'World Map', {
            fontSize: '48px',
            fontFamily: 'Arial',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Instructions
        this.add.text(width / 2, 100, 'Click on a location to battle!', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        // Main Menu button
        const mainMenuBtn = this.add.rectangle(120, 50, 160, 40, COLORS.DARK_GRAY)
            .setStrokeStyle(2, COLORS.WHITE)
            .setInteractive();
        
        this.add.text(120, 50, 'Main Menu', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        // Main Menu button interactions
        mainMenuBtn.on('pointerdown', () => {
            this.assetManager.playSound(this, 'click', 0.4);
            this.scene.start('MainMenu');
        });
        
        mainMenuBtn.on('pointerover', () => {
            mainMenuBtn.setFillStyle(COLORS.GRAY);
        });
        
        mainMenuBtn.on('pointerout', () => {
            mainMenuBtn.setFillStyle(COLORS.DARK_GRAY);
        });
        
        // Create location markers
        this.createLocationMarkers();
        
        // ESC key to return to main menu
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MainMenu');
        });
        
        // Hover description text (initially empty)
        this.hoverDescription = this.add.text(width / 2, height - 100, '', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setVisible(false);
    }
    
    createLocationMarkers() {
        WORLD_LOCATIONS.forEach(location => {
            // Check if location is unlocked
            const isUnlocked = this.isLocationUnlocked(location);
            
            // Location circle with progress-based colors
            const victories = this.player.locationVictories[location.name] || 0;
            let color;
            if (isUnlocked) {
                if (victories >= 3) {
                    color = COLORS.GREEN; // Completed (3/3)
                } else if (victories > 0) {
                    color = COLORS.YELLOW; // In progress (1/3 or 2/3)
                } else {
                    color = COLORS.GOLD; // Available but not started
                }
            } else {
                color = COLORS.GRAY; // Locked
            }
            
            const locationCircle = this.add.circle(location.x, location.y, 30, color)
                .setStrokeStyle(3, COLORS.BLACK)
                .setInteractive();
            
            // Location name with progress
            let displayText = location.name;
            if (isUnlocked) {
                displayText += `\n(${victories}/3)`;
            }
            
            this.add.text(location.x, location.y + 50, displayText, {
                fontSize: '14px',
                fontFamily: 'Arial',
                fill: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 2,
                align: 'center'
            }).setOrigin(0.5);
            
            // Show requirements for locked locations
            if (!isUnlocked) {
                this.add.text(location.x, location.y + 70, `Req: ${location.minVictoriesRequired} victories`, {
                    fontSize: '12px',
                    fontFamily: 'Arial',
                    fill: '#FF4444'
                }).setOrigin(0.5);
            }
            
            // Interaction handlers
            if (isUnlocked && victories < 3) {
                locationCircle.on('pointerdown', () => {
                    this.selectLocation(location);
                });
                
                locationCircle.on('pointerover', () => {
                    locationCircle.setScale(1.1);
                    this.showLocationDescription(location);
                });
                
                locationCircle.on('pointerout', () => {
                    locationCircle.setScale(1.0);
                    this.hideLocationDescription();
                });
            } else if (isUnlocked && victories >= 3) {
                // Completed location - show info but can't enter
                locationCircle.on('pointerover', () => {
                    this.showCompletedMessage(location);
                });
                
                locationCircle.on('pointerout', () => {
                    this.hideLocationDescription();
                });
                
                locationCircle.on('pointerdown', () => {
                    this.showCompletedMessage(location);
                });
            } else {
                // Show locked state
                locationCircle.on('pointerover', () => {
                    this.showLockedMessage(location);
                });
                
                locationCircle.on('pointerout', () => {
                    this.hideLocationDescription();
                });
            }
            
            this.locationCircles.push(locationCircle);
        });
    }
    
    isLocationUnlocked(location) {
        // Check victory requirements
        if (this.player.victories < location.minVictoriesRequired) {
            return false;
        }
        
        // Check unlock requirements (specific locations)
        if (location.unlockRequirements) {
            for (const reqLocation of location.unlockRequirements) {
                // Require 3 victories per location to unlock dependent locations
                if ((this.player.locationVictories[reqLocation] || 0) < 3) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    selectLocation(location) {
        // Play location selection sound
        this.assetManager.playSound(this, 'click', 0.5);
        
        // Store selected location in registry
        this.registry.set('selectedLocation', location);
        
        // Transition to battle scene
        this.scene.start('Battle');
    }
    
    showLocationDescription(location) {
        this.hoverDescription.setText(location.description);
        this.hoverDescription.setVisible(true);
    }
    
    showLockedMessage(location) {
        let message = `Locked: Need ${location.minVictoriesRequired} victories`;
        
        if (location.unlockRequirements) {
            const uncompletedReqs = location.unlockRequirements.filter(req => 
                !this.player.locationVictories[req]
            );
            
            if (uncompletedReqs.length > 0) {
                message += `\nAlso need: ${uncompletedReqs.join(', ')}`;
            }
        }
        
        this.hoverDescription.setText(message);
        this.hoverDescription.setVisible(true);
    }
    
    hideLocationDescription() {
        this.hoverDescription.setVisible(false);
    }
    
    showCompletedMessage(location) {
        this.hoverDescription.setText(`${location.name} - COMPLETED!\nYou've defeated all enemies here. (3/3)\nTry exploring other locations!`);
        this.hoverDescription.setVisible(true);
    }
    
    update() {
        // Keep player data updated
        this.registry.set('currentPlayer', this.player);
    }
}