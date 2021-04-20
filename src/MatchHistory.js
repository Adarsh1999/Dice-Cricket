/* eslint-disable react/jsx-key */
import React, { useState, useEffect, useRef } from 'react';
import axios from './axios';
import { Link, BrowserRouter as Router, Route, useParams } from 'react-router-dom';
import Header from './Header';

// import Past from './Past';

// function Past() {
//     const { id } = useParams();
//     return <h2>User {id}</h2>;
// }
function MatchHistory() {
    const [matches, setMatches] = useState();
    const getMatches = async () => {
        const { data } = await axios.get('/history/all');
        console.log(data);
        setMatches(data);
    };
    const site = Math.floor(Math.random() * 10 + 1);
    console.log(site);
    const { id } = useParams();
    console.log(id);

    // try{
    //     const result=data.data.map(

    //     )
    // }
    useEffect(() => {
        getMatches();
    }, []);
    return (
        <div>
            <Header />
            <h2 className="mt-4 mb-6 text-center">All matches ever played</h2>

            <div>
                {matches ? (
                    matches.map((score, id) => (
                        <Link
                            to={{
                                pathname: `/history/${score._id}`,
                                // Team_batting_first: team1Selected,
                                // Team_batting_next: team2Selected,
                            }}
                        >
                            <div className="flex flex-col items-center">
                                <div className="bg-lightBlue-300 w-3/4 m-4 font-semibold text-center shadow-md">
                                    {score.team1} vs {score.team2}
                                    <br></br>
                                    {score.result}
                                    {/* <br></br>
                                    {score._id} */}
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <h1>loading</h1>
                )}
            </div>
        </div>
    );
}

export default MatchHistory;
