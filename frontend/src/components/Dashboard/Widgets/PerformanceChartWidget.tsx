import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import WidgetContainer from './WidgetContainer';

interface PerformanceChartWidgetProps {
    data: { date: string; pnl: number }[];
    onRemove?: () => void;
}

const PerformanceChartWidget: React.FC<PerformanceChartWidgetProps> = ({ data, onRemove }) => {
    // Transform data for cumulative P&L
    let cumulative = 0;
    const chartData = data.map(d => {
        cumulative += d.pnl;
        return { ...d, value: cumulative };
    });

    const isProfit = cumulative >= 0;
    const color = isProfit ? '#10b981' : '#ef4444'; // Green or Red

    return (
        <WidgetContainer
            title="Performance Curve"
            icon={<TrendingUp size={16} />}
            onRemove={onRemove}
            className="col-span-1 md:col-span-2 lg:col-span-3 min-h-[300px]"
        >
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cumulative P&L']}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorPnl)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </WidgetContainer>
    );
};

export default PerformanceChartWidget;
