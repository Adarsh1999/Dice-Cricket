/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import Dice from 'modern-react-dice-roll';
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
    
    // Over tracking state
    const [currentOver, setCurrentOver] = useState(0);
    const [ballInOver, setBallInOver] = useState(0);
    
    // Stronger input blocking mechanism
    const [isUpdating, setIsUpdating] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const updateTimeoutRef = useRef(null);
    const pendingUpdateRef = useRef(false);
    const processingRef = useRef(false);
    
    // Use refs to track current state values to avoid stale closures
    const currentPlayersRef = useRef(currentPlayers);
    
    // Update ref when state changes
    useEffect(() => {
        currentPlayersRef.current = currentPlayers;
    }, [currentPlayers]);

    const getTeam = async () => {
        const { data } = await axios.get(`/teams?q=${state.team1}&p=${state.team2}`);
        console.log(data);
        // API returns { success: true, data: { team1: { name, players }, team2: { name, players } } }
        const { team1, team2 } = data.data || {};
        setPlayerObj({
            team1: team1?.players ?? [],
            team2: team2?.players ?? [],
        });
    };

    useEffect(() => {
        if (state.team1 && state.team2) {
            getTeam();
        }
    }, [state.team1, state.team2]);

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
                    currentOver: currentOver,
                    ballInOver: ballInOver,
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
            
            // Reset over tracking for new innings
            setCurrentOver(0);
            setBallInOver(0);
        };
        wickets === 10 ? setStuff() : console.log('useeffect for 10 wickets');
    };

    const dice_face = ['/1.png', '/2.png', '/3.png', '/4.png', '/5.png', '/6.png'];

    // Robust scoring function with complete input blocking
    const scoring = useCallback((value) => {
        console.log(`=== SCORING CALLED with value: ${value} ===`);
        
        // Prevent any double execution
        if (processingRef.current || isProcessing) {
            console.log('BLOCKED: Already processing a score update');
            return;
        }
        
        // Set processing flag immediately
        processingRef.current = true;
        setIsProcessing(true);
        console.log('Processing flag set to true');
        
        // Process the score update
        if (value === 5) {
            // Wicket case - wickets don't count as balls in the over
            console.log('Processing wicket...');
            setWickets((prevWickets) => prevWickets + 1);
            setBool(true);
        } else {
            // Scoring case - this counts as a ball in the over
            console.log(`Processing ${value} runs...`);
            
            // First, get the current score to determine which player should score
            const currentScore = score; // Use current score state
            const isEven = currentScore % 2 === 0;
            const activeBatterIndex = isEven ? 0 : 1;
            const playerIndex = currentPlayersRef.current[activeBatterIndex];
            
            console.log(`Current score: ${currentScore}, Player ${playerIndex + 1} will score ${value} runs`);
            
            // Update all states independently
            // 1. Update team score
            setScore((prevScore) => prevScore + value);
            
            // 2. Update player's individual score
            setPlayers((prevPlayers) => {
                const newPlayers = [...prevPlayers];
                newPlayers[playerIndex] += value;
                console.log(`Player ${playerIndex + 1} score updated: ${prevPlayers[playerIndex]} -> ${newPlayers[playerIndex]}`);
                return newPlayers;
            });
            
            // 3. Update over tracking
            setBallInOver((prevBall) => {
                const newBall = prevBall + 1;
                if (newBall === 6) {
                    setCurrentOver((prevOver) => prevOver + 1);
                    return 0;
                }
                return newBall;
            });
            
            // 4. Update striker for next ball
            const newScore = currentScore + value;
            const nextStriker = newScore % 2 === 0 ? currentPlayersRef.current[0] : currentPlayersRef.current[1];
            setStriker(nextStriker);
        }
        
        // Reset processing flag after a short delay
        setTimeout(() => {
            processingRef.current = false;
            setIsProcessing(false);
            console.log('Processing flag reset to false');
        }, 150); // Reduced from 500ms to 100ms
        
    }, [score, isProcessing]); // Add isProcessing as dependency

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
                currentOver: currentOver,
                ballInOver: ballInOver,
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

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, []);

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
                        rollingTime={150}
                        triggers={isProcessing ? [] : ['click', 'a', 'Enter']} // Disable all triggers when processing
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
                    <div className="ml-4 text-lg font-medium text-gray-700">
                        Over: {currentOver}.{ballInOver}
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
            
            {/* Debug info to verify sync */}
            <div className="text-xs text-gray-400 text-center mb-1">
                Individual total: {players.reduce((sum, s) => sum + s, 0)} | Team score: {score}
                {players.reduce((sum, s) => sum + s, 0) !== score && (
                    <span className="text-red-400 ml-2">⚠️ DESYNC</span>
                )}
            </div>
            
            {playerObj ? (
                <ScoreCard
                    scorelist={players}
                    current={currentPlayers}
                    status={playersOut}
                    striker={striker}
                    firstTeam={playerObj.team1}
                    secondTeam={playerObj.team2}
                    players={innings === 1 ? playerObj.team1 : playerObj.team2}
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
                            <React.Fragment key={id}>
                                <div className=" p-1 mr-3 font-semibold bg-blue-100 rounded-lg">{data}</div>
                                <div className="mr-3 font-semibold">
                                    {fallOn[id]}/{id + 1}
                                </div>
                            </React.Fragment>
                        ) : null,
                    )}
                </div>
                <div className="flex flex-row mt-3 mb-4 ml-8">
                    {' '}
                    <div className="mr-3"> </div>
                    {playerFell.map((data, id) =>
                        id > 5 && data !== '' ? (
                            <React.Fragment key={id}>
                                <div className="p-1 mr-3 font-semibold bg-blue-100 rounded-lg">{data}</div>
                                <div className="mr-3 font-semibold">
                                    {fallOn[id]}/{id + 1}
                                </div>
                            </React.Fragment>
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
