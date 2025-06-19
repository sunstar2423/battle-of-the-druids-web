/*
 * Battle of the Druids - Web Edition
 * GameState.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

class GameState {
    constructor() {
        this.inventory = [];
        this.visitedLocations = [];
        this.defeatedEnemies = [];
        this.canEnterSorcerer = false;
    }

    addItem(itemName) {
        if (!this.inventory.includes(itemName)) {
            this.inventory.push(itemName);
            console.log(`Added ${itemName} to inventory`);
        }
    }

    hasItem(itemName) {
        return this.inventory.includes(itemName);
    }

    hasAllItems(itemList) {
        return itemList.every(item => this.inventory.includes(item));
    }

    visitLocation(locationName) {
        if (!this.visitedLocations.includes(locationName)) {
            this.visitedLocations.push(locationName);
        }
    }

    hasVisitedLocation(locationName) {
        return this.visitedLocations.includes(locationName);
    }

    defeatEnemy(enemyName) {
        if (!this.defeatedEnemies.includes(enemyName)) {
            this.defeatedEnemies.push(enemyName);
        }
    }

    hasDefeatedEnemy(enemyName) {
        return this.defeatedEnemies.includes(enemyName);
    }

    checkSorcererAccess() {
        const requiredItems = ['Squid Eye', 'Bottle of Rum', 'Golden Goblet'];
        this.canEnterSorcerer = this.hasAllItems(requiredItems);
        return this.canEnterSorcerer;
    }

    reset() {
        this.inventory = [];
        this.visitedLocations = [];
        this.defeatedEnemies = [];
        this.canEnterSorcerer = false;
    }
}

export default GameState;