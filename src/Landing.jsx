import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Teams from './Teams';
import CoinToss from './CoinToss';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
import { useStateValue } from './StateProvider';
import cx from 'classnames';
import {
    deleteSavedMatchRecord,
    normalizeSavedMatch,
    queueResumeMatch,
    readSavedMatchRecordsFromStorage,
    saveNamedMatchRecord,
} from './savedMatch';

function Landing() {
    const [team1Selected, setTeam1Selected] = useState('');
    const [times, setTimes] = useState(1);
    const [team2Selected, setTeam2Selected] = useState('');
    const [matchType, setMatchType] = useState('oneday');
    const [savedMatchRecords, setSavedMatchRecords] = useState([]);
    const [resumeError, setResumeError] = useState(null);

    const [, dispatch] = useStateValue();
    const [isTossed, setIsTossed] = useState(false);
    const history = useHistory();

    const refreshSavedMatches = () => {
        setSavedMatchRecords(readSavedMatchRecordsFromStorage());
    };

    useEffect(() => {
        refreshSavedMatches();
    }, []);

    const login = () => {
        dispatch({
            type: 'SET_TEAM',
            team1: team1Selected,
            team2: team2Selected,
        });
        dispatch({
            type: 'SET_MATCH_TYPE',
            matchType: matchType,
        });
    };

    const resumeSavedMatch = (savedMatch) => {
        try {
            queueResumeMatch(savedMatch);
            setResumeError(null);
            history.push('/match');
        } catch (error) {
            console.error('Failed to queue saved match', error);
            setResumeError('Could not restore that saved match.');
        }
    };

    const handleResumeLatestSave = () => {
        const latestSavedRecord = readSavedMatchRecordsFromStorage()[0];

        if (!latestSavedRecord) {
            setResumeError('No browser save found yet. Import a JSON save instead.');
            return;
        }

        resumeSavedMatch(latestSavedRecord.snapshot);
    };

    const handleResumeSavedRecord = (savedRecord) => {
        resumeSavedMatch(savedRecord.snapshot);
    };

    const handleDeleteSavedRecord = (recordId) => {
        const nextRecords = deleteSavedMatchRecord(recordId);
        setSavedMatchRecords(nextRecords);
    };

    const handleImportSavedMatch = async (event) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        try {
            const fileContents = await selectedFile.text();
            const savedMatch = normalizeSavedMatch(fileContents);

            if (!savedMatch) {
                throw new Error('Invalid saved match file');
            }

            const importedSaveName =
                savedMatch.saveName || selectedFile.name.replace(/\.json$/i, '').replace(/[-_]+/g, ' ');
            const savedRecord = saveNamedMatchRecord(savedMatch, importedSaveName);
            refreshSavedMatches();
            resumeSavedMatch(savedRecord.snapshot);
        } catch (error) {
            console.error('Failed to import saved match', error);
            setResumeError('Selected file is not a valid Dice Cricket save.');
        } finally {
            event.target.value = '';
        }
    };

    const latestSavedRecord = savedMatchRecords[0] || null;
    const autoSaveRecord = savedMatchRecords.find((savedRecord) => savedRecord.isAutoSave) || null;
    const manualSavedRecords = savedMatchRecords.filter((savedRecord) => !savedRecord.isAutoSave);

    return (
        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen flex flex-col items-center">
            <div className="max-w-6xl w-full p-4 sm:p-6 md:p-8 m-auto">
                <div className="text-center mb-4">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight">
                        🏏 Welcome to Dice Cricket! 🎲
                    </h1>
                    <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-8"></div>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 font-medium">Choose your teams and let the dice decide your destiny!</p>
                </div>
                <div className="flex flex-col items-center mb-8">
                    <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">Match Format</div>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        <button
                            type="button"
                            onClick={() => setMatchType('oneday')}
                            className={cx(
                                'px-6 py-3 rounded-2xl text-lg font-bold border-2 shadow-lg transform hover:scale-105 transition-all duration-300',
                                matchType === 'oneday'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-300'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600',
                            )}
                        >
                            One Day
                        </button>
                        <button
                            type="button"
                            onClick={() => setMatchType('test')}
                            className={cx(
                                'px-6 py-3 rounded-2xl text-lg font-bold border-2 shadow-lg transform hover:scale-105 transition-all duration-300',
                                matchType === 'test'
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-300'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600',
                            )}
                        >
                            Test
                        </button>
                    </div>
                </div>
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
                <div className="flex justify-center mt-12">
                    <Link
                        to={{
                            pathname: '/match',
                        }}
                    >
                        <button
                            onClick={login}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl border-2 border-green-300 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 text-xl"
                        >
                            🚀 Let's Play Match! 🏏
                        </button>
                    </Link>
                </div>

                <div className="max-w-3xl mx-auto mt-8">
                    <div className="bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-xl p-6">
                        <div className="text-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Resume Saved Match</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                Continue the latest auto-save, choose a named save, or import a previously downloaded JSON snapshot.
                            </p>
                        </div>

                        {latestSavedRecord ? (
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-700 rounded-2xl px-4 py-4 text-sm text-gray-700 dark:text-gray-200 mb-4">
                                <div className="font-bold text-base text-amber-800 dark:text-amber-300">
                                    Latest Save: {latestSavedRecord.name}
                                </div>
                                <div className="mt-1">
                                    {latestSavedRecord.snapshot.state.team1?.replace('_', ' ')} vs{' '}
                                    {latestSavedRecord.snapshot.state.team2?.replace('_', ' ')}
                                </div>
                                <div className="mt-1">
                                    Format: {latestSavedRecord.snapshot.state.matchType === 'test' ? 'Test' : 'One Day'} | Innings:{' '}
                                    {latestSavedRecord.snapshot.appState.innings} | Score: {latestSavedRecord.snapshot.appState.score}/
                                    {latestSavedRecord.snapshot.appState.wickets}
                                </div>
                                <div className="mt-1">
                                    Saved: {new Date(latestSavedRecord.updatedAt).toLocaleString()}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-100 dark:bg-gray-700/60 border border-dashed border-gray-300 dark:border-gray-500 rounded-2xl px-4 py-4 text-sm text-gray-600 dark:text-gray-300 mb-4 text-center">
                                No browser save found yet. Import a saved JSON file to continue a match.
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                type="button"
                                onClick={handleResumeLatestSave}
                                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-all duration-300"
                            >
                                🔁 Resume Latest Save
                            </button>

                            <label className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-all duration-300 cursor-pointer text-center">
                                📂 Import Save JSON
                                <input type="file" accept=".json,application/json" className="hidden" onChange={handleImportSavedMatch} />
                            </label>
                        </div>

                        {resumeError && (
                            <div className="mt-4 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 rounded-2xl px-4 py-3 text-sm font-semibold text-center">
                                {resumeError}
                            </div>
                        )}

                        {autoSaveRecord && (
                            <div className="mt-5">
                                <div className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-300 mb-2">
                                    Auto Save
                                </div>
                                <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-700 rounded-2xl px-4 py-4">
                                    <div className="font-bold text-sky-800 dark:text-sky-300">{autoSaveRecord.name}</div>
                                    <div className="text-sm text-gray-700 dark:text-gray-200 mt-1">
                                        {autoSaveRecord.snapshot.state.team1?.replace('_', ' ')} vs {autoSaveRecord.snapshot.state.team2?.replace('_', ' ')}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                        Innings {autoSaveRecord.snapshot.appState.innings} | Score {autoSaveRecord.snapshot.appState.score}/{autoSaveRecord.snapshot.appState.wickets} | Updated{' '}
                                        {new Date(autoSaveRecord.updatedAt).toLocaleString()}
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => handleResumeSavedRecord(autoSaveRecord)}
                                            className="bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold px-4 py-2 rounded-xl shadow"
                                        >
                                            Resume
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {manualSavedRecords.length > 0 && (
                            <div className="mt-5">
                                <div className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-300 mb-2">
                                    Named Saves
                                </div>
                                <div className="space-y-3">
                                    {manualSavedRecords.map((savedRecord) => (
                                        <div
                                            key={savedRecord.id}
                                            className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-4 shadow-sm"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                                <div>
                                                    <div className="font-bold text-gray-800 dark:text-gray-100">{savedRecord.name}</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                        {savedRecord.snapshot.state.team1?.replace('_', ' ')} vs {savedRecord.snapshot.state.team2?.replace('_', ' ')}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {savedRecord.snapshot.state.matchType === 'test' ? 'Test' : 'One Day'} | Innings {savedRecord.snapshot.appState.innings} | Score{' '}
                                                        {savedRecord.snapshot.appState.score}/{savedRecord.snapshot.appState.wickets}
                                                    </div>
                                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                        Updated {new Date(savedRecord.updatedAt).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 sm:justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleResumeSavedRecord(savedRecord)}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2 rounded-xl shadow"
                                                    >
                                                        Resume
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteSavedRecord(savedRecord.id)}
                                                        className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-xl shadow"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-5 mt-8">
                    <div className="bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/50 dark:to-pink-900/50 border-2 border-red-300 dark:border-red-700 hover:border-red-500 px-6 py-3 text-xl font-bold rounded-2xl shadow-lg text-red-700 dark:text-red-300 transform hover:scale-105 transition-all duration-300 cursor-pointer">
                        🪙 Heads
                    </div>
                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 border-2 border-blue-300 dark:border-blue-700 hover:border-blue-500 px-6 py-3 text-xl font-bold rounded-2xl shadow-lg text-blue-700 dark:text-blue-300 transform hover:scale-105 transition-all duration-300 cursor-pointer">
                        🪙 Tails
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-6 mt-6">
                    {team1Selected ? (
                        <div
                            className={cx(
                                'px-6 py-3 font-bold text-white rounded-2xl shadow-xl text-center transform hover:scale-105 transition-all duration-300 border-2',
                                {
                                    'bg-gradient-to-r from-yellow-400 to-yellow-600 border-yellow-300': team1Selected === 'Australia',
                                    'bg-gradient-to-r from-orange-400 to-orange-600 border-orange-300': team1Selected === 'India',
                                    'bg-gradient-to-r from-blue-600 to-blue-800 border-blue-400': team1Selected === 'England',
                                    'bg-gradient-to-r from-gray-700 to-gray-900 border-gray-500': team1Selected === 'New_Zealand',
                                    'bg-gradient-to-r from-green-500 to-green-700 border-green-300': team1Selected === 'South_Africa',
                                },
                            )}
                        >
                            🏏 {team1Selected.replace('_', ' ')}
                        </div>
                    ) : (
                        <div className="px-6 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl text-gray-500 dark:text-gray-400 font-semibold">
                            Select Team 1
                        </div>
                    )}
                    
                    <div className="flex items-center justify-center text-3xl font-bold text-gray-400 dark:text-gray-500">
                        VS
                    </div>
                    
                    {team2Selected ? (
                        <div
                            className={cx(
                                'px-6 py-3 font-bold text-white rounded-2xl shadow-xl text-center transform hover:scale-105 transition-all duration-300 border-2',
                                {
                                    'bg-gradient-to-r from-yellow-400 to-yellow-600 border-yellow-300': team2Selected === 'Australia',
                                    'bg-gradient-to-r from-orange-400 to-orange-600 border-orange-300': team2Selected === 'India',
                                    'bg-gradient-to-r from-blue-600 to-blue-800 border-blue-400': team2Selected === 'England',
                                    'bg-gradient-to-r from-gray-700 to-gray-900 border-gray-500': team2Selected === 'New_Zealand',
                                    'bg-gradient-to-r from-green-500 to-green-700 border-green-300': team2Selected === 'South_Africa',
                                },
                            )}
                        >
                            🏏 {team2Selected.replace('_', ' ')}
                        </div>
                    ) : (
                        <div className="px-6 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl text-gray-500 dark:text-gray-400 font-semibold">
                            Select Team 2
                        </div>
                    )}
                </div>
                <div className="mt-8 flex justify-center">
                    {isTossed ? (
                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 border-2 border-green-300 dark:border-green-700 px-8 py-6 rounded-2xl shadow-lg text-center max-w-md">
                            <div className="text-3xl font-bold text-green-700 dark:text-green-300 mb-3">🎉 Toss Result! 🎉</div>
                            <div className="text-lg font-semibold text-green-800 dark:text-green-200 leading-relaxed">
                                🏏 <span className="font-bold text-green-900 dark:text-green-100">{team1Selected.replace('_', ' ')}</span> won the toss and chose to bat first!
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 border-2 border-dashed border-gray-300 dark:border-gray-500 px-8 py-6 rounded-2xl text-center">
                            <div className="text-lg font-semibold text-gray-500 dark:text-gray-300">
                                🪙 Waiting for coin toss...
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center mt-12">
                    <Link
                        to={{
                            pathname: '/history',
                        }}
                    >
                        <button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-2xl shadow-xl border-2 border-purple-300 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 text-lg">
                            📊 View Match History
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
export default Landing;
