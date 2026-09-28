import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStateValue } from './StateProvider';
import ScoreCard from './components/match/ScoreCard';
import Icon from './components/ui/Icon';
import axios from './axios';
import {
    formatMatchType,
    formatResult,
    formatTeamName,
    getMatchInnings,
    getTestTarget,
    normalizeTeamData,
} from './utils/matchPresentation';

function Summary() {
    const [state] = useStateValue();
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);
    const isTestMatch = state.matchType === 'test';
    const inningsRecords = getMatchInnings(state);
    const testTarget = isTestMatch ? getTestTarget(state) : null;
    const result = state.result ? formatResult(state.result) : 'Match complete';

    const saveToDb = async () => {
        try {
            setSaving(true);
            setSaveStatus(null);

            const gameData = {
                ...state,
                matchType: state.matchType || 'oneday',
                team1_data: normalizeTeamData(state.team1_data, 'team1'),
                team2_data: normalizeTeamData(state.team2_data, 'team2'),
                team1_data2: normalizeTeamData(state.team1_data2, 'team1'),
                team2_data2: normalizeTeamData(state.team2_data2, 'team2'),
            };
            const { data } = await axios.post('/history/new', gameData);
            setSaveStatus(data.success ? 'success' : 'error');
        } catch (error) {
            console.error('Failed to save game', error);
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    if (!state.team1 || !state.team2) {
        return (
            <main className="app-page">
                <div className="app-container">
                    <div className="state-panel">
                        <div>
                            <span className="state-panel__icon"><Icon name="trophy" size={28} /></span>
                            <h2>No completed match found</h2>
                            <p>Finish a fixture to generate a full innings-by-innings summary.</p>
                            <Link className="button button--primary" to="/">Start a match <Icon name="arrowRight" size={16} /></Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="app-page">
            <div className="app-container page-enter">
                <section className="page-hero">
                    <div>
                        <span className="eyebrow">Final scorecard · {formatMatchType(state.matchType)}</span>
                        <h1>The match, innings by innings.</h1>
                        <p>{formatTeamName(state.team1)} and {formatTeamName(state.team2)} have completed the fixture. Review every batting order, wicket, partnership, and chase below.</p>
                    </div>
                    <div className="result-lockup">
                        <div className="result-lockup__top"><Icon name="trophy" size={19} /> Official result</div>
                        <h2>{result}</h2>
                    </div>
                </section>

                <div className="summary-toolbar">
                    <div className="summary-toolbar__copy">
                        <strong>{inningsRecords.length} innings recorded</strong>
                        <span>{isTestMatch ? `Fourth-innings target: ${testTarget}` : `Chase target: ${(state.team1_data?.score || 0) + 1}`}</span>
                    </div>
                    <span className="status-pill"><Icon name="shield" size={14} /> Verified scorecard</span>
                </div>

                {saveStatus && (
                    <div className={`save-feedback save-feedback--${saveStatus}`} role="status">
                        {saveStatus === 'success'
                            ? 'Match saved to the archive. You can reopen this scorecard at any time.'
                            : 'The archive could not be reached. Your current scorecard is still available on this screen.'}
                    </div>
                )}

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
                                target={inningRecord.innings === 4 ? testTarget : !isTestMatch && inningRecord.innings === 2 ? (state.team1_data?.score || 0) + 1 : null}
                            />
                        </div>
                    ))}
                </div>

                <div className="summary-actions">
                    <button className="button button--primary" disabled={saving || saveStatus === 'success'} onClick={saveToDb} type="button">
                        <Icon name={saving ? 'refresh' : 'save'} size={17} />
                        {saving ? 'Saving to archive…' : saveStatus === 'success' ? 'Saved to archive' : 'Save to match archive'}
                    </button>
                    <Link className="button button--secondary" to="/history"><Icon name="history" size={17} /> Browse archive</Link>
                    <Link className="button button--ghost" to="/"><Icon name="play" size={17} /> New fixture</Link>
                </div>
            </div>
        </main>
    );
}

export default Summary;
