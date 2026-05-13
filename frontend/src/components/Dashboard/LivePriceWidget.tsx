import React, { useState, useEffect } from 'react';
import { fetchStockPrice, fetchCryptoPrice, PriceData, cryptoIds } from '../../services/priceService';

interface WatchlistItem {
  symbol: string;
  type: 'stock' | 'crypto';
  name: string;
}

const LivePriceWidget: React.FC = () => {
  const [watchlist] = useState<WatchlistItem[]>([
    { symbol: 'AAPL', type: 'stock', name: 'Apple' },
    { symbol: 'TSLA', type: 'stock', name: 'Tesla' },
    { symbol: 'NVDA', type: 'stock', name: 'NVIDIA' },
    { symbol: 'SPY', type: 'stock', name: 'S&P 500 ETF' },
    { symbol: 'BTC', type: 'crypto', name: 'Bitcoin' },
    { symbol: 'ETH', type: 'crypto', name: 'Ethereum' }
  ]);

  const [prices, setPrices] = useState<Map<string, PriceData>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      const newPrices = new Map<string, PriceData>();

      for (const item of watchlist) {
        let priceData: PriceData | null = null;

        if (item.type === 'stock') {
          priceData = await fetchStockPrice(item.symbol);
        } else if (item.type === 'crypto') {
          const coinId = cryptoIds[item.symbol];
          if (coinId) {
            priceData = await fetchCryptoPrice(coinId);
            if (priceData) {
              priceData.symbol = item.symbol; // Override with our symbol
            }
          }
        }

        if (priceData) {
          newPrices.set(item.symbol, priceData);
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setPrices(newPrices);
      setLoading(false);
    };

    fetchPrices();

    // Refresh every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [watchlist]);

  const formatPrice = (symbol: string, price: number) => {
    if (symbol === 'BTC' || symbol === 'ETH') {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          Live Market Prices
        </h3>
        <span className="text-xs text-gray-500">
          Updates every 30s
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {watchlist.map(item => {
            const priceData = prices.get(item.symbol);
            if (!priceData) return null;

            const isPositive = priceData.changePercent >= 0;

            return (
              <div
                key={item.symbol}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <div className="font-semibold text-gray-900">{item.symbol}</div>
                    <div className="text-xs text-gray-500">{item.name}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-gray-900">
                    {formatPrice(item.symbol, priceData.price)}
                  </div>
                  <div className={`text-xs font-mono ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{priceData.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LivePriceWidget;
