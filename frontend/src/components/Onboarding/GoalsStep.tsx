import React, { useState } from 'react';

interface GoalsStepProps {
  onContinue: (goals: string[]) => void;
  initialValue?: string[];
}

const goals = [
  {
    id: 'journal',
    title: 'Journal activities',
    description: 'Track and document every trade',
    icon: '📝',
  },
  {
    id: 'analyze',
    title: 'Analyze performance',
    description: 'Dive deep into stats and metrics',
    icon: '📊',
  },
  {
    id: 'backtest',
    title: 'Backtest strategies',
    description: 'Test ideas with historical data',
    icon: '🕐',
  },
  {
    id: 'learn',
    title: 'Learn with Zella University',
    description: 'Access courses, bootcamps & resources',
    icon: '🎓',
  },
];

const GoalsStep: React.FC<GoalsStepProps> = ({ onContinue, initialValue }) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>(initialValue || []);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinue = () => {
    if (selectedGoals.length > 0) {
      onContinue(selectedGoals);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-4">
        What are you looking to do with Tradezella?
      </h1>
      <p className="text-gray-600 text-center mb-12">Select all that apply</p>

      <div className="space-y-4 mb-8">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className={`w-full border-2 rounded-xl p-6 flex items-center gap-4 transition-all ${
              selectedGoals.includes(goal.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
              {goal.icon}
            </div>
            <div className="text-left flex-1">
              <div className="text-lg font-bold">{goal.title}</div>
              <div className="text-gray-600 text-sm">{goal.description}</div>
            </div>
            {selectedGoals.includes(goal.id) && (
              <div className="text-blue-600 text-2xl">✓</div>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={selectedGoals.length === 0}
        className={`w-full py-4 rounded-lg font-semibold transition-all ${
          selectedGoals.length > 0
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Continue
      </button>
    </div>
  );
};

export default GoalsStep;
