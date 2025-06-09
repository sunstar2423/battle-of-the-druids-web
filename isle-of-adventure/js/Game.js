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