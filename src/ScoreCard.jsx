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
    players, // Add players prop as fallback
    currentOver, // Add over props
    ballInOver,
}) {
    // Helper function to get player name with multiple fallbacks
    const getPlayerName = (id) => {
        let playerName = '';
        
        if (innings === 1) {
            // For team 1, try multiple sources
            playerName = firstTeam?.[id] || players?.[id] || '';
        } else {
            // For team 2, try multiple sources  
            playerName = secondTeam?.[id] || players?.[id] || '';
        }
        
        // If still empty, provide a fallback
        if (!playerName || playerName === '') {
            playerName = `Player ${id + 1}`;
        }
        
        return playerName;
    };

    // Debug logging for the first render
    React.useEffect(() => {
        console.log('ScoreCard props:', {
            innings,
            firstTeam,
            secondTeam,
            players,
            scorelist: scorelist?.length
        });
    }, [innings, firstTeam, secondTeam, players, scorelist]);

    return (
        <div className="scorecard">
            <Table
                striped={true}
                bordered={true}
                hover={true}
                className="w-full rounded-lg shadow-lg"
                style={{ fontSize: '16px' }}
            >
                <thead className="thead-dark">
                    <tr>
                        <th scope="col" className="text-center py-3 px-4">
                            #
                        </th>
                        <th scope="col" className="text-center py-3 px-4">
                            Players
                        </th>
                        <th scope="col" className="text-center py-3 px-4">
                            Score
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {scorelist && scorelist.map((score, id) => {
                        const isCurrentBatsman = current && current.includes(id);
                        const isOut = status && status[id] === 1;
                        const isStriker = id === striker;
                        
                        return (
                            <tr key={id}
                                className={`
                                    ${isOut ? 'table-danger' : isCurrentBatsman ? 'table-warning' : 'table-success'}
                                `}
                            >
                                <th scope="row" className={`text-center py-3 px-4 ${isStriker ? 'font-bold text-lg' : 'font-semibold'}`}>
                                    {id + 1}
                                </th>
                                <td className={`text-center py-3 px-4 ${isStriker ? 'font-bold text-lg' : 'font-medium'}`}>
                                    {isStriker && '🏏 '}{getPlayerName(id)}
                                </td>
                                <td className={`text-center py-3 px-4 ${isStriker ? 'font-black text-xl' : 'font-bold'}`}>
                                    {score}
                                </td>
                            </tr>
                        );
                    })}
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
                    {(currentOver !== undefined || ballInOver !== undefined) && (
                        <tr className="bg-blue-100">
                            <td></td>
                            <th>Overs</th>
                            <th>{currentOver || 0}.{ballInOver || 0}</th>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
}

export default ScoreCard;
