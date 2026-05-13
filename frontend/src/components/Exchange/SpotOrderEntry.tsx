import React, { useState, useEffect, useCallback } from 'react';
import { simExchangeAPI, WalletBalance } from '../../api/simExchange';
import { ShoppingCart, ArrowUpDown } from 'lucide-react';

interface SpotOrderEntryProps {
    symbol: string;
    currentPrice: number;
    onOrderSuccess: () => void;
}

const SpotOrderEntry: React.FC<SpotOrderEntryProps> = ({ symbol, currentPrice, onOrderSuccess }) => {
    const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
    const [quantity, setQuantity] = useState('');
    const [wallets, setWallets] = useState<WalletBalance[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const baseAsset = symbol.replace('USDT', '');
    const qty = parseFloat(quantity) || 0;
    const totalCost = qty * currentPrice;

    const usdtWallet = wallets.find(w => w.asset === 'USDT');
    const baseWallet = wallets.find(w => w.asset === baseAsset);
    const usdtBalance = usdtWallet?.balance ?? 0;
    const baseBalance = baseWallet?.balance ?? 0;

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchWallets = useCallback(async () => {
        try { setWallets(await simExchangeAPI.getWallets()); } catch { }
    }, []);

    useEffect(() => { fetchWallets(); }, [fetchWallets]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!qty || qty <= 0) return showToast('Enter a valid quantity', 'error');

        setIsLoading(true);
        try {
            const res = await simExchangeAPI.placeSpotOrder({ symbol, side, quantity: qty });
            showToast(`✓ ${res.message}`, 'success');
            setQuantity('');
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
        if (side === 'BUY') {
            setQuantity(((usdtBalance * pct) / currentPrice).toFixed(4));
        } else {
            setQuantity((baseBalance * pct).toFixed(4));
        }
    };

    return (
        <div className="bg-[#1e1e24] rounded-xl border border-gray-800 flex flex-col h-full overflow-hidden shadow-2xl relative">
            {toast && (
                <div className={`absolute top-3 left-3 right-3 z-50 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${toast.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-300' : 'bg-red-500/20 border-red-500/30 text-red-300'
                    }`}>{toast.msg}</div>
            )}

            {/* Side Tabs */}
            <div className="flex border-b border-gray-800">
                <button onClick={() => setSide('BUY')}
                    className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${side === 'BUY' ? 'bg-emerald-500/15 text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-300'
                        }`}>
                    <ShoppingCart size={14} /> Buy
                </button>
                <button onClick={() => setSide('SELL')}
                    className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${side === 'SELL' ? 'bg-red-500/15 text-red-400 border-b-2 border-red-500' : 'text-gray-500 hover:text-gray-300'
                        }`}>
                    <ArrowUpDown size={14} /> Sell
                </button>
            </div>

            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {/* Balance */}
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Available</span>
                    <span className="font-mono text-gray-200">
                        {side === 'BUY'
                            ? `${usdtBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDT`
                            : `${baseBalance.toFixed(4)} ${baseAsset}`}
                    </span>
                </div>

                {/* Market Price */}
                <div className="bg-[#16161e] rounded-lg py-2.5 px-3 flex justify-between items-center border border-gray-800/50">
                    <span className="text-xs text-gray-500">Market Price</span>
                    <span className="font-mono text-sm text-white">${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>

                {/* Quantity */}
                <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Amount ({baseAsset})</label>
                    <div className="relative">
                        <input type="number" step="0.0001" min="0" value={quantity}
                            onChange={e => setQuantity(e.target.value)} placeholder="0.0000"
                            className="w-full bg-[#16161e] border border-gray-700 rounded-lg py-2.5 px-3 pr-14 text-right font-mono text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">{baseAsset}</span>
                    </div>
                    <div className="flex gap-1.5 mt-1.5">
                        {[0.25, 0.5, 0.75, 1].map(pct => (
                            <button key={pct} onClick={() => setBalancePercent(pct)}
                                className="flex-1 py-1 rounded text-xs text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-white transition-colors">
                                {pct * 100}%
                            </button>
                        ))}
                    </div>
                </div>

                {/* Total */}
                {qty > 0 && (
                    <div className="bg-[#16161e] rounded-lg p-3 space-y-1.5 text-xs border border-gray-800/50">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total Cost</span>
                            <span className="font-mono text-gray-200">${totalCost.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDT</span>
                        </div>
                        {side === 'BUY' && totalCost > usdtBalance && (
                            <div className="text-red-400 text-center">Insufficient USDT</div>
                        )}
                        {side === 'SELL' && qty > baseBalance && (
                            <div className="text-red-400 text-center">Insufficient {baseAsset}</div>
                        )}
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-800">
                <button onClick={handleSubmit}
                    disabled={isLoading || !qty || (side === 'BUY' && totalCost > usdtBalance) || (side === 'SELL' && qty > baseBalance)}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${side === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                            : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30'
                        }`}>
                    {isLoading ? 'Placing...' : `${side === 'BUY' ? 'Buy' : 'Sell'} ${baseAsset}`}
                </button>
                <p className="text-center text-xs text-gray-600 mt-2">Simulated · Real market prices · Auto-journaled</p>
            </div>
        </div>
    );
};

export default SpotOrderEntry;
