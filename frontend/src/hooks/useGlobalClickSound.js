import { useEffect } from 'react';
import soundManager from '../utils/soundManager';

const useGlobalClickSound = () => {
    useEffect(() => {
        const handleClick = (e) => {
            // Only play sound if clicked on interactive elements
            // We can also check if the target is interactive if needed,
            // but for a global click sound, specific targeting might be better
            // as implemented in the HEAD version but simplified here.

            // Checking if the click is on an interactive element to avoid noise
            const target = e.target;
            const isClickable = target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') ||
                target.closest('a') ||
                target.classList.contains('clickable') ||
                target.closest('.clickable') ||
                target.getAttribute('role') === 'button';

            if (isClickable && soundManager.isEnabled()) {
                soundManager.play('click');
            }
        };

        // Use capture phase to ensure we catch it, similar to HEAD
        window.addEventListener('click', handleClick, true);

        return () => {
            window.removeEventListener('click', handleClick, true);
        };
    }, []);
};

export default useGlobalClickSound;
