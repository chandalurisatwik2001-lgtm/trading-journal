import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, TrendingUp, Trophy } from 'lucide-react';

interface Step1ExperienceProps {
    value: string;
    onChange: (value: string) => void;
    onNext: () => void;
}

const levels = [
    {
        id: 'beginner',
        title: 'Beginner',
        description: 'I am just starting my trading journey.',
        icon: Sprout,
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        hover: 'hover:border-green-500/50'
    },
    {
        id: 'intermediate',
        title: 'Intermediate',
        description: 'I have some experience and a strategy.',
        icon: TrendingUp,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        hover: 'hover:border-blue-500/50'
    },
    {
        id: 'pro',
        title: 'Professional',
        description: 'I trade for a living and need advanced tools.',
        icon: Trophy,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        hover: 'hover:border-purple-500/50'
    }
];

const Step1Experience: React.FC<Step1ExperienceProps> = ({ value, onChange, onNext }) => {
    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold"
                >
                    What's your experience level?
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400"
                >
                    We'll customize your dashboard based on your answer.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {levels.map((level, index) => (
                    <motion.button
                        key={level.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        onClick={() => {
                            onChange(level.id);
                            // Small delay to show selection before auto-advance (optional)
                            // setTimeout(onNext, 300); 
                        }}
                        className={`
              relative p-6 rounded-2xl border-2 text-left transition-all duration-300 group
              ${value === level.id
                                ? `${level.border} ${level.bg} ring-2 ring-offset-2 ring-offset-black ring-${level.color.split('-')[1]}-500`
                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                            }
              ${level.hover}
            `}
                    >
                        <div className={`w-12 h-12 rounded-xl ${level.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <level.icon className={`w-6 h-6 ${level.color}`} />
                        </div>
                        <h3 className="text-lg font-bold mb-2">{level.title}</h3>
                        <p className="text-sm text-gray-400">{level.description}</p>
                    </motion.button>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex justify-end pt-4"
            >
                <button
                    onClick={onNext}
                    disabled={!value}
                    className="px-8 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next Step
                </button>
            </motion.div>
        </div>
    );
};

export default Step1Experience;
