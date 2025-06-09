const SCREEN_WIDTH = 1024;
const SCREEN_HEIGHT = 768;

const SCENES = {
    VILLAGE: 'VillageScene',
    HOUSE: 'HouseScene',
    FOREST: 'ForestScene',
    FORK: 'ForkScene',
    MOUNTAINS: 'MountainsScene',
    CAVE: 'CaveScene',
    TREASURE: 'TreasureScene',
    SHORE: 'ShoreScene',
    BOAT: 'BoatScene',
    SQUID_BATTLE: 'SquidBattleScene',
    PIRATE_ISLAND: 'PirateIslandScene',
    SORCERER: 'SorcererScene',
    PORTAL: 'PortalScene',
    CREDITS: 'CreditsScene'
};

const ITEMS = {
    BOW: { name: 'Bow', description: 'A sturdy wooden bow' },
    ARROWS: { name: 'Arrows', description: 'Sharp arrows for the bow' },
    LEATHER_ARMOR: { name: 'Leather Armor', description: 'Light protective armor' },
    FOOD: { name: 'Food', description: 'Bread and dried meat' },
    GOBLET: { name: 'Golden Goblet', description: 'A precious golden goblet' },
    SQUID_EYE: { name: 'Squid Eye', description: 'A magical giant squid eye' },
    RUM: { name: 'Bottle of Rum', description: 'Fine pirate rum' }
};

const GAME_STATE = {
    inventory: [],
    visitedLocations: [],
    defeatedEnemies: [],
    canEnterSorcerer: false
};

const ENEMIES = {
    FOREST_TROLLS: {
        name: 'Forest Trolls',
        health: 100,
        attack: 20,
        requiredItems: ['Bow', 'Arrows', 'Leather Armor']
    },
    OGRE: {
        name: 'Cave Ogre',
        health: 150,
        attack: 30,
        requiredItems: ['Bow', 'Arrows', 'Leather Armor']
    },
    GIANT_SQUID: {
        name: 'Giant Squid',
        health: 120,
        attack: 25,
        requiredItems: ['Bow', 'Arrows', 'Leather Armor']
    }
};

export { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES, ITEMS, GAME_STATE, ENEMIES };