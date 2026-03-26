const DB_NAME = 'diceCricket';
const DB_VERSION = 1;
const STORE_NAME = 'savedMatches';

const openSavedMatchDb = () =>
    new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !window.indexedDB) {
            reject(new Error('IndexedDB is not available in this environment.'));
            return;
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const database = request.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('Failed to open the saved match database.'));
    });

const runTransaction = async (mode, executor) => {
    const database = await openSavedMatchDb();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);

        transaction.oncomplete = () => {
            database.close();
        };
        transaction.onerror = () => {
            database.close();
            reject(transaction.error || new Error('IndexedDB transaction failed.'));
        };
        transaction.onabort = () => {
            database.close();
            reject(transaction.error || new Error('IndexedDB transaction was aborted.'));
        };

        executor({ store, resolve, reject });
    });
};

export const getAllSavedMatchRecordsFromDb = async () =>
    runTransaction('readonly', ({ store, resolve, reject }) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error || new Error('Failed to read saved matches.'));
    });

export const putSavedMatchRecordInDb = async (record) =>
    runTransaction('readwrite', ({ store, resolve, reject }) => {
        const request = store.put(record);
        request.onsuccess = () => resolve(record);
        request.onerror = () => reject(request.error || new Error('Failed to save the match record.'));
    });

export const deleteSavedMatchRecordFromDb = async (recordId) =>
    runTransaction('readwrite', ({ store, resolve, reject }) => {
        const request = store.delete(recordId);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error || new Error('Failed to delete the match record.'));
    });
