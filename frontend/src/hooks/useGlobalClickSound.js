import { useEffect } from 'react';
import soundManager from '../utils/soundManager';

const useGlobalClickSound = () => {
    useEffect(() => {
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
                soundManager.play('click');
            }
        };

        window.addEventListener('click', handleClick, true); // Capture phase to ensure we catch it

        return () => {
            window.removeEventListener('click', handleClick, true);
        };
    }, []);
};

export default useGlobalClickSound;
