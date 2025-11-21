import React from 'react';
import { CheckCircle2, Circle, Trophy } from 'lucide-react';
import WidgetContainer from './WidgetContainer';

interface ProgressTrackerWidgetProps {
    onRemove?: () => void;
}

const ProgressTrackerWidget: React.FC<ProgressTrackerWidgetProps> = ({ onRemove }) => {
    // Mock data - in a real app, this would come from props or context
    const goals = [
        { id: 1, label: 'Daily P&L Goal', current: 750, target: 1000, unit: '$' },
        { id: 2, label: 'Win Rate', current: 65, target: 60, unit: '%' },
        { id: 3, label: 'Trades Taken', current: 12, target: 20, unit: '' },
    ];

    const calculateProgress = (current: number, target: number) => {
        return Math.min(100, Math.max(0, (current / target) * 100));
    };

    return (
        <WidgetContainer
            title="Progress Tracker"
            icon={<Trophy size={16} />}
            onRemove={onRemove}
            className="min-h-[300px]"
        >
            <div className="space-y-6 py-2">
                {goals.map((goal) => {
                    const progress = calculateProgress(goal.current, goal.target);
                    const isCompleted = progress >= 100;

                    return (
                        <div key={goal.id} className="group">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                                    {goal.label}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                        {goal.unit === '$' ? `$${goal.current}` : `${goal.current}${goal.unit}`}
                                        {' / '}
                                        {goal.unit === '$' ? `$${goal.target}` : `${goal.target}${goal.unit}`}
                                    </span>
                                    {isCompleted ? (
                                        <CheckCircle2 size={14} className="text-emerald-400" />
                                    ) : (
                                        <Circle size={14} className="text-gray-600" />
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar Background */}
                            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden border border-white/5">
                                {/* Progress Bar Fill */}
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'
                                        }`}
                                    style={{ width: `${progress}%` }}
                                >
                                    {/* Shimmer Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Overall Status */}
                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="text-xs text-gray-500">Overall Completion</div>
                    <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                        {Math.round(goals.reduce((acc, curr) => acc + calculateProgress(curr.current, curr.target), 0) / goals.length)}%
                    </div>
                </div>
            </div>
        </WidgetContainer>
    );
};

export default ProgressTrackerWidget;
