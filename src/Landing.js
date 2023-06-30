import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import Teams from './Teams';
import { Button } from '@material-ui/core';
import CoinToss from './CoinToss';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
import { useStateValue } from './StateProvider';
import axios from './axios';
import cx from 'classnames';

function Landing() {
    const [team1Selected, setTeam1Selected] = useState('');
    const [times, setTimes] = useState(1);
    const [team2Selected, setTeam2Selected] = useState('');

    const [state, dispatch] = useStateValue();
    const [isTossed, setIsTossed] = useState(false);

    const login = () => {
        dispatch({
            type: 'SET_TEAM',
            team1: team1Selected,
            team2: team2Selected,
        });
    };

    return (
        <div className="bg-coolGray-100 flex flex-col items-center max-w-5xl p-8 m-auto shadow-md">
            <div className="mt-4 text-3xl font-semibold text-blue-500">Select both teams to play with..</div>
            <Teams
                setTeam1Selected={setTeam1Selected}
                setTeam2Selected={setTeam2Selected}
                setTimes={setTimes}
                team1Selected={team1Selected}
                times={times}
                team2Selected={team2Selected}
            />

            <CoinToss
                setTeam1Selected={setTeam1Selected}
                setTeam2Selected={setTeam2Selected}
                team1Selected={team1Selected}
                team2Selected={team2Selected}
                isTossed={isTossed}
                setIsTossed={setIsTossed}
            />
            <Link
                to={{
                    pathname: '/match',
                }}
            >
                <button
                    onClick={login}
                    className="hover:bg-emerald-500 hover:-translate-y-1 hover:scale-110 border-3 p-4 m-4 mt-10 text-lg font-bold text-white transition duration-500 ease-in-out transform bg-blue-500 border-blue-900 border-solid rounded-lg shadow-lg"
                >
                    Lets play match
                </button>
            </Link>

            <div className="sm:flex-row flex flex-col justify-around w-full mt-4">
                <div className="border-rose-600 hover:border-lime-400 px-3 text-xl font-semibold border-2 rounded-sm shadow-md">
                    Heads
                </div>
                <div className="border-rose-600 hover:border-lime-400 px-3 text-xl font-semibold border-2 rounded-sm shadow-md">
                    Tails
                </div>
            </div>
            <div className="sm:flex-row flex flex-col justify-around w-full mt-2">
                {team1Selected ? (
                    <div
                        className={cx(
                            'hover:bg-yellow-600 focus:outline-none disabled:opacity-50 px-4 py-2 font-semibold text-white rounded-lg shadow-md text-center',
                            {
                                'w-full sm:w-1/6 bg-yellow-500': team1Selected === 'Australia',
                                'w-full sm:w-1/6 bg-orange-500': team1Selected === 'India',
                                'w-full sm:w-1/6 bg-blue-700': team1Selected === 'England',
                                'w-full sm:w-1/6 bg-black': team1Selected === 'New Zealand',
                            },
                        )}
                    >
                        {team1Selected}
                    </div>
                ) : (
                    <h1></h1>
                )}
                {team2Selected ? (
                    <div
                        className={cx(
                            'hover:bg-yellow-600 focus:outline-none disabled:opacity-50 px-4 py-2 font-semibold text-white rounded-lg shadow-md text-center mt-2 sm:mt-0',
                            {
                                'w-full sm:w-1/6 bg-yellow-500': team2Selected === 'Australia',
                                'w-full sm:w-1/6 bg-orange-500': team2Selected === 'India',
                                'w-full sm:w-1/6 bg-blue-400': team2Selected === 'England',
                                'w-full sm:w-1/6 bg-gray-700': team2Selected === 'New Zealand',
                            },
                        )}
                    >
                        {team2Selected}
                    </div>
                ) : (
                    <h1></h1>
                )}
            </div>
            <div className="mt-4 text-xl font-semibold text-blue-500">
                {isTossed ? <div>{team1Selected} won the toss and choosed to bat</div> : <h1></h1>}
            </div>

            <div>
                <Link
                    to={{
                        pathname: '/history',
                    }}
                >
                    <button className="hover:bg-emerald-500 hover:-translate-y-1 hover:scale-110 border-3 p-3 px-2 m-4 mt-8 text-lg font-bold text-white transition duration-500 ease-in-out transform bg-blue-500 border-blue-900 border-solid rounded-lg shadow-lg">
                        History
                    </button>
                </Link>
            </div>
        </div>
    );
}
export default Landing;
