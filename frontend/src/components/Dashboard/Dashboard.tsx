import React, { useEffect, useState, useCallback } from 'react';
import { API_BASE_URL } from '../../config/api';
import WidgetLibrary, { WidgetType } from './Widgets/WidgetLibrary';
import AccountBalanceWidget from './Widgets/AccountBalanceWidget';
import AvgWinLossWidget from './Widgets/AvgWinLossWidget';
import TradeExpectancyWidget from './Widgets/TradeExpectancyWidget';
import StreakWidget from './Widgets/StreakWidget';
import DrawdownWidget from './Widgets/DrawdownWidget';
import PerformanceChartWidget from './Widgets/PerformanceChartWidget';
import RecentTradesWidget from './Widgets/RecentTradesWidget';
import StatWidget from './Widgets/StatWidget';
import ZellaScoreWidget from './Widgets/ZellaScoreWidget';
import CalendarWidget from './Widgets/CalendarWidget';
import ProgressTrackerWidget from './Widgets/ProgressTrackerWidget';
import ReportWidget from './Widgets/ReportWidget';
import ExternalLinksWidget from './Widgets/ExternalLinksWidget';
import { DollarSign, TrendingUp, BarChart2, Activity } from 'lucide-react';
import { exchangesAPI } from '../../api/exchanges';

interface DashboardProps {
  showLibrary?: boolean;
  setShowLibrary?: (show: boolean) => void;
}

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

const Dashboard: React.FC<DashboardProps> = ({ showLibrary = false, setShowLibrary }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [onboarding, setOnboarding] = useState<any>(null);
  const [exchangeBalance, setExchangeBalance] = useState<number | null>(null);
  const [exchangePositions, setExchangePositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Default widgets - Reordered for priority
  const DEFAULT_WIDGETS: WidgetType[] = [
    'account_balance_pnl',
    'daily_net_cumulative_pnl', // Performance Curve
    'zella_score',
    'net_pnl',
    'profit_factor',
    'trade_win_percent',
    'calendar',
    'recent_trades_open_positions',
    'avg_win_loss',
    'max_drawdown'
  ];

  const [activeWidgets, setActiveWidgets] = useState<WidgetType[]>(() => {
    const saved = localStorage.getItem('dashboard_widgets');
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
  });

  // Save widgets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dashboard_widgets', JSON.stringify(activeWidgets));
  }, [activeWidgets]);

  const loadData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      const [metricsRes, tradesRes, onboardingRes] = await Promise.all([
        fetch(`${API_BASE_URL}/metrics/performance`, { headers }),
        fetch(`${API_BASE_URL}/trades/`, { headers }),
        fetch(`${API_BASE_URL}/users/me/onboarding`, { headers })
      ]);

      if (metricsRes.ok && tradesRes.ok) {
        const metricsData = await metricsRes.json();
        const tradesData = await tradesRes.json();

        setMetrics(metricsData);
        setTrades(Array.isArray(tradesData) ? tradesData : []);

        if (onboardingRes.ok) {
          const onboardingData = await onboardingRes.json();
          setOnboarding(onboardingData);
        }
      } else {
        console.error('API error:', metricsRes.status, tradesRes.status);
        setEmptyDefaults();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setEmptyDefaults();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadExchangeData = useCallback(async () => {
    try {
      const connections = await exchangesAPI.getStatus();
      const activeConn = connections.find(c => c.is_active);

      if (activeConn) {
        try {
          const balanceData = await exchangesAPI.getBalance(activeConn.id);
          // For futures, balance is usually in 'totalWalletBalance' or similar in the list
          // For spot, it's different. Let's try to parse it safely.

          let totalBalance = 0;

          console.log("Exchange Balance Data:", balanceData);

          if (Array.isArray(balanceData.balance)) {
            // Futures: list of assets from /fapi/v2/balance
            const usdt = balanceData.balance.find((b: any) => b.asset === 'USDT');
            if (usdt) {
              // Futures balance includes balance + crossUnPnl
              totalBalance = parseFloat(usdt.balance);
            }
          } else if (balanceData.balance && balanceData.balance.balances) {
            // Spot: object from /api/v3/account with balances array
            const usdt = balanceData.balance.balances.find((b: any) => b.asset === 'USDT');
            if (usdt) {
              totalBalance = parseFloat(usdt.free) + parseFloat(usdt.locked);
            }
          } else if (balanceData.balance && balanceData.balance.totalWalletBalance) {
            // Another common futures API response format
            totalBalance = parseFloat(balanceData.balance.totalWalletBalance);
          }

          // Fallback if we can't parse perfectly but it has an array somewhere
          if (totalBalance === 0 && balanceData.balance) {
            const arr = Array.isArray(balanceData.balance) ? balanceData.balance :
              (Array.isArray(balanceData.balance.balances) ? balanceData.balance.balances : []);

            const usdt = arr.find((b: any) => b.asset === 'USDT');
            if (usdt) {
              totalBalance = parseFloat(usdt.balance || usdt.free || 0);
            }
          }

          console.log("Parsed Total Balance (USDT):", totalBalance);

          if (totalBalance > 0) {
            setExchangeBalance(totalBalance);
          }
        } catch (err) {
          console.error("Failed to load exchange balance", err);
        }

        try {
          const positionsData = await exchangesAPI.getPositions(activeConn.id);
          if (positionsData.positions && Array.isArray(positionsData.positions)) {
            setExchangePositions(positionsData.positions);
          }
        } catch (err) {
          console.error("Failed to load exchange positions", err);
        }
      }
    } catch (err) {
      console.error("Failed to load exchange status", err);
    }
  }, []);

  useEffect(() => {
    loadExchangeData();
  }, [loadExchangeData]);

  const setEmptyDefaults = () => {
    setMetrics({
      total_trades: 0,
      winning_trades: 0,
      losing_trades: 0,
      win_rate: 0,
      total_pnl: 0,
      average_win: 0,
      average_loss: 0,
      profit_factor: 0,
      largest_win: 0,
      largest_loss: 0
    });
    setTrades([]);
  };

  const handleAddWidget = (type: WidgetType) => {
    if (!activeWidgets.includes(type)) {
      setActiveWidgets(prev => [...prev, type]);
    }
  };

  const handleRemoveWidget = (type: WidgetType) => {
    setActiveWidgets(activeWidgets.filter(w => w !== type));
  };

  const getCurrencySymbol = (currencyCode: string) => {
    switch (currencyCode) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      case 'INR': return '₹';
      default: return '$';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!metrics) return null;

  const currencySymbol = onboarding?.currency ? getCurrencySymbol(onboarding.currency) : '$';
  const initialBalance = onboarding?.initial_balance || 0;
  // Use exchange balance if available, otherwise calculate from initial + pnl
  const currentBalance = exchangeBalance !== null ? exchangeBalance : (initialBalance + metrics.total_pnl);

  // Prepare data for charts
  const chartData = trades
    .filter(t => t.status === 'CLOSED' && t.pnl !== undefined)
    .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime())
    .map(t => ({ date: t.entry_date, pnl: t.pnl || 0 }));

  // Calculate streaks (simplified logic for demo)
  let currentDayStreak = 0;
  let currentTradeStreak = 0;
  // TODO: Implement real streak logic based on dates and consecutive wins

  // Calculate drawdown (simplified)
  const maxDrawdown = metrics.largest_loss; // Placeholder
  const avgDrawdown = metrics.average_loss; // Placeholder

  // Calculate expectancy
  const expectancy = (metrics.win_rate / 100 * metrics.average_win) - ((1 - metrics.win_rate / 100) * Math.abs(metrics.average_loss));

  return (
    <div className="space-y-6">
      {/* Welcome Message based on Onboarding */}
      {onboarding && (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/5 rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to your Dashboard! 🚀</h2>
          <p className="text-gray-400">
            You're set up as a <span className="text-blue-400 font-semibold capitalize">{onboarding.trading_experience}</span> trader
            targeting <span className="text-purple-400 font-semibold capitalize">{onboarding.goals?.[0] || 'Success'}</span>.
            Let's grow that <span className="text-green-400 font-semibold">{currencySymbol}{initialBalance.toLocaleString()}</span> account!
          </p>
        </div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(180px,auto)] gap-6 pb-20">
        {activeWidgets.map(widgetId => {
          // Determine spans based on widget type
          let spanClass = "col-span-1 row-span-1";

          if (['daily_net_cumulative_pnl', 'net_daily_pnl', 'drawdown_chart'].includes(widgetId)) {
            spanClass = "col-span-1 md:col-span-2 lg:col-span-2 row-span-2";
          } else if (['calendar', 'calendar_advanced', 'yearly_calendar'].includes(widgetId)) {
            spanClass = "col-span-1 md:col-span-2 lg:col-span-2 row-span-2";
          } else if (['recent_trades_open_positions', 'progress_tracker'].includes(widgetId)) {
            spanClass = "col-span-1 md:col-span-2 row-span-1";
          }

          const renderWidget = () => {
            switch (widgetId) {
              // --- Core Metrics ---
              case 'account_balance_pnl':
                return (
                  <AccountBalanceWidget
                    key={widgetId}
                    balance={currentBalance}
                    totalPnl={metrics.total_pnl}
                    currency={currencySymbol}
                    onRemove={() => handleRemoveWidget(widgetId)}
                  />
                );
              case 'zella_score':
                return (
                  <ZellaScoreWidget
                    key={widgetId}
                    score={85}
                    onRemove={() => handleRemoveWidget(widgetId)}
                  />
                );
              case 'net_pnl':
                return (
                  <StatWidget
                    key={widgetId}
                    title="Net P&L"
                    value={`${currencySymbol}${metrics.total_pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    trend={metrics.total_pnl >= 0 ? 'up' : 'down'}
                    trendValue="+5.2%"
                    icon={<DollarSign size={16} />}
                    color={metrics.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}
                    onRemove={() => handleRemoveWidget(widgetId)}
                  />
                );
              case 'profit_factor':
                return (
                  <StatWidget
                    key={widgetId}
                    title="Profit Factor"
                    value={metrics.profit_factor.toFixed(2)}
                    trend="neutral"
                    icon={<BarChart2 size={16} />}
                    color="text-blue-400"
                    onRemove={() => handleRemoveWidget(widgetId)}
                  />
                );
              case 'trade_win_percent':
                return (
                  <StatWidget
                    key={widgetId}
                    title="Trade Win %"
                    value={`${metrics.win_rate.toFixed(1)}%`}
                    subValue={`${metrics.winning_trades}W / ${metrics.losing_trades}L`}
                    trend="up"
                    trendValue="+1.2%"
                    icon={<TrendingUp size={16} />}
                    color="text-emerald-400"
                    onRemove={() => handleRemoveWidget(widgetId)}
                  />
                );
              case 'day_win_percent':
                return (
                  <StatWidget
                    key={widgetId}
                    title="Day Win %"
                    value="65.0%"
                    trend="down"
                    trendValue="-2.1%"
                    icon={<Activity size={16} />}
                    color="text-teal-400"
                    onRemove={() => handleRemoveWidget(widgetId)}
                  />
                );

              // --- Performance ---
              case 'avg_win_loss':
                return (
                  <AvgWinLossWidget
                    key={widgetId}
                    avgWin={metrics.average_win}
                    avgLoss={metrics.average_loss}
                    onRemove={() => handleRemoveWidget(widgetId)}
                  />
                );
              case 'trade_expectancy':
                return (
                  <TradeExpectancyWidget
                    key={widgetId}
                    expectancy={expectancy}
                    onRemove={() => handleRemoveWidget(widgetId)}
                  />
                );

              // --- Charts ---
              case 'daily_net_cumulative_pnl':
              case 'net_daily_pnl':
                return (
                  <PerformanceChartWidget
                    key={widgetId}
                    data={chartData}
                    onRemove={() => handleRemoveWidget(widgetId)}
                  />
                );

              // --- Calendars ---
              case 'calendar':
                return (
                  <CalendarWidget
                    key={widgetId}
                    trades={trades}
                    viewMode="standard"
                    onRemove={() => handleRemoveWidget(widgetId)}
                  />
                );
              case 'calendar_mini':
                return (
                  <CalendarWidget
                    key={widgetId}
                    trades={trades}
                    viewMode="simple"
                    onRemove={() => handleRemoveWidget(widgetId)}
                  />
                );
              case 'calendar_advanced':
                return (
                  <CalendarWidget
                    key={widgetId}
                    trades={trades}
                    viewMode="advanced"
                    onRemove={() => handleRemoveWidget(widgetId)}
                  />
                );
              case 'yearly_calendar':
                return (
                  <CalendarWidget
                    key={widgetId}
                    trades={trades}
                    viewMode="yearly"
                    onRemove={() => handleRemoveWidget(widgetId)}
                  />
                );

              // --- Lists ---
              case 'recent_trades_open_positions':
                return (
                  <RecentTradesWidget
                    key={widgetId}
                    trades={trades}
                    positions={exchangePositions}
                    onRemove={() => handleRemoveWidget(widgetId)}
                  />
                );

              // --- Risk ---
              case 'max_drawdown':
              case 'average_drawdown':
              case 'drawdown_chart':
                return (
                  <DrawdownWidget
                    key={widgetId}
                    maxDrawdown={maxDrawdown}
                    avgDrawdown={avgDrawdown}
                    onRemove={() => handleRemoveWidget(widgetId)}
                  />
                );

              // --- Analytics ---
              case 'progress_tracker':
                return (
                  <ProgressTrackerWidget
                    key={widgetId}
                    onRemove={() => handleRemoveWidget(widgetId)}
                  />
                );
              case 'report_widget':
                return (
                  <ReportWidget
                    key={widgetId}
                    onRemove={() => handleRemoveWidget(widgetId)}
                  />
                );

              // --- Utility ---
              case 'external_links':
                return (
                  <ExternalLinksWidget
                    key={widgetId}
                    onRemove={() => handleRemoveWidget(widgetId)}
                  />
                );

              // --- Streaks ---
              case 'current_streak_combined':
                return (
                  <StreakWidget
                    key={widgetId}
                    currentDayStreak={currentDayStreak}
                    currentTradeStreak={currentTradeStreak}
                    onRemove={() => handleRemoveWidget(widgetId)}
                  />
                );

              // Fallback
              default:
                return (
                  <div key={widgetId} className="relative group bg-gray-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                    <button
                      onClick={() => handleRemoveWidget(widgetId)}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                    <div className="p-3 rounded-full bg-gray-800/50 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-300 mb-1 capitalize">{(widgetId as string).replace(/_/g, ' ')}</h3>
                    <p className="text-sm text-gray-500">Coming Soon</p>
                  </div>
                );
            }
          };

          return (
            <div key={widgetId} className={`${spanClass} h-full`}>
              {renderWidget()}
            </div>
          );
        })}
      </div>

      {/* Widget Library Modal */}
      <WidgetLibrary
        isOpen={!!showLibrary}
        onClose={() => setShowLibrary && setShowLibrary(false)}
        onAddWidget={handleAddWidget}
        activeWidgets={activeWidgets}
      />
    </div>
  );
};

export default Dashboard;
