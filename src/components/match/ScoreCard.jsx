import React from 'react';
import Icon from '../ui/Icon';
import TeamMark from '../ui/TeamMark';
import { formatInningsName, formatTeamName } from '../../utils/matchPresentation';

const getPlayerStatus = ({ id, current, status, striker }) => {
    if (status?.[id] === 1) {
        return { key: 'out', label: 'Out' };
    }

    if (id === striker) {
        return { key: 'striker', label: 'On strike' };
    }

    if (current?.includes(id)) {
        return { key: 'batting', label: 'At the crease' };
    }

    return { key: 'waiting', label: 'Yet to bat' };
};

function ScoreCard({
    scorelist = [],
    current = [],
    status = [],
    striker,
    firstTeam = [],
    secondTeam = [],
    innings = 1,
    team1Score,
    players = [],
    currentOver = 0,
    ballInOver = 0,
    fallOn = [],
    playerFell = [],
    battingTeamName,
    battingTeamId,
    target,
}) {
    const playerList =
        players?.length > 0
            ? players
            : innings === 1 || innings === 3
              ? firstTeam
              : secondTeam;
    const resolvedScores = scorelist?.length > 0 ? scorelist : Array.from({ length: playerList?.length || 11 }, () => 0);
    const currentScore = resolvedScores.reduce((sum, playerScore) => sum + (Number(playerScore) || 0), 0);
    const wicketsLost = status.filter((playerStatus) => playerStatus === 1).length;
    const targetScore = typeof target === 'number' ? target : innings === 2 && typeof team1Score === 'number' ? team1Score + 1 : null;
    const lastWicketScore = [...fallOn]
        .reverse()
        .find((wicketScore) => wicketScore !== '' && wicketScore !== undefined && wicketScore !== null);
    const partnership = Math.max(0, currentScore - (Number(lastWicketScore) || 0));
    const overs = `${currentOver || 0}.${ballInOver || 0}`;
    const resolvedTeamName = battingTeamName || formatTeamName(battingTeamId);

    const getPlayerName = (id) => playerList?.[id] || firstTeam?.[id] || secondTeam?.[id] || `Player ${id + 1}`;

    return (
        <section className="scoreboard page-enter">
            <div className="scoreboard__hero">
                <div className="scoreboard__top">
                    <div className="scoreboard__team">
                        <TeamMark size="medium" teamId={battingTeamId || battingTeamName} />
                        <div>
                            <span className="eyebrow">{formatInningsName(innings)}</span>
                            <h2>{resolvedTeamName}</h2>
                        </div>
                    </div>

                    <div className="scoreboard__score" aria-label={`${currentScore} runs for ${wicketsLost} wickets`}>
                        <span>
                            {currentScore}<small>/{wicketsLost}</small>
                        </span>
                        <small>LIVE · {overs} overs</small>
                    </div>
                </div>

                <div className="scoreboard__stats">
                    <div className="score-stat">
                        <span className="score-stat__icon"><Icon name={targetScore !== null ? 'target' : 'wicket'} size={18} /></span>
                        <span>
                            <span>{targetScore !== null ? 'Target' : 'Wickets'}</span>
                            <strong>{targetScore !== null ? targetScore : `${wicketsLost}/10`}</strong>
                        </span>
                    </div>
                    <div className="score-stat">
                        <span className="score-stat__icon"><Icon name="users" size={18} /></span>
                        <span>
                            <span>Partnership</span>
                            <strong>{partnership} runs</strong>
                        </span>
                    </div>
                    <div className="score-stat">
                        <span className="score-stat__icon"><Icon name={targetScore !== null ? 'zap' : 'clock'} size={18} /></span>
                        <span>
                            <span>{targetScore !== null ? 'Required' : 'Overs'}</span>
                            <strong>{targetScore !== null ? Math.max(0, targetScore - currentScore) : overs}</strong>
                        </span>
                    </div>
                </div>

                {current.length > 0 && (
                    <div className="crease-strip" aria-label="Current batters">
                        {current.slice(0, 2).map((playerId) => (
                            <div className={`batter-chip ${playerId === striker ? 'batter-chip--striker' : ''}`} key={playerId}>
                                <span className="batter-chip__dot" />
                                <strong>{getPlayerName(playerId)}</strong>
                                <span>{resolvedScores[playerId] || 0}{playerId === striker ? '*' : ''}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="scoreboard__body">
                <div className="scoreboard-section__head">
                    <h3>Batting order</h3>
                    <span>{wicketsLost === 10 ? 'Innings complete' : `${10 - wicketsLost} wickets in hand`}</span>
                </div>

                <div className="lineup-grid">
                    {resolvedScores.map((playerScore, id) => {
                        const playerStatus = getPlayerStatus({ id, current, status, striker });

                        return (
                            <div className={`player-row player-row--${playerStatus.key}`} key={`${getPlayerName(id)}-${id}`}>
                                <span className="player-row__number">{String(id + 1).padStart(2, '0')}</span>
                                <span className="player-row__copy">
                                    <strong>{getPlayerName(id)}</strong>
                                    <small>{playerStatus.label}</small>
                                </span>
                                <span className="player-row__score">
                                    <strong>{playerScore || 0}{id === striker ? '*' : ''}</strong>
                                    <small>runs</small>
                                </span>
                            </div>
                        );
                    })}
                </div>

                {playerFell.some((playerName) => playerName) && (
                    <div className="wickets-panel">
                        <div className="scoreboard-section__head">
                            <h3>Fall of wickets</h3>
                            <span>Dismissal timeline</span>
                        </div>
                        <div className="wickets-timeline">
                            {playerFell.map((playerName, index) =>
                                playerName ? (
                                    <span className="wicket-event" key={`${playerName}-${index}`}>
                                        <Icon name="wicket" size={14} />
                                        <span>{playerName}</span>
                                        <strong>{fallOn[index] ?? 0}/{index + 1}</strong>
                                    </span>
                                ) : null,
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default React.memo(ScoreCard);
