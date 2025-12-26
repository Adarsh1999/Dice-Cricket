import React, { useState, useEffect } from 'react';
import axios from './axios';
import { Link } from 'react-router-dom';
import Header from './Header';

function MatchHistory() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true); // State to handle loading
    const [error, setError] = useState(null); // State to handle errors

    useEffect(() => {
        const getMatches = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get('/history');
                console.log('API Response:', data);

                if (data.success) {
                    setMatches(data.data || []);
                } else {
                    // Handle cases where the API returns a non-success response
                    setError('Failed to fetch match history.');
                    setMatches([]);
                }
            } catch (err) {
                console.error('Failed to fetch history', err);
                setError('An error occurred while fetching data.');
            } finally {
                setLoading(false);
            }
        };

        getMatches();
    }, []); // Empty dependency array ensures this runs only once on mount

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <Header />
                <h2 className="mt-4 mb-6 text-center text-gray-700 dark:text-gray-200">Loading...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <Header />
                <h2 className="mt-4 mb-6 text-center text-red-500">{error}</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <Header />
            <div className="flex flex-col items-center mt-6 mb-8">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    🏆 Match Archive 🏆
                </h2>
                <div className="w-40 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-2"></div>
                <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Relive the greatest cricket moments</p>
            </div>
            <div>
                {matches.length > 0 ? (
                    matches.map((score) => (
                        <Link
                            key={score._id} // Added unique key prop
                            to={`/history/${score._id}`}
                        >
                            <div className="flex flex-col items-center">
                                <div className="w-3/4 m-4 font-semibold text-center shadow-xl p-6 rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 bg-gray-800 border-2 border-gray-700">
                                    <div className="text-2xl font-bold mb-3 text-white">
                                        🏏 {score.team1} vs {score.team2} 🏏
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="p-3 rounded-xl border bg-red-900 border-red-700">
                                            <div className="text-sm font-bold mb-1 text-red-200">{score.team1}</div>
                                            <div className="text-lg font-bold text-white">
                                                {score.team1_data?.score || 0}/{score.team1_data?.wickets || 0}
                                            </div>
                                            <div className="text-xs text-red-300">
                                                ⏰ {score.team1_data?.currentOver || 0}.{score.team1_data?.ballInOver || 0} overs
                                            </div>
                                        </div>
                                        
                                        <div className="p-3 rounded-xl border bg-blue-900 border-blue-700">
                                            <div className="text-sm font-bold mb-1 text-blue-200">{score.team2}</div>
                                            <div className="text-lg font-bold text-white">
                                                {score.team2_data?.score || 0}/{score.team2_data?.wickets || 0}
                                            </div>
                                            <div className="text-xs text-blue-300">
                                                ⏰ {score.team2_data?.currentOver || 0}.{score.team2_data?.ballInOver || 0} overs
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                                        🎉 {score.result}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="flex flex-col items-center mt-12">
                        <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-8 rounded-2xl shadow-lg border border-gray-300 dark:border-gray-600">
                            <div className="text-6xl mb-4 text-center">🏏</div>
                            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2 text-center">No Matches Yet</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-center">Start playing to create your cricket history!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MatchHistory;