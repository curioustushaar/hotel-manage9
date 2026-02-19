import { useEffect } from 'react';
import soundManager from '../utils/soundManager';

const useGlobalClickSound = () => {
    useEffect(() => {
<<<<<<< HEAD
        const handleClick = (e) => {
            const target = e.target;
            const isClickable = target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') ||
                target.closest('a') ||
                target.classList.contains('clickable') ||
                target.closest('.clickable') ||
                target.getAttribute('role') === 'button';

            if (isClickable && soundManager.isEnabled()) {
=======
        const handleClick = () => {
            // Only play sound if clicked on interactive elements
            if (soundManager.isEnabled()) {
>>>>>>> main
                soundManager.play('click');
            }
        };

<<<<<<< HEAD
        window.addEventListener('click', handleClick, true); // Capture phase to ensure we catch it

        return () => {
            window.removeEventListener('click', handleClick, true);
=======
        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
>>>>>>> main
        };
    }, []);
};

export default useGlobalClickSound;
