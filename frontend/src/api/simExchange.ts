import axios from 'axios';

import { API_BASE_URL } from '../config/api';

const apiClient = axios.create({
    baseURL: `${API_BASE_URL}/sim_exchange`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface WalletBalance {
    id: number;
    asset: string;
    balance: number;
    locked_balance: number;
}

export interface MarketOrderRequest {
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
}

export interface OrderResponse {
    message: string;
    symbol: string;
    side: string;
    quantity: number;
    price: number;
    total: number;
    trade_id: number;
}

export const simExchangeAPI = {
    getWallets: async (): Promise<WalletBalance[]> => {
        const response = await apiClient.get('/wallet');
        return response.data;
    },

    placeMarketOrder: async (order: MarketOrderRequest): Promise<OrderResponse> => {
        const response = await apiClient.post('/order/market', order);
        return response.data;
    },
};
