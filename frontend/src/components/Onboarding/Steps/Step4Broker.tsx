import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Search } from 'lucide-react';

interface Step4BrokerProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onBack: () => void;
    loading: boolean;
}

const brokers = [
    'Binance', 'Coinbase', 'Bybit', 'MetaTrader 4', 'MetaTrader 5',
    'TradingView', 'Robinhood', 'Interactive Brokers', 'TD Ameritrade',
    'Schwab', 'E*TRADE', 'Webull', 'Kraken', 'KuCoin', 'Other'
];

const Step4Broker: React.FC<Step4BrokerProps> = ({ value, onChange, onSubmit, onBack, loading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCustom, setIsCustom] = useState(false);

    const filteredBrokers = brokers.filter(b =>
        b.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (broker: string) => {
        if (broker === 'Other') {
            setIsCustom(true);
            onChange('');
        } else {
            setIsCustom(false);
            onChange(broker);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold"
                >
                    Which platform do you use?
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400"
                >
                    Select your primary broker or exchange.
                </motion.p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
            >
                {/* Search / Custom Input */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        value={isCustom ? value : searchTerm}
                        onChange={(e) => {
                            if (isCustom) {
                                onChange(e.target.value);
                            } else {
                                setSearchTerm(e.target.value);
                            }
                        }}
                        placeholder={isCustom ? "Enter broker name..." : "Search brokers..."}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        autoFocus={isCustom}
                    />
                    {isCustom && (
                        <button
                            onClick={() => { setIsCustom(false); setSearchTerm(''); onChange(''); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
                        >
                            Cancel
                        </button>
                    )}
                </div>

                {/* Broker Grid */}
                {!isCustom && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {filteredBrokers.map((broker) => (
                            <button
                                key={broker}
                                onClick={() => handleSelect(broker)}
                                className={`
                  p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-3
                  ${value === broker
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                                    }
                `}
                            >
                                <Briefcase className="w-4 h-4 opacity-50" />
                                <span className="font-medium truncate">{broker}</span>
                            </button>
                        ))}
                    </div>
                )}
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
                    onClick={onSubmit}
                    disabled={!value || loading}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
                >
                    {loading ? 'Setting up...' : 'Finish Setup'}
                </button>
            </motion.div>
        </div>
    );
};

export default Step4Broker;
