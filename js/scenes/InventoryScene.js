// Inventory Scene for Battle of the Druids
// Shows equipped items and character stats

class InventoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Inventory' });
        this.player = null;
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
        BackgroundRenderer.drawInventoryBackground(this);
        
        // Initialize asset manager and start menu music
        this.assetManager = new AssetManager(this);
        this.assetManager.playMenuMusic(this, true, 0.15);
        
        // Title
        this.add.text(width / 2, 80, `${this.player.name}'s Equipment`, {
            fontSize: '48px',
            fontFamily: 'Arial',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Create equipment display
        this.createEquipmentDisplay();
        
        // Create stats display
        this.createStatsDisplay();
        
        // Back button
        const backButton = this.add.rectangle(100, height - 80, 120, 40, COLORS.DARK_GRAY)
            .setStrokeStyle(2, COLORS.WHITE)
            .setInteractive();
        
        this.add.text(100, height - 80, 'Back', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        backButton.on('pointerdown', () => this.scene.start('MainMenu'));
        backButton.on('pointerover', () => backButton.setFillStyle(COLORS.GRAY));
        backButton.on('pointerout', () => backButton.setFillStyle(COLORS.DARK_GRAY));
        
        // Instructions
        this.add.text(width / 2, height - 150, 'Visit the Store to purchase better equipment!', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#ADD8E6'
        }).setOrigin(0.5);
        
        // Note: Keyboard input disabled to prevent mobile keyboard popup
    }
    
    createEquipmentDisplay() {
        const { width, height } = this.scale;
        
        // Equipment slot positions
        const slotPositions = Inventory.getEquipmentSlotPositions();
        
        // Draw each equipment slot
        Object.entries(slotPositions).forEach(([slot, position]) => {
            const equippedItem = this.player.getEquippedItem(slot);
            
            if (equippedItem) {
                const equipment = new Equipment(equippedItem);
                Inventory.drawEquipmentSlot(this, slot, position, equipment);
            } else {
                Inventory.drawEquipmentSlot(this, slot, position, null);
            }
        });
    }
    
    createStatsDisplay() {
        const { width } = this.scale;
        
        // Stats panel background
        const statsX = 50;
        const statsY = 200;
        const statsWidth = 300;
        const statsHeight = 400;
        
        this.add.rectangle(statsX + statsWidth / 2, statsY + statsHeight / 2, statsWidth, statsHeight, COLORS.BLACK, 0.7)
            .setStrokeStyle(2, COLORS.WHITE);
        
        // Stats title
        this.add.text(statsX + statsWidth / 2, statsY + 30, 'Current Stats:', {
            fontSize: '24px',
            fontFamily: 'Arial',
            fill: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Calculate total stats
        const totalAttack = this.player.getTotalAttack();
        const totalDefense = this.player.getTotalDefense();
        const totalSpeed = this.player.getTotalSpeed();
        
        // Display stats
        const stats = [
            `Health: ${this.player.health}/${this.player.maxHealth}`,
            `Attack: ${totalAttack} (${this.player.baseAttack}+${this.player.weaponBonus})`,
            `Defense: ${totalDefense} (${this.player.baseDefense}+${this.player.armorBonus})`,
            `Speed: ${totalSpeed} (${this.player.baseSpeed}+${this.player.accessoryBonus})`
        ];
        
        // Add wizard mana if applicable
        if (this.player.charType === CharacterType.WIZARD) {
            stats.push(`Mana: ${this.player.mana}/${this.player.maxMana}`);
        }
        
        stats.forEach((stat, index) => {
            this.add.text(statsX + 20, statsY + 80 + index * 35, stat, {
                fontSize: '18px',
                fontFamily: 'Arial',
                fill: '#FFFFFF'
            });
        });
        
        // Character progression stats
        const progressY = statsY + 80 + stats.length * 35 + 30;
        
        this.add.text(statsX + statsWidth / 2, progressY, 'Progress:', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const progressStats = [
            `Total Victories: ${this.player.victories}`,
            `Gold: ${this.player.gold}`,
            `Dragon Shards: ${this.player.dragonShards}`
        ];
        
        progressStats.forEach((stat, index) => {
            this.add.text(statsX + 20, progressY + 40 + index * 30, stat, {
                fontSize: '16px',
                fontFamily: 'Arial',
                fill: '#CCCCCC'
            });
        });
        
        // Location victories
        if (Object.keys(this.player.locationVictories).length > 0) {
            const locationY = progressY + 40 + progressStats.length * 30 + 20;
            
            this.add.text(statsX + statsWidth / 2, locationY, 'Location Victories:', {
                fontSize: '18px',
                fontFamily: 'Arial',
                fill: '#FFD700'
            }).setOrigin(0.5);
            
            let victoryY = locationY + 30;
            Object.entries(this.player.locationVictories).forEach(([location, count]) => {
                this.add.text(statsX + 20, victoryY, `${location}: ${count}`, {
                    fontSize: '14px',
                    fontFamily: 'Arial',
                    fill: '#CCCCCC'
                });
                victoryY += 25;
            });
        }
    }
    
    update() {
        // Keep player data updated
        this.registry.set('currentPlayer', this.player);
    }
}