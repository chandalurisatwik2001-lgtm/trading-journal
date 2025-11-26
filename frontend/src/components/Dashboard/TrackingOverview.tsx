import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { API_BASE_URL } from '../../config/api';

interface PerformanceMetrics {
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

interface Trade {
  id: number;
  symbol: string;
  direction: string;
  entry_date: string;
  entry_price: number;
  quantity: number;
  pnl?: number;
  status: string;
}

const TrackingOverview: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      const [metricsRes, tradesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/metrics/performance`, { headers }),
        fetch(`${API_BASE_URL}/trades/`, { headers })
      ]);

      const metricsData = await metricsRes.json();
      const tradesData = await tradesRes.json();

      setMetrics(metricsData);
      setTrades(tradesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!metrics) {
    return <div className="p-8 text-center">No data available</div>;
  }

  const zellaScore = Math.round(metrics.win_rate);

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tracking overview</h1>
          <p className="text-sm text-gray-500">Snapshot of your performance, Zella score and weekly P&L.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-red-500 bg-red-50 px-3 py-1 rounded border border-red-200">
            ⚠️ Your subscription is inactive. <a href="#" className="underline font-medium">Activate now</a>
          </div>
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">TR</button>
        </div>
      </div>

      <div className="p-6">
        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Week Summary */}
          <div className="col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Week 4 summary</h2>
                <span className="text-sm text-gray-500">Demo layout (static)</span>
              </div>

              {/* P&L and Zella Score */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Week 4 P&L</div>
                  <div className={`text-4xl font-bold ${metrics.total_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${metrics.total_pnl.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">{trades.length} trades this week</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Zella score</div>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-purple-600">{zellaScore}</div>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                      Active
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">Journal trades consistently to unlock your Zella score.</div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b mb-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition ${activeTab === 'overview'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('playbook')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition ${activeTab === 'playbook'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Playbook edge
                </button>
                <button
                  onClick={() => setActiveTab('winrate')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition ${activeTab === 'winrate'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Win rate
                </button>
                <button
                  onClick={() => setActiveTab('risk')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition ${activeTab === 'risk'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Risk & R-multiple
                </button>
              </div>

              {/* Recent Trades */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Recent trades</h3>
                {trades.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No trades yet</div>
                ) : (
                  <div className="space-y-2">
                    {trades.slice(0, 4).map(trade => (
                      <div
                        key={trade.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${trade.direction === 'LONG' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div>
                            <div className="font-bold text-gray-900">{trade.symbol}</div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(trade.entry_date), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>
                        <div className={`text-xl font-bold ${trade.pnl && trade.pnl > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trade.pnl ? `${trade.pnl > 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Zella AI & Performance Stats */}
          <div className="space-y-6">
            {/* Zella AI */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Zella AI</h3>
                <span className="px-2 py-1 text-xs font-bold bg-purple-600 text-white rounded">BETA</span>
              </div>
              <div className="text-sm text-gray-700 mb-4">
                Coaching insights based on your trades and journaling.
              </div>

              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl">👋</div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-2">Hi! I'm Zella AI</div>
                    <p className="text-sm text-gray-600">
                      It looks like your subscription is currently inactive, so I don't see any new trades for Week 4.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-3">
                  Reactivate your subscription and keep journaling so I can help you:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Spot patterns in your winning setups</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Flag recurring risk mistakes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Score your consistency across the week</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                  Show me my best week
                </button>
                <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                  Explain Zella score
                </button>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Performance stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm text-gray-600">Total trades</span>
                  <span className="text-lg font-bold text-gray-900">{metrics.total_trades}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm text-gray-600">Win rate</span>
                  <span className={`text-lg font-bold ${metrics.win_rate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.win_rate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm text-gray-600">Profit factor</span>
                  <span className={`text-lg font-bold ${metrics.profit_factor >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.profit_factor.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm text-gray-600">Best trade</span>
                  <span className="text-lg font-bold text-green-600">${metrics.largest_win.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Worst trade</span>
                  <span className="text-lg font-bold text-red-600">${metrics.largest_loss.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingOverview;
