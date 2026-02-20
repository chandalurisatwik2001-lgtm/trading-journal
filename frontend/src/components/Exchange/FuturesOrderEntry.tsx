import React, { useState, useEffect, useCallback } from 'react';
import { simExchangeAPI, WalletBalance } from '../../api/simExchange';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface FuturesOrderEntryProps {
    symbol: string;
    currentPrice: number;
    onOrderSuccess: () => void;
}

const LEVERAGE_PRESETS = [1, 2, 5, 10, 20, 50, 100, 125];

const FuturesOrderEntry: React.FC<FuturesOrderEntryProps> = ({ symbol, currentPrice, onOrderSuccess }) => {
    const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');
    const [quantity, setQuantity] = useState('');
    const [leverage, setLeverage] = useState(10);
    const [takeProfit, setTakeProfit] = useState('');
    const [stopLoss, setStopLoss] = useState('');
    const [wallets, setWallets] = useState<WalletBalance[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const baseAsset = symbol.replace('USDT', '');
    const qty = parseFloat(quantity) || 0;
    const notional = qty * currentPrice;
    const margin = notional / leverage;
    const usdtWallet = wallets.find(w => w.asset === 'USDT');
    const availableBalance = (usdtWallet?.balance ?? 0);

    const liqPrice = currentPrice > 0 && qty > 0
        ? side === 'LONG'
            ? currentPrice * (1 - 1 / leverage)
            : currentPrice * (1 + 1 / leverage)
        : 0;

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchWallets = useCallback(async () => {
        try {
            const data = await simExchangeAPI.getWallets();
            setWallets(data);
        } catch { }
    }, []);

    useEffect(() => { fetchWallets(); }, [fetchWallets]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!qty || qty <= 0) return showToast('Enter a valid quantity', 'error');
        if (margin > availableBalance) return showToast('Insufficient USDT balance', 'error');

        setIsLoading(true);
        try {
            const res = await simExchangeAPI.placeFuturesOrder({
                symbol,
                side,
                quantity: qty,
                leverage,
                take_profit: takeProfit ? parseFloat(takeProfit) : undefined,
                stop_loss: stopLoss ? parseFloat(stopLoss) : undefined,
            });
            showToast(`✓ ${side} ${qty} ${baseAsset} @ $${currentPrice.toLocaleString()} (${leverage}x)`, 'success');
            setQuantity('');
            setTakeProfit('');
            setStopLoss('');
            fetchWallets();
            onOrderSuccess();
        } catch (err: any) {
            showToast(err.response?.data?.detail || 'Order failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const setBalancePercent = (pct: number) => {
        if (!currentPrice) return;
        const usdtToUse = availableBalance * pct;
        const calculatedQty = (usdtToUse * leverage) / currentPrice;
        setQuantity(calculatedQty.toFixed(4));
    };

    return (
        <div className="bg-[#1e1e24] rounded-xl border border-gray-800 flex flex-col h-full overflow-hidden shadow-2xl relative">
            {/* Toast */}
            {toast && (
                <div className={`absolute top-3 left-3 right-3 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg transition-all ${toast.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'
                    }`}>
                    {toast.msg}
                </div>
            )}

            {/* Side Tabs */}
            <div className="flex border-b border-gray-800">
                <button onClick={() => setSide('LONG')}
                    className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${side === 'LONG' ? 'bg-emerald-500/15 text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-300'
                        }`}>
                    <TrendingUp size={14} /> Long
                </button>
                <button onClick={() => setSide('SHORT')}
                    className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${side === 'SHORT' ? 'bg-red-500/15 text-red-400 border-b-2 border-red-500' : 'text-gray-500 hover:text-gray-300'
                        }`}>
                    <TrendingDown size={14} /> Short
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Balance */}
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Available</span>
                    <span className="font-mono text-gray-200">{availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT</span>
                </div>

                {/* Leverage */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-400 font-medium">Leverage</span>
                        <span className={`text-sm font-bold ${leverage >= 50 ? 'text-orange-400' : leverage >= 20 ? 'text-yellow-400' : 'text-blue-400'}`}>{leverage}x</span>
                    </div>
                    <input type="range" min="1" max="125" value={leverage}
                        onChange={e => setLeverage(parseInt(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-gray-700 accent-blue-500" />
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                        {LEVERAGE_PRESETS.map(l => (
                            <button key={l} onClick={() => setLeverage(l)}
                                className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${leverage === l ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                                {l}x
                            </button>
                        ))}
                    </div>
                    {leverage >= 20 && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-orange-400">
                            <AlertTriangle size={12} />
                            <span>High leverage increases liquidation risk</span>
                        </div>
                    )}
                </div>

                {/* Quantity */}
                <div>
                    <label className="text-xs text-gray-400 font-medium block mb-1.5">Size ({baseAsset})</label>
                    <div className="relative">
                        <input type="number" step="0.0001" min="0" value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                            placeholder="0.0000"
                            className="w-full bg-[#16161e] border border-gray-700 rounded-lg py-2.5 px-3 pr-14 text-right font-mono text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none text-sm" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">{baseAsset}</span>
                    </div>
                    <div className="flex gap-1.5 mt-1.5">
                        {[0.25, 0.5, 0.75, 1].map(pct => (
                            <button key={pct} onClick={() => setBalancePercent(pct)}
                                className="flex-1 py-1 rounded text-xs text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-gray-200 transition-colors">
                                {pct * 100}%
                            </button>
                        ))}
                    </div>
                </div>

                {/* Order Stats */}
                {qty > 0 && currentPrice > 0 && (
                    <div className="bg-[#16161e] rounded-lg p-3 space-y-1.5 text-xs border border-gray-800/50">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Notional Value</span>
                            <span className="font-mono text-gray-200">${notional.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Required Margin</span>
                            <span className={`font-mono ${margin > availableBalance ? 'text-red-400' : 'text-gray-200'}`}>
                                ${margin.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDT
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Liq. Price (est.)</span>
                            <span className="font-mono text-orange-400">${liqPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                )}

                {/* Advanced: TP/SL */}
                <button onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    {showAdvanced ? '− Hide' : '+ Show'} TP / SL
                </button>
                {showAdvanced && (
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Take Profit</label>
                            <input type="number" value={takeProfit} onChange={e => setTakeProfit(e.target.value)}
                                placeholder="Price"
                                className="w-full bg-[#16161e] border border-gray-700 rounded-lg py-2 px-3 text-sm font-mono text-emerald-400 focus:border-emerald-500 outline-none" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Stop Loss</label>
                            <input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)}
                                placeholder="Price"
                                className="w-full bg-[#16161e] border border-gray-700 rounded-lg py-2 px-3 text-sm font-mono text-red-400 focus:border-red-500 outline-none" />
                        </div>
                    </div>
                )}
            </div>

            {/* Submit */}
            <div className="p-4 border-t border-gray-800">
                <button onClick={handleSubmit} disabled={isLoading || !qty || margin > availableBalance}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${side === 'LONG'
                            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/30 text-white'
                            : 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/30 text-white'
                        }`}>
                    {isLoading ? 'Placing...' : `Open ${side} ${baseAsset}`}
                </button>
                <p className="text-center text-xs text-gray-600 mt-2">Simulated · Real market prices · Auto-journaled</p>
            </div>
        </div>
    );
};

export default FuturesOrderEntry;
