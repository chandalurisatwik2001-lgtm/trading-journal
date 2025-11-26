import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Set auth token from localStorage
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export interface Trade {
  id?: number;
  symbol: string;
  asset_type: string;
  direction: 'LONG' | 'SHORT';
  status?: 'OPEN' | 'CLOSED';
  entry_date: string;
  entry_price: number;
  quantity: number;
  exit_date?: string;
  exit_price?: number;
  stop_loss?: number;
  take_profit?: number;
  commission?: number;
  fees?: number;
  pnl?: number;
  pnl_percent?: number;
  strategy?: string;
  setup?: string;
  notes?: string;
  tags?: string;
}

export const tradesAPI = {
  getAll: async (): Promise<Trade[]> => {
    const response = await axios.get(`${API_BASE_URL}/trades/`);
    return response.data;
  },

  getById: async (id: number): Promise<Trade> => {
    const response = await axios.get(`${API_BASE_URL}/trades/${id}`);
    return response.data;
  },

  create: async (trade: Trade): Promise<Trade> => {
    const response = await axios.post(`${API_BASE_URL}/trades/`, trade);
    return response.data;
  },

  update: async (id: number, trade: Partial<Trade>): Promise<Trade> => {
    const response = await axios.put(`${API_BASE_URL}/trades/${id}`, trade);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/trades/${id}`);
  }
};
