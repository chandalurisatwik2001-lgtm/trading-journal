import React, { useState } from 'react';

interface TradingAssetsStepProps {
  onContinue: (assets: string[]) => void;
  initialValue?: string[];
}

const assets = [
  { id: 'stocks', title: 'Stocks', icon: '📈' },
  { id: 'options', title: 'Options', icon: '🅱️' },
  { id: 'forex', title: 'Forex', icon: '💱' },
  { id: 'crypto', title: 'Crypto', icon: '₿' },
  { id: 'futures', title: 'Futures', icon: '⏱️' },
  { id: 'other', title: 'Other', icon: '•••' },
];

const TradingAssetsStep: React.FC<TradingAssetsStepProps> = ({
  onContinue,
  initialValue,
}) => {
  const [selectedAssets, setSelectedAssets] = useState<string[]>(
    initialValue || []
  );

  const toggleAsset = (assetId: string) => {
    setSelectedAssets((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleContinue = () => {
    if (selectedAssets.length > 0) {
      onContinue(selectedAssets);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-4">
        What are you currently trading?
      </h1>
      <p className="text-gray-600 text-center mb-12">Select all that apply</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {assets.map((asset) => (
          <button
            key={asset.id}
            onClick={() => toggleAsset(asset.id)}
            className={`border-2 rounded-xl p-6 flex flex-col items-center gap-3 transition-all ${
              selectedAssets.includes(asset.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-4xl">{asset.icon}</div>
            <div className="font-semibold">{asset.title}</div>
            {selectedAssets.includes(asset.id) && (
              <div className="text-blue-600 text-xl">✓</div>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={selectedAssets.length === 0}
        className={`w-full py-4 rounded-lg font-semibold transition-all ${
          selectedAssets.length > 0
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Continue
      </button>
    </div>
  );
};

export default TradingAssetsStep;
