// Save system using browser localStorage
// Converted from Python save system to web storage

class SaveSystem {
    constructor() {
        this.savePrefix = 'battle_druids_';
        this.quickSaveKey = 'battle_druids_quicksave';
        this.autoSaveKey = 'battle_druids_autosave';
    }
    
    // Save character to localStorage
    saveCharacter(character, saveName = null) {
        try {
            // Validate character data
            if (!character || typeof character.toSaveData !== 'function') {
                throw new Error('Invalid character data');
            }
            
            const saveData = {
                character: character.toSaveData(),
                saveDate: new Date().toISOString(),
                version: "1.0.0"
            };
            
            const key = saveName ? `${this.savePrefix}${saveName}` : this.quickSaveKey;
            const dataString = JSON.stringify(saveData);
            
            // Check for localStorage quota
            try {
                localStorage.setItem(key, dataString);
            } catch (quotaError) {
                if (quotaError.name === 'QuotaExceededError') {
                    // Try to clean up old auto-saves and retry
                    this.cleanupOldAutoSaves();
                    localStorage.setItem(key, dataString);
                } else {
                    throw quotaError;
                }
            }
            
            return true;
        } catch (error) {
            console.error('Save failed:', error);
            return false;
        }
    }
    
    // Clean up old auto-save files
    cleanupOldAutoSaves() {
        try {
            const autoSaves = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.autoSaveKey)) {
                    const saveDataStr = localStorage.getItem(key);
                    if (saveDataStr) {
                        const saveData = JSON.parse(saveDataStr);
                        autoSaves.push({ key, date: new Date(saveData.saveDate) });
                    }
                }
            }
            
            // Keep only the 5 most recent auto-saves
            autoSaves.sort((a, b) => b.date - a.date);
            const toDelete = autoSaves.slice(5);
            
            toDelete.forEach(save => {
                localStorage.removeItem(save.key);
            });
            
            console.log(`Cleaned up ${toDelete.length} old auto-save files`);
        } catch (error) {
            console.error('Auto-save cleanup failed:', error);
        }
    }
    
    // Load character from localStorage
    loadCharacter(saveName) {
        try {
            const key = saveName.startsWith(this.savePrefix) ? saveName : `${this.savePrefix}${saveName}`;
            const saveDataStr = localStorage.getItem(key);
            
            if (!saveDataStr) {
                return null;
            }
            
            const saveData = JSON.parse(saveDataStr);
            
            // Validate save data structure
            if (!saveData || !saveData.character || !saveData.version) {
                throw new Error('Invalid save data format');
            }
            
            // Validate character data has required fields
            const charData = saveData.character;
            if (!charData.charType || !charData.name || charData.health === undefined) {
                throw new Error('Corrupted character data');
            }
            
            const character = Character.fromSaveData(charData);
            
            // Verify character was created successfully
            if (!character || !character.charType) {
                throw new Error('Failed to create character from save data');
            }
            
            return character;
        } catch (error) {
            console.error('Load failed:', error);
            console.error('Save data:', saveName);
            return null;
        }
    }
    
    // Quick save (overwrites previous quick save)
    quickSave(character) {
        return this.saveCharacter(character, null);
    }
    
    // Auto save after victories
    autoSave(character) {
        try {
            const saveData = {
                character: character.toSaveData(),
                saveDate: new Date().toISOString(),
                version: "1.0.0",
                autoSave: true
            };
            
            const key = `${this.autoSaveKey}_${character.name}_${new Date().toISOString().slice(0, 10)}`;
            localStorage.setItem(key, JSON.stringify(saveData));
            
            return true;
        } catch (error) {
            console.error('Auto save failed:', error);
            return false;
        }
    }
    
    // Get list of all save files
    getSaveFiles() {
        const saveFiles = [];
        
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                
                if (key && (key.startsWith(this.savePrefix) || key.startsWith(this.quickSaveKey) || key.startsWith(this.autoSaveKey))) {
                    const saveDataStr = localStorage.getItem(key);
                    if (saveDataStr) {
                        const saveData = JSON.parse(saveDataStr);
                        const character = saveData.character;
                        
                        saveFiles.push({
                            filename: key,
                            characterName: character.name,
                            characterType: character.charType,
                            level: character.victories + 1,
                            gold: character.gold,
                            dragonShards: character.dragonShards,
                            saveDate: saveData.saveDate,
                            isAutoSave: key.startsWith(this.autoSaveKey),
                            isQuickSave: key === this.quickSaveKey
                        });
                    }
                }
            }
            
            // Sort by save date (newest first)
            saveFiles.sort((a, b) => new Date(b.saveDate) - new Date(a.saveDate));
            
        } catch (error) {
            console.error('Error getting save files:', error);
        }
        
        return saveFiles;
    }
    
    // Delete a save file
    deleteSaveFile(filename) {
        try {
            localStorage.removeItem(filename);
            return true;
        } catch (error) {
            console.error('Delete failed:', error);
            return false;
        }
    }
    
    // Check if quick save exists
    hasQuickSave() {
        return localStorage.getItem(this.quickSaveKey) !== null;
    }
    
    // Load quick save
    loadQuickSave() {
        return this.loadCharacter('quicksave');
    }
    
    // Clear all save data (for testing)
    clearAllSaves() {
        try {
            const keysToDelete = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith(this.savePrefix) || key.startsWith(this.quickSaveKey) || key.startsWith(this.autoSaveKey))) {
                    keysToDelete.push(key);
                }
            }
            
            keysToDelete.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('Clear saves failed:', error);
            return false;
        }
    }
    
    // Export save data as JSON (for backup)
    exportSaveData() {
        const saveFiles = this.getSaveFiles();
        const exportData = {
            version: "1.0.0",
            exportDate: new Date().toISOString(),
            saves: []
        };
        
        saveFiles.forEach(saveFile => {
            const saveDataStr = localStorage.getItem(saveFile.filename);
            if (saveDataStr) {
                exportData.saves.push({
                    filename: saveFile.filename,
                    data: JSON.parse(saveDataStr)
                });
            }
        });
        
        return JSON.stringify(exportData, null, 2);
    }
    
    // Import save data from JSON (for restore)
    importSaveData(jsonData) {
        try {
            const importData = JSON.parse(jsonData);
            
            if (!importData.saves || !Array.isArray(importData.saves)) {
                throw new Error('Invalid save data format');
            }
            
            let importedCount = 0;
            importData.saves.forEach(save => {
                localStorage.setItem(save.filename, JSON.stringify(save.data));
                importedCount++;
            });
            
            return { success: true, count: importedCount };
        } catch (error) {
            console.error('Import failed:', error);
            return { success: false, error: error.message };
        }
    }
}

// Global save system instance
const saveSystem = new SaveSystem();