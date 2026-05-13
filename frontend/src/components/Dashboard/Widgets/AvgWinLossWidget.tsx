import React, { useRef, useLayoutEffect } from 'react';
import { BarChart2 } from 'lucide-react';
import WidgetContainer from './WidgetContainer';
import gsap from 'gsap';

interface AvgWinLossWidgetProps {
    avgWin: number;
    avgLoss: number;
    onRemove?: () => void;
}

const AvgWinLossWidget: React.FC<AvgWinLossWidgetProps> = ({ avgWin, avgLoss, onRemove }) => {
    const maxVal = Math.max(avgWin, Math.abs(avgLoss));
    const winWidth = (avgWin / maxVal) * 100;
    const lossWidth = (Math.abs(avgLoss) / maxVal) * 100;

    const winBarRef = useRef<HTMLDivElement>(null);
    const lossBarRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(winBarRef.current, {
                width: 0,
                duration: 1.5,
                ease: "power3.out",
                delay: 0.2
            });

            gsap.from(lossBarRef.current, {
                width: 0,
                duration: 1.5,
                ease: "power3.out",
                delay: 0.4
            });
        });

        return () => ctx.revert();
    }, [avgWin, avgLoss]);

    return (
        <WidgetContainer
            title="Avg Win/Loss Trade"
            icon={<BarChart2 size={16} />}
            onRemove={onRemove}
        >
            <div className="space-y-6">
                {/* Win Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Avg Win</span>
                        <span className="text-green-400 font-semibold">${avgWin.toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            ref={winBarRef}
                            className="h-full bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                            style={{ width: `${winWidth}%` }}
                        />
                    </div>
                </div>

                {/* Loss Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Avg Loss</span>
                        <span className="text-red-400 font-semibold">-${Math.abs(avgLoss).toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            ref={lossBarRef}
                            className="h-full bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                            style={{ width: `${lossWidth}%` }}
                        />
                    </div>
                </div>

                {/* Ratio */}
                <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Risk/Reward Ratio</span>
                    <span className="text-lg font-bold text-white">
                        1 : {(avgWin / Math.abs(avgLoss || 1)).toFixed(2)}
                    </span>
                </div>
            </div>
        </WidgetContainer>
    );
};

export default AvgWinLossWidget;
