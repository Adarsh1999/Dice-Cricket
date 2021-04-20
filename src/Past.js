import { match } from 'assert';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Link, BrowserRouter as Router, Route } from 'react-router-dom';
import ScoreCard from './ScoreCard';
import axios from './axios';
import Header from './Header';

function Past() {
    const [detail, setDetail] = useState();
    const { id } = useParams();
    const getMatch = async () => {
        const to_send = {
            id: `${id}`,
        };
        const { data } = await axios.post('/history/find', to_send);
        console.log(data[0]);
        setDetail(data[0]);
    };
    useEffect(() => {
        getMatch();
    }, []);
    // console.log(detail.team1_data);
    return (
        <div>
            <Header />
            <h2 className="mt-4 mb-6 text-center">Match History</h2>
            <div>
                {detail ? (
                    <div>
                        <div className="sm:w-screen flex flex-col items-center -mb-24">
                            <h1 className="w-50 text-xl text-red-600 bg-yellow-300 rounded-md shadow-md">
                                {detail.team1}
                            </h1>
                        </div>
                        <ScoreCard
                            scorelist={detail.team1_data.scorelist}
                            current={detail.team1_data.current}
                            status={detail.team1_data.status}
                            striker={detail.team1_data.striker}
                            firstTeam={detail.team1_data.firstTeam}
                            secondTeam={detail.team1_data.secondTeam}
                            team1Score={detail.team1_data.score}
                            innings={1}
                        />

                        <div className="flex flex-col items-center w-full">
                            <div className=" flex flex-row">
                                {' '}
                                <div className="text-gray-50 p-1 ml-6 mr-3 font-semibold bg-gray-700 rounded-lg">
                                    Fall of Wickets:{' '}
                                </div>
                                {detail.team1_data.playerFell.map((data, id) =>
                                    id <= 5 && data !== '' ? (
                                        <>
                                            <div className=" p-1 mr-3 font-semibold bg-blue-100 rounded-lg">{data}</div>
                                            <div className="mr-3 font-semibold">
                                                {detail.team1_data.fallOn[id]}/{id + 1}
                                            </div>
                                        </>
                                    ) : null,
                                )}
                            </div>
                            <div className="flex flex-row mt-3 mb-4 ml-8">
                                {' '}
                                <div className="mr-3"> </div>
                                {detail.team1_data.playerFell.map((data, id) =>
                                    id > 5 && data !== '' ? (
                                        <>
                                            <div className="p-1 mr-3 font-semibold bg-blue-100 rounded-lg">{data}</div>
                                            <div className="mr-3 font-semibold">
                                                {detail.team1_data.fallOn[id]}/{id + 1}
                                            </div>
                                        </>
                                    ) : null,
                                )}
                            </div>
                        </div>

                        <div className="sm:w-screen flex flex-col items-center -mb-24">
                            <h1 className="w-50 text-xl text-red-600 bg-yellow-300 rounded-md shadow-md">
                                {detail.team2}
                            </h1>
                        </div>
                        <ScoreCard
                            scorelist={detail.team2_data.scorelist}
                            current={detail.team2_data.current}
                            status={detail.team2_data.status}
                            striker={detail.team2_data.striker}
                            firstTeam={detail.team2_data.firstTeam}
                            secondTeam={detail.team2_data.secondTeam}
                            innings={2}
                            team2Score={detail.team2_data.score}
                            team2wic={detail.team2_data.wickets}
                        />
                        <div className="flex flex-col items-center w-full">
                            <div className=" flex flex-row">
                                {' '}
                                <div className="text-gray-50 p-1 ml-6 mr-3 font-semibold bg-gray-700 rounded-lg">
                                    Fall of Wickets:{' '}
                                </div>
                                {detail.team2_data.playerFell.map((data, id) =>
                                    id <= 5 && data !== '' ? (
                                        <>
                                            <div className=" p-1 mr-3 font-semibold bg-blue-100 rounded-lg">{data}</div>
                                            <div className="mr-3 font-semibold">
                                                {detail.team2_data.fallOn[id]}/{id + 1}
                                            </div>
                                        </>
                                    ) : null,
                                )}
                            </div>
                            <div className="flex flex-row mt-3 mb-4 ml-8">
                                {' '}
                                <div className="mr-3"> </div>
                                {detail.team2_data.playerFell.map((data, id) =>
                                    id > 5 && data !== '' ? (
                                        <>
                                            <div className="p-1 mr-3 font-semibold bg-blue-100 rounded-lg">{data}</div>
                                            <div className="mr-3 font-semibold">
                                                {detail.team2_data.fallOn[id]}/{id + 1}
                                            </div>
                                        </>
                                    ) : null,
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <h2 className="p-4 text-gray-100 bg-blue-700 rounded-lg shadow-lg">{detail.result}</h2>
                        </div>
                    </div>
                ) : (
                    <h1 className=" w-full h-full m-12 text-center">Loading</h1>
                )}
            </div>
        </div>
    );
}

export default Past;
