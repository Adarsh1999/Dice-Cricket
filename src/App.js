/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Dice from 'react-dice-roll';
import Header from './Header';
import ScoreCard from './ScoreCard';
import { Button } from '@material-ui/core';
import { useStateValue } from './StateProvider';
import { Link } from 'react-router-dom';
import Summary from './Summary';
import axios from './axios';

function App() {
    const [state, dispatch] = useStateValue();

    const [score, setScore] = useState(0);
    const [wickets, setWickets] = useState(0);
    // const [currentRun, setCurrentRun] = useState(0);
    const [players, setPlayers] = useState(Array(11).fill(0));
    const [currentPlayers, setCurrentPlayers] = useState([0, 1]);
    const [totalTeamScore, setTotalTeamScore] = useState(0);
    const [innings, setInnings] = useState(1);
    const [playersOut, setPlayersOut] = useState(Array(11).fill(0));
    const [Bool, setBool] = useState(false);
    const [striker, setStriker] = useState(0);
    const [matchOver, setMatchOver] = useState(0);
    const [playerObj, setPlayerObj] = useState();

    const getTeam = async () => {
        const { data } = await axios.get(`/teams?q=${state.team1}&p=${state.team2}`);
        console.log(data);
        setPlayerObj(data);
    };

    useEffect(() => {
        getTeam();
    }, []);
    // To refresh after 10 wickets haul
    const afterEffect = () => {
        //if logic
        const setStuff = () => {
            dispatch({
                type: 'SET_TEAM1',
                team1_data: {
                    scorelist: players,
                    current: currentPlayers,
                    status: playersOut,
                    striker: striker,
                    firstTeam: playerObj.team1,
                    score: score,
                    wickets: 10,
                },
            });
            setTotalTeamScore(score);
            setInnings(2);
            setScore(0);
            setWickets(0);
            setPlayersOut(Array(11).fill(0));
            setPlayers(Array(11).fill(0));
            setBool(false);
            setCurrentPlayers([0, 1]);
            setStriker(0);
        };
        wickets === 10 ? setStuff() : console.log('useeffect for 10 wickets');
    };

    const dice_face = ['/1.png', '/2.png', '/3.png', '/4.png', '/5.png', '/6.png'];

    // const audio = new Audio("/audio.mp3");

    // here scoring increment is done
    const scoring = (value) => {
        // (value===5)?setWickets(wickets+1):setScore(prevState => prevState + value);
        setBool(true);
        if (value === 5) {
            setWickets((wickets) => wickets + 1);
            console.log(wickets);
        } else {
            setScore((prevState) => prevState + value);
            if (score % 2 === 0) {
                // player1 on strike
                setStriker(currentPlayers[0]);
                console.log('its even');

                const index = currentPlayers[0];
                const finalScore = players[index] + value;
                setPlayers((prevState) => {
                    // console.log(prevState, "xx0", index)
                    const val = prevState.map((item, idx) => (idx === index ? finalScore : item));
                    // console.log(val, 'val');
                    return val;
                });

                console.log(players);
            } else {
                console.log('its odd');
                setStriker(currentPlayers[1]);

                const index = currentPlayers[1];
                const finalScore = players[index] + value;
                setPlayers((prevState) => {
                    // console.log(prevState, "xx1", index)
                    const val = prevState.map((item, idx) => (idx === index ? finalScore : item));
                    // console.log(val, 'val');

                    return val;
                });

                console.log(players);
            }
        }
    };
    const dispatchTeam2 = () => {
        dispatch({
            type: 'SET_TEAM2',
            team2_data: {
                scorelist: players,
                current: currentPlayers,
                status: playersOut,
                striker: striker,
                secondTeam: playerObj.team2,
                score: score,
                wickets: wickets,
            },
        });
    };

    useEffect(() => {
        if (innings === 2 && score > totalTeamScore) {
            console.log('Team 2 won the match ');
            dispatch({
                type: 'SET_RESULT',
                result: `${state.team2} won by ${10 - wickets} wickets`,
            });
            setMatchOver(1);
        }
    }, [score]);

    // useEffect(() => {
    //   effect

    // }, [input])
    useEffect(() => {
        if (score % 2 === 0) {
            setStriker(currentPlayers[0]);
        } else {
            setStriker(currentPlayers[1]);
        }
    }, [score]);

    useEffect(() => {
        console.log('players', players);
        console.log('currentplayers', currentPlayers);
    }, [players, currentPlayers]);
    // this useeffect is for the fallen wickets and as well as for changing playersout status
    useEffect(() => {
        console.log('current fallen wickets', wickets);
        if (innings === 2 && wickets === 10) {
            console.log('team 1 won');
            dispatch({
                type: 'SET_RESULT',
                result: `${state.team1} won by ${totalTeamScore - score} runs`,
            });
            setMatchOver(1);
        }
        //most complex use case of usestate but very important refer for future
        if (Bool && score % 2 === 0) {
            setCurrentPlayers((prevState) => {
                const val = prevState.map((item, idx) => (idx === 0 ? wickets + 1 : item));
                // console.log(val, 'val');
                setPlayersOut((prevState) => {
                    const val = prevState.map((item, idx) => (idx === currentPlayers[0] ? 1 : item));
                    setStriker(currentPlayers[0]);

                    console.log('players out at even ', playersOut);
                    return val;
                });

                return val;
            });
            // console.log(currentPlayers)
        } else if (Bool && score % 2 === 1) {
            setCurrentPlayers((prevState) => {
                const val = prevState.map((item, idx) => (idx === 1 ? wickets + 1 : item));
                // console.log(val, 'val');
                setPlayersOut((prevState) => {
                    const val = prevState.map((item, idx) => (idx === currentPlayers[1] ? 1 : item));
                    console.log('players out at odd', playersOut);
                    setStriker(currentPlayers[1]);

                    return val;
                });
                return val;
            });
            // console.log(currentPlayers)
        }
    }, [wickets]);

    return (
        <div className="App">
            <Header />

            <div className=" ml-7 flex">
                {wickets !== 10 && matchOver === 0 ? (
                    <Dice
                        onRoll={(value) => scoring(value)}
                        size={90}
                        sound={'/audio.mp3'}
                        faceBg={'White'}
                        faces={dice_face}
                        cheatValue={5}
                        // onClick={}
                    />
                ) : (
                    <img src="/download.jpg" alt="download.jpg here" />
                )}
                <div className="score">
                    {innings === 1 ? state.team1 : state.team2} : {score}-{wickets}
                    <span className="target" style={innings === 2 ? {} : { display: 'none' }}>
                        Target Given: {totalTeamScore + 1}
                        <br />
                        Need {totalTeamScore + 1 - score >= 0 ? totalTeamScore + 1 - score : 0} runs to win
                    </span>
                    <span className="won">
                        {matchOver === 1 && totalTeamScore > score ? (
                            <h3>
                                {state.team1} won by {totalTeamScore - score} runs
                            </h3>
                        ) : matchOver === 1 && score > totalTeamScore ? (
                            <h3>
                                {state.team2} won by {10 - wickets} wickets
                            </h3>
                        ) : (
                            console.log('matchover')
                        )}
                    </span>
                </div>
            </div>
            {playerObj ? (
                <ScoreCard
                    scorelist={players}
                    current={currentPlayers}
                    status={playersOut}
                    striker={striker}
                    firstTeam={playerObj.team1}
                    secondTeam={playerObj.team2}
                    innings={innings}
                />
            ) : (
                <h1>Loading</h1>
            )}

            <div className="flex justify-around">
                <Button
                    variant="outlined"
                    color="primary"
                    // disabled={(wickets)=>wickets===10?false:true}
                    onClick={() => afterEffect()}
                >
                    Next Innings
                </Button>
                {matchOver ? <h1>Match over</h1> : <h1>Not over</h1>}

                {/* {happyPress && alert("yo bro")} */}
                <Link
                    to={{
                        pathname: '/summary',
                    }}
                >
                    <Button
                        disabled={innings === 1 ? true : false}
                        variant="outlined"
                        color="primary"
                        // className="flex justify-center"
                        onClick={() => dispatchTeam2()}
                    >
                        Match Summary
                    </Button>
                </Link>
            </div>
        </div>

        // Headers
        // Home
    );
}

export default App;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types

// eslint-disable-next-line @typescript-eslint/no-unused-vars

// I have to pass the same items i am passing to the scorecard page along with the name of the team
// the item can only be send through link routing when the match gets over similarly make the button appear at the end of the match
// best approach is to use react context api to send the score to the reducer from where it can be accessed
