/*
 * Battle of the Druids - Web Edition
 * BattleScene.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Battle' });
        this.player = null;
        this.enemy = null;
        this.location = null;
        this.effectManager = null;
        this.battleOver = false;
        this.playerTurn = true;
        this.turnTimer = 0;
        this.statusMessage = "";
        this.statusTimer = 0;
        
        // UI elements
        this.playerHealthBar = null;
        this.enemyHealthBar = null;
        this.playerManaBar = null;
        this.battleButtons = [];
        this.statusText = null;
        this.turnIndicator = null;
        
        // Event cleanup tracking
        this.keyboardEvents = [];
    }
    
    create() {
        const { width, height } = this.scale;
        
        // Get data from registry
        this.player = this.registry.get('currentPlayer');
        this.location = this.registry.get('selectedLocation');
        
        if (!this.player || !this.location) {
            this.scene.start('MainMenu');
            return;
        }
        
        // Create enemy for this location
        const randomEnemyType = this.location.enemies[Math.floor(Math.random() * this.location.enemies.length)];
        this.enemy = createEnemy(randomEnemyType, this.player.victories, this.location.name);
        
        // Initialize battle state
        this.battleOver = false;
        this.playerTurn = true;
        this.turnTimer = 0;
        
        // Background
        BackgroundRenderer.drawBattleBackground(this, this.location);
        
        // Initialize effect manager
        this.effectManager = new EffectManager(this);
        
        // Initialize asset manager for audio and start battle music
        this.assetManager = new AssetManager(this);
        this.assetManager.playWorldMusic(this, true, 0.3);
        
        // Create UI
        this.createBattleUI();
        
        // Draw characters
        this.createCharacterDisplays();
        
        // Show enemy dialogue AFTER all UI is created
        this.showEnemyDialogue(randomEnemyType);
        
        // ESC key to return (forfeit battle)
        const escHandler = () => {
            this.forfeitBattle();
        };
        // Note: ESC key disabled to prevent mobile keyboard popup
        // this.input.keyboard.on('keydown-ESC', escHandler);
        // this.keyboardEvents.push({ key: 'keydown-ESC', handler: escHandler });
    }
    
    shutdown() {
        // Clean up keyboard events
        if (this.keyboardEvents) {
            this.keyboardEvents.forEach(event => {
                this.input.keyboard.off(event.key, event.handler);
            });
            this.keyboardEvents = [];
        }
        
        // Clean up battle buttons
        if (this.battleButtons) {
            this.battleButtons.forEach(button => {
                if (button && button.destroy) {
                    button.destroy();
                }
            });
            this.battleButtons = [];
        }
        
        // Clean up effect manager
        if (this.effectManager) {
            this.effectManager.clearAll();
            this.effectManager = null;
        }
        
        // Stop any background music
        if (this.sound && this.sound.get('background_music')) {
            this.sound.get('background_music').stop();
        }
        
        // Clear references
        this.player = null;
        this.enemy = null;
        this.location = null;
        this.assetManager = null;
    }
    
    createBattleUI() {
        const { width, height } = this.scale;
        
        // Turn indicator
        this.turnIndicator = this.add.text(width / 2, 100, 'Your Turn', {
            fontSize: '32px',
            fontFamily: 'Arial',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Status message
        this.statusText = this.add.text(width / 2, 150, '', {
            fontSize: '24px',
            fontFamily: 'Arial',
            fill: '#FFFF00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Create battle buttons based on character type
        this.createBattleButtons();
        
        // Create health/mana bars
        this.createHealthBars();
    }
    
    createBattleButtons() {
        const { width, height } = this.scale;
        
        // Clear existing buttons
        this.battleButtons.forEach(btn => {
            if (btn.rect) btn.rect.destroy();
            if (btn.text) btn.text.destroy();
        });
        this.battleButtons = [];
        
        if (this.player.charType === CharacterType.WIZARD) {
            // Wizard spell buttons
            const spellButtons = [
                { text: 'Attack', action: () => this.playerAttack(), x: 120, key: null },
                { text: 'Fireball', action: () => this.castSpell('fireball'), x: 270, key: 'fireball' },
                { text: 'Ice Shard', action: () => this.castSpell('iceShard'), x: 420, key: 'iceShard' },
                { text: 'Lightning', action: () => this.castSpell('lightningBolt'), x: 570, key: 'lightningBolt' },
                { text: 'Heal', action: () => this.castSpell('arcaneHealing'), x: 720, key: 'arcaneHealing' }
            ];
            
            spellButtons.forEach((btn, index) => {
                const canCast = !btn.key || this.player.canCastSpell(btn.key);
                const buttonColor = canCast ? COLORS.DARK_GRAY : 0x2a2a2a;
                const textColor = canCast ? '#FFFFFF' : '#666666';
                
                const button = this.add.rectangle(btn.x, height - 150, 120, 40, buttonColor)
                    .setStrokeStyle(2, COLORS.WHITE);
                
                const buttonText = this.add.text(btn.x, height - 150, btn.text, {
                    fontSize: '16px',
                    fontFamily: 'Arial',
                    fill: textColor
                }).setOrigin(0.5);
                
                if (canCast) {
                    button.setInteractive();
                    button.on('pointerdown', btn.action);
                    button.on('pointerover', () => button.setFillStyle(COLORS.GRAY));
                    button.on('pointerout', () => button.setFillStyle(COLORS.DARK_GRAY));
                }
                
                // Show mana cost for spells
                if (btn.key && WIZARD_SPELLS[btn.key]) {
                    const spell = WIZARD_SPELLS[btn.key];
                    this.add.text(btn.x, height - 125, `${spell.manaCost}MP`, {
                        fontSize: '12px',
                        fontFamily: 'Arial',
                        fill: '#40E0D0'
                    }).setOrigin(0.5);
                }
                
                this.battleButtons.push({ rect: button, text: buttonText, key: btn.key });
            });
        } else {
            // Regular character buttons
            const regularButtons = [
                { text: 'Attack', action: () => this.playerAttack(), x: 200 },
                { text: 'Special', action: () => this.playerSpecialAttack(), x: 400 },
                { text: 'Heal', action: () => this.playerHeal(), x: 600 }
            ];
            
            regularButtons.forEach(btn => {
                const button = this.add.rectangle(btn.x, height - 150, 120, 40, COLORS.DARK_GRAY)
                    .setStrokeStyle(2, COLORS.WHITE)
                    .setInteractive();
                
                const buttonText = this.add.text(btn.x, height - 150, btn.text, {
                    fontSize: '18px',
                    fontFamily: 'Arial',
                    fill: '#FFFFFF'
                }).setOrigin(0.5);
                
                button.on('pointerdown', btn.action);
                button.on('pointerover', () => button.setFillStyle(COLORS.GRAY));
                button.on('pointerout', () => button.setFillStyle(COLORS.DARK_GRAY));
                
                this.battleButtons.push({ rect: button, text: buttonText });
            });
        }
    }
    
    createHealthBars() {
        const { width, height } = this.scale;
        
        // Player health bar (left side)
        this.createHealthBar(100, 50, this.player, 'player');
        
        // Enemy health bar (right side)
        this.createHealthBar(width - 250, 50, this.enemy, 'enemy');
        
        // Wizard mana bar
        if (this.player.charType === CharacterType.WIZARD) {
            this.createManaBar();
        }
    }
    
    createHealthBar(x, y, character, type) {
        const barWidth = 200;
        const barHeight = 20;
        
        // Character name
        this.add.text(x + barWidth / 2, y - 25, character.name, {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Health bar background
        const healthBg = this.add.rectangle(x + barWidth / 2, y, barWidth, barHeight, COLORS.RED);
        
        // Health bar fill (left-aligned)
        const healthRatio = character.health / character.maxHealth;
        const fillWidth = barWidth * healthRatio;
        const healthFill = this.add.rectangle(
            x + fillWidth / 2, // Position from left edge of bar
            y, 
            fillWidth, 
            barHeight, 
            COLORS.GREEN
        );
        
        // Health bar border
        this.add.rectangle(x + barWidth / 2, y, barWidth, barHeight)
            .setStrokeStyle(2, COLORS.WHITE)
            .setFillStyle();
        
        // Health text
        const healthText = this.add.text(x + barWidth / 2, y, `${character.health}/${character.maxHealth}`, {
            fontSize: '14px',
            fontFamily: 'Arial',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);
        
        // Store references for updates
        if (type === 'player') {
            this.playerHealthBar = { 
                bg: healthBg, 
                fill: healthFill, 
                text: healthText, 
                x: x, 
                barWidth: barWidth 
            };
        } else {
            this.enemyHealthBar = { 
                bg: healthBg, 
                fill: healthFill, 
                text: healthText, 
                x: x, 
                barWidth: barWidth 
            };
        }
    }
    
    createManaBar() {
        const x = 100;
        const y = 80;
        const barWidth = 200;
        const barHeight = 12;
        
        // Mana bar background
        const manaBg = this.add.rectangle(x + barWidth / 2, y, barWidth, barHeight, COLORS.DARK_GRAY);
        
        // Mana bar fill (left-aligned)
        const manaRatio = this.player.mana / this.player.maxMana;
        const fillWidth = barWidth * manaRatio;
        const manaFill = this.add.rectangle(
            x + fillWidth / 2,
            y,
            fillWidth,
            barHeight,
            COLORS.TURQUOISE
        );
        
        // Mana bar border
        this.add.rectangle(x + barWidth / 2, y, barWidth, barHeight)
            .setStrokeStyle(2, COLORS.WHITE)
            .setFillStyle();
        
        // Mana text
        const manaText = this.add.text(x + barWidth / 2, y + 20, `Mana: ${this.player.mana}/${this.player.maxMana}`, {
            fontSize: '14px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        this.playerManaBar = { 
            bg: manaBg, 
            fill: manaFill, 
            text: manaText, 
            x: x, 
            barWidth: barWidth 
        };
    }
    
    createCharacterDisplays() {
        const { width, height } = this.scale;
        
        // Initialize asset manager for this scene
        this.assetManager = new AssetManager(this);
        
        // Player character (left side)
        this.playerImage = this.assetManager.getCharacterImage(this, this.player.charType.toLowerCase(), 300, 350, 180);
        
        // Enemy character (right side)
        this.enemyImage = this.assetManager.getEnemyImage(this, this.enemy.name, width - 300, 350, 180);
    }
    
    drawWeaponIndicator(x, y, character) {
        if (character.charType === CharacterType.KNIGHT) {
            // Sword
            this.add.line(x, y, 0, 0, 30, -30, character.getWeaponColor()).setLineWidth(5);
            this.add.circle(x + 15, y - 15, 6, COLORS.GOLD);
        } else if (character.charType === CharacterType.WIZARD) {
            // Staff
            this.add.line(x, y, 0, 0, 25, -60, character.getWeaponColor()).setLineWidth(4);
            this.add.circle(x + 25, y - 60, 10, COLORS.PURPLE);
        } else if (character.charType === CharacterType.ROGUE) {
            // Daggers
            this.add.line(x, y, 0, 0, 22, -22, character.getWeaponColor()).setLineWidth(3);
            this.add.line(x, y, 7, -7, 22, -22, character.getWeaponColor()).setLineWidth(3);
        } else if (character.charType === CharacterType.SOLDIER) {
            // Rifle
            this.add.line(x, y, 0, 0, 60, -15, character.getWeaponColor()).setLineWidth(5);
            this.add.circle(x, y, 4, COLORS.BLACK);
        }
    }
    
    // Battle action methods
    playerAttack() {
        if (!this.playerTurn || this.turnTimer > 0 || this.battleOver) return;
        
        // Play attack sound (higher volume for custom MP3)
        this.assetManager.playSound(this, 'attack', 0.9);
        
        const damage = this.player.attackEnemy(this.enemy);
        this.effectManager.addDamageNumber(this.scale.width - 300, 350, damage);
        this.effectManager.addAttackEffect(this.scale.width - 300, 350, 'slash');
        
        this.playerTurn = false;
        this.turnTimer = 60;
        this.player.regenerateMana(8); // Increased from 5 to 8 for better mana economy
        
        this.updateUI();
        this.checkBattleEnd();
    }
    
    playerSpecialAttack() {
        if (!this.playerTurn || this.turnTimer > 0 || this.battleOver) return;
        
        // Play special attack sound
        this.assetManager.playSound(this, 'special', 0.7);
        
        const damage = this.player.specialAttack(this.enemy);
        this.effectManager.addDamageNumber(this.scale.width - 300, 350, damage, true);
        
        const effectType = `special_${this.player.charType.toLowerCase()}`;
        this.effectManager.addAttackEffect(this.scale.width - 300, 350, effectType);
        
        this.playerTurn = false;
        this.turnTimer = 60;
        
        this.updateUI();
        this.checkBattleEnd();
    }
    
    playerHeal() {
        if (!this.playerTurn || this.turnTimer > 0 || this.battleOver) return;
        
        // Play heal sound
        this.assetManager.playSound(this, 'heal', 0.5);
        
        const healAmount = this.player.heal();
        this.effectManager.addDamageNumber(300, 350, healAmount, false, true);
        
        this.playerTurn = false;
        this.turnTimer = 60;
        
        this.updateUI();
    }
    
    castSpell(spellKey) {
        if (!this.playerTurn || this.turnTimer > 0 || this.battleOver) return;
        if (!this.player.canCastSpell(spellKey)) {
            this.showStatusMessage("Not enough mana!", 60);
            return;
        }
        
        const result = this.player.castSpell(spellKey, this.enemy);
        
        if (result.effect === "heal") {
            // Play heal sound for healing spells
            this.assetManager.playSound(this, 'heal', 0.5);
            this.effectManager.addDamageNumber(300, 350, result.damage, false, true);
            this.effectManager.addAttackEffect(300, 350, 'spell_heal');
            this.showStatusMessage(`Healed for ${result.damage} HP!`, 120);
        } else {
            // Play special sound for offensive spells
            this.assetManager.playSound(this, 'special', 0.6);
            this.effectManager.addDamageNumber(this.scale.width - 300, 350, result.damage, true);
            this.effectManager.addAttackEffect(this.scale.width - 300, 350, `spell_${result.effect}`);
            
            if (result.effect === "freeze") {
                this.showStatusMessage(`Ice Shard: ${result.damage} damage! Enemy frozen!`, 120);
            } else if (result.effect === "pierce") {
                this.showStatusMessage(`Lightning: ${result.damage} damage! (Pierced armor)`, 120);
            } else if (result.effect === "fire") {
                this.showStatusMessage(`Fireball: ${result.damage} damage!`, 120);
            }
        }
        
        this.playerTurn = false;
        this.turnTimer = 60;
        
        this.updateUI();
        this.checkBattleEnd();
    }
    
    enemyTurn() {
        if (this.battleOver || this.enemy.health <= 0) return;
        
        // Check if enemy is frozen
        if (this.enemy.frozenTurns > 0) {
            this.enemy.frozenTurns--;
            this.showStatusMessage(`Enemy frozen! ${this.enemy.frozenTurns} turns remaining`, 120);
            this.playerTurn = true;
            this.turnTimer = 60;
            return;
        }
        
        // Simple AI
        const action = Math.random();
        if (action < 0.6) {
            // Attack
            const damage = this.enemy.attackEnemy(this.player);
            this.effectManager.addDamageNumber(300, 350, damage);
            this.effectManager.addAttackEffect(300, 350, 'slash');
        } else if (action < 0.8) {
            // Special attack
            const damage = this.enemy.specialAttack(this.player);
            this.effectManager.addDamageNumber(300, 350, damage, true);
            this.effectManager.addAttackEffect(300, 350, `special_${this.enemy.enemyType}`);
        } else {
            // Heal
            const healAmount = this.enemy.heal();
            this.effectManager.addDamageNumber(this.scale.width - 300, 350, healAmount, false, true);
        }
        
        this.playerTurn = true;
        this.turnTimer = 60;
        
        this.updateUI();
        this.checkBattleEnd();
    }
    
    updateUI() {
        // Update health bars with proper left-to-right draining
        if (this.playerHealthBar) {
            const healthRatio = this.player.health / this.player.maxHealth;
            const newWidth = this.playerHealthBar.barWidth * healthRatio;
            
            // Update fill bar width and position from left edge
            this.playerHealthBar.fill.setSize(newWidth, 20);
            this.playerHealthBar.fill.setPosition(this.playerHealthBar.x + newWidth / 2, this.playerHealthBar.fill.y);
            this.playerHealthBar.text.setText(`${this.player.health}/${this.player.maxHealth}`);
        }
        
        if (this.enemyHealthBar) {
            const healthRatio = this.enemy.health / this.enemy.maxHealth;
            const newWidth = this.enemyHealthBar.barWidth * healthRatio;
            
            // Update fill bar width and position from left edge
            this.enemyHealthBar.fill.setSize(newWidth, 20);
            this.enemyHealthBar.fill.setPosition(this.enemyHealthBar.x + newWidth / 2, this.enemyHealthBar.fill.y);
            this.enemyHealthBar.text.setText(`${this.enemy.health}/${this.enemy.maxHealth}`);
        }
        
        // Update mana bar for wizards with proper left-to-right draining
        if (this.playerManaBar && this.player.charType === CharacterType.WIZARD) {
            const manaRatio = this.player.mana / this.player.maxMana;
            const newWidth = this.playerManaBar.barWidth * manaRatio;
            
            // Update fill bar width and position from left edge
            this.playerManaBar.fill.setSize(newWidth, 12);
            this.playerManaBar.fill.setPosition(this.playerManaBar.x + newWidth / 2, this.playerManaBar.fill.y);
            this.playerManaBar.text.setText(`Mana: ${this.player.mana}/${this.player.maxMana}`);
        }
        
        // Update turn indicator
        this.turnIndicator.setText(this.playerTurn ? "Your Turn" : "Enemy Turn");
        
        // Update battle buttons for wizards
        if (this.player.charType === CharacterType.WIZARD) {
            this.createBattleButtons();
        }
    }
    
    showStatusMessage(message, duration) {
        this.statusMessage = message;
        this.statusTimer = duration;
        this.statusText.setText(message);
    }
    
    checkBattleEnd() {
        if (this.player.health <= 0) {
            this.battleOver = true;
            this.showDefeat();
        } else if (this.enemy.health <= 0) {
            this.battleOver = true;
            this.showVictory();
        }
    }
    
    showVictory() {
        const { width, height } = this.scale;
        
        // Play victory sound
        this.assetManager.playSound(this, 'victory', 0.8);
        
        // Calculate rewards (improved gold economy)
        const goldReward = Math.floor(Math.random() * 31) + 30 + this.location.minVictoriesRequired * 15; // Increased base and multiplier
        const shardReward = Math.floor(Math.random() * 3) + 1;
        
        // Update player
        this.player.victories++;
        this.player.gold += goldReward;
        this.player.dragonShards += shardReward;
        this.player.locationVictories[this.location.name] = (this.player.locationVictories[this.location.name] || 0) + 1;
        
        // Check for final victory at Battle of Druids Castle
        const isFinaleVictory = this.location.name === "Battle of Druids Castle" && 
                               this.player.locationVictories[this.location.name] === 3;
        
        console.log(`🏰 Victory check: Location=${this.location.name}, Victories=${this.player.locationVictories[this.location.name]}, IsFinale=${isFinaleVictory}`);
        
        
        // Show special finale victory or regular victory
        if (isFinaleVictory) {
            this.showFinaleVictory();
        } else {
            this.showRegularVictory(goldReward, shardReward);
        }
    }
    
    showRegularVictory(goldReward, shardReward) {
        const { width, height } = this.scale;
        
        // Victory overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, COLORS.BLACK, 0.8);
        
        this.add.text(width / 2, height / 2 - 100, 'VICTORY!', {
            fontSize: '64px',
            fontFamily: 'Arial',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        const rewardText = [
            `Gold Earned: +${goldReward}`,
            `Dragon Shards: +${shardReward}`,
            `Total Victories: ${this.player.victories}`,
            `Location Cleared: ${this.location.name}`
        ];
        
        rewardText.forEach((text, index) => {
            this.add.text(width / 2, height / 2 - 20 + index * 30, text, {
                fontSize: '20px',
                fontFamily: 'Arial',
                fill: '#FFFFFF'
            }).setOrigin(0.5);
        });
        
        // Continue button
        const continueBtn = this.add.rectangle(width / 2, height / 2 + 150, 200, 50, COLORS.GREEN)
            .setStrokeStyle(2, COLORS.WHITE)
            .setInteractive();
        
        this.add.text(width / 2, height / 2 + 150, 'Continue', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        continueBtn.on('pointerdown', () => {
            this.registry.set('currentPlayer', this.player);
            this.scene.start('WorldMap'); // Return to world map instead of main menu
        });
    }
    
    showFinaleVictory() {
        const { width, height } = this.scale;
        
        // Play victory fanfare
        this.assetManager.playVictoryFanfare(this, 0.8);
        
        // Dark overlay background
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, COLORS.BLACK, 0.9);
        
        // Show victory image if loaded, otherwise use colored background
        let victoryImage = null;
        if (this.textures.exists('victory')) {
            victoryImage = this.add.image(width / 2, height / 2 - 50, 'victory');
            victoryImage.setDisplaySize(Math.min(400, width * 0.6), Math.min(300, height * 0.4));
        } else {
            // Fallback: decorative golden rectangle
            victoryImage = this.add.rectangle(width / 2, height / 2 - 50, 400, 200, COLORS.GOLD)
                .setStrokeStyle(5, COLORS.WHITE);
        }
        
        // Main congratulations message
        this.add.text(width / 2, height / 2 + 150, 'Congratulations you are victorious!', {
            fontSize: '32px',
            fontFamily: 'Arial',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);
        
        // Additional celebration text
        this.add.text(width / 2, height / 2 + 200, 'You have conquered the Battle of Druids Castle!', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, height / 2 + 230, 'You are the ultimate champion!', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#FFD700',
            fontStyle: 'italic',
            align: 'center'
        }).setOrigin(0.5);
        
        // Continue button (larger and more prominent)
        const continueBtn = this.add.rectangle(width / 2, height / 2 + 300, 250, 60, COLORS.GOLD)
            .setStrokeStyle(3, COLORS.WHITE)
            .setInteractive();
        
        this.add.text(width / 2, height / 2 + 300, 'Continue Your Journey', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Add some particle effects for celebration
        this.createCelebrationEffects();
        
        continueBtn.on('pointerdown', () => {
            this.registry.set('currentPlayer', this.player);
            this.scene.start('WorldMap');
        });
    }
    
    createCelebrationEffects() {
        const { width, height } = this.scale;
        
        // Create golden sparkles around the screen
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const sparkle = this.add.circle(x, y, Math.random() * 3 + 1, COLORS.GOLD, 0.8);
            
            // Animate sparkles
            this.tweens.add({
                targets: sparkle,
                alpha: 0,
                scaleX: 2,
                scaleY: 2,
                duration: 2000,
                delay: Math.random() * 1000,
                ease: 'Power2',
                onComplete: () => {
                    sparkle.destroy();
                }
            });
        }
        
        // Add some floating text effects
        const celebrationTexts = ['🎉', '⭐', '👑', '🏆'];
        celebrationTexts.forEach((text, index) => {
            const textObj = this.add.text(
                100 + index * (width - 200) / 3, 
                height - 100, 
                text, 
                { fontSize: '24px' }
            );
            
            this.tweens.add({
                targets: textObj,
                y: 50,
                alpha: 0,
                duration: 3000,
                delay: index * 500,
                ease: 'Power2',
                onComplete: () => {
                    textObj.destroy();
                }
            });
        });
    }
    
    showDefeat() {
        const { width, height } = this.scale;
        
        // Play defeat sound
        this.assetManager.playSound(this, 'defeat', 0.7);
        
        // Defeat overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, COLORS.BLACK, 0.8);
        
        this.add.text(width / 2, height / 2 - 50, 'DEFEAT', {
            fontSize: '64px',
            fontFamily: 'Arial',
            fill: '#FF0000',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.add.text(width / 2, height / 2 + 20, 'Better luck next time, warrior!', {
            fontSize: '24px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        // Continue button
        const continueBtn = this.add.rectangle(width / 2, height / 2 + 100, 200, 50, COLORS.RED)
            .setStrokeStyle(2, COLORS.WHITE)
            .setInteractive();
        
        this.add.text(width / 2, height / 2 + 100, 'Continue', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        continueBtn.on('pointerdown', () => {
            // Restore player health
            this.player.health = this.player.maxHealth;
            this.registry.set('currentPlayer', this.player);
            this.scene.start('MainMenu');
        });
    }
    
    forfeitBattle() {
        // Show confirmation dialog
        const { width, height } = this.scale;
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, COLORS.BLACK, 0.8)
            .setInteractive();
        
        const dialogBg = this.add.rectangle(width / 2, height / 2, 300, 200, COLORS.DARK_GRAY)
            .setStrokeStyle(3, COLORS.WHITE);
        
        this.add.text(width / 2, height / 2 - 40, 'Forfeit Battle?', {
            fontSize: '24px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        // Yes button
        const yesBtn = this.add.rectangle(width / 2 - 60, height / 2 + 30, 100, 40, COLORS.RED)
            .setStrokeStyle(2, COLORS.WHITE)
            .setInteractive();
        
        this.add.text(width / 2 - 60, height / 2 + 30, 'Yes', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        yesBtn.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
        
        // No button
        const noBtn = this.add.rectangle(width / 2 + 60, height / 2 + 30, 100, 40, COLORS.GREEN)
            .setStrokeStyle(2, COLORS.WHITE)
            .setInteractive();
        
        this.add.text(width / 2 + 60, height / 2 + 30, 'No', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        noBtn.on('pointerdown', () => {
            overlay.destroy();
            dialogBg.destroy();
        });
    }
    
    update() {
        // Update timers
        if (this.turnTimer > 0) {
            this.turnTimer--;
        }
        
        if (this.statusTimer > 0) {
            this.statusTimer--;
            if (this.statusTimer <= 0) {
                this.statusText.setText('');
            }
        }
        
        // Handle turn transitions
        if (!this.battleOver && this.turnTimer <= 0) {
            if (!this.playerTurn) {
                this.enemyTurn();
            }
        }
        
        // Update registry
        this.registry.set('currentPlayer', this.player);
    }
    
    showEnemyDialogue(enemyType) {
        console.log(`💬 showEnemyDialogue called with enemyType: ${enemyType}`);
        console.log(`💬 Enemy object:`, this.enemy);
        console.log(`💬 Enemy name: ${this.enemy?.name}, Enemy type: ${this.enemy?.enemyType}`);
        const { width, height } = this.scale;
        
        // Get random dialogue for this enemy type
        let dialogue = "Let's battle!"; // Default fallback
        if (ENEMY_DIALOGUE && ENEMY_DIALOGUE[enemyType]) {
            const dialogues = ENEMY_DIALOGUE[enemyType];
            dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
            console.log(`💬 Found dialogue: "${dialogue}"`);
        } else {
            console.warn(`💬 No dialogue found for enemy type: ${enemyType}`);
            console.log(`💬 Available enemy types:`, ENEMY_DIALOGUE ? Object.keys(ENEMY_DIALOGUE) : 'ENEMY_DIALOGUE not loaded');
            console.log(`💬 Using fallback dialogue: "${dialogue}"`);
        }
        
        // Create dialogue bubble with high depth to appear on top (more visible positioning)
        const dialogueY = 200; // Lower position to avoid conflict with health bars
        console.log(`💬 Creating dialogue bubble at position (${width / 2}, ${dialogueY})`);
        const dialogueBg = this.add.rectangle(width / 2, dialogueY, width - 60, 120, 0x001133, 0.95)
            .setStrokeStyle(5, COLORS.YELLOW) // Thicker yellow border
            .setDepth(2000); // Even higher depth to appear on top
        
        const dialogueText = this.add.text(width / 2, dialogueY, `"${dialogue}"`, {
            fontSize: '22px', // Even larger font
            fontFamily: 'Arial',
            fill: '#FFFF99',
            stroke: '#000033',
            strokeThickness: 3,
            align: 'center',
            fontStyle: 'bold',
            wordWrap: { width: width - 120 }
        }).setOrigin(0.5)
          .setDepth(2001); // Even higher depth for text
        
        // Enemy name label
        const enemyName = this.enemy.name || enemyType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        console.log(`💬 Enemy name: ${enemyName}`);
        const nameText = this.add.text(width / 2, dialogueY - 45, enemyName + " says:", {
            fontSize: '20px', // Larger font
            fontFamily: 'Arial',
            fill: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000033',
            strokeThickness: 3
        }).setOrigin(0.5)
          .setDepth(2001); // High depth for name text
        
        console.log(`💬 Dialogue elements created successfully`);
        
        // Auto-hide after 4 seconds
        this.time.delayedCall(4000, () => {
            if (dialogueBg && dialogueBg.active) {
                dialogueBg.destroy();
            }
            if (dialogueText && dialogueText.active) {
                dialogueText.destroy();
            }
            if (nameText && nameText.active) {
                nameText.destroy();
            }
        });
        
        // Allow click to dismiss early
        dialogueBg.setInteractive();
        dialogueBg.on('pointerdown', () => {
            dialogueBg.destroy();
            dialogueText.destroy();
            nameText.destroy();
        });
    }
}