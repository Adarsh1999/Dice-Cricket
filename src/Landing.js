import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';
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
        <div className="choose_teams">
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
                <Button variant="outlined" color="primary" onClick={login} className="m-4">
                    Lets play match
                </Button>
            </Link>

            <div className="choose_teams__selected_teams">
                <h3>
                    Selected Team1 is {team1Selected} vs {team2Selected}{' '}
                </h3>
            </div>

            {/* <button className="bg-yellow-600" onClick={getTeam}>
                axios
            </button> */}
            {/* {new Date().toString()} */}
        </div>
    );
}

export default Landing;
