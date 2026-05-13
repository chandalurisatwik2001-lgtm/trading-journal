import React from 'react';
import { TrendingUp } from 'lucide-react';
import WidgetContainer from './WidgetContainer';

interface TradeExpectancyWidgetProps {
    expectancy: number;
    onRemove?: () => void;
}

const TradeExpectancyWidget: React.FC<TradeExpectancyWidgetProps> = ({ expectancy, onRemove }) => {
    const isPositive = expectancy >= 0;

    return (
        <WidgetContainer
            title="Trade Expectancy"
            icon={<TrendingUp size={16} />}
            onRemove={onRemove}
        >
            <div className="flex flex-col items-center justify-center py-4">
                <div className={`text-4xl font-bold tracking-tight mb-2 ${isPositive ? 'text-purple-400' : 'text-gray-400'}`}>
                    ${expectancy.toFixed(2)}
                </div>
                <p className="text-sm text-gray-500 text-center px-4">
                    Expected value per trade based on your historical performance.
                </p>
            </div>
        </WidgetContainer>
    );
};

export default TradeExpectancyWidget;
