import React, { useState } from 'react';

interface TradingExperienceStepProps {
  onContinue: (experience: string) => void;
  initialValue?: string;
}

const experiences = [
  {
    id: 'newbie',
    title: 'Newbie',
    description: '< 1 year',
    emoji: '🧑‍🎓',
  },
  {
    id: 'climbing',
    title: 'Climbing Ranks',
    description: '1-3 years',
    emoji: '👩‍💼',
  },
  {
    id: 'ninja',
    title: 'Ninja Level',
    description: '3-5 years',
    emoji: '🥷',
  },
  {
    id: 'monk',
    title: 'Monk Mode',
    description: '5+ years',
    emoji: '🧘',
  },
];

const TradingExperienceStep: React.FC<TradingExperienceStepProps> = ({
  onContinue,
  initialValue,
}) => {
  const [selected, setSelected] = useState<string | undefined>(initialValue);

  const handleContinue = () => {
    if (selected) {
      onContinue(selected);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-12">
        How long have you been trading?
      </h1>

      <div className="space-y-4 mb-8">
        {experiences.map((exp) => (
          <button
            key={exp.id}
            onClick={() => setSelected(exp.id)}
            className={`w-full border-2 rounded-xl p-6 flex items-center gap-4 transition-all ${
              selected === exp.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-5xl">{exp.emoji}</div>
            <div className="text-left">
              <div className="text-xl font-bold">{exp.title}</div>
              <div className="text-gray-600">{exp.description}</div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!selected}
        className={`w-full py-4 rounded-lg font-semibold transition-all ${
          selected
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Continue
      </button>
    </div>
  );
};

export default TradingExperienceStep;
