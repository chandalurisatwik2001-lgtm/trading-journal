import axios from 'axios';

const API_BASE_URL = (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) || 'http://localhost:8000/api/v1';

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

export const exchangesAPI = {
    connect: async (data: ExchangeConnectRequest): Promise<ExchangeStatus> => {
        const response = await axios.post(`${API_BASE_URL}/exchanges/connect`, data);
        return response.data;
    },

    getStatus: async (): Promise<ExchangeStatus[]> => {
        const response = await axios.get(`${API_BASE_URL}/exchanges/status`);
        return response.data;
    },

    sync: async (exchangeId: number): Promise<{ message: string }> => {
        const response = await axios.post(`${API_BASE_URL}/exchanges/sync/${exchangeId}`);
        return response.data;
    }
};
