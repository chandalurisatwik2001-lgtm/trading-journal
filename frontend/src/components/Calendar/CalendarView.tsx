import React, { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, getWeek } from 'date-fns';
import { API_BASE_URL } from '../../config/api';

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

const CalendarView: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE_URL}/trades/`, { headers });
      const data = await response.json();
      setTrades(data);
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group trades by day
  const tradesByDay = new Map<string, Trade[]>();
  trades.forEach(trade => {
    const dateKey = format(new Date(trade.entry_date), 'yyyy-MM-dd');
    if (!tradesByDay.has(dateKey)) {
      tradesByDay.set(dateKey, []);
    }
    const dayTrades = tradesByDay.get(dateKey);
    if (dayTrades) {
      dayTrades.push(trade);
    }
  });

  const getDayData = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayTrades = tradesByDay.get(dateKey) || [];
    const pnl = dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const closedTrades = dayTrades.filter(t => t.status === 'CLOSED');
    const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    return { pnl, trades: dayTrades.length, winRate };
  };

  // Calculate monthly stats
  const monthTrades = trades.filter(t => {
    const tradeDate = new Date(t.entry_date);
    return tradeDate >= monthStart && tradeDate <= monthEnd;
  });

  const monthlyPnL = monthTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const tradingDays = new Set(monthTrades.map(t => format(new Date(t.entry_date), 'yyyy-MM-dd'))).size;

  // Get weeks in month for weekly summaries
  const weeks = Array.from(new Set(calendarDays.map(d => getWeek(d))));

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-200 rounded-lg">
            ←
          </button>
          <h2 className="text-2xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-200 rounded-lg">
            →
          </button>
        </div>
        <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100">
          This month
        </button>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Monthly stats:
        <span className={`ml-2 font-bold ${monthlyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          ${(monthlyPnL / 1000).toFixed(2)}K
        </span>
        <span className="ml-2">{tradingDays} days</span>
      </div>

      <div className="flex gap-6">
        {/* Calendar Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((date, idx) => {
              const dayData = getDayData(date);
              const isCurrentMonth = date >= monthStart && date <= monthEnd;
              const isToday = isSameDay(date, new Date());

              return (
                <div
                  key={idx}
                  className={`border rounded-lg p-3 min-h-[120px] transition ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                    } ${isToday ? 'ring-2 ring-blue-500' : ''} ${dayData.pnl > 0 ? 'bg-green-50 border-green-300' : dayData.pnl < 0 ? 'bg-red-50 border-red-300' : 'border-gray-200'
                    }`}
                >
                  <div className="font-semibold text-sm mb-2">{format(date, 'd')}</div>
                  {dayData.trades > 0 && (
                    <div className="text-xs space-y-1">
                      <div className={`font-bold ${dayData.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${dayData.pnl >= 1000
                          ? `${(dayData.pnl / 1000).toFixed(2)}K`
                          : dayData.pnl.toFixed(0)}
                      </div>
                      <div>{dayData.trades} trade{dayData.trades > 1 ? 's' : ''}</div>
                      <div>{dayData.winRate.toFixed(0)}%</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar - Weekly Summary */}
        <div className="w-64 bg-white border rounded-lg p-4">
          <h3 className="font-bold mb-4">Weekly Summary</h3>
          <div className="space-y-3">
            {weeks.map((weekNum, idx) => {
              const weekTrades = monthTrades.filter(t =>
                getWeek(new Date(t.entry_date)) === weekNum
              );
              const weekPnL = weekTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
              const weekDays = new Set(weekTrades.map(t => format(new Date(t.entry_date), 'yyyy-MM-dd'))).size;

              return (
                <div key={weekNum} className="border-b pb-3">
                  <div className="text-sm font-semibold">Week {idx + 1}</div>
                  <div className={`text-lg font-bold ${weekPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${weekPnL >= 1000 ? `${(weekPnL / 1000).toFixed(2)}K` : weekPnL.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-500">{weekDays} day{weekDays !== 1 ? 's' : ''}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
