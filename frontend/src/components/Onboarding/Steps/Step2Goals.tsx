import React from 'react';
import { motion } from 'framer-motion';
import { Target, Shield, Zap, Brain, DollarSign, Clock } from 'lucide-react';

interface Step2GoalsProps {
    value: string[];
    onChange: (value: string[]) => void;
    onNext: () => void;
    onBack: () => void;
}

const goals = [
    { id: 'consistency', label: 'Consistent Profits', icon: Target },
    { id: 'risk', label: 'Better Risk Management', icon: Shield },
    { id: 'discipline', label: 'Psychology & Discipline', icon: Brain },
    { id: 'strategy', label: 'Refining Strategy', icon: Zap },
    { id: 'income', label: 'Full-time Income', icon: DollarSign },
    { id: 'efficiency', label: 'Time Efficiency', icon: Clock },
];

const Step2Goals: React.FC<Step2GoalsProps> = ({ value, onChange, onNext, onBack }) => {
    const toggleGoal = (id: string) => {
        if (value.includes(id)) {
            onChange(value.filter(g => g !== id));
        } else {
            onChange([...value, id]);
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
                    What are your main goals?
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400"
                >
                    Select all that apply.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map((goal, index) => (
                    <motion.button
                        key={goal.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                        onClick={() => toggleGoal(goal.id)}
                        className={`
              flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
              ${value.includes(goal.id)
                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                            }
            `}
                    >
                        <div className={`p-2 rounded-lg ${value.includes(goal.id) ? 'bg-white/20' : 'bg-white/5'}`}>
                            <goal.icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium">{goal.label}</span>
                    </motion.button>
                ))}
            </div>

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
                    disabled={value.length === 0}
                    className="px-8 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next Step
                </button>
            </motion.div>
        </div>
    );
};

export default Step2Goals;
