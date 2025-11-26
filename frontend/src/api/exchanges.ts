import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export interface ExchangeConnectRequest {
    exchange_name: string;
    api_key: string;
    api_secret: string;
    is_testnet: boolean;
    account_type: string;  // "spot" or "future"
}

export interface ExchangeStatus {
    id: number;
    exchange_name: string;
    is_active: boolean;
    is_testnet: boolean;
    account_type: string;
    last_synced_at: string | null;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const exchangesAPI = {
    connect: async (data: ExchangeConnectRequest): Promise<ExchangeStatus> => {
        const response = await axios.post(
            `${API_BASE_URL}/exchanges/connect`,
            data,
            { headers: getAuthHeaders() }
        );
        return response.data;
    },

    getStatus: async (): Promise<ExchangeStatus[]> => {
        const response = await axios.get(
            `${API_BASE_URL}/exchanges/status`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    },

    sync: async (exchangeId: number): Promise<{ message: string }> => {
        const response = await axios.post(
            `${API_BASE_URL}/exchanges/sync/${exchangeId}`,
            {},
            { headers: getAuthHeaders() }
        );
        return response.data;
    }
};
