import React, { useEffect, useState } from 'react';

interface OrderBookProps {
    symbol: string;
}

interface OrderLevel {
    price: number;
    amount: number;
    total: number;
}

const OrderBook: React.FC<OrderBookProps> = ({ symbol }) => {
    const [bids, setBids] = useState<OrderLevel[]>([]);
    const [asks, setAsks] = useState<OrderLevel[]>([]);
    const [currentPrice, setCurrentPrice] = useState<number>(0);

    useEffect(() => {
        let isMounted = true;

        // Fetch initial snapshot
        const fetchSnapshot = async () => {
            try {
                const res = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=20`);
                const data = await res.json();

                if (!isMounted) return;

                const formatLevels = (levels: any[]): OrderLevel[] => {
                    let cumulative = 0;
                    return levels.map(level => {
                        const price = parseFloat(level[0]);
                        const amount = parseFloat(level[1]);
                        cumulative += amount;
                        return { price, amount, total: cumulative };
                    });
                };

                // Asks are returned ascending (lowest price first). We want them descending for the top half.
                setAsks(formatLevels(data.asks).reverse());
                setBids(formatLevels(data.bids));

                if (data.bids.length > 0 && data.asks.length > 0) {
                    // Approximate spread mid-price
                    const mid = (parseFloat(data.bids[0][0]) + parseFloat(data.asks[0][0])) / 2;
                    setCurrentPrice(mid);
                }

            } catch (error) {
                console.error("Failed to fetch order book snapshot", error);
            }
        };

        fetchSnapshot();

        // For simplicity in this demo, we'll just poll the snapshot every 2 seconds rather than complex WS diff syncing
        const intervalId = setInterval(fetchSnapshot, 2000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [symbol]);

    const formatNumber = (num: number, decimals: number) => {
        if (isNaN(num)) return "0.00";
        return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    const maxTotalAsk = asks.length > 0 ? asks[0].total : 1;
    const maxTotalBid = bids.length > 0 ? bids[bids.length - 1].total : 1;
    const maxTotal = Math.max(maxTotalAsk, maxTotalBid);

    return (
        <div className="bg-[#1e1e24] rounded-xl border border-gray-800 flex flex-col h-full overflow-hidden shadow-2xl">
            <div className="p-3 border-b border-gray-800">
                <h3 className="text-sm font-bold text-gray-200">Order Book</h3>
            </div>

            <div className="flex text-xs font-semibold text-gray-500 py-2 px-3 border-b border-gray-800">
                <div className="flex-1 text-left">Price(USDT)</div>
                <div className="flex-1 text-right">Amount</div>
                <div className="flex-1 text-right">Total</div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col text-xs font-mono relative group">
                {/* Asks (Sell Orders) - Red */}
                <div className="flex-1 overflow-y-hidden flex flex-col justify-end">
                    {asks.map((ask, i) => (
                        <div key={`ask-${i}`} className="flex py-0.5 px-3 relative hover:bg-gray-800/50 cursor-pointer">
                            <div
                                className="absolute top-0 right-0 h-full bg-red-500/10 z-0 transition-all duration-300"
                                style={{ width: `${(ask.total / maxTotal) * 100}%` }}
                            />
                            <div className="flex-1 text-red-500 z-10 text-left">{formatNumber(ask.price, 2)}</div>
                            <div className="flex-1 text-right text-gray-300 z-10">{formatNumber(ask.amount, 4)}</div>
                            <div className="flex-1 text-right text-gray-400 z-10">{formatNumber(ask.total, 4)}</div>
                        </div>
                    ))}
                </div>

                {/* Current Price spread */}
                <div className="py-2 px-3 flex items-center gap-2 border-y border-gray-800/50 bg-[#16161e]">
                    <span className="text-lg font-bold text-green-500">{formatNumber(currentPrice, 2)}</span>
                    <span className="text-gray-500 text-xs line-through">$ {formatNumber(currentPrice, 2)}</span>
                </div>

                {/* Bids (Buy Orders) - Green */}
                <div className="flex-1 overflow-y-hidden flex flex-col justify-start">
                    {bids.map((bid, i) => (
                        <div key={`bid-${i}`} className="flex py-0.5 px-3 relative hover:bg-gray-800/50 cursor-pointer">
                            <div
                                className="absolute top-0 right-0 h-full bg-green-500/10 z-0 transition-all duration-300"
                                style={{ width: `${(bid.total / maxTotal) * 100}%` }}
                            />
                            <div className="flex-1 text-green-500 z-10 text-left">{formatNumber(bid.price, 2)}</div>
                            <div className="flex-1 text-right text-gray-300 z-10">{formatNumber(bid.amount, 4)}</div>
                            <div className="flex-1 text-right text-gray-400 z-10">{formatNumber(bid.total, 4)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrderBook;
