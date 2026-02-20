import React from 'react';
import { Clock } from 'lucide-react';
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

interface Position {
    symbol: string;
    positionAmt: string;
    entryPrice: string;
    markPrice: string;
    unRealizedProfit: string;
    leverage: string;
    positionSide: string;
}

interface RecentTradesWidgetProps {
    trades: Trade[];
    positions?: Position[];
    onRemove?: () => void;
}

const RecentTradesWidget: React.FC<RecentTradesWidgetProps> = ({ trades, positions = [], onRemove }) => {
    // Sort by date descending and take top 5
    const recentTrades = [...trades]
        .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
        .slice(0, 5);

    return (
        <WidgetContainer
            title="Open Positions & Recent Trades"
            icon={<Clock size={16} />}
            onRemove={onRemove}
            className="col-span-1 md:col-span-2 lg:col-span-2"
        >
            <div className="flex flex-col gap-6">
                {/* Open Positions Section */}
                {positions && positions.length > 0 && (
                    <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Open Positions</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs text-gray-500 border-b border-white/5">
                                        <th className="py-2 font-medium">Symbol</th>
                                        <th className="py-2 font-medium">Size</th>
                                        <th className="py-2 font-medium text-right">Entry</th>
                                        <th className="py-2 font-medium text-right">Mark</th>
                                        <th className="py-2 font-medium text-right">PnL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {positions.map((pos, idx) => {
                                        const pnl = parseFloat(pos.unRealizedProfit);
                                        const isWin = pnl > 0;
                                        return (
                                            <tr key={idx} className="group hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                                                <td className="py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-white">{pos.symbol}</span>
                                                        <span className="text-xs text-gray-500">x{pos.leverage}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${parseFloat(pos.positionAmt) > 0
                                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                        }`}>
                                                        {parseFloat(pos.positionAmt) > 0 ? 'LONG' : 'SHORT'}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right text-gray-300">
                                                    ${parseFloat(pos.entryPrice).toFixed(2)}
                                                </td>
                                                <td className="py-3 text-right text-gray-300">
                                                    ${parseFloat(pos.markPrice).toFixed(2)}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <span className={`font-medium ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                                                        {isWin ? '+' : ''}{pnl.toFixed(2)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Recent Trades Section */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Trades</h4>
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
                </div>
            </div>
        </WidgetContainer>
    );
};

export default RecentTradesWidget;
