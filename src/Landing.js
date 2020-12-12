import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import Teams from './Teams';
import { Button } from '@material-ui/core';
import CoinToss from './CoinToss';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
import { useStateValue } from './StateProvider';
import axios from './axios';
function Landing() {
    const [team1Selected, setTeam1Selected] = useState('');
    const [times, setTimes] = useState(1);
    const [team2Selected, setTeam2Selected] = useState('');

    const [state, dispatch] = useStateValue();
    const [playerObj, setPlayerObj] = useState();

    const login = () => {
        dispatch({
            type: 'SET_TEAM',
            team1: team1Selected,
            team2: team2Selected,
        });
    };

    return (
        <div className="flex flex-col items-center max-w-4xl m-auto">
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

            <div className="flex justify-around w-full m-4">
                <div className="border-rose-600 px-3 text-xl font-semibold border-2">Heads</div>
                <div>Tails</div>
            </div>

            {/* <button className="bg-yellow-600" onClick={getTeam}>
                axios
            </button> */}
            {/* {new Date().toString()} */}
        </div>
    );
}
export default Landing;
