import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useStateValue } from './StateProvider';
import CoinToss from './components/setup/CoinToss';
import FormatToggle from './components/setup/FormatToggle';
import TeamSelector from './components/setup/TeamSelector';
import Icon from './components/ui/Icon';
import TeamMark from './components/ui/TeamMark';
import { formatMatchType, formatSavedDate, formatTeamName } from './utils/matchPresentation';
import {
    deleteSavedMatchRecord,
    normalizeSavedMatch,
    queueResumeMatch,
    readSavedMatchRecordsFromStorage,
    renameSavedMatchRecord,
    saveNamedMatchRecord,
} from './savedMatch';

function Landing() {
    const [team1Selected, setTeam1Selected] = useState('');
    const [team2Selected, setTeam2Selected] = useState('');
    const [matchType, setMatchType] = useState('oneday');
    const [isTossed, setIsTossed] = useState(false);
    const [savedMatchRecords, setSavedMatchRecords] = useState([]);
    const [resumeError, setResumeError] = useState(null);
    const [editingSaveId, setEditingSaveId] = useState(null);
    const [renameDraft, setRenameDraft] = useState('');
    const [showSavedLibrary, setShowSavedLibrary] = useState(false);
    const [, dispatch] = useStateValue();
    const history = useHistory();

    const refreshSavedMatches = async () => {
        try {
            setSavedMatchRecords(await readSavedMatchRecordsFromStorage());
        } catch (error) {
            console.error('Failed to load saved matches', error);
            setResumeError('Saved matches are temporarily unavailable. You can still start a new match.');
        }
    };

    useEffect(() => {
        refreshSavedMatches();
    }, []);

    const latestSavedRecord = savedMatchRecords[0] || null;
    const canStartMatch = Boolean(team1Selected && team2Selected && isTossed);
    const completedSteps = 1 + Number(Boolean(team1Selected && team2Selected)) + Number(isTossed);

    const handleFormatChange = (nextMatchType) => {
        setMatchType(nextMatchType);
        setIsTossed(false);
    };

    const handleTeamSelect = (teamId) => {
        setIsTossed(false);

        if (teamId === team1Selected) {
            setTeam1Selected(team2Selected);
            setTeam2Selected('');
            return;
        }

        if (teamId === team2Selected) {
            setTeam2Selected('');
            return;
        }

        if (!team1Selected) {
            setTeam1Selected(teamId);
            return;
        }

        setTeam2Selected(teamId);
    };

    const startMatch = () => {
        if (!canStartMatch) {
            return;
        }

        dispatch({
            type: 'SET_TEAM',
            team1: team1Selected,
            team2: team2Selected,
        });
        dispatch({
            type: 'SET_MATCH_TYPE',
            matchType,
        });
        history.push('/match');
    };

    const resumeSavedMatch = (savedMatch) => {
        try {
            queueResumeMatch(savedMatch);
            setResumeError(null);
            history.push('/match');
        } catch (error) {
            console.error('Failed to queue saved match', error);
            setResumeError('That save could not be restored. Try importing its JSON file again.');
        }
    };

    const handleResumeLatestSave = () => {
        if (!latestSavedRecord) {
            setResumeError('No saved match exists yet. Import a JSON save or start a new match.');
            return;
        }

        resumeSavedMatch(latestSavedRecord.snapshot);
    };

    const handleDeleteSavedRecord = async (recordId) => {
        try {
            setSavedMatchRecords(await deleteSavedMatchRecord(recordId));
            setResumeError(null);
        } catch (error) {
            console.error('Failed to delete saved match', error);
            setResumeError('That save could not be deleted right now.');
        }
    };

    const startRenamingSavedRecord = (savedRecord) => {
        setEditingSaveId(savedRecord.id);
        setRenameDraft(savedRecord.name);
    };

    const handleRenameSavedRecord = async (recordId) => {
        try {
            setSavedMatchRecords(await renameSavedMatchRecord(recordId, renameDraft));
            setEditingSaveId(null);
            setRenameDraft('');
            setResumeError(null);
        } catch (error) {
            console.error('Failed to rename saved match', error);
            setResumeError('That save could not be renamed right now.');
        }
    };

    const handleImportSavedMatch = async (event) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        try {
            const savedMatch = normalizeSavedMatch(await selectedFile.text());

            if (!savedMatch) {
                throw new Error('Invalid saved match file');
            }

            const importedSaveName =
                savedMatch.saveName || selectedFile.name.replace(/\.json$/i, '').replace(/[-_]+/g, ' ');
            const savedRecord = await saveNamedMatchRecord(savedMatch, importedSaveName, { source: 'imported' });
            await refreshSavedMatches();
            setResumeError(null);
            resumeSavedMatch(savedRecord.snapshot);
        } catch (error) {
            console.error('Failed to import saved match', error);
            setResumeError('The selected file is not a valid Dice Cricket save.');
        } finally {
            event.target.value = '';
        }
    };

    return (
        <main className="app-page">
            <section className="app-container landing-hero page-enter">
                <div className="hero-copy">
                    <span className="eyebrow">The cricket simulator, reimagined</span>
                    <h1>
                        Every roll writes <span>the next headline.</span>
                    </h1>
                    <p>
                        Build a matchup, win the toss, and play every delivery with a dice-powered scoring engine.
                        Choose a fast One Day chase or a four-innings Test battle with live lead, trail, and target tracking.
                    </p>

                    <div className="hero-proof">
                        <span className="hero-proof__item"><Icon name="zap" size={15} /> Instant scoring</span>
                        <span className="hero-proof__item"><Icon name="shield" size={15} /> Four-innings Tests</span>
                        <span className="hero-proof__item"><Icon name="cloud" size={15} /> Auto-save recovery</span>
                    </div>

                    <div className="broadcast-preview" aria-label="Scoreboard preview">
                        <div className="broadcast-preview__top">
                            <span className="status-pill status-pill--live">Live match centre</span>
                            <Icon name="dice" size={23} />
                        </div>
                        <div className="broadcast-preview__score">
                            <strong>184<span>/6</span></strong>
                            <p>Fourth innings<br />Need 27 to win</p>
                        </div>
                        <div className="broadcast-preview__footer">
                            <span>Current partnership</span>
                            <strong>48 runs · 7.2 overs</strong>
                        </div>
                    </div>
                </div>

                <div className="setup-card">
                    <div className="setup-card__header">
                        <div>
                            <span className="eyebrow">New fixture</span>
                            <h2>Build your match</h2>
                        </div>
                        <span className="setup-card__status">
                            <Icon name={completedSteps === 3 ? 'check' : 'spark'} size={14} />
                            {completedSteps}/3 ready
                        </span>
                    </div>

                    <div className="setup-section">
                        <div className="setup-section__label">
                            <strong>1. Choose the format</strong>
                            <span>{matchType === 'test' ? 'Four innings' : 'Two innings'}</span>
                        </div>
                        <FormatToggle onChange={handleFormatChange} value={matchType} />
                    </div>

                    <div className="setup-section">
                        <div className="setup-section__label">
                            <strong>2. Select two squads</strong>
                            <span>{team1Selected && team2Selected ? 'Matchup locked' : 'Tap a team to select'}</span>
                        </div>
                        <TeamSelector onSelect={handleTeamSelect} team1={team1Selected} team2={team2Selected} />

                        <div className="matchup-selection">
                            <div className={`selection-slot ${team1Selected ? 'selection-slot--filled' : ''}`}>
                                {team1Selected ? <TeamMark size="small" teamId={team1Selected} showName /> : 'Choose Team 1'}
                            </div>
                            <span className="versus-chip">VS</span>
                            <div className={`selection-slot ${team2Selected ? 'selection-slot--filled' : ''}`}>
                                {team2Selected ? <TeamMark size="small" teamId={team2Selected} showName /> : 'Choose Team 2'}
                            </div>
                        </div>
                    </div>

                    <div className="setup-section">
                        <CoinToss
                            isTossed={isTossed}
                            setIsTossed={setIsTossed}
                            setTeam1Selected={setTeam1Selected}
                            setTeam2Selected={setTeam2Selected}
                            team1Selected={team1Selected}
                            team2Selected={team2Selected}
                        />
                    </div>

                    <div className="setup-submit">
                        <button className="button button--primary button--wide" disabled={!canStartMatch} onClick={startMatch} type="button">
                            <Icon name="play" size={18} /> Start {formatMatchType(matchType)}
                            <Icon name="arrowRight" size={17} />
                        </button>
                        <span className="setup-submit__note">
                            {canStartMatch ? `${formatTeamName(team1Selected)} bats first` : 'Complete the toss to unlock the match'}
                        </span>
                    </div>
                </div>
            </section>

            <section className="app-container landing-content">
                <div className="feature-grid">
                    <article className="feature-card">
                        <span className="feature-card__icon"><Icon name="dice" size={20} /></span>
                        <h3>Roll-first gameplay</h3>
                        <p>Click the dice or use the keyboard. Every roll updates the score, strike, wickets, and over automatically.</p>
                    </article>
                    <article className="feature-card">
                        <span className="feature-card__icon"><Icon name="target" size={20} /></span>
                        <h3>Match-aware pressure</h3>
                        <p>Targets, runs required, current partnerships, and Test-match lead or trail states stay visible at a glance.</p>
                    </article>
                    <article className="feature-card">
                        <span className="feature-card__icon"><Icon name="history" size={20} /></span>
                        <h3>Never lose the story</h3>
                        <p>Continue an auto-save, create named checkpoints, export JSON snapshots, and archive completed matches.</p>
                    </article>
                </div>

                <section className="saved-section" id="saved-matches">
                    <div className="section-heading">
                        <div>
                            <span className="eyebrow">Continue playing</span>
                            <h2>Saved match desk</h2>
                            <p>Resume your latest checkpoint or import a match snapshot from another browser.</p>
                        </div>
                        <div className="saved-section__actions">
                            <label className="button button--secondary">
                                <Icon name="upload" size={15} /> Import JSON
                                <input accept=".json,application/json" hidden onChange={handleImportSavedMatch} type="file" />
                            </label>
                            <Link className="button button--ghost" to="/history">
                                <Icon name="history" size={15} /> Match archive
                            </Link>
                        </div>
                    </div>

                    {latestSavedRecord ? (
                        <div className="saved-latest">
                            <TeamMark size="medium" teamId={latestSavedRecord.snapshot.state.team1} />
                            <div className="saved-latest__copy">
                                <strong>{latestSavedRecord.name}</strong>
                                <span>
                                    {formatTeamName(latestSavedRecord.snapshot.state.team1)} vs {formatTeamName(latestSavedRecord.snapshot.state.team2)} ·{' '}
                                    {formatMatchType(latestSavedRecord.snapshot.state.matchType)} · Innings {latestSavedRecord.snapshot.appState.innings}
                                </span>
                                <span>
                                    {latestSavedRecord.snapshot.appState.score}/{latestSavedRecord.snapshot.appState.wickets} · Updated {formatSavedDate(latestSavedRecord.updatedAt)}
                                </span>
                            </div>
                            <button className="button button--dark" onClick={handleResumeLatestSave} type="button">
                                <Icon name="play" size={15} /> Resume latest
                            </button>
                        </div>
                    ) : (
                        <div className="empty-inline">No saved fixtures yet. Start a match and the first auto-save will appear here.</div>
                    )}

                    {resumeError && (
                        <div className="inline-notice" role="alert">
                            <Icon name="x" size={15} /> {resumeError}
                        </div>
                    )}

                    {savedMatchRecords.length > 0 && (
                        <div className="saved-library">
                            <button className="saved-library__toggle" onClick={() => setShowSavedLibrary((isOpen) => !isOpen)} type="button">
                                <span>All saved matches ({savedMatchRecords.length})</span>
                                <Icon name="chevronDown" size={16} />
                            </button>

                            {showSavedLibrary && (
                                <div className="saved-list">
                                    {savedMatchRecords.map((savedRecord) => (
                                        <div className="saved-record" key={savedRecord.id}>
                                            <div className="saved-record__copy">
                                                <strong>{savedRecord.name}{savedRecord.isAutoSave ? ' · Auto save' : ''}</strong>
                                                <span>
                                                    {formatTeamName(savedRecord.snapshot.state.team1)} vs {formatTeamName(savedRecord.snapshot.state.team2)} ·{' '}
                                                    {formatMatchType(savedRecord.snapshot.state.matchType)} · {formatSavedDate(savedRecord.updatedAt)}
                                                </span>
                                            </div>
                                            <div className="saved-record__actions">
                                                <button aria-label={`Resume ${savedRecord.name}`} className="icon-button" onClick={() => resumeSavedMatch(savedRecord.snapshot)} title="Resume" type="button">
                                                    <Icon name="play" size={15} />
                                                </button>
                                                {!savedRecord.isAutoSave && (
                                                    <>
                                                        <button aria-label={`Rename ${savedRecord.name}`} className="icon-button" onClick={() => startRenamingSavedRecord(savedRecord)} title="Rename" type="button">
                                                            <Icon name="edit" size={15} />
                                                        </button>
                                                        <button aria-label={`Delete ${savedRecord.name}`} className="icon-button" onClick={() => handleDeleteSavedRecord(savedRecord.id)} title="Delete" type="button">
                                                            <Icon name="trash" size={15} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            {editingSaveId === savedRecord.id && (
                                                <div className="rename-row">
                                                    <input aria-label="Save name" className="field" onChange={(event) => setRenameDraft(event.target.value)} value={renameDraft} />
                                                    <button className="button button--primary" onClick={() => handleRenameSavedRecord(savedRecord.id)} type="button">Save name</button>
                                                    <button className="button button--ghost" onClick={() => { setEditingSaveId(null); setRenameDraft(''); }} type="button">Cancel</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </section>
        </main>
    );
}

export default Landing;
