class MusicManager {
    constructor(scene) {
        this.scene = scene;
        this.currentMusic = null;
        this.volume = 0.3; // Adjust volume as needed (0.0 to 1.0)
    }

    playMusic(musicKey, loop = true, fadeIn = true) {
        // Stop current music if playing
        if (this.currentMusic && this.currentMusic.isPlaying) {
            if (fadeIn) {
                this.scene.tweens.add({
                    targets: this.currentMusic,
                    volume: 0,
                    duration: 1000,
                    onComplete: () => {
                        this.currentMusic.stop();
                        this.startNewMusic(musicKey, loop, fadeIn);
                    }
                });
            } else {
                this.currentMusic.stop();
                this.startNewMusic(musicKey, loop, fadeIn);
            }
        } else {
            this.startNewMusic(musicKey, loop, fadeIn);
        }
    }

    startNewMusic(musicKey, loop, fadeIn) {
        this.currentMusic = this.scene.sound.add(musicKey, {
            loop: loop,
            volume: fadeIn ? 0 : this.volume
        });
        
        this.currentMusic.play();
        
        if (fadeIn) {
            this.scene.tweens.add({
                targets: this.currentMusic,
                volume: this.volume,
                duration: 1000
            });
        }
    }

    stopMusic(fadeOut = true) {
        if (this.currentMusic && this.currentMusic.isPlaying) {
            if (fadeOut) {
                this.scene.tweens.add({
                    targets: this.currentMusic,
                    volume: 0,
                    duration: 1000,
                    onComplete: () => {
                        this.currentMusic.stop();
                        this.currentMusic = null;
                    }
                });
            } else {
                this.currentMusic.stop();
                this.currentMusic = null;
            }
        }
    }

    setVolume(volume) {
        this.volume = volume;
        if (this.currentMusic) {
            this.currentMusic.setVolume(volume);
        }
    }
}

export default MusicManager;