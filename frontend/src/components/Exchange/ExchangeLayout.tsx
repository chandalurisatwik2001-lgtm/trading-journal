import React, { useState } from 'react';
import CandleChart from './CandleChart';
import OrderBook from './OrderBook';
import OrderEntry from './OrderEntry';

const ExchangeLayout: React.FC = () => {
    // Current active market
    const [symbol, setSymbol] = useState('BTCUSDT');
    // For refreshing child components if needed
    const [refreshKey, setRefreshKey] = useState(0);

    const handleOrderSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] min-h-[800px] w-full gap-4 max-w-[1600px] mx-auto">
            {/* Top Market Header */}
            <div className="bg-[#1e1e24] rounded-xl border border-gray-800 p-4 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-black text-white">{symbol}</h2>
                        <a href="#" className="text-xs text-blue-400 hover:underline">Simulated Trading</a>
                    </div>
                </div>

                {/* Symbol selector mock */}
                <div className="flex gap-2">
                    {['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'].map(s => (
                        <button
                            key={s}
                            onClick={() => setSymbol(s)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${symbol === s
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                    : 'bg-[#16161e] text-gray-400 hover:text-white border border-gray-800'
                                }`}
                        >
                            {s.replace('USDT', '')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Trading Area Grid */}
            <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
                {/* Left: Chart Container (Takes 8 columns) */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
                    <div className="flex-1 min-h-[400px]">
                        <CandleChart symbol={symbol} interval="1m" />
                    </div>
                    {/* Bottom: Open Orders/Positions (Takes remaining vertical space under chart) */}
                    <div className="h-48 bg-[#1e1e24] rounded-xl border border-gray-800 p-4 shadow-2xl overflow-hidden flex flex-col">
                        <h3 className="text-sm font-bold text-gray-200 mb-2">Recent Simulated Trades</h3>
                        <p className="text-xs text-gray-500 mb-4">Trades executed here immediately update your virtual balance and are logged to your main Journal.</p>

                        {/* Empty state for positions since we immediately settle market orders */}
                        <div className="flex-1 flex items-center justify-center text-gray-600 text-sm italic bg-[#16161e] rounded-lg border border-gray-800/50">
                            Check the main Journal "Trades" tab for execution history
                        </div>
                    </div>
                </div>

                {/* Right: OrderBook & Entry (Takes 4 columns) */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 h-full">
                    <div className="h-1/2 min-h-[300px]">
                        <OrderBook symbol={symbol} />
                    </div>
                    <div className="h-1/2 min-h-[300px]">
                        <OrderEntry symbol={symbol} onOrderSuccess={handleOrderSuccess} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExchangeLayout;
