import axios from 'axios';

const API_URL = '/api'; // Proxy will handle this

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': import.meta.env.VITE_API_ACCESS_KEY || '',
    },
});

export default api;

export const getFinancialWisdom = async () => {
    const response = await api.get('/financial-wisdom');
    return response.data;
};

export const getRhythmicMath = async () => {
    const response = await api.get('/rhythmic-math');
    return response.data;
};
