import React, { useState } from 'react';
import cx from 'classnames';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
import './CoinToss.css';
function CoinToss(params) {
    const [side, setSide] = useState();
    const [tossed, setTossed] = useState(0);
    const [times, setTimes] = useState(0);
    const tossCoin = () => {
        // Prevent multiple tosses
        if (times >= 1) return;

        const landedOn = Math.round(Math.random());
        setSide(landedOn);
        setTossed(tossed + 1);
        setTimes(1);

        // Wait for the CSS animation (3 s) to finish before updating game state
        setTimeout(() => {
            if (landedOn !== 1) {
                const team1 = params.team1Selected;
                params.setTeam1Selected(params.team2Selected);
                params.setTeam2Selected(team1);
            }
            params.setIsTossed(true);
        }, 3000);
    };

    return (
        <div
        // id={`coin ${() => {
        //     side === 1 ? 'heads' : 'tails';
        // }}`}
        // id={cx({
        //     coin: true,
        //     heads: side === 1,
        //     tails: side !== 1,
        // })}
        >
            <div
                id="coin"
                className={cx({
                    heads: side === 1 && times >= 1,
                    tails: side === 0 && times >= 1,
                })}
                onClick={tossCoin}
            >
                <div className="side-a flex items-center justify-center select-none">Heads</div>
                <div className="side-b flex items-center justify-center select-none">Tails</div>
            </div>

            {params.isTossed && (
                <div className="m-4 -mb-2 text-lg font-bold text-pink-600 border-2 border-fuchsia-700 rounded-xl px-2">
                    It landed on {side === 1 ? 'heads' : 'tails'}
                </div>
            )}
        </div>
    );
}

export default CoinToss;
