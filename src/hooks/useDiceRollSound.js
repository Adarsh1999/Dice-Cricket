import { useCallback, useEffect, useRef } from 'react';

export const createDiceRollSound = (source = '/audio.mp3') => {
    const audio = new Audio(source);
    audio.preload = 'auto';
    audio.load();
    let disposed = false;

    const handlePlaybackError = (error) => {
        // Restarting or leaving a match can interrupt an earlier play request.
        if (!disposed && error?.name !== 'AbortError') {
            console.warn('Could not play the dice sound.', error);
        }
    };

    return {
        play() {
            if (disposed) {
                return;
            }

            try {
                if (audio.currentTime > 0) {
                    audio.currentTime = 0;
                }
                audio.play()?.catch(handlePlaybackError);
            } catch (error) {
                handlePlaybackError(error);
            }
        },
        dispose() {
            disposed = true;
            audio.pause();
            audio.removeAttribute('src');
            audio.load();
        },
    };
};

export const useDiceRollSound = () => {
    const soundRef = useRef(null);

    useEffect(() => {
        const sound = createDiceRollSound();
        soundRef.current = sound;

        return () => {
            soundRef.current = null;
            sound.dispose();
        };
    }, []);

    return useCallback(() => soundRef.current?.play(), []);
};
