/* eslint-disable react/jsx-key */
import React, { useState, useEffect, useRef } from 'react';
import { useStateValue } from './StateProvider';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from 'react-bootstrap/Table';
import Header from './Header';
import axios from './axios';
import { Button } from '@material-ui/core';
import { Link } from 'react-router-dom';


function Summary() {
    const [state, dispatch] = useStateValue();

    console.log(state);

    const saveToDb = async () => {
        const status = await axios.post('/history/new', state);
        console.log(status);
    };
    return (
        <div className="flex flex-col items-center w-full">
            <Header />

            <h1 className="w-50 flex justify-center text-xl text-red-600 bg-yellow-300">{state.team1}</h1>

            <Table striped={true} bordered={true} hover={true} size={'sm'} className="w-50 mt-2">
                <thead className="thead-dark">
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Players</th>
                        <th scope="col">Score</th>
                    </tr>
                </thead>

                <tbody>
                    {state.team1_data.scorelist.map((score, id) => (
                        // eslint-disable-next-line react/jsx-key

                        <tr
                            className={`table-success ${(() => {
                                // console.log(id, state.team1_data.current.includes(id) && 'table-warning', 'hola');
                                return state.team1_data.current.includes(id) && 'table-warning';
                            })()} ${(() => {
                                // console.log(
                                //     state.team1_data.status[id] === 1 && 'table-danger',
                                //     id,
                                //     'danger bro',
                                //     state.team1_data.status,
                                // );
                                return state.team1_data.status[id] === 1 && 'table-danger';
                            })()} ${id === state.team1_data.striker && 'custom'}`}
                        >
                            <th scope="row">{id}</th>
                            <td>{state.team1_data.firstTeam[id]}</td>
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

            <h1 className="w-50 flex justify-center mt-20 text-xl text-red-600 bg-yellow-300">{state.team2}</h1>
            <Table striped={true} bordered={true} hover={true} size={'sm'} className="w-50 mt-2">
                <thead className="thead-dark">
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Players</th>
                        <th scope="col">Score</th>
                    </tr>
                </thead>

                <tbody>
                    {state.team2_data.scorelist.map((score, id) => (
                        // eslint-disable-next-line react/jsx-key

                        <tr
                            className={`table-success ${(() => {
                                // console.log(id, state.team1_data.current.includes(id) && 'table-warning', 'hola');
                                return state.team2_data.current.includes(id) && 'table-warning';
                            })()} ${(() => {
                                // console.log(
                                //     state.team1_data.status[id] === 1 && 'table-danger',
                                //     id,
                                //     'danger bro',
                                //     state.team1_data.status,
                                // );
                                return state.team2_data.status[id] === 1 && 'table-danger';
                            })()} ${id === state.team2_data.striker && 'custom'}`}
                        >
                            <th scope="row">{id}</th>
                            <td>{state.team2_data.secondTeam[id]}</td>
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
            <h2 className="p-4 text-yellow-400 bg-purple-400">{state.result}</h2>

            <div className="flex justify-between">
                <Button variant="outlined" color="primary" onClick={() => saveToDb()}>
                    Save to DB
                </Button>
                <Link
                    to={{
                        pathname: '/history',
                    }}
                >
                    <Button
                        variant="outlined"
                        color="primary"
                        // className="flex justify-center"
                    >
                        ALL matches
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default Summary;
