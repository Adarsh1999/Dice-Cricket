import React, { useState, useEffect, useRef } from 'react';
import cx from 'classnames';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
import './CoinToss.css';
function CoinToss(params) {
    const [side, setSide] = useState();
    const [tossed, setTossed] = useState(0);
    const [times, setTimes] = useState(0);
    const tossCoin = () => {
        const landedOn = Math.round(Math.random());
        setSide(landedOn);
        setTossed(tossed + 1);
        console.log(landedOn);
        setTimes(1);
        if (landedOn !== 1) {
            const team1 = params.team1Selected;
            console.log(team1);
            params.setTeam1Selected(params.team2Selected);
            params.setTeam2Selected(team1);
            params.setIsTossed(true);
        } else {
            params.setIsTossed(true);
        }
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
            {/* <div>The coin has been tossed {tossed} times.</div>
            <div>Batting is of {params.team1Selected}</div> */}
            {params.isTossed ? (
                <div className="m-4 -mb-2 text-lg font-bold text-pink-600 border-2 border-fuchsia-700 rounded-xl px-2">It landed on {side === 1 ? 'heads' : 'tails'}</div>
            ) : (
                <div> </div>
            )}

            <button
                // className="hover:bg-red-500 hover:-translate-y-1 hover:scale-110 border-3 p-4 mt-10 text-lg font-bold transition duration-500 ease-in-out transform bg-blue-500 border-blue-900 border-solid"
                disabled={times >= 1 ? true : false}
                className={cx({
                    'hover:bg-red-500 hover:-translate-y-1 hover:scale-110 border-3 p-4 mt-10 text-lg font-bold transition duration-500 ease-in-out transform bg-blue-500 border-blue-900 border-solid m-4 rounded-lg shadow-md text-white': true,
                    // 'bg-gray-500': sidebar,
                    'py-2 px-4 bg-emerald-500 text-white font-semibold rounded-lg shadow-md disabled:opacity-50':
                        times >= 1,
                })}
                onClick={tossCoin}
            >
                Toss coin
            </button>

            <div className="side-a"></div>
            <div className="side-b"></div>
            {/* <h1>Click on coin to flip</h1> */}
        </div>
    );
}

export default CoinToss;
