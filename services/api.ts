import axios from 'axios';

const API_URL = '/api'; // Proxy will handle this

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;

export const getFinancialWisdom = async () => {
    const response = await api.get('/financial-wisdom');
    return response.data;
};
