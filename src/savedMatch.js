const PLAYER_COUNT = 11;
const WICKET_COUNT = 10;

export const SAVED_MATCH_STORAGE_KEY = 'diceCricketSavedMatch';
export const SAVED_MATCHES_STORAGE_KEY = 'diceCricketSavedMatches';
export const RESUME_MATCH_STORAGE_KEY = 'diceCricketResumeMatch';
export const AUTO_SAVE_RECORD_ID = 'autosave-current';

const toFiniteNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const clampNumber = (value, min, max, fallback = min) => {
    const numericValue = Math.floor(toFiniteNumber(value, fallback));
    return Math.min(max, Math.max(min, numericValue));
};

const normalizeNumberArray = (value, length, fallback = 0) => {
    const safeArray = Array.isArray(value) ? value : [];
    return Array.from({ length }, (_, index) => toFiniteNumber(safeArray[index], fallback));
};

const normalizeTextArray = (value, length) => {
    const safeArray = Array.isArray(value) ? value : [];
    return Array.from({ length }, (_, index) => {
        const item = safeArray[index];
        return typeof item === 'string' ? item : '';
    });
};

const normalizeFallOfWicketArray = (value, length) => {
    const safeArray = Array.isArray(value) ? value : [];
    return Array.from({ length }, (_, index) => {
        const item = safeArray[index];
        if (item === '') {
            return '';
        }
        if (typeof item === 'number' && Number.isFinite(item)) {
            return item;
        }
        if (typeof item === 'string' && item.trim() !== '' && Number.isFinite(Number(item))) {
            return Number(item);
        }
        return '';
    });
};

const normalizePlayerList = (value) => {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.map((item) => (typeof item === 'string' ? item : ''));
};

const normalizeCurrentPlayers = (value) => {
    if (!Array.isArray(value) || value.length < 2) {
        return [0, 1];
    }

    const first = clampNumber(value[0], 0, PLAYER_COUNT - 1, 0);
    const fallbackSecond = first === 0 ? 1 : 0;
    const second = clampNumber(value[1], 0, PLAYER_COUNT - 1, fallbackSecond);

    return first === second ? [first, fallbackSecond] : [first, second];
};

const getFallbackPlayers = (teamData = {}) => {
    const candidates = [teamData.players, teamData.firstTeam, teamData.secondTeam];
    for (const candidate of candidates) {
        const normalized = normalizePlayerList(candidate);
        if (normalized.length) {
            return normalized;
        }
    }
    return [];
};

const prettifyTeamName = (teamName) => (typeof teamName === 'string' ? teamName.replace(/_/g, ' ') : 'Team');

const createRecordId = () => `save-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const safeParseJson = (value, fallback) => {
    try {
        return JSON.parse(value);
    } catch (error) {
        return fallback;
    }
};

const sortSavedMatchRecords = (records) =>
    [...records].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());

const getDefaultSaveName = (snapshot, isAutoSave = false) => {
    if (isAutoSave) {
        return 'Auto Save';
    }

    return `${prettifyTeamName(snapshot.state.team1)} vs ${prettifyTeamName(snapshot.state.team2)} - ${
        snapshot.state.matchType === 'test' ? 'Test' : 'One Day'
    } - Innings ${snapshot.appState.innings}`;
};

const getStoredRecords = () => {
    if (typeof window === 'undefined') {
        return [];
    }

    const serializedRecords = window.localStorage.getItem(SAVED_MATCHES_STORAGE_KEY);
    const parsedRecords = serializedRecords ? safeParseJson(serializedRecords, []) : [];
    return Array.isArray(parsedRecords) ? parsedRecords : [];
};

const writeStoredRecords = (records) => {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(SAVED_MATCHES_STORAGE_KEY, JSON.stringify(records));
};

export const createDefaultInningsData = () => ({
    scorelist: Array(PLAYER_COUNT).fill(0),
    current: [0, 1],
    status: Array(PLAYER_COUNT).fill(0),
    striker: 0,
    players: [],
    firstTeam: [],
    secondTeam: [],
    score: 0,
    wickets: 0,
    fallOn: Array(WICKET_COUNT).fill(''),
    playerFell: Array(WICKET_COUNT).fill(''),
    currentOver: 0,
    ballInOver: 0,
});

export const createDefaultAppState = () => ({
    score: 0,
    wickets: 0,
    players: Array(PLAYER_COUNT).fill(0),
    currentPlayers: [0, 1],
    totalTeamScore: 0,
    team2FirstInningsScore: 0,
    team1SecondInningsScore: 0,
    testTarget: null,
    innings: 1,
    playersOut: Array(PLAYER_COUNT).fill(0),
    Bool: false,
    striker: 0,
    matchOver: 0,
    fallOn: Array(WICKET_COUNT).fill(''),
    playerFell: Array(WICKET_COUNT).fill(''),
    currentOver: 0,
    ballInOver: 0,
});

export const normalizeInningsData = (teamData = {}, teamKey = 'team1') => {
    const defaults = createDefaultInningsData();
    const scorelist = normalizeNumberArray(teamData.scorelist, PLAYER_COUNT);
    const status = normalizeNumberArray(teamData.status, PLAYER_COUNT);
    const current = normalizeCurrentPlayers(teamData.current);
    const fallbackPlayers = getFallbackPlayers(teamData);

    return {
        ...defaults,
        ...teamData,
        scorelist,
        current,
        status,
        striker: clampNumber(teamData.striker, 0, PLAYER_COUNT - 1, current[0]),
        players: fallbackPlayers,
        firstTeam:
            teamKey === 'team1'
                ? normalizePlayerList(teamData.firstTeam).length
                    ? normalizePlayerList(teamData.firstTeam)
                    : fallbackPlayers
                : normalizePlayerList(teamData.firstTeam),
        secondTeam:
            teamKey === 'team2'
                ? normalizePlayerList(teamData.secondTeam).length
                    ? normalizePlayerList(teamData.secondTeam)
                    : fallbackPlayers
                : normalizePlayerList(teamData.secondTeam),
        score: toFiniteNumber(teamData.score, scorelist.reduce((sum, run) => sum + run, 0)),
        wickets: clampNumber(teamData.wickets, 0, WICKET_COUNT, status.filter((item) => item === 1).length),
        fallOn: normalizeFallOfWicketArray(teamData.fallOn, WICKET_COUNT),
        playerFell: normalizeTextArray(teamData.playerFell, WICKET_COUNT),
        currentOver: Math.max(0, Math.floor(toFiniteNumber(teamData.currentOver, 0))),
        ballInOver: clampNumber(teamData.ballInOver, 0, 5, 0),
    };
};

export const normalizeSavedMatch = (input) => {
    if (!input) {
        return null;
    }

    let parsedInput = input;
    if (typeof input === 'string') {
        parsedInput = safeParseJson(input, null);
    }

    if (!parsedInput || typeof parsedInput !== 'object') {
        return null;
    }

    const savedState = parsedInput.state;
    const savedAppState = parsedInput.appState;

    if (!savedState || !savedAppState || !savedState.team1 || !savedState.team2) {
        return null;
    }

    const matchType = savedState.matchType === 'test' ? 'test' : 'oneday';
    const maxInnings = matchType === 'test' ? 4 : 2;
    const team1Data = normalizeInningsData(savedState.team1_data, 'team1');
    const team2Data = normalizeInningsData(savedState.team2_data, 'team2');
    const team1SecondData = normalizeInningsData(savedState.team1_data2, 'team1');
    const team2SecondData = normalizeInningsData(savedState.team2_data2, 'team2');
    const currentPlayers = normalizeCurrentPlayers(savedAppState.currentPlayers);

    const normalizedAppState = {
        ...createDefaultAppState(),
        ...savedAppState,
        score: Math.max(0, toFiniteNumber(savedAppState.score, 0)),
        wickets: clampNumber(savedAppState.wickets, 0, WICKET_COUNT, 0),
        players: normalizeNumberArray(savedAppState.players, PLAYER_COUNT),
        currentPlayers,
        totalTeamScore: Math.max(0, toFiniteNumber(savedAppState.totalTeamScore, 0)),
        team2FirstInningsScore: Math.max(0, toFiniteNumber(savedAppState.team2FirstInningsScore, 0)),
        team1SecondInningsScore: Math.max(0, toFiniteNumber(savedAppState.team1SecondInningsScore, 0)),
        testTarget:
            savedAppState.testTarget === null || savedAppState.testTarget === undefined
                ? null
                : Math.max(1, toFiniteNumber(savedAppState.testTarget, 1)),
        innings: clampNumber(savedAppState.innings, 1, maxInnings, 1),
        playersOut: normalizeNumberArray(savedAppState.playersOut, PLAYER_COUNT),
        Bool: Boolean(savedAppState.Bool),
        striker: clampNumber(savedAppState.striker, 0, PLAYER_COUNT - 1, currentPlayers[0]),
        matchOver: savedAppState.matchOver ? 1 : 0,
        fallOn: normalizeFallOfWicketArray(savedAppState.fallOn, WICKET_COUNT),
        playerFell: normalizeTextArray(savedAppState.playerFell, WICKET_COUNT),
        currentOver: Math.max(0, Math.floor(toFiniteNumber(savedAppState.currentOver, 0))),
        ballInOver: clampNumber(savedAppState.ballInOver, 0, 5, 0),
    };

    const normalizedPlayerObj = {
        team1: normalizePlayerList(parsedInput.playerObj?.team1).length
            ? normalizePlayerList(parsedInput.playerObj?.team1)
            : team1Data.players,
        team2: normalizePlayerList(parsedInput.playerObj?.team2).length
            ? normalizePlayerList(parsedInput.playerObj?.team2)
            : team2Data.players,
    };

    const normalizedSnapshot = {
        version: toFiniteNumber(parsedInput.version, 1),
        savedAt: typeof parsedInput.savedAt === 'string' ? parsedInput.savedAt : new Date().toISOString(),
        saveName: typeof parsedInput.saveName === 'string' ? parsedInput.saveName.trim() : '',
        state: {
            team1: savedState.team1,
            team2: savedState.team2,
            team1_data: team1Data,
            team2_data: team2Data,
            team1_data2: team1SecondData,
            team2_data2: team2SecondData,
            matchType,
            result: typeof savedState.result === 'string' ? savedState.result : null,
            timestamp: savedState.timestamp || null,
        },
        appState: normalizedAppState,
        playerObj: normalizedPlayerObj,
    };

    return {
        ...normalizedSnapshot,
        saveName: normalizedSnapshot.saveName || getDefaultSaveName(normalizedSnapshot, false),
    };
};

export const normalizeSavedMatchRecord = (input) => {
    if (!input || typeof input !== 'object') {
        return null;
    }

    const snapshot = normalizeSavedMatch(input.snapshot || (input.state && input.appState ? input : null));
    if (!snapshot) {
        return null;
    }

    const isAutoSave = Boolean(input.isAutoSave) || input.id === AUTO_SAVE_RECORD_ID;
    const updatedAt = typeof input.updatedAt === 'string' ? input.updatedAt : snapshot.savedAt;
    const name =
        typeof input.name === 'string' && input.name.trim()
            ? input.name.trim()
            : snapshot.saveName || getDefaultSaveName(snapshot, isAutoSave);

    return {
        id: typeof input.id === 'string' && input.id ? input.id : isAutoSave ? AUTO_SAVE_RECORD_ID : createRecordId(),
        name,
        updatedAt,
        isAutoSave,
        snapshot: {
            ...snapshot,
            saveName: name,
        },
    };
};

export const buildSavedMatchSnapshot = ({ state, playerObj, appState, saveName = '' }) =>
    normalizeSavedMatch({
        version: 1,
        savedAt: new Date().toISOString(),
        saveName,
        state,
        appState,
        playerObj,
    });

export const saveMatchToStorage = (snapshot) => {
    if (typeof window === 'undefined') {
        return '';
    }

    const normalizedSnapshot = normalizeSavedMatch(snapshot);
    if (!normalizedSnapshot) {
        throw new Error('Invalid saved match snapshot');
    }

    const serializedSnapshot = JSON.stringify(normalizedSnapshot, null, 2);
    window.localStorage.setItem(SAVED_MATCH_STORAGE_KEY, serializedSnapshot);
    return serializedSnapshot;
};

export const readSavedMatchFromStorage = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    const storedRecords = readSavedMatchRecordsFromStorage();
    if (storedRecords.length) {
        return storedRecords[0].snapshot;
    }

    const serializedSnapshot = window.localStorage.getItem(SAVED_MATCH_STORAGE_KEY);
    return normalizeSavedMatch(serializedSnapshot);
};

export const readSavedMatchRecordsFromStorage = () => {
    const normalizedRecords = getStoredRecords().map(normalizeSavedMatchRecord).filter(Boolean);

    if (normalizedRecords.length) {
        return sortSavedMatchRecords(normalizedRecords);
    }

    if (typeof window === 'undefined') {
        return [];
    }

    const legacySnapshot = normalizeSavedMatch(window.localStorage.getItem(SAVED_MATCH_STORAGE_KEY));
    if (!legacySnapshot) {
        return [];
    }

    return [
        {
            id: AUTO_SAVE_RECORD_ID,
            name: 'Auto Save',
            updatedAt: legacySnapshot.savedAt,
            isAutoSave: true,
            snapshot: {
                ...legacySnapshot,
                saveName: legacySnapshot.saveName || 'Auto Save',
            },
        },
    ];
};

export const saveNamedMatchRecord = (snapshot, name = '') => {
    if (typeof window === 'undefined') {
        return null;
    }

    const baseSnapshot = normalizeSavedMatch(snapshot);
    const normalizedSnapshot = baseSnapshot
        ? {
              ...baseSnapshot,
              saveName: name || baseSnapshot.saveName,
          }
        : null;

    if (!normalizedSnapshot) {
        throw new Error('Invalid saved match snapshot');
    }

    const record = normalizeSavedMatchRecord({
        id: createRecordId(),
        name,
        updatedAt: new Date().toISOString(),
        isAutoSave: false,
        snapshot: normalizedSnapshot,
    });

    const existingRecords = readSavedMatchRecordsFromStorage().filter((savedRecord) => savedRecord.id !== record.id);
    const nextRecords = sortSavedMatchRecords([record, ...existingRecords]);

    writeStoredRecords(nextRecords);
    saveMatchToStorage(record.snapshot);

    return record;
};

export const upsertAutoSaveRecord = (snapshot) => {
    if (typeof window === 'undefined') {
        return null;
    }

    const baseSnapshot = normalizeSavedMatch(snapshot);
    const normalizedSnapshot = baseSnapshot
        ? {
              ...baseSnapshot,
              saveName: 'Auto Save',
          }
        : null;

    if (!normalizedSnapshot) {
        throw new Error('Invalid saved match snapshot');
    }

    const record = normalizeSavedMatchRecord({
        id: AUTO_SAVE_RECORD_ID,
        name: 'Auto Save',
        updatedAt: new Date().toISOString(),
        isAutoSave: true,
        snapshot: normalizedSnapshot,
    });

    const existingRecords = readSavedMatchRecordsFromStorage().filter((savedRecord) => savedRecord.id !== AUTO_SAVE_RECORD_ID);
    const nextRecords = sortSavedMatchRecords([record, ...existingRecords]);

    writeStoredRecords(nextRecords);
    saveMatchToStorage(record.snapshot);

    return record;
};

export const deleteSavedMatchRecord = (recordId) => {
    if (typeof window === 'undefined') {
        return [];
    }

    const nextRecords = readSavedMatchRecordsFromStorage().filter((savedRecord) => savedRecord.id !== recordId);
    writeStoredRecords(nextRecords);

    if (nextRecords.length) {
        saveMatchToStorage(nextRecords[0].snapshot);
    } else {
        window.localStorage.removeItem(SAVED_MATCH_STORAGE_KEY);
    }

    return nextRecords;
};

export const queueResumeMatch = (snapshot) => {
    if (typeof window === 'undefined') {
        return;
    }

    const normalizedSnapshot = normalizeSavedMatch(snapshot);
    if (!normalizedSnapshot) {
        throw new Error('Invalid saved match snapshot');
    }

    window.localStorage.setItem(RESUME_MATCH_STORAGE_KEY, JSON.stringify(normalizedSnapshot));
};

export const consumeQueuedResumeMatch = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    const serializedSnapshot = window.localStorage.getItem(RESUME_MATCH_STORAGE_KEY);
    if (!serializedSnapshot) {
        return null;
    }

    window.localStorage.removeItem(RESUME_MATCH_STORAGE_KEY);
    return normalizeSavedMatch(serializedSnapshot);
};
