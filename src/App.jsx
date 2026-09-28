/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef, useCallback, useReducer } from 'react';
import Dice from 'modern-react-dice-roll';
import ScoreCard from './components/match/ScoreCard';
import Icon from './components/ui/Icon';
import TeamMark from './components/ui/TeamMark';
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
import { formatInningsName, formatMatchType, formatResult, formatTeamName } from './utils/matchPresentation';

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

    const resultText = formatResult(
        state.result ||
            (totalTeamScore > score
                ? `${state.team1?.replace('_', ' ')} won by ${totalTeamScore - score} runs`
                : `${state.team2?.replace('_', ' ')} won by ${10 - wickets} wickets`),
    );

    const canAdvanceInnings = wickets === 10 && innings < maxInnings && matchOver === 0;
    const inningsSteps = Array.from({ length: maxInnings }, (_, index) => index + 1);

    if (!resumeStateChecked) {
        return (
            <main className="app-page">
                <div className="app-container">
                    <div className="state-panel">
                        <div>
                            <span className="state-panel__icon"><Icon name="dice" size={28} /></span>
                            <h2>Preparing the match centre</h2>
                            <p>Restoring your teams, innings state, and latest auto-save.</p>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!state.team1 || !state.team2) {
        return (
            <main className="app-page">
                <div className="app-container">
                    <div className="state-panel">
                        <div>
                            <span className="state-panel__icon"><Icon name="users" size={28} /></span>
                            <h2>No fixture selected</h2>
                            <p>Choose two squads and complete the toss before opening the live match centre.</p>
                            <Link className="button button--primary" to="/"><Icon name="arrowRight" size={16} /> Build a match</Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="app-page">
            <div className="app-container match-shell">
                <section className="match-masthead page-enter">
                    <div className="matchup-lockup">
                        <TeamMark size="medium" teamId={state.team1} />
                        <span className="matchup-lockup__versus">VS</span>
                        <TeamMark size="medium" teamId={state.team2} />
                        <div className="matchup-lockup__copy">
                            <span className="eyebrow">{formatMatchType(state.matchType)}</span>
                            <h1>{formatTeamName(state.team1)} vs {formatTeamName(state.team2)}</h1>
                        </div>
                    </div>
                    <div className="match-masthead__aside">
                        <span className="status-pill status-pill--live">{formatInningsName(innings)} · {battingTeamName} batting</span>
                        <div className="innings-track" aria-label={`Innings ${innings} of ${maxInnings}`}>
                            {inningsSteps.map((step) => (
                                <span className={`innings-step ${step < innings ? 'innings-step--complete' : ''} ${step === innings ? 'innings-step--active' : ''}`} key={step}>{step}</span>
                            ))}
                        </div>
                    </div>
                </section>
                
                {matchOver === 1 && (
                    <section className="result-banner page-enter">
                        <span className="result-banner__icon"><Icon name="trophy" size={23} /></span>
                        <span><strong>{resultText}</strong><span>Match complete · the final scorecard is ready</span></span>
                        <Link className="button button--secondary" onClick={dispatchTeam2} to="/summary">Review match <Icon name="arrowRight" size={15} /></Link>
                    </section>
                )}
                
                <div className="match-grid">
                    
                    <aside className="control-rail">
                        <section className="control-card dice-card">
                            <div className="dice-card__top">
                                <span>Delivery control</span>
                                <span className="status-pill status-pill--live">Ball {ballInOver + 1}</span>
                            </div>
                            <div className="dice-stage">
                                {wickets !== 10 && matchOver === 0 ? (
                                    <Dice
                                        faceBg="White"
                                        faces={dice_face}
                                        onRoll={scoring}
                                        rollingTime={150}
                                        size={108}
                                        triggers={isProcessing ? [] : ['click', 'a', 'Enter']}
                                    />
                                ) : (
                                    <span className="dice-complete"><Icon name={matchOver ? 'trophy' : 'wicket'} size={36} /></span>
                                )}
                            </div>
                            <div className="dice-card__copy">
                                <strong>{matchOver ? 'Match complete' : wickets === 10 ? 'Innings complete' : isProcessing ? 'Updating the score…' : 'Roll the next delivery'}</strong>
                                <span>{matchOver ? 'Open the summary for the full result' : wickets === 10 ? 'Advance when you are ready' : 'Click the dice · press A · press Enter'}</span>
                            </div>
                            <div className="auto-save-status">
                                <Icon name="cloud" size={14} />
                                {lastAutoSavedAt ? `Auto-saved ${new Date(lastAutoSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Auto-save is active'}
                            </div>
                        </section>

                        <section className="control-card">
                            <div className="control-actions">
                                <button className="button button--primary button--wide" disabled={!canAdvanceInnings} onClick={afterEffect} type="button">
                                    <Icon name="bat" size={17} />
                                    {innings < maxInnings ? `Start ${formatInningsName(innings + 1)}` : 'Final innings'}
                                </button>
                                {matchOver === 1 ? (
                                    <Link className="button button--dark button--wide" onClick={dispatchTeam2} to="/summary">
                                        <Icon name="trophy" size={17} /> Match summary
                                    </Link>
                                ) : (
                                    <button className="button button--dark button--wide" disabled type="button"><Icon name="trophy" size={17} /> Match summary</button>
                                )}
                            </div>
                            <p className="control-hint">
                                <Icon name="shield" size={15} />
                                {wickets === 10 && innings < maxInnings ? 'This innings is complete. Advance to reset the crease.' : 'The next-innings control unlocks after all ten wickets fall.'}
                            </p>
                        </section>

                        <details className="control-card save-drawer">
                            <summary>
                                <span><Icon name="save" size={16} /> Save & export</span>
                                <Icon name="chevronDown" size={16} />
                            </summary>
                            <div className="save-drawer__body">
                                <label htmlFor="save-name">Create a named checkpoint</label>
                                <input className="field" id="save-name" onChange={(event) => setManualSaveName(event.target.value)} placeholder="Before the final chase" type="text" value={manualSaveName} />
                                <button className="button button--secondary button--wide" onClick={handleSaveGame} type="button"><Icon name="save" size={15} /> Save + download JSON</button>

                                <label htmlFor="overwrite-save">Overwrite an existing checkpoint</label>
                                <select className="select-field" disabled={!overwriteCandidates.length} id="overwrite-save" onChange={(event) => setSelectedOverwriteSaveId(event.target.value)} value={selectedOverwriteSaveId}>
                                    <option value="">{overwriteCandidates.length ? 'Choose a save' : 'No named saves for this fixture'}</option>
                                    {overwriteCandidates.map((savedRecord) => (
                                        <option key={savedRecord.id} value={savedRecord.id}>{savedRecord.name} · {savedRecord.storageLocation === 'backend' ? 'Backend' : 'Browser'}</option>
                                    ))}
                                </select>
                                <button className="button button--ghost button--wide" disabled={!selectedOverwriteSaveId} onClick={handleOverwriteSave} type="button"><Icon name="refresh" size={15} /> Overwrite + download</button>

                                {saveFeedback && <div className={`save-feedback save-feedback--${saveFeedback.type}`}>{saveFeedback.message}</div>}
                            </div>
                        </details>
                    </aside>
                    
                    <section className="match-main">
                        <div>
                            {leadTrailInfo && (
                                <div className="lead-trail-banner">
                                    <span>Test match position</span>
                                    <strong>{formatTeamName(leadTrailInfo.team)} {leadTrailInfo.label.toLowerCase()} by {leadTrailInfo.runs} runs</strong>
                                </div>
                            )}

                            {playerObj ? (
                                <ScoreCard
                                    ballInOver={ballInOver}
                                    battingTeamId={isTeam1Batting ? state.team1 : state.team2}
                                    battingTeamName={battingTeamName}
                                    current={currentPlayers}
                                    currentOver={currentOver}
                                    fallOn={fallOn}
                                    firstTeam={playerObj.team1}
                                    innings={innings}
                                    playerFell={playerFell}
                                    players={battingPlayers}
                                    scorelist={players}
                                    secondTeam={playerObj.team2}
                                    status={playersOut}
                                    striker={striker}
                                    target={targetScore}
                                    team1Score={isTestMatch ? null : totalTeamScore}
                                />
                            ) : (
                                <div className="state-panel">
                                    <div>
                                        <span className="state-panel__icon"><Icon name="users" size={28} /></span>
                                        <h2>Loading the playing XI</h2>
                                        <p>Connecting to the team service and preparing both batting orders.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

            </div>
        </main>
    );
}

export default App;
