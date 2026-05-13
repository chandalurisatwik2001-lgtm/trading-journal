import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useRealtimeData } from '../../../hooks/useRealtimeData';

interface LivePriceChartProps {
  onRemove?: () => void;
}

const COINS = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT'];
const COIN_COLORS: Record<string, string> = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  BNB: '#F3BA2F',
  SOL: '#9945FF',
  XRP: '#00AAE4',
  ADA: '#0033AD',
  DOGE: '#C2A633',
  DOT: '#E6007A',
};

const LivePriceChart: React.FC<LivePriceChartProps> = ({ onRemove }) => {
  const { prices, priceHistory, status } = useRealtimeData();
  const [activeCoin, setActiveCoin] = useState('BTC');

  const chartData = useMemo(() => {
    const history = priceHistory[activeCoin] || [];
    return history.map((pt, i) => ({
      idx: i,
      time: new Date(pt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: pt.price,
    }));
  }, [priceHistory, activeCoin]);

  const currentPrice = prices.find(p => p.symbol === activeCoin);
  const color = COIN_COLORS[activeCoin] || '#3B82F6';

  return (
    <div
      data-testid="live-price-chart"
      className="relative group bg-gray-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-5 h-full flex flex-col"
    >
      {onRemove && (
        <button
          onClick={onRemove}
          data-testid="remove-live-chart"
          className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition opacity-0 group-hover:opacity-100 z-10"
        >
          <X size={16} />
        </button>
      )}

      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <h3 className="text-sm font-semibold text-white" data-testid="chart-title">Live Price Chart</h3>
          </div>
          {currentPrice && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-white">
                ${currentPrice.price.toLocaleString('en-US', { maximumFractionDigits: currentPrice.price >= 100 ? 0 : 2 })}
              </span>
              <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${currentPrice.change_24h >= 0 ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                {currentPrice.change_24h >= 0 ? '+' : ''}{currentPrice.change_24h.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Coin selector */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {COINS.filter(c => prices.some(p => p.symbol === c)).map(coin => (
          <button
            key={coin}
            onClick={() => setActiveCoin(coin)}
            data-testid={`coin-selector-${coin}`}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              activeCoin === coin
                ? 'text-white shadow-md'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
            style={activeCoin === coin ? { backgroundColor: color + '33', color: color, border: `1px solid ${color}55` } : {}}
          >
            {coin}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        {chartData.length < 2 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-gray-500">Collecting data points...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`grad-${activeCoin}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                stroke="#666"
                tick={{ fill: '#666', fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#666"
                tick={{ fill: '#666', fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                width={55}
                domain={['auto', 'auto']}
                tickFormatter={(v: number) => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  borderColor: '#374151',
                  borderRadius: '8px',
                  color: '#F3F4F6',
                  fontSize: '12px',
                }}
                formatter={(value: any) => [`$${Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 })}`, activeCoin]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={color}
                strokeWidth={2}
                fill={`url(#grad-${activeCoin})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default LivePriceChart;
