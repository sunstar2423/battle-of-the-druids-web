import pygame
import random
import sys
import math
from enum import Enum
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional

# Initialize Pygame
pygame.init()
pygame.mixer.init()

# ==================== ENEMY IMAGE REFERENCE ====================
# To add custom enemy images, create 120x120 PNG files with these exact names:
# 
# Basic enemies:        goblin.png, dark_mage.png, skeleton.png, orc.png
# Haunted Mansion:      ghost.png, vampire.png, lich.png, banshee.png
# Pirate Dock:          pirate.png, sea_serpent.png, kraken_spawn.png, ghost_ship.png  
# Ancient City:         city_guard.png, assassin.png, golem.png, ancient_warrior.png
# Sacred Shrine:        temple_guardian.png, spirit_monk.png, divine_beast.png, celestial.png
# Volcanic Caves:       fire_elemental.png, lava_beast.png, dragon_whelp.png, magma_golem.png
# Maze:                 minotaur.png, lost_soul.png
# Castle:               druid_lord.png, ancient_guardian.png
# Bot Attack:           mech_dragon.png, war_machine.png
#
# The game will use custom simple shapes for enemies without images.

# ==================== CONSTANTS ====================
SCREEN_WIDTH = 1400
SCREEN_HEIGHT = 900
FPS = 60

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
PURPLE = (128, 0, 128)
YELLOW = (255, 255, 0)
GRAY = (128, 128, 128)
DARK_GRAY = (64, 64, 64)
LIGHT_BLUE = (173, 216, 230)
GOLD = (255, 215, 0)
TURQUOISE = (64, 224, 208)
SILVER = (192, 192, 192)
BRONZE = (205, 127, 50)

# Character Types
class CharacterType(Enum):
    KNIGHT = "Knight"
    WIZARD = "Wizard"
    ROGUE = "Rogue"
    SOLDIER = "Soldier"
    ENEMY = "Enemy"

# Item Tiers
class ItemTier(Enum):
    BASIC = "Basic"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"
    LEGENDARY = "Legendary"
    MYTHIC = "Mythic"

# Battle Locations
@dataclass
class Location:
    """Battle location data"""
    name: str
    x: int
    y: int
    enemies: List[str]
    description: str
    min_victories_required: int = 0
    unlock_requirements: Optional[List[str]] = None
    background_color: Tuple[int, int, int] = (40, 40, 40)
    special_effect: Optional[str] = None

# ==================== GAME SETUP ====================
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Battle of the Druids")
clock = pygame.time.Clock()

# Fonts
title_font = pygame.font.Font(None, 64)
button_font = pygame.font.Font(None, 40)
text_font = pygame.font.Font(None, 32)
small_font = pygame.font.Font(None, 28)

# ==================== COMBAT EFFECTS CLASSES ====================
class DamageNumber:
    """Floating damage numbers that appear during combat"""
    def __init__(self, x, y, damage, is_special=False, is_heal=False):
        self.x = x
        self.y = y
        self.damage = damage
        self.timer = 60  # 1 second at 60 FPS
        self.is_special = is_special
        self.is_heal = is_heal
        self.float_speed = 2
    
    def update(self):
        self.y -= self.float_speed
        self.timer -= 1
        return self.timer > 0
    
    def draw(self, screen):
        if self.is_heal:
            color = GREEN
            font = text_font
            prefix = "+"
        elif self.is_special:
            color = GOLD if (self.timer // 5) % 2 == 0 else YELLOW  # Flashing gold
            font = button_font
            prefix = ""
        else:
            alpha = int(255 * (self.timer / 60))
            color = (255, min(255, alpha), min(255, alpha))  # Fading white to red
            font = text_font
            prefix = ""
        
        damage_text = font.render(f"{prefix}{self.damage}", True, color)
        damage_rect = damage_text.get_rect(center=(self.x, self.y))
        screen.blit(damage_text, damage_rect)

class AttackEffect:
    """Particle effects for attacks"""
    def __init__(self, x, y, effect_type):
        self.x = x
        self.y = y
        self.effect_type = effect_type
        self.timer = 30
        self.particles = []
        
        # Create particles based on effect type
        if effect_type == "slash":
            for i in range(8):
                self.particles.append({
                    'x': x + random.randint(-20, 20),
                    'y': y + random.randint(-20, 20),
                    'vx': random.randint(-3, 3),
                    'vy': random.randint(-3, 3),
                    'color': YELLOW
                })
        elif effect_type == "magic":
            for i in range(12):
                self.particles.append({
                    'x': x + random.randint(-30, 30),
                    'y': y + random.randint(-30, 30),
                    'vx': random.randint(-4, 4),
                    'vy': random.randint(-4, 4),
                    'color': PURPLE if i % 2 == 0 else TURQUOISE
                })
        elif effect_type == "special":
            for i in range(15):
                self.particles.append({
                    'x': x + random.randint(-40, 40),
                    'y': y + random.randint(-40, 40),
                    'vx': random.randint(-5, 5),
                    'vy': random.randint(-5, 5),
                    'color': GOLD if i % 3 == 0 else RED
                })
    
    def update(self):
        self.timer -= 1
        for particle in self.particles:
            particle['x'] += particle['vx']
            particle['y'] += particle['vy']
            particle['vy'] += 0.2  # Gravity
        return self.timer > 0
    
    def draw(self, screen):
        for particle in self.particles:
            if 0 <= particle['x'] <= SCREEN_WIDTH and 0 <= particle['y'] <= SCREEN_HEIGHT:
                pygame.draw.circle(screen, particle['color'], (int(particle['x']), int(particle['y'])), 3)

# ==================== ASSET MANAGEMENT ====================
class AssetManager:
    """Manages game assets like images and sounds"""
    
    def __init__(self):
        self.character_images = {}
        self.sounds = {}
        self.shop_background = None
        self.world_map_background = None
        self.load_all_assets()
    
    def load_all_assets(self):
        """Load all game assets"""
        self.load_character_images()
        self.load_sounds()
        self.load_shop_background()
        self.load_world_map_background()
    
    def load_character_images(self):
        """Load character sprite images"""
        image_files = {
            # Player characters
            'knight': "knight.png",
            'wizard': "wizard.png",
            'rogue': "rogue.png",
            'soldier': "soldier.png",
            
            # Basic enemies
            'goblin': "goblin.png",
            'dark_mage': "dark_mage.png",
            'skeleton': "skeleton.png",
            'orc': "orc.png",
            
            # Haunted Mansion enemies
            'ghost': "ghost.png",
            'vampire': "vampire.png",
            'lich': "lich.png",
            'banshee': "banshee.png",
            
            # Pirate Dock enemies
            'pirate': "pirate.png",
            'sea_serpent': "sea_serpent.png",
            'kraken_spawn': "kraken_spawn.png",
            'ghost_ship': "ghost_ship.png",
            
            # Ancient City enemies
            'city_guard': "city_guard.png",
            'assassin': "assassin.png",
            'golem': "golem.png",
            'ancient_warrior': "ancient_warrior.png",
            
            # Sacred Shrine enemies
            'temple_guardian': "temple_guardian.png",
            'spirit_monk': "spirit_monk.png",
            'divine_beast': "divine_beast.png",
            'celestial': "celestial.png",
            
            # Volcanic Caves enemies
            'fire_elemental': "fire_elemental.png",
            'lava_beast': "lava_beast.png",
            'dragon_whelp': "dragon_whelp.png",
            'magma_golem': "magma_golem.png",
            
            # Maze enemies
            'minotaur': "minotaur.png",
            'lost_soul': "lost_soul.png",
            
            # Castle enemies
            'druid_lord': "druid_lord.png",
            'ancient_guardian': "ancient_guardian.png",
            
            # Bot Attack enemies
            'mech_dragon': "mech_dragon.png",
            'war_machine': "war_machine.png",
            
            # Additional/Elite enemies
            'elite_dark_mage': "elite_dark_mage.png",
        }
        
        # Try to load all images
        loaded_count = 0
        for key, filename in image_files.items():
            try:
                image = pygame.image.load(filename)
                self.character_images[key] = pygame.transform.scale(image, (120, 120))
                loaded_count += 1
            except pygame.error:
                # Silently skip missing files
                pass
        
        if loaded_count > 0:
            print(f"✅ Loaded {loaded_count} character images successfully!")
            if loaded_count < len(image_files):
                print(f"ℹ️  {len(image_files) - loaded_count} images not found - will use simple shapes for those.")
        else:
            print(f"⚠️  No character images found. Using simple shapes instead.")
            print("Add .png files for any of these enemies to use custom graphics:")
            print(", ".join(image_files.keys()))
            self.character_images = None
    
    def load_sounds(self):
        """Load sound effects and music"""
        sound_files = {
            'attack': "attack.wav",
            'special': "special.wav",
            'heal': "heal.wav",
            'victory': "victory.wav",
            'defeat': "defeat.wav",
            'buy': "buy.wav",
            'click': "click.wav"
        }
        
        try:
            for key, filename in sound_files.items():
                sound = pygame.mixer.Sound(filename)
                sound.set_volume(0.7)
                self.sounds[key] = sound
            print("✅ All sound effects loaded successfully!")
            
            # Load background music
            try:
                pygame.mixer.music.load("background_music.wav")
                pygame.mixer.music.set_volume(0.3)
                print("✅ Background music loaded successfully!")
            except pygame.error:
                print("⚠️  Background music file not found. Add 'background_music.wav' for music!")
                
        except pygame.error as e:
            print(f"⚠️  Could not load some sound files: {e}")
            print("Add .wav sound files to enable audio effects!")
            self.sounds = None
    
    def load_shop_background(self):
        """Load shop background image"""
        try:
            self.shop_background = pygame.image.load("shop_background.png")
            self.shop_background = pygame.transform.scale(self.shop_background, (SCREEN_WIDTH, SCREEN_HEIGHT))
            print("✅ Shop background loaded successfully!")
        except pygame.error as e:
            print(f"⚠️  Could not load shop background: {e}")
            print("Add 'shop_background.png' for custom shop background!")
            self.shop_background = None
    
    def load_world_map_background(self):
        """Load world map background image"""
        try:
            self.world_map_background = pygame.image.load("world_map.png")
            self.world_map_background = pygame.transform.scale(self.world_map_background, (SCREEN_WIDTH, SCREEN_HEIGHT))
            print("✅ World map background loaded successfully!")
        except pygame.error as e:
            print(f"⚠️  Could not load world map background: {e}")
            print("Add 'world_map.png' for custom world map background!")
            self.world_map_background = None
    
    def play_sound(self, sound_name: str):
        """Play a sound effect if available"""
        if self.sounds and sound_name in self.sounds:
            self.sounds[sound_name].play()
    
    def start_music(self):
        """Start background music"""
        try:
            pygame.mixer.music.play(-1)  # Loop forever
        except pygame.error:
            pass
    
    def stop_music(self):
        """Stop background music"""
        pygame.mixer.music.stop()

# Create global asset manager
assets = AssetManager()

# ==================== CHARACTER STATS ====================
@dataclass
class CharacterStats:
    """Character statistics"""
    attack: int
    defense: int
    speed: int
    weapon: str
    special: str
    color: Tuple[int, int, int]

# Character presets
CHARACTER_PRESETS = {
    CharacterType.KNIGHT: CharacterStats(25, 15, 20, "Strong Sword", "Swift Strike", GRAY),
    CharacterType.WIZARD: CharacterStats(30, 10, 15, "Lightning Wand", "Lightning Bolt", PURPLE),
    CharacterType.ROGUE: CharacterStats(20, 12, 25, "Twin Daggers", "Quick Strike", BLACK),
    CharacterType.SOLDIER: CharacterStats(22, 20, 10, "Basic Spear", "Shield Bash", BLUE),
}

# ==================== GAME CLASSES ====================
class Character:
    """Base character class for player and enemies"""
    
    def __init__(self, name: str, char_type: str, x: int, y: int):
        self.name = name
        self.char_type = char_type
        self.x = x
        self.y = y
        self.health = 100
        self.max_health = 100
        self.dragon_shards = 200
        self.gold = 150
        self.victories = 0
        self.location_victories = {}  # Track victories per location
        self.animation_offset = 0
        self.is_attacking = False
        self.attack_timer = 0
        
        # Set character-specific stats
        if char_type in CHARACTER_PRESETS:
            preset = CHARACTER_PRESETS[CharacterType(char_type)]
            self.attack = preset.attack
            self.defense = preset.defense
            self.speed = preset.speed
            self.weapon = preset.weapon
            self.special = preset.special
            self.color = preset.color
        else:  # Enemy
            self.color = RED
            self.attack = 15
            self.defense = 8
            self.speed = 10
            self.weapon = "Crude Weapon"
            self.special = "Basic Attack"
            
            # Set enemy-specific colors for visual distinction
            if name == "Ghost":
                self.color = (200, 200, 255)  # Pale blue
            elif name == "Vampire":
                self.color = (100, 0, 0)  # Dark red
            elif name == "Skeleton":
                self.color = WHITE
            elif name == "Orc":
                self.color = (0, 100, 0)  # Dark green
            elif name in ["Fire Elemental", "Lava Beast", "Magma Golem"]:
                self.color = (255, 100, 0)  # Orange
            elif name in ["Sea Serpent", "Kraken Spawn"]:
                self.color = (0, 150, 150)  # Teal
            elif name == "Dark Mage":
                self.color = (50, 0, 50)  # Dark purple
            elif name == "Golem":
                self.color = (100, 100, 100)  # Gray
            elif name in ["Mech Dragon", "War Machine"]:
                self.color = SILVER
    
    def draw(self, screen):
        """Draw the character on screen"""
        body_x = self.x + self.animation_offset
        
        # Try to draw character image
        if assets.character_images:
            image_key = self.char_type.lower()
            if self.char_type == "Enemy":
                # Map all enemy names to image files
                enemy_map = {
                    # Basic enemies
                    "Goblin": "goblin",
                    "Dark Mage": "dark_mage",
                    "Skeleton": "skeleton",
                    "Orc": "orc",
                    
                    # Haunted Mansion enemies
                    "Ghost": "ghost",
                    "Vampire": "vampire",
                    "Lich": "lich",
                    "Banshee": "banshee",
                    
                    # Pirate Dock enemies
                    "Pirate": "pirate",
                    "Sea Serpent": "sea_serpent",
                    "Kraken Spawn": "kraken_spawn",
                    "Ghost Ship": "ghost_ship",
                    
                    # Ancient City enemies
                    "City Guard": "city_guard",
                    "Assassin": "assassin",
                    "Golem": "golem",
                    "Ancient Warrior": "ancient_warrior",
                    
                    # Sacred Shrine enemies
                    "Temple Guardian": "temple_guardian",
                    "Spirit Monk": "spirit_monk",
                    "Divine Beast": "divine_beast",
                    "Celestial": "celestial",
                    
                    # Volcanic Caves enemies
                    "Fire Elemental": "fire_elemental",
                    "Lava Beast": "lava_beast",
                    "Dragon Whelp": "dragon_whelp",
                    "Magma Golem": "magma_golem",
                    
                    # Special/Elite enemies
                    "Elite Dark Mage": "elite_dark_mage",
                    "Minotaur": "minotaur",
                    "Lost Soul": "lost_soul",
                    "Druid Lord": "druid_lord",
                    "Ancient Guardian": "ancient_guardian",
                    "Mech Dragon": "mech_dragon",
                    "War Machine": "war_machine",
                }
                
                # Extract base enemy name (remove prefixes like "Elite", "Veteran", "Tough")
                base_name = self.name
                for prefix in ["Elite ", "Veteran ", "Tough "]:
                    if base_name.startswith(prefix):
                        base_name = base_name[len(prefix):]
                        break
                
                # Try to find the correct image key
                image_key = enemy_map.get(base_name)
                
                # If not found, try converting the name to lowercase with underscores
                if not image_key:
                    image_key = base_name.lower().replace(" ", "_")
                
                # If still not found, default to goblin
                if image_key and image_key not in assets.character_images:
                    image_key = "goblin"
            
            if image_key and image_key in assets.character_images:
                image = assets.character_images[image_key]
                image_rect = image.get_rect(center=(body_x, self.y))
                screen.blit(image, image_rect)
            else:
                self._draw_simple_character(screen, body_x)
        else:
            self._draw_simple_character(screen, body_x)
        
        # Draw name
        name_text = text_font.render(self.name, True, WHITE)
        name_rect = name_text.get_rect(center=(body_x, self.y + 80))
        screen.blit(name_text, name_rect)
        
        # Draw health bar
        self._draw_health_bar(screen, body_x)
    
    def _draw_simple_character(self, screen, body_x: int):
        """Draw simple shape representation of character"""
        # Different visual styles for different enemy types when no image is available
        if self.char_type == "Enemy":
            # Extract base enemy name
            base_name = self.name
            for prefix in ["Elite ", "Veteran ", "Tough "]:
                if base_name.startswith(prefix):
                    base_name = base_name[len(prefix):]
                    break
            
            # Custom simple shapes for different enemy types
            if base_name == "Ghost":
                # Translucent white circle
                pygame.draw.circle(screen, (200, 200, 255), (body_x, self.y), 35)
                pygame.draw.circle(screen, (150, 150, 200), (body_x, self.y), 35, 3)
                # Ghost eyes
                pygame.draw.circle(screen, BLACK, (body_x - 10, self.y - 10), 5)
                pygame.draw.circle(screen, BLACK, (body_x + 10, self.y - 10), 5)
            elif base_name == "Skeleton":
                # White bones
                pygame.draw.circle(screen, WHITE, (body_x, self.y - 20), 20)  # Skull
                pygame.draw.rect(screen, WHITE, (body_x - 20, self.y - 10, 40, 30))  # Ribcage
                pygame.draw.rect(screen, WHITE, (body_x - 25, self.y + 20, 10, 25))  # Left arm
                pygame.draw.rect(screen, WHITE, (body_x + 15, self.y + 20, 10, 25))  # Right arm
                # Skull details
                pygame.draw.circle(screen, BLACK, (body_x - 8, self.y - 25), 4)
                pygame.draw.circle(screen, BLACK, (body_x + 8, self.y - 25), 4)
            elif base_name in ["Fire Elemental", "Lava Beast", "Magma Golem"]:
                # Fire/lava colors
                pygame.draw.circle(screen, (255, 100, 0), (body_x, self.y), 45)
                pygame.draw.circle(screen, (255, 50, 0), (body_x, self.y), 35)
                pygame.draw.circle(screen, YELLOW, (body_x, self.y), 25)
                # Eyes
                pygame.draw.circle(screen, WHITE, (body_x - 10, self.y - 5), 5)
                pygame.draw.circle(screen, WHITE, (body_x + 10, self.y - 5), 5)
            elif base_name in ["Sea Serpent", "Kraken Spawn"]:
                # Aquatic blue-green
                pygame.draw.ellipse(screen, (0, 150, 150), (body_x - 30, self.y - 40, 60, 80))
                pygame.draw.circle(screen, (0, 100, 100), (body_x, self.y - 30), 25)
                # Tentacles
                for i in range(3):
                    pygame.draw.arc(screen, (0, 100, 100), 
                                   (body_x - 30 + i*20, self.y + 10, 20, 30), 
                                   0, 3.14, 3)
            elif base_name == "Vampire":
                # Black with red accents
                pygame.draw.circle(screen, BLACK, (body_x, self.y), 35)
                pygame.draw.polygon(screen, (100, 0, 0), 
                                  [(body_x - 30, self.y - 20), 
                                   (body_x, self.y - 40), 
                                   (body_x + 30, self.y - 20)])  # Cape
                pygame.draw.circle(screen, (200, 200, 200), (body_x, self.y - 50), 20)  # Pale face
                # Red eyes
                pygame.draw.circle(screen, RED, (body_x - 8, self.y - 55), 3)
                pygame.draw.circle(screen, RED, (body_x + 8, self.y - 55), 3)
            elif base_name == "Golem":
                # Stone gray blocky shape
                pygame.draw.rect(screen, (100, 100, 100), (body_x - 30, self.y - 40, 60, 80))
                pygame.draw.rect(screen, (80, 80, 80), (body_x - 35, self.y - 50, 70, 20))  # Head
                # Eyes
                pygame.draw.circle(screen, TURQUOISE, (body_x - 10, self.y - 40), 4)
                pygame.draw.circle(screen, TURQUOISE, (body_x + 10, self.y - 40), 4)
            elif base_name in ["Druid Lord", "Ancient Guardian"]:
                # Mystical purple/gold
                pygame.draw.circle(screen, PURPLE, (body_x, self.y), 40)
                pygame.draw.circle(screen, GOLD, (body_x, self.y), 40, 3)
                # Mystical symbol
                pygame.draw.polygon(screen, GOLD, 
                                  [(body_x, self.y - 20), 
                                   (body_x - 15, self.y + 10), 
                                   (body_x + 15, self.y + 10)])
                # Glowing eyes
                pygame.draw.circle(screen, WHITE, (body_x - 10, self.y - 55), 5)
                pygame.draw.circle(screen, WHITE, (body_x + 10, self.y - 55), 5)
            elif base_name in ["Mech Dragon", "War Machine"]:
                # Metallic/mechanical
                pygame.draw.rect(screen, SILVER, (body_x - 35, self.y - 30, 70, 60))
                pygame.draw.rect(screen, (150, 150, 150), (body_x - 40, self.y - 40, 80, 20))
                # Red sensors/eyes
                pygame.draw.circle(screen, RED, (body_x - 15, self.y - 30), 5)
                pygame.draw.circle(screen, RED, (body_x + 15, self.y - 30), 5)
                # Mechanical details
                pygame.draw.rect(screen, DARK_GRAY, (body_x - 20, self.y + 10, 10, 20))
                pygame.draw.rect(screen, DARK_GRAY, (body_x + 10, self.y + 10, 10, 20))
            else:
                # Default enemy appearance
                pygame.draw.circle(screen, self.color, (body_x, self.y), 40)
                pygame.draw.circle(screen, WHITE, (body_x, self.y - 60), 25)
                pygame.draw.circle(screen, BLACK, (body_x - 10, self.y - 65), 4)
                pygame.draw.circle(screen, BLACK, (body_x + 10, self.y - 65), 4)
        else:
            # Player character
            # Body
            pygame.draw.circle(screen, self.color, (body_x, self.y), 40)
            
            # Head
            pygame.draw.circle(screen, WHITE, (body_x, self.y - 60), 25)
            
            # Eyes
            pygame.draw.circle(screen, BLACK, (body_x - 10, self.y - 65), 4)
            pygame.draw.circle(screen, BLACK, (body_x + 10, self.y - 65), 4)
        
        # Draw weapon indicator for all characters
        self._draw_weapon(screen, body_x)
    
    def _draw_weapon(self, screen, body_x: int):
        """Draw weapon indicator"""
        if not hasattr(self, 'weapon'):
            return
            
        if "Sword" in self.weapon:
            pygame.draw.rect(screen, YELLOW, (body_x + 35, self.y - 40, 6, 50))
        elif "Wand" in self.weapon:
            pygame.draw.rect(screen, PURPLE, (body_x + 35, self.y - 40, 4, 45))
            pygame.draw.circle(screen, TURQUOISE, (body_x + 37, self.y - 42), 6)
        elif "Daggers" in self.weapon:
            pygame.draw.rect(screen, GRAY, (body_x + 25, self.y - 30, 4, 30))
            pygame.draw.rect(screen, GRAY, (body_x + 40, self.y - 30, 4, 30))
        elif "Spear" in self.weapon:
            pygame.draw.rect(screen, BRONZE, (body_x + 35, self.y - 50, 4, 60))
            pygame.draw.polygon(screen, GRAY, [
                (body_x + 33, self.y - 55),
                (body_x + 39, self.y - 55),
                (body_x + 36, self.y - 65)
            ])
    
    def _draw_health_bar(self, screen, body_x: int):
        """Draw health bar"""
        bar_width = 120
        bar_height = 10
        health_ratio = max(0, self.health / self.max_health)
        
        # Background (red)
        bar_rect = pygame.Rect(body_x - 60, self.y + 100, bar_width, bar_height)
        pygame.draw.rect(screen, RED, bar_rect)
        
        # Health (green)
        health_rect = pygame.Rect(body_x - 60, self.y + 100, bar_width * health_ratio, bar_height)
        pygame.draw.rect(screen, GREEN, health_rect)
        
        # Border
        pygame.draw.rect(screen, WHITE, bar_rect, 2)
        
        # Health text
        health_text = small_font.render(f"{max(0, self.health)}/{self.max_health}", True, WHITE)
        health_rect = health_text.get_rect(center=(body_x, self.y + 120))
        screen.blit(health_text, health_rect)
    
    def attack_enemy(self, enemy) -> int:
        """Perform basic attack"""
        self.is_attacking = True
        self.attack_timer = 30
        damage = random.randint(int(self.attack * 0.8), int(self.attack * 1.2))
        final_damage = max(1, damage - enemy.defense)
        enemy.health -= final_damage
        return final_damage
    
    def special_attack(self, enemy) -> int:
        """Perform special attack"""
        self.is_attacking = True
        self.attack_timer = 30
        damage = random.randint(int(self.attack * 1.2), int(self.attack * 1.5))
        final_damage = max(1, damage - enemy.defense)
        enemy.health -= final_damage
        return final_damage
    
    def heal(self) -> int:
        """Heal character"""
        heal_amount = random.randint(15, 25)
        old_health = self.health
        self.health = min(self.max_health, self.health + heal_amount)
        return self.health - old_health
    
    def update_animation(self):
        """Update character animation"""
        if self.is_attacking and self.attack_timer > 0:
            self.animation_offset = random.randint(-5, 5)
            self.attack_timer -= 1
        else:
            self.is_attacking = False
            self.animation_offset = 0

class Button:
    """UI Button class"""
    
    def __init__(self, x: int, y: int, width: int, height: int, text: str, color: Tuple[int, int, int] = GRAY):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.color = color
        self.hover_color = tuple(min(255, c + 30) for c in color)
        self.is_hovered = False
    
    def draw(self, screen):
        """Draw button"""
        color = self.hover_color if self.is_hovered else self.color
        pygame.draw.rect(screen, color, self.rect)
        pygame.draw.rect(screen, WHITE, self.rect, 2)
        
        text_surface = button_font.render(self.text, True, WHITE)
        text_rect = text_surface.get_rect(center=self.rect.center)
        screen.blit(text_surface, text_rect)
    
    def handle_event(self, event) -> bool:
        """Handle mouse events"""
        if event.type == pygame.MOUSEMOTION:
            self.is_hovered = self.rect.collidepoint(event.pos)
        elif event.type == pygame.MOUSEBUTTONDOWN:
            if self.rect.collidepoint(event.pos):
                assets.play_sound('click')
                return True
        return False

# ==================== STORE ITEMS ====================
def get_store_items() -> List[Dict]:
    """Get all store items organized by tier"""
    return [
        # Basic Tier
        {"name": "Iron Sword", "type": "weapon", "cost_shards": 50, "cost_gold": 20, 
         "attack_boost": 5, "tier": ItemTier.BASIC.value},
        {"name": "Steel Armor", "type": "armor", "cost_shards": 60, "cost_gold": 25, 
         "defense_boost": 6, "tier": ItemTier.BASIC.value},
        {"name": "Health Potion", "type": "consumable", "cost_shards": 20, "cost_gold": 10, 
         "heal": 40, "tier": ItemTier.BASIC.value},
        {"name": "Magic Ring", "type": "accessory", "cost_shards": 80, "cost_gold": 30, 
         "attack_boost": 3, "defense_boost": 3, "tier": ItemTier.BASIC.value},
        {"name": "Swift Boots", "type": "accessory", "cost_shards": 70, "cost_gold": 25, 
         "speed_boost": 10, "tier": ItemTier.BASIC.value},
        
        # Intermediate Tier
        {"name": "Lightning Wand+", "type": "weapon", "cost_shards": 120, "cost_gold": 50, 
         "attack_boost": 12, "tier": ItemTier.INTERMEDIATE.value},
        {"name": "Dragon Scale Armor", "type": "armor", "cost_shards": 150, "cost_gold": 60, 
         "defense_boost": 15, "tier": ItemTier.INTERMEDIATE.value},
        {"name": "Berserker Ring", "type": "accessory", "cost_shards": 200, "cost_gold": 80, 
         "attack_boost": 8, "speed_boost": 5, "tier": ItemTier.INTERMEDIATE.value},
        {"name": "Guardian Shield", "type": "armor", "cost_shards": 180, "cost_gold": 70, 
         "defense_boost": 20, "tier": ItemTier.INTERMEDIATE.value},
        {"name": "Phoenix Feather", "type": "consumable", "cost_shards": 100, "cost_gold": 50, 
         "max_health_boost": 25, "tier": ItemTier.INTERMEDIATE.value},
        
        # Advanced Tier
        {"name": "Dragonbone Sword", "type": "weapon", "cost_shards": 400, "cost_gold": 150, 
         "attack_boost": 25, "tier": ItemTier.ADVANCED.value},
        {"name": "Void Armor", "type": "armor", "cost_shards": 450, "cost_gold": 180, 
         "defense_boost": 30, "tier": ItemTier.ADVANCED.value},
        {"name": "Titan's Gauntlets", "type": "accessory", "cost_shards": 350, "cost_gold": 140, 
         "attack_boost": 15, "defense_boost": 10, "tier": ItemTier.ADVANCED.value},
        
        # Legendary Tier
        {"name": "DRUID CLOAK", "type": "legendary", "cost_shards": 600, "cost_gold": 250, 
         "attack_boost": 20, "defense_boost": 15, "special_power": "Druid Magic", "tier": ItemTier.LEGENDARY.value},
        {"name": "GODSLAYER SWORD", "type": "legendary", "cost_shards": 800, "cost_gold": 350, 
         "attack_boost": 40, "special_power": "Divine Strike", "tier": ItemTier.LEGENDARY.value},
        
        # Mythic Tier
        {"name": "EXCALIBUR", "type": "mythic", "cost_shards": 1500, "cost_gold": 700, 
         "attack_boost": 60, "special_power": "Holy Light", "tier": ItemTier.MYTHIC.value},
        {"name": "OMNIPOTENT RING", "type": "mythic", "cost_shards": 2000, "cost_gold": 1000, 
         "attack_boost": 35, "defense_boost": 35, "speed_boost": 20, "max_health_boost": 100, "tier": ItemTier.MYTHIC.value},
    ]

# ==================== WORLD MAP LOCATIONS ====================
def get_world_locations() -> Dict[str, Location]:
    """Get all world map locations based on the provided map"""
    return {
        "arena": Location(
            name="Arena",
            x=200, y=350,
            enemies=["Goblin", "Orc"],
            description="Test your might in the gladiator arena!",
            background_color=(60, 40, 20),
            special_effect=None
        ),
        "docks": Location(
            name="Docks",  # The docks area with ships
            x=250, y=650,
            enemies=["Pirate", "Sea Serpent", "Ghost Ship"],
            description="Pirates and undead sailors guard the docks!",
            background_color=(10, 30, 60),
            special_effect="water"
        ),
        "city": Location(
            name="City",
            x=200, y=550,
            enemies=["City Guard", "Assassin", "Golem"],
            description="The city streets hide many dangers.",
            background_color=(40, 40, 30),
            special_effect="ruins"
        ),
        "shrine": Location(
            name="Shrine",
            x=1100, y=450,
            enemies=["Temple Guardian", "Spirit Monk", "Celestial"],
            description="An ancient shrine with mystical guardians.",
            background_color=(50, 30, 60),
            special_effect="divine"
        ),
        "mansion": Location(
            name="Mansion",
            x=850, y=200,
            enemies=["Vampire", "Ghost", "Banshee"],
            description="A haunted mansion full of dark magic!",
            background_color=(20, 20, 40),
            special_effect="haunted"
        ),
        "maze": Location(
            name="Maze",
            x=900, y=650,
            enemies=["Fire Elemental", "Lava Beast", "Minotaur"],
            description="A fiery labyrinth - don't get lost!",
            background_color=(80, 20, 10),
            special_effect="fire"
        ),
        "castle": Location(
            name="Battle of Druids",  # The central castle
            x=650, y=300,
            enemies=["Druid Lord", "Ancient Guardian"],
            description="The ultimate druid battle awaits!",
            unlock_requirements=["arena", "docks", "city", "shrine", "mansion", "maze"],
            background_color=(30, 30, 50),
            special_effect="magical"
        ),
        "bot_attack": Location(
            name="Bot Attack",  # The locked bottom area
            x=700, y=750,
            enemies=["Mech Dragon", "War Machine"],
            description="Futuristic enemies from another dimension!",
            unlock_requirements=["arena", "docks", "city", "shrine", "mansion", "maze"],
            background_color=(40, 40, 60),
            special_effect="tech"
        )
    }

# ==================== DRAWING FUNCTIONS ====================
def draw_background():
    """Draw gradient background"""
    for y in range(SCREEN_HEIGHT):
        color_ratio = y / SCREEN_HEIGHT
        r = int(20 * (1 - color_ratio) + 60 * color_ratio)
        g = int(10 * (1 - color_ratio) + 30 * color_ratio)
        b = int(40 * (1 - color_ratio) + 80 * color_ratio)
        pygame.draw.line(screen, (r, g, b), (0, y), (SCREEN_WIDTH, y))

def draw_location_background(location: Optional[Location]):
    """Draw location-specific background"""
    if location is None:
        draw_background()
        return
    
    bg_color = location.background_color
    
    if location.special_effect == "haunted":
        # Dark, spooky gradient
        for y in range(SCREEN_HEIGHT):
            color_ratio = y / SCREEN_HEIGHT
            r = int(bg_color[0] * (1 - color_ratio * 0.5))
            g = int(bg_color[1] * (1 - color_ratio * 0.5))
            b = int(bg_color[2] * (1 + color_ratio * 0.3))
            pygame.draw.line(screen, (r, g, b), (0, y), (SCREEN_WIDTH, y))
        
        # Add spooky effects
        for i in range(10):
            x = random.randint(0, SCREEN_WIDTH)
            y = random.randint(0, SCREEN_HEIGHT // 2)
            pygame.draw.circle(screen, (100, 100, 150), (x, y), random.randint(2, 5))
    
    elif location.special_effect == "water":
        # Blue water gradient
        for y in range(SCREEN_HEIGHT):
            color_ratio = y / SCREEN_HEIGHT
            r = int(bg_color[0])
            g = int(bg_color[1] + 20 * color_ratio)
            b = int(bg_color[2] + 40 * color_ratio)
            pygame.draw.line(screen, (r, g, b), (0, y), (SCREEN_WIDTH, y))
        
        # Add water effects
        for i in range(15):
            x = random.randint(0, SCREEN_WIDTH)
            y = random.randint(SCREEN_HEIGHT // 2, SCREEN_HEIGHT)
            pygame.draw.circle(screen, (30, 50, 100), (x, y), random.randint(3, 8))
    
    elif location.special_effect == "fire":
        # Red/orange fire gradient
        for y in range(SCREEN_HEIGHT):
            color_ratio = y / SCREEN_HEIGHT
            r = int(bg_color[0] + 40 * color_ratio)
            g = int(bg_color[1] + 20 * color_ratio)
            b = int(bg_color[2])
            pygame.draw.line(screen, (r, g, b), (0, y), (SCREEN_WIDTH, y))
        
        # Add lava bubbles
        for i in range(8):
            x = random.randint(0, SCREEN_WIDTH)
            y = random.randint(SCREEN_HEIGHT // 2, SCREEN_HEIGHT)
            pygame.draw.circle(screen, (255, 100, 0), (x, y), random.randint(4, 10))
    
    elif location.special_effect == "divine":
        # Purple mystical gradient
        for y in range(SCREEN_HEIGHT):
            color_ratio = y / SCREEN_HEIGHT
            r = int(bg_color[0] + 30 * math.sin(color_ratio * 3.14))
            g = int(bg_color[1])
            b = int(bg_color[2] + 40 * color_ratio)
            pygame.draw.line(screen, (r, g, b), (0, y), (SCREEN_WIDTH, y))
        
        # Add divine light effects
        for i in range(12):
            x = random.randint(0, SCREEN_WIDTH)
            y = random.randint(0, SCREEN_HEIGHT // 3)
            pygame.draw.circle(screen, (200, 200, 255), (x, y), random.randint(2, 6))
    
    else:
        # Default background for other locations
        for y in range(SCREEN_HEIGHT):
            color_ratio = y / SCREEN_HEIGHT
            r = int(bg_color[0] * (1 - color_ratio * 0.3) + 20 * color_ratio)
            g = int(bg_color[1] * (1 - color_ratio * 0.3) + 15 * color_ratio)
            b = int(bg_color[2] * (1 - color_ratio * 0.3) + 25 * color_ratio)
            pygame.draw.line(screen, (r, g, b), (0, y), (SCREEN_WIDTH, y))

def draw_shop_background():
    """Draw shop background"""
    if assets.shop_background:
        screen.blit(assets.shop_background, (0, 0))
    else:
        # Fallback shop background
        for y in range(SCREEN_HEIGHT // 2, SCREEN_HEIGHT):
            color_ratio = (y - SCREEN_HEIGHT // 2) / (SCREEN_HEIGHT // 2)
            r = int(101 + 20 * color_ratio)
            g = int(67 + 15 * color_ratio)
            b = int(33 + 10 * color_ratio)
            pygame.draw.line(screen, (r, g, b), (0, y), (SCREEN_WIDTH, y))
        
        for y in range(0, SCREEN_HEIGHT // 2):
            color_ratio = y / (SCREEN_HEIGHT // 2)
            r = g = int(80 + 30 * color_ratio)
            b = int(90 + 20 * color_ratio)
            pygame.draw.line(screen, (r, g, b), (0, y), (SCREEN_WIDTH, y))

def draw_world_map_background():
    """Draw world map background"""
    if assets.world_map_background:
        screen.blit(assets.world_map_background, (0, 0))
    else:
        # Fallback world map style background
        # Ocean blue gradient
        for y in range(SCREEN_HEIGHT):
            color_ratio = y / SCREEN_HEIGHT
            r = int(0 + 30 * color_ratio)
            g = int(50 + 70 * color_ratio)
            b = int(100 + 55 * color_ratio)
            pygame.draw.line(screen, (r, g, b), (0, y), (SCREEN_WIDTH, y))
        
        # Draw some land masses
        pygame.draw.ellipse(screen, (34, 139, 34), (100, 150, 300, 200))  # Forest green
        pygame.draw.ellipse(screen, (160, 82, 45), (500, 100, 400, 300))  # Brown mountains
        pygame.draw.ellipse(screen, (34, 139, 34), (800, 350, 350, 250))  # More forest
        pygame.draw.ellipse(screen, (244, 164, 96), (200, 450, 250, 150))  # Sandy area

# ==================== GAME SCREENS ====================
def character_selection_screen() -> Character:
    """Character selection screen"""
    characters = [
        (CharacterType.KNIGHT.value, "Fast with strong sword"),
        (CharacterType.WIZARD.value, "Magic spells with lightning wand"),
        (CharacterType.ROGUE.value, "Quick with twin daggers"),
        (CharacterType.SOLDIER.value, "Strong armor with basic spear")
    ]
    
    buttons = []
    for i, (char_type, description) in enumerate(characters):
        button = Button(350, 200 + i * 120, 700, 100, f"{char_type} - {description}")
        buttons.append((button, char_type))
    
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            
            for button, char_type in buttons:
                if button.handle_event(event):
                    assets.start_music()
                    return Character(f"Hero {char_type}", char_type, 200, 400)
        
        draw_background()
        
        title_text = title_font.render("BATTLE OF THE DRUIDS", True, WHITE)
        title_rect = title_text.get_rect(center=(SCREEN_WIDTH // 2, 80))
        screen.blit(title_text, title_rect)
        
        subtitle_text = text_font.render("Choose Your Character:", True, WHITE)
        subtitle_rect = subtitle_text.get_rect(center=(SCREEN_WIDTH // 2, 140))
        screen.blit(subtitle_text, subtitle_rect)
        
        for button, _ in buttons:
            button.draw(screen)
        
        pygame.display.flip()
        clock.tick(FPS)

def world_map_screen(player: Character):
    """World map screen where player can move and select locations"""
    locations = get_world_locations()
    
    # Player starting position (center of map)
    map_player_x = 650
    map_player_y = 450
    player_speed = 5
    
    # UI
    back_btn = Button(50, 20, 150, 50, "← Back", GRAY)
    
    # Track if player is near a location
    current_location = None
    
    def check_location_unlocked(loc_key: str) -> bool:
        """Check if a location is unlocked"""
        location = locations[loc_key]
        if not location.unlock_requirements:
            return True
        
        # Check if player has victories from all required locations
        for req_loc in location.unlock_requirements:
            req_key = req_loc.replace(" ", "_").replace("_track", "")
            if req_key not in player.location_victories or player.location_victories[req_key] == 0:
                return False
        return True
    
    while True:
        # Handle input
        keys = pygame.key.get_pressed()
        dx = dy = 0
        
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            dx = -player_speed
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            dx = player_speed
        if keys[pygame.K_UP] or keys[pygame.K_w]:
            dy = -player_speed
        if keys[pygame.K_DOWN] or keys[pygame.K_s]:
            dy = player_speed
        
        # Update player position
        new_x = map_player_x + dx
        new_y = map_player_y + dy
        
        # Keep player on screen
        if 50 < new_x < SCREEN_WIDTH - 50:
            map_player_x = new_x
        if 50 < new_y < SCREEN_HEIGHT - 150:
            map_player_y = new_y
        
        # Check proximity to locations
        current_location = None
        for loc_key, location in locations.items():
            distance = math.sqrt((map_player_x - location.x)**2 + (map_player_y - location.y)**2)
            if distance < 60:  # Within 60 pixels
                if check_location_unlocked(loc_key):
                    current_location = location
                break
        
        # Handle events
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            
            if back_btn.handle_event(event):
                return
            
            # Enter location on SPACE or ENTER
            if event.type == pygame.KEYDOWN:
                if (event.key == pygame.K_SPACE or event.key == pygame.K_RETURN) and current_location:
                    # Enter battle at this location
                    if player.health < 20:
                        continue  # Too injured
                    
                    battle_result = battle_screen(player, current_location)
                    # Player will be returned to world map after victory/defeat
        
        # Draw everything
        draw_world_map_background()
        
        # Draw location markers
        for loc_key, location in locations.items():
            # Check if unlocked
            is_unlocked = check_location_unlocked(loc_key)
            
            # Draw lock icon for locked locations
            if not is_unlocked:
                # Brown lock background
                pygame.draw.circle(screen, (139, 69, 19), (location.x, location.y - 20), 25)
                pygame.draw.circle(screen, (101, 67, 33), (location.x, location.y - 20), 25, 3)
                
                # Lock icon
                lock_text = text_font.render("🔒", True, GOLD)
                lock_rect = lock_text.get_rect(center=(location.x, location.y - 20))
                screen.blit(lock_text, lock_rect)
            
            # Location name label with background
            name_bg_color = (40, 40, 40) if is_unlocked else (60, 30, 30)
            name_width = small_font.size(location.name)[0] + 20
            name_bg = pygame.Rect(location.x - name_width//2, location.y + 30, name_width, 30)
            pygame.draw.rect(screen, name_bg_color, name_bg)
            pygame.draw.rect(screen, WHITE if is_unlocked else GRAY, name_bg, 2)
            
            name_color = WHITE if is_unlocked else GRAY
            name_text = small_font.render(location.name, True, name_color)
            name_rect = name_text.get_rect(center=(location.x, location.y + 45))
            screen.blit(name_text, name_rect)
            
            # Victory count
            loc_key_clean = loc_key.replace("_track", "")
            loc_victories = player.location_victories.get(loc_key_clean, 0)
            if loc_victories > 0:
                victory_text = small_font.render(f"Wins: {loc_victories}", True, GOLD)
                victory_rect = victory_text.get_rect(center=(location.x, location.y + 70))
                screen.blit(victory_text, victory_rect)
        
        # Draw player character on map
        if assets.character_images and player.char_type.lower() in assets.character_images:
            # Draw small version of character sprite
            char_image = assets.character_images[player.char_type.lower()]
            small_char = pygame.transform.scale(char_image, (80, 80))
            char_rect = small_char.get_rect(center=(map_player_x, map_player_y))
            screen.blit(small_char, char_rect)
        else:
            # Simple circle for player
            pygame.draw.circle(screen, YELLOW, (map_player_x, map_player_y), 25)
            pygame.draw.circle(screen, WHITE, (map_player_x, map_player_y), 25, 3)
            # Character initial
            initial_text = button_font.render(player.char_type[0], True, BLACK)
            initial_rect = initial_text.get_rect(center=(map_player_x, map_player_y))
            screen.blit(initial_text, initial_rect)
        
        # Current location info
        if current_location:
            # Draw info box
            info_box = pygame.Rect(SCREEN_WIDTH - 400, 100, 380, 220)
            pygame.draw.rect(screen, (20, 20, 30), info_box)
            pygame.draw.rect(screen, GOLD, info_box, 3)
            
            # Location name
            loc_name = button_font.render(current_location.name, True, GOLD)
            screen.blit(loc_name, (info_box.x + 10, info_box.y + 10))
            
            # Description (word wrap)
            words = current_location.description.split()
            lines = []
            current_line = []
            for word in words:
                test_line = ' '.join(current_line + [word])
                if small_font.size(test_line)[0] < 360:
                    current_line.append(word)
                else:
                    lines.append(' '.join(current_line))
                    current_line = [word]
            if current_line:
                lines.append(' '.join(current_line))
            
            for i, line in enumerate(lines[:3]):  # Max 3 lines
                desc_text = small_font.render(line, True, WHITE)
                screen.blit(desc_text, (info_box.x + 10, info_box.y + 60 + i * 25))
            
            # Enemies
            enemy_label = small_font.render("Enemies:", True, RED)
            screen.blit(enemy_label, (info_box.x + 10, info_box.y + 140))
            
            enemies_text = small_font.render(", ".join(current_location.enemies[:2]), True, WHITE)
            screen.blit(enemies_text, (info_box.x + 10, info_box.y + 165))
            
            # Action prompt
            if player.health >= 20:
                action_text = text_font.render("Press SPACE to enter!", True, GREEN)
            else:
                action_text = text_font.render("Too injured to fight!", True, RED)
            screen.blit(action_text, (info_box.x + 10, info_box.y + 190))
        
        # Instructions box
        inst_box = pygame.Rect(10, SCREEN_HEIGHT - 120, 400, 110)
        pygame.draw.rect(screen, (20, 20, 30), inst_box)
        pygame.draw.rect(screen, WHITE, inst_box, 2)
        
        instructions = [
            "Use WASD or Arrow Keys to move",
            "Press SPACE or ENTER to enter location",
            "Defeat enemies in all locations to unlock special areas!"
        ]
        for i, instruction in enumerate(instructions):
            inst_text = small_font.render(instruction, True, WHITE)
            screen.blit(inst_text, (20, SCREEN_HEIGHT - 105 + i * 30))
        
        # Player stats bar at top
        stats_bg = pygame.Rect(200, 10, SCREEN_WIDTH - 220, 60)
        pygame.draw.rect(screen, (30, 30, 40), stats_bg)
        pygame.draw.rect(screen, WHITE, stats_bg, 2)
        
        stats_text = text_font.render(
            f"HP: {player.health}/{player.max_health} | 💎 {player.dragon_shards} | 🪙 {player.gold} | 🏆 {player.victories}",
            True, WHITE
        )
        screen.blit(stats_text, (220, 30))
        
        # Back button
        back_btn.draw(screen)
        
        pygame.display.flip()
        clock.tick(FPS)

def create_enemy(player: Character, location: Optional[Location] = None) -> Character:
    """Create enemy scaled to player's progress"""
    if location and location.enemies:
        enemy_name = random.choice(location.enemies)
    else:
        enemy_types = ["Goblin", "Dark Mage", "Skeleton", "Orc"]
        enemy_name = random.choice(enemy_types)
    
    enemy = Character(enemy_name, "Enemy", 700, 400)
    
    # Scale enemy strength
    level_multiplier = 1 + (player.victories * 0.05)
    victory_bonus = player.victories * 1.5
    
    # Extra difficulty for locked locations
    if location and location.name in ["Battle of Druids", "Bot Attack"]:
        level_multiplier *= 1.5
        victory_bonus += 20
    
    # Base stats
    base_health = random.randint(60, 80)
    base_attack = random.randint(15, 25)
    base_defense = random.randint(8, 15)
    
    # Enemy-specific stat modifications
    if enemy_name == "Ghost":
        base_health -= 10  # Ghosts are fragile
        base_defense -= 5
        base_attack += 5  # But hit harder
    elif enemy_name == "Vampire":
        base_health += 20  # Vampires are tough
        base_attack += 10
        base_defense += 5
    elif enemy_name == "Golem":
        base_health += 30  # Very tanky
        base_defense += 15
        base_attack -= 5  # But slow
    elif enemy_name in ["Fire Elemental", "Lava Beast"]:
        base_attack += 15  # Fire creatures deal high damage
        base_defense -= 5  # But are vulnerable
    elif enemy_name in ["Sea Serpent", "Kraken Spawn"]:
        base_health += 15
        base_attack += 8
    elif enemy_name == "Temple Guardian":
        base_health += 25
        base_defense += 12
    elif enemy_name == "Minotaur":
        base_health += 35
        base_attack += 12
        base_defense += 8
    elif enemy_name in ["Druid Lord", "Ancient Guardian"]:
        base_health += 40
        base_attack += 20
        base_defense += 15
    elif enemy_name in ["Mech Dragon", "War Machine"]:
        base_health += 50
        base_attack += 25
        base_defense += 20
    
    # Apply scaling
    enemy.health = int(base_health * level_multiplier) + victory_bonus
    enemy.max_health = enemy.health
    enemy.attack = int(base_attack * level_multiplier) + (victory_bonus // 2)
    enemy.defense = int(base_defense * level_multiplier) + (victory_bonus // 3)
    
    # Give enemies appropriate weapons
    weapon_map = {
        "Goblin": "Rusty Dagger",
        "Orc": "Heavy Club", 
        "Dark Mage": "Dark Staff",
        "Skeleton": "Bone Sword",
        "Ghost": "Spectral Touch",
        "Vampire": "Blood Fangs",
        "Pirate": "Cutlass",
        "City Guard": "Guard Spear",
        "Assassin": "Poison Blade",
        "Golem": "Stone Fists",
        "Fire Elemental": "Flame Burst",
        "Temple Guardian": "Holy Mace",
        "Minotaur": "Giant Axe",
        "Druid Lord": "Nature Staff",
        "Mech Dragon": "Laser Cannon",
    }
    enemy.weapon = weapon_map.get(enemy_name, "Crude Weapon")
    
    # Add titles based on player victories
    if player.victories >= 10:
        enemy.name = f"Elite {enemy_name}"
    elif player.victories >= 5:
        enemy.name = f"Veteran {enemy_name}"
    elif player.victories >= 2:
        enemy.name = f"Tough {enemy_name}"
    
    return enemy

def battle_screen(player: Character, location: Optional[Location] = None) -> bool:
    """Battle screen - returns True if player wins, False if defeated"""
    enemy = create_enemy(player, location)
    
    # Reset positions
    player.x, player.y = 200, 400
    enemy.x, enemy.y = 700, 400
    
    # Battle UI
    attack_btn = Button(50, 600, 180, 60, "Attack", BLUE)
    special_btn = Button(250, 600, 180, 60, "Special", PURPLE)
    heal_btn = Button(450, 600, 180, 60, "Heal", GREEN)
    
    battle_log = []
    damage_numbers = []  # For floating damage numbers
    attack_effects = []  # For attack animations
    screen_shake = 0     # For screen shake effect
    
    def add_to_log(message: str):
        battle_log.append(message)
        if len(battle_log) > 8:
            battle_log.pop(0)
    
    add_to_log(f"Battle begins! {player.name} vs {enemy.name}")
    if location:
        add_to_log(f"Location: {location.name}")
    
    while player.health > 0 and enemy.health > 0:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            
            player_acted = False
            
            if attack_btn.handle_event(event):
                assets.play_sound('attack')
                damage = player.attack_enemy(enemy)
                add_to_log(f"{player.name} attacks for {damage} damage!")
                
                # Add damage number and attack effect
                damage_numbers.append(DamageNumber(enemy.x, enemy.y - 30, damage))
                if "Sword" in player.weapon:
                    attack_effects.append(AttackEffect(enemy.x, enemy.y, "slash"))
                elif "Wand" in player.weapon:
                    attack_effects.append(AttackEffect(enemy.x, enemy.y, "magic"))
                else:
                    attack_effects.append(AttackEffect(enemy.x, enemy.y, "slash"))
                screen_shake = 10  # Add screen shake
                
                player_acted = True
            
            elif special_btn.handle_event(event):
                assets.play_sound('special')
                damage = player.special_attack(enemy)
                add_to_log(f"{player.name} uses {player.special} for {damage} damage!")
                
                # Add special damage number and effect
                damage_numbers.append(DamageNumber(enemy.x, enemy.y - 30, damage, True))
                attack_effects.append(AttackEffect(enemy.x, enemy.y, "special"))
                screen_shake = 15  # Bigger shake for special attacks
                
                player_acted = True
            
            elif heal_btn.handle_event(event):
                assets.play_sound('heal')
                heal_amount = player.heal()
                add_to_log(f"{player.name} heals for {heal_amount} HP!")
                
                # Add healing number (green)
                damage_numbers.append(DamageNumber(player.x, player.y - 30, heal_amount, False, True))
                
                player_acted = True
            
            if player_acted:
                # Add special location effects
                if location and location.special_effect:
                    if location.special_effect == "haunted" and random.randint(1, 10) == 1:
                        add_to_log("👻 Spooky presence weakens the enemy!")
                        enemy.attack = max(1, enemy.attack - 5)
                    elif location.special_effect == "fire" and random.randint(1, 8) == 1:
                        add_to_log("🔥 Lava burst damages enemy!")
                        enemy.health -= 10
                        damage_numbers.append(DamageNumber(enemy.x, enemy.y - 50, 10, True))
                    elif location.special_effect == "divine" and random.randint(1, 12) == 1:
                        add_to_log("✨ Divine blessing heals you!")
                        heal_amount = 15
                        player.health = min(player.max_health, player.health + heal_amount)
                        damage_numbers.append(DamageNumber(player.x, player.y - 50, heal_amount, False, True))
                    elif location.special_effect == "water" and random.randint(1, 6) == 1:
                        add_to_log("🌊 Tidal wave boosts your attack!")
                        damage += 10
                        damage_numbers.append(DamageNumber(enemy.x + 30, enemy.y - 60, 10, True))
                    elif location.special_effect == "ruins" and random.randint(1, 10) == 1:
                        add_to_log("⚡ Ancient magic amplifies your power!")
                        damage += 8
                
                # Check if enemy defeated
                if enemy.health <= 0:
                    # Track location victory
                    if location:
                        location_key = location.name.lower().replace(" ", "_")
                        if location_key not in player.location_victories:
                            player.location_victories[location_key] = 0
                        player.location_victories[location_key] += 1
                    
                    # Victory screen
                    return show_victory_screen(player, enemy, location)
                
                # Enemy turn
                enemy_damage = enemy.attack_enemy(player)
                enemy.is_attacking = True
                add_to_log(f"{enemy.name} attacks for {enemy_damage} damage!")
                
                # Enemy damage number and effect
                damage_numbers.append(DamageNumber(player.x, player.y - 30, enemy_damage))
                attack_effects.append(AttackEffect(player.x, player.y, "slash"))
                screen_shake = 8
                
                # Special enemy abilities
                base_enemy_name = enemy.name
                for prefix in ["Elite ", "Veteran ", "Tough "]:
                    if base_enemy_name.startswith(prefix):
                        base_enemy_name = base_enemy_name[len(prefix):]
                        break
                
                if base_enemy_name == "Vampire" and random.randint(1, 6) == 1:
                    # Vampire life steal
                    steal_amount = enemy_damage // 2
                    enemy.health = min(enemy.max_health, enemy.health + steal_amount)
                    add_to_log(f"🧛 {enemy.name} steals {steal_amount} life!")
                    damage_numbers.append(DamageNumber(enemy.x, enemy.y - 50, steal_amount, False, True))
                elif base_enemy_name == "Ghost" and random.randint(1, 8) == 1:
                    # Ghost phase - reduces player defense temporarily
                    player.defense = max(0, player.defense - 2)
                    add_to_log(f"👻 {enemy.name} phases through armor! Defense reduced!")
                elif base_enemy_name == "Fire Elemental" and random.randint(1, 5) == 1:
                    # Burn damage
                    burn_damage = 5
                    player.health -= burn_damage
                    add_to_log(f"🔥 {enemy.name} burns you for {burn_damage} damage!")
                    damage_numbers.append(DamageNumber(player.x + 30, player.y - 60, burn_damage))
                elif base_enemy_name == "Minotaur" and random.randint(1, 7) == 1:
                    # Rage - increases attack
                    enemy.attack += 3
                    add_to_log(f"💢 {enemy.name} enters a rage! Attack increased!")
                elif base_enemy_name == "Golem" and random.randint(1, 10) == 1:
                    # Stone skin - increases defense
                    enemy.defense += 5
                    add_to_log(f"🗿 {enemy.name} hardens! Defense increased!")
        
        # Update animations and effects
        player.update_animation()
        enemy.update_animation()
        
        # Update damage numbers
        damage_numbers = [dn for dn in damage_numbers if dn.update()]
        
        # Update attack effects
        attack_effects = [ae for ae in attack_effects if ae.update()]
        
        # Update screen shake
        if screen_shake > 0:
            screen_shake -= 1
        
        # Calculate screen shake offset
        shake_x = random.randint(-screen_shake, screen_shake) if screen_shake > 0 else 0
        shake_y = random.randint(-screen_shake, screen_shake) if screen_shake > 0 else 0
        
        # Draw everything with shake offset
        draw_location_background(location)
        
        # Draw characters with shake offset
        temp_player_x = player.x
        temp_enemy_x = enemy.x
        temp_player_y = player.y
        temp_enemy_y = enemy.y
        
        player.x += shake_x
        enemy.x += shake_x
        player.y += shake_y
        enemy.y += shake_y
        
        player.draw(screen)
        enemy.draw(screen)
        
        # Restore positions
        player.x = temp_player_x
        enemy.x = temp_enemy_x
        player.y = temp_player_y
        enemy.y = temp_enemy_y
        
        # Draw attack effects
        for effect in attack_effects:
            effect.draw(screen)
        
        # Draw damage numbers
        for damage_num in damage_numbers:
            damage_num.draw(screen)
        
        # Draw stats
        stats = [
            f"Shards: {player.dragon_shards}",
            f"Gold: {player.gold}",
            f"Victories: {player.victories}"
        ]
        for i, stat in enumerate(stats):
            text_surface = small_font.render(stat, True, WHITE)
            screen.blit(text_surface, (20, 20 + i * 30))
        
        # Draw battle log
        for i, log_entry in enumerate(battle_log):
            log_surface = small_font.render(log_entry, True, WHITE)
            screen.blit(log_surface, (600, 50 + i * 30))
        
        # Draw buttons
        attack_btn.draw(screen)
        special_btn.draw(screen)
        heal_btn.draw(screen)
        
        # Check for defeat
        if player.health <= 0:
            show_defeat_screen(player)
            return False
        
        pygame.display.flip()
        clock.tick(FPS)
    
    return True

def show_victory_screen(player: Character, enemy: Character, location: Optional[Location] = None) -> bool:
    """Show victory screen with rewards and animations"""
    assets.play_sound('victory')
    
    # Calculate rewards
    player.victories += 1
    base_shards = random.randint(20, 35)
    base_gold = random.randint(15, 25)
    
    # Victory bonus based on total victories
    victory_bonus_shards = player.victories * 2
    victory_bonus_gold = player.victories
    
    # Location bonus for special areas
    location_multiplier = 1.0
    if location and location.name in ["Battle of Druids", "Bot Attack"]:
        location_multiplier = 2.0
    elif location and location.name in ["Mansion", "Maze"]:
        location_multiplier = 1.5
    
    total_shards = int((base_shards + victory_bonus_shards) * location_multiplier)
    total_gold = int((base_gold + victory_bonus_gold) * location_multiplier)
    
    player.dragon_shards += total_shards
    player.gold += total_gold
    
    # Victory screen loop
    continue_btn = Button(SCREEN_WIDTH // 2 - 100, 600, 200, 60, "Continue", GREEN)
    
    start_time = pygame.time.get_ticks()
    celebration_timer = 0
    
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            
            if continue_btn.handle_event(event):
                return True
        
        celebration_timer += 1
        
        # Animated background
        draw_background()
        
        # Victory text with animation
        current_time = pygame.time.get_ticks() - start_time
        glow = int(30 * math.sin(current_time * 0.003))
        title_y = 150 + int(10 * math.sin(celebration_timer * 0.1))
        
        victory_color = (255, 215 + glow, 0)  # Gold with glow
        victory_text = title_font.render(f"🎉 VICTORY #{player.victories}! 🎉", True, victory_color)
        victory_rect = victory_text.get_rect(center=(SCREEN_WIDTH // 2, title_y))
        
        # Shadow effect
        shadow_text = title_font.render(f"🎉 VICTORY #{player.victories}! 🎉", True, (50, 50, 50))
        shadow_rect = shadow_text.get_rect(center=(SCREEN_WIDTH // 2 + 3, title_y + 3))
        screen.blit(shadow_text, shadow_rect)
        screen.blit(victory_text, victory_rect)
        
        # Enemy defeated
        defeated_text = button_font.render(f"You defeated {enemy.name}!", True, WHITE)
        defeated_rect = defeated_text.get_rect(center=(SCREEN_WIDTH // 2, 250))
        screen.blit(defeated_text, defeated_rect)
        
        # Location info
        if location:
            location_text = text_font.render(f"Location: {location.name}", True, TURQUOISE)
            location_rect = location_text.get_rect(center=(SCREEN_WIDTH // 2, 300))
            screen.blit(location_text, location_rect)
        
        # Rewards box
        reward_box = pygame.Rect(SCREEN_WIDTH // 2 - 250, 350, 500, 200)
        pygame.draw.rect(screen, (40, 40, 60), reward_box)
        pygame.draw.rect(screen, GOLD, reward_box, 3)
        
        # Rewards title
        rewards_title = button_font.render("REWARDS", True, GOLD)
        rewards_rect = rewards_title.get_rect(center=(SCREEN_WIDTH // 2, 380))
        screen.blit(rewards_title, rewards_rect)
        
        # Reward details with sparkle effect
        shard_color = TURQUOISE if (celebration_timer // 10) % 2 == 0 else WHITE
        shards_text = text_font.render(f"💎 Dragon Shards: +{total_shards}", True, shard_color)
        shards_rect = shards_text.get_rect(center=(SCREEN_WIDTH // 2, 430))
        screen.blit(shards_text, shards_rect)
        
        gold_color = GOLD if (celebration_timer // 8) % 2 == 0 else YELLOW
        gold_text = text_font.render(f"🪙 Gold: +{total_gold}", True, gold_color)
        gold_rect = gold_text.get_rect(center=(SCREEN_WIDTH // 2, 470))
        screen.blit(gold_text, gold_rect)
        
        victories_text = text_font.render(f"🏆 Total Victories: {player.victories}", True, WHITE)
        victories_rect = victories_text.get_rect(center=(SCREEN_WIDTH // 2, 510))
        screen.blit(victories_text, victories_rect)
        
        # Floating victory particles
        for i in range(5):
            particle_x = SCREEN_WIDTH // 2 + int(50 * math.sin(celebration_timer * 0.05 + i))
            particle_y = 100 + int(20 * math.cos(celebration_timer * 0.08 + i))
            pygame.draw.circle(screen, GOLD, (particle_x, particle_y), 3)
        
        # Continue button
        continue_btn.draw(screen)
        
        pygame.display.flip()
        clock.tick(FPS)

def show_defeat_screen(player: Character):
    """Show defeat screen"""
    assets.play_sound('defeat')
    
    # Defeat screen loop
    retry_btn = Button(SCREEN_WIDTH // 2 - 250, 500, 200, 60, "Try Again", GREEN)
    quit_btn = Button(SCREEN_WIDTH // 2 + 50, 500, 200, 60, "Main Menu", RED)
    
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            
            if retry_btn.handle_event(event):
                player.health = player.max_health
                return
            
            if quit_btn.handle_event(event):
                return
        
        # Dark background
        draw_background()
        
        # Add dark overlay
        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        overlay.fill((0, 0, 0))
        overlay.set_alpha(150)
        screen.blit(overlay, (0, 0))
        
        # Defeat text
        defeat_text = title_font.render("DEFEATED!", True, RED)
        defeat_rect = defeat_text.get_rect(center=(SCREEN_WIDTH // 2, 200))
        screen.blit(defeat_text, defeat_rect)
        
        # Message
        message_text = button_font.render("You have fallen in battle...", True, WHITE)
        message_rect = message_text.get_rect(center=(SCREEN_WIDTH // 2, 300))
        screen.blit(message_text, message_rect)
        
        # Stats
        stats = [
            f"Final Health: 0/{player.max_health}",
            f"Dragon Shards: {player.dragon_shards}",
            f"Gold: {player.gold}",
            f"Victories: {player.victories}"
        ]
        
        for i, stat in enumerate(stats):
            stat_text = text_font.render(stat, True, GRAY)
            stat_rect = stat_text.get_rect(center=(SCREEN_WIDTH // 2, 380 + i * 30))
            screen.blit(stat_text, stat_rect)
        
        # Buttons
        retry_btn.draw(screen)
        quit_btn.draw(screen)
        
        pygame.display.flip()
        clock.tick(FPS)

def store_screen(player: Character):
    """Enhanced store with pagination"""
    store_items = get_store_items()
    
    # Pagination
    items_per_page = 8
    current_page = 0
    total_pages = (len(store_items) + items_per_page - 1) // items_per_page
    
    # UI
    back_btn = Button(50, 800, 150, 60, "Back", GRAY)
    prev_page_btn = Button(300, 800, 200, 60, "◀ Previous", BLUE)
    next_page_btn = Button(520, 800, 200, 60, "Next ▶", BLUE)
    
    buy_buttons = [Button(50, 150 + i * 75, 120, 50, "Buy", GREEN) for i in range(items_per_page)]
    
    message = ""
    message_timer = 0
    
    # Tier colors
    tier_colors = {
        ItemTier.BASIC.value: (40, 60, 40),
        ItemTier.INTERMEDIATE.value: (40, 40, 80),
        ItemTier.ADVANCED.value: (80, 40, 80),
        ItemTier.LEGENDARY.value: (100, 50, 0),
        ItemTier.MYTHIC.value: (120, 0, 120)
    }
    
    tier_badge_colors = {
        ItemTier.BASIC.value: GRAY,
        ItemTier.INTERMEDIATE.value: BLUE,
        ItemTier.ADVANCED.value: PURPLE,
        ItemTier.LEGENDARY.value: GOLD,
        ItemTier.MYTHIC.value: TURQUOISE
    }
    
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            
            if back_btn.handle_event(event):
                return
            
            # Handle pagination
            if prev_page_btn.handle_event(event) and current_page > 0:
                current_page -= 1
            
            if next_page_btn.handle_event(event) and current_page < total_pages - 1:
                current_page += 1
            
            # Get current page items
            start_index = current_page * items_per_page
            end_index = min(start_index + items_per_page, len(store_items))
            current_items = store_items[start_index:end_index]
            
            # Handle purchases
            for i, btn in enumerate(buy_buttons):
                if i < len(current_items) and btn.handle_event(event):
                    item = current_items[i]
                    
                    if player.dragon_shards >= item["cost_shards"] and player.gold >= item["cost_gold"]:
                        assets.play_sound('buy')
                        player.dragon_shards -= item["cost_shards"]
                        player.gold -= item["cost_gold"]
                        
                        # Apply item effects
                        benefits = []
                        if "attack_boost" in item:
                            player.attack += item["attack_boost"]
                            benefits.append(f"ATK+{item['attack_boost']}")
                        if "defense_boost" in item:
                            player.defense += item["defense_boost"]
                            benefits.append(f"DEF+{item['defense_boost']}")
                        if "speed_boost" in item:
                            player.speed += item["speed_boost"]
                            benefits.append(f"SPD+{item['speed_boost']}")
                        if "max_health_boost" in item:
                            player.max_health += item["max_health_boost"]
                            player.health += item["max_health_boost"]
                            benefits.append(f"MaxHP+{item['max_health_boost']}")
                        if "heal" in item:
                            heal_amount = min(item["heal"], player.max_health - player.health)
                            player.health += heal_amount
                            benefits.append(f"Healed {heal_amount}HP")
                        if "special_power" in item:
                            player.special = item["special_power"]
                            benefits.append("New Special Power!")
                        
                        if item["type"] == "weapon":
                            player.weapon = item["name"]
                        
                        message = f"Bought {item['name']}! " + " | ".join(benefits)
                        message_timer = 240
                    else:
                        message = "Not enough resources!"
                        message_timer = 120
        
        # Update message timer
        if message_timer > 0:
            message_timer -= 1
            if message_timer == 0:
                message = ""
        
        # Draw shop
        draw_shop_background()
        
        # Title
        title_color = [GOLD, YELLOW, TURQUOISE][(pygame.time.get_ticks() // 500) % 3]
        title_text = title_font.render("🏪 DRUID MERCHANT", True, title_color)
        screen.blit(title_text, title_text.get_rect(center=(SCREEN_WIDTH // 2, 50)))
        
        # Currency display
        currency_bg = pygame.Rect(40, 85, 600, 45)
        pygame.draw.rect(screen, (40, 40, 60), currency_bg)
        pygame.draw.rect(screen, GOLD, currency_bg, 3)
        currency_text = text_font.render(f"💎 Shards: {player.dragon_shards}  |  🪙 Gold: {player.gold}", True, WHITE)
        screen.blit(currency_text, (50, 95))
        
        # Page indicator
        page_text = button_font.render(f"Page {current_page + 1} of {total_pages}", True, WHITE)
        screen.blit(page_text, page_text.get_rect(center=(SCREEN_WIDTH // 2, 125)))
        
        # Get current items
        start_index = current_page * items_per_page
        end_index = min(start_index + items_per_page, len(store_items))
        current_items = store_items[start_index:end_index]
        
        # Display items
        for i, item in enumerate(current_items):
            y_pos = 150 + i * 75
            
            # Item background
            item_rect = pygame.Rect(40, y_pos - 5, SCREEN_WIDTH - 100, 70)
            bg_color = tier_colors.get(item["tier"], (30, 30, 30))
            pygame.draw.rect(screen, bg_color, item_rect)
            pygame.draw.rect(screen, WHITE, item_rect, 3)
            
            # Tier badge
            tier_color = tier_badge_colors.get(item["tier"], WHITE)
            tier_badge = pygame.Rect(item_rect.right - 100, y_pos, 80, 25)
            pygame.draw.rect(screen, tier_color, tier_badge)
            pygame.draw.rect(screen, WHITE, tier_badge, 2)
            tier_text = small_font.render(item["tier"], True, BLACK)
            screen.blit(tier_text, tier_text.get_rect(center=tier_badge.center))
            
            # Item name
            name_color = tier_color
            if item["tier"] in [ItemTier.LEGENDARY.value, ItemTier.MYTHIC.value]:
                # Glow effect - ensure we handle color tuples properly
                glow = int(5 * math.sin(pygame.time.get_ticks() * 0.01))
                name_color = tuple(min(255, max(0, c + glow)) for c in tier_color[:3])  # Only RGB, no alpha
            
            name_text = button_font.render(item["name"], True, name_color)
            screen.blit(name_text, (190, y_pos + 5))
            
            # Item stats
            desc_parts = []
            stat_icons = {
                "attack_boost": "⚔️ ATK",
                "defense_boost": "🛡️ DEF",
                "speed_boost": "⚡ SPD",
                "max_health_boost": "💪 MaxHP",
                "heal": "💚 Heal",
                "special_power": "✨"
            }
            
            for stat, icon in stat_icons.items():
                if stat in item:
                    if stat == "special_power":
                        desc_parts.append(f"{icon} {item[stat]}")
                    else:
                        desc_parts.append(f"{icon}+{item[stat]}")
            
            desc = " | ".join(desc_parts) if desc_parts else "Special Item"
            desc_text = small_font.render(desc, True, WHITE)
            screen.blit(desc_text, (190, y_pos + 35))
            
            # Cost
            cost_text = text_font.render(f"💎 {item['cost_shards']} + 🪙 {item['cost_gold']}", True, YELLOW)
            screen.blit(cost_text, (700, y_pos + 20))
            
            # Buy button
            if i < len(current_items):
                buy_buttons[i].draw(screen)
        
        # Navigation
        back_btn.draw(screen)
        if current_page > 0:
            prev_page_btn.draw(screen)
        if current_page < total_pages - 1:
            next_page_btn.draw(screen)
        
        # Message
        if message:
            msg_bg = pygame.Surface((SCREEN_WIDTH - 100, 60))
            msg_bg.fill((0, 0, 0))
            msg_bg.set_alpha(200)
            screen.blit(msg_bg, (50, 720))
            
            msg_color = GREEN if "Bought" in message else RED
            msg_text = text_font.render(message, True, msg_color)
            screen.blit(msg_text, msg_text.get_rect(center=(SCREEN_WIDTH // 2, 750)))
        
        pygame.display.flip()
        clock.tick(FPS)

def show_stats_screen(player: Character):
    """Character stats screen"""
    back_btn = Button(50, 800, 150, 60, "Back", GRAY)
    locations = get_world_locations()
    
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            
            if back_btn.handle_event(event):
                return
        
        draw_background()
        
        # Title
        title_text = title_font.render("CHARACTER STATS", True, WHITE)
        screen.blit(title_text, title_text.get_rect(center=(SCREEN_WIDTH // 2, 50)))
        
        # Draw character
        player.x = SCREEN_WIDTH // 2
        player.y = 200
        player.draw(screen)
        
        # Stats in two columns
        left_stats = [
            ("Name", player.name),
            ("Class", player.char_type),
            ("Health", f"{player.health}/{player.max_health}"),
            ("Attack", str(player.attack)),
            ("Defense", str(player.defense)),
            ("Speed", str(player.speed))
        ]
        
        right_stats = [
            ("Weapon", player.weapon),
            ("Special", player.special),
            ("Dragon Shards", str(player.dragon_shards)),
            ("Gold", str(player.gold)),
            ("Total Victories", str(player.victories)),
            ("Battle Rating", str(player.attack + player.defense + player.speed))
        ]
        
        # Draw stats
        for i, (label, value) in enumerate(left_stats):
            label_text = text_font.render(f"{label}:", True, GOLD)
            value_text = text_font.render(value, True, WHITE)
            screen.blit(label_text, (100, 350 + i * 40))
            screen.blit(value_text, (300, 350 + i * 40))
        
        for i, (label, value) in enumerate(right_stats):
            label_text = text_font.render(f"{label}:", True, GOLD)
            value_text = text_font.render(value, True, WHITE)
            screen.blit(label_text, (700, 350 + i * 40))
            screen.blit(value_text, (900, 350 + i * 40))
        
        # Location victories section
        loc_title = button_font.render("Location Victories", True, TURQUOISE)
        screen.blit(loc_title, loc_title.get_rect(center=(SCREEN_WIDTH // 2, 620)))
        
        # Draw location victory counts
        x_offset = 0
        y_offset = 0
        for i, (loc_key, location) in enumerate(locations.items()):
            loc_key_clean = loc_key.replace("_track", "")  # Handle "race" location
            loc_victories = player.location_victories.get(loc_key_clean, 0)
            
            # Color based on if location is unlocked
            has_victories = loc_victories > 0
            color = GREEN if has_victories else GRAY
            
            # Position in a grid
            x = 200 + (x_offset * 250)
            y = 660 + (y_offset * 30)
            
            loc_text = small_font.render(f"{location.name}: {loc_victories}", True, color)
            screen.blit(loc_text, (x, y))
            
            x_offset += 1
            if x_offset >= 4:
                x_offset = 0
                y_offset += 1
        
        back_btn.draw(screen)
        
        pygame.display.flip()
        clock.tick(FPS)

def main_menu(player: Character):
    """Main game menu"""
    world_btn = Button(450, 180, 500, 90, "🗺️ World Map", PURPLE)
    store_btn = Button(450, 290, 500, 90, "🏪 Visit Store", GOLD)
    stats_btn = Button(450, 400, 500, 90, "📊 View Stats", BLUE)
    heal_btn = Button(450, 510, 500, 90, "😴 Rest & Heal", GREEN)
    quit_btn = Button(450, 620, 500, 90, "❌ Quit Game", GRAY)
    
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            
            if world_btn.handle_event(event):
                world_map_screen(player)
            
            elif store_btn.handle_event(event):
                store_screen(player)
            
            elif stats_btn.handle_event(event):
                show_stats_screen(player)
            
            elif heal_btn.handle_event(event):
                player.health = player.max_health
                assets.play_sound('heal')
            
            elif quit_btn.handle_event(event):
                assets.stop_music()
                pygame.quit()
                sys.exit()
        
        draw_background()
        
        # Title
        title_text = title_font.render("BATTLE OF THE DRUIDS", True, WHITE)
        screen.blit(title_text, title_text.get_rect(center=(SCREEN_WIDTH // 2, 80)))
        
        # Welcome
        welcome_text = text_font.render(f"Welcome, {player.name} the {player.char_type}!", True, WHITE)
        screen.blit(welcome_text, welcome_text.get_rect(center=(SCREEN_WIDTH // 2, 140)))
        
        # Draw all buttons - IMPORTANT: Make sure all buttons are drawn!
        world_btn.draw(screen)
        store_btn.draw(screen)
        stats_btn.draw(screen)
        heal_btn.draw(screen)
        quit_btn.draw(screen)
        
        # Low health warning
        if player.health < 20:
            warning_text = text_font.render("⚠️ Too injured to fight! Rest first!", True, RED)
            screen.blit(warning_text, warning_text.get_rect(center=(SCREEN_WIDTH // 2, 750)))
        
        # Resources display
        resources_text = text_font.render(
            f"💎 Shards: {player.dragon_shards} | 🪙 Gold: {player.gold} | 🏆 Victories: {player.victories}", 
            True, WHITE
        )
        screen.blit(resources_text, resources_text.get_rect(center=(SCREEN_WIDTH // 2, 780)))
        
        pygame.display.flip()
        clock.tick(FPS)

# ==================== MAIN GAME LOOP ====================
def main():
    """Main game entry point"""
    player = character_selection_screen()
    main_menu(player)

if __name__ == "__main__":
    main()
