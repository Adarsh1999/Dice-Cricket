import React, { useEffect, useRef, useState } from 'react';
import Icon from '../ui/Icon';
import TeamMark from '../ui/TeamMark';
import { formatTeamName } from '../../utils/matchPresentation';

function CoinToss({ team1Selected, team2Selected, setTeam1Selected, setTeam2Selected, isTossed, setIsTossed }) {
    const [side, setSide] = useState(null);
    const [isFlipping, setIsFlipping] = useState(false);
    const timeoutRef = useRef(null);

    useEffect(
        () => () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }
        },
        [],
    );

    useEffect(() => {
        if (!isTossed && !isFlipping) {
            setSide(null);
        }
    }, [isFlipping, isTossed, team1Selected, team2Selected]);

    const tossCoin = () => {
        if (isFlipping || isTossed || !team1Selected || !team2Selected) {
            return;
        }

        const landedOn = Math.round(Math.random()) === 1 ? 'heads' : 'tails';
        setSide(landedOn);
        setIsFlipping(true);

        timeoutRef.current = window.setTimeout(() => {
            if (landedOn === 'tails') {
                setTeam1Selected(team2Selected);
                setTeam2Selected(team1Selected);
            }
            setIsFlipping(false);
            setIsTossed(true);
        }, 1400);
    };

    return (
        <div className={`toss-card ${isTossed ? 'toss-card--complete' : ''}`}>
            <div className="toss-card__copy">
                <span className="eyebrow">Step 3 · Toss</span>
                <h3>{isTossed ? `${formatTeamName(team1Selected)} will bat first` : 'Decide who takes first strike'}</h3>
                <p>
                    {isTossed
                        ? `The coin landed on ${side}. The batting order is locked in.`
                        : 'Flip once both squads are selected. The toss winner bats first.'}
                </p>
            </div>

            <div className="toss-card__action">
                <button
                    aria-label="Flip the coin"
                    className={`coin ${isFlipping ? 'coin--flipping' : ''} ${side ? `coin--${side}` : ''}`}
                    disabled={isFlipping || isTossed || !team1Selected || !team2Selected}
                    onClick={tossCoin}
                    type="button"
                >
                    <span className="coin__front">H</span>
                    <span className="coin__back">T</span>
                </button>
                <span className="toss-card__hint">
                    {isTossed ? (
                        <>
                            <TeamMark size="tiny" teamId={team1Selected} /> Ready to play
                        </>
                    ) : (
                        <>
                            <Icon name="refresh" size={14} /> {isFlipping ? 'Coin in the air…' : 'Tap to flip'}
                        </>
                    )}
                </span>
            </div>
        </div>
    );
}

export default CoinToss;
