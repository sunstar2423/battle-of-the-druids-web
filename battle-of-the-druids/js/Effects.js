/*
 * Battle of the Druids - Web Edition
 * Effects.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

class DamageNumber {
    constructor(scene, x, y, damage, isSpecial = false, isHeal = false) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.timer = 60; // 1 second at 60 FPS
        this.isSpecial = isSpecial;
        this.isHeal = isHeal;
        this.floatSpeed = 2;
        
        // Create text object
        let color, fontSize, prefix;
        
        if (isHeal) {
            color = '#00FF00';
            fontSize = '20px';
            prefix = '+';
        } else if (isSpecial) {
            color = '#FFD700';
            fontSize = '24px';
            prefix = '';
        } else {
            color = '#FFFFFF';
            fontSize = '18px';
            prefix = '';
        }
        
        this.textObject = scene.add.text(x, y, `${prefix}${damage}`, {
            fontSize: fontSize,
            fontFamily: 'Arial',
            fill: color,
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Add tween for floating effect
        scene.tweens.add({
            targets: this.textObject,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                this.textObject.destroy();
            }
        });
        
        // Special effect for special attacks
        if (isSpecial) {
            scene.tweens.add({
                targets: this.textObject,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 200,
                yoyo: true,
                ease: 'Power2'
            });
        }
    }
}

class AttackEffect {
    constructor(scene, x, y, effectType) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.effectType = effectType;
        this.particles = [];
        this.timer = 30;
        
        // Create particles based on effect type
        this.createParticles();
    }
    
    createParticles() {
        const particleCount = this.getParticleCount();
        const particleConfig = this.getParticleConfig();
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.scene.add.circle(
                this.x + (Math.random() - 0.5) * particleConfig.spread,
                this.y + (Math.random() - 0.5) * particleConfig.spread,
                Math.random() * particleConfig.maxSize + 2,
                particleConfig.color
            );
            
            // Animate particle
            this.scene.tweens.add({
                targets: particle,
                x: particle.x + (Math.random() - 0.5) * particleConfig.velocity,
                y: particle.y + (Math.random() - 0.5) * particleConfig.velocity,
                alpha: 0,
                scaleX: 0.1,
                scaleY: 0.1,
                duration: particleConfig.duration,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
            
            this.particles.push(particle);
        }
        
        // Add screen shake for powerful attacks
        if (this.effectType.includes('special')) {
            this.addScreenShake();
        }
    }
    
    getParticleCount() {
        const counts = {
            'slash': 8,
            'magic': 12,
            'special': 15,
            'special_knight': 20,
            'special_wizard': 25,
            'special_rogue': 18,
            'special_soldier': 22,
            'spell_fire': 25,
            'spell_ice': 20,
            'spell_lightning': 15,
            'spell_heal': 18
        };
        return counts[this.effectType] || 10;
    }
    
    getParticleConfig() {
        const configs = {
            'slash': {
                color: COLORS.YELLOW,
                spread: 40,
                velocity: 60,
                maxSize: 4,
                duration: 500
            },
            'magic': {
                color: COLORS.PURPLE,
                spread: 60,
                velocity: 80,
                maxSize: 5,
                duration: 600
            },
            'special': {
                color: COLORS.GOLD,
                spread: 80,
                velocity: 100,
                maxSize: 6,
                duration: 800
            },
            'special_knight': {
                color: COLORS.GOLD,
                spread: 100,
                velocity: 120,
                maxSize: 8,
                duration: 900
            },
            'special_wizard': {
                color: COLORS.PURPLE,
                spread: 120,
                velocity: 100,
                maxSize: 7,
                duration: 1000
            },
            'special_rogue': {
                color: 0x500050,
                spread: 80,
                velocity: 140,
                maxSize: 6,
                duration: 700
            },
            'special_soldier': {
                color: COLORS.RED,
                spread: 90,
                velocity: 120,
                maxSize: 8,
                duration: 800
            },
            'spell_fire': {
                color: COLORS.RED,
                spread: 80,
                velocity: 120,
                maxSize: 10,
                duration: 900
            },
            'spell_ice': {
                color: COLORS.LIGHT_BLUE,
                spread: 80,
                velocity: 100,
                maxSize: 8,
                duration: 700
            },
            'spell_lightning': {
                color: COLORS.YELLOW,
                spread: 60,
                velocity: 200,
                maxSize: 6,
                duration: 500
            },
            'spell_heal': {
                color: COLORS.GREEN,
                spread: 60,
                velocity: 60,
                maxSize: 6,
                duration: 800
            }
        };
        
        return configs[this.effectType] || configs['slash'];
    }
    
    addScreenShake() {
        const intensity = this.effectType.includes('special') ? 8 : 4;
        const duration = 300;
        
        // Get the current camera
        const camera = this.scene.cameras.main;
        
        // Add shake effect
        camera.shake(duration, intensity * 0.01);
    }
}

class EffectManager {
    constructor(scene) {
        this.scene = scene;
        this.damageNumbers = [];
        this.attackEffects = [];
    }
    
    addDamageNumber(x, y, damage, isSpecial = false, isHeal = false) {
        const damageNumber = new DamageNumber(this.scene, x, y, damage, isSpecial, isHeal);
        this.damageNumbers.push(damageNumber);
    }
    
    addAttackEffect(x, y, effectType) {
        const attackEffect = new AttackEffect(this.scene, x, y, effectType);
        this.attackEffects.push(attackEffect);
    }
    
    clearAll() {
        // Damage numbers and attack effects are automatically cleaned up by their tweens
        this.damageNumbers = [];
        this.attackEffects = [];
    }
}

// Background drawing functions
class BackgroundRenderer {
    static drawGradientBackground(scene, color1 = 0x141828, color2 = 0x282848) {
        const { width, height } = scene.scale;
        
        // Create gradient effect with rectangles
        const strips = 50;
        const stripHeight = height / strips;
        
        for (let i = 0; i < strips; i++) {
            const ratio = i / strips;
            const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                Phaser.Display.Color.IntegerToColor(color1),
                Phaser.Display.Color.IntegerToColor(color2),
                strips,
                i
            );
            
            const colorInt = Phaser.Display.Color.GetColor32(color.r, color.g, color.b, 255);
            
            scene.add.rectangle(width / 2, i * stripHeight + stripHeight / 2, width, stripHeight, colorInt)
                .setOrigin(0.5);
        }
    }
    
    static drawMenuBackground(scene) {
        // Try to load menubackground image first, then menu, fallback to gradient
        if (!scene.assetManager) {
            scene.assetManager = new AssetManager(scene);
        }
        
        if (scene.textures.exists('menubackground')) {
            scene.assetManager.getBackgroundImage(scene, 'menubackground');
        } else if (scene.textures.exists('menu')) {
            scene.assetManager.getBackgroundImage(scene, 'menu');
        } else {
            // Fallback to gradient
            BackgroundRenderer.drawGradientBackground(scene, 0x1a1a2e, 0x2d2d44);
            
            // Add some decorative elements
            const { width, height } = scene.scale;
            
            // Add subtle pattern
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = Math.random() * 3 + 1;
                
                scene.add.circle(x, y, size, COLORS.GOLD, 0.1);
            }
        }
    }
    
    static drawWorldMapBackground(scene) {
        // Try to load world map background image, fallback to gradient
        if (!scene.assetManager) {
            scene.assetManager = new AssetManager(scene);
        }
        
        if (scene.textures.exists('world_map')) {
            scene.assetManager.getBackgroundImage(scene, 'world_map');
        } else {
            // Fallback to gradient with clouds
            BackgroundRenderer.drawGradientBackground(scene, 0x1e3c72, 0x2a5298);
            
            const { width, height } = scene.scale;
            
            // Add clouds
            for (let i = 0; i < 6; i++) {
                const x = (i * 250 + 100) % width;
                const y = 50 + i * 20;
                
                scene.add.circle(x, y, 40, 0xFFFFFF, 0.3);
                scene.add.circle(x + 30, y, 30, 0xFFFFFF, 0.3);
                scene.add.circle(x - 30, y, 30, 0xFFFFFF, 0.3);
            }
        }
    }
    
    static drawBattleBackground(scene, location) {
        // Try to load location-specific background image first
        if (!scene.assetManager) {
            scene.assetManager = new AssetManager(scene);
        }
        
        let backgroundKey = null;
        let color1, color2;
        
        // Map location names to image keys
        if (location.name.includes("Haunted")) {
            backgroundKey = 'mansion';
            color1 = 0x0a0a0f;
            color2 = 0x1a1a2e;
        } else if (location.name.includes("Dock")) {
            backgroundKey = 'docks';
            color1 = 0x0f1928;
            color2 = 0x1e3c72;
        } else if (location.name.includes("Volcanic")) {
            backgroundKey = 'volcaniccaves';
            color1 = 0x501810;
            color2 = 0x802418;
        } else if (location.name.includes("Shrine")) {
            backgroundKey = 'shrine';
            color1 = 0x2c1810;
            color2 = 0x503c28;
        } else if (location.name.includes("Bot")) {
            backgroundKey = 'botattack';
            color1 = 0x1e2832;
            color2 = 0x325064;
        } else if (location.name.includes("Castle")) {
            backgroundKey = 'druidcastle';
            color1 = 0x281408;
            color2 = 0x402010;
        } else if (location.name.includes("City")) {
            backgroundKey = 'city';
            color1 = 0x404040;
            color2 = 0x606060;
        } else if (location.name.includes("Arena")) {
            backgroundKey = 'arena';
            color1 = 0x282828;
            color2 = 0x404040;
        } else {
            color1 = 0x282828;
            color2 = 0x404040;
        }
        
        // Try to use the background image, fallback to gradient
        if (backgroundKey && scene.textures.exists(backgroundKey)) {
            scene.assetManager.getBackgroundImage(scene, backgroundKey);
        } else {
            BackgroundRenderer.drawGradientBackground(scene, color1, color2);
        }
    }
    
    static drawStoreBackground(scene) {
        // Try to load shop background image, fallback to gradient
        if (!scene.assetManager) {
            scene.assetManager = new AssetManager(scene);
        }
        
        if (scene.textures.exists('shop_background')) {
            scene.assetManager.getBackgroundImage(scene, 'shop_background');
        } else {
            BackgroundRenderer.drawGradientBackground(scene, 0x2d1b0e, 0x4a2f1e);
        }
    }
    
    static drawInventoryBackground(scene) {
        // Try to load druid background image, fallback to gradient
        if (!scene.assetManager) {
            scene.assetManager = new AssetManager(scene);
        }
        
        if (scene.textures.exists('druid')) {
            scene.assetManager.getBackgroundImage(scene, 'druid');
        } else {
            BackgroundRenderer.drawGradientBackground(scene, 0x1e2832, 0x2d3e50);
        }
    }
}