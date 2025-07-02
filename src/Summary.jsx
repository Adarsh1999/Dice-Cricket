/* eslint-disable react/jsx-key */
import React, { useState, useEffect, useRef } from 'react';
import { useStateValue } from './StateProvider';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from 'react-bootstrap/Table';
import Header from './Header';
import axios from './axios';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

function Summary() {
    const [state, dispatch] = useStateValue();
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    console.log(state);

    const saveToDb = async () => {
        try {
            setSaving(true);
            setSaveStatus(null);
            
            // Transform data to match backend schema
            const gameData = {
                ...state,
                team1_data: {
                    ...state.team1_data,
                    // Map firstTeam to players if needed
                    players: state.team1_data.players || state.team1_data.firstTeam || []
                },
                team2_data: {
                    ...state.team2_data,
                    // Map secondTeam to players if needed  
                    players: state.team2_data.players || state.team2_data.secondTeam || []
                }
            };

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
        <div className="flex flex-col items-center w-full">
            <div className="w-screen mb-6">
                <Header />
            </div>
            
            {/* Save Status Messages */}
            {saveStatus === 'success' && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Game saved successfully!
                </div>
            )}
            {saveStatus === 'error' && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    Failed to save game. Please try again.
                </div>
            )}

            <h1 className="w-50 flex justify-center text-xl text-red-600 bg-yellow-300 rounded-md shadow-md">
                {state.team1}
            </h1>

            <Table striped={true} bordered={true} hover={true} size={'sm'} className="w-50 mt-2 shadow-lg">
                <thead className="thead-dark">
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Players</th>
                        <th scope="col">Score</th>
                    </tr>
                </thead>

                <tbody>
                    {state.team1_data.scorelist.map((score, id) => (
                        <tr
                            key={`team1-${id}`} // Added unique key
                            className={`table-success ${(() => {
                                return state.team1_data.current.includes(id) && 'table-warning';
                            })()} ${(() => {
                                return state.team1_data.status[id] === 1 && 'table-danger';
                            })()} ${id === state.team1_data.striker && 'custom'}`}
                        >
                            <th scope="row">{id}</th>
                            <td>{state.team1_data.firstTeam?.[id] || state.team1_data.players?.[id] || 'Unknown'}</td>
                            <td>{score}</td>
                        </tr>
                    ))}
                    <tr className="bg-green-300">
                        <td></td>
                        <th>Total Score</th>
                        <th>{state.team1_data.score} / 10</th>
                    </tr>
                </tbody>
            </Table>
            
            <div className="flex flex-row">
                <div className="text-gray-50 p-1 ml-6 mr-3 font-semibold bg-gray-700 rounded-lg">Fall of Wickets: </div>
                {state.team1_data.playerFell.map((data, id) =>
                    id <= 5 && data !== '' ? (
                        <React.Fragment key={`team1-fell-${id}`}> {/* Added key */}
                            <div className="p-1 mr-3 font-semibold bg-blue-100 rounded-lg">{data}</div>
                            <div className="mr-3 font-semibold">
                                {state.team1_data.fallOn[id]}/{id + 1}
                            </div>
                        </React.Fragment>
                    ) : null,
                )}
            </div>
            <div className="flex flex-row mt-3 mb-4 ml-8">
                <div className="mr-3"> </div>
                {state.team1_data.playerFell.map((data, id) =>
                    id > 5 && data !== '' ? (
                        <React.Fragment key={`team1-fell-late-${id}`}> {/* Added key */}
                            <div className="p-1 mr-3 font-semibold bg-blue-100 rounded-lg">{data}</div>
                            <div className="mr-3 font-semibold">
                                {state.team1_data.fallOn[id]}/{id + 1}
                            </div>
                        </React.Fragment>
                    ) : null,
                )}
            </div>

            <h1 className="w-50 flex justify-center mt-20 text-xl text-red-600 bg-yellow-300 rounded-md shadow-md">
                {state.team2}
            </h1>
            <Table striped={true} bordered={true} hover={true} size={'sm'} className="w-50 mt-2 shadow-lg">
                <thead className="thead-dark">
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Players</th>
                        <th scope="col">Score</th>
                    </tr>
                </thead>

                <tbody>
                    {state.team2_data.scorelist.map((score, id) => (
                        <tr
                            key={`team2-${id}`} // Added unique key
                            className={`table-success ${(() => {
                                return state.team2_data.current.includes(id) && 'table-warning';
                            })()} ${(() => {
                                return state.team2_data.status[id] === 1 && 'table-danger';
                            })()} ${id === state.team2_data.striker && 'custom'}`}
                        >
                            <th scope="row">{id}</th>
                            <td>{state.team2_data.secondTeam?.[id] || state.team2_data.players?.[id] || 'Unknown'}</td>
                            <td>{score}</td>
                        </tr>
                    ))}
                    <tr className="bg-green-300">
                        <td></td>
                        <th>Total Score</th>
                        <th>
                            {state.team2_data.score} / {state.team2_data.wickets}
                        </th>
                    </tr>
                </tbody>
            </Table>
            
            <div className="flex flex-row">
                <div className="text-gray-50 p-1 ml-6 mr-3 font-semibold bg-gray-700 rounded-lg">Fall of Wickets: </div>
                {state.team2_data.playerFell.map((data, id) =>
                    id <= 5 && data !== '' ? (
                        <React.Fragment key={`team2-fell-${id}`}> {/* Added key */}
                            <div className="p-1 mr-3 font-semibold bg-blue-100 rounded-lg">{data}</div>
                            <div className="mr-3 font-semibold">
                                {state.team2_data.fallOn[id]}/{id + 1}
                            </div>
                        </React.Fragment>
                    ) : null,
                )}
            </div>
            <div className="flex flex-row mt-3 mb-4 ml-8">
                <div className="mr-3"> </div>
                {state.team2_data.playerFell.map((data, id) =>
                    id > 5 && data !== '' ? (
                        <React.Fragment key={`team2-fell-late-${id}`}> {/* Added key */}
                            <div className="p-1 mr-3 font-semibold bg-blue-100 rounded-lg">{data}</div>
                            <div className="mr-3 font-semibold">
                                {state.team2_data.fallOn[id]}/{id + 1}
                            </div>
                        </React.Fragment>
                    ) : null,
                )}
            </div>
            
            <h2 className="rounded-2xl p-3 text-gray-100 bg-blue-700 shadow-lg">{state.result}</h2>

            <div className="flex justify-around w-full mt-4 mb-4">
                <Button 
                    variant="primary" 
                    onClick={() => saveToDb()}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save to DB'}
                </Button>
                <Link to="/history">
                    <Button variant="contained" color="primary">
                        ALL matches
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default Summary;