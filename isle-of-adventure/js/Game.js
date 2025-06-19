/*
 * Battle of the Druids - Web Edition
 * Game.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES } from './GameData.js';
import GameState from './GameState.js';
import MusicManager from './MusicManager.js';
import PreloadScene from './scenes/PreloadScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import VillageScene from './scenes/VillageScene.js';
import HouseScene from './scenes/HouseScene.js';
import ForestScene from './scenes/ForestScene.js';
import ForkScene from './scenes/ForkScene.js';
import MountainsScene from './scenes/MountainsScene.js';
import CaveScene from './scenes/CaveScene.js';
import TreasureScene from './scenes/TreasureScene.js';
import ShoreScene from './scenes/ShoreScene.js';
import BoatScene from './scenes/BoatScene.js';
import SquidBattleScene from './scenes/SquidBattleScene.js';
import PirateIslandScene from './scenes/PirateIslandScene.js';
import SorcererScene from './scenes/SorcererScene.js';
import PortalScene from './scenes/PortalScene.js';
import CreditsScene from './scenes/CreditsScene.js';

class Game {
    constructor() {
        this.gameState = new GameState();
        this.config = {
            type: Phaser.AUTO,
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            parent: 'game-container',
            backgroundColor: '#2c3e50',
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                min: {
                    width: 320,
                    height: 240
                },
                max: {
                    width: SCREEN_WIDTH,
                    height: SCREEN_HEIGHT
                }
            },
            input: {
                keyboard: true,
                mouse: true,
                touch: {
                    capture: false  // Allow native touch gestures to pass through
                }
            },
            scene: [
                PreloadScene,
                MainMenuScene,
                VillageScene,
                HouseScene,
                ForestScene,
                ForkScene,
                MountainsScene,
                CaveScene,
                TreasureScene,
                ShoreScene,
                BoatScene,
                SquidBattleScene,
                PirateIslandScene,
                SorcererScene,
                PortalScene,
                CreditsScene
            ]
        };
        
        this.game = new Phaser.Game(this.config);
        this.game.registry.set('gameState', this.gameState);
        
        // Comprehensive mobile touch configuration
        this.game.events.once('ready', () => {
            // Ensure canvas allows native touch gestures
            if (this.game.canvas) {
                this.game.canvas.style.touchAction = 'auto';
                this.game.canvas.style.pointerEvents = 'auto';
                this.game.canvas.style.webkitTouchCallout = 'default';
                this.game.canvas.style.webkitUserSelect = 'auto';
                
                // Prevent Phaser from blocking certain touch events
                this.game.canvas.addEventListener('touchstart', (e) => {
                    if (e.touches.length > 1) {
                        // Allow multi-touch gestures (pinch-to-zoom)
                        e.stopPropagation();
                    }
                }, { passive: true });
                
                // For debugging
                console.log('Mobile touch configuration applied for zoom/scroll');
            }
        });
        
        // Create global music manager that will be accessible to all scenes
        this.musicManager = null;
        this.game.events.once('ready', () => {
            this.musicManager = new MusicManager(this.game.scene.getScene('PreloadScene'));
            this.game.registry.set('musicManager', this.musicManager);
        });
        
        this.setupInventoryDisplay();
    }

    setupInventoryDisplay() {
        this.inventoryList = document.getElementById('inventory-list');
        this.updateInventoryDisplay();
        
        // Update inventory display whenever items are added
        this.game.events.on('inventory-updated', () => {
            this.updateInventoryDisplay();
        });
    }

    updateInventoryDisplay() {
        if (!this.inventoryList) return;
        
        this.inventoryList.innerHTML = '';
        this.gameState.inventory.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            this.inventoryList.appendChild(li);
        });
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
});