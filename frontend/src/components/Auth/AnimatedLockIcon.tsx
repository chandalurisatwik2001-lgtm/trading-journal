import React, { forwardRef } from 'react';

interface AnimatedLockIconProps {
    className?: string;
}

const AnimatedLockIcon = forwardRef<SVGSVGElement, AnimatedLockIconProps>(
    ({ className = '' }, ref) => {
        return (
            <svg
                ref={ref}
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={className}
                style={{ overflow: 'visible' }}
            >
                <defs>
                    {/* Metallic Gradient for Shackle */}
                    <linearGradient id="shackleGradient" x1="16" y1="8" x2="48" y2="32" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#E2E8F0" />
                        <stop offset="40%" stopColor="#94A3B8" />
                        <stop offset="60%" stopColor="#CBD5E1" />
                        <stop offset="100%" stopColor="#64748B" />
                    </linearGradient>

                    {/* Body Gradient - Deep Blue/Black with gloss */}
                    <linearGradient id="bodyGradient" x1="32" y1="24" x2="32" y2="56" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.95" />
                    </linearGradient>

                    {/* Inner Bevel for Body */}
                    <linearGradient id="bodyBevel" x1="32" y1="24" x2="32" y2="56" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                        <stop offset="10%" stopColor="white" stopOpacity="0.1" />
                        <stop offset="90%" stopColor="black" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="black" stopOpacity="0.3" />
                    </linearGradient>
                </defs>

                {/* Lock Shackle - The moving part */}
                <g className="lock-shackle">
                    {/* Shackle Shadow/Depth */}
                    <path
                        d="M19 26V18C19 10.8203 24.8203 5 32 5C39.1797 5 45 10.8203 45 18V26"
                        stroke="black"
                        strokeWidth="6"
                        strokeLinecap="round"
                        opacity="0.2"
                        transform="translate(0, 2)"
                    />
                    {/* Main Shackle */}
                    <path
                        d="M19 26V18C19 10.8203 24.8203 5 32 5C39.1797 5 45 10.8203 45 18V26"
                        stroke="url(#shackleGradient)"
                        strokeWidth="6"
                        strokeLinecap="round"
                    />
                </g>

                {/* Lock Body - The stationary part */}
                <g className="lock-body">
                    {/* Main Body Shape */}
                    <rect
                        x="14"
                        y="24"
                        width="36"
                        height="32"
                        rx="6"
                        fill="url(#bodyGradient)"
                    />

                    {/* Bevel/Highlight Overlay */}
                    <rect
                        x="14"
                        y="24"
                        width="36"
                        height="32"
                        rx="6"
                        fill="url(#bodyBevel)"
                        style={{ mixBlendMode: 'overlay' }}
                    />

                    {/* Keyhole Area */}
                    <circle cx="32" cy="38" r="4" fill="#1E293B" opacity="0.6" />
                    <rect x="30" y="38" width="4" height="8" rx="1" fill="#1E293B" opacity="0.6" />

                    {/* Keyhole Highlight */}
                    <circle cx="32" cy="38" r="3" fill="white" opacity="0.9" />
                    <rect x="30.5" y="38" width="3" height="7" rx="1" fill="white" opacity="0.9" />
                </g>
            </svg>
        );
    }
);

AnimatedLockIcon.displayName = 'AnimatedLockIcon';

export default AnimatedLockIcon;
