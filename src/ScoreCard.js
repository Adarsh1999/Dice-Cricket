/* eslint-disable react/jsx-key */
/* eslint-disable react/prop-types */
import React from 'react';
import Table from 'react-bootstrap/Table';
import './ScoreCard.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function ScoreCard({ scorelist, current, status, striker, firstTeam, secondTeam, innings }) {
    return (
        <div className="scorecard">
            {/* <div className='scorecard__header'>

            
            </div> */}
            {/* <div className="scorecard__list">

            
            
        </div> */}

            <Table striped={true} bordered={true} hover={true} size={'sm'} className="w-50 sm:w-full">
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
                                // console.log(id, current.includes(id) && 'table-warning', 'hola');
                                return current.includes(id) && 'table-warning';
                            })()} ${(() => {
                                // console.log(status[id] === 1 && 'table-danger', id, 'danger bro', status);
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
                </tbody>
            </Table>
        </div>
    );
}

export default ScoreCard;
