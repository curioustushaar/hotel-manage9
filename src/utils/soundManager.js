class SoundManager {
    constructor() {
        this.sounds = {
            click: new Audio('/sounds/click.mp3'),
            typing: new Audio('/sounds/typing.mp3'),
            notification: new Audio('/sounds/notification.mp3'),
            success: new Audio('/sounds/success.mp3'),
            alert: new Audio('/sounds/alert.mp3')
        };
        this.enabled = localStorage.getItem('soundEnabled') !== 'false'; // Default to true if not set
        this.volume = 0.3;

        // Preload sounds and set volume
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.volume;
            // Preload but catch errors silently to prevent issues if files are missing
            sound.load();
            sound.onerror = () => { /* Silent failure */ };
        });
    }

    play(type) {
        if (!this.enabled || !this.sounds[type]) return;

        const sound = this.sounds[type];

        // Check if audio file is valid/loaded before playing
        if (sound.readyState === 0 && sound.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
            return;
        }

        sound.currentTime = 0; // Reset to start

        const playPromise = sound.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                // Silently fail if autoplay is blocked or file missing/corrupt
                // console.debug('Sound play failed:', err); 
            });
        }
    }

    toggle(state) {
        this.enabled = state;
        localStorage.setItem('soundEnabled', state);
    }

    isEnabled() {
        return this.enabled;
    }

    // Safety check method
    checkSound(type) {
        return this.sounds[type] ? true : false;
    }
}

const soundManager = new SoundManager();
export default soundManager;
