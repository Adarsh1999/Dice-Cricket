/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Dice from 'react-dice-roll';
import Header from './Header';
import ScoreCard from './ScoreCard';
// import { Button } from '@material-ui/core';
import { useStateValue } from './StateProvider';
import { Link } from 'react-router-dom';
// import Summary from './Summary';
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
    const [fallOn, setFallOn] = useState(Array(10).fill(''));
    const [playerFell, setPlayerFell] = useState(Array(10).fill(''));

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
                    fallOn: fallOn,
                    playerFell: playerFell,
                },
            });
            setTotalTeamScore(score);
            setInnings(2);
            setScore(0);
            setWickets(0);
            setPlayersOut(Array(11).fill(0));
            setFallOn(Array(10).fill(''));
            setPlayerFell(Array(10).fill(''));

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
        // console.log(playerObj.team1);
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
                    const val = prevState.map((item, idx) => (idx === index ? finalScore : item));
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
                fallOn: fallOn,
                playerFell: playerFell,
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

    useEffect(() => {
        console.log('player fallen on odd', playerFell, innings);

        if (score % 2 === 0) {
            setStriker(currentPlayers[0]);
        } else {
            setStriker(currentPlayers[1]);
        }
    }, [score]);

    // useEffect(() => {
    //     console.log('players', players);
    //     console.log('currentplayers', currentPlayers);
    // }, [players, currentPlayers]);

    // this useeffect is for the fallen wickets and as well as for changing playersout status and also declaring the winner
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
                // next banda kon ayega uska logic generally wicket no. ke baad 1 add
                const val = prevState.map((item, idx) => (idx === 0 ? wickets + 1 : item));
                // console.log(val, 'val');
                setPlayersOut((prevState) => {
                    const val = prevState.map((item, idx) => (idx === currentPlayers[0] ? 1 : item));
                    setStriker(currentPlayers[0]);

                    console.log('players out at even ', playersOut);
                    return val;
                });
                setPlayerFell((prevState) => {
                    const val = prevState.map((item, idx) =>
                        idx === wickets - 1 && innings === 1
                            ? playerObj.team1[currentPlayers[0]]
                            : idx === wickets - 1 && innings === 2
                            ? playerObj.team2[currentPlayers[0]]
                            : item,
                    );
                    console.log('player fallen on odd', playerFell);

                    return val;
                });
                setFallOn((prevState) => {
                    const val = prevState.map((item, idx) => (idx === wickets - 1 ? score : item));
                    console.log('player got out on ?', fallOn);

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
                setPlayerFell((prevState) => {
                    const val = prevState.map((item, idx) =>
                        idx === wickets - 1 && innings === 1
                            ? playerObj.team1[currentPlayers[1]]
                            : idx === wickets - 1 && innings === 2
                            ? playerObj.team2[currentPlayers[1]]
                            : item,
                    );

                    console.log('player fallen on odd', playerFell);

                    return val;
                });
                setFallOn((prevState) => {
                    const val = prevState.map((item, idx) => (idx === wickets - 1 ? score : item));
                    console.log('player got out on ?', fallOn);

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
            <div className="flex justify-center w-full m-4 shadow-none">
                {wickets !== 10 && matchOver === 0 ? (
                    <Dice
                        onRoll={(value) => scoring(value)}
                        size={90}
                        sound={'/audio.mp3'}
                        faceBg={'White'}
                        faces={dice_face}
                        // cheatValue={5}
                        triggers={['click', 'a', 'Enter']}
                    />
                ) : (
                    <img src="/download.jpg" alt="download.jpg here" />
                )}
                <div className="flex m-4">
                    {innings === 1 ? (
                        <div className="text-xl font-bold">{state.team1}</div>
                    ) : (
                        <div className="text-xl font-bold">{state.team2}</div>
                    )}{' '}
                    :{' '}
                    <div className="ml-1 text-xl font-semibold tracking-widest">
                        {score}-{wickets}
                    </div>
                    <div
                        className="text-l ml-5 font-semibold text-blue-500"
                        style={innings === 2 ? {} : { display: 'none' }}
                    >
                        Target Given: {totalTeamScore + 1}
                        <br />
                        Need {totalTeamScore + 1 - score >= 0 ? totalTeamScore + 1 - score : 0} runs to win
                        <span>
                            {matchOver === 1 && totalTeamScore > score ? (
                                <div className="text-2xl font-bold text-green-700">
                                    {state.team1} won by {totalTeamScore - score} runs
                                </div>
                            ) : matchOver === 1 && score > totalTeamScore ? (
                                <div className="ml-3 text-xl font-bold text-green-700">
                                    {state.team2} won by {10 - wickets} wickets
                                </div>
                            ) : (
                                console.log('matchover')
                            )}
                        </span>
                    </div>
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

            <div className="flex flex-col items-center w-full">
                {' '}
                <div className=" flex flex-row">
                    {' '}
                    <div className="text-gray-50 p-1 ml-6 mr-3 font-semibold bg-gray-700 rounded-lg">
                        Fall of Wickets:{' '}
                    </div>
                    {playerFell.map((data, id) =>
                        id <= 5 && data !== '' ? (
                            <>
                                <div className=" p-1 mr-3 font-semibold bg-blue-100 rounded-lg">{data}</div>
                                <div className="mr-3 font-semibold">
                                    {fallOn[id]}/{id + 1}
                                </div>
                            </>
                        ) : null,
                    )}
                </div>
                <div className="flex flex-row mt-3 mb-4 ml-8">
                    {' '}
                    <div className="mr-3"> </div>
                    {playerFell.map((data, id) =>
                        id > 5 && data !== '' ? (
                            <>
                                <div className="p-1 mr-3 font-semibold bg-blue-100 rounded-lg">{data}</div>
                                <div className="mr-3 font-semibold">
                                    {fallOn[id]}/{id + 1}
                                </div>
                            </>
                        ) : null,
                    )}
                </div>
            </div>

            <div className="flex justify-around">
                <button
                    className="hover:bg-blue-600 focus:outline-none disabled:opacity-50 px-4 py-2 font-semibold text-center text-white no-underline bg-blue-500 rounded-lg shadow-md"
                    // disabled={(wickets)=>wickets===10?false:true}
                    onClick={() => afterEffect()}
                    disabled={innings === 2 ? true : false}
                >
                    Next Innings
                </button>
                {matchOver ? <div>Match over</div> : <h1></h1>}

                <Link
                    to={{
                        pathname: '/summary',
                    }}
                >
                    <button
                        disabled={innings === 1 ? true : false}
                        className="hover:bg-blue-600 focus:outline-none disabled:opacity-50 px-4 py-2 font-semibold text-center text-white no-underline bg-blue-500 rounded-lg shadow-md"
                        // className="flex justify-center"
                        onClick={() => dispatchTeam2()}
                    >
                        Match Summary
                    </button>
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
