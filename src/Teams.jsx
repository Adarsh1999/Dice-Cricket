/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { useState, useEffect, useRef } from 'react';

function Teams(params) {
    // params.setdemo("from the child")

    return (
        <div className="sm:flex-row sm:justify-around flex flex-col w-full mt-10">
            <button
                className="btn btn-secondary w-full sm:w-1/5 mb-2 sm:mb-0 sm:mr-2"
                onClick={() => {
                    if (params.times === 1) {
                        params.setTeam1Selected('Australia');
                        params.setTimes(2);
                    }
                    if (params.times === 2) {
                        params.setTeam2Selected('Australia');
                    }
                }}
                disabled={params.team1Selected === 'Australia' ? true : false}
            >
                Australia
            </button>
            <button
                className="btn btn-primary w-full sm:w-1/5 mb-2 sm:mb-0 sm:mr-2"
                // disabled={(wickets)=>wickets===10?false:true}
                onClick={() => {
                    if (params.times === 1) {
                        params.setTeam1Selected('England');
                        params.setTimes(2);
                    }
                    if (params.times === 2) {
                        params.setTeam2Selected('England');
                    }
                }}
                disabled={params.team1Selected === 'England' ? true : false}
            >
                England
            </button>

            <button
                className="btn btn-accent w-full sm:w-1/5 mb-2 sm:mb-0 sm:mr-2"
                // disabled={(wickets)=>wickets===10?false:true}
                onClick={() => {
                    if (params.times === 1) {
                        params.setTeam1Selected('India');
                        params.setTimes(2);
                    }
                    if (params.times === 2) {
                        params.setTeam2Selected('India');
                    }
                }}
                disabled={params.team1Selected === 'India' ? true : false}
            >
                India
            </button>

            <button
                // disabled={(wickets)=>wickets===10?false:true}
                className="btn btn-neutral w-full sm:w-1/5 mb-2 sm:mb-0"
                onClick={() => {
                    if (params.times === 1) {
                        params.setTeam1Selected('New_Zealand');
                        params.setTimes(2);
                    }
                    if (params.times === 2) {
                        params.setTeam2Selected('New_Zealand');
                    }
                }}
                disabled={params.team1Selected === 'New_Zealand' ? true : false}
            >
                New_Zealand
            </button>
        </div>
    );
}

export default Teams;
