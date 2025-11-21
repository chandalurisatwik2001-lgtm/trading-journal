import React from 'react';
import { BarChart2, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import WidgetContainer from './WidgetContainer';
import { format } from 'date-fns';

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

interface RecentTradesWidgetProps {
    trades: Trade[];
    onRemove?: () => void;
}

const RecentTradesWidget: React.FC<RecentTradesWidgetProps> = ({ trades, onRemove }) => {
    // Sort by date descending and take top 5
    const recentTrades = [...trades]
        .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
        .slice(0, 5);

    return (
        <WidgetContainer
            title="Recent Trades"
            icon={<Clock size={16} />}
            onRemove={onRemove}
            className="col-span-1 md:col-span-2 lg:col-span-2"
        >
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs text-gray-500 border-b border-white/5">
                            <th className="py-2 font-medium">Symbol</th>
                            <th className="py-2 font-medium">Type</th>
                            <th className="py-2 font-medium text-right">Price</th>
                            <th className="py-2 font-medium text-right">P&L</th>
                            <th className="py-2 font-medium text-right">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentTrades.length > 0 ? (
                            recentTrades.map((trade) => {
                                const isWin = (trade.pnl || 0) > 0;
                                const isLoss = (trade.pnl || 0) < 0;

                                return (
                                    <tr key={trade.id} className="group hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                                        <td className="py-3">
                                            <span className="font-semibold text-white">{trade.symbol}</span>
                                        </td>
                                        <td className="py-3">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${trade.direction === 'LONG'
                                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                }`}>
                                                {trade.direction}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right text-gray-300">
                                            ${trade.entry_price.toFixed(2)}
                                        </td>
                                        <td className="py-3 text-right">
                                            {trade.status === 'CLOSED' ? (
                                                <span className={`font-medium ${isWin ? 'text-green-400' : isLoss ? 'text-red-400' : 'text-gray-400'}`}>
                                                    {isWin ? '+' : ''}{trade.pnl?.toFixed(2)}
                                                </span>
                                            ) : (
                                                <span className="text-blue-400 text-xs">OPEN</span>
                                            )}
                                        </td>
                                        <td className="py-3 text-right text-gray-500 text-xs">
                                            {format(new Date(trade.entry_date), 'MMM d, HH:mm')}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-500 text-sm">
                                    No recent trades found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </WidgetContainer>
    );
};

export default RecentTradesWidget;
