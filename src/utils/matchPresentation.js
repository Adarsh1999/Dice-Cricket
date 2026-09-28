export const formatTeamName = (teamName) => teamName?.replace(/_/g, ' ') || 'Team';

export const formatMatchType = (matchType) => (matchType === 'test' ? 'Test Match' : 'One Day');

export const formatResult = (result) =>
    (result || 'Result recorded')
        .replace(/_/g, ' ')
        .replace(/\b1 wickets\b/gi, '1 wicket')
        .replace(/\b1 runs\b/gi, '1 run');

export const formatInningsName = (innings) => {
    const labels = ['First innings', 'Second innings', 'Third innings', 'Fourth innings'];
    return labels[innings - 1] || `Innings ${innings}`;
};

export const formatSavedDate = (value) => {
    if (!value) {
        return 'Date unavailable';
    }

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime())
        ? 'Recently'
        : parsedDate.toLocaleString([], {
              dateStyle: 'medium',
              timeStyle: 'short',
          });
};

export const normalizeTeamData = (teamData, teamKey) => {
    const safeData = teamData || {};
    const fallbackPlayers = safeData.players || safeData.firstTeam || safeData.secondTeam || [];

    return {
        ...safeData,
        scorelist: safeData.scorelist || [],
        current: safeData.current || [],
        status: safeData.status || [],
        fallOn: safeData.fallOn || [],
        playerFell: safeData.playerFell || [],
        players: fallbackPlayers,
        firstTeam: teamKey === 'team1' ? fallbackPlayers : safeData.firstTeam || [],
        secondTeam: teamKey === 'team2' ? fallbackPlayers : safeData.secondTeam || [],
        score: safeData.score || 0,
        wickets: safeData.wickets || 0,
        currentOver: safeData.currentOver || 0,
        ballInOver: safeData.ballInOver || 0,
    };
};

export const getTestTarget = (match) =>
    Math.max(
        1,
        (match?.team1_data?.score || 0) +
            (match?.team1_data2?.score || 0) -
            (match?.team2_data?.score || 0) +
            1,
    );

export const getMatchInnings = (match) => {
    if (!match) {
        return [];
    }

    const isTestMatch =
        match.matchType === 'test' ||
        (!match.matchType && Boolean(match.team1_data2?.scorelist?.length));
    const innings = [
        {
            id: 'team1-first',
            teamKey: 'team1',
            teamName: match.team1,
            data: normalizeTeamData(match.team1_data, 'team1'),
            innings: 1,
        },
        {
            id: 'team2-first',
            teamKey: 'team2',
            teamName: match.team2,
            data: normalizeTeamData(match.team2_data, 'team2'),
            innings: 2,
        },
    ];

    if (isTestMatch) {
        innings.push(
            {
                id: 'team1-second',
                teamKey: 'team1',
                teamName: match.team1,
                data: normalizeTeamData(match.team1_data2, 'team1'),
                innings: 3,
            },
            {
                id: 'team2-second',
                teamKey: 'team2',
                teamName: match.team2,
                data: normalizeTeamData(match.team2_data2, 'team2'),
                innings: 4,
            },
        );
    }

    return innings;
};

export const getScoreLine = (teamData) => `${teamData?.score || 0}/${teamData?.wickets || 0}`;
