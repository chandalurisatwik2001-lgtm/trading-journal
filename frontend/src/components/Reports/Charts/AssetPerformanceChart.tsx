import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AssetPerformanceChartProps {
    data: {
        assets: Array<{ asset_type: string; count: number; pnl: number; win_rate: number }>;
    };
}

const AssetPerformanceChart: React.FC<AssetPerformanceChartProps> = ({ data }) => {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.assets} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                    <XAxis type="number" stroke="#9CA3AF" />
                    <YAxis dataKey="asset_type" type="category" stroke="#9CA3AF" width={80} />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                        formatter={(value: number, name: string) => [
                            name === 'pnl' ? `$${value.toFixed(2)}` : value,
                            name === 'pnl' ? 'Net P&L' : name
                        ]}
                    />
                    <Bar dataKey="pnl" name="Net P&L" radius={[0, 4, 4, 0]}>
                        {data.assets.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AssetPerformanceChart;
