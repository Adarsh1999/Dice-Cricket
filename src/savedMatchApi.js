import axios from './axios';

export const fetchSavedMatchRecordsFromApi = async () => {
    const { data } = await axios.get('/saved-matches');
    return Array.isArray(data?.data) ? data.data : [];
};

export const createSavedMatchRecordOnApi = async ({ name, snapshot, source = 'manual' }) => {
    const { data } = await axios.post('/saved-matches', {
        name,
        snapshot,
        source,
    });

    return data?.data || null;
};

export const updateSavedMatchRecordOnApi = async (recordId, payload) => {
    const { data } = await axios.put(`/saved-matches/${recordId}`, payload);
    return data?.data || null;
};

export const deleteSavedMatchRecordOnApi = async (recordId) => {
    const { data } = await axios.delete(`/saved-matches/${recordId}`);
    return data?.data || null;
};
