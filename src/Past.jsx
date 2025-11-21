import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Link, BrowserRouter as Router, Route } from 'react-router-dom';
import ScoreCard from './ScoreCard';
import axios from './axios';
import Header from './Header';

function Past() {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    
    const getMatch = async () => {
        try {
            setLoading(true);
            const to_send = {
                id: `${id}`,
            };
            const { data } = await axios.post('/history/find', to_send);
            console.log('API Response:', data);
            
            if (data.success) {
                console.log('Game data:', data.data);
                console.log('Team1 data structure:', data.data.team1_data);
                console.log('Team2 data structure:', data.data.team2_data);
                
                // Debug player data specifically
                if (data.data.team1_data) {
                    console.log('Team1 firstTeam:', data.data.team1_data.firstTeam);
                    console.log('Team1 secondTeam:', data.data.team1_data.secondTeam);
                    console.log('Team1 players:', data.data.team1_data.players);
                }
                if (data.data.team2_data) {
                    console.log('Team2 firstTeam:', data.data.team2_data.firstTeam);
                    console.log('Team2 secondTeam:', data.data.team2_data.secondTeam);
                    console.log('Team2 players:', data.data.team2_data.players);
                }
                
                setDetail(data.data); // Changed from data[0] to data.data
            } else {
                setError('Failed to fetch match details');
            }
        } catch (err) {
            console.error('Failed to fetch match details', err);
            setError('An error occurred while fetching match details');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        getMatch();
    }, [id]); // Added id as dependency
    
    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 pb-16">
                <Header />
                <h2 className="mt-4 mb-6 text-center">Loading...</h2>
            </div>
        );
    }
    
    if (error) {
        return (
            <div>
                <Header />
                <h2 className="mt-4 mb-6 text-center text-red-500">{error}</h2>
            </div>
        );
    }
    
    return (
        <div>
            <Header />
            <div className="flex flex-col items-center mt-6 mb-8">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    📊 Match History 📊
                </h2>
                <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </div>
            <div>
                {detail ? (
                    <div>
                        <div className="flex flex-col items-center mb-8">
                            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-3 rounded-2xl shadow-xl border-2 border-red-300 mb-3">
                                <h1 className="text-2xl font-bold text-center tracking-wide drop-shadow-lg">
                                    🏏 {detail.team1} 🏏
                                </h1>
                            </div>
                            <div className="bg-white px-4 py-2 rounded-lg shadow-md border border-gray-200">
                                <div className="text-sm font-bold text-gray-700">
                                    📊 Score: <span className="text-blue-600">{detail.team1_data.score}/{detail.team1_data.wickets}</span> | 
                                    ⏰ Overs: <span className="text-green-600">{detail.team1_data.currentOver || 0}.{detail.team1_data.ballInOver || 0}</span>
                                </div>
                            </div>
                        </div>
                        <div className="max-w-5xl mx-auto px-2 sm:px-4 mb-10">
                            <ScoreCard
                                scorelist={detail.team1_data.scorelist}
                                current={detail.team1_data.current}
                                status={detail.team1_data.status}
                                striker={detail.team1_data.striker}
                                firstTeam={detail.team1_data.firstTeam}
                                secondTeam={detail.team1_data.secondTeam}
                                players={detail.team1_data.players}
                                team1Score={detail.team1_data.score}
                                innings={1}
                                currentOver={detail.team1_data.currentOver}
                                ballInOver={detail.team1_data.ballInOver}
                            />
                        </div>

                        <div className="flex flex-col items-start w-full max-w-5xl mx-auto px-2 sm:px-4 mb-12">
                            <div className="text-gray-800 p-2 mb-2 font-semibold bg-gray-100 rounded-lg border border-gray-200">
                                Fall of Wickets
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {detail.team1_data.playerFell.map((data, id) =>
                                    data !== '' ? (
                                        <div key={id} className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-100 border border-blue-200 text-sm font-semibold">
                                            <span>{data}</span>
                                            <span className="text-gray-700">{detail.team1_data.fallOn[id]}/{id + 1}</span>
                                        </div>
                                    ) : null,
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-center mb-8">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-3 rounded-2xl shadow-xl border-2 border-blue-300 mb-3">
                                <h1 className="text-2xl font-bold text-center tracking-wide drop-shadow-lg">
                                    🏏 {detail.team2} 🏏
                                </h1>
                            </div>
                            <div className="bg-white px-4 py-2 rounded-lg shadow-md border border-gray-200">
                                <div className="text-sm font-bold text-gray-700">
                                    📊 Score: <span className="text-blue-600">{detail.team2_data.score}/{detail.team2_data.wickets}</span> | 
                                    ⏰ Overs: <span className="text-green-600">{detail.team2_data.currentOver || 0}.{detail.team2_data.ballInOver || 0}</span>
                                </div>
                            </div>
                        </div>
                        <div className="max-w-5xl mx-auto px-2 sm:px-4 mb-10">
                            <ScoreCard
                                scorelist={detail.team2_data.scorelist}
                                current={detail.team2_data.current}
                                status={detail.team2_data.status}
                                striker={detail.team2_data.striker}
                                firstTeam={detail.team2_data.firstTeam}
                                secondTeam={detail.team2_data.secondTeam}
                                players={detail.team2_data.players}
                                innings={2}
                                team2Score={detail.team2_data.score}
                                team2wic={detail.team2_data.wickets}
                                currentOver={detail.team2_data.currentOver}
                                ballInOver={detail.team2_data.ballInOver}
                            />
                        </div>
                        <div className="flex flex-col items-start w-full max-w-5xl mx-auto px-2 sm:px-4 mb-12">
                            <div className="text-gray-800 p-2 mb-2 font-semibold bg-gray-100 rounded-lg border border-gray-200">
                                Fall of Wickets
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {detail.team2_data.playerFell.map((data, id) =>
                                    data !== '' ? (
                                        <div key={id} className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-100 border border-blue-200 text-sm font-semibold">
                                            <span>{data}</span>
                                            <span className="text-gray-700">{detail.team2_data.fallOn[id]}/{id + 1}</span>
                                        </div>
                                    ) : null,
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-center mt-8">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl border-2 border-green-300 transform hover:scale-105 transition-all duration-300">
                                <h2 className="text-2xl font-bold text-center tracking-wide drop-shadow-lg">
                                    🏆 {detail.result} 🏆
                                </h2>
                            </div>
                        </div>
                    </div>
                ) : (
                    <h1 className=" w-full h-full m-12 text-center">No match details found</h1>
                )}
            </div>
        </div>
    );
}

export default Past;
