import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, getWeekOfMonth, eachDayOfInterval } from 'date-fns';

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

interface CalendarWidgetProps {
  trades: Trade[];
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ trades }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Prepare calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const rows = [];
  let days = [];
  let day = startDate;

  // Aggregate trades by date
  const getStatsForDay = (date: Date) => {
    const tradesOnDay = trades.filter(t => isSameDay(new Date(t.entry_date), date));
    const pnl = tradesOnDay.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const wins = tradesOnDay.filter(t => t.pnl && t.pnl > 0).length;
    const tradeCount = tradesOnDay.length;
    const winRate = tradeCount ? (wins / tradeCount) * 100 : 0;

    return { pnl, tradeCount, winRate };
  };

  // Build calendar rows
  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const formattedDate = format(day, 'd');
      const isCurrentMonthDay = isSameMonth(day, monthStart);
      const stats = getStatsForDay(day);
      const hasData = stats.tradeCount > 0;
      const isProfit = hasData && stats.pnl > 0;
      const isLoss = hasData && stats.pnl < 0;

      days.push(
        <div
          key={day.toString()}
          className={`
            min-h-[100px] border p-2 flex flex-col justify-between text-xs relative rounded-lg
            ${!isCurrentMonthDay ? 'bg-gray-50 text-gray-400' : 'bg-white'}
            ${isProfit ? 'bg-green-50 border-green-300' : ''}
            ${isLoss ? 'bg-red-50 border-red-300' : ''}
          `}
        >
          <div className="text-right font-semibold text-gray-700">{formattedDate}</div>
          {hasData && (
            <div className={`mt-2 text-center ${isProfit ? 'text-green-700' : isLoss ? 'text-red-700' : 'text-gray-700'}`}>
              <div className="font-bold text-base">
                {stats.pnl >= 0 ? `$${stats.pnl.toFixed(0)}` : `-$${Math.abs(stats.pnl).toFixed(0)}`}
              </div>
              <div className="text-xs">{stats.tradeCount} trade{stats.tradeCount > 1 ? 's' : ''}</div>
              <div className="text-xs">{stats.winRate.toFixed(1)}%</div>
            </div>
          )}
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div key={day.toString()} className="grid grid-cols-7 gap-1">
        {days}
      </div>
    );
    days = [];
  }

  // Calculate weekly stats
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const weeklyStats: Record<number, { pnl: number; days: number }> = {};

  monthDays.forEach(date => {
    const week = getWeekOfMonth(date, { weekStartsOn: 0 });
    const stats = getStatsForDay(date);
    if (!weeklyStats[week]) weeklyStats[week] = { pnl: 0, days: 0 };
    weeklyStats[week].pnl += stats.pnl;
    if (stats.tradeCount > 0) weeklyStats[week].days++;
  });

  return (
    <div className="space-y-4">
      {/* Calendar */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="px-3 py-1 hover:bg-gray-100 rounded">&lt;</button>
          <div className="font-bold text-lg">{format(currentMonth, 'MMMM yyyy')}</div>
          <button onClick={nextMonth} className="px-3 py-1 hover:bg-gray-100 rounded">&gt;</button>
        </div>
        <div className="grid grid-cols-7 mb-2 text-center font-semibold text-gray-600 text-sm">
          {dayNames.map(n => <div key={n} className="py-2">{n}</div>)}
        </div>
        <div className="space-y-1">{rows}</div>
      </div>

      {/* Weekly Summary */}
      <div className="space-y-2">
        {Object.entries(weeklyStats).map(([week, stats]) => (
          <div key={week} className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
            <div className="text-gray-600 font-semibold">Week {week}</div>
            <div className={`text-2xl font-bold ${stats.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.pnl >= 0 ? `$${stats.pnl.toLocaleString()}` : `-$${Math.abs(stats.pnl).toLocaleString()}`}
            </div>
            <div className="text-sm text-gray-500">{stats.days} day{stats.days !== 1 ? 's' : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarWidget;
