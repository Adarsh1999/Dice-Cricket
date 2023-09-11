/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { useState, useEffect, useRef } from 'react';

function Teams(params) {
    // params.setdemo("from the child")

    return (
        <div className="sm:flex-row sm:justify-around flex flex-col w-full mt-10">
            <button
                className="hover:bg-yellow-700 focus:outline-none disabled:opacity-50 sm:w-1/6 sm:mb-0 sm:mr-2 w-full px-4 py-2 mb-2 font-semibold text-white bg-yellow-500 rounded-lg shadow-md"
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
                className="hover:bg-blue-700 focus:outline-none disabled:opacity-50 sm:w-1/6 sm:mb-0 sm:mr-2 w-full px-4 py-2 mb-2 font-semibold text-white bg-blue-400 rounded-lg shadow-md"
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
                className="hover:bg-orange-700 focus:outline-none disabled:opacity-50 sm:w-1/6 sm:mb-0 sm:mr-2 w-full px-4 py-2 mb-2 font-semibold text-white bg-orange-500 rounded-lg shadow-md"
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
                className="hover:bg-black focus:outline-none disabled:opacity-50 sm:w-1/6 sm:mb-0 sm:mr-2 w-full px-4 py-2 mb-2 font-semibold text-white bg-gray-700 rounded-lg shadow-md"
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
