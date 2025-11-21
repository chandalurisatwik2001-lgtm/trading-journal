import React, { useRef, useLayoutEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import WidgetContainer from './WidgetContainer';
import gsap from 'gsap';

interface AccountBalanceWidgetProps {
    balance: number;
    totalPnl: number;
    currency?: string;
    onRemove?: () => void;
}

const AccountBalanceWidget: React.FC<AccountBalanceWidgetProps> = ({ balance, totalPnl, currency = '$', onRemove }) => {
    const isPositive = totalPnl >= 0;
    const balanceRef = useRef<HTMLDivElement>(null);
    const pnlRef = useRef<HTMLSpanElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Animate Balance
            gsap.from(balanceRef.current, {
                textContent: 0,
                duration: 2,
                ease: "power2.out",
                snap: { textContent: 1 },
                stagger: 1,
                onUpdate: function () {
                    if (balanceRef.current) {
                        balanceRef.current.innerHTML = currency + Number(this.targets()[0].textContent).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    }
                }
            });

            // Animate P&L
            gsap.from(pnlRef.current, {
                textContent: 0,
                duration: 2,
                ease: "power2.out",
                snap: { textContent: 1 },
                onUpdate: function () {
                    if (pnlRef.current) {
                        const val = Number(this.targets()[0].textContent);
                        pnlRef.current.innerHTML = (val >= 0 ? '+' : '') + currency + Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2 });
                    }
                }
            });
        });

        return () => ctx.revert();
    }, [balance, totalPnl, currency]);

    return (
        <WidgetContainer
            title="Account Balance & P&L"
            icon={<DollarSign size={16} />}
            onRemove={onRemove}
            className="col-span-1 md:col-span-2 lg:col-span-1"
        >
            <div className="flex flex-col h-full justify-between">
                <div>
                    <div ref={balanceRef} className="text-3xl font-bold text-white tracking-tight mb-1">
                        {currency}{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-400">Total Account Value</div>
                </div>

                <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <span className="text-sm text-gray-400">Total P&L</span>
                    <div className={`flex items-center gap-2 font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span ref={pnlRef}>
                            {isPositive ? '+' : ''}{currency}{Math.abs(totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>
        </WidgetContainer>
    );
};

export default AccountBalanceWidget;
