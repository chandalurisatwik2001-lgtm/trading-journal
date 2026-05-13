import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({ baseURL: `${API_BASE_URL}/portfolio` });
api.interceptors.request.use(cfg => {
    const token = localStorage.getItem('token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

export const portfolioAPI = {
    getSummary: () => api.get('/summary').then(r => r.data),
};
