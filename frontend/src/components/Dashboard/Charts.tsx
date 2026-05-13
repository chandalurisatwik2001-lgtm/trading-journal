import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface HistoryPoint {
  timestamp: string;
  active_users: number;
  requests_per_sec: number;
  error_rate: number;
  revenue: number;
  cpu: number;
  memory: number;
}

interface MetricsChartProps {
  history: HistoryPoint[];
}

const formatTime = (ts: string) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-[#1A1A1A] border border-white/10 rounded-sm p-3 text-xs">
      <div className="text-[#666] font-mono mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.stroke || p.color }} />
          <span className="text-[#A0A0A0]">{p.name}:</span>
          <span className="font-mono text-white font-bold">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export const TrafficChart: React.FC<MetricsChartProps> = ({ history }) => {
  const data = history.map(h => ({
    time: formatTime(h.timestamp),
    'Active Users': h.active_users,
    'Requests/s': h.requests_per_sec,
  }));

  return (
    <div
      data-testid="traffic-chart"
      className="bg-[#111111] border border-white/10 rounded-sm p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] tracking-[0.2em] text-[#666] uppercase">Traffic Overview</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-0.5 bg-[#0033FF]" />
            <span className="text-[10px] text-[#666]">Users</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-0.5 bg-[#00FF66]" />
            <span className="text-[10px] text-[#666]">Req/s</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0033FF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0033FF" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00FF66" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#00FF66" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="time" stroke="#666" tick={{ fill: '#666', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 10 }} tickLine={false} axisLine={false} width={45} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="Active Users" stroke="#0033FF" strokeWidth={2} fill="url(#userGrad)" isAnimationActive={false} />
          <Area type="monotone" dataKey="Requests/s" stroke="#00FF66" strokeWidth={2} fill="url(#reqGrad)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ErrorChart: React.FC<MetricsChartProps> = ({ history }) => {
  const data = history.map(h => ({
    time: formatTime(h.timestamp),
    'Error Rate': h.error_rate,
  }));

  return (
    <div
      data-testid="error-chart"
      className="bg-[#111111] border border-white/10 rounded-sm p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] tracking-[0.2em] text-[#666] uppercase">Error Rate</h3>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-0.5 bg-[#FF3B30]" />
          <span className="text-[10px] text-[#666]">Errors %</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="time" stroke="#666" tick={{ fill: '#666', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 10 }} tickLine={false} axisLine={false} width={35} domain={[0, 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="Error Rate" stroke="#FF3B30" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SystemChart: React.FC<MetricsChartProps> = ({ history }) => {
  const data = history.map(h => ({
    time: formatTime(h.timestamp),
    CPU: h.cpu,
    Memory: h.memory,
  }));

  return (
    <div
      data-testid="system-chart"
      className="bg-[#111111] border border-white/10 rounded-sm p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] tracking-[0.2em] text-[#666] uppercase">System Resources</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-0.5 bg-[#E2F13C]" />
            <span className="text-[10px] text-[#666]">CPU</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-0.5 bg-[#8B5CF6]" />
            <span className="text-[10px] text-[#666]">Memory</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E2F13C" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#E2F13C" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="time" stroke="#666" tick={{ fill: '#666', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 10 }} tickLine={false} axisLine={false} width={30} domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="CPU" stroke="#E2F13C" strokeWidth={2} fill="url(#cpuGrad)" isAnimationActive={false} />
          <Area type="monotone" dataKey="Memory" stroke="#8B5CF6" strokeWidth={2} fill="url(#memGrad)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
