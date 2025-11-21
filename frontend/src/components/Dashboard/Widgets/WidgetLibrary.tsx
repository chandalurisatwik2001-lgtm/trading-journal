import React from 'react';
import { X, BarChart2, TrendingUp, TrendingDown, Activity, DollarSign, Calendar } from 'lucide-react';
import { cn } from '../../../utils/cn';

export type WidgetType =
    // Core Metrics
    | 'zella_score'
    | 'account_balance_pnl'
    | 'net_pnl'
    | 'trade_win_percent'
    | 'day_win_percent'
    | 'profit_factor'
    | 'avg_win_loss'
    | 'trade_expectancy'
    // Streaks
    | 'current_streak_combined'
    // Risk
    | 'max_drawdown'
    | 'average_drawdown'
    | 'drawdown_chart'
    // P&L Charts
    | 'daily_net_cumulative_pnl'
    | 'net_daily_pnl'
    // Calendars
    | 'calendar'
    | 'calendar_mini'
    | 'calendar_advanced'
    | 'yearly_calendar'
    // Lists & Tables
    | 'recent_trades_open_positions'
    // Analytics
    | 'progress_tracker'
    | 'report_widget'
    // Utility
    | 'external_links';

export interface WidgetDefinition {
    id: WidgetType;
    title: string;
    description: string;
    icon: React.ReactNode;
    previewColor: string;
    category: string;
}

export const AVAILABLE_WIDGETS: WidgetDefinition[] = [
    // Core Metrics
    {
        id: 'zella_score',
        title: 'Zella Score',
        description: 'A proprietary score evaluating your overall trading performance.',
        icon: <Activity size={20} />,
        previewColor: 'bg-purple-600',
        category: 'Core Metrics'
    },
    {
        id: 'account_balance_pnl',
        title: 'Account Balance & P&L',
        description: 'Displays your current account balance and total profit/loss.',
        icon: <DollarSign size={20} />,
        previewColor: 'bg-blue-500',
        category: 'Core Metrics'
    },
    {
        id: 'net_pnl',
        title: 'Net P&L',
        description: 'Your total net profit or loss over the selected period.',
        icon: <DollarSign size={20} />,
        previewColor: 'bg-green-500',
        category: 'Core Metrics'
    },
    {
        id: 'trade_win_percent',
        title: 'Trade Win %',
        description: 'The percentage of trades that were profitable.',
        icon: <TrendingUp size={20} />,
        previewColor: 'bg-emerald-500',
        category: 'Core Metrics'
    },
    {
        id: 'day_win_percent',
        title: 'Day Win %',
        description: 'The percentage of trading days that were profitable.',
        icon: <Calendar size={20} />,
        previewColor: 'bg-teal-500',
        category: 'Core Metrics'
    },
    {
        id: 'profit_factor',
        title: 'Profit Factor',
        description: 'Gross Profit divided by Gross Loss.',
        icon: <BarChart2 size={20} />,
        previewColor: 'bg-indigo-500',
        category: 'Core Metrics'
    },
    {
        id: 'avg_win_loss',
        title: 'Avg Win / Loss',
        description: 'Compare your average winning trade vs average losing trade.',
        icon: <BarChart2 size={20} />,
        previewColor: 'bg-orange-500',
        category: 'Performance'
    },
    {
        id: 'trade_expectancy',
        title: 'Trade Expectancy',
        description: 'The average amount you can expect to win (or lose) per trade.',
        icon: <DollarSign size={20} />,
        previewColor: 'bg-yellow-500',
        category: 'Performance'
    },

    // Streaks
    {
        id: 'current_streak_combined',
        title: 'Current Streak',
        description: 'Tracks your current winning streak in both days and trades.',
        icon: <Activity size={20} />,
        previewColor: 'bg-pink-500',
        category: 'Streaks'
    },

    // Risk
    {
        id: 'max_drawdown',
        title: 'Max Drawdown',
        description: 'This is the max drawdown experienced for the defined period.',
        icon: <TrendingDown size={20} />,
        previewColor: 'bg-red-500',
        category: 'Risk'
    },
    {
        id: 'average_drawdown',
        title: 'Average Drawdown',
        description: 'Shows the average drawdown during the selected period.',
        icon: <TrendingDown size={20} />,
        previewColor: 'bg-red-400',
        category: 'Risk'
    },
    {
        id: 'drawdown_chart',
        title: 'Drawdown Chart',
        description: 'Displays net P&L Drawdown of all trading days.',
        icon: <TrendingDown size={20} />,
        previewColor: 'bg-rose-500',
        category: 'Risk'
    },

    // P&L Charts
    {
        id: 'daily_net_cumulative_pnl',
        title: 'Daily Net Cumulative P&L',
        description: 'Displays how your total account P&L accumulated over the course of each trading day.',
        icon: <TrendingUp size={20} />,
        previewColor: 'bg-blue-400',
        category: 'P&L Charts'
    },
    {
        id: 'net_daily_pnl',
        title: 'Net Daily P&L',
        description: 'Displays your total net P&L for each trading day on the day it is realized.',
        icon: <BarChart2 size={20} />,
        previewColor: 'bg-indigo-400',
        category: 'P&L Charts'
    },

    // Calendars
    {
        id: 'calendar',
        title: 'Calendar',
        description: 'Standard trading calendar view with performance indicators.',
        icon: <Calendar size={20} />,
        previewColor: 'bg-emerald-500',
        category: 'Calendars'
    },
    {
        id: 'calendar_mini',
        title: 'Calendar Mini',
        description: 'Compact calendar widget for quick date reference.',
        icon: <Calendar size={20} />,
        previewColor: 'bg-green-500',
        category: 'Calendars'
    },
    {
        id: 'calendar_advanced',
        title: 'Advanced Calendar',
        description: 'Enhanced calendar with detailed performance data and annotations.',
        icon: <Calendar size={20} />,
        previewColor: 'bg-teal-600',
        category: 'Calendars'
    },
    {
        id: 'yearly_calendar',
        title: 'Yearly Calendar',
        description: 'Track your performance over time with a full year view.',
        icon: <Calendar size={20} />,
        previewColor: 'bg-lime-500',
        category: 'Calendars'
    },

    // Lists & Tables
    {
        id: 'recent_trades_open_positions',
        title: 'Recent Trades & Open Positions',
        description: 'Displays your recent closed trades and currently open positions.',
        icon: <BarChart2 size={20} />,
        previewColor: 'bg-blue-600',
        category: 'Trade Lists'
    },

    // Analytics
    {
        id: 'progress_tracker',
        title: 'Progress Tracker',
        description: 'Displays your consistency of following your rules.',
        icon: <Activity size={20} />,
        previewColor: 'bg-cyan-600',
        category: 'Analytics'
    },
    {
        id: 'report_widget',
        title: 'Report',
        description: 'Use the gear icon to select up to 3 trading metrics to display.',
        icon: <BarChart2 size={20} />,
        previewColor: 'bg-fuchsia-500',
        category: 'Analytics'
    },

    // Utility
    {
        id: 'external_links',
        title: 'External Links',
        description: 'Navigate to external links and resources.',
        icon: <Activity size={20} />,
        previewColor: 'bg-slate-500',
        category: 'Utility'
    }
];

interface WidgetLibraryProps {
    isOpen: boolean;
    onClose: () => void;
    onAddWidget: (type: WidgetType) => void;
    activeWidgets: WidgetType[];
}

const WidgetLibrary: React.FC<WidgetLibraryProps> = ({ isOpen, onClose, onAddWidget, activeWidgets }) => {
    const [searchQuery, setSearchQuery] = React.useState('');

    if (!isOpen) return null;

    const filteredWidgets = AVAILABLE_WIDGETS.filter(widget =>
        widget.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        widget.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-6xl bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-gray-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-white">Widget Library</h2>
                        <p className="text-sm text-gray-400">Customize your dashboard by adding widgets • {AVAILABLE_WIDGETS.length} widgets available</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 py-4 border-b border-white/5 bg-gray-900/30">
                    <input
                        type="text"
                        placeholder="Search widgets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-800/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                    />
                </div>

                {/* Grid with Categories */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {/* Group by Categories */}
                    {Object.entries(
                        filteredWidgets.reduce((acc, widget) => {
                            const category = widget.category || 'Other';
                            if (!acc[category]) acc[category] = [];
                            acc[category].push(widget);
                            return acc;
                        }, {} as Record<string, WidgetDefinition[]>)
                    ).map(([category, widgets]) => (
                        <div key={category} className="mb-8 last:mb-0">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-1 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                {category}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {widgets.map((widget) => {
                                    const isAdded = activeWidgets.includes(widget.id);

                                    return (
                                        <div
                                            key={widget.id}
                                            className="group flex flex-col bg-gray-800/30 border border-white/5 rounded-xl p-4 hover:bg-gray-800/60 hover:border-white/10 transition-all duration-200"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className={cn("p-2 rounded-lg text-white", widget.previewColor)}>
                                                    {widget.icon}
                                                </div>
                                                {isAdded ? (
                                                    <span className="px-2 py-1 text-xs font-medium text-green-400 bg-green-500/10 rounded-md border border-green-500/20">
                                                        Added
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => onAddWidget(widget.id)}
                                                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                                                    >
                                                        Add Widget
                                                    </button>
                                                )}
                                            </div>

                                            <h3 className="font-semibold text-gray-200 mb-1 text-sm">{widget.title}</h3>
                                            <p className="text-xs text-gray-400 leading-relaxed">{widget.description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {filteredWidgets.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No widgets found matching "{searchQuery}"
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/5 bg-gray-900/50 flex justify-between items-center">
                    <div className="text-sm text-gray-400">
                        {activeWidgets.length} widget{activeWidgets.length === 1 ? '' : 's'} currently active
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WidgetLibrary;
