/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef, useCallback, useReducer } from 'react';
import './App.css';
import Dice from 'modern-react-dice-roll';
import Header from './Header';
import ScoreCard from './ScoreCard';
// import { Button } from '@material-ui/core';
import { useStateValue } from './StateProvider';
import { Link } from 'react-router-dom';
// import Summary from './Summary';
import axios from './axios';
import {
    buildSavedMatchSnapshot,
    consumeQueuedResumeMatch,
    overwriteSavedMatchRecord,
    readSavedMatchRecordsFromStorage,
    saveMatchToStorage,
    saveNamedMatchRecord,
    upsertAutoSaveRecord,
} from './savedMatch';
import { createInitialMatchEngineState, matchEngineReducer } from './matchEngine';

function App() {
    const [state, dispatch] = useStateValue();

    const [playerObj, setPlayerObj] = useState();
    const [manualSaveName, setManualSaveName] = useState('');
    const [savedMatchRecords, setSavedMatchRecords] = useState([]);
    const [selectedOverwriteSaveId, setSelectedOverwriteSaveId] = useState('');
    const [saveFeedback, setSaveFeedback] = useState(null);
    const [lastAutoSavedAt, setLastAutoSavedAt] = useState(null);
    const [matchState, matchDispatch] = useReducer(matchEngineReducer, undefined, createInitialMatchEngineState);
    const {
        score,
        wickets,
        players,
        currentPlayers,
        totalTeamScore,
        team2FirstInningsScore,
        team1SecondInningsScore,
        testTarget,
        innings,
        playersOut,
        Bool,
        striker,
        matchOver,
        fallOn,
        playerFell,
        currentOver,
        ballInOver,
    } = matchState;
    const isTestMatch = state.matchType === 'test';
    const maxInnings = isTestMatch ? 4 : 2;
    const isTeam1Batting = isTestMatch ? innings === 1 || innings === 3 : innings === 1;
    const [resumeStateChecked, setResumeStateChecked] = useState(false);
    
    // Stronger input blocking mechanism
    const [isProcessing, setIsProcessing] = useState(false);
    const processingRef = useRef(false);
    const autoSaveTimeoutRef = useRef(null);

    const applySavedMatchSnapshot = useCallback(
        (savedMatch) => {
            if (!savedMatch) {
                return false;
            }

            const { state: savedState, appState: savedAppState, playerObj: savedPlayerObj } = savedMatch;

            dispatch({
                type: 'SET_TEAM',
                team1: savedState.team1,
                team2: savedState.team2,
            });
            dispatch({
                type: 'SET_MATCH_TYPE',
                matchType: savedState.matchType,
            });
            dispatch({
                type: 'SET_TEAM1',
                team1_data: savedState.team1_data,
            });
            dispatch({
                type: 'SET_TEAM2',
                team2_data: savedState.team2_data,
            });
            dispatch({
                type: 'SET_TEAM1_SECOND',
                team1_data2: savedState.team1_data2,
            });
            dispatch({
                type: 'SET_TEAM2_SECOND',
                team2_data2: savedState.team2_data2,
            });
            dispatch({
                type: 'SET_RESULT',
                result: savedState.result,
            });

            setPlayerObj(savedPlayerObj);
            matchDispatch({
                type: 'HYDRATE_MATCH_STATE',
                payload: savedAppState,
            });
            processingRef.current = false;
            setIsProcessing(false);

            return true;
        },
        [dispatch],
    );

    useEffect(() => {
        const savedMatch = consumeQueuedResumeMatch();

        if (savedMatch && applySavedMatchSnapshot(savedMatch)) {
            setSaveFeedback({
                type: 'success',
                message: 'Saved match restored. Continue from where you left off.',
            });
        }

        setResumeStateChecked(true);
    }, [applySavedMatchSnapshot]);

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

    const refreshSavedMatches = useCallback(async () => {
        try {
            setSavedMatchRecords(await readSavedMatchRecordsFromStorage());
        } catch (error) {
            console.error('Failed to load saved matches in match screen', error);
        }
    }, []);

    useEffect(() => {
        if (resumeStateChecked && state.team1 && state.team2) {
            getTeam();
        }
    }, [resumeStateChecked, state.team1, state.team2]);

    useEffect(() => {
        if (!resumeStateChecked) {
            return;
        }

        refreshSavedMatches();
    }, [refreshSavedMatches, resumeStateChecked]);

    const createCurrentMatchSnapshot = useCallback(
        (saveName = '') =>
            buildSavedMatchSnapshot({
                state: {
                    team1: state.team1,
                    team2: state.team2,
                    team1_data: state.team1_data,
                    team2_data: state.team2_data,
                    team1_data2: state.team1_data2,
                    team2_data2: state.team2_data2,
                    matchType: state.matchType,
                    result: state.result,
                    timestamp: state.timestamp,
                },
                playerObj,
                appState: {
                    score,
                    wickets,
                    players,
                    currentPlayers,
                    totalTeamScore,
                    team2FirstInningsScore,
                    team1SecondInningsScore,
                    testTarget,
                    innings,
                    playersOut,
                    Bool,
                    striker,
                    matchOver,
                    fallOn,
                    playerFell,
                    currentOver,
                    ballInOver,
                },
                saveName,
            }),
        [
            Bool,
            ballInOver,
            currentOver,
            currentPlayers,
            fallOn,
            innings,
            matchOver,
            playerFell,
            playerObj,
            players,
            playersOut,
            score,
            state.matchType,
            state.result,
            state.team1,
            state.team1_data,
            state.team1_data2,
            state.team2,
            state.team2_data,
            state.team2_data2,
            state.timestamp,
            striker,
            team1SecondInningsScore,
            team2FirstInningsScore,
            testTarget,
            totalTeamScore,
            wickets,
        ],
    );

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

    // To refresh after 10 wickets haul
    const afterEffect = () => {
        if (innings >= maxInnings) {
            return;
        }
        const setStuff = () => {
            const teamKey = isTeam1Batting ? 'team1' : 'team2';
            const isSecondInnings = isTestMatch && ((teamKey === 'team1' && innings === 3) || (teamKey === 'team2' && innings === 4));
            persistInningsData(teamKey, isSecondInnings);
            matchDispatch({
                type: 'ADVANCE_INNINGS',
                isTestMatch,
                maxInnings,
            });
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
        
        matchDispatch({
            type: 'ROLL',
            value,
            battingPlayers: isTeam1Batting ? playerObj?.team1 : playerObj?.team2,
        });
        
        // Reset processing flag after a short delay
        setTimeout(() => {
            processingRef.current = false;
            setIsProcessing(false);
            console.log('Processing flag reset to false');
        }, 150); // Reduced from 500ms to 100ms
        
    }, [isProcessing, isTeam1Batting, playerObj?.team1, playerObj?.team2]);

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
        matchDispatch({
            type: 'SET_MATCH_OVER',
            matchOver: 1,
        });
    };

    const downloadSavedMatch = (filename, contents) => {
        const fileBlob = new Blob([contents], { type: 'application/json' });
        const fileUrl = window.URL.createObjectURL(fileBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = fileUrl;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        window.setTimeout(() => window.URL.revokeObjectURL(fileUrl), 0);
    };

    const persistAndDownloadSnapshot = (savedSnapshot, savedRecord) => {
        const persistedSnapshot = savedRecord?.snapshot || savedSnapshot;
        const serializedMatch = saveMatchToStorage(persistedSnapshot);
        const safeTeam1 = (persistedSnapshot.state.team1 || 'team1').replace(/_/g, '-').toLowerCase();
        const safeTeam2 = (persistedSnapshot.state.team2 || 'team2').replace(/_/g, '-').toLowerCase();
        const timestamp = persistedSnapshot.savedAt.replace(/[:.]/g, '-');
        const safeSaveName = (savedRecord?.name || persistedSnapshot.saveName || 'save')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        downloadSavedMatch(
            `dice-cricket-${safeSaveName || persistedSnapshot.state.matchType}-${safeTeam1}-vs-${safeTeam2}-${timestamp}.json`,
            serializedMatch,
        );

        return serializedMatch;
    };

    const handleSaveGame = async () => {
        try {
            const savedMatch = createCurrentMatchSnapshot(manualSaveName);

            if (!savedMatch) {
                throw new Error('Could not build a valid match snapshot.');
            }

            const savedRecord = await saveNamedMatchRecord(savedMatch, manualSaveName);
            persistAndDownloadSnapshot(savedMatch, savedRecord);
            await refreshSavedMatches();
            setSelectedOverwriteSaveId(savedRecord?.id || '');

            setSaveFeedback({
                type: 'success',
                message: `Saved "${savedRecord?.name || savedMatch.saveName}" ${
                    savedRecord?.storageLocation === 'backend' ? 'to the backend' : 'locally in this browser'
                } and downloaded the JSON file.`,
            });
            setManualSaveName('');
        } catch (error) {
            console.error('Failed to save current match', error);
            setSaveFeedback({
                type: 'error',
                message: 'Could not save the current match snapshot.',
            });
        }
    };

    const handleOverwriteSave = async () => {
        try {
            if (!selectedOverwriteSaveId) {
                throw new Error('Select a save slot to overwrite.');
            }

            const overwriteTarget = savedMatchRecords.find((savedRecord) => savedRecord.id === selectedOverwriteSaveId);

            if (!overwriteTarget) {
                throw new Error('Selected save slot was not found.');
            }

            const savedMatch = createCurrentMatchSnapshot(overwriteTarget.name);

            if (!savedMatch) {
                throw new Error('Could not build a valid match snapshot.');
            }

            const overwrittenRecord = await overwriteSavedMatchRecord(selectedOverwriteSaveId, savedMatch, {
                name: overwriteTarget.name,
            });

            persistAndDownloadSnapshot(savedMatch, overwrittenRecord);
            await refreshSavedMatches();

            setSaveFeedback({
                type: 'success',
                message: `Overwrote "${overwrittenRecord?.name || overwriteTarget.name}" ${
                    overwrittenRecord?.storageLocation === 'backend' ? 'on the backend' : 'locally in this browser'
                } and downloaded the JSON file.`,
            });
        } catch (error) {
            console.error('Failed to overwrite saved match', error);
            setSaveFeedback({
                type: 'error',
                message: 'Could not overwrite the selected save slot.',
            });
        }
    };

    useEffect(() => {
        if (!resumeStateChecked || !state.team1 || !state.team2) {
            return;
        }

        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        autoSaveTimeoutRef.current = setTimeout(() => {
            const runAutoSave = async () => {
                try {
                    const savedMatch = createCurrentMatchSnapshot('Auto Save');

                    if (!savedMatch) {
                        return;
                    }

                    const autoSaveRecord = await upsertAutoSaveRecord(savedMatch);
                    setLastAutoSavedAt(autoSaveRecord?.updatedAt || savedMatch.savedAt);
                } catch (error) {
                    console.error('Failed to auto-save current match', error);
                }
            };

            runAutoSave();
        }, 250);

        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [createCurrentMatchSnapshot, resumeStateChecked, state.team1, state.team2]);

    const overwriteCandidates = savedMatchRecords.filter(
        (savedRecord) =>
            !savedRecord.isAutoSave &&
            savedRecord.snapshot.state.team1 === state.team1 &&
            savedRecord.snapshot.state.team2 === state.team2 &&
            savedRecord.snapshot.state.matchType === state.matchType,
    );

    useEffect(() => {
        if (selectedOverwriteSaveId && !overwriteCandidates.some((savedRecord) => savedRecord.id === selectedOverwriteSaveId)) {
            setSelectedOverwriteSaveId('');
        }
    }, [overwriteCandidates, selectedOverwriteSaveId]);

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
    }, [wickets]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
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
            <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2">
                
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 min-h-[calc(100vh-200px)] lg:h-[calc(100vh-200px)]">
                    
                    {/* Left: Dice & Controls */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-4 flex flex-col">
                            {/* Dice Area (fixed height to avoid shifting) */}
                            <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600 p-4 sm:p-6 mb-4 min-h-[250px] sm:min-h-[300px] flex flex-col items-center justify-center">
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
                                    <div className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-200">🎲 Roll the Dice!</div>
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

                                <div className="bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 shadow-lg">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                        Save Name
                                    </label>
                                    <input
                                        type="text"
                                        value={manualSaveName}
                                        onChange={(event) => setManualSaveName(event.target.value)}
                                        placeholder="Example: Chase setup before final over"
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    />
                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        Auto-save also updates after every roll.
                                        {lastAutoSavedAt && ` Last auto-save: ${new Date(lastAutoSavedAt).toLocaleTimeString()}`}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                                    onClick={handleSaveGame}
                                    disabled={!resumeStateChecked}
                                >
                                    💾 Create Named Save + JSON
                                </button>

                                <div className="bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 shadow-lg">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                        Overwrite Existing Save
                                    </label>
                                    <select
                                        value={selectedOverwriteSaveId}
                                        onChange={(event) => setSelectedOverwriteSaveId(event.target.value)}
                                        disabled={!resumeStateChecked || !overwriteCandidates.length}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-60"
                                    >
                                        <option value="">Select a save slot</option>
                                        {overwriteCandidates.map((savedRecord) => (
                                            <option key={savedRecord.id} value={savedRecord.id}>
                                                {savedRecord.name} | {savedRecord.storageLocation === 'backend' ? 'Backend' : 'Browser'} |{' '}
                                                {new Date(savedRecord.updatedAt).toLocaleString()}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        {overwriteCandidates.length
                                            ? 'Only named saves for this matchup and format are shown here.'
                                            : 'No named saves for this matchup yet. Create one first.'}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 disabled:transform-none"
                                    onClick={handleOverwriteSave}
                                    disabled={!resumeStateChecked || !selectedOverwriteSaveId}
                                >
                                    ♻️ Overwrite Selected Save + JSON
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

                                {saveFeedback && (
                                    <div
                                        className={`rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
                                            saveFeedback.type === 'success'
                                                ? 'bg-green-100 text-green-800 border border-green-300'
                                                : 'bg-red-100 text-red-800 border border-red-300'
                                        }`}
                                    >
                                        {saveFeedback.message}
                                    </div>
                                )}
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
