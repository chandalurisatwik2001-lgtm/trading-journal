import React, { useRef, useLayoutEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import WidgetContainer from './WidgetContainer';
import gsap from 'gsap';

interface StatWidgetProps {
    title: string;
    value: string | number;
    subValue?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    icon?: React.ReactNode;
    color?: string; // Tailwind text color class for the value (e.g., 'text-green-400')
    onRemove?: () => void;
    className?: string;
}

const StatWidget: React.FC<StatWidgetProps> = ({
    title,
    value,
    subValue,
    trend,
    trendValue,
    icon,
    color = 'text-white',
    onRemove,
    className
}) => {
    const valueRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(valueRef.current, {
                opacity: 0,
                y: 20,
                duration: 1,
                ease: "power3.out",
                delay: 0.1
            });
        });
        return () => ctx.revert();
    }, [value]);

    return (
        <WidgetContainer
            title={title}
            icon={icon}
            onRemove={onRemove}
            className={className}
        >
            <div className="flex flex-col justify-between h-full">
                <div className="flex items-end gap-3 mb-2">
                    <div ref={valueRef} className={`text-3xl font-bold tracking-tight ${color}`}>
                        {value}
                    </div>
                    {subValue && (
                        <div className="text-sm text-gray-400 mb-1.5 font-medium">
                            {subValue}
                        </div>
                    )}
                </div>

                {(trend || trendValue) && (
                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/5">
                        {trend === 'up' && <TrendingUp size={16} className="text-green-400" />}
                        {trend === 'down' && <TrendingDown size={16} className="text-red-400" />}
                        {trend === 'neutral' && <Minus size={16} className="text-gray-400" />}

                        {trendValue && (
                            <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-400' :
                                    trend === 'down' ? 'text-red-400' : 'text-gray-400'
                                }`}>
                                {trendValue}
                            </span>
                        )}
                        <span className="text-xs text-gray-500 ml-auto">vs last period</span>
                    </div>
                )}
            </div>
        </WidgetContainer>
    );
};

export default StatWidget;
