import { useEffect } from 'react';
import soundManager from '../utils/soundManager';

const useGlobalClickSound = () => {
    useEffect(() => {
        const handleClick = () => {
            // Only play sound if clicked on interactive elements
            if (soundManager.isEnabled()) {
                soundManager.play('click');
            }
        };

        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []);
};

export default useGlobalClickSound;
