/* eslint-disable react/jsx-key */
import React, { useState, useEffect, useRef } from 'react';
import { useStateValue } from './StateProvider';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from 'react-bootstrap/Table';
import Header from './Header';
import ScoreCard from './ScoreCard';
import axios from './axios';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

function Summary() {
    const [state, dispatch] = useStateValue();
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);
    const isTestMatch = state.matchType === 'test';

    const normalizeTeamData = (teamData, teamKey) => {
        const safeData = teamData || {};
        const fallbackPlayers = safeData.players || safeData.firstTeam || safeData.secondTeam || [];
        return {
            ...safeData,
            players: safeData.players || fallbackPlayers,
            firstTeam: teamKey === 'team1' ? (safeData.firstTeam || fallbackPlayers) : (safeData.firstTeam || []),
            secondTeam: teamKey === 'team2' ? (safeData.secondTeam || fallbackPlayers) : (safeData.secondTeam || []),
            currentOver: safeData.currentOver || 0,
            ballInOver: safeData.ballInOver || 0,
        };
    };

    const testTarget = isTestMatch
        ? Math.max(1, (state.team1_data?.score || 0) + (state.team1_data2?.score || 0) - (state.team2_data?.score || 0) + 1)
        : null;

    const testInnings = isTestMatch
        ? [
            { id: 'team1-1', teamName: state.team1, data: state.team1_data, innings: 1 },
            { id: 'team2-1', teamName: state.team2, data: state.team2_data, innings: 2 },
            { id: 'team1-2', teamName: state.team1, data: state.team1_data2, innings: 3 },
            { id: 'team2-2', teamName: state.team2, data: state.team2_data2, innings: 4 },
        ]
        : [];

    console.log(state);

    const saveToDb = async () => {
        try {
            setSaving(true);
            setSaveStatus(null);
            
            // Transform data to match backend schema
            const gameData = {
                ...state,
                matchType: state.matchType || 'oneday',
                team1_data: normalizeTeamData(state.team1_data, 'team1'),
                team2_data: normalizeTeamData(state.team2_data, 'team2'),
                team1_data2: normalizeTeamData(state.team1_data2, 'team1'),
                team2_data2: normalizeTeamData(state.team2_data2, 'team2'),
            };

            console.log('Saving game data:', gameData);
            const { data } = await axios.post('/history/new', gameData);
            console.log('Save response:', data);
            
            if (data.success) {
                setSaveStatus('success');
            } else {
                setSaveStatus('error');
            }
        } catch (error) {
            console.error('Failed to save game:', error);
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Header />
            
            {/* Celebration Header */}
            <div className="text-center py-8">
                <div className="relative">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
                        🏆 MATCH COMPLETE! 🏆
                    </h1>
                    <div className="w-48 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto mb-6"></div>
                </div>
                
                {/* Winner Announcement */}
                <div className="bg-gradient-to-r from-green-400 to-emerald-600 text-white px-6 sm:px-8 md:px-12 py-4 sm:py-6 rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-green-300 inline-block mb-8 transform hover:scale-105 transition-all duration-300">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">🎉 CHAMPION 🎉</h2>
                    <div className="text-lg sm:text-xl md:text-2xl font-semibold">{state.result}</div>
                </div>
            </div>
            
            {/* Save Status Messages */}
            {saveStatus === 'success' && (
                <div className="max-w-md mx-auto mb-6">
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 text-green-800 px-6 py-4 rounded-2xl shadow-lg text-center">
                        <div className="text-lg font-bold">✅ Game Saved Successfully!</div>
                        <div className="text-sm">Your epic match is now in history!</div>
                    </div>
                </div>
            )}
            {saveStatus === 'error' && (
                <div className="max-w-md mx-auto mb-6">
                    <div className="bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-400 text-red-800 px-6 py-4 rounded-2xl shadow-lg text-center">
                        <div className="text-lg font-bold">❌ Save Failed</div>
                        <div className="text-sm">Please try saving again!</div>
                    </div>
                </div>
            )}
            
            {/* Main Content Container */}
            <div className="max-w-7xl mx-auto px-2 sm:px-4 pb-8">

                {isTestMatch ? (
                    <div className="space-y-8">
                        {testInnings.map((inning) => {
                            const data = inning.data || {};
                            const scorelist = data.scorelist || [];
                            const current = data.current || [];
                            const status = data.status || [];
                            const fallOn = data.fallOn || [];
                            const playerFell = data.playerFell || [];
                            const playerList = data.players || data.firstTeam || data.secondTeam || [];
                            return (
                                <div key={inning.id} className="mb-8">
                                    <ScoreCard
                                        scorelist={scorelist}
                                        current={current}
                                        status={status}
                                        striker={data.striker}
                                        firstTeam={data.firstTeam}
                                        secondTeam={data.secondTeam}
                                        players={playerList}
                                        innings={inning.innings}
                                        battingTeamName={inning.teamName ? inning.teamName.replace('_', ' ') : 'Team'}
                                        currentOver={data.currentOver}
                                        ballInOver={data.ballInOver}
                                        fallOn={fallOn}
                                        playerFell={playerFell}
                                        target={inning.innings === 4 ? testTarget : null}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <>
                {/* Team 1 Card */}
                <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-600 mb-6 sm:mb-8 p-4 sm:p-6 md:p-8">
                    <div className="text-center mb-6">
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl inline-block mb-4">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">🏏 {state.team1?.replace('_', ' ')} 🏏</h2>
                        </div>
                        <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                            {state.team1_data.score}<span className="text-red-500">/{state.team1_data.wickets || 10}</span>
                        </div>
                        <div className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 font-semibold">
                            ⏰ Overs: <span className="text-blue-600">{state.team1_data.currentOver || 0}.{state.team1_data.ballInOver || 0}</span>
                        </div>
                    </div>

                    <Table striped={true} bordered={true} hover={true} className="w-full rounded-lg shadow-lg" style={{ fontSize: '16px' }}>
                        <thead className="thead-dark">
                            <tr>
                                <th scope="col" className="text-center py-3 px-4">#</th>
                                <th scope="col" className="text-center py-3 px-4">Players</th>
                                <th scope="col" className="text-center py-3 px-4">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {state.team1_data.scorelist.map((score, id) => {
                                const isCurrentBatsman = state.team1_data.current?.includes(id);
                                const isOut = state.team1_data.status?.[id] === 1;
                                const isStriker = id === state.team1_data.striker;
                                
                                return (
                                    <tr key={`team1-${id}`}
                                        className={`
                                            ${isOut ? 'table-danger' : isCurrentBatsman ? 'table-warning' : 'table-success'}
                                        `}
                                    >
                                        <th scope="row" className={`text-center py-3 px-4 ${isStriker ? 'font-bold text-lg' : 'font-semibold'}`}>
                                            {id + 1}
                                        </th>
                                        <td className={`text-center py-3 px-4 ${isStriker ? 'font-bold text-lg' : 'font-medium'}`}>
                                            {isStriker && '🏏 '}{state.team1_data.firstTeam?.[id] || state.team1_data.players?.[id] || 'Unknown'}
                                        </td>
                                        <td className={`text-center py-3 px-4 ${isStriker ? 'font-black text-xl' : 'font-bold'}`}>
                                            {score}
                                        </td>
                                    </tr>
                                );
                            })}
                            <tr className="bg-green-300">
                                <td></td>
                                <th className="py-3 px-4">Total Score</th>
                                <th className="py-3 px-4">{state.team1_data.score} / {state.team1_data.wickets || 10}</th>
                            </tr>
                            <tr className="bg-blue-100">
                                <td></td>
                                <th className="py-3 px-4">Overs</th>
                                <th className="py-3 px-4">{state.team1_data.currentOver || 0}.{state.team1_data.ballInOver || 0}</th>
                            </tr>
                        </tbody>
                    </Table>
                    
                    {/* Fall of Wickets */}
                    {state.team1_data.playerFell?.filter(data => data !== '').length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-xl font-bold text-red-700 mb-4 text-center">⚡ Fall of Wickets ⚡</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                {state.team1_data.playerFell.map((data, id) =>
                                    data !== '' ? (
                                        <div key={`team1-fell-${id}`} className="bg-gradient-to-r from-red-100 to-orange-100 p-3 rounded-xl border-2 border-red-200 text-center">
                                            <div className="text-sm font-bold text-red-700 mb-1">{data}</div>
                                            <div className="text-xs font-semibold text-red-600">
                                                {state.team1_data.fallOn[id]}/{id + 1}
                                            </div>
                                        </div>
                                    ) : null,
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Team 2 Card */}
                <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-600 mb-6 sm:mb-8 p-4 sm:p-6 md:p-8">
                    <div className="text-center mb-6">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl inline-block mb-4">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">🏏 {state.team2?.replace('_', ' ')} 🏏</h2>
                        </div>
                        <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                            {state.team2_data.score}<span className="text-red-500">/{state.team2_data.wickets}</span>
                        </div>
                        <div className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 font-semibold">
                            ⏰ Overs: <span className="text-blue-600">{state.team2_data.currentOver || 0}.{state.team2_data.ballInOver || 0}</span>
                        </div>
                    </div>

                    <Table striped={true} bordered={true} hover={true} className="w-full rounded-lg shadow-lg" style={{ fontSize: '16px' }}>
                        <thead className="thead-dark">
                            <tr>
                                <th scope="col" className="text-center py-3 px-4">#</th>
                                <th scope="col" className="text-center py-3 px-4">Players</th>
                                <th scope="col" className="text-center py-3 px-4">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {state.team2_data.scorelist.map((score, id) => {
                                const isCurrentBatsman = state.team2_data.current?.includes(id);
                                const isOut = state.team2_data.status?.[id] === 1;
                                const isStriker = id === state.team2_data.striker;
                                
                                return (
                                    <tr key={`team2-${id}`}
                                        className={`
                                            ${isOut ? 'table-danger' : isCurrentBatsman ? 'table-warning' : 'table-success'}
                                        `}
                                    >
                                        <th scope="row" className={`text-center py-3 px-4 ${isStriker ? 'font-bold text-lg' : 'font-semibold'}`}>
                                            {id + 1}
                                        </th>
                                        <td className={`text-center py-3 px-4 ${isStriker ? 'font-bold text-lg' : 'font-medium'}`}>
                                            {isStriker && '🏏 '}{state.team2_data.secondTeam?.[id] || state.team2_data.players?.[id] || 'Unknown'}
                                        </td>
                                        <td className={`text-center py-3 px-4 ${isStriker ? 'font-black text-xl' : 'font-bold'}`}>
                                            {score}
                                        </td>
                                    </tr>
                                );
                            })}
                            <tr className="bg-green-300">
                                <td></td>
                                <th className="py-3 px-4">Total Score</th>
                                <th className="py-3 px-4">{state.team2_data.score} / {state.team2_data.wickets}</th>
                            </tr>
                            <tr className="bg-blue-100">
                                <td></td>
                                <th className="py-3 px-4">Overs</th>
                                <th className="py-3 px-4">{state.team2_data.currentOver || 0}.{state.team2_data.ballInOver || 0}</th>
                            </tr>
                        </tbody>
                    </Table>
                    
                    {/* Fall of Wickets */}
                    {state.team2_data.playerFell?.filter(data => data !== '').length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-xl font-bold text-red-700 mb-4 text-center">⚡ Fall of Wickets ⚡</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                {state.team2_data.playerFell.map((data, id) =>
                                    data !== '' ? (
                                        <div key={`team2-fell-${id}`} className="bg-gradient-to-r from-red-100 to-orange-100 p-3 rounded-xl border-2 border-red-200 text-center">
                                            <div className="text-sm font-bold text-red-700 mb-1">{data}</div>
                                            <div className="text-xs font-semibold text-red-600">
                                                {state.team2_data.fallOn[id]}/{id + 1}
                                            </div>
                                        </div>
                                    ) : null,
                                )}
                            </div>
                        </div>
                    )}
                </div>
                    </>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-12 px-4">
                    <button 
                        onClick={() => saveToDb()}
                        disabled={saving}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl shadow-2xl border-2 border-green-300 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 text-base sm:text-lg md:text-xl disabled:transform-none"
                    >
                        {saving ? (
                            <>
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                Saving to History...
                            </>
                        ) : (
                            <>💾 Save Epic Match</>
                        )}
                    </button>
                    
                    <Link to="/history">
                        <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl shadow-2xl border-2 border-purple-300 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 text-base sm:text-lg md:text-xl w-full sm:w-auto">
                            📚 View All Matches
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Summary;
