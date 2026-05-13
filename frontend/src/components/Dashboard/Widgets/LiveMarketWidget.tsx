import React, { useState, useEffect, useRef } from 'react';
import { Wifi } from 'lucide-react';
import WidgetContainer from './WidgetContainer';

const COINS = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT'];
const STREAM_SYMBOLS = COINS.map(c => `${c.toLowerCase()}usdt@ticker`).join('/');

interface CoinData { symbol: string; price: number; change: number; }

interface LiveMarketWidgetProps {
  onRemove: () => void;
}

const LiveMarketWidget: React.FC<LiveMarketWidgetProps> = ({ onRemove }) => {
  const [prices, setPrices] = useState<Record<string, CoinData>>({});
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${STREAM_SYMBOLS}`);
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (event) => {
      const { data } = JSON.parse(event.data);
      if (!data) return;
      const symbol = data.s?.replace('USDT', '') || '';
      if (!symbol || !COINS.includes(symbol)) return;
      setPrices(prev => ({
        ...prev,
        [symbol]: {
          symbol,
          price: parseFloat(data.c),
          change: parseFloat(data.P),
        }
      }));
    };
    wsRef.current = ws;
    return () => ws.close();
  }, []);

  const formatPrice = (symbol: string, price: number) => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  };

  return (
    <WidgetContainer title="Live Market" onRemove={onRemove}>
      <div className="flex flex-col h-full">
        {/* Status */}
        <div className="flex items-center gap-1.5 mb-3">
          <Wifi size={12} className={connected ? 'text-green-400' : 'text-gray-500'} />
          <span className={`text-xs font-semibold ${connected ? 'text-green-400' : 'text-gray-500'}`}>
            {connected ? 'CONNECTED' : 'CONNECTING...'}
          </span>
        </div>

        {/* Coin List */}
        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
          {COINS.map(coin => {
            const data = prices[coin];
            const isUp = (data?.change ?? 0) >= 0;
            return (
              <div key={coin} className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${data ? (isUp ? 'bg-green-400' : 'bg-red-400') : 'bg-gray-600'}`} />
                  <span className="text-sm font-bold text-white">{coin}</span>
                </div>
                <div className="text-right">
                  {data ? (
                    <>
                      <div className="text-sm font-mono font-bold text-white">{formatPrice(coin, data.price)}</div>
                      <div className={`text-xs font-mono ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isUp ? '↗' : '↘'} {isUp ? '+' : ''}{data.change.toFixed(2)}%
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-gray-600">loading…</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </WidgetContainer>
  );
};

export default LiveMarketWidget;
