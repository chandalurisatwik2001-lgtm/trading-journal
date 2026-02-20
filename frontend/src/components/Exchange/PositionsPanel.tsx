import React, { useState, useEffect, useCallback } from 'react';
import { simExchangeAPI, SimPosition } from '../../api/simExchange';
import { X, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface PositionsPanelProps {
    refreshTrigger: number;
}

const PositionsPanel: React.FC<PositionsPanelProps> = ({ refreshTrigger }) => {
    const [positions, setPositions] = useState<SimPosition[]>([]);
    const [livePrices, setLivePrices] = useState<Record<string, number>>({});
    const [closing, setClosing] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'open' | 'history'>('open');
    const [history, setHistory] = useState<SimPosition[]>([]);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchPositions = useCallback(async () => {
        try {
            const [open, hist] = await Promise.all([
                simExchangeAPI.getOpenPositions(),
                simExchangeAPI.getPositionHistory()
            ]);
            setPositions(open);
            setHistory(hist);
        } catch { }
    }, []);

    useEffect(() => { fetchPositions(); }, [fetchPositions, refreshTrigger]);

    // Live price polling for open positions
    useEffect(() => {
        if (positions.length === 0) return;
        const symbols = Array.from(new Set(positions.map(p => p.symbol)));

        const fetchPrices = async () => {
            const prices: Record<string, number> = {};
            await Promise.all(symbols.map(async sym => {
                try {
                    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${sym}`);
                    const data = await res.json();
                    prices[sym] = parseFloat(data.price);
                } catch { }
            }));
            setLivePrices(prices);
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 3000);
        return () => clearInterval(interval);
    }, [positions]);

    const handleClose = async (positionId: number) => {
        setClosing(positionId);
        try {
            const res = await simExchangeAPI.closePosition(positionId);
            const pnl = res.pnl;
            showToast(`Closed @ $${res.exit_price.toLocaleString()} | PnL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`, pnl >= 0 ? 'success' : 'error');
            fetchPositions();
        } catch (err: any) {
            showToast(err.response?.data?.detail || 'Failed to close position', 'error');
        } finally {
            setClosing(null);
        }
    };

    const calcPnL = (pos: SimPosition) => {
        const livePrice = livePrices[pos.symbol];
        if (!livePrice) return null;
        const raw = pos.side === 'LONG'
            ? (livePrice - pos.entry_price) * pos.quantity
            : (pos.entry_price - livePrice) * pos.quantity;
        return { pnl: raw, pct: (raw / pos.margin_used) * 100, livePrice };
    };

    return (
        <div className="bg-[#1e1e24] rounded-xl border border-gray-800 flex flex-col h-full overflow-hidden shadow-2xl relative">
            {toast && (
                <div className={`absolute top-3 left-3 right-3 z-50 px-4 py-2.5 rounded-lg text-sm font-medium border ${toast.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-300' : 'bg-red-500/20 border-red-500/30 text-red-300'
                    }`}>{toast.msg}</div>
            )}

            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-gray-800 px-4">
                <div className="flex">
                    <button onClick={() => setActiveTab('open')}
                        className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${activeTab === 'open' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                        Open Positions {positions.length > 0 && <span className="ml-1.5 bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded-full">{positions.length}</span>}
                    </button>
                    <button onClick={() => setActiveTab('history')}
                        className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${activeTab === 'history' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                        History
                    </button>
                </div>
                <button onClick={fetchPositions} className="text-gray-500 hover:text-gray-300 p-1 rounded transition-colors">
                    <RefreshCw size={13} />
                </button>
            </div>

            <div className="flex-1 overflow-auto">
                {activeTab === 'open' && (
                    positions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-600 text-sm">
                            <TrendingUp size={28} className="mb-2 opacity-30" />
                            <p>No open positions</p>
                            <p className="text-xs mt-1">Place a trade to get started</p>
                        </div>
                    ) : (
                        <div className="p-3 space-y-2">
                            {positions.map(pos => {
                                const calc = calcPnL(pos);
                                const isProfit = calc ? calc.pnl >= 0 : true;
                                return (
                                    <div key={pos.id} className="bg-[#16161e] rounded-lg p-3 border border-gray-800/60 hover:border-gray-700/60 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${pos.side === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {pos.side}
                                                </span>
                                                <div>
                                                    <span className="text-white font-semibold text-sm">{pos.symbol}</span>
                                                    <span className="ml-2 text-xs text-blue-400">{pos.leverage}x</span>
                                                </div>
                                            </div>
                                            <button onClick={() => handleClose(pos.id)}
                                                disabled={closing === pos.id}
                                                className="text-gray-500 hover:text-red-400 hover:bg-red-400/10 p-1 rounded transition-colors disabled:opacity-40">
                                                {closing === pos.id ? <RefreshCw size={14} className="animate-spin" /> : <X size={14} />}
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-xs">
                                            <div><span className="text-gray-500">Size</span><div className="text-gray-200 font-mono">{pos.quantity}</div></div>
                                            <div><span className="text-gray-500">Entry</span><div className="font-mono text-gray-200">${pos.entry_price.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div></div>
                                            <div><span className="text-gray-500">Mark</span><div className="font-mono text-gray-200">{calc ? `$${calc.livePrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '...'}</div></div>
                                            <div><span className="text-gray-500">Margin</span><div className="font-mono text-gray-200">${pos.margin_used.toFixed(2)}</div></div>
                                            <div><span className="text-gray-500">Liq.</span><div className="font-mono text-orange-400">{pos.liquidation_price ? `$${pos.liquidation_price.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '–'}</div></div>
                                            <div><span className="text-gray-500">PnL</span>
                                                <div className={`font-mono font-bold ${calc ? (isProfit ? 'text-emerald-400' : 'text-red-400') : 'text-gray-500'}`}>
                                                    {calc ? `${isProfit ? '+' : ''}$${calc.pnl.toFixed(2)} (${calc.pct.toFixed(1)}%)` : '...'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}

                {activeTab === 'history' && (
                    history.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-600 text-sm">No closed positions yet</div>
                    ) : (
                        <table className="w-full text-xs">
                            <thead className="border-b border-gray-800 sticky top-0 bg-[#1e1e24]">
                                <tr className="text-gray-500">
                                    <th className="py-2 px-3 text-left">Symbol</th>
                                    <th className="py-2 px-3 text-left">Side</th>
                                    <th className="py-2 px-3 text-right">Entry</th>
                                    <th className="py-2 px-3 text-right">Size</th>
                                    <th className="py-2 px-3 text-right">Lev.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(pos => (
                                    <tr key={pos.id} className="border-b border-gray-800/40 hover:bg-gray-800/20 transition-colors">
                                        <td className="py-2 px-3 text-gray-200 font-medium">{pos.symbol}</td>
                                        <td className="py-2 px-3">
                                            <span className={`font-bold ${pos.side === 'LONG' ? 'text-emerald-400' : 'text-red-400'}`}>{pos.side}</span>
                                        </td>
                                        <td className="py-2 px-3 text-right font-mono text-gray-300">${pos.entry_price.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                                        <td className="py-2 px-3 text-right font-mono text-gray-300">{pos.quantity}</td>
                                        <td className="py-2 px-3 text-right font-mono text-blue-400">{pos.leverage}x</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}
            </div>
        </div>
    );
};

export default PositionsPanel;
