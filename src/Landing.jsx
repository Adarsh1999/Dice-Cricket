import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import Teams from './Teams';
import CoinToss from './CoinToss';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
import { useStateValue } from './StateProvider';
import axios from './axios';
import cx from 'classnames';

function Landing() {
    const [team1Selected, setTeam1Selected] = useState('');
    const [times, setTimes] = useState(1);
    const [team2Selected, setTeam2Selected] = useState('');

    const [state, dispatch] = useStateValue();
    const [isTossed, setIsTossed] = useState(false);

    const login = () => {
        dispatch({
            type: 'SET_TEAM',
            team1: team1Selected,
            team2: team2Selected,
        });
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 to-white min-h-screen flex flex-col items-center">
            <div className="max-w-6xl w-full p-8 m-auto">
                <div className="text-center mb-4">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 leading-tight">
                        🏏 Welcome to Dice Cricket! 🎲
                    </h1>
                    <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-8"></div>
                    <p className="text-xl text-gray-600 font-medium">Choose your teams and let the dice decide your destiny!</p>
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

                <div className="flex flex-col sm:flex-row justify-center gap-5 mt-8">
                    <div className="bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 hover:border-red-500 px-6 py-3 text-xl font-bold rounded-2xl shadow-lg text-red-700 transform hover:scale-105 transition-all duration-300 cursor-pointer">
                        🪙 Heads
                    </div>
                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300 hover:border-blue-500 px-6 py-3 text-xl font-bold rounded-2xl shadow-lg text-blue-700 transform hover:scale-105 transition-all duration-300 cursor-pointer">
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
                        <div className="px-6 py-3 bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-semibold">
                            Select Team 1
                        </div>
                    )}
                    
                    <div className="flex items-center justify-center text-3xl font-bold text-gray-400">
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
                        <div className="px-6 py-3 bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-semibold">
                            Select Team 2
                        </div>
                    )}
                </div>
                <div className="mt-8 flex justify-center">
                    {isTossed ? (
                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 px-8 py-6 rounded-2xl shadow-lg text-center max-w-md">
                            <div className="text-3xl font-bold text-green-700 mb-3">🎉 Toss Result! 🎉</div>
                            <div className="text-lg font-semibold text-green-800 leading-relaxed">
                                🏏 <span className="font-bold text-green-900">{team1Selected.replace('_', ' ')}</span> won the toss and chose to bat first!
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 px-8 py-6 rounded-2xl text-center">
                            <div className="text-lg font-semibold text-gray-500">
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
