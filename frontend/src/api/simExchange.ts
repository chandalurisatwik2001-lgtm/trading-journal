import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({ baseURL: `${API_BASE_URL}/sim_exchange` });
api.interceptors.request.use(cfg => {
    const token = localStorage.getItem('token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

export interface WalletBalance { id: number; asset: string; balance: number; locked_balance: number; }
export interface SimPosition {
    id: number; symbol: string; base_asset: string; trade_type: string;
    side: string; quantity: number; entry_price: number; leverage: number;
    margin_used: number; liquidation_price?: number; take_profit?: number;
    stop_loss?: number; status: string; journal_trade_id?: number; created_at: string;
}
export interface SpotOrderRequest { symbol: string; side: 'BUY' | 'SELL'; quantity: number; }
export interface FuturesOrderRequest { symbol: string; side: 'LONG' | 'SHORT'; quantity: number; leverage: number; take_profit?: number; stop_loss?: number; }

export const simExchangeAPI = {
    getWallets: () => api.get<WalletBalance[]>('/wallet').then(r => r.data),
    resetWallet: () => api.post('/wallet/reset').then(r => r.data),
    placeSpotOrder: (order: SpotOrderRequest) => api.post('/order/spot', order).then(r => r.data),
    placeFuturesOrder: (order: FuturesOrderRequest) => api.post('/order/futures', order).then(r => r.data),
    closePosition: (position_id: number) => api.post('/position/close', { position_id }).then(r => r.data),
    getOpenPositions: () => api.get<SimPosition[]>('/positions').then(r => r.data),
    getPositionHistory: () => api.get<SimPosition[]>('/positions/history').then(r => r.data),
};
