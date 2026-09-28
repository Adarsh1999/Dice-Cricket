import React from 'react';
import { TEAMS } from '../../data/teams';
import Icon from '../ui/Icon';
import TeamMark from '../ui/TeamMark';

function TeamSelector({ team1, team2, onSelect }) {
    return (
        <div className="team-selector" role="group" aria-label="Choose two teams">
            {TEAMS.map((team) => {
                const slot = team1 === team.id ? 1 : team2 === team.id ? 2 : null;

                return (
                    <button
                        aria-pressed={Boolean(slot)}
                        className={`team-option ${slot ? 'team-option--selected' : ''}`}
                        key={team.id}
                        onClick={() => onSelect(team.id)}
                        style={{
                            '--team-primary': team.primary,
                            '--team-secondary': team.secondary,
                        }}
                        type="button"
                    >
                        <TeamMark size="small" teamId={team.id} />
                        <span className="team-option__copy">
                            <strong>{team.name}</strong>
                            <small>{slot ? `Selected as Team ${slot}` : 'Available squad'}</small>
                        </span>
                        <span className="team-option__state">
                            {slot ? slot : <Icon name="arrowRight" size={15} />}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

export default TeamSelector;
