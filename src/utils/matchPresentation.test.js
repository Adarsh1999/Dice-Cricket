import { describe, expect, it } from 'vitest';
import { getMatchInnings, getMatchResult, getTestTarget } from './matchPresentation';

const inningsVictory = {
    team1: 'India',
    team2: 'Australia',
    matchType: 'test',
    team1_data: { score: 137, wickets: 10 },
    team2_data: { score: 258, wickets: 10 },
    team1_data2: { score: 78, wickets: 10 },
    // A record saved by the old code incorrectly contains a fourth innings.
    team2_data2: { score: 1, wickets: 2 },
    result: 'Australia won by 8 wickets',
};

describe('innings victories in scorecards and archives', () => {
    it('shows the correct result and three innings for the reported India match', () => {
        expect(getMatchResult(inningsVictory)).toBe('Australia won by an innings and 43 runs');
        const records = getMatchInnings(inningsVictory);
        expect(records.map((record) => record.innings)).toEqual([1, 2, 3]);
        expect(records.map((record) => record.data.score)).toEqual([137, 258, 78]);
        expect(getTestTarget(inningsVictory)).toBeNull();
    });

    it('formats a one-run innings victory', () => {
        const match = { ...inningsVictory, team2_data: { score: 216, wickets: 10 } };
        expect(getMatchResult(match)).toBe('Australia won by an innings and 1 run');
    });

    it('keeps four innings and a target of one when the aggregate scores are equal', () => {
        const match = { ...inningsVictory, team2_data: { score: 215, wickets: 10 } };
        expect(getTestTarget(match)).toBe(1);
        expect(getMatchInnings(match)).toHaveLength(4);
        expect(getMatchResult(match)).toBe(match.result);
    });

    it('keeps four innings for a normal Test chase', () => {
        const match = { ...inningsVictory, team2_data: { score: 196, wickets: 10 } };
        expect(getTestTarget(match)).toBe(20);
        expect(getMatchInnings(match)).toHaveLength(4);
        expect(getMatchResult(match)).toBe(match.result);
    });

    it('does not infer an innings victory before the third innings is all out', () => {
        const match = { ...inningsVictory, team1_data2: { score: 78, wickets: 9 } };
        expect(getMatchInnings(match)).toHaveLength(4);
        expect(getMatchResult(match)).toBe(match.result);
    });

    it('ignores leftover Test innings in one-day records', () => {
        const match = { ...inningsVictory, matchType: 'oneday' };
        expect(getMatchInnings(match)).toHaveLength(2);
        expect(getMatchResult(match)).toBe(match.result);
    });
});
