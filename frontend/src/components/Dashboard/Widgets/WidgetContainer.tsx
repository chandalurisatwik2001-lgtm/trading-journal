import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface WidgetContainerProps {
    title: string;
    children: React.ReactNode;
    onRemove?: () => void;
    className?: string;
    icon?: React.ReactNode;
    headerControls?: React.ReactNode;
}

const WidgetContainer: React.FC<WidgetContainerProps> = ({
    title,
    children,
    onRemove,
    className,
    icon,
    headerControls
}) => {
    return (
        <div className={cn(
            "glass-panel h-full group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/10 hover:shadow-2xl hover:shadow-blue-900/10",
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                    {icon && <span className="text-gray-400">{icon}</span>}
                    <h3 className="text-sm font-semibold text-gray-200 tracking-wide uppercase">{title}</h3>
                </div>

                <div className="flex items-center gap-3">
                    {headerControls}

                    {onRemove && (
                        <button
                            onClick={onRemove}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                            title="Remove widget"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-5 relative">
                {children}
            </div>

            {/* Decorative Corner Glow */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        </div>
    );
};

export default WidgetContainer;
