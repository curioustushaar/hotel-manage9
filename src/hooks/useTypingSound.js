import { useEffect, useRef } from 'react';
import soundManager from '../utils/soundManager';

const useTypingSound = () => {
    const lastTyped = useRef(0);

    useEffect(() => {
        const handleTyping = (e) => {
            const target = e.target;
            const isInput = target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable;

            if (isInput && soundManager.isEnabled()) {
                const now = Date.now();
                if (now - lastTyped.current > 80) { // Debounce 80ms
                    soundManager.play('typing');
                    lastTyped.current = now;
                }
            }
        };

        window.addEventListener('keydown', handleTyping, true);

        return () => {
            window.removeEventListener('keydown', handleTyping, true);
        };
    }, []);
};

export default useTypingSound;
