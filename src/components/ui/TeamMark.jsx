import React from 'react';
import { getTeam } from '../../data/teams';

function TeamMark({ teamId, size = 'medium', showName = false, className = '' }) {
    const team = getTeam(teamId);

    return (
        <span className={`team-identity ${className}`}>
            <span
                aria-label={`${team.name} team mark`}
                className={`team-mark team-mark--${size}`}
                style={{
                    '--team-primary': team.primary,
                    '--team-secondary': team.secondary,
                }}
            >
                {team.code}
            </span>
            {showName && <span className="team-identity__name">{team.name}</span>}
        </span>
    );
}

export default TeamMark;
