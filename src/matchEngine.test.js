import { describe, expect, it } from 'vitest';
import { advanceInningsState, createInitialMatchEngineState, matchEngineReducer } from './matchEngine';

const battingPlayers = Array.from({ length: 11 }, (_, index) => `Player ${index + 1}`);

describe('matchEngineReducer', () => {
    it('records the wicket details immediately when a wicket falls', () => {
        let state = createInitialMatchEngineState();

        state = matchEngineReducer(state, { type: 'ROLL', value: 4, battingPlayers });
        state = matchEngineReducer(state, { type: 'ROLL', value: 5, battingPlayers });

        expect(state.score).toBe(4);
        expect(state.wickets).toBe(1);
        expect(state.playersOut[0]).toBe(1);
        expect(state.currentPlayers).toEqual([2, 1]);
        expect(state.fallOn[0]).toBe(4);
        expect(state.playerFell[0]).toBe('Player 1');
        expect(state.striker).toBe(2);
    });

    it('advances a one-day innings and carries the first innings total', () => {
        const state = {
            ...createInitialMatchEngineState(),
            score: 87,
            wickets: 10,
            innings: 1,
        };

        const nextState = advanceInningsState(state, { isTestMatch: false, maxInnings: 2 });

        expect(nextState.innings).toBe(2);
        expect(nextState.totalTeamScore).toBe(87);
        expect(nextState.score).toBe(0);
        expect(nextState.wickets).toBe(0);
        expect(nextState.currentPlayers).toEqual([0, 1]);
    });

    it('creates the fourth innings target correctly in a test match', () => {
        const state = {
            ...createInitialMatchEngineState(),
            innings: 3,
            wickets: 10,
            score: 95,
            totalTeamScore: 140,
            team2FirstInningsScore: 120,
        };

        const nextState = advanceInningsState(state, { isTestMatch: true, maxInnings: 4 });

        expect(nextState.innings).toBe(4);
        expect(nextState.team1SecondInningsScore).toBe(95);
        expect(nextState.testTarget).toBe(116);
        expect(nextState.score).toBe(0);
        expect(nextState.wickets).toBe(0);
    });
});
