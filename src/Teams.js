/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { useState, useEffect, useRef } from 'react';

import { Button } from '@material-ui/core';

function Teams(params) {
    // params.setdemo("from the child")

    return (
        <div className="teams">
            <Button
                variant="outlined"
                color="primary"
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
            </Button>
            <Button
                variant="outlined"
                color="primary"
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
            </Button>

            <Button
                variant="outlined"
                color="primary"
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
            </Button>

            <Button
                variant="outlined"
                color="primary"
                // disabled={(wickets)=>wickets===10?false:true}
                onClick={() => {
                    if (params.times === 1) {
                        params.setTeam1Selected('New Zealand');
                        params.setTimes(2);
                    }
                    if (params.times === 2) {
                        params.setTeam2Selected('New Zealand');
                    }
                }}
                disabled={params.team1Selected === 'New Zealand' ? true : false}
            >
                New Zealand
            </Button>
            <br />
        </div>
    );
}

export default Teams;
