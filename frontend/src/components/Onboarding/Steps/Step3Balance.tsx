import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ChevronDown } from 'lucide-react';

interface Step3BalanceProps {
    balance: string;
    currency: string;
    onBalanceChange: (value: string) => void;
    onCurrencyChange: (value: string) => void;
    onNext: () => void;
    onBack: () => void;
}

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];

const Step3Balance: React.FC<Step3BalanceProps> = ({
    balance,
    currency,
    onBalanceChange,
    onCurrencyChange,
    onNext,
    onBack
}) => {
    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold"
                >
                    Starting Balance
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400"
                >
                    How much capital are you starting with?
                </motion.p>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-6"
            >
                <div className="relative w-full max-w-xs">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-2xl font-medium">
                        {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency}
                    </span>
                    <input
                        type="number"
                        value={balance}
                        onChange={(e) => onBalanceChange(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-transparent text-5xl font-bold text-center text-white placeholder-gray-700 focus:outline-none py-4"
                        autoFocus
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-gray-400">Currency:</span>
                    <div className="relative">
                        <select
                            value={currency}
                            onChange={(e) => onCurrencyChange(e.target.value)}
                            className="appearance-none bg-white/10 border border-white/10 rounded-lg px-4 py-2 pr-10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-white/20 transition-colors"
                        >
                            {currencies.map(c => (
                                <option key={c} value={c} className="bg-gray-900">{c}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex justify-between pt-4"
            >
                <button
                    onClick={onBack}
                    className="px-6 py-3 rounded-xl text-gray-400 hover:text-white transition-colors font-medium"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    disabled={!balance}
                    className="px-8 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next Step
                </button>
            </motion.div>
        </div>
    );
};

export default Step3Balance;
