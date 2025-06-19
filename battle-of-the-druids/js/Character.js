/*
 * Battle of the Druids - Web Edition
 * Character.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

class Character {
    constructor(charType, name = "Unknown", isEnemy = false, enemyType = "goblin") {
        this.charType = charType;
        this.name = name;
        this.isEnemy = isEnemy;
        this.enemyType = enemyType;
        
        // Initialize stats based on character type
        if (CHARACTER_PRESETS[charType]) {
            const baseStats = CHARACTER_PRESETS[charType];
            this.maxHealth = baseStats.health;
            this.health = baseStats.health;
            this.baseAttack = baseStats.attack;
            this.baseDefense = baseStats.defense;
            this.baseSpeed = baseStats.speed;
        } else {
            // Default enemy stats
            this.maxHealth = 80;
            this.health = 80;
            this.baseAttack = 70;
            this.baseDefense = 60;
            this.baseSpeed = 65;
        }
        
        // Player progression stats
        this.victories = 0;
        this.gold = 150; // Increased from 100 to 150 for better early game
        this.dragonShards = 0;
        this.weaponBonus = 0;
        this.armorBonus = 0;
        this.accessoryBonus = 0;
        this.locationVictories = {};
        
        // Equipment system
        if (!isEnemy) {
            this.equipped = {
                [EquipmentSlot.WEAPON]: { ...STARTING_EQUIPMENT[EquipmentSlot.WEAPON] },
                [EquipmentSlot.ARMOR]: { ...STARTING_EQUIPMENT[EquipmentSlot.ARMOR] },
                [EquipmentSlot.ACCESSORY]: { ...STARTING_EQUIPMENT[EquipmentSlot.ACCESSORY] }
            };
            this.updateEquipmentBonuses();
        } else {
            this.equipped = {};
        }
        
        // Wizard-specific stats
        if (charType === CharacterType.WIZARD) {
            this.maxMana = 100;
            this.mana = 100;
            this.frozenTurns = 0;
        } else {
            this.maxMana = 0;
            this.mana = 0;
            this.frozenTurns = 0;
        }
        
        // Visual properties
        this.color = this.getCharacterColor();
        this.weaponColor = this.getWeaponColor();
        
        // Animation properties
        this.animationOffset = 0;
        this.animationDirection = 1;
    }
    
    getCharacterColor() {
        return CHARACTER_COLORS[this.charType] || COLORS.GRAY;
    }
    
    getWeaponColor() {
        const weaponColors = {
            [CharacterType.KNIGHT]: COLORS.SILVER,
            [CharacterType.WIZARD]: COLORS.GOLD,
            [CharacterType.ROGUE]: COLORS.DARK_GRAY,
            [CharacterType.SOLDIER]: COLORS.BRONZE,
            [CharacterType.ENEMY]: COLORS.RED
        };
        return weaponColors[this.charType] || COLORS.GRAY;
    }
    
    updateEquipmentBonuses() {
        this.weaponBonus = 0;
        this.armorBonus = 0;
        this.accessoryBonus = 0;
        
        for (const [slot, equipment] of Object.entries(this.equipped)) {
            if (equipment) {
                this.weaponBonus += equipment.attackBonus || 0;
                this.armorBonus += equipment.defenseBonus || 0;
                this.accessoryBonus += equipment.speedBonus || 0;
            }
        }
    }
    
    equipItem(equipment) {
        if (!equipment || !equipment.slot) return false;
        
        // Store old health ratio for health bonus items
        const oldHealthRatio = this.maxHealth > 0 ? this.health / this.maxHealth : 1.0;
        
        // Unequip current item in that slot
        const oldEquipment = this.equipped[equipment.slot];
        if (oldEquipment && oldEquipment.healthBonus > 0) {
            this.maxHealth -= oldEquipment.healthBonus;
            this.health = Math.max(1, Math.floor(this.maxHealth * oldHealthRatio));
        }
        
        // Equip new item
        this.equipped[equipment.slot] = { ...equipment };
        
        // Apply health bonus
        if (equipment.healthBonus > 0) {
            this.maxHealth += equipment.healthBonus;
            this.health = Math.floor(this.maxHealth * oldHealthRatio);
        }
        
        // Update all bonuses
        this.updateEquipmentBonuses();
        return true;
    }
    
    getEquippedItem(slot) {
        return this.equipped[slot] || null;
    }
    
    getTotalAttack() {
        return this.baseAttack + this.weaponBonus;
    }
    
    getTotalDefense() {
        return this.baseDefense + this.armorBonus;
    }
    
    getTotalSpeed() {
        return this.baseSpeed + this.accessoryBonus;
    }
    
    attackEnemy(enemy) {
        const baseDamage = this.getTotalAttack();
        const damageRange = Math.floor(baseDamage * 0.2);
        const damage = Math.floor(Math.random() * (2 * damageRange + 1)) + baseDamage - damageRange;
        
        // Balanced damage calculation: defense reduces damage but not too much
        const defenseReduction = enemy.getTotalDefense() / (enemy.getTotalDefense() + 150); // Increased from 100 to 150
        let finalDamage = Math.floor(damage * (1 - defenseReduction));
        finalDamage = Math.max(Math.floor(damage * 0.4), finalDamage); // Minimum 40% damage (increased from 25%)
        
        enemy.health = Math.max(0, enemy.health - finalDamage);
        return finalDamage;
    }
    
    specialAttack(enemy) {
        const baseDamage = Math.floor(this.getTotalAttack() * 1.5);
        const damageRange = Math.floor(baseDamage * 0.2);
        const damage = Math.floor(Math.random() * (2 * damageRange + 1)) + baseDamage - damageRange;
        
        // Balanced damage calculation: defense reduces damage but not too much
        const defenseReduction = enemy.getTotalDefense() / (enemy.getTotalDefense() + 150); // Increased from 100 to 150
        let finalDamage = Math.floor(damage * (1 - defenseReduction));
        finalDamage = Math.max(Math.floor(damage * 0.4), finalDamage); // Minimum 40% damage (increased from 25%)
        
        enemy.health = Math.max(0, enemy.health - finalDamage);
        return finalDamage;
    }
    
    heal() {
        const healAmount = Math.floor(Math.random() * 16) + 25; // 25-40
        const oldHealth = this.health;
        this.health = Math.min(this.maxHealth, this.health + healAmount);
        return this.health - oldHealth;
    }
    
    castSpell(spellKey, enemy) {
        if (this.charType !== CharacterType.WIZARD) {
            return { damage: 0, effect: "Not a wizard" };
        }
        
        if (!WIZARD_SPELLS || !WIZARD_SPELLS[spellKey]) {
            console.error('Invalid spell data:', spellKey);
            return { damage: 0, effect: "Unknown spell" };
        }
        
        if (!enemy || enemy.health === undefined) {
            console.error('Invalid enemy target for spell');
            return { damage: 0, effect: "Invalid target" };
        }
        
        const spell = WIZARD_SPELLS[spellKey];
        
        // Check mana
        if (this.mana < spell.manaCost) {
            return { damage: 0, effect: "Not enough mana" };
        }
        
        // Consume mana
        this.mana -= spell.manaCost;
        
        // Calculate damage/effect
        if (spell.specialEffect === "heal") {
            // Healing spell
            const healAmount = Math.floor(Math.random() * 21) + 40; // 40-60
            const oldHealth = this.health;
            this.health = Math.min(this.maxHealth, this.health + healAmount);
            const actualHeal = this.health - oldHealth;
            return { damage: actualHeal, effect: "heal" };
        } else {
            // Damage spell
            const baseDamage = spell.damageBase + this.weaponBonus;
            const variance = Math.floor(baseDamage * spell.damageVariance);
            const damage = Math.floor(Math.random() * (2 * variance + 1)) + baseDamage - variance;
            
            let finalDamage;
            
            // Apply spell effects
            if (spell.specialEffect === "pierce") {
                // Lightning bolt - ignores armor
                finalDamage = damage;
            } else if (spell.specialEffect === "fire") {
                // Fireball - normal damage calculation
                finalDamage = Math.max(1, damage - enemy.getTotalDefense());
            } else if (spell.specialEffect === "freeze") {
                // Ice shard - normal damage + chance to freeze
                finalDamage = Math.max(1, damage - enemy.getTotalDefense());
                // Check for freeze effect
                if (Math.random() < (spell.effectChance || 0)) {
                    enemy.frozenTurns = 2; // Skip 2 turns
                    return { damage: finalDamage, effect: "freeze" };
                }
            } else {
                finalDamage = Math.max(1, damage - enemy.getTotalDefense());
            }
            
            // Apply damage
            enemy.health = Math.max(0, enemy.health - finalDamage);
            return { damage: finalDamage, effect: spell.specialEffect };
        }
    }
    
    canCastSpell(spellKey) {
        if (this.charType !== CharacterType.WIZARD) return false;
        if (!WIZARD_SPELLS[spellKey]) return false;
        
        const spell = WIZARD_SPELLS[spellKey];
        return this.mana >= spell.manaCost;
    }
    
    regenerateMana(amount = 10) {
        if (this.charType === CharacterType.WIZARD) {
            this.mana = Math.min(this.maxMana, this.mana + amount);
        }
    }
    
    updateAnimation() {
        this.animationOffset += 0.1 * this.animationDirection;
        if (Math.abs(this.animationOffset) > 10) {
            this.animationDirection *= -1;
        }
    }
    
}

// Enemy creation function
function createEnemy(enemyType, playerVictories = 0, locationName = "Arena") {
    // Validate inputs
    if (!enemyType || typeof enemyType !== 'string') {
        console.error('Invalid enemy type:', enemyType);
        enemyType = 'goblin'; // fallback
    }
    
    if (!ENEMY_STATS) {
        console.error('ENEMY_STATS not loaded');
        return null;
    }
    
    const baseStats = ENEMY_STATS[enemyType] || { health: 80, attack: 70, defense: 35, speed: 65 };
    
    // Scale based on player victories (reduced scaling for better balance)
    const scaleFactor = 1.0 + (playerVictories * 0.03); // Reduced from 0.05 to 0.03
    
    // Location-based scaling
    const locationMultipliers = {
        "Arena": 1.0,
        "Maze": 1.1,
        "Haunted Mansion": 1.2,
        "Pirate Docks": 1.3,
        "Ancient City": 1.4,
        "Sacred Shrine": 1.5,
        "Volcanic Caves": 1.6,
        "Battle of Druids Castle": 2.0,
        "Bot Attack": 2.0
    };
    
    const locationScale = locationMultipliers[locationName] || 1.0;
    const finalScale = scaleFactor * locationScale;
    
    // Create enemy with scaled stats
    const enemy = new Character(CharacterType.ENEMY, enemyType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), true, enemyType);
    enemy.maxHealth = Math.floor(baseStats.health * finalScale);
    enemy.health = enemy.maxHealth;
    enemy.baseAttack = Math.floor(baseStats.attack * finalScale);
    enemy.baseDefense = Math.floor(baseStats.defense * finalScale);
    enemy.baseSpeed = Math.floor(baseStats.speed * finalScale);
    
    return enemy;
}