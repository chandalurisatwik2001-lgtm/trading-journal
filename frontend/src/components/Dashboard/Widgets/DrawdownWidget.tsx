import React from 'react';
import { TrendingDown } from 'lucide-react';
import WidgetContainer from './WidgetContainer';

interface DrawdownWidgetProps {
    maxDrawdown: number;
    avgDrawdown: number;
    onRemove?: () => void;
}

const DrawdownWidget: React.FC<DrawdownWidgetProps> = ({ maxDrawdown, avgDrawdown, onRemove }) => {
    return (
        <WidgetContainer
            title="Drawdown Analysis"
            icon={<TrendingDown size={16} />}
            onRemove={onRemove}
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                    <span className="text-sm text-gray-400">Max Drawdown</span>
                    <span className="text-lg font-bold text-red-400">-${Math.abs(maxDrawdown).toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/30 border border-white/5 rounded-xl">
                    <span className="text-sm text-gray-400">Avg Drawdown</span>
                    <span className="text-lg font-bold text-gray-300">-${Math.abs(avgDrawdown).toFixed(2)}</span>
                </div>
            </div>
        </WidgetContainer>
    );
};

export default DrawdownWidget;
