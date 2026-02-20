import React, { useState, useEffect } from 'react';
import { simExchangeAPI, WalletBalance, MarketOrderRequest } from '../../api/simExchange';

interface OrderEntryProps {
    symbol: string;
    onOrderSuccess?: () => void;
}

const OrderEntry: React.FC<OrderEntryProps> = ({ symbol, onOrderSuccess }) => {
    const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
    const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market');
    const [quantity, setQuantity] = useState<string>('');
    const [wallets, setWallets] = useState<WalletBalance[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const baseAsset = symbol.replace('USDT', '');
    const quoteAsset = 'USDT';

    const fetchWallets = async () => {
        try {
            const data = await simExchangeAPI.getWallets();
            setWallets(data);
        } catch (error) {
            console.error("Failed to fetch wallets", error);
        }
    };

    useEffect(() => {
        fetchWallets();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numQuantity = parseFloat(quantity);

        if (isNaN(numQuantity) || numQuantity <= 0) {
            alert("Please enter a valid quantity.");
            return;
        }

        if (orderType !== 'Market') {
            alert("Only Market orders are supported in the simulated exchange right now.");
            return;
        }

        setIsLoading(true);
        try {
            const req: MarketOrderRequest = {
                symbol,
                side,
                quantity: numQuantity
            };
            const res = await simExchangeAPI.placeMarketOrder(req);

            alert(`Success! ${res.side} ${res.quantity} ${baseAsset} at ~$${res.price.toLocaleString()}`);
            setQuantity('');
            fetchWallets(); // Refresh balances
            if (onOrderSuccess) onOrderSuccess();

        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Order failed';
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const quoteWallet = wallets.find(w => w.asset === quoteAsset);
    const baseWallet = wallets.find(w => w.asset === baseAsset);

    const quoteBalance = quoteWallet ? quoteWallet.balance : 0;
    const baseBalance = baseWallet ? baseWallet.balance : 0;

    return (
        <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 flex flex-col h-full shadow-2xl">
            {/* Side Tabs */}
            <div className="flex rounded-lg overflow-hidden bg-[#16161e] mb-4">
                <button
                    type="button"
                    onClick={() => setSide('BUY')}
                    className={`flex-1 py-2 text-sm font-bold transition-colors ${side === 'BUY' ? 'bg-green-600/20 text-green-500 border-b-2 border-green-500' : 'text-gray-400 hover:bg-gray-800'}`}
                >
                    Buy
                </button>
                <button
                    type="button"
                    onClick={() => setSide('SELL')}
                    className={`flex-1 py-2 text-sm font-bold transition-colors ${side === 'SELL' ? 'bg-red-600/20 text-red-500 border-b-2 border-red-500' : 'text-gray-400 hover:bg-gray-800'}`}
                >
                    Sell
                </button>
            </div>

            {/* Order Types */}
            <div className="flex gap-4 mb-4 text-sm font-medium">
                <button onClick={() => setOrderType('Limit')} className={`${orderType === 'Limit' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>Limit</button>
                <button onClick={() => setOrderType('Market')} className={`${orderType === 'Market' ? 'text-white border-b border-white' : 'text-gray-500 hover:text-gray-300'}`}>Market</button>
                <button type="button" className={`text-gray-500 cursor-not-allowed`} title="Coming Soon">Stop-Limit</button>
            </div>

            {/* Balances */}
            <div className="flex justify-between text-xs text-gray-400 mb-4 px-1">
                <span>Avail:</span>
                <span className="font-mono text-gray-200">
                    {side === 'BUY' ? `${quoteBalance.toLocaleString()} ${quoteAsset}` : `${baseBalance.toLocaleString()} ${baseAsset}`}
                </span>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
                {orderType === 'Limit' && (
                    <div className="relative">
                        <label className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">Price</label>
                        <input
                            type="text"
                            placeholder="0.00"
                            className="w-full bg-[#16161e] border border-gray-700 rounded-lg py-2 pl-12 pr-12 text-right text-gray-200 focus:border-blue-500 outline-none"
                            disabled
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{quoteAsset}</span>
                    </div>
                )}

                {orderType === 'Market' && (
                    <div className="relative">
                        <label className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">Price</label>
                        <input
                            type="text"
                            value="Market"
                            className="w-full bg-[#2a2a35] border border-gray-700 rounded-lg py-3 pl-14 text-center text-gray-400 outline-none cursor-not-allowed font-medium"
                            disabled
                        />
                    </div>
                )}

                <div className="relative group">
                    <label className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">Amount</label>
                    <input
                        type="number"
                        step="0.0001"
                        min="0.0001"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full bg-[#16161e] border border-gray-700 rounded-lg py-3 pl-16 pr-14 text-right text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono transition-all"
                        placeholder="0.00"
                        required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">{baseAsset}</span>
                </div>

                {/* Sliders fake */}
                <div className="mt-2 mb-2">
                    <div className="w-full h-1 bg-gray-700 rounded-full relative">
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-3 h-3 bg-gray-500 rounded-full border-2 border-[#1e1e24] cursor-pointer hover:bg-white" />
                        <div className="absolute top-1/2 -translate-y-1/2 left-1/4 w-3 h-3 bg-gray-500 rounded-full border-2 border-[#1e1e24] cursor-pointer hover:bg-white" />
                        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 w-3 h-3 bg-gray-500 rounded-full border-2 border-[#1e1e24] cursor-pointer hover:bg-white" />
                        <div className="absolute top-1/2 -translate-y-1/2 left-3/4 w-3 h-3 bg-gray-500 rounded-full border-2 border-[#1e1e24] cursor-pointer hover:bg-white" />
                        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-3 h-3 bg-gray-500 rounded-full border-2 border-[#1e1e24] cursor-pointer hover:bg-white" />
                    </div>
                </div>

                <div className="mt-auto">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 rounded-lg font-bold text-white transition-all ${isLoading
                            ? 'opacity-50 cursor-not-allowed bg-gray-600'
                            : side === 'BUY'
                                ? 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/20'
                                : 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20'
                            }`}
                    >
                        {isLoading ? 'Processing...' : `${side === 'BUY' ? 'Buy' : 'Sell'} ${baseAsset}`}
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-3 flex items-center justify-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 opacity-60"></span>
                        Simulated Execution Engine
                    </p>
                </div>
            </form>
        </div>
    );
};

export default OrderEntry;
