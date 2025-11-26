import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export interface PerformanceMetrics {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_pnl: number;
  average_win: number;
  average_loss: number;
  profit_factor: number;
  largest_win: number;
  largest_loss: number;
}

export const analyticsAPI = {
  getPerformance: async (): Promise<PerformanceMetrics> => {
    const response = await axios.get(`${API_BASE_URL}/metrics/performance`);
    return response.data;
  },

  getCumulativePnL: async (): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/metrics/cumulative-pnl`);
    return response.data;
  },

  getTradeDistribution: async (): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/metrics/distribution`);
    return response.data;
  },

  getAssetPerformance: async (): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/metrics/asset-performance`);
    return response.data;
  }
};
