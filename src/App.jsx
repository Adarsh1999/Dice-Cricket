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
    const [team2FirstInningsScore, setTeam2FirstInningsScore] = useState(0);
    const [team1SecondInningsScore, setTeam1SecondInningsScore] = useState(0);
    const [testTarget, setTestTarget] = useState(null);
    const [innings, setInnings] = useState(1);
    const [playersOut, setPlayersOut] = useState(Array(11).fill(0));
    const [Bool, setBool] = useState(false);
    const [striker, setStriker] = useState(0);
    const [matchOver, setMatchOver] = useState(0);
    const [playerObj, setPlayerObj] = useState();
    const [fallOn, setFallOn] = useState(Array(10).fill(''));
    const [playerFell, setPlayerFell] = useState(Array(10).fill(''));
    const isTestMatch = state.matchType === 'test';
    const maxInnings = isTestMatch ? 4 : 2;
    const isTeam1Batting = isTestMatch ? innings === 1 || innings === 3 : innings === 1;
    
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

    const buildTeamPayload = (teamKey) => {
        const teamPlayers = teamKey === 'team1' ? playerObj?.team1 : playerObj?.team2;
        return {
            scorelist: players,
            current: currentPlayers,
            status: playersOut,
            striker: striker,
            players: teamPlayers || [],
            firstTeam: teamKey === 'team1' ? teamPlayers || [] : [],
            secondTeam: teamKey === 'team2' ? teamPlayers || [] : [],
            score: score,
            wickets: wickets,
            fallOn: fallOn,
            playerFell: playerFell,
            currentOver: currentOver,
            ballInOver: ballInOver,
        };
    };

    const persistInningsData = (teamKey, isSecondInnings) => {
        const payload = buildTeamPayload(teamKey);
        if (teamKey === 'team1') {
            if (isSecondInnings) {
                dispatch({
                    type: 'SET_TEAM1_SECOND',
                    team1_data2: payload,
                });
                return;
            }
            dispatch({
                type: 'SET_TEAM1',
                team1_data: payload,
            });
            return;
        }
        if (isSecondInnings) {
            dispatch({
                type: 'SET_TEAM2_SECOND',
                team2_data2: payload,
            });
            return;
        }
        dispatch({
            type: 'SET_TEAM2',
            team2_data: payload,
        });
    };

    const resetInningsState = () => {
        setScore(0);
        setWickets(0);
        setPlayersOut(Array(11).fill(0));
        setFallOn(Array(10).fill(''));
        setPlayerFell(Array(10).fill(''));
        setPlayers(Array(11).fill(0));
        setBool(false);
        setCurrentPlayers([0, 1]);
        setStriker(0);
        setCurrentOver(0);
        setBallInOver(0);
    };

    // To refresh after 10 wickets haul
    const afterEffect = () => {
        if (innings >= maxInnings) {
            return;
        }
        const setStuff = () => {
            const teamKey = isTeam1Batting ? 'team1' : 'team2';
            const isSecondInnings = isTestMatch && ((teamKey === 'team1' && innings === 3) || (teamKey === 'team2' && innings === 4));
            persistInningsData(teamKey, isSecondInnings);

            if (innings === 1) {
                setTotalTeamScore(score);
                setInnings(2);
                resetInningsState();
                return;
            }

            if (isTestMatch && innings === 2) {
                setTeam2FirstInningsScore(score);
                setInnings(3);
                resetInningsState();
                return;
            }

            if (isTestMatch && innings === 3) {
                setTeam1SecondInningsScore(score);
                const target = totalTeamScore + score - team2FirstInningsScore + 1;
                setTestTarget(Math.max(1, target));
                setInnings(4);
                resetInningsState();
            }
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
        const teamKey = isTeam1Batting ? 'team1' : 'team2';
        const isSecondInnings = isTestMatch && teamKey === 'team2' && innings === 4;
        persistInningsData(teamKey, isSecondInnings);
    };

    const endMatch = (resultText) => {
        if (matchOver) {
            return;
        }
        dispatch({
            type: 'SET_RESULT',
            result: resultText,
        });
        setMatchOver(1);
    };

    useEffect(() => {
        const target = isTestMatch
            ? innings === 4
                ? testTarget ?? Math.max(1, totalTeamScore + team1SecondInningsScore - team2FirstInningsScore + 1)
                : null
            : innings === 2
            ? totalTeamScore + 1
            : null;

        if (target && score >= target) {
            console.log('Team 2 won the match ');
            endMatch(`${state.team2} won by ${10 - wickets} wickets`);
        }
    }, [score, innings, totalTeamScore, testTarget, team1SecondInningsScore, team2FirstInningsScore, isTestMatch, wickets, matchOver, state.team2]);

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
        if (matchOver) {
            return;
        }
        const target = isTestMatch
            ? innings === 4
                ? testTarget ?? Math.max(1, totalTeamScore + team1SecondInningsScore - team2FirstInningsScore + 1)
                : null
            : innings === 2
            ? totalTeamScore + 1
            : null;
        if (!isTestMatch && innings === 2 && wickets === 10) {
            console.log('team 1 won');
            endMatch(`${state.team1} won by ${Math.max(0, totalTeamScore - score)} runs`);
        }
        if (isTestMatch && innings === 4 && wickets === 10 && target) {
            console.log('team 1 won');
            endMatch(`${state.team1} won by ${Math.max(0, target - 1 - score)} runs`);
        }
        //most complex use case of usestate but very important refer for future
        const battingPlayers = isTeam1Batting ? playerObj?.team1 : playerObj?.team2;
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
                        idx === wickets - 1 ? battingPlayers?.[currentPlayers[0]] ?? item : item,
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
                        idx === wickets - 1 ? battingPlayers?.[currentPlayers[1]] ?? item : item,
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

    const targetScore = isTestMatch
        ? innings === 4
            ? testTarget ?? Math.max(1, totalTeamScore + team1SecondInningsScore - team2FirstInningsScore + 1)
            : null
        : innings === 2
        ? totalTeamScore + 1
        : null;

    const battingTeamName = isTeam1Batting
        ? state.team1
            ? state.team1.replace('_', ' ')
            : 'Team 1'
        : state.team2
        ? state.team2.replace('_', ' ')
        : 'Team 2';
    const battingPlayers = isTeam1Batting ? playerObj?.team1 : playerObj?.team2;

    const leadTrailInfo = (() => {
        if (!isTestMatch) {
            return null;
        }
        if (innings === 2) {
            const diff = score - totalTeamScore;
            return {
                team: state.team2,
                label: diff >= 0 ? 'Lead' : 'Trail',
                runs: Math.abs(diff),
            };
        }
        if (innings === 3) {
            const diff = totalTeamScore + score - team2FirstInningsScore;
            return {
                team: state.team1,
                label: diff >= 0 ? 'Lead' : 'Trail',
                runs: Math.abs(diff),
            };
        }
        return null;
    })();

    const resultText = state.result
        ? state.result.replace('_', ' ')
        : totalTeamScore > score
        ? `${state.team1?.replace('_', ' ')} won by ${totalTeamScore - score} runs`
        : `${state.team2?.replace('_', ' ')} won by ${10 - wickets} wickets`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <Header />
            
            {/* Compact Match Interface */}
            <div className="max-w-7xl mx-auto px-4 py-2">
                
                {/* Match Result - Only show when match is over */}
                {matchOver === 1 && (
                    <div className="mb-4 text-center">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-2xl shadow-xl inline-block">
                            <span className="text-xl font-bold">
                                🏆 {resultText}
                            </span>
                        </div>
                    </div>
                )}
                
                {/* Main Game Area - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-200px)]">
                    
                    {/* Left: Dice & Controls */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-4 flex flex-col">
                            {/* Dice Area (fixed height to avoid shifting) */}
                            <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600 p-6 mb-4 min-h-[300px] flex flex-col items-center justify-center">
                                <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-4 rounded-full shadow-2xl border-4 border-white mb-4">
                                    {wickets !== 10 && matchOver === 0 ? (
                                        <Dice
                                            onRoll={(value) => scoring(value)}
                                            size={100}
                                            sound={'/audio.mp3'}
                                            faceBg={'White'}
                                            faces={dice_face}
                                            rollingTime={150}
                                            triggers={isProcessing ? [] : ['click', 'a', 'Enter']}
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-600 rounded-xl flex items-center justify-center">
                                            <span className="text-3xl">🏏</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-gray-700 dark:text-gray-200">🎲 Roll the Dice!</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Click, Press 'A' or Enter</div>
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3">
                                <button
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 disabled:transform-none"
                                    onClick={() => afterEffect()}
                                    disabled={innings === maxInnings || matchOver === 1}
                                >
                                    🏏 Next Innings
                                </button>
                                
                                <Link to={{ pathname: '/summary' }}>
                                    <button
                                        disabled={innings !== maxInnings}
                                        className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 disabled:transform-none"
                                        onClick={() => dispatchTeam2()}
                                    >
                                        📊 Match Summary
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right: Scorecard */}
                    <div className="lg:col-span-8">
                        <div className="h-full overflow-auto">
                            
                            {/* Debug info - Commented for cleaner UI */}
                            {/* <div className="text-xs text-gray-400 text-center mb-2">
                                Individual total: {players.reduce((sum, s) => sum + s, 0)} | Team score: {score}
                                {players.reduce((sum, s) => sum + s, 0) !== score && (
                                    <span className="text-red-400 ml-2">⚠️ DESYNC</span>
                                )}
                            </div> */}
                            
                            {leadTrailInfo && (
                                <div className="mb-3 text-center">
                                    <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-xl shadow border border-gray-200 dark:border-gray-600">
                                        <span className="font-bold">
                                            {(leadTrailInfo.team ? leadTrailInfo.team.replace('_', ' ') : 'Team')} {leadTrailInfo.label} by {leadTrailInfo.runs}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {playerObj ? (
                                <ScoreCard
                                    scorelist={players}
                                    current={currentPlayers}
                                    status={playersOut}
                                    striker={striker}
                                    firstTeam={playerObj.team1}
                                    secondTeam={playerObj.team2}
                                    team1Score={isTestMatch ? null : totalTeamScore}
                                    battingTeamName={battingTeamName}
                                    players={battingPlayers}
                                    innings={innings}
                                    currentOver={currentOver}
                                    ballInOver={ballInOver}
                                    fallOn={fallOn}
                                    playerFell={playerFell}
                                    target={targetScore}
                                />
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-4xl mb-4">🏏</div>
                                    <div className="text-xl font-semibold text-gray-600 dark:text-gray-300">Loading player data...</div>
                                </div>
                            )}
                            

                        </div>
                    </div>
                </div>

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
