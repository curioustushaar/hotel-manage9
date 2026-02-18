import { useEffect } from 'react';
import soundManager from '../utils/soundManager';

const useTypingSound = () => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Only play for typing characters, ignore control keys
            if (
                e.key &&
                e.key.length === 1 &&
                !e.ctrlKey &&
                !e.altKey &&
                !e.metaKey &&
                soundManager.isEnabled()
            ) {
                soundManager.play('typing');
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
};

export default useTypingSound;
