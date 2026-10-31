/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useRef } from 'react';
import Dice from 'modern-react-dice-roll';

const NO_TRIGGERS = [];

function DiceRoller({ disabled = false, faces, onRoll, onRollStart }) {
    const diceRef = useRef(null);
    const controlRef = useRef(null);
    const rollingRef = useRef(false);
    const mountedRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const rollDice = useCallback(() => {
        if (disabled || rollingRef.current || !diceRef.current) {
            return;
        }

        rollingRef.current = true;
        // Start playback within the click/key event so browser audio rules allow it.
        onRollStart();
        diceRef.current.rollDice();
    }, [disabled, onRollStart]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) {
                return;
            }
            if (event.key !== 'Enter' && event.key.toLowerCase() !== 'a') {
                return;
            }

            const target = event.target;
            if (target instanceof Element) {
                if (target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]')) {
                    return;
                }
                if (!controlRef.current?.contains(target) && target.closest('button, a, summary, [role="button"]')) {
                    return;
                }
            }

            // A focused dice button also generates a click for Enter without this.
            event.preventDefault();
            if (event.repeat) {
                return;
            }
            rollDice();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [rollDice]);

    const handleRoll = useCallback((value) => {
        rollingRef.current = false;
        if (mountedRef.current) {
            onRoll(value);
        }
    }, [onRoll]);

    return (
        <div className="dice-roll-control" onClick={rollDice} ref={controlRef}>
            <Dice
                disabled={disabled}
                faceBg="White"
                faces={faces}
                onRoll={handleRoll}
                ref={diceRef}
                rollingTime={150}
                size={108}
                triggers={NO_TRIGGERS}
            />
        </div>
    );
}

export default DiceRoller;
