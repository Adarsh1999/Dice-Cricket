const PLAYER_COUNT = 11;
const WICKET_COUNT = 10;

const createInningsDefaults = () => ({
    score: 0,
    wickets: 0,
    players: Array(PLAYER_COUNT).fill(0),
    currentPlayers: [0, 1],
    playersOut: Array(PLAYER_COUNT).fill(0),
    striker: 0,
    fallOn: Array(WICKET_COUNT).fill(''),
    playerFell: Array(WICKET_COUNT).fill(''),
    currentOver: 0,
    ballInOver: 0,
    Bool: false,
});

export const createInitialMatchEngineState = () => ({
    ...createInningsDefaults(),
    totalTeamScore: 0,
    team2FirstInningsScore: 0,
    team1SecondInningsScore: 0,
    testTarget: null,
    innings: 1,
    matchOver: 0,
});

const hydrateMatchState = (payload = {}) => ({
    ...createInitialMatchEngineState(),
    ...payload,
    players: Array.isArray(payload.players) ? payload.players : Array(PLAYER_COUNT).fill(0),
    currentPlayers: Array.isArray(payload.currentPlayers) ? payload.currentPlayers : [0, 1],
    playersOut: Array.isArray(payload.playersOut) ? payload.playersOut : Array(PLAYER_COUNT).fill(0),
    fallOn: Array.isArray(payload.fallOn) ? payload.fallOn : Array(WICKET_COUNT).fill(''),
    playerFell: Array.isArray(payload.playerFell) ? payload.playerFell : Array(WICKET_COUNT).fill(''),
});

const processRun = (state, value) => {
    const currentScore = state.score;
    const activeBatterIndex = currentScore % 2 === 0 ? 0 : 1;
    const playerIndex = state.currentPlayers[activeBatterIndex];
    const updatedPlayers = [...state.players];

    updatedPlayers[playerIndex] += value;

    const nextScore = currentScore + value;
    const nextBall = state.ballInOver + 1;
    const nextOver = nextBall === 6 ? state.currentOver + 1 : state.currentOver;

    return {
        ...state,
        score: nextScore,
        players: updatedPlayers,
        currentOver: nextOver,
        ballInOver: nextBall === 6 ? 0 : nextBall,
        striker: nextScore % 2 === 0 ? state.currentPlayers[0] : state.currentPlayers[1],
        Bool: false,
    };
};

const processWicket = (state, battingPlayers = []) => {
    const outIndex = state.score % 2 === 0 ? 0 : 1;
    const outPlayerId = state.currentPlayers[outIndex];
    const nextWickets = Math.min(WICKET_COUNT, state.wickets + 1);
    const updatedPlayersOut = [...state.playersOut];
    const updatedPlayerFell = [...state.playerFell];
    const updatedFallOn = [...state.fallOn];
    const updatedCurrentPlayers = [...state.currentPlayers];

    updatedPlayersOut[outPlayerId] = 1;
    updatedPlayerFell[nextWickets - 1] = battingPlayers?.[outPlayerId] || updatedPlayerFell[nextWickets - 1] || `Player ${outPlayerId + 1}`;
    updatedFallOn[nextWickets - 1] = state.score;

    if (nextWickets < WICKET_COUNT) {
        updatedCurrentPlayers[outIndex] = Math.min(PLAYER_COUNT - 1, nextWickets + 1);
    }

    return {
        ...state,
        wickets: nextWickets,
        currentPlayers: updatedCurrentPlayers,
        playersOut: updatedPlayersOut,
        playerFell: updatedPlayerFell,
        fallOn: updatedFallOn,
        striker: state.score % 2 === 0 ? updatedCurrentPlayers[0] : updatedCurrentPlayers[1],
        Bool: false,
    };
};

export const advanceInningsState = (state, { isTestMatch = false, maxInnings = 2 } = {}) => {
    if (state.innings >= maxInnings || state.wickets !== WICKET_COUNT) {
        return state;
    }

    if (state.innings === 1) {
        return {
            ...createInningsDefaults(),
            totalTeamScore: state.score,
            team2FirstInningsScore: state.team2FirstInningsScore,
            team1SecondInningsScore: state.team1SecondInningsScore,
            testTarget: state.testTarget,
            innings: 2,
            matchOver: state.matchOver,
        };
    }

    if (isTestMatch && state.innings === 2) {
        return {
            ...createInningsDefaults(),
            totalTeamScore: state.totalTeamScore,
            team2FirstInningsScore: state.score,
            team1SecondInningsScore: state.team1SecondInningsScore,
            testTarget: state.testTarget,
            innings: 3,
            matchOver: state.matchOver,
        };
    }

    if (isTestMatch && state.innings === 3) {
        const target = Math.max(1, state.totalTeamScore + state.score - state.team2FirstInningsScore + 1);
        return {
            ...createInningsDefaults(),
            totalTeamScore: state.totalTeamScore,
            team2FirstInningsScore: state.team2FirstInningsScore,
            team1SecondInningsScore: state.score,
            testTarget: target,
            innings: 4,
            matchOver: state.matchOver,
        };
    }

    return state;
};

export const matchEngineReducer = (state, action) => {
    switch (action.type) {
        case 'HYDRATE_MATCH_STATE':
            return hydrateMatchState(action.payload);
        case 'ROLL':
            if (state.matchOver) {
                return state;
            }
            return action.value === 5 ? processWicket(state, action.battingPlayers) : processRun(state, action.value);
        case 'ADVANCE_INNINGS':
            return advanceInningsState(state, {
                isTestMatch: action.isTestMatch,
                maxInnings: action.maxInnings,
            });
        case 'SET_MATCH_OVER':
            return {
                ...state,
                matchOver: action.matchOver,
            };
        default:
            return state;
    }
};
