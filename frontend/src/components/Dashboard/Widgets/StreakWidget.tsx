import React from 'react';
import { Activity, Flame } from 'lucide-react';
import WidgetContainer from './WidgetContainer';

interface StreakWidgetProps {
    currentDayStreak: number;
    currentTradeStreak: number;
    onRemove?: () => void;
}

const StreakWidget: React.FC<StreakWidgetProps> = ({ currentDayStreak, currentTradeStreak, onRemove }) => {
    return (
        <WidgetContainer
            title="Trading Streaks"
            icon={<Activity size={16} />}
            onRemove={onRemove}
        >
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/30 rounded-xl p-3 border border-white/5 flex flex-col items-center text-center">
                    <div className="mb-2 p-2 bg-orange-500/10 rounded-full text-orange-500">
                        <Flame size={18} />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{currentDayStreak}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Day Streak</div>
                </div>

                <div className="bg-gray-800/30 rounded-xl p-3 border border-white/5 flex flex-col items-center text-center">
                    <div className="mb-2 p-2 bg-blue-500/10 rounded-full text-blue-500">
                        <Activity size={18} />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{currentTradeStreak}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Trade Streak</div>
                </div>
            </div>
        </WidgetContainer>
    );
};

export default StreakWidget;
