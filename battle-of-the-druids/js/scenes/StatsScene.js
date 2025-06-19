/*
 * Battle of the Druids - Web Edition
 * StatsScene.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

class StatsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Stats' });
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
        BackgroundRenderer.drawMenuBackground(this);
        
        // Title
        this.add.text(width / 2, 100, `${this.player.name}'s Stats`, {
            fontSize: '48px',
            fontFamily: 'Arial',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Character display (simple circle representation)
        this.add.circle(width / 2, 250, 75, this.player.getCharacterColor())
            .setStrokeStyle(3, COLORS.BLACK);
        
        // Draw weapon indicator
        this.drawWeaponIndicator(width / 2, 250);
        
        // Create stats display
        this.createStatsDisplay();
        
        // Back button
        const backButton = this.add.rectangle(width / 2, height - 80, 150, 50, COLORS.DARK_GRAY)
            .setStrokeStyle(2, COLORS.WHITE)
            .setInteractive();
        
        this.add.text(width / 2, height - 80, 'Back', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        backButton.on('pointerdown', () => this.scene.start('MainMenu'));
        backButton.on('pointerover', () => backButton.setFillStyle(COLORS.GRAY));
        backButton.on('pointerout', () => backButton.setFillStyle(COLORS.DARK_GRAY));
        
        // Note: ESC key disabled to prevent mobile keyboard popup
    }
    
    drawWeaponIndicator(x, y) {
        if (this.player.charType === CharacterType.KNIGHT) {
            // Sword
            this.add.line(x, y, 0, 0, 30, -30, this.player.getWeaponColor()).setLineWidth(5);
            this.add.circle(x + 15, y - 15, 6, COLORS.GOLD);
        } else if (this.player.charType === CharacterType.WIZARD) {
            // Staff
            this.add.line(x, y, 0, 0, 25, -60, this.player.getWeaponColor()).setLineWidth(4);
            this.add.circle(x + 25, y - 60, 10, COLORS.PURPLE);
        } else if (this.player.charType === CharacterType.ROGUE) {
            // Daggers
            this.add.line(x, y, 0, 0, 22, -22, this.player.getWeaponColor()).setLineWidth(3);
            this.add.line(x, y, 7, -7, 22, -22, this.player.getWeaponColor()).setLineWidth(3);
        } else if (this.player.charType === CharacterType.SOLDIER) {
            // Rifle
            this.add.line(x, y, 0, 0, 60, -15, this.player.getWeaponColor()).setLineWidth(5);
            this.add.circle(x, y, 4, COLORS.BLACK);
        }
    }
    
    createStatsDisplay() {
        const { width } = this.scale;
        let statsY = 350;
        
        // Basic stats
        const stats = [
            `Health: ${this.player.health}/${this.player.maxHealth}`,
            `Attack: ${this.player.getTotalAttack()} (${this.player.baseAttack}+${this.player.weaponBonus} from equipment)`,
            `Defense: ${this.player.getTotalDefense()} (${this.player.baseDefense}+${this.player.armorBonus} from equipment)`,
            `Speed: ${this.player.getTotalSpeed()} (${this.player.baseSpeed}+${this.player.accessoryBonus} from equipment)`,
            `Total Victories: ${this.player.victories}`,
            `Gold: ${this.player.gold}`,
            `Dragon Shards: ${this.player.dragonShards}`
        ];
        
        // Add wizard mana if applicable
        if (this.player.charType === CharacterType.WIZARD) {
            stats.splice(4, 0, `Mana: ${this.player.mana}/${this.player.maxMana}`);
        }
        
        stats.forEach(stat => {
            this.add.text(width / 2, statsY, stat, {
                fontSize: '20px',
                fontFamily: 'Arial',
                fill: '#FFFFFF'
            }).setOrigin(0.5);
            statsY += 30;
        });
        
        // Location victories
        if (Object.keys(this.player.locationVictories).length > 0) {
            statsY += 20;
            
            this.add.text(width / 2, statsY, 'Location Victories:', {
                fontSize: '24px',
                fontFamily: 'Arial',
                fill: '#FFD700',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            statsY += 40;
            
            Object.entries(this.player.locationVictories).forEach(([location, count]) => {
                this.add.text(width / 2, statsY, `${location}: ${count} victories`, {
                    fontSize: '16px',
                    fontFamily: 'Arial',
                    fill: '#FFFFFF'
                }).setOrigin(0.5);
                statsY += 25;
            });
        }
    }
    
    update() {
        // Keep player data updated
        this.registry.set('currentPlayer', this.player);
    }
}