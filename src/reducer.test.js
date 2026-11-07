import { describe, expect, it, vi } from 'vitest';
import reducer, { initialState } from './reducer';

describe('starting a new fixture', () => {
    it.each([
        ['test', 'test'],
        ['oneday', 'oneday'],
        [undefined, 'test'],
    ])('starts a clean fixture with format %s (resolved to %s)', (matchType, expectedMatchType) => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        try {
            const previousMatch = {
                ...initialState,
                team1: 'South_Africa',
                team2: 'Australia',
                team1_data: { score: 271 },
                team2_data: { score: 208 },
                team1_data2: { score: 237 },
                team2_data2: { score: 111 },
                result: 'South_Africa won by 74 runs',
            };
            expect(reducer(previousMatch, { type: 'START_MATCH', team1: 'India', team2: 'Australia', matchType })).toEqual({
                ...initialState,
                team1: 'India',
                team2: 'Australia',
                matchType: expectedMatchType,
            });
        } finally {
            log.mockRestore();
        }
    });
});
