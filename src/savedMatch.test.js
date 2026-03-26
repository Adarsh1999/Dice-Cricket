import { describe, expect, it } from 'vitest';
import {
    BACKEND_SAVE_STORAGE,
    LOCAL_SAVE_STORAGE,
    buildSavedMatchSnapshot,
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
