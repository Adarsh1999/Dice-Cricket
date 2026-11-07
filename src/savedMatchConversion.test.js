import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    AUTO_SAVE_RECORD_ID,
    BACKEND_SAVE_STORAGE,
    LOCAL_SAVE_STORAGE,
    SAVED_MATCHES_STORAGE_KEY,
    SAVED_MATCH_STORAGE_KEY,
    buildSavedMatchSnapshot,
    convertSavedMatchRecordToTest,
    readSavedMatchRecordsFromStorage,
} from './savedMatch';

const api = vi.hoisted(() => ({ fetch: vi.fn(), update: vi.fn() }));
vi.mock('./savedMatchApi', () => ({
    fetchSavedMatchRecordsFromApi: api.fetch,
    updateSavedMatchRecordOnApi: api.update,
    createSavedMatchRecordOnApi: vi.fn(),
    deleteSavedMatchRecordOnApi: vi.fn(),
}));

const createRecord = (storageLocation = BACKEND_SAVE_STORAGE, isAutoSave = false) => ({
    id: isAutoSave ? AUTO_SAVE_RECORD_ID : 'saved-fixture',
    name: isAutoSave ? 'Auto Save' : 'ind vs aus',
    storageLocation,
    isAutoSave,
    updatedAt: '2026-11-07T11:02:30.648Z',
    snapshot: buildSavedMatchSnapshot({
        state: { team1: 'Australia', team2: 'India', matchType: 'oneday', team1_data: { score: 144, wickets: 10 } },
        playerObj: {},
        appState: { innings: 2, score: 32, wickets: 2, totalTeamScore: 144 },
        saveName: isAutoSave ? 'Auto Save' : 'ind vs aus',
    }),
});

describe('converting saved records to Test', () => {
    beforeEach(() => {
        const entries = new Map();
        vi.stubGlobal('window', { localStorage: {
            getItem: (key) => entries.get(key) ?? null,
            setItem: (key, value) => entries.set(key, value),
            removeItem: (key) => entries.delete(key),
        } });
        api.fetch.mockReset().mockResolvedValue([]);
        api.update.mockReset();
    });

    afterEach(() => vi.unstubAllGlobals());

    it('updates a backend save using its current server snapshot and keeps its name and ID', async () => {
        const original = createRecord();
        api.fetch.mockResolvedValue([original]);
        api.update.mockImplementation(async (id, payload) => {
            const updated = { ...original, ...payload, matchType: 'test', updatedAt: payload.snapshot.savedAt };
            api.fetch.mockResolvedValue([updated]);
            return updated;
        });
        const records = await convertSavedMatchRecordToTest(original.id);
        expect(api.update).toHaveBeenCalledOnce();
        expect(api.update.mock.calls[0][0]).toBe(original.id);
        expect(api.update.mock.calls[0][1]).toMatchObject({
            name: original.name,
            snapshot: { state: { matchType: 'test' }, appState: { innings: 2, score: 32, wickets: 2, totalTeamScore: 144 } },
        });
        expect(records[0]).toMatchObject({ id: original.id, name: original.name, storageLocation: BACKEND_SAVE_STORAGE });
        expect((await readSavedMatchRecordsFromStorage())[0].snapshot.state.matchType).toBe('test');
    });

    it.each([true, false])('converts a local record without an API update (auto-save: %s)', async (isAutoSave) => {
        const original = createRecord(LOCAL_SAVE_STORAGE, isAutoSave);
        window.localStorage.setItem(SAVED_MATCHES_STORAGE_KEY, JSON.stringify([original]));
        const records = await convertSavedMatchRecordToTest(original.id);
        expect(api.update).not.toHaveBeenCalled();
        expect(records[0]).toMatchObject({ id: original.id, name: original.name, isAutoSave, storageLocation: LOCAL_SAVE_STORAGE });
        expect(records[0].snapshot.state.matchType).toBe('test');
        expect(JSON.parse(window.localStorage.getItem(SAVED_MATCH_STORAGE_KEY)).state.matchType).toBe('test');
        expect((await readSavedMatchRecordsFromStorage())[0].snapshot.appState).toEqual(original.snapshot.appState);
    });

    it('persists the new Test name for a save using the automatically generated name', async () => {
        const original = createRecord();
        original.name = 'Australia vs India - One Day - Innings 2';
        original.snapshot.saveName = original.name;
        api.fetch.mockResolvedValue([original]);
        api.update.mockImplementation(async (id, payload) => ({ ...original, ...payload, updatedAt: payload.snapshot.savedAt }));
        const records = await convertSavedMatchRecordToTest(original.id);
        expect(records[0].name).toBe('Australia vs India - Test - Innings 2');
        expect(api.update.mock.calls[0][1].name).toBe('Australia vs India - Test - Innings 2');
        expect(records[0].snapshot.appState).toEqual(original.snapshot.appState);
    });

    it('keeps the ODI save when its backend update fails', async () => {
        const original = createRecord();
        api.fetch.mockResolvedValue([original]);
        api.update.mockRejectedValue(new Error('Network unavailable'));
        window.localStorage.setItem(SAVED_MATCH_STORAGE_KEY, JSON.stringify(original.snapshot));
        await expect(convertSavedMatchRecordToTest(original.id)).rejects.toThrow('Network unavailable');
        const records = JSON.parse(window.localStorage.getItem(SAVED_MATCHES_STORAGE_KEY));
        expect(records[0].snapshot.state.matchType).toBe('oneday');
        expect(JSON.parse(window.localStorage.getItem(SAVED_MATCH_STORAGE_KEY)).state.matchType).toBe('oneday');
    });

    it('does not reconvert or rewrite an existing Test save', async () => {
        const original = createRecord();
        original.snapshot.state.matchType = 'test';
        api.fetch.mockResolvedValue([original]);
        const records = await convertSavedMatchRecordToTest(original.id);
        expect(api.update).not.toHaveBeenCalled();
        expect(records[0].updatedAt).toBe(original.updatedAt);
    });

    it('reports a missing save without creating a new one', async () => {
        await expect(convertSavedMatchRecordToTest('missing')).rejects.toThrow('Saved match not found');
        expect(api.update).not.toHaveBeenCalled();
    });
});
