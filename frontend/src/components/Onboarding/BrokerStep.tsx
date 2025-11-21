import React, { useState } from 'react';

interface BrokerStepProps {
  onContinue: (broker: string) => void;
  initialValue?: string;
}

const brokers = [
  'TD Ameritrade',
  'Interactive Brokers',
  'E*TRADE',
  'Charles Schwab',
  'Fidelity',
  'Robinhood',
  'Webull',
  'TradeStation',
  'Tastytrade',
  'Coinbase',
  'Binance',
  'Other',
];

const BrokerStep: React.FC<BrokerStepProps> = ({ onContinue, initialValue }) => {
  const [selected, setSelected] = useState<string | undefined>(initialValue);

  const handleContinue = () => {
    if (selected) {
      onContinue(selected);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-center mb-6">
        <div className="w-32 h-32 bg-gradient-to-br from-pink-400 via-blue-400 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg">
          <div className="text-6xl">🏢</div>
        </div>
      </div>

      <h1 className="text-4xl font-bold text-center mb-4">
        Who is your primary broker?
      </h1>
      <p className="text-gray-600 text-center mb-12">Select only one</p>

      <div className="mb-8">
        <select
          value={selected || ''}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full p-4 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
        >
          <option value="" disabled>
            Select broker
          </option>
          {brokers.map((broker) => (
            <option key={broker} value={broker}>
              {broker}
            </option>
          ))}
        </select>
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

export default BrokerStep;
