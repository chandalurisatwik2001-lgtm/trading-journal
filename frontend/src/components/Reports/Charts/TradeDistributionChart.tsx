import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TradeDistributionChartProps {
    data: {
        long: { count: number; pnl: number; win_rate: number };
        short: { count: number; pnl: number; win_rate: number };
    };
}

const TradeDistributionChart: React.FC<TradeDistributionChartProps> = ({ data }) => {
    const chartData = [
        { name: 'Long', ...data.long },
        { name: 'Short', ...data.short }
    ];

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                    />
                    <Bar dataKey="count" name="Trades" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.name === 'Long' ? '#10B981' : '#EF4444'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TradeDistributionChart;
