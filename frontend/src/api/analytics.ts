import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

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
    const response = await axios.get(`${API_BASE_URL}/analytics/performance`);
    return response.data;
  }
};
