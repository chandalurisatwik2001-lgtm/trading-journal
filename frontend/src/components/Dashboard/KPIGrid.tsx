import React, { useEffect, useRef } from 'react';
import { Users, DollarSign, Zap, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, change, icon, color }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value && cardRef.current) {
      cardRef.current.classList.remove('metric-flash');
      void cardRef.current.offsetWidth;
      cardRef.current.classList.add('metric-flash');
    }
    prevValue.current = value;
  }, [value]);

  return (
    <div
      ref={cardRef}
      data-testid={`kpi-card-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      className="bg-[#111111] border border-white/10 rounded-sm p-5 flex flex-col justify-between min-h-[130px] transition-colors hover:bg-[#1A1A1A]"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] tracking-[0.2em] text-[#666] uppercase font-body">
          {label}
        </span>
        <div style={{ color }} className="opacity-60">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="font-mono text-3xl font-bold text-white tracking-tight" data-testid={`kpi-value-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
          {value}
        </span>
        {change !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-mono ${change >= 0 ? 'text-[#00FF66]' : 'text-[#FF3B30]'}`}>
            {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface Metrics {
  active_users: number;
  revenue: number;
  requests_per_sec: number;
  error_rate: number;
}

interface KPIGridProps {
  metrics: Metrics;
  prevMetrics?: Metrics | null;
}

const KPIGrid: React.FC<KPIGridProps> = ({ metrics, prevMetrics }) => {
  const calcChange = (current: number, prev: number | undefined) => {
    if (!prev || prev === 0) return 0;
    return ((current - prev) / prev) * 100;
  };

  const cards: KPICardProps[] = [
    {
      label: 'Active Users',
      value: metrics.active_users.toLocaleString(),
      change: prevMetrics ? calcChange(metrics.active_users, prevMetrics.active_users) : undefined,
      icon: <Users size={18} />,
      color: '#0033FF',
    },
    {
      label: 'Revenue',
      value: `$${metrics.revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      change: prevMetrics ? calcChange(metrics.revenue, prevMetrics.revenue) : undefined,
      icon: <DollarSign size={18} />,
      color: '#00FF66',
    },
    {
      label: 'Requests/sec',
      value: metrics.requests_per_sec.toLocaleString(),
      change: prevMetrics ? calcChange(metrics.requests_per_sec, prevMetrics.requests_per_sec) : undefined,
      icon: <Zap size={18} />,
      color: '#E2F13C',
    },
    {
      label: 'Error Rate',
      value: `${metrics.error_rate.toFixed(2)}%`,
      change: prevMetrics ? calcChange(metrics.error_rate, prevMetrics.error_rate) : undefined,
      icon: <AlertTriangle size={18} />,
      color: '#FF3B30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children" data-testid="kpi-grid">
      {cards.map((card) => (
        <KPICard key={card.label} {...card} />
      ))}
    </div>
  );
};

export default KPIGrid;
