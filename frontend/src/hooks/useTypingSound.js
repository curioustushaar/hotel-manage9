<<<<<<< HEAD
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
=======
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
>>>>>>> main
        };
    }, []);
};

export default useTypingSound;
