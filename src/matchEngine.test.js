import { describe, expect, it } from 'vitest';
import { advanceInningsState, createInitialMatchEngineState, getMatchInningsVictoryMargin, matchEngineReducer } from './matchEngine';

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

    it.each([
        [100, 300, 100, 100],
        [137, 258, 78, 43],
        [100, 201, 100, 1],
    ])('ends after three innings for totals %s, %s, %s', (first, second, third, margin) => {
        const state = {
            ...createInitialMatchEngineState(),
            innings: 3,
            wickets: 10,
            totalTeamScore: first,
            team2FirstInningsScore: second,
            score: third,
        };

        expect(getMatchInningsVictoryMargin(state, { isTestMatch: true })).toBe(margin);
        expect(advanceInningsState(state, { isTestMatch: true, maxInnings: 4 })).toBe(state);
        expect(matchEngineReducer(state, { type: 'ROLL', value: 6 })).toBe(state);
    });

    it('allows the trailing side to continue batting until its final wicket falls', () => {
        const state = {
            ...createInitialMatchEngineState(),
            innings: 3,
            wickets: 9,
            totalTeamScore: 100,
            team2FirstInningsScore: 300,
            score: 100,
        };
        expect(getMatchInningsVictoryMargin(state, { isTestMatch: true })).toBeNull();
        const finalBall = matchEngineReducer(state, { type: 'ROLL', value: 5, battingPlayers });
        expect(finalBall.wickets).toBe(10);
        expect(getMatchInningsVictoryMargin(finalBall, { isTestMatch: true })).toBe(100);
    });

    it('requires a fourth innings with target one when the aggregate scores are level', () => {
        const state = {
            ...createInitialMatchEngineState(),
            innings: 3,
            wickets: 10,
            totalTeamScore: 100,
            team2FirstInningsScore: 300,
            score: 200,
        };
        expect(getMatchInningsVictoryMargin(state, { isTestMatch: true })).toBeNull();
        const nextState = advanceInningsState(state, { isTestMatch: true, maxInnings: 4 });
        expect(nextState.innings).toBe(4);
        expect(nextState.testTarget).toBe(1);
        expect(nextState.matchOver).toBe(0);
    });

    it('does not apply the innings victory rule to one-day matches', () => {
        const state = {
            ...createInitialMatchEngineState(),
            innings: 2,
            wickets: 10,
            totalTeamScore: 100,
            team2FirstInningsScore: 300,
            score: 50,
        };
        expect(getMatchInningsVictoryMargin(state)).toBeNull();
    });

    it('does not advance a completed match', () => {
        const state = { ...createInitialMatchEngineState(), innings: 3, wickets: 10, score: 300, matchOver: 1 };
        expect(advanceInningsState(state, { isTestMatch: true, maxInnings: 4 })).toBe(state);
    });
});
