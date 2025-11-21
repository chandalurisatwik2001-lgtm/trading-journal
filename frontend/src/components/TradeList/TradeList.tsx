import React, { useEffect, useState } from 'react';
import { tradesAPI, Trade } from '../../api/trades';
import { format } from 'date-fns';

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

const TradeList: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTrades, setSelectedTrades] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const tradesPerPage = 50;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      const [tradesRes, metricsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/trades/`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/analytics/performance`, { headers })
      ]);

      const tradesData = await tradesRes.json();
      const metricsData = await metricsRes.json();

      setTrades(tradesData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  /*
    const handleDelete = async (id: number) => {
      if (window.confirm('Are you sure you want to delete this trade?')) {
        try {
          await tradesAPI.delete(id);
          loadData();
        } catch (error) {
          console.error('Error deleting trade:', error);
          alert('Failed to delete trade');
        }
      }
    };
  */

  /*
    const handleCloseTrade = async (trade: Trade) => {
      const exitPrice = prompt(`Enter exit price for ${trade.symbol}:`, trade.entry_price.toString());
      if (!exitPrice) return;
  
      try {
        await tradesAPI.update(trade.id!, {
          exit_price: parseFloat(exitPrice),
          exit_date: new Date().toISOString(),
          status: 'CLOSED'
        });
        alert(`Trade ${trade.symbol} closed successfully!`);
        loadData();
      } catch (error) {
        console.error('Error closing trade:', error);
        alert('Failed to close trade');
      }
    };
  */

  const toggleSelectTrade = (id: number) => {
    setSelectedTrades(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTrades.length === trades.length) {
      setSelectedTrades([]);
    } else {
      setSelectedTrades(trades.map(t => t.id!));
    }
  };

  const calculateROI = (trade: Trade): number => {
    if (!trade.pnl) return 0;
    const cost = trade.entry_price * trade.quantity;
    return (trade.pnl / cost) * 100;
  };

  // Pagination
  const indexOfLastTrade = currentPage * tradesPerPage;
  const indexOfFirstTrade = indexOfLastTrade - tradesPerPage;
  const currentTrades = trades.slice(indexOfFirstTrade, indexOfLastTrade);
  const totalPages = Math.ceil(trades.length / tradesPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading trades...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Trade Log</h1>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              🔍 Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              📅 Date range
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Demo account
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6">
        {/* Top Metrics Row */}
        {metrics && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <MetricCard
              label="Net cumulative P&L"
              value={`$${metrics.total_pnl.toFixed(0)}`}
              subtitle={`${metrics.total_trades} trades`}
              chart={true}
            />
            <MetricCard
              label="Profit factor"
              value={metrics.profit_factor.toFixed(2)}
              progress={Math.min(metrics.profit_factor * 20, 100)}
            />
            <MetricCard
              label="Trade win %"
              value={`${metrics.win_rate.toFixed(2)}%`}
              progress={metrics.win_rate}
              winLoss={`${metrics.winning_trades} / ${metrics.losing_trades}`}
            />
            <MetricCard
              label="Avg win/loss trade"
              value={metrics.average_win.toFixed(2)}
              winAmount={`$${metrics.average_win.toFixed(0)}`}
              lossAmount={`-$${Math.abs(metrics.average_loss).toFixed(0)}`}
            />
          </div>
        )}

        {/* Trades Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-gray-900">⚙️</button>
              <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Bulk actions
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTrades.length === trades.length && trades.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Open date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Close date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exit price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net P&L</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net ROI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zella Insights</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zella Scale</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTrades.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                      No trades yet. <a href="/new-trade" className="text-purple-600 hover:text-purple-700">Create your first trade →</a>
                    </td>
                  </tr>
                ) : (
                  currentTrades.map(trade => (
                    <tr key={trade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedTrades.includes(trade.id!)}
                          onChange={() => toggleSelectTrade(trade.id!)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {format(new Date(trade.entry_date), 'MM/dd/yyyy')}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{trade.symbol}</td>
                      <td className="px-6 py-4">
                        {trade.status === 'CLOSED' ? (
                          trade.pnl && trade.pnl > 0 ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">WIN</span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">LOSS</span>
                          )
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">OPEN</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {trade.exit_date ? format(new Date(trade.exit_date), 'MM/dd/yyyy') : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">${trade.entry_price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {trade.exit_price ? `$${trade.exit_price.toFixed(2)}` : '-'}
                      </td>
                      <td className={`px-6 py-4 text-sm font-semibold ${trade.pnl && trade.pnl > 0 ? 'text-green-600' : trade.pnl && trade.pnl < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                        {trade.pnl ? `$${trade.pnl.toFixed(2)}` : '-'}
                      </td>
                      <td className={`px-6 py-4 text-sm font-semibold ${trade.pnl && trade.pnl > 0 ? 'text-green-600' : trade.pnl && trade.pnl < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                        {trade.pnl ? `${calculateROI(trade).toFixed(2)}%` : '-'}
                      </td>
                      <td className="px-6 py-4">-</td>
                      <td className="px-6 py-4">
                        {trade.pnl && (
                          <div className="w-24 h-2 bg-gray-200 rounded-full">
                            <div
                              className={`h-2 rounded-full ${trade.pnl > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(Math.abs(calculateROI(trade)) * 10, 100)}%` }}
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Trades per page:</span>
              <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                <option>50</option>
                <option>100</option>
                <option>200</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {indexOfFirstTrade + 1} - {Math.min(indexOfLastTrade, trades.length)} of {trades.length} trades
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  ←
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  {currentPage} of {totalPages} pages
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{
  label: string;
  value: string;
  subtitle?: string;
  chart?: boolean;
  progress?: number;
  winLoss?: string;
  winAmount?: string;
  lossAmount?: string;
}> = ({ label, value, subtitle, chart, progress, winLoss, winAmount, lossAmount }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-gray-600">{label}</span>
      <span className="text-gray-400">ℹ️</span>
    </div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    {chart && (
      <div className="mt-3 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded opacity-20" />
    )}
    {progress !== undefined && (
      <div className="mt-3">
        <div className="relative w-16 h-16 mx-auto">
          <svg className="transform -rotate-90" width="64" height="64">
            <circle cx="32" cy="32" r="28" stroke="#E5E7EB" strokeWidth="4" fill="none" />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke={progress > 50 ? "#10B981" : "#EF4444"}
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${(progress / 100) * 176} 176`}
              strokeLinecap="round"
            />
          </svg>
        </div>
        {winLoss && <div className="text-center text-xs text-gray-500 mt-1">{winLoss}</div>}
      </div>
    )}
    {winAmount && lossAmount && (
      <div className="flex gap-2 mt-3">
        <div className="flex-1 text-center">
          <div className="text-xs text-gray-500">Avg win</div>
          <div className="text-sm font-semibold text-green-600">{winAmount}</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xs text-gray-500">Avg loss</div>
          <div className="text-sm font-semibold text-red-600">{lossAmount}</div>
        </div>
      </div>
    )}
  </div>
);

export default TradeList;
