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
            {/* <Button >Dispatchit</Button> */}
            <Link
                to={{
                    pathname: '/match',
                    // Team_batting_first: team1Selected,
                    // Team_batting_next: team2Selected,
                }}
            >
                <button
                    onClick={login}
                    className="hover:bg-emerald-500 hover:-translate-y-1 hover:scale-110 border-3 p-4 m-4 mt-10 text-lg font-bold text-white transition duration-500 ease-in-out transform bg-blue-500 border-blue-900 border-solid rounded-lg shadow-lg"
                >
                    Lets play match
                </button>
            </Link>

            <div className="flex justify-around w-full mt-4">
                <div className="border-rose-600 hover:border-lime-400 px-3 text-xl font-semibold border-2 rounded-sm shadow-md">
                    Heads
                </div>
                <div className="border-rose-600 hover:border-lime-400 px-3 text-xl font-semibold border-2 rounded-sm shadow-md">
                    Tails
                </div>
            </div>
            <div className="flex justify-around w-full mt-2">
                {team1Selected ? (
                    <div
                        className={cx({
                            ' hover:bg-yellow-600 focus:outline-none disabled:opacity-50 w-1/6 px-4 py-2 font-semibold text-white bg-yellow-500 rounded-lg shadow-md text-center':
                                team1Selected === 'Australia',
                            ' hover:bg-orange-700 focus:outline-none disabled:opacity-50 w-1/6 px-4 py-2 font-semibold text-white bg-orange-500 rounded-lg shadow-md text-center':
                                team1Selected === 'India',
                            'hover:bg-blue-700 focus:outline-none disabled:opacity-50 w-1/6 px-4 py-2 font-semibold text-white bg-blue-400 rounded-lg shadow-md text-center':
                                team1Selected === 'England',
                            ' hover:bg-black focus:outline-none disabled:opacity-50 w-1/6 px-4 py-2 font-semibold text-white bg-gray-700 rounded-lg shadow-md text-center':
                                team1Selected === 'New Zealand',
                        })}
                    >
                        {/* {team1Selected !== '' ? <h1>{team1Selected}</h1> : nothing} */}
                        {team1Selected}
                    </div>
                ) : (
                    <h1></h1>
                )}
                {team2Selected ? (
                    <div
                        className={cx({
                            ' hover:bg-yellow-600 focus:outline-none disabled:opacity-50 w-1/6 px-4 py-2 font-semibold text-white bg-yellow-500 rounded-lg shadow-md text-center':
                                team2Selected === 'Australia',
                            ' hover:bg-orange-700 focus:outline-none disabled:opacity-50 w-1/6 px-4 py-2 font-semibold text-white bg-orange-500 rounded-lg shadow-md text-center':
                                team2Selected === 'India',
                            'hover:bg-blue-700 focus:outline-none disabled:opacity-50 w-1/6 px-4 py-2 font-semibold text-white bg-blue-400 rounded-lg shadow-md text-center':
                                team2Selected === 'England',
                            ' hover:bg-black focus:outline-none disabled:opacity-50 w-1/6 px-4 py-2 font-semibold text-white bg-gray-700 rounded-lg shadow-md text-center':
                                team2Selected === 'New Zealand',
                        })}
                    >
                        {/* {team1Selected !== '' ? <h1>{team1Selected}</h1> : nothing} */}
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
                        // Team_batting_first: team1Selected,
                        // Team_batting_next: team2Selected,
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
