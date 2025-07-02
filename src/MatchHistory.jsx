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
            <div>
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
            <h2 className="mt-4 mb-6 text-center">All matches ever played</h2>
            <div>
                {matches.length > 0 ? (
                    matches.map((score) => (
                        <Link
                            key={score._id} // Added unique key prop
                            to={`/history/${score._id}`}
                        >
                            <div className="flex flex-col items-center">
                                <div className="bg-sky-300 w-3/4 m-4 font-semibold text-center shadow-md">
                                    {score.team1} vs {score.team2}
                                    <br />
                                    {score.result}
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className="text-center">No matches found.</p>
                )}
            </div>
        </div>
    );
}

export default MatchHistory;