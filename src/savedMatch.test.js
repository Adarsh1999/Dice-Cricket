import { describe, expect, it } from 'vitest';
import {
    BACKEND_SAVE_STORAGE,
    LOCAL_SAVE_STORAGE,
    buildSavedMatchSnapshot,
    convertSavedMatchSnapshotToTest,
    normalizeSavedMatch,
    normalizeSavedMatchRecord,
} from './savedMatch';

const createBaseSnapshot = (overrides = {}) =>
    buildSavedMatchSnapshot({
        state: {
            team1: 'India',
            team2: 'Australia',
            team1_data: {},
            team2_data: {},
            team1_data2: {},
            team2_data2: {},
            matchType: 'oneday',
            result: null,
            timestamp: null,
        },
        playerObj: {
            team1: Array.from({ length: 11 }, (_, index) => `India Player ${index + 1}`),
            team2: Array.from({ length: 11 }, (_, index) => `Australia Player ${index + 1}`),
        },
        appState: {
            score: 0,
            wickets: 0,
            players: Array(11).fill(0),
            currentPlayers: [0, 1],
            totalTeamScore: 0,
            team2FirstInningsScore: 0,
            team1SecondInningsScore: 0,
            testTarget: null,
            innings: 1,
            playersOut: Array(11).fill(0),
            Bool: false,
            striker: 0,
            matchOver: 0,
            fallOn: Array(10).fill(''),
            playerFell: Array(10).fill(''),
            currentOver: 0,
            ballInOver: 0,
            ...overrides,
        },
        saveName: overrides.saveName || '',
    });

describe('savedMatch snapshots', () => {
    it('updates an automatically generated One Day save name when converting to Test', () => {
        const snapshot = createBaseSnapshot({ innings: 2 });
        expect(snapshot.saveName).toBe('India vs Australia - One Day - Innings 2');
        expect(convertSavedMatchSnapshotToTest(snapshot).saveName).toBe('India vs Australia - Test - Innings 2');
    });

    it('preserves the One Day interpretation of legacy saves without a format', () => {
        const snapshot = createBaseSnapshot();
        delete snapshot.state.matchType;
        expect(normalizeSavedMatch(snapshot).state.matchType).toBe('oneday');
    });

    it.each([1, 2])('converts ODI innings %s without changing live batting progress', (innings) => {
        const snapshot = createBaseSnapshot({
            innings,
            score: 32,
            wickets: 2,
            totalTeamScore: innings === 2 ? 144 : 0,
            players: [7, 16, 9, 0, 0, 0, 0, 0, 0, 0, 0],
            playersOut: [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
            currentPlayers: [3, 1],
            currentOver: 1,
            ballInOver: 3,
        });
        snapshot.saveName = 'Custom checkpoint';
        snapshot.state.team1_data.score = innings === 2 ? 144 : 0;
        const original = JSON.parse(JSON.stringify(snapshot));
        const converted = convertSavedMatchSnapshotToTest(snapshot);

        expect(converted.state.matchType).toBe('test');
        expect(converted.appState).toEqual(original.appState);
        expect(converted.state.team1_data).toEqual(original.state.team1_data);
        expect(converted.state.team2_data).toEqual(original.state.team2_data);
        expect(converted.playerObj).toEqual(original.playerObj);
        expect(converted.saveName).toBe(original.saveName);
        expect(snapshot).toEqual(original);
    });

    it.each([
        [146, 4, 'Australia won by 6 wickets'],
        [100, 10, 'India won by 44 runs'],
    ])('reopens a finished ODI at %s/%s as the second innings of a Test', (score, wickets, result) => {
        const snapshot = createBaseSnapshot({ innings: 2, totalTeamScore: 144, score, wickets, matchOver: 1 });
        snapshot.state.result = result;
        const converted = convertSavedMatchSnapshotToTest(snapshot);
        expect(converted.appState).toMatchObject({ innings: 2, score, wickets, totalTeamScore: 144, matchOver: 0, testTarget: null });
        expect(converted.state.result).toBeNull();
    });

    it('clears unplayed Test innings and stale Test totals from a legacy ODI save', () => {
        const snapshot = createBaseSnapshot({ innings: 2, team2FirstInningsScore: 999, team1SecondInningsScore: 888, testTarget: 777 });
        snapshot.state.team1_data2 = { score: 888, wickets: 10 };
        snapshot.state.team2_data2 = { score: 777, wickets: 10 };
        const converted = convertSavedMatchSnapshotToTest(snapshot);
        expect(converted.state.team1_data2.score).toBe(0);
        expect(converted.state.team2_data2.score).toBe(0);
        expect(converted.appState).toMatchObject({ team2FirstInningsScore: 0, team1SecondInningsScore: 0, testTarget: null });
    });

    it('rejects missing snapshots and direct conversion of an existing Test', () => {
        expect(() => convertSavedMatchSnapshotToTest(null)).toThrow('Invalid saved match');
        const snapshot = createBaseSnapshot();
        snapshot.state.matchType = 'test';
        expect(() => convertSavedMatchSnapshotToTest(snapshot)).toThrow('already a Test');
    });

    it('round-trips a just-fallen wicket save', () => {
        const snapshot = createBaseSnapshot({
            score: 48,
            wickets: 1,
            currentPlayers: [2, 1],
            playersOut: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            fallOn: [48, '', '', '', '', '', '', '', '', ''],
            playerFell: ['India Player 1', '', '', '', '', '', '', '', '', ''],
            striker: 2,
        });

        const restoredSnapshot = normalizeSavedMatch(JSON.stringify(snapshot));

        expect(restoredSnapshot.appState.wickets).toBe(1);
        expect(restoredSnapshot.appState.fallOn[0]).toBe(48);
        expect(restoredSnapshot.appState.playerFell[0]).toBe('India Player 1');
        expect(restoredSnapshot.appState.currentPlayers).toEqual([2, 1]);
    });

    it('round-trips a second-innings chase snapshot', () => {
        const snapshot = buildSavedMatchSnapshot({
            state: {
                team1: 'India',
                team2: 'Australia',
                team1_data: { score: 165 },
                team2_data: {},
                team1_data2: {},
                team2_data2: {},
                matchType: 'oneday',
                result: null,
                timestamp: null,
            },
            playerObj: {
                team1: Array.from({ length: 11 }, (_, index) => `India Player ${index + 1}`),
                team2: Array.from({ length: 11 }, (_, index) => `Australia Player ${index + 1}`),
            },
            appState: {
                score: 120,
                wickets: 4,
                players: [30, 20, 18, 15, 37, 0, 0, 0, 0, 0, 0],
                currentPlayers: [4, 5],
                totalTeamScore: 165,
                team2FirstInningsScore: 0,
                team1SecondInningsScore: 0,
                testTarget: null,
                innings: 2,
                playersOut: [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                Bool: false,
                striker: 4,
                matchOver: 0,
                fallOn: [22, 49, 73, 83, '', '', '', '', '', ''],
                playerFell: ['Australia Player 1', 'Australia Player 2', 'Australia Player 3', 'Australia Player 4', '', '', '', '', '', ''],
                currentOver: 14,
                ballInOver: 2,
            },
            saveName: 'Chase in progress',
        });

        const restoredSnapshot = normalizeSavedMatch(JSON.stringify(snapshot));

        expect(restoredSnapshot.saveName).toBe('Chase in progress');
        expect(restoredSnapshot.appState.innings).toBe(2);
        expect(restoredSnapshot.appState.totalTeamScore).toBe(165);
        expect(restoredSnapshot.appState.score).toBe(120);
        expect(restoredSnapshot.appState.wickets).toBe(4);
        expect(restoredSnapshot.appState.currentOver).toBe(14);
        expect(restoredSnapshot.appState.ballInOver).toBe(2);
    });

    it('marks backend saved records with the backend storage flag', () => {
        const snapshot = createBaseSnapshot({ saveName: 'Backend Save' });
        const record = normalizeSavedMatchRecord({
            id: '507f1f77bcf86cd799439011',
            name: 'Backend Save',
            updatedAt: snapshot.savedAt,
            storageLocation: BACKEND_SAVE_STORAGE,
            snapshot,
        });

        expect(record.storageLocation).toBe(BACKEND_SAVE_STORAGE);
    });

    it('defaults browser saves to local storage metadata', () => {
        const snapshot = createBaseSnapshot({ saveName: 'Browser Save' });
        const record = normalizeSavedMatchRecord({
            name: 'Browser Save',
            updatedAt: snapshot.savedAt,
            snapshot,
        });

        expect(record.storageLocation).toBe(LOCAL_SAVE_STORAGE);
    });
});
