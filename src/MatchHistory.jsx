import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from './axios';
import Icon from './components/ui/Icon';
import TeamMark from './components/ui/TeamMark';
import {
    formatInningsName,
    formatMatchType,
    formatResult,
    formatSavedDate,
    formatTeamName,
    getMatchInnings,
    getScoreLine,
} from './utils/matchPresentation';

function MatchHistory() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visibleCount, setVisibleCount] = useState(12);

    const loadMatches = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await axios.get('/history');

            if (!data.success) {
                throw new Error('History request was not successful');
            }

            setMatches(data.data || []);
        } catch (requestError) {
            console.error('Failed to fetch match history', requestError);
            setError('The match archive is unavailable. Check that the backend and database are running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMatches();
    }, []);

    return (
        <main className="app-page">
            <div className="app-container page-enter">
                <section className="page-hero">
                    <div>
                        <span className="eyebrow">Match archive</span>
                        <h1>Every fixture has a story.</h1>
                        <p>Reopen completed One Day and Test matches with full innings scorecards, dismissal timelines, and official results.</p>
                    </div>
                    <Link className="button button--primary" to="/"><Icon name="play" size={17} /> Start a new fixture</Link>
                </section>

                {loading ? (
                    <div className="archive-grid" aria-label="Loading match archive">
                        {Array.from({ length: 4 }, (_, index) => <div className="skeleton skeleton-card" key={index} />)}
                    </div>
                ) : error ? (
                    <div className="state-panel">
                        <div>
                            <span className="state-panel__icon"><Icon name="cloud" size={28} /></span>
                            <h2>Archive connection lost</h2>
                            <p>{error}</p>
                            <button className="button button--primary" onClick={loadMatches} type="button"><Icon name="refresh" size={16} /> Try again</button>
                        </div>
                    </div>
                ) : matches.length === 0 ? (
                    <div className="state-panel">
                        <div>
                            <span className="state-panel__icon"><Icon name="history" size={28} /></span>
                            <h2>Your archive is waiting</h2>
                            <p>Complete a match, open its summary, and save it to build your fixture history.</p>
                            <Link className="button button--primary" to="/">Play the first match <Icon name="arrowRight" size={16} /></Link>
                        </div>
                    </div>
                ) : (
                    <>
                    <div className="archive-grid">
                        {matches.slice(0, visibleCount).map((match) => {
                            const inningsRecords = getMatchInnings(match);

                            return (
                                <Link className="archive-card" key={match._id} to={`/history/${match._id}`}>
                                    <div className="archive-card__top">
                                        <span className="archive-card__format"><Icon name={match.matchType === 'test' ? 'shield' : 'zap'} size={14} /> {formatMatchType(match.matchType)}</span>
                                        <span className="archive-card__date">{formatSavedDate(match.createdAt || match.timestamp)}</span>
                                    </div>

                                    <div className="archive-card__matchup">
                                        <TeamMark size="small" teamId={match.team1} />
                                        <TeamMark size="small" teamId={match.team2} />
                                        <h2>{formatTeamName(match.team1)} vs {formatTeamName(match.team2)}</h2>
                                    </div>

                                    <div className="archive-card__innings">
                                        {inningsRecords.map((inningRecord) => (
                                            <div className="archive-innings" key={inningRecord.id}>
                                                <span>
                                                    <span>{formatInningsName(inningRecord.innings)}</span>
                                                    <strong>{formatTeamName(inningRecord.teamName)}</strong>
                                                </span>
                                                <strong>{getScoreLine(inningRecord.data)}</strong>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="archive-card__footer">
                                        <span className="archive-card__result">{formatResult(match.result)}</span>
                                        <span className="archive-card__open"><Icon name="arrowRight" size={15} /></span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                    {visibleCount < matches.length && (
                        <div className="archive-pagination">
                            <button className="button button--secondary" onClick={() => setVisibleCount((count) => count + 12)} type="button">
                                Load 12 more matches <Icon name="chevronDown" size={16} />
                            </button>
                            <span>Showing {Math.min(visibleCount, matches.length)} of {matches.length}</span>
                        </div>
                    )}
                    </>
                )}
            </div>
        </main>
    );
}

export default MatchHistory;
