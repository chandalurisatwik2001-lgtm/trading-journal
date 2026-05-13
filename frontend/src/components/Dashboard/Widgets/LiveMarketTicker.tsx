import React, { useState } from 'react';
import { TrendingUp, TrendingDown, X, Wifi, WifiOff } from 'lucide-react';
import { useRealtimeData } from '../../../hooks/useRealtimeData';

interface LiveMarketTickerProps {
  onRemove?: () => void;
}

const LiveMarketTicker: React.FC<LiveMarketTickerProps> = ({ onRemove }) => {
  const { prices, status } = useRealtimeData();
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(4)}`;
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(1)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(1)}M`;
    return `$${vol.toLocaleString()}`;
  };

  const formatMcap = (mcap: number) => {
    if (mcap >= 1e12) return `$${(mcap / 1e12).toFixed(2)}T`;
    if (mcap >= 1e9) return `$${(mcap / 1e9).toFixed(1)}B`;
    return `$${(mcap / 1e6).toFixed(0)}M`;
  };

  return (
    <div
      data-testid="live-market-ticker"
      className="relative group bg-gray-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-5 h-full flex flex-col"
    >
      {onRemove && (
        <button
          onClick={onRemove}
          data-testid="remove-live-ticker"
          className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition opacity-0 group-hover:opacity-100 z-10"
        >
          <X size={16} />
        </button>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : status === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
          <h3 className="text-sm font-semibold text-white" data-testid="ticker-title">Live Market</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          {status === 'connected' ? <Wifi size={10} className="text-green-500" /> : <WifiOff size={10} className="text-red-500" />}
          <span className="uppercase">{status}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar" style={{ scrollbarWidth: 'thin' }}>
        {prices.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-500">Loading prices...</p>
            </div>
          </div>
        ) : (
          prices.map((coin) => {
            const isPositive = coin.change_24h >= 0;
            const isSelected = selectedCoin === coin.symbol;

            return (
              <div key={coin.symbol}>
                <button
                  onClick={() => setSelectedCoin(isSelected ? null : coin.symbol)}
                  data-testid={`ticker-row-${coin.symbol}`}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${
                    isSelected ? 'bg-white/10 border border-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <span className="text-sm font-bold text-white">{coin.symbol}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-white">{formatPrice(coin.price)}</div>
                    <div className={`flex items-center justify-end gap-0.5 text-[10px] font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      <span>{isPositive ? '+' : ''}{coin.change_24h.toFixed(2)}%</span>
                    </div>
                  </div>
                </button>

                {/* Expanded detail row */}
                {isSelected && (
                  <div className="px-3 py-2 mx-2 mb-1 bg-white/5 rounded-b-lg border-x border-b border-white/5 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-gray-500">24h Volume</span>
                        <div className="text-gray-300 font-mono">{formatVolume(coin.volume_24h)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Market Cap</span>
                        <div className="text-gray-300 font-mono">{formatMcap(coin.market_cap)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LiveMarketTicker;
