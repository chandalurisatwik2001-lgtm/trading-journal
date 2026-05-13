import React, { useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';
import WidgetContainer from './WidgetContainer';
import gsap from 'gsap';

interface ZellaScoreWidgetProps {
    score: number;
    onRemove?: () => void;
}

const ZellaScoreWidget: React.FC<ZellaScoreWidgetProps> = ({ score, onRemove }) => {
    const circleRef = useRef<SVGCircleElement>(null);
    const scoreRef = useRef<HTMLDivElement>(null);

    // Circle properties
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animate the stroke
            gsap.to(circleRef.current, {
                strokeDashoffset: strokeDashoffset,
                duration: 2,
                ease: "power3.out",
                delay: 0.2
            });

            // Animate the number
            gsap.from(scoreRef.current, {
                textContent: 0,
                duration: 2,
                ease: "power3.out",
                snap: { textContent: 1 },
                onUpdate: function () {
                    if (scoreRef.current) {
                        scoreRef.current.innerHTML = Math.ceil(Number(this.targets()[0].textContent)).toString();
                    }
                }
            });
        });
        return () => ctx.revert();
    }, [score, strokeDashoffset]);

    const getColor = (s: number) => {
        if (s >= 80) return 'text-green-400 stroke-green-500';
        if (s >= 60) return 'text-yellow-400 stroke-yellow-500';
        return 'text-red-400 stroke-red-500';
    };

    const colorClass = getColor(score);

    return (
        <WidgetContainer
            title="Zella Score"
            icon={<Activity size={16} />}
            onRemove={onRemove}
            className="flex flex-col items-center justify-center"
        >
            <div className="relative flex items-center justify-center w-48 h-48">
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="96"
                        cy="96"
                        r={radius}
                        className="stroke-gray-800"
                        strokeWidth="12"
                        fill="transparent"
                    />
                    {/* Progress Circle */}
                    <circle
                        ref={circleRef}
                        cx="96"
                        cy="96"
                        r={radius}
                        className={`transition-all duration-1000 ease-out ${colorClass.split(' ')[1]}`}
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference} // Start empty
                        strokeLinecap="round"
                    />
                </svg>

                {/* Center Text */}
                <div className="absolute flex flex-col items-center">
                    <div ref={scoreRef} className={`text-5xl font-bold ${colorClass.split(' ')[0]}`}>
                        {score}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Excellent</div>
                </div>
            </div>
        </WidgetContainer>
    );
};

export default ZellaScoreWidget;
