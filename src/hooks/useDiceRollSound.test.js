import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDiceRollSound } from './useDiceRollSound';

describe('dice roll sound playback', () => {
    let players;

    beforeEach(() => {
        players = [];
        vi.useFakeTimers();
        vi.stubGlobal('Audio', class {
            constructor(source) {
                this.src = source;
                this.currentTime = 0;
                this.load = vi.fn();
                this.play = vi.fn().mockResolvedValue(undefined);
                this.pause = vi.fn();
                this.removeAttribute = vi.fn();
                players.push(this);
            }
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('preloads the clip and lets it continue beyond the 150ms dice animation', () => {
        const sound = createDiceRollSound();
        expect(players[0].src).toBe('/audio.mp3');
        expect(players[0].preload).toBe('auto');
        expect(players[0].load).toHaveBeenCalledOnce();

        sound.play();
        vi.advanceTimersByTime(2000);

        expect(players[0].play).toHaveBeenCalledOnce();
        expect(players[0].pause).not.toHaveBeenCalled();
    });

    it('reuses the loaded player and restarts the clip for subsequent rolls', () => {
        const sound = createDiceRollSound();
        sound.play();
        players[0].currentTime = 0.3;
        sound.play();

        expect(players).toHaveLength(1);
        expect(players[0].currentTime).toBe(0);
        expect(players[0].play).toHaveBeenCalledTimes(2);
        expect(players[0].load).toHaveBeenCalledOnce();
    });

    it('handles a rejected playback request and retries on the next roll', async () => {
        const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const sound = createDiceRollSound();
        players[0].play.mockRejectedValueOnce(new DOMException('Blocked', 'NotAllowedError'));

        sound.play();
        await Promise.resolve();
        sound.play();
        await Promise.resolve();

        expect(warning).toHaveBeenCalledOnce();
        expect(players[0].play).toHaveBeenCalledTimes(2);
    });

    it('releases the audio when leaving the match and absorbs pending interruption errors', async () => {
        const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const sound = createDiceRollSound();
        players[0].play.mockRejectedValueOnce(new DOMException('Interrupted', 'AbortError'));
        sound.play();
        sound.dispose();
        sound.play();
        await Promise.resolve();

        expect(players[0].pause).toHaveBeenCalledOnce();
        expect(players[0].removeAttribute).toHaveBeenCalledWith('src');
        expect(players[0].play).toHaveBeenCalledOnce();
        expect(warning).not.toHaveBeenCalled();
    });
});
