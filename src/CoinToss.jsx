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
                <div className="flex justify-center mt-6 mb-2">
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 px-6 py-3 rounded-2xl shadow-lg text-center">
                        <div className="text-lg font-bold text-purple-700">
                            🪙 It landed on <span className="text-purple-900 capitalize">{side === 1 ? 'heads' : 'tails'}</span>! 🪙
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CoinToss;
