import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info, Settings, Camera } from 'lucide-react';
import WidgetContainer from './WidgetContainer';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isToday,
    getDay,
    addMonths,
    subMonths,
    parseISO,
    startOfYear,
    endOfYear,
    eachMonthOfInterval,
    addYears,
    subYears,
    getYear,
    endOfWeek,
    eachWeekOfInterval
} from 'date-fns';

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

export type CalendarViewMode = 'simple' | 'standard' | 'advanced' | 'yearly';

interface CalendarWidgetProps {
    trades: Trade[];
    viewMode?: CalendarViewMode;
    onRemove?: () => void;
}

interface DayStats {
    pnl: number;
    tradesCount: number;
    wins: number;
    losses: number;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ trades, viewMode = 'advanced', onRemove }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Navigation handlers
    const nextPeriod = () => {
        if (viewMode === 'yearly') setCurrentDate(addYears(currentDate, 1));
        else setCurrentDate(addMonths(currentDate, 1));
    };

    const prevPeriod = () => {
        if (viewMode === 'yearly') setCurrentDate(subYears(currentDate, 1));
        else setCurrentDate(subMonths(currentDate, 1));
    };

    const resetDate = () => setCurrentDate(new Date());

    // Data Aggregation
    const dailyStats = useMemo(() => {
        const stats: Record<string, DayStats> = {};
        trades.forEach(trade => {
            if (!trade.entry_date || trade.status !== 'CLOSED' || trade.pnl === undefined) return;
            const dateKey = format(parseISO(trade.entry_date), 'yyyy-MM-dd');
            if (!stats[dateKey]) stats[dateKey] = { pnl: 0, tradesCount: 0, wins: 0, losses: 0 };
            stats[dateKey].pnl += trade.pnl;
            stats[dateKey].tradesCount += 1;
            if (trade.pnl > 0) stats[dateKey].wins += 1;
            else if (trade.pnl < 0) stats[dateKey].losses += 1;
        });
        return stats;
    }, [trades]);

    const monthlyStats = useMemo(() => {
        if (viewMode === 'yearly') {
            // Aggregate for the whole year
            let pnl = 0;
            let tradesCount = 0;
            Object.keys(dailyStats).forEach(dateKey => {
                if (getYear(parseISO(dateKey)) === getYear(currentDate)) {
                    pnl += dailyStats[dateKey].pnl;
                    tradesCount += dailyStats[dateKey].tradesCount;
                }
            });
            return { pnl, tradesCount };
        } else {
            // Aggregate for current month
            let pnl = 0;
            let activeDays = 0;
            Object.keys(dailyStats).forEach(dateKey => {
                if (isSameMonth(parseISO(dateKey), currentDate)) {
                    pnl += dailyStats[dateKey].pnl;
                    activeDays += 1;
                }
            });
            return { pnl, activeDays };
        }
    }, [dailyStats, currentDate, viewMode]);

    const weeklyStats = useMemo(() => {
        if (viewMode !== 'advanced') return [];

        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd });

        return weeks.map((weekStart, index) => {
            const weekEnd = endOfWeek(weekStart);
            let pnl = 0;
            let activeDays = 0;

            // Iterate through days in the week
            const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
            daysInWeek.forEach(day => {
                // Only count days within the current month
                if (isSameMonth(day, currentDate)) {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    if (dailyStats[dateKey]) {
                        pnl += dailyStats[dateKey].pnl;
                        activeDays += 1;
                    }
                }
            });

            return {
                weekNumber: index + 1,
                pnl,
                activeDays
            };
        });
    }, [dailyStats, currentDate, viewMode]);

    // Render Helpers
    const getDayContent = (day: Date) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const stats = dailyStats[dateKey];
        if (!stats) return null;
        return {
            pnl: stats.pnl,
            trades: stats.tradesCount,
            winRate: stats.tradesCount > 0 ? (stats.wins / stats.tradesCount) * 100 : 0,
            isWin: stats.pnl > 0,
            isLoss: stats.pnl < 0
        };
    };

    const renderMonthGrid = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
        const startDay = getDay(monthStart);
        const emptyDays = Array(startDay).fill(null);

        return (
            <div className="flex flex-col h-full">
                <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                        <div key={d} className="py-1 text-xs font-bold text-gray-400">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1 flex-1 auto-rows-fr">
                    {emptyDays.map((_, i) => <div key={`empty-${i}`} className="bg-transparent" />)}
                    {days.map((day) => {
                        const content = getDayContent(day);
                        const isCurrentDay = isToday(day);

                        // Base styles
                        let bgClass = 'bg-white/5 hover:bg-white/10'; // Glassy for empty
                        let textClass = 'text-gray-300';
                        let borderClass = 'border border-transparent';

                        if (content) {
                            if (content.isWin) {
                                bgClass = 'bg-emerald-500/20 hover:bg-emerald-500/30'; // Green glass
                                borderClass = 'border border-emerald-500/30';
                                textClass = 'text-white';
                            } else if (content.isLoss) {
                                bgClass = 'bg-red-500/20 hover:bg-red-500/30'; // Red glass
                                borderClass = 'border border-red-500/30';
                                textClass = 'text-white';
                            }
                        }

                        if (isCurrentDay) {
                            borderClass = 'border border-blue-500';
                            textClass = 'text-white';
                        }

                        // Conditional sizing/layout based on viewMode
                        const isDetailed = viewMode === 'advanced' || viewMode === 'standard';
                        const cellHeight = viewMode === 'simple' ? 'aspect-square' : 'min-h-[80px]';
                        const contentLayout = viewMode === 'simple'
                            ? 'items-center justify-center'
                            : 'flex-col p-2';

                        return (
                            <div
                                key={day.toISOString()}
                                className={`relative flex ${contentLayout} rounded-md transition-all cursor-pointer ${cellHeight} ${bgClass} ${borderClass}`}
                            >
                                <span className={`text-sm font-medium ${textClass} ${isDetailed ? 'mb-auto text-xs' : ''}`}>
                                    {format(day, 'd')}
                                </span>
                                {content && isDetailed && (
                                    <div className="flex flex-col items-center justify-center gap-0.5 mt-1">
                                        <span className={`text-sm font-bold tracking-tight ${content.isWin ? 'text-green-400' : 'text-red-400'}`}>
                                            ${Math.abs(content.pnl).toLocaleString()}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-medium">
                                            {content.trades} trade{content.trades !== 1 ? 's' : ''}
                                        </span>
                                        <span className="text-[10px] text-gray-500">
                                            {content.winRate.toFixed(1)}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderYearlyGrid = () => {
        const yearStart = startOfYear(currentDate);
        const yearEnd = endOfYear(currentDate);
        const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

        return (
            <div className="grid grid-cols-4 gap-4 h-full">
                {/* Year Summary Card */}
                <div className="col-span-1 row-span-2 bg-gray-800/30 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white mb-2">{format(currentDate, 'yyyy')}</span>
                    <span className={`text-xl font-bold ${monthlyStats.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${monthlyStats.pnl.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                        {monthlyStats.tradesCount} trades
                    </span>
                </div>

                {months.map(month => {
                    // Aggregate stats for this month
                    let monthPnl = 0;
                    let monthTrades = 0;
                    Object.keys(dailyStats).forEach(dateKey => {
                        if (isSameMonth(parseISO(dateKey), month)) {
                            monthPnl += dailyStats[dateKey].pnl;
                            monthTrades += dailyStats[dateKey].tradesCount;
                        }
                    });

                    let bgClass = 'bg-gray-800/20 border-white/5 hover:bg-gray-800/40';
                    let textClass = 'text-gray-500';

                    if (monthTrades > 0) {
                        if (monthPnl > 0) {
                            bgClass = 'bg-[#0d3a28] border-[#1a5c42] hover:bg-[#124d36]';
                            textClass = 'text-green-400';
                        } else if (monthPnl < 0) {
                            bgClass = 'bg-[#3a1212] border-[#5c1a1a] hover:bg-[#4d1818]';
                            textClass = 'text-red-400';
                        }
                    }

                    return (
                        <div key={month.toISOString()} className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${bgClass}`}>
                            <span className="text-sm font-medium text-gray-400 mb-1">{format(month, 'MMM')}</span>
                            {monthTrades > 0 ? (
                                <>
                                    <span className={`text-lg font-bold ${textClass}`}>
                                        ${Math.abs(monthPnl).toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-500">{monthTrades} trade{monthTrades !== 1 ? 's' : ''}</span>
                                </>
                            ) : (
                                <span className="text-lg font-bold text-gray-600">--</span>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const title = viewMode === 'yearly' ? 'Yearly Calendar' : viewMode === 'simple' ? 'Calendar' : 'Calendar';

    // Custom Header Controls for Simple View (Navigation in Header)
    const simpleHeaderControls = (
        <div className="flex items-center gap-2">
            <button onClick={prevPeriod} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors">
                <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-bold text-white min-w-[80px] text-center">
                {format(currentDate, 'MMMM yyyy')}
            </span>
            <button onClick={nextPeriod} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors">
                <ChevronRight size={16} />
            </button>
        </div>
    );

    // Standard Header Controls for Advanced/Yearly Views
    const standardHeaderControls = (
        <div className="flex items-center gap-4">
            {viewMode === 'advanced' && (
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-medium">Monthly stats:</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${monthlyStats.pnl >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        ${monthlyStats.pnl.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-indigo-500/20 text-indigo-400">
                        {monthlyStats.activeDays} days
                    </span>
                </div>
            )}
            <div className="flex items-center gap-1 text-gray-400 border-l border-white/10 pl-3 ml-1">
                <button className="p-1.5 hover:bg-white/10 rounded transition-colors"><Settings size={14} /></button>
                <button className="p-1.5 hover:bg-white/10 rounded transition-colors"><Camera size={14} /></button>
                <button className="p-1.5 hover:bg-white/10 rounded transition-colors"><Info size={14} /></button>
            </div>
        </div>
    );

    return (
        <WidgetContainer
            title={title}
            icon={<CalendarIcon size={16} />}
            onRemove={onRemove}
            className={`col-span-1 row-span-2 ${viewMode === 'advanced' || viewMode === 'standard' ? 'md:col-span-3 xl:col-span-3 min-h-[500px]' : 'md:col-span-1 xl:col-span-1 min-h-[350px]'}`}
            headerControls={viewMode === 'simple' ? simpleHeaderControls : standardHeaderControls}
        >
            <div className="flex flex-col h-full">
                {/* Navigation (Only for Advanced/Yearly views, as Simple has it in header) */}
                {viewMode !== 'simple' && (
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-4">
                            <button onClick={prevPeriod} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <h3 className="text-lg font-bold text-white">
                                {viewMode === 'yearly' ? format(currentDate, 'yyyy') : format(currentDate, 'MMMM yyyy')}
                            </h3>
                            <button onClick={nextPeriod} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        <button
                            onClick={resetDate}
                            className="px-3 py-1 text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md border border-white/10 transition-colors"
                        >
                            {viewMode === 'yearly' ? 'This Year' : 'This Month'}
                        </button>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex gap-4 flex-1 min-h-0">
                    {/* Calendar Grid */}
                    <div className="flex-1 flex flex-col min-h-0 justify-center">
                        {viewMode === 'yearly' ? renderYearlyGrid() : renderMonthGrid()}
                    </div>

                    {/* Weekly Stats Sidebar (Advanced Mode Only) */}
                    {viewMode === 'advanced' && (
                        <div className="w-48 flex flex-col gap-2 overflow-y-auto pr-1">
                            {weeklyStats.map((week) => (
                                <div key={week.weekNumber} className="bg-gray-800/20 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                                    <span className="text-xs text-gray-400 font-medium">Week {week.weekNumber}</span>
                                    <span className={`text-lg font-bold ${week.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        ${week.pnl.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 w-fit font-medium">
                                        {week.activeDays} days
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </WidgetContainer>
    );
};

export default CalendarWidget;
