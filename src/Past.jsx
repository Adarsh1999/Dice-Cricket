import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from './axios';
import ScoreCard from './components/match/ScoreCard';
import Icon from './components/ui/Icon';
import {
    formatMatchType,
    formatResult,
    formatSavedDate,
    formatTeamName,
    getMatchInnings,
    getTestTarget,
} from './utils/matchPresentation';

function Past() {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();

    const getMatch = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await axios.get(`/history/${id}`);

            if (!data.success || !data.data) {
                throw new Error('Match was not found');
            }

            setDetail(data.data);
        } catch (requestError) {
            console.error('Failed to fetch match details', requestError);
            setError('This scorecard could not be loaded from the archive.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getMatch();
    }, [id]);

    if (loading) {
        return (
            <main className="app-page">
                <div className="app-container">
                    <div className="page-hero"><div className="skeleton" style={{ width: 'min(620px, 100%)', height: 130, borderRadius: 22 }} /></div>
                    <div className="innings-stack">
                        <div className="skeleton skeleton-card" />
                        <div className="skeleton skeleton-card" />
                    </div>
                </div>
            </main>
        );
    }

    if (error || !detail) {
        return (
            <main className="app-page">
                <div className="app-container">
                    <div className="state-panel">
                        <div>
                            <span className="state-panel__icon"><Icon name="history" size={28} /></span>
                            <h2>Scorecard unavailable</h2>
                            <p>{error || 'No match details were returned.'}</p>
                            <Link className="button button--secondary" to="/history"><Icon name="arrowRight" size={16} /> Back to archive</Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    const isTestMatch = detail.matchType === 'test' || (!detail.matchType && Boolean(detail.team1_data2?.scorelist?.length));
    const inningsRecords = getMatchInnings(detail);
    const testTarget = isTestMatch ? getTestTarget(detail) : null;

    return (
        <main className="app-page">
            <div className="app-container page-enter">
                <section className="page-hero">
                    <div>
                        <span className="eyebrow">Archived scorecard · {formatMatchType(detail.matchType)}</span>
                        <h1>{formatTeamName(detail.team1)} vs {formatTeamName(detail.team2)}</h1>
                        <p>Played {formatSavedDate(detail.createdAt || detail.timestamp)} · {inningsRecords.length} innings recorded</p>
                    </div>
                    <div className="result-lockup">
                        <div className="result-lockup__top"><Icon name="trophy" size={19} /> Official result</div>
                        <h2>{formatResult(detail.result)}</h2>
                    </div>
                </section>

                <div className="summary-toolbar">
                    <div className="summary-toolbar__copy">
                        <strong>Full batting scorecard</strong>
                        <span>{isTestMatch ? `Fourth-innings target: ${testTarget}` : `Chase target: ${(detail.team1_data?.score || 0) + 1}`}</span>
                    </div>
                    <Link className="button button--ghost" to="/history"><Icon name="history" size={15} /> Back to archive</Link>
                </div>

                <div className="innings-stack">
                    {inningsRecords.map((inningRecord) => (
                        <div className="innings-stack__item" key={inningRecord.id}>
                            <ScoreCard
                                ballInOver={inningRecord.data.ballInOver}
                                battingTeamId={inningRecord.teamName}
                                battingTeamName={formatTeamName(inningRecord.teamName)}
                                current={inningRecord.data.current}
                                currentOver={inningRecord.data.currentOver}
                                fallOn={inningRecord.data.fallOn}
                                firstTeam={inningRecord.data.firstTeam}
                                innings={inningRecord.innings}
                                playerFell={inningRecord.data.playerFell}
                                players={inningRecord.data.players}
                                scorelist={inningRecord.data.scorelist}
                                secondTeam={inningRecord.data.secondTeam}
                                status={inningRecord.data.status}
                                striker={inningRecord.data.striker}
                                target={inningRecord.innings === 4 ? testTarget : !isTestMatch && inningRecord.innings === 2 ? (detail.team1_data?.score || 0) + 1 : null}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}

export default Past;
