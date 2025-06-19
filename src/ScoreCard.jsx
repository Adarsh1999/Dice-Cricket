/* eslint-disable react/jsx-key */
/* eslint-disable react/prop-types */
import React from 'react';
import Table from 'react-bootstrap/Table';
import './ScoreCard.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'tailwindcss/tailwind.css'; // Import tailwind CSS

function ScoreCard({
    scorelist,
    current,
    status,
    striker,
    firstTeam,
    secondTeam,
    innings,
    team1Score,
    team2Score,
    team2wic,
}) {
    return (
        <div className="scorecard">
            <Table
                striped={true}
                bordered={true}
                hover={true}
                size={'sm'}
                className="sm:w-full w-50 rounded-md shadow-lg"
            >
                <thead className="thead-dark">
                    <tr>
                        <th scope="col" className="text-center">
                            #
                        </th>
                        <th scope="col" className="text-center">
                            Players
                        </th>
                        <th scope="col" className="text-center">
                            Score
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {scorelist.map((score, id) => (
                        <tr
                            className={`table-success ${(() => {
                                return current.includes(id) && 'table-warning';
                            })()} ${(() => {
                                return status[id] === 1 && 'table-danger';
                            })()} ${id === striker && 'custom'}`}
                        >
                            <th scope="row" className="text-center">
                                {id + 1}
                            </th>
                            <td className=" text-center">{innings === 1 ? firstTeam[id] : secondTeam[id]}</td>
                            <td className="text-center">{score}</td>
                        </tr>
                    ))}
                    {team1Score && innings === 1 ? (
                        <tr className="bg-green-300">
                            <td></td>
                            <th>Total Score</th>
                            <th>{team1Score} / 10</th>
                        </tr>
                    ) : null}
                    {team2Score && innings === 2 ? (
                        <tr className="bg-green-300">
                            <td></td>
                            <th>Total Score</th>
                            <th>
                                {team2Score} / {team2wic}
                            </th>
                        </tr>
                    ) : null}
                </tbody>
            </Table>
        </div>
    );
}

export default ScoreCard;
