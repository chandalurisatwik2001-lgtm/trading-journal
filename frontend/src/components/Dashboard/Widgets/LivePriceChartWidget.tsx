import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import WidgetContainer from './WidgetContainer';

const COINS = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT'];

interface PricePoint { time: string; price: number; }

interface LivePriceChartWidgetProps {
  onRemove: () => void;
}

const LivePriceChartWidget: React.FC<LivePriceChartWidgetProps> = ({ onRemove }) => {
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [history, setHistory] = useState<PricePoint[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (wsRef.current) wsRef.current.close();
    const symbol = `${selectedCoin.toLowerCase()}usdt`;
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@ticker`);
    ws.onmessage = (event) => {
      const d = JSON.parse(event.data);
      const price = parseFloat(d.c);
      const change = parseFloat(d.P);
      setCurrentPrice(price);
      setPriceChange(change);
      setHistory(prev => {
        const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const updated = [...prev, { time: now, price }];
        return updated.length > 60 ? updated.slice(-60) : updated;
      });
    };
    wsRef.current = ws;
    setHistory([]);
    return () => ws.close();
  }, [selectedCoin]);

  const isUp = priceChange >= 0;
  const color = isUp ? '#10b981' : '#ef4444';

  const formatPrice = (p: number) => p >= 1000
    ? `$${p.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    : `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;

  return (
    <WidgetContainer title="Live Price Chart" onRemove={onRemove}>
      <div className="flex flex-col h-full gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-2xl font-black text-white font-mono">
                {currentPrice > 0 ? formatPrice(currentPrice) : '—'}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isUp ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                {isUp ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Coin Selector */}
        <div className="flex flex-wrap gap-1.5">
          {COINS.map(coin => (
            <button
              key={coin}
              onClick={() => setSelectedCoin(coin)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${selectedCoin === coin
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/40'
                : 'bg-gray-800/60 text-gray-400 hover:text-white border border-gray-700/50'}`}
            >
              {coin}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="flex-1 min-h-[120px]">
          {history.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                <defs>
                  <linearGradient id="lpcGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: '#9ca3af' }}
                  formatter={(v: any) => [formatPrice(Number(v)), selectedCoin]}
                />
                <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fill="url(#lpcGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-400" />
            </div>
          )}
        </div>
      </div>
    </WidgetContainer>
  );
};

export default LivePriceChartWidget;
